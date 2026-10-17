import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { globalPlayerState } from '../3d/Character';
import { globalCourierShipState } from '../3d/ShipFleetController';
import { STATION_MONUMENT_DEFS, type StationMonumentDef } from '../3d/StationMonuments';
import { useGameStore } from '../../store/useGameStore';
import { soundEngine } from '../../utils/soundEngine';
import { 
  Compass, Maximize2, Minimize2, 
  Ship, MapPin, Navigation, X, ExternalLink, Search, Locate
} from 'lucide-react';

// Exact mathematical bounds corresponding to top-down orthographic render from Blender
// Camera center: X = -0.5, Blender Y = -31.0 (Three.js Z = 31.0)
// Camera Ortho Scale: 390.0 units square (1536 x 1536)
const MAP_BOUNDS = {
  minX: -195.5,
  maxX: 194.5,
  minZ: -164.0,
  maxZ: 226.0,
  span: 390.0
};

// URL to rendered satellite island terrain texture
const MAP_TEXTURE_URL = `${import.meta.env.BASE_URL}textures/island_map.png`;

// Static vectors for telemetry heading without GC overhead
const _charForward = new THREE.Vector3(0, 0, 1);
const _tempForward = new THREE.Vector3();

// Telemetry Cardinal Heading Helper (North = 0°, East = 90°, South = 180°, West = 270°)
function getCardinalDirection(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return 'N';
  if (normalized >= 22.5 && normalized < 67.5) return 'NE';
  if (normalized >= 67.5 && normalized < 112.5) return 'E';
  if (normalized >= 112.5 && normalized < 157.5) return 'SE';
  if (normalized >= 157.5 && normalized < 202.5) return 'S';
  if (normalized >= 202.5 && normalized < 247.5) return 'SW';
  if (normalized >= 247.5 && normalized < 292.5) return 'W';
  return 'NW';
}

// Detect active region from world coordinates
function getRegionName(x: number, z: number): string {
  if (z > 95 && x > 60) return 'Harbor Pier & Maritime Gate';
  if (z < -65 && x < 15) return 'Citadel Summit & High Watchtower';
  if (z > 15 && x < -10 && x > -75) return 'Sacred Grove & Mana Well';
  if (x < -60 && z < 15 && z > -70) return 'Industrial Quarter & Forge';
  if (z >= -45 && z <= 25 && x >= 5 && x <= 75) return 'Village Square & Marketplace';
  if (z > 30 && x > 15 && x < 55) return 'Stonehenge Ancient Megaliths';
  if (z > 140) return 'Outer Ocean Channel';
  return 'Wilderness Trails';
}

