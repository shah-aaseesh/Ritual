import { ShareCardData, ShareTheme, ShareAspectRatio, PhotoFilter } from '../types/share';

interface CanvasDimensions {
  width: number;
  height: number;
}

export function getDimensions(aspectRatio: ShareAspectRatio): CanvasDimensions {
  switch (aspectRatio) {
    case 'story':
      return { width: 1080, height: 1920 }; // 9:16
    case 'square':
      return { width: 1080, height: 1080 }; // 1:1
    case 'post':
    default:
      return { width: 1080, height: 1350 }; // 4:5
  }
}

interface ThemeConfig {
  bgStart: string;
  bgEnd: string;
  cardBg: string;
  cardBorder: string;
  accent: string;
  accentGlow: string;
  secondaryAccent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  badgeBg: string;
  badgeText: string;
  topographyColor: string;
}

export function getThemeConfig(theme: ShareTheme): ThemeConfig {
  switch (theme) {
    case 'ember_flame':
      return {
        bgStart: '#121316',
        bgEnd: '#1E2026',
        cardBg: 'rgba(28, 30, 38, 0.88)',
        cardBorder: 'rgba(252, 82, 0, 0.4)',
        accent: '#FC5200', // Athletic Ember Orange
        accentGlow: 'rgba(252, 82, 0, 0.4)',
        secondaryAccent: '#FFA000',
        textPrimary: '#FFFFFF',
        textSecondary: '#E2E8F0',
        textMuted: '#94A3B8',
        badgeBg: '#FC5200',
        badgeText: '#FFFFFF',
        topographyColor: 'rgba(252, 82, 0, 0.12)'
      };
    case 'cyber_neon':
      return {
        bgStart: '#080A0F',
        bgEnd: '#121824',
        cardBg: 'rgba(16, 22, 36, 0.92)',
        cardBorder: 'rgba(204, 255, 0, 0.45)',
        accent: '#CCFF00', // Radioactive Neon Lime
        accentGlow: 'rgba(204, 255, 0, 0.35)',
        secondaryAccent: '#00F0FF',
        textPrimary: '#FFFFFF',
        textSecondary: '#E0F2FE',
        textMuted: '#64748B',
        badgeBg: '#CCFF00',
        badgeText: '#000000',
        topographyColor: 'rgba(0, 240, 255, 0.1)'
      };
    case 'sunset_mirage':
      return {
        bgStart: '#150D24',
        bgEnd: '#2A1138',
        cardBg: 'rgba(38, 20, 56, 0.88)',
        cardBorder: 'rgba(255, 94, 98, 0.45)',
        accent: '#FF5E62',
        accentGlow: 'rgba(255, 94, 98, 0.4)',
        secondaryAccent: '#FF9966',
        textPrimary: '#FFFFFF',
        textSecondary: '#FDE047',
        textMuted: '#D8B4FE',
        badgeBg: '#FF5E62',
        badgeText: '#FFFFFF',
        topographyColor: 'rgba(255, 94, 98, 0.12)'
      };
    case 'clean_mono':
      return {
        bgStart: '#0A0A0B',
        bgEnd: '#18181B',
        cardBg: 'rgba(24, 24, 27, 0.92)',
        cardBorder: 'rgba(255, 255, 255, 0.25)',
        accent: '#FFFFFF',
        accentGlow: 'rgba(255, 255, 255, 0.25)',
        secondaryAccent: '#A1A1AA',
        textPrimary: '#FFFFFF',
        textSecondary: '#E4E4E7',
        textMuted: '#71717A',
        badgeBg: '#FFFFFF',
        badgeText: '#000000',
        topographyColor: 'rgba(255, 255, 255, 0.08)'
      };
    case 'gold_champion':
      return {
        bgStart: '#0C0C0D',
        bgEnd: '#1C1917',
        cardBg: 'rgba(28, 25, 23, 0.92)',
        cardBorder: 'rgba(245, 158, 11, 0.45)',
        accent: '#F59E0B', // Metallic Gold
        accentGlow: 'rgba(245, 158, 11, 0.35)',
        secondaryAccent: '#FDE68A',
        textPrimary: '#FFFFFF',
        textSecondary: '#FEF3C7',
        textMuted: '#A8A29E',
        badgeBg: '#F59E0B',
        badgeText: '#000000',
        topographyColor: 'rgba(245, 158, 11, 0.1)'
      };
    case 'mosaic_emerald':
    default:
      return {
        bgStart: '#041610',
        bgEnd: '#0A261C',
        cardBg: 'rgba(11, 38, 29, 0.9)',
        cardBorder: 'rgba(52, 211, 153, 0.4)',
        accent: '#10B981', // Mosaic Emerald
        accentGlow: 'rgba(16, 185, 129, 0.4)',
        secondaryAccent: '#6EE7B7',
        textPrimary: '#FFFFFF',
        textSecondary: '#D1FAE5',
        textMuted: '#6EE7B7',
        badgeBg: '#10B981',
        badgeText: '#FFFFFF',
        topographyColor: 'rgba(16, 185, 129, 0.12)'
      };
  }
}

