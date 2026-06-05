# open23VT - Quản lý minh chứng điểm rèn luyện

> Dành cho sinh viên và câu lạc bộ trong trường học (<200 thành viên), chi phí = 0, không thương mại hóa.

## Vấn đề

Lớp / CLB / khoa của bạn cần quản lý minh chứng điểm rèn luyện:
- Sinh viên tham gia hoạt động, cần nộp ảnh minh chứng để được ghi nhận
- Admin (lớp trưởng / BCN CLB / CTV) xem, duyệt, từ chối
- Lưu trữ tập trung, tránh mất ảnh, dễ tra cứu khi tổng kết cuối kỳ

Google Sheets + Drive thì lộn xộn, không có cơ chế duyệt. Mua web thì tốn tiền.

## Giải pháp

**open23VT** — web app quản lý minh chứng điểm rèn luyện, tự host miễn phí:

| Tính năng | Mô tả |
|-----------|-------|
| Đăng nhập Google | Auth qua Supabase, không cần tạo tài khoản |
| Sinh viên nộp minh chứng | Upload ảnh hoạt động, tự động lưu vào Drive / Supabase |
| Admin duyệt | Xem ảnh -> Duyệt / Từ chối -> ghi nhận điểm |
| Quản lý học kỳ | Tạo / sửa / xóa, set học kỳ hiện tại (VD: HK1-2025-2026) |
| Quản lý hoạt động | Thêm hoạt động, gán điểm cho từng học kỳ |
| Lưu trữ linh hoạt | Google Drive hoặc Supabase Storage — tùy chọn |

## Chi phí = 0

Dịch vụ sử dụng - tất cả đều có gói Free:

| Dịch vụ | Mục đích | Giới hạn Free |
|---------|----------|---------------|
| Supabase | Database, Auth, Storage | 500MB DB, 50K users, 1GB Storage |
| Google Drive API | Lưu trữ minh chứng | 15GB miễn phí |
| Cloudflare Pages / Vercel / Netlify | Host web | 100GB băng thông/tháng |
| GitHub | Code, issues, project board | Không giới hạn repo public |

**open23VT sử dụng mã nguồn mở, không tính phí, không quảng cáo, không thu thập dữ liệu.**

## Công nghệ

```
- Vite + React 19 + TypeScript
- Supabase (PostgreSQL + Auth + Storage)
- Tailwind CSS + shadcn/ui
- React Router v7 + TanStack Query
- Google Drive API v3
- Host: Cloudflare Pages / Vercel / Netlify (free)
```

## Dành cho sinh viên low-tech

Bạn không cần biết code. Nếu gặp khó, rủ thêm 1 bạn IT trong lớp phụ giúp — chỉ cần copy-paste hướng dẫn bên dưới.

---

## Hướng dẫn cài đặt chi tiết

### Bước 1: Tạo tài khoản Supabase

1. Vào https://supabase.com → Sign up (đăng ký bằng GitHub)
2. Tạo tổ chức mới → **New project**
3. Điền:
   - **Name**: `open23vt` (hoặc tên bạn muốn)
   - **Database Password**: Đặt mật khẩu mạnh, **nhớ giữ lại**
   - **Region**: Chọn vùng gần bạn nhất (VD: Singapore)
   - Pricing Plan: **Free**
4. Đợi ~2 phút cho database khởi tạo xong

### Bước 2: Chạy SQL migrations

1. Trong Supabase Dashboard, vào **SQL Editor**
2. Mở từng file trong thư mục `supabase/migrations/`, copy nội dung
3. Paste vào SQL Editor và chạy lần lượt theo thứ tự:
   - `00001_init.sql` — tạo bảng profiles, activities, submissions
   - `00002_add_semesters.sql` — thêm bảng semesters
   - `00003_add_storage_config.sql` — thêm bảng storage_config
   - `00004_storage_bucket.sql` — tạo bucket 'minhchung'
   - `00005_fix_storage_config.sql` — sửa cấu hình
   - `00006_fix_storage_rls.sql` — sửa RLS policy
   - `00007_make_bucket_public.sql` — public bucket

### Bước 3: Cấu hình Auth (Google OAuth)

1. Vào Supabase Dashboard → **Authentication** → **Providers**
2. Bật **Google** (nếu chưa bật)
3. Làm theo hướng dẫn để tạo OAuth Client ID:
   - Vào https://console.cloud.google.com
   - Tạo project mới (hoặc chọn project `white-caster-442715-m9` nếu đã share)
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: **Web application**
   - Authorized redirect URIs: thêm `https://<project>.supabase.co/auth/v1/callback`
   - Copy Client ID và Client Secret paste vào Supabase

### Bước 4: Cấu hình Google Drive API

