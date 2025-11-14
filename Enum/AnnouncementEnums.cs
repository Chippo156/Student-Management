namespace StudentManagement.Enum
{
    public enum AnnouncementPriority
    {
        Low = 1,        // Thấp
        Normal = 2,     // Bình thường
        High = 3,       // Cao
        Urgent = 4      // Khẩn cấp
    }

    public enum AnnouncementType
    {
        General = 1,    // Thông báo chung
        Academic = 2,   // Học tập
        Event = 3,      // Sự kiện
        Tuition = 4,    // Học phí
        Emergency = 5   // Khẩn cấp
    }

    public enum AnnouncementTargetType
    {
        All = 1,           // Tất cả
        Students = 2,      // Sinh viên
        Lecturers = 3,     // Giảng viên
        Department = 4,    // Theo khoa
        AcademicYear = 5   // Theo năm học
    }
}