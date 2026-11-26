import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:5013/api';
const GigupContext = createContext();

const USERS_LIST = [
    { id: 4, fullName: 'Jakub Svoboda', role: 'Visitor' },
    { id: 1, djProfileId: 1, fullName: 'DJ RAIVOX', role: 'DJ' },
    { id: 2, organizerId: 1, fullName: 'Storm Club Prague', role: 'Organizer' },
];

const toGenreArray = (genres) => {
    if (Array.isArray(genres)) return genres;
    if (typeof genres === 'string' && genres.trim() !== '') {
        return genres.split(',').map((g) => g.trim());
    }
    return [];
};

export function GigupProvider({ children }) {
    const [currentUserId, setCurrentUserId] = useState(4);
    const [events, setEvents] = useState([]);
    const [djs, setDjs] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentUser = USERS_LIST.find((u) => u.id === Number(currentUserId)) || USERS_LIST[0];
    const role = currentUser.role;

    const setRole = (newRole) => {
        const found = USERS_LIST.find((u) => u.role === newRole);
        if (found) setCurrentUserId(found.id);
    };

    const switchUser = (userId) => {
        setCurrentUserId(Number(userId));
    };

    const refreshAllData = useCallback(async () => {
        try {
            setError(null);
            const [eventsRes, djsRes, bookingsRes] = await Promise.all([
                fetch(`${API_BASE}/events`),
                fetch(`${API_BASE}/djs`),
                fetch(`${API_BASE}/bookings`),
            ]);

            if (!eventsRes.ok || !djsRes.ok || !bookingsRes.ok) {
                throw new Error('Nepodařilo se načíst data ze serveru.');
            }

            const [eventsData, djsData, bookingsData] = await Promise.all([
                eventsRes.json(),
                djsRes.json(),
                bookingsRes.json(),
            ]);

            const normalizedDjs = djsData.map((dj) => ({
                ...dj,
                genres: toGenreArray(dj.genres),
            }));

            const normalizedBookings = bookingsData.map((b) => ({
                ...b,
                djId: b.djProfileId,
                genres: toGenreArray(b.genres),
                dj: b.dj
                    ? { ...b.dj, genres: toGenreArray(b.dj.genres) }
                    : { id: b.djProfileId, stageName: b.djStageName, genres: toGenreArray(b.genres) },
            }));

            const normalizedEvents = eventsData.map((ev) => ({
                ...ev,
                lineup: Array.isArray(ev.lineup)
                    ? ev.lineup.map((item) => ({
                        ...item,
                        genres: toGenreArray(item.genres),
                    }))
                    : [],
            }));

            setEvents(normalizedEvents);
            setDjs(normalizedDjs);
            setBookings(normalizedBookings);

            if (role === 'Visitor') {
                const tRes = await fetch(`${API_BASE}/tickets/user/${currentUser.id}`);
                if (tRes.ok) setTickets(await tRes.json());
            }
        } catch (err) {
            console.error('API chyba:', err);
            setError('Backend na localhost:5013 neodpovídá.');
        } finally {
            setLoading(false);
        }
    }, [role, currentUser]);

    useEffect(() => {
        refreshAllData();
    }, [refreshAllData]);

    const purchaseTicket = async (eventId) => {
        const res = await fetch(`${API_BASE}/tickets/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: Number(eventId), userId: currentUser.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Chyba při nákupu vstupenky.');
        await refreshAllData();
        return data;
    };

    const sendBookingOffer = async ({ eventId, djProfileId, djId, offeredPrice, setStartTime, setEndTime, organizerNote }) => {
        const res = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventId: Number(eventId),
                djProfileId: Number(djProfileId ?? djId),
                offeredPrice: Number(offeredPrice),
                setStartTime: setStartTime.length === 5 ? `${setStartTime}:00` : setStartTime,
                setEndTime: setEndTime.length === 5 ? `${setEndTime}:00` : setEndTime,
                organizerNote,
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Chyba při odesílání nabídky.');
        await refreshAllData();
        return data;
    };

    const respondToBooking = async (bookingId, status, djNote = '', counterPrice = null) => {
        const res = await fetch(`${API_BASE}/bookings/${bookingId}/respond`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status,
                counterPrice: counterPrice ? Number(counterPrice) : null,
                djNote,
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Chyba při aktualizaci bookingu.');
        await refreshAllData();
        return data;
    };

    const scanTicketCode = async (ticketCode) => {
        const res = await fetch(`${API_BASE}/tickets/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticketCode }),
        });
        const data = await res.json();
        await refreshAllData();
        return data;
    };

    return (
        <GigupContext.Provider
            value={{
                role,
                setRole,
                users: USERS_LIST,
                currentUser,
                currentUserId,
                setCurrentUserId,
                switchUser,
                events,
                djs,
                bookings,
                tickets,
                loading,
                error,
                refreshAllData,
                buyTicket: purchaseTicket,
                purchaseTicket,
                sendBookingOffer,
                respondToBooking,
                scanTicketCode,
            }}
        >
            {children}
        </GigupContext.Provider>
    );
}

export const useGigup = () => useContext(GigupContext);