using System;
using System.Collections.Generic;

namespace GigupBackend.Models;

public partial class Event
{
    public int Id { get; set; }

    public int OrganizerId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string VenueName { get; set; } = null!;

    public string City { get; set; } = null!;

    public DateTime StartDateTime { get; set; }

    public DateTime EndDateTime { get; set; }

    public int Capacity { get; set; }

    public decimal TicketPrice { get; set; }

    public string? CoverImageUrl { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual OrganizerProfile Organizer { get; set; } = null!;

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
