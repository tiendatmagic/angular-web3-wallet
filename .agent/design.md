# Hướng dẫn Thiết kế Giao diện & Hệ thống Style (Design System Specification)

Tài liệu này đặc tả toàn bộ quy chuẩn thiết kế giao diện UI/UX của dự án **Angular Web3 Wallet Template** (Web3 DApp Starter Kit & Component Showcase).

---

## 1. Typography & Tương tác Văn bản (Typography & Interaction)

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
- **Quy tắc Tránh Chọn Văn bản (`select-none`)**:
  - Toàn bộ các phần tử điều khiển tương tác (nút bấm `.btn`, nhãn `.form-label`, tab items `.tab-item`, badge tương tác, switch, checkbox, radio, slider handle, avatar counter, popover/dropdown trigger và menu items) **bắt buộc** phải gán class `select-none` để tránh hiện tượng bôi đen văn bản khi click đúp hoặc thao tác nhanh.

---

## 2. Hệ màu sắc Động & Token Tailwind v4 (Dynamic Colors & Theme Tokens)

Hệ thống sử dụng cơ chế màu sắc động (Dynamic Theme) cho phép thay đổi linh hoạt tông màu thương hiệu DApp kết hợp với hệ thống biến CSS Tailwind CSS v4 `@theme`.

### 2.1. Màu sắc mặc định thương hiệu Web3 DApp

- **Màu chủ đạo (Primary Accent)**: **Tím Hồng Neon (`#ff00dd` / `#7c3aed`)** - CSS Variable: `--dynamic-primary` / `--color-primary`.
- **Màu phụ trợ (Secondary Accent)**: **Tím Sáng Neon (`#8000ff` / `#c084fc`)** - CSS Variable: `--dynamic-secondary` / `--color-secondary`.
- **Fallback tĩnh**: Định nghĩa sẵn tại `:root` trong CSS toàn cục để đảm bảo không bị mất màu khi chưa kết nối ví hoặc vừa xóa cache:
  ```css
  :root {
    --dynamic-primary: #ff00dd;
    --dynamic-secondary: #8000ff;
  }
  html.dark {
    --dynamic-secondary: #c084fc;
  }
  ```

### 2.2. Ánh xạ biến màu & Tokens trong Tailwind CSS v4 `@theme`

```css
@theme {
  --font-sans: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-display: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

  --color-primary: var(--dynamic-primary, #ff00dd);
  --color-secondary: var(--dynamic-secondary, #8000ff);

  --radius-xl: 15px;
  --radius-2xl: 15px;
  --radius-3xl: 15px;
  --radius-4xl: 15px;

  --animate-toast-in: toastSlideIn 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  --animate-popover-in: popoverIn 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  --animate-drawer-backdrop-in: drawerFadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  --animate-drawer-backdrop-out: drawerFadeOut 250ms ease-in forwards;
  --animate-scale-up: scaleUp 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  --animate-otp-caret: otp-caret-blink 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  --animate-fade-in: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  --animate-progress-striped: progress-stripe-move 1s linear infinite;
  --animate-progress-indeterminate: progress-indeterminate 1.8s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
}
```

### 2.3. Màu nền (Background Colors)

- **Chế độ Sáng (Light Mode)**:
  - Nền ứng dụng (Body bg): Slate-50 (`#f8fafc`).
  - Nền thẻ (Card bg): Trắng mờ Glassmorphism hoặc trắng đặc (`bg-white/60` hoặc `bg-white`).
- **Chế độ Tối (Dark Mode)**:
  - Nền ứng dụng (Body bg): Slate-950 siêu tối (`#030712`).
  - Nền thẻ (Card bg): Slate-900 trong suốt hoặc Slate-950 (`bg-slate-900/60` hoặc `bg-slate-950`).

---

## 3. Bố cục, Khung chứa & Hệ thống Form Label (Layout, Containers & Form Standards)

Để giao diện cân đối, nhất quán và hiển thị hoàn hảo trên mọi kích thước màn hình kể cả UltraWide (2K/4K/49-inch):

- **Chiều rộng tối đa (Max Width Constraint)**: Toàn bộ trang Dashboard, Showcase Cards, và các trang tính năng đều được bọc trong container giới hạn:
  - **Class**: `max-w-[1530px] mx-auto w-full px-4 sm:px-6`
  - Đảm bảo giao diện luôn được căn giữa màn hình và tối ưu hóa diện tích hiển thị.