// Helper: Rounded Rectangle
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Helper: Topographic & Elevation lines (Athletic contour aesthetic)
function drawTopographyLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;

  for (let i = 0; i < 7; i++) {
    const startY = h * 0.22 + i * (h * 0.11);
    ctx.beginPath();
    ctx.moveTo(-50, startY);

    const cp1x = w * 0.25;
    const cp1y = startY + Math.sin(i * 1.3) * 120;
    const cp2x = w * 0.65;
    const cp2y = startY - Math.cos(i * 1.1) * 140;
    const endX = w + 50;
    const endY = startY + Math.sin(i * 0.8) * 80;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.stroke();
  }

  // Draw discrete elevation bars / pace curve at top right
  ctx.beginPath();
  const graphX = w - 240;
  const graphY = 90;
  const graphW = 160;
  const graphH = 40;
  ctx.moveTo(graphX, graphY + graphH);
  ctx.lineTo(graphX + 30, graphY + 15);
  ctx.lineTo(graphX + 70, graphY + 28);
  ctx.lineTo(graphX + 110, graphY + 8);
  ctx.lineTo(graphX + graphW, graphY + graphH);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

// Helper: Image loader promise
export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Draw photo cover background with aspect fill and filter overlay
function drawPhotoBackground(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  filter: PhotoFilter = 'dark_scrim',
  opacity: number = 0.95
) {
  ctx.save();
  ctx.globalAlpha = opacity;

  // Calculate cover crop dimensions
  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;
  let sWidth = img.width;
  let sHeight = img.height;
  let sx = 0;
  let sy = 0;

  if (imgRatio > canvasRatio) {
    sWidth = img.height * canvasRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width / canvasRatio;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, w, h);
  ctx.globalAlpha = 1.0;

  // Apply photo filter scrim for high contrast and legibility
  switch (filter) {
    case 'noir':
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.fillRect(0, 0, w, h);
      break;
    case 'contrast':
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(0, 0, w, h);
      // Dark vignette
      const vigGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);
      break;
    case 'warm':
      const warmGrad = ctx.createLinearGradient(0, 0, w, h);
      warmGrad.addColorStop(0, 'rgba(255, 94, 98, 0.35)');
      warmGrad.addColorStop(1, 'rgba(20, 10, 30, 0.8)');
      ctx.fillStyle = warmGrad;
      ctx.fillRect(0, 0, w, h);
      break;
    case 'none':
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, w, h);
      break;
    case 'dark_scrim':
    default:
      // Top to bottom dark gradient for optimal readability of stats HUD
      const darkGrad = ctx.createLinearGradient(0, 0, 0, h);
      darkGrad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
      darkGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.65)');
      darkGrad.addColorStop(1, 'rgba(0, 0, 0, 0.92)');
      ctx.fillStyle = darkGrad;
      ctx.fillRect(0, 0, w, h);
      break;
  }

  ctx.restore();
}

