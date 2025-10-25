using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class updateSection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sections_Courses_CourseId",
                table: "Sections");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "Sections",
                newName: "CurriculumCourseId");

            migrationBuilder.RenameIndex(
                name: "IX_Sections_CourseId",
                table: "Sections",
                newName: "IX_Sections_CurriculumCourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Sections_CurriculumCourses_CurriculumCourseId",
                table: "Sections",
                column: "CurriculumCourseId",
                principalTable: "CurriculumCourses",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sections_CurriculumCourses_CurriculumCourseId",
                table: "Sections");

            migrationBuilder.RenameColumn(
                name: "CurriculumCourseId",
                table: "Sections",
                newName: "CourseId");

            migrationBuilder.RenameIndex(
                name: "IX_Sections_CurriculumCourseId",
                table: "Sections",
                newName: "IX_Sections_CourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Sections_Courses_CourseId",
                table: "Sections",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "CourseId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
