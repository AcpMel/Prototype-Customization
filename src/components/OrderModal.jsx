import React, { useState } from 'react';
import { X, CheckCircle, ShoppingBag, ShieldCheck, Truck, Sparkles } from 'lucide-react';

export default function OrderModal({
  isOpen,
  onClose,
  textLayers,
  imageLayers,
  baseMaterial,
  bodyMaterial
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    quantity: 1,
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  if (!isOpen) return null;

  const unitPrice = 149.0;
  const quantity = Math.max(1, parseInt(formData.quantity, 10) || 1);
  // Bulk discount
  const discountRate = quantity >= 10 ? 0.2 : quantity >= 5 ? 0.1 : 0.0;
  const subtotal = quantity * unitPrice;
  const discount = subtotal * discountRate;
  const total = subtotal - discount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email,
            company: formData.company,
          },
          quantity,
          notes: formData.notes,
          design: {
            baseMaterial,
            bodyMaterial,
            textLayers,
            imageLayers,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderResult(data);
      }
    } catch (err) {
      console.error('Order submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setOrderResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#141620] border border-[#2b2e40] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262838] bg-[#181a26]">
          <div className="flex items-center space-x-2">
            <ShoppingBag size={18} className="text-[#d4af37]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {orderResult ? 'Order Confirmation' : 'Order Specification & Quote'}
            </h2>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-[#8e94a8] hover:text-white rounded-lg hover:bg-[#252838] transition"
          >
            <X size={18} />
          </button>
        </div>

        {orderResult ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle size={36} />
            </div>
            <h3 className="text-xl font-bold text-white">Custom 3D Order Placed!</h3>
            <p className="text-xs text-[#8e94a8] max-w-sm mx-auto">
              Your personalized 3D model specification and engraving vector files have been recorded.
            </p>

            <div className="bg-[#181b26] p-4 rounded-2xl border border-[#262838] text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#262838]">
                <span className="text-[#8e94a8]">Order ID:</span>
                <span className="font-mono text-[#d4af37] font-bold">{orderResult.orderId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#262838]">
                <span className="text-[#8e94a8]">Customer:</span>
                <span className="text-white font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#262838]">
                <span className="text-[#8e94a8]">Quantity:</span>
                <span className="text-white font-medium">{quantity} unit(s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#262838]">
                <span className="text-[#8e94a8]">Estimated Total:</span>
                <span className="text-emerald-400 font-bold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8e94a8]">Status:</span>
                <span className="text-yellow-400 font-medium">Pending Proof Review</span>
              </div>
            </div>

            <button
              onClick={resetAndClose}
              className="w-full py-3 bg-[#d4af37] hover:bg-[#f7e7a9] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition"
            >
              Back to 3D Customizer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Custom Specs Summary */}
            <div className="bg-[#181b26] p-3.5 rounded-2xl border border-[#262838] space-y-2 text-xs">
              <span className="text-[11px] font-bold text-[#d4af37] uppercase tracking-wider">
                Customized Product Specs
              </span>
              <div className="grid grid-cols-2 gap-2 text-[#8e94a8]">
                <div>
                  <span className="block text-[10px] text-[#555970]">Base Finish</span>
                  <span className="text-white font-medium">{baseMaterial?.name || 'Piano Black'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#555970]">Crystal Plaque</span>
                  <span className="text-white font-medium">{bodyMaterial?.name || 'Optical Crystal'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#555970]">Engraving Text Layers</span>
                  <span className="text-white font-medium">{textLayers.length} Custom Lines</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#555970]">Logo Artworks</span>
                  <span className="text-white font-medium">{imageLayers.length} Embedded</span>
                </div>
              </div>
            </div>

            {/* Customer Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8e94a8] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-[#0e1017] border border-[#2b2e40] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8e94a8] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@company.com"
                    className="w-full bg-[#0e1017] border border-[#2b2e40] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8e94a8] mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full bg-[#0e1017] border border-[#2b2e40] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8e94a8] mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-[#0e1017] border border-[#2b2e40] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8e94a8] mb-1">Estimated Total</label>
                  <div className="w-full bg-[#0e1017] border border-[#2b2e40] rounded-xl px-3 py-2 text-xs font-bold text-emerald-400">
                    ${total.toFixed(2)}{' '}
                    {discountRate > 0 && (
                      <span className="text-[10px] text-yellow-400 font-normal">
                        ({discountRate * 100}% off)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e94a8] mb-1">Production Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Need presentation gift box, event deadline, or special instructions..."
                  className="w-full bg-[#0e1017] border border-[#2b2e40] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37] transition"
                />
              </div>
            </div>

            {/* Features Guarantee */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8e94a8] pt-1">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck size={14} className="text-[#d4af37]" />
                <span>100% Optical Crystal Guarantee</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Truck size={14} className="text-[#d4af37]" />
                <span>Fast Express Courier Nationwide</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#aa771c] hover:from-[#f7e7a9] hover:to-[#d4af37] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition"
            >
              {submitting ? 'Submitting Order Specs...' : 'Confirm Order & Request Proof'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
