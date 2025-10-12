using Microsoft.EntityFrameworkCore;

namespace StudentManagement.Models.Embed
{
    [Owned]
    public class Personaldentifer
    {
        public string CitizenIdCard { get; set; } = string.Empty;
        public DateOnly IssuedDate { get; set; }
        public string Object { get; set; } = string.Empty;
        public string? PolicyArea { get; set; }
        public DateOnly DateOfJoinUnion { get; set; }
        public DateOnly DateOfJoinParty { get; set; }
    }
}
