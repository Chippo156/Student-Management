using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class updateSemester : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Semester",
                table: "Sections");

            migrationBuilder.AddColumn<int>(
                name: "SemesterId",
                table: "Sections",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Sections_SemesterId",
                table: "Sections",
                column: "SemesterId");

            migrationBuilder.AddForeignKey(
                name: "FK_Sections_Semesters_SemesterId",
                table: "Sections",
                column: "SemesterId",
                principalTable: "Semesters",
                principalColumn: "SemesterId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sections_Semesters_SemesterId",
                table: "Sections");

            migrationBuilder.DropIndex(
                name: "IX_Sections_SemesterId",
                table: "Sections");

            migrationBuilder.DropColumn(
                name: "SemesterId",
                table: "Sections");

            migrationBuilder.AddColumn<string>(
                name: "Semester",
                table: "Sections",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
