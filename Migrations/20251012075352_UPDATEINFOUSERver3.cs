using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class UPDATEINFOUSERver3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Personaldentifer_PolicyArea",
                table: "Users",
                newName: "PolicyArea");

            migrationBuilder.RenameColumn(
                name: "Personaldentifer_Object",
                table: "Users",
                newName: "Object");

            migrationBuilder.RenameColumn(
                name: "Personaldentifer_IssuedDate",
                table: "Users",
                newName: "IssuedDate");

            migrationBuilder.RenameColumn(
                name: "Personaldentifer_DateOfJoinUnion",
                table: "Users",
                newName: "DateOfJoinUnion");

            migrationBuilder.RenameColumn(
                name: "Personaldentifer_CitizenIdCard",
                table: "Users",
                newName: "CitizenIdCard");

            migrationBuilder.RenameColumn(
                name: "BankAccount_Branch",
                table: "Users",
                newName: "Branch");

            migrationBuilder.RenameColumn(
                name: "BankAccount_BankName",
                table: "Users",
                newName: "BankName");

            migrationBuilder.RenameColumn(
                name: "BankAccount_AccountNumber",
                table: "Users",
                newName: "AccountNumber");

            migrationBuilder.RenameColumn(
                name: "BankAccount_AccountHolderName",
                table: "Users",
                newName: "AccountHolderName");

            migrationBuilder.RenameColumn(
                name: "Personaldentifer_DateOfJnParty",
                table: "Users",
                newName: "DateOfJoinParty");

            migrationBuilder.AlterColumn<string>(
                name: "RefreshToken",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PolicyArea",
                table: "Users",
                newName: "Personaldentifer_PolicyArea");

            migrationBuilder.RenameColumn(
                name: "Object",
                table: "Users",
                newName: "Personaldentifer_Object");

            migrationBuilder.RenameColumn(
                name: "IssuedDate",
                table: "Users",
                newName: "Personaldentifer_IssuedDate");

            migrationBuilder.RenameColumn(
                name: "DateOfJoinUnion",
                table: "Users",
                newName: "Personaldentifer_DateOfJoinUnion");

            migrationBuilder.RenameColumn(
                name: "CitizenIdCard",
                table: "Users",
                newName: "Personaldentifer_CitizenIdCard");

            migrationBuilder.RenameColumn(
                name: "Branch",
                table: "Users",
                newName: "BankAccount_Branch");

            migrationBuilder.RenameColumn(
                name: "BankName",
                table: "Users",
                newName: "BankAccount_BankName");

            migrationBuilder.RenameColumn(
                name: "AccountNumber",
                table: "Users",
                newName: "BankAccount_AccountNumber");

            migrationBuilder.RenameColumn(
                name: "AccountHolderName",
                table: "Users",
                newName: "BankAccount_AccountHolderName");

            migrationBuilder.RenameColumn(
                name: "DateOfJoinParty",
                table: "Users",
                newName: "Personaldentifer_DateOfJnParty");

            migrationBuilder.AlterColumn<string>(
                name: "RefreshToken",
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
