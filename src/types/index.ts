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
  objects: BoxObject[];
  activeObjectId: number | null;
  history: BoxObject[][];
  historyIndex: number;
}

export interface CreateObjectForm {
  type: 'container' | 'info';
  show: boolean;
}