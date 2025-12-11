using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Services;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]

    [ApiController]
    [Authorize(Roles = "Admin")]
        public class AutoEnrollmentController : BaseController
        {
            private readonly AutoEnrollmentService _autoEnrollmentService;

            public AutoEnrollmentController(AutoEnrollmentService autoEnrollmentService)
            {
                _autoEnrollmentService = autoEnrollmentService;
            }

            [HttpPost("enroll-first-year/{semesterId}")]
            public async Task<IActionResult> EnrollFirstYearStudents(int semesterId)
            {
                try
                {
                    var result = await _autoEnrollmentService.AutoEnrollFirstYearStudentsAsync(semesterId);

                    if (result.IsSuccess)
                    {
                        return Ok(new
                        {
                            success = true,
                            message = result.Message,
                            data = new
                            {
                                successCount = result.SuccessCount,
                                failedCount = result.FailedCount,
                                enrolledCourses = result.EnrolledCourses,
                                errorMessages = result.ErrorMessages
                            }
                        });
                    }

                    return BadRequest(new { success = false, message = result.Message });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { success = false, message = ex.Message });
                }
            }
        }
}
