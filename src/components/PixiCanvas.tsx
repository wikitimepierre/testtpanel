import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setActiveObject, colorToggle, dragDrop } from '../store/boxSlice';

const PixiCanvas: React.FC = () => {
  // Use a callback ref to guarantee the DOM node is available
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);
  const canvasRef = useCallback((node: HTMLDivElement | null) => {
    console.log('PixiCanvas callback ref called. Node:', node);
    setContainerNode(node);
  }, []);
  const appRef = useRef<PIXI.Application | null>(null);
  const objectsRef = useRef<Map<string, PIXI.Container>>(new Map());
  const [appReady, setAppReady] = useState(false);
  const dispatch = useAppDispatch();
  const { objects, activeObjectId } = useAppSelector(state => state.boxes);

  const [isPanelLineDragging, setIsPanelLineDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragObjectId, setDragObjectId] = useState<string | null>(null);

  // Debug logging
  console.log('PixiCanvas render - objects:', objects);
  console.log('PixiCanvas render - appRef.current:', appRef.current);
  useEffect(() => {
    let destroyed = false;
    if (!containerNode) return;
    if (!appRef.current) {
      console.log('PixiCanvas: Initializing PIXI app...');
      const app = new PIXI.Application();
      app.init({
        width: 1500,
        height: 1000,
        backgroundColor: 0x00FF00,
        backgroundAlpha: 1
      }).then(() => {
        console.log('PixiCanvas: PIXI app initialized! destroyed:', destroyed, 'containerNode:', containerNode);
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
      }).catch((error) => {
        console.error('Failed to initialize PIXI application:', error);
        app.destroy();
      });
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
    if (!appRef.current) {
      console.log('No PIXI app available');
      return;
    }

    console.log('PixiCanvas objects array:', objects);
    if (objects.length === 0) {
      console.log('No objects to render');
      return;
    }

    console.log('Rendering', objects.length, 'objects');

    // Clear existing objects
    objectsRef.current.forEach(container => {
      if (appRef.current && appRef.current.stage.children.includes(container)) {
        appRef.current.stage.removeChild(container);
      }
    });
    objectsRef.current.clear();

    // Create objects
    objects.forEach(obj => {
      console.log('Creating object:', obj);

      const container = new PIXI.Container();
      container.x = obj.x;
      container.y = obj.y;

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
        style: {
          fontFamily: 'Arial',
          fontSize: 12,
          fill: 0x000000,
          align: 'center',
        }
      });
      // Center text horizontally and vertically in the box
      text.x = (obj.width - text.width) / 2;
      text.y = (obj.height - text.height) / 2;

      container.addChild(box);
      container.addChild(text);
      console.log('Created container at', container.x, container.y, 'with dimensions', obj.width, 'x', obj.height);

      // Make interactive
      container.eventMode = 'static';
      container.cursor = 'pointer';

      // Hover effects
      container.on('pointerenter', () => {
        if (!isPanelLineDragging) {
          box.clear();
          box.rect(0, 0, obj.width, obj.height);
          box.fill(0xFF0000); // Red on hover
          box.stroke({ width: 2, color: 0x000000 });
        }
      });

      container.on('pointerleave', () => {
        if (!isPanelLineDragging) {
          box.clear();
          box.rect(0, 0, obj.width, obj.height);
          box.fill(obj.color === 'grey' ? 0xDDDDDD : 0xFFFF00);
          box.stroke({ width: obj.id === activeObjectId ? 3 : 2, color: 0x000000 });
        }
      });

      // Click events
      container.on('pointerdown', (event) => {
        dispatch(setActiveObject(obj.id));
        setIsPanelLineDragging(true);
        setDragStartY(event.clientY);
        setDragObjectId(obj.id);

        // Start drag timer
        setTimeout(() => {
          if (isPanelLineDragging && dragObjectId === obj.id) {
            // This is a drag operation
          } else {
            // This is a click - toggle color
            dispatch(colorToggle(obj.id));
          }
        }, 200);
      });

      // Active object styling already applied via strokeWidth above

      if (appRef.current) {
        appRef.current.stage.addChild(container);
        console.log('Added container to stage, stage children count:', appRef.current.stage.children.length);
      }
      objectsRef.current.set(obj.id, container);
    });

    // Global pointer events for drag handling
    const handlePointerMove = (event: PointerEvent) => {
      if (isPanelLineDragging && dragObjectId) {
        const deltaY = event.clientY - dragStartY;
        // Visual feedback during drag
        const container = objectsRef.current.get(dragObjectId);
        if (container) {
          container.y = objects.find(o => o.id === dragObjectId)!.y + deltaY;
        }
      }
    };

    const handlePointerUp = () => {
      if (isPanelLineDragging && dragObjectId) {
        const draggedObject = objects.find(o => o.id === dragObjectId);
        if (draggedObject) {
          const deltaY = window.event ? (window.event as any).clientY - dragStartY : 0;
          const newStackOrder = Math.max(0, Math.min(objects.length - 1,
            Math.round(deltaY / 35) + draggedObject.stackOrder));

          if (newStackOrder !== draggedObject.stackOrder) {
            dispatch(dragDrop({ id: dragObjectId, newStackOrder }));
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

  return <div ref={canvasRef} className="pixi-canvas-top" />;
};

export default PixiCanvas;