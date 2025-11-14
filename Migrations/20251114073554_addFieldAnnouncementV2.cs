using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class addFieldAnnouncementV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Announcements",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiryDate",
                table: "Announcements",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Announcements",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "Announcements",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TargetDepartmentId",
                table: "Announcements",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TargetType",
                table: "Announcements",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TargetYear",
                table: "Announcements",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Announcements",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Announcements_CreatedByUserId",
                table: "Announcements",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Announcements_TargetDepartmentId",
                table: "Announcements",
                column: "TargetDepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Announcements_Departments_TargetDepartmentId",
                table: "Announcements",
                column: "TargetDepartmentId",
                principalTable: "Departments",
                principalColumn: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Announcements_Users_CreatedByUserId",
                table: "Announcements",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Announcements_Departments_TargetDepartmentId",
                table: "Announcements");

            migrationBuilder.DropForeignKey(
                name: "FK_Announcements_Users_CreatedByUserId",
                table: "Announcements");

            migrationBuilder.DropIndex(
                name: "IX_Announcements_CreatedByUserId",
                table: "Announcements");

            migrationBuilder.DropIndex(
                name: "IX_Announcements_TargetDepartmentId",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "ExpiryDate",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "TargetDepartmentId",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "TargetType",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "TargetYear",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Announcements");
        }
    }
}
