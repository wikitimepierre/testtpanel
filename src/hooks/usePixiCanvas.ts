import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export function usePixiCanvas({
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
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    if (!containerNodeRef.current) return;
    // Destroy any existing PIXI app and remove its canvas
    if (appRef.current) {
      appRef.current.destroy(true);
      appRef.current = null;
    }
    const canvases = containerNodeRef.current.querySelectorAll('canvas');
    canvases.forEach(canvas => canvas.remove());

    // Create a new PIXI app and canvas
    const app = new PIXI.Application();
    app.init({
      width,
      height,
      backgroundColor,
      backgroundAlpha
    }).then(() => {
      if (containerNodeRef.current) {
        app.canvas.id = 'pixi-main-canvas';
        containerNodeRef.current.appendChild(app.canvas);
      }
      appRef.current = app;
      if (onInit) onInit(app);
    }).catch(() => {app.destroy();});

    // Cleanup function to destroy PIXI app and remove canvas on unmount/reload
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
      if (containerNodeRef.current) {
        const canvases = containerNodeRef.current.querySelectorAll('canvas');
        canvases.forEach(canvas => canvas.remove());
      }
      if (onCleanup) onCleanup();
    };
  }, [width, height, backgroundColor, backgroundAlpha, containerNodeRef, onInit, onCleanup]);

  return appRef;
}
