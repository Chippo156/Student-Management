using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,AcademicStaff")]
    public class RegistrationPeriodController : ControllerBase
    {
        private readonly IRegistrationPeriodService _registrationPeriodService;

        public RegistrationPeriodController(IRegistrationPeriodService registrationPeriodService)
        {
            _registrationPeriodService = registrationPeriodService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRegistrationPeriods(
            [FromQuery] PaginationParams pagination,
            [FromQuery] int? semesterId = null,
            [FromQuery] int? departmentId = null,
            [FromQuery] bool? isActive = null)
        {
            try
            {
                var result = await _registrationPeriodService.GetAllRegistrationPeriodsAsync(
                    pagination, semesterId, departmentId, isActive);
                
                return Ok(ApiResponse.SuccessResponse(result, "Registration periods retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRegistrationPeriodById(int id)
        {
            try
            {
                var registrationPeriod = await _registrationPeriodService.GetRegistrationPeriodByIdAsync(id);
                
                if (registrationPeriod == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, 
                        $"Registration period with ID {id} not found", null));
                }
                
                return Ok(ApiResponse.SuccessResponse(registrationPeriod, "Registration period retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateRegistrationPeriod([FromBody] RegistrationPeriodRequest request)
        {
            try
            {
                var registrationPeriod = await _registrationPeriodService.CreateRegistrationPeriodAsync(request);
                
                return CreatedAtAction(
                    nameof(GetRegistrationPeriodById),
                    new { id = registrationPeriod.RegistrationPeriodId },
                    ApiResponse.SuccessResponse(registrationPeriod, "Registration period created successfully"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ApiResponse.ErrorResponse(ErrorCodes.Conflict, ex.Message, null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, ex.Message, null));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRegistrationPeriod(int id, [FromBody] UpdateRegistrationPeriodRequest request)
        {
            try
            {
                var updatedRegistrationPeriod = await _registrationPeriodService.UpdateRegistrationPeriodAsync(id, request);
                
                if (updatedRegistrationPeriod == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, 
                        $"Registration period with ID {id} not found", null));
                }
                
                return Ok(ApiResponse.SuccessResponse(updatedRegistrationPeriod, "Registration period updated successfully"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ApiResponse.ErrorResponse(ErrorCodes.Conflict, ex.Message, null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, ex.Message, null));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRegistrationPeriod(int id)
        {
            try
            {
                var isDeleted = await _registrationPeriodService.DeleteRegistrationPeriodAsync(id);
                
                if (!isDeleted)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, 
                        $"Registration period with ID {id} not found", null));
                }
                
                return Ok(ApiResponse.SuccessResponse(null, "Registration period deleted successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ApiResponse.ErrorResponse(ErrorCodes.Conflict, ex.Message, null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, ex.Message, null));
            }
        }

        [HttpGet("active")]
        [AllowAnonymous] // Allow students to see active periods
        public async Task<IActionResult> GetActiveRegistrationPeriods()
        {
            try
            {
                var activeRegistrationPeriods = await _registrationPeriodService.GetActiveRegistrationPeriodsAsync();
                return Ok(ApiResponse.SuccessResponse(activeRegistrationPeriods, "Active registration periods retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("department/{departmentId}/active")]
        [AllowAnonymous] // Allow students to check their department's active period
        public async Task<IActionResult> GetActiveRegistrationPeriodByDepartment(int departmentId)
        {
            try
            {
                var activeRegistrationPeriod = await _registrationPeriodService.GetActiveRegistrationPeriodByDepartmentAsync(departmentId);
                
                if (activeRegistrationPeriod == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, 
                        "No active registration period found for this department", null));
                }
                
                return Ok(ApiResponse.SuccessResponse(activeRegistrationPeriod, "Active registration period retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("semester/{semesterId}")]
        public async Task<IActionResult> GetRegistrationPeriodsBySemester(int semesterId)
        {
            try
            {
                var registrationPeriods = await _registrationPeriodService.GetRegistrationPeriodsBySemesterAsync(semesterId);
                return Ok(ApiResponse.SuccessResponse(registrationPeriods, "Registration periods retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
    }
}