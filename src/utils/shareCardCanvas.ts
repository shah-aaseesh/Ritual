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
  cardBgSecondary: string;
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
  gridColor: string;
}

export function getThemeConfig(theme: ShareTheme): ThemeConfig {
  switch (theme) {
    case 'ember_flame':
      return {
        bgStart: '#0C0E13',
        bgEnd: '#161922',
        cardBg: 'rgba(24, 27, 36, 0.88)',
        cardBgSecondary: 'rgba(18, 20, 28, 0.78)',
        cardBorder: 'rgba(252, 82, 0, 0.38)',
        accent: '#FC5200', // Athletic Ember Orange
        accentGlow: 'rgba(252, 82, 0, 0.45)',
        secondaryAccent: '#FFA000',
        textPrimary: '#FFFFFF',
        textSecondary: '#E2E8F0',
        textMuted: '#94A3B8',
        badgeBg: '#FC5200',
        badgeText: '#FFFFFF',
        topographyColor: 'rgba(252, 82, 0, 0.12)',
        gridColor: 'rgba(252, 82, 0, 0.04)'
      };
    case 'cyber_neon':
      return {
        bgStart: '#05070D',
        bgEnd: '#0D1320',
        cardBg: 'rgba(14, 20, 34, 0.88)',
        cardBgSecondary: 'rgba(9, 15, 26, 0.78)',
        cardBorder: 'rgba(204, 255, 0, 0.38)',
        accent: '#CCFF00', // Radioactive Neon Lime
        accentGlow: 'rgba(204, 255, 0, 0.4)',
        secondaryAccent: '#00F0FF',
        textPrimary: '#FFFFFF',
        textSecondary: '#E0F2FE',
        textMuted: '#64748B',
        badgeBg: '#CCFF00',
        badgeText: '#000000',
        topographyColor: 'rgba(0, 240, 255, 0.12)',
        gridColor: 'rgba(204, 255, 0, 0.04)'
      };
    case 'sunset_mirage':
      return {
        bgStart: '#12081E',
        bgEnd: '#200D2D',
        cardBg: 'rgba(32, 16, 46, 0.88)',
        cardBgSecondary: 'rgba(22, 11, 33, 0.78)',
        cardBorder: 'rgba(255, 94, 98, 0.38)',
        accent: '#FF5E62',
        accentGlow: 'rgba(255, 94, 98, 0.45)',
        secondaryAccent: '#FF9966',
        textPrimary: '#FFFFFF',
        textSecondary: '#FDE047',
        textMuted: '#D8B4FE',
        badgeBg: '#FF5E62',
        badgeText: '#FFFFFF',
        topographyColor: 'rgba(255, 94, 98, 0.12)',
        gridColor: 'rgba(255, 94, 98, 0.04)'
      };
    case 'clean_mono':
      return {
        bgStart: '#08080A',
        bgEnd: '#121215',
        cardBg: 'rgba(22, 22, 25, 0.88)',
        cardBgSecondary: 'rgba(16, 16, 18, 0.78)',
        cardBorder: 'rgba(255, 255, 255, 0.25)',
        accent: '#FFFFFF',
        accentGlow: 'rgba(255, 255, 255, 0.25)',
        secondaryAccent: '#A1A1AA',
        textPrimary: '#FFFFFF',
        textSecondary: '#E4E4E7',
        textMuted: '#71717A',
        badgeBg: '#FFFFFF',
        badgeText: '#000000',
        topographyColor: 'rgba(255, 255, 255, 0.08)',
        gridColor: 'rgba(255, 255, 255, 0.03)'
      };
    case 'gold_champion':
      return {
        bgStart: '#0A0A0B',
        bgEnd: '#171512',
        cardBg: 'rgba(26, 22, 18, 0.88)',
        cardBgSecondary: 'rgba(18, 15, 12, 0.78)',
        cardBorder: 'rgba(245, 158, 11, 0.38)',
        accent: '#F59E0B', // Metallic Gold
        accentGlow: 'rgba(245, 158, 11, 0.4)',
        secondaryAccent: '#FDE68A',
        textPrimary: '#FFFFFF',
        textSecondary: '#FEF3C7',
        textMuted: '#A8A29E',
        badgeBg: '#F59E0B',
        badgeText: '#000000',
        topographyColor: 'rgba(245, 158, 11, 0.12)',
        gridColor: 'rgba(245, 158, 11, 0.04)'
      };
    case 'mosaic_emerald':
    default:
      return {
        bgStart: '#03120C',
        bgEnd: '#081F17',
        cardBg: 'rgba(10, 32, 24, 0.88)',
        cardBgSecondary: 'rgba(6, 21, 16, 0.78)',
        cardBorder: 'rgba(52, 211, 153, 0.38)',
        accent: '#10B981', // Mosaic Emerald
        accentGlow: 'rgba(16, 185, 129, 0.45)',
        secondaryAccent: '#6EE7B7',
        textPrimary: '#FFFFFF',
        textSecondary: '#D1FAE5',
        textMuted: '#6EE7B7',
        badgeBg: '#10B981',
        badgeText: '#FFFFFF',
        topographyColor: 'rgba(16, 185, 129, 0.12)',
        gridColor: 'rgba(16, 185, 129, 0.04)'
      };
  }
}

