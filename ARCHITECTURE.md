# Angular Web3 Wallet - Tài Liệu Đặc Tả Kiến Trúc Hệ Thống (ARCHITECTURE.md)

Tài liệu này đặc tả chi tiết kiến trúc toàn diện của hệ thống **Angular Web3 Wallet** (bao gồm cả Backend Laravel API và Frontend Angular Web3 DApp Starter Kit) nhằm phục vụ các AI Agent và lập trình viên phát triển hệ thống một cách nhất quán, tuân thủ đúng các mô hình thiết kế đã thiết lập.

---

## 🏗️ 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

Hệ thống được thiết kế theo mô hình kiến trúc hiện đại, phân tách độc lập giữa Backend API và Frontend Web3 DApp:

1. **Backend (Laravel API):** Áp dụng Domain-Driven Design (DDD) lai, CQRS (Command Bus), Event-Driven Architecture (xử lý bất đồng bộ qua Queue), Data Mapper Pattern và cơ chế xác thực bảo mật **JWT Dual Token Architecture** (Access Token trong RAM + Refresh Token trong Cookie HttpOnly).
2. **Frontend (Angular Web3 DApp Starter Kit):** Xây dựng trên nền tảng Angular 22 với kiến trúc Component Standalone hoàn toàn, quản lý trạng thái bằng Angular Signals, tích hợp Reown AppKit + Ethers.js v6, hệ thống Dynamic Modal/Toast, bộ 37+ Web3 UI Component cao cấp và hệ thống Đa ngôn ngữ (i18n) phản ứng.
3. **Smart Contracts & Multi-chain Engine:** Hỗ trợ tương tác với các mạng lưới EVM Blockchain (Ethereum Mainnet, BSC, Polygon, Arbitrum, Avalanche, BSC Testnet...), thực thi ký giao dịch, kiểm tra số dư và ước tính Gas speed.

---

## 🖥️ 2. KIẾN TRÚC BACKEND (Laravel API)

Backend được chia thành các lớp cách ly theo nguyên lý Domain-Driven Design (DDD) lai để tách biệt hoàn toàn nghiệp vụ cốt lõi khỏi cơ sở dữ liệu và hạ tầng.

### A. Cấu trúc Thư mục Lõi (`app/`)

```text
app/
├── Domain/                         # LỚP NGHIỆP VỤ (Chứa Business Rules thuần túy)
│   ├── Entities/                   # Plain Old PHP Objects (POPOs) - KHÔNG kế thừa Eloquent Model
│   ├── Events/                     # Các sự kiện Domain (ví dụ: TransactionCreatedEvent, WalletLinkedEvent)
│   ├── Listeners/                  # Bộ xử lý sự kiện (kế thừa ShouldQueue để xử lý nền)
│   └── Repositories/               # Khai báo các Interface của kho lưu trữ (Domain Contracts)
│
├── Infrastructure/                 # LỚP HẠ TẦNG (Tương tác với DB, Queue, Blockchain)
│   ├── Persistence/
│   │   ├── Eloquent/               # Eloquent Models thực tế (kết nối DB)
│   │   ├── Mappers/                # Ánh xạ qua lại giữa Domain Entity POPO và Eloquent Model
│   │   └── Repositories/           # Cài đặt thực tế các Interface Repositories của Domain
│
├── Application/                    # LỚP ỨNG DỤNG (Điều phối và thực thi nghiệp vụ)
│   ├── Common/Bus/                 # Command Bus (CQRS Dispatcher)
│   ├── Services/                   # Các Business Services nghiệp vụ độc lập
│   └── [Feature]/                  # Chứa Commands, Queries và các Handlers tương ứng
│
└── Http/                           # LỚP GIAO TIẾP (API Controllers, Requests, Middleware)
    ├── Controllers/                # Controllers (Chỉ nhận Request, gọi Service hoặc Command Bus và trả Response)
    ├── Requests/                   # LỚP XÁC THỰC (Form Requests validation độc lập)
    └── Middleware/                 # Các Middleware lọc yêu cầu (ví dụ: cookie-based auth, permission check)
```

