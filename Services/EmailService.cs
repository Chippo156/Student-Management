using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // Thêm method mới vào EmailService
        public async Task<bool> SendDefaultPasswordEmailAsync(string toEmail, string defaultPassword, string studentName, string mssv)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("EmailSettings");
                var fromEmail = smtpSettings["FromEmail"];
                var fromPassword = smtpSettings["FromPassword"];
                var smtpHost = smtpSettings["SmtpHost"];
                var smtpPort = int.Parse(smtpSettings["SmtpPort"] ?? "587");

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    EnableSsl = true,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(fromEmail, fromPassword)
                };

                var subject = "Password Reset - Student Management System";
                var body = GenerateDefaultPasswordEmailBody(studentName, mssv, defaultPassword);

                var message = new MailMessage(fromEmail!, toEmail, subject, body)
                {
                    IsBodyHtml = true
                };

                await client.SendMailAsync(message);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send email: {ex.Message}");
                return false;
            }
        }

        private string GenerateDefaultPasswordEmailBody(string studentName, string mssv, string defaultPassword)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; color: #333; margin-bottom: 30px; }}
        .content {{ color: #555; line-height: 1.6; }}
        .password-box {{ background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; font-family: monospace; font-size: 18px; text-align: center; border: 2px solid #007bff; }}
        .password {{ font-size: 24px; font-weight: bold; color: #007bff; }}
        .warning {{ color: #dc3545; font-weight: bold; margin: 20px 0; padding: 15px; background-color: #f8d7da; border-radius: 5px; }}
        .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px; text-align: center; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>🔐 Khôi Phục Mật Khẩu</h2>
        </div>
        
        <div class='content'>
            <p>Xin chào <strong>{studentName}</strong>,</p>
            <p><strong>MSSV:</strong> {mssv}</p>
            
            <p>Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn.</p>
            
            <p>Mật khẩu mặc định mới của bạn là:</p>
            
            <div class='password-box'>
                <div class='password'>{defaultPassword}</div>
            </div>
            
            <div class='warning'>
                ⚠️ <strong>Quan trọng:</strong><br>
                • Vui lòng đăng nhập và đổi mật khẩu ngay sau khi nhận được email này<br>
                • Không chia sẻ mật khẩu này với bất kỳ ai<br>
                • Mật khẩu này chỉ có hiệu lực trong 24 giờ
            </div>
            
            <p><strong>Hướng dẫn đăng nhập:</strong></p>
            <ol>
                <li>Truy cập hệ thống Student Management</li>
                <li>Nhập MSSV: <strong>{mssv}</strong></li>
                <li>Nhập mật khẩu mặc định ở trên</li>
                <li>Vào trang cá nhân và đổi mật khẩu mới</li>
            </ol>
            
            <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng liên hệ với bộ phận hỗ trợ ngay lập tức.</p>
        </div>
        
        <div class='footer'>
            <p>Email này được gửi tự động từ Student Management System.</p>
            <p>Vui lòng không trả lời email này.</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}