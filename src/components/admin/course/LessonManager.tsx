'use client';

import { useState } from 'react';
import { Lesson } from '@/lib/admin-api';
import StepManager from './StepManager';

interface LessonManagerProps {
  moduleId: string;
  lessons: Lesson[];
  onUpdate: () => void;
}

export default function LessonManager({ moduleId, lessons, onUpdate }: LessonManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!title) return;

    setSaving(true);
    try {
      // TODO: Call API to create lesson
      console.log('Creating lesson:', { moduleId, title, description });
      
      setShowAddForm(false);
      setTitle('');
      setDescription('');
      onUpdate();
    } catch (err) {
      alert('Failed to create lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setDescription(lesson.description);
  };

  const handleUpdate = async () => {
    if (!editingLesson || !title) return;

    setSaving(true);
    try {
      // TODO: Call API to update lesson
      console.log('Updating lesson:', { id: editingLesson.id, title, description });
      
      setEditingLesson(null);
      setTitle('');
      setDescription('');
      onUpdate();
    } catch (err) {
      alert('Failed to update lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      // TODO: Call API to delete lesson
      console.log('Deleting lesson:', lessonId);
      onUpdate();
    } catch (err) {
      alert('Failed to delete lesson');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingLesson(null);
    setTitle('');
    setDescription('');
  };

  const toggleExpand = (lessonId: string) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  return (
    <div className="space-y-3 ml-6">
      {/* Add Lesson Button */}
      {!showAddForm && !editingLesson && (
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          + Add Lesson
        </button>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingLesson) && (
        <div className="border rounded-lg p-3 bg-blue-50">
          <h4 className="text-sm font-medium mb-3">
            {editingLesson ? 'Edit Lesson' : 'New Lesson'}
          </h4>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lesson title"
                disabled={saving}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Lesson description"
                disabled={saving}
                rows={2}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={editingLesson ? handleUpdate : handleAdd}
                disabled={saving || !title}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {saving ? 'Saving...' : editingLesson ? 'Update' : 'Add'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lessons List */}
      <div className="space-y-2">
        {lessons.map((lesson, index) => (
          <div key={lesson.id} className="border rounded-lg bg-white">
            <div className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleExpand(lesson.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedLesson === lesson.id ? '▼' : '▶'}
                    </button>
                    <span className="text-sm text-gray-400 font-medium">{index + 1}.</span>
                    <h4 className="text-sm font-medium">{lesson.title}</h4>
                  </div>
                  {lesson.description && (
                    <p className="text-xs text-gray-500 mt-1 ml-8">{lesson.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1 ml-8">
                    {lesson.steps?.length || 0} steps
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(lesson)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Steps (expanded) */}
            {expandedLesson === lesson.id && (
              <div className="border-t bg-gray-50 p-3">
                <StepManager
                  lessonId={lesson.id}
                  steps={lesson.steps || []}
                  onUpdate={onUpdate}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {lessons.length === 0 && !showAddForm && (
        <div className="text-center py-4 text-sm text-gray-500">
          No lessons yet. Click "Add Lesson" to get started.
        </div>
      )}
    </div>
  );
}
