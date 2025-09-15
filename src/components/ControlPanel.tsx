import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { undo, redo, deleteObject } from '../store/boxSlice';
// Removed lucide-react icons; using text labels instead
import CreateObjectModal from './CreateObjectModal';

const ControlPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeObjectId, objects, history, historyIndex } = useAppSelector(state => state.boxes);
  const [showCreateModal, setShowCreateModal] = useState<{ type: 'container' | 'info' | null }>({ type: null });

  const handleUndo = () => {
    dispatch(undo());
  };

  const handleRedo = () => {
    dispatch(redo());
  };

  const handleDelete = () => {
    if (activeObjectId) {
      dispatch(deleteObject(activeObjectId));
    }
  };

  const handleSave = async () => {
    try {
      const dataStr = JSON.stringify(objects, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'objects.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error saving objects:', error);
    }
  };

  const handleCreateContainer = () => {
    setShowCreateModal({ type: 'container' });
  };

  const handleCreateInfo = () => {
    setShowCreateModal({ type: 'info' });
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <>
      <div className="control-panel">
        <button onClick={handleUndo} disabled={!canUndo}>Undo</button>
        <button onClick={handleRedo} disabled={!canRedo}>Redo</button>
        <button onClick={handleDelete} disabled={!activeObjectId}>Delete</button>
        <button onClick={handleSave}>Save</button>
        <button onClick={handleCreateContainer}>New Container</button>
        <button onClick={handleCreateInfo}>New Info</button>
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