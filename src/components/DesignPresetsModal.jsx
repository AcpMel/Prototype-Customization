import React, { useState, useEffect } from 'react';
import { X, Sparkles, FolderOpen, Trash2, Check, Clock } from 'lucide-react';

export default function DesignPresetsModal({
  isOpen,
  onClose,
  onApplyDesign,
  initialTab = 'templates'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      fetchSavedDesigns();
    }
  }, [isOpen, initialTab]);

  const fetchSavedDesigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/designs');
      if (res.ok) {
        const data = await res.json();
        setSavedDesigns(data);
      }
    } catch (err) {
      console.error('Failed to fetch designs:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteDesign = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/designs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedDesigns((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete design:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#141620] border border-[#2b2e40] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262838] bg-[#181a26]">
          <div className="flex items-center space-x-2">
            <Sparkles size={18} className="text-[#d4af37]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Trophy Design Library
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8e94a8] hover:text-white rounded-lg hover:bg-[#252838] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#262838] bg-[#11131a] px-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'templates'
                ? 'border-[#d4af37] text-[#d4af37]'
                : 'border-transparent text-[#8e94a8] hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Award Templates</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'saved'
                ? 'border-[#d4af37] text-[#d4af37]'
                : 'border-transparent text-[#8e94a8] hover:text-white'
            }`}
          >
            <FolderOpen size={14} />
            <span>Saved Custom Designs ({savedDesigns.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedDesigns.slice(0, 3).map((template) => (
                <div
                  key={template.id}
                  onClick={() => {
                    onApplyDesign(template);
                    onClose();
                  }}
                  className="bg-[#181b26] p-4 rounded-2xl border border-[#2b2e40] hover:border-[#d4af37] cursor-pointer transition group shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-[#d4af37] tracking-wider uppercase">
                        Template
                      </span>
                      <span className="text-[10px] text-[#6b7280]">
                        {template.textLayers?.length || 0} Text Layers
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#d4af37] transition mb-1">
                      {template.name}
                    </h3>
                    <p className="text-xs text-[#8e94a8] line-clamp-2">
                      {template.textLayers?.[0]?.text || 'Pre-configured layout with engraving & emblem.'}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#262838] flex items-center justify-between text-xs font-semibold text-[#d4af37]">
                    <span>Apply This Template</span>
                    <Check size={14} className="opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </div>
              ))}

              {/* Blank Customizer Option */}
              <div
                onClick={() => {
                  onApplyDesign({
                    name: 'Blank Customizer',
                    baseMaterial: { name: 'Piano Black', color: '#111111', roughness: 0.2, metalness: 0.1 },
                    bodyMaterial: { name: 'Optical Crystal Clear', color: '#FFFFFF', transmission: 0.95, roughness: 0.05, ior: 1.52 },
                    textLayers: [
                      {
                        id: 'txt-blank-1',
                        text: 'YOUR CUSTOM TEXT HERE',
                        fontFamily: 'Cinzel',
                        fontSize: 40,
                        color: '#D4AF37',
                        fontWeight: 'bold',
                        x: 512,
                        y: 450,
                        rotation: 0,
                        letterSpacing: 4,
                        align: 'center',
                        curved: false,
                        curveRadius: 400,
                      },
                    ],
                    imageLayers: [],
                  });
                  onClose();
                }}
                className="bg-[#181b26] p-4 rounded-2xl border border-dashed border-[#383d54] hover:border-[#d4af37] cursor-pointer transition group shadow-lg flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-[#8e94a8] tracking-wider uppercase">
                    Blank Slate
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#d4af37] transition mt-1 mb-1">
                    Start From Scratch
                  </h3>
                  <p className="text-xs text-[#8e94a8]">
                    Clean crystal plaque with a single custom header to build your bespoke layout.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#262838] flex items-center justify-between text-xs font-semibold text-[#8e94a8] group-hover:text-[#d4af37]">
                  <span>Load Blank Template</span>
                  <Check size={14} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div>
              {loading ? (
                <div className="py-12 text-center text-xs text-[#8e94a8]">Loading saved designs...</div>
              ) : savedDesigns.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8e94a8]">
                  No saved designs yet. Click "Save" in the top bar to save your custom 3D model!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedDesigns.map((design) => (
                    <div
                      key={design.id}
                      onClick={() => {
                        onApplyDesign(design);
                        onClose();
                      }}
                      className="bg-[#181b26] p-4 rounded-2xl border border-[#2b2e40] hover:border-[#d4af37] cursor-pointer transition group shadow-lg flex flex-col justify-between"
                    >
                      <div>
                        {design.thumbnail && (
                          <div className="w-full h-32 bg-[#0c0d12] rounded-xl mb-3 overflow-hidden flex items-center justify-center border border-[#262838]">
                            <img src={design.thumbnail} alt="" className="h-full object-contain" />
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-bold text-white group-hover:text-[#d4af37] transition truncate">
                            {design.name}
                          </h3>
                          <button
                            onClick={(e) => deleteDesign(design.id, e)}
                            title="Delete Saved Design"
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] text-[#6b7280]">
                          <Clock size={12} />
                          <span>
                            {design.createdAt
                              ? new Date(design.createdAt).toLocaleDateString()
                              : 'Recent'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-[#262838] flex items-center justify-between text-xs font-semibold text-[#d4af37]">
                        <span>Load This Design</span>
                        <Check size={14} className="opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
