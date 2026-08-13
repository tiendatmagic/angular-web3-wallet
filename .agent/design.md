# Hướng dẫn Thiết kế Giao diện & Hệ thống Style (Design System Specification)

Tài liệu này đặc tả toàn bộ quy chuẩn thiết kế giao diện UI/UX của dự án **Angular Web3 Wallet Template** (Web3 DApp Starter Kit & Component Showcase).

---

## 1. Typography (Phông chữ & Kiểu chữ)

- **Phông chữ mặc định**: Sử dụng phông chữ **`Quicksand`** (phông chữ sans-serif bo tròn hiện đại, tạo cảm giác thân thiện, trẻ trung và cao cấp).
  - Tệp phông chữ được tích hợp sẵn trong ứng dụng (`public/fonts/quicksand/`) để tối ưu tốc độ tải trang và hoạt động mượt mà offline.
  - **CSS Variables**: `--font-sans` và `--font-display`.
  - **Fallback**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
- **Kích thước & Độ đậm chữ (Font Size & Weight)**:
  - `text-xs` (12px) / `font-bold` hoặc `font-extrabold`: Dùng cho nhãn phụ, thông tin nhỏ, trạng thái thẻ, badge, nhãn form field.
  - `text-sm` (14px) / `font-semibold` hoặc `font-bold`: Dùng cho văn bản nội dung, thông tin bảng biểu, ô nhập liệu (Input), nút bấm nhỏ, dropdown menu items.
  - `text-base` (16px) / `font-bold` hoặc `font-black`: Dùng cho tiêu đề sản phẩm/thẻ, nút thao tác chính, số dư tiền ví Web3.
  - `text-lg` đến `text-xl` (18px - 20px) / `font-extrabold`: Dùng cho tiêu đề mục, tiêu đề card showcase.
  - `text-2xl` đến `text-3xl` (24px - 30px) / `font-black` hoặc `font-extrabold`: Dùng cho tiêu đề trang lớn, số liệu tổng quan trên Web3 Dashboard.

---

## 2. Hệ màu sắc Động (Dynamic Color Palette)

Hệ thống sử dụng cơ chế màu sắc động (Dynamic Theme) cho phép thay đổi linh hoạt tông màu thương hiệu DApp.

### 2.1. Màu sắc mặc định thương hiệu Web3 DApp

- **Màu chủ đạo (Primary Accent)**: **Tím Hồng Neon (`#ff00dd` / `#7c3aed`)** - CSS Variable: `--dynamic-primary` / `--color-primary`.
- **Màu phụ trợ (Secondary Accent)**: **Tím Sáng Neon (`#8000ff` / `#c084fc`)** - CSS Variable: `--dynamic-secondary` / `--color-secondary`.
- **Fallback tĩnh**: Định nghĩa sẵn tại `:root` trong CSS toàn cục để đảm bảo không bị mất màu khi chưa kết nối ví hoặc vừa xóa cache.

### 2.2. Ánh xạ biến màu Tailwind v4 (Color Mapping)

Các biến dynamic được ánh xạ vào Tailwind CSS v4 thông qua `@theme`:

```css
--color-primary: var(--dynamic-primary, #ff00dd);
--color-secondary: var(--dynamic-secondary, #8000ff);

--color-purple-50: color-mix(in srgb, var(--color-primary) 5%, white);
--color-purple-100: color-mix(in srgb, var(--color-primary) 12%, white);
--color-purple-400: var(--color-secondary);
--color-purple-500: var(--color-primary);
--color-purple-600: #7c3aed;
--color-purple-650: #8000ff;
```

### 2.3. Màu nền (Background Colors)

- **Chế độ Sáng (Light Mode)**:
  - Nền ứng dụng (Body bg): Slate nhạt (`#f8fafc`).
  - Nền thẻ (Card bg): Trắng mờ Glassmorphism hoặc trắng đặc (`bg-white/60` hoặc `bg-white`).
- **Chế độ Tối (Dark Mode)**:
  - Nền ứng dụng (Body bg): Slate-950/Gray-950 siêu tối (`#030712`).
  - Nền thẻ (Card bg): Slate-900 trong suốt hoặc Slate-950 (`bg-slate-900/60` hoặc `bg-slate-950`).

---

## 3. Bố cục & Khung chứa (Layout & Container)

Để giao diện cân đối, nhất quán và hiển thị hoàn hảo trên mọi kích thước màn hình kể cả UltraWide (2K/4K/49-inch):

