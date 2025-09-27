using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentController(IDepartmentService departmentService) : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDepartmentById(int id)
        {
            var department = await departmentService.GetDepartmentByIdAsync(id);
            if (department == null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Department not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(department, "Department retrieved successfully"));
        }
        [HttpGet]
        public async Task<IActionResult> GetAllDepartments()
        {
            var departments = await departmentService.GetAllDepartmentsAsync();
            return Ok(ApiResponse.SuccessResponse(departments, "Departments retrieved successfully"));
        }
        [HttpPost]
        public async Task<IActionResult> CreateDepartment(DepartmentRequest departmentRequest)
        {
            var department = await departmentService.CreateDepartmentAsync(departmentRequest);
            return CreatedAtAction(nameof(GetDepartmentById), new { id = department.DepartmentId }, ApiResponse.SuccessResponse(department, "Department created successfully"));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDepartment(int id, [FromBody] string newDepartmentName)
        {
            var updatedDepartment = await departmentService.UpdateDepartmentAsync(id, newDepartmentName);
            if (updatedDepartment == null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Department not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(updatedDepartment, "Department updated successfully"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var result = await departmentService.DeleteDepartmentAsync(id);
            if (!result)    
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Department not found or could not be deleted", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Department deleted successfully"));
        }
    } 
}
