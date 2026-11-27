/**
 * @file exportStage.js
 * Utility for exporting the Konva stage as a high-resolution PNG file.
 * Self-contained: hides the transformer during capture and restores it after.
 */

/** Pixel ratio multiplier for the exported PNG (retina quality). */
export const EXPORT_PIXEL_RATIO = 2;

/**
 * Sanitises a string for use as a filename by replacing any character that is
 * not alphanumeric, dash, underscore, or dot with an underscore.
 *
 * @param {string} name - Raw canvas name from the store
 * @returns {string} Filesystem-safe filename without extension
 */
export function sanitiseFilename(name) {
  const trimmed = (name || '').trim() || 'untitled';
  return trimmed.replace(/[^a-z0-9._-]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

/**
 * Triggers a browser download of a data URL as a PNG file.
 *
 * @param {string} dataUrl - Base-64 encoded PNG data URL
 * @param {string} filename - Desired download filename (with .png extension)
 */
function triggerDownload(dataUrl, filename) {
  if (typeof document === 'undefined') return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports the Konva stage as a 2× retina PNG and triggers a browser file download.
 *
 * The selection Transformer is temporarily hidden during the capture so its
 * dashed border and handles are not included in the exported image.
 *
 * @param {import('konva/lib/Stage').Stage | { getStage: () => any }} stageOrRef - Konva Stage or ref
 * @param {string} canvasName - Name of the design; used to derive the filename
 * @returns {string | undefined} Base64 data URL if stage was valid
 */
export function exportStageToPng(stageOrRef, canvasName) {
  let stage = null;
  if (stageOrRef && typeof stageOrRef.getStage === 'function') {
    stage = stageOrRef.getStage();
  } else if (stageOrRef && typeof stageOrRef.toDataURL === 'function') {
    stage = stageOrRef;
  } else if (typeof window !== 'undefined' && window.Konva?.stages?.length > 0) {
    stage = window.Konva.stages[0];
  }

  if (!stage) {
    console.warn('[exportStage] No stage provided; skipping export.');
    return;
  }

  // Temporarily hide all Transformer nodes to get a clean artboard export
  const transformers = typeof stage.find === 'function' ? stage.find('Transformer') : [];
  transformers.forEach((tr) => tr.hide?.());

  // Temporarily normalize stage scale and position so exported image is 1:1 artboard
  const hasScaleX = typeof stage.scaleX === 'function';
  const hasScaleY = typeof stage.scaleY === 'function';
  const hasX = typeof stage.x === 'function';
  const hasY = typeof stage.y === 'function';

  const origScaleX = hasScaleX ? stage.scaleX() : 1;
  const origScaleY = hasScaleY ? stage.scaleY() : 1;
  const origX = hasX ? stage.x() : 0;
  const origY = hasY ? stage.y() : 0;

  if (hasScaleX) stage.scaleX(1);
  if (hasScaleY) stage.scaleY(1);
  if (hasX) stage.x(0);
  if (hasY) stage.y(0);

  stage.batchDraw?.();

  try {
    const dataUrl = stage.toDataURL({ pixelRatio: EXPORT_PIXEL_RATIO });
    const safeFilename = `${sanitiseFilename(canvasName)}.png`;
    triggerDownload(dataUrl, safeFilename);
    return dataUrl;
  } finally {
    // Always restore scale, position, and transformers, even if toDataURL throws
    if (hasScaleX) stage.scaleX(origScaleX);
    if (hasScaleY) stage.scaleY(origScaleY);
    if (hasX) stage.x(origX);
    if (hasY) stage.y(origY);

    transformers.forEach((tr) => tr.show?.());
    stage.batchDraw?.();
  }
}
