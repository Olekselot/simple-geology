using DAL_net.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DAL_net.Persistence.Migrations
{
    [DbContext(typeof(GeologyDbContext))]
    [Migration("20260522210000_ConvertSourceTableToText")]
    public partial class ConvertSourceTableToText : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                ALTER TABLE top_level_categories
                    ALTER COLUMN source_table TYPE TEXT USING source_table::text;
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                ALTER TABLE top_level_categories
                    ALTER COLUMN source_table TYPE REGCLASS USING source_table::regclass;
                """);
        }
    }
}