// Fixed Rounded Rectangle function
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

// Helper: Draw Circular Progress Ring / Dial
function drawRadialProgressRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  percentage: number,
  accentColor: string,
  glowColor: string
) {
  const startAngle = -Math.PI / 2;
  const clampedPercent = Math.min(Math.max(percentage, 0), 100);
  const endAngle = startAngle + (clampedPercent / 100) * (Math.PI * 2);

  ctx.save();
  // 1. Background Track
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.stroke();

  // 2. Active Progress Glow & Arc
  if (clampedPercent > 0) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // 3. Center percentage text
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`${clampedPercent}%`, cx, cy - 2);

  ctx.font = '800 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.fillText('SCORE', cx, cy + 20);

  ctx.restore();
}

// Helper: Subtle Telemetry Grid & Topography lines
function drawBackgroundHUD(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  topographyColor: string,
  gridColor: string
) {
  ctx.save();

  // Subtle geometric grid lines
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  const gridSize = 90;
  for (let x = gridSize; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = gridSize; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Fluid topography contours
  ctx.strokeStyle = topographyColor;
  ctx.lineWidth = 2;

  for (let i = 0; i < 6; i++) {
    const startY = h * 0.15 + i * (h * 0.14);
    ctx.beginPath();
    ctx.moveTo(-50, startY);

    const cp1x = w * 0.3;
    const cp1y = startY + Math.sin(i * 1.4) * 110;
    const cp2x = w * 0.7;
    const cp2y = startY - Math.cos(i * 1.2) * 130;
    const endX = w + 50;
    const endY = startY + Math.sin(i * 0.9) * 70;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.stroke();
  }

  // Corner HUD reticles (+)
  const drawReticle = (rx: number, ry: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rx - 8, ry);
    ctx.lineTo(rx + 8, ry);
    ctx.moveTo(rx, ry - 8);
    ctx.lineTo(rx, ry + 8);
    ctx.stroke();
  };

  drawReticle(45, 45);
  drawReticle(w - 45, 45);
  drawReticle(45, h - 45);
  drawReticle(w - 45, h - 45);

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
      ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
      ctx.fillRect(0, 0, w, h);
      break;
    case 'contrast':
      ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
      ctx.fillRect(0, 0, w, h);
      const vigGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.85);
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(1, 'rgba(0,0,0,0.9)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);
      break;
    case 'warm':
      const warmGrad = ctx.createLinearGradient(0, 0, w, h);
      warmGrad.addColorStop(0, 'rgba(255, 94, 98, 0.35)');
      warmGrad.addColorStop(1, 'rgba(20, 10, 30, 0.85)');
      ctx.fillStyle = warmGrad;
      ctx.fillRect(0, 0, w, h);
      break;
    case 'none':
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, w, h);
      break;
    case 'dark_scrim':
    default:
      const darkGrad = ctx.createLinearGradient(0, 0, 0, h);
      darkGrad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
      darkGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.75)');
      darkGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
      ctx.fillStyle = darkGrad;
      ctx.fillRect(0, 0, w, h);
      break;
  }

  ctx.restore();
}

