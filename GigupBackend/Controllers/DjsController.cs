/*
Vrací seznam DJů pro katalog a vyhledávání
*/
using GigupBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GigupBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DjsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DjsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/djs
    [HttpGet]
    public async Task<IActionResult> GetAllDjs()
    {
        var djs = await _context.DjProfiles
            .Select(d => new
            {
                d.Id,
                d.UserId,
                d.StageName,
                d.Bio,
                d.City,
                d.Genres,
                d.PriceFrom,
                d.SoundCloudUrl,
                d.TechRider,
                d.ProfileImageUrl
            })
            .ToListAsync();

        return Ok(djs);
    }
}