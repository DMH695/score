'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  publicApi,
  adminApi,
  StudentWithRank,
  ScoreTemplate,
  Rank,
  ScoreRecord,
} from '@/lib/api';

type Tab = 'students' | 'templates' | 'ranks' | 'records';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [isInitialized, setIsInitialized] = useState(false);

  const [students, setStudents] = useState<StudentWithRank[]>([]);
  const [templates, setTemplates] = useState<ScoreTemplate[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [records, setRecords] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetStep, setResetStep] = useState<'password' | 'confirm1' | 'confirm2'>('password');
  const [studentSearchKeyword, setStudentSearchKeyword] = useState('');
  const [showQuickScoreModal, setShowQuickScoreModal] = useState(false);
  const [quickScoreStudentId, setQuickScoreStudentId] = useState<number | null>(null);
  const [quickScoreStudentName, setQuickScoreStudentName] = useState('');
  const [editingRankId, setEditingRankId] = useState<number | null>(null);
  const [editingRankScore, setEditingRankScore] = useState<number>(0);
  const [editingStudent, setEditingStudent] = useState<StudentWithRank | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ScoreTemplate | null>(null);

  const [studentForm, setStudentForm] = useState({ student_no: '', name: '' });
  const [templateForm, setTemplateForm] = useState({ name: '', value: 0, category: '' });

  // 从 localStorage 恢复登录状态
  useEffect(() => {
    const savedPassword = localStorage.getItem('admin_password');
    if (savedPassword) {
      // 验证保存的密码是否有效
      adminApi.login(savedPassword).then(() => {
        setPassword(savedPassword);
        setIsLoggedIn(true);
        loadAllData();
      }).catch(() => {
        localStorage.removeItem('admin_password');
      }).finally(() => {
        setIsInitialized(true);
      });
    } else {
      setIsInitialized(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.login(password);
      localStorage.setItem('admin_password', password);
      setIsLoggedIn(true);
      setLoginError('');
      loadAllData();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : '登录失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_password');
    setIsLoggedIn(false);
    setPassword('');
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [studentsRes, templatesRes, ranksRes, recordsRes] = await Promise.all([
        publicApi.getStudents(),
        publicApi.getTemplates(),
        publicApi.getRanks(),
        publicApi.getRecords({ page_size: 50 }),
      ]);
      setStudents(studentsRes.data);
      setTemplates(templatesRes.data);
      setRanks(ranksRes.data);
      setRecords(recordsRes.data);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await adminApi.updateStudent(password, editingStudent.id, studentForm);
      } else {
        await adminApi.createStudent(password, studentForm);
      }
      setShowStudentForm(false);
      setEditingStudent(null);
      setStudentForm({ student_no: '', name: '' });
      loadAllData();
    } catch (error) {
      alert(error instanceof Error ? error.message : '操作失败');
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('确定要删除该学生吗？')) return;
    try {
      await adminApi.deleteStudent(password, id);
      loadAllData();
    } catch (error) {
      alert(error instanceof Error ? error.message : '删除失败');
    }
  };

  const handleUndoRecord = async (id: number) => {
    if (!confirm('确定要撤销该记录吗？')) return;
    try {
      await adminApi.undoScoreRecord(password, id);
      loadAllData();
    } catch (error) {
      alert(error instanceof Error ? error.message : '撤销失败');
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await adminApi.updateTemplate(password, editingTemplate.id, templateForm);
      } else {
        await adminApi.createTemplate(password, templateForm);
      }
      setShowTemplateForm(false);
      setEditingTemplate(null);
      setTemplateForm({ name: '', value: 0, category: '' });
      loadAllData();
    } catch (error) {
      alert(error instanceof Error ? error.message : '操作失败');
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('确定要删除该模板吗？')) return;
    try {
      await adminApi.deleteTemplate(password, id);
      loadAllData();
    } catch (error) {
      alert(error instanceof Error ? error.message : '删除失败');
    }
  };

  const handleUpdateRankScore = async (id: number, newScore: number) => {
    try {
      await adminApi.updateRank(password, id, { min_score: newScore });
      setEditingRankId(null);
      loadAllData();
    } catch (error) {
      alert(error instanceof Error ? error.message : '更新失败');
    }
  };

  const openResetModal = () => {
    setShowResetModal(true);
    setResetPassword('');
    setResetError('');
    setResetStep('password');
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetPassword('');
    setResetError('');
    setResetStep('password');
  };

  const handleResetPasswordVerify = async () => {
    if (!resetPassword) {
      setResetError('请输入重置密码');
      return;
    }
    try {
      await adminApi.verifyResetPassword(resetPassword);
      setResetError('');
      setResetStep('confirm1');
    } catch (error) {
      setResetError(error instanceof Error ? error.message : '重置密码错误');
    }
  };

  const handleResetConfirm = async () => {
    if (resetStep === 'confirm1') {
      setResetStep('confirm2');
    } else if (resetStep === 'confirm2') {
      try {
        await adminApi.resetAllScores(password);
        closeResetModal();
        loadAllData();
        alert('重置成功');
      } catch (error) {
        setResetError(error instanceof Error ? error.message : '重置失败');
      }
    }
  };

  const openQuickScoreModal = (studentId: number, studentName: string) => {
    setQuickScoreStudentId(studentId);
    setQuickScoreStudentName(studentName);
    setShowQuickScoreModal(true);
  };

  const handleApplyTemplateToStudent = async (template: ScoreTemplate) => {
    if (!quickScoreStudentId) return;
    try {
      await adminApi.modifyScore(password, {
        student_id: quickScoreStudentId,
        value: template.value,
        reason: template.name,
        category: template.category,
      });
      setShowQuickScoreModal(false);
      setQuickScoreStudentId(null);
      setQuickScoreStudentName('');
      loadAllData();
    } catch (error) {
      alert(error instanceof Error ? error.message : '操作失败');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tabs = [
    { key: 'students', label: '学生管理', icon: '👥' },
    { key: 'templates', label: '积分模板', icon: '📋' },
    { key: 'ranks', label: '段位设置', icon: '🏆' },
    { key: 'records', label: '操作记录', icon: '📝' },
  ];

  // 登录界面
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        </div>

        <div className="relative z-10 bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-blue-100 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">管理后台</h1>
            <p className="text-slate-500 mt-2">请输入管理员密码登录</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-slate-600 text-sm font-medium mb-2">管理员密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                placeholder="请输入密码"
              />
            </div>
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-200/50 transition-all"
            >
              登录
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-slate-500 text-sm hover:text-blue-600 transition-colors">
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      {/* 头部 */}
      <header className="relative z-10 bg-white/70 backdrop-blur-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800">积分管理后台</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors"
            >
              查看前台
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* 标签页 */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mt-6">
        <div className="flex gap-2 bg-white/70 backdrop-blur-md rounded-2xl p-2 border border-blue-100 shadow-lg shadow-blue-100/30 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={
                'flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ' +
                (activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200/50'
                  : 'text-slate-600 hover:bg-slate-100')
              }
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* 学生管理 */}
            {activeTab === 'students' && (() => {
              const filteredStudents = students.filter(
                (s) =>
                  s.name.includes(studentSearchKeyword) ||
                  s.student_no.includes(studentSearchKeyword)
              );
              const top3 = filteredStudents.slice(0, 3);
              const restStudents = filteredStudents.slice(3);
              const totalScore = students.reduce((sum, s) => sum + s.score, 0);
              const avgScore = students.length > 0 ? Math.round(totalScore / students.length) : 0;

              return (
                <div className="space-y-6">
                  {/* 统计卡片 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-white shadow-lg shadow-blue-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm">总人数</div>
                          <div className="text-2xl font-bold text-slate-700">{students.length}</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-white shadow-lg shadow-blue-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm">总积分</div>
                          <div className="text-2xl font-bold text-slate-700">{totalScore}</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-white shadow-lg shadow-blue-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm">平均分</div>
                          <div className="text-2xl font-bold text-slate-700">{avgScore}</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-white shadow-lg shadow-blue-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm">段位数</div>
                          <div className="text-2xl font-bold text-slate-700">{ranks.length}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 搜索框和添加按钮 */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="搜索学生姓名或学号..."
                        className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-md border border-blue-100 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-lg shadow-blue-100/30"
                        value={studentSearchKeyword}
                        onChange={(e) => setStudentSearchKeyword(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setEditingStudent(null);
                        setStudentForm({ student_no: '', name: '' });
                        setShowStudentForm(true);
                      }}
                      className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-medium hover:shadow-lg hover:shadow-blue-200/50 transition-all flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      添加学生
                    </button>
                  </div>

                  {/* 前三名展示 */}
                  {!studentSearchKeyword && top3.length >= 3 && (
                    <div>
                      <h2 className="text-slate-700 text-lg font-semibold mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        荣誉榜
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 第二名 */}
                        <div className="md:order-1 bg-gradient-to-br from-slate-50 to-slate-100 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/50 transform md:translate-y-4 relative group">
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingStudent(top3[1]);
                                setStudentForm({ student_no: top3[1].student_no, name: top3[1].name });
                                setShowStudentForm(true);
                              }}
                              className="p-2 bg-white rounded-lg shadow-md hover:bg-blue-50 text-blue-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(top3[1].id)}
                              className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 text-red-500"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <div className="text-center">
                            <div className="text-5xl mb-3">🥈</div>
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-200 to-slate-400 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg">
                              {top3[1]?.name.charAt(0)}
                            </div>
                            <div className="text-slate-800 font-bold text-xl">{top3[1]?.name}</div>
                            <div className="text-slate-400 text-sm">学号 {top3[1]?.student_no}</div>
                            <div className="mt-3 flex items-center justify-center gap-2">
                              <span className="text-3xl font-bold text-slate-600">{top3[1]?.score} 分</span>
                              <button
                                onClick={() => openQuickScoreModal(top3[1].id, top3[1].name)}
                                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-all"
                                title="快捷加减分"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                            <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: top3[1]?.rank_color + '20', color: top3[1]?.rank_color }}>
                              {top3[1]?.rank_icon} {top3[1]?.rank_name}
                            </div>
                          </div>
                        </div>

                        {/* 第一名 */}
                        <div className="md:order-0 bg-gradient-to-br from-amber-50 to-yellow-100 backdrop-blur-md rounded-3xl p-6 border border-amber-200 shadow-xl shadow-amber-200/50 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-500"></div>
                          <div className="absolute top-3 left-3">
                            <span className="text-xs bg-amber-400 text-white px-2 py-1 rounded-full font-medium">TOP 1</span>
                          </div>
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingStudent(top3[0]);
                                setStudentForm({ student_no: top3[0].student_no, name: top3[0].name });
                                setShowStudentForm(true);
                              }}
                              className="p-2 bg-white rounded-lg shadow-md hover:bg-blue-50 text-blue-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(top3[0].id)}
                              className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 text-red-500"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <div className="text-center">
                            <div className="text-6xl mb-3 animate-bounce">🥇</div>
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-300 to-yellow-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3 ring-4 ring-amber-200 shadow-lg">
                              {top3[0]?.name.charAt(0)}
                            </div>
                            <div className="text-slate-800 font-bold text-2xl">{top3[0]?.name}</div>
                            <div className="text-slate-400 text-sm">学号 {top3[0]?.student_no}</div>
                            <div className="mt-3 flex items-center justify-center gap-2">
                              <span className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">{top3[0]?.score} 分</span>
                              <button
                                onClick={() => openQuickScoreModal(top3[0].id, top3[0].name)}
                                className="p-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-700 transition-all"
                                title="快捷加减分"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                            <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: top3[0]?.rank_color + '20', color: top3[0]?.rank_color }}>
                              {top3[0]?.rank_icon} {top3[0]?.rank_name}
                            </div>
                          </div>
                        </div>

                        {/* 第三名 */}
                        <div className="md:order-2 bg-gradient-to-br from-orange-50 to-amber-100 backdrop-blur-md rounded-3xl p-6 border border-orange-200 shadow-xl shadow-orange-200/50 transform md:translate-y-4 relative group">
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingStudent(top3[2]);
                                setStudentForm({ student_no: top3[2].student_no, name: top3[2].name });
                                setShowStudentForm(true);
                              }}
                              className="p-2 bg-white rounded-lg shadow-md hover:bg-blue-50 text-blue-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(top3[2].id)}
                              className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 text-red-500"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <div className="text-center">
                            <div className="text-5xl mb-3">🥉</div>
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-300 to-amber-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg">
                              {top3[2]?.name.charAt(0)}
                            </div>
                            <div className="text-slate-800 font-bold text-xl">{top3[2]?.name}</div>
                            <div className="text-slate-400 text-sm">学号 {top3[2]?.student_no}</div>
                            <div className="mt-3 flex items-center justify-center gap-2">
                              <span className="text-3xl font-bold text-orange-600">{top3[2]?.score} 分</span>
                              <button
                                onClick={() => openQuickScoreModal(top3[2].id, top3[2].name)}
                                className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-600 transition-all"
                                title="快捷加减分"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                            <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: top3[2]?.rank_color + '20', color: top3[2]?.rank_color }}>
                              {top3[2]?.rank_icon} {top3[2]?.rank_name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 完整排行榜 */}
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/30 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                      <h2 className="text-slate-700 text-lg font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        完整排名
                      </h2>
                      <span className="text-slate-400 text-sm bg-white px-3 py-1 rounded-full">{filteredStudents.length} 名学生</span>
                    </div>

                    {/* 表头 */}
                    <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-slate-50 text-slate-500 text-sm font-medium border-b border-slate-100">
                      <div className="col-span-1 text-center">排名</div>
                      <div className="col-span-2">学号</div>
                      <div className="col-span-2">姓名</div>
                      <div className="col-span-3 text-center">积分</div>
                      <div className="col-span-2 text-center">段位</div>
                      <div className="col-span-2 text-center">操作</div>
                    </div>

                    {/* 列表 */}
                    <div className="divide-y divide-slate-50">
                      {filteredStudents.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-400">
                          {studentSearchKeyword ? '未找到匹配的学生' : '暂无学生数据'}
                        </div>
                      ) : (
                        (studentSearchKeyword ? filteredStudents : restStudents).map((student) => (
                          <div
                            key={student.id}
                            className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-blue-50/50 transition-colors group"
                          >
                            <div className="col-span-1 text-center">
                              {student.ranking <= 3 ? (
                                <span className="text-2xl">
                                  {student.ranking === 1 && '🥇'}
                                  {student.ranking === 2 && '🥈'}
                                  {student.ranking === 3 && '🥉'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-semibold text-sm shadow-sm">
                                  {student.ranking}
                                </span>
                              )}
                            </div>
                            <div className="col-span-2 text-slate-400 text-sm font-mono">{student.student_no}</div>
                            <div className="col-span-2">
                              <span className="text-slate-700 font-medium">{student.name}</span>
                            </div>
                            <div className="col-span-3 flex items-center justify-center gap-2">
                              <span className="text-xl font-bold text-slate-700 min-w-[60px] text-center">{student.score}</span>
                              <button
                                onClick={() => openQuickScoreModal(student.id, student.name)}
                                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all"
                                title="快捷加减分"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                            <div className="col-span-2 text-center">
                              <span
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                                style={{ backgroundColor: student.rank_color + '15', color: student.rank_color }}
                              >
                                <span>{student.rank_icon}</span>
                                <span>{student.rank_name}</span>
                              </span>
                            </div>
                            <div className="col-span-2 text-center flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingStudent(student);
                                  setStudentForm({ student_no: student.student_no, name: student.name });
                                  setShowStudentForm(true);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 text-sm font-medium transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                编辑
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="inline-flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 text-sm font-medium transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                删除
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 积分模板 */}
            {activeTab === 'templates' && (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-blue-100 shadow-xl shadow-blue-100/30 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    📋 积分模板
                  </h2>
                  <button
                    onClick={() => {
                      setEditingTemplate(null);
                      setTemplateForm({ name: '', value: 0, category: '' });
                      setShowTemplateForm(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-200/50 transition-all"
                  >
                    + 添加模板
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={'rounded-2xl p-5 border-2 transition-all hover:shadow-lg ' +
                        (template.value >= 0
                          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50'
                          : 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50')
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-semibold text-slate-700 text-lg">{template.name}</span>
                          <div className="text-slate-500 text-sm mt-1">{template.category || '未分类'}</div>
                        </div>
                        <span className={'text-2xl font-bold ' + (template.value >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                          {template.value >= 0 ? '+' : ''}{template.value}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => {
                            setEditingTemplate(template);
                            setTemplateForm({ name: template.name, value: template.value, category: template.category });
                            setShowTemplateForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 段位设置 */}
            {activeTab === 'ranks' && (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-blue-100 shadow-xl shadow-blue-100/30 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    🏆 段位配置
                    <span className="text-sm font-normal text-slate-400">（点击分数可修改）</span>
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {ranks.map((rank) => (
                      <div
                        key={rank.id}
                        className="rounded-2xl p-4 border-2 transition-all hover:shadow-lg text-center"
                        style={{
                          borderColor: rank.color + '40',
                          background: `linear-gradient(135deg, ${rank.color}10, ${rank.color}20)`
                        }}
                      >
                        <div className="text-4xl mb-2">{rank.icon}</div>
                        <div className="font-bold text-lg" style={{ color: rank.color }}>{rank.name}</div>
                        <div className="mt-2">
                          {editingRankId === rank.id ? (
                            <div className="flex items-center gap-1 justify-center">
                              <span className="text-slate-500">≥</span>
                              <input
                                type="number"
                                value={editingRankScore}
                                onChange={(e) => setEditingRankScore(parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 text-center border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateRankScore(rank.id, editingRankScore);
                                  } else if (e.key === 'Escape') {
                                    setEditingRankId(null);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleUpdateRankScore(rank.id, editingRankScore)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setEditingRankId(null)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingRankId(rank.id);
                                setEditingRankScore(rank.min_score);
                              }}
                              className="px-3 py-1 bg-white/80 hover:bg-white rounded-lg text-slate-600 text-sm font-medium transition-all hover:shadow"
                            >
                              ≥ {rank.min_score} 分
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 操作记录 */}
            {activeTab === 'records' && (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-blue-100 shadow-xl shadow-blue-100/30 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    📝 操作记录
                    <span className="text-sm font-normal text-slate-400">({records.length}条)</span>
                  </h2>
                  <button
                    onClick={openResetModal}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-red-200/50 transition-all"
                  >
                    重置所有积分
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {records.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-400">暂无操作记录</div>
                  ) : (
                    records.map((record) => (
                      <div key={record.id} className="px-6 py-4 flex items-center justify-between hover:bg-blue-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div
                            className={'w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ' +
                              (record.value >= 0
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-red-100 text-red-600')
                            }
                          >
                            {record.value >= 0 ? '+' : '−'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-700">{record.student?.name || '未知'}</span>
                              <span className="text-slate-500">{record.reason || '积分变动'}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-500">{record.category || '其他'}</span>
                              <span className="text-slate-400 text-xs">{formatDate(record.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={'text-xl font-bold ' + (record.value >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                            {record.value >= 0 ? '+' : ''}{record.value}
                          </span>
                          <button
                            onClick={() => handleUndoRecord(record.id)}
                            className="px-3 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
                          >
                            撤销
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 快捷加减分弹窗 */}
      {showQuickScoreModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                为 <span className="text-blue-600">{quickScoreStudentName}</span> 加减分
              </h3>
              <button
                onClick={() => {
                  setShowQuickScoreModal(false);
                  setQuickScoreStudentId(null);
                  setQuickScoreStudentName('');
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* 加分模板 */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-emerald-600 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  加分项目
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {templates.filter(t => t.value > 0).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleApplyTemplateToStudent(template)}
                      className="text-left px-4 py-3 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700 text-sm">{template.name}</span>
                        <span className="font-bold text-emerald-600">+{template.value}</span>
                      </div>
                      {template.category && (
                        <span className="text-xs text-slate-400">{template.category}</span>
                      )}
                    </button>
                  ))}
                </div>
                {templates.filter(t => t.value > 0).length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-sm">暂无加分模板</div>
                )}
              </div>

              {/* 减分模板 */}
              <div>
                <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  减分项目
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {templates.filter(t => t.value < 0).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleApplyTemplateToStudent(template)}
                      className="text-left px-4 py-3 rounded-xl border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700 text-sm">{template.name}</span>
                        <span className="font-bold text-red-600">{template.value}</span>
                      </div>
                      {template.category && (
                        <span className="text-xs text-slate-400">{template.category}</span>
                      )}
                    </button>
                  ))}
                </div>
                {templates.filter(t => t.value < 0).length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-sm">暂无减分模板</div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowQuickScoreModal(false);
                  setQuickScoreStudentId(null);
                  setQuickScoreStudentName('');
                }}
                className="w-full py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 学生表单弹窗 */}
      {showStudentForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{editingStudent ? '编辑学生' : '添加学生'}</h3>
            <form onSubmit={handleSaveStudent}>
              <div className="mb-4">
                <label className="block text-slate-600 text-sm font-medium mb-2">学号</label>
                <input
                  type="text"
                  value={studentForm.student_no}
                  onChange={(e) => setStudentForm({ ...studentForm, student_no: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-slate-600 text-sm font-medium mb-2">姓名</label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setShowStudentForm(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-all"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 模板表单弹窗 */}
      {showTemplateForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{editingTemplate ? '编辑模板' : '添加模板'}</h3>
            <form onSubmit={handleSaveTemplate}>
              <div className="mb-4">
                <label className="block text-slate-600 text-sm font-medium mb-2">名称</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-slate-600 text-sm font-medium mb-2">积分值</label>
                <input
                  type="number"
                  value={templateForm.value}
                  onChange={(e) => setTemplateForm({ ...templateForm, value: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-slate-600 text-sm font-medium mb-2">类别</label>
                <input
                  type="text"
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                  placeholder="如：课堂、作业"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setShowTemplateForm(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-all"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 重置确认弹窗 */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            {/* 头部图标 */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* 步骤1: 输入密码 */}
            {resetStep === 'password' && (
              <>
                <h3 className="text-xl font-bold text-slate-800 text-center mb-2">重置所有积分</h3>
                <p className="text-slate-500 text-center text-sm mb-6">请输入重置密码以继续操作</p>

                <div className="mb-4">
                  <label className="block text-slate-600 text-sm font-medium mb-2">重置密码</label>
                  <input
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleResetPasswordVerify()}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all"
                    placeholder="请输入重置密码"
                    autoFocus
                  />
                </div>

                {resetError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {resetError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleResetPasswordVerify}
                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-red-200/50 transition-all"
                  >
                    验证密码
                  </button>
                  <button
                    onClick={closeResetModal}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-all"
                  >
                    取消
                  </button>
                </div>
              </>
            )}

            {/* 步骤2: 第一次确认 */}
            {resetStep === 'confirm1' && (
              <>
                <h3 className="text-xl font-bold text-red-600 text-center mb-2">危险操作警告</h3>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-700 text-center font-medium mb-2">确定要重置所有学生积分吗？</p>
                  <ul className="text-red-600 text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      所有学生积分将归零
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      所有积分记录将被删除
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      此操作不可恢复
                    </li>
                  </ul>
                </div>

                {resetError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {resetError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleResetConfirm}
                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-red-200/50 transition-all"
                  >
                    我已了解，继续
                  </button>
                  <button
                    onClick={closeResetModal}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-all"
                  >
                    取消
                  </button>
                </div>
              </>
            )}

            {/* 步骤3: 最终确认 */}
            {resetStep === 'confirm2' && (
              <>
                <h3 className="text-xl font-bold text-red-600 text-center mb-2">最终确认</h3>
                <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 mb-6">
                  <p className="text-red-800 text-center font-bold text-lg">
                    ⚠️ 这是最后一步 ⚠️
                  </p>
                  <p className="text-red-700 text-center mt-2">
                    点击确认后，所有数据将被立即删除且无法恢复！
                  </p>
                </div>

                {resetError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {resetError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleResetConfirm}
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-300/50 transition-all animate-pulse"
                  >
                    确认重置
                  </button>
                  <button
                    onClick={closeResetModal}
                    className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-all"
                  >
                    我再想想
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
