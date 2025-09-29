using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assessment_AssessmentType_AssessmentTypeId",
                table: "Assessment");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AssessmentType",
                table: "AssessmentType");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "Schedules");

            migrationBuilder.RenameTable(
                name: "AssessmentType",
                newName: "AssessmentTypes");

            migrationBuilder.AlterColumn<int>(
                name: "DayOfWeek",
                table: "Schedules",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<DateOnly>(
                name: "Date",
                table: "Schedules",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OnlineLink",
                table: "Schedules",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ScheduleTypeId",
                table: "Schedules",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_AssessmentTypes",
                table: "AssessmentTypes",
                column: "AssessmentTypeId");

            migrationBuilder.CreateTable(
                name: "ScheduleTypes",
                columns: table => new
                {
                    ScheduleTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduleTypes", x => x.ScheduleTypeId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_ScheduleTypeId",
                table: "Schedules",
                column: "ScheduleTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Assessment_AssessmentTypes_AssessmentTypeId",
                table: "Assessment",
                column: "AssessmentTypeId",
                principalTable: "AssessmentTypes",
                principalColumn: "AssessmentTypeId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Schedules_ScheduleTypes_ScheduleTypeId",
                table: "Schedules",
                column: "ScheduleTypeId",
                principalTable: "ScheduleTypes",
                principalColumn: "ScheduleTypeId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assessment_AssessmentTypes_AssessmentTypeId",
                table: "Assessment");

            migrationBuilder.DropForeignKey(
                name: "FK_Schedules_ScheduleTypes_ScheduleTypeId",
                table: "Schedules");

            migrationBuilder.DropTable(
                name: "ScheduleTypes");

            migrationBuilder.DropIndex(
                name: "IX_Schedules_ScheduleTypeId",
                table: "Schedules");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AssessmentTypes",
                table: "AssessmentTypes");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "OnlineLink",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "ScheduleTypeId",
                table: "Schedules");

            migrationBuilder.RenameTable(
                name: "AssessmentTypes",
                newName: "AssessmentType");

            migrationBuilder.AlterColumn<int>(
                name: "DayOfWeek",
                table: "Schedules",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "EndDate",
                table: "Schedules",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<DateOnly>(
                name: "StartDate",
                table: "Schedules",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddPrimaryKey(
                name: "PK_AssessmentType",
                table: "AssessmentType",
                column: "AssessmentTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Assessment_AssessmentType_AssessmentTypeId",
                table: "Assessment",
                column: "AssessmentTypeId",
                principalTable: "AssessmentType",
                principalColumn: "AssessmentTypeId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
