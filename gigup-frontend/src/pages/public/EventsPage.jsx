// src/pages/public/EventsPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Ticket, Search, Music } from "lucide-react";
import { useGigup } from "../../context/GigupContext";

export default function EventsPage() {
    const { events, bookings } = useGigup();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState("All");

    // Filtrujeme pouze publikované akce podle názvu, místa nebo města
    const filteredEvents = events.filter((ev) => {
        if (ev.status !== "Published") return false;
        const matchesCity = selectedCity === "All" || ev.city === selectedCity;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            ev.title.toLowerCase().includes(q) ||
            ev.venueName.toLowerCase().includes(q) ||
            ev.description.toLowerCase().includes(q);
        return matchesCity && matchesSearch;
    });

    // Získá seznam potvrzených DJs pro konkrétní akci
    const getConfirmedLineup = (eventId) => {
        return bookings
            .filter((b) => b.eventId === eventId && b.status === "Accepted")
            .sort((a, b) => a.setStartTime.localeCompare(b.setStartTime));
    };

    return (
        <div className="space-y-8">
            {/* Hero hlavička */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                        Klubová scéna & Eventy
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                        Nadcházející akce
                    </h1>
                    <p className="text-zinc-400 text-sm mt-2 max-w-xl">
                        Objevuj klubové noci, sleduj potvrzené lineupy v reálném čase a kup si QR vstupenku bez prostředníků.
                    </p>
                </div>

                {/* Vyhledávání a filtr města */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Hledat akci nebo klub..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                        />
                    </div>

                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                    >
                        <option value="All">Všechna města</option>
                        <option value="Praha">Praha</option>
                        <option value="Brno">Brno</option>
                    </select>
                </div>
            </div>

            {/* Výpis karet akcí */}
            {filteredEvents.length === 0 ? (
                <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
                    <p className="text-zinc-400">Žádné akce neodpovídají tvému hledání.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredEvents.map((ev) => {
                        const lineup = getConfirmedLineup(ev.id);
                        const dateFormatted = new Date(ev.startDateTime).toLocaleDateString("cs-CZ", {
                            weekday: "short",
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                        });
                        const timeFormatted = new Date(ev.startDateTime).toLocaleTimeString("cs-CZ", {
                            hour: "2-digit",
                            minute: "2-digit",
                        });

                        return (
                            <div
                                key={ev.id}
                                className="group bg-zinc-900/70 border border-zinc-800 hover:border-violet-500/50 rounded-2xl overflow-hidden flex flex-col transition-all"
                            >
                                {/* Obrázek akce */}
                                <div className="relative h-48 overflow-hidden bg-zinc-800">
                                    <img
                                        src={ev.coverImageUrl}
                                        alt={ev.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-zinc-950/85 backdrop-blur-sm border border-zinc-700 text-xs font-bold text-white">
                                        {ev.ticketPrice} Kč
                                    </div>
                                </div>

                                {/* Obsah karty */}
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <div className="flex items-center gap-3 text-xs text-violet-400 font-medium mb-1.5">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {dateFormatted} • {timeFormatted}
                                            </span>
                                        </div>

                                        <h2 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">
                                            {ev.title}
                                        </h2>

                                        <p className="flex items-center gap-1.5 text-zinc-400 text-xs mt-1">
                                            <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                            {ev.venueName}
                                        </p>

                                        {/* Automaticky propojený lineup */}
                                        <div className="mt-4 pt-3 border-t border-zinc-800/80">
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                                                <Music className="w-3.5 h-3.5" />
                                                <span>Potvrzený lineup:</span>
                                            </div>
                                            {lineup.length === 0 ? (
                                                <span className="text-xs text-zinc-500 italic">Lineup se připravuje...</span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {lineup.map((b) => (
                                                        <span
                                                            key={b.id}
                                                            className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-200 text-xs font-semibold"
                                                        >
                                                            {b.djStageName}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Patička karty */}
                                    <div className="pt-3 flex items-center justify-between gap-3">
                                        <span className="text-xs text-zinc-500">
                                            Zbývá {Math.max(0, ev.capacity - ev.soldTickets)} z {ev.capacity} míst
                                        </span>
                                        <Link
                                            to={`/events/${ev.id}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
                                        >
                                            <Ticket className="w-4 h-4" />
                                            Detail & Vstupenky
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}