const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
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

class AdminAPI {
  private getAuthHeader(): string {
    // Get token from cookie
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('auth_token='));
    const token = tokenCookie?.split('=')[1];
    return `Bearer ${token}`;
  }

  async listUsers(): Promise<{ users: User[]; total: number }> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }

  async getUser(id: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

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

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    return response.json();
  }

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
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

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    return response.json();
  }

  async getCourse(id: string): Promise<CourseDetail> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${id}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course');
    }

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

    if (!response.ok) {
      throw new Error('Failed to create course');
    }

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

    if (!response.ok) {
      throw new Error('Failed to update course');
    }

    return response.json();
  }

  async deleteCourse(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete course');
    }
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

    if (!response.ok) {
      throw new Error('Failed to publish course');
    }
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

    if (!response.ok) {
      throw new Error('Failed to create module');
    }

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

    if (!response.ok) {
      throw new Error('Failed to update module');
    }

    return response.json();
  }

  async deleteModule(moduleId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/modules/${moduleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete module');
    }
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

    if (!response.ok) {
      throw new Error('Failed to create lesson');
    }

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

    if (!response.ok) {
      throw new Error('Failed to update lesson');
    }

    return response.json();
  }

  async deleteLesson(lessonId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/lessons/${lessonId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete lesson');
    }
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

    if (!response.ok) {
      throw new Error('Failed to create step');
    }

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

    if (!response.ok) {
      throw new Error('Failed to update step');
    }

    return response.json();
  }

  async deleteStep(stepId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/courses/steps/${stepId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete step');
    }
  }

  // Video management
  async listVideos(): Promise<{ videos: Video[]; total: number }> {
    const response = await fetch(`${API_BASE_URL}/admin/videos`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }

    return response.json();
  }

  async getVideo(id: string): Promise<Video> {
    const response = await fetch(`${API_BASE_URL}/admin/videos/${id}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }

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

    if (!response.ok) {
      throw new Error('Failed to upload video');
    }

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

    if (!response.ok) {
      throw new Error('Failed to update video');
    }

    return response.json();
  }

  async deleteVideo(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/videos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete video');
    }
  }

  async getVideoUsage(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/videos/${id}/usage`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch video usage');
    }

    return response.json();
  }

  async getStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  }
}

export const adminAPI = new AdminAPI();
