'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api-client';
import type {
  ListTracksResponse,
  TrackFilters,
  TrackWithLessons,
} from '@/types/api';

const buildTracksQuery = (filters?: TrackFilters) => {
  const params = new URLSearchParams();
  if (filters?.language) params.append('language', filters.language);
  if (filters?.level) params.append('level', filters.level);
  if (filters?.track_type) params.append('track_type', String(filters.track_type));
  if (filters?.search) params.append('search', filters.search);
  if (filters?.limit !== undefined) params.append('limit', String(filters.limit));
  if (filters?.offset !== undefined) params.append('offset', String(filters.offset));
  const q = params.toString();
  return q ? `?${q}` : '';
};

/** Список публикованных треков с фильтрами. */
export function useTracks(filters?: TrackFilters) {
  return useQuery({
    queryKey: ['tracks', filters],
    queryFn: () =>
      ApiClient.get<ListTracksResponse>(`/tracks${buildTracksQuery(filters)}`),
    staleTime: 5 * 60 * 1000,
  });
}

/** Один трек по id или code. include_lessons=true возвращает уроки. */
export function useTrack(idOrCode: string, includeLessons = true) {
  return useQuery({
    queryKey: ['track', idOrCode, includeLessons],
    queryFn: () =>
      ApiClient.get<TrackWithLessons>(
        `/tracks/${idOrCode}${includeLessons ? '?include_lessons=true' : ''}`,
      ),
    enabled: !!idOrCode,
    staleTime: 5 * 60 * 1000,
  });
}
