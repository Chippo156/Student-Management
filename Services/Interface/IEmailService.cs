namespace StudentManagement.Services.Interface
{
    public interface IEmailService
    {
        Task<bool> SendOtpEmailAsync(string toEmail, string otpCode, string studentName, string mssv);

        Task<bool> SendDefaultPasswordEmailAsync(string toEmail, string defaultPassword, string studentName, string mssv);
    }
}