1. Vào Google Cloud Console → APIs & Services → **Enable APIs and Services**
2. Tìm **Google Drive API** → Bật
3. Vào **OAuth consent screen** → Thêm scope: `../auth/drive.file`
4. Cập nhật OAuth Client ID ở trên với scope mới

### Bước 5: Deploy web lên Cloudflare Pages (miễn phí)

1. Fork repo này về GitHub của bạn
2. Vào https://pages.cloudflare.com → **Create a project**
3. Chọn **Connect to Git** → Chọn repo đã fork
4. Cấu hình build:
   - **Framework preset**: `Create React App` (hoặc chọn `None`)
   - **Build command**: `cd DH23VT && npm install && npm run build`
   - **Build output directory**: `DH23VT/dist`
   - **Root directory**: (để trống)
5. Thêm **Environment Variables** (ấn "Add variable"):
   - `VITE_SUPABASE_URL`: lấy từ Supabase Dashboard → Settings → API → Project URL
   - `VITE_SUPABASE_ANON_KEY`: lấy từ Supabase Dashboard → Settings → API → anon public
   - `VITE_SUPABASE_STORAGE_BUCKET`: `minhchung`
   - `VITE_DRIVE_FOLDER_NAME`: `open23VT_MinhChung`
6. Ấn **Save and Deploy** — đợi ~1-2 phút

> **Lưu ý:** Nếu dùng Vercel hoặc Netlify, cách làm tương tự. Nhớ cấu hình biến môi trường giống như trên.

### Bước 6: Tạo tài khoản Admin

1. Vào web vừa deploy, đăng nhập bằng Google
2. Vào Supabase Dashboard → **Table Editor** → Chọn bảng `profiles`
3. Tìm email của lớp trưởng / BCN CLB, sửa cột `role` từ `user` thành `admin`
4. Refresh lại web — sẽ thấy menu Admin

### Bước 7: Tạo học kỳ và hoạt động

1. Đăng nhập với tài khoản admin
2. Vào **Admin** → **Semesters** → Tạo học kỳ (VD: `HK1-2025-2026`)
3. Ấn **Set Active** để set làm học kỳ hiện tại
4. Vào **Activities** → Tạo hoạt động (VD: "Tham gia hội thảo ABC", 10 điểm)

### Bước 8: Sinh viên nộp minh chứng

1. Sinh viên đăng nhập bằng Google
2. Chọn hoạt động đã tham gia, upload ảnh, ấn **Submit**
3. Admin vào **Admin → Submissions** → Duyệt hoặc từ chối
4. Admin có thể xem tổng hợp điểm rèn luyện theo từng sinh viên

---

## Biến môi trường

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `VITE_SUPABASE_URL` | URL Supabase project | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Anon key Supabase | `sb_publishable_xxx` |
| `VITE_SUPABASE_STORAGE_BUCKET` | Tên bucket Supabase Storage | `minhchung` |
| `VITE_DRIVE_FOLDER_NAME` | Tên thư mục Google Drive | `open23VT_MinhChung` |

## Cấu trúc thư mục

```
DH23VT/
├── src/
│   ├── components/     # UI components
│   ├── hooks/          # React hooks (useAuth, useSemester)
│   ├── lib/            # API, storage, drive, supabase clients
│   ├── pages/          # Pages (Home, Submit, Activities, Admin...)
│   └── types/          # TypeScript types
├── supabase/migrations/ # SQL migrations
└── ...config files
```

---

## Known Issues

Dự án này được tạo bởi **vibe coding** — người không chuyên, học code qua AI, nhiều thứ chưa hoàn hảo:

- **UI chưa đẹp** — giao diện cơ bản, thiếu responsive trên mobile
- **Thiếu validation** — chưa kiểm tra dung lượng file upload, chưa giới hạn định dạng ảnh
- **Error handling còn thô** — đôi khi lỗi không hiển thị thông báo thân thiện
- **Không có pagination** — nếu có nhiều submissions, trang sẽ chậm
- **Security cơ bản** — chưa có rate limiting, chưa kiểm tra quyền chi tiết
- **Không có cơ chế backup** — database có thể bị xóa nhầm
- **Chưa có dark mode** — chỉ có giao diện sáng
- **Thiếu unit test** — không có test tự động
- **Không có CI/CD** — phải deploy tay
- **Google Drive token hết hạn** — provider token có thể hết hạn sau 1 giờ, cần refresh

**Bạn muốn cải thiện?** Fork repo, sửa code, tạo Pull Request. Hoặc mở issue trên GitHub để góp ý.

---

## Hỗ trợ và đóng góp

- **Issues**: Mở issue tại https://github.com/aczaao12/open23vt/issues
- **Fork & PR**: Đóng góp code qua Pull Request
- **Liên hệ**: Mở issue hoặc để lại comment trên repo

---

## License

MIT — mã nguồn mở, tự do sử dụng cho mục đích phi thương mại.
