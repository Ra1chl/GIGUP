using System;
using System.Collections.Generic;

namespace GigupBackend.Models;

public partial class Ticket
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public int UserId { get; set; }

    public string TicketCode { get; set; } = null!;

    public decimal PurchasePrice { get; set; }

    public string Status { get; set; } = null!;

    public DateTime PurchasedAt { get; set; }

    public DateTime? ScannedAt { get; set; }

    public virtual Event Event { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
