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
        bgStart: '#0E0F14',
        bgEnd: '#1A1C24',
        cardBg: 'rgba(26, 28, 38, 0.85)',
        cardBgSecondary: 'rgba(20, 22, 30, 0.75)',
        cardBorder: 'rgba(252, 82, 0, 0.35)',
        accent: '#FC5200', // Athletic Ember Orange
        accentGlow: 'rgba(252, 82, 0, 0.45)',
        secondaryAccent: '#FFA000',
        textPrimary: '#FFFFFF',
        textSecondary: '#E2E8F0',
        textMuted: '#94A3B8',
        badgeBg: '#FC5200',
        badgeText: '#FFFFFF',
        topographyColor: 'rgba(252, 82, 0, 0.14)',
        gridColor: 'rgba(252, 82, 0, 0.05)'
      };
    case 'cyber_neon':
      return {
        bgStart: '#06080E',
        bgEnd: '#0F1522',
        cardBg: 'rgba(15, 22, 36, 0.88)',
        cardBgSecondary: 'rgba(10, 16, 28, 0.75)',
        cardBorder: 'rgba(204, 255, 0, 0.35)',
        accent: '#CCFF00', // Radioactive Neon Lime
        accentGlow: 'rgba(204, 255, 0, 0.4)',
        secondaryAccent: '#00F0FF',
        textPrimary: '#FFFFFF',
        textSecondary: '#E0F2FE',
        textMuted: '#64748B',
        badgeBg: '#CCFF00',
        badgeText: '#000000',
        topographyColor: 'rgba(0, 240, 255, 0.12)',
        gridColor: 'rgba(204, 255, 0, 0.05)'
      };
    case 'sunset_mirage':
      return {
        bgStart: '#140A22',
        bgEnd: '#240F32',
        cardBg: 'rgba(34, 18, 50, 0.85)',
        cardBgSecondary: 'rgba(24, 12, 36, 0.75)',
        cardBorder: 'rgba(255, 94, 98, 0.35)',
        accent: '#FF5E62',
        accentGlow: 'rgba(255, 94, 98, 0.45)',
        secondaryAccent: '#FF9966',
        textPrimary: '#FFFFFF',
        textSecondary: '#FDE047',
        textMuted: '#D8B4FE',
        badgeBg: '#FF5E62',
        badgeText: '#FFFFFF',
        topographyColor: 'rgba(255, 94, 98, 0.14)',
        gridColor: 'rgba(255, 94, 98, 0.05)'
      };
    case 'clean_mono':
      return {
        bgStart: '#09090B',
        bgEnd: '#141417',
        cardBg: 'rgba(24, 24, 27, 0.85)',
        cardBgSecondary: 'rgba(18, 18, 20, 0.75)',
        cardBorder: 'rgba(255, 255, 255, 0.25)',
        accent: '#FFFFFF',
        accentGlow: 'rgba(255, 255, 255, 0.25)',
        secondaryAccent: '#A1A1AA',
        textPrimary: '#FFFFFF',
        textSecondary: '#E4E4E7',
        textMuted: '#71717A',
        badgeBg: '#FFFFFF',
        badgeText: '#000000',
        topographyColor: 'rgba(255, 255, 255, 0.09)',
        gridColor: 'rgba(255, 255, 255, 0.04)'
      };
    case 'gold_champion':
      return {
        bgStart: '#0B0B0C',
        bgEnd: '#191714',
        cardBg: 'rgba(28, 24, 20, 0.88)',
        cardBgSecondary: 'rgba(20, 17, 14, 0.75)',
        cardBorder: 'rgba(245, 158, 11, 0.35)',
        accent: '#F59E0B', // Metallic Gold
        accentGlow: 'rgba(245, 158, 11, 0.4)',
        secondaryAccent: '#FDE68A',
        textPrimary: '#FFFFFF',
        textSecondary: '#FEF3C7',
        textMuted: '#A8A29E',
        badgeBg: '#F59E0B',
        badgeText: '#000000',
        topographyColor: 'rgba(245, 158, 11, 0.12)',
        gridColor: 'rgba(245, 158, 11, 0.05)'
      };
    case 'mosaic_emerald':
    default:
      return {
        bgStart: '#04140E',
        bgEnd: '#09231A',
        cardBg: 'rgba(11, 35, 26, 0.88)',
        cardBgSecondary: 'rgba(7, 24, 18, 0.75)',
        cardBorder: 'rgba(52, 211, 153, 0.35)',
        accent: '#10B981', // Mosaic Emerald
        accentGlow: 'rgba(16, 185, 129, 0.45)',
        secondaryAccent: '#6EE7B7',
        textPrimary: '#FFFFFF',
        textSecondary: '#D1FAE5',
        textMuted: '#6EE7B7',
        badgeBg: '#10B981',
        badgeText: '#FFFFFF',
        topographyColor: 'rgba(16, 185, 129, 0.14)',
        gridColor: 'rgba(16, 185, 129, 0.05)'
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
  ctx.arcTo(x, y + w, x, y, r);
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
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.stroke();

  // 2. Active Progress Glow & Arc
  if (clampedPercent > 0) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // 3. Center percentage text
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`${clampedPercent}%`, cx, cy - 2);

  ctx.font = '800 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('SCORE', cx, cy + 22);

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

  // Draw subtle geometric grid lines
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  const gridSize = 80;
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

  // Draw fluid topography contours
  ctx.strokeStyle = topographyColor;
  ctx.lineWidth = 2.5;

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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rx - 10, ry);
    ctx.lineTo(rx + 10, ry);
    ctx.moveTo(rx, ry - 10);
    ctx.lineTo(rx, ry + 10);
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

  // Layout Measurements & Vertical Scaling
  const padX = 72;
  const contentW = width - padX * 2;
  const isStory = aspectRatio === 'story';
  const isSquare = aspectRatio === 'square';

  // Responsive cursor positioning
  let cursorY = isStory ? 130 : isSquare ? 80 : 95;
  const spacingMultiplier = isStory ? 1.35 : isSquare ? 0.85 : 1.0;

  // 4. Top Header: Brand Logo Mark + Verified Athlete Profile
  ctx.save();

  // Left Brand Badge
  // Glowing Icon
  ctx.fillStyle = config.accent;
  ctx.shadowColor = config.accentGlow;
  ctx.shadowBlur = 12;
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('⚡ RITUAL', padX, cursorY + 2);
  ctx.shadowBlur = 0;

  const brandW = ctx.measureText('⚡ RITUAL').width;
  // Sub-badge pill
  const labPillX = padX + brandW + 16;
  const labPillY = cursorY - 20;
  drawRoundedRect(ctx, labPillX, labPillY, 150, 28, 14);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '800 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = config.textSecondary;
  ctx.textAlign = 'center';
  ctx.fillText('ATHLETIC LAB', labPillX + 75, labPillY + 18);

  // Right Athlete Profile Info
  const athleteName = (data.userName || 'Alex Patel').trim();
  const initial = (athleteName.charAt(0) || 'A').toUpperCase();
  const avatarSize = 44;
  const avatarX = width - padX - avatarSize;
  const avatarY = cursorY - 24;

  // Avatar Circle with Neon Ring
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fill();
  ctx.strokeStyle = config.accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Initial
  ctx.font = '900 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(initial, avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 7);

  // Athlete Name & Date (left of avatar)
  ctx.textAlign = 'right';
  ctx.font = '800 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(athleteName.toUpperCase(), avatarX - 16, cursorY - 4);

  ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = config.textMuted;
  const dateDisplay = data.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  ctx.fillText(dateDisplay, avatarX - 16, cursorY + 16);

  ctx.restore();

  cursorY += Math.round(58 * spacingMultiplier);

  // 5. Activity Category Pill (Clean, distinct)
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

  cursorY += Math.round(50 * spacingMultiplier);

  // 6. Big Display Title & Subtitle
  ctx.save();
  ctx.font = '900 46px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
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
    cursorY += 50;
    ctx.fillText(titleLine2, padX, cursorY);
  }

  // Subtitle
  if (data.subtitle) {
    cursorY += 32;
    ctx.font = '600 19px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textSecondary;
    ctx.fillText(`•  ${data.subtitle}`, padX, cursorY);
  }
  ctx.restore();

  cursorY += Math.round(45 * spacingMultiplier);

  // 7. Hero Primary Stat Card (High-Tech Glassmorphism HUD)
  const heroCardH = isStory ? 240 : isSquare ? 180 : 210;
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
  ctx.fillText((data.primaryStat.label || 'PERFORMANCE METRIC').toUpperCase(), padX + 34, cursorY + 50);

  // Personal Record / Tagline pill at top right of card
  const topBadgeText = data.personalRecord 
    ? `⚡ ${data.personalRecord}` 
    : data.tagline 
    ? data.tagline 
    : 'Evidence-Based Protocol';

  ctx.font = '700 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const tagW = ctx.measureText(topBadgeText).width + 28;
  const tagX = padX + contentW - tagW - 24;
  drawRoundedRect(ctx, tagX, cursorY + 30, tagW, 30, 15);
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
  ctx.font = '900 86px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 10;
  ctx.fillText(primaryValStr, padX + 34, cursorY + 148);
  ctx.shadowBlur = 0;

  if (data.primaryStat.unit) {
    const valWidth = ctx.measureText(primaryValStr).width;
    ctx.font = '800 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textMuted;
    ctx.fillText(data.primaryStat.unit, padX + 34 + valWidth + 16, cursorY + 148);
  }

  // If percentage metric and enough space on right, draw high-tech progress ring
  if (isPercentMetric && contentW > 600 && !isSquare) {
    const ringCX = padX + contentW - 100;
    const ringCY = cursorY + heroCardH / 2 + 10;
    drawRadialProgressRing(ctx, ringCX, ringCY, 48, numPercent, config.accent, config.accentGlow);
  }

  ctx.restore();

  cursorY += heroCardH + Math.round(24 * spacingMultiplier);

  // 8. Secondary Stats Grid (3 balanced HUD columns)
  const stats = data.secondaryStats || [];
  if (stats.length > 0) {
    const colCount = Math.min(stats.length, 3);
    const colGap = 18;
    const colW = (contentW - colGap * (colCount - 1)) / colCount;
    const colH = isStory ? 145 : isSquare ? 110 : 130;

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
      ctx.fillText(stat.label.toUpperCase(), colX + 22, cursorY + 40);

      // Big Value
      ctx.font = '900 40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      const statValStr = typeof stat.value === 'number' ? stat.value.toLocaleString() : String(stat.value);
      ctx.fillText(statValStr, colX + 22, cursorY + 92);

      if (stat.unit) {
        const sValW = ctx.measureText(statValStr).width;
        ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = config.textMuted;
        ctx.fillText(stat.unit, colX + 22 + sValW + 8, cursorY + 92);
      }
    }
    ctx.restore();

    cursorY += colH + Math.round(24 * spacingMultiplier);
  }

  // 9. Session Intensity Visualizer or Weekly Consistency Bars (Fills middle visual space)
  if (isStory || (!isSquare && cursorY < height - 360)) {
    ctx.save();
    const visCardH = isStory ? 160 : 130;
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
    ctx.fillText('PERFORMANCE TELEMETRY & ADHERENCE', padX + 24, cursorY + 34);

    ctx.textAlign = 'right';
    ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.accent;
    ctx.fillText('⚡ LIVE BIOMETRIC SYNC', padX + contentW - 24, cursorY + 34);

    // Draw 7-day momentum audio/intensity bars
    const barCount = 14;
    const barZoneW = contentW - 48;
    const barW = (barZoneW - (barCount - 1) * 10) / barCount;
    const barBaseY = cursorY + visCardH - 24;
    const barMaxH = visCardH - 65;

    // Pattern for athletic wave
    const wavePatterns = [0.45, 0.7, 0.55, 0.85, 0.6, 0.95, 0.75, 0.8, 1.0, 0.65, 0.9, 0.85, 0.7, 0.95];

    for (let b = 0; b < barCount; b++) {
      const bx = padX + 24 + b * (barW + 10);
      const intensity = wavePatterns[b % wavePatterns.length];
      const bh = Math.max(12, intensity * barMaxH);
      const by = barBaseY - bh;

      drawRoundedRect(ctx, bx, by, barW, bh, 4);
      if (b >= barCount - 3) {
        // Highlight active session bars
        ctx.fillStyle = config.accent;
        ctx.shadowColor = config.accentGlow;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.fill();
      }
    }

    ctx.restore();
    cursorY += visCardH + Math.round(24 * spacingMultiplier);
  }

  // 10. Protocol / Workout Highlights Chips
  const itemsToDisplay = showHighlights 
    ? (data.targetMuscles || data.highlightItems || []) 
    : [];

  if (itemsToDisplay.length > 0 && cursorY < height - (isStory ? 300 : 200)) {
    ctx.save();
    ctx.font = '800 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = config.textMuted;
    ctx.textAlign = 'left';
    const sectionLabel = data.targetMuscles ? 'TARGETED MUSCLE GROUPS' : 'PROTOCOL PILLARS & FOCUS';
    ctx.fillText(sectionLabel, padX, cursorY);
    cursorY += 22;

    let pillX = padX;
    const pillH = 40;
    ctx.font = '700 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    for (const item of itemsToDisplay.slice(0, 5)) {
      const itemStr = String(item);
      const textW = ctx.measureText(itemStr).width;
      const pillW = textW + 42;

      if (pillX + pillW > width - padX) break;

      drawRoundedRect(ctx, pillX, cursorY, pillW, pillH, 20);
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
      ctx.fillText(itemStr, pillX + 28, cursorY + 25);

      pillX += pillW + 12;
    }
    ctx.restore();

    cursorY += pillH + Math.round(24 * spacingMultiplier);
  }

  // 11. Athlete Custom Note / Quote
  if (showNote && data.userCaption && cursorY < height - 160) {
    ctx.save();
    const noteH = 74;
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
    ctx.fillText(quote, padX + 26, cursorY + 44);
    ctx.restore();

    cursorY += noteH + 16;
  }

  // 12. Ultra-Sleek Modern Footer Bar
  if (showWatermark) {
    const footerY = height - (isStory ? 130 : 75);

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
