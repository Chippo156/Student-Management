using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;
using System.Collections.Generic;

namespace StudentManagement.Services
{
    public class TuitionService(AppDbContext context) : ITuitionService
    {
        private const decimal DEFAULT_TUITION_PER_CREDIT = 500000; // 500k per credit
        private const decimal LATE_FEE_PERCENTAGE = 0.05m; // 5% phí trễ hạn

        public async Task<PagedResult<TuitionFeeResponse>> GetTuitionFeesWithPaginationAsync(TuitionSearchRequest request)
        {
            var query = context.TuitionFees
                .Include(tf => tf.Student)
                    .ThenInclude(s => s.User)
                .Include(tf => tf.Student)
                    .ThenInclude(s => s.Class)
                .Include(tf => tf.Semester)
                .Include(tf => tf.Details)
                    .ThenInclude(d => d.Section)
                .Include(tf => tf.Payments)
                    .ThenInclude(p => p.ProcessedBy)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(request.StudentMSSV))
            {
                query = query.Where(tf => tf.Student.MSSV.Contains(request.StudentMSSV.Trim()));
            }

            if (request.SemesterId.HasValue)
            {
                query = query.Where(tf => tf.SemesterId == request.SemesterId.Value);
            }

            if (request.Status.HasValue)
            {
                query = query.Where(tf => tf.Status == request.Status.Value);
            }

            if (request.IsOverdue.HasValue)
            {
                if (request.IsOverdue.Value)
                {
                    query = query.Where(tf => tf.DueDate < DateTime.Now && tf.Status != TuitionStatus.FullyPaid);
                }
                else
                {
                    query = query.Where(tf => tf.DueDate >= DateTime.Now || tf.Status == TuitionStatus.FullyPaid);
                }
            }

