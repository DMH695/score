'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { publicApi, Student, ScoreRecord } from '@/lib/api';

interface StudentDetail {
  student: Student;
  records: ScoreRecord[];
  ranking: number;
  rank_name: string;
  rank_color: string;
  rank_icon: string;
  next_rank: string;
  next_rank_score: number;
}

export default function StudentDetailPage() {
  const params = useParams();
  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadStudent(Number(params.id));
    }
  }, [params.id]);

  const loadStudent = async (id: number) => {
    try {
      const res = await publicApi.getStudent(id);
      setData(res.data);
    } catch (error) {
      console.error('加载学生信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 flex flex-col items-center justify-center">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 text-center shadow-xl border border-blue-100">
          <div className="text-6xl mb-4">😢</div>
          <div className="text-xl text-slate-600 mb-6">学生不存在</div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-white font-medium shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      </div>

      {/* 头部导航 */}
      <header className="relative z-10 pt-6 pb-4">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-slate-600 hover:text-slate-800 hover:bg-white/80 transition-all border border-slate-200 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回排行榜
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 pb-12">
        {/* 学生信息卡片 */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-blue-100 shadow-xl shadow-blue-100/50 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* 头像 */}
            <div className="relative">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${data.rank_color}30, ${data.rank_color}60)`,
                  color: data.rank_color,
                  boxShadow: `0 20px 40px ${data.rank_color}30`,
                }}
              >
                {data.student.name.charAt(0)}
              </div>
              <div
                className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white shadow-lg border-2"
                style={{ borderColor: data.rank_color + '50' }}
              >
                {data.rank_icon}
              </div>
            </div>

            {/* 基本信息 */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-slate-800 mb-2">{data.student.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  学号 {data.student.student_no}
                </span>
                <span
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold shadow-sm"
                  style={{ backgroundColor: data.rank_color + '20', color: data.rank_color }}
                >
                  {data.rank_icon} {data.rank_name}
                </span>
              </div>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 text-center border border-blue-200 shadow-lg shadow-blue-100/50">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-blue-600">{data.student.score}</div>
              <div className="text-slate-500 text-sm mt-1">当前积分</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-5 text-center border border-amber-200 shadow-lg shadow-amber-100/50">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-amber-600">#{data.ranking}</div>
              <div className="text-slate-500 text-sm mt-1">班级排名</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-5 text-center border border-emerald-200 shadow-lg shadow-emerald-100/50">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </div>
              {data.next_rank ? (
                <>
                  <div className="text-3xl font-bold text-emerald-600">{data.next_rank_score}</div>
                  <div className="text-slate-500 text-sm mt-1">距 {data.next_rank}</div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold text-emerald-600">MAX</div>
                  <div className="text-slate-500 text-sm mt-1">最高段位</div>
                </>
              )}
            </div>
          </div>

          {/* 升级进度条 */}
          {data.next_rank && (
            <div className="mt-6 bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium" style={{ color: data.rank_color }}>{data.rank_icon} {data.rank_name}</span>
                <span className="text-slate-400">距离下一段位还需 {data.next_rank_score} 分</span>
                <span className="font-medium text-slate-600">{data.next_rank}</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(5, 100 - (data.next_rank_score / (data.student.score + data.next_rank_score)) * 100)}%`,
                    background: `linear-gradient(90deg, ${data.rank_color}, ${data.rank_color}99)`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* 积分记录 */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-blue-100 shadow-xl shadow-blue-100/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              积分记录
            </h2>
            <span className="text-slate-400 text-sm bg-white px-3 py-1 rounded-full">{data.records.length} 条记录</span>
          </div>

          {data.records.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-slate-400">暂无积分记录</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.records.map((record) => (
                <div
                  key={record.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm ' +
                        (record.value >= 0
                          ? 'bg-gradient-to-br from-emerald-100 to-green-200 text-emerald-600'
                          : 'bg-gradient-to-br from-red-100 to-rose-200 text-red-600')
                      }
                    >
                      {record.value >= 0 ? '+' : '−'}
                    </div>
                    <div>
                      <div className="text-slate-700 font-medium">{record.reason || '积分变动'}</div>
                      <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                          {record.category || '其他'}
                        </span>
                        <span>{formatDate(record.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={'text-2xl font-bold ' + (record.value >= 0 ? 'text-emerald-500' : 'text-red-500')}
                  >
                    {record.value >= 0 ? '+' : ''}{record.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
