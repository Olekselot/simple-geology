using DAL_net.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DAL_net.Persistence.Migrations
{
    [DbContext(typeof(GeologyDbContext))]
    [Migration("20260511183000_AddTopLevelCategories")]
    public partial class AddTopLevelCategories : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                CREATE TABLE top_level_categories (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL UNIQUE,
                    source_table REGCLASS NOT NULL UNIQUE,
                    has_items BOOLEAN NOT NULL DEFAULT FALSE
                );

                CREATE OR REPLACE FUNCTION refresh_top_level_categories_has_items()
                RETURNS void
                LANGUAGE plpgsql
                AS $$
                DECLARE
                    category_record RECORD;
                    has_rows BOOLEAN;
                BEGIN
                    FOR category_record IN
                        SELECT id, source_table::text AS source_table_name
                        FROM top_level_categories
                    LOOP
                        EXECUTE format('SELECT EXISTS (SELECT 1 FROM %s)', category_record.source_table_name)
                        INTO has_rows;

                        UPDATE top_level_categories
                        SET has_items = has_rows
                        WHERE id = category_record.id;
                    END LOOP;
                END;
                $$;

                INSERT INTO top_level_categories (name, source_table) VALUES
                    ('Гірські породи', 'rock_types'),
                    ('Силікати', 'silicate_structures'),
                    ('Мінерали', 'minerals');

                SELECT refresh_top_level_categories_has_items();
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DROP FUNCTION IF EXISTS refresh_top_level_categories_has_items();
                DROP TABLE IF EXISTS top_level_categories;
                """);
        }
    }
}
