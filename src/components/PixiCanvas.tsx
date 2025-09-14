import React, { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setActiveObject, colorToggle, dragDrop } from '../store/boxSlice';

const PixiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const objectsRef = useRef<Map<string, PIXI.Container>>(new Map());
  const dispatch = useAppDispatch();
  const { objects, activeObjectId } = useAppSelector(state => state.boxes);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragObjectId, setDragObjectId] = useState<string | null>(null);

  // Debug logging
  console.log('PixiCanvas render - objects:', objects);
  console.log('PixiCanvas render - appRef.current:', appRef.current);
  useEffect(() => {
    if (!canvasRef.current) return;

    const initApp = async () => {
      // Create PIXI application
      const app = new PIXI.Application();
      
      try {
        await app.init({
          width: 1500,
          height: 1000,
          backgroundColor: 0x00FF00, // Green
          backgroundAlpha: 1
        });
        
        // Check if canvasRef is still valid before appending
        if (canvasRef.current) {
          canvasRef.current.appendChild(app.canvas);
          // Only assign to ref after successful initialization and DOM append
          appRef.current = app;
        } else {
          // Clean up if component was unmounted during initialization
          app.destroy();
        }
      } catch (error) {
        console.error('Failed to initialize PIXI application:', error);
        app.destroy();
      }
    };

    initApp();

    return () => {
      if (appRef.current && typeof appRef.current.destroy === 'function') {
        appRef.current.destroy();
        appRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!appRef.current) {
      console.log('No PIXI app available');
      return;
    }
    
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

      // Create box graphics
      const box = new PIXI.Graphics();
      box.beginFill(obj.color === 'grey' ? 0xDDDDDD : 0xFFFF00);
      box.lineStyle(2, 0x000000);
      box.drawRect(0, 0, obj.width, obj.height);
      box.endFill();

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
        if (!isDragging) {
          box.clear();
          box.beginFill(0xFF0000); // Red on hover
          box.lineStyle(2, 0x000000);
          box.drawRect(0, 0, obj.width, obj.height);
          box.endFill();
        }
      });

      container.on('pointerleave', () => {
        if (!isDragging) {
          box.clear();
          box.beginFill(obj.color === 'grey' ? 0xDDDDDD : 0xFFFF00);
          box.lineStyle(2, 0x000000);
          box.drawRect(0, 0, obj.width, obj.height);
          box.endFill();
        }
      });

      // Click events
      container.on('pointerdown', (event) => {
  dispatch(setActiveObject(obj.id));
  setIsDragging(true);
  setDragStartY(event.clientY);
  setDragObjectId(obj.id);
        
        // Start drag timer
        setTimeout(() => {
          if (isDragging && dragObjectId === obj.id) {
            // This is a drag operation
          } else {
            // This is a click - toggle color
            dispatch(colorToggle(obj.id));
          }
        }, 200);
      });

      // Active object styling
      if (obj.id === activeObjectId) {
        box.lineStyle(3, 0x0000FF);
      }

      if (appRef.current) {
        appRef.current.stage.addChild(container);
        console.log('Added container to stage, stage children count:', appRef.current.stage.children.length);
      }
      objectsRef.current.set(obj.id, container);
    });

    // Global pointer events for drag handling
    const handlePointerMove = (event: PointerEvent) => {
      if (isDragging && dragObjectId) {
        const deltaY = event.clientY - dragStartY;
        const newStackOrder = Math.max(0, Math.min(objects.length - 1, 
          Math.round(deltaY / 35) + objects.find(o => o.id === dragObjectId)!.stackOrder));
        // Visual feedback during drag
        const container = objectsRef.current.get(dragObjectId);
        if (container) {
          container.y = objects.find(o => o.id === dragObjectId)!.y + deltaY;
        }
      }
    };

    const handlePointerUp = () => {
      if (isDragging && dragObjectId) {
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
      
      setIsDragging(false);
      setDragObjectId(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [objects, activeObjectId, isDragging, dragStartY, dragObjectId, dispatch]);

  return <div ref={canvasRef} className="w-full h-full" />;
};

export default PixiCanvas;