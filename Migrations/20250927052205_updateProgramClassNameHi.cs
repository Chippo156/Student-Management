using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class updateProgramClassNameHi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Classes_Program_ProgramId",
                table: "Classes");

            migrationBuilder.DropForeignKey(
                name: "FK_CurriculumCourses_Program_ProgramId",
                table: "CurriculumCourses");

            migrationBuilder.DropTable(
                name: "Program");

            migrationBuilder.RenameColumn(
                name: "ProgramId",
                table: "CurriculumCourses",
                newName: "ProgramAcademicProgramId");

            migrationBuilder.RenameIndex(
                name: "IX_CurriculumCourses_ProgramId",
                table: "CurriculumCourses",
                newName: "IX_CurriculumCourses_ProgramAcademicProgramId");

            migrationBuilder.RenameColumn(
                name: "ProgramId",
                table: "Classes",
                newName: "ProgramAcademicProgramId");

            migrationBuilder.RenameIndex(
                name: "IX_Classes_ProgramId",
                table: "Classes",
                newName: "IX_Classes_ProgramAcademicProgramId");

            migrationBuilder.CreateTable(
                name: "Programs",
                columns: table => new
                {
                    AcademicProgramId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProgramName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DegreeLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Programs", x => x.AcademicProgramId);
                    table.ForeignKey(
                        name: "FK_Programs_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "DepartmentId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Programs_DepartmentId",
                table: "Programs",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_Programs_ProgramAcademicProgramId",
                table: "Classes",
                column: "ProgramAcademicProgramId",
                principalTable: "Programs",
                principalColumn: "AcademicProgramId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CurriculumCourses_Programs_ProgramAcademicProgramId",
                table: "CurriculumCourses",
                column: "ProgramAcademicProgramId",
                principalTable: "Programs",
                principalColumn: "AcademicProgramId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Classes_Programs_ProgramAcademicProgramId",
                table: "Classes");

            migrationBuilder.DropForeignKey(
                name: "FK_CurriculumCourses_Programs_ProgramAcademicProgramId",
                table: "CurriculumCourses");

            migrationBuilder.DropTable(
                name: "Programs");

            migrationBuilder.RenameColumn(
                name: "ProgramAcademicProgramId",
                table: "CurriculumCourses",
                newName: "ProgramId");

            migrationBuilder.RenameIndex(
                name: "IX_CurriculumCourses_ProgramAcademicProgramId",
                table: "CurriculumCourses",
                newName: "IX_CurriculumCourses_ProgramId");

            migrationBuilder.RenameColumn(
                name: "ProgramAcademicProgramId",
                table: "Classes",
                newName: "ProgramId");

            migrationBuilder.RenameIndex(
                name: "IX_Classes_ProgramAcademicProgramId",
                table: "Classes",
                newName: "IX_Classes_ProgramId");

            migrationBuilder.CreateTable(
                name: "Program",
                columns: table => new
                {
                    ProgramId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    DegreeLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProgramName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Program", x => x.ProgramId);
                    table.ForeignKey(
                        name: "FK_Program_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "DepartmentId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Program_DepartmentId",
                table: "Program",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_Program_ProgramId",
                table: "Classes",
                column: "ProgramId",
                principalTable: "Program",
                principalColumn: "ProgramId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CurriculumCourses_Program_ProgramId",
                table: "CurriculumCourses",
                column: "ProgramId",
                principalTable: "Program",
                principalColumn: "ProgramId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
