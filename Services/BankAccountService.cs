using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class BankAccountService(AppDbContext context) : IBankAccountService
    {
        public async Task<BankAccount> CreateBankAccountAsync(int userId, BankAccountRequest request)
        {
            var user = await context.Users.FindAsync(userId)
                ?? throw new Exception("User not found");

            // If this is set as default, remove default from other accounts
            if (request.IsDefault)
            {
                await RemoveDefaultFromOtherAccountsAsync(userId);
            }

            var bankAccount = new BankAccount
            {
                User = user,
                AccountNumber = request.AccountNumber,
                BankName = request.BankName,
                BankCode = request.BankCode,
                Branch = request.Branch,
                AccountHolderName = request.AccountHolderName,
                IsDefault = request.IsDefault,
                AccountStatus = Enum.AccountStatus.Active,
                DateCreateAccount = request.DateCreateAccount ?? DateOnly.FromDateTime(DateTime.UtcNow)
            };

            context.BankAccounts.Add(bankAccount);
            await context.SaveChangesAsync();
            return bankAccount;
        }

        public async Task<bool> DeleteBankAccountAsync(int bankAccountId)
        {
            var bankAccount = await context.BankAccounts.FindAsync(bankAccountId);
            if (bankAccount == null)
                return false;

            context.BankAccounts.Remove(bankAccount);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<BankAccountResponse?> GetBankAccountByIdAsync(int bankAccountId)
        {
            var bankAccount = await context.BankAccounts
                .Include(ba => ba.User)
                .FirstOrDefaultAsync(ba => ba.Id == bankAccountId);

            return bankAccount != null ? MapToResponse(bankAccount) : null;
        }

        public async Task<IEnumerable<BankAccountResponse>> GetBankAccountsByUserIdAsync(int userId)
        {
            return await context.BankAccounts
                .Include(ba => ba.User)
                .Where(ba => ba.User.UserId == userId)
                .Select(ba => MapToResponse(ba))
                .ToListAsync();
        }

        public async Task<BankAccountResponse?> GetDefaultBankAccountByUserIdAsync(int userId)
        {
            var defaultAccount = await context.BankAccounts
                .Include(ba => ba.User)
                .FirstOrDefaultAsync(ba => ba.User.UserId == userId && ba.IsDefault == true);

            return defaultAccount != null ? MapToResponse(defaultAccount) : null;
        }

        public async Task<bool> SetDefaultBankAccountAsync(int userId, int bankAccountId)
        {
            // Remove default from all accounts for this user
            await RemoveDefaultFromOtherAccountsAsync(userId);

            // Set the specified account as default
            var bankAccount = await context.BankAccounts
                .FirstOrDefaultAsync(ba => ba.Id == bankAccountId && ba.User.UserId == userId);

            if (bankAccount == null)
                return false;

            bankAccount.IsDefault = true;
            context.BankAccounts.Update(bankAccount);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<BankAccount?> UpdateBankAccountAsync(int bankAccountId, BankAccountRequest request)
        {
            var bankAccount = await context.BankAccounts
                .Include(ba => ba.User)
                .FirstOrDefaultAsync(ba => ba.Id == bankAccountId);

            if (bankAccount == null)
                return null;

            // If this is being set as default, remove default from other accounts
            if (request.IsDefault && bankAccount.IsDefault != true)
            {
                await RemoveDefaultFromOtherAccountsAsync(bankAccount.User.UserId);
            }

            bankAccount.AccountNumber = request.AccountNumber;
            bankAccount.BankName = request.BankName;
            bankAccount.Branch = request.Branch;
            bankAccount.AccountHolderName = request.AccountHolderName;
            bankAccount.IsDefault = request.IsDefault;
            bankAccount.BankCode = request.BankCode;
            bankAccount.DateCreateAccount = request.DateCreateAccount ?? bankAccount.DateCreateAccount;

            context.BankAccounts.Update(bankAccount);
            await context.SaveChangesAsync();
            return bankAccount;
        }

        private async Task RemoveDefaultFromOtherAccountsAsync(int userId)
        {
            var defaultAccounts = await context.BankAccounts
                .Where(ba => ba.User.UserId == userId && ba.IsDefault == true)
                .ToListAsync();

            foreach (var account in defaultAccounts)
            {
                account.IsDefault = false;
            }

            context.BankAccounts.UpdateRange(defaultAccounts);
            await context.SaveChangesAsync();
        }

        private static BankAccountResponse MapToResponse(BankAccount ba)
        {
            return new BankAccountResponse
            {
                Id = ba.Id,
                AccountNumber = ba.AccountNumber,
                BankName = ba.BankName,
                Branch = ba.Branch,
                AccountHolderName = ba.AccountHolderName,
                IsDefault = ba.IsDefault == true,
                UserId = ba.User.UserId
            };
        }
    }
}