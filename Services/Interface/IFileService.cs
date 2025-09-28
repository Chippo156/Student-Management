using Microsoft.AspNetCore.Http;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using File = StudentManagement.Models.File;

namespace StudentManagement.Services.Interface
{
    public interface IFileService
    {
        Task<IEnumerable<File>> GetFilesByUserAsync(int userId);
        Task<FileResponse> UploadFileAsync(FileRequest request, string uploadDirectory);
        Task<(byte[], string, string)> DownloadFileAsync(int fileId);
        Task<bool> DeleteFileAsync(int fileId);
    }
}