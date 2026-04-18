'use client';

import { useEffect, useState } from 'react';
import { adminAPI, Video } from '@/lib/admin-api';

interface VideoSelectorProps {
  onSelect: (videoId: string) => void;
  onClose: () => void;
  selectedVideoId?: string;
}

export default function VideoSelector({ onSelect, onClose, selectedVideoId }: VideoSelectorProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | undefined>(selectedVideoId);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.listVideos();
      setVideos(data.videos);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(search.toLowerCase()) ||
      video.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Select Video</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <input
            type="search"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading videos...</div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No videos found. Upload videos first.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelected(video.id)}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selected === video.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                        🎥
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{video.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {video.description}
                      </p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                        <span>{formatDuration(video.duration_seconds)}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          video.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {video.status}
                        </span>
                      </div>
                    </div>
                    {selected === video.id && (
                      <div className="flex-shrink-0 text-blue-600">
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {selected ? `Selected: ${videos.find(v => v.id === selected)?.title}` : 'No video selected'}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selected}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
