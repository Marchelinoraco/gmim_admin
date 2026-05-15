# Requirements Document

## Introduction

Fitur ini memperbaiki dan memperluas manajemen domain (subdomain) serta bendahara (admin gereja) pada aplikasi Super Admin GMIM. Saat ini, field subdomain sudah ada pada model Church tetapi belum memiliki UI manajemen domain yang memadai (validasi, preview URL, status verifikasi). Halaman bendahara sudah memiliki CRUD dasar tetapi perlu perbaikan pada validasi, relasi dengan gereja, dan pengelolaan akses per gereja.

## Glossary

- **Sistem_Admin**: Aplikasi panel Super Admin GMIM yang digunakan untuk mengelola gereja, bendahara, dan langganan
- **Super_Admin**: Pengguna yang mengoperasikan Sistem_Admin dengan akses penuh ke seluruh fitur
- **Gereja**: Entitas organisasi gereja yang terdaftar dalam sistem, memiliki subdomain unik
- **Bendahara**: Pengguna yang ditugaskan mengelola keuangan dan administrasi satu gereja tertentu
- **Domain**: Subdomain unik yang diberikan kepada setiap gereja untuk mengakses aplikasi klien (format: `{subdomain}.gmimjadi.com`)
- **Status_Domain**: Status verifikasi domain gereja, bernilai "aktif", "pending", atau "nonaktif"
- **Role_Pengguna**: Peran bendahara dalam sistem, bernilai "Admin Gereja", "Bendahara", atau "Viewer / Majelis"
- **Status_Akun**: Status akun bendahara, bernilai "active" atau "disabled"

## Requirements

### Requirement 1: Manajemen Domain Gereja

**User Story:** Sebagai Super_Admin, saya ingin mengelola subdomain setiap gereja dengan validasi dan preview URL, sehingga setiap gereja memiliki alamat akses yang unik dan valid.

#### Acceptance Criteria

1. WHEN Super_Admin membuat gereja baru, THE Sistem_Admin SHALL menampilkan field subdomain yang wajib diisi dengan preview URL lengkap dalam format `{subdomain}.gmimjadi.com` yang diperbarui secara real-time saat Super_Admin mengetik
2. WHEN Super_Admin memasukkan subdomain, THE Sistem_Admin SHALL memvalidasi secara real-time bahwa subdomain hanya mengandung huruf kecil, angka, dan tanda hubung (regex: `^[a-z0-9]+(-[a-z0-9]+)*$`) dan menampilkan pesan error "Format subdomain tidak valid" jika tidak sesuai
3. WHEN Super_Admin memasukkan subdomain yang sudah digunakan gereja lain, THE Sistem_Admin SHALL menampilkan pesan error "Subdomain sudah digunakan" dan mencegah penyimpanan
4. WHEN Super_Admin menyimpan gereja dengan subdomain valid dan unik, THE Sistem_Admin SHALL menyimpan data gereja beserta subdomain dan menampilkan Status_Domain "pending"
5. THE Sistem_Admin SHALL menampilkan kolom Status_Domain pada daftar gereja dengan badge berwarna hijau untuk "aktif", kuning untuk "pending", dan merah untuk "nonaktif"
6. WHEN Super_Admin mengubah subdomain gereja yang sudah ada, THE Sistem_Admin SHALL menampilkan dialog konfirmasi yang menginformasikan bahwa URL lama tidak akan berfungsi, dan setelah dikonfirmasi SHALL memvalidasi keunikan subdomain baru dan memperbarui Status_Domain menjadi "pending"
7. IF subdomain yang dimasukkan memiliki panjang kurang dari 3 karakter atau lebih dari 30 karakter, THEN THE Sistem_Admin SHALL menampilkan pesan error "Subdomain harus antara 3-30 karakter"
8. IF Super_Admin mencoba menyimpan gereja tanpa mengisi field subdomain, THEN THE Sistem_Admin SHALL menampilkan pesan error "Subdomain wajib diisi" pada field subdomain dan mencegah penyimpanan

### Requirement 2: Tampilan Informasi Domain pada Detail Gereja

**User Story:** Sebagai Super_Admin, saya ingin melihat informasi domain lengkap pada halaman detail gereja, sehingga saya dapat memantau status dan konfigurasi domain setiap gereja.

#### Acceptance Criteria

