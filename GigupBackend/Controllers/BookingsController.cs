using GigupBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GigupBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BookingsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/bookings (Všechny bookingy pro sestavení lineupů i dashboardů)
    [HttpGet]
    public async Task<IActionResult> GetAllBookings()
    {
        var bookings = await _context.Bookings
            .Include(b => b.Event)
                .ThenInclude(e => e.Organizer)
            .Include(b => b.DjProfile)
            .OrderBy(b => b.SetStartTime)
            .Select(b => new
            {
                b.Id,
                b.EventId,
                EventTitle = b.Event.Title,
                VenueName = b.Event.VenueName,
                EventDate = b.Event.StartDateTime,
                OrganizerId = b.Event.OrganizerId,
                OrganizerName = b.Event.Organizer.OrganizationName,
                b.DjProfileId,
                DjStageName = b.DjProfile.StageName,
                Genres = b.DjProfile.Genres,
                Dj = new
                {
                    b.DjProfile.Id,
                    b.DjProfile.StageName,
                    b.DjProfile.City,
                    b.DjProfile.Genres,
                    b.DjProfile.PriceFrom,
                    b.DjProfile.TechRider,
                    b.DjProfile.ProfileImageUrl
                },
                b.OfferedPrice,
                b.SetStartTime,
                b.SetEndTime,
                b.Status,
                b.OrganizerNote,
                b.DjNote,
                b.UpdatedAt
            })
            .ToListAsync();

        return Ok(bookings);
    }

    // POST: api/bookings (Pořadatel odešle nabídku DJovi)
    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        var exists = await _context.Bookings
            .AnyAsync(b => b.EventId == dto.EventId && b.DjProfileId == dto.DjProfileId);

        if (exists)
            return BadRequest(new { message = "Tomuto DJovi už byla na tuto akci odeslána nabídka." });

        var booking = new Booking
        {
            EventId = dto.EventId,
            DjProfileId = dto.DjProfileId,
            OfferedPrice = dto.OfferedPrice,
            SetStartTime = TimeOnly.Parse(dto.SetStartTime),
            SetEndTime = TimeOnly.Parse(dto.SetEndTime),
            Status = "Pending",
            OrganizerNote = dto.OrganizerNote,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Nabídka byla úspěšně odeslána DJovi.", booking.Id });
    }

    // PATCH: api/bookings/4/respond (DJ přijme, odmítne nebo pošle protinabídku)
    [HttpPatch("{id}/respond")]
    public async Task<IActionResult> RespondToBooking(int id, [FromBody] RespondBookingDto dto)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
            return NotFound(new { message = "Booking nebyl nalezen." });

        booking.Status = dto.Status;
        if (dto.CounterPrice.HasValue && dto.Status == "CounterOffered")
        {
            booking.OfferedPrice = dto.CounterPrice.Value;
        }
        booking.DjNote = dto.DjNote;
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = $"Stav bookingu byl změněn na {booking.Status}.", booking.Status });
    }
}

public record CreateBookingDto(int EventId, int DjProfileId, decimal OfferedPrice, string SetStartTime, string SetEndTime, string? OrganizerNote);
public record RespondBookingDto(string Status, decimal? CounterPrice, string? DjNote);