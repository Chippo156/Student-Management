using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class GeminiAIService : IGeminiAIService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _baseUrl;

        public GeminiAIService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["GeminiAI:ApiKey"] ?? throw new ArgumentNullException("GeminiAI:ApiKey");
            _baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
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
                        temperature = 0.7,
                        topK = 40,
                        topP = 0.95,
                        maxOutputTokens = 1024
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

                    // Ghi log chi tiết (chỉ hiển thị nội bộ, không gửi ra ngoài)
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
            var educationalPrompt = $@"
Bạn là trợ lý AI giáo dục thông minh của hệ thống Student Management System. 
Nhiệm vụ của bạn là hỗ trợ sinh viên với các câu hỏi học tập và đời sống sinh viên.

Ngữ cảnh sinh viên: {studentContext}

Hãy trả lời câu hỏi sau một cách:
- Thân thiện và dễ hiểu
- Chính xác và hữu ích
- Khuyến khích việc học tập
- Sử dụng tiếng Việt tự nhiên

Câu hỏi: {question}";

            return await GenerateResponseAsync(educationalPrompt);
        }

        private string BuildEducationalPrompt(string userMessage, string conversationContext)
        {
            return $@"
Bạn là trợ lý AI thông minh của Student Management System, tên là EduBot.

Vai trò của bạn:
- Hỗ trợ sinh viên về các vấn đề học tập, nghiên cứu
- Giải đáp thắc mắc về quy chế, quy định trường học
- Tư vấn về định hướng nghề nghiệp
- Hỗ trợ tâm lý, động viên sinh viên

Nguyên tắc trả lời:
- Sử dụng tiếng Việt tự nhiên, thân thiện
- Cung cấp thông tin chính xác, hữu ích
- Khuyến khích tinh thần học tập
- Từ chối trả lời các câu hỏi không phù hợp

{(string.IsNullOrEmpty(conversationContext) ? "" : $"Ngữ cảnh cuộc trò chuyện trước:\n{conversationContext}\n")}

Câu hỏi của sinh viên: {userMessage}

Hãy trả lời một cách thân thiện và hữu ích:";
        }
    }
}