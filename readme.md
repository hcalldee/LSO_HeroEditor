# Lost Saga Hero Editor

Tool CLI berbasis **Node.js + SQLite** untuk mengelola data Hero pada database Lost Saga Offline.

Tool ini memungkinkan pengguna untuk:

* Melihat daftar Hero
* Mengubah Level Hero
* Mengubah EXP Hero
* Mengubah semua Hero sekaligus
* Menghapus Hero
* Memperbarui nama Hero dari database referensi
* Membuat backup database sebelum perubahan

> **PENTING:** Tool ini bekerja langsung pada database Lost Saga Offline. Selalu pastikan game dalam keadaan **tertutup** sebelum melakukan perubahan database.

---

## Requirements

Sebelum menggunakan tool ini, siapkan:

* Windows 10/11 64-bit
* Node.js 24 LTS
* npm
* Git Bash
* Notepad / Notepad++
* Database Lost Saga Offline
* Folder project Hero Editor

### 1. Install Node.js 24

Download Node.js 24 LTS dari situs resmi:

https://nodejs.org/

Pilih:

**Node.js 24 LTS → Windows Installer (.msi) → 64-bit**

Setelah instalasi selesai, buka **Git Bash** dan cek:

```bash
node -v
```

Contoh:

```text
v24.x.x
```

Kemudian cek npm:

```bash
npm -v
```

Jika kedua perintah menghasilkan nomor versi, Node.js berhasil dipasang.

---

## 2. Install Git Bash

Download Git for Windows:

https://git-scm.com/download/win

Install menggunakan konfigurasi default jika tidak memiliki kebutuhan khusus.

Setelah selesai, buka:

**Git Bash**

Git Bash digunakan untuk menjalankan perintah Git dan Node.js pada project ini.

---

# Installation

## 1. Clone Repository

Buka Git Bash.

Masuk ke folder tempat project ingin disimpan:

```bash
cd /d/path/ke/folder
```

Contoh:

```bash
cd /d/D/Project
```

Clone repository:

```bash
git clone <URL-REPOSITORY>
```

Masuk ke folder project:

```bash
cd lost-saga-hero-editor
```

> Sesuaikan nama folder dengan repository yang digunakan.

---

## 2. Install Dependencies

Pastikan berada di folder project yang berisi `package.json`.

Jalankan:

```bash
npm i
```

Tunggu sampai proses selesai.

Dependency yang digunakan akan otomatis di-install ke folder:

```text
node_modules/
```

Jangan menghapus folder `node_modules` jika ingin langsung menjalankan program tanpa melakukan `npm i` lagi.

---

# Struktur Project

Struktur dasar project:

```text
HeroEditor/
│
├── run.js
├── package.json
├── package-lock.json
├── config.json
├── hero_cache.json
├── offline_save.db
│
└── node_modules/
```

Jika `config.json` belum tersedia, program akan membuatnya secara otomatis ketika pertama kali dijalankan.

---

# Configuration

Program menggunakan file:

```text
config.json
```

Contoh:

```json
{
    "database": "./offline_save.db",
    "user_id": "GMZhaepID",
    "backup": true,
    "hero_cache": "./hero_cache.json"
}
```

## Database

Menentukan lokasi database yang akan diedit.

Contoh:

```json
"database": "./offline_save.db"
```

Jika database berada di folder lain:

```json
"database": "./Save/offline_save.db"
```

atau:

```json
"database": "D:/LostSaga/Save/offline_save.db"
```

---

## user_id

Menentukan akun yang akan diedit.

Contoh:

```json
"user_id": "GMZhaepID"
```

Jika ingin mengedit akun lain, ubah nilainya:

```json
"user_id": "kpopdewapID"
```

Pastikan `user_id` sesuai dengan data yang terdapat pada database.

---

## backup

Menentukan apakah program membuat backup sebelum melakukan perubahan.

Disarankan tetap:

```json
"backup": true
```

---

## hero_cache

File cache nama Hero:

```json
"hero_cache": "./hero_cache.json"
```

File ini digunakan agar nama Hero yang sudah pernah diambil tidak perlu selalu dimuat ulang.

---

# Menjalankan Program

Buka Git Bash pada folder project.

Jalankan:

```bash
node run.js
```

Program akan menampilkan konfigurasi yang sedang digunakan dan menu utama.

