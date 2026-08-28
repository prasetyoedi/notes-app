# 📝 Notes App - Fullstack Technical Test

> Aplikasi catatan (Notes App) berbasis REST API + Web App yang menerapkan praktik pengembangan fullstack modern: authentication, authorization, database design tanpa ORM, REST API architecture, dan UI dengan component library.

## Alasan Keputusan Teknis

### 1. Mengapa Express.js, Bukan Golang (Gin)?

Meskipun Golang menawarkan performa runtime yang superior, **Express.js dipilih** karena lebih sesuai dengan konteks technical test dengan deadline 3 hari.

Beberapa pertimbangannya:

- **Kecepatan Development**
  Ecosystem npm yang luas serta sintaks JavaScript/TypeScript yang ringkas memungkinkan implementasi fitur dilakukan lebih cepat.

- **Ecosystem yang Matang**
  Library seperti `swagger-autogen`, `jsonwebtoken`, `bcryptjs`, dan `pg` sudah stabil serta memiliki dokumentasi yang baik.

- **Trade-off yang Disadari**
  Saya memahami bahwa untuk aplikasi dengan kebutuhan _high concurrency_, Golang dapat memberikan performa yang lebih baik. Namun, untuk skala **Notes App** ini, Express.js sudah lebih dari cukup dan perbedaan overhead performanya tidak menjadi bottleneck yang signifikan.

---

### 2. Mengapa PostgreSQL via Supabase?

PostgreSQL dipilih sebagai database utama dan di-host menggunakan Supabase dengan beberapa pertimbangan:

- **Fitur JSON yang Kaya**
  PostgreSQL menyediakan `JSON_AGG` dan `JSON_BUILD_OBJECT` yang memungkinkan data relasi many-to-many seperti **notes ↔ tags** dikembalikan dalam satu query. Pendekatan ini membantu menghindari masalah **N+1 query** tanpa membutuhkan ORM.

- **Managed Service**
  Supabase menyediakan PostgreSQL sebagai managed database, sehingga tidak diperlukan setup dan maintenance infrastruktur database secara manual.

- **Connection Pooling**
  Supabase menyediakan connection pooling melalui PgBouncer. Hal ini membantu mengelola koneksi database dan mengurangi risiko _too many connections_ ketika aplikasi mengalami peningkatan traffic.

---

### 3. Mengapa shadcn/ui, Bukan Mantine atau Full UI Framework?

`shadcn/ui` dipilih karena memberikan fleksibilitas lebih besar dalam membangun UI dibandingkan menggunakan full UI framework.

Pertimbangannya:

- **Bukan Full Page Solution**
  Berbeda dengan framework seperti Mantine yang menyediakan banyak komponen dan pola layout siap pakai, `shadcn/ui` lebih berfokus pada komponen dasar seperti Button, Input, Dialog, dan lainnya. Dengan demikian, layout dan UX tetap dirancang sendiri.

- **Built on Radix UI + Tailwind CSS**
  Radix UI menyediakan primitive yang memperhatikan accessibility, sedangkan Tailwind CSS memberikan fleksibilitas dalam styling.

- **TypeScript-first**
  Komponen memiliki dukungan TypeScript yang baik dan sesuai dengan requirement TypeScript pada frontend.

---

## 🛠️ Teknologi

### Frontend

| Teknologi        | Versi   | Keterangan                                |
| ---------------- | ------- | ----------------------------------------- |
| **Next.js**      | 14.2.5  | Framework React dengan App Router & SSR   |
| **TypeScript**   | 5.5.3   | Type safety & developer experience        |
| **Tailwind CSS** | 3.4.1   | Utility-first CSS framework               |
| **shadcn/ui**    | Latest  | UI component library (copy-paste)         |
| **React Query**  | 5.51.21 | Data fetching, caching, & synchronization |
| **date-fns**     | 3.6.0   | Manipulasi & formatting tanggal           |
| **Sonner**       | 1.5.0   | Toast notifications                       |
| **Lucide React** | 0.408.0 | Icon library                              |

### Backend

| Teknologi                 | Versi  | Keterangan                        |
| ------------------------- | ------ | --------------------------------- |
| **Node.js**               | 20+    | Runtime JavaScript                |
| **Express.js**            | 5.0.1  | Web framework untuk REST API      |
| **TypeScript**            | 5.5.3  | Type safety di backend            |
| **PostgreSQL (Supabase)** | 15+    | Database dengan connection pooler |
| **pg**                    | 8.12.0 | PostgreSQL driver (raw query)     |
| **bcryptjs**              | 3.0.0  | Password hashing                  |
| **jsonwebtoken**          | 9.0.2  | JWT authentication                |
| **swagger-autogen**       | 2.23.7 | Generate Swagger documentation    |
| **swagger-ui-express**    | 5.0.0  | Swagger UI untuk API docs         |

### Setup Database

**Menggunakan Supabase**

