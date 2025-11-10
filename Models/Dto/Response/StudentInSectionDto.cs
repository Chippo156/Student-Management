public class StudentInSectionDto
{
    public int StudentId { get; set; }
    public string MSSV { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    
    // Class information
    public string ClassName { get; set; } = string.Empty;
    public string ClassCode { get; set; } = string.Empty;
    public string ProgramName { get; set; } = string.Empty;
    
    // Enrollment information
    public DateTime EnrollmentDate { get; set; }
    public string EnrollmentStatus { get; set; } = string.Empty;
    
    // Practice Group information
    public string PracticeGroupName { get; set; } = string.Empty;
    
    // Academic information
    public double? FinalScore { get; set; }
    public string? GradeLetter { get; set; }
    
    // Additional information
    public string? AvatarUrl { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string AccountStatus { get; set; } = string.Empty;
}