/**
 * Main function that renders the entire Strava-style graphic to an HTML5 Canvas
 */
export function renderShareCardToCanvas(
  canvas: HTMLCanvasElement,
  data: ShareCardData,
  theme: ShareTheme,
  aspectRatio: ShareAspectRatio,
  options: {
    showWatermark?: boolean;
    showHighlights?: boolean;
    showNote?: boolean;
    loadedImage?: HTMLImageElement | null;
  } = {}
) {
  const { showWatermark = true, showHighlights = true, showNote = true, loadedImage } = options;
  const { width, height } = getDimensions(aspectRatio);
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const config = getThemeConfig(theme);

  // 1. Background (Photo Cover or Gradient)
  if (loadedImage) {
    drawPhotoBackground(
      ctx,
      loadedImage,
      width,
      height,
      data.photoFilter || 'dark_scrim',
      data.photoOpacity ?? 0.95
    );
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, config.bgStart);
    bgGrad.addColorStop(1, config.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Topographic Strava Map Lines
  drawTopographyLines(ctx, width, height, config.topographyColor);

  // 3. Subtle background radial glow behind the main hero card
  const radialGlow = ctx.createRadialGradient(
    width / 2,
    height * 0.45,
    50,
    width / 2,
    height * 0.45,
    width * 0.5
  );
  radialGlow.addColorStop(0, config.accentGlow);
  radialGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 4. Header Section: Brand & Date
  const padX = 70;
  let cursorY = aspectRatio === 'story' ? 140 : 100;

  // Header Bar
  ctx.save();
  // Brand Tagline
  ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = config.accent;
  ctx.letterSpacing = '3px';
  ctx.fillText('RITUAL', padX, cursorY);

  const brandWidth = ctx.measureText('RITUAL').width;
  ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = config.textMuted;
  ctx.letterSpacing = '1px';
  ctx.fillText('// PERFORMANCE LAB', padX + brandWidth + 14, cursorY - 2);

  // Athlete name or verified badge right aligned
  ctx.textAlign = 'right';
  ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = config.textSecondary;
  const userDisplay = data.userName || 'Ritual Athlete';
  ctx.fillText(userDisplay.toUpperCase(), width - padX, cursorY);

  ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = config.textMuted;
  const dateDisplay = data.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  ctx.fillText(dateDisplay, width - padX, cursorY + 24);
  ctx.restore();

  cursorY += 65;

  // 5. Activity Category Badge Pill
  ctx.save();
  const badgeText = (data.badgeText || (data.type === 'workout' ? '⚡ WORKOUT FINISHED' : data.type === 'protocol' ? '🌿 PROTOCOL COMPLETED' : '🏆 MILESTONE UNLOCKED')).toUpperCase();
  ctx.font = '800 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const badgeW = ctx.measureText(badgeText).width + 36;
  const badgeH = 36;

  // Pill BG
  drawRoundedRect(ctx, padX, cursorY, badgeW, badgeH, 18);
  ctx.fillStyle = config.badgeBg;
  ctx.fill();

  // Pill Text
  ctx.fillStyle = config.badgeText;
  ctx.fillText(badgeText, padX + 18, cursorY + 24);
  ctx.restore();

  cursorY += 60;

  // 6. Big Title
  ctx.save();
  ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = config.textPrimary;
  
  const maxTitleWidth = width - padX * 2;
  let titleWords = (data.title || 'Session Complete').split(' ');
  let titleLine1 = '';
  let titleLine2 = '';

  for (const w of titleWords) {
    if (ctx.measureText((titleLine1 + ' ' + w).trim()).width < maxTitleWidth && !titleLine2) {
      titleLine1 = (titleLine1 + ' ' + w).trim();
    } else {
      titleLine2 = (titleLine2 + ' ' + w).trim();
    }
  }

  ctx.fillText(titleLine1, padX, cursorY);
  if (titleLine2) {
    cursorY += 54;
    ctx.fillText(titleLine2, padX, cursorY);
  }
  ctx.restore();

  if (data.subtitle) {
    cursorY += 32;
    ctx.font = '600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textMuted;
    ctx.fillText(data.subtitle, padX, cursorY);
  }

  cursorY += 45;

  // 7. Hero Primary Stat Card (Strava Big Metric Display)
  const heroCardH = aspectRatio === 'story' ? 220 : 185;
  const heroCardW = width - padX * 2;

  ctx.save();
  drawRoundedRect(ctx, padX, cursorY, heroCardW, heroCardH, 28);
  ctx.fillStyle = config.cardBg;
  ctx.fill();
  ctx.strokeStyle = config.cardBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Left accent decorative bar
  drawRoundedRect(ctx, padX + 6, cursorY + 18, 6, heroCardH - 36, 3);
  ctx.fillStyle = config.accent;
  ctx.fill();

  // Hero Label
  ctx.font = '800 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = config.accent;
  ctx.letterSpacing = '2px';
  ctx.fillText((data.primaryStat.label || 'TOTAL VOLUME').toUpperCase(), padX + 32, cursorY + 48);

  // Hero Value + Unit
  ctx.font = '900 82px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = config.textPrimary;
  const primaryValStr = typeof data.primaryStat.value === 'number' 
    ? data.primaryStat.value.toLocaleString() 
    : String(data.primaryStat.value);
  
  ctx.fillText(primaryValStr, padX + 32, cursorY + 138);

  if (data.primaryStat.unit) {
    const valWidth = ctx.measureText(primaryValStr).width;
    ctx.font = '700 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textMuted;
    ctx.fillText(data.primaryStat.unit, padX + 32 + valWidth + 14, cursorY + 138);
  }

  if (data.tagline || data.personalRecord) {
    const heroRightText = data.personalRecord ? `⚡ ${data.personalRecord}` : data.tagline || '';
    ctx.textAlign = 'right';
    ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.secondaryAccent;
    ctx.fillText(heroRightText, padX + heroCardW - 28, cursorY + 48);
  }

  ctx.restore();

  cursorY += heroCardH + 28;

  // 8. Secondary Stats Grid
  const stats = data.secondaryStats || [];
  if (stats.length > 0) {
    const colCount = Math.min(stats.length, 3);
    const colGap = 18;
    const colW = (heroCardW - colGap * (colCount - 1)) / colCount;
    const colH = 125;

    ctx.save();
    for (let i = 0; i < colCount; i++) {
      const stat = stats[i];
      const colX = padX + i * (colW + colGap);

      drawRoundedRect(ctx, colX, cursorY, colW, colH, 20);
      ctx.fillStyle = config.cardBg;
      ctx.fill();
      ctx.strokeStyle = stat.highlight ? config.cardBorder : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = stat.highlight ? config.accent : config.textMuted;
      ctx.letterSpacing = '1px';
      ctx.fillText(stat.label.toUpperCase(), colX + 20, cursorY + 36);

      ctx.font = '900 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = config.textPrimary;
      const statValStr = typeof stat.value === 'number' ? stat.value.toLocaleString() : String(stat.value);
      ctx.fillText(statValStr, colX + 20, cursorY + 84);

      if (stat.unit) {
        const sValW = ctx.measureText(statValStr).width;
        ctx.font = '600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = config.textMuted;
        ctx.fillText(stat.unit, colX + 20 + sValW + 6, cursorY + 84);
      }
    }
    ctx.restore();

    cursorY += colH + 28;
  }

  // 9. Muscle Groups / Highlights Section
  const itemsToDisplay = showHighlights 
    ? (data.targetMuscles || data.highlightItems || []) 
    : [];

  if (itemsToDisplay.length > 0 && cursorY < height - 260) {
    ctx.save();
    ctx.font = '800 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textMuted;
    ctx.letterSpacing = '1.5px';
    const sectionLabel = data.targetMuscles ? 'TARGETED MUSCLE GROUPS' : 'PROTOCOL HIGHLIGHTS';
    ctx.fillText(sectionLabel, padX, cursorY);
    cursorY += 24;

    let pillX = padX;
    const pillH = 38;
    ctx.font = '700 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    for (const item of itemsToDisplay.slice(0, 5)) {
      const itemStr = String(item);
      const pillW = ctx.measureText(itemStr).width + 34;

      if (pillX + pillW > width - padX) break;

      drawRoundedRect(ctx, pillX, cursorY, pillW, pillH, 19);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = config.textSecondary;
      ctx.fillText(itemStr, pillX + 17, cursorY + 24);

      pillX += pillW + 12;
    }
    ctx.restore();

    cursorY += pillH + 28;
  }

  // 10. Athlete Custom Note / Quote
  if (showNote && data.userCaption && cursorY < height - 200) {
    ctx.save();
    const noteH = 75;
    drawRoundedRect(ctx, padX, cursorY, heroCardW, noteH, 18);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = 'italic 500 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textSecondary;
    const quote = `“${data.userCaption}”`;
    ctx.fillText(quote, padX + 24, cursorY + 44);
    ctx.restore();

    cursorY += noteH + 20;
  }

  // 11. Footer / Brand Watermark
  if (showWatermark) {
    const footerY = height - (aspectRatio === 'story' ? 120 : 70);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(padX, footerY - 25);
    ctx.lineTo(width - padX, footerY - 25);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '800 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.accent;
    ctx.fillText('⚡ RITUAL ATHLETIC PERFORMANCE', padX, footerY + 5);

    ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textMuted;
    ctx.fillText('Evidence-Based Fitness & Wellness Protocol', padX, footerY + 26);

    ctx.textAlign = 'right';
    ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textPrimary;
    ctx.fillText('RITUAL', width - padX, footerY + 5);

    ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textMuted;
    ctx.fillText('Daily Consistency Protocol', width - padX, footerY + 26);

    ctx.restore();
  }
}

