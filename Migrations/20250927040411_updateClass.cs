using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class updateClass : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AdviserAssignments_Classes_ClassId",
                table: "AdviserAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_Announcements_Users_CreatedByUserId",
                table: "Announcements");

            migrationBuilder.DropForeignKey(
                name: "FK_Departments_Faculty_FacultyId",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Announcements_CreatedByUserId",
                table: "Announcements");

            migrationBuilder.DropIndex(
                name: "IX_AdviserAssignments_ClassId",
                table: "AdviserAssignments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Faculty",
                table: "Faculty");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "ClassId",
                table: "AdviserAssignments");

            migrationBuilder.RenameTable(
                name: "Faculty",
                newName: "Falcuties");

            migrationBuilder.AddColumn<int>(
                name: "AdviserAssignmentId",
                table: "Classes",
                type: "int",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Falcuties",
                table: "Falcuties",
                column: "FacultyId");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_AdviserAssignmentId",
                table: "Classes",
                column: "AdviserAssignmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_AdviserAssignments_AdviserAssignmentId",
                table: "Classes",
                column: "AdviserAssignmentId",
                principalTable: "AdviserAssignments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_Falcuties_FacultyId",
                table: "Departments",
                column: "FacultyId",
                principalTable: "Falcuties",
                principalColumn: "FacultyId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Classes_AdviserAssignments_AdviserAssignmentId",
                table: "Classes");

            migrationBuilder.DropForeignKey(
                name: "FK_Departments_Falcuties_FacultyId",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Classes_AdviserAssignmentId",
                table: "Classes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Falcuties",
                table: "Falcuties");

            migrationBuilder.DropColumn(
                name: "AdviserAssignmentId",
                table: "Classes");

            migrationBuilder.RenameTable(
                name: "Falcuties",
                newName: "Faculty");

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Announcements",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ClassId",
                table: "AdviserAssignments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Faculty",
                table: "Faculty",
                column: "FacultyId");

            migrationBuilder.CreateIndex(
                name: "IX_Announcements_CreatedByUserId",
                table: "Announcements",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AdviserAssignments_ClassId",
                table: "AdviserAssignments",
                column: "ClassId");

            migrationBuilder.AddForeignKey(
                name: "FK_AdviserAssignments_Classes_ClassId",
                table: "AdviserAssignments",
                column: "ClassId",
                principalTable: "Classes",
                principalColumn: "ClassId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Announcements_Users_CreatedByUserId",
                table: "Announcements",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_Faculty_FacultyId",
                table: "Departments",
                column: "FacultyId",
                principalTable: "Faculty",
                principalColumn: "FacultyId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