- **Chiều rộng tối đa (Max Width Constraint)**: Toàn bộ trang Dashboard, Showcase Cards, và các trang tính năng đều được bọc trong container giới hạn:
  - **Class**: `max-w-[1530px] mx-auto w-full px-4 sm:px-6`
  - Đảm bảo giao diện luôn được căn giữa màn hình và tối ưu hóa diện tích hiển thị.
- **Cột & Lưới (Grid & Flex System)**:
  - Sử dụng CSS Grid linh hoạt: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6` để hiển thị các Showcase Card.
  - Layout hai cột chính (Sidebar + Nội dung chính): Sidebar rộng `w-64` cố định trên Desktop, thu gọn/chuyển thành Drawer trên Mobile.
- **Bố cục biểu mẫu & Nhãn trường (Form & Field Labels)**:
  - Tái cấu trúc các trường nhập liệu thành lưới trên Desktop (`grid grid-cols-1 md:grid-cols-2 gap-6`).
  - **Nhãn của trường nhập liệu (Field Label)**: Tất cả nhãn trường (label) phải tuân theo quy chuẩn đồng bộ: chữ in hoa (`uppercase`), màu chữ mờ nhẹ (`text-slate-400 dark:text-slate-500`), cỡ chữ `text-xs`, font chữ đậm `font-bold` hoặc `font-black`, kết hợp với tracking rộng (`tracking-wider`) và ngăn chặn lựa chọn text (`select-none`).
  - **Quy tắc bọc `.form-field`**: Bọc thẻ `<label>` và control nhập liệu bên trong container `.form-field`.

---

## 4. Bo góc & Đường viền (Border Radius & Borders)

- **Giới hạn Bo góc tối đa (Border Radius Constraint)**: Cap tối đa độ bo góc của các thẻ, ô nhập liệu và khung chứa là **`15px`**.
  - **CSS Variable Overrides**:
    ```css
    --radius-xl: 15px;
    --radius-2xl: 15px;
    --radius-3xl: 15px;
    --radius-4xl: 15px;
    ```
  - Nút bấm, ô nhập liệu sử dụng `rounded-xl` hoặc `rounded-2xl` (tương đương tối đa `15px`).
- **Đường viền (Borders)**:
  - Đường viền 1px mảnh mờ hiện đại theo phong cách Glassmorphism:
    - Chế độ Sáng: `border border-slate-200/60` hoặc `border-slate-200/50`.
    - Chế độ Tối: `dark:border-slate-800/60` hoặc `dark:border-slate-800/50`.
  - **Nút bấm inline & Cancel Button**: Toàn bộ nút inline, nút cancel, dropdown menu triggers sử dụng đồng bộ `border border-slate-200/60 dark:border-slate-800/60 shadow-xs`.
  - **Phẳng hóa giao diện (Flat Design)**: Không dùng các đường kẻ vạch nằm ngang (`border-t`) để chia cắt tiểu mục. Sử dụng khoảng cách dọc đồng bộ (`space-y-6`) để tạo sự mạch lạc tự nhiên.

---

## 5. Bóng đổ & Hoạt ảnh (Shadows & Micro-animations)

- **Bóng đổ (Shadows)**:
  - Sử dụng bóng đổ có màu thương hiệu mờ thay cho bóng đen thô: `shadow-lg shadow-[var(--dynamic-primary)]/20` hoặc `shadow-md shadow-purple-500/10`.
- **Hoạt ảnh tương tác (Hover & Active States)**:
  - Hover: `hover:scale-[1.01]` hoặc `hover:scale-[1.02]`, `hover:shadow-lg`, `transition-all duration-300`.
  - Click (Active): `active:scale-[0.98]` hoặc `active:scale-95`.
  - Sidebar Active Item: `bg-purple-50 dark:bg-purple-950/30` kèm chữ màu thương hiệu `!text-purple-600 !dark:text-purple-400`.

---

## 6. Thành phần Giao diện Đặc trưng (Web3 UI Component Specifications)

### 6.1. Thiết kế Kính mờ (Glassmorphism Cards & Banners)

- Nền kính mờ: `bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-lg`.

#### 6.1.1. Hệ thống Glass Surface 3 cấp

Các bề mặt nổi phải dùng utility toàn cục trong `src/styles.scss`; không lặp lại các class `bg-*`, `backdrop-blur-*` và `shadow-*` tại từng component:

```scss
.glass-popover {
  @apply bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
    shadow-lg shadow-slate-900/10 dark:shadow-slate-950/50;
}

