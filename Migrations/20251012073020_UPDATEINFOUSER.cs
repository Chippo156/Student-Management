using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Migrations
{
    /// <inheritdoc />
    public partial class UPDATEINFOUSER : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TrainningLevel",
                table: "Students");

            migrationBuilder.AddColumn<string>(
                name: "BankAccount_AccountHolderName",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccount_AccountNumber",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccount_BankName",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccount_Branch",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "DateOfBirth",
                table: "Users",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Personaldentifer_CitizenIdCard",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "Personaldentifer_DateOfJnParty",
                table: "Users",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "Personaldentifer_DateOfJoinUnion",
                table: "Users",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "Personaldentifer_IssuedDate",
                table: "Users",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Personaldentifer_Object",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Personaldentifer_PolicyArea",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Religion",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "DateOfAdmission",
                table: "Students",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StudentStatus",
                table: "Students",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BankAccount_AccountHolderName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BankAccount_AccountNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BankAccount_BankName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BankAccount_Branch",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Personaldentifer_CitizenIdCard",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Personaldentifer_DateOfJnParty",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Personaldentifer_DateOfJoinUnion",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Personaldentifer_IssuedDate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Personaldentifer_Object",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Personaldentifer_PolicyArea",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Religion",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DateOfAdmission",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "StudentStatus",
                table: "Students");

            migrationBuilder.AddColumn<string>(
                name: "TrainningLevel",
                table: "Students",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