### B. Quy tắc Lập trình Backend

1. **Data Mapper Pattern (Bắt buộc với thực thể nghiệp vụ):**
   - **Domain Entity:** Phải là POPO độc lập. Không được import hay sử dụng Eloquent/DB behaviors bên trong Domain.
   - **Eloquent Model:** Nằm dưới lớp `Infrastructure` chịu trách nhiệm định nghĩa schema DB, casts, và relations.
   - **Mapper:** Sử dụng Mapper để ánh xạ kiểu dữ liệu khi lưu/truy vấn qua Repository.
2. **Form Request Validation độc lập (Bắt buộc):**
   - Tuyệt đối không sử dụng `$request->validate(...)` thủ công trực tiếp bên trong Controller.
   - Mọi yêu cầu thêm/sửa dữ liệu phải tạo một lớp `FormRequest` kế thừa từ `Illuminate\Foundation\Http\FormRequest` để quản lý luật validation tách biệt.
3. **Tách biệt Service nghiệp vụ (SRP - Single Responsibility Principle):**
   - Các logic tính toán nghiệp vụ phức tạp hoặc đối soát tài chính/blockchain không được viết trong Controller.
   - Phải chuyển các logic xử lý nghiệp vụ này ra lớp Service độc lập. Controller chỉ đóng vai trò nhận request, inject Service qua Constructor, gọi Service xử lý và trả Response JSON.
4. **Command Bus & CQRS:**
   - Mọi logic thay đổi trạng thái nghiệp vụ cốt lõi phải đóng gói vào một **Command**. Mọi logic đọc dữ liệu đóng gói vào một **Query**.
   - Controller dùng `$this->commandBus->dispatch($command)`.
5. **Xử lý bất đồng bộ (Domain Events & Queue):**
   - Các tác vụ nặng liên quan đến blockchain (đúc NFT, kiểm tra giao dịch on-chain) hoặc gửi email/notification **phải** được tách ra thành Event Listener thực thi qua hàng đợi.
   - Listener phải implements `ShouldQueue` để chạy ngầm.
6. **Bảo mật Token Xác thực & Cơ chế Đăng nhập (JWT Dual Token Architecture):**
   - **Access Token:**
     - Được phát hành trực tiếp trong response body JSON của API đăng nhập.
     - Thời gian sống (TTL): **30 phút**.
     - Dùng cho các yêu cầu xác thực API bằng header `Authorization: Bearer <access_token>`.
   - **Refresh Token:**
     - Được thiết lập tự động bởi máy chủ thông qua cookie `refresh_token` với các cờ bảo mật bắt buộc: `HttpOnly`, `Secure`, `SameSite=Lax` (hoặc `Strict`).
     - Thời gian sống (TTL): **7 ngày**.
     - Cung cấp endpoint `/api/v1/auth/refresh` nhận cookie `refresh_token` để tự động cấp lại Access Token mới (30 phút) và xoay vòng Refresh Token (Token Rotation) mà không bắt người dùng đăng nhập lại.
7. **API Versioning:**
   - Nhóm các API route trong `routes/api.php` thành `/api/v1/...` và `/api/v2/...` để đảm bảo khả năng tương thích ngược khi nâng cấp hệ thống.

---

## 🎨 3. KIẾN TRÚC FRONTEND (Angular Workspace & Web3 DApp)

Frontend sử dụng Angular 22 với mô hình phẳng (Flat Architecture) để tối ưu khả năng bảo trì và tái sử dụng code.

### A. Cấu trúc Thư mục Lõi (`src/app/`)

