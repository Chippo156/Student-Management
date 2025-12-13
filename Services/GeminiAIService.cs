using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Services.Interface;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace StudentManagement.Services
{
    public class GeminiAIService : IGeminiAIService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _baseUrl;
        private readonly AppDbContext _context;

        public GeminiAIService(HttpClient httpClient, IConfiguration configuration, AppDbContext context)
        {
            _httpClient = httpClient;
            _apiKey = configuration["GeminiAI:ApiKey"] ?? throw new ArgumentNullException("GeminiAI:ApiKey");
            _baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

            _context = context;
        }

        public async Task<string> GenerateResponseAsync(string prompt, string conversationContext = "")
        {
            try
            {
                var fullPrompt = BuildEducationalPrompt(prompt, conversationContext);

                var requestBody = new
                {
                    contents = new[]
                    {
                new
                {
                    parts = new[]
                    {
                        new { text = fullPrompt }
                    }
                }
            },
                    generationConfig = new
                    {
                        temperature = 0.4,         // Tăng nhẹ để linh hoạt hơn
                        topK = 30,                 // Tăng nhẹ
                        topP = 0.85,               // Tăng nhẹ  
                        maxOutputTokens = 1000,    // **TĂNG** từ 500 lên 1000
                        stopSequences = new[] { "***END***" } // **SỬA** - chỉ dừng khi thấy marker đặc biệt
                    },
                    safetySettings = new[]
                    {
                new { category = "HARM_CATEGORY_HARASSMENT", threshold = "BLOCK_ONLY_HIGH" },
                new { category = "HARM_CATEGORY_HATE_SPEECH", threshold = "BLOCK_ONLY_HIGH" },
                new { category = "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold = "BLOCK_ONLY_HIGH" },
                new { category = "HARM_CATEGORY_DANGEROUS_CONTENT", threshold = "BLOCK_ONLY_HIGH" }
            }
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync($"{_baseUrl}?key={_apiKey}", content);

                if (!response.IsSuccessStatusCode)
                {
                    var statusCode = response.StatusCode;
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[Lỗi API Gemini] Status: {statusCode}, Content: {errorContent}");
                    return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.";
                }

                var responseJson = await response.Content.ReadAsStringAsync();
                var responseData = JsonSerializer.Deserialize<JsonElement>(responseJson);

                if (responseData.TryGetProperty("candidates", out var candidates) &&
                    candidates.GetArrayLength() > 0)
                {
                    var firstCandidate = candidates[0];

                    // **THÊM: Kiểm tra lý do dừng**
                    if (firstCandidate.TryGetProperty("finishReason", out var finishReason))
                    {
                        var reason = finishReason.GetString();
                        Console.WriteLine($"[Gemini] Finish reason: {reason}");

                        // Nếu bị cắt do độ dài, thông báo rõ ràng
                        if (reason == "MAX_TOKENS" || reason == "LENGTH")
                        {
                            Console.WriteLine("[Gemini] Response was truncated due to length limits");
                        }
                    }

                    if (firstCandidate.TryGetProperty("content", out var content_prop) &&
                        content_prop.TryGetProperty("parts", out var parts) &&
                        parts.GetArrayLength() > 0)
                    {
                        var firstPart = parts[0];
                        if (firstPart.TryGetProperty("text", out var text))
                        {
                            var result = text.GetString() ?? "Không thể tạo phản hồi.";

                            // **THÊM: Post-process để đảm bảo câu trả lời đầy đủ**
                            result = EnsureCompleteResponse(result);

                            return result;
                        }
                    }
                }

                return "Không thể tạo phản hồi từ AI.";

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Gemini AI Error: {ex.Message}");
                return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.";
            }
        }

        // **MỚI: Method để đảm bảo response đầy đủ**
        private string EnsureCompleteResponse(string response)
        {
            // Kiểm tra nếu response bị cắt ngang
            var trimmedResponse = response.TrimEnd();

            // Nếu kết thúc bằng dấu hai chấm hoặc không có dấu chấm câu
            if (trimmedResponse.EndsWith(":") || trimmedResponse.EndsWith(",") ||
                (!trimmedResponse.EndsWith(".") && !trimmedResponse.EndsWith("!") &&
                 !trimmedResponse.EndsWith("?") && !trimmedResponse.EndsWith("😊") &&
                 !trimmedResponse.EndsWith("👍") && trimmedResponse.Length > 10))
            {
                // Thêm thông tin hướng dẫn cụ thể
                if (trimmedResponse.ToLower().Contains("đăng ký") && trimmedResponse.EndsWith(":"))
                {
                    return trimmedResponse + @"

1. **Vào mục 'Đăng ký học phần'** trên hệ thống
2. **Chọn học kỳ** muốn đăng ký
3. **Tìm kiếm môn học** theo mã hoặc tên
4. **Chọn lớp học phần** phù hợp với lịch học
5. **Xác nhận đăng ký** và thanh toán học phí

💡 **Lưu ý:** Kiểm tra thời gian đăng ký của khoa và điều kiện tiên quyết trước khi đăng ký!";
                }

                if (trimmedResponse.ToLower().Contains("truy cập") && trimmedResponse.EndsWith("truy cập"))
                {
                    return trimmedResponse + " **trang chủ hệ thống quản lý sinh viên** và đăng nhập bằng MSSV của bạn. Sau đó vào mục 'Đăng ký học phần' để thực hiện đăng ký môn học.";
                }

                // Trường hợp chung
                return trimmedResponse + " Bạn có thể tìm hiểu thêm trong hệ thống hoặc liên hệ phòng đào tạo để được hỗ trợ!";
            }

            return response;
        }

        public async Task<string> GenerateEducationalResponseAsync(string question, string mssv, string studentContext = "")
        {
            // **PHÂN TÍCH CÂU HỎI TRƯỚC KHI GỌI AI**
            var questionAnalysis = await AnalyzeQuestionAsync(question, mssv);

            // Nếu câu hỏi có thể trả lời trực tiếp từ data, trả lời ngay
            if (questionAnalysis.CanAnswerDirectly)
            {
                return questionAnalysis.DirectAnswer;
            }

            // Nếu cần thông tin sinh viên, lấy data
            var studentInfo = await ExtractAndFetchStudentInfoAsync(question, studentContext, mssv);
            var enhancedContext = await BuildStudentContextPromptAsync(studentContext, studentInfo, questionAnalysis);

            var educationalPrompt = $@"
🎓 EduBot – Trợ lý sinh viên thông minh

{enhancedContext}

📝 **YÊU CẦU QUAN TRỌNG:**
- Trả lời TRỰC TIẾP câu hỏi, không lặp lại yêu cầu
- Tối đa 5 câu, ngắn gọn, súc tích  
- Dựa vào DỮ LIỆU THỰC TẾ từ database
- Nếu không có data: nói rõ 'Không có thông tin' ❓ { question} 👉 **Trả lời ngay:**";

    return await GenerateResponseAsync(educationalPrompt); 
        }


        // **NEW METHOD: Extract MSSV and fetch student information**
        private async Task<StudentDatabaseInfo?> ExtractAndFetchStudentInfoAsync(string question, string studentContext, string mssv)
        {
            try
            {
                // Extract MSSV from question or context
                //string? mssv = ExtractMSSV(question) ?? ExtractMSSV(studentContext);
                
                if (string.IsNullOrEmpty(mssv))
                    return null;

                return await FetchStudentInfoFromDatabase(mssv);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching student info: {ex.Message}");
                return null;
            }
        }

        // **NEW METHOD: Fetch comprehensive student information from database**
        private async Task<StudentDatabaseInfo> FetchStudentInfoFromDatabase(string mssv)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                        .ThenInclude(p => p.Department)
                .FirstOrDefaultAsync(s => s.MSSV == mssv);

            if (student == null)
                return new StudentDatabaseInfo { MSSV = mssv, NotFound = true };

            // **MỚI: Xác định học kỳ hiện tại**
            var currentDate = DateTime.UtcNow;
            var currentSemester = await _context.Semesters
                .Where(s => s.StartDate <= DateOnly.FromDateTime(currentDate) &&
                           s.EndDate >= DateOnly.FromDateTime(currentDate))
                .OrderByDescending(s => s.Year)
                .ThenByDescending(s => s.Term)
                .FirstOrDefaultAsync();
            // Get GPA Snapshots (all semesters)
            var gpaSnapshots = await _context.GpaSnapshots
                .Include(g => g.Semester)
                .Where(g => g.Student.MSSV == mssv)
                .OrderBy(g => g.Semester.Year)
                .ThenBy(g => g.Semester.Term)
                .ToListAsync();

            // Get Final Results (all completed courses)
            var finalResults = await _context.FinalResults
                .Include(fr => fr.Section)
                    .ThenInclude(s => s.CurriculumCourse.Course)
                .Include(fr => fr.Section.Semester)
                .Where(fr => fr.Student.MSSV == mssv)
                .OrderByDescending(fr => fr.Section.Semester.Year)
                .ThenByDescending(fr => fr.Section.Semester.Term)
                .ToListAsync();

            // Get Current/Recent Enrollments
            var currentEnrollments = await _context.Enrollments
                .Include(e => e.Section)
                    .ThenInclude(s => s.CurriculumCourse.Course)
                .Include(e => e.Section.Semester)
                .Where(e => e.Student.MSSV == mssv)
                .OrderByDescending(e => e.Section.Semester.Year)
                .ThenByDescending(e => e.Section.Semester.Term)
                .Take(10) // Last 10 enrollments
                .ToListAsync();

            // Get Tuition Fee Information
            var tuitionFees = await _context.TuitionFees
                .Include(tf => tf.Semester)
                .Where(tf => tf.Student.MSSV == mssv)
                .OrderByDescending(tf => tf.Semester.Year)
                .ThenByDescending(tf => tf.Semester.Term)
                .Take(3) // Last 3 semesters
                .ToListAsync();

            var schedules = new List<Schedule>();
            if (currentSemester != null)
            {
                // Lấy các section mà sinh viên đang học trong học kỳ hiện tại
                var currentSemesterSections = await _context.Enrollments
                    .Where(e => e.Student.MSSV == mssv &&
                               e.Section.Semester.SemesterId == currentSemester.SemesterId &&
                               e.enrollmentStatus == EnrollmentStatus.Enrolled)
                    .Select(e => e.Section.SectionId)
                    .ToListAsync();

                if (currentSemesterSections.Any())
                {
                    // Lấy lịch học chính (lý thuyết) của học kỳ hiện tại
                    var mainSchedules = await _context.Schedules
                        .Include(s => s.Section)
                            .ThenInclude(sec => sec.CurriculumCourse.Course)
                        .Include(s => s.ScheduleType)
                        .Where(s => currentSemesterSections.Contains(s.Section.SectionId) &&
                                   !s.PracticeGroupId.HasValue && // Lịch lý thuyết
                                   s.ScheduleType.ScheduleTypeId != 3) // Không phải lịch thi
                        .ToListAsync();

                    // Lấy lịch thực hành của sinh viên trong học kỳ hiện tại
                    var studentPracticeGroups = await _context.PracticeGroupEnrollments
                        .Include(pge => pge.PracticeGroup)
                            .ThenInclude(pg => pg.Section)
                        .Where(pge => pge.StudentId == student.Id &&
                                     pge.IsActive &&
                                     currentSemesterSections.Contains(pge.PracticeGroup.SectionId))
                        .Select(pge => pge.PracticeGroupId)
                        .ToListAsync();

                    var practiceSchedules = await _context.Schedules
                        .Include(s => s.Section)
                            .ThenInclude(sec => sec.CurriculumCourse.Course)
                        .Include(s => s.ScheduleType)
                        .Include(s => s.PracticeGroup)
                        .Where(s => s.PracticeGroupId.HasValue &&
                                   studentPracticeGroups.Contains(s.PracticeGroupId.Value) &&
                                   s.ScheduleType.ScheduleTypeId != 3) // Không phải lịch thi
                        .ToListAsync();

                    // Lấy lịch thi trong học kỳ hiện tại
                    var examSchedules = await _context.Schedules
                        .Include(s => s.Section)
                            .ThenInclude(sec => sec.CurriculumCourse.Course)
                        .Include(s => s.ScheduleType)
                        .Where(s => currentSemesterSections.Contains(s.Section.SectionId) &&
                                   s.ScheduleType.ScheduleTypeId == 3 && // Lịch thi
                                   s.Date.HasValue) // Có ngày cụ thể
                        .ToListAsync();

                    // Kết hợp tất cả lịch của học kỳ hiện tại
                    schedules = mainSchedules.Concat(practiceSchedules).Concat(examSchedules).ToList();
                }
            }

            // Calculate statistics
            var totalCreditsCompleted = finalResults.Where(fr => fr.GradePoint >= 1.0)
                .Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab);

            var totalCreditsFailed = finalResults.Where(fr => fr.GradePoint < 1.0)
                .Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab);

            var currentGPA = gpaSnapshots.LastOrDefault()?.Gpa ?? 0.0;
            var cumulativeGPA = gpaSnapshots.Any() ? gpaSnapshots.Average(g => g.Gpa) : 0.0;

            return new StudentDatabaseInfo
            {
                MSSV = mssv,
                StudentName = student.User.FullName,
                ClassName = student.Class.ClassName,
                ProgramName = student.Class.Program.ProgramName,
                DepartmentName = student.Class.Program.Department.DepartmentName,
                YearOfAdmission = student.YearOfAdmission,
                StudentStatus = student.StudentStatus.ToString(),
                
                // Academic Performance
                CurrentGPA = Math.Round(currentGPA, 2),
                CumulativeGPA = Math.Round(cumulativeGPA, 2),
                TotalCreditsCompleted = totalCreditsCompleted,
                TotalCreditsFailed = totalCreditsFailed,
                RequiredCredits = student.Class.Program.CreditsRequired,
                
                // Recent Performance
                GpaSnapshots = gpaSnapshots.Select(g => new GpaInfo
                {
                    Semester = $"{g.Semester.Year} - {g.Semester.Term}",
                    GPA = Math.Round(g.Gpa, 2),
                    GPA10Scale = Math.Round(g.Gpa * 2.5, 2)
                }).ToList(),

                FinalResults = finalResults.Take(10).Select(fr => new CourseResultInfo
                {
                    CourseCode = fr.Section.CurriculumCourse.Course.CourseCode,
                    CourseName = fr.Section.CurriculumCourse.Course.CourseName,
                    Credits = fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab,
                    FinalScore = Math.Round(fr.FinalScore, 2),
                    GradeLetter = fr.GradeLetter,
                    GradePoint = Math.Round(fr.GradePoint, 2),
                    Semester = $"{fr.Section.Semester.Year} - {fr.Section.Semester.Term}"
                }).ToList(),

                CurrentEnrollments = currentEnrollments.Select(e => new EnrollmentInfo
                {
                    CourseCode = e.Section.CurriculumCourse.Course.CourseCode,
                    CourseName = e.Section.CurriculumCourse.Course.CourseName,
                    Credits = e.Section.CurriculumCourse.Course.CreditsTheory + e.Section.CurriculumCourse.Course.CreditsLab,
                    Semester = $"{e.Section.Semester.Year} - {e.Section.Semester.Term}",
                    Status = e.enrollmentStatus.ToString()
                }).ToList(),

                TuitionInfo = tuitionFees.Select(tf => new TuitionInfo
                {
                    Semester = $"{tf.Semester.Year} - {tf.Semester.Term}",
                    TotalAmount = tf.TotalAmount,
                    PaidAmount = tf.PaidAmount,
                    RemainingAmount = tf.RemainingAmount,
                    Status = tf.Status.ToString()
                }).ToList(),
                
                ScheduleInfos = schedules.Select(s => new ScheduleInfo
                {
                    CourseCode = s.Section.CurriculumCourse.Course.CourseCode,
                    CourseName = s.Section.CurriculumCourse.Course.CourseName,
                    DayOfWeek = s.DayOfWeek.ToString(),
                    StartTime = s.StartTime.ToString(@"hh\:mm"),
                    EndTime = s.EndTime.ToString(@"hh\:mm")
                }).ToList()
            };
        }

        private async Task<string> BuildStudentContextPromptAsync(string studentContext, StudentDatabaseInfo? studentInfo)
        {
            var baseContext = $@"
👨‍🎓 **THÔNG TIN SINH VIÊN ĐANG HỎI:**
{(string.IsNullOrEmpty(studentContext) ? "Sinh viên chưa cung cấp thông tin cụ thể" : studentContext)}";

            if (studentInfo != null && !studentInfo.NotFound)
            {
                baseContext += $@"
📋 **THÔNG TIN CHI TIẾT SINH VIÊN (TỪ DATABASE):**

**Thông tin cơ bản:**
• MSSV: {studentInfo.MSSV}
• Họ tên: {studentInfo.StudentName}
• Lớp: {studentInfo.ClassName}
• Chương trình: {studentInfo.ProgramName} - {studentInfo.DepartmentName}
• Năm nhập học: {studentInfo.YearOfAdmission}
• Trạng thái: {studentInfo.StudentStatus}

**Kết quả học tập:**
• Lịch học hiện tại: {studentInfo.ScheduleInfos})
• GPA hiện tại: {studentInfo.CurrentGPA}/4.0 (≈ {Math.Round(studentInfo.CurrentGPA * 2.5, 2)}/10)
• GPA tích lũy: {studentInfo.CumulativeGPA}/4.0 (≈ {Math.Round(studentInfo.CumulativeGPA * 2.5, 2)}/10)
• Tín chỉ đã tích lũy: {studentInfo.TotalCreditsCompleted}/{studentInfo.RequiredCredits}
• Tín chỉ nợ: {studentInfo.TotalCreditsFailed}
• Tiến độ hoàn thành: {Math.Round((double)studentInfo.TotalCreditsCompleted / studentInfo.RequiredCredits * 100, 1)}%";

                // Add GPA history
                if (studentInfo.GpaSnapshots.Any())
                {
                    baseContext += "\n**Lịch sử GPA theo học kỳ:**";
                    foreach (var gpa in studentInfo.GpaSnapshots.TakeLast(5))
                    {
                        baseContext += $"• {gpa.Semester}: {gpa.GPA}/4.0 ({gpa.GPA10Scale}/10)";
                    }
                }

                // Add recent course results
                if (studentInfo.FinalResults.Any())
                {
                    baseContext += "\n**Kết quả môn học gần đây:**";
                    foreach (var result in studentInfo.FinalResults.Take(5))
                    {
                        baseContext += $"• {result.CourseCode} - {result.CourseName}: {result.FinalScore}/10 ({result.GradeLetter}) - {result.Semester}";
                    }
                }

                // Add current enrollments
                if (studentInfo.CurrentEnrollments.Any())
                {
                    baseContext += "\n**Môn học đang học:**";
                    foreach (var enrollment in studentInfo.CurrentEnrollments.Take(5))
                    {
                        baseContext += $"• {enrollment.CourseCode} - {enrollment.CourseName} ({enrollment.Credits} TC) - {enrollment.Semester}";
                    }
                }

                // Add schedule info
                if (studentInfo.ScheduleInfos.Any())
                {
                    baseContext += "\n**Lịch học hiện tại:**";
                    foreach (var schedule in studentInfo.ScheduleInfos.Take(5))
                    {
                        baseContext += $"• {schedule.CourseCode} - {schedule.CourseName}: {schedule.DayOfWeek}, {schedule.StartTime} - {schedule.EndTime}";
                    }
                }

                // Add tuition info
                if (studentInfo.TuitionInfo.Any())
                {
                    baseContext += "\n**Thông tin học phí gần đây:**";
                    foreach (var tuition in studentInfo.TuitionInfo.Take(2))
                    {
                        baseContext += $"• {tuition.Semester}: {tuition.TotalAmount:N0} VND (Đã đóng: {tuition.PaidAmount:N0} VND, Còn lại: {tuition.RemainingAmount:N0} VND)";
                    }
                }
            }
            else if (studentInfo?.NotFound == true)
            {
                baseContext += $"\n⚠️ **THÔNG BÁO:** Không tìm thấy thông tin sinh viên với MSSV {studentInfo.MSSV} trong hệ thống.";
            }

            baseContext += BuildSystemKnowledgeBase();
            return baseContext;
        }

        private string BuildStudentContextPrompt(string studentContext)
        {
            return BuildStudentContextPromptAsync(studentContext, null).Result;
        }

        private string BuildSystemKnowledgeBase()
        {
            return $@"
🏫 **KIẾN THỨC VỀ HỆ THỐNG QUẢN LÝ SINH VIÊN:**

**Các chức năng chính:**
• Quản lý thông tin cá nhân và học tập
• Đăng ký học phần theo từng học kỳ  
• Xem thời khóa biểu và lịch thi
• Theo dõi điểm số và kết quả học tập
• Thanh toán học phí trực tuyến
• Chat với giảng viên và cán bộ học vụ
• Nhận thông báo từ nhà trường

**Quy trình đăng ký học:**
1. Kiểm tra thời gian đăng ký của khoa
2. Xem danh sách học phần mở
3. Chọn lớp học phần phù hợp (kiểm tra lịch học)
4. Đăng ký nhóm thực hành (nếu có)
5. Xác nhận đăng ký và thanh toán học phí

**Về điểm số và đánh giá:**
• Thang điểm 4.0: A(4.0), B+(3.5), B(3.0), C+(2.5), C(2.0), D+(1.5), D(1.0), F(0.0)
• Điểm đạt: Từ D(1.0) trở lên
• GPA học kỳ và GPA tích lũy
• Xếp loại: Xuất sắc(≥3.6), Giỏi(3.2-3.59), Khá(2.5-3.19), Trung bình(2.0-2.49)

**Về học phí:**
• 500,000 VND/tín chỉ
• Tính theo số tín chỉ đăng ký thực tế
• Có thể thanh toán từng phần
• Hạn thanh toán thường là cuối học kỳ

**Hỗ trợ kỹ thuật:**
• Đăng nhập: Dùng MSSV làm tài khoản
• Quên mật khẩu: Dùng chức năng khôi phục qua MSSV
• Lỗi hệ thống: Liên hệ phòng Đào tạo hoặc IT
• Cập nhật thông tin: Trong mục Hồ sơ cá nhân";
        }

        private string BuildEducationalPrompt(string userMessage, string conversationContext)
        {
            return $@"
Bạn là EduBot - trợ lý AI thông minh của Student Management System tại Trường Đại học.

🎓 **VAI TRÒ VÀ NĂNG LỰC CỦA BẠN:**
- Hỗ trợ sinh viên về mọi vấn đề học tập, nghiên cứu và đời sống sinh viên
- Truy vấn và phân tích dữ liệu thực tế từ hệ thống
- Đưa ra lời khuyên dựa trên kết quả học tập cụ thể
- Giải đáp thắc mắc về quy chế, quy định của nhà trường
- Tư vấn về định hướng nghề nghiệp và phát triển cá nhân
- Hỗ trợ tâm lý, động viên tinh thần học tập
- Hướng dẫn sử dụng các chức năng trong hệ thống quản lý sinh viên

💡 **CÁCH TRẢ LỜI CỦA BẠN:**
- Sử dụng thông tin thực tế từ database khi có
- Phân tích xu hướng học tập và đưa ra lời khuyên
- Cung cấp thông tin chính xác, hữu ích và cụ thể
- Khuyến khích tinh thần học tập và phát triển bản thân
- Hướng dẫn cách sử dụng các tính năng trong hệ thống
- Đưa ra lời khuyên thiết thực cho sinh viên
- Sử dụng emoji phù hợp để tạo không khí thân thiện

{(string.IsNullOrEmpty(conversationContext) ? "" : $"📋 **Ngữ cảnh cuộc trò chuyện trước:**{conversationContext}\n")}

❓ **Câu hỏi của sinh viên:** {userMessage}

💬 **Hãy trả lời một cách thân thiện, hữu ích và chi tiết dựa trên dữ liệu thực tế:**";
        }

        // **NEW: Data models for student information**
        private class StudentDatabaseInfo
        {
            public string MSSV { get; set; } = "";
            public bool NotFound { get; set; }
            public string StudentName { get; set; } = "";
            public string ClassName { get; set; } = "";
            public string ProgramName { get; set; } = "";
            public string DepartmentName { get; set; } = "";
            public int YearOfAdmission { get; set; }
            public string StudentStatus { get; set; } = "";
            
            public double CurrentGPA { get; set; }
            public double CumulativeGPA { get; set; }
            public int TotalCreditsCompleted { get; set; }
            public int TotalCreditsFailed { get; set; }
            public int RequiredCredits { get; set; }
            
            public List<GpaInfo> GpaSnapshots { get; set; } = new();
            public List<CourseResultInfo> FinalResults { get; set; } = new();
            public List<EnrollmentInfo> CurrentEnrollments { get; set; } = new();
            public List<TuitionInfo> TuitionInfo { get; set; } = new();
            public List<ScheduleInfo>  ScheduleInfos { get; set; } = new();
        }

        private class GpaInfo
        {
            public string Semester { get; set; } = "";
            public double GPA { get; set; }
            public double GPA10Scale { get; set; }
        }

        private class ScheduleInfo
        {
            public string CourseCode { get; set; } = "";
            public string CourseName { get; set; } = "";
            public string DayOfWeek { get; set; } = "";
            public string StartTime { get; set; } = "";
            public string EndTime { get; set; } = "";
        }

        private class CourseResultInfo
        {
            public string CourseCode { get; set; } = "";
            public string CourseName { get; set; } = "";
            public int Credits { get; set; }
            public double FinalScore { get; set; }
            public string GradeLetter { get; set; } = "";
            public double GradePoint { get; set; }
            public string Semester { get; set; } = "";
        }

        private class EnrollmentInfo
        {
            public string CourseCode { get; set; } = "";
            public string CourseName { get; set; } = "";
            public int Credits { get; set; }
            public string Semester { get; set; } = "";
            public string Status { get; set; } = "";
        }

        private class TuitionInfo
        {
            public string Semester { get; set; } = "";
            public decimal TotalAmount { get; set; }
            public decimal PaidAmount { get; set; }
            public decimal RemainingAmount { get; set; }
            public string Status { get; set; } = "";
        }
        // **MỚI: Phân tích câu hỏi để trả lời trực tiếp**
        private async Task<QuestionAnalysis> AnalyzeQuestionAsync(string question, string mssv)
        {
            var lowerQuestion = question.ToLower().Trim();
            var analysis = new QuestionAnalysis();

            try
            {
                // **1. Câu hỏi về lịch học hôm nay**
                if (IsAboutTodaySchedule(lowerQuestion))
                {
                    var todaySchedule = await GetTodayScheduleAsync(mssv);
                    analysis.CanAnswerDirectly = true;
                    analysis.DirectAnswer = todaySchedule;
                    return analysis;
                }

                // **2. Câu hỏi về lịch học ngày mai**
                if (IsAboutTomorrowSchedule(lowerQuestion))
                {
                    var tomorrowSchedule = await GetTomorrowScheduleAsync(mssv);
                    analysis.CanAnswerDirectly = true;
                    analysis.DirectAnswer = tomorrowSchedule;
                    return analysis;
                }

                // **3. Câu hỏi về lịch thi**
                if (IsAboutExamSchedule(lowerQuestion))
                {
                    var examSchedule = await GetUpcomingExamsAsync(mssv);
                    analysis.CanAnswerDirectly = true;
                    analysis.DirectAnswer = examSchedule;
                    return analysis;
                }

                // **4. Câu hỏi về điểm số**
                if (IsAboutGrades(lowerQuestion))
                {
                    var gradeInfo = await GetRecentGradesAsync(mssv);
                    analysis.CanAnswerDirectly = true;
                    analysis.DirectAnswer = gradeInfo;
                    return analysis;
                }

                // **5. Câu hỏi về đăng ký môn học**
                if (IsAboutCourseRegistration(lowerQuestion))
                {
                    var registrationInfo = await GetCourseRegistrationInfoAsync(mssv);
                    analysis.CanAnswerDirectly = true;
                    analysis.DirectAnswer = registrationInfo;
                    return analysis;
                }

                // **6. Câu hỏi về học phí**
                if (IsAboutTuition(lowerQuestion))
                {
                    var tuitionInfo = await GetTuitionInfoAsync(mssv);
                    analysis.CanAnswerDirectly = true;
                    analysis.DirectAnswer = tuitionInfo;
                    return analysis;
                }

                analysis.QuestionType = GetQuestionType(lowerQuestion);
                return analysis;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error analyzing question: {ex.Message}");
                return analysis;
            }
        }

        // **Kiểm tra loại câu hỏi**
        private bool IsAboutTodaySchedule(string question) =>
            question.Contains("hôm nay") && (question.Contains("lịch") || question.Contains("học"));

        private bool IsAboutTomorrowSchedule(string question) =>
            question.Contains("ngày mai") && (question.Contains("lịch") || question.Contains("học"));

        private bool IsAboutExamSchedule(string question) =>
            question.Contains("thi") || question.Contains("kiểm tra");

        private bool IsAboutGrades(string question) =>
            question.Contains("điểm") || question.Contains("kết quả") || question.Contains("gpa");

        private bool IsAboutCourseRegistration(string question) =>
            question.Contains("đăng ký") && (question.Contains("môn") || question.Contains("học phần"));

        private bool IsAboutTuition(string question) =>
            question.Contains("học phí") || question.Contains("tiền học");

        private string GetQuestionType(string question)
        {
            if (question.Contains("lịch")) return "SCHEDULE";
            if (question.Contains("điểm")) return "GRADE";
            if (question.Contains("đăng ký")) return "REGISTRATION";
            if (question.Contains("học phí")) return "TUITION";
            return "GENERAL";
        }

        // **Lấy lịch học hôm nay**
        private async Task<string> GetTodayScheduleAsync(string mssv)
        {
            var today = DateOnly.FromDateTime(DateTime.Now);

            var semester = await _context.Semesters
                .FirstOrDefaultAsync(s => s.StartDate <= today && s.EndDate >= today);
            var schedules = await _context.Schedules
                .Include(s => s.Section)
                    .ThenInclude(sec => sec.CurriculumCourse.Course)
                .Include(s => s.ScheduleType)
                .Include(s => s.PracticeGroup)
                .Where(s =>
                    (s.DayOfWeek == today.DayOfWeek) && s.ScheduleType.ScheduleTypeId != 3 &&
                    s.Section.Enrollments.Any(e => e.Student.MSSV == mssv && s.Section.Semester == semester))
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            var excludePracticeSchedulesWithoutNoPracticeGroupEnrollment = new List<Schedule>();
            foreach (var schedule in schedules)
                {
                if (schedule.PracticeGroupId.HasValue)
                {
                    var isEnrolledInPracticeGroup = await _context.PracticeGroupEnrollments
                        .AnyAsync(pge => pge.Student.MSSV == mssv &&
                                         pge.PracticeGroupId == schedule.PracticeGroupId &&
                                         pge.IsActive);
                    if (isEnrolledInPracticeGroup)
                    {
                        excludePracticeSchedulesWithoutNoPracticeGroupEnrollment.Add(schedule);
                    }
                }
                else
                {
                    excludePracticeSchedulesWithoutNoPracticeGroupEnrollment.Add(schedule);
                }
            }

            if (!excludePracticeSchedulesWithoutNoPracticeGroupEnrollment.Any())
                return "Hôm nay bạn không có lịch học.";

            var result = "📅 **Lịch học hôm nay:**\n";
            foreach (var schedule in excludePracticeSchedulesWithoutNoPracticeGroupEnrollment)
            {
                var courseInfo = $"{schedule.Section.CurriculumCourse.Course.CourseCode} - {schedule.Section.CurriculumCourse.Course.CourseName}";
                var timeInfo = $"{schedule.StartTime:HH:mm} - {schedule.EndTime:HH:mm}";
                var roomInfo = schedule.Room ?? "Online";
                var typeInfo = schedule.ScheduleType.ScheduleTypeId == 3 ? " (THI)" :
                              schedule.PracticeGroupId.HasValue ? " (TH)" : " (LT)";

                result += $"• {timeInfo}: {courseInfo}{typeInfo} - Phòng {roomInfo}\n";
            }

            return result.TrimEnd('\n');
        }

        // **Lấy lịch học ngày mai**
        private async Task<string> GetTomorrowScheduleAsync(string mssv)
        {
            var tomorrow = DateOnly.FromDateTime(DateTime.Now.AddDays(1));

            var semester = await _context.Semesters
                .FirstOrDefaultAsync(s => s.StartDate <= tomorrow && s.EndDate >= tomorrow);
            var schedules = await _context.Schedules
                .Include(s => s.Section)
                    .ThenInclude(sec => sec.CurriculumCourse.Course)
                .Include(s => s.ScheduleType)
                .Include(s => s.PracticeGroup)
                .Where(s =>
                    (s.DayOfWeek == tomorrow.DayOfWeek) && s.ScheduleType.ScheduleTypeId != 3 &&
                    s.Section.Enrollments.Any(e => e.Student.MSSV == mssv &&
                                                  s.Section.Semester == semester))
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            var excludePracticeSchedulesWithoutNoPracticeGroupEnrollment = new List<Schedule>();
            foreach (var schedule in schedules)
            {
                if (schedule.PracticeGroupId.HasValue)
                {
                    var isEnrolledInPracticeGroup = await _context.PracticeGroupEnrollments
                        .AnyAsync(pge => pge.Student.MSSV == mssv &&
                                         pge.PracticeGroupId == schedule.PracticeGroupId &&
                                         pge.IsActive);
                    if (isEnrolledInPracticeGroup)
                    {
                        excludePracticeSchedulesWithoutNoPracticeGroupEnrollment.Add(schedule);
                    }
                }
                else
                {
                    excludePracticeSchedulesWithoutNoPracticeGroupEnrollment.Add(schedule);
                }
            }

            if (!excludePracticeSchedulesWithoutNoPracticeGroupEnrollment.Any())
                return "Ngày mai bạn không có lịch học.";

            var result = "📅 **Lịch học ngày mai:**\n";
            foreach (var schedule in excludePracticeSchedulesWithoutNoPracticeGroupEnrollment)
            {
                var courseInfo = $"{schedule.Section.CurriculumCourse.Course.CourseCode} - {schedule.Section.CurriculumCourse.Course.CourseName}";
                var timeInfo = $"{schedule.StartTime:HH:mm} - {schedule.EndTime:HH:mm}";
                var roomInfo = schedule.Room ?? "Online";
                var typeInfo = schedule.ScheduleType.ScheduleTypeId == 3 ? " (THI)" :
                              schedule.PracticeGroupId.HasValue ? " (TH)" : " (LT)";

                result += $"• {timeInfo}: {courseInfo}{typeInfo} - Phòng {roomInfo}\n";
            }

            return result.TrimEnd('\n');
        }

        // **Lấy lịch thi sắp tới**
        private async Task<string> GetUpcomingExamsAsync(string mssv)
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            var semester = await _context.Semesters
    .FirstOrDefaultAsync(s => s.StartDate <= today && s.EndDate >= today);
            var examSchedules = await _context.Schedules
                .Include(s => s.Section)
                    .ThenInclude(sec => sec.CurriculumCourse.Course)
                .Where(s =>
                    s.ScheduleType.ScheduleTypeId == 3 && // Lịch thi
                    s.Date.HasValue &&
                    s.Date >= today &&
                    s.Section.Enrollments.Any(e => e.Student.MSSV == mssv &&
                                                 s.Section.Semester == semester))
                .OrderBy(s => s.Date)
                .Take(5)
                .ToListAsync();

            if (!examSchedules.Any())
                return "Bạn không có lịch thi nào sắp tới.";

            var result = "📝 **Lịch thi sắp tới:**\n";
            foreach (var exam in examSchedules)
            {
                var courseInfo = $"{exam.Section.CurriculumCourse.Course.CourseCode} - {exam.Section.CurriculumCourse.Course.CourseName}";
                var dateInfo = exam.Date?.ToString("dd/MM/yyyy") ?? "Chưa xác định";
                var timeInfo = $"{exam.StartTime:HH:mm} - {exam.EndTime:HH:mm}";
                var roomInfo = exam.Room ?? "Chưa xác định";

                result += $"• {dateInfo} {timeInfo}: {courseInfo} - Phòng {roomInfo}\n";
            }

            return result.TrimEnd('\n');
        }

        // **Lấy thông tin điểm số gần đây**
        private async Task<string> GetRecentGradesAsync(string mssv)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.MSSV == mssv);
            if (student == null) return "Không tìm thấy thông tin sinh viên.";

            // Lấy GPA gần nhất
            var latestGPA = await _context.GpaSnapshots
                .Include(g => g.Semester)
                .Where(g => g.Student.MSSV == mssv)
                .OrderByDescending(g => g.Semester.Year)
                .ThenByDescending(g => g.Semester.Term)
                .FirstOrDefaultAsync();

            // Lấy 3 kết quả môn học gần nhất
            var recentGrades = await _context.FinalResults
                .Include(fr => fr.Section)
                    .ThenInclude(s => s.CurriculumCourse.Course)
                .Include(fr => fr.Section.Semester)
                .Where(fr => fr.Student.MSSV == mssv)
                .OrderByDescending(fr => fr.Section.Semester.Year)
                .ThenByDescending(fr => fr.Section.Semester.Term)
                .Take(3)
                .ToListAsync();

            var result = "📊 **Kết quả học tập:**\n";

            if (latestGPA != null)
            {
                result += $"• GPA {latestGPA.Semester.Year}-{latestGPA.Semester.Term}: {latestGPA.Gpa:F2}/4.0 ({latestGPA.Gpa * 2.5:F2}/10)\n";
            }

            if (recentGrades.Any())
            {
                result += "**Môn học gần đây:**\n";
                foreach (var grade in recentGrades)
                {
                    result += $"• {grade.Section.CurriculumCourse.Course.CourseCode}: {grade.FinalScore:F1}/10 ({grade.GradeLetter})\n";
                }
            }

            return result.TrimEnd('\n');
        }

        // **Lấy thông tin đăng ký môn học**
        private async Task<string> GetCourseRegistrationInfoAsync(string mssv)
        {
            var student = await _context.Students
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                .FirstOrDefaultAsync(s => s.MSSV == mssv);

            if (student == null) return "Không tìm thấy thông tin sinh viên.";

            // Tìm học kỳ tiếp theo
            var currentDate = DateTime.Now;
            var nextSemester = await _context.Semesters
                .Where(s => s.StartDate > DateOnly.FromDateTime(currentDate))
                .OrderBy(s => s.StartDate)
                .FirstOrDefaultAsync();

            if (nextSemester == null) return "Chưa có thông tin học kỳ tiếp theo.";

            // Tìm thời gian đăng ký
            var registrationPeriod = await _context.RegistrationPeriods
                .Include(rp => rp.Department)
                .Include(rp => rp.Semester)
                .FirstOrDefaultAsync(rp =>
                    rp.Semester.SemesterId == nextSemester.SemesterId &&
                    rp.Department.DepartmentId == student.Class.Program.Department.DepartmentId);

            var result = $"📝 **Thông tin đăng ký học kỳ {nextSemester.Year}-{nextSemester.Term}:**\n";

            if (registrationPeriod != null)
            {
                var startDate = registrationPeriod.StartDate.ToString("dd/MM/yyyy HH:mm");
                var endDate = registrationPeriod.EndDate.ToString("dd/MM/yyyy HH:mm");
                var status = registrationPeriod.IsActive ? "Đang mở" : "Chưa mở";

                result += $"• Thời gian: {startDate} - {endDate}\n";
                result += $"• Trạng thái: {status}\n";

                if (currentDate < registrationPeriod.StartDate)
                {
                    var timeToStart = registrationPeriod.StartDate - currentDate;
                    result += $"• Còn {timeToStart.Days} ngày {timeToStart.Hours} giờ nữa\n";
                }
            }
            else
            {
                result += "• Chưa có thông tin thời gian đăng ký cho khoa của bạn\n";
            }

            // Gợi ý môn học nên đăng ký dựa trên năm học
            var currentYear = currentDate.Year - student.YearOfAdmission + 1;
            var suggestedCourses = await _context.CurriculumCourses
                .Include(cc => cc.Course)
                .Where(cc => cc.Program.AcademicProgramId == student.Class.Program.AcademicProgramId &&
                            cc.SemeterSuggested == currentYear)
                .Take(5)
                .ToListAsync();

            if (suggestedCourses.Any())
            {
                result += "**Môn học nên đăng ký (năm " + currentYear + "):**\n";
                foreach (var course in suggestedCourses)
                {
                    result += $"• {course.Course.CourseCode} - {course.Course.CourseName}\n";
                }
            }

            return result.TrimEnd('\n');
        }

        // **Lấy thông tin học phí**
        private async Task<string> GetTuitionInfoAsync(string mssv)
        {
            var tuitionFees = await _context.TuitionFees
                .Include(tf => tf.Semester)
                .Where(tf => tf.Student.MSSV == mssv)
                .OrderByDescending(tf => tf.Semester.Year)
                .ThenByDescending(tf => tf.Semester.Term)
                .Take(2)
                .ToListAsync();

            if (!tuitionFees.Any())
                return "Không có thông tin học phí.";

            var result = "💰 **Thông tin học phí:**\n";
            foreach (var tuition in tuitionFees)
            {
                var semester = $"{tuition.Semester.Year}-{tuition.Semester.Term}";
                var total = tuition.TotalAmount.ToString("N0");
                var paid = tuition.PaidAmount.ToString("N0");
                var remaining = tuition.RemainingAmount.ToString("N0");
                var status = tuition.Status == TuitionStatus.FullyPaid ? "✅ Đã thanh toán" : "❌ Chưa thanh toán";

                result += $"• HK {semester}: {paid}/{total} VND ({status})\n";
                if (tuition.RemainingAmount > 0)
                {
                    result += $"  Còn lại: {remaining} VND\n";
                }
            }

            return result.TrimEnd('\n');
        }

        // **Cải thiện BuildStudentContextPromptAsync**
        private async Task<string> BuildStudentContextPromptAsync(string studentContext, StudentDatabaseInfo? studentInfo, QuestionAnalysis analysis)
        {
            var baseContext = $@"
👨‍🎓 **SINH VIÊN:** {(string.IsNullOrEmpty(studentContext) ? "Chưa cung cấp thông tin" : studentContext)}
🎯 **LOẠI CÂU HỎI:** {analysis.QuestionType}";

            // **CHỈ THÊM THÔNG TIN CẦN THIẾT DựA THEO LOẠI CÂU HỎI**
            if (studentInfo != null && !studentInfo.NotFound)
            {
                baseContext += $@"
📋 **DỮ LIỆU CẦN THIẾT:**
• Sinh viên: {studentInfo.StudentName} ({studentInfo.MSSV})
• Lớp: {studentInfo.ClassName} - {studentInfo.ProgramName}";

                // Chỉ thêm thông tin liên quan
                switch (analysis.QuestionType)
                {
                    case "SCHEDULE":
                        if (studentInfo.ScheduleInfos.Any())
                        {
                            baseContext += "\n• Lịch học tuần này: " + studentInfo.ScheduleInfos.Count + " buổi";
                        }
                        break;
                    case "GRADE":
                        baseContext += $"\n• GPA hiện tại: {studentInfo.CurrentGPA}/4.0";
                        baseContext += $"\n• Tín chỉ tích lũy: {studentInfo.TotalCreditsCompleted}/{studentInfo.RequiredCredits}";
                        break;
                    case "TUITION":
                        if (studentInfo.TuitionInfo.Any())
                        {
                            var latest = studentInfo.TuitionInfo.First();
                            baseContext += $"\n• Học phí gần nhất: {latest.RemainingAmount:N0} VND còn lại";
                        }
                        break;
                }
            }

            baseContext += $@"

🤖 **HƯỚNG DẪN AI:**
- Trả lời NGẮN GỌN, TRỰC TIẾP
- Chỉ dùng dữ liệu có sẵn ở trên
- Không giải thích dài dòng
- Không lặp lại câu hỏi của sinh viên
- Kết thúc câu trả lời ngay khi đã đủ thông tin";

            return baseContext;
        }

        // **Class hỗ trợ phân tích câu hỏi**
        private class QuestionAnalysis
        {
            public bool CanAnswerDirectly { get; set; } = false;
            public string DirectAnswer { get; set; } = "";
            public string QuestionType { get; set; } = "GENERAL";
        }
    }
}