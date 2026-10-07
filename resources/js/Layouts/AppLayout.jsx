import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
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
    CreditCard
} from 'lucide-react';
import FlashMessage from '@/Components/FlashMessage';

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
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';
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
        <div className="min-h-screen bg-[#F7F5F0] flex flex-col text-[#17212B] selection:bg-[#1F4E79] selection:text-white">
            <Head title={title ? `${title} — SINERGI` : 'SINERGI'} />

            {/* Topbar */}
            <header className="sticky top-0 z-40 bg-white border-b border-[#D9DEE3] shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-15">
                        {/* Brand & Mobile Hamburger */}
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="lg:hidden p-1.5 rounded-md text-[#737D86] hover:text-[#17212B] hover:bg-[#F7F5F0] focus:outline-none"
                                aria-label="Buka navigasi"
                            >
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>

                            <Link href="/" className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-md bg-[#1F4E79] flex items-center justify-center text-white font-bold text-sm">
                                    <Building2 className="w-4.5 h-4.5" />
                                </div>
                                <span className="text-lg font-bold tracking-tight text-[#17212B]">
                                    SINERGI
                                </span>
                            </Link>

                            {/* Active Academic Year Pill */}
                            {activeAcademicYear && (
                                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#EAF2F8] text-[#1F4E79] border border-[#cee0f0]">
                                    Th. Ajaran: {activeAcademicYear.name}
                                </span>
                            )}
                        </div>

                        {/* Topbar Right Actions */}
                        <div className="flex items-center space-x-2.5">
                            {/* Workspace Switcher Button */}
                            {user && user.roles && user.roles.length > 1 && (
                                <Link
                                    href="/workspace/select"
                                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-[#F7F5F0] hover:bg-[#EAF2F8] text-[#17212B] border border-[#D9DEE3] transition-colors"
                                >
                                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#1F4E79]" />
                                    Ganti Workspace
                                </Link>
                            )}

                            {/* User Profile Menu */}
                            {user && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center space-x-2 p-1 rounded-md hover:bg-[#F7F5F0] text-left transition-colors focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
                                    >
                                        <div className="w-7 h-7 rounded-md bg-[#1F4E79] text-white font-semibold text-xs flex items-center justify-center">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="hidden sm:block">
                                            <div className="text-xs font-semibold text-[#17212B] leading-tight">
                                                {user.name}
                                            </div>
                                            <div className="text-[10px] text-[#737D86]">
                                                {user.roles?.[0]?.label || 'Pengguna'}
                                            </div>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-[#737D86]" />
                                    </button>

                                    {profileOpen && (
                                        <div
                                            className="absolute right-0 mt-1.5 w-52 bg-white rounded-md shadow-md border border-[#D9DEE3] py-1 z-50"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <div className="px-3.5 py-2 border-b border-[#D9DEE3]">
                                                <p className="text-xs font-semibold text-[#17212B] truncate">{user.name}</p>
                                                <p className="text-[11px] text-[#737D86] truncate">{user.email || user.nisn}</p>
                                            </div>

                                            <Link
                                                href="/workspace/select"
                                                className="w-full flex items-center px-3.5 py-2 text-xs text-[#46515C] hover:bg-[#F7F5F0] hover:text-[#17212B]"
                                            >
                                                <ArrowLeftRight className="w-3.5 h-3.5 mr-2 text-[#737D86]" />
                                                Pilih Workspace
                                            </Link>

                                            <Link
                                                href="/password/change"
                                                className="w-full flex items-center px-3.5 py-2 text-xs text-[#46515C] hover:bg-[#F7F5F0] hover:text-[#17212B]"
                                            >
                                                <Shield className="w-3.5 h-3.5 mr-2 text-[#737D86]" />
                                                Ganti Kata Sandi
                                            </Link>

                                            <div className="border-t border-[#D9DEE3] my-1"></div>

                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-3.5 py-2 text-xs text-[#C24141] hover:bg-[#FDF2F2] transition-colors"
                                            >
                                                <LogOut className="w-3.5 h-3.5 mr-2" />
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
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col lg:flex-row gap-5">
                {/* Desktop Sidebar Navigation */}
                <aside className="hidden lg:block w-60 shrink-0">
                    <nav className="bg-white rounded-lg border border-[#D9DEE3] p-2 shadow-xs space-y-0.5 sticky top-20">
                        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#737D86]">
                            Menu {workspace === 'admin' ? 'Admin OSIS' : workspace === 'kas' ? 'Buku Kas' : workspace === 'eskul' ? 'Eskul' : 'Portal Siswa'}
                        </div>

                        {currentNav.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentUrl === item.href || (item.href !== '/' && currentUrl.startsWith(item.href + '/'));

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-3 py-2 text-xs font-medium transition-colors ${
                                        isActive
                                            ? 'bg-[#EAF2F8] text-[#1F4E79] font-semibold border-l-2 border-l-[#1F4E79] rounded-r-md rounded-l-none'
                                            : 'text-[#46515C] hover:bg-[#F7F5F0] hover:text-[#17212B] rounded-md'
                                    }`}
                                >
                                    <Icon
                                        className={`w-4 h-4 mr-2.5 shrink-0 ${
                                            isActive ? 'text-[#1F4E79]' : 'text-[#737D86]'
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
                            className="fixed inset-0 bg-[#17212B]/40 transition-opacity"
                            onClick={() => setMobileOpen(false)}
                            aria-hidden="true"
                        ></div>

                        <div className="relative w-72 bg-white h-full shadow-lg p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between pb-3.5 border-b border-[#D9DEE3]">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-7 h-7 rounded-md bg-[#1F4E79] text-white flex items-center justify-center font-bold text-xs">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-[#17212B]">SINERGI</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setMobileOpen(false)}
                                        className="p-1 rounded-md text-[#737D86] hover:text-[#17212B]"
                                        aria-label="Tutup navigasi"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mt-3 space-y-0.5">
                                    {currentNav.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = currentUrl === item.href;

                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                className={`flex items-center px-3 py-2 text-xs font-medium rounded-md ${
                                                    isActive
                                                        ? 'bg-[#EAF2F8] text-[#1F4E79] font-semibold'
                                                        : 'text-[#46515C] hover:bg-[#F7F5F0]'
                                                }`}
                                            >
                                                <Icon className={`w-4 h-4 mr-2.5 ${isActive ? 'text-[#1F4E79]' : 'text-[#737D86]'}`} />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-3.5 border-t border-[#D9DEE3]">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-3 py-2 text-xs font-medium text-[#C24141] hover:bg-[#FDF2F2] rounded-md"
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
                        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#D9DEE3]">
                            <div>
                                {header && (
                                    <h1 className="text-xl sm:text-2xl font-bold text-[#17212B] tracking-tight">
                                        {header}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className="mt-0.5 text-xs sm:text-sm text-[#737D86]">
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
            <footer className="mt-auto border-t border-[#D9DEE3] bg-white py-3 text-center text-xs text-[#737D86]">
                <p>&copy; {new Date().getFullYear()} SINERGI — Sistem Integrasi Ekstrakurikuler dan Organisasi</p>
            </footer>
        </div>
    );
}
