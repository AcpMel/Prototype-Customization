// Browser-only replacement for server.js (works on GitHub Pages).
// Designs and orders are stored in localStorage on the visitor's device.

const BASE = import.meta.env.BASE_URL // "/Prototype-Customization/" on Pages, "/" in dev

// Turns "/models/x.glb" or "models/x.glb" into a URL that respects the base path
export const asset = (p) => `${BASE}${String(p).replace(/^\/+/, '')}`

// ---------- helpers ----------
function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.error('Storage error:', err)
    return false
  }
}

// ---------- product (was GET /api/product) ----------
export async function getProduct() {
  const res = await fetch(asset('product.json'))
  if (!res.ok) throw new Error(`Failed to load product.json (${res.status})`)
  const product = await res.json()
  // Make URLs work under the base path
  product.modelUrl = asset(product.modelUrl)
  product.sampleLogos = product.sampleLogos.map((l) => ({ ...l, url: asset(l.url) }))
  return product
}

// ---------- designs (was /api/designs) ----------
const DESIGNS_KEY = 'pc_designs'

export async function getDesigns() {
  return read(DESIGNS_KEY)
}

export async function getDesign(id) {
  return read(DESIGNS_KEY).find((d) => d.id === id) || null
}

export async function saveDesign(body) {
  const designs = read(DESIGNS_KEY)
  const design = {
    id: body.id || 'design-' + Date.now(),
    name: body.name || 'Untitled Custom Design',
    createdAt: new Date().toISOString(),
    thumbnail: body.thumbnail || null,
    baseMaterial: body.baseMaterial,
    bodyMaterial: body.bodyMaterial,
    textLayers: body.textLayers || [],
    imageLayers: body.imageLayers || [],
  }
  const i = designs.findIndex((d) => d.id === design.id)
  if (i >= 0) {
    designs[i] = { ...designs[i], ...design, updatedAt: new Date().toISOString() }
  } else {
    designs.unshift(design)
  }
  write(DESIGNS_KEY, designs)
  return { success: true, design }
}

export async function deleteDesign(id) {
  const designs = read(DESIGNS_KEY)
  const next = designs.filter((d) => d.id !== id)
  if (next.length === designs.length) throw new Error('Design not found')
  write(DESIGNS_KEY, next)
  return { success: true }
}

// ---------- uploads (was POST /api/upload) ----------
// Converts the image to a data URL so it survives reloads and works with Three.js textures.
export function uploadImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) {
      reject(new Error('Only image files (PNG, JPG, SVG, WebP, GIF) are allowed.'))
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      reject(new Error('Image must be under 15 MB.'))
      return
    }
    const reader = new FileReader()
    reader.onload = () =>
      resolve({
        success: true,
        url: reader.result, // data: URL
        originalName: file.name,
        size: file.size,
        mimetype: file.type,
      })
    reader.onerror = () => reject(new Error('Could not read the image.'))
    reader.readAsDataURL(file)
  })
}

// ---------- orders (was /api/orders) ----------
// Prototype only: stored locally. To receive real orders, send this to Formspree/EmailJS.
const ORDERS_KEY = 'pc_orders'

export async function getOrders() {
  return read(ORDERS_KEY)
}

export async function createOrder(body) {
  const orders = read(ORDERS_KEY)
  const orderId =
    'ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 900 + 100)
  const order = {
    orderId,
    createdAt: new Date().toISOString(),
    status: 'Pending Review',
    customer: body.customer || {},
    quantity: body.quantity || 1,
    notes: body.notes || '',
    design: body.design || {},
    estimatedTotal: (body.quantity || 1) * 149.0,
  }
  orders.unshift(order)
  write(ORDERS_KEY, orders)
  return { success: true, message: 'Order placed successfully!', orderId, order }
}