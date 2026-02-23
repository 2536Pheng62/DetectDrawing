'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { Project } from '@/types/database';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  ChevronRight,
  ClipboardList,
  Loader2,
  MapPin,
  Search,
} from 'lucide-react';

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(projects);
    } else {
      const q = query.toLowerCase();
      setFiltered(
        projects.filter(
          p =>
            p.name?.toLowerCase().includes(q) ||
            (p as any).province?.name?.toLowerCase().includes(q) ||
            p.contract_number?.toLowerCase().includes(q)
        )
      );
    }
  }, [query, projects]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const supabase = getSupabase();
      const { data, error: err } = await supabase
        .from('projects')
        .select('*, province:provinces(name)')
        .eq('status', 'active')
        .order('name');
      if (err) throw err;
      setProjects((data as Project[]) || []);
    } catch (e: any) {
      setError(e.message || 'โหลดข้อมูลโครงการไม่ได้');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList size={20} className="text-blue-600" />
            เลือกโครงการ
          </h1>
          <p className="text-sm text-gray-500">เลือกโครงการที่ต้องการเขียนรายงานประจำวัน</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาชื่อโครงการ, จังหวัด, เลขสัญญา..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          กำลังโหลด...
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{query ? 'ไม่พบโครงการที่ค้นหา' : 'ยังไม่มีโครงการที่ active'}</p>
        </div>
      )}

      {/* Project list */}
      {!loading && !error && filtered.length > 0 && (
        <ul className="space-y-2">
          {filtered.map(p => (
            <li key={p.id}>
              <Link
                href={`/reports/new?projectId=${p.id}`}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-blue-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {(p as any).province?.name && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={11} />
                        {(p as any).province.name}
                      </span>
                    )}
                    {p.contract_number && (
                      <span className="text-xs text-gray-400">สัญญา: {p.contract_number}</span>
                    )}
                    {p.end_date && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={11} />
                        สิ้นสุด {formatDate(p.end_date)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Count */}
      {!loading && !error && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-4">
          แสดง {filtered.length} โครงการ
        </p>
      )}
    </div>
  );
}
