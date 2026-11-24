// Horní lišta (dynamicky mění odkazy podle role)
// src/components/Navbar.jsx
import { Link, NavLink } from "react-router-dom";
import { Disc3, Calendar, Users, Ticket, QrCode, LayoutDashboard, UserCheck } from "lucide-react";
import { useGigup } from "../context/GigupContext";

export default function Navbar() {
    const { users, currentUser, switchUser, bookings } = useGigup();

    // Spočítáme, kolik nových (Pending) nabídek čeká na přihlášeného DJ
    const pendingBookingsCount =
        currentUser?.role === "DJ"
            ? bookings.filter((b) => b.djProfileId === currentUser.djProfileId && b.status === "Pending").length
            : 0;

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
            ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
        }`;

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Logo GIGUP */}
                <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-xl tracking-tight">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                        <Disc3 className="w-5 h-5 text-white" />
                    </div>
                    <span>
                        GIG<span className="text-violet-400">UP</span>
                    </span>
                </Link>

                {/* Hlavní navigace */}
                <nav className="hidden md:flex items-center gap-1.5">
                    <NavLink to="/" className={navLinkClass} end>
                        <Calendar className="w-4 h-4" />
                        Akce
                    </NavLink>

                    <NavLink to="/djs" className={navLinkClass}>
                        <Users className="w-4 h-4" />
                        DJs
                    </NavLink>

                    <NavLink to="/my-tickets" className={navLinkClass}>
                        <Ticket className="w-4 h-4" />
                        Moje vstupenky
                    </NavLink>

                    {currentUser?.role === "DJ" && (
                        <NavLink to="/dj/dashboard" className={navLinkClass}>
                            <LayoutDashboard className="w-4 h-4" />
                            DJ Bookingy
                            {pendingBookingsCount > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-violet-600 text-white rounded-full">
                                    {pendingBookingsCount}
                                </span>
                            )}
                        </NavLink>
                    )}

                    {currentUser?.role === "Organizer" && (
                        <>
                            <NavLink to="/organizer/dashboard" className={navLinkClass}>
                                <LayoutDashboard className="w-4 h-4" />
                                Správa akcí
                            </NavLink>
                            <NavLink to="/organizer/scanner/1" className={navLinkClass}>
                                <QrCode className="w-4 h-4" />
                                QR Skener
                            </NavLink>
                        </>
                    )}
                </nav>

                {/* Přepínač rolí pro rychlé testování a live demo */}
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
                    <UserCheck className="w-4 h-4 text-violet-400 shrink-0" />
                    <select
                        value={currentUser?.id || ""}
                        onChange={(e) => switchUser(e.target.value)}
                        aria-label="Přepnout testovací roli"
                        className="bg-transparent text-xs sm:text-sm text-zinc-200 font-medium focus:outline-none cursor-pointer"
                    >
                        {users.map((u) => (
                            <option key={u.id} value={u.id} className="bg-zinc-900 text-zinc-100">
                                {u.fullName} ({u.role})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </header>
    );
}