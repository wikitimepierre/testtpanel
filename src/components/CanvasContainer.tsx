import React, { useRef } from 'react';
import { useTimePanelCanvas } from '../hooks/useTimePanelCanvas';

export interface CanvasContainerProps {
  width?: number;
  height?: number;
  backgroundColor?: number;
  backgroundAlpha?: number;
  onInit?: (app: any) => void;
  onCleanup?: () => void;
  children?: React.ReactNode;
}

const CanvasContainer: React.FC<CanvasContainerProps> = ({
  width = 550,
  height = 500,
  backgroundColor = 0xFFA500,
  backgroundAlpha = 0.5,
  onInit,
  onCleanup,
  children
}) => {
  const containerNodeRef = useRef<HTMLDivElement | null>(null);
  // Integrate useTimePanelCanvas hook to manage PIXI app lifecycle
  useTimePanelCanvas({
    width,
    height,
    backgroundColor,
    backgroundAlpha,
    onInit,
    onCleanup,
    containerNodeRef
  });
  return <div ref={containerNodeRef} className="pixi-canvas-top">{children}</div>;
};

export default CanvasContainer;
