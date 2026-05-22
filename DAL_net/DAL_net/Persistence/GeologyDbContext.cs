using DAL_net.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace DAL_net.Persistence;

public class GeologyDbContext : DbContext
{
    public GeologyDbContext(DbContextOptions<GeologyDbContext> options)
        : base(options)
    {
    }

    public DbSet<RockTypeEntity> RockTypes => Set<RockTypeEntity>();

    public DbSet<RockSubtypeEntity> RockSubtypes => Set<RockSubtypeEntity>();

    public DbSet<RockEntity> Rocks => Set<RockEntity>();

    public DbSet<SilicateStructureEntity> SilicateStructures => Set<SilicateStructureEntity>();

    public DbSet<MineralClassEntity> MineralClasses => Set<MineralClassEntity>();

    public DbSet<MineralEntity> Minerals => Set<MineralEntity>();

    public DbSet<MineralCharacteristicEntity> MineralCharacteristics => Set<MineralCharacteristicEntity>();

    public DbSet<RockMineralCompositionEntity> RockMineralCompositions => Set<RockMineralCompositionEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<RockTypeEntity>(entity =>
        {
            entity.ToTable("rock_types");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            entity.Property(x => x.Description).HasColumnName("description");
            entity.Property(x => x.OriginNote).HasColumnName("origin_note");
            entity.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<RockSubtypeEntity>(entity =>
        {
            entity.ToTable("rock_subtypes");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.RockTypeId).HasColumnName("rock_type_id").IsRequired();
            entity.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            entity.Property(x => x.FormationNote).HasColumnName("formation_note");

            entity.HasIndex(x => x.RockTypeId).HasDatabaseName("idx_rock_subtypes_type");
            entity.HasIndex(x => new { x.RockTypeId, x.Name }).IsUnique();

            entity.HasOne(x => x.RockType)
                .WithMany(x => x.Subtypes)
                .HasForeignKey(x => x.RockTypeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RockEntity>(entity =>
        {
            entity.ToTable("rocks");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.SubtypeId).HasColumnName("subtype_id").IsRequired();
            entity.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            entity.Property(x => x.Description).HasColumnName("description");
            entity.Property(x => x.NotableNote).HasColumnName("notable_note");

            entity.HasIndex(x => x.Name).IsUnique();
            entity.HasIndex(x => x.SubtypeId).HasDatabaseName("idx_rocks_subtype");

            entity.HasOne(x => x.Subtype)
                .WithMany(x => x.Rocks)
                .HasForeignKey(x => x.SubtypeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SilicateStructureEntity>(entity =>
        {
            entity.ToTable("silicate_structures");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            entity.Property(x => x.IupacName).HasColumnName("iupac_name").HasMaxLength(100);
            entity.Property(x => x.StructureDesc).HasColumnName("structure_desc");
            entity.Property(x => x.Analogy).HasColumnName("analogy");

            entity.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<MineralClassEntity>(entity =>
        {
            entity.ToTable("mineral_classes");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            entity.Property(x => x.ChemicalNote).HasColumnName("chemical_note");
            entity.Property(x => x.Analogy).HasColumnName("analogy");

            entity.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<MineralEntity>(entity =>
        {
            entity.ToTable("minerals");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            entity.Property(x => x.ChemicalFormula).HasColumnName("chemical_formula").HasMaxLength(100);
            entity.Property(x => x.MineralClassId).HasColumnName("mineral_class_id").IsRequired();
            entity.Property(x => x.SilicateStructureId).HasColumnName("silicate_structure_id");
            entity.Property(x => x.Description).HasColumnName("description");
            entity.Property(x => x.CommonUse).HasColumnName("common_use");

            entity.HasIndex(x => x.Name).IsUnique();
            entity.HasIndex(x => x.MineralClassId).HasDatabaseName("idx_minerals_class");
            entity.HasIndex(x => x.SilicateStructureId).HasDatabaseName("idx_minerals_silicate");

            entity.HasOne(x => x.MineralClass)
                .WithMany(x => x.Minerals)
                .HasForeignKey(x => x.MineralClassId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.SilicateStructure)
                .WithMany(x => x.Minerals)
                .HasForeignKey(x => x.SilicateStructureId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<MineralCharacteristicEntity>(entity =>
        {
            entity.ToTable("mineral_characteristics");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.MineralId).HasColumnName("mineral_id").IsRequired();
            entity.Property(x => x.Luster).HasColumnName("luster").HasMaxLength(100);
            entity.Property(x => x.Color).HasColumnName("color").HasMaxLength(200);
            entity.Property(x => x.Streak).HasColumnName("streak").HasMaxLength(100);
            entity.Property(x => x.Transparency).HasColumnName("transparency").HasMaxLength(80);
            entity.Property(x => x.HardnessMohs).HasColumnName("hardness_mohs").HasPrecision(3, 1);
            entity.Property(x => x.Cleavage).HasColumnName("cleavage").HasMaxLength(200);
            entity.Property(x => x.Fracture).HasColumnName("fracture").HasMaxLength(100);
            entity.Property(x => x.Tenacity).HasColumnName("tenacity").HasMaxLength(100);
            entity.Property(x => x.SpecificGravity).HasColumnName("specific_gravity").HasPrecision(5, 2);
            entity.Property(x => x.Magnetism).HasColumnName("magnetism").HasDefaultValue(false);
            entity.Property(x => x.Morphology).HasColumnName("morphology");
            entity.Property(x => x.Paragenesis).HasColumnName("paragenesis");
            entity.Property(x => x.SpecialProperties).HasColumnName("special_properties");
            entity.Property(x => x.Notes).HasColumnName("notes");
            entity.Property(x => x.ImageData).HasColumnName("image_data");
            entity.Property(x => x.ImageContentType).HasColumnName("image_content_type").HasMaxLength(100);

            entity.HasIndex(x => x.MineralId).HasDatabaseName("idx_mineral_char_mineral");
            entity.HasIndex(x => x.MineralId).IsUnique();

            entity.HasOne(x => x.Mineral)
                .WithOne(x => x.Characteristic)
                .HasForeignKey<MineralCharacteristicEntity>(x => x.MineralId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RockMineralCompositionEntity>(entity =>
        {
            entity.ToTable("rock_mineral_composition");
            entity.ToTable(t =>
                t.HasCheckConstraint("CK_rock_mineral_composition_abundance", "abundance IN ('major', 'minor', 'trace')"));
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.RockId).HasColumnName("rock_id").IsRequired();
            entity.Property(x => x.MineralId).HasColumnName("mineral_id").IsRequired();
            entity.Property(x => x.Abundance).HasColumnName("abundance").HasMaxLength(50);
            entity.Property(x => x.Notes).HasColumnName("notes");

            entity.HasIndex(x => x.RockId).HasDatabaseName("idx_rmc_rock");
            entity.HasIndex(x => x.MineralId).HasDatabaseName("idx_rmc_mineral");
            entity.HasIndex(x => new { x.RockId, x.MineralId }).IsUnique();

            entity.HasOne(x => x.Rock)
                .WithMany(x => x.MineralCompositions)
                .HasForeignKey(x => x.RockId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Mineral)
                .WithMany(x => x.RockCompositions)
                .HasForeignKey(x => x.MineralId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
