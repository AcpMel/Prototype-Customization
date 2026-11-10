import React from 'react';
import {
  Sparkles,
  Save,
  FolderOpen,
  ShoppingBag,
  RotateCcw,
  Check,
  Award
} from 'lucide-react';

export default function Navbar({
  onOpenPresets,
  onSaveDesign,
  onOpenGallery,
  onOpenOrder,
  onReset,
  saveSuccess
}) {
  return (
    <header className="h-16 px-4 md:px-6 bg-[#0f1118]/90 backdrop-blur-md border-b border-[#262838] flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Title */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#805510] flex items-center justify-center shadow-lg shadow-[#d4af37]/20 border border-[#f7e7a9]/40">
          <Award size={20} className="text-black" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm md:text-base font-extrabold text-white tracking-wide uppercase">
              Awards Central
            </h1>
            <span className="text-[10px] font-bold bg-[#d4af37]/15 text-[#d4af37] px-2 py-0.5 rounded-full border border-[#d4af37]/30">
              3D Customizer
            </span>
          </div>
          <p className="text-[11px] text-[#8e94a8] hidden sm:block">
            Optical Crystal Peak Trophy (shape 3.glb)
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 md:space-x-3">
        <button
          onClick={onReset}
          title="Reset to default"
          className="p-2 text-[#8e94a8] hover:text-white rounded-xl hover:bg-[#1f2230] transition hidden sm:flex items-center space-x-1"
        >
          <RotateCcw size={15} />
          <span className="text-xs">Reset</span>
        </button>

        <button
          onClick={onOpenPresets}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-[#c8cddc] hover:text-white bg-[#181a24] hover:bg-[#222534] border border-[#2c2f40] rounded-xl transition"
        >
          <Sparkles size={14} className="text-[#d4af37]" />
          <span>Templates</span>
        </button>

        <button
          onClick={onOpenGallery}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-[#c8cddc] hover:text-white bg-[#181a24] hover:bg-[#222534] border border-[#2c2f40] rounded-xl transition"
        >
          <FolderOpen size={14} className="text-[#8e94a8]" />
          <span className="hidden md:inline">Saved Designs</span>
        </button>

        <button
          onClick={onSaveDesign}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#202433] hover:bg-[#2b3044] text-white border border-[#383d54] rounded-xl transition"
        >
          {saveSuccess ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Saved!</span>
            </>
          ) : (
            <>
              <Save size={14} className="text-[#d4af37]" />
              <span>Save</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenOrder}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-bold bg-gradient-to-r from-[#d4af37] via-[#f7e7a9] to-[#d4af37] text-black rounded-xl shadow-lg shadow-[#d4af37]/20 hover:opacity-95 transition transform hover:scale-[1.02]"
        >
          <ShoppingBag size={15} />
          <span>Get Quote / Order</span>
        </button>
      </div>
    </header>
  );
}
