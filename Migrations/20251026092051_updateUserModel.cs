using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class updateUserModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Address",
                table: "FamilyRelationships",
                newName: "PermanentAddress");

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "BirthCertDistrict",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BirthCertProvince",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BirthCertWard",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BirthDistrict",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BirthProvince",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BirthWard",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Ethnicity",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HealthInsuranceNumber",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HealthInsuranceRegistrationPlace",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HometownDistrict",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HometownProvince",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HometownWard",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nationality",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PermanentDistrict",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PermanentProvince",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PermanentWard",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TemporaryAddress",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DetailAddress",
                table: "FamilyRelationships",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "District",
                table: "FamilyRelationships",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeceased",
                table: "FamilyRelationships",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsHouseholder",
                table: "FamilyRelationships",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Province",
                table: "FamilyRelationships",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Ward",
                table: "FamilyRelationships",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BirthCertDistrict",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BirthCertProvince",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BirthCertWard",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BirthDistrict",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BirthProvince",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BirthWard",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Ethnicity",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "HealthInsuranceNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "HealthInsuranceRegistrationPlace",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "HometownDistrict",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "HometownProvince",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "HometownWard",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Nationality",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PermanentDistrict",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PermanentProvince",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PermanentWard",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TemporaryAddress",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DetailAddress",
                table: "FamilyRelationships");

            migrationBuilder.DropColumn(
                name: "District",
                table: "FamilyRelationships");

            migrationBuilder.DropColumn(
                name: "IsDeceased",
                table: "FamilyRelationships");

            migrationBuilder.DropColumn(
                name: "IsHouseholder",
                table: "FamilyRelationships");

            migrationBuilder.DropColumn(
                name: "Province",
                table: "FamilyRelationships");

            migrationBuilder.DropColumn(
                name: "Ward",
                table: "FamilyRelationships");

            migrationBuilder.RenameColumn(
                name: "PermanentAddress",
                table: "FamilyRelationships",
                newName: "Address");

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}
