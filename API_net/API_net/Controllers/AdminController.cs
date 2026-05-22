using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API_net.DTOs;
using BLL_net.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace API_net.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly IConfiguration _config;

    public AdminController(IAdminService adminService, IConfiguration config)
    {
        _adminService = adminService;
        _config = config;
    }

    // ===== AUTH =====

    [HttpPost("login")]
    [AllowAnonymous]
    public IActionResult Login([FromBody] AdminLoginRequest req)
    {
        var expectedLogin = _config["AdminCredentials:Login"];
        var expectedPassword = _config["AdminCredentials:Password"];

        if (req.Login != expectedLogin || req.Password != expectedPassword)
            return Unauthorized(new { message = "Невірний логін або пароль" });

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["AppSecrets:JwtSecretKey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "simple-geology",
            audience: "simple-geology-admin",
            claims: [new Claim(ClaimTypes.Role, "admin"), new Claim(ClaimTypes.Name, req.Login)],
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return Ok(new AdminTokenResponse(new JwtSecurityTokenHandler().WriteToken(token)));
    }

    // ===== HIERARCHY — TOP LEVEL CATEGORIES =====

    [HttpGet("hierarchy/top-level"), Authorize(Roles = "admin")]
    public async Task<IActionResult> GetTopLevelCategories(CancellationToken ct)
    {
        var items = await _adminService.GetTopLevelCategoriesAsync(ct);
        return Ok(items.Select(x => new TopLevelCategoryDto(x.Id, x.Name, x.SourceTable, x.HasItems)));
    }

    [HttpPost("hierarchy/top-level"), Authorize(Roles = "admin")]
    public async Task<IActionResult> AddTopLevelCategory([FromBody] UpsertTopLevelCategoryDto dto, CancellationToken ct)
    {
        var result = await _adminService.AddTopLevelCategoryAsync(dto.Name, dto.SourceTable, ct);
        return Ok(new TopLevelCategoryDto(result.Id, result.Name, result.SourceTable, result.HasItems));
    }

    [HttpPut("hierarchy/top-level/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateTopLevelCategory(int id, [FromBody] UpsertTopLevelCategoryDto dto, CancellationToken ct)
    {
        await _adminService.UpdateTopLevelCategoryAsync(id, dto.Name, dto.SourceTable, ct);
        return NoContent();
    }

    [HttpDelete("hierarchy/top-level/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteTopLevelCategory(int id, CancellationToken ct)
    {
        await _adminService.DeleteTopLevelCategoryAsync(id, ct);
        return NoContent();
    }

    // ===== HIERARCHY — ROCK TYPES =====

    [HttpGet("hierarchy/rock-types"), Authorize(Roles = "admin")]
    public async Task<IActionResult> GetRockTypes(CancellationToken ct)
    {
        var items = await _adminService.GetRockTypesAsync(ct);
        return Ok(items.Select(x => new RockTypeDto(x.Id, x.Name, x.Description, x.OriginNote)));
    }

    [HttpPost("hierarchy/rock-types"), Authorize(Roles = "admin")]
    public async Task<IActionResult> AddRockType([FromBody] UpsertRockTypeDto dto, CancellationToken ct)
    {
        var result = await _adminService.AddRockTypeAsync(dto.Name, dto.Description, dto.OriginNote, ct);
        return Ok(new RockTypeDto(result.Id, result.Name, result.Description, result.OriginNote));
    }

    [HttpPut("hierarchy/rock-types/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateRockType(int id, [FromBody] UpsertRockTypeDto dto, CancellationToken ct)
    {
        await _adminService.UpdateRockTypeAsync(id, dto.Name, dto.Description, dto.OriginNote, ct);
        return NoContent();
    }

    [HttpDelete("hierarchy/rock-types/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteRockType(int id, CancellationToken ct)
    {
        await _adminService.DeleteRockTypeAsync(id, ct);
        return NoContent();
    }

    // ===== HIERARCHY — ROCK SUBTYPES =====

    [HttpGet("hierarchy/rock-subtypes"), Authorize(Roles = "admin")]
    public async Task<IActionResult> GetRockSubtypes([FromQuery] int? rockTypeId, CancellationToken ct)
    {
        var items = await _adminService.GetRockSubtypesAsync(rockTypeId, ct);
        return Ok(items.Select(x => new RockSubtypeDto(x.Id, x.RockTypeId, x.RockTypeName, x.Name, x.FormationNote)));
    }

    [HttpPost("hierarchy/rock-subtypes"), Authorize(Roles = "admin")]
    public async Task<IActionResult> AddRockSubtype([FromBody] UpsertRockSubtypeDto dto, CancellationToken ct)
    {
        var result = await _adminService.AddRockSubtypeAsync(dto.RockTypeId, dto.Name, dto.FormationNote, ct);
        return Ok(new RockSubtypeDto(result.Id, result.RockTypeId, result.RockTypeName, result.Name, result.FormationNote));
    }

    [HttpPut("hierarchy/rock-subtypes/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateRockSubtype(int id, [FromBody] UpsertRockSubtypeDto dto, CancellationToken ct)
    {
        await _adminService.UpdateRockSubtypeAsync(id, dto.RockTypeId, dto.Name, dto.FormationNote, ct);
        return NoContent();
    }

    [HttpDelete("hierarchy/rock-subtypes/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteRockSubtype(int id, CancellationToken ct)
    {
        await _adminService.DeleteRockSubtypeAsync(id, ct);
        return NoContent();
    }

    // ===== HIERARCHY — MINERAL CLASSES =====

    [HttpGet("hierarchy/mineral-classes"), Authorize(Roles = "admin")]
    public async Task<IActionResult> GetMineralClasses(CancellationToken ct)
    {
        var items = await _adminService.GetMineralClassesAsync(ct);
        return Ok(items.Select(x => new MineralClassDto(x.Id, x.Name, x.ChemicalNote, x.Analogy)));
    }

    [HttpPost("hierarchy/mineral-classes"), Authorize(Roles = "admin")]
    public async Task<IActionResult> AddMineralClass([FromBody] UpsertMineralClassDto dto, CancellationToken ct)
    {
        var result = await _adminService.AddMineralClassAsync(dto.Name, dto.ChemicalNote, dto.Analogy, ct);
        return Ok(new MineralClassDto(result.Id, result.Name, result.ChemicalNote, result.Analogy));
    }

    [HttpPut("hierarchy/mineral-classes/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateMineralClass(int id, [FromBody] UpsertMineralClassDto dto, CancellationToken ct)
    {
        await _adminService.UpdateMineralClassAsync(id, dto.Name, dto.ChemicalNote, dto.Analogy, ct);
        return NoContent();
    }

    [HttpDelete("hierarchy/mineral-classes/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteMineralClass(int id, CancellationToken ct)
    {
        await _adminService.DeleteMineralClassAsync(id, ct);
        return NoContent();
    }

    // ===== HIERARCHY — SILICATE STRUCTURES =====

    [HttpGet("hierarchy/silicate-structures"), Authorize(Roles = "admin")]
    public async Task<IActionResult> GetSilicateStructures(CancellationToken ct)
    {
        var items = await _adminService.GetSilicateStructuresAsync(ct);
        return Ok(items.Select(x => new SilicateStructureDto(x.Id, x.Name, x.IupacName, x.StructureDesc, x.Analogy)));
    }

    [HttpPost("hierarchy/silicate-structures"), Authorize(Roles = "admin")]
    public async Task<IActionResult> AddSilicateStructure([FromBody] UpsertSilicateStructureDto dto, CancellationToken ct)
    {
        var result = await _adminService.AddSilicateStructureAsync(dto.Name, dto.IupacName, dto.StructureDesc, dto.Analogy, ct);
        return Ok(new SilicateStructureDto(result.Id, result.Name, result.IupacName, result.StructureDesc, result.Analogy));
    }

    [HttpPut("hierarchy/silicate-structures/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateSilicateStructure(int id, [FromBody] UpsertSilicateStructureDto dto, CancellationToken ct)
    {
        await _adminService.UpdateSilicateStructureAsync(id, dto.Name, dto.IupacName, dto.StructureDesc, dto.Analogy, ct);
        return NoContent();
    }

    [HttpDelete("hierarchy/silicate-structures/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteSilicateStructure(int id, CancellationToken ct)
    {
        await _adminService.DeleteSilicateStructureAsync(id, ct);
        return NoContent();
    }

    // ===== LEAVES — MINERALS =====

    [HttpGet("minerals"), Authorize(Roles = "admin")]
    public async Task<IActionResult> GetMinerals(CancellationToken ct)
    {
        var items = await _adminService.GetMineralsAsync(ct);
        return Ok(items.Select(x => new AdminMineralDto(x.Id, x.Name, x.ChemicalFormula, x.MineralClassId, x.MineralClassName, x.SilicateStructureId, x.SilicateStructureName, x.Description, x.CommonUse)));
    }

    [HttpPost("minerals"), Authorize(Roles = "admin")]
    public async Task<IActionResult> AddMineral([FromBody] UpsertMineralDto dto, CancellationToken ct)
    {
        var result = await _adminService.AddMineralAsync(dto.Name, dto.ChemicalFormula, dto.MineralClassId, dto.SilicateStructureId, dto.Description, dto.CommonUse, ct);
        return Ok(new AdminMineralDto(result.Id, result.Name, result.ChemicalFormula, result.MineralClassId, result.MineralClassName, result.SilicateStructureId, result.SilicateStructureName, result.Description, result.CommonUse));
    }

    [HttpPut("minerals/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateMineral(int id, [FromBody] UpsertMineralDto dto, CancellationToken ct)
    {
        await _adminService.UpdateMineralAsync(id, dto.Name, dto.ChemicalFormula, dto.MineralClassId, dto.SilicateStructureId, dto.Description, dto.CommonUse, ct);
        return NoContent();
    }

    [HttpDelete("minerals/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteMineral(int id, CancellationToken ct)
    {
        await _adminService.DeleteMineralAsync(id, ct);
        return NoContent();
    }

    // ===== LEAVES — ROCKS =====

    [HttpGet("rocks"), Authorize(Roles = "admin")]
    public async Task<IActionResult> GetRocks(CancellationToken ct)
    {
        var items = await _adminService.GetRocksAsync(ct);
        return Ok(items.Select(x => new AdminRockDto(x.Id, x.SubtypeId, x.SubtypeName, x.Name, x.Description, x.NotableNote)));
    }

    [HttpPost("rocks"), Authorize(Roles = "admin")]
    public async Task<IActionResult> AddRock([FromBody] UpsertRockDto dto, CancellationToken ct)
    {
        var result = await _adminService.AddRockAsync(dto.SubtypeId, dto.Name, dto.Description, dto.NotableNote, ct);
        return Ok(new AdminRockDto(result.Id, result.SubtypeId, result.SubtypeName, result.Name, result.Description, result.NotableNote));
    }

    [HttpPut("rocks/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateRock(int id, [FromBody] UpsertRockDto dto, CancellationToken ct)
    {
        await _adminService.UpdateRockAsync(id, dto.SubtypeId, dto.Name, dto.Description, dto.NotableNote, ct);
        return NoContent();
    }

    [HttpDelete("rocks/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteRock(int id, CancellationToken ct)
    {
        await _adminService.DeleteRockAsync(id, ct);
        return NoContent();
    }

    // ===== CHARACTERISTICS — MINERAL CHARACTERISTICS =====

    [HttpGet("characteristics"), Authorize(Roles = "admin")]
    public async Task<IActionResult> GetMineralCharacteristics(CancellationToken ct)
    {
        var items = await _adminService.GetMineralCharacteristicsAsync(ct);
        return Ok(items.Select(x => new AdminMineralCharacteristicDto(x.Id, x.MineralId, x.MineralName, x.Luster, x.Color, x.Streak, x.Transparency, x.HardnessMohs, x.Cleavage, x.Fracture, x.Tenacity, x.SpecificGravity, x.Magnetism, x.Morphology, x.Paragenesis, x.SpecialProperties, x.Notes)));
    }

    [HttpPost("characteristics"), Authorize(Roles = "admin")]
    public async Task<IActionResult> AddMineralCharacteristic([FromBody] UpsertMineralCharacteristicDto dto, CancellationToken ct)
    {
        var result = await _adminService.AddMineralCharacteristicAsync(dto.MineralId, dto.Luster, dto.Color, dto.Streak, dto.Transparency, dto.HardnessMohs, dto.Cleavage, dto.Fracture, dto.Tenacity, dto.SpecificGravity, dto.Magnetism, dto.Morphology, dto.Paragenesis, dto.SpecialProperties, dto.Notes, ct);
        return Ok(new AdminMineralCharacteristicDto(result.Id, result.MineralId, result.MineralName, result.Luster, result.Color, result.Streak, result.Transparency, result.HardnessMohs, result.Cleavage, result.Fracture, result.Tenacity, result.SpecificGravity, result.Magnetism, result.Morphology, result.Paragenesis, result.SpecialProperties, result.Notes));
    }

    [HttpPut("characteristics/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateMineralCharacteristic(int id, [FromBody] UpsertMineralCharacteristicDto dto, CancellationToken ct)
    {
        await _adminService.UpdateMineralCharacteristicAsync(id, dto.Luster, dto.Color, dto.Streak, dto.Transparency, dto.HardnessMohs, dto.Cleavage, dto.Fracture, dto.Tenacity, dto.SpecificGravity, dto.Magnetism, dto.Morphology, dto.Paragenesis, dto.SpecialProperties, dto.Notes, ct);
        return NoContent();
    }

    [HttpDelete("characteristics/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteMineralCharacteristic(int id, CancellationToken ct)
    {
        await _adminService.DeleteMineralCharacteristicAsync(id, ct);
        return NoContent();
    }

    // ===== CHARACTERISTICS — ROCK COMPOSITIONS =====

    [HttpGet("rock-compositions"), Authorize(Roles = "admin")]
    public async Task<IActionResult> GetRockCompositions(CancellationToken ct)
    {
        var items = await _adminService.GetRockCompositionsAsync(ct);
        return Ok(items.Select(x => new AdminRockCompositionDto(x.Id, x.RockId, x.RockName, x.MineralId, x.MineralName, x.Abundance, x.Notes)));
    }

    [HttpPost("rock-compositions"), Authorize(Roles = "admin")]
    public async Task<IActionResult> AddRockComposition([FromBody] UpsertRockCompositionDto dto, CancellationToken ct)
    {
        var result = await _adminService.AddRockCompositionAsync(dto.RockId, dto.MineralId, dto.Abundance, dto.Notes, ct);
        return Ok(new AdminRockCompositionDto(result.Id, result.RockId, result.RockName, result.MineralId, result.MineralName, result.Abundance, result.Notes));
    }

    [HttpPut("rock-compositions/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateRockComposition(int id, [FromBody] UpsertRockCompositionDto dto, CancellationToken ct)
    {
        await _adminService.UpdateRockCompositionAsync(id, dto.RockId, dto.MineralId, dto.Abundance, dto.Notes, ct);
        return NoContent();
    }

    [HttpDelete("rock-compositions/{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteRockComposition(int id, CancellationToken ct)
    {
        await _adminService.DeleteRockCompositionAsync(id, ct);
        return NoContent();
    }

    // ===== SITE TEXTS =====

    [HttpGet("site-texts"), Authorize(Roles = "admin")]
    public async Task<IActionResult> GetSiteTexts(CancellationToken ct)
    {
        var items = await _adminService.GetSiteTextsAsync(ct);
        return Ok(items.Select(x => new SiteTextDto(x.Id, x.Key, x.Value, x.Description)));
    }

    [HttpPut("site-texts/{key}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateSiteText(string key, [FromBody] UpdateSiteTextDto dto, CancellationToken ct)
    {
        await _adminService.UpdateSiteTextAsync(key, dto.Value, ct);
        return NoContent();
    }

    // ===== HISTORY =====

    [HttpGet("audit-log"), Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAuditLog([FromQuery] int limit = 200, CancellationToken ct = default)
    {
        var items = await _adminService.GetAuditLogsAsync(limit, ct);
        return Ok(items.Select(x => new AuditLogDto(x.Id, x.TableName, x.RecordId, x.Operation, x.ChangedAt, x.Description)));
    }
}
