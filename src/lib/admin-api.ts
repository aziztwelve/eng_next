const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserData {
  full_name: string;
  role: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  language: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order_index: number;
  steps: Step[];
}

export interface Step {
  id: string;
  title: string;
  type: string;
  content: string;
  video_id?: string;
  order_index: number;
}

export interface CourseDetail extends Course {
  modules: Module[];
}

export interface CreateCourseData {
  title: string;
  description: string;
  level: string;
  language: string;
}

export interface UpdateCourseData {
  title: string;
  description: string;
  level: string;
  language: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  storage_key: string;
  bucket_name: string;
  content_type: string;
  size_bytes: number;
  duration_seconds: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  total_videos: number;
}

export interface UploadVideoData {
  title: string;
  description: string;
}

export interface UpdateVideoData {
  title: string;
  description: string;
}

// === Learning Tracks (Phase 0) ===
export interface Track {
  id: string;
  code: string;
  title: string;
  description: string;
  icon_url: string;
  language: string;
  level: string;
  track_type: string; // thematic | daily | stories | podcast
  is_published: boolean;
  sort_order: number;
  created_by: string;
  created_at: string | { seconds: number; nanos: number };
  updated_at: string | { seconds: number; nanos: number };
}

export interface TrackLesson {
  id: string;
  module_id: string; // "" => standalone
  title: string;
  description: string;
  order_index: number;
  created_at: string | { seconds: number; nanos: number };
  updated_at: string | { seconds: number; nanos: number };
}

export interface CreateTrackData {
  code: string;
  title: string;
  description?: string;
  icon_url?: string;
  language?: string;
  level?: string;
  track_type?: string;
  sort_order?: number;
}

export interface UpdateTrackData {
  title?: string;
  description?: string;
  icon_url?: string;
  language?: string;
  level?: string;
  track_type?: string;
  sort_order?: number;
}

export interface TrackListParams {
  language?: string;
  level?: string;
  track_type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

class AdminAPI {
  private getAuthHeader(): string {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('auth_token='));
    const token = tokenCookie?.trim().substring('auth_token='.length);
    return `Bearer ${token}`;
  }

  private handleResponse(response: Response, errorMsg: string): void {
    if (!response.ok) {
      if (response.status === 401 && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
      throw new Error(errorMsg);
    }
  }

  async listUsers(params?: PaginationParams): Promise<{ users: User[]; pagination: PaginationMeta }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);

    const url = `${API_BASE_URL}/admin/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to fetch users');

    return response.json();
  }

  async getUser(id: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to fetch user');

    return response.json();
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to update user');

    return response.json();
  }

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to delete user');
  }

  // Course management
  async listCourses(params?: PaginationParams): Promise<{ courses: Course[]; pagination: PaginationMeta }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const url = `${API_BASE_URL}/admin/courses${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to fetch courses');

    return response.json();
  }

  async getCourse(id: string): Promise<CourseDetail> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${id}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to fetch course');