1. WHEN Super_Admin membuka halaman detail gereja, THE Sistem_Admin SHALL menampilkan bagian "Informasi Domain" yang berisi subdomain, URL lengkap dalam format "{subdomain}.gmimjadi.com", dan Status_Domain
2. WHEN Status_Domain bernilai "aktif", THE Sistem_Admin SHALL menampilkan badge hijau dengan teks "Aktif"
3. WHEN Status_Domain bernilai "pending", THE Sistem_Admin SHALL menampilkan badge kuning dengan teks "Pending"
4. WHEN Status_Domain bernilai "nonaktif", THE Sistem_Admin SHALL menampilkan badge merah dengan teks "Nonaktif"
5. WHEN Status_Domain bernilai "pending" atau "nonaktif", THE Sistem_Admin SHALL menampilkan tombol "Aktifkan Domain" dan menyembunyikan tombol "Nonaktifkan Domain"
6. WHEN Status_Domain bernilai "aktif", THE Sistem_Admin SHALL menampilkan tombol "Nonaktifkan Domain" dan menyembunyikan tombol "Aktifkan Domain"
7. WHEN Super_Admin mengklik tombol "Aktifkan Domain", THE Sistem_Admin SHALL menampilkan dialog konfirmasi, dan jika dikonfirmasi, mengubah Status_Domain menjadi "aktif" serta menampilkan notifikasi sukses dalam waktu maksimal 3 detik
8. WHEN Super_Admin mengklik tombol "Nonaktifkan Domain", THE Sistem_Admin SHALL menampilkan dialog konfirmasi, dan jika dikonfirmasi, mengubah Status_Domain menjadi "nonaktif" serta menampilkan notifikasi sukses dalam waktu maksimal 3 detik
9. IF perubahan Status_Domain gagal, THEN THE Sistem_Admin SHALL menampilkan pesan error yang menjelaskan kegagalan dan mempertahankan Status_Domain sebelumnya

### Requirement 3: Pembuatan Bendahara dengan Relasi Gereja

**User Story:** Sebagai Super_Admin, saya ingin membuat akun bendahara yang terhubung dengan gereja tertentu, sehingga setiap bendahara memiliki akses yang jelas ke gereja yang ditugaskan.

#### Acceptance Criteria

1. WHEN Super_Admin membuka form tambah bendahara, THE Sistem_Admin SHALL menampilkan dropdown gereja yang hanya berisi gereja dengan Status_Domain "aktif" atau "pending"
2. WHEN Super_Admin memilih gereja pada form bendahara, THE Sistem_Admin SHALL menampilkan informasi ringkas gereja (nama, subdomain, status langganan) di bawah dropdown
3. WHEN Super_Admin mengisi form bendahara dengan semua field wajib (nama lengkap, email, password, gereja, nomor telepon, role) terisi dan lolos validasi, THE Sistem_Admin SHALL membuat akun bendahara dengan Status_Akun "active", menghubungkannya ke gereja yang dipilih, dan menavigasi ke halaman detail bendahara yang baru dibuat
4. IF Super_Admin memasukkan email yang sudah terdaftar pada gereja yang sama, THEN THE Sistem_Admin SHALL menampilkan pesan error pada field email dan mencegah penyimpanan
5. IF field nama lengkap, email, password, gereja, atau nomor telepon tidak diisi, THEN THE Sistem_Admin SHALL menampilkan pesan error pada setiap field yang kosong dan mencegah penyimpanan
6. IF Super_Admin memasukkan password kurang dari 8 karakter atau lebih dari 128 karakter, THEN THE Sistem_Admin SHALL menampilkan pesan error pada field password dan mencegah penyimpanan
7. IF Super_Admin memasukkan email dengan format tidak valid (tidak sesuai format standar email), THEN THE Sistem_Admin SHALL menampilkan pesan error pada field email dan mencegah penyimpanan
8. IF Super_Admin memasukkan nama lengkap dengan panjang kurang dari 2 karakter atau lebih dari 100 karakter, THEN THE Sistem_Admin SHALL menampilkan pesan error pada field nama lengkap dan mencegah penyimpanan

### Requirement 4: Daftar Bendahara dengan Filter dan Pencarian

**User Story:** Sebagai Super_Admin, saya ingin melihat daftar bendahara dengan kemampuan filter berdasarkan gereja dan status, sehingga saya dapat dengan mudah menemukan dan mengelola bendahara tertentu.

#### Acceptance Criteria

