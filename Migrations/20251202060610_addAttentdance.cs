using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class addAttentdance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AllowSelfCheckIn",
                table: "AttendanceSessions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CheckInCode",
                table: "AttendanceSessions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SelfCheckInEndTime",
                table: "AttendanceSessions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SelfCheckInStartTime",
                table: "AttendanceSessions",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowSelfCheckIn",
                table: "AttendanceSessions");

            migrationBuilder.DropColumn(
                name: "CheckInCode",
                table: "AttendanceSessions");

            migrationBuilder.DropColumn(
                name: "SelfCheckInEndTime",
                table: "AttendanceSessions");

            migrationBuilder.DropColumn(
                name: "SelfCheckInStartTime",
                table: "AttendanceSessions");
        }
    }
}
