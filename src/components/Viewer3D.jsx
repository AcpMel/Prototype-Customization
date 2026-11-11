import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { renderTextureCanvas } from '../utils/canvasRenderer';
import {
  RotateCcw,
  Play,
  Pause,
  Camera,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Target,
  FileDown,
  Box,
  Image as ImageIcon,
  ChevronDown
} from 'lucide-react';

export default function Viewer3D({
  textLayers,
  imageLayers,
  baseMaterial,
  bodyMaterial,
  plateStyle,
  platePositionY = 0.155,
  onCaptureThumbnail
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const baseMeshRef = useRef(null);
  const plaqueMeshRef = useRef(null);
  const basePlateMeshRef = useRef(null);
  const textureRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLighting, setActiveLighting] = useState('luxury');
  const [showWireframe, setShowWireframe] = useState(false);
  const [showStlMenu, setShowStlMenu] = useState(false);
  const [showPngMenu, setShowPngMenu] = useState(false);
  const [isExportingStl, setIsExportingStl] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#0c0d10');
    scene.fog = new THREE.FogExp2('#0c0d10', 0.035);

    // 2. Camera setup focused directly on the base
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.45, 2.8);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.04;
    controls.minDistance = 0.8;
    controls.maxDistance = 8;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.0;
    controls.target.set(0, 0.25, 0);
    controlsRef.current = controls;

    // 5. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    ambientLight.name = 'ambient';
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.8);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.name = 'key';
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd0e8ff, 1.8);
    fillLight.position.set(-3, 3, 3);
    fillLight.name = 'fill';
    scene.add(fillLight);

    const baseSpotlight = new THREE.DirectionalLight(0xfff8ee, 2.2);
    baseSpotlight.position.set(0, 1.0, 3.5);
    baseSpotlight.name = 'baseSpot';
    scene.add(baseSpotlight);

    const rimLight = new THREE.DirectionalLight(0xffd700, 3.0);
    rimLight.position.set(0, 5, -4);
    rimLight.name = 'rim';
    scene.add(rimLight);

    const shadowPlaneGeo = new THREE.PlaneGeometry(16, 16);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.001;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const ringGeo = new THREE.RingGeometry(1.6, 1.62, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.001;
    scene.add(ring);

    // 6. Dynamic Canvas Texture (2048 x 1024)
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    canvasRef.current = canvas;

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textureRef.current = texture;

    // 7. Load GLB Model
    const loader = new GLTFLoader();
    loader.load(
      `${import.meta.env.BASE_URL}models/shape-3.glb`,
      (gltf) => {
        const root = gltf.scene;
        modelRef.current = root;

        const b0 = new THREE.Box3().setFromObject(root);
        const targetHeight = 2.8;
        const initialHeight = b0.max.y - b0.min.y;
        const scale = targetHeight / initialHeight;
        root.scale.setScalar(scale);
        root.updateMatrixWorld(true);

        const b1 = new THREE.Box3().setFromObject(root);
        const center = b1.getCenter(new THREE.Vector3());
        root.position.x = -center.x;
        root.position.y = -b1.min.y;
        root.position.z = -center.z;
        root.updateMatrixWorld(true);

        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const name = (child.name || '').toLowerCase();

            if (name.includes('cylinder')) {
              baseMeshRef.current = child;
              child.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(baseMaterial?.color || '#111111'),
                roughness: baseMaterial?.roughness !== undefined ? baseMaterial.roughness : 0.2,
                metalness: baseMaterial?.metalness !== undefined ? baseMaterial.metalness : 0.1,
              });
            } else {
              plaqueMeshRef.current = child;
              child.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(bodyMaterial?.color || '#ffffff'),
                transparent: true,
                transmission: bodyMaterial?.transmission !== undefined ? bodyMaterial.transmission : 0.95,
                opacity: 1,
                roughness: bodyMaterial?.roughness !== undefined ? bodyMaterial.roughness : 0.05,
                ior: bodyMaterial?.ior || 1.52,
                metalness: bodyMaterial?.metalness || 0.0,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                reflectivity: 0.9,
                side: THREE.DoubleSide,
              });
            }
          }
        });

        // 8. Create Solid 3D Base Engraving Plate
        const plateWidth = 0.52;
        const plateHeight = 0.18;
        const plateDepth = 0.015;
        const plateGeo = new THREE.BoxGeometry(plateWidth, plateHeight, plateDepth, 32, 8, 2);

        const posAttr = plateGeo.attributes.position;
        const r = 0.405;
        for (let i = 0; i < posAttr.count; i++) {
          const x = posAttr.getX(i);
          const z = posAttr.getZ(i);
          const zOffset = -(r - Math.sqrt(Math.max(0, r * r - x * x)));
          posAttr.setZ(i, z + zOffset);
        }
        plateGeo.computeVertexNormals();

        const plateMat = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.2,
          metalness: 0.9,
          side: THREE.DoubleSide,
        });

        const basePlateMesh = new THREE.Mesh(plateGeo, plateMat);
        basePlateMesh.name = 'BaseEngravingPlate';
        basePlateMesh.position.set(0, platePositionY || 0.155, 0.408);
        basePlateMesh.castShadow = true;
        basePlateMeshRef.current = basePlateMesh;

        scene.add(basePlateMesh);
        root.attach(basePlateMesh);

        scene.add(root);
        setLoading(false);

        updateCanvasTexture();
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (error) => {
        console.error('Error loading 3D GLB model:', error);
        setLoading(false);
      }
    );

    let isRunning = true;
    const animate = () => {
      if (!isRunning) return;
      animFrameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Canvas Texture
  const updateCanvasTexture = useCallback(async () => {
    if (!canvasRef.current || !textureRef.current) return;
    await renderTextureCanvas(canvasRef.current, {
      textLayers,
      imageLayers,
      plateStyle,
      showPrintBoundary: false,
      is2DPreview: false,
      canvasWidth: 2048,
      canvasHeight: 1024,
    });
    textureRef.current.needsUpdate = true;
  }, [textLayers, imageLayers, plateStyle]);

  useEffect(() => {
    updateCanvasTexture();
  }, [updateCanvasTexture]);

  useEffect(() => {
    if (!baseMeshRef.current || !baseMaterial) return;
    const mat = baseMeshRef.current.material;
    if (mat) {
      mat.color.set(baseMaterial.color || '#111111');
      mat.roughness = baseMaterial.roughness !== undefined ? baseMaterial.roughness : 0.2;
      mat.metalness = baseMaterial.metalness !== undefined ? baseMaterial.metalness : 0.1;
      mat.needsUpdate = true;
    }
  }, [baseMaterial]);

  useEffect(() => {
    if (!plaqueMeshRef.current || !bodyMaterial) return;
    const mat = plaqueMeshRef.current.material;
    if (mat) {
      mat.color.set(bodyMaterial.color || '#ffffff');
      mat.transmission = bodyMaterial.transmission !== undefined ? bodyMaterial.transmission : 0.95;
      mat.roughness = bodyMaterial.roughness !== undefined ? bodyMaterial.roughness : 0.05;
      mat.ior = bodyMaterial.ior || 1.52;
      mat.metalness = bodyMaterial.metalness || 0.0;
      mat.wireframe = showWireframe;
      mat.needsUpdate = true;
    }
  }, [bodyMaterial, showWireframe]);

  useEffect(() => {
    if (basePlateMeshRef.current) {
      basePlateMeshRef.current.position.y = platePositionY;
    }
  }, [platePositionY]);

  const toggleAutoRotate = () => {
    const nextState = !autoRotate;
    setAutoRotate(nextState);
    if (controlsRef.current) {
      controlsRef.current.autoRotate = nextState;
    }
  };

  const setCameraView = (view) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    setAutoRotate(false);
    controls.autoRotate = false;

    switch (view) {
      case 'base':
        controls.target.set(0, 0.18, 0);
        camera.position.set(0, 0.26, 1.45);
        break;
      case 'front':
        controls.target.set(0, 0.35, 0);
        camera.position.set(0, 0.55, 2.7);
        break;
      case 'isometric':
        controls.target.set(0, 0.35, 0);
        camera.position.set(2.0, 0.9, 2.4);
        break;
      case 'side':
        controls.target.set(0, 0.25, 0);
        camera.position.set(2.8, 0.35, 0.1);
        break;
      case 'top':
        controls.target.set(0, 0.40, 0);
        camera.position.set(0, 4.2, 0.3);
        break;
      default:
        controls.target.set(0, 0.25, 0);
        camera.position.set(0, 0.45, 2.8);
    }
    controls.update();
  };

  const handleZoom = (delta) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.multiplyScalar(delta > 0 ? 0.85 : 1.15);
    controlsRef.current?.update();
  };

  const applyLightingPreset = (preset) => {
    setActiveLighting(preset);
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    const key = scene.getObjectByName('key');
    const fill = scene.getObjectByName('fill');
    const rim = scene.getObjectByName('rim');
    const ambient = scene.getObjectByName('ambient');
    const baseSpot = scene.getObjectByName('baseSpot');

    if (!key || !fill || !rim || !ambient) return;

    if (preset === 'luxury') {
      scene.background.set('#0c0d10');
      ambient.intensity = 0.85;
      key.color.set('#fff5ea');
      key.intensity = 2.8;
      rim.color.set('#ffd700');
      rim.intensity = 3.0;
      fill.color.set('#d0e8ff');
      if (baseSpot) baseSpot.intensity = 2.2;
    } else if (preset === 'warm') {
      scene.background.set('#16120e');
      ambient.intensity = 0.9;
      key.color.set('#ffc68a');
      key.intensity = 3.2;
      rim.color.set('#ff9e42');
      rim.intensity = 3.2;
      fill.color.set('#ffe8d6');
      if (baseSpot) baseSpot.intensity = 2.4;
    } else if (preset === 'clean') {
      scene.background.set('#1a1c22');
      ambient.intensity = 1.1;
      key.color.set('#ffffff');
      key.intensity = 2.4;
      rim.color.set('#ffffff');
      rim.intensity = 2.0;
      fill.color.set('#ffffff');
      if (baseSpot) baseSpot.intensity = 2.5;
    } else if (preset === 'cyber') {
      scene.background.set('#070913');
      ambient.intensity = 0.6;
      key.color.set('#00f0ff');
      key.intensity = 3.0;
      rim.color.set('#ff007b');
      rim.intensity = 3.5;
      fill.color.set('#7928ca');
      if (baseSpot) baseSpot.intensity = 2.5;
    }
  };

  // ----------------------------------------------------
  // SAVE AS PNG OPTIONS
  // ----------------------------------------------------
  const captureSnapshotPNG = () => {
    setShowPngMenu(false);
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png', 1.0);

    if (onCaptureThumbnail) {
      onCaptureThumbnail(dataUrl);
    }

    const link = document.createElement('a');
    link.download = `3d-custom-trophy-snapshot-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const downloadPlateTexturePNG = () => {
    setShowPngMenu(false);
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `custom-base-plate-texture-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // ----------------------------------------------------
  // SAVE AS STL: SMOOTH, CONTINUOUS, ACCURATE 3D MESH
  // ----------------------------------------------------
  const exportAsSTL = (target = 'plate') => {
    setIsExportingStl(true);
    setShowStlMenu(false);

    try {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Sub-pixel bilinear smoother with 3x3 kernel and Hermite smoothstep to eliminate dot artifacts
      const sampleSmoothHeight = (u, v) => {
        const fx = u * (width - 1);
        const fy = v * (height - 1);
        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        const rx = fx - ix;
        const ry = fy - iy;

        let weightedSum = 0;
        let totalWeight = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const cx = Math.max(0, Math.min(width - 1, ix + dx));
            const cy = Math.max(0, Math.min(height - 1, iy + dy));
            const w = (1 - Math.abs(dx - rx)) * (1 - Math.abs(dy - ry));

            const idx = (cy * width + cx) * 4;
            const rVal = data[idx];
            const gVal = data[idx + 1];
            const bVal = data[idx + 2];
            const aVal = data[idx + 3] / 255;

            // Compute luminance of custom typography/artwork
            const lum = (rVal * 0.299 + gVal * 0.587 + bVal * 0.114) / 255;
            // Subtract plate background tone so only custom letters/artwork are raised
            const featureVal = Math.max(0, lum - 0.16) * aVal;

            weightedSum += featureVal * w;
            totalWeight += w;
          }
        }

        const avg = weightedSum / (totalWeight || 1);
        // Hermite smoothstep curve: creates continuous beveled edges without scattered dots or spikes
        const t = Math.max(0, Math.min(1, avg * 1.5));
        return t * t * (3 - 2 * t);
      };

      // High-resolution solid plate geometry
      const widthSegs = 160;
      const heightSegs = 80;
      const plateWidth = 0.52;
      const plateHeight = 0.18;
      const plateDepth = 0.015; // Solid 1.5% depth
      const plateGeo = new THREE.BoxGeometry(plateWidth, plateHeight, plateDepth, widthSegs, heightSegs, 1);

      const posAttr = plateGeo.attributes.position;
      const r = 0.405;

      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const z = posAttr.getZ(i);

        // Curvature around cylindrical base
        const curveZ = -(r - Math.sqrt(Math.max(0, r * r - x * x)));

        let embossZ = 0;
        // Only raise vertices on the front face (z > 0)
        if (z > 0.005) {
          const u = Math.max(0, Math.min(1, (x / plateWidth) + 0.5));
          const v = Math.max(0, Math.min(1, 0.5 - (y / plateHeight)));
          const heightFactor = sampleSmoothHeight(u, v);
          embossZ = heightFactor * 0.0038; // Clean, smooth 3.8mm raised physical engraving!
        }

        posAttr.setZ(i, z + curveZ + embossZ);
      }

      plateGeo.computeVertexNormals();

      const exportMesh = new THREE.Mesh(plateGeo, new THREE.MeshStandardMaterial());
      exportMesh.position.set(0, platePositionY || 0.155, 0.408);
      exportMesh.updateMatrixWorld(true);

      const exporter = new STLExporter();
      let binaryStl;

      if (target === 'full' && modelRef.current) {
        const exportGroup = new THREE.Group();
        const clonedModel = modelRef.current.clone();
        const existingPlate = clonedModel.getObjectByName('BaseEngravingPlate');
        if (existingPlate) clonedModel.remove(existingPlate);

        exportGroup.add(clonedModel);
        exportGroup.add(exportMesh);
        exportGroup.updateMatrixWorld(true);
        binaryStl = exporter.parse(exportGroup, { binary: true });
      } else {
        binaryStl = exporter.parse(exportMesh, { binary: true });
      }

      const blob = new Blob([binaryStl], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = target === 'full'
        ? `custom-trophy-complete-${Date.now()}.stl`
        : `custom-base-plate-${Date.now()}.stl`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting STL:', err);
    } finally {
      setIsExportingStl(false);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden select-none bg-[#0c0d10] ${
        isFullscreen ? 'fixed inset-0 z-50' : 'rounded-2xl border border-[#262833]'
      }`}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0c0d10]/95 backdrop-blur-md">
          <div className="relative w-16 h-16 mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-[#caa148]/20 border-t-[#d4af37] animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#d4af37] animate-pulse" />
          </div>
          <p className="text-white text-lg font-medium tracking-wide">Loading 3D Base Model...</p>
          <div className="w-48 h-1.5 bg-[#20222a] rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-[#d4af37] to-[#f7e7a9] transition-all duration-300"
              style={{ width: `${loadProgress || 50}%` }}
            />
          </div>
          <p className="text-xs text-[#a0a5b5] mt-2 font-mono">shape 3.glb • Front Base Engraving</p>
        </div>
      )}

      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center space-x-2 bg-[#14161f]/85 backdrop-blur-md border border-[#2b2e3d] px-3.5 py-1.5 rounded-full shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-ping" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">Base Engraving Active</span>
          <span className="text-xs text-[#8e94a8]">| STL & PNG Ready</span>
        </div>

        {/* View Shortcuts & Lighting */}
        <div className="pointer-events-auto flex items-center space-x-1.5 bg-[#14161f]/85 backdrop-blur-md border border-[#2b2e3d] p-1.5 rounded-2xl shadow-lg">
          <button
            onClick={() => setCameraView('base')}
            title="Focus Closely on Base"
            className="flex items-center space-x-1 px-3 py-1 text-xs font-bold text-black bg-gradient-to-r from-[#d4af37] to-[#f7e7a9] rounded-lg shadow transition"
          >
            <Target size={13} />
            <span>Base View</span>
          </button>
          <button
            onClick={() => setCameraView('front')}
            title="Front Full View"
            className="px-2.5 py-1 text-xs font-medium text-[#c8cddc] hover:text-white hover:bg-[#252838] rounded-lg transition"
          >
            Front
          </button>
          <button
            onClick={() => setCameraView('isometric')}
            title="Isometric 3D"
            className="px-2.5 py-1 text-xs font-medium text-[#c8cddc] hover:text-white hover:bg-[#252838] rounded-lg transition"
          >
            3D Beauty
          </button>
          <button
            onClick={() => setCameraView('side')}
            title="Side Profile"
            className="px-2.5 py-1 text-xs font-medium text-[#c8cddc] hover:text-white hover:bg-[#252838] rounded-lg transition"
          >
            Side
          </button>

          <div className="w-[1px] h-4 bg-[#2e3244]" />

          {/* Lighting Selector */}
          <div className="flex items-center space-x-1">
            {[
              { id: 'luxury', label: 'Gold' },
              { id: 'warm', label: 'Warm' },
              { id: 'clean', label: 'Studio' },
              { id: 'cyber', label: 'Neon' },
            ].map((light) => (
              <button
                key={light.id}
                onClick={() => applyLightingPreset(light.id)}
                className={`px-2 py-0.5 text-[11px] rounded font-medium transition ${
                  activeLighting === light.id
                    ? 'bg-[#d4af37] text-black font-semibold'
                    : 'text-[#8e94a8] hover:text-white'
                }`}
              >
                {light.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Floating Action Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center space-x-1.5 bg-[#14161f]/85 backdrop-blur-md border border-[#2b2e3d] p-1.5 rounded-2xl shadow-lg">
          <button
            onClick={toggleAutoRotate}
            title={autoRotate ? 'Pause Rotation' : 'Auto Rotate Showcase'}
            className={`p-2 rounded-xl transition ${
              autoRotate ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-[#a0a5b5] hover:text-white hover:bg-[#252838]'
            }`}
          >
            {autoRotate ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <button
            onClick={() => setCameraView('base')}
            title="Reset to Base View"
            className="p-2 text-[#a0a5b5] hover:text-white hover:bg-[#252838] rounded-xl transition"
          >
            <RotateCcw size={17} />
          </button>
          <button
            onClick={() => handleZoom(1)}
            title="Zoom In"
            className="p-2 text-[#a0a5b5] hover:text-white hover:bg-[#252838] rounded-xl transition"
          >
            <ZoomIn size={17} />
          </button>
          <button
            onClick={() => handleZoom(-1)}
            title="Zoom Out"
            className="p-2 text-[#a0a5b5] hover:text-white hover:bg-[#252838] rounded-xl transition"
          >
            <ZoomOut size={17} />
          </button>
          <button
            onClick={() => setShowWireframe(!showWireframe)}
            title="Toggle Wireframe Mesh"
            className={`p-2 rounded-xl transition ${
              showWireframe ? 'bg-indigo-500/20 text-indigo-400' : 'text-[#a0a5b5] hover:text-white hover:bg-[#252838]'
            }`}
          >
            <Layers size={17} />
          </button>
        </div>

        {/* Right Actions: STL & PNG Exporters */}
        <div className="pointer-events-auto flex items-center space-x-2 bg-[#14161f]/85 backdrop-blur-md border border-[#2b2e3d] p-1.5 rounded-2xl shadow-lg relative">
          
          {/* 1. SAVE AS STL BUTTON */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStlMenu(!showStlMenu);
                setShowPngMenu(false);
              }}
              disabled={isExportingStl}
              title="Export 3D Printable STL File"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-[#d4af37] hover:bg-[#f7e7a9] text-black rounded-xl shadow transition"
            >
              <FileDown size={14} />
              <span>{isExportingStl ? 'Exporting...' : 'Save as STL'}</span>
              <ChevronDown size={13} className="text-black/70" />
            </button>

            {showStlMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-56 bg-[#161824] border border-[#2c3044] rounded-2xl shadow-2xl p-1.5 z-40 space-y-1">
                <button
                  onClick={() => exportAsSTL('plate')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-white hover:bg-[#242838] rounded-xl text-left transition"
                >
                  <Box size={15} className="text-[#d4af37]" />
                  <div>
                    <div className="font-bold">Base Plate (.stl)</div>
                    <div className="text-[10px] text-[#8e94a8]">Smooth 3D Embossed Engraving</div>
                  </div>
                </button>
                <button
                  onClick={() => exportAsSTL('full')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-white hover:bg-[#242838] rounded-xl text-left transition"
                >
                  <Layers size={15} className="text-[#d4af37]" />
                  <div>
                    <div className="font-bold">Full Trophy (.stl)</div>
                    <div className="text-[10px] text-[#8e94a8]">Complete Assembled 3D Model</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* 2. SAVE AS PNG BUTTON */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPngMenu(!showPngMenu);
                setShowStlMenu(false);
              }}
              title="Save as PNG"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#222536] hover:bg-[#2c3046] border border-[#383d54] rounded-xl transition"
            >
              <ImageIcon size={14} className="text-[#d4af37]" />
              <span>Save as PNG</span>
              <ChevronDown size={13} className="text-[#8e94a8]" />
            </button>

            {showPngMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-56 bg-[#161824] border border-[#2c3044] rounded-2xl shadow-2xl p-1.5 z-40 space-y-1">
                <button
                  onClick={downloadPlateTexturePNG}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-white hover:bg-[#242838] rounded-xl text-left transition"
                >
                  <ImageIcon size={15} className="text-[#d4af37]" />
                  <div>
                    <div className="font-bold">Plate Texture (.png)</div>
                    <div className="text-[10px] text-[#8e94a8]">2048x1024 Flat UV Engraving</div>
                  </div>
                </button>
                <button
                  onClick={captureSnapshotPNG}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-white hover:bg-[#242838] rounded-xl text-left transition"
                >
                  <Camera size={15} className="text-[#d4af37]" />
                  <div>
                    <div className="font-bold">3D Viewport Snapshot (.png)</div>
                    <div className="text-[10px] text-[#8e94a8]">High-Res 3D Camera Render</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 text-[#a0a5b5] hover:text-white hover:bg-[#252838] rounded-xl transition"
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </div>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] text-[#6b7280] tracking-wide bg-[#0d0e14]/70 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
        Customization is on the front base plate • Both STL & PNG export options available
      </div>
    </div>
  );
}
