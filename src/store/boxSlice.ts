import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BoxObject, AppState } from '../types';

const panelLineHeight = 35;

// TODOnow: hover a line with a box highlights the entire line
// TODOnow: click a line with a box selects the box in it

const buildBox = (id: number): BoxObject => ({
  id,
  type: 'box',
  x: Math.random() * 400,
  y: id * panelLineHeight,
  width: 80 + Math.random() * 100,
  height: 30,
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
  historyIndex: 0
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
          obj.y = index * 35 + 50;
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
        .map((obj, index) => ({ ...obj, stackOrder: index, y: index * 35 + 50 }));
      state.objects = sortedObjects;
      saveToHistory(state);
    },

    createContainer: (state, action: PayloadAction<{ parentId: number | null; properties: any }>) => {
      const nextId = state.objects.length ? Math.max(...state.objects.map(o => o.id)) + 1 : 0;
      const newContainer: BoxObject = {
        id: nextId,
        type: 'container',
        x: Math.random() * 400 + 50,
        y: state.objects.length * 35 + 50,
        width: 120,
        height: 30,
        text: action.payload.properties.name || 'Container',
        color: 'grey',
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