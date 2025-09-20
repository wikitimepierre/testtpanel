import { Provider } from 'react-redux';
import { store } from './store';
import TimePanel from './components/TimePanel';
import ControlPanel from './components/ControlPanel';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <TimePanel />
        <ControlPanel />
      </ErrorBoundary>
    </Provider>
  );
}

export default App;