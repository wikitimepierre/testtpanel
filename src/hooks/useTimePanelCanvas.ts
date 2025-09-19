// Custom React hook to manage PIXI.js canvas lifecycle in a component
// Handles initialization, mounting, cleanup, and optional callbacks
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

/**
 * useTimePanelCanvas hook
 * @param width - Canvas width
 * @param height - Canvas height
 * @param backgroundColor - Canvas background color
 * @param backgroundAlpha - Canvas background alpha
 * @param onInit - Optional callback after PIXI app is initialized
 * @param onCleanup - Optional callback after PIXI app is destroyed
 * @param containerNodeRef - Ref to the container div for mounting canvas
 * @returns appRef - Ref to the PIXI.Application instance
 */
export function useTimePanelCanvas({
  width,
  height,
  backgroundColor,
  backgroundAlpha,
  onInit,
  onCleanup,
  containerNodeRef
}: {
  width: number;
  height: number;
  backgroundColor: number;
  backgroundAlpha: number;
  onInit?: (app: PIXI.Application) => void;
  onCleanup?: () => void;
  containerNodeRef: React.RefObject<HTMLDivElement>;
}) {
  // Ref to hold the PIXI.Application instance
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    // Only proceed if the container div is available
    if (!containerNodeRef.current) return;

    // Destroy any existing PIXI app and remove its canvas before creating a new one
    if (appRef.current) {
      appRef.current.destroy(true);
      appRef.current = null;
    }
    // Remove any leftover canvas elements from the container
    const canvases = containerNodeRef.current.querySelectorAll('canvas');
    canvases.forEach(canvas => canvas.remove());

    // Create a new PIXI app and initialize it
    const app = new PIXI.Application();
    app.init({
      width,
      height,
      backgroundColor,
      backgroundAlpha
    }).then(() => {
      // Mount the PIXI canvas to the container div
      if (containerNodeRef.current) {
        app.canvas.id = 'pixi-main-canvas';
        containerNodeRef.current.appendChild(app.canvas);
      }
      // Store the app instance in the ref
      appRef.current = app;
      // Call the optional onInit callback
      if (onInit) onInit(app);
    }).catch(() => {app.destroy();});

    // Cleanup function to destroy PIXI app and remove canvas on unmount or dependency change
    return () => {
      // Destroy PIXI app if it exists
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
      // Remove any canvas elements from the container
      if (containerNodeRef.current) {
        const canvases = containerNodeRef.current.querySelectorAll('canvas');
        canvases.forEach(canvas => canvas.remove());
      }
      // Call the optional onCleanup callback
      if (onCleanup) onCleanup();
    };
  }, [width, height, backgroundColor, backgroundAlpha, containerNodeRef, onInit, onCleanup]);

  // Return the PIXI app ref for external use
  return appRef;
}
