namespace StudentManagement.Enum
{
    public enum MessageType
    {
        Text = 1,
        Image = 2,
        File = 3,
        System = 4
    }

    public enum ParticipantRole
    {
        Lecturer = 1,    // Giảng viên chính
        Student = 2,     // Sinh viên
        Assistant = 3    // Trợ giảng (nếu cần)
    }
}