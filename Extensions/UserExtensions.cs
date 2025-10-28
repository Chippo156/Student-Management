using StudentManagement.Models;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Extensions
{
    public static class UserExtensions
    {
        public static UserResponse ToUserResponse(this User user)
        {
            var defaultBankAccount = user.BankAccounts?.FirstOrDefault(ba => ba.IsDefault == true);
            
            return new UserResponse
            {
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                Phone = user.Phone ?? string.Empty,
                Address = user.Address ?? string.Empty,
                TemporaryAddress = user.TemporaryAddress,
                AvatarUrl = user.AvatarUrl,
                Gender = user.Gender,
                PlaceOfBirth = user.PlaceOfBirth,
                Religion = user.Religion,
                DateOfBirth = user.DateOfBirth,
                CitizenIdCard = user.CitizenIdCard ?? string.Empty,
                IssuedDate = user.IssuedDate,
                IssuedPlace = user.IssuedPlace ?? string.Empty,
                Object = user.Object ?? string.Empty,
                PolicyArea = user.PolicyArea,
                DateOfJoinUnion = user.DateOfJoinUnion,
                DateOfJoinParty = user.DateOfJoinParty,
                Ethnicity = user.Ethnicity,
                Nationality = user.Nationality,
                HometownProvince = user.HometownProvince,
                HometownDistrict = user.HometownDistrict,
                HometownWard = user.HometownWard,
                BirthProvince = user.BirthProvince,
                BirthDistrict = user.BirthDistrict,
                BirthWard = user.BirthWard,
                BirthCertProvince = user.BirthCertProvince,
                BirthCertDistrict = user.BirthCertDistrict,
                BirthCertWard = user.BirthCertWard,
                PermanentProvince = user.PermanentProvince,
                PermanentDistrict = user.PermanentDistrict,
                PermanentWard = user.PermanentWard,
                HealthInsuranceNumber = user.HealthInsuranceNumber,
                HealthInsuranceRegistrationPlace = user.HealthInsuranceRegistrationPlace,
                AccountStatus = user.AccountStatus,
                Role = user.Role,
            };
        }
    }
}