            if (request.FromDate.HasValue)
            {
                query = query.Where(tf => tf.CreatedAt >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                query = query.Where(tf => tf.CreatedAt <= request.ToDate.Value);
            }

            var totalCount = await query.CountAsync();

            var tuitionFees = await query
                .OrderByDescending(tf => tf.CreatedAt)
                .ThenBy(tf => tf.Student.MSSV)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var responses = tuitionFees.Select(MapToTuitionFeeResponse).ToList();

            return new PagedResult<TuitionFeeResponse>
            {
                Items = responses,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }

        public async Task<TuitionFeeResponse?> GetTuitionFeeByIdAsync(int tuitionFeeId)
        {
            var tuitionFee = await context.TuitionFees
                .Include(tf => tf.Student)
                    .ThenInclude(s => s.User)
                .Include(tf => tf.Student)
                    .ThenInclude(s => s.Class)
                .Include(tf => tf.Semester)
                .Include(tf => tf.Details)
                    .ThenInclude(d => d.Section)
                .Include(tf => tf.Payments)
                    .ThenInclude(p => p.ProcessedBy)
                .FirstOrDefaultAsync(tf => tf.TuitionFeeId == tuitionFeeId);

            return tuitionFee != null ? MapToTuitionFeeResponse(tuitionFee) : null;
        }

        public async Task<StudentTuitionSummaryResponse?> GetStudentTuitionSummaryAsync(string mssv)
        {
            var student = await context.Students
                .Include(s => s.User)
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                .FirstOrDefaultAsync(s => s.MSSV == mssv);

            if (student == null) return null;

            var tuitionFees = await context.TuitionFees
                .Include(tf => tf.Semester)
                .Where(tf => tf.StudentId == student.Id)
                .ToListAsync();

            var semesterTuitions = tuitionFees.Select(tf => new SemesterTuitionInfo
            {
                SemesterId = tf.SemesterId,
                SemesterName = $"{tf.Semester.Year} - {tf.Semester.Term}",
                TotalAmount = tf.TotalAmount + (tf.LateFee ?? 0),
                PaidAmount = tf.PaidAmount,
                RemainingAmount = tf.RemainingAmount,
                Status = tf.Status,
                DueDate = tf.DueDate,
                IsOverdue = tf.DueDate < DateTime.Now && tf.Status != TuitionStatus.FullyPaid
            }).OrderByDescending(st => st.SemesterName).ToList();

            return new StudentTuitionSummaryResponse
            {
                StudentId = student.Id,
                MSSV = student.MSSV,
                StudentName = student.User.FullName,
                ClassName = student.Class.ClassName,
                ProgramName = student.Class.Program.ProgramName,
                TotalTuitionAllSemesters = tuitionFees.Sum(tf => tf.TotalAmount + (tf.LateFee ?? 0)),
                TotalPaidAllSemesters = tuitionFees.Sum(tf => tf.PaidAmount),
                TotalRemainingAllSemesters = tuitionFees.Sum(tf => tf.RemainingAmount),
                TotalSemestersWithDebt = tuitionFees.Count(tf => tf.RemainingAmount > 0),
                TotalOverdueSemesters = tuitionFees.Count(tf => tf.DueDate < DateTime.Now && tf.Status != TuitionStatus.FullyPaid),
                SemesterTuitions = semesterTuitions
            };
        }

        public async Task<StudentTuitionDebtResponse> GetStudentTuitionDebtBySemesterAsync(string mssv, int? semesterId = null)
        {
            // Lấy thông tin sinh viên
            var student = await context.Students
                .Include(s => s.User)
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                .FirstOrDefaultAsync(s => s.MSSV == mssv);

            if (student == null)
            {
                throw new Exception($"Student with MSSV {mssv} not found");
            }

            // Query tuition fees
            var tuitionQuery = context.TuitionFees
                .Include(tf => tf.Semester)
                .Include(tf => tf.Details)
                    .ThenInclude(d => d.Section)
                        .ThenInclude(s => s.CurriculumCourse)
                            .ThenInclude(cc => cc.Course)
                .Include(tf => tf.Payments)
                    .ThenInclude(p => p.ProcessedBy)
                .Where(tf => tf.StudentId == student.Id);

            // Filter by semester if specified
            if (semesterId.HasValue && semesterId.Value > 0)
            {
                tuitionQuery = tuitionQuery.Where(tf => tf.SemesterId == semesterId.Value);
            }

            var tuitionFees = await tuitionQuery
                .OrderByDescending(tf => tf.Semester.Year)
                .ThenByDescending(tf => tf.Semester.Term)
                .ToListAsync();

            // Tính tổng công nợ
            var totalDebt = tuitionFees.Sum(tf => tf.RemainingAmount);
            var totalLateFee = tuitionFees.Sum(tf => tf.LateFee ?? 0);

            var semesterDebts = new List<SemesterTuitionDebt>();

            foreach (var tuition in tuitionFees)
            {
                var isOverdue = tuition.DueDate < DateTime.Now && tuition.Status != TuitionStatus.FullyPaid;
                var daysOverdue = isOverdue ? (DateTime.Now - tuition.DueDate).Days : 0;

                // Lấy thông tin enrollment cho các section trong tuition này
                var sectionIds = tuition.Details.Select(d => d.SectionId).ToList();
                var enrollments = await context.Enrollments
                    .Where(e => e.Student.Id == student.Id && sectionIds.Contains(e.Section.SectionId))
                    .Include(e => e.Section)
                    .ToDictionaryAsync(e => e.Section.SectionId, e => e);

                // Map course details với thông tin enrollment
                var courseDetails = tuition.Details.Select(detail =>
                {
                    Enrollment? enrollment = null;
                    if (detail.SectionId.HasValue)
                    {
                        enrollments.TryGetValue(detail.SectionId.Value, out enrollment);
                    }
                    return new TuitionFeeDetailDebt
                    {
                        DetailId = detail.DetailId,
                        SectionId = detail.Section.SectionId,
                        SectionCode = detail.Section?.SectionCode ?? $"LHP{detail.SectionId}",
                        CourseName = detail.ItemName,
                        Credits = detail.Credits,
                        UnitPrice = detail.UnitPrice,
                        Amount = detail.Amount,
                        Description = detail.Description ?? "",
                        EnrollmentStatus = enrollment?.enrollmentStatus.ToString() ?? "Unknown",
                        RegisteredAt = enrollment?.RegisteredAt ?? DateTime.MinValue
                    };
                }).ToList();

                // Map payment info
                var payments = tuition.Payments.Select(p => new PaymentInfo
                {
                    PaymentId = p.PaymentId,
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    PaymentMethod = GetPaymentMethodName(p.PaymentMethod),
                    PaymentStatus = p.PaymentStatus.ToString(),
                    TransactionId = p.TransactionId,
                    Note = p.Note
                }).OrderByDescending(p => p.PaymentDate).ToList();

                var semesterDebt = new SemesterTuitionDebt
                {
                    SemesterId = tuition.SemesterId,
                    SemesterName = $"{tuition.Semester.Year} - {tuition.Semester.Term}",
                    Year = tuition.Semester.Year,
                    Term = tuition.Semester.Term,
                    TuitionFeeId = tuition.TuitionFeeId,
                    TuitionFeeCode = $"HF{tuition.TuitionFeeId:D6}", // Mã học phí
                    TotalAmount = tuition.TotalAmount,
                    PaidAmount = tuition.PaidAmount,
                    RemainingAmount = tuition.RemainingAmount,
                    LateFee = tuition.LateFee ?? 0,
                    DueDate = tuition.DueDate,
                    PaidAt = tuition.PaidAt,
                    IsOverdue = isOverdue,
                    DaysOverdue = daysOverdue,
                    Status = tuition.Status,
                    StatusName = GetTuitionStatusName(tuition.Status),
                    CourseDetails = courseDetails,
                    Payments = payments
                };

                semesterDebts.Add(semesterDebt);
            }

            return new StudentTuitionDebtResponse
            {
                MSSV = student.MSSV,
                StudentName = student.User.FullName,
                ClassName = student.Class.ClassName,
                TotalDebt = totalDebt,
                TotalLateFee = totalLateFee,
                TotalSemesters = semesterDebts.Count,
                SemesterDebts = semesterDebts
            };
        }

        public async Task<TuitionFeeResponse> GenerateTuitionForStudentAsync(string mssv, int semesterId)
        {
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var student = await context.Students
                    .Include(s => s.User)
                    .Include(s => s.Class)
                        .ThenInclude(c => c.Program)
                    .FirstOrDefaultAsync(s => s.MSSV == mssv)
                    ?? throw new Exception($"Student with MSSV {mssv} not found");

                var semester = await context.Semesters.FindAsync(semesterId)
                    ?? throw new Exception($"Semester with ID {semesterId} not found");

                // Check if tuition fee already exists
                var existingTuition = await context.TuitionFees
                    .FirstOrDefaultAsync(tf => tf.StudentId == student.Id && tf.SemesterId == semesterId);

                if (existingTuition != null)
                {
                    throw new Exception("Tuition fee for this student and semester already exists");
                }

                // Get student enrollments for this semester
                var enrollments = await context.Enrollments
                    .Include(e => e.Section)
                        .ThenInclude(s => s.CurriculumCourse)
                            .ThenInclude(cc => cc.Course)
                    .Where(e => e.Student.Id == student.Id &&
                               e.Section.Semester.SemesterId == semesterId &&
                               e.enrollmentStatus == EnrollmentStatus.Enrolled)
                    .ToListAsync();

                if (!enrollments.Any())
                {
                    throw new Exception("No active enrollments found for this student in the specified semester");
                }

                // Calculate tuition fee
                var tuitionFee = new TuitionFee
                {
                    StudentId = student.Id,
                    SemesterId = semesterId,
                    DueDate = semester.EndDate.AddDays(30).ToDateTime(TimeOnly.MinValue), // 30 days after semester end
                    CreatedAt = DateTime.Now
                };

                decimal totalAmount = 0;
                var details = new List<TuitionFeeDetail>();

                foreach (var enrollment in enrollments)
                {
                    var course = enrollment.Section.CurriculumCourse.Course;
                    var credits = course.CreditsTheory + course.CreditsLab;
                    var amount = credits * DEFAULT_TUITION_PER_CREDIT;

                    var detail = new TuitionFeeDetail
                    {
                        TuitionFee = tuitionFee,
                        SectionId = enrollment.Section.SectionId,
                        ItemName = course.CourseName,
                        ItemType = "Tuition",
                        Credits = credits,
                        UnitPrice = DEFAULT_TUITION_PER_CREDIT,
                        Amount = amount,
                        Description = $"Tuition fee for {course.CourseCode} - {course.CourseName}"
                    };

                    details.Add(detail);
                    totalAmount += amount;
                }

                tuitionFee.TotalAmount = totalAmount;
                tuitionFee.RemainingAmount = totalAmount;
                tuitionFee.Status = TuitionStatus.Pending;

                context.TuitionFees.Add(tuitionFee);
                await context.SaveChangesAsync();

                // Add details after saving tuition fee to get ID
                tuitionFee.Details = details;
                context.TuitionFeeDetails.AddRange(details);
                await context.SaveChangesAsync();

                await transaction.CommitAsync();

                // Return the created tuition fee
                var createdTuition = await GetTuitionFeeByIdAsync(tuitionFee.TuitionFeeId);
                return createdTuition!;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<TuitionPaymentResponse> ProcessPaymentAsync(ProcessPaymentRequest request, int processedByUserId)
        {
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var tuitionFee = await context.TuitionFees
                    .Include(tf => tf.Student)
                        .ThenInclude(s => s.User)
                    .FirstOrDefaultAsync(tf => tf.TuitionFeeId == request.TuitionFeeId)
                    ?? throw new Exception("Tuition fee not found");

                if (request.Amount > tuitionFee.RemainingAmount)
                {
                    throw new Exception("Payment amount exceeds remaining balance");
                }

                var payment = new TuitionPayment
                {
                    TuitionFeeId = request.TuitionFeeId,
                    Amount = request.Amount,
                    PaymentDate = DateTime.Now,
                    PaymentMethod = request.PaymentMethod,
                    PaymentStatus = PaymentStatus.Completed,
                    TransactionId = request.TransactionId,
                    PaymentReference = request.PaymentReference,
                    Note = request.Note,
                    ProcessedByUserId = processedByUserId,
                    CreatedAt = DateTime.Now
                };

                context.TuitionPayments.Add(payment);

                // Update tuition fee
                tuitionFee.PaidAmount += request.Amount;
                tuitionFee.RemainingAmount -= request.Amount;

                if (tuitionFee.RemainingAmount <= 0)
                {
                    tuitionFee.Status = TuitionStatus.FullyPaid;
                    tuitionFee.PaidAt = DateTime.Now;
                    tuitionFee.RemainingAmount = 0;
                }
                else if (tuitionFee.PaidAmount > 0)
                {
                    tuitionFee.Status = TuitionStatus.PartialPaid;
                }

                context.TuitionFees.Update(tuitionFee);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Return payment response
                var processedBy = await context.Users.FindAsync(processedByUserId);
                return new TuitionPaymentResponse
                {
                    PaymentId = payment.PaymentId,
                    Amount = payment.Amount,
                    PaymentDate = payment.PaymentDate,
                    PaymentMethod = payment.PaymentMethod,
                    PaymentMethodName = GetPaymentMethodName(payment.PaymentMethod),
                    PaymentStatus = payment.PaymentStatus,
                    TransactionId = payment.TransactionId ?? "",
                    PaymentReference = payment.PaymentReference ?? "",
                    Note = payment.Note,
                    ProcessedByName = processedBy?.FullName ?? "",
                    CreatedAt = payment.CreatedAt
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> GenerateTuitionForSemesterAsync(GenerateTuitionRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var semester = await context.Semesters.FindAsync(request.SemesterId)
                    ?? throw new Exception("Semester not found");

                // Get students with enrollments in this semester
                var studentsQuery = context.Students
                    .Include(s => s.User)
                    .Include(s => s.Class)
                        .ThenInclude(c => c.Program)
                            .ThenInclude(p => p.Department)
                    .Where(s => context.Enrollments.Any(e => 
                        e.Student.Id == s.Id && 
                        e.Section.Semester.SemesterId == request.SemesterId &&
                        e.enrollmentStatus == EnrollmentStatus.Enrolled));

                if (request.DepartmentId.HasValue)
                {
                    studentsQuery = studentsQuery.Where(s => s.Class.Program.Department.DepartmentId == request.DepartmentId.Value);
                }

                var students = await studentsQuery.ToListAsync();
                var successCount = 0;

                foreach (var student in students)
                {
                    try
                    {
                        // Check if tuition already exists
                        var existingTuition = await context.TuitionFees
                            .AnyAsync(tf => tf.StudentId == student.Id && tf.SemesterId == request.SemesterId);

                        if (!existingTuition || request.IncludeExistingStudents)
                        {
                            if (existingTuition && request.IncludeExistingStudents)
                            {
                                // Remove existing tuition and recreate
                                var existing = await context.TuitionFees
                                    .Include(tf => tf.Details)
                                    .Include(tf => tf.Payments)
                                    .FirstAsync(tf => tf.StudentId == student.Id && tf.SemesterId == request.SemesterId);

                                if (existing.PaidAmount > 0)
                                {
                                    // Skip if already has payments
                                    continue;
                                }

                                context.TuitionFeeDetails.RemoveRange(existing.Details);
                                context.TuitionFees.Remove(existing);
                                await context.SaveChangesAsync();
                            }

                            await GenerateTuitionForStudentAsync(student.MSSV, request.SemesterId);
                            successCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        // Log error but continue with other students
                        Console.WriteLine($"Error generating tuition for student {student.MSSV}: {ex.Message}");
                    }
                }

                await transaction.CommitAsync();
                return successCount > 0;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<TuitionFeeResponse>> GetOverdueTuitionFeesAsync()
        {
            var overdueTuitions = await context.TuitionFees
                .Include(tf => tf.Student)
                    .ThenInclude(s => s.User)
                .Include(tf => tf.Student)
                    .ThenInclude(s => s.Class)
                .Include(tf => tf.Semester)
                .Include(tf => tf.Details)
                .Include(tf => tf.Payments)
                .Where(tf => tf.DueDate < DateTime.Now && 
                           tf.Status != TuitionStatus.FullyPaid &&
                           tf.Status != TuitionStatus.Cancelled)
                .ToListAsync();

            return overdueTuitions.Select(MapToTuitionFeeResponse).ToList();
        }

        public async Task UpdateOverdueTuitionFeesAsync()
        {
            var overdueTuitions = await context.TuitionFees
                .Where(tf => tf.DueDate < DateTime.Now && 
                           tf.Status != TuitionStatus.FullyPaid &&
                           tf.Status != TuitionStatus.Cancelled &&
                           tf.Status != TuitionStatus.Overdue)
                .ToListAsync();

            foreach (var tuition in overdueTuitions)
            {
                tuition.Status = TuitionStatus.Overdue;
                tuition.IsLate = true;

                // Calculate late fee if not already calculated
                if (tuition.LateFee == null || tuition.LateFee == 0)
                {
                    var lateFee = Math.Round(tuition.TotalAmount * LATE_FEE_PERCENTAGE, 0);
                    tuition.LateFee = lateFee;
                    tuition.RemainingAmount += lateFee;
                }
            }

            if (overdueTuitions.Any())
            {
                context.TuitionFees.UpdateRange(overdueTuitions);
                await context.SaveChangesAsync();
            }
        }

        private TuitionFeeResponse MapToTuitionFeeResponse(TuitionFee tuitionFee)
        {
            return new TuitionFeeResponse
            {
                TuitionFeeId = tuitionFee.TuitionFeeId,
                StudentId = tuitionFee.StudentId,
                MSSV = tuitionFee.Student.MSSV,
                StudentName = tuitionFee.Student.User.FullName,
                ClassName = tuitionFee.Student.Class.ClassName,
                SemesterId = tuitionFee.SemesterId,
                SemesterName = $"{tuitionFee.Semester.Year} - {tuitionFee.Semester.Term}",
                TotalAmount = tuitionFee.TotalAmount + (tuitionFee.LateFee ?? 0),
                PaidAmount = tuitionFee.PaidAmount,
                RemainingAmount = tuitionFee.RemainingAmount,
                Status = tuitionFee.Status,
                StatusName = GetTuitionStatusName(tuitionFee.Status),
                DueDate = tuitionFee.DueDate,
                CreatedAt = tuitionFee.CreatedAt,
                PaidAt = tuitionFee.PaidAt,
                IsLate = tuitionFee.IsLate,
                LateFee = tuitionFee.LateFee ?? 0,
                TotalCredits = tuitionFee.Details.Sum(d => d.Credits),
                PaymentCount = tuitionFee.Payments.Count,
                Details = tuitionFee.Details.Select(d => new TuitionFeeDetailResponse
                {
                    DetailId = d.DetailId,
                    SectionId = d.SectionId,
                    SectionCode = d.Section?.SectionCode ?? "",
                    ItemName = d.ItemName,
                    ItemType = d.ItemType,
                    Credits = d.Credits,
                    UnitPrice = d.UnitPrice,
                    Amount = d.Amount,
                    Description = d.Description
                }).ToList(),
                Payments = tuitionFee.Payments.Select(p => new TuitionPaymentResponse
                {
                    PaymentId = p.PaymentId,
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    PaymentMethod = p.PaymentMethod,
                    PaymentMethodName = GetPaymentMethodName(p.PaymentMethod),
                    PaymentStatus = p.PaymentStatus,
                    TransactionId = p.TransactionId ?? "",
                    PaymentReference = p.PaymentReference ?? "",
                    Note = p.Note,
                    ProcessedByName = p.ProcessedBy?.FullName ?? "",
                    CreatedAt = p.CreatedAt
                }).OrderByDescending(p => p.PaymentDate).ToList()
            };
        }

        private static string GetTuitionStatusName(TuitionStatus status)
        {
            return status switch
            {
                TuitionStatus.Pending => "Chưa đóng",
                TuitionStatus.PartialPaid => "Đóng một phần",
                TuitionStatus.FullyPaid => "Đã đóng đủ",
                TuitionStatus.Overdue => "Quá hạn",
                TuitionStatus.Waived => "Miễn giảm",
                TuitionStatus.Cancelled => "Hủy bỏ",
                _ => "Không xác định"
            };
        }

        private static string GetPaymentMethodName(PaymentMethod method)
        {
            return method switch
            {
                PaymentMethod.Cash => "Tiền mặt",
                PaymentMethod.BankTransfer => "Chuyển khoản",
                PaymentMethod.CreditCard => "Thẻ tín dụng",
                PaymentMethod.OnlinePayment => "Thanh toán online",
                PaymentMethod.ScholarShip => "Học bổng",
                _ => "Khác"
            };
        }
    }
}