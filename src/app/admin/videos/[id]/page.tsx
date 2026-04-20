'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { adminAPI, Video, UpdateVideoData } from '@/lib/admin-api';

export default function EditVideoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<UpdateVideoData>({ title: '', description: '' });

  useEffect(() => {
    adminAPI.getVideo(id)
      .then((v) => {
        setVideo(v);
        setForm({ title: v.title, description: v.description });
      })
      .catch(() => setError('Failed to load video'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.updateVideo(id, form);
      router.push('/admin/videos');
    } catch {
      setError('Failed to update video');
    } finally {
      setSaving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-full text-red-600">{error}</div>;
  if (!video) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/videos" className="text-gray-500 hover:text-gray-700">← Back</Link>
        <h1 className="text-3xl font-bold">Edit Video</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Video Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/videos')}>Cancel</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="text-gray-500">ID:</span><p className="font-mono text-xs break-all">{video.id}</p></div>
            <div><span className="text-gray-500">Status:</span><p>{video.status}</p></div>
            <div><span className="text-gray-500">Duration:</span><p>{formatDuration(video.duration_seconds)}</p></div>
            <div><span className="text-gray-500">Size:</span><p>{formatFileSize(video.size_bytes)}</p></div>
            <div><span className="text-gray-500">Type:</span><p>{video.content_type}</p></div>
            <div><span className="text-gray-500">Bucket:</span><p>{video.bucket_name}</p></div>
            <div><span className="text-gray-500">Key:</span><p className="font-mono text-xs break-all">{video.storage_key}</p></div>
            <div><span className="text-gray-500">Created:</span><p>{new Date(video.created_at).toLocaleString()}</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
