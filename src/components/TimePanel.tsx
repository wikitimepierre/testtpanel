/**
 * TimePanel Component
 * 
 * Main interactive canvas component for timeline visualization.
 * Handles PIXI.js rendering, drag-and-drop interactions, and selection state.
 * 
 * Features:
 * - Interactive box rendering with PIXI.js
 * - Drag-and-drop reordering with visual feedback
 * - Real-time performance metrics
 * - Optimized rendering (only updates changed elements)
 */

import React, { useRef, useEffect, memo, useCallback } from 'react';
import { Application, Container, TickerCallback, Graphics } from 'pixi.js';
import { useTimePanelCanvas } from '../hooks/useTimePanelCanvas';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setActiveObject, dragDrop, setPerfMetrics } from '../store/boxSlice';
import { createTimeBox } from './TimeBox';
import { BoxObject, PANEL_CONFIG } from '../types';

const TimePanel: React.FC = () => {
  // Use a ref for the container node to avoid unnecessary state updates
  const containerNodeRef = useRef<HTMLDivElement | null>(null);
  // Use custom hook for PIXI app/canvas lifecycle
  const appRef = useTimePanelCanvas({
    width: PANEL_CONFIG.CANVAS_WIDTH,
    height: PANEL_CONFIG.CANVAS_HEIGHT,
    backgroundColor: 0xFFA500,
    backgroundAlpha: 1,
    containerNodeRef,
    onInit: (app) => {
      renderBoxes(app);
    },
    onCleanup: () => {
      objectsRef.current.clear();
    }
  });
  // Map by object id, not line index
  const objectsRef = useRef<Map<number, Container>>(new Map());
  // Map for line hover areas - each line gets a full-width hover zone
  const lineHoverAreasRef = useRef<Map<number, Container>>(new Map());
  // ...existing code...
  const dispatch = useAppDispatch();
  const { objects, activeObjectId } = useAppSelector(state => state.boxes);

  // Drag state in refs to avoid React re-renders during drag
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragObjectIdRef = useRef<number | null>(null);
  // Keep latest objects in a ref for global listeners
  const objectsRefState = useRef(objects);
  useEffect(() => { objectsRefState.current = objects; }, [objects]);
  // Track previous selected id to update only two containers on selection change
  const prevSelectedIdRef = useRef<number | null>(null);

  // Helper function to create a full-width hover area for a line
  const createLineHoverArea = useCallback((boxObj: BoxObject, boxContainer: Container) => {
    const lineContainer = new Container();
    lineContainer.x = 0;
    lineContainer.y = 0;

    // Create invisible full-width hover zone
    const hoverZone = new Graphics();
    hoverZone.rect(0, 0, PANEL_CONFIG.CANVAS_WIDTH, PANEL_CONFIG.LINE_HEIGHT);
    hoverZone.fill(0x000000); // Color doesn't matter since it's invisible
    hoverZone.alpha = 0; // Make it invisible but still interactive
    lineContainer.addChild(hoverZone);

    // Make the line container interactive
    lineContainer.eventMode = 'static';
    lineContainer.cursor = 'pointer';

    // Get the TimeBox's hover background element to control it directly
    const timeBoxHoverBg = boxContainer.children.find(child => 
      child instanceof Graphics && (child as any).isHoverBackground
    ) as Graphics | undefined;

    // Forward hover events to show/hide the TimeBox hover background
    lineContainer.on('pointerenter', () => {
      if (!isDraggingRef.current && timeBoxHoverBg) {
        timeBoxHoverBg.visible = true;
      }
    });

    lineContainer.on('pointerleave', () => {
      if (!isDraggingRef.current && timeBoxHoverBg) {
        timeBoxHoverBg.visible = false;
      }
    });

    lineContainer.on('pointerdown', (event: PointerEvent) => {
      // Forward click to trigger the same behavior as clicking the box
      dispatch(setActiveObject(boxObj.id));
      isDraggingRef.current = true;
      dragStartYRef.current = event.clientY;
      dragObjectIdRef.current = boxObj.id;
    });

    return lineContainer;
  }, [dispatch]);

  // Helper to render boxes in PIXI
  const renderBoxes = useCallback((app: Application) => {
    // Remove containers for objects that no longer exist
    const currentIds = new Set(objects.map(o => o.id));
    for (const [id, container] of objectsRef.current.entries()) {
      if (!currentIds.has(id)) {
        if (app.stage.children.includes(container)) {
          app.stage.removeChild(container);
        }
        objectsRef.current.delete(id);
      }
    }

    // Create missing containers and update existing ones
    for (const boxObj of objects) {
      let container = objectsRef.current.get(boxObj.id);
      if (!container) {
        container = createTimeBox({
          obj: boxObj,
          activeObjectId,
          onPointerDown: (event: PointerEvent, obj: BoxObject) => {
            dispatch(setActiveObject(obj.id));
            isDraggingRef.current = true;
            dragStartYRef.current = event.clientY;
            dragObjectIdRef.current = obj.id;
          },
          isPanelLineDragging: isDraggingRef.current,
        });
        app.stage.addChild(container);
        objectsRef.current.set(boxObj.id, container);
      }
      // Keep position synced (fallback to stackOrder line if no y)
      const newY = (boxObj as BoxObject).y ?? boxObj.stackOrder * PANEL_CONFIG.LINE_HEIGHT;
      if (container.y !== newY) container.y = newY;
      // Selection visual (alpha only to avoid unsupported tint on Container)
      container.alpha = boxObj.id === activeObjectId ? 1 : 0.9;

      // Create full-width hover area for this line
      let lineHoverArea = lineHoverAreasRef.current.get(boxObj.id);
      if (!lineHoverArea) {
        lineHoverArea = createLineHoverArea(boxObj, container);
        app.stage.addChild(lineHoverArea);
        lineHoverAreasRef.current.set(boxObj.id, lineHoverArea);
      }
      // Keep line hover area position synced
      if (lineHoverArea.y !== newY) lineHoverArea.y = newY;
    }

    // Clean up line hover areas for removed objects
    for (const [id, hoverArea] of lineHoverAreasRef.current.entries()) {
      if (!currentIds.has(id)) {
        if (app.stage.children.includes(hoverArea)) {
          app.stage.removeChild(hoverArea);
        }
        lineHoverAreasRef.current.delete(id);
      }
    }
  }, [objects, activeObjectId]);

  // Only update visual state of selected box when selection changes (touch 2 containers max)
  useEffect(() => {
    const prevId = prevSelectedIdRef.current;
    if (prevId !== activeObjectId) {
      if (prevId !== null) {
        const prevContainer = objectsRef.current.get(prevId);
        if (prevContainer) prevContainer.alpha = 0.9;
      }
      if (activeObjectId !== null) {
        const currContainer = objectsRef.current.get(activeObjectId);
        if (currContainer) currContainer.alpha = 1;
      }
      prevSelectedIdRef.current = activeObjectId;
    }
  }, [activeObjectId]);

  // Create/remove/update boxes when objects change
  useEffect(() => {
    if (appRef.current) {
      renderBoxes(appRef.current);
    }
  }, [objects]);

  // Global pointer events for drag handling (mounted once)
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (isDraggingRef.current && dragObjectIdRef.current !== null) {
        const deltaY = event.clientY - dragStartYRef.current;
        const id = dragObjectIdRef.current;
        const container = objectsRef.current.get(id);
        const draggedObj = objectsRefState.current.find(o => o.id === id);
        if (container && draggedObj) {
          const baseY = (draggedObj as BoxObject).y ?? draggedObj.stackOrder * PANEL_CONFIG.LINE_HEIGHT;
          container.y = baseY + deltaY;
        }
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (isDraggingRef.current && dragObjectIdRef.current !== null) {
        const id = dragObjectIdRef.current;
        const draggedObject = objectsRefState.current.find(o => o.id === id);
        if (draggedObject) {
          const deltaY = event.clientY - dragStartYRef.current;
          const newStackOrder = Math.max(
            0,
            Math.min(
              objectsRefState.current.length - 1,
              Math.round(deltaY / PANEL_CONFIG.LINE_HEIGHT) + draggedObject.stackOrder
            )
          );
          if (newStackOrder !== draggedObject.stackOrder) {
            dispatch(dragDrop({ id, newStackOrder }));
          }
        }
      }
      isDraggingRef.current = false;
      dragObjectIdRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dispatch]);

  // FPS sampler using PIXI ticker
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    let lastTime = performance.now();
    let frames = 0;
    let accum = 0;

  const tick: TickerCallback<Application> = () => {
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;
      frames += 1;
      accum += dt;
      if (accum >= 500) { // update every 0.5s
        const fps = Math.min(120, Math.round((frames * 1000) / accum));
        const containers = objectsRef.current.size;
        dispatch(setPerfMetrics({ fps, containers }));
        frames = 0;
        accum = 0;
      }
    };

    app.ticker.add(tick);
    return () => {
      app.ticker.remove(tick);
    };
  }, [dispatch, appRef]);

  // Always render the container div for PIXI canvas
  return <div ref={containerNodeRef} className="pixi-canvas-top" />;
};

export default memo(TimePanel);