import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BoxObject, AppState } from '../types';

const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateInitialBoxes = (): BoxObject[] => {
  const count = Math.floor(Math.random() * 6) + 5; // 5-10 boxes
  const boxes: BoxObject[] = [];
  
  console.log('Generating', count, 'initial boxes');
  
  for (let i = 0; i < count; i++) {
    boxes.push({
      id: `box-${i}`,
      type: 'box',
      x: Math.random() * 400 + 50, // Random x between 50-450
      y: i * 35 + 50, // Stacked with 5px gap (30px height + 5px gap)
      width: Math.random() * 100 + 80, // Random width between 80-180
      height: 30,
      text: generateRandomString(Math.floor(Math.random() * 16) + 5), // 5-20 chars
      color: 'grey',
      stackOrder: i
    });
  }
  
  console.log('Generated boxes:', boxes);
  return boxes;
};

const initialState: AppState = {
  objects: generateInitialBoxes(),
  activeObjectId: null,
  history: [],
  historyIndex: -1
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
    setActiveObject: (state, action: PayloadAction<string | null>) => {
      state.activeObjectId = action.payload;
    },
    
    colorToggle: (state, action: PayloadAction<string>) => {
      saveToHistory(state);
      const object = state.objects.find(obj => obj.id === action.payload);
      if (object) {
        object.color = object.color === 'grey' ? 'yellow' : 'grey';
      }
    },
    
    dragDrop: (state, action: PayloadAction<{ id: string; newStackOrder: number }>) => {
      saveToHistory(state);
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
      }
    },
    
    deleteObject: (state, action: PayloadAction<string>) => {
      saveToHistory(state);
      const deleteRecursively = (id: string) => {
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
    },
    
    createContainer: (state, action: PayloadAction<{ parentId: string | null; properties: any }>) => {
      saveToHistory(state);
      const newContainer: BoxObject = {
        id: `container-${Date.now()}`,
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
    },
    
    createInfo: (state, action: PayloadAction<{ parentId: string | null; properties: any }>) => {
      saveToHistory(state);
      const newInfo: BoxObject = {
        id: `info-${Date.now()}`,
        type: 'info',
        x: Math.random() * 400 + 50,
        y: state.objects.length * 35 + 50,
        width: 100,
        height: 30,
        text: action.payload.properties.content || 'Info',
        color: 'grey',
        ...(action.payload.parentId ? { parentId: action.payload.parentId } : {}),
        stackOrder: state.objects.length
      };
      
      state.objects.push(newInfo);
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
    
    loadObjects: (state, action: PayloadAction<BoxObject[]>) => {
      state.objects = action.payload;
      state.history = [];
      state.historyIndex = -1;
    }
  }
});

export const {
  setActiveObject,
  colorToggle,
  dragDrop,
  deleteObject,
  createContainer,
  createInfo,
  undo,
  redo,
  loadObjects
} = boxSlice.actions;

export default boxSlice.reducer;