/**
 * Main function that renders an ultra-premium, athletic social share graphic to HTML5 Canvas
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

  // 1. Background (Photo Cover or Mesh Gradient)
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
    // Rich dark base mesh gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, config.bgStart);
    bgGrad.addColorStop(1, config.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. HUD Background Elements
  drawBackgroundHUD(ctx, width, height, config.topographyColor, config.gridColor);

  // 3. Dynamic Ambient Radial Glow behind the hero section
  const radialGlow = ctx.createRadialGradient(
    width / 2,
    height * 0.42,
    40,
    width / 2,
    height * 0.42,
    width * 0.6
  );
  radialGlow.addColorStop(0, config.accentGlow);
  radialGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // Layout Measurements & Vertical Proportional Distribution
  const padX = 72;
  const contentW = width - padX * 2;
  const isStory = aspectRatio === 'story';
  const isSquare = aspectRatio === 'square';

  // Responsive cursor positioning and section sizing
  let cursorY = isStory ? 180 : isSquare ? 80 : 110;
  const vGap = isStory ? 38 : isSquare ? 16 : 24;

  // 4. Top Header: Brand Logo Mark + Verified Athlete Profile
  ctx.save();

  // Left Brand Badge
  ctx.fillStyle = config.accent;
  ctx.shadowColor = config.accentGlow;
  ctx.shadowBlur = 12;
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('⚡ RITUAL', padX, cursorY + 4);
  ctx.shadowBlur = 0;

  const brandW = ctx.measureText('⚡ RITUAL').width;
  const labPillX = padX + brandW + 16;
  const labPillY = cursorY - 18;
  drawRoundedRect(ctx, labPillX, labPillY, 140, 28, 14);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '800 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = config.textSecondary;
  ctx.textAlign = 'center';
  ctx.fillText('ATHLETIC LAB', labPillX + 70, labPillY + 18);

  // Right Athlete Profile Info
  const athleteName = (data.userName || 'Alex Patel').trim();
  const initial = (athleteName.charAt(0) || 'A').toUpperCase();
  const avatarSize = 46;
  const avatarX = width - padX - avatarSize;
  const avatarY = cursorY - 24;

  // Avatar Circle with Neon Ring
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fill();
  ctx.strokeStyle = config.accent;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Initial
  ctx.font = '900 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(initial, avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 7);

  // Athlete Name & Date
  ctx.textAlign = 'right';
  ctx.font = '800 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(athleteName.toUpperCase(), avatarX - 16, cursorY - 4);

  ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = config.textMuted;
  const dateDisplay = data.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  ctx.fillText(dateDisplay, avatarX - 16, cursorY + 18);

  ctx.restore();

  cursorY += isStory ? 80 : 60;

  // 5. Activity Category Pill
  ctx.save();
  const fallbackBadge = data.type === 'workout' 
    ? '⚡ WORKOUT COMPLETED' 
    : data.type === 'nutrition' 
    ? '🥗 NUTRITION TARGET HIT' 
    : data.type === 'milestone' 
    ? '🏆 MILESTONE UNLOCKED' 
    : '🌿 BIO-PROTOCOL ACTIVE';
  
  const badgeText = (data.badgeText && !data.badgeText.includes('// PERFORMANCE LAB') 
    ? data.badgeText 
    : fallbackBadge).toUpperCase();

  ctx.font = '900 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const badgeW = ctx.measureText(badgeText).width + 36;
  const badgeH = 34;

  drawRoundedRect(ctx, padX, cursorY, badgeW, badgeH, 17);
  ctx.fillStyle = config.badgeBg;
  ctx.shadowColor = config.accentGlow;
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = config.badgeText;
  ctx.textAlign = 'left';
  ctx.fillText(badgeText, padX + 18, cursorY + 22);
  ctx.restore();

  cursorY += isStory ? 65 : 52;

  // 6. Big Display Title & Subtitle
  ctx.save();
  ctx.font = isStory ? '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '900 46px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  
  const maxTitleW = contentW;
  let titleWords = (data.title || 'Session Complete').split(' ');
  let titleLine1 = '';
  let titleLine2 = '';

  for (const w of titleWords) {
    if (ctx.measureText((titleLine1 + ' ' + w).trim()).width < maxTitleW && !titleLine2) {
      titleLine1 = (titleLine1 + ' ' + w).trim();
    } else {
      titleLine2 = (titleLine2 + ' ' + w).trim();
    }
  }

  ctx.fillText(titleLine1, padX, cursorY);
  if (titleLine2) {
    cursorY += isStory ? 56 : 50;
    ctx.fillText(titleLine2, padX, cursorY);
  }

  // Subtitle
  if (data.subtitle) {
    cursorY += isStory ? 38 : 32;
    ctx.font = '600 19px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textSecondary;
    ctx.fillText(`•  ${data.subtitle}`, padX, cursorY);
  }
  ctx.restore();

  cursorY += isStory ? 55 : 42;

  // 7. Hero Primary Stat Card (High-Tech Glassmorphism HUD)
  const heroCardH = isStory ? 270 : isSquare ? 180 : 215;
  ctx.save();

  // Draw Card Container
  drawRoundedRect(ctx, padX, cursorY, contentW, heroCardH, 28);
  ctx.fillStyle = config.cardBg;
  ctx.fill();
  ctx.strokeStyle = config.cardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Left Glowing Accent Strip
  drawRoundedRect(ctx, padX + 8, cursorY + 20, 6, heroCardH - 40, 3);
  ctx.fillStyle = config.accent;
  ctx.shadowColor = config.accentGlow;
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Determine if primary stat has percentage or score
  const primaryValStr = typeof data.primaryStat.value === 'number' 
    ? data.primaryStat.value.toLocaleString() 
    : String(data.primaryStat.value);

  const isPercentMetric = primaryValStr.includes('%') || data.completionRate !== undefined;
  const numPercent = data.completionRate ?? (parseInt(primaryValStr) || 0);

  // Hero Label
  ctx.font = '900 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = config.accent;
  ctx.fillText((data.primaryStat.label || 'PERFORMANCE METRIC').toUpperCase(), padX + 34, cursorY + 52);

  // Personal Record / Tagline pill at top right of card
  const topBadgeText = data.personalRecord 
    ? `⚡ ${data.personalRecord}` 
    : data.tagline 
    ? data.tagline 
    : 'Evidence-Based Protocol';

  ctx.font = '700 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const tagW = ctx.measureText(topBadgeText).width + 28;
  const tagX = padX + contentW - tagW - 24;
  drawRoundedRect(ctx, tagX, cursorY + 32, tagW, 28, 14);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = config.secondaryAccent;
  ctx.textAlign = 'center';
  ctx.fillText(topBadgeText, tagX + tagW / 2, cursorY + 50);

  // Hero Value + Unit
  ctx.textAlign = 'left';
  ctx.font = isStory ? '900 96px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '900 86px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 10;
  const valY = cursorY + (isStory ? 175 : 150);
  ctx.fillText(primaryValStr, padX + 34, valY);
  ctx.shadowBlur = 0;

  if (data.primaryStat.unit) {
    const valWidth = ctx.measureText(primaryValStr).width;
    ctx.font = '800 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textMuted;
    ctx.fillText(data.primaryStat.unit, padX + 34 + valWidth + 16, valY);
  }

  // If percentage metric and enough space on right, draw high-tech progress ring
  if (isPercentMetric && contentW > 600 && !isSquare) {
    const ringRadius = isStory ? 54 : 46;
    const ringCX = padX + contentW - 110;
    const ringCY = cursorY + heroCardH / 2 + 10;
    drawRadialProgressRing(ctx, ringCX, ringCY, ringRadius, numPercent, config.accent, config.accentGlow);
  }

  ctx.restore();

  cursorY += heroCardH + vGap;

  // 8. Secondary Stats Grid (3 balanced HUD columns)
  const stats = data.secondaryStats || [];
  if (stats.length > 0) {
    const colCount = Math.min(stats.length, 3);
    const colGap = 18;
    const colW = (contentW - colGap * (colCount - 1)) / colCount;
    const colH = isStory ? 165 : isSquare ? 110 : 130;

    ctx.save();
    for (let i = 0; i < colCount; i++) {
      const stat = stats[i];
      const colX = padX + i * (colW + colGap);

      // Glass Card
      drawRoundedRect(ctx, colX, cursorY, colW, colH, 22);
      ctx.fillStyle = config.cardBg;
      ctx.fill();
      ctx.strokeStyle = stat.highlight ? config.cardBorder : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Top accent indicator
      if (stat.highlight) {
        drawRoundedRect(ctx, colX + 16, cursorY + 2, colW - 32, 4, 2);
        ctx.fillStyle = config.accent;
        ctx.shadowColor = config.accentGlow;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Label
      ctx.textAlign = 'left';
      ctx.font = '800 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = stat.highlight ? config.accent : config.textMuted;
      ctx.fillText(stat.label.toUpperCase(), colX + 22, cursorY + (isStory ? 44 : 38));

      // Big Value
      ctx.font = isStory ? '900 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '900 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      const statValStr = typeof stat.value === 'number' ? stat.value.toLocaleString() : String(stat.value);
      const statValY = cursorY + (isStory ? 112 : 92);
      ctx.fillText(statValStr, colX + 22, statValY);

      if (stat.unit) {
        const sValW = ctx.measureText(statValStr).width;
        ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = config.textMuted;
        ctx.fillText(stat.unit, colX + 22 + sValW + 8, statValY);
      }
    }
    ctx.restore();

    cursorY += colH + vGap;
  }

  // 9. Session Intensity Visualizer or Weekly Consistency Bars
  if (isStory || (!isSquare && cursorY < height - 340)) {
    ctx.save();
    const visCardH = isStory ? 210 : 135;
    drawRoundedRect(ctx, padX, cursorY, contentW, visCardH, 24);
    ctx.fillStyle = config.cardBgSecondary;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Visualizer Header
    ctx.font = '800 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textMuted;
    ctx.textAlign = 'left';
    ctx.fillText('PERFORMANCE TELEMETRY & ADHERENCE', padX + 24, cursorY + 36);

    ctx.textAlign = 'right';
    ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.accent;
    ctx.fillText('⚡ LIVE BIOMETRIC SYNC', padX + contentW - 24, cursorY + 36);

    // Draw 14 momentum bars
    const barCount = 14;
    const barZoneW = contentW - 48;
    const barW = (barZoneW - (barCount - 1) * 10) / barCount;
    const barBaseY = cursorY + visCardH - 24;
    const barMaxH = visCardH - (isStory ? 80 : 60);

    const wavePatterns = [0.45, 0.7, 0.55, 0.85, 0.6, 0.95, 0.75, 0.8, 1.0, 0.65, 0.9, 0.85, 0.7, 0.95];

    for (let b = 0; b < barCount; b++) {
      const bx = padX + 24 + b * (barW + 10);
      const intensity = wavePatterns[b % wavePatterns.length];
      const bh = Math.max(12, intensity * barMaxH);
      const by = barBaseY - bh;

      drawRoundedRect(ctx, bx, by, barW, bh, 5);
      if (b >= barCount - 3) {
        // Active session highlight
        ctx.fillStyle = config.accent;
        ctx.shadowColor = config.accentGlow;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.fill();
      }
    }

    ctx.restore();
    cursorY += visCardH + vGap;
  }

  // 10. Protocol / Workout Highlights Chips
  const itemsToDisplay = showHighlights 
    ? (data.targetMuscles || data.highlightItems || []) 
    : [];

  if (itemsToDisplay.length > 0 && cursorY < height - (isStory ? 280 : 180)) {
    ctx.save();
    ctx.font = '800 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textMuted;
    ctx.textAlign = 'left';
    const sectionLabel = data.targetMuscles ? 'TARGETED MUSCLE GROUPS' : 'PROTOCOL PILLARS & FOCUS';
    ctx.fillText(sectionLabel, padX, cursorY);
    cursorY += 24;

    let pillX = padX;
    const pillH = isStory ? 46 : 40;
    ctx.font = '700 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    for (const item of itemsToDisplay.slice(0, 5)) {
      const itemStr = String(item);
      const textW = ctx.measureText(itemStr).width;
      const pillW = textW + 42;

      if (pillX + pillW > width - padX) break;

      drawRoundedRect(ctx, pillX, cursorY, pillW, pillH, pillH / 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glowing dot inside pill
      ctx.beginPath();
      ctx.arc(pillX + 16, cursorY + pillH / 2, 4, 0, Math.PI * 2);
      ctx.fillStyle = config.accent;
      ctx.fill();

      // Text
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(itemStr, pillX + 28, cursorY + (isStory ? 28 : 25));

      pillX += pillW + 12;
    }
    ctx.restore();

    cursorY += pillH + vGap;
  }

  // 11. Athlete Custom Note / Quote
  if (showNote && data.userCaption && cursorY < height - (isStory ? 200 : 130)) {
    ctx.save();
    const noteH = isStory ? 90 : 72;
    drawRoundedRect(ctx, padX, cursorY, contentW, noteH, 20);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = 'italic 600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textSecondary;
    ctx.textAlign = 'left';
    const quote = `“${data.userCaption}”`;
    ctx.fillText(quote, padX + 26, cursorY + (isStory ? 52 : 44));
    ctx.restore();

    cursorY += noteH + 16;
  }

  // 12. Ultra-Sleek Modern Footer Bar
  if (showWatermark) {
    const footerY = height - (isStory ? 140 : 75);

    ctx.save();
    // Divider line with subtle center glow
    ctx.beginPath();
    ctx.moveTo(padX, footerY - 26);
    ctx.lineTo(width - padX, footerY - 26);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center accent diamond
    ctx.beginPath();
    const midX = width / 2;
    const midY = footerY - 26;
    ctx.moveTo(midX, midY - 4);
    ctx.lineTo(midX + 4, midY);
    ctx.lineTo(midX, midY + 4);
    ctx.lineTo(midX - 4, midY);
    ctx.closePath();
    ctx.fillStyle = config.accent;
    ctx.fill();

    // Bottom Left Brand
    ctx.textAlign = 'left';
    ctx.font = '900 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.accent;
    ctx.fillText('⚡ RITUAL ATHLETIC LAB', padX, footerY + 6);

    ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textMuted;
    ctx.fillText('Evidence-Based Fitness & Longevity Protocol', padX, footerY + 28);

    // Bottom Right Verified Stamp
    ctx.textAlign = 'right';
    ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('RITUAL.FIT', width - padX, footerY + 6);

    ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.secondaryAccent;
    ctx.fillText('✓ VERIFIED ATHLETE LOG', width - padX, footerY + 28);

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
