import React, { useState } from 'react';
import { useAppDispatch } from '../hooks/redux';
import { createContainer } from '../store/boxSlice';

interface CreateObjectModalProps {
  type: 'container' | 'info';
  parentId: number | null;
  onClose: () => void;
}

const CreateObjectModal: React.FC<CreateObjectModalProps> = ({ type, parentId, onClose }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(createContainer({ parentId, properties: formData }));
    
    onClose();
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  type Field =
    | { key: string; label: string; type: 'text' | 'textarea'; required: boolean; placeholder?: string }
    | { key: string; label: string; type: 'select'; required: boolean; options: string[]; placeholder?: string };

  const containerFields: Field[] = [
    { key: 'name', label: 'Container Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: false },
    { key: 'category', label: 'Category', type: 'text', required: false }
  ];

  const infoFields: Field[] = [
    { key: 'content', label: 'Content', type: 'text', required: true },
    { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'], required: false },
    { key: 'tags', label: 'Tags', type: 'text', placeholder: 'Comma separated', required: false }
  ];

  const fields = type === 'container' ? containerFields : infoFields;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2>Create New {type === 'container' ? 'Container' : 'Information Object'}</h2>
          <button onClick={onClose} aria-label="Close">
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <div key={field.key}>
              <label className="label">
                {field.label}
                {field.required && <span>*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="textarea"
                  rows={3}
                  required={field.required}
                />
              ) : field.type === 'select' ? (
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="select"
                  required={field.required}
                >
                  <option value="">Select...</option>
                  {field.options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="input"
                  required={field.required}
                />
              )}
            </div>
          ))}
          <div className="flex-center space-x-4">
            <button
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateObjectModal;