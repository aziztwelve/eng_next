'use client';

import { useState } from 'react';
import { Module } from '@/lib/admin-api';

interface ModuleManagerProps {
  courseId: string;
  modules: Module[];
  onUpdate: () => void;
}

export default function ModuleManager({ courseId, modules, onUpdate }: ModuleManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!title) return;

    setSaving(true);
    try {
      // TODO: Call API to create module
      console.log('Creating module:', { courseId, title, description });
      
      // Mock success
      setShowAddForm(false);
      setTitle('');
      setDescription('');
      onUpdate();
    } catch (err) {
      alert('Failed to create module');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    setTitle(module.title);
    setDescription(module.description);
  };

  const handleUpdate = async () => {
    if (!editingModule || !title) return;

    setSaving(true);
    try {
      // TODO: Call API to update module
      console.log('Updating module:', { id: editingModule.id, title, description });
      
      // Mock success
      setEditingModule(null);
      setTitle('');
      setDescription('');
      onUpdate();
    } catch (err) {
      alert('Failed to update module');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;

    try {
      // TODO: Call API to delete module
      console.log('Deleting module:', moduleId);
      
      // Mock success
      onUpdate();
    } catch (err) {
      alert('Failed to delete module');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingModule(null);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-4">
      {/* Add Module Button */}
      {!showAddForm && !editingModule && (
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Module
        </button>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingModule) && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium mb-4">
            {editingModule ? 'Edit Module' : 'New Module'}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Module title"
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Module description"
                disabled={saving}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={editingModule ? handleUpdate : handleAdd}
                disabled={saving || !title}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {saving ? 'Saving...' : editingModule ? 'Update' : 'Add'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-3">
        {modules.map((module, index) => (
          <div key={module.id} className="border rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 font-medium">{index + 1}.</span>
                  <h3 className="font-medium">{module.title}</h3>
                </div>
                {module.description && (
                  <p className="text-sm text-gray-500 mt-1 ml-6">{module.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-2 ml-6">
                  {module.lessons?.length || 0} lessons
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(module)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(module.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Lessons (placeholder) */}
            {module.lessons && module.lessons.length > 0 && (
              <div className="mt-4 ml-6 space-y-2">
                {module.lessons.map((lesson, lessonIndex) => (
                  <div key={lesson.id} className="text-sm text-gray-600 flex items-center">
                    <span className="text-gray-400 mr-2">{index + 1}.{lessonIndex + 1}</span>
                    {lesson.title}
                    <span className="text-xs text-gray-400 ml-2">
                      ({lesson.steps?.length || 0} steps)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {modules.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-500">
          No modules yet. Click "Add Module" to get started.
        </div>
      )}
    </div>
  );
}
