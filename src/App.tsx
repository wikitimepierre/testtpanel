import { Provider } from 'react-redux';
import { store } from './store';
import PixiCanvas from './components/PixiCanvas';
import ControlPanel from './components/ControlPanel';

function App() {
  return (
    <Provider store={store}>
      <PixiCanvas />
      <ControlPanel />
    </Provider>
  );
}

export default App;