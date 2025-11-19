using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class updateLecturer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatRooms_Sections_SectionId",
                table: "ChatRooms");

            migrationBuilder.DropForeignKey(
                name: "FK_Classes_AdviserAssignments_AdviserAssignmentId",
                table: "Classes");

            migrationBuilder.DropIndex(
                name: "IX_Classes_AdviserAssignmentId",
                table: "Classes");

            migrationBuilder.DropIndex(
                name: "IX_ChatRooms_SectionId",
                table: "ChatRooms");

            migrationBuilder.DropColumn(
                name: "AdviserAssignmentId",
                table: "Classes");

            migrationBuilder.RenameColumn(
                name: "SectionId",
                table: "ChatRooms",
                newName: "ChatType");

            migrationBuilder.AlterColumn<string>(
                name: "RoomName",
                table: "ChatRooms",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "ChatRooms",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ClassId",
                table: "ChatRooms",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "ChatRooms",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ClassId",
                table: "AdviserAssignments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ChatRooms_ClassId",
                table: "ChatRooms",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatRooms_DepartmentId",
                table: "ChatRooms",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AdviserAssignments_ClassId",
                table: "AdviserAssignments",
                column: "ClassId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AdviserAssignments_Classes_ClassId",
                table: "AdviserAssignments",
                column: "ClassId",
                principalTable: "Classes",
                principalColumn: "ClassId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ChatRooms_Classes_ClassId",
                table: "ChatRooms",
                column: "ClassId",
                principalTable: "Classes",
                principalColumn: "ClassId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatRooms_Departments_DepartmentId",
                table: "ChatRooms",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "DepartmentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AdviserAssignments_Classes_ClassId",
                table: "AdviserAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_ChatRooms_Classes_ClassId",
                table: "ChatRooms");

            migrationBuilder.DropForeignKey(
                name: "FK_ChatRooms_Departments_DepartmentId",
                table: "ChatRooms");

            migrationBuilder.DropIndex(
                name: "IX_ChatRooms_ClassId",
                table: "ChatRooms");

            migrationBuilder.DropIndex(
                name: "IX_ChatRooms_DepartmentId",
                table: "ChatRooms");

            migrationBuilder.DropIndex(
                name: "IX_AdviserAssignments_ClassId",
                table: "AdviserAssignments");

            migrationBuilder.DropColumn(
                name: "ClassId",
                table: "ChatRooms");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "ChatRooms");

            migrationBuilder.DropColumn(
                name: "ClassId",
                table: "AdviserAssignments");

            migrationBuilder.RenameColumn(
                name: "ChatType",
                table: "ChatRooms",
                newName: "SectionId");

            migrationBuilder.AddColumn<int>(
                name: "AdviserAssignmentId",
                table: "Classes",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RoomName",
                table: "ChatRooms",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "ChatRooms",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Classes_AdviserAssignmentId",
                table: "Classes",
                column: "AdviserAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatRooms_SectionId",
                table: "ChatRooms",
                column: "SectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatRooms_Sections_SectionId",
                table: "ChatRooms",
                column: "SectionId",
                principalTable: "Sections",
                principalColumn: "SectionId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_AdviserAssignments_AdviserAssignmentId",
                table: "Classes",
                column: "AdviserAssignmentId",
                principalTable: "AdviserAssignments",
                principalColumn: "Id");
        }
    }
}