export const MiniMap: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const isStationModalOpen = useGameStore((s) => s.isStationModalOpen);
  const isTrackerOpen = useGameStore((s) => s.isTrackerOpen);
  const isQuickPortfolioOpen = useGameStore((s) => s.isQuickPortfolioOpen);
  const isWatchingVessel = useGameStore((s) => s.isWatchingVessel);

  const setActiveStationId = useGameStore((s) => s.setActiveStationId);
  const setStationModalOpen = useGameStore((s) => s.setStationModalOpen);
  const teleportPlayer = useGameStore((s) => s.teleportPlayer);
  const activeWaypointStationId = useGameStore((s) => s.activeWaypointStationId);
  const setActiveWaypointStationId = useGameStore((s) => s.setActiveWaypointStationId);

  // Radar modes: 'follow' (zoomed in, player-centered) or 'overview' (whole island view)
  const [radarMode, setRadarMode] = useState<'follow' | 'overview'>('follow');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpandedModal, setIsExpandedModal] = useState(false);
  const [hoveredStation, setHoveredStation] = useState<StationMonumentDef | null>(null);
  const [selectedStation, setSelectedStation] = useState<StationMonumentDef | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sample real-time player and ship positions via requestAnimationFrame (~30fps throttled)
  const [playerCoord, setPlayerCoord] = useState({ x: 93.6, y: 3.2, z: 126.1, headingDeg: 0 });
  const [shipCoord, setShipCoord] = useState({ x: 106.04, z: 142.04, isMoving: false });

  useEffect(() => {
    let animId: number;
    let lastUpdate = 0;

    const loop = (timestamp: number) => {
      if (timestamp - lastUpdate > 32) {
        lastUpdate = timestamp;

        // 1. Read player transform and synchronized camera heading from 3D Character
        const pos = globalPlayerState.position;
        const headingDeg = globalPlayerState.headingDeg;

        setPlayerCoord({
          x: pos.x,
          y: pos.y,
          z: pos.z,
          headingDeg
        });

        // 2. Read royal courier ship position
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

  // Keyboard shortcut: Press 'N' to toggle full expedition map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'N') {
        if (!isStationModalOpen && !isTrackerOpen && !isQuickPortfolioOpen) {
          setIsExpandedModal((prev) => !prev);
        }
      }
      if (e.key === 'Escape' && isExpandedModal) {
        setIsExpandedModal(false);
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
  }, [isExpandedModal, isStationModalOpen, isTrackerOpen, isQuickPortfolioOpen]);

  // Convert 3D world coordinates to percentage of map canvas
  const worldToPercent = (x: number, z: number) => {
    const left = ((x - MAP_BOUNDS.minX) / MAP_BOUNDS.span) * 100;
    const top = ((z - MAP_BOUNDS.minZ) / MAP_BOUNDS.span) * 100;
    return {
      left: Math.min(99, Math.max(1, left)),
      top: Math.min(99, Math.max(1, top))
    };
  };

  const playerPercent = worldToPercent(playerCoord.x, playerCoord.z);
  const shipPercent = worldToPercent(shipCoord.x, shipCoord.z);

  const currentRegion = useMemo(() => {
    return getRegionName(playerCoord.x, playerCoord.z);
  }, [playerCoord.x, playerCoord.z]);

  // Filter stations for the Expedition Modal
  const filteredStations = useMemo(() => {
    return STATION_MONUMENT_DEFS.filter((station) => {
      if (categoryFilter === 'harbor' && !station.id.includes('Harbor') && !station.id.includes('CME') && !station.id.includes('Certifications')) return false;
      if (categoryFilter === 'projects' && !station.id.includes('Project')) return false;
      if (categoryFilter === 'cs50' && !station.id.includes('Certifications') && !station.id.includes('Arena')) return false;
      if (categoryFilter === 'citadel' && !station.id.includes('Moonwell') && !station.id.includes('Megalith')) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return station.name.toLowerCase().includes(query) || station.id.toLowerCase().includes(query);
      }
      return true;
    });
  }, [categoryFilter, searchQuery]);

  if (gameState !== 'playing' && !isExpandedModal) return null;
  if (isWatchingVessel) return null;

  const isModalActive = isStationModalOpen || isTrackerOpen || isQuickPortfolioOpen;

  // Zoom scale for follow radar mode
  const followZoom = 3.2;

  // Sleek AAA Navigator Arrow Beacon with integrated direction chevron & soft FOV wedge
  const renderNavigatorArrow = (isOverview = false) => (
    <div 
      style={{ transform: `rotate(${playerCoord.headingDeg}deg)` }}
      className="relative flex items-center justify-center transition-transform duration-75"
    >
      <svg 
        viewBox="-16 -16 32 32" 
        className={`${isOverview ? 'w-6 h-6' : 'w-8 h-8'} drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] pointer-events-none`}
      >
        {/* Soft forward FOV vision fan (flashlight beam) */}
        <path 
          d="M 0 0 L -10 -18 A 21 21 0 0 1 10 -18 Z" 
          fill="#D4B777" 
          fillOpacity="0.28" 
        />
        {/* Crisp Golden Navigator Arrow Chevron */}
        <path 
          d="M 0 -11 L 6.5 6 L 0 2.8 L -6.5 6 Z" 
          fill="#D4B777" 
          stroke="#182522" 
          strokeWidth="1.2" 
          strokeLinejoin="round" 
        />
        {/* Glowing Emerald Core */}
        <circle cx="0" cy="0.5" r="2.2" fill="#10b981" stroke="#064e3b" strokeWidth="0.6" />
      </svg>
    </div>
  );

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. CORNER MINI-MAP (Bottom-Right HUD Radar Widget) */}
      {/* ========================================================================= */}
      {!isModalActive && (
        <div className="fixed bottom-5 right-5 z-50 pointer-events-auto flex flex-col items-end gap-2 animate-in fade-in duration-500 select-none">
          
          {/* Collapsed Compact Astrolabe Pill */}
          {isCollapsed ? (
            <button
              onClick={() => setIsCollapsed(false)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#182522]/95 hover:bg-[#182522] border border-[#D4B777]/50 shadow-[0_10px_25px_rgba(0,0,0,0.7)] backdrop-blur-md text-[#E9E4D7] hover:text-[#D4B777] font-sans text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Expand Astrolabe Mini-Map"
            >
              <Compass className="w-4 h-4 text-[#D4B777] animate-spin-slow" />
              <span className="font-heading font-semibold text-xs tracking-wide">Mini-Map</span>
              <span className="text-[10px] font-mono text-[#527C68]">[{currentRegion.split(' ')[0]}]</span>
            </button>
          ) : (
            /* Expanded Circular Astrolabe Radar */
            <div className="relative group flex flex-col items-center">
              
              {/* Header Controls Pill: Follow/Island Toggle, Expand, Collapse */}
              <div className="flex items-center gap-1.5 mb-1.5 bg-[#182522]/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#D4B777]/30 shadow-lg">
                <button
                  onClick={() => setRadarMode((m) => (m === 'follow' ? 'overview' : 'follow'))}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                    radarMode === 'follow'
                      ? 'bg-[#D4B777]/25 text-[#D4B777] border border-[#D4B777]/40'
                      : 'text-[#E9E4D7]/70 hover:text-[#E9E4D7]'
                  }`}
                  title="Toggle Local Player Radar / Full Island View"
                >
                  <Locate className="w-3 h-3" />
                  <span>{radarMode === 'follow' ? 'Local Radar' : 'Island View'}</span>
                </button>

                <div className="w-[1px] h-3 bg-[#527C68]/40" />

                <button
                  onClick={() => setIsExpandedModal(true)}
                  className="p-1 rounded-full hover:bg-[#527C68]/30 text-[#E9E4D7]/75 hover:text-[#D4B777] transition-colors cursor-pointer"
                  title="Open Full Expedition Map (N)"
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

              {/* Circular Astrolabe Disk */}
              <div 
                className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border-[3px] border-[#D4B777] bg-[#0d1715] shadow-[0_12px_40px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden cursor-crosshair"
                onClick={() => setIsExpandedModal(true)}
              >
                {/* 1. Deep Ocean Cartographic Canvas */}
                <div 
                  className="absolute inset-0 bg-radial from-[#182c27] via-[#101e1a] to-[#0a1311] pointer-events-none"
                />

                {/* 2. Real Island Satellite Terrain Texture */}
                <div 
                  className="absolute transition-transform duration-75 ease-out"
                  style={
                    radarMode === 'follow'
                      ? {
                          width: `${followZoom * 100}%`,
                          height: `${followZoom * 100}%`,
                          left: `${50 - (playerPercent.left / 100) * (followZoom * 100)}%`,
                          top: `${50 - (playerPercent.top / 100) * (followZoom * 100)}%`
                        }
                      : {
                          width: '100%',
                          height: '100%',
                          left: '0%',
                          top: '0%'
                        }
                  }
                >
                  {/* High-Res Rendered Island Terrain */}
                  <img
                    src={MAP_TEXTURE_URL}
                    alt="Island Terrain"
                    className="w-full h-full object-contain pointer-events-none drop-shadow-[0_0_12px_rgba(82,124,104,0.4)]"
                  />

                  {/* Station Monument Landmark Pins on Map */}
                  {STATION_MONUMENT_DEFS.map((station) => {
                    const pos = worldToPercent(station.pos[0], station.pos[2]);
                    const isTracked = activeWaypointStationId === station.id;
                    return (
                      <button
                        key={station.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStation(station);
                          setIsExpandedModal(true);
                        }}
                        onMouseEnter={() => setHoveredStation(station)}
                        onMouseLeave={() => setHoveredStation(null)}
                        style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 p-0.5 rounded-full cursor-pointer transition-transform ${
                          isTracked ? 'scale-150 z-25' : 'hover:scale-150 z-20'
                        } group`}
                        title={station.name}
                      >
                        {isTracked && (
                          <span className="absolute -inset-1 rounded-full border-2 border-[#D4B777] animate-ping opacity-80" />
                        )}
                        <span 
                          className={`block w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full shadow-md border ${
                            isTracked ? 'border-[#D4B777] ring-2 ring-[#D4B777]' : 'border-[#182522]'
                          }`}
                          style={{ 
                            backgroundColor: station.color,
                            boxShadow: isTracked ? `0 0 12px #D4B777` : `0 0 6px ${station.color}`
                          }} 
                        />
                      </button>
                    );
                  })}

                  {/* Royal Courier Ship Tracker (Real-time ocean blip) */}
                  <div 
                    style={{ left: `${shipPercent.left}%`, top: `${shipPercent.top}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
                    title="Royal Courier Vessel"
                  >
                    <div className="relative flex items-center justify-center">
                      <Ship className={`w-3.5 h-3.5 text-[#fbbf24] drop-shadow-[0_0_8px_#fbbf24] ${shipCoord.isMoving ? 'animate-bounce' : ''}`} />
                    </div>
                  </div>

                  {/* Player Blip in Overview Mode */}
                  {radarMode === 'overview' && (
                    <div 
                      style={{ left: `${playerPercent.left}%`, top: `${playerPercent.top}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-all duration-75"
                    >
                      {renderNavigatorArrow(true)}
                    </div>
                  )}

                </div>

                {/* 3. Center Fixed Player Beacon in Follow Mode */}
                {radarMode === 'follow' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
                    {renderNavigatorArrow(false)}
                  </div>
                )}

                {/* 4. Astrolabe Range Rings & Graduation Marks */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
                  {/* Concentric Gold Distance Rings */}
                  <circle cx="50" cy="50" r="18" stroke="#D4B777" strokeWidth="0.4" strokeDasharray="1 3" strokeOpacity="0.5" />
                  <circle cx="50" cy="50" r="32" stroke="#D4B777" strokeWidth="0.5" strokeDasharray="2 3" strokeOpacity="0.4" />
                  <circle cx="50" cy="50" r="46" stroke="#D4B777" strokeWidth="0.6" strokeOpacity="0.3" />
                  
                  {/* Crosshairs */}
                  <line x1="50" y1="4" x2="50" y2="96" stroke="#527C68" strokeWidth="0.3" strokeOpacity="0.3" strokeDasharray="1 4" />
                  <line x1="4" y1="50" x2="96" y2="50" stroke="#527C68" strokeWidth="0.3" strokeOpacity="0.3" strokeDasharray="1 4" />
                </svg>

                {/* Cardinal Points (N, S, E, W) */}
                <span className="absolute top-1.5 left-1/2 -translate-x-1/2 font-mono text-[10px] font-extrabold text-[#D4B777] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">N</span>
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold text-[#E9E4D7]/60 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">S</span>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[9px] font-bold text-[#E9E4D7]/60 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">W</span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] font-bold text-[#E9E4D7]/60 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">E</span>

                {/* Hover Tooltip */}
                {hoveredStation && (
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-[#182522]/95 border border-[#D4B777]/60 text-[10px] font-heading font-semibold text-[#D4B777] whitespace-nowrap shadow-xl pointer-events-none z-40 max-w-[85%] truncate text-center">
                    {hoveredStation.name}
                  </div>
                )}
              </div>

              {/* Bottom Ticker: Region & Real Telemetry */}
              <div className="mt-1.5 px-3.5 py-1 rounded-full bg-[#182522]/95 border border-[#D4B777]/30 shadow-md text-center max-w-[240px]">
                <p className="text-[10px] font-heading font-bold text-[#D4B777] truncate">
                  {currentRegion}
                </p>
                <p className="text-[9px] font-mono text-[#E9E4D7]/85 flex items-center justify-center gap-1.5">
                  <span className="text-[#D4B777] font-bold">
                    Facing {getCardinalDirection(playerCoord.headingDeg)} ({Math.round(((playerCoord.headingDeg % 360) + 360) % 360)}°)
                  </span>
                  <span className="text-[#527C68]">·</span>
                  <span>X: {playerCoord.x.toFixed(1)}</span>
                  <span className="text-[#527C68]">·</span>
                  <span>Z: {playerCoord.z.toFixed(1)}</span>
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
          className="fixed inset-0 z-50 bg-[#101a18]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300 pointer-events-auto select-none"
          onClick={() => setIsExpandedModal(false)}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[92vh] bg-[#182522] border-2 border-[#D4B777]/60 rounded-3xl p-5 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#527C68]/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#527C68]/20 border border-[#D4B777]/40 flex items-center justify-center text-[#D4B777] shadow-inner">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-[#E9E4D7] tracking-tight">
                    Expedition World Map
                  </h3>
                  <p className="text-xs text-[#D4B777]/80 font-sans">
                    Cartographic Survey of Prasad's Archipelago & Station Monuments
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsExpandedModal(false)}
                className="w-8 h-8 rounded-full bg-[#101a18]/80 hover:bg-[#101a18] border border-[#D4B777]/30 text-[#E9E4D7]/75 hover:text-[#D4B777] flex items-center justify-center transition-all cursor-pointer"
                title="Close Map (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-[#527C68]/20 shrink-0">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All 26 Stations' },
                  { id: 'harbor', label: 'Harbor & Connect' },
                  { id: 'projects', label: 'Software Projects' },
                  { id: 'cs50', label: 'Harvard CS50x' },
                  { id: 'citadel', label: 'Sanctuaries' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`px-3 py-1 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer ${
                      categoryFilter === tab.id
                        ? 'bg-[#D4B777] text-[#182522] shadow-sm font-bold'
                        : 'bg-[#101a18]/60 text-[#E9E4D7]/75 hover:text-[#E9E4D7] hover:bg-[#101a18]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#D4B777]/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter landmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 rounded-full bg-[#101a18]/80 border border-[#527C68]/40 text-xs text-[#E9E4D7] placeholder-[#E9E4D7]/40 focus:outline-none focus:border-[#D4B777]/70 font-sans w-40 sm:w-48"
                />
              </div>
            </div>

            {/* Interactive Cartography Canvas */}
            <div className="relative flex-1 min-h-[360px] sm:min-h-[480px] my-3 rounded-2xl border border-[#D4B777]/35 bg-[#0d1715] overflow-hidden flex items-center justify-center shadow-inner">
              
              {/* Deep Ocean Watercolor Canvas */}
              <div className="absolute inset-0 bg-radial from-[#182c27] via-[#101e1a] to-[#0a1311]" />

              {/* Bathymetric Depth Rings & Latitude/Longitude Grid */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="25" stroke="#527C68" strokeWidth="0.3" strokeDasharray="2 4" strokeOpacity="0.25" />
                <circle cx="50" cy="50" r="38" stroke="#527C68" strokeWidth="0.3" strokeDasharray="2 4" strokeOpacity="0.25" />
                <circle cx="50" cy="50" r="48" stroke="#D4B777" strokeWidth="0.4" strokeOpacity="0.2" />

                {/* Coordinate Grid lines */}
                <line x1="20" y1="0" x2="20" y2="100" stroke="#527C68" strokeWidth="0.2" strokeOpacity="0.2" />
                <line x1="40" y1="0" x2="40" y2="100" stroke="#527C68" strokeWidth="0.2" strokeOpacity="0.2" />
                <line x1="60" y1="0" x2="60" y2="100" stroke="#527C68" strokeWidth="0.2" strokeOpacity="0.2" />
                <line x1="80" y1="0" x2="80" y2="100" stroke="#527C68" strokeWidth="0.2" strokeOpacity="0.2" />

                <line x1="0" y1="20" x2="100" y2="20" stroke="#527C68" strokeWidth="0.2" strokeOpacity="0.2" />
                <line x1="0" y1="40" x2="100" y2="40" stroke="#527C68" strokeWidth="0.2" strokeOpacity="0.2" />
                <line x1="0" y1="60" x2="100" y2="60" stroke="#527C68" strokeWidth="0.2" strokeOpacity="0.2" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="#527C68" strokeWidth="0.2" strokeOpacity="0.2" />
              </svg>

              {/* Square Aspect Map Wrapper */}
              <div className="relative w-full h-full max-w-[520px] max-h-[520px] aspect-square">
                
                {/* Master Rendered Island Texture */}
                <img
                  src={MAP_TEXTURE_URL}
                  alt="Cartographic Island Map"
                  className="w-full h-full object-contain pointer-events-none drop-shadow-[0_0_20px_rgba(82,124,104,0.35)]"
                />

                {/* Station Monument Interactive Landmark Pins */}
                {filteredStations.map((station) => {
                  const pos = worldToPercent(station.pos[0], station.pos[2]);
                  const isSelected = selectedStation?.id === station.id;
                  const isTracked = activeWaypointStationId === station.id;
                  const dist = Math.round(
                    Math.hypot(station.pos[0] - playerCoord.x, station.pos[2] - playerCoord.z)
                  );

                  return (
                    <div
                      key={station.id}
                      style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                    >
                      <button
                        onClick={() => setSelectedStation(station)}
                        className={`p-1 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                          isSelected ? 'scale-150 ring-4 ring-[#D4B777] z-30' : isTracked ? 'scale-135 ring-2 ring-[#D4B777] z-25' : 'hover:scale-135'
                        }`}
                        title={`${station.name} (${dist}m away)`}
                      >
                        {isTracked && (
                          <span className="absolute -inset-1 rounded-full border-2 border-[#D4B777] animate-ping opacity-80" />
                        )}
                        <span 
                          className={`block w-3.5 h-3.5 rounded-full shadow-lg border-2 ${
                            isTracked ? 'border-[#D4B777]' : 'border-[#182522]'
                          }`}
                          style={{ 
                            backgroundColor: station.color,
                            boxShadow: isTracked ? `0 0 14px #D4B777` : `0 0 10px ${station.color}`
                          }} 
                        />
                      </button>

                      {/* Station Badge on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-[#182522]/95 border border-[#D4B777]/60 text-[10px] font-heading font-semibold text-[#D4B777] whitespace-nowrap shadow-xl z-40">
                        {station.name} · <span className="font-mono text-[#E9E4D7]/80">{dist}m</span>
                      </div>
                    </div>
                  );
                })}

                {/* Royal Courier Ship Tracker Marker */}
                <div 
                  style={{ left: `${shipPercent.left}%`, top: `${shipPercent.top}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 transition-all duration-300"
                  title="Royal Courier Vessel"
                >
                  <div className="relative flex items-center justify-center p-1 rounded-full bg-[#182522]/80 border border-[#D4B777]/50 shadow-md">
                    <Ship className={`w-4 h-4 text-[#fbbf24] ${shipCoord.isMoving ? 'animate-bounce' : ''}`} />
                  </div>
                </div>

                {/* Player Location Beacon */}
                <div 
                  style={{ left: `${playerPercent.left}%`, top: `${playerPercent.top}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-all duration-75"
                >
                  {renderNavigatorArrow(false)}
                </div>

              </div>

              {/* Selected Landmark Details Drawer */}
              {selectedStation && (
                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-[#182522]/95 border border-[#D4B777]/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-2 duration-200 z-40">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: selectedStation.color }}
                      />
                      <h4 className="font-heading font-bold text-sm text-[#E9E4D7] leading-tight">
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

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        soundEngine.playClickSound();
                        setIsExpandedModal(false);
                        setActiveStationId(selectedStation.id);
                        setStationModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-[#D4B777] hover:bg-[#E5CD94] text-[#182522] font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <span>Open Exhibit</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => {
                        const nextId = activeWaypointStationId === selectedStation.id ? null : selectedStation.id;
                        setActiveWaypointStationId(nextId);
                        if (nextId) soundEngine.playWaypointTrackSound();
                        else soundEngine.playClickSound();
                      }}
                      className={`py-1.5 px-3 rounded-xl border text-xs font-heading font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        activeWaypointStationId === selectedStation.id
                          ? 'bg-[#D4B777] text-[#182522] border-[#D4B777] shadow-md'
                          : 'bg-[#182522] hover:bg-[#527C68]/30 border-[#D4B777]/40 text-[#E9E4D7]'
                      }`}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>{activeWaypointStationId === selectedStation.id ? 'Tracking GPS' : 'Track GPS'}</span>
                    </button>

                    <button
                      onClick={() => {
                        soundEngine.playTeleportSound();
                        teleportPlayer({
                          x: selectedStation.pos[0],
                          y: selectedStation.pos[1] + 0.5,
                          z: selectedStation.pos[2] + 2.0
                        });
                        setIsExpandedModal(false);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-[#527C68]/30 hover:bg-[#527C68]/50 border border-[#D4B777]/40 text-[#E9E4D7] font-heading font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-[#D4B777]" />
                      <span>Fast Travel</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Legend & Footer */}
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
