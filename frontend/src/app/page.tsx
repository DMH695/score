'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { publicApi, StudentWithRank, Rank } from '@/lib/api';

export default function Home() {
  const [students, setStudents] = useState<StudentWithRank[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 随机点名状态
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [rollingName, setRollingName] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithRank | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, ranksRes] = await Promise.all([
        publicApi.getStudents(),
        publicApi.getRanks(),
      ]);
      setStudents(studentsRes.data);
      setRanks(ranksRes.data);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.includes(searchKeyword) ||
      s.student_no.includes(searchKeyword)
  );

  const top3 = filteredStudents.slice(0, 3);
  const restStudents = filteredStudents.slice(3);

  const totalScore = students.reduce((sum, s) => sum + s.score, 0);
  const avgScore = students.length > 0 ? Math.round(totalScore / students.length) : 0;

  // 随机点名函数
  const startRandomPick = () => {
    if (students.length === 0) return;

    setShowRandomModal(true);
    setIsRolling(true);
    setSelectedStudent(null);

    // 滚动效果
    let count = 0;
    const maxCount = 20 + Math.floor(Math.random() * 10);
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * students.length);
      setRollingName(students[randomIndex].name);
      count++;

      if (count >= maxCount) {
        clearInterval(interval);
        // 最终选中
        const finalIndex = Math.floor(Math.random() * students.length);
        setSelectedStudent(students[finalIndex]);
        setRollingName(students[finalIndex].name);
        setIsRolling(false);
      }
    }, 100);
  };

  const closeRandomModal = () => {
    setShowRandomModal(false);
    setSelectedStudent(null);
    setRollingName('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      {/* 头部 */}
      <header className="relative z-10 pt-8 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-blue-600 text-sm mb-4 shadow-sm border border-blue-100">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              2025级高一（3）班
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent mb-4">
              班级积分排行榜
            </h1>
            <p className="text-slate-500 text-base md:text-lg">努力学习，争创佳绩</p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
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
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-12">
        {/* 搜索框和随机点名 */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索学生姓名或学号..."
              className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white/70 backdrop-blur-md border border-blue-100 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-lg shadow-blue-100/30"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
          <button
            onClick={startRandomPick}
            className="px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-2xl shadow-lg shadow-purple-200/50 hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="sm:inline">随机点名</span>
          </button>
        </div>

        {/* 前三名展示 */}
        {!searchKeyword && top3.length >= 3 && (
          <div className="mb-8">
            <h2 className="text-slate-700 text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              荣誉榜
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 第二名 */}
              <div className="md:order-1 bg-gradient-to-br from-slate-50 to-slate-100 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/50 transform md:translate-y-4">
                <div className="text-center">
                  <div className="text-5xl mb-3">🥈</div>
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-200 to-slate-400 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg">
                    {top3[1]?.name.charAt(0)}
                  </div>
                  <div className="text-slate-800 font-bold text-xl">{top3[1]?.name}</div>
                  <div className="text-slate-400 text-sm">学号 {top3[1]?.student_no}</div>
                  <div className="mt-3 text-3xl font-bold text-slate-600">{top3[1]?.score} 分</div>
                  <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: top3[1]?.rank_color + '20', color: top3[1]?.rank_color }}>
                    {top3[1]?.rank_icon} {top3[1]?.rank_name}
                  </div>
                </div>
              </div>

              {/* 第一名 */}
              <div className="md:order-0 bg-gradient-to-br from-amber-50 to-yellow-100 backdrop-blur-md rounded-3xl p-6 border border-amber-200 shadow-xl shadow-amber-200/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-500"></div>
                <div className="absolute top-3 right-3">
                  <span className="text-xs bg-amber-400 text-white px-2 py-1 rounded-full font-medium">TOP 1</span>
                </div>
                <div className="text-center">
                  <div className="text-6xl mb-3 animate-bounce">🥇</div>
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-300 to-yellow-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3 ring-4 ring-amber-200 shadow-lg">
                    {top3[0]?.name.charAt(0)}
                  </div>
                  <div className="text-slate-800 font-bold text-2xl">{top3[0]?.name}</div>
                  <div className="text-slate-400 text-sm">学号 {top3[0]?.student_no}</div>
                  <div className="mt-3 text-4xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">{top3[0]?.score} 分</div>
                  <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: top3[0]?.rank_color + '20', color: top3[0]?.rank_color }}>
                    {top3[0]?.rank_icon} {top3[0]?.rank_name}
                  </div>
                </div>
              </div>

              {/* 第三名 */}
              <div className="md:order-2 bg-gradient-to-br from-orange-50 to-amber-100 backdrop-blur-md rounded-3xl p-6 border border-orange-200 shadow-xl shadow-orange-200/50 transform md:translate-y-4">
                <div className="text-center">
                  <div className="text-5xl mb-3">🥉</div>
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-300 to-amber-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg">
                    {top3[2]?.name.charAt(0)}
                  </div>
                  <div className="text-slate-800 font-bold text-xl">{top3[2]?.name}</div>
                  <div className="text-slate-400 text-sm">学号 {top3[2]?.student_no}</div>
                  <div className="mt-3 text-3xl font-bold text-orange-600">{top3[2]?.score} 分</div>
                  <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: top3[2]?.rank_color + '20', color: top3[2]?.rank_color }}>
                    {top3[2]?.rank_icon} {top3[2]?.rank_name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 段位说明 */}
        <div className="mb-8 bg-white/70 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-blue-100 shadow-lg shadow-blue-100/30">
          <h2 className="text-slate-700 text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            段位系统
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 sm:gap-3">
            {ranks.map((rank) => (
              <div
                key={rank.id}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all cursor-default"
              >
                <span className="text-xl sm:text-2xl">{rank.icon}</span>
                <div>
                  <div className="font-semibold text-sm sm:text-base" style={{ color: rank.color }}>{rank.name}</div>
                  <div className="text-slate-400 text-xs">≥{rank.min_score} 分</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 完整排行榜 */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/30 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-slate-700 text-base sm:text-lg font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              完整排名
            </h2>
            <span className="text-slate-400 text-xs sm:text-sm bg-white px-2 sm:px-3 py-1 rounded-full">{filteredStudents.length} 名学生</span>
          </div>

          {/* 桌面端表头 */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-3 bg-slate-50 text-slate-500 text-sm font-medium border-b border-slate-100">
            <div className="col-span-1 text-center">排名</div>
            <div className="col-span-2">学号</div>
            <div className="col-span-3">姓名</div>
            <div className="col-span-2 text-center">积分</div>
            <div className="col-span-2 text-center">段位</div>
            <div className="col-span-2 text-center">操作</div>
          </div>

          {/* 列表 */}
          <div className="divide-y divide-slate-50">
            {filteredStudents.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                {searchKeyword ? '未找到匹配的学生' : '暂无学生数据'}
              </div>
            ) : (
              (searchKeyword ? filteredStudents : restStudents).map((student) => (
                <div key={student.id}>
                  {/* 移动端卡片布局 */}
                  <div className="md:hidden p-4 hover:bg-blue-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* 排名 */}
                      <div className="flex-shrink-0">
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
                      {/* 信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700 font-medium truncate">{student.name}</span>
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                            style={{ backgroundColor: student.rank_color + '15', color: student.rank_color }}
                          >
                            {student.rank_icon} {student.rank_name}
                          </span>
                        </div>
                        <div className="text-slate-400 text-xs mt-1">学号 {student.student_no}</div>
                      </div>
                      {/* 积分和操作 */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-lg font-bold text-slate-700">{student.score}</span>
                        <Link
                          href={'/student/' + student.id}
                          className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* 桌面端表格布局 */}
                  <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-blue-50/50 transition-colors group">
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
                    <div className="col-span-3">
                      <span className="text-slate-700 font-medium">{student.name}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-xl font-bold text-slate-700">{student.score}</span>
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
                    <div className="col-span-2 text-center">
                      <Link
                        href={'/student/' + student.id}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-lg text-white text-sm font-medium transition-all shadow-md shadow-blue-200/50 hover:shadow-lg"
                      >
                        详情
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* 底部 */}
      <footer className="relative z-10 py-8 text-center">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-slate-600 hover:text-slate-800 transition-all border border-slate-200 shadow-lg shadow-slate-200/50 hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          管理后台
        </Link>
      </footer>

      {/* 随机点名弹窗 */}
      {showRandomModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl text-center">
            {/* 标题 */}
            <div className="mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200/50">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800">随机点名</h3>
            </div>

            {/* 滚动名字 */}
            <div className={`py-6 sm:py-8 px-4 rounded-2xl mb-4 sm:mb-6 ${isRolling ? 'bg-gradient-to-r from-purple-100 to-pink-100' : 'bg-gradient-to-r from-emerald-100 to-teal-100'}`}>
              <div className={`text-3xl sm:text-5xl font-bold ${isRolling ? 'text-purple-600 animate-pulse' : 'text-emerald-600'}`}>
                {rollingName || '准备中...'}
              </div>
              {selectedStudent && !isRolling && (
                <div className="mt-3 sm:mt-4 space-y-2">
                  <div className="text-slate-500 text-sm sm:text-base">学号: {selectedStudent.student_no}</div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs sm:text-sm" style={{ backgroundColor: selectedStudent.rank_color + '20', color: selectedStudent.rank_color }}>
                    {selectedStudent.rank_icon} {selectedStudent.rank_name}
                  </div>
                  <div className="text-slate-600 text-sm sm:text-base">当前积分: <span className="font-bold text-base sm:text-lg">{selectedStudent.score}</span></div>
                </div>
              )}
            </div>

            {/* 按钮 */}
            <div className="flex gap-3">
              {!isRolling && (
                <button
                  onClick={startRandomPick}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg transition-all text-sm sm:text-base"
                >
                  再来一次
                </button>
              )}
              <button
                onClick={closeRandomModal}
                disabled={isRolling}
                className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${isRolling ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {isRolling ? '抽取中...' : '关闭'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