1. Buat akun di [Supabase](https://supabase.com/)
2. Buat project baru.
3. Buka **SQL Editor** → paste isi file `database/schema.sql` → klik **Run**.
4. Copy **Connection String** dari **Settings** → **Database** → **Connection string** → **URI**.

### Setup Backend

Masuk ke folder backend:

```bash
cd backend
npm install
```

Edit file `.env`:

```env
DATABASE_URL=your_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Generate `JWT_SECRET` yang aman:

```bash
openssl rand -base64 32
```

Jalankan backend:

```bash
npm run dev
```

Backend akan berjalan di:

- API: `http://localhost:5000`
- Swagger Docs: `http://localhost:5000/api/docs`

### Setup Frontend

Masuk ke folder frontend:

```bash
cd frontend
npm install
```

Edit file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Jalankan frontend:

```bash
npm run dev
```

Frontend akan berjalan di:

`http://localhost:3000`

## Struktur Project

```text
notes-app/
├── backend/                              # Express.js REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts               # PostgreSQL connection pool
│   │   ├── controllers/
│   │   │   ├── authController.ts         # Register, login, logout
│   │   │   ├── noteController.ts         # CRUD notes + archive/pin
│   │   │   └── tagController.ts          # CRUD tags
│   │   ├── middlewares/
│   │   │   ├── auth.ts                   # JWT verification
│   │   │   └── errorHandler.ts           # Global error handler
│   │   ├── repositories/
│   │   │   ├── noteRepository.ts         # Raw SQL untuk notes
│   │   │   ├── tagRepository.ts          # Raw SQL untuk tags
│   │   │   ├── notesTagsRepository.ts    # Raw SQL untuk join table
│   │   │   └── userRepository.ts         # Raw SQL untuk users
│   │   ├── routes/
│   │   │   ├── auth.ts                   # /api/auth/* + Swagger JSDoc
│   │   │   ├── notes.ts                  # /api/notes/* + Swagger JSDoc
│   │   │   └── tags.ts                   # /api/tags/* + Swagger JSDoc
│   │   ├── services/
│   │   │   ├── authService.ts            # Business logic auth
│   │   │   ├── noteService.ts            # Business logic notes
│   │   │   └── tagService.ts             # Business logic tags
│   │   ├── app.ts                        # Express app setup
│   │   └── swagger-output.json           # Auto-generated Swagger spec
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                             # Next.js Web App
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Main dashboard
│   │   ├── layout.tsx
│   │   └── page.tsx                      # Root redirect
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   ├── notes/
│   │   │   ├── NoteCreateModal.tsx
│   │   │   └── NoteEditModal.tsx
│   │   └── tags/
│   │       └── TagManagementModal.tsx
│   ├── lib/
│   │   ├── api-client.ts                 # Fetch wrapper + error handling
│   │   ├── auth.ts                       # Token management
│   │   └── utils.ts                      # Helper functions
│   ├── middleware.ts                      # Route protection
│   └── package.json
│
├── database/
│   └── schema.sql                        # DDL untuk semua tabel
│
├── .gitignore
└── README.md
```

### Penjelasan Struktur

#### Backend

Backend menggunakan **Express.js + TypeScript** dengan pemisahan layer untuk menjaga tanggung jawab setiap bagian tetap jelas:

- `controllers/` — Menangani HTTP request dan response.
- `services/` — Menangani business logic aplikasi.
- `repositories/` — Menangani akses database menggunakan raw SQL.
- `routes/` — Mendefinisikan endpoint API dan dokumentasi Swagger.
- `middlewares/` — Menangani authentication dan error handling.
- `config/` — Menangani konfigurasi dan koneksi database.

#### Frontend

Frontend menggunakan **Next.js + TypeScript** dengan struktur:

- `app/` — Routing dan halaman aplikasi.
- `components/` — Reusable UI components.
- `components/ui/` — Komponen dari shadcn/ui.
- `lib/api-client.ts` — Centralized API client.
- `lib/auth.ts` — Token management.
- `middleware.ts` — Melindungi route yang membutuhkan authentication.

#### Database

Folder `database/` berisi `schema.sql` yang digunakan untuk membuat seluruh struktur tabel dan relasi database PostgreSQL.

## 📚 API Documentation

### Swagger UI

Dokumentasi API interaktif tersedia melalui Swagger UI.

- **Local**: `http://localhost:5000/api/docs`
- **File Spec**: `backend/swagger-output.json`

### Ringkasan Endpoint

#### Authentication (`/api/auth`)

| Method | Endpoint             | Deskripsi               | Auth |
| :----: | -------------------- | ----------------------- | :--: |
| `POST` | `/api/auth/register` | Registrasi user baru    |  ❌  |
| `POST` | `/api/auth/login`    | Login & mendapatkan JWT |  ❌  |
| `POST` | `/api/auth/logout`   | Logout (client-side)    |  ❌  |

#### Notes (`/api/notes`)

|  Method  | Endpoint                   | Deskripsi                                | Auth |
| :------: | -------------------------- | ---------------------------------------- | :--: |
|  `GET`   | `/api/notes`               | Ambil notes (Pagination, Search, Filter) |  ✅  |
|  `GET`   | `/api/notes/:id`           | Ambil detail note                        |  ✅  |
|  `POST`  | `/api/notes`               | Buat note baru + relasi tag              |  ✅  |
|  `PUT`   | `/api/notes/:id`           | Update note                              |  ✅  |
| `DELETE` | `/api/notes/:id`           | Hapus note                               |  ✅  |
|  `PUT`   | `/api/notes/:id/archive`   | Arsipkan note                            |  ✅  |
|  `PUT`   | `/api/notes/:id/unarchive` | Kembalikan dari arsip                    |  ✅  |
|  `PUT`   | `/api/notes/:id/pin`       | Pin note ke atas                         |  ✅  |
|  `PUT`   | `/api/notes/:id/unpin`     | Unpin note                               |  ✅  |

#### Tags (`/api/tags`)

|  Method  | Endpoint        | Deskripsi                  | Auth |
| :------: | --------------- | -------------------------- | :--: |
|  `GET`   | `/api/tags`     | Ambil semua tag milik user |  ✅  |
|  `POST`  | `/api/tags`     | Buat tag baru              |  ✅  |
| `DELETE` | `/api/tags/:id` | Hapus tag                  |  ✅  |
