using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IBankAccountService
    {
        Task<BankAccount> CreateBankAccountAsync(BankAccountRequest request);
        Task<BankAccount?> UpdateBankAccountAsync(int bankAccountId, BankAccountRequest request);
        Task<bool> DeleteBankAccountAsync(int bankAccountId);
        Task<BankAccountResponse?> GetBankAccountByIdAsync(int bankAccountId);
        Task<IEnumerable<BankAccountResponse>> GetBankAccountsByUserIdAsync(int userId);
        Task<BankAccountResponse?> GetDefaultBankAccountByUserIdAsync(int userId);
        Task<bool> SetDefaultBankAccountAsync(int userId, int bankAccountId);
    }
}