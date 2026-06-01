// API Service Layer for SmartLMS Frontend
const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

interface AuthCredentials {
  email: string;
  password: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // Set authentication token
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Clear authentication token
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Get headers for API requests
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses (like 429 rate limit)
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return {
        success: response.ok,
        data: data
      };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Generic HTTP methods for contexts
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication API
  auth = {
    register: async (userData: UserData): Promise<ApiResponse> => {
      return this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    login: async (credentials: AuthCredentials): Promise<ApiResponse> => {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (response.data.data.token) {
        this.setToken(response.data.data.token);
      }
      
      return response;
    },

    logout: async (): Promise<ApiResponse> => {
      await this.request('/auth/logout', { method: 'POST' });
      this.clearToken();
      return { success: true, data: null };
    },

    getMe: async (): Promise<ApiResponse> => {
      return this.request('/auth/me');
    },

    updateProfile: async (profileData: Partial<UserData>): Promise<ApiResponse> => {
      return this.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },
  };

  // Courses API
  courses = {
    getAll: async (params: Record<string, any> = {}): Promise<ApiResponse> => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/courses${queryString ? `?${queryString}` : ''}`);
    },

    getById: async (id: string): Promise<ApiResponse> => {
      return this.request(`/courses/${id}`);
    },

    create: async (courseData: any): Promise<ApiResponse> => {
      return this.request('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData),
      });
    },

    update: async (id: string, courseData: any): Promise<ApiResponse> => {
      return this.request(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(courseData),
      });
    },

    delete: async (id: string): Promise<ApiResponse> => {
      return this.request(`/courses/${id}`, {
        method: 'DELETE',
      });
    },

    publish: async (id: string): Promise<ApiResponse> => {
      return this.request(`/courses/${id}/publish`, {
        method: 'POST',
      });
    },

    getByInstructor: async (instructorId: string): Promise<ApiResponse> => {
      return this.request(`/courses/instructor/${instructorId}`);
    },
  };

  // Lessons API
  lessons = {
    getByCourse: async (courseId: string): Promise<ApiResponse> => {
      return this.request(`/lessons/course/${courseId}`);
    },

    getById: async (lessonId: string): Promise<ApiResponse> => {
      return this.request(`/lessons/${lessonId}`);
    },

    create: async (courseId: string, unitId: string, lessonData: any): Promise<ApiResponse> => {
      return this.request(`/lessons/course/${courseId}/unit/${unitId}`, {
        method: 'POST',
        body: JSON.stringify(lessonData),
      });
    },

    update: async (lessonId: string, lessonData: any): Promise<ApiResponse> => {
      return this.request(`/lessons/${lessonId}`, {
        method: 'PUT',
        body: JSON.stringify(lessonData),
      });
    },

    delete: async (lessonId: string): Promise<ApiResponse> => {
      return this.request(`/lessons/${lessonId}`, {
        method: 'DELETE',
      });
    },

    complete: async (lessonId: string, score: number): Promise<ApiResponse> => {
      return this.request(`/lessons/${lessonId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ score }),
      });
    },
  };

  // Enrollments API
  enrollments = {
    enroll: async (courseId: string): Promise<ApiResponse> => {
      return this.request('/enrollments', {
        method: 'POST',
        body: JSON.stringify({ courseId }),
      });
    },

    getMyCourses: async (): Promise<ApiResponse> => {
      return this.request('/enrollments/my-courses');
    },

    getByCourse: async (courseId: string): Promise<ApiResponse> => {
      return this.request(`/enrollments/course/${courseId}`);
    },

    updateProgress: async (enrollmentId: string, lessonId: string, completed: boolean, score: number): Promise<ApiResponse> => {
      return this.request(`/enrollments/${enrollmentId}/progress`, {
        method: 'PUT',
        body: JSON.stringify({ lessonId, completed, score }),
      });
    },

    unenroll: async (enrollmentId: string): Promise<ApiResponse> => {
      return this.request(`/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      });
    },
  };

  // Users API
  users = {
    getAll: async (params: Record<string, any> = {}): Promise<ApiResponse> => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/users${queryString ? `?${queryString}` : ''}`);
    },

    getById: async (id: string): Promise<ApiResponse> => {
      return this.request(`/users/${id}`);
    },

    create: async (userData: any): Promise<ApiResponse> => {
      return this.request('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    update: async (id: string, userData: any): Promise<ApiResponse> => {
      return this.request(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    },

    delete: async (id: string): Promise<ApiResponse> => {
      return this.request(`/users/${id}`, {
        method: 'DELETE',
      });
    },

    getCourses: async (id: string): Promise<ApiResponse> => {
      return this.request(`/users/${id}/courses`);
    },

    getInstructors: async (): Promise<ApiResponse> => {
      return this.request('/users/instructors');
    },

    getLearners: async (): Promise<ApiResponse> => {
      return this.request('/users/learners');
    },
  };

  // Messages API
  messages = {
    // Get all chats for current user
    getChats: async (): Promise<ApiResponse> => {
      return this.request('/messages/chats');
    },

    // Get messages for a specific chat
    getChatMessages: async (chatId: string, page = 1, limit = 50): Promise<ApiResponse> => {
      return this.request(`/messages/chats/${chatId}/messages?page=${page}&limit=${limit}`);
    },

    // Send a message
    sendMessage: async (recipientId: string, content: string, chatType = 'direct'): Promise<ApiResponse> => {
      return this.request('/messages/messages', {
        method: 'POST',
        body: JSON.stringify({ recipientId, content, chatType })
      });
    },

    // Mark messages as read
    markAsRead: async (chatId: string): Promise<ApiResponse> => {
      return this.request('/messages/messages/read', {
        method: 'PUT',
        body: JSON.stringify({ chatId })
      });
    },

    // Get unread message count
    getUnreadCount: async (): Promise<ApiResponse> => {
      return this.request('/messages/messages/unread-count');
    },

    // Create or get chat with specific user
    createChat: async (recipientId: string, chatType = 'direct'): Promise<ApiResponse> => {
      return this.request('/messages/chats', {
        method: 'POST',
        body: JSON.stringify({ recipientId, chatType })
      });
    },

    // Delete a message
    deleteMessage: async (messageId: string): Promise<ApiResponse> => {
      return this.request(`/messages/messages/${messageId}`, {
        method: 'DELETE'
      });
    },

    // Get instructor's learners for messaging
    getInstructorLearners: async (): Promise<ApiResponse> => {
      return this.request('/messages/instructor/learners');
    },

    // Get admin users for messaging
    getAdminUsers: async (): Promise<ApiResponse> => {
      return this.request('/messages/admin/users');
    },

    // Send message to admin team (broadcast)
    sendToAdminTeam: async (content: string): Promise<ApiResponse> => {
      return this.request('/messages/admin/broadcast', {
        method: 'POST',
        body: JSON.stringify({ message: content })
      });
    }
  };

  // Notification methods
  notifications = {
    getAll: async (): Promise<ApiResponse> => {
      return this.request('/notifications');
    },

    markAsRead: async (id: string): Promise<ApiResponse> => {
      return this.request(`/notifications/${id}/read`, {
        method: 'PUT',
      });
    },

    markAllAsRead: async (): Promise<ApiResponse> => {
      return this.request('/notifications/mark-all-read', {
        method: 'PUT',
      });
    },

    create: async (notificationData: any): Promise<ApiResponse> => {
      return this.request('/notifications', {
        method: 'POST',
        body: JSON.stringify(notificationData),
      });
    },
  };

  // Assignments API
  assignments = {
    getAll: async (): Promise<ApiResponse> => {
      return this.request('/assignments');
    },

    getByStudent: async (studentId: string): Promise<ApiResponse> => {
      return this.request(`/assignments/student/${studentId}`);
    },

    submit: async (assignmentData: any): Promise<ApiResponse> => {
      return this.request('/assignments', {
        method: 'POST',
        body: JSON.stringify(assignmentData),
      });
    },

    update: async (id: string, assignmentData: any): Promise<ApiResponse> => {
      return this.request(`/assignments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(assignmentData),
      });
    },

    delete: async (id: string): Promise<ApiResponse> => {
      return this.request(`/assignments/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // Compliance API
  compliance = {
    getSetaReport: async (): Promise<ApiResponse> => {
      return this.request('/compliance/seta-report');
    },

    getQctoReport: async (): Promise<ApiResponse> => {
      return this.request('/compliance/qcto-report');
    },

    exportAll: async (): Promise<ApiResponse> => {
      return this.request('/compliance/export-all');
    },

    getAuditTrail: async (): Promise<ApiResponse> => {
      return this.request('/compliance/audit-trail');
    }
  };

  // Health check
  healthCheck = async (): Promise<ApiResponse> => {
    return this.request('/health');
  };
}

// Create and export API service instance
const apiService = new ApiService();
export default apiService;
