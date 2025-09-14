export interface BoxObject {
  id: string;
  type: 'box' | 'container' | 'info';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: 'grey' | 'yellow';
  children?: BoxObject[];
  parentId?: string;
  stackOrder: number;
}

export interface AppState {
  objects: BoxObject[];
  activeObjectId: string | null;
  history: BoxObject[][];
  historyIndex: number;
}

export interface CreateObjectForm {
  type: 'container' | 'info';
  show: boolean;
}