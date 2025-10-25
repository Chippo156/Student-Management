using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class updateSectionVer2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EnrolledCount",
                table: "Sections",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EnrolledCount",
                table: "Sections");
        }
    }
}
