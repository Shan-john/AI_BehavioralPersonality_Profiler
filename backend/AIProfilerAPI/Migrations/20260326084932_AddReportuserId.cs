using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIProfilerAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddReportuserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "log",
                table: "Reports",
                newName: "data");

            migrationBuilder.AddColumn<int>(
                name: "userId",
                table: "Reports",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "userId",
                table: "Reports");

            migrationBuilder.RenameColumn(
                name: "data",
                table: "Reports",
                newName: "log");
        }
    }
}
