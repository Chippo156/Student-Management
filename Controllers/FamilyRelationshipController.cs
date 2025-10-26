using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FamilyRelationshipController(IFamilyRelationshipService familyRelationshipService) : ControllerBase
    {
        [HttpPost("CreateFamilyRelationship")]
        public async Task<IActionResult> CreateFamilyRelationship(FamilyRelationshipRequest request)
        {
            try
            {
                var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
                if (UserNameStr == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
                }
                var createdRelationship = await familyRelationshipService.CreateFamilyRelationshipAsync(UserNameStr, request);
                return CreatedAtAction(
                    nameof(GetFamilyRelationshipById),
                    new { id = createdRelationship.FamilyRelationshipId },
                    ApiResponse.SuccessResponse(createdRelationship, "Family relationship created successfully")
                );
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPut("UpdateFamilyRelationship/{id}")]
        public async Task<IActionResult> UpdateFamilyRelationship(int id, FamilyRelationshipRequest request)
        {
            try
            {
                var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
                if (UserNameStr == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
                }
                var updatedRelationship = await familyRelationshipService.UpdateFamilyRelationshipAsync(UserNameStr, id, request);
                if (updatedRelationship == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Family relationship with ID {id} not found.", null));
                }
                return Ok(ApiResponse.SuccessResponse(updatedRelationship, "Family relationship updated successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpDelete("DeleteFamilyRelationship/{id}")]
        public async Task<IActionResult> DeleteFamilyRelationship(int id)
        {
            var isDeleted = await familyRelationshipService.DeleteFamilyRelationshipAsync(id);
            if (!isDeleted)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Family relationship with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Family relationship deleted successfully"));
        }

        [HttpGet("GetFamilyRelationshipById/{id}")]
        public async Task<IActionResult> GetFamilyRelationshipById(int id)
        {
            var familyRelationship = await familyRelationshipService.GetFamilyRelationshipByIdAsync(id);
            if (familyRelationship == null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Family relationship with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(familyRelationship, "Family relationship retrieved successfully"));
        }

        [HttpGet("GetFamilyRelationshipsByStudent")]
        public async Task<IActionResult> GetFamilyRelationshipsByStudent()
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }
            var familyRelationships = await familyRelationshipService.GetFamilyRelationshipsByStudentAsync(UserNameStr);
            return Ok(ApiResponse.SuccessResponse(familyRelationships, "Family relationships retrieved successfully"));
        }
    }
}