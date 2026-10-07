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
        <div className="min-h-screen bg-[#F6F8FB] flex flex-col text-[#17202A] selection:bg-[#1769AA] selection:text-white">
            <Head title={title ? `${title} — SINERGI` : 'SINERGI'} />

            {/* Topbar */}
            <header className="sticky top-0 z-40 bg-white border-b border-[#D7E0E8] shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-15">
                        {/* Brand & Mobile Hamburger */}
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="lg:hidden p-1.5 rounded-md text-[#718096] hover:text-[#17202A] hover:bg-[#F3F8FC] focus:outline-none"
                                aria-label="Buka navigasi"
                            >
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>

                            <Link href="/" className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-md bg-[#123B5D] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                                    <Building2 className="w-4.5 h-4.5" />
                                </div>
                                <span className="text-lg font-extrabold tracking-tight text-[#123B5D]">
                                    SINERGI
                                </span>
                            </Link>

                            {/* Active Academic Year Pill */}
                            {activeAcademicYear && (
                                <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#E8F2FA] text-[#123B5D] border border-[#1769AA]/20">
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
                                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-white hover:bg-[#F3F8FC] text-[#17202A] border border-[#D7E0E8] transition-colors shadow-xs"
                                >
                                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#1769AA]" />
                                    Ganti Workspace
                                </Link>
                            )}

                            {/* User Profile Menu */}
                            {user && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-[#F3F8FC] text-left transition-colors focus:outline-none focus:ring-1 focus:ring-[#1769AA]"
                                    >
                                        <div className="w-7 h-7 rounded-md bg-[#123B5D] text-white font-bold text-xs flex items-center justify-center">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="hidden sm:block">
                                            <div className="text-xs font-bold text-[#17202A] leading-tight">
                                                {user.name}
                                            </div>
                                            <div className="text-[10px] text-[#718096] font-medium">
                                                {user.roles?.[0]?.label || 'Pengguna'}
                                            </div>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-[#718096]" />
                                    </button>

                                    {profileOpen && (
                                        <div
                                            className="absolute right-0 mt-1.5 w-52 bg-white rounded-md shadow-md border border-[#D7E0E8] py-1 z-50"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <div className="px-3.5 py-2 border-b border-[#D7E0E8]">
                                                <p className="text-xs font-bold text-[#17202A] truncate">{user.name}</p>
                                                <p className="text-[11px] text-[#718096] truncate">{user.email || user.nisn}</p>
                                            </div>

                                            <Link
                                                href="/workspace/select"
                                                className="w-full flex items-center px-3.5 py-2 text-xs text-[#465362] hover:bg-[#F3F8FC] hover:text-[#17202A] transition-colors"
                                            >
                                                <ArrowLeftRight className="w-3.5 h-3.5 mr-2 text-[#718096]" />
                                                Pilih Workspace
                                            </Link>

                                            <Link
                                                href="/password/change"
                                                className="w-full flex items-center px-3.5 py-2 text-xs text-[#465362] hover:bg-[#F3F8FC] hover:text-[#17202A] transition-colors"
                                            >
                                                <Shield className="w-3.5 h-3.5 mr-2 text-[#718096]" />
                                                Ganti Kata Sandi
                                            </Link>

                                            <div className="border-t border-[#D7E0E8] my-1"></div>

                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-3.5 py-2 text-xs text-[#C24141] hover:bg-[#FDF2F2] transition-colors font-medium"
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
                    <nav className="bg-white rounded-lg border border-[#D7E0E8] p-2.5 shadow-xs space-y-1 sticky top-20">
                        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#718096]">
                            Menu {workspace === 'admin' ? 'Admin OSIS' : workspace === 'kas' ? 'Buku Kas' : workspace === 'eskul' ? 'Eskul' : 'Portal Siswa'}
                        </div>

                        {currentNav.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentUrl === item.href || (item.href !== '/' && currentUrl.startsWith(item.href + '/'));

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-3 py-2 text-xs transition-colors ${
                                        isActive
                                            ? 'bg-[#E8F2FA] text-[#123B5D] font-bold border-l-4 border-l-[#1769AA] rounded-r-md rounded-l-none'
                                            : 'text-[#465362] hover:bg-[#F3F8FC] hover:text-[#123B5D] rounded-md font-medium'
                                    }`}
                                >
                                    <Icon
                                        className={`w-4 h-4 mr-2.5 shrink-0 ${
                                            isActive ? 'text-[#1769AA]' : 'text-[#718096]'
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
                            className="fixed inset-0 bg-[#17202A]/40 transition-opacity"
                            onClick={() => setMobileOpen(false)}
                            aria-hidden="true"
                        ></div>

                        <div className="relative w-72 bg-white h-full shadow-lg p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between pb-3.5 border-b border-[#D7E0E8]">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-7 h-7 rounded-md bg-[#123B5D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <span className="font-extrabold text-[#123B5D]">SINERGI</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setMobileOpen(false)}
                                        className="p-1 rounded-md text-[#718096] hover:text-[#17202A]"
                                        aria-label="Tutup navigasi"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mt-3 space-y-1">
                                    {currentNav.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = currentUrl === item.href;

                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                className={`flex items-center px-3 py-2 text-xs rounded-md transition-colors ${
                                                    isActive
                                                        ? 'bg-[#E8F2FA] text-[#123B5D] font-bold border-l-4 border-l-[#1769AA]'
                                                        : 'text-[#465362] hover:bg-[#F3F8FC] font-medium'
                                                }`}
                                            >
                                                <Icon className={`w-4 h-4 mr-2.5 ${isActive ? 'text-[#1769AA]' : 'text-[#718096]'}`} />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-3.5 border-t border-[#D7E0E8]">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-3 py-2 text-xs font-semibold text-[#C24141] hover:bg-[#FDF2F2] rounded-md transition-colors"
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
                        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#D7E0E8]">
                            <div>
                                {header && (
                                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#17202A] tracking-tight">
                                        {header}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className="mt-0.5 text-xs sm:text-sm text-[#718096]">
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
            <footer className="mt-auto border-t border-[#D7E0E8] bg-white py-3.5 text-center text-xs text-[#718096]">
                <p>&copy; {new Date().getFullYear()} SINERGI — Sistem Integrasi Ekstrakurikuler dan Organisasi</p>
            </footer>
        </div>
    );
}
