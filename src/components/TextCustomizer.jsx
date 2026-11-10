import React from 'react';
import {
  Type,
  Plus,
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  ChevronRight
} from 'lucide-react';

const FONTS = [
  { name: 'Cinzel', label: 'Cinzel (Luxury Serif / Classic Award)' },
  { name: 'Poppins', label: 'Poppins (Clean Modern Sans)' },
  { name: 'Playfair Display', label: 'Playfair Display (Refined Editorial)' },
  { name: 'Montserrat', label: 'Montserrat (Geometric Modern)' },
  { name: 'Great Vibes', label: 'Great Vibes (Elegant Script / Signature)' },
  { name: 'Bebas Neue', label: 'Bebas Neue (Bold Display / Heavy Title)' },
  { name: 'Orbitron', label: 'Orbitron (Futuristic / Tech Pioneer)' },
];

const PRESET_COLORS = [
  { name: 'Royal Gold', hex: '#D4AF37' },
  { name: 'Champagne', hex: '#FDF3CD' },
  { name: 'Platinum White', hex: '#FFFFFF' },
  { name: 'Polished Silver', hex: '#E0E0E0' },
  { name: 'Rose Gold', hex: '#B76E79' },
  { name: 'Bronze Gold', hex: '#AA771C' },
  { name: 'Glacier Blue', hex: '#00B4D8' },
  { name: 'Matte Charcoal', hex: '#1C1917' },
];

