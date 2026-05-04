using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DAL_net.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialGeologySchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "mineral_classes",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    chemical_note = table.Column<string>(type: "text", nullable: true),
                    analogy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mineral_classes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "rock_types",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    origin_note = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rock_types", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "silicate_structures",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    iupac_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    structure_desc = table.Column<string>(type: "text", nullable: true),
                    analogy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_silicate_structures", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "rock_subtypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    rock_type_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    formation_note = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rock_subtypes", x => x.id);
                    table.ForeignKey(
                        name: "FK_rock_subtypes_rock_types_rock_type_id",
                        column: x => x.rock_type_id,
                        principalTable: "rock_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "minerals",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    chemical_formula = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    mineral_class_id = table.Column<int>(type: "integer", nullable: false),
                    silicate_structure_id = table.Column<int>(type: "integer", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    common_use = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_minerals", x => x.id);
                    table.ForeignKey(
                        name: "FK_minerals_mineral_classes_mineral_class_id",
                        column: x => x.mineral_class_id,
                        principalTable: "mineral_classes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_minerals_silicate_structures_silicate_structure_id",
                        column: x => x.silicate_structure_id,
                        principalTable: "silicate_structures",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "rocks",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    subtype_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    notable_note = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rocks", x => x.id);
                    table.ForeignKey(
                        name: "FK_rocks_rock_subtypes_subtype_id",
                        column: x => x.subtype_id,
                        principalTable: "rock_subtypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "mineral_characteristics",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    mineral_id = table.Column<int>(type: "integer", nullable: false),
                    luster = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    color = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    streak = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    transparency = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    hardness_mohs = table.Column<decimal>(type: "numeric(3,1)", precision: 3, scale: 1, nullable: true),
                    cleavage = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    fracture = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    tenacity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    specific_gravity = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    magnetism = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    morphology = table.Column<string>(type: "text", nullable: true),
                    paragenesis = table.Column<string>(type: "text", nullable: true),
                    special_properties = table.Column<string>(type: "text", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mineral_characteristics", x => x.id);
                    table.ForeignKey(
                        name: "FK_mineral_characteristics_minerals_mineral_id",
                        column: x => x.mineral_id,
                        principalTable: "minerals",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "rock_mineral_composition",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    rock_id = table.Column<int>(type: "integer", nullable: false),
                    mineral_id = table.Column<int>(type: "integer", nullable: false),
                    abundance = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rock_mineral_composition", x => x.id);
                    table.CheckConstraint("CK_rock_mineral_composition_abundance", "abundance IN ('major', 'minor', 'trace')");
                    table.ForeignKey(
                        name: "FK_rock_mineral_composition_minerals_mineral_id",
                        column: x => x.mineral_id,
                        principalTable: "minerals",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_rock_mineral_composition_rocks_rock_id",
                        column: x => x.rock_id,
                        principalTable: "rocks",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_mineral_char_mineral",
                table: "mineral_characteristics",
                column: "mineral_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_mineral_classes_name",
                table: "mineral_classes",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_minerals_class",
                table: "minerals",
                column: "mineral_class_id");

            migrationBuilder.CreateIndex(
                name: "idx_minerals_silicate",
                table: "minerals",
                column: "silicate_structure_id");

            migrationBuilder.CreateIndex(
                name: "IX_minerals_name",
                table: "minerals",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_rmc_mineral",
                table: "rock_mineral_composition",
                column: "mineral_id");

            migrationBuilder.CreateIndex(
                name: "idx_rmc_rock",
                table: "rock_mineral_composition",
                column: "rock_id");

            migrationBuilder.CreateIndex(
                name: "IX_rock_mineral_composition_rock_id_mineral_id",
                table: "rock_mineral_composition",
                columns: new[] { "rock_id", "mineral_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_rock_subtypes_type",
                table: "rock_subtypes",
                column: "rock_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_rock_subtypes_rock_type_id_name",
                table: "rock_subtypes",
                columns: new[] { "rock_type_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_rock_types_name",
                table: "rock_types",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_rocks_subtype",
                table: "rocks",
                column: "subtype_id");

            migrationBuilder.CreateIndex(
                name: "IX_rocks_name",
                table: "rocks",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_silicate_structures_name",
                table: "silicate_structures",
                column: "name",
                unique: true);

            migrationBuilder.Sql(
                """
                CREATE OR REPLACE VIEW v_rocks_full AS
                SELECT
                    rt.name         AS rock_type,
                    rst.name        AS rock_subtype,
                    rst.formation_note,
                    r.name          AS rock_name,
                    r.description,
                    r.notable_note
                FROM rocks r
                JOIN rock_subtypes rst ON rst.id = r.subtype_id
                JOIN rock_types rt ON rt.id = rst.rock_type_id
                ORDER BY rt.id, rst.id, r.name;
                """);

            migrationBuilder.Sql(
                """
                CREATE OR REPLACE VIEW v_minerals_full AS
                SELECT
                    m.name                  AS mineral_name,
                    m.chemical_formula,
                    mc.name                 AS mineral_class,
                    ss.name                 AS silicate_structure,
                    ch.hardness_mohs,
                    ch.luster,
                    ch.color,
                    ch.streak,
                    ch.cleavage,
                    ch.morphology,
                    m.common_use
                FROM minerals m
                JOIN mineral_classes mc ON mc.id = m.mineral_class_id
                LEFT JOIN silicate_structures ss ON ss.id = m.silicate_structure_id
                LEFT JOIN mineral_characteristics ch ON ch.mineral_id = m.id
                ORDER BY mc.id, m.name;
                """);

            migrationBuilder.Sql(
                """
                CREATE OR REPLACE VIEW v_rock_composition AS
                SELECT
                    r.name  AS rock,
                    m.name  AS mineral,
                    rmc.abundance,
                    rmc.notes
                FROM rock_mineral_composition rmc
                JOIN rocks r ON r.id = rmc.rock_id
                JOIN minerals m ON m.id = rmc.mineral_id
                ORDER BY r.name, rmc.abundance DESC;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_rock_composition;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_minerals_full;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_rocks_full;");

            migrationBuilder.DropTable(
                name: "mineral_characteristics");

            migrationBuilder.DropTable(
                name: "rock_mineral_composition");

            migrationBuilder.DropTable(
                name: "minerals");

            migrationBuilder.DropTable(
                name: "rocks");

            migrationBuilder.DropTable(
                name: "mineral_classes");

            migrationBuilder.DropTable(
                name: "silicate_structures");

            migrationBuilder.DropTable(
                name: "rock_subtypes");

            migrationBuilder.DropTable(
                name: "rock_types");
        }
    }
}
