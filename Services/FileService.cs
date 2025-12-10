using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;
using File = StudentManagement.Models.File;

namespace StudentManagement.Services
{
    public class FileService : IFileService
    {
        private readonly AppDbContext _context;
        private readonly Cloudinary _cloudinary;

        public FileService(AppDbContext context, IOptions<CloudinarySettings> cloudinaryConfig)
        {
            _context = context;
            
            // Cấu hình Cloudinary
            var acc = new Account(
                cloudinaryConfig.Value.CloudName,
                cloudinaryConfig.Value.ApiKey,
                cloudinaryConfig.Value.ApiSecret
            );
            
            _cloudinary = new Cloudinary(acc);
        }

        public async Task<FileResponse> UploadFileAsync(FileRequest request, string uploadDirectory)
        {
            // Check if user exists
            var user = await _context.Users.FindAsync(request.UploadedByUserId)
                ?? throw new Exception("User not found");

            // Kiểm tra và upload lên Cloudinary
            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(request.File.FileName, 
                    request.File.OpenReadStream()),
                UseFilename = true,
                UniqueFilename = true,
                Folder = "student_management_files"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                throw new Exception($"Failed to upload file: {uploadResult.Error.Message}");
            }

            // Tạo file entity với thông tin từ Cloudinary
            var file = new File
            {
                FileName = request.File.FileName,
                FileType = request.File.ContentType,
                FilePath = uploadResult.SecureUrl.ToString(), // URL từ Cloudinary
                UploadedBy = user,
                UploadedAt = DateTime.Now
            };

            // Lưu thông tin file vào database
            _context.Files.Add(file);
            
            await _context.SaveChangesAsync();
            
            return new FileResponse { 
               FileName = file.FileName,
                FileType = file.FileType,
                FilePath = file.FilePath,
                UploadedBy = file.UploadedBy.UserId,
                UploadedAt = file.UploadedAt
            };
        }

        public async Task<bool> DeleteFileAsync(int fileId)
        {
            var file = await _context.Files.FindAsync(fileId);
            if (file is null)
            {
                return false;
            }

            // Lấy public_id từ URL
            var publicId = ExtractPublicIdFromUrl(file.FilePath);
            
            // Xóa file từ Cloudinary nếu có public_id
            if (!string.IsNullOrEmpty(publicId))
            {
                var deleteParams = new DeletionParams(publicId);
                var result = await _cloudinary.DestroyAsync(deleteParams);
                
                if (result.Error != null)
                {
                    throw new Exception($"Failed to delete file from Cloudinary: {result.Error.Message}");
                }
            }

            // Xóa record từ database
            _context.Files.Remove(file);
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<IEnumerable<File>> GetFilesByUserAsync(int userId)
        {
            return await _context.Files
                .Include(f => f.UploadedBy)
                .Where(f => f.UploadedBy.UserId == userId)
                .ToListAsync();
        }

        public async Task<(byte[], string, string)> DownloadFileAsync(int fileId)
        {
            var file = await _context.Files.FindAsync(fileId)
                ?? throw new Exception($"File with ID {fileId} not found");

            // Download từ Cloudinary URL
            using (var httpClient = new HttpClient())
            {
                var response = await httpClient.GetAsync(file.FilePath);
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception("Failed to download file from cloud storage");
                }
                
                var fileBytes = await response.Content.ReadAsByteArrayAsync();
                return (fileBytes, file.FileType, file.FileName);
            }
        }

        private string ExtractPublicIdFromUrl(string url)
        {
            try
            {
                // Format của Cloudinary URL: https://res.cloudinary.com/cloud_name/raw/upload/v1234567890/folder/filename.ext
                var uri = new Uri(url);
                var pathSegments = uri.AbsolutePath.Split('/');
                
                // Loại bỏ "/raw/upload/v1234567890/" để lấy "folder/filename.ext"
                var startIndex = Array.IndexOf(pathSegments, "upload") + 2; // +2 để bỏ qua cả "upload" và "v1234567890"
                
                if (startIndex >= pathSegments.Length)
                {
                    return string.Empty;
                }
                
                // Ghép các phân đoạn còn lại để tạo public_id
                return string.Join("/", pathSegments.Skip(startIndex));
            }
            catch
            {
                return string.Empty;
            }
        }
    }
}