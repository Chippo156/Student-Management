using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;
using StudentManagement.Services.Interface;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
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
            _baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
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
                        temperature = 0.4,
                        topK = 40,
                        topP = 0.95,
                        maxOutputTokens = 1024  // Tăng lên để có thể trả lời dài hơn với thông tin chi tiết
                    },
                    safetySettings = new[]
                    {
                        new { category = "HARM_CATEGORY_HARASSMENT", threshold = "BLOCK_MEDIUM_AND_ABOVE" },
                        new { category = "HARM_CATEGORY_HATE_SPEECH", threshold = "BLOCK_MEDIUM_AND_ABOVE" },
                        new { category = "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold = "BLOCK_MEDIUM_AND_ABOVE" },
                        new { category = "HARM_CATEGORY_DANGEROUS_CONTENT", threshold = "BLOCK_MEDIUM_AND_ABOVE" }
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
                    if (firstCandidate.TryGetProperty("content", out var content_prop) &&
                        content_prop.TryGetProperty("parts", out var parts) &&
                        parts.GetArrayLength() > 0)
                    {
                        var firstPart = parts[0];
                        if (firstPart.TryGetProperty("text", out var text))
                        {
                            return text.GetString() ?? "Không thể tạo phản hồi.";
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

        public async Task<string> GenerateEducationalResponseAsync(string question, string studentContext = "")
        {
            // **NEW: Detect MSSV in question and fetch student data**
            var studentInfo = await ExtractAndFetchStudentInfoAsync(question, studentContext);
            
            var enhancedContext = await BuildStudentContextPromptAsync(studentContext, studentInfo);

            var educationalPrompt = $@"
🎓 **BẠN LÀ EDUBOT - TRỢ LÝ AI GIÁO DỤC THÔNG MINH**

{enhancedContext}

📝 **HƯỚNG DẪN TRẢ LỜI:**
- Phân tích câu hỏi của sinh viên cẩn thận
- Sử dụng thông tin cụ thể của sinh viên nếu có (điểm số, GPA, môn học, lịch sử học tập)
- Đưa ra câu trả lời chính xác dựa trên dữ liệu thực tế
- Sử dụng ngôn ngữ thân thiện, dễ hiểu
- Bổ sung thông tin liên quan hữu ích
- Khuyến khích và động viên sinh viên
- Hướng dẫn cụ thể nếu cần thực hiện thao tác trong hệ thống

❓ **Câu hỏi:** {question}

💡 **Trả lời chi tiết và thân thiện dựa trên thông tin thực tế:**";

            return await GenerateResponseAsync(educationalPrompt);
        }

        // **NEW METHOD: Extract MSSV and fetch student information**
        private async Task<StudentDatabaseInfo?> ExtractAndFetchStudentInfoAsync(string question, string studentContext)
        {
            try
            {
                // Extract MSSV from question or context
                string? mssv = ExtractMSSV(question) ?? ExtractMSSV(studentContext);
                
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

        // **NEW METHOD: Extract MSSV using regex**
        private static string? ExtractMSSV(string text)
        {
            if (string.IsNullOrEmpty(text))
                return null;

            // Pattern for MSSV - typically 8-10 digits
            var mssvPattern = @"\b(20\d{6,8})\b";
            var match = Regex.Match(text, mssvPattern);
            
            if (match.Success)
                return match.Value;

            // Alternative pattern - look for explicit MSSV mention
            var explicitPattern = @"MSSV[:\s]*(\d{8,10})";
            match = Regex.Match(text, explicitPattern, RegexOptions.IgnoreCase);
            
            return match.Success ? match.Groups[1].Value : null;
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
• GPA hiện tại: {studentInfo.CurrentGPA}/4.0 (≈ {Math.Round(studentInfo.CurrentGPA * 2.5, 2)}/10)
• GPA tích lũy: {studentInfo.CumulativeGPA}/4.0 (≈ {Math.Round(studentInfo.CumulativeGPA * 2.5, 2)}/10)
• Tín chỉ đã tích lũy: {studentInfo.TotalCreditsCompleted}/{studentInfo.RequiredCredits}
• Tín chỉ nợ: {studentInfo.TotalCreditsFailed}
• Tiến độ hoàn thành: {Math.Round((double)studentInfo.TotalCreditsCompleted / studentInfo.RequiredCredits * 100, 1)}%";

                // Add GPA history
                if (studentInfo.GpaSnapshots.Any())
                {
                    baseContext += "\n\n**Lịch sử GPA theo học kỳ:**\n";
                    foreach (var gpa in studentInfo.GpaSnapshots.TakeLast(5))
                    {
                        baseContext += $"• {gpa.Semester}: {gpa.GPA}/4.0 ({gpa.GPA10Scale}/10)\n";
                    }
                }

                // Add recent course results
                if (studentInfo.FinalResults.Any())
                {
                    baseContext += "\n\n**Kết quả môn học gần đây:**\n";
                    foreach (var result in studentInfo.FinalResults.Take(5))
                    {
                        baseContext += $"• {result.CourseCode} - {result.CourseName}: {result.FinalScore}/10 ({result.GradeLetter}) - {result.Semester}\n";
                    }
                }

                // Add current enrollments
                if (studentInfo.CurrentEnrollments.Any())
                {
                    baseContext += "\n\n**Môn học đang học:**\n";
                    foreach (var enrollment in studentInfo.CurrentEnrollments.Take(5))
                    {
                        baseContext += $"• {enrollment.CourseCode} - {enrollment.CourseName} ({enrollment.Credits} TC) - {enrollment.Semester}\n";
                    }
                }

                // Add tuition info
                if (studentInfo.TuitionInfo.Any())
                {
                    baseContext += "\n\n**Thông tin học phí gần đây:**\n";
                    foreach (var tuition in studentInfo.TuitionInfo.Take(2))
                    {
                        baseContext += $"• {tuition.Semester}: {tuition.TotalAmount:N0} VND (Đã đóng: {tuition.PaidAmount:N0} VND, Còn lại: {tuition.RemainingAmount:N0} VND)\n";
                    }
                }
            }
            else if (studentInfo?.NotFound == true)
            {
                baseContext += $"\n\n⚠️ **THÔNG BÁO:** Không tìm thấy thông tin sinh viên với MSSV {studentInfo.MSSV} trong hệ thống.";
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

{(string.IsNullOrEmpty(conversationContext) ? "" : $"📋 **Ngữ cảnh cuộc trò chuyện trước:**\n{conversationContext}\n")}

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
        }

        private class GpaInfo
        {
            public string Semester { get; set; } = "";
            public double GPA { get; set; }
            public double GPA10Scale { get; set; }
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
    }
}