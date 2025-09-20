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
