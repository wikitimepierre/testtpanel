import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import PixiCanvas from './components/PixiCanvas';
import ControlPanel from './components/ControlPanel';

function App() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-100">
        <div className="h-screen pb-32"> {/* Space for control panel */}
          <PixiCanvas />
        </div>
        <ControlPanel />
      </div>
    </Provider>
  );
}

export default App;