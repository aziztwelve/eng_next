'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { adminAPI, Video } from '@/lib/admin-api';

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.listVideos();
      setVideos(data.videos);
    } catch (err) {
      setError('Failed to load videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await adminAPI.deleteVideo(videoId);
      setVideos(videos.filter(v => v.id !== videoId));
    } catch (err) {
      alert('Failed to delete video');
      console.error(err);
    }
  };

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(search.toLowerCase()) ||
      video.description.toLowerCase().includes(search.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Videos</h1>
          <p className="text-gray-600 mt-2">Manage video content</p>
        </div>
        <Link
          href="/admin/videos/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Upload Video
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Videos ({videos.length})</CardTitle>
            <Input
              type="search"
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Size</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{video.title}</div>
                        <div className="text-sm text-gray-500">{video.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{formatDuration(video.duration_seconds)}</td>
                    <td className="py-3 px-4">{formatFileSize(video.size_bytes)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          video.status
                        )}`}
                      >
                        {video.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(video.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/videos/${video.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredVideos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No videos found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
