namespace StudentManagement.Services.Interface
{
    public interface IEmailService
    {
        Task<bool> SendDefaultPasswordEmailAsync(string toEmail, string defaultPassword, string studentName, string mssv);
    }
}