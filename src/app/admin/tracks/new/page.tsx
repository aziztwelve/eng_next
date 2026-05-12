'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { adminAPI } from '@/lib/admin-api';

const TRACK_TYPES = ['thematic', 'daily', 'stories', 'podcast'] as const;

export default function NewTrackPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: '',
    title: '',
    description: '',
    icon_url: '',
    language: 'en',
    level: 'A2',
    track_type: 'thematic' as (typeof TRACK_TYPES)[number],
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const track = await adminAPI.createTrack(form);
      router.push(`/admin/tracks/${track.id}`);
    } catch (err) {
      setError('Failed to create track. Check that code is unique.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Track</h1>
          <p className="text-gray-600 mt-2">Add a new thematic learning track.</p>
        </div>
        <Link href="/admin/tracks" className="text-gray-600 hover:text-gray-900">← Back</Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Track details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Code (unique, kebab-case)</Label>
              <Input
                id="code"
                required
                placeholder="e.g. daily-english"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Used in URLs and as a stable identifier. Cannot be changed later via UI.</p>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                placeholder="e.g. Daily English"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Short description for students"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="icon_url">Icon URL</Label>
              <Input
                id="icon_url"
                type="url"
                placeholder="https://..."
                value={form.icon_url}
                onChange={(e) => setForm({ ...form, icon_url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="track_type">Type</Label>
                <select
                  id="track_type"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={form.track_type}
                  onChange={(e) => setForm({ ...form, track_type: e.target.value as (typeof TRACK_TYPES)[number] })}
                >
                  {TRACK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  placeholder="en"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  placeholder="A1, A2, B1..."
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sort_order">Sort order</Label>
              <Input
                id="sort_order"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value || '0', 10) })}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create track'}</Button>
              <Link href="/admin/tracks">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
