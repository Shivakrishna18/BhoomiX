import React, { useState } from 'react';
import { Compass, MapPin, ZoomIn, ZoomOut, Layers, Navigation, Info, ExternalLink } from 'lucide-react';
import { Property, BoundaryPoint } from '../types';

interface MapPlotViewerProps {
  property?: Property;
  allProperties?: Property[];
  onSelectProperty?: (prop: Property) => void;
  height?: string;
  interactive?: boolean;
}

export const MapPlotViewer: React.FC<MapPlotViewerProps> = ({
  property,
  allProperties = [],
  onSelectProperty,
  height = 'h-96',
  interactive = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeLayer, setActiveLayer] = useState<'satellite' | 'cadastral' | 'terrain'>('cadastral');
  const [selectedVertex, setSelectedVertex] = useState<BoundaryPoint | null>(null);

  // If a single property is focused
  const boundary = property?.boundary || [
    { lat: 17.1356, lng: 78.4305, label: 'NW Marker' },
    { lat: 17.1362, lng: 78.4325, label: 'NE Marker' },
    { lat: 17.1345, lng: 78.4331, label: 'SE Marker' },
    { lat: 17.1339, lng: 78.4311, label: 'SW Marker' },
  ];

  const centerLat = property?.latitude || 17.385;
  const centerLng = property?.longitude || 78.4867;

  return (
    <div className={`relative ${height} w-full rounded-3xl overflow-hidden border border-slate-300 shadow-xs bg-slate-950 select-none`}>
      {/* Map Canvas Background (Simulating High-Res Satellite / Dharani Cadastral Grid) */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
          backgroundImage:
            activeLayer === 'satellite'
              ? 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)'
              : activeLayer === 'cadastral'
              ? 'radial-gradient(circle, #1e1b4b 0%, #0f172a 100%)'
              : 'radial-gradient(circle, #1e293b 0%, #020617 100%)',
        }}
      >
        {/* Cadastral Grid Lines */}
        <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </pattern>
            <pattern id="surveyGrid" width="160" height="160" patternUnits="userSpaceOnUse">
              <rect width="160" height="160" fill="url(#grid)" />
              <path d="M 160 0 L 0 0 0 160" fill="none" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#surveyGrid)" />

          {/* Road Corridor vector simulation */}
          <path
            d="M -100 120 Q 300 240 900 180"
            fill="none"
            stroke="#334155"
            strokeWidth="28"
            strokeLinecap="round"
          />
          <path
            d="M -100 120 Q 300 240 900 180"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="8 8"
          />

          {/* Single Property 2D Plot Polygon */}
          {property && (
            <g className="transition-all duration-300">
              {/* Plot Boundary Polygon */}
              <polygon
                points="220,130 380,110 420,270 200,290"
                fill="rgba(99, 102, 241, 0.25)"
                stroke="#6366f1"
                strokeWidth="3"
                strokeDasharray="4 2"
              />

              {/* Road Frontage Highlight */}
              <line x1="220" y1="130" x2="380" y2="110" stroke="#818cf8" strokeWidth="6" strokeLinecap="round" />

              {/* Center Annotation */}
              <circle cx="305" cy="200" r="4" fill="#6366f1" />
              <text x="305" y="190" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                {property.surveyNumber || 'Sy. No.'}
              </text>
              <text x="305" y="215" textAnchor="middle" fill="#c7d2fe" fontSize="10">
                {property.landSize} {property.landUnit}
              </text>

              {/* Corner Boundary Vertex Markers */}
              {boundary.map((pt, idx) => {
                const positions = [
                  { x: 220, y: 130 },
                  { x: 380, y: 110 },
                  { x: 420, y: 270 },
                  { x: 200, y: 290 },
                ];
                const pos = positions[idx % positions.length];
                return (
                  <g
                    key={idx}
                    className="cursor-pointer group"
                    onClick={() => setSelectedVertex(pt)}
                  >
                    <circle cx={pos.x} cy={pos.y} r="8" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                    <text x={pos.x + 10} y={pos.y - 8} fill="#ffffff" fontSize="9" fontWeight="600">
                      {pt.label || `P${idx + 1}`}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Multiple Properties Pins on map */}
          {!property &&
            allProperties.map((p, idx) => {
              const offsets = [
                { x: 180, y: 140 },
                { x: 340, y: 210 },
                { x: 480, y: 120 },
                { x: 260, y: 280 },
                { x: 420, y: 310 },
              ];
              const pos = offsets[idx % offsets.length];
              return (
                <g
                  key={p.id}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => onSelectProperty?.(p)}
                >
                  <circle cx={pos.x} cy={pos.y} r="18" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                    ₹{(p.askingPrice / 10000000).toFixed(1)}Cr
                  </text>
                  <text x={pos.x} y={pos.y + 28} textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="500">
                    {p.locality?.split('/')[0]}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>

      {/* Map Control Bar Top-Left */}
      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-white flex items-center space-x-2 text-xs shadow-xs font-medium">
          <Navigation className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold">{property ? property.locality : 'Growth Corridor Map'}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {centerLat.toFixed(4)}° N, {centerLng.toFixed(4)}° E
          </span>
        </div>

        {property?.roadFacing && (
          <div className="bg-amber-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-800/80 text-amber-300 text-[11px] flex items-center space-x-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Frontage: {property.roadFacing}</span>
          </div>
        )}
      </div>

      {/* Layer Switcher & Controls Top-Right */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5">
        <div className="bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700 flex space-x-1 shadow-xs">
          <button
            onClick={() => setActiveLayer('cadastral')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              activeLayer === 'cadastral' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Cadastral (Dharani)
          </button>
          <button
            onClick={() => setActiveLayer('satellite')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              activeLayer === 'satellite' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Zoom In/Out */}
        <div className="bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700 flex flex-col space-y-1 shadow-xs">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.2))}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Info Bar / Selected Vertex Detail */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-white text-[11px] pointer-events-auto flex items-center space-x-2 font-medium">
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>North-Oriented Survey Grid</span>
          <span className="text-slate-500">•</span>
          <span className="text-indigo-300">DGPS Demarcated</span>
        </div>

        {selectedVertex && (
          <div className="bg-indigo-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-indigo-700 text-indigo-100 text-[11px] pointer-events-auto flex items-center space-x-2 animate-in fade-in">
            <span className="font-bold">{selectedVertex.label || 'Corner Vertex'}:</span>
            <span className="font-mono text-[10px]">
              {selectedVertex.lat.toFixed(6)}° N, {selectedVertex.lng.toFixed(6)}° E
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