```text
src/app/
├── app.config.ts                   # Cấu hình Providers toàn cục (Router, Animations, HttpClient, Interceptors...)
├── app.routes.ts                   # Cấu hình Định tuyến đường dẫn (Lazy-loaded feature routes)
├── app.ts                          # Component Root quản lý layout chính
├── app.html                        # Root Template tinh gọn (chứa Header, Navigation & Dynamic Modal/Toast Container)
│
├── core/                           # CÁC DỊCH VỤ VÀ MODULE LÕI (Singleton Services)
│   ├── web3/                       # Khởi tạo Reown AppKit và Web3 Adapters
│   ├── services/                   # Web3Service, AuthService, ThemeService, ModalService, ToastService, TranslationService, StateService...
│   ├── interceptors/               # AuthInterceptor (Gắn Access Token & Tự động Silent Refresh Token)
│   ├── i18n/                       # Từ điển ngôn ngữ (vi.ts, en.ts, i18n.types.ts)
│   └── utils/                      # Utilities hệ thống (blockchain.utils.ts: danh sách POPULAR_CHAINS & RPC backup)
│
├── shared/                         # CÁC THÀNH PHẦN UI VÀ TIỆN ÍCH DÙNG CHUNG
│   ├── components/                 # Bộ 37+ Standalone UI Components:
│   │   ├── language-selector/      # Component Đa Ngôn Ngữ i18n (app-language-selector)
│   │   ├── network-selector/       # Component Chọn Mạng Đa Chain (app-network-selector)
│   │   ├── account-dropdown/       # Component Thông Tin Tài Khoản / Ví Web3 (app-account-dropdown)
│   │   ├── theme-switcher/         # Component Chuyển Theme 3 Vị Trí (app-theme-switcher)
│   │   └── ...                     # (button, input, select, modal, table, file-upload, progress, input-otp, code-block...)
│   ├── layout/                     # HeaderComponent, SidebarComponent (Layout khung ứng dụng)
│   └── pipes/                      # ShortAddressPipe, TranslatePipe, SafeHtmlPipe, VndPipe
│
└── features/                       # CÁC MÀN HÌNH TÍNH NĂNG (Flat Feature Modules)
    ├── home/                       # Trang chủ Dashboard & Web3 Component Showcase (21+ Showcase Cards)
    ├── about/                      # Trang Giới thiệu kiến trúc & tính năng DApp Template
    └── contact/                    # Trang Liên hệ & Gửi phản hồi tương tác
```

---

## ⚙️ 4. CÁC QUY TẮC PHÁT TRIỂN FRONTEND BẮT BUỘC

### A. Quy tắc Mô đun hóa Header & Tái sử dụng Web2/Web3

1. **Phân tách Component Độc lập:**
   - **`app-language-selector`:** Đã được đóng gói độc lập. Có thể tái sử dụng trực tiếp ở bất kỳ dự án Web2 nào.
   - **`app-network-selector`:** Đóng gói độc lập việc chọn mạng blockchain. Dự án Web2 có thể dễ dàng lược bỏ mà không ảnh hưởng đến Header layout.
   - **`app-account-dropdown`:** Đóng gói độc lập nút Kết nối & Dropdown thông tin tài khoản ví. Dự án Web2 có thể dễ dàng thay thế bằng Component User Profile truyền thống.

### B. Quy tắc Quản lý Web3 & Blockchain

1. **Quản lý State Ví bằng Signals:**
   - Mọi trạng thái ví (`account`, `chainId`, `balance`, `isConnected`, `isConnecting`) đều được quản lý tập trung tại `Web3Service` thông qua Angular `signal` và `computed`.
   - Các Component sử dụng trực tiếp signal từ `Web3Service` để tự động render lại UI khi trạng thái ví thay đổi.
