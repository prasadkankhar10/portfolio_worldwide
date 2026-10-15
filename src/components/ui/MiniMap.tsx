import React, { useEffect, useState, useRef, useMemo } from 'react';
import { globalPlayerState } from '../3d/Character';
import { globalCourierShipState } from '../3d/ShipFleetController';
import { STATION_MONUMENT_DEFS, type StationMonumentDef } from '../3d/StationMonuments';
import { useGameStore } from '../../store/useGameStore';
import { 
  Compass, Maximize2, Minimize2, Plus, Minus, 
  Ship, MapPin, Sparkles, Navigation, X, Layers, ExternalLink
} from 'lucide-react';

// World Coordinate Bounds covering entire island and harbor bay
const WORLD_BOUNDS = {
  minX: -130,
  maxX: 130,
  minZ: -140,
  maxZ: 165
};

// Region boundaries detection helper
function getRegionName(x: number, z: number): string {
  if (z > 95 && x > 60) return 'Harbor Pier & Maritime Gate';
  if (z < -65 && x < 15) return 'Citadel Summit & High Watchtower';
  if (z > 15 && x < -10 && x > -75) return 'Sacred Grove & Mana Well';
  if (x < -60 && z < 15 && z > -70) return 'Industrial Quarter & Forge';
  if (z >= -45 && z <= 25 && x >= 5 && x <= 75) return 'Village Square & Bazaar';
  if (z > 30 && x > 15 && x < 55) return 'Stonehenge Megaliths';
  if (z > 140) return 'Outer Ocean Channel';
  return 'Wilderness Trails';
}

