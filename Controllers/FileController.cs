using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using File = StudentManagement.Models.File;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {
        private readonly IFileService _fileService;
        private readonly string _uploadDirectory;

        public FileController(IFileService fileService, IWebHostEnvironment env)
        {
            _fileService = fileService;
            _uploadDirectory = Path.Combine(env.ContentRootPath, "Uploads");
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetFilesByUser(int userId)
        {
            var files = await _fileService.GetFilesByUserAsync(userId);
            return Ok(ApiResponse.SuccessResponse(files, "User files retrieved successfully"));
        }

        [HttpPost("Upload")]
        public async Task<IActionResult> UploadFile([FromForm] FileRequest request)
        {
            try
            {
                if (request.File == null || request.File.Length == 0)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "No file was uploaded", null));
                }

                var uploadedFile = await _fileService.UploadFileAsync(request, _uploadDirectory);
                return Ok(ApiResponse.SuccessResponse(uploadedFile, "File uploaded successfully to Cloudinary"));   
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("Download/{id}")]
        public async Task<IActionResult> DownloadFile(int id)
        {
            try
            {
                var (fileBytes, contentType, fileName) = await _fileService.DownloadFileAsync(id);
                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, ex.Message, null));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFile(int id)
        {
            var result = await _fileService.DeleteFileAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"File with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "File deleted successfully from Cloudinary"));
        }
    }
}