.glass-dialog {
  @apply bg-transparent shadow-lg shadow-slate-900/15 dark:shadow-slate-950/60;
  position: relative;
  isolation: isolate;
}

.glass-dialog-backdrop {
  @apply absolute inset-0 -z-10 rounded-[inherit] pointer-events-none
    bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl;
}

.glass-header {
  @apply bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl;
}
```

- `glass-popover`: Custom Select, Date Picker, DateTime Range, menu chọn giờ/phút, Dropdown Menu, nested submenu, Language Selector, Network Selector và Account Dropdown.
- `glass-dialog`: Modal, Modal Wrapper, Confirm Modal, Drawer, mobile sidebar và modal xem trước File Upload.
- `glass-header`: sticky header; không dùng shadow cho header.
- Border, radius, positioning, overflow và z-index vẫn khai báo riêng theo cấu trúc từng component.

#### 6.1.2. Quy tắc Backdrop Root và Popover lồng nhau

- Không đặt popover cần blur bên trong phần tử cha có `backdrop-filter`, `filter`, opacity animation hoặc transform animation. Chúng có thể tạo backdrop/stacking context và làm blur của component con mất tác dụng.
- Glass background của sticky header phải là layer `absolute inset-0` độc lập. Nội dung header và dropdown nằm ở sibling layer `relative` để dropdown blur trực tiếp nội dung trang.
- `glass-dialog` phải có một DOM layer con `glass-dialog-backdrop` đứng trước nội dung. Không dùng pseudo-element với `dark:*` và không đặt `backdrop-filter` trực tiếp lên dialog cha. Quy tắc này cho phép Tailwind biên dịch dark mode đúng và cho Date Picker, DateTime Range, Select cùng dropdown bên trong Modal blur độc lập.
- Nested submenu của `app-dropdown-menu` phải render ngang hàng với menu cha, không nằm bên trong surface có `backdrop-filter`.
- Overlay của Drawer phải là sibling của drawer surface. Chỉ overlay fade opacity; không animate opacity trên container cha chứa `glass-dialog`.

#### 6.1.3. Drawer và Mobile Sidebar Motion

- Click overlay bên ngoài Drawer/mobile sidebar phải đóng component; click bên trong surface không đóng.
- Drawer giữ DOM trong 300ms khi đóng: drawer trượt ra ngoài, bottom drawer trượt xuống và overlay fade-out trước khi tháo DOM.
- Mobile sidebar phải có trạng thái đóng ngay trong CSS mặc định: shell `visibility: hidden`, backdrop `opacity: 0`, panel `translateX(-100%)`. Chỉ modifier `--open` mới hiển thị panel.
- Khi đóng mobile sidebar, trì hoãn `visibility: hidden` 300ms để transition chạy xong. Quy tắc này ngăn sidebar xuất hiện trong frame đầu khi reload.

### 6.2. Backdrop Overlay cho Modal & Drawer

- Màu sắc: `bg-black/40` thống nhất.
- Không dùng `backdrop-blur-*` để tối ưu hiệu năng đồ họa trên mọi thiết bị.

### 6.3. Kiến trúc Modal Động & Không Animation Delay

- Điều khiển qua `ModalService` và `ModalRef`.
- Loại bỏ animation delay (`fade-in`, `zoom-in-95`...) giúp modal bật mở tức thì.

### 6.4. Nút bấm (Buttons)

- **Primary Button**: Gradient chuyển màu thương hiệu `bg-gradient-to-r from-[var(--dynamic-primary)] to-[var(--dynamic-secondary)] text-white font-extrabold shadow-md shadow-purple-500/20`.
- **Secondary/Outline Button**: `bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20` hoặc `border border-slate-200/60 dark:border-slate-800/60 shadow-xs`.
- **Cancel / Inline Action Button**: `bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800/60 shadow-xs`.

### 6.5. Biểu tượng Vector SVG (100% NO Raw Emojis)

- Tuyệt đối không dùng Emoji thô trong UI. Sử dụng 100% inline SVG icons qua `<app-icon>`.

### 6.6. Đa ngôn ngữ (i18n Dropdown Component)

- Component `app-language-selector` hỗ trợ 2 biến thể `compact` (Header) và `full` (Sidebar). Hiển thị cờ quốc gia SVG và tick mark active.

### 6.7. Các Component Cao cấp Khác (Progress, File Upload, OTP Input, Code Block, Table, Voice Chat, Theme Switcher)

- Tất cả các component đều thiết lập `:host { display: block; }`, hỗ trợ đầy đủ Light Mode / Dark Mode và tuân thủ giới hạn bo góc 15px.