- **Cột & Lưới (Grid & Flex System)**:
  - Sử dụng CSS Grid linh hoạt: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6` để hiển thị các Showcase Card.
  - Layout hai cột chính (Sidebar + Nội dung chính): Sidebar rộng `w-64` cố định trên Desktop, thu gọn/chuyển thành Drawer trên Mobile.
- **Quy Chuẩn Nhãn Trường Nhập Liệu (Form Label & Form Field Standardization)**:
  - **Utility `.form-label` Toàn Cục**:
    ```scss
    @utility form-label {
      @apply block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none;
    }
    ```
  - **Quy tắc Selector `.form-field`**:
    ```scss
    @utility form-field {
      @apply flex flex-col gap-2 w-full;

      & > label,
      & > div > label:not(.group):not([class*="custom-"]):not(.sr-only),
      .form-label {
        @apply block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none;
      }
    }
    ```
  - **Quy định sử dụng Label**:
    - Trường form tiêu chuẩn: Bọc thẻ `<label>` và ô nhập liệu bên trong `.form-field`.
    - Khi label nằm trong header flexbox mở rộng (có badge hoặc icon), bộ selector của `.form-field` tự động nhận diện.
    - Khi label nằm ngoài `.form-field` (như trong Modal xác nhận xóa, nhãn tiêu đề trong Custom DateTime Range, Speed Selector, Card options), **bắt buộc** gán class `form-label` hoặc `<span class="form-label">` để đồng bộ 100% typography.
- **Form Controls Utilities**:
  ```scss
  @mixin form-control-base {
    @apply w-full text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20;
  }
  @utility form-input { @include form-control-base; @apply h-[42px] px-4; }
  @utility form-input-password { @apply pr-11; }
  @utility form-textarea { @include form-control-base; @apply py-3 px-4 transition-[background-color,color,box-shadow] duration-200 resize-none; }
  @utility search-input { @include form-control-base; @apply h-[42px] pl-9 pr-4 transition-[background-color,color,box-shadow] duration-200; }
  ```

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
  - **Phẳng hóa giao diện (Flat Design)**: Tuyệt đối **không dùng** các đường kẻ vạch nằm ngang (`border-t`) để chia cắt tiểu mục. Sử dụng khoảng cách dọc đồng bộ (`space-y-6`) để tạo sự mạch lạc tự nhiên.

---

## 5. Hiệu Năng Chuyển Động, Bóng Đổ & Hoạt Ảnh (Transitions, Shadows & Motion)

### 5.1. 🚫 QUY TẮC VÀNG VỀ CSS TRANSITION & HIỆU NĂNG 60-120FPS

Để đảm bảo hiệu năng cực đại, không gây lag CPU, giật khung hình hay layout shifts:

1. **CẤM HOÀN TOÀN `transition-all`**:
   - `transition-all` buộc trình duyệt phải theo dõi tất cả các thuộc tính CSS trên từng frame render.
   - **Bắt buộc** khai báo danh sách thuộc tính cụ thể, ví dụ:
     - Component lớn: `transition-[transform,scale,background-color,color,box-shadow,opacity] duration-300 ease-out`
     - Nút bấm / Input: `transition-[transform,scale,background-color,background-image,color,box-shadow,opacity] duration-200`
     - Tooltip: `transition-[opacity,transform] duration-150`
2. **CẤM TUYỆT ĐỐI TRANSITION CHO `border` VÀ `padding`**:
   - Chuyển màu/độ dày viền (`border`, `border-color`, `border-width`) hoặc đệm lề (`padding`, `padding-*`) tạo ra chi phí reflow & rasterization đắt đỏ.
   - Loại bỏ transition cho border và padding giúp phản hồi visual của nút/thẻ tức thì và sắc nét.
3. **Whitelist các thuộc tính được phép transition**:
   - `transform`, `scale`, `background-color`, `background-image`, `color`, `box-shadow`, `opacity`, `width`, `height`, `stroke-dashoffset`, `grid-template-rows`, `left`, `top`, `border-radius`, `filter`.

### 5.2. Hoạt Ảnh Avatar & Avatar Group Motion Standard

Áp dụng cho `AvatarComponent` (Single Avatar, Avatar Group Stack & `+N Counter`):

- **GPU Acceleration**: Sử dụng `transform-gpu` chống vỡ pixel / răng cưa khi phóng to.
- **Đường cong đàn hồi cao cấp (Spring Physics 500ms)**:
  - `duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]` tạo hiệu ứng nảy nhẹ tự nhiên, êm dịu.
- **Single Avatar**:
  - Wrapper: `hover:-translate-y-1.5 hover:scale-110`
  - Đồng bộ status dot: `group-hover/avatar:scale-110`
  - Bóng mờ: `group-hover/avatar:shadow-xl group-hover/avatar:shadow-purple-500/25`
- **Avatar Group Items & `+N Counter`**:
  - `hover:z-30 hover:-translate-y-2 hover:scale-110 hover:shadow-xl hover:shadow-purple-500/25`
  - Đệm lề an toàn: `py-1.5 px-1` tránh bị cắt bóng ở viền ngoài.

### 5.3. Hệ Thống Phát Sáng Aura Glow & Gradient Conic

Được định nghĩa trong `src/styles.scss` phục vụ thẻ Web3 cao cấp:

- **Tokens**: `.aura-wrapper`, `.aura-glow`, `.aura-border`, `.aura-content`, `@property --aura-angle`.
- **Gradients**: `.gradient-primary`, `.gradient-secondary`, `.gradient-dual`, `.gradient-rainbow`, `.gradient-holo`, `.gradient-gold`, `.gradient-silver`, `.gradient-glow`.
- Tự động tạm dừng animation khi container có class `.is-paused` để tiết kiệm GPU.

### 5.4. Hoạt Ảnh Tương Tác Click (Active State) & Ripple

- Click (Active): `active:scale-[0.98]` hoặc `active:scale-95`.
- Ripple Effect (`appRipple`): Tự động tính toán vị trí click và hiệu ứng gợn sóng qua `.app-ripple-element` với biến tùy chỉnh `--ripple-duration` và `--ripple-opacity`.

---

## 6. Đặc Tả Chi Tiết Thành Phần Giao Diện (Web3 UI Component Specifications)

### 6.1. Thiết kế Kính mờ (Glassmorphism Surfaces)

#### 6.1.1. Hệ thống Glass Surface 3 cấp toàn cục

Các bề mặt nổi sử dụng các utility toàn cục trong `src/styles.scss`:

```scss
@utility glass-popover {
  @apply bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-slate-900/10 dark:shadow-slate-950/50;
}

