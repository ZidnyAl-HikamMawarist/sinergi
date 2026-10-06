import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Sparkles,
    LayoutDashboard,
    Users,
    Calendar,
    QrCode,
    BookOpen,
    Shield,
    FileSpreadsheet,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Building2,
    CheckCircle2,
    ScanLine,
    ArrowLeftRight,
    UserCheck,
    CreditCard
} from 'lucide-react';
import FlashMessage from '@/Components/FlashMessage';
import Badge from '@/Components/Badge';

export default function AppLayout({
    title = '',
    header = null,
    subtitle = null,
    actions = null,
    children,
}) {
    const { auth, activeAcademicYear } = usePage().props;
    const user = auth?.user;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    // Determine current workspace based on route
    const currentUrl = window.location.pathname;
    let workspace = 'portal';
    if (currentUrl.startsWith('/admin')) workspace = 'admin';
    else if (currentUrl.startsWith('/kas')) workspace = 'kas';
    else if (currentUrl.startsWith('/eskul')) workspace = 'eskul';

    // Navigation links per workspace
    const navItems = {
        admin: [
            { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
            { name: 'Eskul & Pembina', href: '/admin/eskul', icon: Building2 },
            { name: 'Siswa & Kelas', href: '/admin/students', icon: Users },
            { name: 'Rekap Presensi', href: '/admin/presensi/rekap', icon: CheckCircle2 },
            { name: 'Buku Kas (Audit)', href: '/kas/dashboard', icon: BookOpen },
            { name: 'Import Data', href: '/admin/import', icon: FileSpreadsheet },
            { name: 'Audit Log', href: '/admin/audit-logs', icon: Shield },
        ],
        kas: [
            { name: 'Buku Kas', href: '/kas/dashboard', icon: BookOpen },
            { name: 'Laporan Kas', href: '/kas/laporan', icon: FileSpreadsheet },
            { name: 'Kategori Kas', href: '/kas/kategori', icon: CreditCard },
        ],
        eskul: [
            { name: 'Dashboard Eskul', href: '/eskul/dashboard', icon: LayoutDashboard },
            { name: 'Sesi Kegiatan', href: '/eskul/sessions', icon: Calendar },
            { name: 'Scanner QR', href: '/eskul/scanner', icon: ScanLine },
            { name: 'Anggota Eskul', href: '/eskul/members', icon: Users },
            { name: 'Rekap Kehadiran', href: '/eskul/rekap', icon: CheckCircle2 },
        ],
        portal: [
            { name: 'ID Digital QR', href: '/portal/dashboard', icon: QrCode },
            { name: 'Histori Presensi', href: '/portal/presensi', icon: CheckCircle2 },
            { name: 'Eskul Saya', href: '/portal/eskul', icon: Building2 },
        ],
    };

    const currentNav = navItems[workspace] || navItems.portal;

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
            <Head title={title ? `${title} — SINERGI` : 'SINERGI'} />

            {/* Topbar */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Brand & Mobile Hamburger */}
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
                            >
                                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>

                            <Link href="/" className="flex items-center space-x-2.5">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
                                    SINERGI
                                </span>
                            </Link>

                            {/* Active Academic Year Pill */}
                            {activeAcademicYear && (
                                <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                                    Th. Ajaran: {activeAcademicYear.name}
                                </span>
                            )}
                        </div>

                        {/* Topbar Right Actions */}
                        <div className="flex items-center space-x-3">
                            {/* Workspace Switcher Button */}
                            {user && user.roles && user.roles.length > 1 && (
                                <Link
                                    href="/workspace/select"
                                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                >
                                    <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                                    Ganti Workspace
                                </Link>
                            )}

                            {/* User Profile Menu */}
                            {user && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 text-left transition-colors focus:outline-none"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="hidden sm:block">
                                            <div className="text-xs font-bold text-slate-800 leading-tight">
                                                {user.name}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium">
                                                {user.roles?.[0]?.label || 'Pengguna'}
                                            </div>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </button>

                                    {profileOpen && (
                                        <div
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-fade-in"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <div className="px-4 py-2 border-b border-slate-100">
                                                <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                                                <p className="text-[11px] text-slate-500 truncate">{user.email || user.nisn}</p>
                                            </div>

                                            <Link
                                                href="/workspace/select"
                                                className="w-full flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                                            >
                                                <ArrowLeftRight className="w-4 h-4 mr-2 text-slate-400" />
                                                Pilih Workspace
                                            </Link>

                                            <Link
                                                href="/password/change"
                                                className="w-full flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                                            >
                                                <Shield className="w-4 h-4 mr-2 text-slate-400" />
                                                Ganti Kata Sandi
                                            </Link>

                                            <div className="border-t border-slate-100 my-1"></div>

                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4 mr-2 text-rose-500" />
                                                Keluar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Layout Body */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col lg:flex-row gap-6">
                {/* Desktop Sidebar Navigation */}
                <aside className="hidden lg:block w-64 shrink-0">
                    <nav className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-1 sticky top-22">
                        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Menu {workspace === 'admin' ? 'Admin OSIS' : workspace === 'kas' ? 'Buku Kas' : workspace === 'eskul' ? 'Eskul' : 'Portal Siswa'}
                        </div>

                        {currentNav.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentUrl === item.href || currentUrl.startsWith(item.href + '/');

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 shadow-xs'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon
                                        className={`w-4 h-4 mr-3 ${
                                            isActive ? 'text-blue-600' : 'text-slate-400'
                                        }`}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Mobile Drawer */}
                {mobileOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 flex">
                        <div
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
                            onClick={() => setMobileOpen(false)}
                        ></div>

                        <div className="relative w-72 bg-white h-full shadow-2xl p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <span className="font-extrabold text-slate-900">SINERGI</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setMobileOpen(false)}
                                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mt-4 space-y-1">
                                    {currentNav.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = currentUrl === item.href;

                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                className={`flex items-center px-3.5 py-3 rounded-xl text-sm font-semibold ${
                                                    isActive
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                <Icon className="w-5 h-5 mr-3 text-blue-600" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Keluar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">
                    {/* Page Header */}
                    {(header || subtitle || actions) && (
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                {header && (
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        {header}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className="mt-1 text-sm text-slate-500 font-medium">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                            {actions && <div className="flex items-center gap-2">{actions}</div>}
                        </div>
                    )}

                    {/* Global Flash Messages */}
                    <FlashMessage />

                    {/* Content Slot */}
                    {children}
                </main>
            </div>

            {/* Footer */}
            <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-400">
                <p>&copy; {new Date().getFullYear()} SINERGI — Sistem Integrasi Ekstrakurikuler dan Organisasi</p>
            </footer>
        </div>
    );
}
