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
}