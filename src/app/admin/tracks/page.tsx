'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { adminAPI, Track } from '@/lib/admin-api';

const TRACK_TYPES = ['', 'thematic', 'daily', 'stories', 'podcast'] as const;

function formatTimestamp(ts: Track['created_at']): string {
  if (typeof ts === 'string') return new Date(ts).toLocaleDateString();
  if (ts && typeof ts === 'object' && 'seconds' in ts) {
    return new Date(ts.seconds * 1000).toLocaleDateString();
  }
  return '-';
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'daily': return 'bg-blue-100 text-blue-800';
    case 'stories': return 'bg-purple-100 text-purple-800';
    case 'podcast': return 'bg-orange-100 text-orange-800';
    case 'thematic': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadTracks();
  }, [typeFilter]);

  const loadTracks = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.listTracks({
        search: search || undefined,
        track_type: typeFilter || undefined,
        limit: 50,
      });
      setTracks(data.tracks);
      setTotal(data.total);
      setError('');
    } catch (err) {
      setError('Failed to load tracks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete track "${title}"? Linked lessons stay; links removed.`)) return;
    try {
      await adminAPI.deleteTrack(id);
      setTracks(tracks.filter(t => t.id !== id));
      setTotal(total - 1);
    } catch (err) {
      alert('Failed to delete track');
      console.error(err);
    }
  };

  const handlePublishToggle = async (track: Track) => {
    try {
      const updated = await adminAPI.publishTrack(track.id, !track.is_published);
      setTracks(tracks.map(t => t.id === track.id ? { ...t, is_published: updated.is_published } : t));
    } catch (err) {
      alert('Failed to change publish status');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Tracks</h1>
          <p className="text-gray-600 mt-2">Thematic groups of standalone lessons (Daily English, Stories, Podcasts, etc.)</p>
        </div>
        <Link
          href="/admin/tracks/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Create Track
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <CardTitle>All Tracks ({total})</CardTitle>
            <div className="flex gap-4">
              <Input
                type="search"
                placeholder="Search by title or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadTracks()}
                className="max-w-xs"
              />
              <Button onClick={loadTracks} variant="outline">Search</Button>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                {TRACK_TYPES.map(t => (
                  <option key={t} value={t}>{t === '' ? 'All types' : t}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Title / Code</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Lang/Level</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Order</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((track) => (
                  <tr key={track.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{track.title}</div>
                      <code className="text-xs text-gray-500">{track.code}</code>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(track.track_type)}`}>
                        {track.track_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="uppercase">{track.language || '-'}</span>
                      {track.level && <span className="text-gray-500 ml-1">/ {track.level}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${track.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {track.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{track.sort_order}</td>
                    <td className="py-3 px-4 text-gray-600">{formatTimestamp(track.created_at)}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/tracks/${track.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handlePublishToggle(track)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        {track.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDelete(track.id, track.title)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tracks.length === 0 && (
              <div className="text-center py-8 text-gray-500">No tracks found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
