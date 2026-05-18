using BLL_net.Abstractions;
using BLL_net.Models;
using DAL_net.Persistence;
using DAL_net.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace DAL_net.Repositories;

public class EfGeologicalObjectRepository : IGeologicalObjectRepository
{
    private readonly GeologyDbContext _dbContext;

    public EfGeologicalObjectRepository(GeologyDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<GeologicalObject>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var rocks = await _dbContext.Rocks
            .AsNoTracking()
            .Include(x => x.Subtype)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return rocks.Select(MapToModel).ToList();
    }

    public async Task<GeologicalObject?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var rock = await _dbContext.Rocks
            .AsNoTracking()
            .Include(x => x.Subtype)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return rock is null ? null : MapToModel(rock);
    }

    public async Task<GeologicalObject> AddAsync(GeologicalObject geologicalObject, CancellationToken cancellationToken = default)
    {
        var subtype = await EnsureSubtypeAsync(geologicalObject.Type, cancellationToken);

        var rock = new RockEntity
        {
            Name = geologicalObject.Name,
            Description = geologicalObject.Description,
            NotableNote = geologicalObject.DepthMeters > 0
                ? $"Depth: {geologicalObject.DepthMeters} m"
                : null,
            SubtypeId = subtype.Id
        };

        _dbContext.Rocks.Add(rock);
        await _dbContext.SaveChangesAsync(cancellationToken);

        geologicalObject.Id = rock.Id;
        return geologicalObject;
    }

    public async Task<IReadOnlyList<string>> GetTopLevelClassNamesAsync(CancellationToken cancellationToken = default)
    {
        await using var connection = new NpgsqlConnection(_dbContext.Database.GetConnectionString());
        await connection.OpenAsync(cancellationToken);

        const string sql = """
            DO $$
            BEGIN
                PERFORM refresh_top_level_categories_has_items();
            END $$;

            SELECT name
            FROM top_level_categories
            WHERE has_items = TRUE
            ORDER BY id;
            """;

        await using var command = new NpgsqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var items = new List<string>();
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(reader.GetString(0));
        }

        return items;
    }

    public async Task<IReadOnlyList<string>> GetChildClassNamesAsync(string topLevelName, CancellationToken cancellationToken = default)
    {
        return await GetChildrenLevelClassNamesAsync("top-level", topLevelName, cancellationToken);
    }

    public async Task<IReadOnlyList<string>> GetChildrenLevelClassNamesAsync(
        string currentLevel,
        string selectedName,
        CancellationToken cancellationToken = default)
    {
        await using var connection = new NpgsqlConnection(_dbContext.Database.GetConnectionString());
        await connection.OpenAsync(cancellationToken);

        var normalizedLevel = currentLevel.Trim().ToLowerInvariant();
        var normalizedName = selectedName.Trim();

        return normalizedLevel switch
        {
            "top-level" => await GetTopLevelChildrenAsync(connection, normalizedName, cancellationToken),
            "rock-type" => await ExecuteNameListQueryAsync(
                connection,
                """
                SELECT rs.name
                FROM rock_subtypes rs
                JOIN rock_types rt ON rt.id = rs.rock_type_id
                WHERE lower(rt.name) = lower(@name)
                ORDER BY rs.name;
                """,
                normalizedName,
                cancellationToken),
            "rock-subtype" => await ExecuteNameListQueryAsync(
                connection,
                """
                SELECT r.name
                FROM rocks r
                JOIN rock_subtypes rs ON rs.id = r.subtype_id
                WHERE lower(rs.name) = lower(@name)
                ORDER BY r.name;
                """,
                normalizedName,
                cancellationToken),
            "rock" => await ExecuteNameListQueryAsync(
                connection,
                """
                SELECT DISTINCT m.name
                FROM rock_mineral_composition rmc
                JOIN rocks r ON r.id = rmc.rock_id
                JOIN minerals m ON m.id = rmc.mineral_id
                WHERE lower(r.name) = lower(@name)
                ORDER BY m.name;
                """,
                normalizedName,
                cancellationToken),
            "silicate-structure" => await ExecuteNameListQueryAsync(
                connection,
                """
                SELECT m.name
                FROM minerals m
                JOIN silicate_structures ss ON ss.id = m.silicate_structure_id
                WHERE lower(ss.name) = lower(@name)
                ORDER BY m.name;
                """,
                normalizedName,
                cancellationToken),
            "mineral-class" => await ExecuteNameListQueryAsync(
                connection,
                """
                SELECT m.name
                FROM minerals m
                JOIN mineral_classes mc ON mc.id = m.mineral_class_id
                WHERE lower(mc.name) = lower(@name)
                ORDER BY m.name;
                """,
                normalizedName,
                cancellationToken),
            "mineral" => [],
            _ => []
        };
    }

    public async Task<MineralCharacteristic?> GetMineralCharacteristicAsync(
        int? mineralId,
        string? mineralName,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Minerals
            .AsNoTracking()
            .Include(x => x.Characteristic)
            .AsQueryable();

        MineralEntity? mineral = null;

        if (mineralId.HasValue)
        {
            mineral = await query.FirstOrDefaultAsync(x => x.Id == mineralId.Value, cancellationToken);
        }

        if (mineral is null && !string.IsNullOrWhiteSpace(mineralName))
        {
            var normalizedName = mineralName.Trim();
            mineral = await query.FirstOrDefaultAsync(x =>
                EF.Functions.ILike(x.Name, normalizedName),
                cancellationToken);
        }

        if (mineral is null)
        {
            return null;
        }

        var characteristic = mineral.Characteristic;

        return new MineralCharacteristic
        {
            MineralId = mineral.Id,
            MineralName = mineral.Name,
            ChemicalFormula = mineral.ChemicalFormula,
            Luster = characteristic?.Luster,
            Color = characteristic?.Color,
            Streak = characteristic?.Streak,
            Transparency = characteristic?.Transparency,
            HardnessMohs = characteristic?.HardnessMohs,
            Cleavage = characteristic?.Cleavage,
            Fracture = characteristic?.Fracture,
            Tenacity = characteristic?.Tenacity,
            SpecificGravity = characteristic?.SpecificGravity,
            Magnetism = characteristic?.Magnetism ?? false,
            Morphology = characteristic?.Morphology,
            Paragenesis = characteristic?.Paragenesis,
            SpecialProperties = characteristic?.SpecialProperties,
            Notes = characteristic?.Notes
        };
    }

    public async Task<IReadOnlyList<SearchResult>> SearchAsync(
        string query,
        CancellationToken cancellationToken = default)
    {
        await using var connection = new NpgsqlConnection(_dbContext.Database.GetConnectionString());
        await connection.OpenAsync(cancellationToken);

        const string sql = """
            SELECT name, 'top-level'           AS entity_type FROM top_level_categories WHERE has_items = TRUE AND name ILIKE @pattern
            UNION ALL
            SELECT name, 'rock-type'          AS entity_type FROM rock_types          WHERE name ILIKE @pattern
            UNION ALL
            SELECT name, 'rock-subtype'        AS entity_type FROM rock_subtypes        WHERE name ILIKE @pattern
            UNION ALL
            SELECT name, 'rock'                AS entity_type FROM rocks                WHERE name ILIKE @pattern
            UNION ALL
            SELECT name, 'silicate-structure'  AS entity_type FROM silicate_structures  WHERE name ILIKE @pattern
            UNION ALL
            SELECT name, 'mineral-class'       AS entity_type FROM mineral_classes      WHERE name ILIKE @pattern
            UNION ALL
            SELECT name, 'mineral'             AS entity_type FROM minerals             WHERE name ILIKE @pattern
            ORDER BY entity_type, name
            LIMIT 100;
            """;

        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("pattern", $"%{query.Trim()}%");

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var results = new List<SearchResult>();

        while (await reader.ReadAsync(cancellationToken))
        {
            results.Add(new SearchResult(reader.GetString(0), reader.GetString(1)));
        }

        return results;
    }

    public async Task<IReadOnlyList<MineralSearchResult>> SearchMineralsAsync(
        MineralSearchFilters filters,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Minerals
            .AsNoTracking()
            .Include(x => x.MineralClass)
            .Include(x => x.SilicateStructure)
            .Include(x => x.Characteristic)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filters.Query))
        {
            var pattern = $"%{filters.Query}%";
            query = query.Where(x => EF.Functions.ILike(x.Name, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.ChemicalFormula))
        {
            var pattern = $"%{filters.ChemicalFormula}%";
            query = query.Where(x => x.ChemicalFormula != null && EF.Functions.ILike(x.ChemicalFormula, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.MineralClass))
        {
            var pattern = $"%{filters.MineralClass}%";
            query = query.Where(x => EF.Functions.ILike(x.MineralClass.Name, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.SilicateStructure))
        {
            var pattern = $"%{filters.SilicateStructure}%";
            query = query.Where(x => x.SilicateStructure != null && EF.Functions.ILike(x.SilicateStructure.Name, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.Luster))
        {
            var pattern = $"%{filters.Luster}%";
            query = query.Where(x => x.Characteristic != null && x.Characteristic.Luster != null && EF.Functions.ILike(x.Characteristic.Luster, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.Color))
        {
            var pattern = $"%{filters.Color}%";
            query = query.Where(x => x.Characteristic != null && x.Characteristic.Color != null && EF.Functions.ILike(x.Characteristic.Color, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.Streak))
        {
            var pattern = $"%{filters.Streak}%";
            query = query.Where(x => x.Characteristic != null && x.Characteristic.Streak != null && EF.Functions.ILike(x.Characteristic.Streak, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.Transparency))
        {
            var pattern = $"%{filters.Transparency}%";
            query = query.Where(x => x.Characteristic != null && x.Characteristic.Transparency != null && EF.Functions.ILike(x.Characteristic.Transparency, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.Cleavage))
        {
            var pattern = $"%{filters.Cleavage}%";
            query = query.Where(x => x.Characteristic != null && x.Characteristic.Cleavage != null && EF.Functions.ILike(x.Characteristic.Cleavage, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.Fracture))
        {
            var pattern = $"%{filters.Fracture}%";
            query = query.Where(x => x.Characteristic != null && x.Characteristic.Fracture != null && EF.Functions.ILike(x.Characteristic.Fracture, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.Tenacity))
        {
            var pattern = $"%{filters.Tenacity}%";
            query = query.Where(x => x.Characteristic != null && x.Characteristic.Tenacity != null && EF.Functions.ILike(x.Characteristic.Tenacity, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.Morphology))
        {
            var pattern = $"%{filters.Morphology}%";
            query = query.Where(x => x.Characteristic != null && x.Characteristic.Morphology != null && EF.Functions.ILike(x.Characteristic.Morphology, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.Paragenesis))
        {
            var pattern = $"%{filters.Paragenesis}%";
            query = query.Where(x => x.Characteristic != null && x.Characteristic.Paragenesis != null && EF.Functions.ILike(x.Characteristic.Paragenesis, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.SpecialProperties))
        {
            var pattern = $"%{filters.SpecialProperties}%";
            query = query.Where(x => x.Characteristic != null && x.Characteristic.SpecialProperties != null && EF.Functions.ILike(x.Characteristic.SpecialProperties, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.Notes))
        {
            var pattern = $"%{filters.Notes}%";
            query = query.Where(x => x.Characteristic != null && x.Characteristic.Notes != null && EF.Functions.ILike(x.Characteristic.Notes, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.Description))
        {
            var pattern = $"%{filters.Description}%";
            query = query.Where(x => x.Description != null && EF.Functions.ILike(x.Description, pattern));
        }

        if (!string.IsNullOrWhiteSpace(filters.CommonUse))
        {
            var pattern = $"%{filters.CommonUse}%";
            query = query.Where(x => x.CommonUse != null && EF.Functions.ILike(x.CommonUse, pattern));
        }

        const decimal hardnessTolerance = 0.5m;
        const decimal specificGravityTolerance = 0.1m;

        if (filters.HardnessMin.HasValue)
        {
            var min = filters.HardnessMin.Value - hardnessTolerance;
            query = query.Where(x => x.Characteristic != null && x.Characteristic.HardnessMohs >= min);
        }

        if (filters.HardnessMax.HasValue)
        {
            var max = filters.HardnessMax.Value + hardnessTolerance;
            query = query.Where(x => x.Characteristic != null && x.Characteristic.HardnessMohs <= max);
        }

        if (filters.SpecificGravityMin.HasValue)
        {
            var min = filters.SpecificGravityMin.Value - specificGravityTolerance;
            query = query.Where(x => x.Characteristic != null && x.Characteristic.SpecificGravity >= min);
        }

        if (filters.SpecificGravityMax.HasValue)
        {
            var max = filters.SpecificGravityMax.Value + specificGravityTolerance;
            query = query.Where(x => x.Characteristic != null && x.Characteristic.SpecificGravity <= max);
        }

        if (filters.Magnetism.HasValue)
        {
            query = query.Where(x => x.Characteristic != null && x.Characteristic.Magnetism == filters.Magnetism.Value);
        }

        if (filters.HasSilicateStructure.HasValue)
        {
            query = filters.HasSilicateStructure.Value
                ? query.Where(x => x.SilicateStructureId != null)
                : query.Where(x => x.SilicateStructureId == null);
        }

        if (filters.HasCharacteristics.HasValue)
        {
            query = filters.HasCharacteristics.Value
                ? query.Where(x => x.Characteristic != null)
                : query.Where(x => x.Characteristic == null);
        }

        var minerals = await query
            .OrderBy(x => x.Name)
            .Take(filters.Limit)
            .Select(x => new MineralSearchResult(
                x.Id,
                x.Name,
                x.MineralClass.Name,
                x.SilicateStructure != null ? x.SilicateStructure.Name : null,
                x.ChemicalFormula,
                x.Characteristic != null ? x.Characteristic.HardnessMohs : null,
                x.Characteristic != null ? x.Characteristic.SpecificGravity : null,
                x.Characteristic != null ? x.Characteristic.Color : null,
                x.Characteristic != null ? x.Characteristic.Luster : null,
                x.Characteristic != null && x.Characteristic.Magnetism))
            .ToListAsync(cancellationToken);

        return minerals;
    }

    private static async Task<IReadOnlyList<string>> GetTopLevelChildrenAsync(
        NpgsqlConnection connection,
        string topLevelName,
        CancellationToken cancellationToken)
    {
        const string refreshSql = "SELECT refresh_top_level_categories_has_items();";
        await using (var refreshCommand = new NpgsqlCommand(refreshSql, connection))
        {
            await refreshCommand.ExecuteNonQueryAsync(cancellationToken);
        }

        const string sourceTableSql = """
            SELECT source_table::text
            FROM top_level_categories
            WHERE lower(name) = lower(@name)
              AND has_items = TRUE
            LIMIT 1;
            """;

        string? sourceTableName;
        await using (var sourceTableCommand = new NpgsqlCommand(sourceTableSql, connection))
        {
            sourceTableCommand.Parameters.AddWithValue("name", topLevelName);
            sourceTableName = (string?)await sourceTableCommand.ExecuteScalarAsync(cancellationToken);
        }

        if (string.IsNullOrWhiteSpace(sourceTableName))
        {
            return [];
        }

        var childSql = $"SELECT name FROM {sourceTableName} ORDER BY name;";
        await using var childCommand = new NpgsqlCommand(childSql, connection);
        await using var reader = await childCommand.ExecuteReaderAsync(cancellationToken);

        var items = new List<string>();
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(reader.GetString(0));
        }

        return items;
    }

    private static async Task<IReadOnlyList<string>> ExecuteNameListQueryAsync(
        NpgsqlConnection connection,
        string sql,
        string selectedName,
        CancellationToken cancellationToken)
    {
        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("name", selectedName);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var items = new List<string>();

        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(reader.GetString(0));
        }

        return items;
    }

    private async Task<RockSubtypeEntity> EnsureSubtypeAsync(string subtypeName, CancellationToken cancellationToken)
    {
        var normalized = subtypeName.Trim();

        var subtype = await _dbContext.RockSubtypes
            .FirstOrDefaultAsync(x => x.Name == normalized, cancellationToken);

        if (subtype is not null)
        {
            return subtype;
        }

        var defaultRockType = await _dbContext.RockTypes
            .FirstOrDefaultAsync(x => x.Name == "Інші", cancellationToken);

        if (defaultRockType is null)
        {
            defaultRockType = new RockTypeEntity
            {
                Name = "Інші",
                Description = "Створено автоматично для нових підтипів"
            };

            _dbContext.RockTypes.Add(defaultRockType);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        subtype = new RockSubtypeEntity
        {
            Name = normalized,
            RockTypeId = defaultRockType.Id
        };

        _dbContext.RockSubtypes.Add(subtype);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return subtype;
    }

    private static GeologicalObject MapToModel(RockEntity rock)
    {
        return new GeologicalObject
        {
            Id = rock.Id,
            Name = rock.Name,
            Type = rock.Subtype?.Name ?? string.Empty,
            DepthMeters = 0,
            Description = rock.Description ?? string.Empty
        };
    }
}
