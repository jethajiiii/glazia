/**
 * @file useZoomPan.js
 * Hook managing zoom (scale) and pan (position) state for the Konva Stage.
 *
 * Zoom:
 *   - Mouse wheel over the canvas (scales around the pointer position).
 *   - Ctrl + '=' to zoom in, Ctrl + '-' to zoom out, Ctrl + '0' to reset.
 *   - Min/max clamped to ZOOM_CONFIG constants.
 *
 * Pan:
 *   - Space key held + left-mouse drag anywhere on the stage.
 *   - Middle-mouse drag (button 1).
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/** Minimum allowed scale (10 %). */
export const ZOOM_MIN = 0.1;
/** Maximum allowed scale (500 %). */
export const ZOOM_MAX = 5;
/** Scale multiplier per wheel tick. */
export const ZOOM_STEP = 0.001;
/** Factor applied for keyboard zoom in/out. */
export const ZOOM_KEY_STEP = 0.1;

/**
 * Clamps a value within [min, max].
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

/**
 * Computes new scale based on current scale and wheel deltaY, clamped to bounds.
 * @param {number} currentScale
 * @param {number} deltaY
 * @returns {number}
 */
export function calculateNewScale(currentScale, deltaY) {
  const delta = -deltaY * ZOOM_STEP;
  return clamp(currentScale + delta * currentScale, ZOOM_MIN, ZOOM_MAX);
}

/**
 * Computes new stage position after a zoom anchored to pointer coordinates.
 * @param {{ x: number, y: number }} pointer
 * @param {{ x: number, y: number }} currentPos
 * @param {number} oldScale
 * @param {number} newScale
 * @returns {{ x: number, y: number }}
 */
export function calculateZoomPoint(pointer, currentPos, oldScale, newScale) {
  const mousePointTo = {
    x: (pointer.x - currentPos.x) / oldScale,
    y: (pointer.y - currentPos.y) / oldScale,
  };

  return {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };
}

/**
 * Hook that tracks zoom level and pan offset for a Konva Stage, and
 * provides event handlers to wire up wheel-to-zoom and space/middle-drag-to-pan.
 *
 * @param {import('react').RefObject<any>} stageRef - Ref to the Konva Stage component
 * @returns {{
 *   scale: number,
 *   stagePos: { x: number, y: number },
 *   zoomPercent: number,
 *   handleWheel: (e: any) => void,
 *   handleStageMouseDown: (e: any) => void,
 *   handleStageMouseMove: (e: any) => void,
 *   handleStageMouseUp: () => void,
 *   resetZoom: () => void,
 *   zoomIn: () => void,
 *   zoomOut: () => void,
 * }}
 */
export function useZoomPan(stageRef) {
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // Pan tracking refs (avoid stale closure issues)
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const isSpacePressedRef = useRef(false);

  // ─── Keyboard: Space for pan mode; Ctrl+= / Ctrl+- / Ctrl+0 ───────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space') {
        // Suppress if inside a form field
        const tag = document.activeElement?.tagName?.toUpperCase();
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        isSpacePressedRef.current = true;
        // Update cursor on the stage wrapper
        if (stageRef?.current) {
          const container = stageRef.current.container?.();
          if (container) container.style.cursor = 'grab';
        }
      }
      // Ctrl/Cmd + = or + → zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setScale((prev) => clamp(prev + ZOOM_KEY_STEP, ZOOM_MIN, ZOOM_MAX));
      }
      // Ctrl/Cmd + - → zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setScale((prev) => clamp(prev - ZOOM_KEY_STEP, ZOOM_MIN, ZOOM_MAX));
      }
      // Ctrl/Cmd + 0 → reset
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setScale(1);
        setStagePos({ x: 0, y: 0 });
      }
    };

    const onKeyUp = (e) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
        isPanningRef.current = false;
        if (stageRef?.current) {
          const container = stageRef.current.container?.();
          if (container) container.style.cursor = '';
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [stageRef]);

  // ─── Wheel → Zoom around pointer ──────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const newScale = calculateNewScale(oldScale, e.evt.deltaY);
    const newPos = calculateZoomPoint(pointer, { x: stage.x(), y: stage.y() }, oldScale, newScale);

    setScale(newScale);
    setStagePos(newPos);
  }, []);

  // ─── Mouse down: begin pan when Space is held or middle mouse ─────────────
  const handleStageMouseDown = useCallback((e) => {
    const isMiddleMouse = e.evt.button === 1;
    if (isSpacePressedRef.current || isMiddleMouse) {
      e.evt.preventDefault();
      isPanningRef.current = true;
      lastPointerRef.current = { x: e.evt.clientX, y: e.evt.clientY };
      const stage = e.target.getStage();
      const container = stage?.container?.();
      if (container) container.style.cursor = 'grabbing';
    }
  }, []);

  // ─── Mouse move: apply pan delta ──────────────────────────────────────────
  const handleStageMouseMove = useCallback((e) => {
    if (!isPanningRef.current) return;
    e.evt.preventDefault();

    const dx = e.evt.clientX - lastPointerRef.current.x;
    const dy = e.evt.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.evt.clientX, y: e.evt.clientY };

    setStagePos((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  // ─── Mouse up: end pan ────────────────────────────────────────────────────
  const handleStageMouseUp = useCallback(() => {
    if (!isPanningRef.current) return;
    isPanningRef.current = false;
    const stage = stageRef?.current?.getStage?.() ?? stageRef?.current;
    const container = stage?.container?.();
    if (container) {
      container.style.cursor = isSpacePressedRef.current ? 'grab' : '';
    }
  }, [stageRef]);

  // ─── Programmatic controls ─────────────────────────────────────────────────
  const resetZoom = useCallback(() => {
    setScale(1);
    setStagePos({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(
    () => setScale((prev) => clamp(prev + ZOOM_KEY_STEP, ZOOM_MIN, ZOOM_MAX)),
    [],
  );

  const zoomOut = useCallback(
    () => setScale((prev) => clamp(prev - ZOOM_KEY_STEP, ZOOM_MIN, ZOOM_MAX)),
    [],
  );

  return {
    scale,
    stagePos,
    zoomPercent: Math.round(scale * 100),
    handleWheel,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    resetZoom,
    zoomIn,
    zoomOut,
  };
}