Contoh:

```text
CONFIG:
{
    database: './offline_save.db',
    user_id: 'GMZhaepID',
    backup: true,
    hero_cache: './hero_cache.json'
}

DATABASE:
D:\LostSaga\offline_save.db

USER:
GMZhaepID
```

Kemudian muncul menu:

```text
1. Lihat Hero
2. Edit Level Hero
3. Set Semua Hero
4. Hapus Hero
5. Update Nama Hero
6. Refresh Database
0. Keluar
```

---

# ⚠️ Sebelum Menggunakan Menu Edit

## Tutup Game Terlebih Dahulu

Sebelum melakukan perubahan:

```text
1. Tutup Lost Saga
2. Pastikan proses/game server yang menggunakan database sudah berhenti
3. Jalankan Hero Editor
4. Lakukan perubahan
5. Keluar dari Hero Editor
6. Jalankan Lost Saga kembali
```

**Jangan melakukan perubahan database ketika game masih berjalan**, karena database SQLite dapat sedang digunakan oleh game.

---

# Menu 1 — Lihat Hero

Pilih:

```text
1
```

Menu ini hanya menampilkan data Hero.

Contoh:

```text
No  Hero              Level   EXP     Slot
------------------------------------------------
1   Drill             50      0       0
2   Zhae              15      0       1
3   Hero 179          1       0       2
```

Menu ini **tidak mengubah database**.

Gunakan menu ini untuk memastikan Hero dan slot yang ingin diedit sudah benar.

---

# Menu 2 — Edit Level Hero

Pilih:

```text
2
```

Program akan meminta Hero yang ingin diubah.

Contoh:

```text
Pilih Hero:
1. Drill
2. Zhae
3. Hero 179

Pilih:
```

Kemudian masukkan level baru.

Contoh:

```text
Level baru: 100
```

Program akan membuat backup terlebih dahulu jika:

```json
"backup": true
```

Kemudian data Hero akan diperbarui.

### Setelah selesai

Jangan langsung melihat hasilnya di game yang masih terbuka.

Lakukan:

```text
1. Keluar dari Hero Editor
2. Buka Lost Saga
3. Masuk ke akun
4. Cek Hero
```

Perubahan seharusnya terlihat setelah game membaca kembali database.

---

# Menu 3 — Set Semua Hero

Pilih:

```text
3
```

Menu ini digunakan untuk mengubah level seluruh Hero pada akun sekaligus.

Contoh:

```text
Level untuk semua Hero: 100
```

Semua Hero yang terdapat pada akun akan diperbarui ke level tersebut.

Menu ini berguna jika ingin melakukan perubahan massal tanpa mengedit Hero satu per satu.

### Setelah selesai

```text
1. Keluar dari Hero Editor
2. Jalankan Lost Saga
3. Login kembali
4. Periksa daftar Hero
```

---

# Menu 4 — Hapus Hero

Pilih:

```text
4
```

Program akan menampilkan daftar Hero.

Pilih Hero yang ingin dihapus.

Program akan meminta konfirmasi:

```text
Ketik DELETE untuk melanjutkan:
```

Ketik:

```text
DELETE
```

Jika tidak mengetik `DELETE`, proses dibatalkan.

### ⚠️ Perhatian

Menghapus Hero merupakan perubahan database.

Pastikan Hero yang dipilih benar sebelum melakukan konfirmasi.

Setelah penghapusan:

```text
1. Keluar dari Hero Editor
2. Jalankan Lost Saga
3. Login kembali
4. Periksa daftar Hero
```

---

# Menu 5 — Update Nama Hero

Pilih:

```text
5
```

Menu ini digunakan untuk memperbarui cache nama Hero berdasarkan data referensi.

Program akan mengambil informasi nama Hero dan menyimpannya ke:

```text
hero_cache.json
```

Menu ini berguna apabila terdapat Hero yang masih ditampilkan menggunakan:

```text
Hero 123
Hero 178
Hero 183
```

dan nama Hero belum tersedia pada cache.

Menu ini membutuhkan koneksi internet karena data nama Hero diambil dari sumber online.

> Menu ini tidak digunakan untuk mengubah level atau EXP Hero.

---

# Menu 6 — Refresh Database

Pilih:

```text
6
```

Menu ini digunakan untuk membaca kembali data database.

