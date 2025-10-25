namespace StudentManagement.Enum
{
    public enum CourseFilterType
    {
        New = 1,        // Courses the student hasn't registered for yet
        Retake = 2,     // Courses the student failed
        Improvement = 3 // Courses the student already passed but wants to improve
    }
}