2. **Cơ chế RPC Backup & Chain Switching:**
   - Cấu hình các mạng blockchain phổ biến trong `POPULAR_CHAINS` (tại [blockchain.utils.ts](file:///d:/git/angular-web3-wallet/src/app/core/utils/blockchain.utils.ts)).
   - Luôn thiết lập danh sách RPC dự phòng (Backup RPC URLs) đảm bảo ứng dụng hoạt động ổn định kể cả khi RPC chính bị sập hoặc quá tải (ví dụ BSC Testnet fallback RPC `https://bsc-testnet.rpc.sentio.xyz`).
3. **Chức năng Giao dịch & Gas Speed Selector:**
   - Mọi thao tác gửi coin/token phải hỗ trợ chọn tốc độ gas (`tx-speed-selector`: Fast, Standard, Slow) để người dùng chủ động điều chỉnh chi phí transaction.

### C. Quy tắc Quản lý Token & Xác thực trên Frontend (Token Management)

1. **Lưu trữ Access Token hoàn toàn trong RAM:**
   - **Tuyệt đối KHÔNG lưu Access Token vào `localStorage` hoặc `sessionStorage`** để triệt hạ nguy cơ tấn công XSS làm rò rỉ token.
   - Access Token được giữ duy nhất trong một biến private (RAM) bên trong Angular Singleton Service (`AuthService` hoặc `StateService`) với thời gian sống **30 phút**.
2. **Tự động gia hạn Token (Silent Refresh Interceptor):**
   - Tạo Angular HTTP Interceptor (`AuthInterceptor`) tự động thêm header `Authorization: Bearer <access_token>` vào mọi API request gửi tới Backend.
   - Khi API trả về lỗi HTTP `401 Unauthorized` hoặc trước khi Access Token hết hạn (30 phút), `AuthInterceptor` sẽ tạm hoãn các request và tự động gọi endpoint khôi phục `/api/v1/auth/refresh` (Backend sẽ đọc `HttpOnly` Cookie `refresh_token` 7 ngày để cấp mới Access Token vào RAM).
   - Nếu `refresh_token` hết hạn (quá 7 ngày) hoặc không hợp lệ, hệ thống tự động xóa sạch state RAM và điều hướng về màn hình Đăng nhập/Kết nối ví.

### D. Quy tắc Lập trình Component & UI

1. **Path Aliases (Bắt buộc):**
   - Không sử dụng relative path tương đối dài dòng như `../../../../core/services`.
   - Sử dụng các alias khai báo trong `tsconfig.json`:
     - `@core/*` -> `src/app/core/*`
     - `@shared/*` -> `src/app/shared/*`
     - `@features/*` -> `src/app/features/*`
2. **Làm phẳng Tính năng (Flat Features):**
   - Mọi màn hình chính đặt phẳng dưới `src/app/features/` (ví dụ: `features/home`, `features/about`, `features/contact`).
   - Tất cả các component phải tách biệt rõ ràng giữa logic `.component.ts`, template `.component.html`, và style `.component.css` (hoặc scss). Không viết template inline quá 5 dòng.
3. **Cấu hình Component Host Display (CRITICAL):**
   - Tất cả các Angular custom components (ví dụ `app-custom-switch`, `app-custom-select`, `app-language-selector`, `app-network-selector`, `app-account-dropdown`, `app-progress`...) bắt buộc phải khai báo `:host { display: block; }` trong tệp CSS tương ứng để tránh bị trình duyệt coi là inline element làm vỡ khoảng cách margin/spacing thẳng đứng của Tailwind CSS.
4. **Quản lý Modal & Popups (Dynamic Modal Service):**
   - Tuyệt đối không dùng `alert()` hoặc `confirm()` gốc của trình duyệt.
   - Không nhúng cứng thẻ HTML modal (như `<app-modal ...>`) trực tiếp vào template HTML của các trang.
   - Sử dụng `ModalService` để mở/đóng modal động từ TypeScript (`this.modalService.open(...)`).
   - Modal hiển thị tức thì, loại bỏ hoàn toàn các class animation delay để mang lại trải nghiệm phản hồi siêu tốc. Lớp nền sử dụng `bg-black/40` không có hiệu ứng backdrop-blur gây nặng máy.
5. **Hệ thống i18n Đa ngôn ngữ Phản ứng:**
   - Dữ liệu từ điển quản lý trong `src/app/core/i18n/` với 2 ngôn ngữ `vi.ts` và `en.ts`.
   - Sử dụng `TranslationService` kết hợp với `TranslatePipe` (`{{ 'nav.home' | translate }}`).
   - Hỗ trợ component `app-language-selector` với 2 biến thể `compact` và `full`.

---

## 🧪 5. KIỂM THỬ VÀ BIÊN DỊCH (BUILD & TEST)

1. **Biên dịch Dự án (Build Production):**
   - Chạy lệnh `npm run build` để kiểm tra toàn bộ lỗi TypeScript, Angular Template Compiler và Tailwind CSS.
2. **Kiểm thử Đơn vị (Unit Testing):**
   - Sử dụng Vitest (`npm run test`) để chạy các unit test cho component và service.
3. **Đảm bảo trước khi Commit Code:**
   - Luôn chạy build thành công 100% trước khi hoàn thành bất kỳ nhiệm vụ nào.

---

## 🏷️ 6. HƯỚNG DẪN ĐỔI TÊN DỰ ÁN & THƯƠNG HIỆU (PROJECT RENAMING & BRANDING GUIDE)

Khi nhân bản (clone) template này sang dApp mới hoặc đổi tên dự án, AI Agent và Developer thực hiện theo quy trình chuẩn 3 bước sau:

### Bước 1: Cập Nhật Tên Kỹ Thuật (Build, Package & Deploy)

1. **[package.json](file:///d:/git/angular-web3-wallet/package.json):**
   - Cập nhật trường `"name"`:
     ```json
     "name": "ten-du-an-moi"
     ```
2. **[angular.json](file:///d:/git/angular-web3-wallet/angular.json):**
   - Đổi tên key dự án trong object `projects`:
     ```json
     "projects": {
       "ten-du-an-moi": { ... }
     }
     ```
   - Đổi các chuỗi `buildTarget` trong mục `serve` (dòng ~71 & ~74):
     ```json
     "production": {
       "buildTarget": "ten-du-an-moi:build:production"
     },
     "development": {
       "buildTarget": "ten-du-an-moi:build:development"
     }
     ```
3. **[netlify.toml](file:///d:/git/angular-web3-wallet/netlify.toml) (hoặc cấu hình CI/CD Hosting khác):**
   - Cập nhật thư mục output build:
     ```toml
     publish = "dist/ten-du-an-moi/browser"
     ```
4. **Đồng bộ [package-lock.json](file:///d:/git/angular-web3-wallet/package-lock.json):**
   - Chạy lệnh `npm install` để npm tự động đồng bộ tên mới vào lockfile.

---

### Bước 2: Cập Nhật Tên Hiển Thị & Thương Hiệu (UI, Branding & Web3 Modal)

1. **[src/index.html](file:///d:/git/angular-web3-wallet/src/index.html):**
   - Cập nhật tiêu đề tab trình duyệt và logo/favicon:
     ```html
     <title>Tên Ứng Dụng Mới</title>
     <link rel="icon" type="image/svg+xml" href="assets/logo.svg">
     ```
2. **[src/app/core/services/web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts):**
   - Cập nhật `metadata.name` trong hàm `createAppKit` (tên hiển thị trên modal kết nối ví Reown AppKit / WalletConnect):
     ```typescript
     metadata: {
       name: 'Tên Ứng Dụng Mới',
       description: this.translationService.t('about.subtitle'),
       url: window.location.origin,
       icons: [window.location.origin + '/assets/logo.svg']
     }
     ```
3. **Từ Điển Đa Ngôn Ngữ ([src/app/core/i18n/vi.ts](file:///d:/git/angular-web3-wallet/src/app/core/i18n/vi.ts) & [src/app/core/i18n/en.ts](file:///d:/git/angular-web3-wallet/src/app/core/i18n/en.ts)):**
   - Cập nhật các chuỗi định danh thương hiệu trong Header, Sidebar, About Page và Footer.

---

### Bước 3: Kiểm Tra & Xác Thực (Verification)

1. **Kiểm tra TypeScript & Angular Build:**
   ```bash
   npm run build
   ```
   - Đảm bảo thư mục output sinh ra chính xác tại `dist/ten-du-an-moi/browser` và quá trình build đạt exit code `0`.
2. **Kiểm tra Unit Tests:**
   ```bash
   npm run test
   ```


