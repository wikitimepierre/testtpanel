import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { undo, redo, deleteObject, generateBox } from '../store/boxSlice';

const ControlPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeObjectId, history, historyIndex } = useAppSelector(state => state.boxes);

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
    </div>
  );
};

export default ControlPanel;