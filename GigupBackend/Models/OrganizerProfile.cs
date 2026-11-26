using System;
using System.Collections.Generic;

namespace GigupBackend.Models;

public partial class OrganizerProfile
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string OrganizationName { get; set; } = null!;

    public string City { get; set; } = null!;

    public string? Description { get; set; }

    public string? ContactPhone { get; set; }

    public virtual ICollection<Event> Events { get; set; } = new List<Event>();

    public virtual User User { get; set; } = null!;
}
