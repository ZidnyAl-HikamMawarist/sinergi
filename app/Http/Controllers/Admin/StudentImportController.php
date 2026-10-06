<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\ImportBatch;
use App\Models\ImportBatchRow;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\StudentEnrollment;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StudentImportController extends Controller
{
    public function index(): Response
    {
        $batches = ImportBatch::with('uploader')
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Admin/Import', [
            'batches' => $batches,
        ]);
    }

    public function show(ImportBatch $batch): Response
    {
        $batch->load('uploader');
        $rows = ImportBatchRow::where('import_batch_id', $batch->id)
            ->orderBy('row_number')
            ->paginate(50);

        return Inertia::render('Admin/ImportDetail', [
            'batch' => $batch,
            'rows' => $rows,
        ]);
    }

    public function preview(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ], [
            'file.required' => 'File CSV wajib diunggah.',
            'file.mimes' => 'Format file harus berupa CSV.',
        ]);

        $file = $request->file('file');
        $filename = $file->getClientOriginalName();
        $path = $file->getRealPath();

        $handle = fopen($path, 'r');
        if (!$handle) {
            return back()->with('error', 'Gagal membuka berkas CSV.');
        }

        $header = fgetcsv($handle, 1000, ',');
        if (!$header) {
            fclose($handle);
            return back()->with('error', 'Format berkas CSV kosong atau tidak valid.');
        }

        // Clean headers: lowercase and trim BOM
        $cleanHeader = array_map(function ($col) {
            return strtolower(trim(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $col)));
        }, $header);

        // Required columns: nisn, nama (or name)
        $nisnIdx = array_search('nisn', $cleanHeader);
        $nameIdx = array_search('nama', $cleanHeader);
        if ($nameIdx === false) $nameIdx = array_search('name', $cleanHeader);
        $classIdx = array_search('kelas', $cleanHeader);
        if ($classIdx === false) $classIdx = array_search('class', $cleanHeader);
        $emailIdx = array_search('email', $cleanHeader);

        if ($nisnIdx === false || $nameIdx === false) {
            fclose($handle);
            return back()->with('error', 'Kolom wajib "nisn" dan "nama" tidak ditemukan pada baris judul CSV.');
        }

        $activeYear = AcademicYear::active();

        $batch = ImportBatch::create([
            'academic_year_id' => $activeYear?->id,
            'uploaded_by' => auth()->id(),
            'filename' => $filename,
            'status' => 'preview',
        ]);

        $rowNumber = 1;
        $newCount = 0;
        $updatedCount = 0;
        $errorCount = 0;
        $seenNisns = [];

        while (($row = fgetcsv($handle, 1000, ',')) !== false) {
            $rowNumber++;
            if (empty(array_filter($row))) continue; // Skip empty rows

            $nisn = trim($row[$nisnIdx] ?? '');
            $name = trim($row[$nameIdx] ?? '');
            $className = $classIdx !== false ? trim($row[$classIdx] ?? '') : '';
            $email = $emailIdx !== false ? trim($row[$emailIdx] ?? '') : '';

            $payload = [
                'nisn' => $nisn,
                'name' => $name,
                'class' => $className,
                'email' => $email,
            ];

            $action = 'new';
            $errorMessage = null;

            if (empty($nisn) || empty($name)) {
                $action = 'error';
                $errorMessage = 'NISN dan Nama siswa tidak boleh kosong.';
                $errorCount++;
            } elseif (in_array($nisn, $seenNisns)) {
                $action = 'error';
                $errorMessage = "NISN {$nisn} terduplikasi di dalam berkas CSV ini.";
                $errorCount++;
            } else {
                $seenNisns[] = $nisn;
                $exists = User::where('nisn', $nisn)->exists();
                if ($exists) {
                    $action = 'update';
                    $updatedCount++;
                } else {
                    $action = 'new';
                    $newCount++;
                }
            }

            ImportBatchRow::create([
                'import_batch_id' => $batch->id,
                'row_number' => $rowNumber,
                'payload' => $payload,
                'action' => $action,
                'error_message' => $errorMessage,
            ]);
        }

        fclose($handle);

        $batch->update([
            'total_rows' => $newCount + $updatedCount + $errorCount,
            'new_rows' => $newCount,
            'updated_rows' => $updatedCount,
            'error_rows' => $errorCount,
        ]);

        return redirect()->route('admin.import.show', $batch->uuid)
            ->with('success', "Pratinjau import siap. {$newCount} data baru, {$updatedCount} pembaruan, {$errorCount} bermasalah.");
    }

    public function commit(ImportBatch $batch): RedirectResponse
    {
        if ($batch->status !== 'preview') {
            return back()->with('warning', 'Batch ini sudah pernah diproses atau dibatalkan.');
        }

        $activeYear = AcademicYear::active();
        if (!$activeYear) {
            return back()->with('error', 'Tidak ada tahun ajaran aktif.');
        }

        $siswaRole = Role::firstOrCreate(['name' => 'siswa'], ['label' => 'Siswa']);
        $credentials = [];

        DB::transaction(function () use ($batch, $activeYear, $siswaRole, &$credentials) {
            $rows = ImportBatchRow::where('import_batch_id', $batch->id)
                ->whereIn('action', ['new', 'update'])
                ->get();

            foreach ($rows as $row) {
                $payload = $row->payload;
                $nisn = $payload['nisn'];
                $name = $payload['name'];
                $className = $payload['class'] ?? '';
                $email = !empty($payload['email']) ? $payload['email'] : null;

                $user = User::where('nisn', $nisn)->first();

                if (!$user) {
                    // Generate random initial password (PRD 7.A)
                    $rawPassword = Str::random(10);
                    $user = User::create([
                        'name' => $name,
                        'nisn' => $nisn,
                        'email' => $email,
                        'password' => Hash::make($rawPassword),
                        'status' => 'aktif',
                        'must_change_password' => true,
                    ]);

                    StudentProfile::create([
                        'user_id' => $user->id,
                        'entry_year' => (int) date('Y'),
                    ]);

                    $credentials[] = [
                        'nisn' => $nisn,
                        'nama' => $name,
                        'password_awal' => $rawPassword,
                    ];
                } else {
                    $user->update([
                        'name' => $name,
                        'email' => $email ?: $user->email,
                    ]);
                }

                // Attach siswa role
                $user->roles()->syncWithoutDetaching([
                    $siswaRole->id => ['academic_year_id' => $activeYear->id],
                ]);

                // Class enrollment if class specified
                if (!empty($className)) {
                    $classMeta = $this->parseClassMetadata($className);
                    $class = SchoolClass::firstOrCreate(
                        ['academic_year_id' => $activeYear->id, 'name' => $className],
                        ['major' => $classMeta['major'], 'grade_level' => $classMeta['grade_level']]
                    );

                    StudentEnrollment::updateOrCreate(
                        ['user_id' => $user->id, 'academic_year_id' => $activeYear->id],
                        ['class_id' => $class->id]
                    );
                }
            }

            // Save credentials CSV for one-time download
            if (!empty($credentials)) {
                $credCsv = "NISN,Nama,Password_Awal\n";
                foreach ($credentials as $c) {
                    $credCsv .= "\"{$c['nisn']}\",\"{$c['nama']}\",\"{$c['password_awal']}\"\n";
                }
                $credPath = "credentials/batch_{$batch->uuid}.csv";
                Storage::put($credPath, $credCsv);
                $batch->credentials_path = $credPath;
            }

            $batch->status = 'committed';
            $batch->committed_at = now();
            $batch->save();
        });

        AuditLog::record(
            action: 'commit_student_import',
            entityType: 'ImportBatch',
            entityId: $batch->id,
            userId: auth()->id()
        );

        return redirect()->route('admin.import.show', $batch->uuid)
            ->with('success', 'Data siswa berhasil disimpan ke sistem! Silakan unduh berkas kredensial.');
    }

    public function downloadCredentials(ImportBatch $batch): BinaryFileResponse|RedirectResponse
    {
        if (empty($batch->credentials_path) || !Storage::exists($batch->credentials_path)) {
            return back()->with('error', 'Berkas kredensial tidak ditemukan atau telah kedaluwarsa.');
        }

        // AC-B4 & SEC-09: Atomic conditional update prevents race condition on one-time credential download
        $affected = ImportBatch::where('id', $batch->id)
            ->whereNull('credentials_downloaded_at')
            ->update(['credentials_downloaded_at' => now()]);

        if ($affected === 0) {
            return back()->with('warning', 'Kredensial awal hanya dapat diunduh sekali demi keamanan data.');
        }

        return response()->download(
            Storage::path($batch->credentials_path),
            "kredensial_awal_siswa_{$batch->created_at->format('Ymd')}.csv"
        );
    }

    /**
     * Intelligently parses class name to extract grade level and major.
     * Examples: 'XII RPL 1' -> [12, 'RPL'], 'X MIPA 2' -> [10, 'MIPA'], 'XI-TKJ-3' -> [11, 'TKJ']
     */
    protected function parseClassMetadata(string $className): array
    {
        $className = trim($className);
        $gradeLevel = 10;
        $major = 'Umum';

        // Detect grade level: XII (12), XI (11), X (10), or numeric (10, 11, 12, 7, 8, 9)
        if (preg_match('/^(XII|12)[\s\-\._]/i', $className) || preg_match('/^(XII|12)$/i', $className)) {
            $gradeLevel = 12;
        } elseif (preg_match('/^(XI|11)[\s\-\._]/i', $className) || preg_match('/^(XI|11)$/i', $className)) {
            $gradeLevel = 11;
        } elseif (preg_match('/^(X|10)[\s\-\._]/i', $className) || preg_match('/^(X|10)$/i', $className)) {
            $gradeLevel = 10;
        } elseif (preg_match('/^([7-9])[\s\-\._]?/i', $className, $m)) {
            $gradeLevel = (int) $m[1];
        }

        // Recognized vocational & general school majors
        $knownMajors = [
            'RPL', 'TKJ', 'MM', 'DKV', 'AKL', 'OTKP', 'BDP', 'TB', 'TBSM', 'TKR',
            'TPM', 'TITL', 'MIPA', 'IPA', 'IPS', 'BAHASA', 'SIJA', 'ANIMASI'
        ];

        foreach ($knownMajors as $km) {
            if (preg_match('/(?:^|[\s\-\._])' . preg_quote($km, '/') . '(?:[\s\-\._0-9]|$)/i', $className)) {
                $major = $km;
                break;
            }
        }

        // If still 'Umum', attempt to extract middle token (e.g. 'XII ABC 1' -> 'ABC')
        if ($major === 'Umum') {
            $tokens = preg_split('/[\s\-\._]+/', $className);
            if (count($tokens) >= 2 && !is_numeric($tokens[1])) {
                $candidate = strtoupper($tokens[1]);
                if (strlen($candidate) >= 2 && strlen($candidate) <= 10) {
                    $major = $candidate;
                }
            }
        }

        return [
            'grade_level' => $gradeLevel,
            'major' => $major,
        ];
    }
}
