// Custom React hook to manage PIXI.js canvas lifecycle in a component
// Handles initialization, mounting, cleanup, and optional callbacks
import { useEffect, useRef, useCallback } from 'react';
import { Application } from 'pixi.js';

/**
 * useTimePanelCanvas hook
 * @param width - Canvas width
 * @param height - Canvas height
 * @param backgroundColor - Canvas background color
 * @param backgroundAlpha - Canvas background alpha
 * @param onInit - Optional callback after PIXI app is initialized
 * @param onCleanup - Optional callback after PIXI app is destroyed
 * @param containerNodeRef - Ref to the container div for mounting canvas
 * @returns appRef - Ref to the Application instance
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
  onInit?: (app: Application) => void;
  onCleanup?: () => void;
  containerNodeRef: React.RefObject<HTMLDivElement>;
}) {
  // Ref to hold the Application instance
  const appRef = useRef<Application | null>(null);
  
  // Use refs for callbacks to maintain stable references
  const onInitRef = useRef(onInit);
  const onCleanupRef = useRef(onCleanup);
  
  // Update refs when callbacks change
  useEffect(() => {
    onInitRef.current = onInit;
  }, [onInit]);
  
  useEffect(() => {
    onCleanupRef.current = onCleanup;
  }, [onCleanup]);

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
    const app = new Application();
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
      if (onInitRef.current) {
        try {
          onInitRef.current(app);
        } catch (error) {
          console.error('Error in onInit callback:', error);
        }
      }
    }).catch((error) => {
      console.error('Failed to initialize PIXI Application:', error);
      app.destroy();
    });

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
      if (onCleanupRef.current) onCleanupRef.current();
    };
  }, [width, height, backgroundColor, backgroundAlpha, containerNodeRef]);

  // Return the PIXI app ref for external use
  return appRef;
}
