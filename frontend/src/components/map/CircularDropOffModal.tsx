import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Clock, Phone, CheckCircle2, Filter, ExternalLink, Sparkles, Recycle, Crosshair } from 'lucide-react';

interface CircularCenter {
  id: string;
  name: string;
  category: 'dwcc' | 'ewaste' | 'hazardous' | 'reuse';
  ward: string;
  address: string;
  lat: number;
  lng: number;
  defaultDistanceKm: number;
  hours: string;
  phone: string;
  acceptedItems: string[];
  operator: string;
  mapsUrl: string;
}

const BENGALURU_CENTERS: CircularCenter[] = [
  {
    id: 'dwcc-indiranagar',
    name: 'BBMP Dry Waste Collection Centre (Indiranagar)',
    category: 'dwcc',
    ward: 'Ward 80 - Dayananda Nagar / Indiranagar',
    address: 'Near 12th Main Club Road, Indiranagar, Bengaluru, 560038',
    lat: 12.9716,
    lng: 77.6412,
    defaultDistanceKm: 1.4,
    hours: 'Mon - Sat: 8:00 AM - 4:00 PM',
    phone: '+91 80 2266 0000',
    acceptedItems: ['Clean PET Bottles', 'Cardboard & Tetra Pak', 'MLP Snacks Packets', 'Glass Jars'],
    operator: 'Hasiru Dala & BBMP',
    mapsUrl: 'https://maps.google.com/?q=BBMP+Dry+Waste+Collection+Centre+Indiranagar'
  },
  {
    id: 'ewaste-croma-koramangala',
    name: 'Hasiru Dala & CPCB Authorized E-Waste Kiosk',
    category: 'ewaste',
    ward: 'Ward 151 - Koramangala 4th Block',
    address: '80 Feet Road, Koramangala 4th Block, Bengaluru, 560034',
    lat: 12.9352,
    lng: 77.6245,
    defaultDistanceKm: 2.8,
    hours: 'Daily: 10:00 AM - 8:30 PM',
    phone: '+91 80 4123 9988',
    acceptedItems: ['Old Mobile Phones', 'Laptops & Chargers', 'PCB Boards', 'Li-ion Batteries'],
    operator: 'Hasiru Dala EPR Network',
    mapsUrl: 'https://maps.google.com/?q=E-Waste+Drop+Off+Koramangala+Bengaluru'
  },
  {
    id: 'dwcc-hsr',
    name: 'BBMP Sustainable DWCC & Swachh Hub (HSR Layout)',
    category: 'dwcc',
    ward: 'Ward 174 - HSR Layout Sector 2',
    address: '24th Main Road, Sector 2, HSR Layout, Bengaluru, 560102',
    lat: 12.9116,
    lng: 77.6389,
    defaultDistanceKm: 3.5,
    hours: 'Mon - Sun: 7:30 AM - 5:00 PM',
    phone: '+91 80 2572 1100',
    acceptedItems: ['Rigid Plastic (#2 HDPE, #5 PP)', 'Beverage Cans', 'Newspaper & Books', 'Thermocol'],
    operator: 'Solid Waste Management Round Table (SWMRT)',
    mapsUrl: 'https://maps.google.com/?q=HSR+Layout+Dry+Waste+Centre+Bengaluru'
  },
  {
    id: 'ewaste-whitefield',
    name: 'Whitefield Rising Community E-Waste & Battery Hub',
    category: 'hazardous',
    ward: 'Ward 84 - Hagadur / Whitefield',
    address: 'Near Inner Circle Park, Whitefield, Bengaluru, 560066',
    lat: 12.9698,
    lng: 77.7499,
    defaultDistanceKm: 6.2,
    hours: 'Tue - Sun: 9:00 AM - 6:00 PM',
    phone: '+91 98450 12345',
    acceptedItems: ['Button Cells & Alkaline Batteries', 'CFL Bulbs', 'Lead Acid Inverter Batteries', 'Expired Electronics'],
    operator: 'Whitefield Rising Eco Wing',
    mapsUrl: 'https://maps.google.com/?q=Whitefield+Rising+Recycling+Bengaluru'
  },
  {
    id: 'reuse-goonj',
    name: 'Goonj Urban Dropping Center (Clothes & Circular Re-use)',
    category: 'reuse',
    ward: 'Ward 143 - Old Airport Road',
    address: 'Sy No. 5/1, Channasandra, Near Kodihalli, Bengaluru, 560008',
    lat: 12.9569,
    lng: 77.6534,
    defaultDistanceKm: 4.1,
    hours: 'Mon - Sat: 10:00 AM - 5:30 PM',
    phone: '+91 80 4953 7887',
    acceptedItems: ['Clean Wearable Clothes', 'Household Utensils', 'School Bags & Footwear', 'Blankets & Linen'],
    operator: 'Goonj India',
    mapsUrl: 'https://maps.google.com/?q=Goonj+Bengaluru+Dropping+Center'
  }
];

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

interface CircularDropOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  city?: string;
}

export const CircularDropOffModal: React.FC<CircularDropOffModalProps> = ({
  isOpen,
  onClose,
  city = 'Bengaluru'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation access denied or unavailable:', err.message);
          setIsLocating(false);
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCenters = BENGALURU_CENTERS.filter((center) => {
    const matchesCategory = selectedCategory === 'all' || center.category === selectedCategory;
    const matchesSearch =
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.acceptedItems.some((item) => item.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="glass-card max-w-3xl w-full rounded-[32px] p-6 lg:p-8 relative border border-emerald-400/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <MapPin className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="font-display text-2xl text-white flex items-center gap-2">
                Local Circular Drop-Off Network
              </h3>
              <p className="text-xs text-white/60">
                Authorized BBMP Dry Waste Collection Centres (DWCC), E-Waste Kiosks, &amp; Re-use Hubs in {city}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-full bg-white/5 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills & Search */}
        <div className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Search by area (e.g. Indiranagar, HSR) or item (e.g. battery, PET bottle, laptop)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/60"
          />

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Centers' },
              { id: 'dwcc', label: 'Dry Waste / Plastic (DWCC)' },
              { id: 'ewaste', label: 'E-Waste & Mobiles' },
              { id: 'hazardous', label: 'Batteries & Bulbs' },
              { id: 'reuse', label: 'Clothes & Furniture Re-use' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-sm'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Centers Grid */}
        <div className="space-y-4">
          {filteredCenters.length > 0 ? (
            filteredCenters.map((center) => (
              <div
                key={center.id}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {center.operator}
                      </span>
                      {userLocation ? (
                        <span className="text-xs font-mono text-emerald-300 font-semibold flex items-center gap-1">
                          <Crosshair className="w-3 h-3 text-emerald-400 animate-pulse" />
                          {calculateHaversineKm(userLocation.lat, userLocation.lng, center.lat, center.lng)} km (Live GPS)
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-cyan-300 font-semibold">
                          ~{center.defaultDistanceKm} km away
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-white text-base mt-1">{center.name}</h4>
                  </div>

                  <a
                    href={center.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-emerald-500 hover:text-black text-white text-xs font-semibold transition-all border border-white/20 self-start sm:self-auto"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Get Directions
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>

                <div className="text-xs text-white/70 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
                  <span>{center.address}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 font-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{center.hours}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                    <span>{center.phone}</span>
                  </div>
                </div>

                {/* Accepted Items Badges */}
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-1.5">
                    Accepted Materials:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {center.acceptedItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-black/40 text-emerald-200 border border-emerald-500/20 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-white/50 text-sm">
              No circular centers found matching your query.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