    return response.json();
  }

  async createCourse(data: CreateCourseData): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/admin/courses`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to create course');

    return response.json();
  }

  async updateCourse(id: string, data: UpdateCourseData): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to update course');

    return response.json();
  }

  async deleteCourse(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to delete course');
  }

  async publishCourse(id: string, publish: boolean): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${id}/publish`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publish }),
    });

    this.handleResponse(response, 'Failed to publish course');
  }

  // Module management
  async createModule(courseId: string, data: { title: string; description: string; order_index: number }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/modules`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to create module');

    return response.json();
  }

  async updateModule(moduleId: string, data: { title: string; description: string; order_index: number }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/modules/${moduleId}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to update module');

    return response.json();
  }

  async deleteModule(moduleId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/modules/${moduleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to delete module');
  }

  // Lesson management
  async createLesson(moduleId: string, data: { title: string; description: string; order_index: number }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/modules/${moduleId}/lessons`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to create lesson');

    return response.json();
  }

  async updateLesson(lessonId: string, data: { title: string; description: string; order_index: number }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/lessons/${lessonId}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to update lesson');

    return response.json();
  }

  async deleteLesson(lessonId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/lessons/${lessonId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to delete lesson');
  }

  // Step management
  async createStep(lessonId: string, data: { type: string; title: string; content: string; order_index: number }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/lessons/${lessonId}/steps`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to create step');

    return response.json();
  }

  async updateStep(stepId: string, data: { type: string; title: string; content: string; order_index: number }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/steps/${stepId}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to update step');

    return response.json();
  }

  async deleteStep(stepId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/steps/${stepId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to delete step');
  }

  // Video management
  async listVideos(params?: PaginationParams): Promise<{ videos: Video[]; pagination: PaginationMeta }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const url = `${API_BASE_URL}/admin/videos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to fetch videos');

    return response.json();
  }

  async getVideo(id: string): Promise<Video> {
    const response = await fetch(`${API_BASE_URL}/admin/videos/${id}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to fetch video');

    return response.json();
  }

  async uploadVideo(data: UploadVideoData): Promise<Video> {
    const response = await fetch(`${API_BASE_URL}/admin/videos/upload`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to upload video');

    return response.json();
  }

  async updateVideo(id: string, data: UpdateVideoData): Promise<Video> {
    const response = await fetch(`${API_BASE_URL}/admin/videos/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to update video');

    return response.json();
  }

  async deleteVideo(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/videos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to delete video');
  }

  async getVideoUsage(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/videos/${id}/usage`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to fetch video usage');

    return response.json();
  }

  async getStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to fetch dashboard stats');

    return response.json();
  }

  // Quiz Management
  async listQuizzes(params?: PaginationParams): Promise<{ quizzes: any[] }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('offset', ((params.page - 1) * (params.limit || 10)).toString());

    const response = await fetch(`${API_BASE_URL}/admin/quizzes?${queryParams}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to fetch quizzes');

    return response.json();
  }

  async getQuiz(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/quizzes/${id}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to fetch quiz');

    return response.json();
  }

  async createQuiz(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/quizzes`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to create quiz');

    return response.json();
  }

  async updateQuiz(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/quizzes/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to update quiz');

    return response.json();
  }

  async deleteQuiz(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/quizzes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to delete quiz');
  }

  async addQuestion(quizId: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/quizzes/${quizId}/questions`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to add question');

    return response.json();
  }

  async updateQuestion(questionId: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    this.handleResponse(response, 'Failed to update question');

    return response.json();
  }

  async deleteQuestion(questionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/questions/${questionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    this.handleResponse(response, 'Failed to delete question');
  }

  // === Learning Tracks ===
  async listTracks(params?: TrackListParams): Promise<{ tracks: Track[]; total: number }> {
    const q = new URLSearchParams();
    if (params?.language) q.append('language', params.language);
    if (params?.level) q.append('level', params.level);
    if (params?.track_type) q.append('track_type', params.track_type);
    if (params?.search) q.append('search', params.search);
    if (params?.limit) q.append('limit', params.limit.toString());
    if (params?.offset) q.append('offset', params.offset.toString());

    const url = `${API_BASE_URL}/admin/tracks${q.toString() ? '?' + q.toString() : ''}`;
    const response = await fetch(url, {
      headers: { 'Authorization': this.getAuthHeader() },
    });
    this.handleResponse(response, 'Failed to fetch tracks');
    const data = await response.json();
    return { tracks: data.tracks || [], total: data.total || 0 };
  }

  async getTrack(idOrCode: string, includeLessons = false): Promise<Track & { lessons?: TrackLesson[] }> {
    // Public endpoint поддерживает id или code
    const q = includeLessons ? '?include_lessons=true' : '';
    const response = await fetch(`${API_BASE_URL}/tracks/${idOrCode}${q}`, {
      headers: { 'Authorization': this.getAuthHeader() },
    });
    this.handleResponse(response, 'Failed to fetch track');
    return response.json();
  }

  async createTrack(data: CreateTrackData): Promise<Track> {
    const response = await fetch(`${API_BASE_URL}/admin/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    this.handleResponse(response, 'Failed to create track');
    return response.json();
  }

  async updateTrack(id: string, data: UpdateTrackData): Promise<Track> {
    const response = await fetch(`${API_BASE_URL}/admin/tracks/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    this.handleResponse(response, 'Failed to update track');
    return response.json();
  }

  async deleteTrack(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/tracks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': this.getAuthHeader() },
    });
    this.handleResponse(response, 'Failed to delete track');
  }

  async publishTrack(id: string, isPublished: boolean): Promise<Track> {
    const response = await fetch(`${API_BASE_URL}/admin/tracks/${id}/publish`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_published: isPublished }),
    });
    this.handleResponse(response, 'Failed to publish track');
    return response.json();
  }

  async addLessonToTrack(trackId: string, lessonId: string, orderIndex = 0): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/tracks/${trackId}/lessons`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lesson_id: lessonId, order_index: orderIndex }),
    });
    this.handleResponse(response, 'Failed to add lesson to track');
  }

  async removeLessonFromTrack(trackId: string, lessonId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/tracks/${trackId}/lessons/${lessonId}`, {
      method: 'DELETE',
      headers: { 'Authorization': this.getAuthHeader() },
    });
    this.handleResponse(response, 'Failed to remove lesson from track');
  }

  async reorderTrackLessons(trackId: string, lessonIds: string[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/tracks/${trackId}/lessons/reorder`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lesson_ids: lessonIds }),
    });
    this.handleResponse(response, 'Failed to reorder lessons');
  }
}

export const adminAPI = new AdminAPI();
