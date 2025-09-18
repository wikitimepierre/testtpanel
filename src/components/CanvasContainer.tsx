import React, { useRef } from 'react';

export interface CanvasContainerProps {
  children?: React.ReactNode;
}

const CanvasContainer: React.FC<CanvasContainerProps> = ({ children }) => {
  const containerNodeRef = useRef<HTMLDivElement | null>(null);
  return <div ref={containerNodeRef} className="pixi-canvas-top">{children}</div>;
};

export default CanvasContainer;
