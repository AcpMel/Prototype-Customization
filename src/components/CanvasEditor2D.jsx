import React, { useRef, useEffect, useState } from 'react';
import { renderTextureCanvas } from '../utils/canvasRenderer';
import {
  Move,
  ShieldAlert,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Trash2,
  Sliders
} from 'lucide-react';

export default function CanvasEditor2D({
  textLayers,
  setTextLayers,
  imageLayers,
  setImageLayers,
  selectedLayerId,
  setSelectedLayerId,
  selectedLayerType,
  setSelectedLayerType,
  plateStyle
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [showBoundary, setShowBoundary] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  // Render 2D canvas preview (1024 x 512, 2:1 base plate ratio)
  useEffect(() => {
    if (!canvasRef.current) return;
    renderTextureCanvas(canvasRef.current, {
      textLayers,
      imageLayers,
      plateStyle,
      showPrintBoundary: showBoundary,
      is2DPreview: true,
      canvasWidth: 1024,
      canvasHeight: 512,
    });
  }, [textLayers, imageLayers, plateStyle, showBoundary]);

  const getCanvasCoords = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 1024 / rect.width;
    const scaleY = 512 / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e) => {
    const coords = getCanvasCoords(e);

    // 1. Check Image layers
    for (let i = imageLayers.length - 1; i >= 0; i--) {
      const img = imageLayers[i];
      const w = img.width || 120;
      const h = img.height || 120;
      if (
        coords.x >= img.x - w / 2 &&
        coords.x <= img.x + w / 2 &&
        coords.y >= img.y - h / 2 &&
        coords.y <= img.y + h / 2
      ) {
        setSelectedLayerId(img.id);
        setSelectedLayerType('image');
        setIsDragging(true);
        setDragStart(coords);
        setInitialPos({ x: img.x, y: img.y });
        return;
      }
    }

    // 2. Check Text layers
    for (let i = textLayers.length - 1; i >= 0; i--) {
      const txt = textLayers[i];
      const approxW = (txt.text.length * (txt.fontSize || 36) * 0.55);
      const approxH = (txt.fontSize || 36) * 1.5;
      if (
        coords.x >= txt.x - approxW / 2 &&
        coords.x <= txt.x + approxW / 2 &&
        coords.y >= txt.y - approxH / 2 &&
        coords.y <= txt.y + approxH / 2
      ) {
        setSelectedLayerId(txt.id);
        setSelectedLayerType('text');
        setIsDragging(true);
        setDragStart(coords);
        setInitialPos({ x: txt.x, y: txt.y });
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedLayerId) return;
    const coords = getCanvasCoords(e);
    const deltaX = coords.x - dragStart.x;
    const deltaY = coords.y - dragStart.y;

    const newX = Math.round(initialPos.x + deltaX);
    const newY = Math.round(initialPos.y + deltaY);

    if (selectedLayerType === 'text') {
      setTextLayers((prev) =>
        prev.map((l) => (l.id === selectedLayerId ? { ...l, x: newX, y: newY } : l))
      );
    } else if (selectedLayerType === 'image') {
      setImageLayers((prev) =>
        prev.map((l) => (l.id === selectedLayerId ? { ...l, x: newX, y: newY } : l))
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const centerHorizontal = () => {
    if (!selectedLayerId) return;
    if (selectedLayerType === 'text') {
      setTextLayers((prev) =>
        prev.map((l) => (l.id === selectedLayerId ? { ...l, x: 512 } : l))
      );
    } else {
      setImageLayers((prev) =>
        prev.map((l) => (l.id === selectedLayerId ? { ...l, x: 512 } : l))
      );
    }
  };

  const centerVertical = () => {
    if (!selectedLayerId) return;
    if (selectedLayerType === 'text') {
      setTextLayers((prev) =>
        prev.map((l) => (l.id === selectedLayerId ? { ...l, y: 256 } : l))
      );
    } else {
      setImageLayers((prev) =>
        prev.map((l) => (l.id === selectedLayerId ? { ...l, y: 256 } : l))
      );
    }
  };

  const deleteSelected = () => {
    if (!selectedLayerId) return;
    if (selectedLayerType === 'text') {
      setTextLayers((prev) => prev.filter((l) => l.id !== selectedLayerId));
    } else {
      setImageLayers((prev) => prev.filter((l) => l.id !== selectedLayerId));
    }
    setSelectedLayerId(null);
  };

  const activeLayer =
    selectedLayerType === 'text'
      ? textLayers.find((l) => l.id === selectedLayerId)
      : imageLayers.find((l) => l.id === selectedLayerId);

  return (
    <div className="flex flex-col h-full bg-[#12141c] rounded-2xl border border-[#262838] overflow-hidden shadow-xl">
      {/* 2D Canvas Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#171924] border-b border-[#262838]">
        <div className="flex items-center space-x-2">
          <Move size={16} className="text-[#d4af37]" />
          <span className="text-xs font-semibold text-white tracking-wide uppercase">Base Plate 2D Layout</span>
          <span className="text-[11px] text-[#8e94a8] hidden sm:inline">(Pedestal Front Face)</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowBoundary(!showBoundary)}
            title="Toggle Safe Zone Guides"
            className={`p-1.5 rounded-lg text-xs font-medium transition ${
              showBoundary ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-[#8e94a8] hover:text-white'
            }`}
          >
            <ShieldAlert size={15} />
          </button>
          <button
            onClick={centerHorizontal}
            title="Center Horizontally"
            disabled={!selectedLayerId}
            className="p-1.5 text-[#8e94a8] hover:text-white disabled:opacity-30 rounded-lg hover:bg-[#252838] transition"
          >
            <AlignHorizontalDistributeCenter size={15} />
          </button>
          <button
            onClick={centerVertical}
            title="Center Vertically"
            disabled={!selectedLayerId}
            className="p-1.5 text-[#8e94a8] hover:text-white disabled:opacity-30 rounded-lg hover:bg-[#252838] transition"
          >
            <AlignVerticalDistributeCenter size={15} />
          </button>
          <button
            onClick={deleteSelected}
            title="Delete Selected Item"
            disabled={!selectedLayerId}
            className="p-1.5 text-red-400 hover:text-red-300 disabled:opacity-30 rounded-lg hover:bg-red-500/10 transition"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Canvas Viewport (2:1 aspect ratio) */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center p-4 bg-[#0e1017] overflow-hidden"
      >
        <div className="relative w-full max-w-[480px] aspect-[2/1] rounded-xl shadow-2xl border border-[#2b2e3e] overflow-hidden cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full block"
          />

          {/* Active Layer Indicator */}
          {activeLayer && (
            <div
              className="absolute pointer-events-none border border-[#d4af37] bg-[#d4af37]/10 rounded shadow transition-all duration-75"
              style={{
                left: `${(activeLayer.x / 1024) * 100}%`,
                top: `${(activeLayer.y / 512) * 100}%`,
                width: selectedLayerType === 'text' ? '40%' : `${((activeLayer.width || 120) / 1024) * 100}%`,
                height: selectedLayerType === 'text' ? '20%' : `${((activeLayer.height || 120) / 512) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-black bg-[#d4af37] px-1.5 py-0.5 rounded whitespace-nowrap">
                {selectedLayerType === 'text' ? 'TEXT' : 'LOGO'} (X: {activeLayer.x}, Y: {activeLayer.y})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="px-3 py-1.5 bg-[#171924] border-t border-[#262838] flex items-center justify-between text-[11px] text-[#8e94a8]">
        <span>Drag elements to reposition on base plate</span>
        <span className="font-mono text-[#d4af37]">1024 x 512 (2:1 Base Ratio)</span>
      </div>
    </div>
  );
}
