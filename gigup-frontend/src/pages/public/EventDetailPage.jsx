//Obsahuje lineup z přijatých bookingů + nákup
// src/pages/public/EventDetailPage.jsx
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Ticket, Clock, Music, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useGigup } from "../../context/GigupContext";

export default function EventDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { events, bookings, purchaseTicket } = useGigup();
    const [purchasedTicket, setPurchasedTicket] = useState(null);

    const event = events.find((e) => e.id === Number(id));

    if (!event) {
        return (
            <div className="text-center py-20 space-y-4">
                <p className="text-zinc-400">Akce nebyla nalezena.</p>
                <Link to="/" className="text-violet-400 hover:underline text-sm">
                    ← Zpět na seznam akcí
                </Link>
            </div>
        );
    }

    // Automaticky sestavený lineup z potvrzených bookingů seřazený podle času setu
    const confirmedLineup = bookings
        .filter((b) => b.eventId === event.id && b.status === "Accepted")
        .sort((a, b) => a.setStartTime.localeCompare(b.setStartTime));

    const remainingCapacity = Math.max(0, event.capacity - event.soldTickets);

    const handleBuyTicket = () => {
        const ticket = purchaseTicket(event.id);
        if (ticket) {
            setPurchasedTicket(ticket);
        }
    };

    const dateFormatted = new Date(event.startDateTime).toLocaleDateString("cs-CZ", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const timeFormatted = new Date(event.startDateTime).toLocaleTimeString("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="space-y-8">
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Zpět na všechny akce
            </Link>

            {/* Hlavní banner akce */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="relative h-64 sm:h-80 bg-zinc-800">
                    <img
                        src={event.coverImageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <span className="px-3 py-1 rounded-full bg-violet-600/90 text-white text-xs font-bold">
                            {event.organizerName}
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
                            {event.title}
                        </h1>
                    </div>
                </div>

                <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Levý sloupec: popis a lineup */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex flex-wrap gap-4 text-sm text-zinc-300">
                            <span className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3.5 py-2 rounded-xl">
                                <Calendar className="w-4 h-4 text-violet-400" />
                                {dateFormatted} • {timeFormatted}
                            </span>
                            <span className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3.5 py-2 rounded-xl">
                                <MapPin className="w-4 h-4 text-violet-400" />
                                {event.venueName}
                            </span>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-white mb-2">O akci</h2>
                            <p className="text-zinc-400 text-sm leading-relaxed">{event.description}</p>
                        </div>

                        {/* Automatický lineup */}
                        <div className="pt-4 border-t border-zinc-800">
                            <div className="flex items-center gap-2 mb-4">
                                <Music className="w-5 h-5 text-violet-400" />
                                <h2 className="text-lg font-bold text-white">Potvrzený Lineup & Časy setů</h2>
                            </div>

                            {confirmedLineup.length === 0 ? (
                                <p className="text-sm text-zinc-500 italic">
                                    Zatím nejsou potvrzeni žádní interpreti.
                                </p>
                            ) : (
                                <div className="space-y-2.5">
                                    {confirmedLineup.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className="flex items-center justify-between bg-zinc-950/80 border border-zinc-800/90 rounded-2xl px-4 py-3"
                                        >
                                            <div>
                                                <p className="font-bold text-white text-base">{slot.djStageName}</p>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {slot.djGenres.map((g) => (
                                                        <span
                                                            key={g}
                                                            className="text-xs px-2 py-0.5 rounded bg-violet-500/15 text-violet-300"
                                                        >
                                                            {g}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-xl">
                                                <Clock className="w-4 h-4" />
                                                {slot.setStartTime} – {slot.setEndTime}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pravý sloupec: nákup vstupenky */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 h-fit">
                        <div className="space-y-2">
                            <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                                Vstupné
                            </span>
                            <div className="text-3xl font-extrabold text-white">{event.ticketPrice} Kč</div>
                            <p className="text-xs text-zinc-400">
                                Zbývá {remainingCapacity} z {event.capacity} vstupenek
                            </p>
                        </div>

                        {purchasedTicket ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    Vstupenka zakoupena!
                                </div>
                                <p className="text-xs text-zinc-300">
                                    Kód: <span className="font-mono text-emerald-300">{purchasedTicket.ticketCode}</span>
                                </p>
                                <button
                                    onClick={() => navigate("/my-tickets")}
                                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Zobrazit QR vstupenku
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleBuyTicket}
                                disabled={remainingCapacity === 0}
                                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-sm transition-colors cursor-pointer"
                            >
                                <Ticket className="w-4 h-4" />
                                {remainingCapacity > 0 ? "Koupit QR vstupenku" : "Vyprodáno"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}