export const MiniMap: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const isMobile = useGameStore((s) => s.isMobile);
  const isStationModalOpen = useGameStore((s) => s.isStationModalOpen);
  const isTrackerOpen = useGameStore((s) => s.isTrackerOpen);
  const isQuickPortfolioOpen = useGameStore((s) => s.isQuickPortfolioOpen);
  const isWatchingVessel = useGameStore((s) => s.isWatchingVessel);

  const setActiveStationId = useGameStore((s) => s.setActiveStationId);
  const setStationModalOpen = useGameStore((s) => s.setStationModalOpen);
  const teleportPlayer = useGameStore((s) => s.teleportPlayer);

  // Mini-map local state: always start expanded so player immediately sees astrolabe radar
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpandedModal, setIsExpandedModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<1 | 2>(1); // 1 = Full Island, 2 = Local Radar
  const [hoveredStation, setHoveredStation] = useState<StationMonumentDef | null>(null);
  const [selectedStation, setSelectedStation] = useState<StationMonumentDef | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Real-time tracking data updated via requestAnimationFrame
  const [playerCoord, setPlayerCoord] = useState({ x: 93.6, y: 3.2, z: 126.1, headingDeg: 0 });
  const [shipCoord, setShipCoord] = useState({ x: 106.04, z: 142.04, isMoving: false });

  // Animation loop to sample positions smoothly without React re-render lag
  useEffect(() => {
    let animId: number;
    let lastUpdate = 0;

    const loop = (timestamp: number) => {
      // Throttle state update to ~30fps for minimal CPU impact while keeping buttery smooth needle rotation
      if (timestamp - lastUpdate > 32) {
        lastUpdate = timestamp;

        // 1. Read player transform
        const pos = globalPlayerState.position;
        const q = globalPlayerState.quaternion;

        // Calculate heading angle in degrees (North = 0, East = 90, South = 180, West = 270)
        // In Three.js: -Z is North, +X is East, +Z is South, -X is West
        const forward = {
          x: 2 * (q.x * q.z + q.w * q.y),
          z: 1 - 2 * (q.x * q.x + q.y * q.y)
        };
        const headingRad = Math.atan2(forward.x, forward.z);
        const headingDeg = (headingRad * 180) / Math.PI;

        setPlayerCoord({
          x: pos.x,
          y: pos.y,
          z: pos.z,
          headingDeg
        });

        // 2. Read courier ship position
        const sPos = globalCourierShipState.position;
        setShipCoord({
          x: sPos.x,
          z: sPos.z,
          isMoving: globalCourierShipState.isMoving
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Keyboard shortcut: Press 'N' to toggle full expedition map or listen for toggle-world-map event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'N') {
        if (!isStationModalOpen && !isTrackerOpen && !isQuickPortfolioOpen) {
          setIsExpandedModal((prev) => !prev);
        }
      }
    };
    const handleToggleEvent = () => {
      setIsExpandedModal((prev) => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle-world-map', handleToggleEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-world-map', handleToggleEvent);
    };
  }, [isStationModalOpen, isTrackerOpen, isQuickPortfolioOpen]);

  // World to map percentage conversion
  const worldToMap = (x: number, z: number, zoom: 1 | 2 = 1) => {
    if (zoom === 1) {
      const left = ((x - WORLD_BOUNDS.minX) / (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX)) * 100;
      const top = ((z - WORLD_BOUNDS.minZ) / (WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ)) * 100;
      return {
        left: `${Math.min(96, Math.max(4, left))}%`,
        top: `${Math.min(96, Math.max(4, top))}%`
      };
    } else {
      // Local radar centered on player within 60m radius
      const radarRadius = 65;
      const dx = x - playerCoord.x;
      const dz = z - playerCoord.z;
      const left = 50 + (dx / radarRadius) * 45;
      const top = 50 + (dz / radarRadius) * 45;
      return {
        left: `${Math.min(96, Math.max(4, left))}%`,
        top: `${Math.min(96, Math.max(4, top))}%`
      };
    }
  };

  const currentRegion = useMemo(() => {
    return getRegionName(playerCoord.x, playerCoord.z);
  }, [playerCoord.x, playerCoord.z]);

  const playerPercent = worldToMap(playerCoord.x, playerCoord.z, zoomLevel);
  const shipPercent = worldToMap(shipCoord.x, shipCoord.z, zoomLevel);

  if (gameState !== 'playing' && !isExpandedModal) return null;
  if (isWatchingVessel) return null;

  const isModalActive = isStationModalOpen || isTrackerOpen || isQuickPortfolioOpen;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. CORNER MINI-MAP (Bottom-Right HUD) */}
      {/* ========================================================================= */}
      {!isModalActive && (
        <div className="fixed bottom-5 right-5 z-50 pointer-events-auto flex flex-col items-end gap-2 animate-in fade-in duration-500">
        
        {/* Collapsed Compact Compass Pill */}
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#182522]/90 hover:bg-[#182522] border border-[#D4B777]/40 shadow-xl backdrop-blur-md text-[#E9E4D7] hover:text-[#D4B777] font-sans text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Expand Astrolabe Mini-Map"
          >
            <Compass className="w-4 h-4 text-[#D4B777] animate-spin-slow" />
            <span className="font-heading font-semibold text-xs tracking-wide">Mini-Map</span>
            <span className="text-[10px] font-mono text-[#527C68]">[{currentRegion.split(' ')[0]}]</span>
          </button>
        ) : (
          /* Expanded Astrolabe Radar Circular Widget */
          <div className="relative group flex flex-col items-center">
            
            {/* Top Toolbar (Zoom, Full-Screen Expand, Collapse) */}
            <div className="flex items-center gap-1.5 mb-1.5 bg-[#182522]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#527C68]/30 shadow-md">
              <button
                onClick={() => setZoomLevel((z) => (z === 1 ? 2 : 1))}
                className="p-1 rounded-full hover:bg-[#527C68]/30 text-[#E9E4D7]/75 hover:text-[#D4B777] transition-colors cursor-pointer"
                title={zoomLevel === 1 ? 'Zoom to Local Radar (2x)' : 'Zoom to Island Overview (1x)'}
              >
                {zoomLevel === 1 ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              </button>

              <div className="w-[1px] h-3 bg-[#527C68]/40" />

              <button
                onClick={() => setIsExpandedModal(true)}
                className="p-1 rounded-full hover:bg-[#527C68]/30 text-[#E9E4D7]/75 hover:text-[#D4B777] transition-colors cursor-pointer"
                title="Open Expedition World Map (N)"
              >
                <Maximize2 className="w-3 h-3" />
              </button>

              <div className="w-[1px] h-3 bg-[#527C68]/40" />

              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded-full hover:bg-[#527C68]/30 text-[#E9E4D7]/75 hover:text-[#D4B777] transition-colors cursor-pointer"
                title="Collapse Mini-Map"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            </div>

            {/* Circular Radar Disk with Forest & Gold Bezel */}
            <div 
              className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-2 border-[#D4B777]/50 bg-[#182522]/95 backdrop-blur-xl shadow-[0_10px_35px_rgba(10,18,16,0.85)] overflow-hidden select-none cursor-crosshair"
              onClick={() => setIsExpandedModal(true)}
            >
              {/* Outer Decorative Astrolabe Ring & Cardinal Markers */}
              <div className="absolute inset-1 rounded-full border border-[#527C68]/30 pointer-events-none" />
              <div className="absolute inset-3 rounded-full border border-[#D4B777]/15 pointer-events-none" />
              
              {/* Cardinal Directions */}
              <span className="absolute top-1 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold text-[#D4B777] drop-shadow-sm">N</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#E9E4D7]/50">S</span>
              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#E9E4D7]/50">W</span>
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#E9E4D7]/50">E</span>

              {/* Stylized Island Topography SVG Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
                {/* Concentric Range Rings */}
                <circle cx="50" cy="50" r="18" stroke="#527C68" strokeWidth="0.5" strokeDasharray="1 3" strokeOpacity="0.4" />
                <circle cx="50" cy="50" r="32" stroke="#527C68" strokeWidth="0.5" strokeDasharray="1 3" strokeOpacity="0.3" />
                <circle cx="50" cy="50" r="44" stroke="#D4B777" strokeWidth="0.5" strokeOpacity="0.2" />

                {/* Island Landmass Contour (Stylized archipelago silhouette) */}
                <path
                  d="M50 14 C68 15 82 28 80 46 C79 58 86 68 84 80 C82 88 68 90 56 86 C48 83 38 88 28 85 C18 82 14 70 16 54 C18 42 22 34 32 22 C38 15 44 14 50 14 Z"
                  fill="#101a18"
                  fillOpacity="0.85"
                  stroke="#527C68"
                  strokeWidth="0.75"
                  strokeOpacity="0.6"
                />

                {/* Inner Ridge & Mountain Peak (Citadel) */}
                <path
                  d="M44 22 C52 20 60 25 58 32 C56 38 48 40 42 36 C38 32 38 24 44 22 Z"
                  fill="#527C68"
                  fillOpacity="0.25"
                  stroke="#D4B777"
                  strokeWidth="0.5"
                  strokeOpacity="0.35"
                />

                {/* Pier Boardwalk Line to Harbor */}
                <line x1="82" y1="78" x2="88" y2="85" stroke="#D4B777" strokeWidth="1.2" strokeOpacity="0.7" />
              </svg>

              {/* Landmark & Station Pins */}
              {STATION_MONUMENT_DEFS.map((station) => {
                const pos = worldToMap(station.pos[0], station.pos[2], zoomLevel);
                const isSelected = selectedStation?.id === station.id;
                return (
                  <button
                    key={station.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStation(station);
                    }}
                    onMouseEnter={() => setHoveredStation(station)}
                    onMouseLeave={() => setHoveredStation(null)}
                    style={{ left: pos.left, top: pos.top }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 p-0.5 rounded-full cursor-pointer transition-transform hover:scale-150 z-20 group"
                    title={station.name}
                  >
                    <span 
                      className={`block w-2 h-2 rounded-full shadow-sm transition-all ${
                        isSelected ? 'ring-2 ring-white scale-125' : ''
                      }`}
                      style={{ 
                        backgroundColor: station.color,
                        boxShadow: `0 0 6px ${station.color}`
                      }} 
                    />
                  </button>
                );
              })}

              {/* Royal Courier Ship Tracker Blip */}
              <div 
                style={{ left: shipPercent.left, top: shipPercent.top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 transition-all duration-300"
                title="Royal Courier Vessel"
              >
                <div className="relative flex items-center justify-center">
                  <Ship className={`w-3.5 h-3.5 text-[#D4B777] drop-shadow-[0_0_6px_rgba(212,183,119,0.8)] ${shipCoord.isMoving ? 'animate-pulse' : ''}`} />
                </div>
              </div>

              {/* Real-Time Player Blip with Vision Cone & Direction */}
              <div 
                style={{ left: playerPercent.left, top: playerPercent.top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-all duration-75"
              >
                <div 
                  style={{ transform: `rotate(${playerCoord.headingDeg}deg)` }}
                  className="relative flex items-center justify-center transition-transform duration-75"
                >
                  {/* Subtle Forward Vision Cone */}
                  <div className="absolute -top-3 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[9px] border-b-[#D4B777]/80" />
                  {/* Center Dot */}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D4B777] border border-[#182522] shadow-[0_0_10px_#D4B777]" />
                </div>
              </div>

              {/* Hovered Station Tooltip */}
              {hoveredStation && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-[#182522]/95 border border-[#D4B777]/50 text-[10px] font-heading font-semibold text-[#D4B777] whitespace-nowrap shadow-xl pointer-events-none z-40 max-w-[85%] truncate text-center">
                  {hoveredStation.name}
                </div>
              )}
            </div>

            {/* Bottom Coordinates & Region Ticker */}
            <div className="mt-1.5 px-3 py-1 rounded-full bg-[#182522]/90 border border-[#527C68]/30 shadow-md text-center max-w-[210px]">
              <p className="text-[10px] font-heading font-semibold text-[#D4B777] truncate">
                {currentRegion}
              </p>
              <p className="text-[9px] font-mono text-[#E9E4D7]/60">
                X: {playerCoord.x.toFixed(1)} · Z: {playerCoord.z.toFixed(1)}
              </p>
            </div>

          </div>
        )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EXPEDITION WORLD MAP MODAL (Full Interactive Cartography) */}
      {/* ========================================================================= */}
      {isExpandedModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#101a18]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300 pointer-events-auto select-none"
          onClick={() => setIsExpandedModal(false)}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[92vh] bg-[#182522] border border-[#D4B777]/40 rounded-3xl p-5 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#527C68]/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#527C68]/20 border border-[#D4B777]/30 flex items-center justify-center text-[#D4B777]">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-[#E9E4D7] tracking-tight">
                    Archipelago Expedition Map
                  </h3>
                  <p className="text-xs text-[#E9E4D7]/70 font-sans">
                    26 Landmark Stations · Real-Time Nautical Courier Tracker · Click to Inspect or Fast-Travel
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsExpandedModal(false)}
                className="w-8 h-8 rounded-full bg-[#101a18] hover:bg-[#527C68]/20 border border-[#527C68]/30 text-[#E9E4D7]/70 hover:text-[#D4B777] flex items-center justify-center transition-colors cursor-pointer"
                title="Close Map (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar shrink-0 text-xs">
              {[
                { id: 'all', label: 'All Stations (26)' },
                { id: 'contact', label: 'Connect & Harbor' },
                { id: 'projects', label: 'Software Projects' },
                { id: 'academics', label: 'Academics & CS50x' },
                { id: 'magic', label: 'Citadel & Sanctuaries' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-full font-heading font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === tab.id
                      ? 'bg-[#D4B777] text-[#182522] shadow-sm'
                      : 'bg-[#101a18]/70 hover:bg-[#101a18] text-[#E9E4D7]/75 hover:text-[#E9E4D7] border border-[#527C68]/25'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Large Interactive Map Canvas Area */}
            <div className="relative flex-1 min-h-[380px] sm:min-h-[460px] bg-[#101a18] border border-[#527C68]/25 rounded-2xl overflow-hidden my-2 shadow-inner">
              
              {/* Compass Rose / Background Grid Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#527C68_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

              {/* Large Island Contour Graphic */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
                {/* Island Landmass */}
                <path
                  d="M50 12 C68 13 84 26 82 48 C80 62 88 72 85 84 C82 92 68 94 54 88 C46 84 36 90 26 86 C16 82 12 68 15 50 C17 38 22 28 32 18 C38 13 44 12 50 12 Z"
                  fill="#14201c"
                  stroke="#527C68"
                  strokeWidth="0.6"
                  strokeOpacity="0.7"
                />
                {/* Coastal Reefs */}
                <path
                  d="M48 9 C72 10 88 24 86 50 C84 66 92 76 89 88 C85 96 66 98 52 92 C42 88 32 94 22 90 C12 86 8 70 11 48 C14 34 20 22 30 14 C36 9 42 9 48 9 Z"
                  stroke="#527C68"
                  strokeWidth="0.3"
                  strokeDasharray="2 2"
                  strokeOpacity="0.3"
                />
              </svg>

              {/* Map Pins */}
              {STATION_MONUMENT_DEFS.filter((station) => {
                if (categoryFilter === 'contact') return station.id.includes('Harbor') || station.id.includes('Citadel');
                if (categoryFilter === 'projects') return station.id.includes('Project') || station.id.includes('Forge');
                if (categoryFilter === 'academics') return station.id.includes('Hall') || station.id.includes('Arena') || station.id.includes('Leadership');
                if (categoryFilter === 'magic') return station.id.includes('Moonwell') || station.id.includes('Stonehenge');
                return true;
              }).map((station) => {
                const pos = worldToMap(station.pos[0], station.pos[2], 1);
                const isSelected = selectedStation?.id === station.id;
                return (
                  <div
                    key={station.id}
                    style={{ left: pos.left, top: pos.top }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                  >
                    <button
                      onClick={() => setSelectedStation(station)}
                      className={`relative flex items-center justify-center p-1.5 rounded-full transition-all cursor-pointer ${
                        isSelected 
                          ? 'scale-125 ring-2 ring-[#D4B777] bg-[#182522]' 
                          : 'hover:scale-125'
                      }`}
                    >
                      <span 
                        className="w-3 h-3 rounded-full border border-[#182522] shadow-md block"
                        style={{ backgroundColor: station.color }}
                      />
                    </button>

                    {/* Pin Label Pill */}
                    <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 rounded bg-[#182522]/95 border border-[#D4B777]/40 text-[10px] font-heading font-bold text-[#E9E4D7] whitespace-nowrap shadow-lg pointer-events-none z-30">
                      {station.name}
                    </div>
                  </div>
                );
              })}

              {/* Royal Courier Ship on Large Map */}
              <div 
                style={{ left: shipPercent.left, top: shipPercent.top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
              >
                <div className="flex items-center gap-1 bg-[#182522]/90 border border-[#D4B777]/40 px-2 py-0.5 rounded-full shadow-lg">
                  <Ship className={`w-3.5 h-3.5 text-[#D4B777] ${shipCoord.isMoving ? 'animate-pulse' : ''}`} />
                  <span className="text-[9px] font-mono font-bold text-[#D4B777]">Courier Ship</span>
                </div>
              </div>

              {/* Player Position Marker */}
              <div 
                style={{ left: playerPercent.left, top: playerPercent.top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
              >
                <div 
                  style={{ transform: `rotate(${playerCoord.headingDeg}deg)` }}
                  className="relative flex items-center justify-center"
                >
                  <div className="absolute -top-4 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[12px] border-b-[#D4B777]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#D4B777] border-2 border-[#182522] shadow-[0_0_12px_#D4B777]" />
                </div>
              </div>

              {/* Selected Station Inspection Flyout Card */}
              {selectedStation && (
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-[#182522]/95 border border-[#D4B777]/50 p-4 rounded-2xl shadow-2xl backdrop-blur-xl z-40 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4B777] block font-bold">
                        Station Landmark
                      </span>
                      <h4 className="text-sm font-heading font-bold text-[#E9E4D7]">
                        {selectedStation.name}
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelectedStation(null)}
                      className="text-[#E9E4D7]/50 hover:text-[#E9E4D7] p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-[#E9E4D7]/75 font-sans mb-3">
                    Coordinates: [{selectedStation.pos[0].toFixed(1)}, {selectedStation.pos[2].toFixed(1)}] · Distance: ~
                    {Math.round(
                      Math.hypot(selectedStation.pos[0] - playerCoord.x, selectedStation.pos[2] - playerCoord.z)
                    )}m away
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsExpandedModal(false);
                        setActiveStationId(selectedStation.id);
                        setStationModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-[#D4B777] hover:bg-[#E5CD94] text-[#182522] font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Open Exhibit</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => {
                        teleportPlayer({
                          x: selectedStation.pos[0],
                          y: selectedStation.pos[1] + 0.5,
                          z: selectedStation.pos[2] + 2.0
                        });
                        setIsExpandedModal(false);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-[#527C68]/30 hover:bg-[#527C68]/50 border border-[#D4B777]/30 text-[#E9E4D7] font-heading font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-[#D4B777]" />
                      <span>Fast Travel</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#527C68]/20 text-[11px] font-sans text-[#E9E4D7]/70 shrink-0">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] shadow-sm" />
                  <span>Harbor & Connect</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shadow-sm" />
                  <span>Software Systems</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-sm" />
                  <span>CS50x & Academics</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9333ea] shadow-sm" />
                  <span>Citadel Summit</span>
                </span>
              </div>

              <div className="font-mono text-[#D4B777] text-[10px]">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[#101a18] border border-[#D4B777]/30 font-bold">N</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-[#101a18] border border-[#D4B777]/30 font-bold">ESC</kbd> to return
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
