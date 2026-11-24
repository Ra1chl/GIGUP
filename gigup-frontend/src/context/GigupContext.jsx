// src/context/GigupContext.jsx
import { createContext, useContext, useState } from "react";
import {
    mockUsers,
    mockDjProfiles,
    mockOrganizerProfiles,
    mockEvents,
    mockBookings,
    mockTickets,
} from "../api/mockData";

const GigupContext = createContext(null);

export function GigupProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(mockUsers[0]); // Výchozí: DJ RAIVOX
    const [djs, setDjs] = useState(mockDjProfiles);
    const [events, setEvents] = useState(mockEvents);
    const [bookings, setBookings] = useState(mockBookings);
    const [tickets, setTickets] = useState(mockTickets);

    const switchUser = (userId) => {
        const found = mockUsers.find((u) => u.id === Number(userId));
        if (found) setCurrentUser(found);
    };

    const sendBookingOffer = ({ eventId, djProfileId, offeredPrice, setStartTime, setEndTime, organizerNote }) => {
        const ev = events.find((e) => e.id === Number(eventId));
        const dj = djs.find((d) => d.id === Number(djProfileId));
        if (!ev || !dj) return;

        const newBooking = {
            id: Date.now(),
            eventId: ev.id,
            eventTitle: ev.title,
            venueName: ev.venueName,
            eventDate: ev.startDateTime.split("T")[0],
            djProfileId: dj.id,
            djStageName: dj.stageName,
            djGenres: dj.genres,
            offeredPrice: Number(offeredPrice),
            setStartTime,
            setEndTime,
            status: "Pending",
            organizerNote,
            djNote: "",
        };
        setBookings((prev) => [newBooking, ...prev]);
    };

    const respondToBooking = (bookingId, status, newPrice = null, djNote = "") => {
        setBookings((prev) =>
            prev.map((b) =>
                b.id === bookingId
                    ? {
                        ...b,
                        status,
                        offeredPrice: newPrice !== null ? Number(newPrice) : b.offeredPrice,
                        djNote: djNote || b.djNote,
                    }
                    : b
            )
        );
    };

    const createEvent = (eventData) => {
        const org = mockOrganizerProfiles.find((o) => o.id === currentUser?.organizerProfileId);
        const newEvent = {
            id: Date.now(),
            organizerId: org ? org.id : 1,
            organizerName: org ? org.organizationName : "Pražský Promotér",
            ...eventData,
            capacity: Number(eventData.capacity),
            ticketPrice: Number(eventData.ticketPrice),
            soldTickets: 0,
            status: "Published",
        };
        setEvents((prev) => [newEvent, ...prev]);
        return newEvent;
    };

    const purchaseTicket = (eventId) => {
        const ev = events.find((e) => e.id === Number(eventId));
        if (!ev) return null;

        const randomHex = Array.from({ length: 20 }, () =>
            Math.floor(Math.random() * 16).toString(16).toUpperCase()
        ).join("");

        const newTicket = {
            id: Date.now(),
            eventId: ev.id,
            eventTitle: ev.title,
            venueName: ev.venueName,
            startDateTime: ev.startDateTime,
            userId: currentUser ? currentUser.id : 4,
            holderName: currentUser ? currentUser.fullName : "Host",
            ticketCode: `GIGUP-${randomHex}`,
            purchasePrice: ev.ticketPrice,
            status: "Valid",
            purchasedAt: new Date().toISOString(),
            scannedAt: null,
        };

        setTickets((prev) => [newTicket, ...prev]);
        setEvents((prev) =>
            prev.map((e) => (e.id === ev.id ? { ...e, soldTickets: e.soldTickets + 1 } : e))
        );
        return newTicket;
    };

    const validateTicketCode = (code, expectedEventId = null) => {
        const cleanCode = code.trim();
        const ticket = tickets.find((t) => t.ticketCode === cleanCode);

        if (!ticket) {
            return { ok: false, reason: "INVALID", message: "Neplatná vstupenka! Kód neexistuje." };
        }
        if (expectedEventId && ticket.eventId !== Number(expectedEventId)) {
            return {
                ok: false,
                reason: "WRONG_EVENT",
                message: `Vstupenka patří na jinou akci (${ticket.eventTitle}).`,
            };
        }
        if (ticket.status === "Used") {
            return {
                ok: false,
                reason: "ALREADY_USED",
                message: `POZOR! Vstupenka již byla použita (${new Date(ticket.scannedAt).toLocaleTimeString()}).`,
                ticket,
            };
        }

        const now = new Date().toISOString();
        setTickets((prev) =>
            prev.map((t) => (t.id === ticket.id ? { ...t, status: "Used", scannedAt: now } : t))
        );

        return {
            ok: true,
            reason: "VALID",
            message: `Vstup povolen: ${ticket.holderName}`,
            ticket: { ...ticket, status: "Used", scannedAt: now },
        };
    };

    return (
        <GigupContext.Provider
            value={{
                users: mockUsers,
                currentUser,
                switchUser,
                djs,
                events,
                bookings,
                tickets,
                sendBookingOffer,
                respondToBooking,
                createEvent,
                purchaseTicket,
                validateTicketCode,
            }}
        >
            {children}
        </GigupContext.Provider>
    );
}

export const useGigup = () => useContext(GigupContext);