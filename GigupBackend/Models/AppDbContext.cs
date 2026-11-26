using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace GigupBackend.Models;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<DjProfile> DjProfiles { get; set; }

    public virtual DbSet<Event> Events { get; set; }

    public virtual DbSet<OrganizerProfile> OrganizerProfiles { get; set; }

    public virtual DbSet<Ticket> Tickets { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=localhost\\SQLEXPRESS;Database=gigup_db;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Bookings__3214EC07ACF74A04");

            entity.HasIndex(e => new { e.EventId, e.DjProfileId }, "UQ_Bookings_Event_Dj").IsUnique();

            entity.Property(e => e.OfferedPrice).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .HasDefaultValue("Pending");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getutcdate())");

            entity.HasOne(d => d.DjProfile).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.DjProfileId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Bookings_DjProfiles");

            entity.HasOne(d => d.Event).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.EventId)
                .HasConstraintName("FK_Bookings_Events");
        });

        modelBuilder.Entity<DjProfile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__DjProfil__3214EC07791F6893");

            entity.HasIndex(e => e.UserId, "UQ__DjProfil__1788CC4D069B1B66").IsUnique();

            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.Genres).HasMaxLength(255);
            entity.Property(e => e.PriceFrom).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.ProfileImageUrl).HasMaxLength(500);
            entity.Property(e => e.SoundCloudUrl).HasMaxLength(500);
            entity.Property(e => e.StageName).HasMaxLength(100);

            entity.HasOne(d => d.User).WithOne(p => p.DjProfile)
                .HasForeignKey<DjProfile>(d => d.UserId)
                .HasConstraintName("FK_DjProfiles_Users");
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Events__3214EC0754A7D626");

            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.CoverImageUrl).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .HasDefaultValue("Draft");
            entity.Property(e => e.TicketPrice).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.VenueName).HasMaxLength(150);

            entity.HasOne(d => d.Organizer).WithMany(p => p.Events)
                .HasForeignKey(d => d.OrganizerId)
                .HasConstraintName("FK_Events_OrganizerProfiles");
        });

        modelBuilder.Entity<OrganizerProfile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Organize__3214EC07874BA638");

            entity.HasIndex(e => e.UserId, "UQ__Organize__1788CC4D93E473AD").IsUnique();

            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.ContactPhone).HasMaxLength(30);
            entity.Property(e => e.OrganizationName).HasMaxLength(150);

            entity.HasOne(d => d.User).WithOne(p => p.OrganizerProfile)
                .HasForeignKey<OrganizerProfile>(d => d.UserId)
                .HasConstraintName("FK_OrganizerProfiles_Users");
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Tickets__3214EC078EB90C15");

            entity.HasIndex(e => e.TicketCode, "UQ__Tickets__598CF7A3C409DF0A").IsUnique();

            entity.Property(e => e.PurchasePrice).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.PurchasedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .HasDefaultValue("Valid");
            entity.Property(e => e.TicketCode).HasMaxLength(64);

            entity.HasOne(d => d.Event).WithMany(p => p.Tickets)
                .HasForeignKey(d => d.EventId)
                .HasConstraintName("FK_Tickets_Events");

            entity.HasOne(d => d.User).WithMany(p => p.Tickets)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tickets_Users");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC07628CAA7A");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534F7EFD758").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(150);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Role)
                .HasMaxLength(30)
                .HasDefaultValue("Visitor");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
