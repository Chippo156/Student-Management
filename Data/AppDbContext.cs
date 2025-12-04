using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using StudentManagement.Models;
using File = StudentManagement.Models.File;

namespace StudentManagement.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<Permission> Permissions { get; set; } = null!;
        public DbSet<Lecturer> Lecturers { get; set; } = null!;
        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<Student> Students { get; set; } = null!;
        public DbSet<Class> Classes { get; set; } = null!;
        public DbSet<AdviserAssignment> AdviserAssignments { get; set; } = null!;
        public DbSet<Course> Courses { get; set; } = null!;
        public DbSet<Section> Sections { get; set; } = null!;
        public DbSet<Enrollment> Enrollments { get; set; } = null!;
        public DbSet<Grade> Grades { get; set; } = null!;
        public DbSet<Announcement> Announcements { get; set; } = null!;
        public DbSet<CurriculumCourse> CurriculumCourses { get; set; } = null!;
        public DbSet<DocumentRequest> DocumentRequests { get; set; } = null!;
        public DbSet<DocumentType> DocumentTypes { get; set; } = null!;
        public DbSet<File> Files { get; set; } = null!;
        public DbSet<FinalResult> FinalResults { get; set; } = null!;
        public DbSet<GeneratedDocument> GeneratedDocuments { get; set; } = null!;
        public DbSet<GpaSnapshot> GpaSnapshots { get; set; } = null!;
        public DbSet<Notification> notifications { get; set; } = null!;
        public DbSet<Prerequisite> Prerequisites { get; set; } = null!;
        public DbSet<Schedule> Schedules { get; set; } = null!;
        public DbSet<Semester> Semesters { get; set; } = null!;
        public DbSet<Faculty> Falcuties { get; set; } = null!;
        public DbSet<AcademicProgram> Programs { get; set; } = null!;
        public DbSet<Assessment> Assessment { get; set; } = null!;
        public DbSet<ScheduleType> ScheduleTypes { get; set; } = null!;
        public DbSet<AssessmentType> AssessmentTypes { get; set; } = null!;
        public DbSet<RegistrationPeriod> RegistrationPeriods { get; set; } = null!;
        public DbSet<BankAccount> BankAccounts { get; set; } = null!;
        public DbSet<FamilyRelationship> FamilyRelationships { get; set; } = null!;
        public DbSet<PracticeGroup> PracticeGroups { get; set; } = null!;
        public DbSet<PracticeGroupEnrollment> PracticeGroupEnrollments { get; set; } = null!;
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<AttendanceSession> AttendanceSessions { get; set; }
        public DbSet<ChatRoom> ChatRooms { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ChatRoomParticipant> ChatRoomParticipants { get; set; }
        public DbSet<TuitionFee> TuitionFees { get; set; }
        public DbSet<TuitionPayment> TuitionPayments { get; set; }
        public DbSet<TuitionFeeDetail> TuitionFeeDetails { get; set; }
        public DbSet<OtpVerification> OtpVerifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // TuitionFee configurations
            modelBuilder.Entity<TuitionFee>(entity =>
            {
                entity.HasKey(e => e.TuitionFeeId);
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.PaidAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.RemainingAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.LateFee).HasColumnType("decimal(18,2)");

                entity.HasOne(e => e.Student)
                    .WithMany()
                    .HasForeignKey(e => e.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Semester)
                    .WithMany()
                    .HasForeignKey(e => e.SemesterId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Unique constraint: one tuition fee per student per semester
                entity.HasIndex(e => new { e.StudentId, e.SemesterId }).IsUnique();
            });

            // TuitionPayment configurations
            modelBuilder.Entity<TuitionPayment>(entity =>
            {
                entity.HasKey(e => e.PaymentId);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");

                entity.HasOne(e => e.TuitionFee)
                    .WithMany(tf => tf.Payments)
                    .HasForeignKey(e => e.TuitionFeeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.ProcessedBy)
                    .WithMany()
                    .HasForeignKey(e => e.ProcessedByUserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // TuitionFeeDetail configurations
            modelBuilder.Entity<TuitionFeeDetail>(entity =>
            {
                entity.HasKey(e => e.DetailId);
                entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");

                entity.HasOne(e => e.TuitionFee)
                    .WithMany(tf => tf.Details)
                    .HasForeignKey(e => e.TuitionFeeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Section)
                    .WithMany()
                    .HasForeignKey(e => e.SectionId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
