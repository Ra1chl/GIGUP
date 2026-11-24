//Přehled nabídek (Accept / Reject / CounterOffer)// src/pages/dj/DjDashboard.jsx
import { useState } from "react";
import { Calendar, Clock, Check, X, MessageSquare, Coins } from "lucide-react";
import { useGigup } from "../../context/GigupContext";

export default function DjDashboard() {
    const { currentUser, bookings, respondToBooking } = useGigup();
    const [counterOfferId, setCounterOfferId] = useState(null);
    const [counterPrice, setCounterPrice] = useState("");
    const [counterNote, setCounterNote] = useState("");

    // Filtrujeme bookingy patřící přihlášenému DJovi
    const myBookings = bookings.filter(
        (b) => b.djProfileId === currentUser?.djProfileId
    );

    const handleOpenCounter = (booking) => {
        setCounterOfferId(booking.id);
        setCounterPrice(booking.offeredPrice);
        setCounterNote("");
    };

    const handleSubmitCounter = (e, bookingId) => {
        e.preventDefault();
        respondToBooking(bookingId, "CounterOffered", counterPrice, counterNote);
        setCounterOfferId(null);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Accepted":
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Potvrzeno (V lineupu)</span>;
            case "Rejected":
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">Odmítnuto</span>;
            case "CounterOffered":
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">Odeslána protinabídka</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">Nová nabídka</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                    DJ Zóna
                </span>
                <h1 className="text-3xl font-extrabold text-white mt-1">
                    Moje bookingy a nabídky
                </h1>
                <p className="text-zinc-400 text-sm mt-1">
                    Po přijetí nabídky se automaticky propíšeš do veřejného lineupu dané akce.
                </p>
            </div>

            {myBookings.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-zinc-400">
                    Zatím nemáš žádné nabídky na vystoupení.
                </div>
            ) : (
                <div className="space-y-4">
                    {myBookings.map((b) => (
                        <div
                            key={b.id}
                            className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-lg font-bold text-white">{b.eventTitle}</h2>
                                    {getStatusBadge(b.status)}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-violet-400" />
                                        {b.venueName} ({b.eventDate})
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-violet-400" />
                                        Set: {b.setStartTime} – {b.setEndTime}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                                        <Coins className="w-3.5 h-3.5 text-emerald-400" />
                                        {b.offeredPrice} Kč
                                    </span>
                                </div>

                                {b.organizerNote && (
                                    <p className="text-xs text-zinc-400 bg-zinc-950/70 border border-zinc-800/80 rounded-xl px-3 py-2">
                                        <span className="text-zinc-500 font-medium">Pořadatel: </span>
                                        {b.organizerNote}
                                    </p>
                                )}

                                {b.djNote && (
                                    <p className="text-xs text-violet-300 bg-violet-950/20 border border-violet-500/20 rounded-xl px-3 py-2">
                                        <span className="text-violet-400 font-medium">Tvá odpověď: </span>
                                        {b.djNote}
                                    </p>
                                )}
                            </div>

                            {/* Tlačítka pro reakci na nabídku */}
                            {b.status === "Pending" && (
                                <div className="flex flex-wrap items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => respondToBooking(b.id, "Accepted", null, "Potvrzuji účast, díky za pozvání!")}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                                    >
                                        <Check className="w-4 h-4" />
                                        Přijmout
                                    </button>
                                    <button
                                        onClick={() => handleOpenCounter(b)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Jiná cena
                                    </button>
                                    <button
                                        onClick={() => respondToBooking(b.id, "Rejected", null, "Bohužel v tento termín nemohu.")}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                        Odmítnout
                                    </button>
                                </div>
                            )}

                            {/* Formulář protinabídky */}
                            {counterOfferId === b.id && (
                                <form
                                    onSubmit={(e) => handleSubmitCounter(e, b.id)}
                                    className="w-full md:w-80 bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2.5"
                                >
                                    <div>
                                        <label className="block text-xs text-zinc-400 mb-1">Navrhovaný honorář (Kč)</label>
                                        <input
                                            type="number"
                                            required
                                            value={counterPrice}
                                            onChange={(e) => setCounterPrice(e.target.value)}
                                            className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-400 mb-1">Poznámka pro pořadatele</label>
                                        <input
                                            type="text"
                                            placeholder="Např. kvůli dopravě mimo Prahu..."
                                            value={counterNote}
                                            onChange={(e) => setCounterNote(e.target.value)}
                                            className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCounterOfferId(null)}
                                            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs cursor-pointer"
                                        >
                                            Zrušit
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold cursor-pointer"
                                        >
                                            Odeslat protinabídku
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}