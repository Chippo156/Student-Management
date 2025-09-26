using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
            return Ok(students);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Student>> GetStudentById(int id)
        {
            var student = await studentService.GetStudentByIdAsync(id);
            if (student is null)
            {
                return NotFound($"Student with ID {id} not found.");
            }
            return Ok(student);
        }

        [HttpPost("CreateStudent")]
        public async Task<ActionResult<Student>> CreateStudent(StudentRequest student)
        {
            var createdStudent = await studentService.CreateStudentAsync(student);
            if (createdStudent is null)
            {
                return BadRequest("Failed to create student.");
            }
            return CreatedAtAction(nameof(GetStudentById), new { id = createdStudent.Id }, createdStudent);
        }

        [HttpDelete("DeleteStudent/{id}")]
        public async Task<ActionResult> DeleteStudent(int id)
        {
            var isDeleted = await studentService.DeleteStudentAsync(id);
            if (!isDeleted)
            {
                return NotFound($"Student with ID {id} not found.");
            }
            return NoContent();
        }

    }
}
