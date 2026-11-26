using System;
using System.Collections.Generic;

namespace GigupBackend.Models;

public partial class DjProfile
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string StageName { get; set; } = null!;

    public string? Bio { get; set; }

    public string City { get; set; } = null!;

    public string Genres { get; set; } = null!;

    public decimal PriceFrom { get; set; }

    public string? SoundCloudUrl { get; set; }

    public string? TechRider { get; set; }

    public string? ProfileImageUrl { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual User User { get; set; } = null!;
}
