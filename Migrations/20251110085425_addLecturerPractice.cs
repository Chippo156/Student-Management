using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class addLecturerPractice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LecturerId",
                table: "PracticeGroups",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PracticeGroups_LecturerId",
                table: "PracticeGroups",
                column: "LecturerId");

            migrationBuilder.AddForeignKey(
                name: "FK_PracticeGroups_Lecturers_LecturerId",
                table: "PracticeGroups",
                column: "LecturerId",
                principalTable: "Lecturers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PracticeGroups_Lecturers_LecturerId",
                table: "PracticeGroups");

            migrationBuilder.DropIndex(
                name: "IX_PracticeGroups_LecturerId",
                table: "PracticeGroups");

            migrationBuilder.DropColumn(
                name: "LecturerId",
                table: "PracticeGroups");
        }
    }
}
