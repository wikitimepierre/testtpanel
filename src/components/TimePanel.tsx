import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setActiveObject, dragDrop } from '../store/boxSlice';
// import { colorToggle } from '../store/boxSlice';

const TimePanel: React.FC = () => {
  // Use a callback ref to guarantee the DOM node is available
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);
  const canvasRef = useCallback((node: HTMLDivElement | null) => {
    console.log('TimePanel callback ref called. Node:', node);
    setContainerNode(node);
  }, []);
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
  const timeObjectHeight = 35;
  const fullWidth = appRef.current ? appRef.current.renderer.width : canvasTimePanelWidth; // entire line: from left edge of canvas across full width

  // Debug logging
  console.log('TimePanel render - objects:', objects);
  console.log('TimePanel render - appRef.current:', appRef.current);
  useEffect(() => {
    let destroyed = false;
    if (!containerNode) return;
    if (!appRef.current) {//console.log('TimePanel: Initializing PIXI app...');
      const app = new PIXI.Application();
      app.init({
        width: canvasTimePanelWidth,
        height: canvasTimePanelHeight,
        backgroundColor: 0xFFA500,
        backgroundAlpha: .5
      }).then(() => {//console.log('TimePanel: PIXI app initialized! destroyed:', destroyed, 'containerNode:', containerNode);
        if (destroyed) {
          app.destroy();
          return;
        }
        if (containerNode) {
          containerNode.appendChild(app.canvas);
          appRef.current = app;
          setAppReady(true);
        } else {
          app.destroy();
        }
      }).catch((error) => {app.destroy()});//console.error('Failed to initialize PIXI application:', error);
    }
    return () => {
      destroyed = true;
      if (appRef.current && typeof appRef.current.destroy === 'function') {
        appRef.current.destroy();
        appRef.current = null;
        setAppReady(false);
      }
    };
  }, [containerNode]);

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

    // Create objects
    objects.forEach(obj => {
      // console.log('Creating object:', obj);
      const container = new PIXI.Container();
      container.x = obj.x;
      container.y = obj.y;

      // Hover background (behind the box)
      const hoverBg = new PIXI.Graphics();
      hoverBg.clear();
      hoverBg.rect(-container.x,-4, fullWidth, timeObjectHeight+4); // Start at -container.x so it aligns to canvas left in world space
      hoverBg.fill(0x0000FF); hoverBg.alpha = 0.2;
      hoverBg.visible = false;

      // Create box graphics (Pixi v8 API)
      const box = new PIXI.Graphics();
      const baseFill = obj.color === 'grey' ? 0xDDDDDD : 0xFFFF00;
      const strokeWidth = obj.id === activeObjectId ? 3 : 2;
      box.clear();
      box.rect(0, 0, obj.width, obj.height);
      box.fill(baseFill);
      box.stroke({ width: strokeWidth, color: 0x000000 });

      // Create text
      const text = new PIXI.Text({
        text: obj.text,
        style: {fontFamily: 'Arial',fontSize: 12,fill: 0x000000,align: 'center'}
      });
      // Center text horizontally and vertically in the box
      text.x = (obj.width - text.width) / 2;
      text.y = (obj.height - text.height) / 2;

      // Ensure hover background is behind the box and text
      container.addChild(hoverBg);
      container.addChild(box);
      container.addChild(text);
      // console.log('Created container at', container.x, container.y, 'with dimensions', obj.width, 'x', obj.height);

      // Make interactive
      container.eventMode = 'static';
      container.cursor = 'pointer';

      // Hover effects: show a blue background behind the box + change box border to blue
      container.on('pointerenter', () => {
        if (!isPanelLineDragging) {
          hoverBg.visible = true;
          box.stroke({ width: 2, color: 0x0000FF });
        }
      });
      container.on('pointerleave', () => {
        if (!isPanelLineDragging) {
          hoverBg.visible = false;
        }
      });

      // Click events
      container.on('pointerdown', (event) => {
        dispatch(setActiveObject(obj.id));
        setIsPanelLineDragging(true);
        setDragStartY(event.clientY);
        setDragObjectId(obj.id);
        // Hide hover highlight when starting a drag
        hoverBg.visible = false;

        // Start drag timer
        setTimeout(() => {
          if (isPanelLineDragging && dragObjectId === obj.id) {
            // This is a drag operation
          } else {
            // This is a click - toggle color
            // dispatch(colorToggle(obj.id));
          }
        }, 200);
      });

      // Active object styling already applied via strokeWidth above

      if (appRef.current) {appRef.current.stage.addChild(container)} //console.log('Added container to stage, stage children count:', appRef.current.stage.children.length);
      objectsRef.current.set(obj.id, container);
    });

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
          const newStackOrder = Math.max(0, Math.min(objects.length - 1,
          Math.round(deltaY / 35) + draggedObject.stackOrder));
          if (newStackOrder !== draggedObject.stackOrder) {dispatch(dragDrop({ id: dragObjectId, newStackOrder }))}
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

  return <div ref={canvasRef} className="pixi-canvas-top" />;
};

export default TimePanel;