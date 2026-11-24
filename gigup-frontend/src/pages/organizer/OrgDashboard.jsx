//Moje akce a odeslané nabídky DJům
// src/pages/organizer/OrgDashboard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, QrCode, Users, Calendar } from "lucide-react";
import { useGigup } from "../../context/GigupContext";

export default function OrgDashboard() {
    const { currentUser, events, bookings, createEvent } = useGigup();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [venueName, setVenueName] = useState("Storm Club Prague");
    const [city, setCity] = useState("Praha");
    const [startDateTime, setStartDateTime] = useState("2026-12-26T22:00");
    const [capacity, setCapacity] = useState(300);
    const [ticketPrice, setTicketPrice] = useState(250);
    const [description, setDescription] = useState("");

    const myEvents = events.filter(
        (e) => e.organizerId === currentUser?.organizerProfileId
    );

    const handleCreate = (e) => {
        e.preventDefault();
        createEvent({
            title,
            venueName,
            city,
            startDateTime,
            endDateTime: startDateTime,
            capacity,
            ticketPrice,
            description: description || "Klubová noc na GIGUP.",
            coverImageUrl:
                "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        });
        setShowForm(false);
        setTitle("");
        setDescription("");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                        Pořadatelská zóna
                    </span>
                    <h1 className="text-3xl font-extrabold text-white mt-1">Správa akcí</h1>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Založit novou akci
                </button>
            </div>

            {showForm && (
                <form
                    onSubmit={handleCreate}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4"
                >
                    <h2 className="text-lg font-bold text-white">Nová hudební akce</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Název akce</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Např. WINTER RAVE PRAGUE"
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Klub / Místo konání</label>
                            <input
                                type="text"
                                required
                                value={venueName}
                                onChange={(e) => setVenueName(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Datum a čas začátku</label>
                            <input
                                type="datetime-local"
                                required
                                value={startDateTime}
                                onChange={(e) => setStartDateTime(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Kapacita</label>
                                <input
                                    type="number"
                                    required
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Cena lístku (Kč)</label>
                                <input
                                    type="number"
                                    required
                                    value={ticketPrice}
                                    onChange={(e) => setTicketPrice(e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Popis akce</label>
                        <textarea
                            rows="2"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm cursor-pointer"
                        >
                            Zrušit
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold cursor-pointer"
                        >
                            Vytvořit akci
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {myEvents.map((ev) => {
                    const evBookings = bookings.filter((b) => b.eventId === ev.id);
                    return (
                        <div
                            key={ev.id}
                            className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="space-y-1.5">
                                <h2 className="text-lg font-bold text-white">{ev.title}</h2>
                                <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-violet-400" />
                                        {new Date(ev.startDateTime).toLocaleDateString("cs-CZ")}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5 text-violet-400" />
                                        Prodáno: {ev.soldTickets} / {ev.capacity}
                                    </span>
                                    <span>Bookingů: {evBookings.length}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/djs"
                                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                                >
                                    Bookovat DJs
                                </Link>
                                <Link
                                    to={`/organizer/scanner/${ev.id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
                                >
                                    <QrCode className="w-4 h-4" />
                                    Otevřít QR Skener
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}