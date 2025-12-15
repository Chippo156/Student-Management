using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class addLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AllowedDistanceMeters",
                table: "AttendanceSessions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "AttendanceSessions",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "AttendanceSessions",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequireLocationVerification",
                table: "AttendanceSessions",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowedDistanceMeters",
                table: "AttendanceSessions");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "AttendanceSessions");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "AttendanceSessions");

            migrationBuilder.DropColumn(
                name: "RequireLocationVerification",
                table: "AttendanceSessions");
        }
    }
}
