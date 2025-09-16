import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { undo, redo, deleteObject } from '../store/boxSlice';
// Removed lucide-react icons; using text labels instead
import CreateObjectModal from './CreateObjectModal';

const ControlPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeObjectId, history, historyIndex } = useAppSelector(state => state.boxes);
  const [showCreateModal, setShowCreateModal] = useState<{ type: 'container' | 'info' | null }>({ type: null });

  const handleUndo = () => {dispatch(undo())};
  const handleRedo = () => {dispatch(redo())};
  const handleDelete = () => {if (activeObjectId !== null) {dispatch(deleteObject(activeObjectId))}};
  const handleNew = () => {setShowCreateModal({ type: 'container' })};

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <>
      <div className="control-panel">
        <button onClick={handleUndo} disabled={!canUndo}>Undo</button>
        <button onClick={handleRedo} disabled={!canRedo}>Redo</button>
  <button onClick={handleDelete} disabled={activeObjectId === null}>Delete</button>
        <button onClick={handleNew}>New</button>
      </div>
      {showCreateModal.type && (
        <CreateObjectModal
          type={showCreateModal.type}
          onClose={() => setShowCreateModal({ type: null })}
          parentId={activeObjectId}
        />
      )}
    </>
  );
};

export default ControlPanel;