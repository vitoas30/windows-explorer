# Window Explorer

Sebuah aplikasi web **File Explorer** berbasis browser yang terinspirasi dari tampilan **Windows 11 File Explorer**. Dibangun dengan arsitektur monorepo menggunakan Bun, Vue 3, Elysia, dan PostgreSQL.

![Preview](./docs/preview.png)

---

## Fitur

- **Folder Tree** — navigasi hierarki folder di sidebar kiri
- **List View** — tampilan isi folder dalam format list dengan kolom Name & Type
- **Search** — pencarian file/folder secara real-time
- **New Folder / New File** — buat folder atau file baru langsung dari browser
- **Upload File** — upload file (gambar, PDF, teks) dari komputer
- **Preview** — preview gambar, PDF, dan file teks
- **Rename** — ganti nama file/folder via klik kanan
- **Delete** — hapus file/folder via klik kanan
- **Windows 11 UI** — tampilan mirip Windows 11 File Explorer

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | Vue 3, TypeScript, Vite, Tailwind CSS |
| **Backend** | Bun, Elysia (REST API) |
| **Database** | PostgreSQL + Prisma ORM |
| **Monorepo** | Bun Workspaces |
| **Testing** | Vitest (unit), Playwright (e2e) |

---

## Prasyarat

Pastikan sudah terinstall:

- **[Bun](https://bun.sh/)** `>= 1.0` — runtime & package manager
- **[PostgreSQL](https://www.postgresql.org/)** `>= 14` — database

---

## Setup Awal (Fresh Install)

### 1. Clone repository

```bash
git clone https://github.com/username/window-explorer.git
cd window-explorer
```

### 2. Install semua dependencies

```bash
bun install
```

### 3. Setup environment variables backend

```bash
cd packages/backend
cp .env.example .env
```

Buka file `.env` dan sesuaikan `DATABASE_URL` dengan konfigurasi PostgreSQL kamu:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/window_explorer"
PORT=3000
NODE_ENV=development
```

> **Contoh** jika PostgreSQL kamu tidak pakai password:\
> `DATABASE_URL="postgresql://postgres:@localhost:5432/window_explorer"`

### 4. Buat database PostgreSQL

Buat database baru dengan nama `window_explorer` (atau sesuai yang kamu set di `.env`):

```bash
# Masuk ke psql
psql -U postgres

# Buat database
CREATE DATABASE window_explorer;
\q
```

### 5. Jalankan migrasi database

```bash
cd packages/backend
bun run db:generate   # generate Prisma Client
bun run db:migrate    # jalankan semua migrasi
```

### 6. Isi data awal (seed)

```bash
bun run db:seed
```

Ini akan mengisi database dengan contoh folder dan file (Documents, Pictures, Downloads, dll).

### 7. Kembali ke root dan jalankan aplikasi

```bash
cd ../..
bun run dev
```

Aplikasi akan berjalan di:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/swagger

---

## Struktur Proyek

```
window-explorer/
├── packages/
│   ├── backend/               # Elysia REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # skema database
│   │   │   └── migrations/    # file migrasi
│   │   ├── src/
│   │   │   ├── application/   # use cases & DTOs
│   │   │   ├── domain/        # entities & repository interfaces
│   │   │   ├── infrastructure/# Prisma impl & seed
│   │   │   └── presentation/  # routes (controllers)
│   │   ├── .env.example       # template env vars
│   │   └── package.json
│   │
│   ├── frontend/              # Vue 3 SPA
│   │   ├── src/
│   │   │   ├── components/    # komponen UI
│   │   │   ├── composables/   # useExplorer, useResizable
│   │   │   ├── services/      # nodeService (API client)
│   │   │   └── types/         # TypeScript DTOs
│   │   └── package.json
│   │
│   └── e2e/                   # Playwright end-to-end tests
│
├── package.json               # root workspace
└── README.md
```

---

## Menjalankan Tests

### Unit test (Vitest)

```bash
cd packages/frontend
bun run test
```

### E2E test (Playwright)

```bash
# Pastikan aplikasi sudah berjalan dulu (bun run dev di root)
cd packages/e2e
bunx playwright test
```

---

## Scripts Tersedia

### Root

| Command | Deskripsi |
|---|---|
| `bun run dev` | Jalankan frontend + backend sekaligus |
| `bun run dev:frontend` | Jalankan frontend saja |
| `bun run dev:backend` | Jalankan backend saja |

### Backend (`packages/backend`)

| Command | Deskripsi |
|---|---|
| `bun run dev` | Backend dengan hot-reload |
| `bun run db:generate` | Generate Prisma Client |
| `bun run db:migrate` | Jalankan migrasi database |
| `bun run db:seed` | Isi data contoh ke database |

### Frontend (`packages/frontend`)

| Command | Deskripsi |
|---|---|
| `bun run dev` | Dev server Vite |
| `bun run build` | Build untuk production |
| `bun run test` | Jalankan unit tests |

---

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/nodes/tree` | Ambil semua folder dalam bentuk tree |
| `GET` | `/nodes/:id/children` | Ambil isi langsung dari folder |
| `GET` | `/nodes/:id/content` | Ambil konten file (base64) |
| `GET` | `/nodes/search?q=query` | Cari file/folder berdasarkan nama |
| `POST` | `/nodes` | Buat folder/file baru |
| `PATCH` | `/nodes/:id/rename` | Ganti nama |
| `DELETE` | `/nodes/:id` | Hapus node |

Dokumentasi lengkap tersedia di `/swagger` saat server berjalan.

---

## Troubleshooting

### Error: `DATABASE_URL` not found
Pastikan file `.env` sudah dibuat di `packages/backend/` (copy dari `.env.example`).

### Error: `Cannot connect to database`
- Pastikan PostgreSQL berjalan
- Cek username, password, dan nama database di `.env`
- Pastikan database sudah dibuat (`CREATE DATABASE window_explorer`)

### Error port sudah dipakai
Ubah `PORT` di `.env` backend, atau hentikan proses yang menggunakan port 3000/5173.

---

## Lisensi

MIT
