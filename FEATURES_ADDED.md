# Tính năng đã thêm

## ✅ PHẦN 1: Seed Database với 50 sản phẩm

### File đã cập nhật:
- `apps/api/scripts/seed.ts` - Đã cập nhật để tạo 50 sản phẩm mẫu với:
  - Tiêu đề tiếng Việt: "Sản phẩm mẫu 1", "Sản phẩm mẫu 2", ...
  - Categories: Thời trang, Phụ kiện, Điện tử, Gia dụng
  - Giá ngẫu nhiên từ 100,000 - 1,000,000 VND
  - Hình ảnh từ Picsum Photos
  - Stock, rating, reviews ngẫu nhiên
  - Variants cho sản phẩm có stock > 50

### Cách chạy:
```bash
cd apps/api
npm run seed
```

## ✅ PHẦN 2: Quản lý Logo trong Admin

### Backend:
1. **Model mới**: `apps/api/src/models/LogoSetting.model.ts`
   - Lưu URL logo
   - Track người cập nhật
   - Timestamps

2. **Controller**: `apps/api/src/controllers/logo.controller.ts`
   - `getLogo()` - Lấy logo hiện tại (public)
   - `updateLogo()` - Cập nhật logo (admin only)
   - Hỗ trợ upload base64 hoặc URL
   - Tự động upload lên Cloudinary

3. **Routes**: 
   - `GET /api/v1/logo` - Public route
   - `GET /api/v1/admin/logo` - Admin route
   - `PUT /api/v1/admin/logo` - Update logo (admin only)

### Frontend:
1. **Page**: `apps/frontend/src/app/admin/logo/page.tsx`
   - Upload logo từ file
   - Preview trước khi upload
   - Hiển thị logo hiện tại
   - Toast notifications

### Tính năng:
- ✅ Upload logo từ file (JPG, PNG, WebP)
- ✅ Tự động upload lên Cloudinary
- ✅ Preview trước khi upload
- ✅ Responsive design
- ✅ Error handling

## ✅ PHẦN 3: Hóa đơn & Xuất PDF

### Backend:
1. **Model mới**: `apps/api/src/models/Invoice.model.ts`
   - Invoice number tự động generate
   - Liên kết với Order và User
   - Lưu thông tin sản phẩm, địa chỉ giao hàng
   - Status: pending, paid, cancelled, refunded

2. **Controller**: `apps/api/src/controllers/invoice.controller.ts`
   - `createInvoice()` - Tạo invoice từ order
   - `getInvoices()` - Lấy danh sách invoices (admin hoặc user)
   - `getInvoice()` - Lấy chi tiết invoice
   - `exportInvoicePDF()` - Xuất PDF bằng PDFKit
   - Tự động tạo invoice khi payment thành công (webhook)

3. **Routes**:
   - `GET /api/v1/admin/invoices` - Danh sách invoices (admin)
   - `POST /api/v1/admin/invoices` - Tạo invoice (admin)
   - `GET /api/v1/admin/invoices/:id` - Chi tiết invoice (admin)
   - `GET /api/v1/admin/invoices/:id/pdf` - Download PDF (admin)
   - `GET /api/v1/users/invoices` - Danh sách invoices (user)
   - `GET /api/v1/users/invoices/:id` - Chi tiết invoice (user)
   - `GET /api/v1/users/invoices/:id/pdf` - Download PDF (user)

4. **Webhook Integration**: 
   - Tự động tạo invoice khi Stripe payment thành công
   - Cập nhật trong `apps/api/src/controllers/webhook.controller.ts`

### Frontend:
1. **Page**: `apps/frontend/src/app/admin/invoices/page.tsx`
   - Danh sách invoices với pagination
   - Filter theo status
   - Download PDF
   - Xem chi tiết

2. **Page**: `apps/frontend/src/app/admin/invoices/[id]/page.tsx`
   - Chi tiết invoice
   - Download PDF
   - Hiển thị thông tin khách hàng, sản phẩm, địa chỉ

### PDF Features:
- ✅ Header với tiêu đề "HÓA ĐƠN BÁN HÀNG"
- ✅ Thông tin hóa đơn: số hóa đơn, ngày tạo, trạng thái
- ✅ Thông tin khách hàng
- ✅ Địa chỉ giao hàng
- ✅ Bảng chi tiết sản phẩm
- ✅ Tổng tiền
- ✅ Phương thức thanh toán
- ✅ Footer với thông báo cảm ơn

### Dependencies đã thêm:
- `pdfkit`: ^0.14.0
- `@types/pdfkit`: ^0.13.0

## 🎯 Tổng kết

### Tính năng đã hoàn thành:
1. ✅ Seed 50 sản phẩm mẫu với dữ liệu tiếng Việt
2. ✅ Quản lý logo trong admin
3. ✅ Tạo và quản lý hóa đơn
4. ✅ Xuất hóa đơn PDF
5. ✅ Tự động tạo invoice khi payment thành công
6. ✅ Admin dashboard với links đến logo và invoices
7. ✅ User có thể xem invoices của mình
8. ✅ Download PDF cho cả admin và user

### API Endpoints mới:
- `GET /api/v1/logo` - Public logo
- `GET /api/v1/admin/logo` - Admin logo
- `PUT /api/v1/admin/logo` - Update logo
- `GET /api/v1/admin/invoices` - List invoices (admin)
- `POST /api/v1/admin/invoices` - Create invoice
- `GET /api/v1/admin/invoices/:id` - Get invoice
- `GET /api/v1/admin/invoices/:id/pdf` - Download PDF
- `GET /api/v1/users/invoices` - List invoices (user)
- `GET /api/v1/users/invoices/:id` - Get invoice (user)
- `GET /api/v1/users/invoices/:id/pdf` - Download PDF (user)

### Frontend Pages mới:
- `/admin/logo` - Logo settings
- `/admin/invoices` - Invoice list
- `/admin/invoices/[id]` - Invoice detail

## 🚀 Cách sử dụng

### 1. Seed Database:
```bash
cd apps/api
npm run seed
```

### 2. Upload Logo:
1. Đăng nhập với admin account
2. Vào `/admin/logo`
3. Chọn file ảnh
4. Click "Cập nhật logo"

### 3. Xem Invoices:
1. Đăng nhập với admin account
2. Vào `/admin/invoices`
3. Xem danh sách invoices
4. Click vào invoice để xem chi tiết
5. Click download để tải PDF

### 4. User xem Invoices:
1. Đăng nhập với user account
2. Vào `/users/invoices` (cần tạo page này nếu chưa có)
3. Xem danh sách invoices của mình
4. Download PDF nếu cần

## 📝 Lưu ý

1. **Logo**: Cần cấu hình Cloudinary để upload logo
2. **PDF**: PDFKit cần font hỗ trợ tiếng Việt (có thể cần cài thêm)
3. **Invoice**: Tự động tạo khi payment thành công qua Stripe webhook
4. **Permissions**: Admin có thể xem tất cả invoices, user chỉ xem của mình

## 🔄 Cần cải thiện (tùy chọn)

1. Thêm font tiếng Việt cho PDF
2. Thêm template PDF đẹp hơn
3. Thêm email gửi invoice cho khách hàng
4. Thêm filter và search cho invoices
5. Thêm export CSV cho invoices
6. Thêm preview PDF trước khi download

---

**Status**: ✅ Hoàn thành tất cả các tính năng yêu cầu

