using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoadProfit.API.Migrations
{
    /// <inheritdoc />
    public partial class AddExpenseFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DispatchFeePercent",
                table: "Loads",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "FactoringFeePercent",
                table: "Loads",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TrailerPayment",
                table: "Loads",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TruckPayment",
                table: "Loads",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DispatchFeePercent",
                table: "Loads");

            migrationBuilder.DropColumn(
                name: "FactoringFeePercent",
                table: "Loads");

            migrationBuilder.DropColumn(
                name: "TrailerPayment",
                table: "Loads");

            migrationBuilder.DropColumn(
                name: "TruckPayment",
                table: "Loads");
        }
    }
}
