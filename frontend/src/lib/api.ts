const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || '请求失败');
  }

  return res.json();
}

// 带管理员认证的请求
function adminRequest<T>(
  endpoint: string,
  password: string,
  options: RequestInit = {}
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'X-Admin-Password': password,
    },
  });
}

// ============ 类型定义 ============

export interface Student {
  id: number;
  student_no: string;
  name: string;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface StudentWithRank extends Student {
  ranking: number;
  rank_name: string;
  rank_color: string;
  rank_icon: string;
  next_rank: string;
  next_rank_score: number;
}

export interface ScoreRecord {
  id: number;
  student_id: number;
  student?: Student;
  value: number;
  reason: string;
  category: string;
  created_at: string;
}

export interface ScoreTemplate {
  id: number;
  name: string;
  value: number;
  category: string;
}

export interface Rank {
  id: number;
  name: string;
  min_score: number;
  color: string;
  icon: string;
  sort_order: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  total: number;
}

export interface Statistics {
  total_students: number;
  total_records: number;
  category_stats: CategoryStat[];
}

// ============ 公开API ============

export const publicApi = {
  // 获取学生列表（排行榜）
  getStudents: () =>
    request<{ data: StudentWithRank[] }>('/students'),

  // 获取学生详情
  getStudent: (id: number) =>
    request<{
      data: {
        student: Student;
        records: ScoreRecord[];
        ranking: number;
        rank_name: string;
        rank_color: string;
        rank_icon: string;
        next_rank: string;
        next_rank_score: number;
      };
    }>(`/students/${id}`),

  // 搜索学生
  searchStudents: (keyword: string) =>
    request<{ data: Student[] }>(`/students/search?keyword=${encodeURIComponent(keyword)}`),

  // 获取段位配置
  getRanks: () =>
    request<{ data: Rank[] }>('/ranks'),

  // 获取积分模板
  getTemplates: () =>
    request<{ data: ScoreTemplate[] }>('/templates'),

  // 获取积分记录
  getRecords: (params?: { page?: number; page_size?: number; student_id?: number; category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString());
    if (params?.student_id) searchParams.set('student_id', params.student_id.toString());
    if (params?.category) searchParams.set('category', params.category);
    return request<{ data: ScoreRecord[]; total: number; page: number; page_size: number }>(
      `/records?${searchParams.toString()}`
    );
  },
};

// ============ 管理员API ============

export const adminApi = {
  // 登录验证
  login: (password: string) =>
    request<{ message: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  // 验证重置密码
  verifyResetPassword: (password: string) =>
    request<{ message: string }>('/admin/verify-reset', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  // 学生管理
  createStudent: (password: string, data: { student_no: string; name: string }) =>
    adminRequest<{ data: Student }>('/admin/students', password, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStudent: (password: string, id: number, data: { student_no: string; name: string }) =>
    adminRequest<{ data: Student }>(`/admin/students/${id}`, password, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteStudent: (password: string, id: number) =>
    adminRequest<{ message: string }>(`/admin/students/${id}`, password, {
      method: 'DELETE',
    }),

  batchCreateStudents: (password: string, students: { student_no: string; name: string }[]) =>
    adminRequest<{ data: Student[] }>('/admin/students/batch', password, {
      method: 'POST',
      body: JSON.stringify({ students }),
    }),

  // 积分操作
  modifyScore: (
    password: string,
    data: { student_id: number; value: number; reason: string; category: string }
  ) =>
    adminRequest<{ data: ScoreRecord; new_score: number }>('/admin/score', password, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  batchModifyScore: (
    password: string,
    data: { student_ids: number[]; value: number; reason: string; category: string }
  ) =>
    adminRequest<{ message: string }>('/admin/score/batch', password, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  undoScoreRecord: (password: string, id: number) =>
    adminRequest<{ message: string }>(`/admin/score/${id}`, password, {
      method: 'DELETE',
    }),

  // 积分模板
  createTemplate: (password: string, data: { name: string; value: number; category: string }) =>
    adminRequest<{ data: ScoreTemplate }>('/admin/templates', password, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTemplate: (password: string, id: number, data: { name: string; value: number; category: string }) =>
    adminRequest<{ data: ScoreTemplate }>(`/admin/templates/${id}`, password, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTemplate: (password: string, id: number) =>
    adminRequest<{ message: string }>(`/admin/templates/${id}`, password, {
      method: 'DELETE',
    }),

  // 段位配置
  createRank: (password: string, data: { name: string; min_score: number; color: string; icon: string }) =>
    adminRequest<{ data: Rank }>('/admin/ranks', password, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRank: (password: string, id: number, data: { name: string; min_score: number; color: string; icon: string }) =>
    adminRequest<{ data: Rank }>(`/admin/ranks/${id}`, password, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteRank: (password: string, id: number) =>
    adminRequest<{ message: string }>(`/admin/ranks/${id}`, password, {
      method: 'DELETE',
    }),

  // 系统管理
  resetAllScores: (password: string) =>
    adminRequest<{ message: string }>('/admin/reset', password, {
      method: 'POST',
    }),

  getStatistics: (password: string) =>
    adminRequest<{ data: Statistics }>('/admin/statistics', password),
};
