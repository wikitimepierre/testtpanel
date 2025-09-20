import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BoxObject, AppState, ContainerProperties, PANEL_CONFIG } from '../types';

/**
 * Box Slice - Redux state management for timeline boxes
 * 
 * Handles:
 * - Box creation, deletion, and modification
 * - Drag-and-drop reordering with stack order management
 * - Undo/redo history tracking
 * - Performance metrics for development
 */

const buildBox = (id: number): BoxObject => ({
  id,
  type: 'box',
  x: Math.random() * 400,
  y: id * PANEL_CONFIG.LINE_HEIGHT,
  width: PANEL_CONFIG.DEFAULT_BOX_WIDTH + Math.random() * 100,
  height: PANEL_CONFIG.DEFAULT_BOX_HEIGHT,
  text: `box-${id}`,
  color: 'grey',
  stackOrder: id
});

const generateInitialBoxes = (): BoxObject[] => {
  const count = 8;
  const boxes: BoxObject[] = [];
  for (let i = 0; i < count; i++) {
    boxes.push(buildBox(i));
  }
  return boxes;
};

const initialObjects = generateInitialBoxes();
const initialState: AppState = {
  objects: initialObjects,
  activeObjectId: null,
  history: [JSON.parse(JSON.stringify(initialObjects))],
  historyIndex: 0,
  fps: undefined,
  containers: initialObjects.length
};

const saveToHistory = (state: AppState) => {
  // Remove any future history if we're not at the end
  if (state.historyIndex < state.history.length - 1) {
    state.history = state.history.slice(0, state.historyIndex + 1);
  }
  
  // Add current state to history
  state.history.push(JSON.parse(JSON.stringify(state.objects)));
  state.historyIndex++;
  
  // Limit history size
  if (state.history.length > 50) {
    state.history.shift();
    state.historyIndex--;
  }
};

export const boxSlice = createSlice({
  name: 'boxes',
  initialState,
  reducers: {
    setPerfMetrics: (state, action: PayloadAction<{ fps?: number; containers?: number }>) => {
      const { fps, containers } = action.payload;
      if (typeof fps === 'number') state.fps = fps;
      if (typeof containers === 'number') state.containers = containers;
      // Do not save to history for perf metrics
    },
    setActiveObject: (state, action: PayloadAction<number | null>) => {
      state.activeObjectId = action.payload;
    },

    // colorToggle: (state, action: PayloadAction<number>) => {
    //   const object = state.objects.find(obj => obj.id === action.payload);
    //   if (object) {
    //     object.color = object.color === 'grey' ? 'yellow' : 'grey';
    //     saveToHistory(state);
    //   }
    // },

    generateBox: (state) => {
      const nextId = state.objects.length;
      const newBox = buildBox(nextId);
      state.objects.push(newBox);
      saveToHistory(state);
    },

    dragDrop: (state, action: PayloadAction<{ id: number; newStackOrder: number }>) => {
      const { id, newStackOrder } = action.payload;
      const object = state.objects.find(obj => obj.id === id);
      
      if (object) {
        const oldOrder = object.stackOrder;
        
        // Update stack orders
        state.objects.forEach(obj => {
          if (obj.id === id) {
            obj.stackOrder = newStackOrder;
          } else if (oldOrder < newStackOrder && obj.stackOrder > oldOrder && obj.stackOrder <= newStackOrder) {
            obj.stackOrder--;
          } else if (oldOrder > newStackOrder && obj.stackOrder < oldOrder && obj.stackOrder >= newStackOrder) {
            obj.stackOrder++;
          }
        });
        
        // Update Y positions based on new stack order
        const sortedObjects = [...state.objects].sort((a, b) => a.stackOrder - b.stackOrder);
        sortedObjects.forEach((obj, index) => {
          obj.y = index * PANEL_CONFIG.LINE_HEIGHT;
        });
        saveToHistory(state);
      }
    },

    deleteObject: (state, action: PayloadAction<number>) => {
      const deleteRecursively = (id: number) => {
        const object = state.objects.find(obj => obj.id === id);
        if (object && object.children) {
          object.children.forEach(child => deleteRecursively(child.id));
        }
        state.objects = state.objects.filter(obj => obj.id !== id);
      };

      deleteRecursively(action.payload);

      if (state.activeObjectId === action.payload) {
        state.activeObjectId = null;
      }

      // Re-order remaining objects
      const sortedObjects = state.objects
        .sort((a, b) => a.stackOrder - b.stackOrder)
        .map((obj, index) => ({ ...obj, stackOrder: index, y: index * PANEL_CONFIG.LINE_HEIGHT }));
      state.objects = sortedObjects;
      saveToHistory(state);
    },

    createContainer: (state, action: PayloadAction<{ parentId: number | null; properties: ContainerProperties }>) => {
      const nextId = state.objects.length ? Math.max(...state.objects.map(o => o.id)) + 1 : 0;
      const newContainer: BoxObject = {
        id: nextId,
        type: 'container',
        x: Math.random() * 400 + 50,
        y: state.objects.length * PANEL_CONFIG.LINE_HEIGHT,
        width: action.payload.properties.width || 120,
        height: action.payload.properties.height || PANEL_CONFIG.DEFAULT_BOX_HEIGHT,
        text: action.payload.properties.text || 'Container',
        color: action.payload.properties.color || 'grey',
        children: [],
        ...(action.payload.parentId ? { parentId: action.payload.parentId } : {}),
        stackOrder: state.objects.length
      };
      state.objects.push(newContainer);
      saveToHistory(state);
    },

    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.objects = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    },
    
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.objects = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    },
    
    // loadObjects: (state, action: PayloadAction<BoxObject[]>) => {
    //   state.objects = action.payload;
    //   const baseline = JSON.parse(JSON.stringify(action.payload));
    //   state.history = [baseline];
    //   state.historyIndex = 0;
    // }
  }
});

export const {
  setPerfMetrics,
  setActiveObject,
  // colorToggle,
  // loadObjects,
  generateBox,
  dragDrop,
  deleteObject,
  createContainer,
  undo,
  redo,
} = boxSlice.actions;

export default boxSlice.reducer;