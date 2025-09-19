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
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setActiveObject, dragDrop } from '../store/boxSlice';
import { createTimeBox } from './TimeBox';
// import { colorToggle } from '../store/boxSlice';

const TimePanel: React.FC = () => {
  // Use a ref for the container node to avoid unnecessary state updates
  const containerNodeRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const objectsRef = useRef<Map<number, PIXI.Container>>(new Map());
  const [appReady, setAppReady] = useState(false);
  const dispatch = useAppDispatch();
  const { objects, activeObjectId } = useAppSelector(state => state.boxes);

  const [isPanelLineDragging, setIsPanelLineDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragObjectId, setDragObjectId] = useState<number | null>(null);

  const canvasTimePanelWidth = 550;
  const canvasTimePanelHeight = 500;
  const panelLineHeight = 35;

  // Debug logging
  console.log('TimePanel render - objects:', objects);
  console.log('TimePanel render - appRef.current:', appRef.current);
  useEffect(() => {
    if (!containerNodeRef.current) return;
    // Only create PIXI app and canvas if not already present
    if (!appRef.current) {
      const app = new PIXI.Application();
      app.init({
        width: canvasTimePanelWidth,
        height: canvasTimePanelHeight,
        backgroundColor: 0xFFA500,
        backgroundAlpha: .5
      }).then(() => {
        if (containerNodeRef.current && !containerNodeRef.current.contains(app.canvas)) {
          containerNodeRef.current.appendChild(app.canvas);
        }
        appRef.current = app;
        setAppReady(true);
      }).catch(() => {app.destroy();});
    } else {
      // If canvas already exists, ensure it's still in the container
      if (containerNodeRef.current && appRef.current.canvas && !containerNodeRef.current.contains(appRef.current.canvas)) {
        containerNodeRef.current.appendChild(appRef.current.canvas);
      }
    }
    return () => {
      // Option: cleanup listeners or other resources here
    };
  }, []);

  useEffect(() => {
    if (!appRef.current) {return}// console.log('No PIXI app available');
    // console.log('TimePanel objects array:', objects);
    if (objects.length === 0) {return}// console.log('No objects to render');
    // console.log('Rendering', objects.length, 'objects');

    // Clear existing objects
    objectsRef.current.forEach(container => {
      if (appRef.current && appRef.current.stage.children.includes(container)) {
        appRef.current.stage.removeChild(container);
      }
    });
    objectsRef.current.clear();

    // Render a full-width interactive line for every possible line index
    const totalLines = Math.max(objects.length, Math.ceil(canvasTimePanelHeight / panelLineHeight));
    for (let i = 0; i < totalLines; i++) {
      const boxObj = objects.find(obj => obj.stackOrder === i) || null;
      // Use your createTimeBox util here
      // You may need to import it: import { createTimeBox } from './TimeBox';
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
      if (appRef.current) {
        appRef.current.stage.addChild(container);
      }
      objectsRef.current.set(i, container);
    }

    // Global pointer events for drag handling
    const handlePointerMove = (event: PointerEvent) => {
      if (isPanelLineDragging && dragObjectId !== null) {
        const deltaY = event.clientY - dragStartY;
        const container = objectsRef.current.get(dragObjectId); // Visual feedback during drag
        if (container) {container.y = objects.find(o => o.id === dragObjectId)!.y + deltaY}
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
            // console.log(`Moved ${draggedObject.id} to position ${newStackOrder}`);
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
  }, [objects, activeObjectId, isPanelLineDragging, dragStartY, dragObjectId, dispatch, appReady]);

  if (!objects || objects.length === 0) return null;
  return <div ref={containerNodeRef} className="pixi-canvas-top" />;
};

export default TimePanel;