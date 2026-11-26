/*
Tento controller řeší zobrazování nabídek pro konkrétního DJ (např. DJ RAIVOX) i pořadatele, odesílání nových nabídek a změnu stavu (Accepted, Rejected, CounterOffered)
*/

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

    // GET: api/bookings/dj/1 (Vrátí všechny bookingy pro daný DJ profil)
    [HttpGet("dj/{djProfileId}")]
    public async Task<IActionResult> GetBookingsForDj(int djProfileId)
    {
        var bookings = await _context.Bookings
            .Where(b => b.DjProfileId == djProfileId)
            .Include(b => b.Event)
                .ThenInclude(e => e.Organizer)
            .OrderByDescending(b => b.UpdatedAt)
            .Select(b => new
            {
                b.Id,
                b.EventId,
                EventTitle = b.Event.Title,
                VenueName = b.Event.VenueName,
                EventDate = b.Event.StartDateTime,
                OrganizerName = b.Event.Organizer.OrganizationName,
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

    // GET: api/bookings/organizer/1 (Vrátí všechny bookingy pro akce daného pořadatele)
    [HttpGet("organizer/{organizerId}")]
    public async Task<IActionResult> GetBookingsForOrganizer(int organizerId)
    {
        var bookings = await _context.Bookings
            .Where(b => b.Event.OrganizerId == organizerId)
            .Include(b => b.Event)
            .Include(b => b.DjProfile)
            .OrderByDescending(b => b.UpdatedAt)
            .Select(b => new
            {
                b.Id,
                b.EventId,
                EventTitle = b.Event.Title,
                b.DjProfileId,
                DjStageName = b.DjProfile.StageName,
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

        booking.Status = dto.Status; // "Accepted", "Rejected", nebo "CounterOffered"
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