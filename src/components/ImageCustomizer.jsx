import React, { useRef, useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const BASE = import.meta.env.BASE_URL;

const SAMPLES = [
  { id: 'laurel', name: 'Golden Laurel Wreath', url: `${BASE}samples/laurel-wreath.svg` },
  { id: 'star', name: 'Golden Star Emblem', url: `${BASE}samples/star-emblem.svg` },
  { id: 'tech', name: 'Tech Shield', url: `${BASE}samples/tech-shield.svg` },
  { id: 'seal', name: 'Corporate Seal', url: `${BASE}samples/corporate-seal.svg` },
];

export default function ImageCustomizer({
  imageLayers,
  setImageLayers,
  selectedLayerId,
  setSelectedLayerId,
  setSelectedLayerType
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const activeLayer = imageLayers.find((l) => l.id === selectedLayerId);

  const updateActive = (field, value) => {
    setImageLayers((prev) =>
      prev.map((l) => (l.id === selectedLayerId ? { ...l, [field]: value } : l))
    );
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      const newId = 'img-' + Date.now();
      const newLayer = {
        id: newId,
        src: data.url,
        name: file.name.slice(0, 16),
        x: 512,
        y: 256,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
      };

      setImageLayers((prev) => [...prev, newLayer]);
      setSelectedLayerId(newId);
      setSelectedLayerType('image');
    } catch (err) {
      console.error('File upload fallback:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const newId = 'img-' + Date.now();
        const newLayer = {
          id: newId,
          src: event.target.result,
          name: file.name.slice(0, 16),
          x: 512,
          y: 256,
          width: 100,
          height: 100,
          rotation: 0,
          opacity: 1,
        };
        setImageLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newId);
        setSelectedLayerType('image');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addSampleImage = (sample) => {
    const newId = 'img-' + Date.now();
    const newLayer = {
      id: newId,
      src: sample.url,
      name: sample.name,
      x: 180,
      y: 256,
      width: 105,
      height: 105,
      rotation: 0,
      opacity: 1,
    };
    setImageLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newId);
    setSelectedLayerType('image');
  };

  const deleteLayer = (id) => {
    setImageLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ImageIcon size={18} className="text-[#d4af37]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Base Plate Logos</h3>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-[#d4af37] hover:bg-[#f7e7a9] text-black rounded-xl shadow transition"
        >
          <Upload size={14} />
          <span>{isUploading ? 'Uploading...' : 'Upload Logo'}</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
        />
      </div>

      {/* Preset Sample Badges */}
      <div className="bg-[#151722] p-3 rounded-2xl border border-[#262838] space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#8e94a8]">
          <Sparkles size={14} className="text-[#d4af37]" />
          <span>Select Logo / Emblem to Place on Base:</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {SAMPLES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => addSampleImage(sample)}
              title={`Add ${sample.name}`}
              className="flex flex-col items-center p-2 rounded-xl bg-[#0e1017] hover:bg-[#202330] border border-[#262838] hover:border-[#d4af37] transition group"
            >
              <img src={sample.url} alt={sample.name} className="w-9 h-9 object-contain mb-1 group-hover:scale-110 transition" />
              <span className="text-[10px] text-[#8e94a8] group-hover:text-white truncate max-w-full text-center">
                {sample.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Layer List Chips */}
      {imageLayers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {imageLayers.map((layer) => {
            const isSelected = layer.id === selectedLayerId;
            return (
              <div
                key={layer.id}
                onClick={() => {
                  setSelectedLayerId(layer.id);
                  setSelectedLayerType('image');
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition border ${
                  isSelected
                    ? 'bg-[#d4af37]/20 border-[#d4af37] text-white'
                    : 'bg-[#181a24] border-[#2b2e3e] text-[#8e94a8] hover:text-white hover:bg-[#202230]'
                }`}
              >
                <img src={layer.src} alt="" className="w-4 h-4 object-contain rounded" />
                <span className="max-w-[100px] truncate">{layer.name || 'Artwork'}</span>
                {isSelected && <ChevronRight size={13} className="text-[#d4af37]" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Active Layer Editor */}
      {activeLayer ? (
        <div className="bg-[#151722] p-4 rounded-2xl border border-[#262838] space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#262838] pb-3">
            <div className="flex items-center space-x-2">
              <img src={activeLayer.src} alt="" className="w-6 h-6 object-contain rounded" />
              <span className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider truncate max-w-[160px]">
                {activeLayer.name || 'Logo on Base'}
              </span>
            </div>
            <button
              onClick={() => deleteLayer(activeLayer.id)}
              title="Delete Artwork Layer"
              className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Size / Scale Slider */}
          <div>
            <div className="flex justify-between text-xs text-[#8e94a8] mb-1">
              <span>Size / Scale</span>
              <span className="font-mono text-white">{activeLayer.width}px</span>
            </div>
            <input
              type="range"
              min="40"
              max="280"
              value={activeLayer.width}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateActive('width', val);
                updateActive('height', val);
              }}
              className="w-full accent-[#d4af37]"
            />
          </div>

          {/* Opacity Slider */}
          <div>
            <div className="flex justify-between text-xs text-[#8e94a8] mb-1">
              <span>Opacity</span>
              <span className="font-mono text-white">{Math.round((activeLayer.opacity || 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={activeLayer.opacity !== undefined ? activeLayer.opacity : 1}
              onChange={(e) => updateActive('opacity', Number(e.target.value))}
              className="w-full accent-[#d4af37]"
            />
          </div>

          {/* Rotation Slider */}
          <div>
            <div className="flex justify-between text-xs text-[#8e94a8] mb-1">
              <span>Rotation</span>
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

          {/* Position X and Y Sliders */}
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
        </div>
      ) : (
        <div className="bg-[#151722]/60 p-6 rounded-2xl border border-dashed border-[#2b2e3e] text-center">
          <ImageIcon size={28} className="mx-auto text-[#505466] mb-2" />
          <p className="text-xs text-[#8e94a8]">Upload your logo or pick a preset emblem to place on the base plate</p>
        </div>
      )}
    </div>
  );
}
