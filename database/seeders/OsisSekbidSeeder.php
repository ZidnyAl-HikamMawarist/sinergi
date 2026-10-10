<?php

namespace Database\Seeders;

use App\Models\OsisSekbid;
use Illuminate\Database\Seeder;

class OsisSekbidSeeder extends Seeder
{
    /**
     * Run the database seeds according to Permendiknas No. 39 Tahun 2008 tentang Pembinaan Kesiswaan.
     */
    public function run(): void
    {
        $sekbids = [
            [
                'number' => 1,
                'name' => 'Pembinaan Keimanan dan Ketakwaan terhadap Tuhan Yang Maha Esa',
                'short_title' => 'Keimanan & Ketakwaan (Sekbid 1)',
                'description' => 'Membina kehidupan beragama, memperdalam nilai-nilai spiritual, serta menumbuhkan kerukunan dan toleransi antarumat beragama di lingkungan sekolah.',
                'official_duties' => [
                    'Melaksanakan peribadatan sesuai dengan ketentuan agama masing-masing.',
                    'Memperingati hari-hari besar keagamaan nasional secara khidmat.',
                    'Melaksanakan kegiatan amaliah dan ibadah sosial sesuai norma agama.',
                    'Membina toleransi dan kerukunan antarumat beragama di lingkungan sekolah.',
                    'Mengembangkan dan memberdayakan kegiatan keagamaan sekolah.',
                    'Menyelenggarakan lomba dan festival yang bernuansa keagamaan.',
                ],
                'coordinating_eskuls' => [
                    'Kerohanian Islam (Rohis) / Remaja Masjid',
                    'Kerohanian Kristen (Rokris) / Katolik (Rokat)',
                    'Tahfidz Al-Qur\'an & Tilawah',
                    'Keluarga Mahasiswa/Siswa Beragama Hindu/Buddha',
                ],
            ],
            [
                'number' => 2,
                'name' => 'Pembinaan Budi Pekerti Luhur atau Akhlak Mulia',
                'short_title' => 'Budi Pekerti & Karakter (Sekbid 2)',
                'description' => 'Menegakkan kedisiplinan, tata krama, etika pergaulan, serta menumbuhkan budaya peduli, gotong royong, dan penerapan 7K di sekolah.',
                'official_duties' => [
                    'Melaksanakan tata tertib dan kultur sekolah secara konsisten.',
                    'Melaksanakan norma-norma kesopanan dan tatakrama pergaulan warga sekolah.',
                    'Menumbuhkembangkan kesadaran rela berkorban dan empati terhadap sesama.',
                    'Menumbuhkembangkan sikap hormat dan menghargai antarsesama dan guru.',
                    'Melaksanakan kegiatan 7K (Keamanan, Kebersihan, Ketertiban, Keindahan, Kekeluargaan, Kedamaian, dan Kerindangan).',
                    'Mengadakan aksi bakti sosial dan bantuan solidaritas kemanusiaan.',
                ],
                'coordinating_eskuls' => [
                    'Patroli Keamanan Sekolah (PKS)',
                    'Gerakan Disiplin Siswa (GDS)',
                    'Kader 7K & Kebersihan Sekolah',
                    'Satgas Karakter & Anti-Perundungan (Anti-Bullying)',
                ],
            ],
            [
                'number' => 3,
                'name' => 'Pembinaan Kepribadian Unggul, Wawasan Kebangsaan, dan Bela Negara',
                'short_title' => 'Wawasan Kebangsaan & Bela Negara (Sekbid 3)',
                'description' => 'Menanamkan jiwa patriotisme, penghormatan lambang negara, kepramukaan, serta pewarisan nilai perjuangan pahlawan bangsa.',
                'official_duties' => [
                    'Melaksanakan upacara bendera hari Senin dan peringatan hari besar nasional.',
                    'Menyanyikan lagu-lagu nasional (Mars dan Hymne) dengan penuh penghayatan.',
                    'Melaksanakan kegiatan kepramukaan sebagai wahana pembentukan karakter bangsa.',
                    'Mengunjungi dan mempelajari tempat-tempat bernilai sejarah kemerdekaan.',
                    'Mempelajari dan meneruskan nilai-nilai luhur kepeloporan dan perjuangan pahlawan.',
                    'Melaksanakan kegiatan kepemimpinan siswa dan pendidikan bela negara.',
                ],
                'coordinating_eskuls' => [
                    'Pasukan Pengibar Bendera (Paskibra)',
                    'Gerakan Pramuka (Gugus Depan Sekolah)',
                    'Korps Bela Negara & LDKS',
                ],
            ],
            [
                'number' => 4,
                'name' => 'Pembinaan Prestasi Akademik, Seni, dan/atau Olahraga sesuai Bakat dan Minat',
                'short_title' => 'Prestasi Akademik, Seni & Olahraga (Sekbid 4)',
                'description' => 'Mengembangkan bakat, minat, dan potensi keilmuan, kesenian, dan olahraga siswa guna meraih prestasi di tingkat regional hingga internasional.',
                'official_duties' => [
                    'Mengadakan lomba mata pelajaran, olimpiade sains, atau keahlian kejuruan.',
                    'Menyelenggarakan kegiatan ilmiah dan riset siswa.',
                    'Mengikuti seminar, workshop, dan diskusi ilmiah bernuansa IPTEK.',
                    'Mengadakan studi banding ke pusat ilmu pengetahuan dan sumber belajar.',
                    'Mengembangkan bakat dan daya cipta seni rupa, musik, vokal, dan tari.',
                    'Mengembangkan cabang olahraga prestasi dan menyelenggarakan turnamen antarkelas/sekolah.',
                ],
                'coordinating_eskuls' => [
                    'Kelompok Ilmiah Remaja (KIR) & Klub Olimpiade Sains (OSN)',
                    'Klub Olahraga Prestasi (Futsal, Basket, Voli, Bulutangkis)',
                    'Beladiri (Pencak Silat, Karate, Taekwondo)',
                    'Seni & Musik (Band, Paduan Suara, Tari Tradisional/Modern, Seni Musik)',
                ],
            ],
            [
                'number' => 5,
                'name' => 'Pembinaan Demokrasi, Hak Asasi Manusia, Pendidikan Politik, Lingkungan Hidup, Kepekaan dan Toleransi Sosial',
                'short_title' => 'Demokrasi, HAM & Lingkungan (Sekbid 5)',
                'description' => 'Mengembangkan kesadaran berorganisasi yang demokratis, kepedulian lingkungan hidup, penegakan HAM, serta toleransi dalam keragaman sosial.',
                'official_duties' => [
                    'Memantapkan peran dan fungsi siswa dalam kepengurusan organisasi kesiswaan.',
                    'Melaksanakan latihan kepemimpinan siswa (LKS/LDKS) secara berkala.',
                    'Membiasakan musyawarah mufakat, transparansi, dan akuntabilitas kepemimpinan.',
                    'Memupuk kepekaan sosial dan advokasi terhadap masyarakat sekitar.',
                    'Melaksanakan kegiatan pelestarian alam, penghijauan, dan pengurangan sampah plastik.',
                    'Menumbuhkan toleransi sosial dalam konteks masyarakat Indonesia yang majemuk.',
                ],
                'coordinating_eskuls' => [
                    'Majelis Perwakilan Kelas (MPK)',
                    'Pecinta Alam (Paspala / Sispala)',
                    'Kader Adiwiyata & Bank Sampah Sekolah',
                    'Forum Diskusi Demokrasi & Hak Asasi Siswa',
                ],
            ],
            [
                'number' => 6,
                'name' => 'Pembinaan Kreativitas, Keterampilan, dan Kewirausahaan',
                'short_title' => 'Kreativitas & Kewirausahaan (Sekbid 6)',
                'description' => 'Menumbuhkan jiwa mandiri, kemampuan vokasional, pengelolaan koperasi siswa, serta keterampilan menghasilkan produk inovatif bernilai ekonomi.',
                'official_duties' => [
                    'Meningkatkan kreativitas dan keterampilan menghasilkan produk berguna.',
                    'Mengembangkan keterampilan di bidang rekayasa terapan, boga, kerajinan, dan jasa.',
                    'Mengelola dan mengembangkan Koperasi Siswa (Kopsis) serta unit usaha mandiri.',
                    'Melaksanakan bazar kewirausahaan dan pameran karya siswa.',
                    'Menyelenggarakan pelatihan dasar bisnis, pemasaran kreatif, dan pembukuan sederhana.',
                ],
                'coordinating_eskuls' => [
                    'Koperasi Siswa (Kopsis) & Entrepreneur Club',
                    'Tata Boga & Kuliner Kreatif',
                    'Kriya Kreatif, Sablon & Kerajinan Tangan',
                    'Desain Produk & Merchandise Sekolah',
                ],
            ],
            [
                'number' => 7,
                'name' => 'Pembinaan Kualitas Jasmani, Kesehatan, dan Gizi Berbasis Sumber Gizi yang Terdiversifikasi',
                'short_title' => 'Kesehatan Jasmani & Gizi (Sekbid 7)',
                'description' => 'Menjaga kebugaran jasmani, mengoptimalkan layanan kesehatan sekolah, penyuluhan gizi seimbang, serta pencegahan bahaya narkoba dan zat adiktif.',
                'official_duties' => [
                    'Membina dan mengkampanyekan Perilaku Hidup Bersih dan Sehat (PHBS).',
                    'Melaksanakan dan mengoptimalkan fungsi Usaha Kesehatan Sekolah (UKS).',
                    'Meningkatkan pemahaman mengenai gizi seimbang dan sarapan sehat.',
                    'Melaksanakan pelatihan pertolongan pertama pada kecelakaan (P3K).',
                    'Melakukan pencegahan dan kampanye bahaya NAPZA, miras, rokok, dan HIV/AIDS.',
                    'Menggerakkan senam kebugaran jasmani berkala untuk seluruh siswa.',
                ],
                'coordinating_eskuls' => [
                    'Palang Merah Remaja (PMR)',
                    'Dokter Remaja / Tim UKS',
                    'Satgas Anti-Narkoba Pelajar (P4GN)',
                    'Komunitas Senam Kebugaran & Senam Pagi',
                ],
            ],
            [
                'number' => 8,
                'name' => 'Pembinaan Sastra dan Budaya',
                'short_title' => 'Sastra & Budaya (Sekbid 8)',
                'description' => 'Meningkatkan apresiasi sastra, kemampuan menulis fiksi dan non-fiksi, pelestarian seni tradisional, serta kebudayaan daerah dan nusantara.',
                'official_duties' => [
                    'Mengembangkan wawasan dan keterampilan siswa di bidang kesusastraan.',
                    'Menyelenggarakan festival sastra, lomba cipta puisi, cerpen, dan mendongeng.',
                    'Meningkatkan daya cipta sastra dan publikasi karya melalui majalah dinding/buletin.',
                    'Meningkatkan apresiasi dan pelestarian terhadap seni dan kebudayaan nusantara.',
                    'Menggalakkan gerakan literasi sekolah dan bedah karya sastra.',
                ],
                'coordinating_eskuls' => [
                    'Jurnalistik Sekolah & Majalah Dinding (Mading)',
                    'Komunitas Bengkel Sastra & Puisi',
                    'Teater & Sanggar Seni Sastra',
                    'Seni Tradisional Karawitan / Tari Nusantara',
                ],
            ],
            [
                'number' => 9,
                'name' => 'Pembinaan Teknologi Informasi dan Komunikasi (TIK)',
                'short_title' => 'Teknologi Informasi & Komunikasi (Sekbid 9)',
                'description' => 'Mengoptimalkan pemanfaatan teknologi informasi untuk inovasi pembelajaran, media publikasi digital, keamanan internet, dan keahlian komputasi.',
                'official_duties' => [
                    'Memanfaatkan TIK untuk memfasilitasi kegiatan pembelajaran dan organisasi sekolah.',
                    'Menjadikan TIK sebagai wahana kreativitas perangkat lunak, konten, dan robotika.',
                    'Mengembangkan etika berinternet sehat (netiket) dan kewaspadaan keamanan data digital.',
                    'Mengelola portal informasi, media sosial resmi, dan publikasi multimedia OSIS.',
                    'Menyelenggarakan pelatihan desain digital, coding, fotografi, dan videografi.',
                ],
                'coordinating_eskuls' => [
                    'IT Club (Coding, Web & Aplikasi)',
                    'Robotika & Internet of Things (IoT)',
                    'Broadcasting & Sinematografi',
                    'Desain Grafis Multimedia & Fotografi',
                ],
            ],
            [
                'number' => 10,
                'name' => 'Pembinaan Komunikasi dalam Bahasa Inggris',
                'short_title' => 'Komunikasi Bahasa Inggris (Sekbid 10)',
                'description' => 'Meningkatkan kecakapan berkomunikasi dalam bahasa Inggris secara aktif guna menumbuhkan daya saing global dan wawasan internasional.',
                'official_duties' => [
                    'Melaksanakan lomba pidato (speech contest), debat bahasa Inggris, dan storytelling.',
                    'Mengadakan kompetisi menulis artikel, esai, dan korespondensi dalam bahasa Inggris.',
                    'Melaksanakan kegiatan pembiasaan berbicara bahasa Inggris (English Day / English Corner).',
                    'Menyelenggarakan pertunjukan seni drama singkat (English drama performance).',
                    'Menumbuhkan rasa percaya diri siswa untuk berkomunikasi dalam forum internasional.',
                ],
                'coordinating_eskuls' => [
                    'English Club',
                    'English Debate Society (EDS)',
                    'Storytelling & Speech Circle',
                    'Model United Nations (MUN) Pelajar / Pen Pal Club',
                ],
            ],
        ];

        foreach ($sekbids as $data) {
            OsisSekbid::updateOrCreate(
                ['number' => $data['number']],
                $data
            );
        }
    }
}
