'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { adminAPI, Track, TrackLesson, UpdateTrackData } from '@/lib/admin-api';

const TRACK_TYPES = ['thematic', 'daily', 'stories', 'podcast'] as const;

export default function EditTrackPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [track, setTrack] = useState<Track | null>(null);
  const [lessons, setLessons] = useState<TrackLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newLessonId, setNewLessonId] = useState('');

  // form fields (controlled, only changed fields will be sent)
  const [form, setForm] = useState<UpdateTrackData>({});

  useEffect(() => {
    if (!id) return;
    loadTrack();
  }, [id]);

  const loadTrack = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getTrack(id, true);
      setTrack(data);
      setLessons(data.lessons || []);
      setForm({
        title: data.title,
        description: data.description,
        icon_url: data.icon_url,
        language: data.language,
        level: data.level,
        track_type: data.track_type,
        sort_order: data.sort_order,
      });
      setError('');
    } catch (err) {
      setError('Failed to load track');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!track) return;
    setSaving(true);
    setError('');
    try {
      const updated = await adminAPI.updateTrack(track.id, form);
      setTrack(updated);
    } catch (err) {
      setError('Failed to save changes');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!track) return;
    try {
      const updated = await adminAPI.publishTrack(track.id, !track.is_published);
      setTrack(updated);
    } catch (err) {
      alert('Failed to toggle publish');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!track) return;
    if (!confirm(`Delete track "${track.title}"? Linked lessons stay; links removed.`)) return;
    try {
      await adminAPI.deleteTrack(track.id);
      router.push('/admin/tracks');
    } catch (err) {
      alert('Failed to delete track');
      console.error(err);
    }
  };

  const handleAddLesson = async () => {
    if (!track || !newLessonId.trim()) return;
    try {
      await adminAPI.addLessonToTrack(track.id, newLessonId.trim(), lessons.length);
      setNewLessonId('');
      await loadTrack();
    } catch (err) {
      alert('Failed to add lesson. Check that lesson UUID exists.');
      console.error(err);
    }
  };

  const handleRemoveLesson = async (lessonId: string) => {
    if (!track) return;
    if (!confirm('Remove this lesson from the track?')) return;
    try {
      await adminAPI.removeLessonFromTrack(track.id, lessonId);
      setLessons(lessons.filter(l => l.id !== lessonId));
    } catch (err) {
      alert('Failed to remove lesson');
      console.error(err);
    }
  };

  const handleMove = async (lessonId: string, direction: -1 | 1) => {
    if (!track) return;
    const idx = lessons.findIndex(l => l.id === lessonId);
    const newIdx = idx + direction;
    if (idx < 0 || newIdx < 0 || newIdx >= lessons.length) return;

    const reordered = [...lessons];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    setLessons(reordered);

    try {
      await adminAPI.reorderTrackLessons(track.id, reordered.map(l => l.id));
    } catch (err) {
      alert('Failed to reorder');
      setLessons(lessons); // revert
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!track) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error || 'Track not found'}</div>
        <Link href="/admin/tracks" className="text-blue-600 hover:underline">← Back to tracks</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{track.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <code className="text-sm text-gray-500">{track.code}</code>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${track.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {track.is_published ? 'Published' : 'Draft'}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {track.track_type}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePublishToggle} variant="outline">
            {track.is_published ? 'Unpublish' : 'Publish'}
          </Button>
          <Button onClick={handleDelete} variant="outline" className="text-red-600 hover:text-red-800">
            Delete
          </Button>
          <Link href="/admin/tracks">
            <Button variant="outline">← Back</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Track settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="icon_url">Icon URL</Label>
              <Input
                id="icon_url"
                type="url"
                value={form.icon_url || ''}
                onChange={(e) => setForm({ ...form, icon_url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="track_type">Type</Label>
                <select
                  id="track_type"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={form.track_type || 'thematic'}
                  onChange={(e) => setForm({ ...form, track_type: e.target.value })}
                >
                  {TRACK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={form.language || ''}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  value={form.level || ''}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sort_order">Sort order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={form.sort_order ?? 0}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value || '0', 10) })}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lessons in this track ({lessons.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Paste lesson UUID to attach..."
              value={newLessonId}
              onChange={(e) => setNewLessonId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLesson())}
              className="flex-1"
            />
            <Button onClick={handleAddLesson}>Add lesson</Button>
          </div>
          <p className="text-xs text-gray-500">
            Tip: copy a lesson UUID from the course editor or use a standalone lesson UUID (e.g. seeded <code>a1111111-...</code>).
          </p>

          {lessons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No lessons attached yet.</div>
          ) : (
            <div className="border rounded-lg divide-y">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm text-gray-400 w-6 text-right">{idx + 1}.</span>
                    <div className="flex-1">
                      <div className="font-medium">{lesson.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <code>{lesson.id}</code>
                        {lesson.module_id ? (
                          <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-[10px]">in module</span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-[10px]">standalone</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(lesson.id, -1)}
                      disabled={idx === 0}
                      className="px-2 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMove(lesson.id, 1)}
                      disabled={idx === lessons.length - 1}
                      className="px-2 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleRemoveLesson(lesson.id)}
                      className="ml-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
