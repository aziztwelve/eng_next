'use client';

import { useState } from 'react';
import { Step } from '@/lib/admin-api';

interface StepManagerProps {
  lessonId: string;
  steps: Step[];
  onUpdate: () => void;
}

type StepType = 'text' | 'video' | 'quiz';

export default function StepManager({ lessonId, steps, onUpdate }: StepManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [stepType, setStepType] = useState<StepType>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoId, setVideoId] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!title) return;

    setSaving(true);
    try {
      // TODO: Call API to create step
      console.log('Creating step:', { lessonId, stepType, title, content, videoId });
      
      setShowAddForm(false);
      resetForm();
      onUpdate();
    } catch (err) {
      alert('Failed to create step');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (step: Step) => {
    setEditingStep(step);
    setStepType(step.type as StepType);
    setTitle(step.title);
    setContent(step.content || '');
    setVideoId(step.video_id || '');
  };

  const handleUpdate = async () => {
    if (!editingStep || !title) return;

    setSaving(true);
    try {
      // TODO: Call API to update step
      console.log('Updating step:', { id: editingStep.id, stepType, title, content, videoId });
      
      setEditingStep(null);
      resetForm();
      onUpdate();
    } catch (err) {
      alert('Failed to update step');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (stepId: string) => {
    if (!confirm('Are you sure you want to delete this step?')) return;

    try {
      // TODO: Call API to delete step
      console.log('Deleting step:', stepId);
      onUpdate();
    } catch (err) {
      alert('Failed to delete step');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setVideoId('');
    setStepType('text');
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingStep(null);
    resetForm();
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'text':
        return '📝';
      case 'video':
        return '🎥';
      case 'quiz':
        return '❓';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-3">
      {/* Add Step Button */}
      {!showAddForm && !editingStep && (
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          + Add Step
        </button>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingStep) && (
        <div className="border rounded-lg p-3 bg-purple-50">
          <h5 className="text-xs font-medium mb-3">
            {editingStep ? 'Edit Step' : 'New Step'}
          </h5>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Step Type *
              </label>
              <select
                value={stepType}
                onChange={(e) => setStepType(e.target.value as StepType)}
                disabled={saving}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="text">Text Content</option>
                <option value="video">Video</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Step title"
                disabled={saving}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {stepType === 'text' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Step content (supports markdown)"
                  disabled={saving}
                  rows={4}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports markdown: **bold**, *italic*, `code`, etc.
                </p>
              </div>
            )}

            {stepType === 'video' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Video ID *
                </label>
                <input
                  type="text"
                  value={videoId}
                  onChange={(e) => setVideoId(e.target.value)}
                  placeholder="Select video..."
                  disabled={saving}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  Browse Videos
                </button>
              </div>
            )}

            {stepType === 'quiz' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quiz Content (JSON) *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder='{"questions": [...]}'
                  disabled={saving}
                  rows={4}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Quiz builder coming soon. For now, use JSON format.
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={editingStep ? handleUpdate : handleAdd}
                disabled={saving || !title || (stepType === 'text' && !content) || (stepType === 'video' && !videoId)}
                className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
              >
                {saving ? 'Saving...' : editingStep ? 'Update' : 'Add'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={step.id} className="border rounded p-2 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs">{getStepIcon(step.type)}</span>
                  <span className="text-xs text-gray-400 font-medium">{index + 1}.</span>
                  <span className="text-xs font-medium">{step.title}</span>
                  <span className="text-xs text-gray-400">({step.type})</span>
                </div>
                {step.content && step.type === 'text' && (
                  <p className="text-xs text-gray-500 mt-1 ml-8 truncate">
                    {step.content.substring(0, 100)}...
                  </p>
                )}
                {step.video_id && step.type === 'video' && (
                  <p className="text-xs text-gray-500 mt-1 ml-8">
                    Video: {step.video_id}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(step)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(step.id)}
                  className="text-red-600 hover:text-red-800 text-xs font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {steps.length === 0 && !showAddForm && (
        <div className="text-center py-3 text-xs text-gray-500">
          No steps yet. Click "Add Step" to get started.
        </div>
      )}
    </div>
  );
}
