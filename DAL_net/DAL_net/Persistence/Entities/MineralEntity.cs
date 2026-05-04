namespace DAL_net.Persistence.Entities;

public class MineralEntity
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? ChemicalFormula { get; set; }

    public int MineralClassId { get; set; }

    public int? SilicateStructureId { get; set; }

    public string? Description { get; set; }

    public string? CommonUse { get; set; }

    public MineralClassEntity MineralClass { get; set; } = null!;

    public SilicateStructureEntity? SilicateStructure { get; set; }

    public MineralCharacteristicEntity? Characteristic { get; set; }

    public ICollection<RockMineralCompositionEntity> RockCompositions { get; set; } = new List<RockMineralCompositionEntity>();
}
