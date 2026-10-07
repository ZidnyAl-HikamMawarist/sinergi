<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Eskul\ActivitySessionController;
use App\Http\Controllers\Eskul\AttendanceController;
use App\Http\Controllers\Eskul\EskulDashboardController;
use App\Http\Controllers\Kas\CashTransactionController;
use App\Http\Controllers\Kas\KasDashboardController;
use App\Http\Controllers\Portal\PortalDashboardController;
use App\Http\Controllers\WorkspaceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Homepage & Authentication
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'appName' => config('app.name', 'SINERGI'),
        'version' => '1.0 MVP',
    ]);
})->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Mandatory initial password change
    Route::get('/password/change', [AuthController::class, 'showChangePassword'])->name('password.change');
    Route::post('/password/change', [AuthController::class, 'updatePassword'])->name('password.update');

    // Multi-role workspace selection
    Route::get('/workspace/select', [WorkspaceController::class, 'select'])->name('workspace.select');

    // 1. Student Portal Workspace
    Route::prefix('portal')->name('portal.')->middleware('role:siswa,admin,super_admin')->group(function () {
        Route::get('/dashboard', [PortalDashboardController::class, 'index'])->name('dashboard');
        Route::get('/qr-token', [PortalDashboardController::class, 'getFreshQrToken'])->name('qr.token');
        Route::get('/presensi', [PortalDashboardController::class, 'index'])->name('presensi');
        Route::get('/eskul', [PortalDashboardController::class, 'index'])->name('eskul');
    });

    // 2. Extracurricular Workspace
    Route::prefix('eskul')->name('eskul.')->middleware('role:pengurus_eskul,admin,super_admin')->group(function () {
        Route::get('/dashboard', [EskulDashboardController::class, 'index'])->name('dashboard');
        Route::post('/sessions', [ActivitySessionController::class, 'store'])->name('sessions.store');
        Route::post('/sessions/{session}/close', [AttendanceController::class, 'closeSession'])->name('sessions.close');
        Route::get('/scanner', [AttendanceController::class, 'showScanner'])->name('scanner');
        Route::post('/attendance/scan', [AttendanceController::class, 'scan'])->name('attendance.scan');
        Route::post('/attendance/manual', [AttendanceController::class, 'manual'])->name('attendance.manual');
        Route::get('/rekap', [\App\Http\Controllers\Eskul\AttendanceRecapController::class, 'index'])->name('rekap');
        Route::get('/rekap/export', [\App\Http\Controllers\Eskul\AttendanceRecapController::class, 'exportCsv'])->name('rekap.export');
        Route::get('/sessions', [EskulDashboardController::class, 'index'])->name('sessions.index');
        Route::get('/members', [\App\Http\Controllers\Eskul\AttendanceRecapController::class, 'index'])->name('members.index');
    });

    // 3. Cash Management (Buku Kas) Workspace
    Route::prefix('kas')->name('kas.')->middleware('role:bendahara,admin,super_admin')->group(function () {
        Route::get('/dashboard', [KasDashboardController::class, 'index'])->name('dashboard');
        Route::post('/transactions', [CashTransactionController::class, 'store'])->name('transactions.store');
        Route::post('/transactions/{uuid}/void', [CashTransactionController::class, 'void'])->name('transactions.void');
        Route::get('/transactions/{uuid}/proof', [CashTransactionController::class, 'showProof'])->name('transactions.proof');
        Route::get('/laporan', [KasDashboardController::class, 'index'])->name('laporan');
        Route::get('/kategori', [KasDashboardController::class, 'index'])->name('kategori');
    });

    // 4. Admin OSIS Workspace
    Route::prefix('admin')->name('admin.')->middleware('role:admin,super_admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/eskul', [\App\Http\Controllers\Admin\ExtracurricularController::class, 'index'])->name('eskul.index');
        Route::post('/eskul', [\App\Http\Controllers\Admin\ExtracurricularController::class, 'store'])->name('eskul.store');
        Route::put('/eskul/{eskul:uuid}', [\App\Http\Controllers\Admin\ExtracurricularController::class, 'update'])->name('eskul.update');
        Route::post('/eskul/{eskul:uuid}/members', [\App\Http\Controllers\Admin\ExtracurricularController::class, 'addMember'])->name('eskul.members.add');
        Route::delete('/eskul/{eskul:uuid}/members/{member}', [\App\Http\Controllers\Admin\ExtracurricularController::class, 'removeMember'])->name('eskul.members.remove');
        Route::get('/students', [\App\Http\Controllers\Admin\StudentController::class, 'index'])->name('students.index');
        Route::get('/presensi/rekap', [\App\Http\Controllers\Eskul\AttendanceRecapController::class, 'index'])->name('presensi.rekap');
        Route::get('/import', [\App\Http\Controllers\Admin\StudentImportController::class, 'index'])->name('import.index');
        Route::post('/import/preview', [\App\Http\Controllers\Admin\StudentImportController::class, 'preview'])->name('import.preview');
        Route::get('/import/{batch:uuid}', [\App\Http\Controllers\Admin\StudentImportController::class, 'show'])->name('import.show');
        Route::post('/import/{batch:uuid}/commit', [\App\Http\Controllers\Admin\StudentImportController::class, 'commit'])->name('import.commit');
        Route::get('/import/{batch:uuid}/credentials', [\App\Http\Controllers\Admin\StudentImportController::class, 'downloadCredentials'])->name('import.credentials');
        Route::get('/audit-logs', [\App\Http\Controllers\Admin\AuditLogController::class, 'index'])->name('audit-logs.index');
    });
});
