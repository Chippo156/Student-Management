using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class addAssessmentType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssessmentTypeId",
                table: "Assessment",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "AssessmentType",
                columns: table => new
                {
                    AssessmentTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DefaultWeight = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssessmentType", x => x.AssessmentTypeId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Assessment_AssessmentTypeId",
                table: "Assessment",
                column: "AssessmentTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Assessment_AssessmentType_AssessmentTypeId",
                table: "Assessment",
                column: "AssessmentTypeId",
                principalTable: "AssessmentType",
                principalColumn: "AssessmentTypeId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assessment_AssessmentType_AssessmentTypeId",
                table: "Assessment");

            migrationBuilder.DropTable(
                name: "AssessmentType");

            migrationBuilder.DropIndex(
                name: "IX_Assessment_AssessmentTypeId",
                table: "Assessment");

            migrationBuilder.DropColumn(
                name: "AssessmentTypeId",
                table: "Assessment");
        }
    }
}
