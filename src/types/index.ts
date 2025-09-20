export interface BoxObject {
  id: number;
  type: 'box' | 'container' | 'info';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: 'grey' | 'yellow';
  children?: BoxObject[];
  parentId?: number;
  stackOrder: number;
}

export interface AppState {
  activeObjectId: number | null;
  historyIndex: number;
  objects: BoxObject[];
  history: BoxObject[][];
  // Performance metrics (dev only)
  fps?: number;
  containers?: number;
}

// Event handler types for better type safety
export interface PointerEventHandler {
  (event: PointerEvent, obj: BoxObject): void;
}

// Container creation properties
export interface ContainerProperties {
  type?: 'box' | 'container' | 'info';
  color?: 'grey' | 'yellow';
  text?: string;
  width?: number;
  height?: number;
}

// Panel configuration constants
export const PANEL_CONFIG = {
  LINE_HEIGHT: 35,
  CANVAS_WIDTH: 550,
  CANVAS_HEIGHT: 500,
  DEFAULT_BOX_WIDTH: 80,
  DEFAULT_BOX_HEIGHT: 30,
  MIN_BOX_WIDTH: 40,
  MAX_BOX_WIDTH: 200,
} as const;
