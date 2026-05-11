using DAL_net.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DAL_net.Persistence.Migrations
{
    [DbContext(typeof(GeologyDbContext))]
    [Migration("20260511191000_UpdateTopLevelCategorySources")]
    public partial class UpdateTopLevelCategorySources : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                UPDATE top_level_categories
                SET source_table = 'mineral_classes'::regclass
                WHERE name = 'Мінерали';

                SELECT refresh_top_level_categories_has_items();
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                UPDATE top_level_categories
                SET source_table = 'minerals'::regclass
                WHERE name = 'Мінерали';

                SELECT refresh_top_level_categories_has_items();
                """);
        }
    }
}