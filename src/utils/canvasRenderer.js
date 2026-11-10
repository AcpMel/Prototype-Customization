/**
 * High-Resolution 2D Texture Renderer for Base Engraving Plate
 * Size: 2048 x 1024 (2:1 aspect ratio, perfectly matching award base plate proportions)
 */

const imageCache = new Map();

export function preloadImage(src) {
  if (!src) return Promise.resolve(null);
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src));
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      console.warn('Failed to load image:', src);
      resolve(null);
    };
    img.src = src;
  });
}

function drawCurvedText(ctx, text, centerX, centerY, radius, startAngle, letterSpacing = 2) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const chars = text.split('');
  const totalAngle = (chars.length * (ctx.measureText('M').width + letterSpacing)) / radius;
  let currentAngle = startAngle - totalAngle / 2;

  chars.forEach((char) => {
    const charWidth = ctx.measureText(char).width + letterSpacing;
    const charAngle = charWidth / radius;
    currentAngle += charAngle / 2;

    ctx.save();
    ctx.translate(
      centerX + radius * Math.sin(currentAngle),
      centerY - radius * Math.cos(currentAngle)
    );
    ctx.rotate(currentAngle);
    ctx.fillText(char, 0, 0);
    ctx.restore();

    currentAngle += charAngle / 2;
  });
  ctx.restore();
}

export async function renderTextureCanvas(canvas, {
  textLayers = [],
  imageLayers = [],
  plateStyle = null,
  showPrintBoundary = false,
  is2DPreview = false,
  canvasWidth = 2048,
  canvasHeight = 1024
} = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Background plate fill
  const plateBgColor = plateStyle?.color || '#18181b';
  ctx.fillStyle = plateBgColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Subtle metallic plate border / bevel effect
  if (plateStyle?.border !== false) {
    const strokeCol = plateStyle?.borderColor || '#D4AF37';
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 14;
    ctx.strokeRect(18, 18, canvasWidth - 36, canvasHeight - 36);

    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, canvasWidth - 64, canvasHeight - 64);
  }

  // Visual grid on 2D editor preview
  if (is2DPreview) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1.5;
    const gridSize = 128;
    for (let x = 0; x < canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y < canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
  }

  // Preload all image assets
  await Promise.all(imageLayers.map((layer) => preloadImage(layer.src)));

  // Render Image Layers
  for (const layer of imageLayers) {
    if (!layer.src) continue;
    const img = imageCache.get(layer.src);
    if (!img) continue;

    ctx.save();
    const x = (layer.x / 1024) * canvasWidth;
    const y = (layer.y / 512) * canvasHeight;
    const w = ((layer.width || 120) / 1024) * canvasWidth;
    const h = ((layer.height || 120) / 512) * canvasHeight;
    const rotationRad = ((layer.rotation || 0) * Math.PI) / 180;
    const opacity = layer.opacity !== undefined ? layer.opacity : 1;

    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    if (rotationRad !== 0) {
      ctx.rotate(rotationRad);
    }

    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // Render Text Layers
  for (const layer of textLayers) {
    if (!layer.text) continue;

    ctx.save();
    const x = (layer.x / 1024) * canvasWidth;
    const y = (layer.y / 512) * canvasHeight;
    const fontSize = ((layer.fontSize || 36) / 512) * canvasHeight;
    const fontStyle = layer.fontStyle || 'normal';
    const fontWeight = layer.fontWeight || 'normal';
    const fontFamily = layer.fontFamily || 'Cinzel';

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
    ctx.fillStyle = layer.color || '#D4AF37';
    ctx.textAlign = layer.align || 'center';
    ctx.textBaseline = 'middle';

    const rotationRad = ((layer.rotation || 0) * Math.PI) / 180;
    const letterSpacing = ((layer.letterSpacing || 0) / 1024) * canvasWidth;

    if (layer.curved) {
      const radius = ((layer.curveRadius || 350) / 512) * canvasHeight;
      drawCurvedText(ctx, layer.text, x, y, radius, 0, letterSpacing);
    } else {
      ctx.translate(x, y);
      if (rotationRad !== 0) {
        ctx.rotate(rotationRad);
      }

      const lines = layer.text.split('\n');
      const lineHeight = fontSize * 1.35;
      const totalTextHeight = (lines.length - 1) * lineHeight;

      lines.forEach((line, idx) => {
        const lineY = (idx * lineHeight) - (totalTextHeight / 2);

        if (letterSpacing > 0) {
          const chars = line.split('');
          const totalWidth = chars.reduce((acc, c) => acc + ctx.measureText(c).width + letterSpacing, 0) - letterSpacing;
          let currentX = 0;
          if (layer.align === 'center') currentX = -totalWidth / 2;
          else if (layer.align === 'right') currentX = -totalWidth;

          chars.forEach((c) => {
            ctx.fillText(c, currentX, lineY);
            currentX += ctx.measureText(c).width + letterSpacing;
          });
        } else {
          ctx.fillText(line, 0, lineY);
        }
      });
    }

    ctx.restore();
  }

  // Safe margin guide for 2D preview
  if (showPrintBoundary && is2DPreview) {
    ctx.save();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    const marginX = 0.05 * canvasWidth;
    const marginY = 0.08 * canvasHeight;
    ctx.strokeRect(marginX, marginY, canvasWidth - marginX * 2, canvasHeight - marginY * 2);

    ctx.fillStyle = '#D4AF37';
    ctx.font = '600 20px "Poppins", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BASE ENGRAVING SAFE ZONE', marginX + 10, marginY - 10);
    ctx.restore();
  }
}
