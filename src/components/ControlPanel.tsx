import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { undo, redo, deleteObject, generateBox } from '../store/boxSlice';

const ControlPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeObjectId, history, historyIndex, fps, containers } = useAppSelector(state => state.boxes);

  const handleUndo = () => {dispatch(undo())};
  const handleRedo = () => {dispatch(redo())};
  const handleDelete = () => {if (activeObjectId !== null) {dispatch(deleteObject(activeObjectId))}};
  const handleNew = () => {dispatch(generateBox())};

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="control-panel">
      <button onClick={handleUndo} disabled={!canUndo}>Undo</button>
      <button onClick={handleRedo} disabled={!canRedo}>Redo</button>
      <button onClick={handleDelete} disabled={activeObjectId === null}>Delete</button>
      <button onClick={handleNew}>New</button>
      <div style={{ marginLeft: 12, display: 'inline-block' }}>
        <span style={{ marginRight: 8 }}>FPS: {typeof fps === 'number' ? fps.toFixed(0) : '-'}</span>
        <span>Containers: {typeof containers === 'number' ? containers : '-'}</span>
      </div>
    </div>
  );
};

export default ControlPanel;