namespace StudentManagement.Services.Interface
{
    public interface IGeminiAIService
    {
        Task<string> GenerateResponseAsync(string prompt, string conversationContext = "");
        Task<string> GenerateEducationalResponseAsync(string question,string mssv, string studentContext = "");
    }
}