Gunakan menu ini jika database berubah ketika program masih berjalan atau jika ingin memastikan data terbaru telah terbaca.

Untuk perubahan yang dilakukan secara manual pada `config.json`, lebih aman:

```text
1. Keluar dari program
2. Edit config.json
3. Jalankan node run.js kembali
```

---

# Menu 0 — Keluar

Pilih:

```text
0
```

Program akan keluar.

Setelah melakukan perubahan database, disarankan selalu keluar dari Hero Editor sebelum menjalankan game.

---

# Backup Database

Jika:

```json
"backup": true
```

program akan membuat backup sebelum perubahan database.

Backup disimpan di folder:

```text
backup/
```

Contoh:

```text
backup/
├── offline_save_20260915_120000.db
├── offline_save_20260915_120000.db-wal
└── offline_save_20260915_120000.db-shm
```

Gunakan backup apabila perubahan menyebabkan masalah.

> Jangan menghapus backup sampai perubahan yang dilakukan sudah dipastikan berhasil.

---

# Menggunakan Notepad

`config.json` dapat diedit menggunakan Notepad.

Klik kanan:

```text
config.json
```

Kemudian:

```text
Open with → Notepad
```

Contoh mengubah akun:

Dari:

```json
"user_id": "GMZhaepID"
```

menjadi:

```json
"user_id": "kpopdewapID"
```

Simpan menggunakan:

```text
Ctrl + S
```

Kemudian jalankan kembali:

```bash
node run.js
```

---

# Contoh Workflow Lengkap

Misalnya ingin mengubah level Hero menjadi level 100.

### 1. Tutup Lost Saga

Pastikan game tidak sedang menggunakan database.

### 2. Edit `config.json`

Pastikan akun yang benar:

```json
{
    "database": "./offline_save.db",
    "user_id": "GMZhaepID",
    "backup": true,
    "hero_cache": "./hero_cache.json"
}
```

### 3. Jalankan Hero Editor

```bash
node run.js
```

### 4. Lihat Hero

Pilih:

```text
1
```

Cari Hero yang ingin diubah.

### 5. Edit Hero

Pilih:

```text
2
```

Pilih Hero.

Masukkan:

```text
100
```

### 6. Tutup Hero Editor

Pilih:

```text
0
```

### 7. Jalankan Lost Saga

Buka game dan login.

### 8. Periksa Hero

Level Hero seharusnya sudah mengikuti nilai yang disimpan ke database.

---

# Troubleshooting

## `node` tidak dikenali

Jika muncul:

```text
'node' is not recognized...
```

pastikan Node.js sudah terinstall.

Tutup Git Bash lalu buka kembali.

Kemudian:

```bash
node -v
```

---

## `npm` tidak dikenali

Cek instalasi Node.js:

```bash
node -v
npm -v
```

Jika Node tersedia tetapi npm tidak tersedia, periksa instalasi Node.js atau reinstall Node.js menggunakan installer resmi.

---

## `Cannot find module 'better-sqlite3'`

Jalankan:

```bash
npm i
```

Jika masih bermasalah:

```bash
npm install better-sqlite3
```

Kemudian coba lagi:

```bash
node run.js
```

---

## Database tidak ditemukan

Periksa:

```text
config.json
```

Pastikan:

```json
"database": "./offline_save.db"
```

sesuai dengan lokasi sebenarnya.

---

## Hero tidak berubah di game

Periksa urutan berikut:

```text
1. Tutup game
2. Pastikan database yang diedit benar
3. Pastikan user_id benar
4. Jalankan Hero Editor
5. Lakukan perubahan
6. Keluar dari Hero Editor
7. Jalankan game kembali
```

Jika game masih berjalan ketika database diedit, game dapat menggunakan data yang masih tersimpan di memory atau menulis kembali data lama ke database.

---

# Development

Untuk menjalankan source code secara langsung:

```bash
npm i
```

Kemudian:

```bash
node run.js
```

Tidak diperlukan executable untuk menjalankan versi development.

---

# Disclaimer

Tool ini dibuat untuk keperluan **Lost Saga Offline / database lokal**.

Gunakan dengan hati-hati karena tool melakukan perubahan langsung terhadap database.

Selalu buat backup sebelum melakukan perubahan.

Penulis tidak bertanggung jawab atas kerusakan atau kehilangan data akibat penggunaan tool ini.

---
