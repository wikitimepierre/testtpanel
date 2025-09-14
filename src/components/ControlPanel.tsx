import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { undo, redo, deleteObject, createContainer, createInfo } from '../store/boxSlice';
import { Save, Undo2, Redo2, Trash2, Plus, FolderPlus, FileText } from 'lucide-react';
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
        <div className="flex-center space-x-4">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="btn btn-blue"
          >
            <Undo2 size={18} />
            <span>Undo</span>
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="btn btn-blue"
          >
            <Redo2 size={18} />
            <span>Redo</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={!activeObjectId}
            className="btn btn-red"
          >
            <Trash2 size={18} />
            <span>Delete</span>
          </button>
          <button
            onClick={handleSave}
            className="btn btn-green"
          >
            <Save size={18} />
            <span>Save</span>
          </button>
        </div>
        <div className="flex-center space-x-4 mt-3">
          <button
            onClick={handleCreateContainer}
            className="btn btn-purple"
          >
            <FolderPlus size={18} />
            <span>New Container</span>
          </button>
          <button
            onClick={handleCreateInfo}
            className="btn btn-indigo"
          >
            <FileText size={18} />
            <span>New Info</span>
          </button>
        </div>
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