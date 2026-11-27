//Webová čtečka QR kódů u vstupu
// src/pages/organizer/QrScannerPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle2, AlertTriangle, ScanLine } from "lucide-react";
import { useGigup } from "../../context/GigupContext";

export default function QrScannerPage() {
    const { eventId } = useParams();
    const { events, tickets, validateTicketCode } = useGigup();
    const [manualCode, setManualCode] = useState("");
    const [scanResult, setScanResult] = useState(null);

    const currentEvent = events.find((e) => e.id === Number(eventId)) || events[0];

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 220, height: 220 } },
            false
        );

        scanner.render(
            async (decodedText) => {
                const res = await validateTicketCode(decodedText, currentEvent?.id);
                setScanResult(res);
            },
            () => { }
        );

        return () => {
            scanner.clear().catch(() => { });
        };
    }, [currentEvent?.id]);

    const handleManualCheck = async (e) => {
        e.preventDefault();
        if (!manualCode.trim()) return;
        const res = await validateTicketCode(manualCode);
        setScanResult(res);
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="border-b border-zinc-800 pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                    Odbavení u vstupu
                </span>
                <h1 className="text-2xl font-extrabold text-white mt-1">
                    QR Skener: {currentEvent?.title}
                </h1>
            </div>

            {/* Výsledek skenování */}
            {scanResult && (
                <div
                    className={`p-5 rounded-2xl border flex items-start gap-3 ${scanResult.ok
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        : "bg-rose-500/15 border-rose-500/40 text-rose-300"
                        }`}
                >
                    {scanResult.ok ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    ) : (
                        <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                    )}
                    <div>
                        <p className="font-bold text-base">
                            {scanResult.ok ? "VSTUP POVOLEN" : "VSTUP ZAMÍTNUT"}
                        </p>
                        <p className="text-sm mt-0.5">{scanResult.message}</p>
                    </div>
                </div>
            )}

            {/* Webkamera */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 overflow-hidden">
                <div id="qr-reader" className="w-full text-zinc-200" />
            </div>

            {/* Rychlé testovací ověření kódu bez kamery */}
            <form
                onSubmit={handleManualCheck}
                className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-3"
            >
                <label className="block text-xs font-semibold text-zinc-400">
                    Ruční ověření kódu vstupenky (pro rychlý test na jednom PC):
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Vlož kód např. GIGUP-9F8A7B6C5D4E3F2A1B0C"
                        className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white font-mono"
                    />
                    <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold cursor-pointer"
                    >
                        <ScanLine className="w-4 h-4" />
                        Ověřit
                    </button>
                </div>
                {tickets[0] && (
                    <button
                        type="button"
                        onClick={() => setManualCode(tickets[0].ticketCode)}
                        className="text-xs text-violet-400 hover:underline cursor-pointer"
                    >
                        Vyplnit kód poslední vstupenky ({tickets[0].ticketCode})
                    </button>
                )}
            </form>
        </div>
    );
}