1. THE Sistem_Admin SHALL menampilkan daftar bendahara dalam tabel dengan kolom: Nama, Email, Gereja, Nomor Telepon, Role, Status Akun, dan Aksi
2. WHEN Super_Admin mengetik pada kolom pencarian, THE Sistem_Admin SHALL memfilter daftar bendahara berdasarkan nama, email, atau nama gereja secara case-insensitive dengan delay debounce maksimal 300ms
3. WHEN Super_Admin memilih filter gereja dari dropdown, THE Sistem_Admin SHALL menampilkan hanya bendahara yang terhubung dengan gereja tersebut
4. WHEN Super_Admin memilih filter status dari dropdown, THE Sistem_Admin SHALL menampilkan hanya bendahara dengan status yang dipilih ("active" atau "disabled")
5. WHEN Super_Admin menerapkan kombinasi filter pencarian, filter gereja, dan filter status secara bersamaan, THE Sistem_Admin SHALL menampilkan bendahara yang memenuhi semua kriteria filter (logika AND)
6. WHEN tidak ada bendahara yang memenuhi kriteria filter, THE Sistem_Admin SHALL menampilkan pesan "Tidak ada bendahara yang ditemukan" pada area tabel
7. WHEN halaman pertama kali dimuat, THE Sistem_Admin SHALL menampilkan semua bendahara tanpa filter aktif (dropdown gereja menampilkan "Semua Gereja", dropdown status menampilkan "Semua Status", kolom pencarian kosong)

### Requirement 5: Pengelolaan Status dan Akses Bendahara

**User Story:** Sebagai Super_Admin, saya ingin mengaktifkan atau menonaktifkan akun bendahara, sehingga saya dapat mengontrol akses pengguna ke sistem gereja.

#### Acceptance Criteria

1. WHEN Super_Admin mengklik tombol "Nonaktifkan" pada bendahara berstatus "active", THE Sistem_Admin SHALL menampilkan dialog konfirmasi yang meminta Super_Admin mengonfirmasi tindakan penonaktifan sebelum mengubah Status_Akun
2. WHEN Super_Admin mengonfirmasi penonaktifan pada dialog konfirmasi, THE Sistem_Admin SHALL mengubah Status_Akun bendahara menjadi "disabled" dan menampilkan notifikasi sukses selama 3 detik
3. WHEN Super_Admin mengklik tombol "Aktifkan" pada bendahara berstatus "disabled", THE Sistem_Admin SHALL mengubah Status_Akun menjadi "active" dan menampilkan notifikasi sukses selama 3 detik
4. WHEN Super_Admin mengklik tombol "Reset Password" pada detail bendahara, THE Sistem_Admin SHALL menampilkan dialog input password baru dengan validasi panjang minimal 8 karakter dan maksimal 128 karakter
5. WHEN Super_Admin mengonfirmasi reset password dengan password yang memenuhi validasi, THE Sistem_Admin SHALL memperbarui password bendahara dan menampilkan notifikasi sukses selama 3 detik
6. IF Super_Admin mengonfirmasi reset password dengan password yang tidak memenuhi validasi panjang, THEN THE Sistem_Admin SHALL menampilkan pesan error yang menunjukkan persyaratan panjang password dan tetap menampilkan dialog input tanpa menutupnya
7. IF gereja yang terhubung dengan bendahara memiliki Status_Domain "nonaktif" (isActive = false), THEN THE Sistem_Admin SHALL menampilkan ikon peringatan berwarna beserta tooltip teks keterangan pada baris bendahara tersebut di daftar
8. IF bendahara yang akan diubah statusnya tidak ditemukan dalam sistem, THEN THE Sistem_Admin SHALL menampilkan notifikasi error selama 5 detik yang menunjukkan bahwa data bendahara tidak ditemukan

### Requirement 6: Tampilan Bendahara pada Detail Gereja

**User Story:** Sebagai Super_Admin, saya ingin melihat daftar bendahara yang terhubung dengan gereja tertentu pada halaman detail gereja, sehingga saya dapat mengelola pengguna per gereja.

#### Acceptance Criteria

1. WHEN Super_Admin membuka halaman detail gereja, THE Sistem_Admin SHALL menampilkan bagian "Bendahara Terdaftar" dengan daftar semua bendahara yang terhubung ke gereja tersebut dalam format tabel
2. THE Sistem_Admin SHALL menampilkan kolom nama, role, status (dengan badge berwarna), dan tanggal login terakhir (format: DD MMM YYYY HH:mm) untuk setiap bendahara pada bagian tersebut
3. WHEN Super_Admin mengklik tombol "Tambah Bendahara" pada bagian bendahara di detail gereja, THE Sistem_Admin SHALL menavigasi ke form tambah bendahara dengan gereja sudah terpilih otomatis pada dropdown
4. WHEN Super_Admin mengklik nama bendahara pada daftar, THE Sistem_Admin SHALL menavigasi ke halaman detail bendahara tersebut (route: /super-admin/treasurers/:id)
5. WHEN tidak ada bendahara yang terhubung ke gereja, THE Sistem_Admin SHALL menampilkan pesan "Belum ada bendahara terdaftar" dengan tombol "Tambah Bendahara"
