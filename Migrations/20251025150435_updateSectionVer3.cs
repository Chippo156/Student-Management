using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class updateSectionVer3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOpen",
                table: "RegistrationPeriods");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Sections",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Sections");

            migrationBuilder.AddColumn<bool>(
                name: "IsOpen",
                table: "RegistrationPeriods",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
