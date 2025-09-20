//TODOsoon allow selecting several boxes
//TODOsoon use the types for timeBox/timeContainer
//TODOsoon implement multi-select functionality
//TODOsoon add visual feedback for selected boxes
//TODOsoon allow dragging of multiple selected boxes
//TODOsoon implement keyboard shortcuts for selection
//TODOsoon optimize rendering of selected boxes
//TODOsoon add support for touch devices



import React, { useRef, useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { useTimePanelCanvas } from '../hooks/useTimePanelCanvas';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setActiveObject, dragDrop, setPerfMetrics } from '../store/boxSlice';
import { createTimeBox } from './TimeBox';
// import { colorToggle } from '../store/boxSlice';

const TimePanel: React.FC = () => {
  // Use a ref for the container node to avoid unnecessary state updates
  const containerNodeRef = useRef<HTMLDivElement | null>(null);
  const canvasTimePanelWidth = 550;
  const canvasTimePanelHeight = 500;
  const panelLineHeight = 35;
  // Use custom hook for PIXI app/canvas lifecycle
  const appRef = useTimePanelCanvas({
    width: canvasTimePanelWidth,
    height: canvasTimePanelHeight,
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
  const objectsRef = useRef<Map<number, PIXI.Container>>(new Map());
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


  // Debug logging
  console.log('TimePanel render - objects:', objects);
  console.log('TimePanel render - appRef.current:', appRef.current);
  // ...existing code...

  // Helper to render boxes in PIXI
  function renderBoxes(app: PIXI.Application) {
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
          onPointerDown: (event: PointerEvent, obj: any) => {
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
      const newY = (boxObj as any).y ?? boxObj.stackOrder * panelLineHeight;
      if (container.y !== newY) container.y = newY;
      // Selection visual (alpha only to avoid unsupported tint on Container)
      container.alpha = boxObj.id === activeObjectId ? 1 : 0.9;
    }
  }

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
          const baseY = (draggedObj as any).y ?? draggedObj.stackOrder * panelLineHeight;
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
              Math.round(deltaY / panelLineHeight) + draggedObject.stackOrder
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

  const tick: PIXI.TickerCallback<any> = () => {
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

export default TimePanel;