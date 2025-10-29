using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentController(IDepartmentService departmentService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllDepartments()
        {
            try
            {
                var departments = await departmentService.GetAllDepartmentsAsync();
                return Ok(ApiResponse.SuccessResponse(departments, "Departments retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while retrieving departments", new List<string> { ex.Message }));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDepartmentById(int id)
        {
            try
            {
                var department = await departmentService.GetDepartmentByIdAsync(id);
                if (department == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Department with ID {id} not found", null));
                }
                return Ok(ApiResponse.SuccessResponse(department, "Department retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while retrieving department", new List<string> { ex.Message }));
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateDepartment([FromBody] DepartmentRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid input data", errors));
                }

                var department = await departmentService.CreateDepartmentAsync(request);
                return CreatedAtAction(nameof(GetDepartmentById), new { id = department.DepartmentId }, 
                    ApiResponse.SuccessResponse(department, "Department created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while creating department", new List<string> { ex.Message }));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateDepartment(int id, [FromBody] DepartmentRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid input data", errors));
                }

                var department = await departmentService.UpdateDepartmentAsync(id, request);
                if (department == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Department with ID {id} not found", null));
                }

                return Ok(ApiResponse.SuccessResponse(department, "Department updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while updating department", new List<string> { ex.Message }));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            try
            {
                var result = await departmentService.DeleteDepartmentAsync(id);
                if (!result)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Department with ID {id} not found", null));
                }

                return Ok(ApiResponse.SuccessResponse(null, "Department deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while deleting department", new List<string> { ex.Message }));
            }
        }

        // Dropdown endpoints
        [HttpGet("dropdown")]
        public async Task<IActionResult> GetDepartmentsDropdown()
        {
            try
            {
                var departments = await departmentService.GetDepartmentsDropdownAsync();
                return Ok(ApiResponse.SuccessResponse(departments, "Departments dropdown retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while retrieving departments dropdown", new List<string> { ex.Message }));
            }
        }

        [HttpGet("dropdown/faculty/{facultyId}")]
        public async Task<IActionResult> GetDepartmentsByFacultyDropdown(int facultyId)
        {
            try
            {
                var departments = await departmentService.GetDepartmentsByFacultyDropdownAsync(facultyId);
                return Ok(ApiResponse.SuccessResponse(departments, "Departments by faculty dropdown retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while retrieving departments by faculty dropdown", new List<string> { ex.Message }));
            }
        }
    }
}
