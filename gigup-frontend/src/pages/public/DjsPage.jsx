// src/pages/public/DjsPage.jsx
import { useState } from "react";
import { MapPin, Search, SlidersHorizontal, Send, ExternalLink } from "lucide-react";
import { useGigup } from "../../context/GigupContext";

export default function DjsPage() {
    const { djs, events, currentUser, sendBookingOffer } = useGigup();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("All");
    const [maxPrice, setMaxPrice] = useState(10000);
    const [statusBanner, setStatusBanner] = useState(null);

    // Stav pro modální okno odeslání nabídky (pro pořadatele)
    const [bookingDj, setBookingDj] = useState(null);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [offeredPrice, setOfferedPrice] = useState("");
    const [setStartTime, setSetStartTime] = useState("23:00");
    const [setEndTime, setSetEndTime] = useState("01:00");
    const [organizerNote, setOrganizerNote] = useState("");
    const [offerSentToast, setOfferSentToast] = useState(false);
    const [offerError, setOfferError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const allGenres = ["All", "Drum & Bass", "Neurofunk", "Techno", "Melodic Techno", "Tech-House", "House"];

    const filteredDjs = djs.filter((dj) => {
        const matchesSearch =
            dj.stageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dj.bio.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGenre = selectedGenre === "All" || dj.genres.includes(selectedGenre);
        const matchesPrice = dj.priceFrom <= maxPrice;
        return matchesSearch && matchesGenre && matchesPrice;
    });

    const activeOrganizerId = currentUser?.organizerId ?? currentUser?.organizerProfileId;
    const filteredOrganizerEvents = activeOrganizerId
        ? events.filter((e) => Number(e.organizerId) === Number(activeOrganizerId))
        : events;
    const organizerEvents = filteredOrganizerEvents.length > 0 ? filteredOrganizerEvents : events;

    const openBookingModal = (dj) => {
        const availableEvents = filteredOrganizerEvents.length > 0 ? filteredOrganizerEvents : events;
        setOfferError("");
        setStatusBanner(null);
        setBookingDj(dj);
        setOfferedPrice(dj.priceFrom);
        setSelectedEventId(availableEvents[0]?.id ? String(availableEvents[0].id) : "");
        setOrganizerNote("");
    };

    const handleSendOffer = async (e) => {
        e.preventDefault();
        setOfferError("");
        setStatusBanner(null);
        setIsSubmitting(true);
        try {
            await sendBookingOffer({
                eventId: selectedEventId,
                djProfileId: bookingDj.id,
                offeredPrice,
                setStartTime,
                setEndTime,
                organizerNote,
            });
            const successMsg = `Nabídka na vystoupení pro ${bookingDj.stageName} byla úspěšně odeslána!`;
            setStatusBanner({
                type: "success",
                text: successMsg,
            });
            setBookingDj(null);
            setOfferSentToast(true);
            setTimeout(() => setOfferSentToast(false), 3500);
        } catch (err) {
            const errorMsg = err.message || "Tomuto DJovi už byla na tuto akci odeslána nabídka.";
            setOfferError(errorMsg);
            setStatusBanner({
                type: "error",
                text: errorMsg,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Notifikace po odeslání nabídky */}
            {offerSentToast && (
                <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl font-medium text-sm">
                    Nabídka byla úspěšně odeslána DJovi!
                </div>
            )}

            {/* Hlavička a filtry */}
            <div className="border-b border-zinc-800 pb-6 space-y-4">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                        B2B Katalog interpretů
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                        DJs na GIGUP
                    </h1>
                    <p className="text-zinc-400 text-sm mt-2">
                        Najdi ideálního DJ podle žánru, rozpočtu a technických požadavků a pošli mu přímou nabídku.
                    </p>
                </div>

                {/* Lišta filtrů */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="relative">
                        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Hledat jméno DJ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                        />
                    </div>

                    <select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                    >
                        {allGenres.map((g) => (
                            <option key={g} value={g}>
                                {g === "All" ? "Všechny žánry" : g}
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center gap-3 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm">
                        <SlidersHorizontal className="w-4 h-4 text-zinc-500 shrink-0" />
                        <span className="text-zinc-400 whitespace-nowrap">Do {maxPrice} Kč</span>
                        <input
                            type="range"
                            min="2000"
                            max="10000"
                            step="500"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="w-full accent-violet-500 cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Stavový banner na stránce */}
            {statusBanner && (
                <div
                    className={`p-4 rounded-2xl border text-sm font-medium ${statusBanner.type === "success"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        : "bg-rose-500/15 border-rose-500/40 text-rose-300"
                        }`}
                >
                    {statusBanner.text}
                </div>
            )}

            {/* Karty DJů */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredDjs.map((dj) => (
                    <div
                        key={dj.id}
                        className="bg-zinc-900/70 border border-zinc-800 hover:border-violet-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all"
                    >
                        <div>
                            {/* Fotka */}
                            <div className="relative h-52 bg-zinc-800">
                                <img
                                    src={dj.profileImageUrl}
                                    alt={dj.stageName}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-zinc-950/85 backdrop-blur-sm text-xs font-medium text-zinc-200 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-violet-400" />
                                    {dj.city}
                                </div>
                                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-violet-600 text-xs font-bold text-white">
                                    od {dj.priceFrom} Kč
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-5 space-y-3">
                                <h2 className="text-xl font-bold text-white">{dj.stageName}</h2>

                                <div className="flex flex-wrap gap-1.5">
                                    {dj.genres.map((genre) => (
                                        <span
                                            key={genre}
                                            className="px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/20 text-xs font-medium"
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>

                                <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                                    {dj.bio}
                                </p>

                                <div className="pt-2 border-t border-zinc-800/80 text-xs text-zinc-500">
                                    <span className="font-semibold text-zinc-400">Tech Rider: </span>
                                    {dj.techRider}
                                </div>
                            </div>
                        </div>

                        {/* Akční tlačítka */}
                        <div className="p-5 pt-0 flex items-center gap-2">
                            <a
                                href={dj.soundCloudUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Poslechnout set
                            </a>

                            {currentUser?.role === "Organizer" && (
                                <button
                                    onClick={() => openBookingModal(dj)}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    Poslat nabídku
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modální okno pro odeslání nabídky DJovi (viditelné jen po kliknutí pořadatelem) */}
            {bookingDj && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white">
                            Nabídka vystoupení pro {bookingDj.stageName}
                        </h3>

                        <form onSubmit={handleSendOffer} className="space-y-4">
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Vyber svou akci</label>
                                <select
                                    required
                                    value={selectedEventId}
                                    onChange={(e) => setSelectedEventId(e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white"
                                >
                                    {organizerEvents.map((ev) => (
                                        <option key={ev.id} value={ev.id}>
                                            {ev.title} ({ev.startDateTime.split("T")[0]})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Honorář (Kč)</label>
                                    <input
                                        type="number"
                                        required
                                        value={offeredPrice}
                                        onChange={(e) => setOfferedPrice(e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Set od</label>
                                    <input
                                        type="time"
                                        required
                                        value={setStartTime}
                                        onChange={(e) => setSetStartTime(e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Set do</label>
                                    <input
                                        type="time"
                                        required
                                        value={setEndTime}
                                        onChange={(e) => setSetEndTime(e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Poznámka pro DJ</label>
                                <textarea
                                    rows="2"
                                    placeholder="Např. čas zvukovky, styl setu, technika na místě..."
                                    value={organizerNote}
                                    onChange={(e) => setOrganizerNote(e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white"
                                />
                            </div>

                            {offerError && (
                                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-medium">
                                    {offerError}
                                </div>
                            )}

                            {statusBanner && (
                                <div
                                    className={`p-4 rounded-2xl border text-sm font-medium ${statusBanner.type === "success"
                                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                                        : "bg-rose-500/15 border-rose-500/40 text-rose-300"
                                        }`}
                                >
                                    {statusBanner.text}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setBookingDj(null)}
                                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium cursor-pointer"
                                >
                                    Zrušit
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-semibold cursor-pointer"
                                >
                                    {isSubmitting ? "Odesílám..." : "Odeslat nabídku"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}