// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GigupProvider } from "./context/GigupContext";

import Navbar from "./components/Navbar";
import EventsPage from "./pages/public/EventsPage";
import EventDetailPage from "./pages/public/EventDetailPage";
import DjsPage from "./pages/public/DjsPage";
import MyTicketsPage from "./pages/visitor/MyTicketsPage";
import DjDashboard from "./pages/dj/DjDashboard";
import OrgDashboard from "./pages/organizer/OrgDashboard";
import QrScannerPage from "./pages/organizer/QrScannerPage";

export default function App() {
  return (
    <GigupProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-8">
            <Routes>
              {/* Veřejné stránky */}
              <Route path="/" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/djs" element={<DjsPage />} />

              {/* Návštěvník */}
              <Route path="/my-tickets" element={<MyTicketsPage />} />

              {/* DJ zóna */}
              <Route path="/dj/dashboard" element={<DjDashboard />} />

              {/* Pořadatelská zóna */}
              <Route path="/organizer/dashboard" element={<OrgDashboard />} />
              <Route path="/organizer/scanner/:eventId" element={<QrScannerPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </GigupProvider>
  );
}