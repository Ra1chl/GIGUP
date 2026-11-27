/*
Vrací zveřejněné akce včetně názvu pořadatele, obsazenosti a pouze potvrzeného lineupu (Status == "Accepted")
*/
using GigupBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GigupBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly AppDbContext _context;

    public EventsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/events
    [HttpGet]
    public async Task<IActionResult> GetPublishedEvents()
    {
        var events = await _context.Events
            .Where(e => e.Status == "Published")
            .Include(e => e.Organizer)
            .Include(e => e.Bookings)
                .ThenInclude(b => b.DjProfile)
            .Include(e => e.Tickets)
            .OrderBy(e => e.StartDateTime)
            .Select(e => new
            {
                e.Id,
                e.Title,
                e.Description,
                e.VenueName,
                e.City,
                e.StartDateTime,
                e.EndDateTime,
                e.Capacity,
                e.TicketPrice,
                e.CoverImageUrl,
                e.Status,
                OrganizerName = e.Organizer.OrganizationName,
                SoldTickets = e.Tickets.Count(t => t.Status != "Refunded"),
                Lineup = e.Bookings
                    .Where(b => b.Status == "Accepted")
                    .OrderBy(b => b.SetStartTime)
                    .Select(b => new
                    {
                        b.Id,
                        DjId = b.DjProfile.Id,
                        b.DjProfile.StageName,
                        b.DjProfile.Genres,
                        b.SetStartTime,
                        b.SetEndTime
                    })
            })
            .ToListAsync();

        return Ok(events);
    }

    // GET: api/events/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetEventDetail(int id)
    {
        var ev = await _context.Events
            .Include(e => e.Organizer)
            .Include(e => e.Bookings)
                .ThenInclude(b => b.DjProfile)
            .Include(e => e.Tickets)
            .Where(e => e.Id == id)
            .Select(e => new
            {
                e.Id,
                e.Title,
                e.Description,
                e.VenueName,
                e.City,
                e.StartDateTime,
                e.EndDateTime,
                e.Capacity,
                e.TicketPrice,
                e.CoverImageUrl,
                e.Status,
                OrganizerName = e.Organizer.OrganizationName,
                OrganizerPhone = e.Organizer.ContactPhone,
                SoldTickets = e.Tickets.Count(t => t.Status != "Refunded"),
                Lineup = e.Bookings
                    .Where(b => b.Status == "Accepted")
                    .OrderBy(b => b.SetStartTime)
                    .Select(b => new
                    {
                        b.Id,
                        DjId = b.DjProfile.Id,
                        b.DjProfile.StageName,
                        b.DjProfile.Genres,
                        b.DjProfile.ProfileImageUrl,
                        b.SetStartTime,
                        b.SetEndTime
                    })
            })
            .FirstOrDefaultAsync();

        if (ev == null)
            return NotFound(new { message = "Akce nebyla nalezena." });

        return Ok(ev);
    }

    [HttpPost]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
    {
        var start = DateTime.Parse(dto.StartDateTime);

        var newEvent = new Event
        {
            OrganizerId = dto.OrganizerId > 0 ? dto.OrganizerId : 1,
            Title = dto.Title,
            Description = dto.Description ?? "",
            StartDateTime = start,
            EndDateTime = start.AddHours(6),
            VenueName = dto.VenueName,
            City = "Praha",
            TicketPrice = dto.TicketPrice,
            Capacity = dto.Capacity,
            CoverImageUrl = string.IsNullOrWhiteSpace(dto.CoverImageUrl)
                ? "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"
                : dto.CoverImageUrl,
            Status = "Published"
        };

        _context.Events.Add(newEvent);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Akce byla úspěšně vytvořena.", id = newEvent.Id });
    }
}

public record CreateEventDto(
    int OrganizerId,
    string Title,
    string? Description,
    string StartDateTime,
    string VenueName,
    decimal TicketPrice,
    int Capacity,
    string? CoverImageUrl
);