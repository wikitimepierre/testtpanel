//TODOsoon allow selecting several boxes
//TODOsoon use the types for timeBox/timeContainer
//TODOsoon implement multi-select functionality
//TODOsoon add visual feedback for selected boxes
//TODOsoon allow dragging of multiple selected boxes
//TODOsoon implement keyboard shortcuts for selection
//TODOsoon optimize rendering of selected boxes
//TODOsoon add support for touch devices



import React, { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useTimePanelCanvas } from '../hooks/useTimePanelCanvas';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setActiveObject, dragDrop } from '../store/boxSlice';
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

  const [isPanelLineDragging, setIsPanelLineDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragObjectId, setDragObjectId] = useState<number | null>(null);


  // Debug logging
  console.log('TimePanel render - objects:', objects);
  console.log('TimePanel render - appRef.current:', appRef.current);
  // ...existing code...

  // Helper to render boxes in PIXI
  function renderBoxes(app: PIXI.Application) {
    objectsRef.current.forEach(container => {
      if (app.stage.children.includes(container)) {
        app.stage.removeChild(container);
      }
    });
    objectsRef.current.clear();

    const totalLines = Math.max(objects.length, Math.ceil(canvasTimePanelHeight / panelLineHeight));
    for (let i = 0; i < totalLines; i++) {
      const boxObj = objects.find(obj => obj.stackOrder === i) || null;
      const container = createTimeBox({
        obj: boxObj,
        activeObjectId,
        onPointerDown: (event: any, obj: any) => {
          dispatch(setActiveObject(obj.id));
          setIsPanelLineDragging(true);
          setDragStartY(event.clientY);
          setDragObjectId(obj.id);
        },
        isPanelLineDragging,
      });
      app.stage.addChild(container);
      if (boxObj) {
        objectsRef.current.set(boxObj.id, container);
      }
    }
  }

  // Re-render boxes when objects or activeObjectId change
  useEffect(() => {
    if (appRef.current) {
      renderBoxes(appRef.current);
    }
  }, [objects, activeObjectId, isPanelLineDragging]);

  // Global pointer events for drag handling
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (isPanelLineDragging && dragObjectId !== null) {
        const deltaY = event.clientY - dragStartY;
        const container = objectsRef.current.get(dragObjectId);
        const draggedObj = objects.find(o => o.id === dragObjectId);
        if (container && draggedObj) {
          container.y = draggedObj.y + deltaY;
        }
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (isPanelLineDragging && dragObjectId !== null) {
        const draggedObject = objects.find(o => o.id === dragObjectId);
        if (draggedObject) {
          const deltaY = event.clientY - dragStartY;
          const newStackOrder = 
            Math.max(0, Math.min(objects.length - 1,
            Math.round(deltaY / panelLineHeight) + draggedObject.stackOrder));
          if (newStackOrder !== draggedObject.stackOrder) {
            dispatch(dragDrop({ id: dragObjectId, newStackOrder }))
          }
        }
      }

      setIsPanelLineDragging(false);
      setDragObjectId(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isPanelLineDragging, dragStartY, dragObjectId, objects, dispatch]);

  // Always render the container div for PIXI canvas
  return <div ref={containerNodeRef} className="pixi-canvas-top" />;
};

export default TimePanel;