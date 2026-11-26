using System;
using System.Collections.Generic;

namespace GigupBackend.Models;

public partial class Booking
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public int DjProfileId { get; set; }

    public decimal OfferedPrice { get; set; }

    public TimeOnly SetStartTime { get; set; }

    public TimeOnly SetEndTime { get; set; }

    public string Status { get; set; } = null!;

    public string? OrganizerNote { get; set; }

    public string? DjNote { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual DjProfile DjProfile { get; set; } = null!;

    public virtual Event Event { get; set; } = null!;
}
