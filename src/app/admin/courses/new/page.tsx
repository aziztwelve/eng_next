'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { adminAPI } from '@/lib/admin-api';

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('A1');
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    console.log('Creating course with level:', level); // Debug

    try {
      const course = await adminAPI.createCourse({
        title,
        description,
        level,
        language,
      });
      router.push(`/admin/courses/${course.id}`);
    } catch (err) {
      setError('Failed to create course');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Course</h1>
        <p className="text-gray-600 mt-2">Add a new course to the platform</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. English for Beginners"
                required
                disabled={saving}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Course description..."
                disabled={saving}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                  Level *
                </label>
                <select
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Proficiency</option>
                </select>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  Language *
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="ru">Russian</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Creating...' : 'Create Course'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/courses')}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
