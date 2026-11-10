import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Viewer3D from './components/Viewer3D';
import CanvasEditor2D from './components/CanvasEditor2D';
import TextCustomizer from './components/TextCustomizer';
import ImageCustomizer from './components/ImageCustomizer';
import MaterialCustomizer from './components/MaterialCustomizer';
import DesignPresetsModal from './components/DesignPresetsModal';
import OrderModal from './components/OrderModal';
import {
  Type,
  Image as ImageIcon,
  Palette,
  LayoutGrid,
  Columns,
  Eye,
  Box,
  Sparkles
} from 'lucide-react';

const DEFAULT_BASE_TEXT_LAYERS = [];

const DEFAULT_BASE_IMAGE_LAYERS = [];

const DEFAULT_BASE_MATERIAL = {
  id: 'piano-black',
  name: 'Piano Black Lacquer',
  color: '#111111',
  roughness: 0.2,
  metalness: 0.1,
};

const DEFAULT_PLATE_STYLE = {
  id: 'gold-plate',
  name: 'Polished Brass & Gold',
  color: '#18181b',
  borderColor: '#D4AF37',
  border: true,
};

const DEFAULT_BODY_MATERIAL = {
  id: 'crystal-glass',
  name: 'Optical Crystal Clear',
  color: '#FFFFFF',
  transmission: 0.95,
  roughness: 0.05,
  ior: 1.52,
};

