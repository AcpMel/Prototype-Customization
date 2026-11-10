# 3D Product Customizer Prototype (Pedestal Base Customization, Smooth STL & PNG Exporter)

A prototype website built with **React.js**, **Three.js**, and **Node.js Express** that allows users to customize awards and trophies in real-time 3D, featuring `shape 3.glb`.

---

## ✦ Key Features

### 1. Base-Exclusive Customization
- **Upper Crystal**: Remains pristine optical crystal without any text or logo obstruction.
- **Pedestal Base Engraving**: All text lines, custom typography, metallic engraving finishes, and company logos/emblems are rendered on the front of the pedestal base (`o Cylinder`).
- **Adjustable Plate Position**: Slide the base plate vertically between the Lower Drum and the Center Bevel.

### 2. High-Accuracy Smooth STL 3D Exporting
- **Anti-Aliased Continuous Embossing**: Uses sub-pixel bilinear filtering with a $3 \times 3$ sampling kernel and Hermite smoothstep interpolation. This eliminates vertex spikes/dots and produces clean, continuous, solid 3D beveled lettering and artwork contours.
- **Watertight Solid Geometry**: Modeled with solid 3D depth and cylindrical base curvature ($r = 0.405$), ready for 3D slicing software (Cura, PrusaSlicer, Bambu Studio) and CNC milling.
- **STL Options**:
  - **Base Plate (.stl)** — Watertight solid base plate with clean continuous 3D embossed engraving.
  - **Full Trophy (.stl)** — Complete assembled 3D trophy (crystal peak + base + customized plate).

### 3. Full PNG Export Options Available
- **Plate Texture (.png)** — High-resolution 2048x1024 flat UV engraving graphic for laser etching or print production.
- **3D Viewport Snapshot (.png)** — High-resolution rendered 3D camera photo.

---

## ✦ Running the Project

### Development Server
```bash
npm run dev
```
- Frontend: **`http://localhost:3000`**
- Express API: **`http://localhost:3001`**

### Production Server
```bash
npm run build
npm start
```
- Production Application: **`http://localhost:3001`**
