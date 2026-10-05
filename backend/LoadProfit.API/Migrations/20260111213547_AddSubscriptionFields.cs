using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoadProfit.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StripeCustomerId",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeSubscriptionId",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubscriptionExpiresAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SubscriptionTier",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StripeCustomerId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "StripeSubscriptionId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SubscriptionExpiresAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SubscriptionTier",
                table: "Users");
        }
    }
}
