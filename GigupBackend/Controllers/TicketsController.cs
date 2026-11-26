/*
Tento controller hlídá kapacitu akce při nákupu, vygeneruje unikátní kryptografický kód (GIGUP-...) a při ověření u vstupu
atomic-way přepne lístek z Valid na Used, takže druhé naskenování stejného QR kódu okamžitě odmítne.
*/

using System.Security.Cryptography;
using GigupBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GigupBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TicketsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/tickets/user/4 (Vrátí všechny vstupenky návštěvníka)
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserTickets(int userId)
    {
        var tickets = await _context.Tickets
            .Where(t => t.UserId == userId)
            .Include(t => t.Event)
            .OrderByDescending(t => t.PurchasedAt)
            .Select(t => new
            {
                t.Id,
                t.TicketCode,
                t.PurchasePrice,
                t.Status,
                t.PurchasedAt,
                t.ScannedAt,
                EventId = t.Event.Id,
                EventTitle = t.Event.Title,
                VenueName = t.Event.VenueName,
                StartDateTime = t.Event.StartDateTime
            })
            .ToListAsync();

        return Ok(tickets);
    }

    // POST: api/tickets/purchase (Nákup vstupenky)
    [HttpPost("purchase")]
    public async Task<IActionResult> PurchaseTicket([FromBody] PurchaseTicketDto dto)
    {
        var user = await _context.Users.FindAsync(dto.UserId);
        if (user == null)
            return NotFound(new { message = "Uživatel nebyl nalezen." });

        if (user.Role != "Visitor")
            return StatusCode(403, new { message = "Nákup vstupenek je povolen pouze pro běžné návštěvníky (Visitor)." });

        var ev = await _context.Events
            .Include(e => e.Tickets)
            .FirstOrDefaultAsync(e => e.Id == dto.EventId);

        if (ev == null)
            return NotFound(new { message = "Akce nebyla nalezena." });

        var activeTickets = ev.Tickets.Count(t => t.Status != "Refunded");
        if (activeTickets >= ev.Capacity)
            return BadRequest(new { message = "Akce je již vyprodaná." });

        // Kryptograficky bezpečný unikátní kód pro QR
        var randomHex = Convert.ToHexString(RandomNumberGenerator.GetBytes(10));
        var ticketCode = $"GIGUP-{randomHex}";

        var ticket = new Ticket
        {
            EventId = ev.Id,
            UserId = dto.UserId,
            TicketCode = ticketCode,
            PurchasePrice = ev.TicketPrice,
            Status = "Valid",
            PurchasedAt = DateTime.UtcNow
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Vstupenka byla úspěšně zakoupena.",
            ticket.Id,
            ticket.TicketCode,
            ticket.Status
        });
    }

    // POST: api/tickets/scan (Ověření QR kódu u vstupu)
    [HttpPost("scan")]
    public async Task<IActionResult> ScanTicket([FromBody] ScanTicketDto dto)
    {
        var ticket = await _context.Tickets
            .Include(t => t.User)
            .Include(t => t.Event)
            .FirstOrDefaultAsync(t => t.TicketCode == dto.TicketCode.Trim());

        if (ticket == null)
        {
            return NotFound(new
            {
                valid = false,
                status = "Invalid",
                message = "Neplatný QR kód – vstupenka v systému neexistuje."
            });
        }

        if (ticket.Status == "Used")
        {
            return BadRequest(new
            {
                valid = false,
                status = "Used",
                message = $"VSTUP ZAMÍTNUT: Vstupenka již byla použita ({ticket.ScannedAt:HH:mm:ss})!",
                holderName = ticket.User.FullName,
                eventTitle = ticket.Event.Title
            });
        }

        if (ticket.Status == "Refunded")
        {
            return BadRequest(new
            {
                valid = false,
                status = "Refunded",
                message = "VSTUP ZAMÍTNUT: Vstupenka byla stornována."
            });
        }

        // Označení vstupenky jako použité (ochrana proti druhému použití)
        ticket.Status = "Used";
        ticket.ScannedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            valid = true,
            status = "Valid",
            message = "VSTUP POVOLEN – Platná vstupenka.",
            holderName = ticket.User.FullName,
            eventTitle = ticket.Event.Title,
            scannedAt = ticket.ScannedAt
        });
    }
}

public record PurchaseTicketDto(int EventId, int UserId);
public record ScanTicketDto(string TicketCode);