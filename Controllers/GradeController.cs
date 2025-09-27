using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GradeController(IGradeService gradeService) : ControllerBase
    {
        [HttpGet("GetAllGrades")]
        public async Task<ActionResult<IEnumerable<Grade>>> GetAllGrades()
        {
            var grades = await gradeService.GetAllGradesAsync();
            return Ok(ApiResponse.SuccessResponse(grades, "Grades retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Grade>> GetGradeById(int id)
        {
            var grade = await gradeService.GetGradeByIdAsync(id);
            if (grade is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Grade with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(grade, "Grade retrieved successfully"));
        }

        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<Grade>>> GetGradesByStudent(int studentId)
        {
            var grades = await gradeService.GetGradesByStudentAsync(studentId);
            return Ok(ApiResponse.SuccessResponse(grades, "Student grades retrieved successfully"));
        }

        [HttpGet("assessment/{assessmentId}")]
        public async Task<ActionResult<IEnumerable<Grade>>> GetGradesByAssessment(int assessmentId)
        {
            var grades = await gradeService.GetGradesByAssessmentAsync(assessmentId);
            return Ok(ApiResponse.SuccessResponse(grades, "Assessment grades retrieved successfully"));
        }

        [HttpGet("section/{sectionId}/student/{studentId}")]
        public async Task<ActionResult<IEnumerable<Grade>>> GetGradesBySectionAndStudent(int sectionId, int studentId)
        {
            var grades = await gradeService.GetGradesBySectionAndStudentAsync(sectionId, studentId);
            return Ok(ApiResponse.SuccessResponse(grades, "Section-student grades retrieved successfully"));
        }

        [HttpPost("CreateGrade")]
        public async Task<ActionResult<Grade>> CreateGrade(GradeRequest request)
        {
            var createdGrade = await gradeService.CreateGradeAsync(request);
            return CreatedAtAction(nameof(GetGradeById), new { id = createdGrade.GradeId }, ApiResponse.SuccessResponse(createdGrade, "Grade created successfully"));
        }

        [HttpPut("Update/{id}")]
        public async Task<ActionResult<Grade>> UpdateGrade(int id, GradeRequest request)
        {
            var updatedGrade = await gradeService.UpdateGradeAsync(id, request);
            if (updatedGrade is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Grade with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(updatedGrade, "Grade updated successfully"));
        }

        [HttpDelete("DeleteGrade/{id}")]
        public async Task<ActionResult> DeleteGrade(int id)
        {
            var isDeleted = await gradeService.DeleteGradeAsync(id);
            if (!isDeleted)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Grade with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Grade deleted successfully"));
        }
    }
}