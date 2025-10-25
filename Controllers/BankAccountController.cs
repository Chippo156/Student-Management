using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BankAccountController(IBankAccountService bankAccountService) : BaseController
    {
        [HttpGet("user/GetBankAccountsByUser")]
        public async Task<IActionResult> GetBankAccountsByUserId()
        {
            var (isValid, errorResult, userId) = GetAuthenticatedUserId();
            if (!isValid)
                return errorResult!;
            var bankAccounts = await bankAccountService.GetBankAccountsByUserIdAsync(userId);
            return Ok(ApiResponse.SuccessResponse(bankAccounts, "Bank accounts retrieved successfully"));
        }

        [HttpGet("user/{userId}/GetDefaultBankAccount")]
        public async Task<IActionResult> GetDefaultBankAccount(int userId)
        {
            var defaultAccount = await bankAccountService.GetDefaultBankAccountByUserIdAsync(userId);
            if (defaultAccount == null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "No default bank account found for this user.", null));
            }
            return Ok(ApiResponse.SuccessResponse(defaultAccount, "Default bank account retrieved successfully"));
        }

        [HttpPost("user/CreateBankAccount")]
        public async Task<IActionResult> CreateBankAccount(BankAccountRequest request)
        {
            try
            {
                var createdAccount = await bankAccountService.CreateBankAccountAsync(request);
                return Ok(ApiResponse.SuccessResponse(createdAccount, "Bank account created successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPut("user/UpdateBankAccount/{id}")]
        public async Task<IActionResult> UpdateBankAccount(int id, BankAccountRequest request)
        {
            try
            {
                var updatedAccount = await bankAccountService.UpdateBankAccountAsync(id, request);
                if (updatedAccount == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Bank account with ID {id} not found.", null));
                }
                return Ok(ApiResponse.SuccessResponse(updatedAccount, "Bank account updated successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBankAccount(int id)
        {
            var isDeleted = await bankAccountService.DeleteBankAccountAsync(id);
            if (!isDeleted)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Bank account with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Bank account deleted successfully"));
        }

        [HttpPut("user/{userId}/set-default/{bankAccountId}")]
        public async Task<IActionResult> SetDefaultBankAccount(int userId, int bankAccountId)
        {
            var isUpdated = await bankAccountService.SetDefaultBankAccountAsync(userId, bankAccountId);
            if (!isUpdated)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Bank account not found or doesn't belong to this user.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Default bank account updated successfully"));
        }
    }
}