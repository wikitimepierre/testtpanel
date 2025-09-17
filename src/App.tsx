import { Provider } from 'react-redux';
import { store } from './store';
import TimePanel from './components/TimePanel';
import ControlPanel from './components/ControlPanel';

function App() {
  return (
    <Provider store={store}>
      <TimePanel />
      <ControlPanel />
    </Provider>
  );
}

export default App;