/**
 * Screen Snapshot capture helper: captures an instant screen/window snapshot via Screen Capture API
 */
export async function captureScreenSnapshot(): Promise<string | null> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      return null;
    }
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: 'browser' } as any
    });

    const track = stream.getVideoTracks()[0];
    const imageCapture = new (window as any).ImageCapture(track);
    const bitmap = await imageCapture.grabFrame();
    
    // Convert bitmap to base64
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = bitmap.width;
    offscreenCanvas.height = bitmap.height;
    const offCtx = offscreenCanvas.getContext('2d');
    if (offCtx) {
      offCtx.drawImage(bitmap, 0, 0);
      const dataUrl = offscreenCanvas.toDataURL('image/jpeg', 0.9);
      track.stop();
      stream.getTracks().forEach(t => t.stop());
      return dataUrl;
    }
    track.stop();
    return null;
  } catch (err) {
    console.warn('Screen capture cancelled or not supported:', err);
    return null;
  }
}

/**
 * Converts a Canvas to a high-resolution PNG Blob
 */
export function exportCanvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate image blob'));
    }, 'image/png');
  });
}

/**
 * Triggers direct browser download of the rendered PNG
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string = 'ritual-activity-card.png') {
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies the canvas image directly to user clipboard
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await exportCanvasToBlob(canvas);
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

/**
 * Uses the Web Share API (native mobile/desktop share sheet) to share the image directly to Instagram, WhatsApp, Twitter, etc.
 */
export async function shareCanvasViaWebShare(
  canvas: HTMLCanvasElement,
  title: string,
  text: string
): Promise<boolean> {
  try {
    const blob = await exportCanvasToBlob(canvas);
    const file = new File([blob], 'ritual-activity.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text,
        files: [file]
      });
      return true;
    } else if (navigator.share) {
      await navigator.share({
        title,
        text,
        url: window.location.href
      });
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}