export default function App() {
  const [textLayers, setTextLayers] = useState(DEFAULT_BASE_TEXT_LAYERS);
  const [imageLayers, setImageLayers] = useState(DEFAULT_BASE_IMAGE_LAYERS);
  const [baseMaterial, setBaseMaterial] = useState(DEFAULT_BASE_MATERIAL);
  const [bodyMaterial, setBodyMaterial] = useState(DEFAULT_BODY_MATERIAL);
  const [plateStyle, setPlateStyle] = useState(DEFAULT_PLATE_STYLE);
  const [platePositionY, setPlatePositionY] = useState(0.155);

  const [selectedLayerId, setSelectedLayerId] = useState('txt-2');
  const [selectedLayerType, setSelectedLayerType] = useState('text');
  const [activeTab, setActiveTab] = useState('text');
  const [viewMode, setViewMode] = useState('split');

  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [presetsInitialTab, setPresetsInitialTab] = useState('templates');
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [capturedThumbnail, setCapturedThumbnail] = useState(null);

  const handleSaveDesign = async () => {
    try {
      const designPayload = {
        name: textLayers[0]?.text || 'Custom Base Engraved Trophy',
        thumbnail: capturedThumbnail,
        baseMaterial,
        bodyMaterial,
        plateStyle,
        platePositionY,
        textLayers,
        imageLayers,
      };

      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(designPayload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save design:', err);
    }
  };

  const handleApplyDesign = (design) => {
    if (design.textLayers) setTextLayers(design.textLayers);
    if (design.imageLayers) setImageLayers(design.imageLayers);
    if (design.baseMaterial) setBaseMaterial(design.baseMaterial);
    if (design.bodyMaterial) setBodyMaterial(design.bodyMaterial);
    if (design.plateStyle) setPlateStyle(design.plateStyle);
    if (design.platePositionY !== undefined) setPlatePositionY(design.platePositionY);
    if (design.textLayers?.[0]) {
      setSelectedLayerId(design.textLayers[0].id);
      setSelectedLayerType('text');
    }
  };

  const handleReset = () => {
    setTextLayers(DEFAULT_BASE_TEXT_LAYERS);
    setImageLayers(DEFAULT_BASE_IMAGE_LAYERS);
    setBaseMaterial(DEFAULT_BASE_MATERIAL);
    setBodyMaterial(DEFAULT_BODY_MATERIAL);
    setPlateStyle(DEFAULT_PLATE_STYLE);
    setPlatePositionY(0.155);
    setSelectedLayerId('txt-2');
    setSelectedLayerType('text');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0b0f] text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenPresets={() => {
          setPresetsInitialTab('templates');
          setIsPresetsOpen(true);
        }}
        onOpenGallery={() => {
          setPresetsInitialTab('saved');
          setIsPresetsOpen(true);
        }}
        onSaveDesign={handleSaveDesign}
        onOpenOrder={() => setIsOrderOpen(true)}
        onReset={handleReset}
        saveSuccess={saveSuccess}
      />

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 md:p-4 gap-4">
        {/* Left / Center: Interactive 3D & 2D Canvas Stage */}
        <div className="flex-1 flex flex-col bg-[#0f1118] rounded-3xl border border-[#232636] overflow-hidden shadow-2xl relative">
          {/* Stage Top Bar: View Mode Selector */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#141620] border-b border-[#232636]">
            <div className="flex items-center space-x-2">
              <Box size={16} className="text-[#d4af37]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Base Customizer Studio</span>
              <span className="text-[11px] text-[#8e94a8] hidden sm:inline">• Prominently Visible on Base</span>
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center space-x-1 bg-[#0c0d12] p-1 rounded-xl border border-[#262838]">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  viewMode === '3d'
                    ? 'bg-[#d4af37] text-black shadow'
                    : 'text-[#8e94a8] hover:text-white'
                }`}
              >
                <Eye size={13} />
                <span>3D View</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'split'
                    ? 'bg-[#d4af37] text-black shadow'
                    : 'text-[#8e94a8] hover:text-white'
                }`}
              >
                <Columns size={13} />
                <span>Split Studio</span>
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  viewMode === '2d'
                    ? 'bg-[#d4af37] text-black shadow'
                    : 'text-[#8e94a8] hover:text-white'
                }`}
              >
                <LayoutGrid size={13} />
                <span>2D Base Plate</span>
              </button>
            </div>
          </div>

          {/* Viewport Content */}
          <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden min-h-[460px]">
            {/* 3D Model Renderer */}
            {(viewMode === '3d' || viewMode === 'split') && (
              <div className={`relative flex-1 h-full min-h-[400px] ${viewMode === 'split' ? 'md:w-3/5 border-b md:border-b-0 md:border-r border-[#232636]' : 'w-full'}`}>
                <Viewer3D
                  textLayers={textLayers}
                  imageLayers={imageLayers}
                  baseMaterial={baseMaterial}
                  bodyMaterial={bodyMaterial}
                  plateStyle={plateStyle}
                  platePositionY={platePositionY}
                  onCaptureThumbnail={(dataUrl) => setCapturedThumbnail(dataUrl)}
                />
              </div>
            )}

            {/* 2D Interactive Base Plate Layout Editor */}
            {(viewMode === '2d' || viewMode === 'split') && (
              <div className={`relative h-full min-h-[400px] ${viewMode === 'split' ? 'md:w-2/5' : 'flex-1'}`}>
                <CanvasEditor2D
                  textLayers={textLayers}
                  setTextLayers={setTextLayers}
                  imageLayers={imageLayers}
                  setImageLayers={setImageLayers}
                  selectedLayerId={selectedLayerId}
                  setSelectedLayerId={setSelectedLayerId}
                  selectedLayerType={selectedLayerType}
                  setSelectedLayerType={setSelectedLayerType}
                  plateStyle={plateStyle}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Customization Controls Panel */}
        <aside className="w-full lg:w-[420px] bg-[#0f1118] rounded-3xl border border-[#232636] flex flex-col overflow-hidden shadow-2xl">
          {/* Sidebar Tab Header */}
          <div className="flex border-b border-[#232636] bg-[#141620]">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-3 px-2 flex items-center justify-center space-x-1.5 text-xs font-bold transition border-b-2 ${
                activeTab === 'text'
                  ? 'border-[#d4af37] text-[#d4af37] bg-[#181a26]'
                  : 'border-transparent text-[#8e94a8] hover:text-white'
              }`}
            >
              <Type size={15} />
              <span>Base Text</span>
              <span className="text-[10px] bg-[#232636] px-1.5 py-0.2 rounded-full font-mono text-white">
                {textLayers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('image')}
              className={`flex-1 py-3 px-2 flex items-center justify-center space-x-1.5 text-xs font-bold transition border-b-2 ${
                activeTab === 'image'
                  ? 'border-[#d4af37] text-[#d4af37] bg-[#181a26]'
                  : 'border-transparent text-[#8e94a8] hover:text-white'
              }`}
            >
              <ImageIcon size={15} />
              <span>Base Logo</span>
              <span className="text-[10px] bg-[#232636] px-1.5 py-0.2 rounded-full font-mono text-white">
                {imageLayers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('material')}
              className={`flex-1 py-3 px-2 flex items-center justify-center space-x-1.5 text-xs font-bold transition border-b-2 ${
                activeTab === 'material'
                  ? 'border-[#d4af37] text-[#d4af37] bg-[#181a26]'
                  : 'border-transparent text-[#8e94a8] hover:text-white'
              }`}
            >
              <Palette size={15} />
              <span>Finishes</span>
            </button>
          </div>

          {/* Sidebar Tab Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'text' && (
              <TextCustomizer
                textLayers={textLayers}
                setTextLayers={setTextLayers}
                selectedLayerId={selectedLayerId}
                setSelectedLayerId={setSelectedLayerId}
                setSelectedLayerType={setSelectedLayerType}
              />
            )}

            {activeTab === 'image' && (
              <ImageCustomizer
                imageLayers={imageLayers}
                setImageLayers={setImageLayers}
                selectedLayerId={selectedLayerId}
                setSelectedLayerId={setSelectedLayerId}
                setSelectedLayerType={setSelectedLayerType}
              />
            )}

            {activeTab === 'material' && (
              <div className="space-y-4">
                <MaterialCustomizer
                  baseMaterial={baseMaterial}
                  setBaseMaterial={setBaseMaterial}
                  bodyMaterial={bodyMaterial}
                  setBodyMaterial={setBodyMaterial}
                  plateStyle={plateStyle}
                  setPlateStyle={setPlateStyle}
                />

                {/* Base Plate Position Adjuster */}
                <div className="bg-[#151722] p-4 rounded-2xl border border-[#262838] space-y-2 shadow-lg">
                  <div className="flex justify-between text-xs text-[#8e94a8]">
                    <span className="font-semibold text-white">Base Plate Vertical Position</span>
                    <span className="font-mono text-[#d4af37]">
                      {platePositionY < 0.18 ? 'Lower Drum' : 'Center Bevel'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.26"
                    step="0.01"
                    value={platePositionY}
                    onChange={(e) => setPlatePositionY(Number(e.target.value))}
                    className="w-full accent-[#d4af37]"
                  />
                  <div className="flex justify-between text-[10px] text-[#6b7280]">
                    <span>0.10 (Lower Base)</span>
                    <span>0.155 (Default)</span>
                    <span>0.26 (Bevel)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Bottom Action Bar */}
          <div className="p-3 bg-[#141620] border-t border-[#232636] flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs text-[#8e94a8]">
              <Sparkles size={14} className="text-[#d4af37]" />
              <span>Visible Front Base Plate</span>
            </div>
            <button
              onClick={() => setIsOrderOpen(true)}
              className="px-4 py-2 bg-[#d4af37] hover:bg-[#f7e7a9] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow transition"
            >
              Order Prototype
            </button>
          </div>
        </aside>
      </div>

      <DesignPresetsModal
        isOpen={isPresetsOpen}
        initialTab={presetsInitialTab}
        onClose={() => setIsPresetsOpen(false)}
        onApplyDesign={handleApplyDesign}
      />

      <OrderModal
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        textLayers={textLayers}
        imageLayers={imageLayers}
        baseMaterial={baseMaterial}
        bodyMaterial={bodyMaterial}
      />
    </div>
  );
}
