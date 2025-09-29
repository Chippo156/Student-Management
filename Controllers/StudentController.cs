using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")] 
    [ApiController]
    public class StudentController(IStudentService studentService) : ControllerBase
    {
        public static Student student = new Student();
        
        [HttpGet("GetAllStudents")]
        public async Task<ActionResult<IEnumerable<Student>>> GetAllStudents()
        {
            var students = await studentService.GetAllStudentsAsync();
            return Ok(ApiResponse.SuccessResponse(students, "Students retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Student>> GetStudentById(int id)
        {
            var student = await studentService.GetStudentByIdAsync(id);
            if (student is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Student with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(student, "Student retrieved successfully"));
        }

        [HttpPost("CreateStudent")]
        public async Task<ActionResult<Student>> CreateStudent(StudentRequest student)
        {
            var createdStudent = await studentService.CreateStudentAsync(student);
            if (createdStudent is null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Failed to create student.", null));
            }
            return CreatedAtAction(nameof(GetStudentById), new { id = createdStudent.Id }, ApiResponse.SuccessResponse(createdStudent, "Student created successfully"));
        }

        [HttpDelete("DeleteStudent/{id}")]
        public async Task<ActionResult> DeleteStudent(int id)
        {
            var isDeleted = await studentService.DeleteStudentAsync(id);
            if (!isDeleted)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Student with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Student deleted successfully"));
        }

        [HttpGet("section/{sectionId}")]
        public async Task<ActionResult<IEnumerable<Student>>> GetStudentsBySection(int sectionId)
        {
            var students = await studentService.GetStudentsBySectionIdAsync(sectionId);
            return Ok(ApiResponse.SuccessResponse(students, "Section students retrieved successfully"));
        }

    }
}
