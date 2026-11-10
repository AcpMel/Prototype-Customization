import React from 'react';
import { Box, Sparkles, Shield, Sliders } from 'lucide-react';

const BASE_PRESETS = [
  { id: 'piano-black', name: 'Piano Black Lacquer', color: '#111111', roughness: 0.2, metalness: 0.1 },
  { id: 'brushed-gold', name: 'Brushed Royal Gold', color: '#C5A059', roughness: 0.35, metalness: 0.85 },
  { id: 'polished-silver', name: 'Mirror Chrome Silver', color: '#E8E8E8', roughness: 0.1, metalness: 0.95 },
  { id: 'walnut-wood', name: 'Rich Dark Walnut', color: '#3E2723', roughness: 0.65, metalness: 0.05 },
  { id: 'midnight-navy', name: 'Midnight Navy', color: '#0F172A', roughness: 0.25, metalness: 0.3 },
  { id: 'pure-white', name: 'Arctic White Gloss', color: '#FAFAFA', roughness: 0.15, metalness: 0.1 },
];

const PLATE_PRESETS = [
  { id: 'gold-plate', name: 'Polished Brass & Gold', color: '#18181b', borderColor: '#D4AF37', border: true },
  { id: 'silver-plate', name: 'Brushed Silver Plate', color: '#1f2024', borderColor: '#E0E0E0', border: true },
  { id: 'black-matte', name: 'Matte Onyx Black', color: '#0a0a0d', borderColor: '#D4AF37', border: true },
  { id: 'rose-gold-plate', name: 'Rose Gold Metallic', color: '#1c1417', borderColor: '#B76E79', border: true },
  { id: 'solid-brass', name: 'Solid Metallic Brass', color: '#B8860B', borderColor: '#FDF3CD', border: true },
];

const BODY_PRESETS = [
  { id: 'crystal-glass', name: 'Optical Crystal Clear', color: '#FFFFFF', transmission: 0.95, roughness: 0.05, ior: 1.52 },
  { id: 'frosted-acrylic', name: 'Frosted Satin Crystal', color: '#EBF8FF', transmission: 0.8, roughness: 0.35, ior: 1.49 },
  { id: 'smoked-obsidian', name: 'Smoked Quartz / Dark Crystal', color: '#18181B', transmission: 0.45, roughness: 0.15, ior: 1.5 },
  { id: 'golden-mirror', name: 'Polished Brass & Gold', color: '#D4AF37', transmission: 0.0, roughness: 0.2, metalness: 0.85 },
  { id: 'ice-blue', name: 'Glacier Blue Crystal', color: '#90E0EF', transmission: 0.85, roughness: 0.08, ior: 1.51 },
];

export default function MaterialCustomizer({
  baseMaterial,
  setBaseMaterial,
  bodyMaterial,
  setBodyMaterial,
  plateStyle,
  setPlateStyle
}) {
  return (
    <div className="space-y-6">
      {/* 1. Base Pedestal Finish */}
      <div className="bg-[#151722] p-4 rounded-2xl border border-[#262838] space-y-3 shadow-lg">
        <div className="flex items-center space-x-2 border-b border-[#262838] pb-2.5">
          <Box size={17} className="text-[#d4af37]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Pedestal Base Finish</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {BASE_PRESETS.map((preset) => {
            const isSelected = baseMaterial?.color?.toLowerCase() === preset.color.toLowerCase();
            return (
              <button
                key={preset.id}
                onClick={() => setBaseMaterial(preset)}
                className={`flex items-center space-x-2 p-2 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow'
                    : 'bg-[#0e1017] border-[#262838] text-[#8e94a8] hover:text-white hover:border-[#383d54]'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-lg border border-white/20 shrink-0 shadow-inner"
                  style={{ backgroundColor: preset.color }}
                />
                <span className="text-xs font-medium truncate">{preset.name}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-2 grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-xs text-[#8e94a8] mb-1">
              <span>Roughness</span>
              <span className="font-mono text-white">
                {Math.round((baseMaterial?.roughness || 0.2) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={baseMaterial?.roughness || 0.2}
              onChange={(e) =>
                setBaseMaterial((prev) => ({ ...prev, roughness: Number(e.target.value) }))
              }
              className="w-full accent-[#d4af37]"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-[#8e94a8] mb-1">
              <span>Metalness</span>
              <span className="font-mono text-white">
                {Math.round((baseMaterial?.metalness || 0.1) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={baseMaterial?.metalness || 0.1}
              onChange={(e) =>
                setBaseMaterial((prev) => ({ ...prev, metalness: Number(e.target.value) }))
              }
              className="w-full accent-[#d4af37]"
            />
          </div>
        </div>
      </div>

      {/* 2. Base Engraving Plate Style */}
      <div className="bg-[#151722] p-4 rounded-2xl border border-[#262838] space-y-3 shadow-lg">
        <div className="flex items-center space-x-2 border-b border-[#262838] pb-2.5">
          <Shield size={17} className="text-[#d4af37]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Engraving Plate Theme</h3>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {PLATE_PRESETS.map((preset) => {
            const isSelected = plateStyle?.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setPlateStyle(preset)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow'
                    : 'bg-[#0e1017] border-[#262838] text-[#8e94a8] hover:text-white hover:border-[#383d54]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className="w-5 h-5 rounded-lg border-2 shadow-inner shrink-0"
                    style={{ backgroundColor: preset.color, borderColor: preset.borderColor }}
                  />
                  <span className="text-xs font-medium">{preset.name}</span>
                </div>
                <span className="text-[10px] text-[#6b7280] font-mono">
                  Beveled Edge
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Upper Crystal Trophy Material */}
      <div className="bg-[#151722] p-4 rounded-2xl border border-[#262838] space-y-3 shadow-lg">
        <div className="flex items-center space-x-2 border-b border-[#262838] pb-2.5">
          <Sparkles size={17} className="text-[#d4af37]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Upper Crystal Finish</h3>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {BODY_PRESETS.map((preset) => {
            const isSelected = bodyMaterial?.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setBodyMaterial(preset)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow'
                    : 'bg-[#0e1017] border-[#262838] text-[#8e94a8] hover:text-white hover:border-[#383d54]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className="w-5 h-5 rounded-lg border border-white/20 shrink-0 shadow-inner"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="text-xs font-medium">{preset.name}</span>
                </div>
                <span className="text-[10px] text-[#6b7280] font-mono">
                  {preset.transmission > 0 ? `${Math.round(preset.transmission * 100)}% Clear` : 'Metallic'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-2 grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-xs text-[#8e94a8] mb-1">
              <span>Clarity</span>
              <span className="font-mono text-white">
                {Math.round((bodyMaterial?.transmission || 0.95) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={bodyMaterial?.transmission !== undefined ? bodyMaterial.transmission : 0.95}
              onChange={(e) =>
                setBodyMaterial((prev) => ({ ...prev, transmission: Number(e.target.value) }))
              }
              className="w-full accent-[#d4af37]"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-[#8e94a8] mb-1">
              <span>Frost</span>
              <span className="font-mono text-white">
                {Math.round((bodyMaterial?.roughness || 0.05) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.8"
              step="0.02"
              value={bodyMaterial?.roughness || 0.05}
              onChange={(e) =>
                setBodyMaterial((prev) => ({ ...prev, roughness: Number(e.target.value) }))
              }
              className="w-full accent-[#d4af37]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
