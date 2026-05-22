using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DAL_net.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMineralImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "image_data",
                table: "mineral_characteristics",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "image_content_type",
                table: "mineral_characteristics",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "image_data",
                table: "mineral_characteristics");

            migrationBuilder.DropColumn(
                name: "image_content_type",
                table: "mineral_characteristics");
        }
    }
}