export default function TextCustomizer({
  textLayers,
  setTextLayers,
  selectedLayerId,
  setSelectedLayerId,
  setSelectedLayerType
}) {
  const activeLayer = textLayers.find((l) => l.id === selectedLayerId);

  const updateActive = (field, value) => {
    setTextLayers((prev) =>
      prev.map((l) => (l.id === selectedLayerId ? { ...l, [field]: value } : l))
    );
  };

  const addTextLayer = () => {
    const newId = 'txt-' + Date.now();
    const newLayer = {
      id: newId,
      text: 'NEW BASE ENGRAVING',
      fontFamily: 'Cinzel',
      fontSize: 28,
      color: '#D4AF37',
      fontWeight: 'bold',
      fontStyle: 'normal',
      x: 512,
      y: 256,
      rotation: 0,
      letterSpacing: 4,
      align: 'center',
      curved: false,
      curveRadius: 350,
    };
    setTextLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newId);
    setSelectedLayerType('text');
  };

  const duplicateLayer = (layer) => {
    const newId = 'txt-' + Date.now();
    const duplicated = {
      ...layer,
      id: newId,
      y: Math.min(layer.y + 35, 470),
    };
    setTextLayers((prev) => [...prev, duplicated]);
    setSelectedLayerId(newId);
    setSelectedLayerType('text');
  };

  const deleteLayer = (id) => {
    setTextLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Type size={18} className="text-[#d4af37]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Base Plate Text Layers</h3>
        </div>
        <button
          onClick={addTextLayer}
          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-[#d4af37] hover:bg-[#f7e7a9] text-black rounded-xl shadow transition"
        >
          <Plus size={14} />
          <span>Add Text</span>
        </button>
      </div>

      {/* Layer List Chips */}
      <div className="flex flex-wrap gap-1.5">
        {textLayers.map((layer, idx) => {
          const isSelected = layer.id === selectedLayerId;
          return (
            <div
              key={layer.id}
              onClick={() => {
                setSelectedLayerId(layer.id);
                setSelectedLayerType('text');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition border ${
                isSelected
                  ? 'bg-[#d4af37]/20 border-[#d4af37] text-white'
                  : 'bg-[#181a24] border-[#2b2e3e] text-[#8e94a8] hover:text-white hover:bg-[#202230]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: layer.color || '#d4af37' }} />
              <span className="max-w-[110px] truncate">{layer.text.replace(/\n/g, ' ') || `Line #${idx + 1}`}</span>
              {isSelected && <ChevronRight size={13} className="text-[#d4af37]" />}
            </div>
          );
        })}
      </div>

      {/* Active Layer Editor */}
      {activeLayer ? (
        <div className="bg-[#151722] p-4 rounded-2xl border border-[#262838] space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#262838] pb-3">
            <span className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider">
              Editing: {activeLayer.text.slice(0, 18) || 'Text Layer'}
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => duplicateLayer(activeLayer)}
                title="Duplicate Layer"
                className="p-1.5 text-[#8e94a8] hover:text-white rounded-lg hover:bg-[#252838] transition"
              >
                <Copy size={15} />
              </button>
              <button
                onClick={() => deleteLayer(activeLayer.id)}
                title="Delete Layer"
                className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-xs font-semibold text-[#8e94a8] mb-1">Base Engraving Text</label>
            <textarea
              rows={2}
              value={activeLayer.text}
              onChange={(e) => updateActive('text', e.target.value)}
              placeholder="Enter text on base plate..."
              className="w-full bg-[#0d0e14] border border-[#2c2f40] rounded-xl px-3 py-2 text-sm text-white placeholder-[#505466] focus:outline-none focus:border-[#d4af37] transition"
            />
          </div>

          {/* Typography */}
          <div>
            <label className="block text-xs font-semibold text-[#8e94a8] mb-1">Font Typography</label>
            <select
              value={activeLayer.fontFamily}
              onChange={(e) => updateActive('fontFamily', e.target.value)}
              className="w-full bg-[#0d0e14] border border-[#2c2f40] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37] transition"
            >
              {FONTS.map((font) => (
                <option key={font.name} value={font.name} style={{ fontFamily: font.name }}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size & Letter Spacing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs text-[#8e94a8] mb-1">
                <span>Font Size</span>
                <span className="font-mono text-white">{activeLayer.fontSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="64"
                value={activeLayer.fontSize}
                onChange={(e) => updateActive('fontSize', Number(e.target.value))}
                className="w-full accent-[#d4af37]"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[#8e94a8] mb-1">
                <span>Letter Spacing</span>
                <span className="font-mono text-white">{activeLayer.letterSpacing}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="18"
                value={activeLayer.letterSpacing}
                onChange={(e) => updateActive('letterSpacing', Number(e.target.value))}
                className="w-full accent-[#d4af37]"
              />
            </div>
          </div>

          {/* Style Toggles: Bold, Italic, Align */}
          <div className="flex items-center justify-between bg-[#0e1017] p-2 rounded-xl border border-[#262838]">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => updateActive('fontWeight', activeLayer.fontWeight === 'bold' ? 'normal' : 'bold')}
                className={`p-1.5 rounded-lg text-xs font-medium transition ${
                  activeLayer.fontWeight === 'bold' ? 'bg-[#d4af37] text-black' : 'text-[#8e94a8] hover:text-white'
                }`}
                title="Bold"
              >
                <Bold size={15} />
              </button>
              <button
                onClick={() => updateActive('fontStyle', activeLayer.fontStyle === 'italic' ? 'normal' : 'italic')}
                className={`p-1.5 rounded-lg text-xs font-medium transition ${
                  activeLayer.fontStyle === 'italic' ? 'bg-[#d4af37] text-black' : 'text-[#8e94a8] hover:text-white'
                }`}
                title="Italic"
              >
                <Italic size={15} />
              </button>
            </div>

            <div className="w-[1px] h-4 bg-[#262838]" />

            <div className="flex items-center space-x-1">
              <button
                onClick={() => updateActive('align', 'left')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  activeLayer.align === 'left' ? 'bg-[#d4af37] text-black' : 'text-[#8e94a8] hover:text-white'
                }`}
                title="Align Left"
              >
                <AlignLeft size={15} />
              </button>
              <button
                onClick={() => updateActive('align', 'center')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  activeLayer.align === 'center' ? 'bg-[#d4af37] text-black' : 'text-[#8e94a8] hover:text-white'
                }`}
                title="Align Center"
              >
                <AlignCenter size={15} />
              </button>
              <button
                onClick={() => updateActive('align', 'right')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  activeLayer.align === 'right' ? 'bg-[#d4af37] text-black' : 'text-[#8e94a8] hover:text-white'
                }`}
                title="Align Right"
              >
                <AlignRight size={15} />
              </button>
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs font-semibold text-[#8e94a8] mb-1.5">Engraving Metallic Color</label>
            <div className="flex flex-wrap gap-2 items-center">
              {PRESET_COLORS.map((col) => (
                <button
                  key={col.hex}
                  onClick={() => updateActive('color', col.hex)}
                  title={col.name}
                  className={`w-7 h-7 rounded-full border-2 transition transform hover:scale-110 ${
                    activeLayer.color?.toUpperCase() === col.hex.toUpperCase()
                      ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40 scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: col.hex }}
                />
              ))}
              <input
                type="color"
                value={activeLayer.color || '#D4AF37'}
                onChange={(e) => updateActive('color', e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0"
                title="Custom Color"
              />
            </div>
          </div>

          {/* Position X and Y Sliders (tailored for 1024 x 512 base plate) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex justify-between text-xs text-[#8e94a8] mb-1">
                <span>Position X</span>
                <span className="font-mono text-white">{activeLayer.x}</span>
              </div>
              <input
                type="range"
                min="50"
                max="974"
                value={activeLayer.x}
                onChange={(e) => updateActive('x', Number(e.target.value))}
                className="w-full accent-[#d4af37]"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[#8e94a8] mb-1">
                <span>Position Y (Base)</span>
                <span className="font-mono text-white">{activeLayer.y}</span>
              </div>
              <input
                type="range"
                min="40"
                max="472"
                value={activeLayer.y}
                onChange={(e) => updateActive('y', Number(e.target.value))}
                className="w-full accent-[#d4af37]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-[#8e94a8] mb-1">
              <span>Rotation Angle</span>
              <span className="font-mono text-white">{activeLayer.rotation || 0}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={activeLayer.rotation || 0}
              onChange={(e) => updateActive('rotation', Number(e.target.value))}
              className="w-full accent-[#d4af37]"
            />
          </div>
        </div>
      ) : (
        <div className="bg-[#151722]/60 p-6 rounded-2xl border border-dashed border-[#2b2e3e] text-center">
          <Type size={28} className="mx-auto text-[#505466] mb-2" />
          <p className="text-xs text-[#8e94a8]">Select a line above or click "Add Text" to engrave on the base plate</p>
        </div>
      )}
    </div>
  );
}
