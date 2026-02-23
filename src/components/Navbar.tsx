'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Building2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  HardHat,
  LayoutDashboard,
  Menu,
  Shield,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string; icon: React.ElementType }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'แดชบอร์ด',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'รายงานประจำวัน',
    icon: ClipboardList,
    children: [
      { label: 'เลือกโครงการ / เขียนรายงาน', href: '/reports/projects', icon: FileText },
    ],
  },
  {
    label: 'ARC ตรวจสอบแบบ',
    href: '/arc',
    icon: Building2,
  },
  {
    label: 'ผู้ดูแลระบบ',
    icon: Shield,
    children: [
      { label: 'อนุมัติรายงาน', href: '/admin/approval', icon: CheckSquare },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // Auto-expand the group that contains the current page
    const set = new Set<string>();
    NAV_ITEMS.forEach(item => {
      if (item.children?.some(c => pathname.startsWith(c.href))) {
        set.add(item.label);
      }
    });
    return set;
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* ── Top Bar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-blue-700 text-base">
            <HardHat size={22} />
            <span className="hidden sm:inline">ระบบควบคุมงานก่อสร้าง</span>
            <span className="sm:hidden">SiteControl</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              ) : (
                <DesktopDropdown
                  key={item.label}
                  item={item}
                  isActive={!!item.children?.some(c => isActive(c.href))}
                  pathname={pathname}
                />
              )
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setOpen(p => !p)}
            aria-label="เมนู"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ─────────────────────────────────────────── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <nav
            className="absolute top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-lg max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <ul className="p-2 space-y-0.5">
              {NAV_ITEMS.map(item =>
                item.href ? (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  </li>
                ) : (
                  <li key={item.label}>
                    <button
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => toggleGroup(item.label)}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon size={16} />
                        {item.label}
                      </span>
                      {expandedGroups.has(item.label)
                        ? <ChevronDown size={14} />
                        : <ChevronRight size={14} />}
                    </button>
                    {expandedGroups.has(item.label) && (
                      <ul className="ml-8 mt-0.5 space-y-0.5">
                        {item.children?.map(child => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setOpen(false)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive(child.href)
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <child.icon size={14} />
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}

// ── Desktop Dropdown ───────────────────────────────────────────────────────

function DesktopDropdown({
  item,
  isActive,
  pathname,
}: {
  item: NavItem;
  isActive: boolean;
  pathname: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <item.icon size={15} />
        {item.label}
        <ChevronDown size={13} className={`transition-transform ${show ? 'rotate-180' : ''}`} />
      </button>
      {show && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg min-w-48 py-1 z-50">
          {item.children?.map(child => (
            <Link
              key={child.href}
              href={child.href}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                pathname.startsWith(child.href)
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <child.icon size={14} className="text-gray-400" />
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
