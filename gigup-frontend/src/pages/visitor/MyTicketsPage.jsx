// Zobrazení QR vstupenek
// src/pages/visitor/MyTicketsPage.jsx
import { QRCodeSVG } from "qrcode.react";
import { Calendar, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { useGigup } from "../../context/GigupContext";

export default function MyTicketsPage() {
    const { tickets } = useGigup();

    return (
        <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                    Peněženka návštěvníka
                </span>
                <h1 className="text-3xl font-extrabold text-white mt-1">Moje vstupenky</h1>
                <p className="text-zinc-400 text-sm mt-1">
                    Ukaž QR kód u vstupu do klubu. Po naskenování se vstupenka automaticky označí jako použitá.
                </p>
            </div>

            {tickets.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-zinc-400">
                    Zatím nemáš žádné zakoupené vstupenky.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tickets.map((t) => (
                        <div
                            key={t.id}
                            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
                        >
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                    {t.status === "Valid" ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Platná
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                            <XCircle className="w-3.5 h-3.5" /> Použitá
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-xl font-bold text-white">{t.eventTitle}</h2>
                                <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                                    <MapPin className="w-3.5 h-3.5 text-violet-400" />
                                    {t.venueName}
                                </p>
                                <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                                    <Calendar className="w-3.5 h-3.5 text-violet-400" />
                                    {new Date(t.startDateTime).toLocaleString("cs-CZ")}
                                </p>
                                <p className="text-xs text-zinc-500 pt-1">
                                    Držitel: <span className="text-zinc-300">{t.holderName}</span> • {t.purchasePrice} Kč
                                </p>
                                <p className="font-mono text-[11px] text-zinc-500 break-all">{t.ticketCode}</p>
                            </div>

                            <div className="bg-white p-3 rounded-2xl shrink-0">
                                <QRCodeSVG value={t.ticketCode} size={132} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}