@utility glass-dialog {
  @apply bg-transparent shadow-lg shadow-slate-900/15 dark:shadow-slate-950/60;
  isolation: isolate;
}

@utility glass-dialog-backdrop {
  @apply absolute inset-0 -z-10 rounded-[inherit] pointer-events-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl;
}

@utility glass-header {
  @apply bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl;
}
```

- `glass-popover`: Custom Select, Date Picker, DateTime Range, menu chọn giờ/phút, Dropdown Menu, nested submenu, Language Selector, Network Selector và Account Dropdown.
- `glass-dialog`: Modal, Modal Wrapper, Confirm Modal, Drawer, mobile sidebar và modal xem trước File Upload.
- `glass-header`: sticky header; không dùng shadow cho header.

#### 6.1.2. Quy tắc Backdrop Root và Popover lồng nhau

- Không đặt popover cần blur bên trong phần tử cha có `backdrop-filter`, `filter`, opacity animation hoặc transform animation.
- Glass background của sticky header phải là layer `absolute inset-0` độc lập. Nội dung header và dropdown nằm ở sibling layer `relative` để dropdown blur trực tiếp nội dung trang.
- `glass-dialog` phải có layer con `glass-dialog-backdrop` đứng trước nội dung. Không dùng pseudo-element với `dark:*` và không đặt `backdrop-filter` trực tiếp lên dialog cha.
- Nested submenu của `app-dropdown-menu` phải render ngang hàng với menu cha, không nằm bên trong surface có `backdrop-filter`.

#### 6.1.3. Drawer và Mobile Sidebar Motion

- Click overlay bên ngoài Drawer/mobile sidebar phải đóng component; click bên trong surface không đóng.
- Drawer giữ DOM trong 250-300ms khi đóng: drawer trượt ra ngoài, bottom drawer trượt xuống và overlay fade-out trước khi tháo DOM.
- Mobile sidebar có trạng thái đóng ngay trong CSS mặc định: shell `visibility: hidden`, backdrop `opacity: 0`, panel `translateX(-100%)`. Chỉ modifier `--open` mới hiển thị panel.

### 6.2. Backdrop Overlay cho Modal & Drawer

- Màu sắc: `bg-black/40` thống nhất.
- Không dùng `backdrop-blur-*` trên overlay để tối ưu hiệu năng đồ họa trên mọi thiết bị.

### 6.3. Kiến trúc Modal Động & Không Animation Delay

- Điều khiển qua `ModalService` và `ModalRef`. Không dùng native `alert` / `confirm` của trình duyệt.
- Loại bỏ animation delay (`fade-in`, `zoom-in-95`...) giúp modal phản hồi bật mở tức thì.

### 6.4. Hệ Thống Nút Bấm Toàn Diện (Button System Token Catalog)

Tất cả các nút đều kế thừa `.btn` cơ sở với `select-none`, `cursor-pointer` và GPU-optimized transition:

| Class Nút | Mục đích & Đặc điểm Visual |
| :--- | :--- |
| `.btn-primary` | Nút hành động chính: gradient từ `--color-primary` sang `--color-secondary`, text trắng, `shadow-md shadow-primary/15 hover:shadow-primary/25`. |
| `.btn-secondary` | Nút phụ trợ thương hiệu: nền mờ `bg-primary/[0.08]` (dark: `bg-secondary/[0.12]`), viền `border-primary/[0.20]`, chữ màu thương hiệu. |
| `.btn-danger` | Nút nguy hiểm / Xóa: `bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/15`. |
| `.btn-danger-light` | Nút cảnh báo nhẹ: `bg-rose-500/[0.08] border border-rose-500/20 text-rose-600 dark:text-rose-300 shadow-xs`. |
| `.btn-cancel` | Nút hủy / Đóng: `bg-slate-200/90 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-800/50 shadow-xs`. |
| `.btn-ghost` | Nút trong suốt không viền: `bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300`. |
| `.btn-success` | Nút thành công / Xác nhận: `bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/15`. |
| `.btn-info` | Nút thông tin: `bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/15`. |
| `.btn-outline` / `.btn-reload` | Nút viền tinh giản: nền trắng / slate-950, viền slate mảnh, hover đổi màu primary, `shadow-2xs`. |
| `.btn-close` / `.btn-close-sm` | Nút đóng icon (X): kích thước 32px / 28px tròn hoặc bo góc vuông mềm, `active:scale-95`. |

**Modifiers Kích cỡ Nút**:
- `.btn-sm`: `px-3 py-1.5 text-xs rounded-lg gap-1`
- `.btn-md`: `px-4 py-2.5 text-sm rounded-xl gap-1.5`
- `.btn-lg`: `px-6 py-3.5 text-base rounded-[12px] gap-2 font-extrabold`
- `.btn-full`: `w-full justify-center`

### 6.5. Biểu Tượng Vector SVG (100% NO Raw Emojis)

- **Quy tắc bắt buộc**: Tuyệt đối không dùng Emoji thô trong UI (☕, 🛒, 💵, 🏦...).
- Sử dụng 100% inline SVG icons tối ưu qua `<app-icon name="...">`.

### 6.6. Multi-Language Selector (`LanguageSelectorComponent`)

- **Biến thể `compact`**: Dùng cho Navbar / Header, layout dạng `inline-block`.
- **Biến thể `full`**: Dùng cho Sidebar và Form Showcase.
  - Host binding: `[class.w-full]="variant === 'full'"`, `[class.block]="variant === 'full'"`.
  - Container trigger: `w-full flex items-center justify-between` với text tên ngôn ngữ bọc `min-w-0 truncate`.
  - Popover dropdown: `absolute left-0 right-0 w-full min-w-[220px]`, tiêu đề mục có `whitespace-nowrap` đảm bảo không bị co hẹp làm gãy chữ hay cắt cụt tên ngôn ngữ ("Tiếng Việt", "English").

### 6.7. Custom Checkbox & Custom Radio (`items-center` Standard)

- **Căn chỉnh trục dọc**: Cả `<app-custom-checkbox>` và `<app-custom-radio>` phải sử dụng `items-center` trên thẻ bọc:
  ```html
  <label class="group flex items-center gap-3 cursor-pointer select-none" ...>
  ```
- **Tuyệt đối không dùng**: `items-start` kết hợp đệm lề bù trừ `pt-0.5` (tránh hiện tượng lệch tâm so với văn bản khi đứng cạnh nhau hoặc trong bảng dữ liệu).
- Hỗ trợ đầy đủ Angular `ControlValueAccessor`, Signal state, disabled state và trạng thái error.

### 6.8. Component Đo Tiến Trình & SVG Gauges (`ProgressComponent`)

Hỗ trợ 4 kiểu hiển thị: `bar`, `segmented`, `circle` (vòng tròn), `semicircle` (bán nguyệt):

- **SVG Gauge Native ViewBox**:
  - Dạng `circle`: Sử dụng native `<svg viewBox="0 0 100 100">`
  - Dạng `semicircle`: Sử dụng native `<svg viewBox="0 0 100 58">`
  - **Lưu ý kỹ thuật**: Không dùng `<app-icon>` để bọc SVG gauge vì `app-icon` bị ràng buộc kích thước cố định 20px x 20px trong `index.html`.
- **Quy tắc hiển thị Header/Label**:
  - Tiêu đề trên đỉnh (`label`, `showValue`) **chỉ hiển thị khi `type === 'bar'`**.
  - Các dạng `circle` và `semicircle` hiển thị phần trăm và nhãn ở chính giữa tâm hoặc chân vòm.
- **Tối ưu Transition Gauge**:
  - Chỉ animate duy nhất thuộc tính độ lệch nét vẽ: `transition-[stroke-dashoffset] duration-500 ease-out`.

### 6.9. Code Block & Syntax Highlighting (`CodeBlockComponent`)

- **Container Queries (`@container`)**: Khung `.code-block-container` khai báo `@container` để tự thích ứng với các layout chia cột (grid 2 cột trên Desktop) hoặc màn hình nhỏ.
- **Tab Bar cuộn ngang mượt mà**: Container tab có `min-w-0 flex-1 overflow-x-auto no-scrollbar scroll-smooth`, nhãn tên file hỗ trợ truncate an toàn.
- **Nút Action Responsive**: Nút Wrap và Copy sử dụng `hidden @[440px]:inline` cho text, tự động chuyển thành Icon-only khi chiều rộng < 440px giúp tiết kiệm 100px chiều ngang mà vẫn giữ Tooltip đầy đủ.
- **Hệ thống Syntax Token Chuẩn Toàn Cục**:
  - `.tok-keyword`: Tím sáng (`text-violet-600 dark:text-violet-400 font-semibold`)
  - `.tok-string`: Xanh lá (`text-green-700 dark:text-green-400`)
  - `.tok-comment`: Slate mờ (`text-slate-500 italic`)
  - `.tok-number`: Cam (`text-orange-700 dark:text-orange-400`)
  - `.tok-function`: Xanh da trời (`text-sky-600 dark:text-sky-400`)
  - `.tok-decorator`: Hồng tím (`text-pink-600 dark:text-pink-400 font-medium`)
  - `.tok-tag`: Đỏ hồng (`text-rose-600 dark:text-rose-500 font-semibold`)
  - `.tok-attr`: Cyan (`text-cyan-600 dark:text-cyan-400`)

### 6.10. Hệ Thống Hộp Thông Báo & Cảnh Báo (Alert System)

Hỗ trợ 4 cấp độ thông điệp: `info`, `success`, `warning`, `error` với 3 phong cách visual:
- `-soft`: Nền nhạt dịu mắt (`bg-*-100 dark:bg-*-950/85`).
- `-accent`: Viền trái đậm 4px (`border-l-4 border-l-*-600 dark:border-l-*-400`).
- `-bordered`: Viền nổi bật toàn khung (`border-*-400/60 dark:border-*-600/60`).

### 6.11. Quy Tắc Angular Custom Component Host Display

- **Bắt buộc**: Mọi Angular custom component (ví dụ: `app-custom-switch`, `app-custom-select`, `app-custom-date-picker`, `app-custom-checkbox`, `app-custom-radio`, `app-progress`, v.v.) phải thiết lập:
  ```css
  :host {
    display: block;
  }
  ```
  Nhằm loại bỏ hành vi mặc định `display: inline` của trình duyệt khiến phần tử bỏ qua margin/padding dọc trong flex/grid layout.
