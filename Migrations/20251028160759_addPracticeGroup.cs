using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class addPracticeGroup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PracticeGroupId",
                table: "Schedules",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PracticeGroups",
                columns: table => new
                {
                    PracticeGroupId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaxCapacity = table.Column<int>(type: "int", nullable: false),
                    CurrentCount = table.Column<int>(type: "int", nullable: false),
                    SectionId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeGroups", x => x.PracticeGroupId);
                    table.ForeignKey(
                        name: "FK_PracticeGroups_Sections_SectionId",
                        column: x => x.SectionId,
                        principalTable: "Sections",
                        principalColumn: "SectionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PracticeGroupEnrollments",
                columns: table => new
                {
                    PracticeGroupEnrollmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PracticeGroupId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    EnrolledAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeGroupEnrollments", x => x.PracticeGroupEnrollmentId);
                    table.ForeignKey(
                        name: "FK_PracticeGroupEnrollments_PracticeGroups_PracticeGroupId",
                        column: x => x.PracticeGroupId,
                        principalTable: "PracticeGroups",
                        principalColumn: "PracticeGroupId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PracticeGroupEnrollments_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_PracticeGroupId",
                table: "Schedules",
                column: "PracticeGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeGroupEnrollments_PracticeGroupId",
                table: "PracticeGroupEnrollments",
                column: "PracticeGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeGroupEnrollments_StudentId",
                table: "PracticeGroupEnrollments",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeGroups_SectionId",
                table: "PracticeGroups",
                column: "SectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Schedules_PracticeGroups_PracticeGroupId",
                table: "Schedules",
                column: "PracticeGroupId",
                principalTable: "PracticeGroups",
                principalColumn: "PracticeGroupId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Schedules_PracticeGroups_PracticeGroupId",
                table: "Schedules");

            migrationBuilder.DropTable(
                name: "PracticeGroupEnrollments");

            migrationBuilder.DropTable(
                name: "PracticeGroups");

            migrationBuilder.DropIndex(
                name: "IX_Schedules_PracticeGroupId",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "PracticeGroupId",
                table: "Schedules");
        }
    }
}
