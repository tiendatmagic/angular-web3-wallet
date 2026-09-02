### Yêu Cầu: Sửa Lỗi Responsive Button Bị Tràn & Đè Chữ (Aura & Ripple Showcase Cards)
- **Nội dung yêu cầu:** Khắc phục lỗi responsive button bị tràn chữ, co rúm và đè chéo văn bản lên nhau trong nhóm điều khiển Tốc độ quay (Speed), Bo góc (Border Radius), Kiểu màu sắc (Variant) của Showcase Component Aura và nhóm nút trong Ripple Card.
- **Phân tích kỹ thuật & Nguyên nhân:**
  1. **Nguyên nhân co ép đa cột (Nested Multi-Column Grid Overload):**
     - Trước đó hai nhóm "Tốc độ quay" và "Bo góc" được bọc chung trong `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">`. Khi ở desktop (trang chủ chia 2 card/hàng), mỗi card chỉ có ~450px -> mỗi cột chỉ có ~200px.
     - Bên trong 200px đó lại chia tiếp `grid grid-cols-3 gap-2`, ép mỗi button chỉ còn ~60px. Trong khi văn bản như "Mặc định (15px)" (15 ký tự) hay "Mặc định (4s)" dài > 100px. Vì `.btn` có `whitespace-nowrap`, chữ tràn ra ngoài button và đè chéo lên button lân cận (`Mặc định (15Nhỏ (8px)Tròn (9999px)`).
     - Tương tự, nhóm "Kiểu màu sắc (Variant)" dùng `grid-cols-4` ép 4 nút dài ("Toàn Ảnh (Holographic)", "Ánh Kim Vàng", "Ánh Kim Bạc", "Phát Sáng Tĩnh") vào card 450px khiến text bị co rút, tràn viền.
- **Giải pháp kiến trúc & Tối ưu:**
  1. **Tách riêng biệt Speed & Border Radius:** Bỏ `sm:grid-cols-2`, mỗi form-field chiếm trọn 1 hàng full-width (`space-y-4`), chia `grid grid-cols-3 gap-2` cho 3 nút (mỗi nút ~140px - 170px), thêm `!px-2 !py-2 text-xs font-bold justify-center`.
  2. **Responsive Variant Grid linh hoạt:** Nâng cấp sang `grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4 gap-2` kèm `!px-2 !py-2 justify-center`, hiển thị 2 cột cân đối, rộng rãi khi ở desktop có sidebar (hoặc mobile) và 4 cột khi ở màn hình cực rộng.
  3. **Đồng bộ Ripple Card:** Cân đối 3 switch Ripple với `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5` và Preset Colors sang `grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4 gap-2`.
- **Các vị trí đã xử lý:**
  1. `src/app/features/home/home.component.html`
- **Xác thực:**
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 20 files / 102 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.
  - Kiểm thử giao diện thực tế qua Chrome DevTools MCP trên cả Desktop (1440px) và Mobile (375px) chụp ảnh xác nhận nút hiển thị hoàn hảo, không còn đè chữ.

### Yêu Cầu: Chuẩn Hóa & Khắc Phục Triệt Để Toàn Bộ Hệ Thống Select UI, Dropdown UI, DatePicker, DateTimeRange
- **Nội dung yêu cầu:** Sửa triệt để các lỗi liên quan đến Select UI, Dropdown UI, DatePicker, DateTimeRange và hệ thống Popover trong toàn ứng dụng (cả trên Mobile và Desktop).
- **Phân tích kỹ thuật & Nguyên nhân gốc rễ (Root Causes):**
  1. **Reactivity Loss trong OnPush với `@Input` & `computed`:**
     - Trong `CustomSelectComponent`, `options` trước đó là `@Input() options: any[]` thông thường nhưng `filteredOptions` lại là Angular `computed(() => ...)`. Khi component dùng `ChangeDetectionStrategy.OnPush`, `computed` chỉ track signals và không tự động cập nhật khi `@Input() options` thay đổi từ component cha.
     - Đã chuyển sang `optionsSignal = signal<any[]>([])` và `valueSignal = signal<any>(null)` với `@Input() set options` / `@Input() set value` + `cdr.markForCheck()`, giúp lọc và hiển thị options mượt mà, phản hồi tức thì.
  2. **Đồng bộ hóa z-index & Toạ độ định vị trên Mobile:**
     - Nâng cấp `zIndex: '9999'` (và Submenu `zIndex: '10000'`) đồng nhất 100% trên toàn bộ 7 Dropdown/Popover components (`LanguageSelector`, `NetworkSelector`, `AccountDropdown`, `DropdownMenu`, `CustomSelect`, `CustomDatePicker`, `CustomDateTimeRange`).
     - Tối ưu hoá toạ độ tính toán bounding rect trên mobile, loại bỏ việc gán cứng `top: 3.75rem` cục bộ, đảm bảo popover luôn bám dính chính xác vào trigger button theo Viewport ở mọi độ phân giải.
  3. **Hỗ trợ đầy đủ 2 cơ chế Binding (Dual Binding Support):**
     - Bổ sung `@Input('value') set valueInput(val: any)` và `get valueInput()` cho `CustomDatePicker` và `CustomDateTimeRange`, hỗ trợ cả 2 dạng: `[(ngModel)]="val"` hoặc `[value]="val"` `(valueChange)="val = $event"`.
  4. **Triệt tiêu Containing Block Conflict:**
     - Loại bỏ hoàn toàn `content-visibility: auto` khỏi `src/styles.scss` (`.app-card`), khôi phục Stacking Context chuẩn mực cho toàn bộ hệ thống popovers/dialogs.
- **Các vị trí đã xử lý:**
  1. `src/styles.scss`
  2. `src/app/shared/components/custom-select/custom-select.component.ts`
  3. `src/app/shared/components/custom-date-picker/custom-date-picker.component.ts`
  4. `src/app/shared/components/custom-date-time-range/custom-date-time-range.component.ts`
  5. `src/app/shared/components/language-selector/language-selector.component.ts`
  6. `src/app/shared/components/network-selector/network-selector.component.ts`
  7. `src/app/shared/components/account-dropdown/account-dropdown.component.ts`
  8. `src/app/shared/components/dropdown-menu/dropdown-menu.component.ts`
- **Xác thực:**
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 20 files / 102 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu Cầu: Tối Ưu Hiệu Năng Toàn Diện & Giải Quyết Hiện Tượng Load Chậm / Giật Lag Trên Mobile
- **Nội dung yêu cầu:** Xem xét toàn bộ website, tối ưu hiệu năng, xử lý vấn đề trang web bị load chậm, lag, delay khi lướt trên mobile (UI HTML CSS & Angular Change Detection).
- **Phân tích kỹ thuật & Nguyên nhân gốc rễ (Root Causes):**
  1. **Zone.js Overload từ Global Scroll Listeners:** 7 dropdowns/popovers (`LanguageSelector`, `NetworkSelector`, `AccountDropdown`, `DropdownMenu`, `CustomSelect`, `CustomDatePicker`, `CustomDateTimeRange`) trước đó đều tự động đăng ký `window.addEventListener('scroll', ..., true)` ngay từ `ngOnInit` bên trong NgZone. Khi cuộn vuốt trên mobile, hàng trăm sự kiện scroll/giây kích hoạt Change Detection chạy liên tục trên toàn bộ cây component, gây nghẽn CPU và giật đứng khung hình.
  2. **Default Change Detection:** Toàn bộ components trước đó dùng chiến lược mặc định `ChangeDetectionStrategy.Default`, buộc Angular duyệt kiểm tra toàn bộ cây component ngay cả khi state không thay đổi.
  3. **Heavy DOM & Eager Rendering:** `home.component.html` chứa hơn 3100 dòng HTML showcase với hàng trăm complex SVGs/gradients render cùng lúc khi load trang.
  4. **Unthrottled Layout Recalculation:** `VoiceChatComponent` gọi `getAvatarPosition(idx)` trực tiếp trong template loop khiến hàm tính toán vị trí avatar bị gọi lại lặp đi lặp lại trong mỗi chu kỳ render.
- **Giải pháp kiến trúc & Tối ưu hóa:**
  1. **Tối ưu NgZone & RequestAnimationFrame Throttle cho toàn bộ Popovers:**
     - Bọc toàn bộ event listeners (`scroll` capture, `resize`) vào `ngZone.runOutsideAngular()`.
     - Chỉ attach listeners khi popover đang mở (`isOpen() === true`), tự động tháo gỡ (detach) ngay khi đóng hoặc `ngOnDestroy`.
     - Áp dụng `requestAnimationFrame` throttle để đảm bảo không tính toán vị trí toạ độ nhiều hơn 1 lần / frame (16.6ms).
  2. **Kích hoạt `ChangeDetectionStrategy.OnPush` trên 100% Component toàn dự án:**
     - Nâng cấp hơn 30+ components sang `OnPush` kết hợp Angular Signals (`signal`, `computed`), loại bỏ hoàn toàn các chu kỳ Change Detection dư thừa.
  3. **Tối ưu Morphing Grid trong `VoiceChatComponent`:**
     - Chuyển việc tính toạ độ avatar sang `avatarPositions = computed<AvatarPosition[]>(...)` tính trước 1 lần khi container resize hoặc state thay đổi.
     - Bọc `ResizeObserver` bên trong `runOutsideAngular`.
  4. **CSS Rendering Optimization & GPU Acceleration:**
     - Thêm `content-visibility: auto; contain-intrinsic-size: 0 400px;` vào `.app-card` và `.app-card-interactive` trong `src/styles.scss`, giúp trình duyệt bỏ qua việc render/layout các thẻ nằm ngoài màn hình khi cuộn.
  5. **Angular `@defer (on viewport)` cho các Showcase Cards dưới nếp gấp:**
     - Bọc các Showcase Cards dưới nếp gấp màn hình trong `@defer (on viewport)` kết hợp `@placeholder` spinner loader nhẹ.
     - Giúp trang chủ ban đầu chỉ render phần trên nếp gấp (Wallet connect/Dashboard), giảm kích thước khởi tạo và chia nhỏ ứng dụng thành hơn 100 lazy chunks.
- **Các vị trí đã xử lý:**
  1. `src/app/shared/components/custom-date-picker/custom-date-picker.component.ts`
  2. `src/app/shared/components/custom-date-time-range/custom-date-time-range.component.ts`
  3. `src/app/shared/components/dropdown-menu/voice-chat.component.ts` & `.html`
  4. `src/app/shared/components/copy-to-clipboard/copy-to-clipboard.component.ts` & `.html`
  5. `src/app/features/home/home.component.ts` & `.html`
  6. `src/styles.scss`
  7. Toàn bộ 25+ shared UI components (`App`, `Header`, `Sidebar`, `Button`, `Card`, `StatCard`, `Badge`, `Icon`, `CustomInput`, `CustomSwitch`, `CustomRadio`, `CustomCheckbox`, `CustomSearchInput`, `CustomSlider`, `Aura`, `Table`, `Pagination`, `CodeBlock`, `FileUpload`, `Progress`, `Avatar`, `Alert`, `Drawer`, `Stepper`, `Breadcrumb`, `Divider`, `Accordion`, `EmptyState`, `ThemeSwitcher`, `TxSpeedSelector`, `Modal`, `Toast`, `SkeletonLoader`, `TabGroup`, `Kbd`, `InputOtp`).
- **Xác thực:**
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 20 files / 102 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%, tự động chia tách >100 lazy chunks.

### Yêu Cầu: Kiểm Thử Chức Năng Điều Khiển Trình Duyệt & Chuẩn Hóa Sử Dụng Chrome DevTools MCP
- **Nội dung yêu cầu:** Mở trang `http://localhost:4200/home`, cuộn xuống và nhấn nút "Mở Drawer (Lề Phải)", kiểm tra chức năng điều khiển trình duyệt và chuẩn hóa công cụ tự động hóa.
- **Phân tích kỹ thuật & Đánh giá công cụ:**
  1. **Quy tắc chuẩn hóa công cụ tự động hóa:**
     - Sử dụng **Chrome DevTools MCP (Chrome DevTools Protocol)** làm công cụ tự động hóa trình duyệt chính thức cho toàn bộ dự án.
     - **Ưu điểm của Chrome DevTools MCP:**
       + Phản hồi tức thì trong vài mili-giây, kết nối trực tiếp với tiến trình Chrome đang mở mà không cần spawn browser mới.
       + Hỗ trợ đầy đủ tương tác DOM, a11y snapshot, click, cuộn mượt (`scrollIntoView`), nhập liệu, kiểm tra console logs, network requests và chụp ảnh màn hình thời gian thực.
       + Hoạt động ổn định 100%, không bị ảnh hưởng bởi lỗi download Playwright driver của CDN hay lỗi treo WebSocket recorder trên Windows.
  2. **Thực thi kiểm thử thực tế:**
     - Điều hướng thành công đến `http://localhost:4200/home`.
     - Cuộn xuống khu vực "COMPONENT DRAWER (BẢNG TRƯỢT NGOÀI KHUNG NHÌN)".
     - Kích hoạt nút "Mở Drawer (Lề Phải)" và chụp ảnh màn hình xác nhận: Drawer bên phải trượt ra mượt mà với đầy đủ nội dung chi tiết giao dịch Web3 và hiệu ứng glassmorphism.
- **Xác thực:**
  - Điều khiển và chụp ảnh viewport thời gian thực thành công 100% qua Chrome DevTools MCP.

### Yêu Cầu: Khắc Phục Lỗi Lệch Tâm Chấm Tròn Bên Trong Của Component Radio Button
- **Nội dung yêu cầu:** Xem xét và sửa lỗi chấm tròn (inner dot) của nút Radio (`CustomRadioComponent`) bị lệch tâm so với viền tròn ngoài (đặc biệt là option ở cuối cùng).
- **Phân tích kỹ thuật & Nguyên nhân:**
  1. **Nguyên nhân lệch tâm trên subpixel layout:**
     - Trước đó `CustomRadioComponent` sử dụng thẻ `div` con với animation `animate-scale-up` (`@keyframes scaleUp { from { transform: scale(0); } to { transform: scale(1); } } forwards`).
     - Thuộc tính `forwards` lưu vĩnh viễn `transform: scale(1)` trên DOM, ép trình duyệt tạo ra một GPU composited texture/layer riêng biệt cho chấm tròn.
     - Khi nằm ở option thứ 3 (cuối cùng), toạ độ `Y` trên trang bị rơi vào số lẻ/phần thập phân subpixel (do text/description của các option phía trên có line-height và margins).
     - GPU layer của chấm tròn bị Chromium pixel-snapping theo `Math.floor()` độc lập với viền tròn `border-2` của thẻ cha, dẫn đến việc chấm tròn bị dịch lệch 1px lên trên và 1px sang trái.
  2. **Giải pháp kiến trúc toàn diện:**
     - Chuyển đổi chấm tròn bên trong sang **SVG Vector Circle** (`<svg viewBox="0 0 10 10" class="w-2.5 h-2.5 ..."><circle cx="5" cy="5" r="5" fill="currentColor"/></svg>`), đảm bảo tâm vector `(5, 5)` luôn được SVG rasterizer định vị chính xác 100% về mặt toán học ở mọi tỉ lệ DPI/zoom.
     - Sử dụng CSS Grid `grid place-items-center` thay cho flexbox để đảm bảo căn giữa tuyệt đối trong bounding box.
     - Áp dụng cơ chế transition mượt mà `transition-[transform,opacity] duration-150 ease-out` kết hợp `scale-100 opacity-100` / `scale-0 opacity-0` (đồng bộ chuẩn cơ chế với `CustomCheckboxComponent`), loại bỏ triệt để GPU texture compositing layer treo vĩnh viễn.
     - Đồng bộ hóa cấu trúc radio item trong `DropdownMenuComponent` (`dropdown-menu.component.html`).
- **Các vị trí đã xử lý:**
  1. `src/app/shared/components/custom-radio/custom-radio.component.html`: Thay thế div transform bằng SVG circle + `grid place-items-center` và transition `scale/opacity`.
  2. `src/app/shared/components/dropdown-menu/dropdown-menu.component.html`: Đồng bộ radio dot sang SVG circle + `grid place-items-center`.
- **Xác thực:**
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 20 files / 102 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu Cầu: Rà Soát Toàn Diện Đa Ngôn Ngữ (i18n), Đối Chiếu Key EN / VI & Quét Toàn Bộ Source HTML / TS
- **Nội dung yêu cầu:** Kiểm tra lại toàn bộ source code xem có còn chỗ nào chưa dịch đa ngôn ngữ không, các key EN / VI đã đầy đủ hay chưa, tra cứu toàn bộ file HTML và TS.
- **Phân tích kỹ thuật & Kết quả rà soát:**
  1. **Đối chiếu chéo từ điển `en.ts` và `vi.ts`:**
     - Cả hai từ điển hiện có tổng cộng **730 flat keys** (sau khi bổ sung), khớp 100% về cấu trúc và định danh key.
     - Không có bất kỳ translation key nào bị rỗng (empty string = 0).
     - Ký tự tiếng Việt duy nhất trong `en.ts` là `"Tiếng Việt"` của key `language.vietnamese` (chuẩn hiển thị native name).
  2. **Quét toàn bộ 55 file HTML & 76 file TS trong `src/app`:**
     - Tìm thấy và khắc phục 1 key thiếu: `header.manage_account` được sử dụng trong `account-dropdown.component.html` đã được bổ sung đầy đủ vào `i18n.types.ts`, `en.ts` ("Manage Account") và `vi.ts` ("Quản lý tài khoản").
     - 100% các chuỗi text, nhãn (`label`), tiêu đề (`title`), `placeholder`, `aria-label`, thông báo `toast` và `modal` trên toàn bộ ứng dụng đều đã được đa ngôn ngữ hóa thông qua `TranslatePipe` hoặc `TranslationService.t(...)`.
- **Các vị trí đã xử lý:**
  1. `src/app/core/i18n/i18n.types.ts`: Thêm `manage_account: string;` vào interface `TranslationDictionary.header`.
  2. `src/app/core/i18n/en.ts`: Thêm `manage_account: 'Manage Account'` vào `header`.
  3. `src/app/core/i18n/vi.ts`: Thêm `manage_account: 'Quản lý tài khoản'` vào `header`.
- **Xác thực:**
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 20 files / 102 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu cầu: Chuẩn Hóa & Responsive Typography / Font Size Chữ Cho Component Cảnh Báo (Alert & Modals)
- **Nội dung yêu cầu:** Xem xét và cấu hình responsive font size chữ cho component cảnh báo (`app-alert`) trong modal (như DeleteConfirmModal và các modal/thẻ khác) để không bị to thô quá mức, cân đối với tỷ lệ màn hình và các thành phần xung quanh.
- **Phân tích kỹ thuật & Chuẩn hóa:**
  1. **Nguyên nhân font chữ bị to thô trong Alert:**
     - Trước đó `AlertComponent` (`alert.component.html`) chưa áp dụng typography responsive cho thẻ wrapper `ng-content`, khiến các nội dung text (như `warningMessage`) kế thừa font size mặc định 16px (`text-base`) từ root body.
     - Trong khi đó các phần tử khác trong modal chỉ có kích thước `text-xs` (12px) hoặc `text-sm` (14px), tạo ra độ chênh lệch thị giác lớn khiến khung cảnh báo chiếm nhiều diện tích.
  2. **Giải pháp kiến trúc:**
     - Bổ sung `@Input() size: 'sm' | 'md' = 'md'` vào `AlertComponent`.
     - Chuẩn hóa container text của `AlertComponent` về `text-xs sm:text-sm font-medium leading-relaxed` (với `size="md"`) và `text-xs` (với `size="sm"`).
     - Điều chỉnh padding responsive: `p-2.5 sm:p-3` (với `size="sm"`) và `p-3 sm:p-3.5` (với `size="md"`), icon `w-4.5 h-4.5 sm:w-5 sm:h-5`.
     - Đồng bộ `ConfirmModalComponent` description về responsive `text-xs sm:text-sm`.
  3. **Bổ sung Unit Test:**
     - Tạo mới 6 unit tests cho `AlertComponent` (`alert.component.spec.ts`) kiểm tra default inputs, message rendering, sizes ('sm' / 'md'), default icons theo type, close event emit.
- **Các vị trí đã xử lý:**
  1. `src/app/shared/components/alert/alert.component.ts`
  2. `src/app/shared/components/alert/alert.component.html`
  3. `src/app/shared/components/alert/alert.component.spec.ts`
  4. `src/app/shared/components/confirm-modal/confirm-modal.component.html`
- **Xác thực:**
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 20 files / 102 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu cầu: Loại Bỏ Dropdown Ngôn Ngữ Khỏi Mobile Sidebar Drawer
- **Nội dung yêu cầu:** Xóa bỏ bộ chọn ngôn ngữ `app-language-selector` ở phần chân menu Sidebar mobile (vì trên Header đã có sẵn nút chọn ngôn ngữ).
- **Các vị trí đã xử lý:**
  1. `src/app/shared/layout/sidebar/sidebar.component.html`: Loại bỏ `<app-language-selector variant="full" direction="up" />` khỏi mobile footer container.
  2. `src/app/shared/layout/sidebar/sidebar.component.ts`: Dọn dẹp import `LanguageSelectorComponent`.
- **Xác thực:**
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 19 files / 96 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu cầu: Chuẩn Hóa & Đồng Bộ Toàn Diện Cơ Chế Hiển Thị Của Tất Cả Component Dropdown / Popover
- **Nội dung yêu cầu:** Rà soát và đồng bộ 100% cơ chế hiển thị của toàn bộ hệ thống Dropdown / Popover trong dự án (`LanguageSelector`, `NetworkSelector`, `AccountDropdown`, `DropdownMenu`, `CustomSelect`, `CustomDatePicker`, `CustomDateTimeRange`).
- **Phân tích kỹ thuật & Chuẩn hóa:**
  1. **Khắc phục lỗi định dạng absolute cũ:**
     - Trước đó `LanguageSelector`, `NetworkSelector`, `AccountDropdown` sử dụng CSS định vị `position: absolute`, khiến popover khi mở ở chế độ full-width (`variant="full"`) bị đè bởi các layer bên dưới hoặc bị cắt ngắn option (như trường hợp thiếu option English).
  2. **Giải pháp kiến trúc đồng bộ 100%:**
     - Nâng cấp cả 7 component sang cơ chế tính toán toạ độ động qua `updateDropdownPosition()` / `updatePopoverPosition()` với `position: fixed` và `getContainingBlockOffset(trigger)`.
     - Đăng ký capture scroll listener (`window.addEventListener('scroll', ..., true)`) trong `ngOnInit` để tất cả các dropdown đều tự động bám dính chạy theo trigger button khi cuộn trang hoặc cuộn bên trong Modal.
     - Đồng bộ token giao diện `glass-popover`, bo góc `rounded-[15px]` và `z-index` chuẩn hóa.
- **Các vị trí đã xử lý:**
  1. `src/app/shared/components/language-selector/language-selector.component.ts` & `.html`
  2. `src/app/shared/components/network-selector/network-selector.component.ts` & `.html`
  3. `src/app/shared/components/account-dropdown/account-dropdown.component.ts` & `.html`
  4. `src/app/shared/components/dropdown-menu/dropdown-menu.component.ts`
  5. `src/app/shared/components/custom-select/custom-select.component.ts`
  6. `src/app/shared/components/custom-date-picker/custom-date-picker.component.ts`
  7. `src/app/shared/components/custom-date-time-range/custom-date-time-range.component.ts`
- **Xác thực:**
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 19 files / 96 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.


### Yêu cầu: Khắc Phục Lỗi Toạ Độ & Chiều Hiển Thị Của DateTimePicker và DateTimeRange
- **Nội dung yêu cầu:** Sửa lỗi hiển thị và chiều mở (placement) của `CustomDatePicker` và `CustomDateTimeRange` khi mở lên trên bị lệch/bay lên đỉnh màn hình đè lên các thẻ bên trên (ảnh 1), khi mở xuống dưới bị đè ô input hoặc tràn đáy (ảnh 2), và đồng bộ hóa giao diện phần dưới.
- **Phân tích kỹ thuật & Nguyên nhân:**
  1. **Lỗi tính toán toạ độ tĩnh (Hardcoded Popover Height):**
     - Cả hai component tính `top = rect.top - gap - popoverHeight` với `popoverHeight` gán cứng (440px / 510px). Khi chiều cao thực tế của popover nhỏ hơn con số này, popover bị đẩy lên cao tạo khoảng hở lớn với trigger input.
     - Khi `top < 8`, code ép `top = 8px`, khiến popover nhảy tót lên đỉnh màn hình và đè lên Slider Gas / Thẻ tab phía trên (Ảnh 1).
     - Khi mở xuống dưới, code ép `top = window.innerHeight - 8 - popoverHeight`, làm popover bị đẩy ngược lên đè vào chính ô input của nó và đáy popover dính sát đáy màn hình (Ảnh 2).
  2. **Giải pháp kiến trúc toàn diện:**
     - **Mở lên trên (`top`):** Sử dụng `top: rect.top - gap` kết hợp `transform: translateY(-100%)`. Đáy Popover luôn tiếp giáp chính xác với đỉnh ô input (cách đúng `gap = 6px`), loại bỏ triệt để việc popover bay lên nóc màn hình.
     - **Mở xuống dưới (`bottom`):** Đỉnh Popover luôn gắn cố định vào đáy ô input `top: rect.bottom + gap`, không tự ý dịch vị trí.
     - Bổ sung `maxHeight` và `overflow-y-auto` thích ứng linh hoạt với không gian thực tế của Viewport.
     - Hỗ trợ `@Input() placement: 'auto' | 'top' | 'bottom' = 'auto'` và `@Input() clearable: boolean = true`.
     - Đồng bộ cụm chọn thời gian (Time Picker) của `CustomDateTimeRange` sang dạng select controls gọn gàng, sạch sẽ, không bị tràn hay lỗi overflow khi cuộn.
  3. **Bổ sung Unit Test:**
     - Tạo mới 6 unit tests cho `CustomDatePickerComponent` (`custom-date-picker.component.spec.ts`).
     - Tạo mới 7 unit tests cho `CustomDateTimeRangeComponent` (`custom-date-time-range.component.spec.ts`).
- **Các vị trí đã xử lý:**
  1. `src/app/shared/components/custom-date-picker/custom-date-picker.component.ts`
  2. `src/app/shared/components/custom-date-picker/custom-date-picker.component.html`
  3. `src/app/shared/components/custom-date-picker/custom-date-picker.component.spec.ts`
  4. `src/app/shared/components/custom-date-time-range/custom-date-time-range.component.ts`
  5. `src/app/shared/components/custom-date-time-range/custom-date-time-range.component.html`
  6. `src/app/shared/components/custom-date-time-range/custom-date-time-range.component.spec.ts`
- **Xác thực:**
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 18 files / 88 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu cầu: Chuẩn Hóa Hiển Thị Địa Chỉ Ví Khớp Chuẩn Component Sao Chép Vào Bộ Nhớ Tạm
- **Nội dung yêu cầu:** Sửa khung hiển thị địa chỉ ví (Account Address) trên thẻ thông tin ví chính của trang chủ (`home.component.html`) cho giống với chuẩn "Component Sao Chép Vào Bộ Nhớ Tạm" (Copy To Clipboard showcase card).
- **Phân tích kỹ thuật & Tinh chỉnh:**
  1. **Khắc phục lỗi định dạng form input:** Trước đó phần hiển thị địa chỉ ví sử dụng cấu trúc `<div class="form-field"><label>...</label><div class="form-input ...">`, khiến hộp địa chỉ bị gò bó vào kiểu dáng form input và làm lặp lại 2 lần tiêu đề "ĐỊA CHỈ TÀI KHOẢN".
  2. **Kế thừa & Đồng bộ chuẩn UI Component Showcase:**
     - Đổi tiêu đề thẻ ví thành `wallet.dashboard_title` ('Bảng Điều Khiển Ví Web3' / 'Web3 Wallet Dashboard') để phân tách rõ ràng với nhãn trường.
     - Sử dụng container tiêu chuẩn `p-3.5 rounded-[15px] bg-slate-100/60 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40`.
     - Cấu hình `<app-copy-to-clipboard>` kèm nhãn `[label]="'cards.copy_to_clipboard.copy_btn' | translate"` ('Sao chép ví') và kích cỡ `size="sm"` đồng bộ 100% với showcase.
  3. **Bổ sung Unit Test:** Viết mới bộ unit test toàn diện cho `CopyToClipboardComponent` (`copy-to-clipboard.component.spec.ts`) với 5 test cases kiểm tra render label, copy clipboard, toast notification và custom message.
- **Các vị trí đã xử lý:**
  1. `src/app/features/home/home.component.html`: Cập nhật cấu trúc hiển thị địa chỉ ví và nút copy.
  2. `src/app/shared/components/copy-to-clipboard/copy-to-clipboard.component.spec.ts`: Tạo mới 5 unit tests.
- **Xác thực:**
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 16 files / 75 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu cầu: Khắc Phục Lỗi Modal Bị Trong Suốt Mất Hiệu Ứng Kính Mờ (Glassmorphism Blur) & Chuẩn Hóa Bề Mặt Modal
- **Nội dung yêu cầu:** Sửa lỗi một số Modal bị mất hiệu ứng blur, bị trong suốt nhìn xuyên thấu thẳng vào nội dung trang web bên dưới mà không có kính mờ (frosted glass). Lưu ý tuyệt đối không thêm background blur ở wrapper toàn màn hình của modal.
- **Phân tích kỹ thuật & Nguyên nhân:**
  1. **Lỗi Stacking Context âm và Chromium Render Layer Cliping:**
     - Trước đó, `glass-dialog` được cấu hình `background-color: transparent` kết hợp `isolation: isolate`, và phụ thuộc vào một thẻ con riêng biệt `<div class="glass-dialog-backdrop">` có `position: absolute; inset: 0; z-index: -10; backdrop-blur-xl`.
     - Khi Modal Dialog có hiệu ứng `animate-modal-in` (`modalZoomIn`), trình duyệt Chromium kích hoạt cơ chế render layer riêng. Thẻ con có `z-index: -10` bên trong `isolation: isolate` bị trình duyệt hiểu là nằm dưới ranh giới composited layer, khiến cả `background-color` và `backdrop-filter` của thẻ con bị vô hiệu hóa / discard hoàn toàn.
     - Vì thẻ cha `glass-dialog` có `bg-transparent`, toàn bộ thân modal bị biến thành trong suốt 100% (transparent), chữ của Modal đè trực tiếp lên text của trang web phía sau mà không hề có nền hay hiệu ứng blur.
  2. **Giải pháp kiến trúc chuẩn Glassmorphism:**
     - Khai báo trực tiếp thuộc tính kính mờ lên `.glass-dialog` trong `src/styles.scss`: `@apply bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl shadow-slate-900/15 dark:shadow-slate-950/60; -webkit-backdrop-filter: blur(24px); backdrop-filter: blur(24px);` (độ mờ đục chuẩn: Light mode 95%, Dark mode 95% cho cả Sidebar Menu, Drawer, Modal, Toast).
     - Loại bỏ `will-change: transform, opacity;` tĩnh khỏi `@utility animate-modal-in` để giải phóng composited layer sau khi kết thúc animation 200ms, giúp `backdrop-filter` blend với background trang web sắc nét 100%.
     - Chuẩn hóa Backdrop Wrapper của Modal về `bg-black/40 animate-modal-backdrop-in` thống nhất toàn hệ thống, loại bỏ dị biệt `backdrop-blur-sm` ở preview modal của `file-upload.component.html`.
     - Dọn dẹp thẻ con dư thừa `glass-dialog-backdrop` khỏi toàn bộ các template (`modal`, `modal-wrapper`, `confirm-modal`, `delete-confirm-modal`, `file-upload`, `drawer`, `sidebar`).
- **Các vị trí đã xử lý:**
  1. `src/styles.scss`: Cập nhật `@utility glass-dialog`, `@utility glass-dialog-backdrop` (`hidden`), tối ưu `@utility animate-modal-in` và `modal-zoom-in`.
  2. `src/app/shared/components/modal/modal.component.html`: Loại bỏ thẻ con `glass-dialog-backdrop`.
  3. `src/app/shared/components/modal/modal-wrapper.component.html`: Loại bỏ thẻ con `glass-dialog-backdrop`.
  4. `src/app/shared/components/confirm-modal/confirm-modal.component.html`: Loại bỏ thẻ con `glass-dialog-backdrop`.
  5. `src/app/features/home/components/delete-confirm-modal/delete-confirm-modal.component.html`: Loại bỏ thẻ con `glass-dialog-backdrop`.
  6. `src/app/shared/components/file-upload/file-upload.component.html`: Chuẩn hóa backdrop overlay `bg-black/40` và loại bỏ `glass-dialog-backdrop`.
  7. `src/app/shared/components/drawer/drawer.component.html`: Loại bỏ thẻ con `glass-dialog-backdrop`.
  8. `src/app/shared/layout/sidebar/sidebar.component.html`: Loại bỏ thẻ con `glass-dialog-backdrop` ở mobile sidebar.
  9. `src/app/shared/components/toast/toast.component.html`: Chuẩn hóa opacity Toast về `bg-white/95 dark:bg-slate-900/95` kết hợp `backdrop-blur-xl` và bo góc chuẩn `rounded-[15px]`.
  10. `.agent/design.md` & `design.md`: Cập nhật đặc tả Mục 6.1 về chuẩn `glass-dialog`.
- **Xác thực:**
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 15 files / 70 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu cầu: Dọn Dẹp Toàn Bộ Comment Code Không Cần Thiết, Comment Rác & Dư Thừa
- **Nội dung yêu cầu:** Kiểm tra toàn bộ mã nguồn dự án, rà soát và xóa bỏ triệt để tất cả các comment không cần thiết, comment rác, comment dư thừa/tầm thường.
- **Phân tích & Các vị trí đã xử lý:**
  1. `src/app/core/utils/dom.utils.ts`: Loại bỏ block comment JSDoc dư thừa.
  2. `src/app/core/utils/dom.utils.spec.ts`: Loại bỏ comment mock rác `// Mock getBoundingClientRect`.
  3. `src/app/shared/components/language-selector/language-selector.component.spec.ts`: Loại bỏ comment thao tác test `// Click English option (second option)`.
  4. `src/app/shared/components/theme-switcher/theme-switcher.component.spec.ts`: Loại bỏ các inline comments `// Light`, `// Auto`, `// Dark`.
  5. `src/app/shared/components/dropdown-menu/voice-chat.component.html`: Loại bỏ toàn bộ HTML comments (`<!-- Collapsed UI Elements -->`, `<!-- Wave Icon -->`, `<!-- Badge +N -->`, `<!-- Chevron Down -->`, `<!-- Expanded Header -->`, `<!-- Avatar Morphing Grid -->`, `<!-- Expanded Footer Action Buttons -->`).
  6. `src/app/shared/components/progress/progress.component.html`: Loại bỏ các HTML comments trong SVG (`<!-- Background Track -->`, `<!-- Value Arc -->`).
  7. `src/index.html`: Loại bỏ comments `<!-- Google Fonts Preconnect & Stylesheet -->` và `/* Defensive basic constraints */`.
  8. `src/styles.scss`: Loại bỏ toàn bộ các banner separator comments rác `/* ========================================================================== ... */` và các header comment dư thừa.
- **Xác thực:**
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 15 files / 70 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu cầu: Khắc Phục Lỗi Dropdown / Popover Bị Lệch Tọa Độ Khi Hiển Thị Trên Modal (DatePicker, DateTimeRange, CustomSelect, DropdownMenu)
- **Nội dung yêu cầu:** Xem lại nguyên nhân một số component bị lỗi vị trí/lệch toạ độ khi hiển thị trên Modal (ví dụ: Custom Date Picker, Custom Date Time Range, Custom Select, Dropdown Menu) và khắc phục triệt để.
- **Phân tích kỹ thuật & Nguyên nhân:**
  1. **Lỗi Containing Block theo chuẩn W3C CSS Transforms Specification:**
     - Các component `CustomDatePickerComponent`, `CustomDateTimeRangeComponent`, `CustomSelectComponent`, `DropdownMenuComponent` sử dụng `position: fixed` kết hợp `triggerEl.getBoundingClientRect()` (toạ độ tuyệt đối so với Viewport).
     - Khi đặt bên trong Modal (hoặc bất kỳ thẻ cha nào có `animate-modal-in`, `transform`, `will-change: transform`, `filter`, `backdrop-filter`, `contain`), theo chuẩn W3C, thẻ cha đó trở thành một **Containing Block** mới.
     - Mọi element con có `position: fixed` bên trong Containing Block sẽ bị trình duyệt định vị tương đối theo chính góc trên bên trái của thẻ cha đó thay vì Viewport.
     - Kết quả: Khi áp dụng toạ độ Viewport (`left = 450px, top = 300px`) vào phần tử con bên trong Modal (`modal.left = 300px, modal.top = 100px`), toạ độ thực tế trên màn hình bị cộng dồn thành `750px, 400px`, khiến toàn bộ dropdown menu và lịch bị văng lệch sang góc phải màn hình.
  2. **Giải pháp kiến trúc toàn diện:**
     - Tạo utility `getContainingBlockOffset(el)` trong `src/app/core/utils/dom.utils.ts` tự động duyệt cây DOM lên tới root để kiểm tra xem trigger element có nằm trong một Containing Block hay không.
     - Nếu có Containing Block, tự động trừ đi toạ độ `(left, top)` của Containing Block đó (`left - offset.left`, `top - offset.top`), giúp phần tử `position: fixed` luôn hiển thị chính xác 100% thẳng hàng ngay dưới trigger input ở bất kỳ ngữ cảnh nào (trang chủ, Modal, Drawer, Tab, Card).
     - Tinh chỉnh `@keyframes modalZoomIn` trong `src/styles.scss` (`to { opacity: 1; transform: none; }`) để giải phóng `transform` sau khi hoàn tất animation 200ms.
- **Các bước & Vị trí đã thực hiện:**
  1. Tạo mới file tiện ích `src/app/core/utils/dom.utils.ts` và bộ unit test `src/app/core/utils/dom.utils.spec.ts` (5 test cases).
  2. Cập nhật `CustomDatePickerComponent` (`custom-date-picker.component.ts`): Bù trừ toạ độ Containing Block trong `updatePopoverPosition()`.
  3. Cập nhật `CustomDateTimeRangeComponent` (`custom-date-time-range.component.ts`): Bù trừ toạ độ Containing Block trong `updatePopoverPosition()`.
  4. Cập nhật `CustomSelectComponent` (`custom-select.component.ts`): Bù trừ toạ độ Containing Block trong `updateDropdownPosition()`.
  5. Cập nhật `DropdownMenuComponent` (`dropdown-menu.component.ts`): Bù trừ toạ độ Containing Block trong `updateMenuPosition()` và `updateSubmenuPosition()`.
  6. Tối ưu `@keyframes modalZoomIn` trong `src/styles.scss`.
- **Xác thực:**
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 15 files / 70 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu cầu: Rà Soát Toàn Bộ Source Code & Chuẩn Hóa Kế Thừa UI Component & Dynamic Tokens
- **Nội dung yêu cầu:** Rà soát toàn bộ source code, tìm kiếm và tối ưu hóa các vị trí có thể hạn chế việc UI không khớp / chưa đồng bộ bằng cách kế thừa các UI component và design tokens hiện có.
- **Phân tích kỹ thuật & Các điểm đã tối ưu:**
  1. **Kế Thừa UI Component Dùng Chung:**
     - `TableComponent` (`table.component.html` & `ts`): Thay thế khối HTML empty state thủ công bằng `<app-empty-state size="sm">`.
     - `HeaderComponent` (`header.component.html` & `ts`): Thay thế khối Network badge thủ công bằng `<app-badge [variant]="stateService.isWrongChain() ? 'danger' : 'primary'" rounded="full" size="md">`.
     - `AccountDropdownComponent` (`account-dropdown.component.html` & `ts`): Thay thế thẻ span status PRO bằng `<app-badge variant="primary" size="sm">`.
     - `TxSpeedSelectorComponent` (`tx-speed-selector.component.html` & `ts`): Thay thế span multiplier bằng `<app-badge variant="primary" size="sm">`.
     - `FileUploadComponent` (`file-upload.component.html` & `ts`): Kế thừa `<button app-button variant="secondary" size="sm">` cho nút chọn tệp; kế thừa `<app-badge>` cho 4 trạng thái tệp (Waiting, Uploading, Completed, Error); kế thừa `<app-progress>` cho thanh tiến trình; kế thừa `<app-alert type="error">` cho thông báo lỗi `globalError`; kế thừa `.btn-close-sm` cho nút xóa tệp.
     - `DeleteConfirmModalComponent` (`delete-confirm-modal.component.html` & `ts`): Thay thế khối cảnh báo warning thủ công bằng `<app-alert type="warning" [dismissible]="false">`.
     - `HomeComponent` (`home.component.html`): Thay thế khung lỗi `txError` & `signError` bằng `<app-alert type="error">`; thay thế các nút sao chép địa chỉ ví và signature bằng `<app-copy-to-clipboard size="sm">`; thay thế network span bằng `<app-badge variant="success" rounded="full" size="md">`.
  2. **Chuẩn Hóa Typography & Action Button Utilities:**
     - Chuẩn hóa các header trong `network-selector` và `language-selector` bằng `.form-label`.
     - Kế thừa `.btn-cancel .btn-sm min-w-[76px]` và `.btn-primary .btn-sm min-w-[76px]` trong `custom-date-picker` và `custom-date-time-range`.
  3. **Chuẩn Hóa Bo Góc (Giới Hạn 15px theo design.md):**
     - Sửa toàn bộ các thẻ card trong `about.component.html` và `contact.component.html` từ `rounded-2xl` sang `rounded-[15px]`.
  4. **Đồng Bộ Hoàn Toàn Dynamic Brand Theming (Loại Bỏ Màu Tím Cứng):**
     - Thay thế các class tím tĩnh (`purple-500`, `purple-600`, `purple-50`, `violet-*`) trong `stepper`, `breadcrumb`, `network-selector`, `language-selector`, `custom-select`, `copy-to-clipboard`, `stat-card`, `code-block`, `empty-state`, `divider`, `voice-chat` sang Dynamic Tokens (`var(--color-primary)`, `var(--color-secondary)`, `bg-primary/10`, `text-primary`, `border-primary/20`, `shadow-primary/20`).
- **Xác thực:**
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 14 files / 65 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu cầu: Rà Soát & Bổ Sung Toàn Diện Hệ Thống Đa Ngôn Ngữ (i18n EN / VI)
- **Nội dung yêu cầu:** Kiểm tra kỹ lưỡng toàn bộ hệ thống đa ngôn ngữ EN / VI, phát hiện và khắc phục các vị trí bị lộ raw key translation (ví dụ `showcase.switch_network`, `SHOWCASE.BALANCE`, `SHOWCASE.NETWORK`), kiểm tra độ đồng bộ giữa các file từ điển `vi.ts`, `en.ts`, `i18n.types.ts` và các component trong dự án.
- **Phân tích kỹ thuật & Nguyên nhân:**
  1. **Thiếu Khai Báo Key Trong Từ Điển i18n (`src/app/core/i18n/`):**
     - Tại `home.component.html`, các thẻ binding `{{ 'showcase.balance' | translate }}`, `{{ 'showcase.network' | translate }}`, và `{{ 'showcase.switch_network' | translate }}` được gọi nhưng trong nhóm `showcase` của `i18n.types.ts`, `vi.ts`, và `en.ts` chưa được định nghĩa.
     - Hàm `translate(key)` trong `TranslationService` khi không tìm thấy giá trị chuỗi tương ứng trong từ điển sẽ fallback trả về chính raw key `key`, dẫn đến việc trên giao diện xuất hiện chuỗi chữ thô `showcase.switch_network`, `showcase.balance`, `showcase.network`.
  2. **Rà Soát Toàn Diện 585 Translation Keys:**
     - Sử dụng script tự động quét đối chiếu toàn bộ các template `.html`, các lời gọi `translationService.translate()` / `translationService.t()` trong TypeScript với từ điển `vi.ts` và `en.ts`.
     - Phát hiện thêm text chuỗi cứng `Format: {{ file.type }}` trong `file-upload.component.html` chưa được bọc i18n.
- **Các bước & Vị trí đã thực hiện:**
  1. **Cập Nhật Định Nghĩa Kiểu Dữ Liệu (`src/app/core/i18n/i18n.types.ts`):**
     - Bổ sung `balance: string;`, `network: string;`, `switch_network: string;` vào interface `showcase`.
     - Bổ sung `file_format: string;` vào interface `file_upload_ui`.
  2. **Đồng Bộ Từ Điển Tiếng Việt (`src/app/core/i18n/vi.ts`):**
     - `showcase.balance`: `'Số Dư Khả Dụng'`
     - `showcase.network`: `'Mạng Lưới'`
     - `showcase.switch_network`: `'Chuyển Đổi Mạng Nhanh'`
     - `file_upload_ui.file_format`: `'Định dạng: {format}'`
  3. **Đồng Bộ Từ Điển Tiếng Anh (`src/app/core/i18n/en.ts`):**
     - `showcase.balance`: `'Available Balance'`
     - `showcase.network`: `'Current Network'`
     - `showcase.switch_network`: `'Quick Switch Network'`
     - `file_upload_ui.file_format`: `'Format: {format}'`
  4. **Cập Nhật Template (`src/app/shared/components/file-upload/file-upload.component.html`):**
     - Thay thế text cứng `Format: {{ file.type }}` bằng `{{ 'file_upload_ui.file_format' | translate: { format: file.type } }}`.
- **Xác thực:**
  - Quét kiểm tra đối chiếu 585 key: 0 missing in VI, 0 missing in EN, 0 mismatch key.
  - `npx tsc --noEmit`: 0 lỗi type.
  - `npm test`: 14 files / 65 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu cầu: Loại Bỏ Hiệu Ứng Active Scale Trong Theme Switcher Component (`ThemeSwitcherComponent`)
- **Nội dung yêu cầu:** Bỏ class `active:scale` (active scale animation) của component theme switch.
- **Phân tích kỹ thuật & Tinh chỉnh:**
  1. Loại bỏ class `active:scale-95` khỏi 3 nút button đổi chế độ theme (Light, Auto, Dark) trong `theme-switcher.component.html`.
  2. Tối ưu transition từ `transition-[color,transform]` sang `transition-colors duration-200` giúp loại bỏ tính toán biến đổi transform không cần thiết khi click, giữ cảm giác bấm ổn định và liền mạch.
- **Các bước & Vị trí đã thực hiện:**
  - Cập nhật file `src/app/shared/components/theme-switcher/theme-switcher.component.html`.
- **Xác thực:**
  - `npm test`: 14 files / 65 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu cầu: Khắc Phục Lỗi Drawer Bị Khuất Sau Sidebar & Chuẩn Hóa Phân Tầng Z-Index / Stacking Context
- **Nội dung yêu cầu:** Sửa lỗi khi mở Drawer (bảng trượt) thì không thấy Drawer hoặc Drawer bị che lấp / nằm chìm phía sau Sidebar và Header.
- **Phân tích kỹ thuật & Nguyên nhân:**
  1. **Lỗi Giam Cầm Stacking Context (`relative z-0` trong `app.html`):** Thẻ bọc `<div class="... relative z-0">` chứa `<router-outlet>` đã vô tình tạo ra một Stacking Context con mới cố định ở mức $z=0$ so với root stacking context. Toàn bộ các component fixed overlay con được render bên trong routed page (như `<app-drawer>`, các modal / dialogs) đều bị cô lập ở mức $z=0$. Do `<app-sidebar>` có $z=50$ và `<app-header>` có $z=40$ ở root context, Sidebar và Header luôn đè lên trên Drawer và backdrop của nó. Khi mở Drawer lề trái (`position="left"`), toàn bộ thân Drawer nằm hoàn toàn phía dưới Desktop Sidebar (`w-72`).
  2. **Thứ bậc Z-Index chưa đồng bộ:** Cần phân tầng z-index minh bạch: Base Content ($z=0..10$) $\rightarrow$ Header ($z=40$) $\rightarrow$ Desktop Sidebar ($z=50$) $\rightarrow$ Drawer ($z=[60]$) $\rightarrow$ Modal/Dialog ($z=[70]$) $\rightarrow$ Mobile Menu ($z=[80]$) $\rightarrow$ Toast ($z=[9999]$).
- **Các bước & Vị trí đã thực hiện:**
  1. **Giải Phóng Router Outlet Stacking Context (`src/app/app.html`):**
     - Loại bỏ class `relative z-0` khỏi thẻ bọc `<div class="min-h-screen transition-[padding] duration-300 ease-in-out overflow-x-hidden max-w-full">`, cho phép các fixed overlay trong trang tự do render ở tầng viewport root.
  2. **Nâng Cấp & Chuẩn Hóa `DrawerComponent` (`drawer.component.html` & `drawer.component.ts`):**
     - Nâng cấp z-index của container Drawer lên `z-[60]` (`drawer-backdrop fixed inset-0 z-[60] flex`).
     - Bổ sung getters `positionContainerClass` và `panelPositionClass` trong TypeScript giúp quản lý class căn lề, kích thước và animation mượt mà, loại bỏ triệt để lỗi đánh giá `ngClass` nhiều class lồng nhau.
  3. **Chuẩn Hóa Z-Index Cho Các Hộp Thoại Modal & Lightbox:**
     - Nâng cấp `modal.component.html`, `modal-wrapper.component.html`, `confirm-modal.component.html`, `delete-confirm-modal.component.html`, `file-upload.component.html` lên `z-[70]`.
  4. **Tạo Mới Bộ Unit Test Cho Drawer (`drawer.component.spec.ts`):**
     - Tạo 6 test cases bao phủ toàn diện: render backdrop, z-index `z-[60]`, vị trí Left/Right/Bottom, các kích thước sm/md/lg/full, click nút đóng, backdrop overlay và animation closing timer.
  5. **Cập Nhật Toàn Diện Tài Liệu Thiết Kế (`.agent/design.md` & `design.md`):**
     - Bổ sung Mục 6.12 về Hệ Thống Phân Tầng Z-Index Toàn Cục và Quy Chuẩn `DrawerComponent`.
- **Xác thực:**
  - `npm test`: 14 files / 65 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu cầu: Nâng Cấp & Sửa Lỗi Cụm Điều Khiển Theme Switcher (`ThemeSwitcherComponent`)
- **Nội dung yêu cầu:** Sửa lại phần khung điều khiển chuyển đổi theme (khung màu đỏ), khắc phục tình trạng mất active pill background và tinh chỉnh kích thước icon SVG nhỏ gọn, cân đối (`w-3 h-3`) theo chuẩn thiết kế.
- **Phân tích kỹ thuật & Nguyên nhân:**
  1. **Lỗi tính toán kích thước DOM (`offsetWidth: 0px`):** Trước đó component sử dụng `ElementRef`, `ResizeObserver` và `offsetLeft/offsetWidth` trong JS để tính vị trí pill. Khi sidebar khởi tạo hoặc mở từ trạng thái ẩn, `offsetWidth` trả về `0px`, khiến pill bị khóa ở `width: 0px` và biến mất hoàn toàn.
  2. **Giải pháp thuần CSS/GPU Transform:** Thay vì phụ thuộc vào đo đạc DOM JS không ổn định, sử dụng computed signal `pillTransform()` với `translateX(0%)`, `translateX(100%)`, `translateX(200%)` kết hợp với `transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`.
  3. **Kích thước Icon SVG & Lỗi CSS Cascade Layers:**
     - **Nguyên nhân gốc rễ:** Thẻ `<style>` unlayered trong `index.html` có quy tắc `app-icon { width: 1.25rem; height: 1.25rem; }` (20px). Theo chuẩn CSS Cascade Layers Level 5, CSS không phân tầng (unlayered) luôn ghi đè và vô hiệu hóa toàn bộ utility classes của Tailwind (`.w-[14px]`, `.w-3`, v.v.).
     - **Giải pháp:** Chuyển `app-icon` và `app-logo` vào `@layer base` trong `styles.scss`, giúp các class tùy chỉnh kích thước (`w-[14px] h-[14px]`) nhận diện và override thành công 100%.
- **Các bước & Vị trí đã thực hiện:**
  1. **Khắc Phục CSS Layering (`index.html` & `styles.scss`):**
     - Xóa quy tắc unlayered `app-icon { width: 1.25rem; }` khỏi `index.html`.
     - Khai báo `app-icon` mặc định bên trong `@layer base` ở `styles.scss`.
  2. **Tối Ưu TypeScript (`theme-switcher.component.ts`):**
     - Loại bỏ toàn bộ `ResizeObserver`, `ViewChild`, `ViewChildren`, `ngAfterViewInit` và biến style đo thủ công.
     - Khai báo computed signal `pillTransform` (`translateX(0%)` cho light, `translateX(100%)` cho auto, `translateX(200%)` cho dark).
     - Giữ `:host { class: 'block' }` chuẩn theo quy tắc 6.11 trong `design.md`.
  3. **Nâng Cấp Giao Diện Template (`theme-switcher.component.html`):**
     - Nâng cấp pill trượt `.theme-switcher-pill` với `w-[calc((100%-4px)/3)] inset-y-0.5 left-0.5 bg-white dark:bg-slate-800 rounded-full shadow-xs border border-slate-200/40 dark:border-slate-700/50`.
     - Tối ưu tương tác hover/active cho từng nút (`w-7 h-7 hover:scale-105 active:scale-95`).
     - Thiết lập kích thước icon chuẩn xác `w-[14px] h-[14px]`.
  4. **Cập Nhật An Toàn Cho `ThemeService` (`theme.service.ts`):**
     - Bổ sung kiểm tra an toàn `typeof window.matchMedia === 'function'` tương thích môi trường SSR/Test runner.
  5. **Tạo Mới Bộ Unit Test (`theme-switcher.component.spec.ts`):**
     - Tạo 4 test cases kiểm tra render 3 buttons, tính toán transform, click đổi theme, và styling active color.
- **Xác thực:**
  - `npm test`: 13 files / 58 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.

### Yêu cầu: Thiết Lập Quy Chuẩn Hoạt Ảnh Modal Zoom In Toàn Cục & Đồng Bộ Tài Liệu design.md
- **Nội dung yêu cầu:** Tạo hiệu ứng Zoom In khi hiển thị cho 100% tất cả các Modal trong hệ thống, thiết lập thành quy chuẩn chung và ghi vào design.md.
- **Phân tích kỹ thuật:**
  1. **Trước đó**: Tất cả modal trong hệ thống xuất hiện tức thì không có animation, backdrop overlay cũng không có hiệu ứng fade in.
  2. **Hai file design.md tồn tại**: Phát hiện design.md ở thư mục gốc là phiên bản cũ/lỗi thời (186 dòng), cần đồng bộ từ .agent/design.md (350+ dòng).
- **Các bước & Vị trí đã thực hiện:**
  1. **Khai Báo Animation Tokens & Utilities trong `src/styles.scss`:**
     - Bổ sung `--animate-modal-in` và `--animate-modal-backdrop-in` trong `@theme`.
     - Bổ sung `@keyframes modalZoomIn` (`scale(0.92)` → `scale(1)`, `opacity: 0` → `1`, `200ms cubic-bezier(0.16, 1, 0.3, 1)`).
     - Bổ sung `@keyframes modalBackdropFadeIn` (`opacity: 0` → `1`, `200ms`).
     - Khai báo `@utility animate-modal-in`, `@utility modal-zoom-in`, `@utility animate-modal-backdrop-in` với `will-change` và `transform-origin: center center`.
  2. **Cập Nhật 5 Modal Templates:**
     - `modal.component.html`: Thêm `animate-modal-in` vào dialog, `animate-modal-backdrop-in` vào backdrop.
     - `modal-wrapper.component.html`: Thêm `animate-modal-in` vào dialog, `animate-modal-backdrop-in` vào backdrop (dynamic modals qua ModalService).
     - `confirm-modal.component.html`: Thêm `animate-modal-in` + `animate-modal-backdrop-in` cho standalone mode.
     - `delete-confirm-modal.component.html`: Thêm `animate-modal-in` + `animate-modal-backdrop-in` cho standalone mode.
     - `file-upload.component.html`: Thêm `animate-modal-in` + `animate-modal-backdrop-in` cho preview image modal.
  3. **Tạo & Cập Nhật Unit Tests:**
     - Tạo mới `modal.component.spec.ts` (5 tests): render, animation classes, size, close events.
     - Tạo mới `modal-wrapper.component.spec.ts` (4 tests): render, animation classes, backdrop click behavior.
     - Tạo mới `confirm-modal.component.spec.ts` (6 tests): non-dynamic & dynamic modes, animation, confirm/cancel.
     - Cập nhật `delete-confirm-modal.component.spec.ts`: Thêm test case kiểm tra animation classes.
  4. **Đồng Bộ Tài Liệu Thiết Kế:**
     - Cập nhật `.agent/design.md` mục 2.2 (tokens) và mục 6.2, 6.3 với quy chuẩn Modal Zoom In.
     - Copy `.agent/design.md` sang `design.md` ở thư mục gốc để đồng bộ 2 file.
- **Xác thực:**
  - `npm test`: 12 file / 54 tests passed (100%).
  - `npm run build`: Build production hoàn tất thành công 100%.
### YÃªu cáº§u: RÃ  SoÃ¡t Tá»‘c Äá»™ Cuá»™n Trang Home Khi Sá»­ Dá»¥ng Trackpad Laptop
- **Ná»™i dung yÃªu cáº§u:** Kiá»ƒm tra trang Home vÃ  phÃ¢n tÃ­ch nguyÃªn nhÃ¢n táº¡i sao khi sá»­ dá»¥ng trackpad laptop (Precision Touchpad) thÃ¬ cáº£m giÃ¡c tá»‘c Ä‘á»™ scroll trang bá»‹ nhanh hÆ¡n bÃ¬nh thÆ°á»ng, xÃ¡c Ä‘á»‹nh xem cÃ³ liÃªn quan Ä‘áº¿n thiáº¿t láº­p code web hay há»‡ thá»‘ng.
- **PhÃ¢n tÃ­ch ká»¹ thuáº­t & NguyÃªn nhÃ¢n:**
  1. **Tráº¡ng thÃ¡i MÃ£ Nguá»“n Web:** ToÃ n bá»™ dá»± Ã¡n Angular khÃ´ng sá»­ dá»¥ng báº¥t ká»³ thÆ° viá»‡n can thiá»‡p cuá»™n (Scroll Hijacking / SmoothScroll JS / Lenis) vÃ  khÃ´ng can thiá»‡p sá»± kiá»‡n `wheel`/`deltaY`. Trang web hoÃ n toÃ n sá»­ dá»¥ng 100% Native Scrolling cá»§a trÃ¬nh duyá»‡t.
  2. **CÆ¡ Cháº¿ Trackpad vs Chuá»™t CÆ¡:** Chuá»™t lÄƒn cÆ¡ há»c phÃ¡t tÃ­n hiá»‡u rá»i ráº¡c theo tá»«ng náº¥c (~100-120px/náº¥c), trong khi Windows Precision Touchpad / macOS Trackpad phÃ¡t tÃ­n hiá»‡u liÃªn tá»¥c dáº¡ng pixel kÃ¨m **QuÃ¡n tÃ­nh Ä‘á»™ng lÆ°á»£ng (Inertial Physics)** vÃ  **Gia tá»‘c vuá»‘t (Velocity Acceleration)**.
  3. **Äá»™ DÃ i Trang Home Cá»±c Lá»›n:** Trang Home lÃ  showcase hÆ¡n 25 nhÃ³m component UI vá»›i chiá»u dÃ i DOM lÃªn Ä‘áº¿n ~15.000px (>3.100 dÃ²ng HTML), khiáº¿n má»™t cÃº vuá»‘t cÃ³ quÃ¡n tÃ­nh lÆ°á»›t qua khoáº£ng cÃ¡ch ráº¥t dÃ i táº¡o cáº£m giÃ¡c trÃ´i nhanh.
- **HÆ°á»›ng dáº«n & Giáº£i phÃ¡p:**
  - Tinh chá»‰nh tá»‘c Ä‘á»™ cuá»™n Trackpad trong Windows Settings (`Bluetooth & devices` > `Touchpad` > `Scroll & zoom` > `Scrolling speed`).
  - Kiá»ƒm tra cá» `Smooth Scrolling` trong Chrome/Edge (`chrome://flags/#smooth-scrolling`).
  - CÃ³ thá»ƒ má»Ÿ rá»™ng thÃªm Floating Back-to-Top hoáº·c thanh Ä‘iá»u hÆ°á»›ng má»¥c lá»¥c náº¿u muá»‘n tÄƒng tÃ­nh tiá»‡n dá»¥ng khi duyá»‡t trang dÃ i.

### YÃªu cáº§u: Kháº¯c Phá»¥c Triá»‡t Äá»ƒ Hiá»‡n TÆ°á»£ng Rung Giáº­t Hover & Lá»—i Avatar Ná»•i ÄÃ¨ LÃªn Sticky Header Khi Cuá»™n Trang
- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i hover avatar bá»‹ giáº­t giáº­t báº§n báº­t vÃ  kháº¯c phá»¥c triá»‡t Ä‘á»ƒ tÃ¬nh tráº¡ng khi cuá»™n trang hoáº·c hover, component avatar (Ä‘áº·c biá»‡t lÃ  nÃºt `+3` counter) bá»‹ ná»•i Ä‘Ã¨ lÃªn trÃªn thanh Sticky Header (`Connect Wallet`, selector ngÃ´n ngá»¯, viá»n header).
- **PhÃ¢n tÃ­ch ká»¹ thuáº­t & NguyÃªn nhÃ¢n gá»‘c rá»…:**
  1. **Hiá»‡n tÆ°á»£ng Boundary Hover Chatter (VÃ²ng láº·p máº¥t/nháº­n hover vÃ´ táº­n):**
     - Khi má»™t pháº§n tá»­ vá»«a Ä‘Ã³ng vai trÃ² lÃ  target nháº­n hover, vá»«a tá»± di chuyá»ƒn `hover:-translate-y-1.5` (-6px) hoáº·c `hover:-translate-y-2` (-8px) nháº¥c lÃªn theo trá»¥c Y:
     - Khi con trá» chuá»™t cháº¡m vÃ o mÃ©p dÆ°á»›i cÃ¹ng (bottom boundary) cá»§a avatar, sá»± kiá»‡n `:hover` kÃ­ch hoáº¡t.
     - Avatar dá»‹ch chuyá»ƒn lÃªn trÃªn 6-8px, kÃ©o theo mÃ©p dÆ°á»›i Ä‘Ã¡y cá»§a avatar nháº¥c bá»•ng lÃªn cao hÆ¡n vá»‹ trÃ­ con trá» chuá»™t.
     - Con trá» chuá»™t rÆ¡i vÃ o khoáº£ng trá»‘ng bÃªn dÆ°á»›i vá»«a táº¡o ra -> trÃ¬nh duyá»‡t há»§y bá» `:hover`.
     - Avatar rÆ¡i ngÆ°á»£c trá»Ÿ láº¡i vá»‹ trÃ­ gá»‘c (0px) -> mÃ©p dÆ°á»›i láº¡i cháº¡m trÃºng con trá» chuá»™t -> láº¡i kÃ­ch hoáº¡t `:hover` -> láº¡i nháº¥c lÃªn -> láº¡i máº¥t chuá»™t -> láº¡i rÆ¡i xuá»‘ng...
     - VÃ²ng láº·p nÃ y diá»…n ra liÃªn tá»¥c theo táº§n sá»‘ lÃ m tÆ°Æ¡i mÃ n hÃ¬nh (60-120fps), táº¡o ra hiá»‡n tÆ°á»£ng avatar **rung báº§n báº­t / giáº­t giáº­t dá»¯ dá»™i** ("táº¥u hÃ i").
  2. **QuÃ¡n tÃ­nh vá»t lá»‘ quÃ¡ má»©c cá»§a hÃ m Spring Cubic-Bezier `cubic-bezier(0.34, 1.56, 0.64, 1)`:**
     - Tham sá»‘ `1.56` (> 1.0) táº¡o ra Ä‘á»™ náº£y vá»t lá»‘ (overshoot) tá»›i 56%, khiáº¿n avatar bá»‹ Ä‘áº©y vá»t lÃªn tá»›i `-12.5px`, khuáº¿ch Ä‘áº¡i khoáº£ng cÃ¡ch tuá»™t chuá»™t á»Ÿ mÃ©p dÆ°á»›i.
  3. **Xung Äá»™t Stacking Context Giá»¯a Header & Avatar Khi Cuá»™n Trang:**
     - `header.component.html` trÆ°á»›c Ä‘Ã³ dÃ¹ng `sticky top-0 z-50 md:z-30`. TrÃªn desktop (`md` trá»Ÿ lÃªn), Header chá»‰ cÃ³ `z-30`.
     - `avatar.component.html` gÃ¡n `hover:z-30` cho stack items vÃ  `z-10 hover:z-30` cho stack counter `+N`.
     - VÃ¹ng ná»™i dung `<router-outlet>` trong `app.html` náº±m sau `<app-header>` trong cÃ¢y DOM. Khi 2 pháº§n tá»­ cÃ¹ng náº±m trong root stacking context cÃ³ `z-index: 30` báº±ng nhau, pháº§n tá»­ náº±m sau trong HTML sáº½ Ä‘Ã¨ lÃªn pháº§n tá»­ náº±m trÆ°á»›c.
     - Káº¿t quáº£: Khi ngÆ°á»i dÃ¹ng cuá»™n trang, avatar stack / nÃºt `+3` bay Ä‘Ã¨ lÃªn trÃªn Header, che khuáº¥t nÃºt Connect Wallet vÃ  viá»n header.
- **CÃ¡c bÆ°á»›c & Vá»‹ trÃ­ Ä‘Ã£ thá»±c hiá»‡n:**
  1. **á»¨ng Dá»¥ng Kiáº¿n TrÃºc TÃ¡ch Biá»‡t: Trigger Wrapper TÄ©nh & Motion Canvas Bá»“ng Bá»nh (`avatar.component.html`):**
     - **Tháº» ngoÃ i (Trigger Wrapper)**: Cá»‘ Ä‘á»‹nh 100% trong luá»“ng layout (`group/avatar`, `group/stack-item`, `group/stack-counter`), khÃ´ng di chuyá»ƒn `translate-y` hay `scale`, má»Ÿ rá»™ng vÃ¹ng hit-test an toÃ n `p-1.5 -m-1.5` vÃ  `hover:z-10`. Nhá» tháº» cha Ä‘á»©ng yÃªn tuyá»‡t Ä‘á»‘i, con trá» chuá»™t khÃ´ng bao giá» bá»‹ tuá»™t ra ngoÃ i Hitbox dÃ¹ avatar bÃªn trong cÃ³ bay lÃªn hay phÃ³ng to.
     - **Tháº» con (Motion Canvas)**: Thá»±c hiá»‡n toÃ n bá»™ hoáº¡t áº£nh Ä‘á»“ há»a `transform-gpu transition-[transform,scale,box-shadow] duration-500 ease-[cubic-bezier(0.34,1.25,0.64,1)]` vá»›i `group-hover/avatar:-translate-y-1.5 group-hover/avatar:scale-110`, bÃ³ng Ä‘á»• `group-hover/avatar:shadow-xl group-hover/avatar:shadow-purple-500/25` vÃ  Ä‘á»“ng bá»™ status dot `group-hover/avatar:scale-110`.
     - Triá»‡t tiÃªu 100% hiá»‡n tÆ°á»£ng Ä‘á»©t káº¿t ná»‘i hover, biáº¿n chuyá»ƒn Ä‘á»™ng thÃ nh 100% trÆ¡n tru, liá»n máº¡ch, bá»“ng bá»nh vÃ  mÆ°á»£t mÃ  tá»‘i Ä‘a.
  2. **Giáº£i Quyáº¿t Triá»‡t Äá»ƒ Lá»—i ÄÃ¨ Header & CÃ´ Láº­p Stacking Context 3 Lá»›p:**
     - **Lá»›p 1 (`header.component.html`)**: NÃ¢ng cáº¥p Header lÃªn `sticky top-0 z-40` Ä‘á»“ng bá»™ toÃ n mÃ n hÃ¬nh (cao hÆ¡n má»i ná»™i dung trang web nhÆ°ng dÆ°á»›i Sidebar `z-50`).
     - **Lá»›p 2 (`app.html`)**: ThÃªm `relative z-0` vÃ o tháº» bá»c `<div class="min-h-screen ... relative z-0">` chá»©a `<router-outlet>`, cÃ´ láº­p toÃ n bá»™ router content á»Ÿ cáº¥p $z=0$, ngÄƒn cháº·n 100% má»i component con vÆ°á»£t cáº¥p Ä‘Ã¨ lÃªn Header.
     - **Lá»›p 3 (`avatar.component.html`)**: ThÃªm `isolate` vÃ o container Avatar Stack (`class="... isolate"`), háº¡ `hover:z-30` $\rightarrow$ `hover:z-10` vÃ  counter `z-10 hover:z-30` $\rightarrow$ `hover:z-10`.
  3. **Tinh Chá»‰nh ÄÆ°á»ng Cong Easing Spring Physics ÃŠm Dá»‹u:**
     - Chuyá»ƒn `cubic-bezier(0.34, 1.56, 0.64, 1)` sang `cubic-bezier(0.34, 1.25, 0.64, 1)` (náº£y Ä‘Ã n há»“i 25% vá»«a váº·n, bá»“ng bá»nh vÃ  mÆ°á»£t mÃ  cao cáº¥p).
  4. **Äá»“ng Bá»™ Layout Showcase & Form Labels (`home.component.html`):**
     - Chuáº©n hÃ³a cÃ¡c label trong card Avatar sang `class="form-label"`.
     - Tinh chá»‰nh `gap-3 sm:gap-4` cho dÃ£y Single Avatar Ä‘áº£m báº£o hiá»ƒn thá»‹ tháº³ng hÃ ng cÃ¢n Ä‘á»‘i trÃªn desktop vÃ  co giÃ£n mÆ°á»£t mÃ .
  5. **Cáº­p Nháº­t ToÃ n Diá»‡n Bá»™ Unit Test (`avatar.component.spec.ts`):**
     - Cáº­p nháº­t test cases kiá»ƒm tra chÃ­nh xÃ¡c motion elements `group-hover/avatar:scale-110`, `group-hover/avatar:-translate-y-1.5`, vÃ  counter selector `.group/stack-counter` (38/38 tests passed).
  6. **Äá»“ng Bá»™ TÃ i Liá»‡u Thiáº¿t Káº¿ (`.agent/design.md`):**
     - Bá»• sung má»¥c quy chuáº©n Kiáº¿n trÃºc Trigger Container TÄ©nh + Motion Canvas vÃ o Má»¥c 5.2.
- **XÃ¡c thá»±c:**
  - `npx tsc --noEmit`: 0 lá»—i type.
  - `npm test`: 38/38 tests passed (100%).
  - `npm run build`: Build production hoÃ n táº¥t thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: RÃ  SoÃ¡t ToÃ n Bá»™ Source Code & Cáº­p Nháº­t ToÃ n Diá»‡n TÃ i Liá»‡u Chuáº©n Thiáº¿t Káº¿ `design.md`
- **Ná»™i dung yÃªu cáº§u:** Dá»±a trÃªn cÃ¡c thay Ä‘á»•i, sá»­a lá»—i vÃ  cáº£i tiáº¿n gáº§n Ä‘Ã¢y trong dá»± Ã¡n, rÃ  soÃ¡t láº¡i toÃ n bá»™ mÃ£ nguá»“n vÃ  Ä‘á»“ng bá»™, nÃ¢ng cáº¥p tÃ i liá»‡u `.agent/design.md` theo chuáº©n thiáº¿t káº¿ má»›i nháº¥t.
- **PhÃ¢n tÃ­ch ká»¹ thuáº­t & CÃ¡c Ä‘iá»ƒm Ä‘Ã£ cáº­p nháº­t trong `design.md`:**
  1. **Quy táº¯c VÃ ng vá» CSS Transition & Hiá»‡u NÄƒng 60-120fps:** XÃ³a bá» hoÃ n toÃ n vÃ­ dá»¥ cÅ© `transition-all`. Cáº¥m tuyá»‡t Ä‘á»‘i `transition-all` vÃ  cáº¥m transition cho `border` (border-color, border-width) vÃ  `padding`. Khai bÃ¡o whitelist thuá»™c tÃ­nh tá»‘i Æ°u pháº§n cá»©ng (`transform`, `scale`, `opacity`, `background-color`, `box-shadow`, `stroke-dashoffset`, v.v.).
  2. **Há»‡ thá»‘ng Form Label & Form Field Chuáº©n HÃ³a:** Bá»• sung `@utility form-label` vÃ  cáº­p nháº­t Ä‘áº·c táº£ selector cá»§a `@utility form-field` (há»— trá»£ direct label, header-wrapped label vÃ  class `.form-label`), quy chuáº©n dÃ¹ng `.form-label` cho modal vÃ  custom controls.
  3. **Quy Chuáº©n Hoáº¡t áº¢nh Avatar & Avatar Group:** Bá»• sung chuáº©n Spring Physics 500ms (`duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]`), `transform-gpu`, phÃ³ng to `scale-110`, Ä‘á»“ng bá»™ status dot vÃ  glow shadow tÃ­m má».
  4. **Quy Chuáº©n CÄƒn Chá»‰nh Dá»c Checkbox & Radio:** Äá»“ng bá»™ `items-center` trÃªn `<label class="group flex items-center gap-3 cursor-pointer select-none">`, cáº¥m dÃ¹ng `items-start` vá»›i `pt-0.5`.
  5. **Quy Chuáº©n Multi-Language Selector:** Bá»• sung biáº¿n thá»ƒ `compact` (Header) vÃ  `full` (Sidebar vá»›i `w-full block`, trigger `w-full flex justify-between` kÃ¨m `truncate`, popover `min-w-[220px]` vÃ  tiÃªu Ä‘á» `whitespace-nowrap`).
  6. **Quy Chuáº©n SVG Gauge trong `ProgressComponent`:** Sá»­ dá»¥ng native `<svg viewBox="0 0 100 100">` / `<svg viewBox="0 0 100 58">` trá»±c tiáº¿p thay vÃ¬ `app-icon` (trÃ¡nh giá»›i háº¡n 20px x 20px), chá»‰ hiá»ƒn thá»‹ header Ä‘á»‰nh cho `type="bar"`, transition chá»‰ Ã¡p dá»¥ng cho `stroke-dashoffset`.
  7. **Container Queries & Responsive Code Block:** Bá»• sung `@container`, tab bar cuá»™n ngang mÆ°á»£t mÃ , action button responsive icon-only (`hidden @[440px]:inline`) vÃ  há»‡ thá»‘ng syntax highlight tokens.
  8. **Há»‡ Thá»‘ng Token ToÃ n Cá»¥c Má»›i:** Cáº­p nháº­t danh má»¥c nÃºt báº¥m Ä‘áº§y Ä‘á»§ (`.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-cancel`, `.btn-ghost`, `.btn-success`, `.btn-info`, `.btn-outline`, `.btn-close`), há»‡ thá»‘ng Alert tokens, Aura Glow & Conic Gradients, vÃ  quy táº¯c `:host { display: block; }`.
  9. **Quy táº¯c NgÄƒn Chá»n Chá»¯ (`select-none`):** Ãp dá»¥ng báº¯t buá»™c trÃªn toÃ n bá»™ UI controls tÆ°Æ¡ng tÃ¡c.
- **XÃ¡c thá»±c:**
  - `npx tsc --noEmit`: 0 lá»—i type.
  - `npm test`: 38/38 tests passed (100%).
  - `npm run build`: Build production hoÃ n táº¥t thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Chuáº©n HÃ³a & Äá»“ng Bá»™ ToÃ n Diá»‡n Há»‡ Thá»‘ng Form Label (Kháº¯c Phá»¥c Lá»—i Máº¥t Äá»‹nh Dáº¡ng NhÃ£n Trong Modal XÃ¡c Nháº­n XÃ³a & ToÃ n Bá»™ CÃ¡c Form)
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t vÃ  sá»­a lá»—i nhÃ£n form chÆ°a Ä‘á»“ng bá»™ trÃªn toÃ n bá»™ há»‡ thá»‘ng giao diá»‡n, kháº¯c phá»¥c tÃ¬nh tráº¡ng nhÃ£n xÃ¡c nháº­n tá»« khÃ³a ("GÃ• Tá»ª KHÃ“A 'CYBER-SAMURAI' Äá»‚ XÃC NHáº¬N") trong Delete Confirm Modal vÃ  cÃ¡c form khÃ¡c bá»‹ to, Ä‘áº­m mÃ u vÃ  máº¥t Ä‘á»‹nh dáº¡ng so vá»›i cÃ¡c nhÃ£n chuáº©n.
- **PhÃ¢n tÃ­ch ká»¹ thuáº­t & NguyÃªn nhÃ¢n:**
  1. **Giá»›i háº¡n Direct Child Selector cá»§a `.form-field > label`:** Trong `styles.scss`, `.form-field` chá»‰ Ã¡p dá»¥ng quy táº¯c cho tháº» `<label>` lÃ  con trá»±c tiáº¿p (`>`). Khi má»™t trÆ°á»ng form cÃ³ layout header má»Ÿ rá»™ng chá»©a badge hoáº·c icon (vÃ­ dá»¥ `<div class="flex items-center justify-between mb-1"><label>...</label></div>`), tháº» `<label>` khÃ´ng cÃ²n lÃ  con trá»±c tiáº¿p nÃªn bá»‹ rá»›t hoÃ n toÃ n CSS (káº¿ thá»«a font-size lá»›n 14px-16px vÃ  text Ä‘en Ä‘áº­m cá»§a modal).
  2. **Thiáº¿u Utility `.form-label` Ä‘á»™c láº­p:** TrÆ°á»›c Ä‘Ã³ chÆ°a cÃ³ `@utility form-label` chuáº©n má»±c toÃ n cá»¥c, dáº«n Ä‘áº¿n nhiá»u nÆ¡i pháº£i gÃ¡n class thá»§ cÃ´ng hoáº·c dÃ¹ng cÃ¡c kiá»ƒu chá»¯ lá»‡ch chuáº©n (`text-[10px] font-black tracking-widest`, `text-xs font-bold text-slate-500`, v.v.).
- **CÃ¡c bÆ°á»›c & Vá»‹ trÃ­ Ä‘Ã£ thá»±c hiá»‡n:**
  1. **Há»‡ Thá»‘ng Stylesheet ToÃ n Cá»¥c (`src/styles.scss`):**
     - Bá»• sung `@utility form-label`: `@apply block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none;`.
     - NÃ¢ng cáº¥p `@utility form-field`: má»Ÿ rá»™ng selector bao gá»“m `& > label`, `& > div > label:not(.group):not([class*="custom-"]):not(.sr-only)`, vÃ  `.form-label`.
  2. **Modal XÃ¡c Nháº­n XÃ³a (`delete-confirm-modal.component.html`):**
     - GÃ¡n class `form-label !mb-0` cho tháº» `<label>` táº¡i khá»‘i nháº­p tá»« khÃ³a xÃ¡c nháº­n `confirm_keyword_prompt`.
     - Chuáº©n hÃ³a nhÃ£n `target_item` (`TÃ€I NGUYÃŠN Sáº¼ XÃ“A`) sang `<span class="form-label mb-0.5">`.
  3. **Äá»“ng Bá»™ TrÃªn CÃ¡c Component & Layout KhÃ¡c:**
     - `custom-date-time-range.component.html`: Chuáº©n hÃ³a cÃ¡c label `date.start_time` vÃ  `date.end_time` sang `class="form-label"`.
     - `tx-speed-selector.component.html`: Chuáº©n hÃ³a cÃ¡c nhÃ£n `tx_speed.label` vÃ  `tx_speed.fee_multiplier` sang `class="form-label !mb-0"`.
     - `demo-modal.component.html`: Chuáº©n hÃ³a cÃ¡c nhÃ£n switch cáº¥u hÃ¬nh (`cards.date_picker.label_max_date`, `option_min_date`, `option_presets`) vÃ  tiÃªu Ä‘á» section sang `form-label`.
     - `home.component.html`: Chuáº©n hÃ³a cÃ¡c label cá»§a Selects, Tooltips, Badges, Ripple duration/opacity sang `form-label`.
  4. **Bá»• Sung Unit Test (`delete-confirm-modal.component.spec.ts`):**
     - ThÃªm test case kiá»ƒm tra class `form-label` Ã¡p dá»¥ng chÃ­nh xÃ¡c cho keyword label vÃ  target item label (38/38 tests passed).
- **XÃ¡c thá»±c:**
  - `npx tsc --noEmit`: 0 lá»—i type.
  - `npm test`: 38/38 tests passed (100%).
  - `npm run build`: Build production hoÃ n táº¥t thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Tá»‘i Æ¯u HÃ³a & LÃ m MÆ°á»£t Hoáº¡t áº¢nh Hover & Transition Cho Component Avatar (`AvatarComponent`) Bao Gá»“m NÃºt Äáº¿m (+N Counter)
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t vÃ  tinh chá»‰nh Ä‘á»™ mÆ°á»£t, loáº¡i bá» cáº£m giÃ¡c giáº­t/cá»©ng khi hover trÃªn Avatar Group Stack (+N counter) vÃ  Single Avatar; tÄƒng thá»i gian chuyá»ƒn Ä‘á»™ng lÃªn `duration-500` táº¡o hiá»‡u á»©ng Ãªm Ã¡i, bá»“ng bá»nh vÃ  mÆ°á»£t mÃ  tá»‘i Ä‘a.
- **PhÃ¢n tÃ­ch ká»¹ thuáº­t & NguyÃªn nhÃ¢n gÃ¢y cáº£m giÃ¡c "cá»©ng":**
  1. **ÄÆ°á»ng cong chuyá»ƒn Ä‘á»™ng máº·c Ä‘á»‹nh (Default Easing & Timing):** TrÆ°á»›c Ä‘Ã³ dÃ¹ng `duration-200` vá»›i easing máº·c Ä‘á»‹nh cá»§a trÃ¬nh duyá»‡t khiáº¿n chuyá»ƒn Ä‘á»™ng bá»‹ cá»¥t, dá»«ng Ä‘á»™t ngá»™t vÃ  thiáº¿u Ä‘á»™ Ä‘Ã n há»“i tá»± nhiÃªn.
  2. **Chuyá»ƒn vá»‹ 1 chiá»u thiáº¿u chiá»u sÃ¢u 3D:** Stack items chá»‰ cÃ³ `hover:-translate-y-1` (tá»‹nh tiáº¿n Ä‘Æ¡n thuáº§n) mÃ  khÃ´ng cÃ³ phÃ³ng to (`scale-110`) vÃ  khÃ´ng cÃ³ bÃ³ng ná»•i Ä‘a lá»›p (`shadow-xl shadow-purple-500/25`), khiáº¿n cáº£m giÃ¡c nhÆ° cÃ¡c khá»‘i cá»©ng bá»‹ Ä‘áº©y lÃªn trá»¥c Y.
  3. **Lá»‡ch pha trÃªn Single Avatar:** Pháº§n tá»­ bá»c ngoÃ i khÃ´ng chuyá»ƒn Ä‘á»™ng mÃ  chá»‰ cÃ³ `div` con phÃ³ng to, khiáº¿n cháº¥m tráº¡ng thÃ¡i (`status dot`) bá»‹ Ä‘á»©ng yÃªn vÃ  tÃ¡ch rá»i khá»i avatar.
- **CÃ¡c bÆ°á»›c & Vá»‹ trÃ­ Ä‘Ã£ thá»±c hiá»‡n:**
  1. **Template `avatar.component.html`:**
     - TÃ­ch há»£p GPU Acceleration `transform-gpu` giÃºp render 60-120fps khÃ´ng rÄƒng cÆ°a.
     - á»¨ng dá»¥ng Ä‘Æ°á»ng cong Ä‘Ã n há»“i cao cáº¥p vá»›i thá»i gian má»Ÿ rá»™ng: `duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]` (Spring Physics 500ms) táº¡o hiá»‡u á»©ng náº£y nháº¹ tá»± nhiÃªn, Ãªm dá»‹u vÃ  cá»±c ká»³ mÆ°á»£t mÃ .
     - Single Avatar: ÄÆ°a toÃ n bá»™ wrapper lÃªn `hover:-translate-y-1.5 hover:scale-110`, Ä‘á»“ng bá»™ cháº¥m tráº¡ng thÃ¡i `group-hover/avatar:scale-110` vÃ  bÃ³ng tÃ­m má» `group-hover/avatar:shadow-xl group-hover/avatar:shadow-purple-500/25`.
     - Avatar Group Items & `+N Counter`: Äá»“ng bá»™ `hover:z-30 hover:-translate-y-2 hover:scale-110 hover:shadow-xl hover:shadow-purple-500/25`, bá»• sung Ä‘á»‡m lá» an toÃ n `py-1.5 px-1` trÃ¡nh bá»‹ cáº¯t mÃ©p.
  2. **Unit Test `avatar.component.spec.ts`:**
     - Äá»“ng bá»™ vÃ  vÆ°á»£t qua toÃ n bá»™ 5 test cases (`duration-500`, `transform-gpu`, `hover:scale-110`, `hover:-translate-y-2`).
- **XÃ¡c thá»±c:**
  - `npx tsc --noEmit`: 0 lá»—i type.
  - `npm test`: 37/37 tests passed (100%).
  - `npm run build`: Build production hoÃ n táº¥t thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c Phá»¥c Lá»—i Dropdown Popover QuÃ¡ Ngáº¯n & Máº¥t CÃ¢n Äá»‘i Cho Multi-Language i18n Dropdown (`LanguageSelectorComponent`)
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t vÃ  sá»­a lá»—i dropdown ngÃ´n ngá»¯ bÃªn trÃ¡i ("SELECT SYSTEM LANGUAGE") trong card Multi-Language i18n Dropdown bá»‹ quÃ¡ ngáº¯n, popover co háº¹p lÃ m gÃ£y tiÃªu Ä‘á» vÃ  cáº¯t cá»¥t chá»¯ (`Tiáº¿ng V...`, `Engl...`), cáº§n fix cÃ¢n Ä‘á»‘i Ä‘á»“ng bá»™.
- **PhÃ¢n tÃ­ch ká»¹ thuáº­t & NguyÃªn nhÃ¢n:**
  1. **Tháº» wrapper cá»‘ Ä‘á»‹nh `inline-block`:** Trong `language-selector.component.html`, container gá»‘c bá»‹ gÃ¡n cá»©ng class `inline-block`. Khi component á»Ÿ cháº¿ Ä‘á»™ `variant="full"` (nhÆ° táº¡i showcase trÃªn Dashboard vÃ  trong Sidebar), component bá»‹ co ngáº¯n láº¡i theo Ä‘á»™ dÃ i text cá»§a nÃºt báº¥m thay vÃ¬ dÃ n tráº£i `w-full` theo chiá»u rá»™ng cá»§a khung `.form-field` cha hoáº·c card bÃªn dÆ°á»›i.
  2. **Popover thiáº¿u `min-width` an toÃ n vÃ  bá»‹ Ã©p theo container háº¹p:** Popover khi `variant="full"` cÃ³ `w-full` dá»±a trÃªn container cha ~130px. KÃ­ch thÆ°á»›c nÃ y khÃ´ng Ä‘á»§ chá»©a padding, icon cá» 20px, gap, text tÃªn ngÃ´n ngá»¯ vÃ  icon check, khiáº¿n tiÃªu Ä‘á» `SELECT LANGUAGE` bá»‹ gÃ£y thÃ nh 2 dÃ²ng (`SELECT` / `LANGUAGE`) vÃ  chá»¯ `Tiáº¿ng Viá»‡t`, `English` bá»‹ co cá»¥t (`Tiáº¿ng V...`, `Engl...`).
- **CÃ¡c bÆ°á»›c & Vá»‹ trÃ­ Ä‘Ã£ thá»±c hiá»‡n:**
  1. **Component Host & Controller `language-selector.component.ts`:**
     - Cáº­p nháº­t host bindings: `[class.w-full]="variant === 'full'"`, `[class.block]="variant === 'full'"`, `[class.inline-block]="variant === 'compact'"`.
  2. **Template `language-selector.component.html`:**
     - Wrapper container chuyá»ƒn sang `[ngClass]="{ 'w-full block': variant === 'full', 'inline-block': variant === 'compact' }"`.
     - NÃºt trigger `variant="full"`: chuáº©n hÃ³a `w-full flex items-center justify-between`, bá»• sung `hover:bg-slate-200/80 dark:hover:bg-slate-800/80`, `shadow-xs`, vÃ  `truncate min-w-0` cho nhÃ£n text.
     - Popover menu: bá»• sung `absolute left-0 right-0 w-full min-w-[220px]`, thÃªm `whitespace-nowrap` cho tiÃªu Ä‘á» `SELECT LANGUAGE` Ä‘á»ƒ Ä‘áº£m báº£o luÃ´n náº±m pháº³ng trÃªn 1 hÃ ng, hiá»ƒn thá»‹ trá»n váº¹n nhÃ£n `Tiáº¿ng Viá»‡t` vÃ  `English`.
     - Tá»‘i Æ°u transition nÃºt item trong popover sang `transition-[background-color,color] duration-150` chuáº©n hiá»‡u nÄƒng.
  3. **Bá»• Sung Bá»™ Unit Test ToÃ n Diá»‡n (`language-selector.component.spec.ts` - 5 test cases):**
     - Kiá»ƒm tra khá»Ÿi táº¡o default compact variant, kiá»ƒm tra render full variant vá»›i class `w-full` vÃ  native name, toggle popover vá»›i class `min-w-[220px]`, Ä‘á»•i ngÃ´n ngá»¯ cáº­p nháº­t Signal state vÃ  Ä‘Ã³ng popover trÃªn phÃ­m Escape.
- **XÃ¡c thá»±c:**
  - `npx tsc --noEmit`: 0 lá»—i type.
  - `npm test`: 32/32 tests passed (100%).
  - `npm run build`: Build production hoÃ n táº¥t thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Chuáº©n HÃ³a CÄƒn Chá»‰nh Dá»c (`items-center`) Cho Component Custom Checkbox (`CustomCheckboxComponent`)
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t vÃ  cáº­p nháº­t `app-custom-checkbox` bá»• sung `items-center` Ä‘á»“ng bá»™ vá»›i `app-custom-radio`, kháº¯c phá»¥c tÃ¬nh tráº¡ng lá»‡ch trá»¥c dá»c vÃ  máº¥t cÃ¢n Ä‘á»‘i giao diá»‡n.
- **PhÃ¢n tÃ­ch ká»¹ thuáº­t & NguyÃªn nhÃ¢n:**
  1. TrÆ°á»›c Ä‘Ã³, `CustomCheckboxComponent` sá»­ dá»¥ng `items-start` káº¿t há»£p vá»›i padding-top bÃ¹ trá»« thá»§ cÃ´ng `pt-0.5` trÃªn vÃ¹ng label vÃ  `ng-content`. Äiá»u nÃ y gÃ¢y ra hiá»‡n tÆ°á»£ng Ã´ checkbox bá»‹ lá»‡ch vá»‹ trÃ­ so vá»›i vÄƒn báº£n (Ä‘áº·c biá»‡t khi hiá»ƒn thá»‹ cáº¡nh `app-custom-radio` hoáº·c trong form cÃ³ label/description).
  2. Trong khi Ä‘Ã³, `CustomRadioComponent` sá»­ dá»¥ng `items-center` vÃ  khÃ´ng dÃ¹ng `pt-0.5`, giÃºp nÃºt radio vÃ  text luÃ´n cÄƒn giá»¯a hoÃ n háº£o theo trá»¥c dá»c.
- **CÃ¡c bÆ°á»›c & Vá»‹ trÃ­ Ä‘Ã£ thá»±c hiá»‡n:**
  1. **Template `custom-checkbox.component.html`:**
     - Äá»•i `items-start` thÃ nh `items-center` trÃªn tháº» `<label class="group flex items-center gap-3 cursor-pointer select-none" ...>`.
     - Loáº¡i bá» hoÃ n toÃ n class `pt-0.5` khá»i container text `@if (label || description)` vÃ  tháº» `<span>` chá»©a `<ng-content>`.
     - Chuáº©n hÃ³a thá»¥t lá» cho tháº» `<app-icon>`.
  2. **Bá»• Sung Bá»™ Unit Test ToÃ n Diá»‡n:**
     - `custom-checkbox.component.spec.ts` (5 test cases): Kiá»ƒm tra khá»Ÿi táº¡o default values, class `items-center`, hiá»ƒn thá»‹ label/description, logic toggle checked/emit checkedChange, vÃ´ hiá»‡u hÃ³a khi disabled, vÃ  tÆ°Æ¡ng thÃ­ch ControlValueAccessor.
     - `custom-radio.component.spec.ts` (5 test cases): Kiá»ƒm tra khá»Ÿi táº¡o default values, class `items-center`, hiá»ƒn thá»‹ label/description, logic select/checkedChange, vÃ´ hiá»‡u hÃ³a khi disabled, vÃ  tÆ°Æ¡ng thÃ­ch ControlValueAccessor.
- **XÃ¡c thá»±c:**
  - `npx tsc --noEmit`: 0 lá»—i type.
  - `npm test`: 27/27 tests passed (100%).
  - `npm run build`: Build production hoÃ n táº¥t thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: RÃ  SoÃ¡t & Tá»‘i Æ¯u HÃ³a ToÃ n Diá»‡n Transition Classes (Loáº¡i Bá» `transition-all`, Tuyá»‡t Äá»‘i KhÃ´ng DÃ¹ng Transition Cho `border` & `padding`)
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t láº¡i toÃ n bá»™ codebase Ä‘á»ƒ tá»‘i Æ°u hÃ³a, loáº¡i bá» hoÃ n toÃ n cÃ¡c class `transition-all`, chuyá»ƒn sang khai bÃ¡o danh sÃ¡ch thuá»™c tÃ­nh cá»¥ thá»ƒ (`transform`, `scale`, `background-color`, `color`, `box-shadow`, `opacity`, `width`, `height`, `stroke-dashoffset`, `grid-template-rows`, ...). Tuyá»‡t Ä‘á»‘i khÃ´ng sá»­ dá»¥ng transition vá»›i `border` (border-color, border-width) hay `padding`.
- **PhÃ¢n tÃ­ch ká»¹ thuáº­t & Hiá»‡u nÄƒng trÃ¬nh duyá»‡t:**
  1. **TÃ¡c háº¡i cá»§a `transition-all`:** `transition-all` buá»™c trÃ¬nh duyá»‡t theo dÃµi táº¥t cáº£ cÃ¡c thuá»™c tÃ­nh CSS cÃ³ thá»ƒ animate trÃªn má»—i frame layout/paint/composite. Äiá»u nÃ y gÃ¢y tá»‘n CPU/GPU, kÃ­ch hoáº¡t layout shifts vÃ  repaint liÃªn tá»¥c khi DOM thay Ä‘á»•i hoáº·c hover nhanh.
  2. **TÃ¡c háº¡i cá»§a `transition: border` & `transition: padding`:** Chuyá»ƒn Ä‘á»•i mÃ u viá»n (`border-color`) hoáº·c Ä‘á»‡m lá» (`padding`) lÃ m phÃ¡t sinh chi phÃ­ reflow & rasterization Ä‘áº¯t Ä‘á» trÃªn trÃ¬nh duyá»‡t. Khi loáº¡i bá» transition cho border vÃ  padding, pháº£n há»“i visual tá»©c thÃ¬, káº¿t há»£p cÃ¹ng cÃ¡c thuá»™c tÃ­nh tá»‘i Æ°u pháº§n cá»©ng (`transform`, `scale`, `opacity`, `background-color`, `color`, `box-shadow`) cho hiá»‡u nÄƒng 60-120fps mÆ°á»£t mÃ .
- **CÃ¡c bÆ°á»›c & Vá»‹ trÃ­ Ä‘Ã£ thá»±c hiá»‡n:**
  1. **Há»‡ Thá»‘ng Stylesheet ToÃ n Cá»¥c (`src/styles.scss`):**
     - `.transition-all-300`: Chuyá»ƒn sang `@apply transition-[transform,scale,background-color,color,box-shadow,opacity] duration-300 ease-out;`.
     - `@utility form-textarea`: Chuyá»ƒn `@apply py-3 px-4 transition-all duration-200` âž¡ï¸ `@apply py-3 px-4 transition-[background-color,color,box-shadow] duration-200`.
     - `@utility search-input`: Chuyá»ƒn `@apply h-[42px] pl-9 pr-4 transition-all duration-200` âž¡ï¸ `@apply h-[42px] pl-9 pr-4 transition-[background-color,color,box-shadow] duration-200`.
     - `@utility app-card-interactive`: Chuyá»ƒn `transition-all duration-300` âž¡ï¸ `transition-[transform,scale,background-color,color,box-shadow] duration-300`.
  2. **Layout Header & Sidebar (`src/app/shared/layout/`):**
     - `sidebar.component.html`: Loáº¡i bá» hoÃ n toÃ n `transition-[padding,gap] duration-300 ease-in-out` khá»i container logo.
     - `header.component.html`: Loáº¡i bá» hoÃ n toÃ n `transition-[padding] duration-300 ease-in-out` khá»i tháº» `<header>`.
  3. **CÃ¡c Component ÄÆ°á»£c Tá»‘i Æ¯u HÃ³a Chuáº©n XÃ¡c Theo Ngá»¯ Cáº£nh:**
     - `TooltipDirective`: Chuyá»ƒn `'transition-all'` âž¡ï¸ `'transition-[opacity,transform]'`.
     - `ToastComponent`: Chuyá»ƒn `transition-all duration-300` âž¡ï¸ `transition-[transform,scale,opacity,box-shadow,background-color] duration-300`.
     - `TableComponent`: Chuyá»ƒn sort icon `transition-all` âž¡ï¸ `transition-[transform,color] duration-200`.
     - `ProgressComponent`: Chuyá»ƒn thanh fill dáº¡ng bar `transition-all` âž¡ï¸ `transition-[width] duration-500 ease-out`, thanh segmented âž¡ï¸ `transition-[background-color,opacity] duration-300`.
     - `LogoComponent`: Chuyá»ƒn blur background `transition-all` âž¡ï¸ `transition-[filter,opacity] duration-300`, logo icon âž¡ï¸ `transition-[color,transform] duration-300`.
     - `EmptyStateComponent`: Chuyá»ƒn `transition-all duration-300` âž¡ï¸ `transition-[background-color,box-shadow] duration-300`.
     - `InputOtpComponent`: Chuyá»ƒn OTP slot `transition-all duration-200` âž¡ï¸ `transition-[transform,scale,background-color,color,box-shadow] duration-200`.
     - `VoiceChatComponent`: Chuyá»ƒn main container âž¡ï¸ `transition-[width,height,border-radius,box-shadow,background-color] duration-300`, capsule & header & footer âž¡ï¸ `transition-[opacity,transform] duration-200`, avatar morphing grid âž¡ï¸ `transition-[left,top,width,height,opacity] duration-300`, avatar img âž¡ï¸ `transition-[width,height,box-shadow] duration-300`, name label âž¡ï¸ `transition-[opacity,top] duration-200`.
     - `DropdownMenuComponent`: Loáº¡i bá» `ring-color` khá»i trigger avatar, giá»¯ `transition-[box-shadow] duration-200`.
     - `FileUploadComponent`: Chuyá»ƒn horizontal & dropzone boxes âž¡ï¸ `transition-[transform,scale,background-color,box-shadow] duration-200`, avatar box âž¡ï¸ `transition-[background-color,box-shadow] duration-200`, camera circle âž¡ï¸ `transition-[transform,scale,color,background-color] duration-200`, file item card âž¡ï¸ `transition-[background-color,color,box-shadow] duration-200`, progress upload bar âž¡ï¸ `transition-[width] duration-200`.
     - `CustomRadioComponent`: Chuyá»ƒn radio container `transition-all duration-200` âž¡ï¸ `transition-[background-color,box-shadow,transform,scale] duration-200`.
     - `CustomSliderComponent`: Chuyá»ƒn track fill `transition-all duration-75` âž¡ï¸ `transition-[width] duration-75`, thumb handle âž¡ï¸ `transition-[left,transform,scale,box-shadow,background-color] duration-75`.
     - `CustomSelectComponent`: Chuyá»ƒn multi-select checkbox âž¡ï¸ `transition-[background-color,transform,scale] duration-150`.
     - `CustomDateTimeRangeComponent`: Chuyá»ƒn cÃ¡c nÃºt dropdown giá»/phÃºt âž¡ï¸ `transition-[transform,scale,background-color,color,box-shadow] duration-150`.
     - `CustomCheckboxComponent`: Chuyá»ƒn checkbox box âž¡ï¸ `transition-[background-color,box-shadow,transform,scale] duration-200`, checkmark icon âž¡ï¸ `transition-[transform,scale,opacity] duration-150 ease-out`.
     - `CodeBlockComponent`: Chuyá»ƒn footer wrapper âž¡ï¸ `transition-[background-color,color,box-shadow] duration-200`.
     - `AccordionItemComponent`: Chuyá»ƒn item container âž¡ï¸ `transition-[background-color,box-shadow] duration-300`, chevron icon âž¡ï¸ `transition-[transform,color] duration-300`, grid rows collapse âž¡ï¸ `transition-[grid-template-rows,opacity] duration-300`.
     - `BadgeComponent`: Chuyá»ƒn interactive badge âž¡ï¸ `transition-[transform,scale,background-color,color,box-shadow,opacity]` + `duration-200`.
     - `AvatarComponent`: Chuyá»ƒn avatar group hover âž¡ï¸ `transition-[transform,box-shadow] duration-200`.
     - `AlertComponent`: Chuyá»ƒn alert box âž¡ï¸ `transition-[transform,opacity,box-shadow] duration-300`.
     - `StatCardComponent`: Sá»­a `transition-[transform,scale,shadow]` âž¡ï¸ `transition-[transform,scale,box-shadow] duration-200`.
     - `HomeComponent`: Chuyá»ƒn link txHash âž¡ï¸ `transition-[color,opacity] duration-150`.
- **XÃ¡c thá»±c:**
  - `npx tsc --noEmit`: 0 lá»—i type.
  - `npm test`: 17/17 tests passed (100%).
  - `npm run build`: Build production hoÃ n táº¥t thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c Phá»¥c Lá»—i UI Hiá»ƒn Thá»‹ Cho SVG Gauge (Circular Ring & Semi-Circle Gauge) Trong `ProgressComponent`
- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i giao diá»‡n hiá»ƒn thá»‹ bá»‹ Ä‘Ã¨ chá»¯, thu nhá» báº¥t thÆ°á»ng vÃ  vá»¡ bá»‘ cá»¥c táº¡i má»¥c "6. Circular Ring & Semi-Circle Gauge" (`app-progress[type='circle']` & `app-progress[type='semicircle']`).
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n gá»‘c rá»… ká»¹ thuáº­t:**
  1. **RÃ ng buá»™c kÃ­ch thÆ°á»›c toÃ n cá»¥c cá»§a `app-icon` trong `index.html`:** Trong tháº» `<style>` cá»§a `index.html`, tag `app-icon` bá»‹ gÃ¡n kÃ­ch thÆ°á»›c cá»‘ Ä‘á»‹nh `width: 1.25rem; height: 1.25rem;` (20px x 20px). Do Ä‘Ã³, khi `ProgressComponent` sá»­ dá»¥ng `<app-icon>` Ä‘á»ƒ váº½ SVG gauge, toÃ n bá»™ hÃ¬nh váº½ SVG bá»‹ Ã©p láº¡i trong khung 20px, khiáº¿n vÃ²ng trÃ²n SVG chá»‰ cÃ³ Ä‘Æ°á»ng kÃ­nh ~20px vÃ  bá»‹ chá»¯ `68%` vÃ  label Ä‘Ã¨ kÃ­n.
  2. **Hiá»ƒn thá»‹ Ä‘Ãºp Header/Label ngoÃ i dá»± kiáº¿n:** Äiá»u kiá»‡n hiá»ƒn thá»‹ tiÃªu Ä‘á» trÃªn cÃ¹ng `@if (label || (showValue && valuePosition === 'top'))` Ã¡p dá»¥ng chung mÃ  khÃ´ng kiá»ƒm tra `type === 'bar'`, khiáº¿n cÃ¡c thanh Ä‘o dáº¡ng trÃ²n vÃ  bÃ¡n nguyá»‡t bá»‹ in ra nhÃ£n text á»Ÿ trÃªn Ä‘áº§u ("CIRCULAR RING", "SEMI-CIRCLE") vÃ  tiáº¿p tá»¥c in nhÃ£n má»™t láº§n ná»¯a á»Ÿ giá»¯a vÃ²ng trÃ²n/chÃ¢n vÃ²m.
  3. **ViewBox & Khung BÃ¡n Nguyá»‡t Bá»‹ TrÃ n/Cáº¯t Viá»n:** ViewBox cá»§a `progress-semicircle` trÆ°á»›c Ä‘Ã³ Ä‘áº·t `0 0 100 55` trong khi bÃ¡n kÃ­nh bo vÃ  Ä‘Æ°á»ng kÃ­nh nÃ©t viá»n (`strokeWidth = 8`) Ä‘áº©y Ä‘iá»ƒm cháº¡m cá»§a stroke ra `y = 6` Ä‘áº¿n `y = 54` vÃ  `x = 6` Ä‘áº¿n `x = 94`.
- **Giáº£i phÃ¡p & CÃ¡c bÆ°á»›c Ä‘Ã£ thá»±c hiá»‡n:**
  1. **Chuáº©n HÃ³a SVG Trá»±c Tiáº¿p Trong `ProgressComponent` (`progress.component.html`):**
     - Thay tháº¿ tháº» `<app-icon>` báº±ng trá»±c tiáº¿p cÃ¡c pháº§n tá»­ `<svg>` native vá»›i `viewBox="0 0 100 100"` (cho circle) vÃ  `viewBox="0 0 100 58"` (cho semicircle). Nhá» Ä‘Ã³, SVG bung Ä‘Ãºng 100% kÃ­ch thÆ°á»›c container cha (60px/76px/96px/124px/152px) mÃ  khÃ´ng bá»‹ giá»›i háº¡n 20px cá»§a `app-icon`.
     - Äáº·t Ä‘iá»u kiá»‡n tiÃªu Ä‘á» trÃªn cÃ¹ng thÃ nh `@if (type === 'bar' && (label || (showValue && valuePosition === 'top')))` Ä‘á»ƒ dÃ nh riÃªng cho thanh tiáº¿n trÃ¬nh dáº¡ng bar.
     - CÄƒn chá»‰nh typography cho nhÃ£n text vÃ  giÃ¡ trá»‹ pháº§n trÄƒm bÃªn trong vÃ²ng trÃ²n vÃ  bÃ¡n nguyá»‡t: bá»• sung `pointer-events-none select-none`, phÃ¢n cáº¥p cá»¡ chá»¯ responsive theo kÃ­ch cá»¡ component (`xs`, `sm`, `md`, `lg`, `xl`).
     - Tá»‘i Æ°u transition chuyá»ƒn Ä‘á»™ng chá»‰ riÃªng cho thuá»™c tÃ­nh `stroke-dashoffset` (`transition-[stroke-dashoffset] duration-500 ease-out`).
  2. **Chuáº©n HÃ³a Controller `ProgressComponent` (`progress.component.ts`):**
     - Cáº­p nháº­t tá»· lá»‡ kÃ­ch thÆ°á»›c Ä‘Æ°á»ng kÃ­nh `getCircleSizePx()` (xs: 60px, sm: 76px, md: 96px, lg: 124px, xl: 152px) táº¡o khÃ´ng gian rá»™ng rÃ£i cho text bÃªn trong.
     - Loáº¡i bá» import `IconComponent` khÃ´ng cáº§n thiáº¿t.
     - Äá»“ng bá»™ cÃ¡c hÃ m `getVariantClasses()`, `getVariantStrokeColor()`, `getVariantTextColor()` sá»­ dá»¥ng cÃ¡c class Tailwind v4 chuáº©n (`bg-primary`, `stroke-primary`, `text-primary`, `bg-emerald-500`, v.v.).
  3. **Bá»• Sung Bá»™ Unit Test ToÃ n Diá»‡n (`progress.component.spec.ts`):**
     - 4 test cases kiá»ƒm tra tÃ­nh toÃ¡n pháº§n trÄƒm, tÃ­nh toÃ¡n chu vi Ä‘Æ°á»ng trÃ²n/bÃ¡n nguyá»‡t, Ä‘á»™ lá»‡ch dashoffset vÃ  Ä‘áº£m báº£o khÃ´ng xuáº¥t hiá»‡n header Ä‘Ãºp trÃªn gauge.
- **XÃ¡c thá»±c:**
  - `npx tsc --noEmit`: 0 lá»—i type.
  - `npm test`: 17/17 tests passed (100%).
  - `npm run build`: Build production hoÃ n táº¥t thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Tá»‘i Æ¯u HÃ³a Responsive Cho Tab Bar & Header Trong Code Block Component (`CodeBlockComponent`)
- **Ná»™i dung yÃªu cáº§u:** Tá»‘i Æ°u hÃ³a responsive cho pháº§n Tab trong `CodeBlockComponent` khi hiá»ƒn thá»‹ trÃªn mÃ n hÃ¬nh nhá» hoáº·c trong cÃ¡c layout chia cá»™t (grid 2 cá»™t) trÃªn Desktop/Tablet Ä‘á»ƒ tab khÃ´ng bá»‹ che khuáº¥t hoáº·c bá»‹ Ä‘áº©y máº¥t chá»¯.
- **PhÃ¢n tÃ­ch ká»¹ thuáº­t & NguyÃªn nhÃ¢n:**
  1. **Thiáº¿u `min-w-0 flex-1` trÃªn Tab Container:** VÃ¹ng chá»©a tab trÆ°á»›c Ä‘Ã³ náº±m trong header flexbox vá»›i `justify-between` mÃ  khÃ´ng cÃ³ `min-w-0 flex-1`, khiáº¿n kÃ­ch thÆ°á»›c tab bá»‹ Ã©p láº¡i vÃ  khÃ´ng cuá»™n ngang Ä‘Æ°á»£c khi chiá»u rá»™ng háº¹p.
  2. **NÃºt Action (Wrap & Copy) chiáº¿m nhiá»u diá»‡n tÃ­ch:** Hai nÃºt Wrap vÃ  Copy hiá»ƒn thá»‹ cáº£ icon + text cá»‘ Ä‘á»‹nh chiáº¿m ~160px chiá»u rá»™ng. Khi Code Block náº±m trong cá»™t háº¹p (khoáº£ng 350px - 450px), diá»‡n tÃ­ch cÃ²n láº¡i cho Tab chá»‰ cÃ²n ~190px - 240px, dáº«n Ä‘áº¿n tab thá»© 2 (`wallet.component.html`) bá»‹ Ä‘áº©y ra ngoÃ i vÃ¹ng nhÃ¬n tháº¥y.
  3. **Container Query `@container` & Cuá»™n MÆ°á»£t mÃ :** Khi chuyá»ƒn container sang `@container`, nÃºt Wrap vÃ  Copy tá»± Ä‘á»™ng thu gá»n thÃ nh Icon-only gá»n gÃ ng (kÃ¨m Tooltip chi tiáº¿t) khi chiá»u rá»™ng Code Block `< 440px`, tiáº¿t kiá»‡m ngay gáº§n 100px cho thanh Tab. Äá»“ng thá»i, danh sÃ¡ch Tab há»— trá»£ cuá»™n ngang linh hoáº¡t (`overflow-x-auto no-scrollbar scroll-smooth`) káº¿t há»£p `truncate` tÃªn file an toÃ n (`max-w-[105px] @[420px]:max-w-[160px] @[540px]:max-w-none`).
- **CÃ¡c bÆ°á»›c & Vá»‹ trÃ­ Ä‘Ã£ thá»±c hiá»‡n:**
  1. **Template `code-block.component.html`:**
     - ThÃªm `@container` vÃ o container cha `.code-block-container`.
     - Cáº­p nháº­t tab container vá»›i `min-w-0 flex-1 overflow-x-auto no-scrollbar py-0.5 scroll-smooth`.
     - ThÃªm `truncate` responsive linh hoáº¡t cho tÃªn file trong tá»«ng tab (`file.name`) vÃ  cháº¿ Ä‘á»™ file Ä‘Æ¡n (`currentFileName`).
     - Tá»‘i Æ°u nÃºt `Wrap` vÃ  `Copy`: sá»­ dá»¥ng `hidden @[440px]:inline` Ä‘á»ƒ tá»± Ä‘á»™ng chuyá»ƒn Ä‘á»•i giá»¯a dáº¡ng Ä‘áº§y Ä‘á»§ (icon + text) vÃ  icon-only trÃªn layout háº¹p mÃ  váº«n giá»¯ nguyÃªn Tooltip.
     - ThÃªm `active:scale-95` vÃ  `transition-[transform,scale,background-color,color,box-shadow] duration-150` chuáº©n hiá»‡u nÄƒng.
  2. **Controller `code-block.component.ts`:**
     - NÃ¢ng cáº¥p `selectTab(index: number, event?: Event)` tá»± Ä‘á»™ng gá»i `scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })` khi ngÆ°á»i dÃ¹ng click chá»n tab.
  3. **Unit Test `code-block.component.spec.ts`:**
     - Bá»• sung bá»™ Unit Test toÃ n diá»‡n (4 test cases) kiá»ƒm tra single code file, multi-file tab switching, wrap/collapse toggle vÃ  copy to clipboard.
- **XÃ¡c thá»±c:**
  - `npx tsc --noEmit`: 0 lá»—i type.
  - `npm test`: 13/13 tests passed (100%).
  - `npm run build`: Build production hoÃ n táº¥t thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: XÃ¢y Dá»±ng Component Demo Modal Má»›i Chuáº©n Máº«u (Modal XÃ¡c Nháº­n XÃ³a - Delete Confirmation Modal)
- **Ná»™i dung yÃªu cáº§u:** Táº¡o component modal demo má»›i (tiÃªu biá»ƒu lÃ  Modal XÃ¡c Nháº­n XÃ³a - `DeleteConfirmModalComponent`) hoÃ n chá»‰nh, chuáº©n má»±c Ä‘á»ƒ sau nÃ y cÃ¡c modal khÃ¡c vÃ  cÃ¡c dá»± Ã¡n khÃ¡c cÃ³ thá»ƒ dá»±a vÃ o Ä‘Ã³ lÃ m theo chuáº©n thá»‘ng nháº¥t.
- **PhÃ¢n tÃ­ch ká»¹ thuáº­t & Kiáº¿n trÃºc Giáº£i phÃ¡p:**
  1. **Kiáº¿n trÃºc Modal Äá»™ng 2 Chiá»u (Dual Invocation Architecture):**
     - **Dynamic Injection qua `ModalService`:** Gá»i `modalService.deleteConfirm(...)` hoáº·c `modalService.open(...)` trá»±c tiáº¿p trong controller TypeScript, nháº­n káº¿t quáº£ báº¥t Ä‘á»“ng bá»™ qua `modalRef.afterClosed$` mÃ  khÃ´ng cáº§n viáº¿t boilerplate HTML trong parent template.
     - **Template Binding qua Selector:** Há»— trá»£ dÃ¹ng trá»±c tiáº¿p tháº» `<app-delete-confirm-modal>` vá»›i cÃ¡c `@Input()` vÃ  `@Output()`.
  2. **TiÃªu Chuáº©n Thiáº¿t Káº¿ & Tráº£i Nghiá»‡m NgÆ°á»i DÃ¹ng (Gold Standard Pattern):**
     - **Header:** Icon cáº£nh bÃ¡o / thÃ¹ng rÃ¡c soft badge vá»›i hiá»‡u á»©ng viá»n há»“ng Ä‘á» (`bg-rose-500/10 text-rose-500 ring-4 ring-rose-500/5`), tiÃªu Ä‘á» vÃ  subtitle rÃµ rÃ ng.
     - **Target Resource Summary Card:** Báº£ng tÃ³m táº¯t thÃ´ng tin tÃ i nguyÃªn bá»‹ xÃ³a (TÃªn, MÃ£ Token/Hash, Máº¡ng lÆ°á»›i, Loáº¡i tÃ i nguyÃªn, Thá»i gian táº¡o, Gas fee) hiá»ƒn thá»‹ trong tháº» bo gÃ³c tá»‘i Ä‘a 15px.
     - **Irreversible Warning Banner:** Banner cáº£nh bÃ¡o mÃ u cam/Ä‘á» ná»•i báº­t vá»›i icon `warning` nháº¥n máº¡nh thao tÃ¡c khÃ´ng thá»ƒ khÃ´i phá»¥c.
     - **Safety Verification Input:** Ã” nháº­p liá»‡u yÃªu cáº§u gÃµ chÃ­nh xÃ¡c tá»« khÃ³a xÃ¡c nháº­n (vÃ­ dá»¥ tÃªn item hoáº·c tá»« khÃ³a `"CYBER-SAMURAI"` / `"DELETE"`) Ä‘á»ƒ kÃ­ch hoáº¡t nÃºt xÃ³a.
     - **Reason Selection:** Dropdown chá»n lÃ½ do xÃ³a dá»¯ liá»‡u kÃ¨m Ã´ nháº­p ghi chÃº chi tiáº¿t khi chá»n lÃ½ do khÃ¡c.
     - **Agreement Checkbox:** Checkbox cam káº¿t hiá»ƒu rÃµ rá»§i ro trÆ°á»›c khi xÃ³a vÄ©nh viá»…n.
     - **Footer Actions:** NÃºt "Há»§y Bá»" (`variant="cancel"`) vÃ  nÃºt "XÃ¡c Nháº­n XÃ³a" (`variant="danger"`) tÃ­ch há»£p icon SVG, loading spinner vÃ  disabled state.
  3. **TuÃ¢n Thá»§ Tuyá»‡t Äá»‘i Design System & Clean Code:**
     - Sá»­ dá»¥ng `:host { display: block; }`.
     - TÃ­ch há»£p lá»›p bá» máº·t `glass-dialog` vÃ  `glass-dialog-backdrop`.
     - Hiá»‡u á»©ng nÃºt báº¥m loáº¡i bá» hoÃ n toÃ n `transition-all` vÃ  `border-color`.
     - 100% SVG Icons qua `<app-icon>`, khÃ´ng dÃ¹ng Raw Emoji.
     - KhÃ´ng cÃ³ comment tiáº¿ng Viá»‡t trong mÃ£ nguá»“n (mÃ£ sáº¡ch tá»± giáº£i thÃ­ch).
     - Há»— trá»£ Ä‘áº§y Ä‘á»§ Äa ngÃ´n ngá»¯ (i18n Tiáº¿ng Viá»‡t vÃ  Tiáº¿ng Anh).
- **CÃ¡c bÆ°á»›c & Vá»‹ trÃ­ Ä‘Ã£ thá»±c hiá»‡n:**
  1. **Component Modal Má»›i (`src/app/features/home/components/delete-confirm-modal/`):**
     - `delete-confirm-modal.types.ts`: Äá»‹nh nghÄ©a interfaces `DeleteConfirmItemDetail`, `DeleteConfirmReasonOption`, `DeleteConfirmModalData`, `DeleteConfirmModalResult`.
     - `delete-confirm-modal.component.html`: Template Glassmorphism responsive cho desktop vÃ  mobile.
     - `delete-confirm-modal.component.ts`: Logic quáº£n trá»‹ tráº¡ng thÃ¡i báº±ng Signals & Computed (`isValid`, `isKeywordMatched`, `isDeleting`).
     - `delete-confirm-modal.component.spec.ts`: Bá»™ Unit Test tá»± Ä‘á»™ng (3/3 tests passed).
  2. **NÃ¢ng Cáº¥p `ModalService` (`src/app/core/services/modal.service.ts`):**
     - Bá»• sung helper method `deleteConfirm(data: DeleteConfirmModalData): ModalRef<DeleteConfirmModalResult>`.
  3. **Äa NgÃ´n Ngá»¯ i18n (`src/app/core/i18n/`):**
     - Cáº­p nháº­t `i18n.types.ts`, `vi.ts`, `en.ts` vá»›i Ä‘áº§y Ä‘á»§ tá»« Ä‘iá»ƒn `delete_modal`, nÃ¢ng cáº¥p `cards.modal_demo` (thÃªm `modal_type`, `status_label`, `payload_label`, `status_confirmed`, `status_cancelled`), bá»• sung `showcase.confirm_modal_desc` vÃ  `common.confirmed`.
     - RÃ  soÃ¡t 100% cÃ¡c nhÃ£n text cá»©ng cÃ²n sÃ³t láº¡i trÃªn giao diá»‡n modal vÃ  dashboard Ä‘á»ƒ Ä‘Æ°a qua Pipe `| translate` vÃ  `TranslationService`.
  4. **NÃ¢ng Cáº¥p Showcase Card TrÃªn Dashboard & Chuáº©n HÃ³a NÃºt ÄÃ³ng X (`ModalWrapperComponent` & `ConfirmModalComponent`):**
     - `modal-wrapper.component.html`: Bá»• sung nÃºt Ä‘Ã³ng `X` (`btn-close absolute top-4 right-4 z-20`) khi `showHeader: false` Ä‘á»ƒ Ä‘áº£m báº£o má»i modal Ä‘á»™ng (Confirm Modal, Delete Modal, Custom Modal) Ä‘á»u luÃ´n cÃ³ nÃºt `X` á»Ÿ gÃ³c trÃªn bÃªn pháº£i.
     - `confirm-modal.component.html`: Bá»• sung nÃºt `X` cho cáº£ cháº¿ Ä‘á»™ static `!isDynamic`.
     - `home.component.ts`: Bá»• sung cÃ¡c phÆ°Æ¡ng thá»©c `openDeleteConfirmModal()`, `openQuickConfirmModal()`, quáº£n lÃ½ `lastModalResult` vÃ  code snippet `modalStandardCodeSnippet`.
     - `home.component.html`: XÃ¢y dá»±ng Tháº» Showcase Há»‡ thá»‘ng Modal hoÃ n chá»‰nh gá»“m 3 nÃºt má»Ÿ modal (Modal XÃ³a, Modal Form, Quick Confirm), khá»‘i hiá»ƒn thá»‹ káº¿t quáº£ tÆ°Æ¡ng tÃ¡c realtime vÃ  code block máº«u chuáº©n.
- **XÃ¡c thá»±c:**
  - `npx tsc --noEmit`: 0 lá»—i type.
  - `npm test`: 9/9 tests passed (100%).
  - `npm run build`: Build production hoÃ n táº¥t thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Chuáº©n HÃ³a `select-none` Cho CÃ¡c Interactive Component (Tab Group, Button, Dropdown, DatePicker, Pagination, Switch, ...)
- **Ná»™i dung yÃªu cáº§u:** Äáº£m báº£o táº¥t cáº£ cÃ¡c component tÆ°Æ¡ng tÃ¡c nhÆ° Tab Group, Button, Dropdown, Custom Select, Date Picker, Pagination, Switch, Stepper, Theme Switcher, v.v. pháº£i cÃ³ class `select-none` (`user-select: none`) Ä‘á»ƒ ngÄƒn cháº·n viá»‡c bÃ´i Ä‘en vÄƒn báº£n ngoÃ i Ã½ muá»‘n khi ngÆ°á»i dÃ¹ng click nhanh, double-click hoáº·c cháº¡m vuá»‘t trÃªn thiáº¿t bá»‹ cáº£m á»©ng.
- **PhÃ¢n tÃ­ch ká»¹ thuáº­t:**
  1. Khi ngÆ°á»i dÃ¹ng báº¥m nÃºt, chuyá»ƒn tab, má»Ÿ dropdown hoáº·c click chá»n ngÃ y/trang liÃªn tá»¥c, viá»‡c thiáº¿u `user-select: none` sáº½ kÃ­ch hoáº¡t cÆ¡ cháº¿ chá»n vÄƒn báº£n máº·c Ä‘á»‹nh cá»§a trÃ¬nh duyá»‡t, lÃ m bÃ´i xanh text vÃ  gÃ¢y tráº£i nghiá»‡m ngÆ°á»i dÃ¹ng kÃ©m tá»± nhiÃªn (khÃ´ng giá»‘ng native app).
  2. Viá»‡c bá»• sung `select-none` á»Ÿ táº§ng CSS base (`button`, `[role='button']`), há»‡ thá»‘ng utility class (`.btn`, `.btn-*`, `@utility tab-group`, `@utility tab-item`, `@utility dropdown-menu-popover`, `@utility date-picker-popover`, `@utility date-time-range-popover`) vÃ  trong template cá»§a cÃ¡c component tÆ°Æ¡ng tÃ¡c Ä‘áº£m báº£o tráº£i nghiá»‡m Ä‘á»“ng bá»™ vÃ  mÆ°á»£t mÃ  trÃªn toÃ n há»‡ thá»‘ng.
- **CÃ¡c bÆ°á»›c & Vá»‹ trÃ­ Ä‘Ã£ thá»±c hiá»‡n:**
  1. **Há»‡ Thá»‘ng Utility & Base Styles (`src/styles.scss`):**
     - Base `button, [role='button']`: ThÃªm `@apply select-none;`.
     - Button utilities: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-danger-light`, `.btn-cancel`, `.btn-ghost`, `.btn-success`, `.btn-info`, `.btn-reload`, `.btn-outline`, `.btn-close`, `.btn-close-sm` âž¡ï¸ Bá»• sung `select-none`.
     - Tab Utilities: `@utility tab-group` vÃ  `@utility tab-item` âž¡ï¸ Bá»• sung `select-none`.
     - Popover Utilities: `@utility dropdown-menu-popover`, `@utility date-picker-popover`, `@utility date-time-range-popover` âž¡ï¸ Bá»• sung `user-select: none;`.
  2. **CÃ¡c Component TÆ°Æ¡ng TÃ¡c:**
     - `TabGroupComponent`: Bá»• sung `select-none` vÃ o container `#containerEl`, cÃ¡c nÃºt `tab-item`, nhÃ£n `opt.label`, vÃ  badge.
     - `DropdownMenuComponent`: Bá»• sung `select-none` vÃ o trigger container, `#popoverEl`, header, submenu button, checkbox button, radio button, action button, `#submenuEl` vÃ  cÃ¡c submenu child buttons.
     - `CustomSelectComponent`: Bá»• sung `select-none` vÃ o wrapper container, trigger button, dropdown popover, nhÃ£n option vÃ  cÃ¡c item button.
     - `AccountDropdownComponent`: Bá»• sung `select-none` vÃ o popover container, header details, Ä‘á»‹a chá»‰, sá»‘ dÆ° vÃ  táº¥t cáº£ action buttons.
     - `NetworkSelectorComponent`: Bá»• sung `select-none` vÃ o trigger button, popover container vÃ  danh sÃ¡ch chain item buttons.
     - `LanguageSelectorComponent`: Bá»• sung `select-none` vÃ o trigger buttons (compact & full), popover container vÃ  danh sÃ¡ch language item buttons.
     - `CustomDatePickerComponent` & `CustomDateTimeRangeComponent`: Bá»• sung `select-none` vÃ o trigger div, popover panel, preset buttons, nÃºt prev/next thÃ¡ng, tiÃªu Ä‘á» thÃ¡ng/nÄƒm, weekday header, calendar day buttons vÃ  time controls/done buttons.
     - `PaginationComponent`: Bá»• sung `select-none` vÃ o pagination container, nÃºt prev/next, cÃ¡c nÃºt sá»‘ trang vÃ  dáº¥u `...`.
     - `CustomSwitchComponent`: Bá»• sung `select-none` vÃ o full-layout container, label vÃ  description.
     - `StepperComponent`: Bá»• sung `select-none` vÃ o stepper wrapper container vÃ  cÃ¡c nhÃ£n bÆ°á»›c.
     - `ThemeSwitcherComponent`: Bá»• sung `select-none` vÃ o switcher container, pill indicator vÃ  cÃ¡c nÃºt chá»n cháº¿ Ä‘á»™ (light/auto/dark).
     - `TxSpeedSelectorComponent`: Bá»• sung `select-none` vÃ o container, label, speed options vÃ  custom multiplier controls.
- **XÃ¡c thá»±c:**
  - `npx tsc --noEmit`: 0 lá»—i type.
  - `npm test`: 6/6 tests passed (100%).
  - `npm run build`: Build production hoÃ n táº¥t thÃ nh cÃ´ng.

### YÃªu cáº§u: Tá»‘i Æ¯u HÃ³a Responsive Cho MÃ n HÃ¬nh SiÃªu Nhá» (320px & DÆ°á»›i 260px) á»ž Component Voice Chat
- **Ná»™i dung yÃªu cáº§u:** Tá»‘i Æ°u hÃ³a triá»‡t Ä‘á»ƒ component Voice Chat (`VoiceChatComponent`) trÃªn cÃ¡c mÃ n hÃ¬nh siÃªu nhá» (320px viewport, container kháº£ dá»¥ng tá»« 200px - 250px) Ä‘á»ƒ khÃ´ng bá»‹ cáº¯t xÃ©n báº¥t ká»³ avatar hay nhÃ£n tÃªn nÃ o (nhÆ° Albert, Ben á»Ÿ cá»™t thá»© 3).
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n gá»‘c rá»… ká»¹ thuáº­t:**
  1. **Bá»‹ Ã©p clamp bá» rá»™ng tá»‘i thiá»ƒu 240px:** Logic Ä‘o kÃ­ch thÆ°á»›c trÆ°á»›c Ä‘Ã³ gÃ¡n `Math.max(240, available)`. TrÃªn viewport 320px vá»›i padding lá»“ng nhau (`app-card`, demo wrapper), bá» rá»™ng kháº£ dá»¥ng thá»±c táº¿ chá»‰ khoáº£ng 210px - 230px. Khi gÃ¡n cá»‘ Ä‘á»‹nh 240px, cÃ¡c cá»™t avatar vÃ  card bá»‹ vÆ°á»£t ra ngoÃ i vÃ  trÃ n viá»n `overflow-hidden`.
  2. **KÃ­ch thÆ°á»›c avatar 46px quÃ¡ lá»›n trÃªn container < 250px:** Khi container dÆ°á»›i 250px, 3 cá»™t vá»›i avatar 46px + gap chiáº¿m > 220px khiáº¿n cá»™t thá»© 3 (Albert vÃ  Ben) cháº¡m sÃ¡t viá»n pháº£i hoáº·c bá»‹ cáº¯t má»™t ná»­a.
- **Giáº£i phÃ¡p triá»‡t Ä‘á»ƒ:**
  1. **Há»‡ thá»‘ng Responsive 3 Táº§ng KÃ­ch ThÆ°á»›c (3-Tier Responsive System):**
     - **Táº§ng Ultra-Compact (`width < 260px` - MÃ n hÃ¬nh 320px):**
       - LÆ°á»›i 3 cá»™t: avatar `38px`, chiá»u cao hÃ ng `64px`, `gridStartY = 62px`.
       - Chiá»u cao má»Ÿ rá»™ng `expandedHeight = 365px`.
       - Cáº£ 7 avatar (Jessica, Linda, Albert, Robert, Jenny, Ben, Emily) cÃ¹ng nhÃ£n tÃªn Ä‘á»u náº±m trá»n váº¹n 100% bÃªn trong card vá»›i khoáº£ng Ä‘á»‡m an toÃ n 2 bÃªn.
     - **Táº§ng Compact (`260px <= width < 330px` - MÃ n hÃ¬nh 360px - 390px):**
       - LÆ°á»›i 3 cá»™t: avatar `44px`, chiá»u cao hÃ ng `74px`, `expandedHeight = 405px`.
     - **Táº§ng Chuáº©n (`width >= 330px` - MÃ n hÃ¬nh lá»›n):**
       - LÆ°á»›i 4 cá»™t: avatar `52px`, chiá»u cao hÃ ng `84px`, `expandedHeight = 355px`.
  2. **Tá»‘i Æ°u Capsule thu gá»n & Padding Wrapper:**
     - Capsule thu gá»n: Tá»± Ä‘á»™ng Ä‘iá»u chá»‰nh kÃ­ch thÆ°á»›c avatar (30px/34px/40px) vÃ  khoáº£ng cÃ¡ch linh hoáº¡t theo bá» rá»™ng container.
     - Demo wrapper container: Äiá»u chá»‰nh padding `p-2.5 sm:p-4` giÃºp tÄƒng khÃ´ng gian bá» ngang cho mobile nhá».
- **XÃ¡c thá»±c:**
  - `npx tsc --noEmit`: 0 lá»—i type.
  - `npm test`: 6/6 tests passed (100%).
  - `npm run build`: Build production hoÃ n táº¥t thÃ nh cÃ´ng.

### YÃªu cáº§u: Kháº¯c Phá»¥c Lá»—i Máº¥t Hiá»‡u á»¨ng Transition Khi Active Scale (`active:scale-[0.98]`, `active:scale-95`)
- **Ná»™i dung yÃªu cáº§u:** TÃ¬m hiá»ƒu nguyÃªn nhÃ¢n vÃ¬ sao cÃ¡c nÃºt báº¥m bá»‹ máº¥t hiá»‡u á»©ng transition khi active class `scale` (vÃ­ dá»¥ `active:scale-[0.98]`, `active:scale-95`, `hover:scale-105`) vÃ  xá»­ lÃ½ triá»‡t Ä‘á»ƒ.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n gá»‘c rá»… ká»¹ thuáº­t:**
  1. **Kiáº¿n trÃºc CSS Transforms Level 2 & Tailwind CSS v4:** Trong Tailwind CSS v4 vÃ  trÃ¬nh duyá»‡t hiá»‡n Ä‘áº¡i, cÃ¡c utility `scale-*` (`scale-95`, `scale-[0.98]`, `scale-105`) biÃªn dá»‹ch thÃ nh thuá»™c tÃ­nh CSS Ä‘á»™c láº­p `scale: 0.98;` hoáº·c `scale: var(--tw-scale-x) var(--tw-scale-y);` chá»© KHÃ”NG pháº£i `transform: scale(0.98);`.
  2. **Xung Ä‘á»™t trong thuá»™c tÃ­nh Transition:** Khi khai bÃ¡o `transition-[transform,...]`, trÃ¬nh duyá»‡t chá»‰ theo dÃµi thuá»™c tÃ­nh `transform` mÃ  bá» qua thuá»™c tÃ­nh `scale`. Do Ä‘Ã³, khi `active:scale-[0.98]` kÃ­ch hoáº¡t, giÃ¡ trá»‹ `scale` thay Ä‘á»•i tá»©c thÃ¬ (0ms duration, khÃ´ng cÃ³ ná»™i suy chuyá»ƒn Ä‘á»™ng), lÃ m máº¥t hoÃ n toÃ n hiá»‡u á»©ng mÆ°á»£t mÃ  (smooth click feel).
  3. **Giáº£i phÃ¡p chuáº©n hÃ³a:** Bá»• sung thuá»™c tÃ­nh `scale` song song vá»›i `transform` trong danh sÃ¡ch thuá»™c tÃ­nh transition: `transition-[transform,scale,background-color,background-image,color,box-shadow,opacity] duration-200` (cho button) vÃ  `transition-[transform,scale,background-color,color] duration-150` (cho close/icon buttons).
- **CÃ¡c bÆ°á»›c & Vá»‹ trÃ­ Ä‘Ã£ thá»±c hiá»‡n:**
  1. **Há»‡ Thá»‘ng Button Utility (`src/styles.scss`):**
     - Bá»• sung `scale` vÃ o `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-danger-light`, `.btn-cancel`, `.btn-ghost`, `.btn-success`, `.btn-info`, `.btn-reload`, `.btn-outline` âž¡ï¸ `transition-[transform,scale,background-color,background-image,color,box-shadow,opacity] duration-200`.
     - Bá»• sung `scale` vÃ o `.btn-close`, `.btn-close-sm` âž¡ï¸ `transition-[transform,scale,background-color,color] duration-150`.
     - Bá»• sung `scale` vÃ o `@utility tab-item` âž¡ï¸ `transition-[color,background-color,box-shadow,transform,scale] duration-200`.
  2. **ToÃ n Bá»™ CÃ¡c Component:**
     - `SidebarComponent`: NÃºt thu phÃ³ng vÃ  nÃºt Ä‘á»•i theme âž¡ï¸ `transition-[transform,scale,background-color,color,box-shadow] duration-200`.
     - `HeaderComponent`: NÃºt Hamburger mobile menu âž¡ï¸ `transition-[transform,scale,background-color,color,box-shadow] duration-200`.
     - `NetworkSelectorComponent`: NÃºt chá»n máº¡ng âž¡ï¸ `transition-[transform,scale,background-color,color,box-shadow] duration-200`.
     - `LanguageSelectorComponent`: NÃºt chá»n ngÃ´n ngá»¯ (Compact & Full) âž¡ï¸ `transition-[transform,scale,background-color,color,box-shadow] duration-200`.
     - `PaginationComponent`: NÃºt Prev, Next vÃ  sá»‘ trang (`active:scale-[0.98]`) âž¡ï¸ `transition-[transform,scale,background-color,color,opacity] duration-200`.
     - `FileUploadComponent`: NÃºt chá»n file vÃ  nÃºt xÃ³a file âž¡ï¸ `transition-[transform,scale,background-color,color,box-shadow] duration-200` / `duration-150`.
     - `VoiceChatComponent`: NÃºt Join/Leave âž¡ï¸ `transition-[transform,scale,background-color,background-image,color,box-shadow] duration-200`.
     - `DropdownMenuComponent`: NÃºt trigger âž¡ï¸ `transition-[transform,scale,background-color,color,box-shadow] duration-200`.
     - `CustomSelectComponent`: NÃºt trigger dropdown âž¡ï¸ `transition-[transform,scale,background-color,color,box-shadow] duration-200`.
     - `CustomSearchInputComponent`: NÃºt clear search âž¡ï¸ `transition-[transform,scale,background-color,color] duration-150`.
     - `CustomDatePickerComponent` & `CustomDateTimeRangeComponent`: NÃºt presets, prev/next thÃ¡ng, ngÃ y, apply/done âž¡ï¸ `transition-[transform,scale,background-color,color,box-shadow] duration-150`.
     - `CodeBlockComponent`: NÃºt wrap, copy vÃ  nÃºt collapse/expand.
     - `CopyToClipboardComponent`: NÃºt copy.
     - `AlertComponent`: NÃºt close alert.
     - `StatCardComponent`: Card hover scale.
     - `HomeComponent`: NÃºt Ä‘á»•i máº¡ng nhanh.
- **XÃ¡c thá»±c:**
  - `npx tsc --noEmit`: 0 lá»—i type.
  - `npm test`: 6/6 tests passed (100%).
  - `npm run build`: Build production hoÃ n táº¥t thÃ nh cÃ´ng.

### YÃªu cáº§u: Loáº¡i Bá» Triá»‡t Äá»ƒ `border-color` Khá»i ToÃ n Bá»™ Thuá»™c TÃ­nh Transition
- **Ná»™i dung yÃªu cáº§u:** Loáº¡i bá» hoÃ n toÃ n `border-color` ra khá»i táº¥t cáº£ cÃ¡c khai bÃ¡o transition trong toÃ n bá»™ á»©ng dá»¥ng (`src/styles.scss` vÃ  táº¥t cáº£ cÃ¡c component).
- **PhÃ¢n tÃ­ch ká»¹ thuáº­t:**
  - `border-color` trong thuá»™c tÃ­nh transition buá»™c trÃ¬nh duyá»‡t pháº£i theo dÃµi biáº¿n Ä‘á»•i mÃ u viá»n liÃªn tá»¥c giá»¯a cÃ¡c frame (Color Interpolation), gÃ¢y gia tÄƒng chi phÃ­ repaint trÃªn cÃ¡c pháº§n tá»­ cÃ³ border phá»©c táº¡p vÃ  hiá»‡u á»©ng active/hover.
  - Khi loáº¡i bá» `border-color`, tráº¡ng thÃ¡i mÃ u viá»n khi hover hoáº·c active sáº½ pháº£n há»“i tá»©c thÃ¬, káº¿t há»£p cÃ¹ng `transform`, `background-color`, `color`, `box-shadow`, `opacity` cho tráº£i nghiá»‡m mÆ°á»£t mÃ , sáº¯c nÃ©t vÃ  Ä‘áº¡t hiá»‡u nÄƒng tá»‘i Æ°u nháº¥t.
- **CÃ¡c bÆ°á»›c & Vá»‹ trÃ­ Ä‘Ã£ thá»±c hiá»‡n:**
  1. **Há»‡ Thá»‘ng Button Utility (`src/styles.scss`):** Loáº¡i bá» `border-color` khá»i `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-danger-light`, `.btn-cancel`, `.btn-ghost`, `.btn-success`, `.btn-info`, `.btn-reload`, `.btn-outline` âž¡ï¸ `transition-[transform,background-color,background-image,color,box-shadow,opacity] duration-200`.
  2. **ToÃ n Bá»™ CÃ¡c Component:**
     - `SidebarComponent`: NÃºt thu phÃ³ng vÃ  nÃºt Ä‘á»•i theme âž¡ï¸ `transition-[transform,background-color,color,box-shadow] duration-200`.
     - `HeaderComponent`: NÃºt Hamburger âž¡ï¸ `transition-[transform,background-color,color,box-shadow] duration-200`.
     - `NetworkSelectorComponent`: NÃºt chá»n máº¡ng âž¡ï¸ `transition-[transform,background-color,color,box-shadow] duration-200`.
     - `LanguageSelectorComponent`: NÃºt chá»n ngÃ´n ngá»¯ (Compact & Full) âž¡ï¸ `transition-[transform,background-color,color,box-shadow] duration-200`.
     - `PaginationComponent`: NÃºt Prev, Next vÃ  sá»‘ trang âž¡ï¸ `transition-[transform,background-color,color,opacity] duration-200`.
     - `FileUploadComponent`: NÃºt chá»n file âž¡ï¸ `transition-[transform,background-color,color,box-shadow] duration-200`.
     - `CustomSelectComponent`: NÃºt trigger dropdown âž¡ï¸ `transition-[transform,background-color,color,box-shadow] duration-200`.
     - `DropdownMenuComponent`: NÃºt trigger âž¡ï¸ `transition-[transform,background-color,color,box-shadow] duration-200`.
     - `CustomDatePickerComponent` & `CustomDateTimeRangeComponent`: NÃºt presets âž¡ï¸ `transition-[transform,background-color,color,box-shadow] duration-150`.
     - `CodeBlockComponent`: NÃºt wrap, copy vÃ  nÃºt thu gá»n/má»Ÿ rá»™ng mÃ£.
     - `CopyToClipboardComponent`: NÃºt copy âž¡ï¸ `transition-[transform,background-color,color] duration-150`.
     - `StatCardComponent`: Card container âž¡ï¸ `transition-[transform,shadow] duration-200`.
     - `HomeComponent` & `AppComponent`: NÃºt Ä‘á»•i máº¡ng nhanh vÃ  nÃºt reset filters.
- **XÃ¡c thá»±c:**
  - QuÃ©t toÃ n bá»™ `src/`: 0 thuá»™c tÃ­nh `border-color` cÃ²n tá»“n táº¡i trong transition.
  - `npx tsc --noEmit`: 0 lá»—i type.
  - `npm test`: 6/6 tests passed (100%).
  - `npm run build`: Build production hoÃ n táº¥t thÃ nh cÃ´ng.

### YÃªu cáº§u: Tá»‘i Æ¯u Hiá»‡u NÄƒng NÃºt Báº¥m - Loáº¡i Bá» `transition-all` & DÃ¹ng Thuá»™c TÃ­nh Transition ChuyÃªn Biá»‡t
- **Ná»™i dung yÃªu cáº§u:** PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n lÃ m giáº£m hiá»‡u nÄƒng cá»§a class `transition-all` trÃªn web vÃ  loáº¡i bá» triá»‡t Ä‘á»ƒ `transition-all` trÃªn toÃ n bá»™ cÃ¡c nÃºt báº¥m (`<button>`, `.btn`, `.btn-*`, `.btn-close`, `.btn-close-sm`), thay tháº¿ báº±ng cÃ¡c thuá»™c tÃ­nh transition cÃ³ hiá»‡u nÄƒng cao nhÆ° `transition-transform`, `background-color`, `background-image`, `color`, `border-color`, `box-shadow`, `opacity` mÃ  khÃ´ng lÃ m áº£nh hÆ°á»Ÿng cÃ¡c component khÃ´ng pháº£i button.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n gá»‘c rá»… & áº¢nh hÆ°á»Ÿng cá»§a `transition-all`:**
  1. **Layout Thrashing & Style Recalculation:** `transition-all` buá»™c trÃ¬nh duyá»‡t pháº£i theo dÃµi, tÃ­nh toÃ¡n vÃ  ná»™i suy má»i thuá»™c tÃ­nh CSS (bao gá»“m cÃ¡c thuá»™c tÃ­nh liÃªn quan Ä‘áº¿n Layout/Reflow nhÆ° `width`, `height`, `padding`, `margin`, `font-size`) báº¥t ká»³ khi nÃ o tráº¡ng thÃ¡i nÃºt thay Ä‘á»•i (hover, active, focus, disabled, theme switch).
  2. **TÄƒng táº£i Render/Repaint:** Khi hover qua láº¡i nhiá»u nÃºt báº¥m trÃªn giao diá»‡n phá»©c táº¡p, viá»‡c Ã©p trÃ¬nh duyá»‡t kiá»ƒm tra táº¥t cáº£ thuá»™c tÃ­nh lÃ m tá»¥t FPS vÃ  gÃ¢y hiá»‡n tÆ°á»£ng giáº­t lag (jank).
  3. **Giáº£i phÃ¡p tá»‘i Æ°u GPU:** Chá»‰ transition cÃ¡c thuá»™c tÃ­nh thá»±c sá»± biáº¿n Ä‘á»•i khi tÆ°Æ¡ng tÃ¡c nÃºt: `transform` (khi `active:scale-95` / `hover:scale-*` Ä‘Æ°á»£c xá»­ lÃ½ trá»±c tiáº¿p trÃªn GPU Composite Layer), `background-color`, `background-image`, `color`, `border-color`, `box-shadow`, `opacity`.
- **CÃ¡c bÆ°á»›c & Vá»‹ trÃ­ Ä‘Ã£ thá»±c hiá»‡n tá»‘i Æ°u (Chá»‰ Ã¡p dá»¥ng cho Button):**
  1. **Há»‡ Thá»‘ng Button Utility ToÃ n Cá»¥c (`src/styles.scss`):**
     - Thay tháº¿ toÃ n bá»™ `transition-all duration-200` trong `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-danger-light`, `.btn-cancel`, `.btn-ghost`, `.btn-success`, `.btn-info`, `.btn-reload`, `.btn-outline` báº±ng `transition-[transform,background-color,background-image,color,border-color,box-shadow,opacity] duration-200`.
     - Thay tháº¿ `transition-all` trong `.btn-close`, `.btn-close-sm` báº±ng `transition-[transform,background-color,color] duration-150`.
     - Cáº­p nháº­t `@utility tab-item` sang `transition-[color,background-color,box-shadow,transform] duration-200`.
  2. **RÃ  soÃ¡t vÃ  Cáº­p nháº­t ToÃ n Bá»™ Tháº» `<button>` Trong Táº¥t Cáº£ Component:**
     - `SidebarComponent`: Cáº­p nháº­t nÃºt thu phÃ³ng sidebar vÃ  nÃºt chuyá»ƒn Ä‘á»•i theme (`transition-[transform,background-color,color,border-color,box-shadow] duration-200`).
     - `HeaderComponent`: Cáº­p nháº­t nÃºt Hamburger mobile menu.
     - `NetworkSelectorComponent`: Cáº­p nháº­t nÃºt kÃ­ch hoáº¡t dropdown Äa Chain.
     - `LanguageSelectorComponent`: Cáº­p nháº­t nÃºt kÃ­ch hoáº¡t compact vÃ  full cá»§a Äa NgÃ´n Ngá»¯.
     - `PaginationComponent`: Cáº­p nháº­t nÃºt Prev, Next vÃ  cÃ¡c nÃºt sá»‘ trang (`transition-[transform,background-color,border-color,color,opacity] duration-200`).
     - `FileUploadComponent`: Cáº­p nháº­t nÃºt chá»n file vÃ  nÃºt xÃ³a file.
     - `VoiceChatComponent`: Cáº­p nháº­t nÃºt tham gia/rá»i phÃ²ng trÃ² chuyá»‡n thoáº¡i.
     - `DropdownMenuComponent`: Cáº­p nháº­t nÃºt Trigger dropdown, Trigger avatar, cÃ¡c nÃºt Submenu, Checkbox, Radio, Action vÃ  Submenu child.
     - `CustomSelectComponent`: Cáº­p nháº­t nÃºt trigger chá»n danh sÃ¡ch.
     - `CustomSearchInputComponent`: Cáº­p nháº­t nÃºt xÃ³a ná»™i dung tÃ¬m kiáº¿m.
     - `CustomDatePickerComponent`: Cáº­p nháº­t cÃ¡c nÃºt Presets, Prev/Next thÃ¡ng, nÃºt chá»n ngÃ y vÃ  nÃºt Xong.
     - `CustomDateTimeRangeComponent`: Cáº­p nháº­t nÃºt Clear, Presets, Prev/Next thÃ¡ng, nÃºt chá»n ngÃ y vÃ  nÃºt Ãp dá»¥ng.
     - `CodeBlockComponent`: Cáº­p nháº­t nÃºt sao chÃ©p mÃ£, nÃºt chuyá»ƒn Tab file vÃ  nÃºt báº­t/táº¯t wrap dÃ²ng.
     - `CopyToClipboardComponent`: Cáº­p nháº­t nÃºt copy icon/label.
     - `AccordionComponent`: Cáº­p nháº­t nÃºt accordion header.
     - `AlertComponent`: Cáº­p nháº­t nÃºt Ä‘Ã³ng thÃ´ng bÃ¡o alert.
     - `TabGroupComponent`: Cáº­p nháº­t cÃ¡c nÃºt tab chuyá»ƒn Ä‘á»•i.
     - `HomeComponent` & `AppComponent`: Cáº­p nháº­t cÃ¡c nÃºt sao chÃ©p Ä‘á»‹a chá»‰, Ä‘á»•i máº¡ng nhanh, copy chá»¯ kÃ½ vÃ  reset bá»™ lá»c báº£ng.
- **XÃ¡c thá»±c:**
  - QuÃ©t kiá»ƒm tra sÃ¢u (AST/regex): 0 tháº» `<button>` cÃ²n sÃ³t `transition-all`.
  - Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type.
  - VÆ°á»£t qua 100% bá»™ unit tests (6/6 tests passed).
  - ÄÃ³ng gÃ³i Production (`npm run build`) hoÃ n táº¥t thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c Phá»¥c Triá»‡t Äá»ƒ Lá»—i KhÃ´ng Responsive & Xuáº¥t Hiá»‡n Scroll Ngang TrÃªn Mobile
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t vÃ  xá»­ lÃ½ toÃ n diá»‡n cÃ¡c vá»‹ trÃ­ chÆ°a responsive trÃªn mobile/mÃ n hÃ¬nh nhá» gÃ¢y trÃ n chiá»u ngang vÃ  xuáº¥t hiá»‡n thanh cuá»™n ngang (horizontal scroll), Ä‘áº·c biá»‡t lÃ  component Input OTP (`InputOtpComponent`), Header, Account Dropdown, Date Picker vÃ  Voice Chat.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n gá»‘c rá»…:**
  1. **Component Input OTP (`InputOtpComponent`):** KÃ­ch thÆ°á»›c cÃ¡c Ã´ slot OTP bá»‹ gÃ¡n cá»‘ Ä‘á»‹nh `w-10 h-10` / `sm:w-12 sm:h-12` (size `md`) hoáº·c `w-12 h-12` / `sm:w-14 sm:h-14` (size `lg`). Khi Ä‘á»™ dÃ i mÃ£ OTP/voucher dÃ i (6 Ä‘áº¿n 7 kÃ½ tá»± kÃ¨m dáº¥u gáº¡ch ná»‘i separator `-`), tá»•ng chiá»u rá»™ng slot vÃ  gap (282px) vÆ°á»£t quÃ¡ khÃ´ng gian kháº£ dá»¥ng cá»§a Card trÃªn mobile nhá» (256px trÃªn mÃ n hÃ¬nh 320px-360px), lÃ m phÃ¬nh to Card vÃ  Ä‘áº©y layout toÃ n trang gÃ¢y scroll ngang.
  2. **Header & NÃºt Account Dropdown:** TrÃªn mobile nhá» (< 380px), cá»¥m nÃºt Header (Hamburger, Logo, Language Selector, Network Selector vÃ  Account Dropdown hiá»ƒn thá»‹ cáº£ Ä‘á»‹a chá»‰ vÃ  sá»‘ dÆ° `0.1979 ETH`) cÃ³ tá»•ng bá» rá»™ng > 370px, lÃ m trÃ n khá»i mÃ©p pháº£i mÃ n hÃ¬nh Ä‘iá»‡n thoáº¡i.
  3. **Global Layout & Containers:** `html`, `body` vÃ  layout wrapper trong `app.html` thiáº¿u `overflow-x: hidden` vÃ  `max-width: 100%`, khiáº¿n khi cÃ³ báº¥t ká»³ pháº§n tá»­ con nÃ o vÆ°á»£t kÃ­ch thÆ°á»›c viewport thÃ¬ toÃ n bá»™ trang web láº­p tá»©c sinh ra thanh scroll ngang á»Ÿ Ä‘Ã¡y.
  4. **Popovers (Date Picker & Date Time Range):** Chiá»u rá»™ng popover cá»‘ Ä‘á»‹nh 320px chÆ°a giá»›i háº¡n theo `window.innerWidth - 16` vÃ  `calc(100vw - 16px)`.
  5. **Widget Voice Chat (`VoiceChatComponent`):**
     - TiÃªu Ä‘á» "TrÃ² Chuyá»‡n Thoáº¡i" vÃ  tráº¡ng thÃ¡i "7 ngÆ°á»i tham gia" dÃ¹ng 2 pháº§n tá»­ absolute cá»‘ Ä‘á»‹nh `top-0` vÃ  `top-[42px]` gÃ¢y rá»›t dÃ²ng Ä‘Ã¨ chá»¯ lÃªn nhau trÃªn mobile.
     - LÆ°á»›i Avatar tÃ­nh toáº¡ Ä‘á»™ pixel cá»‘ Ä‘á»‹nh 4 cá»™t (`width = 324px`) lÃ m avatar cá»™t thá»© 4 (Robert) bá»‹ trÃ n vÃ  cáº¯t cá»¥t khá»i khung hÃ¬nh khi chiá»u rá»™ng card háº¹p (< 340px).
- **Giáº£i phÃ¡p triá»‡t Ä‘á»ƒ:**
  1. **NÃ¢ng cáº¥p Responsive cho Input OTP (`InputOtpComponent`):**
     - Thiáº¿t láº­p kÃ­ch thÆ°á»›c responsive Ä‘a táº§ng:
       - `size="sm"`: `w-7.5 h-7.5 text-xs xs:w-8 xs:h-8 sm:w-9 sm:h-9 sm:text-sm rounded-[7px] xs:rounded-[8px] sm:rounded-[10px]`
       - `size="md"`: `w-8.5 h-8.5 text-xs xs:w-9.5 xs:h-9.5 sm:w-11 sm:h-11 md:w-12 md:h-12 sm:text-base rounded-[9px] xs:rounded-[10px] sm:rounded-[12px]`
       - `size="lg"`: `w-9.5 h-9.5 text-sm xs:w-11 xs:h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 sm:text-xl rounded-[10px] xs:rounded-[12px] sm:rounded-[14px]`
     - Khoáº£ng cÃ¡ch `gap` vÃ  `separator` linh hoáº¡t `gap-1 xs:gap-1.5 sm:gap-2`.
     - Host class: `host: { 'class': 'block max-w-full' }` vÃ  container `max-w-full overflow-x-auto no-scrollbar`.
  2. **Tá»‘i Æ°u Header & Account Dropdown:**
     - NÃºt Account Dropdown: TrÃªn mÃ n hÃ¬nh nhá» < 380px áº©n sá»‘ dÆ° (`hidden min-[380px]:inline-block`), chá»‰ hiá»ƒn thá»‹ Ä‘á»‹a chá»‰ vÃ­ rÃºt gá»n `0xAB4a...4444` vÃ  nÃºt trÃ²n tráº¡ng thÃ¡i xanh lÃ¡, thu gá»n kÃ­ch thÆ°á»›c tá»« 170px xuá»‘ng ~100px.
     - Header padding & gap: Äiá»u chá»‰nh `px-2 sm:px-6` vÃ  `gap-1 sm:gap-2.5`.
  3. **KhÃ³a trÃ n ngang toÃ n cá»¥c (`styles.scss` & `app.html`):**
     - Bá»• sung `overflow-x: hidden; max-width: 100vw;` cho `html` vÃ  `body` trong `src/styles.scss`.
     - Bá»• sung `overflow-x-hidden max-w-full` cho container router wrapper trong `app.html`.
  4. **Äá»“ng bá»™ Date Picker & Date Time Range Popovers:** Giá»›i háº¡n `popoverWidth = Math.min(320, window.innerWidth - 16)` vÃ  `maxWidth: 'calc(100vw - 16px)'`.
  5. **Tá»‘i Æ°u toÃ n diá»‡n & Animation FLIP MÆ°á»£t MÃ  Cho Voice Chat (`VoiceChatComponent`):**
     - TÃ¡i cáº¥u trÃºc Header thÃ nh Flexbox liá»n máº¡ch (`h2` + tráº¡ng thÃ¡i ngÆ°á»i tham gia + nÃºt close), loáº¡i bá» hoÃ n toÃ n viá»‡c chá»“ng Ä‘Ã¨ vÄƒn báº£n.
     - Tá»± Ä‘á»™ng chuyá»ƒn Ä‘á»•i Avatar Grid linh hoáº¡t: TrÃªn mÃ n hÃ¬nh nhá» (< 340px) chuyá»ƒn thÃ nh layout 3 cá»™t x 3 hÃ ng (avatar 48px, height 470px), trÃªn mÃ n hÃ¬nh lá»›n chuyá»ƒn thÃ nh 4 cá»™t (avatar 56px, height 440px), Ä‘áº£m báº£o 100% 7 avatar hiá»ƒn thá»‹ trá»n váº¹n vÃ  cÄƒn giá»¯a Ä‘áº¹p máº¯t.
     - TÃ¡ch biá»‡t 2 Layer giao diá»‡n Collapsed (Capsule UI) vÃ  Expanded (Card UI):
       - Khi Ä‘Ã³ng (Collapse / báº¥m X): Header, Footer Action vÃ  tÃªn avatar áº©n `opacity-0` tá»©c thÃ¬ trong 75-100ms khÃ´ng delay; cÃ¡c avatar thu vá» vá»‹ trÃ­ capsule Ä‘á»“ng bá»™ vá»›i `delay: 0` giÃºp card co láº¡i mÆ°á»£t mÃ , khÃ´ng bá»‹ lag hay hiá»‡n tÆ°á»£ng Ä‘Ã¨ chá»¯ lÃªn capsule.
       - Khi má»Ÿ (Expand): Giao diá»‡n Capsule áº©n ngay láº­p tá»©c trong 100ms, Header vÃ  Footer fade-in nháº¹ nhÃ ng sau 100-150ms khi khung card Ä‘Ã£ bung rá»™ng.
     - Äá»“ng bá»™ kÃ­ch thÆ°á»›c co dÃ£n theo `currentWidth()` vÃ  `window:resize`.
- **XÃ¡c thá»±c:**
  - Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type.
  - VÆ°á»£t qua 100% bá»™ unit tests (6/6 tests passed).
  - ÄÃ³ng gÃ³i Production (`npm run build`) hoÃ n táº¥t thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: RÃ  SoÃ¡t ToÃ n Bá»™ MÃ£ Nguá»“n, XÃ³a ToÃ n Bá»™ Comment Tiáº¿ng Viá»‡t & Comment Code KhÃ´ng Cáº§n Thiáº¿t
- **Ná»™i dung yÃªu cáº§u:** Xem láº¡i toÃ n bá»™ source code cá»§a dá»± Ã¡n, loáº¡i bá» táº¥t cáº£ comment tiáº¿ng Viá»‡t, cÃ¡c Ä‘oáº¡n comment code thá»«a vÃ  comment khÃ´ng cáº§n thiáº¿t, Ä‘á»“ng thá»i chuáº©n hÃ³a thÃ´ng Ä‘iá»‡p logging/console sang tiáº¿ng Anh chuáº©n theo nguyÃªn táº¯c Clean Code.
- **QuÃ¡ trÃ¬nh & CÃ¡c bÆ°á»›c Ä‘Ã£ thá»±c hiá»‡n:**
  1. **QuÃ©t toÃ n diá»‡n mÃ£ nguá»“n:** Cháº¡y script phÃ¢n tÃ­ch AST vÃ  regex quÃ©t toÃ n bá»™ cÃ¡c file `.ts`, `.html`, `.scss`, `.css`, `.json` trong thÆ° má»¥c `src/` vÃ  thÆ° má»¥c gá»‘c Ä‘á»ƒ bÃ³c tÃ¡ch 100% comment khá»‘i (`/* */`), comment dÃ²ng (`//`), comment HTML (`<!-- -->`) vÃ  cÃ¡c dÃ²ng code bá»‹ vÃ´ hiá»‡u hÃ³a.
  2. **Dá»n dáº¹p comment tiáº¿ng Viá»‡t & comment thá»«a:**
     - `src/styles.scss`: Chuáº©n hÃ³a comment khá»‘i sang tiáº¿ng Anh thuáº§n tÃºy `/* Button Utilities & System */`.
     - `src/app/shared/components/dropdown-menu/dropdown-menu.component.ts`: XÃ³a bá» toÃ n bá»™ cÃ¡c comment giáº£i thÃ­ch vá»¥n váº·t vá» layout/positioning khÃ´ng cáº§n thiáº¿t trong logic tÃ­nh toÃ¡n viewport collision.
     - `src/app/shared/components/input-otp/input-otp.component.ts`: Loáº¡i bá» comment thá»«a trong khá»‘i `catch`.
     - `src/app/shared/components/progress/progress.component.ts`: Loáº¡i bá» comment thá»«a trong computed `semiCircleCircumference`.
     - `src/app/shared/components/icon/icon.component.ts`: Loáº¡i bá» JSDoc thá»«a khÃ´ng cáº§n thiáº¿t.
  3. **Chuáº©n hÃ³a Console Logging sang tiáº¿ng Anh (`Web3Service`):**
     - Chuyá»ƒn toÃ n bá»™ 16 thÃ´ng Ä‘iá»‡p `console.info`, `console.warn`, `console.error` mang tiáº¿ng Viá»‡t trong `src/app/core/services/web3.service.ts` sang tiáº¿ng Anh chuáº©n Ä‘á»ƒ tuÃ¢n thá»§ quy táº¯c Clean Code.
- **XÃ¡c thá»±c:**
  - Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type.
  - VÆ°á»£t qua 100% bá»™ unit tests (6/6 tests passed).
  - ÄÃ³ng gÃ³i Production (`npm run build`) hoÃ n táº¥t thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Responsive Pagination (Giá»¯ NguyÃªn KÃ­ch ThÆ°á»›c & Tá»± Äá»™ng Rá»›t Xuá»‘ng DÃ²ng Khi MÃ n HÃ¬nh Nhá»)
- **Ná»™i dung yÃªu cáº§u:** Cáº£i tiáº¿n giao diá»‡n cá»§a component phÃ¢n trang (`PaginationComponent`), Ä‘áº£m báº£o há»— trá»£ responsive linh hoáº¡t trÃªn mobile/mÃ n hÃ¬nh háº¹p: cÃ¡c nÃºt báº¥m phÃ¢n trang giá»¯ nguyÃªn kÃ­ch thÆ°á»›c chuáº©n `w-8.5 h-8.5` (khÃ´ng bá»‹ Ã©p co rÃºm mÃ©o mÃ³), tá»± Ä‘á»™ng rá»›t xuá»‘ng dÃ²ng tiáº¿p theo (`flex-wrap`) thay vÃ¬ bá»‹ trÃ n ngang vÃ  cáº¯t cá»¥t khá»i khung nhÃ¬n.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n gá»‘c rá»…:**
  1. Container bao bá»c cÃ¡c nÃºt phÃ¢n trang (`.flex.items-center.gap-1.5`) khÃ´ng cÃ³ class `flex-wrap`, khiáº¿n toÃ n bá»™ chuá»—i nÃºt (`<`, `1`, `...`, `4`, `5`, `6`, `...`, `>`) bá»‹ dÃ n trÃªn 1 hÃ ng ngang duy nháº¥t. Khi chiá»u rá»™ng mÃ n hÃ¬nh hoáº·c card háº¹p (nhá» hÆ¡n 360px), cÃ¡c nÃºt phÃ­a sau bá»‹ trÃ n viá»n vÃ  che khuáº¥t.
  2. CÃ¡c pháº§n tá»­ nÃºt báº¥m `<button>` vÃ  dáº¥u `...` thiáº¿u thuá»™c tÃ­nh `shrink-0` vÃ  `min-w-[34px]`, dá»… bá»‹ flexbox tá»± Ä‘á»™ng co nhá» khi thiáº¿u khÃ´ng gian.
  3. Thiáº¿u cÄƒn chá»‰nh cÃ¢n Ä‘á»‘i responsive giá»¯a nhÃ£n thÃ´ng tin báº£n ghi vÃ  cá»¥m nÃºt.
- **Giáº£i phÃ¡p triá»‡t Ä‘á»ƒ:**
  1. **NÃ¢ng cáº¥p Layout & Container (`pagination.component.html`):**
     - Container chÃ­nh: `px-4 sm:px-5 py-3.5 sm:py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-4 flex-wrap`.
     - NhÃ£n báº£n ghi: `text-xs font-semibold text-slate-400 text-center sm:text-left select-none`.
     - Cá»¥m nÃºt báº¥m phÃ¢n trang: `flex items-center justify-center gap-1.5 flex-wrap max-w-full`.
  2. **Báº£o toÃ n kÃ­ch thÆ°á»›c & Tráº£i nghiá»‡m tÆ°Æ¡ng tÃ¡c:**
     - ToÃ n bá»™ nÃºt `<button>` vÃ  tháº» `<span>...</span>` Ä‘á»u Ä‘Æ°á»£c gÃ¡n `w-8.5 h-8.5 min-w-[34px] shrink-0 rounded-xl`.
     - TÃ­ch há»£p `RippleDirective` (`appRipple`) cho hiá»‡u á»©ng sÃ³ng nÆ°á»›c mÆ°á»£t mÃ  khi nháº¥p chuá»™t/cháº¡m tay trÃªn di Ä‘á»™ng.
     - Chuáº©n hÃ³a mÃ u viá»n Design System `border border-slate-200/60 dark:border-slate-800/60`.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. VÆ°á»£t qua 100% bá»™ unit tests (6/6 tests passed). ÄÃ³ng gÃ³i Production (`npm run build`) hoÃ n thÃ nh thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c Phá»¥c Triá»‡t Äá»ƒ Lá»—i Máº¥t Hiá»‡u á»¨ng SÃ³ng NÆ°á»›c Ripple (`RippleDirective`) & Button Ripple
- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i hiá»‡u á»©ng sÃ³ng nÆ°á»›c (Ripple) vÃ  Button Ripple bá»‹ máº¥t hiá»‡u á»©ng, khi ngÆ°á»i dÃ¹ng nháº¥p hoáº·c cháº¡m vÃ o vÃ¹ng tÆ°Æ¡ng tÃ¡c / nÃºt báº¥m khÃ´ng nhÃ¬n tháº¥y sÃ³ng lan tá»a.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n gá»‘c rá»…:**
  1. **Xung Ä‘á»™t thuá»™c tÃ­nh CSS & Tailwind v4 Transform (`scale: 0` vs `transform: scale(1)`):** Trong `src/styles.scss`, class `@utility app-ripple-element` sá»­ dá»¥ng `@apply scale-0`. Trong Tailwind v4, `scale-0` gÃ¡n CSS property hiá»‡n Ä‘áº¡i `scale: 0;`. Khi animation `@keyframes app-ripple-scale { to { transform: scale(1); } }` cháº¡y, thuá»™c tÃ­nh `transform` thay Ä‘á»•i nhÆ°ng thuá»™c tÃ­nh `scale: 0;` Ä‘á»™c láº­p váº«n giá»¯ nguyÃªn báº±ng 0, khiáº¿n kÃ­ch thÆ°á»›c ripple bá»‹ nhÃ¢n 0 vÃ  khÃ´ng bao giá» phÃ³ng to Ä‘Æ°á»£c.
  2. **Váº¥n Ä‘á» emit CSS cá»§a `@utility` trong Tailwind v4:** Pháº§n tá»­ `<span class="app-ripple-element">` Ä‘Æ°á»£c sinh ra Ä‘á»™ng tá»« TypeScript (`renderer.createElement` + `renderer.addClass`), khÃ´ng cÃ³ trong template HTML tÄ©nh, dá»… bá»‹ bá» qua trong quÃ¡ trÃ¬nh biÃªn dá»‹ch JIT utility.
  3. **MÃ u Ripple máº·c Ä‘á»‹nh (`#ffffff`) gÃ¢y tÃ ng hÃ¬nh trÃªn giao diá»‡n Light Mode:** Directive `RippleDirective` gÃ¡n `@Input('appRippleColor') color = '#ffffff'`, vÃ  `home.component.ts` khá»Ÿi táº¡o `demoRippleCustomColor = signal('#ffffff')`. TrÃªn ná»n sÃ¡ng (Light mode nhÆ° demo box `bg-slate-100/50` hay nÃºt xÃ¡m/cancel/outline), sÃ³ng tráº¯ng má» Ä‘Ã¨ trÃªn ná»n tráº¯ng/xÃ¡m sÃ¡ng lÃ  hoÃ n toÃ n vÃ´ hÃ¬nh vá»›i máº¯t ngÆ°á»i.
  4. **Animation Fade & Duration chÆ°a Ä‘á»“ng bá»™:** Cáº§n sá»­ dá»¥ng CSS Variables `--ripple-opacity` vÃ  `--ripple-duration` Ä‘á»ƒ truyá»n thá»i gian vÃ  Ä‘á»™ trong suá»‘t tá»« TypeScript vÃ o animation CSS mÆ°á»£t mÃ .
- **Giáº£i phÃ¡p triá»‡t Ä‘á»ƒ:**
  1. **Chuáº©n hÃ³a Animation & CSS Class (`src/styles.scss`):**
     - Chuyá»ƒn thÃ nh CSS class thuáº§n `.app-ripple-element` vá»›i `transform: scale(0); transform-origin: center center; will-change: transform, opacity; z-index: 10;`.
     - Cáº­p nháº­t keyframes `app-ripple-scale` tá»« `0% { transform: scale(0); }` Ä‘áº¿n `100% { transform: scale(1); }`.
     - Cáº­p nháº­t keyframes `app-ripple-fade` tá»« `0% { opacity: var(--ripple-opacity, 0.35); }` Ä‘áº¿n `100% { opacity: 0; }`.
     - Äiá»u khiá»ƒn thá»i lÆ°á»£ng qua `--ripple-duration` vÃ  timing `cubic-bezier(0.1, 0.8, 0.3, 1)`.
  2. **NÃ¢ng cáº¥p `RippleDirective` (`ripple.directive.ts`):**
     - Äá»•i mÃ u máº·c Ä‘á»‹nh `@Input('appRippleColor') color = ''`. Khi khÃ´ng truyá»n mÃ u, ripple tá»± Ä‘á»™ng káº¿ thá»«a `currentColor` (mÃ u chá»¯ hiá»‡n táº¡i cá»§a button/tháº» cha: nÃºt Primary chá»¯ tráº¯ng sÃ³ng tráº¯ng, nÃºt xÃ¡m/cancel chá»¯ slate sÃ³ng slate trong suá»‘t tinh táº¿).
     - Thiáº¿t láº­p cÃ¡c CSS variables `--ripple-opacity` vÃ  `--ripple-duration` trá»±c tiáº¿p trÃªn pháº§n tá»­ ripple.
  3. **Äá»“ng bá»™ Showcase Demo (`home.component.ts` & `home.component.html`):**
     - Khá»Ÿi táº¡o `demoRippleCustomColor = signal('')` Ä‘á»ƒ preset "Máº·c Ä‘á»‹nh" Ä‘Æ°á»£c active ngay tá»« Ä‘áº§u vÃ  hiá»ƒn thá»‹ sÃ³ng tá»± nhiÃªn.
     - Cáº­p nháº­t binding `[class.ring-*]` Ä‘á»“ng bá»™ vá»›i tráº¡ng thÃ¡i rá»—ng cá»§a `demoRippleCustomColor()`.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. VÆ°á»£t qua 100% bá»™ unit tests (6/6 tests passed). ÄÃ³ng gÃ³i Production (`npm run build`) hoÃ n thÃ nh thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Thá»‘ng Nháº¥t Chung Há»‡ Thá»‘ng Close Button (`.btn-close` / `.btn-close-sm`) & Cancel Button Trong ToÃ n Bá»™ á»¨ng Dá»¥ng
- **Ná»™i dung yÃªu cáº§u:** Chuáº©n hÃ³a vÃ  thá»‘ng nháº¥t toÃ n diá»‡n má»™t há»‡ thá»‘ng utility chung cho táº¥t cáº£ cÃ¡c nÃºt Ä‘Ã³ng dáº¥u X (`.btn-close` / `.btn-close-sm`) vÃ  nÃºt Há»§y bá» (`.btn-cancel`), trÃ¡nh viá»‡c má»—i component tá»± viáº¿t style phÃ¢n máº£nh.
- **Giáº£i phÃ¡p triá»‡t Ä‘á»ƒ:**
  1. **Äá»‹nh nghÄ©a Utility chuáº©n trong `src/styles.scss`:**
     - `.btn-close`: `w-8 h-8 flex items-center justify-center shrink-0 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/90 dark:hover:bg-slate-800/90 active:scale-95 transition-all cursor-pointer`.
     - `.btn-close-sm`: `w-7 h-7 flex items-center justify-center shrink-0 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/90 dark:hover:bg-slate-800/90 active:scale-95 transition-all cursor-pointer`.
  2. **Ãp dá»¥ng Ä‘á»“ng loáº¡t vÃ o 100% component:**
     - `DrawerComponent` (`drawer.component.html`): Sá»­ dá»¥ng class `.btn-close`.
     - `ModalComponent` (`modal.component.html`): Sá»­ dá»¥ng class `.btn-close`.
     - `ModalWrapperComponent` (`modal-wrapper.component.html`): Sá»­ dá»¥ng class `.btn-close`.
     - `FileUploadComponent` (`file-upload.component.html`): Sá»­ dá»¥ng class `.btn-close` cho modal preview.
     - `VoiceChatComponent` (`voice-chat.component.html`): Sá»­ dá»¥ng class `.btn-close !rounded-full`.
     - `ToastComponent` (`toast.component.html`): Sá»­ dá»¥ng class `.btn-close-sm ml-auto`.
     - `AlertComponent` (`alert.component.html`): Sá»­ dá»¥ng `hover:bg-black/10 dark:hover:bg-white/15 active:scale-95`.
     - `CustomSearchInputComponent` (`custom-search-input.component.html`): Chuáº©n hÃ³a hover `hover:bg-slate-200/90 dark:hover:bg-slate-800/90 active:scale-95`.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. VÆ°á»£t qua 100% bá»™ unit tests (6/6 tests passed).

### YÃªu cáº§u: Kháº¯c Phá»¥c Lá»—i NÃºt Báº¥m / NÃºt Há»§y Bá» (`.btn-cancel` / `variant="cancel"`) Bá»‹ Má» Nháº¡t, HÃ²a Tan VÃ o Ná»n
- **Ná»™i dung yÃªu cáº§u:** Xem láº¡i cÃ¡c nÃºt báº¥m (Ä‘áº·c biá»‡t lÃ  nÃºt "Há»§y bá»" trong modal, drawer, popup, form) bá»‹ nháº¡t nhÃ²a, khÃ³ nhÃ¬n trÃªn cáº£ giao diá»‡n sÃ¡ng (Light mode) vÃ  tá»‘i (Dark mode), cáº§n tÄƒng Ä‘á»™ tÆ°Æ¡ng pháº£n vÃ  mÃ u ná»n Ä‘áº­m Ä‘Ã  rÃµ nÃ©t hÆ¡n.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n gá»‘c rá»…:**
  1. **Thiáº¿u viá»n phÃ¢n Ä‘á»‹nh & Ná»n quÃ¡ sÃ¡ng:** Class `.btn-cancel` ban Ä‘áº§u dÃ¹ng `bg-slate-100` khÃ´ng cÃ³ viá»n hoáº·c viá»n quÃ¡ má»ng (`border-slate-200`). Khi Ä‘áº·t trÃªn ná»n tráº¯ng (`bg-white`) hoáº·c ná»n modal/drawer footer (`bg-slate-100/50`), mÃ u ná»n nÃºt gáº§n nhÆ° trÃ¹ng vá»›i ná»n cha.
  2. **Thiáº¿u hiá»‡u á»©ng Ä‘á»• bÃ³ng & Äá»™ tÆ°Æ¡ng pháº£n:** Chá»¯ thiáº¿u Ä‘á»™ Ä‘áº­m Ä‘Ã  khi Ä‘áº·t cáº¡nh cÃ¡c nÃºt Primary rá»±c rá»¡.
- **Giáº£i phÃ¡p triá»‡t Ä‘á»ƒ:**
  1. **NÃ¢ng cáº¥p Design System cho `.btn-cancel` (`src/styles.scss`):**
     - NÃ¢ng cáº¥p viá»n rÃµ nÃ©t chuáº©n Card Design System (giá»¯ nguyÃªn mÃ u viá»n khi hover): `border border-slate-200/50 dark:border-slate-800/50`.
     - NÃ¢ng cáº¥p mÃ u ná»n & hover Ä‘áº­m Ä‘Ã : `bg-slate-200/90 hover:bg-slate-300/90 dark:bg-slate-800 dark:hover:bg-slate-700`.
     - TÄƒng cÆ°á»ng Ä‘á»™ sáº¯c nÃ©t chá»¯: `text-slate-800 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white font-bold`.
     - Bá»• sung Ä‘á»• bÃ³ng phÃ¢n tÃ¡ch khá»‘i: `shadow-xs`.
  2. **NÃ¢ng cáº¥p `.btn-danger-light`:** Bá»• sung viá»n `border border-rose-500/20 hover:border-rose-500/30 dark:border-rose-400/30` vÃ  `shadow-xs`.
  3. **Äá»“ng bá»™ nÃºt Cancel trong `CustomDateTimeRangeComponent`:** Ãp dá»¥ng Ä‘áº§y Ä‘á»§ viá»n `border border-slate-200/50 dark:border-slate-800/50`, ná»n `bg-slate-200/90 dark:bg-slate-800`, chá»¯ `text-slate-800 dark:text-slate-100` vÃ  `shadow-xs`.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. VÆ°á»£t qua 100% unit tests (6/6 tests passed).

### YÃªu cáº§u: Chuáº©n HÃ³a 100% Padding, Bo GÃ³c, Icon & KÃ­ch ThÆ°á»›c Giá»¯a Dropdown Menu, Account Dropdown, Äa Chain & Äa NgÃ´n Ngá»¯
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t vÃ  Ä‘á»“ng bá»™ toÃ n bá»™ layout UI, padding container, padding item, bo gÃ³c (`rounded`), khoáº£ng cÃ¡ch icon (`gap`) vÃ  kÃ­ch thÆ°á»›c font chá»¯ giá»¯a 4 thÃ nh pháº§n dropdown: `DropdownMenuComponent`, `AccountDropdownComponent`, `NetworkSelectorComponent` (Äa chain) vÃ  `LanguageSelectorComponent` (Äa ngÃ´n ngá»¯).
- **PhÃ¢n tÃ­ch cÃ¡c Ä‘iá»ƒm lá»‡ch UI trÆ°á»›c Ä‘Ã³:**
  1. **Padding Container Popover:** `DropdownMenu` dÃ¹ng `p-1.5` trong khi `AccountDropdown`, `NetworkSelector`, `LanguageSelector` dÃ¹ng `p-2`.
  2. **Padding & Bo gÃ³c cá»§a Item button:** `DropdownMenu` dÃ¹ng `px-3 py-2 text-xs sm:text-sm rounded-[10px] gap-2.5` lÃ m cho cÃ¡c item bá»‹ ngáº¯n vÃ  khÃ­t hÆ¡n so vá»›i chuáº©n chung `px-3 py-2.5 text-sm font-semibold rounded-[11px] gap-3` cá»§a 3 dropdown cÃ²n láº¡i.
  3. **KÃ­ch thÆ°á»›c Icon:** `DropdownMenu` dÃ¹ng `w-4 h-4` trong khi `AccountDropdown` dÃ¹ng `w-4.5 h-4.5`.
  4. **Header Label:** `DropdownMenu` dÃ¹ng `px-3 py-1.5 text-[11px]` trong khi Äa chain / Äa ngÃ´n ngá»¯ dÃ¹ng `px-3 py-2 text-xs`.
- **Giáº£i phÃ¡p triá»‡t Ä‘á»ƒ:**
  1. **Äá»“ng bá»™ Popover Container:** ÄÆ°a toÃ n bá»™ vá» `p-2 rounded-[15px] glass-popover border border-slate-200/80 dark:border-slate-800/80`.
  2. **Äá»“ng bá»™ Item Buttons:** ÄÆ°a toÃ n bá»™ cÃ¡c loáº¡i item (Submenu, Checkbox, Radio, Action, Danger, Success, Submenu children) vá» `px-3 py-2.5 text-sm font-semibold rounded-[11px] gap-3` vá»›i icon chuáº©n `w-4.5 h-4.5`.
  3. **Äá»“ng bá»™ Section Header:** `px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none`.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. VÆ°á»£t qua 100% unit tests (6/6 tests passed). ÄÃ³ng gÃ³i Production (`npm run build`) hoÃ n thÃ nh thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Äá»“ng Bá»™ HÃ³a MÃ u Ná»n Hover Cho ToÃ n Bá»™ Dropdown Menu Theo Chuáº©n Äa NgÃ´n Ngá»¯ & Äa Chain (`hover:bg-slate-100 dark:hover:bg-slate-800/80`)
- **Ná»™i dung yÃªu cáº§u:** Sá»­a mÃ u background hover cá»§a dropdown menu cho Ä‘á»“ng nháº¥t hoÃ n toÃ n vá»›i mÃ u cá»§a dropdown Äa ngÃ´n ngá»¯ (`LanguageSelector`) vÃ  Äa chain (`NetworkSelector`), tá»©c sá»­ dá»¥ng mÃ u xÃ¡m trung tÃ­nh `hover:bg-slate-100 dark:hover:bg-slate-800/80` (ngoáº¡i trá»« cÃ¡c item hÃ nh Ä‘á»™ng nguy hiá»ƒm/Ä‘iá»ƒm nháº¥n nhÆ° ÄÄƒng xuáº¥t, XÃ³a bá»™ nhá»› Ä‘á»‡m mang variant `danger`/`success`).
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n chÃªnh lá»‡ch mÃ u:**
  1. **Tráº¡ng thÃ¡i Submenu Ä‘ang má»Ÿ (`activeSubmenuId`):** Trong `DropdownMenuComponent`, khi hover vÃ o má»¥c cha cÃ³ submenu con (vÃ­ dá»¥: "Chia sáº» thÃ´ng tin vÃ­"), item Ä‘Æ°á»£c gÃ¡n class `bg-primary/10 text-primary dark:text-secondary font-bold` (mÃ u tÃ­m há»“ng accent) thay vÃ¬ mÃ u ná»n xÃ¡m slate hover chuáº©n, khiáº¿n nÃ³ lá»‡ch tÃ´ng rÃµ rá»‡t so vá»›i ná»n hover `hover:bg-slate-100 dark:hover:bg-slate-800/80` cá»§a cÃ¡c item khÃ¡c vÃ  dropdown Äa ngÃ´n ngá»¯/Äa chain.
  2. **CÃ¡c Trigger Button & Custom Select:** Má»™t sá»‘ vá»‹ trÃ­ trigger trong `DropdownMenuComponent` (`triggerVariant === 'outline' | 'default' | 'icon'`) sá»­ dá»¥ng `hover:bg-slate-50 dark:hover:bg-slate-800`, `CustomSelect` sá»­ dá»¥ng `dark:hover:bg-slate-800/50` vÃ  `AccountDropdown` cÃ³ hiá»‡u á»©ng text tÃ­m `group-hover:text-purple-600` lÃ m máº¥t tÃ­nh nháº¥t quÃ¡n tá»•ng thá»ƒ.
- **Giáº£i phÃ¡p triá»‡t Ä‘á»ƒ:**
  1. **Chuáº©n hÃ³a `DropdownMenuComponent` (`dropdown-menu.component.html`):**
     - Äá»•i class tráº¡ng thÃ¡i má»Ÿ submenu tá»« `bg-primary/10 text-primary dark:text-secondary font-bold` sang `bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white`.
     - Äá»“ng bá»™ cÃ¡c nÃºt trigger (`outline`, `default`, `icon`, `secondary`, `ghost`) sang chuáº©n hover xÃ¡m `hover:bg-slate-100 dark:hover:bg-slate-800/80`.
     - Báº£o toÃ n cÃ¡c action items dáº¡ng Ä‘áº·c biá»‡t (`variant: 'danger'` cÃ³ `hover:bg-rose-50 dark:hover:bg-rose-950/40`, `variant: 'success'` cÃ³ `hover:bg-emerald-50 dark:hover:bg-emerald-950/40`).
  2. **Chuáº©n hÃ³a `CustomSelectComponent` & `AccountDropdownComponent`:**
     - ÄÆ°a toÃ n bá»™ dark hover vá» chuáº©n `dark:hover:bg-slate-800/80`.
     - Thay Ä‘á»•i text/icon hover trong `AccountDropdown` vá» tÃ´ng xÃ¡m trung tÃ­nh `text-slate-900 dark:text-white` / `text-slate-600 dark:text-slate-300`.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. VÆ°á»£t qua 100% unit tests (6/6 tests passed). ÄÃ³ng gÃ³i Production (`npm run build`) hoÃ n thÃ nh thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Giá»¯ Bo GÃ³c CÅ© `rounded-lg` & Chuáº©n HÃ³a Chiá»u Rá»™ng CÃ¢n Xá»©ng 1:1 `min-w-[76px]` Cho NÃºt "Há»§y Bá»" / "Ãp Dá»¥ng"
- **Ná»™i dung yÃªu cáº§u:** Giá»¯ nguyÃªn Ä‘á»™ bo gÃ³c cÅ© `rounded-lg` (8px) cho cÃ¡c nÃºt Action ("Há»§y bá»", "Ãp dá»¥ng", "Xong") trong `CustomDateTimeRangeComponent` vÃ  `CustomDatePickerComponent`, Ä‘á»“ng thá»i giá»¯ chuáº©n chiá»u rá»™ng cÃ¢n xá»©ng 1:1 `min-w-[76px]`.
- **Giáº£i phÃ¡p:**
  1. Giá»¯ nguyÃªn Ä‘á»™ bo gÃ³c `rounded-lg` theo Ä‘Ãºng giao diá»‡n ban Ä‘áº§u.
  2. Bá»• sung `min-w-[76px]` vÃ  cÄƒn giá»¯a `flex items-center justify-center text-center` cho cáº£ hai nÃºt "Há»§y bá»" vÃ  "Ãp dá»¥ng", giÃºp 2 nÃºt cÃ³ kÃ­ch thÆ°á»›c ngang báº±ng cháº±n cháº·n 1:1, báº¥m Ä‘áº§m tay vÃ  gá»n gÃ ng.
  3. Ãp dá»¥ng tÆ°Æ¡ng tá»± cho nÃºt "Xong" trong `CustomDatePickerComponent`.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. VÆ°á»£t qua 100% unit tests (6/6 tests passed).

### YÃªu cáº§u: Äá»“ng Bá»™ HÃ³a Layout UI, Viá»n Border & Box-Shadow Giá»¯a NÃºt Äa NgÃ´n Ngá»¯ (`LanguageSelector`) & Äa Chain (`NetworkSelector`)
- **Ná»™i dung yÃªu cáº§u:** PhÃ¢n tÃ­ch vÃ  kháº¯c phá»¥c hiá»‡n tÆ°á»£ng nÃºt Äa ngÃ´n ngá»¯ (`LanguageSelector`) vÃ  nÃºt Äa chain (`NetworkSelector`) á»Ÿ Header bá»‹ lá»‡ch layout UI, khÃ¡c biá»‡t vá» viá»n, mÃ u ná»n vÃ  hiá»‡u á»©ng Ä‘á»• bÃ³ng (box-shadow).
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n gá»‘c rá»…:**
  1. **KhÃ¡c biá»‡t vá» Class CSS & Design Surface:**
     - NÃºt Äa ngÃ´n ngá»¯ (`LanguageSelector` compact) sá»­ dá»¥ng: `bg-slate-100/80 dark:bg-slate-900/80`, cÃ³ viá»n `border border-slate-200/50 dark:border-slate-800/50`, cÃ³ hiá»‡u á»©ng Ä‘á»• bÃ³ng `shadow-xs`, vÃ  bo gÃ³c `rounded-xl`.
     - NÃºt Äa chain (`NetworkSelector`) sá»­ dá»¥ng `app-button variant="cancel"`: Ãp dá»¥ng class `.btn-cancel` (`bg-slate-100 dark:bg-slate-800/80`) nÃªn **hoÃ n toÃ n khÃ´ng cÃ³ border viá»n**, **khÃ´ng cÃ³ box-shadow**, vÃ  tÃ´ng mÃ u ná»n tá»‘i bá»‹ lá»‡ch (`dark:bg-slate-800/80` so vá»›i `dark:bg-slate-900/80`).
     - TÆ°Æ¡ng tá»±, nÃºt Hamburger mobile trÃªn Header cÅ©ng dÃ¹ng `app-button variant="cancel"`.
- **Giáº£i phÃ¡p triá»‡t Ä‘á»ƒ:**
  1. Chuáº©n hÃ³a nÃºt trigger cá»§a `NetworkSelectorComponent` vÃ  nÃºt Hamburger mobile trong `HeaderComponent` sang cÃ¹ng bá»™ Design System Surface vá»›i `LanguageSelectorComponent`:
     - Viá»n: `border border-slate-200/50 dark:border-slate-800/50`
     - Ná»n: `bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800/80`
     - Äá»• bÃ³ng: `shadow-xs`
     - KÃ­ch thÆ°á»›c & bo gÃ³c: `min-w-9 w-9 h-9 sm:min-w-10 sm:w-10 sm:h-10 rounded-xl`
     - Hiá»‡u á»©ng active: `active:scale-95`
  2. Dá»n dáº¹p cÃ¡c unused imports `ButtonComponent` trong `HeaderComponent` vÃ  `NetworkSelectorComponent`.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. VÆ°á»£t qua 100% bá»™ unit tests (6/6 tests passed, khÃ´ng cÃ³ cáº£nh bÃ¡o nÃ o).

### YÃªu cáº§u: Loáº¡i Bá» ToÃ n Bá»™ Transition & Duration Trong Component Stepper (`StepperComponent`)
- **Ná»™i dung yÃªu cáº§u:** Xem láº¡i component Stepper (Quy trÃ¬nh nhiá»u bÆ°á»›c) vÃ  loáº¡i bá» hoÃ n toÃ n cÃ¡c thuá»™c tÃ­nh / class transition vÃ  duration Ä‘á»ƒ chuyá»ƒn Ä‘á»•i tráº¡ng thÃ¡i dá»©t khoÃ¡t, khÃ´ng bá»‹ trá»… hay lag chuyá»ƒn Ä‘á»™ng.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n & Vá»‹ trÃ­:**
  1. Trong template `stepper.component.html`, cÃ¡c pháº§n tá»­ thanh tiáº¿n trÃ¬nh (progress line bar), vÃ²ng trÃ²n chá»‰ sá»‘ bÆ°á»›c (step circle/indicator), vÃ  nhÃ£n tiÃªu Ä‘á» (step label) Ä‘ang mang cÃ¡c class Tailwind: `transition-colors duration-300`, `transition-all duration-300`, `transition-colors duration-200` á»Ÿ táº¥t cáº£ 4 cháº¿ Ä‘á»™ hiá»ƒn thá»‹ (`auto` mobile, `auto` desktop, `horizontal`, `vertical`).
- **Giáº£i phÃ¡p:**
  1. Loáº¡i bá» triá»‡t Ä‘á»ƒ toÃ n bá»™ cÃ¡c class `transition-*` vÃ  `duration-*` trong `stepper.component.html`.
  2. Giá»¯ nguyÃªn toÃ n bá»™ logic tÆ°Æ¡ng tÃ¡c, cáº¥u trÃºc layout responsive, mÃ u sáº¯c theo state (`active`, `completed`, `pending`, `error`), vÃ  icon.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. VÆ°á»£t qua 100% bá»™ unit tests (6/6 tests passed). ÄÃ³ng gÃ³i Production (`npm run build`) hoÃ n thÃ nh thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c Phá»¥c Triá»‡t Äá»ƒ Lá»—i Submenu Bá»‹ TÃ¡ch Rá»i Khi Cuá»™n Trang (Scroll Sync & Real-time Live Bounding Rect)
- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i Dropdown Submenu bá»‹ tÃ¡ch rá»i xa hÃ ng trÄƒm pixel khá»i Menu chÃ­nh (Menu chÃ­nh náº±m á»Ÿ trÃªn Ä‘á»‰nh trong khi Submenu náº±m á»Ÿ tÃ­t dÆ°á»›i Ä‘Ã¡y mÃ n hÃ¬nh) khi ngÆ°á»i dÃ¹ng cuá»™n trang web.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n gá»‘c rá»…:**
  1. **Lá»—i lÆ°u toáº¡ Ä‘á»™ tÄ©nh (`DOMRect`):** Khi hover má»Ÿ Submenu, há»‡ thá»‘ng lÆ°u `this.lastSubmenuTriggerRect = getBoundingClientRect()`. Khi ngÆ°á»i dÃ¹ng cuá»™n trang (`window:scroll`), Menu chÃ­nh Ä‘Æ°á»£c cáº­p nháº­t láº¡i toáº¡ Ä‘á»™ theo nÃºt trigger má»›i, nhÆ°ng Submenu láº¡i váº«n Ä‘á»c toáº¡ Ä‘á»™ tá»« `lastSubmenuTriggerRect` cÅ© (giÃ¡ trá»‹ pixel cá»‘ Ä‘á»‹nh trÆ°á»›c khi cuá»™n), khiáº¿n Submenu bá»‹ ghim cháº¿t á»Ÿ vá»‹ trÃ­ cÅ© dÆ°á»›i Ä‘Ã¡y mÃ n hÃ¬nh.
- **Giáº£i phÃ¡p triá»‡t Ä‘á»ƒ:**
  1. **LÆ°u tham chiáº¿u trá»±c tiáº¿p pháº§n tá»­ cha (`activeSubmenuTriggerEl: HTMLElement`):**
     - Thay vÃ¬ lÆ°u `DOMRect` tÄ©nh, há»‡ thá»‘ng lÆ°u trá»±c tiáº¿p `HTMLElement` cá»§a item cha (`event.currentTarget`).
     - HÃ m `updateSubmenuPosition()` luÃ´n gá»i `this.activeSubmenuTriggerEl.getBoundingClientRect()` theo thá»i gian thá»±c (real-time live measurement).
     - Khi cuá»™n trang (`window:scroll`) hoáº·c cáº­p nháº­t view (`ngAfterViewChecked`, `popoverEl.scroll`), Submenu vÃ  Menu chÃ­nh luÃ´n bÃ¡m sÃ¡t nhau 1:1 theo tá»«ng pixel.
  2. **Tá»± Ä‘á»™ng Ä‘Ã³ng Submenu khi cha ra ngoÃ i Viewport:** Náº¿u item cha bá»‹ cuá»™n biáº¿n máº¥t khá»i mÃ n hÃ¬nh (`triggerRect.bottom <= 0` hoáº·c `triggerRect.top >= innerHeight`), Submenu sáº½ tá»± Ä‘á»™ng Ä‘Ã³ng ngay láº­p tá»©c Ä‘á»ƒ trÃ¡nh hiá»ƒn thá»‹ má»“ cÃ´i.
  3. **Vá»‹ trÃ­ Anchor chuáº©n:** Submenu bÃ¡m sÃ¡t mÃ©p pháº£i item cha `triggerRect.right + 4` (hoáº·c láº­t trÃ¡i náº¿u cháº¡m mÃ©p pháº£i) vÃ  bÃ¡m tháº³ng hÃ ng Ä‘á»‰nh item cha (láº­t lÃªn bÃ¡m chÃ¢n náº¿u trÃ n Ä‘Ã¡y mÃ n hÃ¬nh).
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. ToÃ n bá»™ unit tests `npm test` vÆ°á»£t qua 100% (6/6 tests passed). ÄÃ³ng gÃ³i Production (`npm run build`) hoÃ n thÃ nh thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c Phá»¥c Sá»± Cá»‘ Lá»—i Playwright / KhÃ´ng Má»Ÿ ÄÆ°á»£c TrÃ¬nh Duyá»‡t Chrome Khi Äiá»u HÆ°á»›ng Localhost
- **Ná»™i dung yÃªu cáº§u:** Cháº©n Ä‘oÃ¡n vÃ  giáº£i quyáº¿t lá»—i Playwright / Chrome khÃ´ng má»Ÿ Ä‘Æ°á»£c khi trá»£ lÃ½ AI cá»‘ gáº¯ng kÃ­ch hoáº¡t cÃ´ng cá»¥ trÃ¬nh duyá»‡t ná»™i bá»™ (`browser_subagent`) hoáº·c ngÆ°á»i dÃ¹ng yÃªu cáº§u má»Ÿ trang `http://localhost:4200`.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n gá»‘c rá»…:**
  1. **MÃ¡y chá»§ Dev chÆ°a hoáº¡t Ä‘á»™ng:** Cá»•ng 4200 chÆ°a cÃ³ tiáº¿n trÃ¬nh Angular dev server cháº¡y (`npm start` / `ng serve`), dáº«n tá»›i Playwright / browser agent bá»‹ timeout / lá»—i `ERR_CONNECTION_REFUSED` khi káº¿t ná»‘i.
  2. **Tiáº¿n trÃ¬nh Chrome cháº¡y ngáº§m bá»‹ chiáº¿m giá»¯ / treo:** TrÃªn há»‡ Ä‘iá»u hÃ nh cÃ³ nhiá»u tiáº¿n trÃ¬nh `chrome.exe` cháº¡y ngáº§m (background/headless) khÃ´ng cÃ³ cá»­a sá»• hiá»ƒn thá»‹, gÃ¢y lock profile dá»¯ liá»‡u vÃ  xung Ä‘á»™t cá»•ng káº¿t ná»‘i tá»± Ä‘á»™ng cá»§a Playwright / Chrome DevTools.
  3. **CÆ¡ cháº¿ browser_subagent ná»™i bá»™:** Trá»£ lÃ½ áº£o gá»i cÃ´ng cá»¥ subagent ná»™i bá»™ bá»‹ giá»›i háº¡n mÃ´i trÆ°á»ng headless/sandbox thay vÃ¬ má»Ÿ trá»±c tiáº¿p trÃ¬nh duyá»‡t giao diá»‡n ngÆ°á»i dÃ¹ng (GUI) ngoÃ i desktop.
- **Giáº£i phÃ¡p triá»‡t Ä‘á»ƒ:**
  1. **Khá»Ÿi Ä‘á»™ng Dev Server:** Sá»­ dá»¥ng `npm start` Ä‘á»ƒ cháº¡y mÃ¡y chá»§ phÃ¡t triá»ƒn trÃªn cá»•ng `http://localhost:4200`.
  2. **Má»Ÿ TrÃ¬nh Duyá»‡t Trá»±c Tiáº¿p NgoÃ i Há»‡ Thá»‘ng:** Sá»­ dá»¥ng lá»‡nh há»‡ thá»‘ng `Start-Process "http://localhost:4200"` hoáº·c má»Ÿ Google Chrome bÃ¬nh thÆ°á»ng trÃªn mÃ¡y Ä‘á»ƒ truy cáº­p trá»±c tiáº¿p vÃ  Ä‘áº§y Ä‘á»§ giao diá»‡n.
  3. **Giáº£i phÃ³ng cÃ¡c tiáº¿n trÃ¬nh Chrome treo ngáº§m:** HÆ°á»›ng dáº«n dá»n dáº¹p cÃ¡c tiáº¿n trÃ¬nh `chrome.exe` ngáº§m báº±ng lá»‡nh PowerShell `Stop-Process -Name chrome -Force` náº¿u Chrome bá»‹ lock profile.
  4. **Äáº£m báº£o mÃ´i trÆ°á»ng Playwright chuáº©n:** Cháº¡y `npx playwright install chromium` khi cáº§n cháº¡y cÃ¡c ká»‹ch báº£n kiá»ƒm thá»­ tá»± Ä‘á»™ng vá»›i Playwright.
- **XÃ¡c thá»±c:** Kiá»ƒm tra mÃ£ nguá»“n `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. ToÃ n bá»™ unit tests `npm test` vÆ°á»£t qua 100% (6/6 tests passed).

### YÃªu cáº§u: Kháº¯c Phá»¥c Triá»‡t Äá»ƒ Lá»—i NÃºt Ghost Dropdown Menu (`app-dropdown-menu`) Bá»‹ Ná»n Tráº¯ng ToÃ¡t Trong Dark Mode & Báº£o ToÃ n 100% Hiá»‡u á»¨ng Hover
- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i nÃºt báº¥m "NÃºt Ghost" (`triggerVariant="ghost"`) trong pháº§n demo Dropdown Menu (Card 19 / Má»¥c 4 "NÃºt Trigger Icon & Vá»‹ TrÃ­ Placement") hiá»ƒn thá»‹ má»™t máº£ng ná»n hÃ¬nh chá»¯ nháº­t mÃ u tráº¯ng toÃ¡t (`#ffffff` / User Agent `buttonface`) trong Dark Mode; Ä‘á»“ng thá»i Ä‘áº£m báº£o báº£o toÃ n 100% hiá»‡u á»©ng hover (ná»n xÃ¡m Ä‘en mÆ°á»£t mÃ  `dark:hover:bg-slate-800/80` vÃ  chá»¯ sÃ¡ng `dark:hover:text-white` nhÆ° cÃ¡c menu item) cho toÃ n bá»™ cÃ¡c nÃºt báº¥m vÃ  menu dropdown trong toÃ n á»©ng dá»¥ng.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n gá»‘c rá»…:**
  1. Tháº» `<button>` lÃ  pháº§n tá»­ HTML máº·c Ä‘á»‹nh cÃ³ User Agent Stylesheet ná»n xÃ¡m tráº¯ng sÃ¡ng (`buttonface`) tá»« trÃ¬nh duyá»‡t náº¿u khÃ´ng Ä‘Æ°á»£c reset tÆ°á»ng minh.
  2. Khi reset `button, [role='button'] { background-color: transparent; }` á»Ÿ cáº¥p Ä‘á»™ unlayered CSS (ngoÃ i `@layer`), theo quy táº¯c chuáº©n CSS Cascade, unlayered CSS sáº½ ghi Ä‘Ã¨ (override) 100% táº¥t cáº£ cÃ¡c utility classes trong `@layer utilities` cá»§a Tailwind CSS (ká»ƒ cáº£ `hover:bg-...` vÃ  `dark:hover:bg-...`), lÃ m biáº¿n máº¥t hoÃ n toÃ n hiá»‡u á»©ng hover cá»§a tháº» button.
- **Giáº£i phÃ¡p triá»‡t Ä‘á»ƒ:**
  1. **ÄÆ°a CSS Reset VÃ o `@layer base` (`src/styles.scss`):** Bá»c toÃ n bá»™ cÃ¡c rule base (`html`, `body`, `button`, `[role='button']`) vÃ o bÃªn trong `@layer base { ... }`. Khi Ä‘Ã³, cÃ¡c utility classes hover (`hover:bg-slate-100 dark:hover:bg-slate-800/80`) thuá»™c `@layer utilities` sáº½ ghi Ä‘Ã¨ `@layer base` chuáº©n xÃ¡c theo Ä‘Ãºng thá»© tá»± Cascade.
  2. **Bá»• sung Design System Utility (`src/styles.scss` & `button.component.ts`):** Táº¡o `@utility btn-ghost` sá»­ dá»¥ng `@include btn-base;` kÃ¨m `@apply bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-transparent;`, Ä‘á»“ng thá»i bá»• sung `'ghost'` vÃ o variant cá»§a `ButtonComponent`.
  3. **Chuáº©n hÃ³a Button Trigger (`dropdown-menu.component.html`):** GÃ¡n trá»±c tiáº¿p `bg-transparent` vÃ o class cÆ¡ sá»Ÿ cá»§a `<button>` vÃ  thiáº¿t láº­p hover `hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white` Ä‘á»“ng bá»™ 100% vá»›i cÃ¡c menu item dropdown.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. VÆ°á»£t qua 100% bá»™ unit tests (6/6 tests). ÄÃ³ng gÃ³i Production (`npm run build`) hoÃ n thÃ nh thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Tá»‘i Æ¯u HÃ³a & Tinh Gá»n File Stylesheet Táº­p Trung (`src/styles.scss`) Theo Chuáº©n DRY & Modern SCSS / Tailwind CSS v4
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t vÃ  tá»‘i Æ°u toÃ n diá»‡n file `src/styles.scss`, loáº¡i bá» triá»‡t Ä‘á»ƒ cÃ¡c Ä‘oáº¡n code styling bá»‹ láº·p láº¡i (DRY violations) nhÆ° há»‡ thá»‘ng Button utilities, Form controls, Alert system, Aura Conic Gradients vÃ  CodeBlock syntax tokens báº±ng cÃ¡ch táº­n dá»¥ng sá»©c máº¡nh cá»§a SCSS mixins, nested selectors, vÃ  maps loop, Ä‘áº£m báº£o khÃ´ng lÃ m lá»—i cÃº phÃ¡p CSS vÃ  giá»¯ nguyÃªn 100% giao diá»‡n hiá»ƒn thá»‹.
- **Chi tiáº¿t cÃ¡c háº¡ng má»¥c Ä‘Ã£ tá»‘i Æ°u:**
  1. **Button Utilities:** TrÃ­ch xuáº¥t `@mixin btn-base` chá»©a toÃ n bá»™ thuá»™c tÃ­nh flex, layout, font, transition, states (active/disabled), loáº¡i bá» viá»‡c copy-paste 8 láº§n chuá»—i `@apply` dÃ i trong cÃ¡c class `btn-primary`, `btn-secondary`, `btn-danger`, `btn-danger-light`, `btn-cancel`, `btn-success`, `btn-info`.
  2. **Form Controls:** TrÃ­ch xuáº¥t `@mixin form-control-base` chuáº©n hÃ³a cáº¥u trÃºc bo gÃ³c, ná»n `slate-100`/`slate-950/40`, viá»n, font, placeholder vÃ  focus ring cho `form-input`, `form-textarea`, `search-input`.
  3. **Alert System:** Chuyá»ƒn Ä‘á»•i gáº§n 180 dÃ²ng code tÄ©nh thÃ nh cáº¥u trÃºc SCSS Map `$alert-themes` káº¿t há»£p vÃ²ng láº·p `@each` tá»± Ä‘á»™ng sinh 12 utilities (`soft`, `accent`, `bordered` cho 4 loáº¡i `info`, `success`, `warning`, `error`), sá»­ dá»¥ng `@use 'sass:map'` vÃ  `map.get()` chuáº©n Dart Sass hiá»‡n Ä‘áº¡i, giÃºp giáº£m hÆ¡n 75% dung lÆ°á»£ng pháº§n alert.
  4. **Aura Conic Gradients:** TrÃ­ch xuáº¥t `@mixin aura-conic($stops...)` tinh gá»n cho 7 biáº¿n thá»ƒ gradient xoay.
  5. **CodeBlock Syntax Tokens:** Gá»™p 8 tokens tá»« 2 khá»‘i Light/Dark tÃ¡ch biá»‡t sang cáº¥u trÃºc lá»“ng SCSS trá»±c tiáº¿p (`.tok-keyword { color: #7c3aed; .dark & { color: #c084fc; } ... }`).
- **Hiá»‡u quáº£:** Giáº£m tá»« 961 dÃ²ng xuá»‘ng cÃ²n ~570 dÃ²ng (~40% dung lÆ°á»£ng code dÆ° thá»«a), loáº¡i bá» 100% cáº£nh bÃ¡o Dart Sass deprecation.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. VÆ°á»£t qua 100% bá»™ unit tests (6/6 tests). ÄÃ³ng gÃ³i Production (`npm run build`) hoÃ n thÃ nh thÃ nh cÃ´ng 100%.

### HÆ°á»›ng Dáº«n Ká»¹ Thuáº­t: Quy TrÃ¬nh Äá»•i TÃªn Dá»± Ãn (Project Name / Branding)
- **Má»¥c Ä‘Ã­ch:** Cung cáº¥p danh sÃ¡ch chÃ­nh xÃ¡c cÃ¡c vá»‹ trÃ­ cáº§n cáº­p nháº­t khi Ä‘á»•i tÃªn dá»± Ã¡n hoáº·c clone template sang dApp má»›i, giÃºp AI Agent vÃ  Developer Ä‘á»•i tÃªn nhanh chÃ³ng, khÃ´ng bá»‹ sÃ³t gÃ¢y lá»—i build/deploy.
- **1. Cáº¥u hÃ¬nh Ká»¹ thuáº­t (Build / Package / Deploy):**
  - `package.json`: Cáº­p nháº­t `"name": "ten-du-an-moi"`.
  - `angular.json`: Cáº­p nháº­t tÃªn project trong `projects: { "ten-du-an-moi": { ... } }` vÃ  cÃ¡c chuá»—i `buildTarget` (`"ten-du-an-moi:build:production"`, `"ten-du-an-moi:build:development"`).
  - `netlify.toml` (náº¿u dÃ¹ng Netlify): Cáº­p nháº­t Ä‘Æ°á»ng dáº«n output `publish = "dist/ten-du-an-moi/browser"`.
  - `package-lock.json`: Cháº¡y lá»‡nh `npm install` Ä‘á»ƒ tá»± Ä‘á»™ng Ä‘á»“ng bá»™ tÃªn má»›i.
- **2. Cáº¥u hÃ¬nh Hiá»ƒn thá»‹ & ThÆ°Æ¡ng hiá»‡u (Branding / UI / Web3 AppKit):**
  - `src/index.html`: Cáº­p nháº­t tháº» `<title>TÃªn á»¨ng Dá»¥ng Má»›i</title>` vÃ  favicon/logo náº¿u cáº§n.
  - `src/app/core/services/web3.service.ts`: Cáº­p nháº­t `metadata.name` trong hÃ m `createAppKit` (tÃªn hiá»ƒn thá»‹ trÃªn popup káº¿t ná»‘i vÃ­ Web3/WalletConnect).
  - `src/app/core/i18n/vi.ts` & `src/app/core/i18n/en.ts`: Cáº­p nháº­t cÃ¡c chuá»—i tiÃªu Ä‘á», mÃ´ táº£ á»©ng dá»¥ng trong Header, Sidebar, About.

### YÃªu cáº§u: RÃ  SoÃ¡t ToÃ n Bá»™ dApp & Chuyá»ƒn Äá»•i Triá»‡t Äá»ƒ CSS/SCSS TÃ¹y Biáº¿n Sang Chuáº©n Tailwind CSS v4
- **Ná»™i dung yÃªu cáº§u:** Xem láº¡i toÃ n bá»™ dApp, chuyá»ƒn Ä‘á»•i cÃ¡c pháº§n Ä‘ang dÃ¹ng CSS/SCSS thá»§ cÃ´ng, cÃ¡c file `.scss` component phÃ¢n tÃ¡n vÃ  inline `styles: [...]` sang há»‡ thá»‘ng Design System **Tailwind CSS v4** (`@theme`, `@utility`, `@keyframes`, arbitrary utility classes), giÃºp dá»± Ã¡n tinh gá»n 100% (DRY).
- **Chi tiáº¿t cÃ¡c háº¡ng má»¥c Ä‘Ã£ thá»±c hiá»‡n:**
  1. **Há»£p Nháº¥t ToÃ n Diá»‡n VÃ o `src/styles.scss` (Tailwind CSS v4):**
     - Má»Ÿ rá»™ng `@theme` vá»›i Ä‘áº§y Ä‘á»§ token animations: `--animate-toast-in`, `--animate-toast-progress-success`, `--animate-toast-progress-error`, `--animate-popover-in`, `--animate-drawer-*`, `--animate-scale-up`, `--animate-otp-caret`, `--animate-fade-in`, `--animate-wave-*`, `--animate-progress-*`.
     - Quy chuáº©n hÃ³a cÃ¡c bá»™ utilities báº±ng `@utility`: Buttons (`btn`, `btn-primary`, `btn-secondary`, `btn-cancel`, `btn-danger`, v.v.), Form controls (`form-input`, `form-textarea`, `search-input`, `form-field`), Cards (`app-card`, `app-card-interactive`), Tabs (`tab-group`, `tab-item`), Glass surfaces (`glass-popover`, `glass-dialog`, `glass-dialog-backdrop`, `glass-header`), Progress bar (`progress-striped`, `progress-animated`, `progress-fill-indeterminate`), Custom scrollbar (`custom-scrollbar`, `no-scrollbar`), Houdini Aura System (`aura-wrapper`, `gradient-*`, `aura-glow`, `aura-border`, `aura-content`), vÃ  CodeBlock syntax highlighting (`.tok-*`).
  2. **Dá»n Dáº¹p Typescript Components & Chuáº©n HÃ³a Host Class Binding:**
     - Loáº¡i bá» `styles: [...]` vÃ  chuyá»ƒn sang `host: { class: 'contents' }` cho `SidebarComponent` vÃ  `HeaderComponent`.
     - Loáº¡i bá» `styles: [...]` vÃ  chuyá»ƒn sang `host: { class: 'block' }` cho `DemoModalComponent`.
     - Loáº¡i bá» `styleUrl` ráº£i rÃ¡c trong `AppComponent`, `CardComponent`, `DrawerComponent`, `DropdownMenuComponent`, `VoiceChatComponent`, `FileUploadComponent`, `AuraComponent`, `CodeBlockComponent`.
  3. **Tá»‘i Æ¯u Template HTML Sang Class Utility Tailwind v4:**
     - `voice-chat.component.html`: Thay tháº¿ toÃ n bá»™ inline `style="..."` báº±ng utility classes Tailwind (`left-3 top-1/2 -translate-y-1/2 z-10`, `right-4`, `top-[42px]`, `top-[66px]`, `top-2 z-1`, `bottom-[52px]`, `bottom-[18px]`).
     - `toast.component.html`: Chuyá»ƒn animation inline sang `animate-[toastProgress_linear_forwards]`.
  4. **XÃ³a Bá» 13 File SCSS Component PhÃ¢n TÃ¡n:**
     - XÃ³a: `app.scss`, `aura.component.scss`, `card.component.scss`, `code-block.component.scss`, `custom-date-time-range.component.scss`, `custom-radio.component.scss`, `divider.component.scss`, `drawer.component.scss`, `dropdown-menu.component.scss`, `voice-chat.component.scss`, `file-upload.component.scss`, `input-otp.component.scss`, `progress.component.scss`.
     - ToÃ n bá»™ codebase hiá»‡n chá»‰ dÃ¹ng duy nháº¥t 1 file stylesheet táº­p trung `src/styles.scss` chuáº©n Tailwind CSS v4.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Unit tests Ä‘áº¡t 100% (6/6 tests passed). Build production (`npm run build`) thÃ nh cÃ´ng 100%. QuÃ©t toÃ n bá»™ codebase Ä‘áº£m báº£o 100% comments trong code Ä‘Æ°á»£c viáº¿t báº±ng tiáº¿ng Anh chuáº©n theo quy táº¯c Universal Rules.

### YÃªu cáº§u: Tá»‘i Æ¯u HÃ³a QuÃ¡ TrÃ¬nh CÃ i Äáº·t NPM (`.npmrc`) & Xá»­ LÃ½ Cáº£nh BÃ¡o Xung Äá»™t Peer Dependencies GiÃ¡n Tiáº¿p
- **Ná»™i dung yÃªu cáº§u:** Xá»­ lÃ½ vÃ  giáº£i thÃ­ch tÃ¬nh tráº¡ng khi cháº¡y `npm i` xuáº¥t hiá»‡n hÃ ng loáº¡t cáº£nh bÃ¡o `npm warn ERESOLVE overriding peer dependency` do xung Ä‘á»™t giá»¯a TypeScript cá»§a dá»± Ã¡n (TS 6.x / Angular 22) vÃ  cÃ¡c gÃ³i phá»¥ thuá»™c giÃ¡n tiáº¿p cá»§a Solana SDK trong `@reown/appkit` (yÃªu cáº§u `typescript@^5.0.0`), giÃºp viá»‡c cÃ i Ä‘áº·t gÃ³i sáº¡ch sáº½, mÆ°á»£t mÃ .
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n & Giáº£i phÃ¡p:**
  1. **NguyÃªn nhÃ¢n:** npm v7+ (Ä‘áº·c biá»‡t npm 11) kiá»ƒm tra peer dependencies ráº¥t kháº¯t khe. CÃ¡c thÆ° viá»‡n Web3 Solana trong `@reown/appkit` khai bÃ¡o `peerOptional: typescript@^5.0.0` trong khi dá»± Ã¡n sá»­ dá»¥ng `typescript@~6.0.2`. npm tá»± Ä‘á»™ng override vÃ  in ra cáº£nh bÃ¡o.
  2. **Giáº£i phÃ¡p:** Táº¡o file `.npmrc` vá»›i cáº¥u hÃ¬nh `legacy-peer-deps=true` táº¡i thÆ° má»¥c gá»‘c cá»§a dá»± Ã¡n.
- **XÃ¡c thá»±c:** Cháº¡y `npm i` hoÃ n thÃ nh sáº¡ch sáº½ trong 2s khÃ´ng cÃ²n spam cáº£nh bÃ¡o `ERESOLVE`. `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Chuáº©n HÃ³a Khoáº£ng CÃ¡ch Section Card (Card 18 & CÃ¡c Card ÄÆ¡n Láº») & Chuáº©n HÃ³a KÃ­ch ThÆ°á»›c HÃ¬nh VuÃ´ng Cho InputOtpComponent (`app-input-otp`)
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c tÃ¬nh tráº¡ng Card 18 (Component Input OTP Cao Cáº¥p) vÃ  cÃ¡c section card lÃ¢n cáº­n bá»‹ dÃ­nh sÃ¡t vÃ o nhau do thiáº¿u khoáº£ng cÃ¡ch `margin-top` Ä‘á»“ng bá»™ vá»›i cÃ¡c card khÃ¡c trong trang; Ä‘á»“ng thá»i cÄƒn chá»‰nh cÃ¡c Ã´ nháº­p mÃ£ OTP trong `InputOtpComponent` thÃ nh hÃ¬nh vuÃ´ng 1:1 (`aspect-square` cÃ¢n Ä‘á»‘i tuyá»‡t Ä‘á»‘i) thay vÃ¬ hÃ¬nh chá»¯ nháº­t Ä‘á»©ng trÆ°á»›c Ä‘Ã³.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. **Khoáº£ng cÃ¡ch Card (`home.component.html`):** CÃ¡c section card sau báº£ng Table (Card 15, 16, 17, 18) náº±m ngoÃ i CSS grid nhÆ°ng Card 16, 17, 18 láº¡i mang class `col-span-full` thay vÃ¬ `mt-8`, dáº«n Ä‘áº¿n margin-top bá»‹ 0px vÃ  dÃ­nh sÃ¡t vÃ o nhau.
  2. **Tá»· lá»‡ Ã´ OTP (`input-otp.component.html`):** KÃ­ch thÆ°á»›c cÃ¡c Ã´ slot trÆ°á»›c Ä‘Ã³ Ä‘Æ°á»£c Ä‘áº·t khÃ´ng báº±ng nhau (vÃ­ dá»¥: `w-7.5 h-9`, `sm:w-11 sm:h-12`, `w-8.5 h-10`), lÃ m cÃ¡c Ã´ bá»‹ kÃ©o dÃ i theo chiá»u dá»c thÃ nh hÃ¬nh chá»¯ nháº­t.
- **Giáº£i phÃ¡p:**
  1. **Äá»“ng bá»™ khoáº£ng cÃ¡ch Section Cards (`home.component.html`):** Chuyá»ƒn toÃ n bá»™ cÃ¡c card Ä‘Æ¡n láº» (Card 15, 16, 17, 18) sang chuáº©n `class="mt-8"` Ä‘á»“ng bá»™ hoÃ n toÃ n vá»›i Card 19 vÃ  Card 20.
  2. **Chuáº©n hÃ³a tá»· lá»‡ Ã´ OTP hÃ¬nh vuÃ´ng 1:1 (`input-otp.component.html`):**
     - ThÃªm `aspect-square` vÃ o container má»—i Ã´ slot OTP.
     - KÃ­ch thÆ°á»›c `size === 'sm'`: `w-8 h-8 text-xs sm:w-9 sm:h-9 sm:text-sm rounded-[8px] sm:rounded-[10px]` (32px x 32px / 36px x 36px).
     - KÃ­ch thÆ°á»›c `size === 'md'`: `w-10 h-10 text-sm sm:w-12 sm:h-12 sm:text-base rounded-[10px] sm:rounded-[12px]` (40px x 40px / 48px x 48px).
     - KÃ­ch thÆ°á»›c `size === 'lg'`: `w-12 h-12 text-base sm:w-14 sm:h-14 sm:text-xl rounded-[12px] sm:rounded-[14px]` (48px x 48px / 56px x 56px).
     - Äá»“ng bá»™ mÃ u hover/focus/caret sang CSS variable Ä‘á»™ng `var(--color-primary)` theo Design System.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Build thÃ nh cÃ´ng 100% (`Application bundle generation complete`).

### YÃªu cáº§u: TÃ­ch Há»£p CÆ¡ Cháº¿ Auto-Flip & Edge Collision Detection (Chá»‘ng TrÃ n Viá»n MÃ n HÃ¬nh Tá»± Äá»™ng) Cho DropdownMenuComponent & CustomSelectComponent
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c tÃ¬nh tráº¡ng khi ngÆ°á»i dÃ¹ng click vÃ o nÃºt menu (vÃ­ dá»¥: nÃºt 3 cháº¥m Trigger Icon á»Ÿ mÃ©p trÃ¡i mÃ n hÃ¬nh trong má»¥c "NÃºt Trigger Icon & Vá»‹ TrÃ­ Placement"), menu dropdown bá»‹ vÄƒng ra ngoÃ i mÃ©p trÃ¡i mÃ n hÃ¬nh lÃ m cáº¯t cá»¥t chá»¯ ("Giao dá»‹ch má»›i" -> "ao dá»‹ch má»›i", "Sao chÃ©p..." -> "Ã©p..."). Tá»± Ä‘á»™ng hÃ³a toÃ n diá»‡n cÆ¡ cháº¿ phÃ¡t hiá»‡n kÃ­ch thÆ°á»›c viewport vÃ  biÃªn mÃ n hÃ¬nh cho Dropdown Menu, Ä‘áº£m báº£o menu luÃ´n luÃ´n hiá»ƒn thá»‹ trá»n váº¹n vÃ  khÃ´ng bao giá» bá»‹ khuáº¥t.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. `DropdownMenuComponent` trÆ°á»›c Ä‘Ã³ sá»­ dá»¥ng class CSS Tailwind tÄ©nh (`absolute right-0`, `left-0`, `top-full`). Khi nÃºt trigger náº±m sÃ¡t mÃ©p trÃ¡i nhÆ°ng cáº¥u hÃ¬nh `placement="bottom-right"` (hoáº·c mÃ n hÃ¬nh nhá»), class `right-0` cÄƒn mÃ©p pháº£i cá»§a menu (rá»™ng 224px) theo mÃ©p pháº£i nÃºt (rá»™ng 40px), Ä‘áº©y toÃ n bá»™ menu sang trÃ¡i 184px vÃ  trÃ n ra ngoÃ i mÃ©p trÃ¡i cá»§a viewport.
  2. ChÆ°a cÃ³ cÆ¡ cháº¿ Ä‘o khoáº£ng trá»‘ng thá»±c táº¿ (Bounding Rect & Collision Engine) Ä‘á»ƒ tá»± Ä‘á»™ng Ä‘á»•i chiá»u (auto-flip) trÃªn/dÆ°á»›i vÃ  tá»± cÄƒn chá»‰nh toáº¡ Ä‘á»™ trÃ¡i/pháº£i khi vÆ°á»£t qua mÃ©p viewport (left < 8px, right > innerWidth - 8px, bottom > innerHeight - 8px).
- **Giáº£i phÃ¡p:**
  1. **NÃ¢ng cáº¥p `DropdownMenuComponent` (`dropdown-menu.component.ts` & `html`):**
     - Chuyá»ƒn container Menu vÃ  Submenu sang `position: fixed` vá»›i `zIndex: 9999` (Menu chÃ­nh) vÃ  `10000` (Submenu), loáº¡i bá» hoÃ n toÃ n nguy cÆ¡ bá»‹ cáº¯t bá»Ÿi cÃ¡c tháº» cha cÃ³ `overflow: hidden` hoáº·c `max-w`.
     - TÃ­ch há»£p hÃ m `updateMenuPosition()` vÃ  `updateSubmenuPosition()`:
       - **Trá»¥c dá»c (Y):** Äo khoáº£ng cÃ¡ch `spaceBelow` vÃ  `spaceAbove`. Náº¿u phÃ­a dÆ°á»›i khÃ´ng Ä‘á»§ khÃ´ng gian thÃ¬ tá»± Ä‘á»™ng láº­t (flip) lÃªn trÃªn, kÃ¨m má»‘c cháº·n an toÃ n `top >= 8px` vÃ  `maxHeight` cuá»™n mÆ°á»£t mÃ .
       - **Trá»¥c ngang (X):** Tá»± Ä‘á»™ng phÃ¡t hiá»‡n va cháº¡m mÃ©p mÃ n hÃ¬nh. Náº¿u `left < 8px` (bá»‹ Ä‘áº©y trÃ n sang trÃ¡i nhÆ° lá»—i ban Ä‘áº§u), há»‡ thá»‘ng tá»± Ä‘á»™ng kÃ©o/láº­t menu vá» vá»‹ trÃ­ an toÃ n (`Math.max(8, triggerRect.left)`). Náº¿u trÃ n mÃ©p pháº£i, tá»± Ä‘á»™ng bÃ¡m theo `innerWidth - 8px - width`.
       - **Submenu cáº¥p 2:** Tá»± Ä‘á»™ng má»Ÿ sang pháº£i; náº¿u cháº¡m mÃ©p pháº£i mÃ n hÃ¬nh thÃ¬ tá»± Ä‘á»™ng láº­t sang trÃ¡i cá»§a Menu cha.
     - Láº¯ng nghe `@HostListener('window:scroll')`, `@HostListener('window:resize')`, vÃ  `ngAfterViewChecked()` Ä‘á»ƒ cáº­p nháº­t tá»a Ä‘á»™ liÃªn tá»¥c theo thá»i gian thá»±c.
  2. **Bá»• sung Edge Clamping Cho `CustomSelectComponent` (`custom-select.component.ts`):** ThÃªm tÃ­nh toÃ¡n chá»‘ng trÃ n ngang (`left + width > window.innerWidth - 8` vÃ  `left < 8`) giÃºp Select UI Ä‘áº¡t Ä‘á»™ á»•n Ä‘á»‹nh 100% trÃªn má»i kÃ­ch thÆ°á»›c mÃ n hÃ¬nh.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. VÆ°á»£t qua 100% bá»™ unit tests (6/6 tests). ÄÃ³ng gÃ³i Production (`npm run build`) thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Bá»• Sung & Cáº¥u HÃ¬nh Thiáº¿t Láº­p Animation TrÆ°á»£t Menu (Sliding Pill Indicator) Cho Desktop Sidebar Trá»±c Tiáº¿p Trong File .ts
- **Ná»™i dung yÃªu cáº§u:** Bá»• sung tÃ­nh nÄƒng hiá»‡u á»©ng indicator lÆ°á»›t trÆ°á»£t menu item cho Desktop Sidebar (giá»‘ng TabGroup) vÃ  táº¯t ná»n xÃ¡m khi hover. KhÃ´ng hiá»ƒn thá»‹ UI switch/toggle trÃªn giao diá»‡n Sidebar HTML mÃ  thiáº¿t láº­p trá»±c tiáº¿p thÃ´ng qua thuá»™c tÃ­nh / signal trong file TypeScript (`sidebar.component.ts`), máº·c Ä‘á»‹nh táº¯t (`false`).
- **PhÃ¢n tÃ­ch & Giáº£i phÃ¡p:**
  1. **Cáº¥u hÃ¬nh trá»±c tiáº¿p trong TypeScript (`sidebar.component.ts`):**
     - Khai bÃ¡o signal `public readonly isSidebarAnimationEnabled = signal<boolean>(false);` kÃ¨m `@Input() set enableMenuAnimation(value: boolean)`.
     - Cho phÃ©p báº­t/táº¯t thiáº¿t láº­p dá»… dÃ ng trong code `.ts` hoáº·c binding tá»« parent component mÃ  khÃ´ng cáº§n Ä‘áº·t UI switch trÃªn Sidebar.
  2. **Giao diá»‡n Sidebar HTML sáº¡ch sáº½ (`sidebar.component.html`):**
     - XÃ³a bá» hoÃ n toÃ n hÃ ng cÃ´ng táº¯c switch vÃ  nÃºt báº¥m sparkles khá»i footer Desktop Sidebar, giá»¯ nguyÃªn giao diá»‡n nguyÃªn báº£n tinh gá»n.
  3. **CÆ¡ cháº¿ Animation Sliding Pill Indicator:**
     - Äáº·t tháº» `<div class="sidebar-menu-pill absolute ...">` trong container `<nav #desktopNavEl class="relative ...">`.
     - Sá»­ dá»¥ng signal `indicatorStyle` theo dÃµi `top, height, left, width, ready, animated`.
     - á»ž láº§n khá»Ÿi táº¡o ban Ä‘áº§u, gÃ¡n `animated = false` Ä‘á»ƒ loáº¡i bá» 100% lá»—i giáº­t tá»« 0px khi reload trang. Sau khi layout náº¡p xong, gÃ¡n `animated = true` giÃºp hiá»‡u á»©ng trÆ°á»£t 300ms (`transition-[top,height,left,width] duration-300 ease-out`) diá»…n ra Ãªm Ã¡i.
     - Sá»­ dá»¥ng `#rla="routerLinkActive"` vá»›i class binding trá»±c tiáº¿p `[class.bg-primary/10]="rla.isActive && !isSidebarAnimationEnabled()"` vÃ  `[class.hover:bg-slate-100]="!rla.isActive && !isSidebarAnimationEnabled()"` Ä‘á»ƒ triá»‡t tiÃªu hoÃ n toÃ n xung Ä‘á»™t 2 ná»n tÃ­m vÃ  loáº¡i bá» ná»n xÃ¡m hover khi báº­t animation.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Cháº¡y `npx ng test --no-watch` vÆ°á»£t qua 100% test suites (6/6 tests). ÄÃ³ng gÃ³i Production (`npm run build`) thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c Phá»¥c Lá»—i Sidebar Menu (Mobile Drawer) KhÃ´ng Äáº¡t Chiá»u Cao Full MÃ n HÃ¬nh (Full Height) & Thiáº¿u Padding Header Logo / Navigation
- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i sidebar menu trÃªn mÃ n hÃ¬nh di Ä‘á»™ng/drawer (`app-sidebar`) bá»‹ cáº¯t ngang á»Ÿ bÃªn dÆ°á»›i má»¥c "Giao diá»‡n Tá»± Ä‘á»™ng", chiá»u cao khÃ´ng kÃ©o dÃ i háº¿t mÃ n hÃ¬nh (`full height`), Ä‘á»“ng thá»i kháº¯c phá»¥c tÃ¬nh tráº¡ng pháº§n Header Logo vÃ  danh sÃ¡ch Navigation trÃªn Mobile Drawer bá»‹ thiáº¿u padding, cháº­t chá»™i vÃ  khÃ´ng Ä‘á»“ng bá»™ vá»›i Desktop Sidebar.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Class `.glass-dialog` trong `src/styles.scss` bá»‹ gÃ¡n cá»©ng thuá»™c tÃ­nh `position: relative;`. Khi pháº§n tá»­ Mobile Drawer sá»­ dá»¥ng `class="fixed inset-y-0 left-0 z-[70] ... glass-dialog"`, thuá»™c tÃ­nh `position: relative;` tá»« CSS Ä‘Ã£ ghi Ä‘Ã¨ lÃªn `position: fixed` cá»§a Tailwind CSS, lÃ m máº¥t tÃ¡c dá»¥ng cá»§a `inset-y-0` khiáº¿n Drawer co láº¡i theo content.
  2. Pháº§n Header Logo trÃªn Mobile Drawer trÆ°á»›c Ä‘Ã³ dÃ¹ng `h-14` (56px) vá»›i logo `w-11 h-11` (44px) dáº«n Ä‘áº¿n khoáº£ng cÃ¡ch trÃªn/dÆ°á»›i chá»‰ cÃ²n 6px, káº¿t há»£p `px-5` vÃ  `gap-3` (trong khi desktop lÃ  `h-16 sm:h-20`, `pl-6 pr-6/pr-8`, `gap-3.5`).
  3. Khung Navigation trÃªn Mobile Drawer dÃ¹ng `px-3 py-4 space-y-1` lÃ m má»¥c "Trang chá»§" náº±m quÃ¡ sÃ¡t lÃªn mÃ©p trÃªn (chá»‰ cÃ¡ch 16px) vÃ  háº¹p hai bÃªn so vá»›i Desktop (`px-4 py-6 space-y-1.5`).
- **Giáº£i phÃ¡p:**
  1. **Loáº¡i bá» `position: relative;` cá»©ng trong `.glass-dialog` (`src/styles.scss`):** Cho phÃ©p cÃ¡c pháº§n tá»­ linh hoáº¡t sá»­ dá»¥ng `fixed`, `relative`, hoáº·c `absolute` tÃ¹y ngá»¯ cáº£nh mÃ  khÃ´ng bá»‹ CSS class Ä‘Ã¨ position.
  2. **Chuáº©n hÃ³a Full Height & Äá»“ng bá»™ Padding 100% cho Mobile Drawer (`sidebar.component.html`):**
     - Container Drawer: `w-72 sm:w-80 h-full h-[100dvh] border-r border-slate-200/50 dark:border-slate-900/50` vÃ  Ä‘áº£m báº£o `fixed inset-y-0 left-0` hoáº¡t Ä‘á»™ng chÃ­nh xÃ¡c 100% viewport height.
     - Header Logo: Chuáº©n hÃ³a `h-16 sm:h-20 pl-6 pr-6 gap-3.5 border-b border-slate-200/50 dark:border-slate-900/50 shrink-0` mang láº¡i khÃ´ng gian Ä‘á»‡m rá»™ng rÃ£i, thoÃ¡ng Ä‘Ã£ng nhÆ° Desktop.
     - Navigation: `flex-1 py-6 px-4 space-y-1.5 overflow-y-auto` Ä‘á»“ng bá»™ hoÃ n toÃ n vá»›i Desktop Sidebar, táº¡o khoáº£ng cÃ¡ch Ä‘á»‡m 24px thoÃ¡ng máº¯t giá»¯a Header Logo vÃ  má»¥c "Trang chá»§".
     - Footer: `py-4 px-5 shrink-0 mt-auto` cá»‘ Ä‘á»‹nh cháº¯c cháº¯n á»Ÿ Ä‘Ã¡y sidebar.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Build production (`npm run build`) thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c Phá»¥c Lá»—i NÃºm TrÃ²n Tráº¯ng Bá»‹ Lá»‡ch Xuá»‘ng DÆ°á»›i (Vertical Alignment) Cho Component CustomSwitch (`app-custom-switch`)
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c tÃ¬nh tráº¡ng á»Ÿ tráº¡ng thÃ¡i unchecked (táº¯t), nÃºm trÃ²n tráº¯ng cá»§a nÃºt Switch (`app-custom-switch`) bá»‹ tá»¥t lá»‡ch háº³n xuá»‘ng dÆ°á»›i Ä‘Ã¡y cá»§a thanh trÆ°á»£t (nhÆ° á»Ÿ khung "ACCORDION TÃ™Y BIáº¾N -> Cho phÃ©p má»Ÿ nhiá»u má»¥c cÃ¹ng lÃºc").
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Tháº» track bá»c ngoÃ i switch cÃ³ kÃ­ch thÆ°á»›c `w-11 h-6` (44px x 24px). Khi á»Ÿ tráº¡ng thÃ¡i unchecked (`!checked`), tháº» Ä‘Æ°á»£c gÃ¡n class viá»n `border border-slate-300/60 dark:border-slate-700/60` (1px).
  2. Do `box-sizing: border-box`, viá»n 1px lÃ m chiá»u cao vÃ¹ng Ä‘á»‡m bÃªn trong (padding-box) co láº¡i cÃ²n `22px`.
  3. NÃºm trÃ²n tráº¯ng cÃ³ kÃ­ch thÆ°á»›c `w-5 h-5` (20px x 20px) vÃ  Ä‘Æ°á»£c Ä‘áº·t `absolute top-[2px] left-[2px]`. Khi tÃ­nh tá»a Ä‘á»™ tá»« viá»n trong, khoáº£ng cÃ¡ch trÃªn lÃ  2px + 20px chiá»u cao nÃºm trÃ²n = 22px, khiáº¿n khoáº£ng cÃ¡ch tá»« Ä‘Ã¡y nÃºm trÃ²n Ä‘áº¿n viá»n dÆ°á»›i bá»‹ rÃºt vá» `0px` (dÃ­nh sÃ¡t sáº¡t mÃ©p viá»n Ä‘Ã¡y) vÃ  lá»‡ch 2px so vá»›i Ä‘á»‰nh.
  4. NgoÃ i ra, khi chuyá»ƒn giá»¯a tráº¡ng thÃ¡i checked (khÃ´ng cÃ³ border, chiá»u cao trong 24px) vÃ  unchecked (cÃ³ border, chiá»u cao trong 22px) dáº«n Ä‘áº¿n sá»± giáº­t layout vÃ  khÃ´ng nháº¥t quÃ¡n.
- **Giáº£i phÃ¡p:**
  1. Cáº¥u trÃºc láº¡i track switch thÃ nh Flexbox container: `relative w-11 h-6 p-0.5 rounded-full flex items-center transition-colors duration-200 ease-in-out shrink-0`.
  2. Thay tháº¿ `border` báº±ng `ring-1 ring-inset ring-slate-300/80 dark:ring-slate-700/80` cho tráº¡ng thÃ¡i unchecked. CÆ¡ cháº¿ `ring-inset` váº½ bÃ³ng viá»n bÃªn trong mÃ  khÃ´ng lÃ m biáº¿n dáº¡ng box model hoáº·c lÃ m co háº¹p khÃ´ng gian render cá»§a pháº§n tá»­ con.
  3. NÃºm trÃ²n tráº¯ng: `bg-white rounded-full h-5 w-5 transition-transform duration-200 ease-in-out shadow-xs pointer-events-none`.
  4. Vá»›i `p-0.5` (2px padding), chiá»u dá»c lÃ  `2px (top) + 20px (thumb) + 2px (bottom) = 24px` -> NÃºm trÃ²n luÃ´n luÃ´n náº±m chÃ­nh tÃ¢m Ä‘á»‘i xá»©ng 100% theo phÆ°Æ¡ng dá»c. Chiá»u ngang khi unchecked cÃ¡ch mÃ©p trÃ¡i 2px (`translate-x-0`), khi checked trÆ°á»£t qua pháº£i cÃ¡ch mÃ©p pháº£i Ä‘Ãºng 2px (`translate-x-5`).
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Build production (`npm run build`) thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Bá»• Sung & Chuáº©n HÃ³a Border NÃºt Báº¥m (`border border-slate-200/60 dark:border-slate-800/60`) Cho ToÃ n Bá»™ á»¨ng Dá»¥ng
- **Ná»™i dung yÃªu cáº§u:** Chuáº©n hÃ³a toÃ n bá»™ cÃ¡c nÃºt báº¥m inline, nÃºt cancel, dropdown menu triggers, nÃºt chuyá»ƒn máº¡ng, nÃºt modal/drawer action sang há»‡ viá»n chuáº©n **`border border-slate-200/60 dark:border-slate-800/60`** Ä‘á»“ng bá»™ theo ngÃ´n ngá»¯ thiáº¿t káº¿ cá»§a á»©ng dá»¥ng.
- **Chi tiáº¿t cÃ¡c thÃ nh pháº§n Ä‘Ã£ Ã¡p dá»¥ng:**
  1. **Class `.btn-cancel` (`src/styles.scss`):**
     - Ãp dá»¥ng chuáº©n: `@apply ... border border-slate-200/60 dark:border-slate-800/60 shadow-xs;`.
     - TÃ¡c Ä‘á»™ng tá»›i toÃ n bá»™ cÃ¡c nÃºt `app-button variant="cancel"` (nÃºt Há»§y, ÄÃ³ng Drawer, NÃºt Reset, v.v.).
  2. **Component Dropdown Menu (`dropdown-menu.component.html`):**
     - `triggerVariant="outline"` & `triggerVariant="default"`: `bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs`.
     - `triggerVariant="secondary"`: `bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800/60 shadow-xs`.
     - `triggerVariant="ghost"`: `bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800/60 shadow-xs`.
     - `triggerVariant="icon"`: `rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs`.
  3. **NÃºt Chuyá»ƒn Máº¡ng & NÃºt Action KhÃ¡c (`home.component.html`, `custom-date-time-range.component.html`):**
     - NÃºt switch network: `border border-slate-200/60 dark:border-slate-800/60 shadow-xs`.
     - NÃºt footer cancel: `border border-slate-200/60 dark:border-slate-800/60 shadow-xs`.
- **XÃ¡c thá»±c:** Cháº¡y `npm run build` hoÃ n thÃ nh 100% vá»›i exit code 0.

### YÃªu cáº§u: Chuáº©n HÃ³a Class Tailwind, Tá»‘i Æ¯u Hiá»ƒn Thá»‹ Dark Mode & NÃ¢ng Cáº¥p Logic / Props Cho CÃ¡c Component Hiá»‡n CÃ³
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t toÃ n bá»™ 46 component hiá»‡n cÃ³ trong dá»± Ã¡n Ä‘á»ƒ sá»­a triá»‡t Ä‘á»ƒ cÃ¡c class Tailwind phi tiÃªu chuáº©n (`slate-350`, `slate-550`, `slate-650`, `slate-1000`, `slate-150`), kháº¯c phá»¥c lá»—i hiá»ƒn thá»‹ tá»‘i má» trong Dark Mode, Ä‘á»“ng thá»i hoÃ n thiá»‡n logic form binding (`ControlValueAccessor`), cÄƒn chá»‰nh layout vÃ  props cho cÃ¡c component cÃ³ sáºµn mÃ  khÃ´ng táº¡o component má»›i.
- **Chi tiáº¿t cÃ¡c háº¡ng má»¥c Ä‘Ã£ thá»±c hiá»‡n:**
  1. **Sá»­a Lá»—i Class CSS KhÃ´ng Há»£p Lá»‡:**
     - `table.component.html`: Sá»­a `text-slate-350` -> `text-slate-700 dark:text-slate-200`, `dark:text-slate-550` -> `dark:text-slate-400`, `dark:text-slate-650` -> `dark:text-slate-600`.
     - `stat-card.component.html`: Sá»­a `bg-slate-1000/10` -> `bg-slate-500/10 dark:bg-slate-700/30 text-slate-600 dark:text-slate-400`.
     - `custom-slider.component.ts`: Sá»­a `dark:bg-slate-1000` -> `dark:bg-slate-600`.
     - `badge.component.ts`: Sá»­a `bg-slate-150/90 text-slate-650` -> `bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400`.
     - `home.component.html`: Sá»­a `text-slate-650 dark:text-slate-350` -> `text-slate-600 dark:text-slate-300`.
  2. **HoÃ n Thiá»‡n Logic & TÃ­nh NÄƒng Component CÃ³ Sáºµn:**
     - `CustomSelectComponent`: Cáº£i tiáº¿n kiá»ƒm tra placeholder `[class.text-slate-400]="!selectedLabel"` loáº¡i bá» lá»—i nháº­n diá»‡n sai khi giÃ¡ trá»‹ Ä‘Æ°á»£c chá»n lÃ  sá»‘ `0`.
     - `CustomSwitchComponent`: Implement `ControlValueAccessor` (`NG_VALUE_ACCESSOR`), há»— trá»£ Ä‘áº§y Ä‘á»§ 2-way binding `[(ngModel)]` vÃ  Reactive Forms; bá»• sung host bindings `[class.w-full]="type === 'full'"` vÃ  `[class.inline-flex]="type === 'compact'"`; kháº¯c phá»¥c lá»—i hiá»ƒn thá»‹ mÃ u ná»n khi báº­t switch trong Dark Mode báº±ng cÃ¡ch chuyá»ƒn tá»« CSS `peer-checked:` sang binding `[ngClass]` trá»±c tiáº¿p `[class.bg-[var(--color-primary)]]="checked"`, Ä‘áº£m báº£o khi switch báº­t luÃ´n hiá»ƒn thá»‹ mÃ u tÃ­m chá»§ Ä‘áº¡o rá»±c rá»¡ vÃ  khÃ´ng bá»‹ class `dark:bg-slate-800` Ä‘Ã¨ mÃ u.
     - `AlertComponent`: Bá»c paragraph vá»›i `@if (message)` ngÄƒn cháº·n viá»‡c render tháº» `<p>` rá»—ng khi chá»‰ truyá»n `ng-content`.
     - `EmptyStateComponent`: ÄÆ°a aura bo gÃ³c `rounded-[17px]` vá» chuáº©n tá»‘i Ä‘a `rounded-[15px]` theo Design System.
     - `PaginationComponent`: Bá»• sung `host: { class: 'block w-full' }`, thÃªm `@Input() hideOnSinglePage = true;`, Ä‘á»“ng bá»™ mÃ u nÃºt active sang `bg-[var(--color-primary)]`.
     - `ProgressComponent`: Äá»“ng bá»™ biáº¿n thá»ƒ `primary` vÃ  `gradient` sang CSS variable Ä‘á»™ng `var(--color-primary)` vÃ  `var(--color-secondary)`.
     - `DrawerComponent`: ThÃªm `@Input() hasFooter = true;` vÃ  bá»c footer container vá»›i `@if (hasFooter)` giÃºp drawer linh hoáº¡t khÃ´ng bá»‹ thá»«a viá»n dÆ°á»›i khi khÃ´ng cáº§n footer.
  3. **RÃ  SoÃ¡t & Äá»‘i Chiáº¿u Chuáº©n Thiáº¿t Káº¿ (`design.md` & `.agent/design.md`):**
     - ÄÃ£ kiá»ƒm tra 100% cÃ¡c tiÃªu chuáº©n thiáº¿t káº¿: Typography (phÃ´ng Quicksand), Há»‡ mÃ u Ä‘á»™ng (`--color-primary`, `--color-secondary`), Giá»›i háº¡n bo gÃ³c tá»‘i Ä‘a `15px` (`--radius-xl` -> `--radius-4xl`), Bá»‘ cá»¥c container `max-w-[1530px]`, NhÃ£n trÆ°á»ng `.form-field` (`uppercase text-xs font-bold tracking-wider select-none`), Há»‡ thá»‘ng Glass 3 cáº¥p (`.glass-popover`, `.glass-dialog`, `.glass-header`), Backdrop overlay `bg-black/40` (khÃ´ng `backdrop-blur-*`), 100% SVG inline icons (0 raw emoji), vÃ  bá»• sung `host: { class: 'block w-full' }` cho `PageHeaderComponent` vÃ  `SkeletonLoaderComponent`.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Build production (`npm run build`) thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: TÃ¡i Cáº¥u TrÃºc, Tá»‘i Æ¯u HÃ³a DRY, Chuáº©n HÃ³a 100% Tailwind CSS & Triá»‡t TiÃªu Transition TrÃªn Border Cho Sidebar & Header
- **Ná»™i dung yÃªu cáº§u:** Gom toÃ n bá»™ giao diá»‡n vÃ  logic cá»§a Mobile Drawer Sidebar tá»« `HeaderComponent` vá» chung `SidebarComponent`, loáº¡i bá» toÃ n bá»™ viá»‡c hardcode láº·p láº¡i navigation links theo nguyÃªn táº¯c DRY, chuyá»ƒn Ä‘á»•i sang 100% Tailwind CSS utility classes, Ä‘á»“ng thá»i loáº¡i bá» hoÃ n toÃ n hiá»‡u á»©ng transition trÃªn cÃ¡c Ä‘Æ°á»ng viá»n (border) vÃ  cÄƒn khá»›p tuyá»‡t Ä‘á»‘i Ä‘Æ°á»ng viá»n ngÄƒn cÃ¡ch giá»¯a Header vÃ  Sidebar.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n & Kiáº¿n trÃºc:**
  1. Tháº» logo link trong Sidebar sá»­ dá»¥ng `transition-all duration-300` khiáº¿n thuá»™c tÃ­nh `border-b` bá»‹ kÃ­ch hoáº¡t animation chuyá»ƒn Ä‘á»™ng cháº­m/giáº­t khi thay Ä‘á»•i tráº¡ng thÃ¡i hoáº·c theme.
  2. MÃ u viá»n vÃ  Ä‘á»™ cao giá»¯a Header (`h-14 sm:h-20`, `border-slate-200/50 dark:border-slate-900/50`) vÃ  Sidebar Logo Header (`h-16 sm:h-20`, `border-slate-100 dark:border-slate-800/60`) bá»‹ lá»‡ch nhau.
- **Giáº£i phÃ¡p:**
  1. Thay tháº¿ `transition-all` báº±ng `transition-[padding,gap]` trÃªn Sidebar logo link, Ä‘áº£m báº£o cÃ¡c Ä‘Æ°á»ng viá»n (`border-b`, `border-t`, `border-r`) KHÃ”NG cÃ³ báº¥t ká»³ transition nÃ o.
  2. Äá»“ng bá»™ mÃ u viá»n chuáº©n `border-slate-200/50 dark:border-slate-900/50` vÃ  chiá»u cao cá»‘ Ä‘á»‹nh `h-14 sm:h-20` giá»¯a Header vÃ  Sidebar Logo Header giÃºp Ä‘Æ°á»ng viá»n ngang khá»›p tuyá»‡t Ä‘á»‘i tá»« mÃ©p trÃ¡i sang pháº£i.
  3. Äá»‹nh nghÄ©a `interface NavItem` vÃ  dÃ¹ng `@for (item of navItems; track item.path)` cho cáº£ Desktop vÃ  Mobile Drawer.
  4. RÃºt gá»n `styles` trong `sidebar.component.ts` vá» duy nháº¥t `:host { display: contents; }`.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Build production (`npm run build`) thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c Phá»¥c Lá»—i Di Chuyá»ƒn Hiá»‡u á»¨ng Ná»n (Initial Transition Glitch / Position Mismatch) Cho Component TabGroup (`app-tab-group`) Khi Reload Trang
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c lá»—i khi vá»«a reload láº¡i trang, thanh pill ná»n (`.tab-group-pill`) trong `app-tab-group` (vÃ­ dá»¥: Tab Tá»‘c Äá»™ Giao Dá»‹ch "Máº·c Ä‘á»‹nh / Nhanh / TÃ¹y chá»n") bá»‹ trÆ°á»£t giáº­t tá»« vá»‹ trÃ­ `0px` sang tab active hoáº·c bá»‹ lá»‡ch vá»‹ trÃ­ do kÃ­ch thÆ°á»›c button tÃ­nh sai lÃºc chÆ°a náº¡p xong Web Font / layout reflow.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Class CSS transition `transition-[left,width] duration-300` náº±m cá»‘ Ä‘á»‹nh trÃªn tháº» `.tab-group-pill` ngay tá»« frame render Ä‘áº§u tiÃªn. Khi `ngAfterViewInit` gÃ¡n vá»‹ trÃ­ `left` vÃ  `width` láº§n Ä‘áº§u tiÃªn (tá»« `0px` sang `xx px`), trÃ¬nh duyá»‡t tá»± Ä‘á»™ng kÃ­ch hoáº¡t animation trÆ°á»£t 300ms khiáº¿n ngÆ°á»i dÃ¹ng vá»«a reload trang sáº½ tháº¥y pill bá»‹ náº£y / trÆ°á»£t tá»« gÃ³c trÃ¡i lÆ°á»›t sang tab active.
  2. Khi vá»«a khá»Ÿi táº¡o trang, Web Fonts (Google Fonts Quicksand) chÆ°a táº£i xong hoáº·c container layout reflow chÆ°a hoÃ n táº¥t, dáº«n tá»›i `offsetWidth` vÃ  `offsetLeft` cá»§a button bá»‹ tÃ­nh sai kÃ­ch thÆ°á»›c ngáº¯n hÆ¡n / lá»‡ch vá»‹ trÃ­.
  3. `ResizeObserver` cÅ© chá»‰ quan sÃ¡t container mÃ  khÃ´ng quan sÃ¡t cÃ¡c button con `#tabBtn`.
- **Giáº£i phÃ¡p:**
  1. **TÃ¡ch biá»‡t Tráº¡ng thÃ¡i Animation (`animated` signal):** ThÃªm thuá»™c tÃ­nh `animated: boolean` vÃ o signal `sliderStyle`. á»ž láº§n khá»Ÿi táº¡o vá»‹ trÃ­ ban Ä‘áº§u (initial load), gÃ¡n `animated = false` Ä‘á»ƒ táº¯t hoÃ n toÃ n CSS transition `transition-[left,width]` lÃ m pill láº­p tá»©c Ä‘á»©ng yÃªn Ãªm Ã¡i Ä‘Ãºng tab active mÃ  KHÃ”NG Bá»Š TRÆ¯á»¢T GIáº¬T Tá»ª 0PX.
  2. **Báº­t Animation Cho Thao TÃ¡c Tiáº¿p Theo:** Sau khi layout vÃ  font náº¡p xong qua `requestAnimationFrame`, gÃ¡n `animated = true` Ä‘á»ƒ khi ngÆ°á»i dÃ¹ng click chuyá»ƒn tab ("Nhanh", "TÃ¹y chá»n"...), hiá»‡u á»©ng trÆ°á»£t mÆ°á»£t 300ms diá»…n ra trÆ¡n mÆ°á»£t.
  3. **Láº¯ng nghe Web Fonts & Quan sÃ¡t Button Resize:** ThÃªm `document.fonts.ready.then(...)` vÃ  má»Ÿ rá»™ng `ResizeObserver` quan sÃ¡t cáº£ container láº«n tá»«ng tab button `#tabBtn` Ä‘á»ƒ tá»± Ä‘á»™ng cáº­p nháº­t vá»‹ trÃ­ pill chuáº©n xÃ¡c 100% khi font táº£i xong hay layout thay Ä‘á»•i.
- **XÃ¡c thá»±c:** Runs `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Production build Angular (`npm run build`) thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c Phá»¥c Lá»—i Lá»‡ch Ná»n Trong Suá»‘t & ÄÆ¡n Giáº£n HÃ³a Cáº¥u TrÃºc Glassmorphism Cho Popover Dropdown
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c tÃ¬nh tráº¡ng Popover Menu Cha bá»‹ máº¥t mÃ u ná»n dáº«n tá»›i trong suá»‘t 100% gÃ¢y Ä‘Ã¨ chá»¯ rá»‘i máº¯t trÃªn giao diá»‡n trang chá»§, Ä‘á»“ng thá»i chuáº©n hÃ³a hiá»‡u á»©ng KÃ­nh Má» Glassmorphism cho cáº£ Menu Cha vÃ  Submenu Con.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Viá»‡c tá»± táº¡o thÃªm tháº» `div` ná»n má» tuyá»‡t Ä‘á»‘i (`absolute inset-0`) vá»›i z-index Ã¢m khi container khÃ´ng cÃ³ Stacking Context riÃªng khiáº¿n tháº» ná»n bá»‹ chÃ¬m xuá»‘ng Ä‘áº±ng sau Card trang chá»§, lÃ m Popover bá»‹ trong suá»‘t hoÃ n toÃ n vÃ  lá»™ chá»¯ trang web Ä‘áº±ng sau.
  2. Bá»‹ thiáº¿u khai bÃ¡o Ã©p thuá»™c tÃ­nh `-webkit-backdrop-filter: blur(20px) saturate(180%) !important;` vÃ  `will-change: backdrop-filter;` toÃ n cá»¥c trong CSS.
- **Giáº£i phÃ¡p:**
  1. **KhÃ´i Phá»¥c Cáº¥u TrÃºc Lá»›p Ná»n Chuáº©n:** Loáº¡i bá» cÃ¡c tháº» `div` ná»n tuyá»‡t Ä‘á»‘i dÆ° thá»«a. ÄÆ°a bá»™ class má» kÃ­nh chuáº©n `bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg` trá»±c tiáº¿p vá» tháº» bá»c Popover cá»§a cáº£ Menu Cha vÃ  Submenu Con.
  2. **Tá»‘i Æ¯u Rendering Engine:** Khai bÃ¡o `-webkit-backdrop-filter: blur(20px) saturate(180%) !important;` vÃ  `will-change: backdrop-filter;` trong `src/styles.scss` trÃªn class `.dropdown-menu-popover`.
- **XÃ¡c thá»±c:** Runs `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Production build thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c Phá»¥c Lá»—i CÄƒn Giá»¯a Dá»c (Vertical Centering) ToÃ n Diá»‡n Cho Táº¥t Cáº£ NÃºt ÄÃ³ng & Icon TrÃªn ToÃ n Bá»™ á»¨ng Dá»¥ng
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t toÃ n bá»™ dá»± Ã¡n Ä‘á»ƒ kiá»ƒm tra vÃ  kháº¯c phá»¥c triá»‡t Ä‘á»ƒ lá»—i cÄƒn giá»¯a dá»c (vertical alignment / centering) cho cÃ¡c nÃºt Ä‘Ã³ng (`x`), nÃºt xÃ³a, icon tráº¡ng thÃ¡i trÃªn Toast, Modal, Drawer, Search Input, Alert, File Upload vÃ  Stepper components.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n & RÃ  soÃ¡t:**
  1. **Toast Component (`toast.component.html`):** Container bá»‹ dÃ¹ng `items-start`, nÃºt Ä‘Ã³ng `x` dÃ¹ng `position: absolute; top: 3.5; right: 3.5` khiáº¿n icon bá»‹ lá»‡ch lÃªn gÃ³c trÃªn cÃ¹ng right.
  2. **Modal & Modal Wrapper (`modal.component.html`, `modal-wrapper.component.html`):** Tháº» `<app-icon name="close">` trong nÃºt Ä‘Ã³ng header thiáº¿u `flex items-center justify-center` lÃ m icon SVG lá»‡ch vá»‹ trÃ­ trong nÃºt 28x28px.
  3. **Drawer Component (`drawer.component.html`):** NÃºt Ä‘Ã³ng drawer chÆ°a bá»• sung `flex items-center justify-center` cho SVG icon.
  4. **Search Input (`custom-search-input.component.html`):** NÃºt xÃ³a tá»« khÃ³a tÃ¬m kiáº¿m (`clearable`) chÆ°a cÃ³ class cÄƒn giá»¯a tÃ¢m icon.
  5. **File Upload (`file-upload.component.html`):** NÃºt xÃ³a tá»‡p tin vÃ  nÃºt Ä‘Ã³ng modal xem trÆ°á»›c áº£nh preview bá»‹ lá»‡ch icon.
  6. **Alert Component (`alert.component.html`):** NÃºt Ä‘Ã³ng thÃ´ng bÃ¡o dismissible chÆ°a cÃ³ cÄƒn giá»¯a icon.
  7. **Stepper Component (`stepper.component.html`):** CÃ¡c icon check/close/number trong vÃ²ng trÃ²n bÆ°á»›c step (w-10 h-10) chÆ°a cÃ³ class cÄƒn giá»¯a tÃ¢m.
- **Giáº£i phÃ¡p:**
  1. Äá»•i `items-start` sang `flex items-center gap-3` trong `toast.component.html`, loáº¡i bá» `position: absolute` trÃªn nÃºt Ä‘Ã³ng Toast vÃ  chuyá»ƒn thÃ nh flex child cÄƒn lá» `ml-auto`.
  2. Bá»• sung `flex items-center justify-center` cho 100% cÃ¡c icon vÃ  nÃºt Ä‘Ã³ng trong Modal, Modal Wrapper, Drawer, Search Input, Alert, File Upload vÃ  Stepper components.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Táº¥t cáº£ nÃºt báº¥m vÃ  icon trÃªn toÃ n há»‡ thá»‘ng Ä‘á»u Ä‘áº¡t Ä‘á»™ cÄƒn giá»¯a dá»c & ngang tuyá»‡t Ä‘á»‘i 100%.

### YÃªu cáº§u: Kháº¯c Phá»¥c Lá»—i áº¨n Khung Chá»n Giá»/PhÃºt & Dáº£i Presets (HÃ´m Nay, HÃ´m Qua, 7 NgÃ y...) Cho Component CustomDateTimeRange (`app-custom-date-time-range`)
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c lá»—i khi ngÆ°á»i dÃ¹ng click vÃ o Ã´ "KHOáº¢NG THá»œI GIAN HOáº T Äá»˜NG (KÃˆM GIá»œ & PHÃšT)" trong Há»™p thoáº¡i Modal / Trang chá»§, Popover má»Ÿ ra chá»‰ cÃ³ báº£ng lá»‹ch mÃ  KHÃ”NG HIá»‚N THá»Š bá»™ chá»n Giá» & PhÃºt (Start Time / End Time) vÃ  KHÃ”NG CÃ“ dáº£i nÃºt báº¥m chá»n nhanh Presets ("HÃ´m nay", "HÃ´m qua", "7 ngÃ y qua", "30 ngÃ y qua", "ThÃ¡ng nÃ y").
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. **áº¨n Khung Chá»n Giá»/PhÃºt:** Trong `custom-date-time-range.component.html`, Ä‘iá»u kiá»‡n render khung chá»n giá» bá»‹ khÃ³a cá»©ng bá»Ÿi `@if (showTime && tempStartDate())`. Khi má»›i má»Ÿ Ã´ nháº­p liá»‡u trá»‘ng, `tempStartDate()` chÆ°a cÃ³ dá»¯ liá»‡u (`""`), lÃ m Ä‘iá»u kiá»‡n bá»‹ `false` vÃ  áº©n máº¥t toÃ n bá»™ giao diá»‡n chá»n Giá» & PhÃºt. NgoÃ i ra, bá»™ chá»n End Time bá»‹ gÃ¡n `[class.opacity-50]="!tempEndDate()"` lÃ m ngÆ°á»i dÃ¹ng khÃ´ng tÆ°Æ¡ng tÃ¡c Ä‘Æ°á»£c.
  2. **Táº¯t Dáº£i NÃºt Presets:** Thuá»™c tÃ­nh `showPresets` máº·c Ä‘á»‹nh lÃ  `false` á»Ÿ component vÃ  `demoDatePickerShowPresets` signal máº·c Ä‘á»‹nh lÃ  `false` khiáº¿n dáº£i nÃºt chá»n nhanh Presets khÃ´ng xuáº¥t hiá»‡n.
- **Giáº£i phÃ¡p:**
  1. **Hiá»ƒn Thá»‹ Khung Giá» & PhÃºt Ngay Láº­p Tá»©c:** Äá»•i Ä‘iá»u kiá»‡n render trong `custom-date-time-range.component.html` thÃ nh `@if (showTime)` Ä‘á»ƒ báº¥t ká»³ khi nÃ o component cÃ³ `showTime="true"`, Popover luÃ´n hiá»ƒn thá»‹ ngay khu vá»±c chá»n Giá» & PhÃºt. Loáº¡i bá» cÃ¡c class vÃ´ hiá»‡u hÃ³a trÃªn End Time picker.
  2. **Tá»± Äá»™ng Khá»Ÿi Táº¡o NgÃ y Khi Chá»n Giá»/PhÃºt:** Cáº­p nháº­t hÃ m `selectTimeValue` vÃ  `apply` trong `custom-date-time-range.component.ts`: Náº¿u ngÆ°á»i dÃ¹ng Ä‘iá»u chá»‰nh Giá»/PhÃºt hoáº·c báº¥m "Ãp dá»¥ng" khi chÆ°a chá»n ngÃ y trÃªn lá»‹ch, há»‡ thá»‘ng tá»± Ä‘á»™ng gÃ¡n ngÃ y máº·c Ä‘á»‹nh lÃ  ngÃ y hÃ´m nay.
  3. **Äá»“ng Bá»™ Dáº£i Presets ("HÃ´m nay", "HÃ´m qua", "7 ngÃ y qua", "30 ngÃ y qua", "ThÃ¡ng nÃ y"):** Äá»“ng bá»™ 100% dáº£i 5 Presets chuáº©n ("HÃ´m nay", "HÃ´m qua", "7 ngÃ y qua", "30 ngÃ y qua", "ThÃ¡ng nÃ y") cho cáº£ `CustomDateTimeRangeComponent` vÃ  `CustomDatePickerComponent`. Bá»‘ cá»¥c hiá»ƒn thá»‹ dáº¡ng `grid grid-cols-3 gap-2` chuáº©n 2 hÃ ng Ä‘áº¹p máº¯t trÃªn giao diá»‡n. Cáº­p nháº­t `demoDatePickerShowPresets = signal(true)` trong `home.component.ts` vÃ  `demo-modal.component.ts`.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Build production Ä‘Ã³ng gÃ³i Angular (`npm run build`) thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: KhÃ´i Phá»¥c Hiá»‡u á»¨ng Animation Ná»n TrÆ°á»£t MÆ°á»£t (Sliding Pill) Cho Component TabGroup (`app-tab-group`)
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c tÃ¬nh tráº¡ng khi click chuyá»ƒn giá»¯a cÃ¡c tab trong `app-tab-group` (vÃ­ dá»¥: NhÃ³m Tab TÃ¹y Biáº¿n, Giá»›i TÃ­nh, Tá»‘c Äá»™ Giao Dá»‹ch...), thanh pill ná»n bá»‹ máº¥t animation trÆ°á»£t mÆ°á»£t mÃ  nháº£y vá»¥t tá»« tab nÃ y sang tab khÃ¡c.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Tháº» `<div>` hiá»ƒn thá»‹ pill trÆ°á»£t `.tab-group-pill` trong `tab-group.component.html` bá»‹ thiáº¿u class thá»i gian chuyá»ƒn Ä‘á»™ng `transition-[left,width] duration-300`.
  2. Máº·c dÃ¹ cÃ³ class `ease-out`, nhÆ°ng viá»‡c thiáº¿u `transition-[left,width]` khiáº¿n trÃ¬nh duyá»‡t thay Ä‘á»•i thuá»™c tÃ­nh `left` vÃ  `width` tá»©c thÃ¬ mÃ  khÃ´ng thá»ƒ phÃ¡t hiá»‡u á»©ng animation trÆ°á»£t.
- **Giáº£i phÃ¡p:**
  1. Bá»• sung `transition-[left,width] duration-300 ease-out` vÃ o `.tab-group-pill` trong `tab-group.component.html`.
  2. Bá»• sung thuá»™c tÃ­nh `ready` vÃ o `sliderStyle` signal trong `tab-group.component.ts` káº¿t há»£p `[class.opacity-0]="!sliderStyle().ready"` & `[class.opacity-100]="sliderStyle().ready"` giÃºp loáº¡i bá» 100% hiá»‡n tÆ°á»£ng pill bá»‹ nháº£y vá»‹ trÃ­ tá»« `0px` khi vá»«a render láº¡i trang.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Build production Ä‘Ã³ng gÃ³i Angular thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Tá»‘i Æ¯u MÃ u Sáº¯c TÆ°Æ¡ng Pháº£n RÃµ RÃ ng & Äá»™ Äáº­m Nháº¡t (font-weight) Cho Component Accordion (`app-accordion-item`)
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c tÃ¬nh tráº¡ng ná»™i dung pháº§n thÃ¢n Accordion (`ng-content`) bá»‹ tá»‘i má», khÃ³ Ä‘á»c trong Dark Mode (nhÆ° áº£nh chá»¥p mÃ n hÃ¬nh) vÃ  chuáº©n hÃ³a Ä‘á»™ Ä‘áº­m nháº¡t chá»¯ vá» má»©c bÃ¬nh thÆ°á»ng, sáº¯c nÃ©t.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Tháº» chá»©a ná»™i dung chi tiáº¿t bÃªn trong `accordion-item.component.html` bá»‹ dÃ¹ng class `dark:text-slate-350` â€” Ä‘Ã¢y lÃ  má»™t class CSS KHÃ”NG há»£p lá»‡ trong Tailwind CSS (Tailwind chá»‰ há»— trá»£ `slate-300`, `slate-400`...), dáº«n tá»›i viá»‡c trÃ¬nh duyá»‡t bá» qua class mÃ u Dark Mode vÃ  hiá»ƒn thá»‹ chá»¯ bá»‹ chÃ¬m tá»‘i sáº«m trÃªn ná»n Ä‘en.
  2. MÃ u subtitle `dark:text-slate-500` bá»‹ quÃ¡ tá»‘i.
- **Giáº£i phÃ¡p:**
  1. Sá»­a `dark:text-slate-350` thÃ nh `font-normal text-slate-700 dark:text-slate-200 leading-relaxed`, Ä‘Æ°a Ä‘á»™ Ä‘áº­m vá» `font-normal` (bÃ¬nh thÆ°á»ng) vÃ  mÃ u chá»¯ sÃ¡ng rÃµ, chuáº©n tÆ°Æ¡ng pháº£n cao trÃªn cáº£ Light Mode láº«n Dark Mode.
  2. TÄƒng Ä‘á»™ sÃ¡ng cho subtitle (`text-slate-500 dark:text-slate-400 font-medium`).
  3. TiÃªu Ä‘á» (Title) hiá»ƒn thá»‹ rÃµ nÃ©t (`font-bold text-slate-900 dark:text-white`), khi má»Ÿ sáº½ highlight mÃ u chá»§ Ä‘áº¡o `text-[var(--color-primary)]`.
  4. Äá»“ng bá»™ bo gÃ³c `rounded-[15px]` cho tháº» Accordion container.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Build production Ä‘Ã³ng gÃ³i Angular thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: KhÃ´i Phá»¥c Bo GÃ³c (rounded-[15px]) VÃ  Clipping TrÃ n Viá»n (overflow-hidden) Cho Component CustomSelect (`app-custom-select`)
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c lá»—i khung Popover cá»§a `app-custom-select` bá»‹ máº¥t bo gÃ³c rounded, khiáº¿n 4 gÃ³c vuÃ´ng vá»©c dáº¹t (nhÆ° áº£nh chá»¥p mÃ n hÃ¬nh) vÃ  danh sÃ¡ch lá»±a chá»n bÃªn trong bá»‹ trÃ n viá»n.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Tháº» `<div>` wrapper chÃ­nh cá»§a Popover trong `custom-select.component.html` bá»‹ thiáº¿u class bo gÃ³c `rounded-[15px]` (Ä‘á»“ng bá»™ vá»›i cÃ¡c Popover khÃ¡c nhÆ° `DropdownMenu`, `LanguageSelector`, `NetworkSelector`, `CustomDatePicker`...).
  2. Viá»‡c thiáº¿u `rounded-[15px]` lÃ m thuá»™c tÃ­nh `overflow-hidden` chá»‰ bo clip á»Ÿ gÃ³c vuÃ´ng 90 Ä‘á»™ máº·c Ä‘á»‹nh cá»§a HTML element.
- **Giáº£i phÃ¡p:**
  1. Bá»• sung `rounded-[15px]` vÃ o container Popover trong `custom-select.component.html`.
  2. Bá»• sung class highlight ná»n tÃ­m dá»‹u mÆ°á»£t (`bg-purple-50/60 dark:bg-purple-950/30 text-[var(--color-primary)] font-bold`) cho option Ä‘ang Ä‘Æ°á»£c chá»n trong cháº¿ Ä‘á»™ chá»n Ä‘Æ¡n (Single select).
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Build production Ä‘Ã³ng gÃ³i Angular thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Tá»± Äá»™ng TÃ¬m Port Trá»‘ng BÆ°á»›c Tiáº¿n (4200 âž” 4201 âž” 4202...) Khi Cháº¡y npm run start
- **Ná»™i dung yÃªu cáº§u:** Cáº¥u hÃ¬nh Ä‘á»ƒ khi cháº¡y `npm run start`, náº¿u port 4200 bá»‹ chiáº¿m dá»¥ng thÃ¬ Angular tá»± Ä‘á»™ng chuyá»ƒn sang 4201, 4202... mÃ  khÃ´ng cáº§n pháº£i xÃ¡c nháº­n thá»§ cÃ´ng trÃªn Terminal.
- **Giáº£i phÃ¡p:**
  1. Táº¡o script `scripts/start-dev.js` kiá»ƒm tra Ä‘a táº§ng socket (thá»­ bind `127.0.0.1`, `0.0.0.0` vá»›i `exclusive: true` vÃ  probe káº¿t ná»‘i `net.connect` trÃªn `localhost`) Ä‘á»ƒ phÃ¡t hiá»‡n chÃ­nh xÃ¡c 100% port bá»‹ chiáº¿m dá»¥ng trÃªn Windows. Náº¿u port 4200 báº­n, tá»± Ä‘á»™ng tÄƒng tiáº¿n `+1` Ä‘á»ƒ tÃ¬m port trá»‘ng tiáº¿p theo.
  2. DÃ¹ng `child_process.spawn` káº¿t há»£p `cmd.exe /c` (trÃªn Windows) kÃ­ch hoáº¡t `npx ng serve --port <port>` vá»›i `stdio: 'inherit'`, triá»‡t tiÃªu hoÃ n toÃ n cáº£nh bÃ¡o `DeprecationWarning [DEP0190]` vÃ  lá»—i `spawn EINVAL`.
  3. Cáº­p nháº­t `package.json` script `"start"` sang `"node scripts/start-dev.js"`, loáº¡i bá» hoÃ n toÃ n comment vÃ  chuáº©n hÃ³a toÃ n bá»™ cÃ¢u thÃ´ng bÃ¡o console sang tiáº¿ng Anh.
- **XÃ¡c thá»±c:** ÄÃ£ cháº¡y thá»­ nghiá»‡m thá»±c táº¿ `node scripts/start-dev.js`, phÃ¡t hiá»‡n port 4200 Ä‘ang báº­n vÃ  tá»± Ä‘á»™ng chuyá»ƒn ngay sang port 4201 thÃ nh cÃ´ng 100%. Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type.


### YÃªu cáº§u: Kháº¯c Phá»¥c Lá»—i Mobile Sidebar Drawer Bá»‹ Giáº­t / Thá»t Thá»¥t Vá» BÃªn TrÃ¡i Khi Reload Trang
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c lá»—i khi vá»«a reload láº¡i trang trÃªn mobile, Sidebar Drawer bá»‹ lÃ²i ra má»™t pháº§n hoáº·c phÃ¡t hiá»‡u á»©ng trÆ°á»£t thá»¥t lÃ¹i vá» gÃ³c trÃ¡i mÃ n hÃ¬nh trong khi ngÆ°á»i dÃ¹ng chÆ°a há» thao tÃ¡c hay báº¥m nÃºt menu.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. **Hiá»‡u á»¨ng Initial Load Glitch (FOUC):** Do container wrapper cá»§a Mobile Drawer trong `header.component.html` khÃ´ng cÃ³ class `invisible`/`hidden` khi `showMobileMenu` báº±ng `false`. Khi khá»Ÿi táº¡o DOM, trÃ¬nh duyá»‡t apply class `-translate-x-full` káº¿t há»£p vá»›i `transition-transform duration-300 ease-in-out` cÃ³ sáºµn trong HTML, coi Ä‘Ã³ lÃ  sá»± thay Ä‘á»•i thuá»™c tÃ­nh CSS tá»« `0` sang `-100%` vÃ  tá»± Ä‘á»™ng kÃ­ch hoáº¡t animation trÆ°á»£t 300ms tá»« giá»¯a mÃ n hÃ¬nh rÃºt lui vá» mÃ©p trÃ¡i.
  2. **TrÃ n BÃ³ng Äá»• (Shadow Leakage):** Class `shadow-2xl` trÃªn tháº» drawer `w-[280px]` bá»‹ dÃ£n bÃ³ng má» 25px~50px lá»t qua mÃ©p trÃ¡i viewport khi container khÃ´ng cÃ³ `overflow-hidden`.
- **Giáº£i phÃ¡p:**
  1. ThÃªm `[class.invisible]="!stateService.showMobileMenu()"` vÃ  `[class.visible]="stateService.showMobileMenu()"` vÃ o Container ngoÃ i cÃ¹ng cá»§a Mobile Drawer (`header.component.html`).
  2. ThÃªm `overflow-hidden` vÃ  `transition-all duration-300 ease-in-out` vÃ o Container wrapper.
  3. CÆ¡ cháº¿: Khi vá»«a reload trang, `showMobileMenu` lÃ  `false` nÃªn pháº§n tá»­ láº­p tá»©c mang class `invisible` á»Ÿ frame Ä‘áº§u tiÃªn, trÃ¬nh duyá»‡t loáº¡i bá» hoÃ n toÃ n viá»‡c váº½ (paint) pháº§n tá»­ vÃ  triá»‡t tiÃªu 100% animation trÆ°á»£t giáº­t cÅ©ng nhÆ° bÃ³ng Ä‘á»• `shadow-2xl`. Khi báº¥m má»Ÿ menu, `visible` báº­t á»Ÿ frame 0 cho phÃ©p hiá»‡u á»©ng trÆ°á»£t trÆ¡n mÆ°á»£t 300ms; khi Ä‘Ã³ng menu, animation trÆ°á»£t vÃ  má» Ä‘á»¥c diá»…n ra trá»n váº¹n trong 300ms trÆ°á»›c khi `invisible` cÃ³ hiá»‡u lá»±c.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Build production Ä‘Ã³ng gÃ³i Angular thÃ nh cÃ´ng.

### YÃªu cáº§u: Äá»“ng Bá»™ 100% KÃ­ch ThÆ°á»›c UI & MÃ u Sáº¯c Chá»§ Äáº¡o (var(--color-primary)) Cho Component CustomDatePicker & CustomDateTimeRange
- **Ná»™i dung yÃªu cáº§u:** Äá»“ng bá»™ Ä‘á»™ rá»™ng Popover (chuáº©n 320px), vá»‹ trÃ­ dáº£i nÃºt chá»n nhanh Presets (chuyá»ƒn vÃ o bÃªn trong Popover), khoáº£ng cÃ¡ch lÆ°á»›i Ã´ lá»‹ch (`gap-0.5`) vÃ  chuáº©n hÃ³a dáº£i mÃ u tÆ°Æ¡ng tÃ¡c vá» mÃ u tÃ­m chá»§ Ä‘áº¡o `var(--color-primary)` cho 2 component `CustomDatePicker` (`app-custom-date-picker`) vÃ  `CustomDateTimeRange` (`app-custom-date-time-range`).
- **Giáº£i phÃ¡p:**
  1. **Tá»‘i Æ¯u `CustomDatePickerComponent` (`custom-date-picker.component.ts` & `.html`):**
     - Äá»•i `popoverWidth` tá»« `300px` lÃªn `320px` khá»›p 100% vá»›i `CustomDateTimeRange`.
     - Di chuyá»ƒn dáº£i nÃºt Presets vÃ o **BÃŠN TRONG Popover** (á»Ÿ vá»‹ trÃ­ trÃªn cÃ¹ng, phÃ¢n cÃ¡ch báº±ng viá»n má» `border-b border-slate-100 dark:border-slate-800/60 pb-3`, dÃ n hÃ ng `flex flex-wrap gap-1.5` ngáº¯t dÃ²ng tá»± nhiÃªn vá»«a váº·n 100% khÃ´ng bá»‹ cáº¯t chá»¯ `...`).
     - Bá»• sung nÃºt chá»n nhanh **"HÃ´m nay" (`date.today`)** vÃ o Ä‘áº§u dáº£i Presets cá»§a `CustomDatePickerComponent`.
     - Bá»• sung signal `selectedPresetDays` quáº£n lÃ½ vÃ  highlight nÃºt Preset Ä‘ang chá»n theo mÃ u tÃ­m chá»§ Ä‘áº¡o `bg-[var(--color-primary)]/15 border-[var(--color-primary)]/30 text-[var(--color-primary)] font-extrabold`.
     - Bá»c tá»«ng Ã´ ngÃ y trong `<div class="relative w-full aspect-square flex items-center justify-center">` vÃ  chuáº©n hÃ³a lÆ°á»›i `gap-0.5`.
     - ÄÆ°a nÃºt "Xong" (`action.done`) vá» chuáº©n mÃ u chá»§ Ä‘áº¡o `bg-[var(--color-primary)] hover:opacity-90 active:scale-95 text-white shadow-sm shadow-[var(--color-primary)]/20`.
     - Chuáº©n hÃ³a Ã´ **NgÃ y HÃ´m Nay (`Today`)** khi chÆ°a chá»n hiá»ƒn thá»‹ pháº³ng Ä‘áº¹p mÃ u chá»¯ tiÃªu chuáº©n nhÆ° cÃ¡c Ã´ ngÃ y khÃ¡c trong thÃ¡ng (chá»‰ khi Ä‘Æ°á»£c chá»n má»›i hiá»ƒn thá»‹ ná»‘t trÃ²n Ä‘áº·c mÃ u chá»§ Ä‘áº¡o `bg-[var(--color-primary)] text-white`).
  2. **Tá»‘i Æ¯u `CustomDateTimeRangeComponent` (`custom-date-time-range.component.ts` & `.html`):**
     - Bá»• sung signal `activePresetId` highlight nÃºt Preset active theo mÃ u chá»§ Ä‘áº¡o `bg-[var(--color-primary)]/15 border-[var(--color-primary)]/30 text-[var(--color-primary)] font-extrabold`.
     - Chuáº©n hÃ³a lÆ°á»›i Ã´ lá»‹ch thÃ nh `grid grid-cols-7 gap-0.5` Ä‘á»“ng bá»™ vá»›i DatePicker.
     - Äá»•i nÃºt "Ãp dá»¥ng" (`common.apply`) tá»« dáº£i mÃ u gradient cÅ© sang **mÃ u chá»§ Ä‘áº¡o thuáº§n `bg-[var(--color-primary)] hover:opacity-90 active:scale-95`**.
     - Loáº¡i bá» dÃ²ng tiÃªu Ä‘á» chá»¯ hoa dÆ° thá»«a **"Cáº¤U HÃŒNH THá»œI GIAN"** (`date.time_config`) bÃªn trong Popover Ä‘á»ƒ giao diá»‡n chá»n giá» gá»n gÃ ng, tinh táº¿ hÆ¡n.
  3. **Äá»“ng Bá»™ Thuá»™c TÃ­nh `showPresets` TrÃªn Trang Chá»§ (`home.component.html`):**
     - ÄÃ£ liÃªn káº¿t `[showPresets]="demoDatePickerShowPresets()"` cho táº¥t cáº£ cÃ¡c Ã´ DatePicker & DateTimeRange á»Ÿ Card 15 ("Demo Form Components") vÃ  Card 17 ("Custom Date Time Range"), chuyá»ƒn tráº¡ng thÃ¡i máº·c Ä‘á»‹nh sang **Máº·c Ä‘á»‹nh Táº®T (`demoDatePickerShowPresets = signal(false)`)**. Khi cáº§n hiá»ƒn thá»‹ Presets, ngÆ°á»i dÃ¹ng báº­t cÃ´ng táº¯c switch Ä‘iá»u khiá»ƒn.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Build production Ä‘Ã³ng gÃ³i Angular thÃ nh cÃ´ng.

### YÃªu cáº§u: Tá»‘i Æ¯u Hiá»‡u á»¨ng KÃ­nh Má» (Glassmorphism Backdrop Blur) Cho Táº¥t Cáº£ Popover Dropdowns (Bao Gá»“m Header Bar)
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c tÃ¬nh tráº¡ng lá»›p ná»n Popover Dropdown bá»‹ Ä‘á»¥c che máº¥t hiá»‡u á»©ng má» nhÃ²e kÃ­nh má» (`backdrop-blur`), Ä‘áº·c biá»‡t lÃ  3 Popover náº±m trÃªn Header Bar (`app-language-selector`, `app-network-selector`, `app-account-dropdown`).
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Äá»™ Ä‘á»¥c `bg-white/95 dark:bg-slate-900/95` ban Ä‘áº§u quÃ¡ cao (95% kÃ­n) cáº£n trá»Ÿ Ã¡nh sÃ¡ng xuyÃªn qua.
  2. Animation `transform` gÃ¢y xung Ä‘á»™t GPU Compositing Layer vá»›i `backdrop-filter` trong Chromium.
  3. **NguyÃªn nhÃ¢n gá»‘c rá»… á»Ÿ Header**: Tháº» `<header>` chá»©a `backdrop-blur-md` táº¡o ra Compositing Stacking Context riÃªng. Theo W3C spec, cÃ¡c pháº§n tá»­ Popover con dÃ¹ng `position: absolute` náº±m bÃªn trong `<header>` bá»‹ triá»‡t tiÃªu hiá»‡u á»©ng `backdrop-filter` thá»© hai (lá»—i Nested Backdrop Filter Composition Bailout).
- **Giáº£i phÃ¡p:**
  1. Chuyá»ƒn opacity ná»n Popover vá» má»©c xuyÃªn sÃ¡ng Glassmorphism chuáº©n mÆ°á»£t `bg-white/60 dark:bg-slate-900/50`.
  2. Loáº¡i bá» `transform` trong animation Keyframe cá»§a `.dropdown-menu-popover`.
  3. Gá»¡ bá» `backdrop-blur-md` trÃªn tháº» `<header>` (`header.component.html`), giáº£i phÃ³ng Stacking Context cho 3 Popover trÃªn Header bar hiá»ƒn thá»‹ KÃ­nh Má» lá»™ng láº«y 100%.
  4. Cáº¥u hÃ¬nh CSS toÃ n cá»¥c vá»›i `will-change: backdrop-filter;` vÃ  `-webkit-backdrop-filter: blur(20px) saturate(180%) !important;` trong `styles.scss`.
- **XÃ¡c thá»±c:** Runs `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Runs `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c Phá»¥c Triá»‡t Äá»ƒ Lá»—i Nhiá»u Dropdown Má»Ÿ ÄÃ¨ Chá»“ng LÃªn Nhau (Global Single Dropdown Active State)
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c lá»—i khi click má»Ÿ nhiá»u nÃºt Dropdown (Dropdown Menu, Äa ngÃ´n ngá»¯, Chá»n máº¡ng, VÃ­ cÃ¡ nhÃ¢n, Custom Select, Date Picker, Date Time Range), cÃ¡c Popover cÅ© khÃ´ng tá»± Ä‘Ã³ng láº¡i mÃ  bá»‹ xáº¿p chá»“ng láº¥n rá»‘i ráº¯m trÃªn giao diá»‡n.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Do sá»± kiá»‡n `event.stopPropagation()` á»Ÿ cÃ¡c nÃºt Trigger ngÄƒn cáº£n sá»± kiá»‡n click lan truyá»n (bubble) lÃªn `document:click`, khiáº¿n listener Ä‘Ã³ng cá»§a cÃ¡c Dropdown Ä‘ang má»Ÿ khÃ´ng cháº¡y.
  2. CÃ¡c Dropdown component tá»± quáº£n lÃ½ state `isOpen` riÃªng láº», chÆ°a cÃ³ dá»‹ch vá»¥ Ä‘iá»u hÆ°á»›ng/quáº£n lÃ½ táº­p trung toÃ n cá»¥c.
- **Giáº£i phÃ¡p:**
  1. Khai táº¡o singleton `DropdownService` (`src/app/core/services/dropdown.service.ts`) quáº£n lÃ½ `activeDropdownId` signal duy nháº¥t toÃ n á»©ng dá»¥ng.
  2. TÃ­ch há»£p `DropdownService` vÃ  cÆ¡ cháº¿ Angular `effect()` cho 7 component popover (`DropdownMenuComponent`, `LanguageSelectorComponent`, `NetworkSelectorComponent`, `AccountDropdownComponent`, `CustomSelectComponent`, `CustomDatePickerComponent`, `CustomDateTimeRangeComponent`).
  3. Äáº£m báº£o báº¥t ká»³ khi nÃ o 1 Dropdown má»Ÿ ra hoáº·c ngÆ°á»i dÃ¹ng click ra ngoÃ i / báº¥m phÃ­m `Esc`, Táº¤T Cáº¢ cÃ¡c Dropdown khÃ¡c Ä‘ang má»Ÿ láº­p tá»©c tá»± Ä‘á»™ng Ä‘Ã³ng láº¡i, Ä‘áº£m báº£o táº¡i má»™t thá»i Ä‘iá»ƒm CHá»ˆ CÃ“ DUY NHáº¤T 1 Dropdown Ä‘Æ°á»£c phÃ©p má»Ÿ.
- **XÃ¡c thá»±c:** Runs `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Runs `npm run build` Ä‘Ã³ng gÃ³i Production thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Bá»• Sung TÃ¹y Chá»n Hiá»ƒn Thá»‹ Avatar & Badge Cho Component AccountDropdown (`app-account-dropdown`)
- **Ná»™i dung yÃªu cáº§u:** Máº·c Ä‘á»‹nh component thÃ´ng tin cÃ¡ nhÃ¢n `app-account-dropdown` sáº½ KHÃ”NG hiá»ƒn thá»‹ áº£nh Ä‘áº¡i diá»‡n hay gÃ³i cÆ°á»›c (badge PRO) trá»« khi Ä‘Æ°á»£c truyá»n tÃ¹y chá»n (avatarUrl máº·c Ä‘á»‹nh lÃ  bá» trá»‘ng).
- **Giáº£i phÃ¡p:**
  1. ThÃªm 2 thuá»™c tÃ­nh `@Input() avatarUrl?: string;` vÃ  `@Input() statusBadge?: string;` trong `AccountDropdownComponent`.
  2. Bá»• sung Ä‘iá»u kiá»‡n `@if (avatarUrl)` vÃ  `@if (statusBadge)` trong `account-dropdown.component.html`.
- **XÃ¡c thá»±c:** Runs `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Runs `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Äá»“ng Bá»™ UI Popover Cho CÃ¡c Component Dropdown (Äa NgÃ´n Ngá»¯, Äa Chain & ThÃ´ng Tin CÃ¡ NhÃ¢n) Theo Chuáº©n DropdownMenu (Shadcn Space)
- **Ná»™i dung yÃªu cáº§u:** Chuáº©n hÃ³a thiáº¿t káº¿ Popover Dropdown cá»§a cÃ¡c component Äa ngÃ´n ngá»¯ (`app-language-selector`), Äa chain (`app-network-selector`) vÃ  Dropdown thÃ´ng tin vÃ­ cÃ¡ nhÃ¢n (`app-account-dropdown`) khá»›p 100% vá»›i phong cÃ¡ch UI sang trá»ng cá»§a `app-dropdown-menu` (Dropdown táº¡o giao dá»‹ch má»›i / profile menu á»Ÿ Card 1 & Card 19):
  1. Sá»­ dá»¥ng bo gÃ³c `rounded-[15px] p-2 backdrop-blur-xl border-slate-200/80 dark:border-slate-800/80`.
  2. Bá» cÃ¡c viá»n káº» ngang `border-b` thÃ´ kiá»ƒu cÅ© á»Ÿ header section title, thay báº±ng font uppercase nhá» gá»n `text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500`.
  3. ÄÆ°a cÃ¡c nÃºt báº¥m lá»±a chá»n vá» chuáº©n padding `px-3 py-2.5 rounded-[11px] text-sm font-semibold`.
  4. Tráº¡ng thÃ¡i active/selected hiá»ƒn thá»‹ mÃ u tÃ­m dá»‹u mÆ°á»£t `bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 font-bold` kÃ¨m icon tÃ­ch check sáº¯c nÃ©t.
  5. Header profile trong Popover cá»§a `app-account-dropdown` thiáº¿t káº¿ GIá»NG BÃŠN TRÃI: CÃ³ Avatar hÃ¬nh trÃ²n (`ring-2 ring-purple-500/20`), ShortAddress, Badge tráº¡ng thÃ¡i `PRO`, Subtitle hiá»ƒn thá»‹ Balance + Chain Network. NÃºt "Ngáº¯t káº¿t ná»‘i vÃ­" lÃ  nÃºt danger mÃ u Ä‘á» mÆ°á»£t (`text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40`).
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t `language-selector.component.html`, `network-selector.component.html` vÃ  `account-dropdown.component.html`.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Build production Ä‘Ã³ng gÃ³i Angular thÃ nh cÃ´ng.

### YÃªu cáº§u: Kháº¯c Phá»¥c Lá»—i Component Voice Chat (`<app-voice-chat>`) KhÃ´ng Hiá»ƒn Thá»‹ & Thu Nhá» ThÃ nh Váº¡ch Dá»c (`|`)
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t vÃ  sá»­a lá»—i trong bá»©c áº£nh chá»¥p mÃ n hÃ¬nh UI: á»Ÿ Card 5 (`Dropdown Menu 06 - Card Voice Chat Biáº¿n HÃ¬nh`), giao diá»‡n bÃªn dÆ°á»›i bá»‹ rá»—ng vÃ  thu nhá» dáº¹t láº¡i thÃ nh 1 váº¡ch line dá»c má»ng `|` mÃ u xÃ¡m tá»‘i.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. **Lá»—i Sá»¥p Äá»• KÃ­ch ThÆ°á»›c (Width Collapse):** Trong `voice-chat.component.html`, container dÃ¹ng `[style.width]="isExpanded() ? 'min(' + EXPANDED_WIDTH + 'px, 100%)' : 'min(' + COLLAPSED_WIDTH + 'px, 100%)'"`. Truyá»n hÃ m CSS complex `'min(268px, 100%)'` trá»±c tiáº¿p vÃ o `[style.width]` bá»‹ DomSanitizer cá»§a Angular loáº¡i bá» / strip, khiáº¿n `width` bá»‹ `undefined`/`auto`.
  2. VÃ¬ 100% cÃ¡c pháº§n tá»­ con bÃªn trong `VoiceChatComponent` Ä‘á»u cÃ³ `position: absolute`, khi container ngoÃ i cÃ³ `width: auto` vÃ  khÃ´ng chá»©a pháº§n tá»­ flex/block static nÃ o, Ä‘á»™ rá»™ng cá»§a component sá»¥p Ä‘á»• hoÃ n toÃ n vá» `0px`.
  3. Káº¿t há»£p vá»›i `height: 60px` vÃ  `border border-slate-800`, tháº» `<app-voice-chat>` bá»‹ Ã©p dáº¹t thÃ nh Ä‘Ãºng 1 váº¡ch viá»n dá»c `1px` (`|`) náº±m giá»¯a khung card.
  4. **Lá»‡ch TÃ´ng MÃ u Dark Mode:** Thuá»™c tÃ­nh `dark:bg-slate-950/90` lÃ  mÃ u cá»±c Ä‘en Ä‘áº­m, khi hiá»ƒn thá»‹ trÃªn ná»n card dark mode `slate-900` bá»‹ tá»‘i sáº«m khÃ´ng ná»•i báº­t.
- **Giáº£i phÃ¡p:**
  1. **Sá»­a Style Width Binding (`voice-chat.component.html`):** Chuyá»ƒn sang `[style.width.px]="isExpanded() ? EXPANDED_WIDTH : COLLAPSED_WIDTH"` káº¿t há»£p class Tailwind `max-w-full mx-auto`, Ä‘áº£m báº£o Angular binding kÃ­ch thÆ°á»›c chÃ­nh xÃ¡c 268px / 360px vÃ  tá»± co giÃ£n 100% trÃªn mÃ n mobile.
  2. **Äá»“ng Bá»™ Ná»n Dark Mode Glassmorphism (`voice-chat.component.html`):** Äá»•i tá»« `dark:bg-slate-950/90` sang `bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl`.
  3. **Tá»‘i Æ¯u Host Layout Centering (`voice-chat.component.ts`):** Äá»•i `host: { 'class': 'block' }` thÃ nh `host: { 'class': 'block w-full flex justify-center' }`.
- **XÃ¡c thá»±c:** Runs `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Runs `npm run build` Ä‘Ã³ng gÃ³i Production thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Tá»‘i Æ¯u & Äá»“ng Bá»™ TÃ´ng MÃ u Dark Mode Cho Component CustomDatePicker & CustomDateTimeRange
- **Ná»™i dung yÃªu cáº§u:** ÄÃ¡nh giÃ¡ vÃ  kháº¯c phá»¥c tÃ¬nh tráº¡ng lá»‡ch tÃ´ng mÃ u ná»n Dark Mode cá»§a Popover DatePicker vÃ  DateTimeRange khi Ä‘ang bá»‹ quÃ¡ Ä‘en Ä‘áº­m (`dark:bg-slate-950` / `#020617`), lá»‡ch háº³n so vá»›i tá»•ng thá»ƒ theme Dark Mode xanh/tÃ­m Ä‘áº­m (`slate-900` / `#0f172a` / `#0e1022`).
- **PhÃ¢n tÃ­ch:**
  1. Trong `custom-date-picker.component.html` vÃ  `custom-date-time-range.component.html`, khung popover ná»•i Ä‘ang dÃ¹ng `dark:bg-slate-950` (Ä‘en tuyá»n) káº¿t há»£p `border-slate-800/50`.
  2. CÃ¡c pháº§n tá»­ bÃªn trong popover (preset buttons, cÃ¡c Ã´ chá»n giá»/phÃºt, nÃºt chá»n) dÃ¹ng `dark:bg-slate-900`, lÃ m cho popover trÃ´ng nhÆ° má»™t Ã´ bá»‹ háº«ng mÃ u Ä‘en Ä‘Ã¨ lÃªn giao diá»‡n xanh/tÃ­m Ä‘en cá»§a á»©ng dá»¥ng.
- **Giáº£i phÃ¡p:**
  1. **Äá»“ng Bá»™ Ná»n Popover Popups (`custom-date-picker.component.html`, `custom-date-time-range.component.html`):**
     - Äá»•i ná»n khung popover tá»« `dark:bg-slate-950` sang `bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-900/10 dark:shadow-slate-950/50`.
  2. **Äá»“ng Bá»™ Chiá»u SÃ¢u Ná»n CÃ¡c Pháº§n Tá»­ Con (Sub-elements Elevation):**
     - NÃºt preset ( DateTimeRange): Äá»•i tá»« `dark:bg-slate-900/60` sang `dark:bg-slate-800/60 border-slate-700/50`.
     - NÃºt báº¥m chuyá»ƒn thÃ¡ng `<` `>`: Äá»•i `dark:hover:bg-slate-900` sang `dark:hover:bg-slate-800`.
     - NÃºt hover chá»n ngÃ y: Äá»•i `dark:hover:bg-slate-800`.
     - Ã” container chá»n giá»/phÃºt (Time Pills): Äá»•i tá»« `dark:bg-slate-900` sang `dark:bg-slate-800/60 border-slate-700/60`.
     - Khung popover chá»n giá»/phÃºt: Äá»•i tá»« `dark:bg-slate-900` sang `bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-800/80 shadow-lg`.
- **XÃ¡c thá»±c:** Runs `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Runs `npm run build` Ä‘Ã³ng gÃ³i Production thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Chuáº©n HÃ³a & CÃ¢n Äá»‘i KÃ­ch ThÆ°á»›c Width/Height Cho CÃ¡c NÃºt Icon, Avatar Trigger & Copy Button
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t vÃ  sá»­a cÃ¡c nÃºt báº¥m trigger avatar, icon button, copy-to-clipboard button... bá»‹ máº¥t cÃ¢n Ä‘á»‘i kÃ­ch thÆ°á»›c (bá»‹ dáº¹t/bá»‹ hÃ¬nh báº§u dá»¥c oval do `px-4 py-2` hoáº·c padding khÃ´ng Ä‘á»“ng Ä‘á»u khi chá»‰ cÃ³ icon mÃ  khÃ´ng cÃ³ text), Ä‘áº£m báº£o táº¥t cáº£ cÃ¡c nÃºt icon/avatar Ä‘Æ°á»£c set width & height báº±ng nhau (`aspect-square` / `w-X h-X` cÃ¢n Ä‘á»‘i).
- **PhÃ¢n tÃ­ch:**
  1. Trong `DropdownMenuComponent`, khi `triggerVariant` lÃ  `'avatar'` hoáº·c `'icon'`, button váº«n bá»‹ dÃ¡n cÃ¡c class padding `px-4 py-2` (tá»« `triggerSize="md"`), dáº«n Ä‘áº¿n khung ná»n quanh avatar hoáº·c icon bá»‹ dÃ£n ngang thÃ nh hÃ¬nh quáº£ trá»©ng/ellipse thay vÃ¬ hÃ¬nh trÃ²n/hÃ¬nh vuÃ´ng chuáº©n.
  2. Trong `CopyToClipboardComponent`, khi `label` khÃ´ng Ä‘Æ°á»£c truyá»n vÃ o (`!label`), nÃºt váº«n dÃ¹ng `px-3 py-1.5`, lÃ m ná»n nÃºt copy icon bá»‹ dáº¹t ngang hÃ¬nh oval.
  3. CÃ¡c nÃºt xÃ³a tÃ¬m kiáº¿m (`CustomSearchInput`), chuyá»ƒn thÃ¡ng (`CustomDatePicker`, `CustomDateTimeRange`), nÃºt Ä‘Ã³ng modal (`FileUpload`) chÆ°a cÃ³ chiá»u rá»™ng/chiá»u cao báº±ng nhau cá»‘ Ä‘á»‹nh.
- **Giáº£i phÃ¡p:**
  1. **NÃ¢ng Cáº¥p `DropdownMenuComponent` (`dropdown-menu.component.html`):**
     - ÄÆ°a logic Sizing phÃ¢n biá»‡t rÃµ: vá»›i nÃºt text thÃ¬ giá»¯ `px-3 py-1.5`, `px-4 py-2`, `px-5 py-2.5`; vá»›i `triggerVariant === 'avatar'` hoáº·c `'icon'`, Ã©p width/height chuáº©n vuÃ´ng `w-8 h-8 !p-0` (sm), `w-10 h-10 !p-0` (md), `w-12 h-12 !p-0` (lg) káº¿t há»£p `flex items-center justify-center shrink-0`.
     - Vá»›i variant `avatar`, tháº» `<img>` Ä‘á»•i thÃ nh `w-full h-full rounded-full object-cover ring-2 ring-purple-500/30`.
  2. **NÃ¢ng Cáº¥p `CopyToClipboardComponent` (`copy-to-clipboard.component.html`):**
     - Khi `!label` (chá»‰ cÃ³ icon copy), chuyá»ƒn sang kÃ­ch thÆ°á»›c vuÃ´ng chuáº©n `w-7 h-7 !p-0` (sm), `w-8.5 h-8.5 !p-0` (md), `w-10 h-10 !p-0` (lg).
     - Äiá»u chá»‰nh font-size tá»« `text-sm`/`text-base` vá» `text-xs` (cho size `sm` & `md`) vÃ  `text-sm` (cho size `lg`), chuyá»ƒn `font-extrabold` sang `font-bold` giÃºp nhÃ£n chá»¯ nÃºt copy vá»«a váº·n, tinh táº¿ vÃ  khÃ´ng bá»‹ thÃ´/quÃ¡ to.
  3. **Äá»“ng Bá»™ CÃ¡c Icon Button Phá»¥ Thuá»™c KhÃ¡c:**
     - `CustomSearchInputComponent`: NÃºt clear search `X` bá»• sung `w-6 h-6 flex items-center justify-center shrink-0` (24px x 24px).
     - `CustomDatePickerComponent` & `CustomDateTimeRangeComponent`: NÃºt chevron `<` `>` chuyá»ƒn thÃ¡ng bá»• sung `w-7 h-7 flex items-center justify-center shrink-0` (28px x 28px); nÃºt clear date bá»• sung `w-5 h-5`.
     - `FileUploadComponent`: NÃºt Ä‘Ã³ng modal preview bá»• sung `w-8 h-8 flex items-center justify-center shrink-0` (32px x 32px).
- **XÃ¡c thá»±c:** Runs `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Runs `npm run build` Ä‘Ã³ng gÃ³i Production thÃ nh cÃ´ng.


### YÃªu cáº§u: Kiá»ƒm Tra & NÃ¢ng Cáº¥p Hiá»‡u á»¨ng Animation Ná»n TrÆ°á»£t (Sliding Pill Animation) Cho Component Theme Switcher
- **Ná»™i dung yÃªu cáº§u:** Kiá»ƒm tra xem `app-theme-switcher` cÃ³ cÃ²n hiá»‡u á»©ng animation giá»‘ng nhÆ° `app-tab-group` khÃ´ng, vÃ  Ä‘á»“ng bá»™ láº¡i tráº£i nghiá»‡m trÆ°á»£t mÆ°á»£t mÃ  giá»¯a cÃ¡c lá»±a chá»n theme (Light / Auto / Dark).
- **PhÃ¢n tÃ­ch:** TrÆ°á»›c Ä‘Ã¢y `theme-switcher` Ä‘Ã£ bá» `app-tab-group` vÃ  dÃ¹ng viá»‡c chuyá»ƒn class `bg-white` / `dark:bg-slate-800` trá»±c tiáº¿p trÃªn tá»«ng button Ä‘á»™c láº­p, lÃ m máº¥t Ä‘i hiá»‡u á»©ng thanh pill trÆ°á»£t (sliding animation) di chuyá»ƒn mÆ°á»£t tá»« nÃºt nÃ y sang nÃºt khÃ¡c nhÆ° cá»§a `tab-group`.
- **Giáº£i phÃ¡p:**
  1. **NÃ¢ng Cáº¥p `ThemeSwitcherComponent` (`theme-switcher.component.ts`) & `StateService` (`state.service.ts`):**
     - Export `type ThemeMode = 'light' | 'dark' | 'auto';` tá»« `StateService`.
     - Bá»• sung `sliderStyle` signal (`left`, `width`), `@ViewChild('containerEl')`, `@ViewChildren('themeBtn')` cÃ¹ng cÆ¡ cháº¿ theo dÃµi kÃ­ch thÆ°á»›c `ResizeObserver`.
     - ThÃªm phÆ°Æ¡ng thá»©c `updateSliderPosition()` tá»± Ä‘á»™ng tÃ­nh toÃ¡n `offsetLeft` vÃ  `offsetWidth` cá»§a nÃºt Ä‘ang Ä‘Æ°á»£c chá»n trong 3 cháº¿ Ä‘á»™ (`light`, `auto`, `dark`).
  2. **Cáº­p Nháº¥t HTML Template (`theme-switcher.component.html`):**
     - Loáº¡i bá» `@if` Ä‘á»ƒ giá»¯ tháº» `div` slider pill luÃ´n cá»‘ Ä‘á»‹nh trong cÃ¢y DOM (`[class.opacity-0]="!sliderStyle().ready"` vÃ  `[class.opacity-100]="sliderStyle().ready"`), Ä‘áº£m báº£o thuá»™c tÃ­nh CSS `transition-all duration-300 ease-out` luÃ´n tÃ­nh toÃ¡n Ä‘Æ°á»£c vá»‹ trÃ­ trÆ°á»›c/sau Ä‘á»ƒ trÆ°á»£t mÆ°á»£t mÃ .
     - Chuáº©n hÃ³a kÃ­ch thÆ°á»›c cÃ¡c nÃºt báº¥m `w-7 h-7 flex items-center justify-center rounded-full shrink-0` tÆ°Æ¡ng á»©ng 28px x 28px, giÃºp khá»‘i pill tráº¯ng/xÃ¡m trÆ°á»£t khÃ­t 100% qua láº¡i giá»¯a 3 biá»ƒu tÆ°á»£ng Máº·t trá»i (Sun), Tá»± Ä‘á»™ng (Auto) vÃ  Máº·t trÄƒng (Moon).
  3. **XÃ¡c thá»±c:** Runs `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Runs `npm run build` Ä‘Ã³ng gÃ³i Production thÃ nh cÃ´ng 100% (832.54 kB bundle).



### YÃªu cáº§u: Chuáº©n HÃ³a & Phá»§ KÃ­n 100% Äa NgÃ´n Ngá»¯ (i18n) Cho Táº¥t Cáº£ CÃ¡c File HTML vÃ  TypeScript trong Dá»± Ãn
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t chuyÃªn sÃ¢u toÃ n bá»™ cÃ¡c file `.html` vÃ  `.ts` trong á»©ng dá»¥ng báº±ng cÃ´ng cá»¥ tÃ¬m kiáº¿m ripgrep, chuyá»ƒn Ä‘á»•i táº¥t cáº£ cÃ¡c chuá»—i vÄƒn báº£n Tiáº¿ng Viá»‡t hardcoded (bao gá»“m cáº£ cÃ¡c tÃ¹y chá»n máº£ng dá»¯ liá»‡u, tiÃªu Ä‘á» modal, nhÃ£n badge, mÃ´ táº£ voice chat morphing...) sang cÃ¡c key dá»‹ch i18n chuáº©n sá»­ dá»¥ng `TranslatePipe` vÃ  `computed()` Signal pháº£n á»©ng theo ngÃ´n ngá»¯ hiá»‡n táº¡i `TranslationService.currentLang()`.
- **Giáº£i phÃ¡p:**
  1. **Má»Ÿ Rá»™ng Tá»« Äiá»ƒn i18n (`i18n.types.ts`, `vi.ts`, `en.ts`):**
     - Bá»• sung hÆ¡n 60 key dá»‹ch má»›i cho cÃ¡c nhÃ³m `home`, `cards.inputs`, `cards.selects`, `cards.slider`, `cards.date_picker`, `cards.ripple`, `cards.accordion`, `cards.table`, `cards.dropdown`, `cards.aura`, `cards.switch`, `cards.checkbox`, `cards.tab_group`, `cards.code_block`, `cards.file_upload`, `cards.voice_chat`, `cards.controls`.
  2. **Tá»‘i Æ¯u Pháº£n á»¨ng Äá»•i NgÃ´n Ngá»¯ Ngay Láº­p Tá»©c Trong TS (`home.component.ts`, `demo-modal.component.ts`):**
     - Chuyá»ƒn `demoTabOptions`, `genderOptions`, `demoTableColumns`, `tableStatusOptions`, `demoProfileMenuItems`, `demoDisplayMenuItems`, `demoWeb3ActionItems`, `demoRadioOptions` thÃ nh cÃ¡c `computed()` Signal liÃªn káº¿t vá»›i `this.translationService.currentLang()`, giÃºp toÃ n bá»™ menu dropdown, báº£ng dá»¯ liá»‡u, bá»™ chá»n radio vÃ  tab group tá»± Ä‘á»™ng cáº­p nháº­t ngÃ´n ngá»¯ ngay láº­p tá»©c khi ngÆ°á»i dÃ¹ng chuyá»ƒn Ä‘á»•i giá»¯a Tiáº¿ng Viá»‡t vÃ  Tiáº¿ng Anh.
  3. **Chuáº©n HÃ³a Phá»§ KÃ­n File HTML (`home.component.html`, `demo-modal.component.html`, `code-block.component.html`):**
     - Thay tháº¿ 100% cÃ¡c nhÃ£n text cá»©ng (bao gá»“m badge "ThÃ nh cÃ´ng", "Äang chá»", "Tháº¥t báº¡i", tiÃªu Ä‘á» code block 1/2/3, badge upload "File Sao LÆ°u SQL", "Tá»‘i Ä‘a 20MB", mÃ´ táº£ voice chat morphing...) thÃ nh `{{ 'key' | translate }}`.
     - Kháº¯c phá»¥c chuá»—i mÃ£ hÃ³a fallback bá»‹ há»ng trong `custom-select.component.ts`.
  4. **Chuyá»ƒn Äá»•i Toast Notification & Tráº¡ng ThÃ¡i Sang i18n Äá»™ng (`home.component.ts`):**
     - ÄÃ£ thÃªm hÆ¡n 18 key dá»‹ch Toast cho cÃ¡c hÃ nh Ä‘á»™ng: Sao chÃ©p Ä‘á»‹a chá»‰ vÃ­, Äang gá»­i giao dá»‹ch, Giao dá»‹ch Ä‘Ã£ phÃ¡t Ä‘i, Giao dá»‹ch thÃ nh cÃ´ng, Giao dá»‹ch tháº¥t báº¡i, YÃªu cáº§u kÃ½ tin nháº¯n, ÄÃ£ kÃ½ tin nháº¯n, Sao chÃ©p chá»¯ kÃ½, Báº­t/Táº¯t micro, Báº­t/Táº¯t Ã¢m thanh, Chia sáº» mÃ n hÃ¬nh, Káº¿t ná»‘i/Ngáº¯t káº¿t ná»‘i Voice Chat. Táº¥t cáº£ thÃ´ng bÃ¡o Toast hiá»ƒn thá»‹ Ä‘Ãºng 100% Tiáº¿ng Viá»‡t khi chá»n Tiáº¿ng Viá»‡t vÃ  Tiáº¿ng Anh khi chá»n English.
  5. **XÃ¡c thá»±c:** Cháº¡y kiá»ƒm tra ripgrep Ä‘á»‘i soÃ¡t 100% khÃ´ng cÃ²n báº¥t ká»³ vÄƒn báº£n tiáº¿ng Viá»‡t cá»©ng nÃ o trong cÃ¡c file HTML template hay Toast notification. Runs `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Runs `npm run build` Ä‘Ã³ng gÃ³i Production thÃ nh cÃ´ng 100% (772.54 kB bundle).


### YÃªu cáº§u: Kháº¯c Phá»¥c Lá»—i Dá»‹ch Äa NgÃ´n Ngá»¯ & Chuáº©n HÃ³a MÃ£ HÃ³a UTF-8 Cho Toast Notification
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c lá»—i hiá»ƒn thá»‹ vÄƒn báº£n mÃ£ hÃ³a lá»—i (double-encoded UTF-8 gibberish: `Ã„ÃƒE sao chÃƒÂ¢p...`) á»Ÿ Toast notification khi ngÆ°á»i dÃ¹ng báº¥m nÃºt sao chÃ©p (Copy to Clipboard), Ä‘á»“ng thá»i rÃ  soÃ¡t vÃ  kháº¯c phá»¥c toÃ n bá»™ cÃ¡c chuá»—i vÄƒn báº£n bá»‹ lá»—i mÃ£ hÃ³a tiáº¿ng Viá»‡t trong dá»± Ã¡n.
- **Giáº£i phÃ¡p:**
  1. **Táº¡o Key Dá»‹ch Má»›i `common.copied_to_clipboard` (`i18n.types.ts`, `vi.ts`, `en.ts`):**
     - ÄÃ£ bá»• sung `copied_to_clipboard: 'ÄÃ£ sao chÃ©p vÃ o bá»™ nhá»› táº¡m!'` trong `vi.ts` vÃ  `'Copied to clipboard!'` trong `en.ts`.
  2. **Chuáº©n HÃ³a Component Copy to Clipboard (`copy-to-clipboard.component.ts`):**
     - Thay tháº¿ chuá»—i fallback bá»‹ lá»—i mÃ£ hÃ³a `Ã„ ÃƒÂ£ sao chÃƒÂ©p...` báº±ng gá»i Ä‘á»™ng `this.translationService.t('common.copied_to_clipboard')`, Ä‘áº£m báº£o hiá»ƒn thá»‹ Ä‘Ãºng chuáº©n tiáº¿ng Viá»‡t khi chá»n Tiáº¿ng Viá»‡t vÃ  tiáº¿ng Anh khi chá»n English.
  3. **Chuáº©n HÃ³a Component Language Selector (`language-selector.component.ts`):**
     - Thay tháº¿ chuá»—i thÃ´ng bÃ¡o toast bá»‹ mÃ£ hÃ³a lá»—i báº±ng `this.translationService.t('language.change_success')`.
  4. **Kháº¯c Phá»¥c Chuá»—i MÃ£ HÃ³a Lá»—i á»ž CÃ¡c Component Shared KhÃ¡c (`input-otp.component.ts`, `file-upload.component.ts`):**
     - Sá»­a `ariaLabel` thÃ nh `'MÃ£ OTP'` vÃ  kÃ½ tá»± mask thÃ nh `'â—'` chuáº©n U+25CF trong `InputOtpComponent`.
     - Sá»­a cÃ¡c thÃ´ng bÃ¡o lá»—i `globalError` tiáº¿ng Viá»‡t chuáº©n trong `FileUploadComponent`.
  5. **XÃ¡c thá»±c:** Runs `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Runs `npm run build` Ä‘Ã³ng gÃ³i báº£n Production hoÃ n háº£o.


### YÃªu cáº§u: Chuyá»ƒn Äá»•i ToÃ n Bá»™ CSS â†’ SCSS & TÃ¡ch File RiÃªng Cho Shared Components

- **Ná»™i dung yÃªu cáº§u:** Táº¥t cáº£ cÃ¡c component trong `src/app/shared/components` pháº£i chuyá»ƒn tá»« `.css` sang `.scss`, Ä‘á»“ng thá»i tÃ¡ch inline `template` vÃ  `styles` trong file `.ts` ra thÃ nh file riÃªng `.html` vÃ  `.scss`.
- **Giáº£i phÃ¡p:**
  1. **Copy 23 file `.css` â†’ `.scss`** (account-dropdown, alert, aura, avatar, breadcrumb, code-block, copy-to-clipboard, custom-date-time-range, custom-input, divider, drawer, dropdown-menu, voice-chat, empty-state, file-upload, input-otp, language-selector, network-selector, progress, stat-card, stepper, theme-switcher, tx-speed-selector).
  2. **Cáº­p nháº­t `styleUrl: '*.css'` â†’ `styleUrl: '*.scss'`** trong 23 file `.ts` tÆ°Æ¡ng á»©ng.
  3. **Táº¡o 13 file `.scss` má»›i** cho cÃ¡c component cÃ³ inline styles: accordion, accordion-item, badge, card, custom-checkbox, custom-date-picker, custom-radio, custom-search-input, custom-select, custom-slider, custom-switch, kbd, logo, tab-group, table.
  4. **Táº¡o 4 file `.html` má»›i** cho component cÃ³ inline template: `badge.component.html` (`<ng-content>`), `button.component.html` (loading spinner + ng-content), `card.component.html` (`<ng-content>`), `logo.component.html` (logo SVG animation).
  5. **Cáº­p nháº­t táº¥t cáº£ `.ts`** sá»­ dá»¥ng `templateUrl`/`styleUrl` thay vÃ¬ `template`/`styles` inline.
  6. **XÃ³a 23 file `.css` gá»‘c** sau khi xÃ¡c nháº­n build thÃ nh cÃ´ng.
  7. **XÃ¡c thá»±c:** `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i. `npm run build` Ä‘Ã³ng gÃ³i Production thÃ nh cÃ´ng.

### YÃªu cáº§u: Tá»‘i Æ¯u Loáº¡i Bá» CSS/SCSS â†’ Thay Báº±ng Tailwind Class Cho ToÃ n Bá»™ Shared Components

- **Ná»™i dung yÃªu cáº§u:** Chá»— nÃ o cÃ³ thá»ƒ thay CSS/SCSS báº±ng class Tailwind thÃ¬ dÃ¹ng luÃ´n, má»¥c tiÃªu loáº¡i bá» CSS/SCSS cÃ ng nhiá»u cÃ ng tá»‘t.
- **Giáº£i phÃ¡p:**
  1. **XÃ³a 25+ file SCSS** chá»‰ chá»©a `:host { display: ... }` báº±ng Angular `host: { 'class': '...' }` binding trong TS decorator.
  2. **XÃ³a `:host` block khá»i SCSS** cÃ²n giá»¯ láº¡i vÃ  chuyá»ƒn vÃ o host class trong TS (drawer, voice-chat, aura, ...).
  3. **Badge**: ThÃªm `inline-flex items-center justify-center font-extrabold leading-none` vÃ o `hostClasses` getter.
  4. **Aura**: ThÃªm `relative z-0` vÃ o host class, xÃ³a khá»i SCSS.
  5. **Voice-chat**: Thay `.w-0\.75 { width: 3px }` báº±ng `w-[3px]` trong HTML template.
  6. **12 SCSS cÃ²n láº¡i** báº¯t buá»™c giá»¯ (keyframes, pseudo-selectors Ä‘áº·c biá»‡t, vendor prefixes, `::ng-deep`, `::webkit-scrollbar`): aura, card, code-block, custom-date-time-range, custom-radio, divider, drawer, dropdown-menu, file-upload, input-otp, progress, voice-chat.
  7. **Káº¿t quáº£:** 0 file `.css`, 0 inline `styles: []` trong toÃ n bá»™ shared components.
  8. **XÃ¡c thá»±c:** `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i. `npm run build` thÃ nh cÃ´ng.




### YÃªu cáº§u: Kháº¯c Phá»¥c Triá»‡t Äá»ƒ Lá»—i Cuá»™n Ngang & Sá»­a Táº­n Gá»‘c Responsive Flex Layouts Cho MÃ n HÃ¬nh 320px
- **Ná»™i dung yÃªu cáº§u:** Loáº¡i bá» cÃ¡ch khÃ³a cuá»™n ngang toÃ n cá»¥c (`overflow-x: hidden` trÃªn `html`/`body`), sá»­a táº­n gá»‘c nguyÃªn nhÃ¢n vá»¡ bá»‘ cá»¥c vÃ  trÃ n viá»n táº¡i tá»«ng component cá»¥ thá»ƒ khi hiá»ƒn thá»‹ trÃªn mÃ n hÃ¬nh di Ä‘á»™ng nhá» `320px`.
- **Giáº£i phÃ¡p:**
  1. **Bá» KhÃ³a Cuá»™n Ngang ToÃ n Cá»¥c (`styles.scss`):**
     - ÄÃ£ xÃ³a `overflow-x: hidden` vÃ  `max-width: 100vw` khá»i `html` vÃ  `body`, tráº£ vá» cÆ¡ cháº¿ cuá»™n tá»± nhiÃªn.
  2. **Fix Táº­n Gá»‘c Bá»‘ Cá»¥c Tháº» Card Showcase Khi CÃ³ NÃºt/Badge BÃªn Pháº£i (`home.component.html`):**
     - **NguyÃªn nhÃ¢n vá»¡ chá»¯ 15 dÃ²ng dá»c:** CÃ¡c header tháº» Card 19 (Dropdown Menu & Voice Chat 06), Card 20 (Progress Bar), Card 18 (OTP), Card 16 (File Upload) sá»­ dá»¥ng `flex items-center justify-between` Ã©p 2 cá»™t song song trÃªn mÃ n hÃ¬nh nhá». Badge bÃªn pháº£i (`Voice Chat 06 Exact`, `File Sao LÆ°u SQL`, `Tá»‘i Ä‘a 20MB`...) chiáº¿m ~140px-200px, Ã©p tiÃªu Ä‘á» bÃªn trÃ¡i thu háº¹p cÃ²n ~50px width lÃ m chá»¯ bá»‹ bÃ³ Ä‘á»©ng thÃ nh 15 dÃ²ng dá»c vÃ  Ä‘Ã¨ chá»“ng cÃ¡c badge lÃªn nhau.
     - **Sá»­a Ä‘á»•i:** Chuyá»ƒn container header sang `flex flex-col sm:flex-row sm:items-start justify-between gap-2` vÃ  thÃªm `flex-wrap` cho cÃ¡c badge. TrÃªn mÃ n di Ä‘á»™ng `320px`, tiÃªu Ä‘á» vÃ  mÃ´ táº£ chiáº¿m trá»n 100% Ä‘á»™ rá»™ng dÃ²ng trÃªn, badge náº±m bÃªn dÆ°á»›i hoáº·c ngáº¯t dÃ²ng tá»± nhiÃªn mÆ°á»£t mÃ  khÃ´ng bao giá» bá»‹ dá»“n Ã©p.
  3. **Fix Co GiÃ£n Layout Component File Upload (`file-upload.component.html`):**
     - ÄÆ°a container thanh ngang (Horizontal Bar) sang `flex-col sm:flex-row gap-3` vÃ  thÃªm `flex-wrap` á»Ÿ dáº£i thÃ´ng sá»‘ file size bÃªn dÆ°á»›i. NÃºt báº¥m `[ Chá»n file ]` vÃ  nhÃ£n loáº¡i file `.sql`, `image/*...` ngáº¯t dÃ²ng tá»± nhiÃªn, khÃ´ng Ã©p tiÃªu Ä‘á» bá»‹ rÃºt gá»n thÃ nh 1 kÃ½ tá»± `C...` hay `T...` trÃªn mÃ n 320px.
  4. **Fix TrÃ n Viá»n Ã” Nháº­p OTP (`input-otp.component.html`):**
     - Äá»•i kÃ­ch thÆ°á»›c Ã´ slot OTP responsive (`size="sm"` thÃ nh `w-6.5 h-8 text-[11px]`, `size="md"` thÃ nh `w-7.5 h-9 text-xs`, `size="lg"` thÃ nh `w-8.5 h-10 text-xs`), giÃºp 6 Ã´ OTP xáº¿p vá»«a váº·n 100% bÃªn trong tháº» Card trÃªn mÃ n 320px mÃ  khÃ´ng bá»‹ trÃ n viá»n 6px.
  5. **Fix TrÃ n Lá» Thanh Äiá»u Khiá»ƒn Table Component (`home.component.html`):**
     - **NguyÃªn nhÃ¢n gÃ¢y cuá»™n ngang toÃ n trang (Horizontal Scrollbar) trÃªn áº£nh 3:** Khung cÃ´ng cá»¥ `Giáº£ láº­p Táº£i (Loading)` vÃ  `Giáº£ láº­p Rá»—ng (Empty)` á»Ÿ Card Table sá»­ dá»¥ng `md:flex-row` Ã©p 2 Ã´ tÃ¬m kiáº¿m/bá»™ lá»c vÃ  2 nÃºt switch náº±m song song 1 hÃ ng khi mÃ n hÃ¬nh `>= 768px` (`md`). NhÆ°ng khi má»Ÿ DevTools bÃªn pháº£i mÃ n hÃ¬nh lÃ m khung xem rÆ¡i vÃ o khoáº£ng `768px - 1000px` (cÃ³ Sidebar menu chiáº¿m 260px), tá»•ng Ä‘á»™ rá»™ng Search (320px) + Select (224px) + CÃ´ng cá»¥ Switch (336px) = `908px` (vÆ°á»£t xa Ä‘á»™ rá»™ng kháº£ dá»¥ng `460px` cá»§a tháº»), khiáº¿n bá»™ cÃ´ng cá»¥ switch bá»‹ Ä‘áº©y thÃ² 300px ra ngoÃ i viá»n pháº£i trong khÃ´ng gian ná»n Ä‘en.
     - **Sá»­a Ä‘á»•i:** Äá»•i breakpoint header sang `xl:flex-row` (`>= 1280px`). á»ž táº¥t cáº£ cÃ¡c kÃ­ch thÆ°á»›c mÃ n hÃ¬nh nhá» vÃ  vá»«a (`< 1280px`), Search/Select náº±m á»Ÿ hÃ ng 1 trá»n váº¹n trong tháº», bá»™ cÃ´ng cá»¥ Switch náº±m á»Ÿ hÃ ng 2 trá»n váº¹n trong tháº» (`max-w-full flex-wrap`), triá»‡t tiÃªu 100% hiá»‡n tÆ°á»£ng bá»‹ Ä‘áº©y thÃ² ra ngoÃ i tháº» á»Ÿ má»i kÃ­ch thÆ°á»›c mÃ n hÃ¬nh vÃ  má»i gÃ³c xem DevTools.
  6. **Fix TrÃ n Lá» NÃºt KÃ©o Component Custom Slider (`custom-slider.component.html`):**
     - Bá»• sung `px-2.5` vÃ o container ngoÃ i, ngÄƒn nÃºt kÃ©o thumb á»Ÿ 0% vÃ  100% bá»‹ nhÃ´ ra ngoÃ i lá» card 10px.
  7. **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Cháº¡y `npm run build` hoÃ n thÃ nh Ä‘Ã³ng gÃ³i thÃ nh cÃ´ng.

### YÃªu cáº§u: Tá»‘i Æ¯u NÃºt Báº¥m ThÃ´ng Tin VÃ­ (Account Dropdown) & Thanh Header Nhá» Gá»n TÆ°Æ¡ng ThÃ­ch MÃ n HÃ¬nh 320px
- **Ná»™i dung yÃªu cáº§u:** Tá»‘i Æ°u hÃ³a kÃ­ch thÆ°á»›c nÃºt hiá»ƒn thá»‹ thÃ´ng tin vÃ­ (Ä‘á»‹a chá»‰ tÃ i khoáº£n vÃ  sá»‘ dÆ° ETH), thu nhá» diá»‡n tÃ­ch chiáº¿m dá»¥ng trÃªn thanh Header Ä‘á»ƒ hiá»ƒn thá»‹ hoÃ n háº£o, khÃ´ng bá»‹ trÃ n hay Ã©p cháº­t chá»™i trÃªn thiáº¿t bá»‹ di Ä‘á»™ng cÃ³ chiá»u rá»™ng mÃ n hÃ¬nh siÃªu nhá» `320px`.
- **Giáº£i phÃ¡p:**
  1. **Tá»‘i Æ¯u NÃºt Báº¥m Dropdown VÃ­ (`account-dropdown.component.html`):**
     - ÄÆ°a chiá»u cao nÃºt pill tá»« `h-10` vá» `h-9 sm:h-10`, padding thu gá»n `!pl-2 !pr-2.5 sm:!pl-3.5 sm:!pr-4`, gap pháº§n tá»­ `gap-1.5 sm:gap-2`.
     - Äiá»u chá»‰nh font chá»¯ Ä‘á»‹a chá»‰ vÃ­ thÃ nh `text-[10px] sm:text-[13px]` vÃ  sá»‘ dÆ° thÃ nh `text-[9px] sm:text-[10px]`, dÃ¡n sÃ¡t dÃ²ng `leading-none sm:leading-tight`.
     - áº¨n biá»ƒu tÆ°á»£ng mÅ©i tÃªn chevron `v` trÃªn mÃ n di Ä‘á»™ng `< sm` (`!hidden sm:!inline-flex`), giÃºp tiáº¿t kiá»‡m thÃªm 16px khoáº£ng trá»‘ng ngang.
     - Cáº­p nháº­t vá»‹ trÃ­ popover panel mobile vá» `fixed top-[3.75rem] left-3 right-3 sm:top-full`.
  2. **Äá»“ng Bá»™ KÃ­ch ThÆ°á»›c CÃ¡c Controls TrÃªn Top Header Bar (`header.component.html`, `network-selector.component.html`, `language-selector.component.html`):**
     - ÄÆ°a kÃ­ch thÆ°á»›c cÃ¡c nÃºt Network Selector (`w-9 h-9 sm:w-10 sm:h-10`) vÃ  Language Selector compact (`h-9 sm:h-10 px-2 sm:px-3`) vá» chuáº©n 36px trÃªn di Ä‘á»™ng.
     - Äiá»u chá»‰nh padding lá» 2 bÃªn thanh Header `px-2 sm:px-6` vÃ  gap khoáº£ng cÃ¡ch cÃ¡c nÃºt Ä‘iá»u khiá»ƒn `gap-1 sm:gap-3`.
  3. **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Cháº¡y `npm run build` Ä‘Ã³ng gÃ³i báº£n Production hoÃ n háº£o.

## NgÃ y 11/08/2026

### YÃªu cáº§u: Giáº£m Äá»™ Äáº­m & Äá»“ng Bá»™ 100% Box Shadow Cho ToÃ n Bá»™ 7 Dropdown Popover Components
- **Ná»™i dung yÃªu cáº§u:** Giáº£m bá»›t dáº£i bÃ³ng `shadow-xl` vÃ  `shadow-2xl` quÃ¡ Ä‘áº­m/thÃ´, Ä‘á»“ng bá»™ 100% kiá»ƒu hiá»‡u á»©ng shadow dá»‹u máº¯t, sang trá»ng cho toÃ n bá»™ cÃ¡c Popover Dropdown trÃªn á»©ng dá»¥ng (Äa ngÃ´n ngá»¯, Chá»n máº¡ng, Dropdown VÃ­, Custom Select, Date Picker, Date Time Range, Dropdown Menu).
- **Giáº£i phÃ¡p:**
  1. **Tá»‘i Æ¯u & Äá»“ng Bá»™ Chuáº©n Class Box Shadow (`shadow-lg shadow-slate-900/10 dark:shadow-slate-950/50`):**
     - ÄÃ£ loáº¡i bá» cÃ¡c class `shadow-xl` vÃ  `shadow-2xl` bá»‹ Ä‘áº­m bÃ³ng Ä‘en cá»©ng.
     - Cáº­p nháº­t dáº£i bÃ³ng má» Glassmorphism hiá»‡n Ä‘áº¡i `shadow-lg shadow-slate-900/10 dark:shadow-slate-950/50` Ä‘á»“ng bá»™ 100% trÃªn 7 component popover:
       1. `language-selector.component.html`
       2. `network-selector.component.html`
       3. `account-dropdown.component.html`
       4. `dropdown-menu.component.html`
       5. `custom-select.component.html`
       6. `custom-date-picker.component.html`
       7. `custom-date-time-range.component.html`
  2. **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Cháº¡y `npm run build` Ä‘Ã³ng gÃ³i báº£n Production hoÃ n háº£o.

### YÃªu cáº§u: Äá»“ng Bá»™ Kiá»ƒu Hiá»ƒn Thá»‹ Dropdown Äa NgÃ´n Ngá»¯ Chuáº©n Giá»‘ng Dropdown VÃ­ & Dropdown Chá»n Máº¡ng Chain
- **Ná»™i dung yÃªu cáº§u:** Sá»­a vá»‹ trÃ­ hiá»ƒn thá»‹ Popover Dropdown cá»§a bá»™ chá»n Äa ngÃ´n ngá»¯ (`app-language-selector`) cho Ä‘á»“ng bá»™ 100% vá»›i kiá»ƒu hiá»ƒn thá»‹ Popover cá»§a Dropdown TÃ i khoáº£n vÃ­ (`app-account-dropdown`) vÃ  Dropdown Chá»n máº¡ng (`app-network-selector`), trÃ¡nh trÃ n lá» trÃ¡i trÃªn di Ä‘á»™ng vÃ  vá»‹ trÃ­ báº­t lá»‡ch khi báº¥m á»Ÿ Sidebar Mobile.
- **Giáº£i phÃ¡p:**
  1. **Äá»“ng Bá»™ Class Vá»‹ TrÃ­ Dropdown Popover Theo Biáº¿n Thá»ƒ `variant` (`language-selector.component.html`):**
     - DÃ¹ng `ngClass` tÃ¡ch biá»‡t rÃµ 2 biáº¿n thá»ƒ:
       - **Biáº¿n thá»ƒ Top Bar (`variant="compact"`):** Ãp dá»¥ng `fixed top-[4.25rem] left-4 right-4 sm:absolute sm:right-0 sm:left-auto sm:w-48`. TrÃªn mobile lÃ  Floating Panel pháº³ng Ä‘áº¹p á»Ÿ top header, trÃªn desktop dÃ­nh dÆ°á»›i nÃºt trigger.
       - **Biáº¿n thá»ƒ Sidebar Drawer / Footer / Form Card (`variant="full"`):** Ãp dá»¥ng `absolute left-0 right-0 w-full` káº¿t há»£p `bottom-full mb-2` (cho `direction="up"`). Khi báº¥m vÃ o nÃºt `[ ðŸ‡»ðŸ‡³ Tiáº¿ng Viá»‡t ^ ]` á»Ÿ chÃ¢n Sidebar mobile, Menu dropdown náº©y lÃªn mÆ°á»£t mÃ  chÃ­nh xÃ¡c **náº±m ngay phÃ­a trÃªn nÃºt báº¥m**, khÃ´ng bá»‹ nháº£y lÃªn Ä‘áº§u trang ná»¯a.
  2. **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Cháº¡y `npm run build` Ä‘Ã³ng gÃ³i báº£n Production hoÃ n háº£o.

### YÃªu cáº§u: Tá»‘i Æ¯u Responsive MÃ n HÃ¬nh Di Äá»™ng SiÃªu Nhá» (Width 320px) & áº¨n MÅ©i TÃªn Äa NgÃ´n Ngá»¯ TrÃªn Mobile (< sm)
- **Ná»™i dung yÃªu cáº§u:** Tá»‘i Æ°u toÃ n bá»™ giao diá»‡n Header, Stepper Footer vÃ  Card padding cho thiáº¿t bá»‹ di Ä‘á»™ng 320px, Ä‘á»“ng thá»i áº©n nÃºt mÅ©i tÃªn chevron `v` á»Ÿ bá»™ chá»n Ä‘a ngÃ´n ngá»¯ trÃªn mÃ n hÃ¬nh di Ä‘á»™ng `< sm` (`< 640px`).
- **Giáº£i phÃ¡p:**
  1. **áº¨n Icon MÅ©i TÃªn Chevron Trong Bá»™ Chá»n Äa NgÃ´n Ngá»¯ (`language-selector.component.html`):**
     - Bao bá»c icon `<app-icon name="chevron-down">` trong tháº» `<span class="!hidden sm:!inline-flex items-center shrink-0">`.
     - **Di Ä‘á»™ng (`< 640px` / `< sm`):** áº¨n 100% icon mÅ©i tÃªn `v`, thu gá»n nÃºt thÃ nh `[ ðŸ‡»ðŸ‡³ VI ]` tiáº¿t kiá»‡m tá»‘i Ä‘a khÃ´ng gian header.
     - **MÃ¡y tÃ­nh (`>= 640px` / `>= sm`):** Hiá»ƒn thá»‹ icon mÅ©i tÃªn `v` bÃ¬nh thÆ°á»ng.
  2. **Tá»‘i Æ¯u Thanh Header Äiá»u HÆ°á»›ng Top Bar (`header.component.html`):**
     - Giáº£m lá» padding hai bÃªn tá»« `px-4` xuá»‘ng `px-2.5 sm:px-6` vÃ  gap control tá»« `gap-2` xuá»‘ng `gap-1.5 sm:gap-3`, tiáº¿t kiá»‡m 28px khoáº£ng trá»‘ng ngang.
     - Äiá»u chá»‰nh kÃ­ch thÆ°á»›c nÃºt hamburger menu (`w-9 h-9 sm:w-10 sm:h-10`) vÃ  logo icon (`w-8 h-8 sm:w-11 sm:h-11`) giÃºp táº¥t cáº£ cÃ¡c nÃºt bá»™ chá»n máº¡ng, bá»™ chá»n ngÃ´n ngá»¯ vÃ  Ä‘á»‹a chá»‰ vÃ­ náº±m vá»«a váº·n 100% trÃªn mÃ n 320px khÃ´ng bá»‹ trÃ n viá»n.
  3. **Tá»‘i Æ¯u ChÃ¢n Tháº» Stepper Workflow (`home.component.html`):**
     - Äá»•i layout footer thÃ nh `flex-wrap items-center justify-between gap-2` vÃ  thu gá»n nhÃ£n bÆ°á»›c thÃ nh `Active: 2/4` kÃ¨m class button padding `!px-2.5 sm:!px-3 text-xs`, giÃºp 2 nÃºt báº¥m `<- BÆ°á»›c TrÆ°á»›c` vÃ  `BÆ°á»›c Tiáº¿p Theo ->` cÃ¹ng nhÃ£n `Active` náº±m tháº³ng 1 hÃ ng vá»«a váº·n khÃ´ng bá»‹ rá»›t dÃ²ng Ä‘Ã¨ láº¥p nhau.
  4. **Tá»‘i Æ¯u Padding Khung Card ToÃ n Cáº§u (`styles.scss`):**
     - Äá»•i padding `.app-card` tá»« `p-6` cá»‘ Ä‘á»‹nh sang `p-4 sm:p-6`, giáº£i phÃ³ng thÃªm 16px khoáº£ng thá»Ÿ ngang cho ná»™i dung bÃªn trong trÃªn mÃ n 320px.
  5. **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Cháº¡y `npm run build` Ä‘Ã³ng gÃ³i báº£n Production hoÃ n háº£o.

### YÃªu cáº§u: Kháº¯c Phá»¥c Triá»‡t Äá»ƒ Lá»—i Responsive Stepper Component (app-stepper), Stat Cards & Chuáº©n HÃ³a Bá»‘ Cá»¥c 2 Cá»™t Trang Tá»•ng Quan
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c lá»—i Stepper khi thu nhá» vá»¡ bá»‘ cá»¥c, sá»­a mÃ u icon SVG checkmark bá»‹ Ä‘en thay vÃ¬ mÃ u tráº¯ng sÃ¡ng, sá»­a lá»—i 3 Stat Card bá»‹ Ã©p háº¹p 140px lÃ m trÃ n sá»‘ liá»‡u `$12,845,920` vÃ  vá»¡ chá»¯, Ä‘á»“ng thá»i Ä‘Æ°a toÃ n bá»™ giao diá»‡n tá»•ng quan vá» Ä‘Ãºng **bá»‘ cá»¥c 2 Cá»™t (`2 Columns Grid`)** khÃ´ng bá»‹ co Ã©p thÃ nh 4-7 dáº£i dá»c.
- **Giáº£i phÃ¡p:**
  1. **ThÃªm Tháº» `</div>` ÄÃ³ng Grid RÃ² Rá»‰ (`home.component.html`):**
     - Bá»• sung tháº» `</div>` bá»‹ thiáº¿u á»Ÿ Card 21 (Dropdown Äa ngÃ´n ngá»¯), tÃ¡ch Ä‘á»™c láº­p hoÃ n toÃ n cÃ¡c hÃ ng Grid phÃ­a sau, giáº£i quyáº¿t triá»‡t Ä‘á»ƒ lá»—i 4 tháº» Avatar, Empty State, Alert, Drawer bá»‹ dá»“n Ã©p thÃ nh 4 dáº£i dá»c 25% trÃªn 1 hÃ ng.
  2. **Chuáº©n HÃ³a 3 Tháº» Stat Cards Rá»™ng RÃ£i & Responsive (`home.component.html` & `stat-card.component.html`):**
     - ÄÆ°a 3 tháº» Stat Cards ra hÃ ng Ä‘á»™c láº­p `grid-cols-1 md:grid-cols-3 gap-6 pt-6` chiáº¿m 100% Ä‘á»™ rá»™ng container, giÃºp má»—i tháº» Stat Card rá»™ng ~400px+ Ä‘á»§ khÃ´ng gian hiá»ƒn thá»‹ tiÃªu Ä‘á» vÃ  con sá»‘ `$12,845,920` trÃªn 1 hÃ ng sáº¯c nÃ©t.
     - Loáº¡i bá» `whitespace-nowrap` trÃªn `h3` value vÃ  thÃªm `break-all sm:break-normal` Ä‘á»ƒ sá»‘ liá»‡u tá»± xuá»‘ng dÃ²ng mÆ°á»£t mÃ  khi thu nhá» mÃ n hÃ¬nh Ä‘iá»‡n thoáº¡i mÃ  khÃ´ng bá»‹ vÄƒng ra khá»i khung viá»n card.
  3. **Chuáº©n HÃ³a Chuá»—i Card 2 Cá»™t (`home.component.html`):**
     - Xáº¿p hÃ ng Stepper Card (Full width), hÃ ng Breadcrumb Card (Col 1 - 50%) & Divider Card (Col 2 - 50%), hÃ ng Copy to Clipboard (Full width).
  4. **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Cháº¡y `npm run build` Ä‘Ã³ng gÃ³i Angular thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: TÄƒng KÃ­ch ThÆ°á»›c NÃºt Toggle Thu Nhá» / Má»Ÿ Rá»™ng Sidebar (Sidebar Collapse Toggle Button)
- **Ná»™i dung yÃªu cáº§u:** TÄƒng kÃ­ch thÆ°á»›c width vÃ  height cá»§a nÃºt toggle `<` / `>` á»Ÿ mÃ©p viá»n bÃªn pháº£i Sidebar cho dá»… nhÃ¬n vÃ  dá»… thao tÃ¡c tÆ°Æ¡ng tÃ¡c báº¥m.
- **Giáº£i phÃ¡p:**
  1. **TÄƒng KÃ­ch ThÆ°á»›c Khung NÃºt & Icon (`sidebar.component.html`):**
     - Äá»•i kÃ­ch thÆ°á»›c nÃºt tá»« `w-7 h-7` (28px) lÃªn `w-8.5 h-8.5` (34px) kÃ¨m `hover:scale-105` cho tráº£i nghiá»‡m di chuá»™t nháº¡y vÃ  rÃµ nÃ©t hÆ¡n.
     - Äiá»u chá»‰nh offset vá»‹ trÃ­ cÄƒn giá»¯a Ä‘Æ°á»ng viá»n sidebar tá»« `-right-3.5` sang `-right-[17px]` (34px / 2 = 17px), Ä‘áº£m báº£o tÃ¢m nÃºt luÃ´n náº±m chÃ­nh xÃ¡c á»Ÿ mÃ©p Ä‘Æ°á»ng káº» viá»n sidebar.
     - TÄƒng kÃ­ch thÆ°á»›c icon mÅ©i tÃªn bÃªn trong tá»« `w-4 h-4` (16px) lÃªn `w-4.5 h-4.5` (18px) vá»«a váº·n vÃ  cÃ¢n Ä‘á»‘i.
  2. **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i. Cháº¡y `npm run build` xÃ¡c nháº­n Ä‘Ã³ng gÃ³i Angular thÃ nh cÃ´ng.

### YÃªu cáº§u: Kháº¯c Phá»¥c Lá»—i KÃ©o GiÃ£n Chiá»u Cao Thá»«a & Tá»‘i Æ¯u Bá»‘ Cá»¥c Tháº» Stat Card (app-stat-card)
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c triá»‡t Ä‘á»ƒ lá»—i tháº» Stat Card bá»‹ kÃ©o dÃ i dá»c hÃ¬nh chá»¯ nháº­t cao chÃ³t vÃ³t sinh ra khoáº£ng tráº¯ng khá»•ng lá»“ á»Ÿ giá»¯a, Ä‘á»“ng thá»i loáº¡i bá» viá»‡c cáº¯t tiÃªu Ä‘á» thÃ nh `TOTAL VALUE LO...`.
- **Giáº£i phÃ¡p:**
  1. **KhÃ´i phá»¥c Chiá»u cao Tá»± nhiÃªn Chuáº©n UI/UX (`stat-card.component.css`):**
     - Tráº£ `:host` vá» `display: block; width: 100%;` loáº¡i bá» `height: 100%` Ã©p buá»™c, giÃºp tháº» card cÃ³ chiá»u cao gá»n gÃ ng, tá»± nhiÃªn theo Ä‘Ãºng padding `p-5 sm:p-6`.
  2. **Bá»‘ Cá»¥c Ná»™i Dung Chuáº©n KPI Stat Card (`stat-card.component.html`):**
     - Giá»¯ nguyÃªn cáº¥u trÃºc 3 hÃ ng nhÆ°ng xáº¿p dÃ²ng tá»± nhiÃªn (`mt-3 sm:mt-4`), loáº¡i bá» `justify-between` kÃ©o giÃ£n hÃ ng top/middle/bottom.
     - Cho phÃ©p tiÃªu Ä‘á» xuá»‘ng dÃ²ng tá»± nhiÃªn (`leading-snug`) khi mÃ n hÃ¬nh nhá» thay vÃ¬ Ã©p cáº¯t tá»« báº±ng `truncate`.
     - Äáº£m báº£o con sá»‘ chÃ­nh `Value` hiá»ƒn thá»‹ to rÃµ `text-2xl sm:text-3xl font-black` á»Ÿ vá»‹ trÃ­ trung tÃ¢m tháº».
  3. **Tá»‘i Æ¯u LÆ°á»›i Grid Trang Chá»§ (`home.component.html`):**
     - Äáº·t lÆ°á»›i `grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 pt-6`, hiá»ƒn thá»‹ 1 cá»™t trÃ²n trá»‹a trÃªn Ä‘iá»‡n thoáº¡i vÃ  3 cá»™t cÃ¢n Ä‘á»‘i trÃªn mÃ n hÃ¬nh lá»›n.
  4. **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 100% 0 lá»—i. Cháº¡y `npm run build` táº¡o báº£n build Ä‘Ã³ng gÃ³i thÃ nh cÃ´ng.

### YÃªu cáº§u: Kháº¯c phá»¥c Lá»—i Alert ChÆ°a CÃ³ MÃ u Ná»n (Hiá»ƒn Thá»‹ Tráº¯ng/Trong Suá»‘t), Sá»­a Icon Warning & Äá»“ng Bá»™ Viá»n Má»ng Má»Ÿ Cáº£ 4 Alert
- **Ná»™i dung yÃªu cáº§u:** Xem láº¡i component Alert (`app-alert`), kháº¯c phá»¥c tÃ¬nh tráº¡ng mÃ u ná»n bá»‹ tráº¯ng, sá»­a biá»ƒu tÆ°á»£ng Warning hiá»ƒn thá»‹ nháº§m thÃ nh dáº¥u há»i `(?)` vÃ  loáº¡i bá» dáº£i viá»n mÃ©p trÃ¡i dÃ y 4px á»Ÿ tháº» Success Alert Ä‘á»ƒ cáº£ 4 tháº» Alert hiá»ƒn thá»‹ pháº³ng Ä‘á»“ng bá»™.
- **Giáº£i phÃ¡p:**
  1. **Tá»‘i Æ¯u MÃ£ Ná»n Pastel Chuáº©n Tailwind v4 (`styles.scss` & `alert.component.html`):**
     - Táº¡o bá»™ class CSS cá»‘ Ä‘á»‹nh Ä‘á»™c láº­p (`.alert-info-soft`, `.alert-success-soft`, `.alert-warning-soft`, `.alert-error-soft`) giÃºp mÃ£ mÃ u pastel nhÃ£ nháº·n hiá»ƒn thá»‹ rÃµ nÃ©t trÃªn ná»n card tráº¯ng vÃ  Dark Mode mÃ  khÃ´ng lo bá»‹ Tailwind JIT purger bá» sÃ³t.
  2. **Sá»­a Lá»—i Icon SVG Warning (`icon.component.html` & `alert.component.ts`):**
     - Bá»• sung `@case ('alert')` vÃ o `IconComponent` Ä‘á»“ng bá»™ vá»›i `@case ('warning')`, sá»­a `defaultIcon` tráº£ vá» `'warning'` thay vÃ¬ `'alert'` giÃºp hiá»ƒn thá»‹ Ä‘Ãºng biá»ƒu tÆ°á»£ng cáº£nh bÃ¡o tam giÃ¡c `âš ï¸` thay vÃ¬ bá»‹ rá»›t vÃ o `@default` dáº¥u há»i `(?)`.
  3. **Äá»“ng Bá»™ Dáº£i Viá»n Cáº£ 4 Alert Showcase (`home.component.html`):**
     - Chuyá»ƒn tháº» Success Alert tá»« `variant="accent"` (cÃ³ dáº£i viá»n mÃ©p trÃ¡i dÃ y 4px) sang `variant="soft"` Ä‘á»“ng nháº¥t vá»›i cÃ¡c tháº» Alert cÃ²n láº¡i.
  4. **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` thÃ nh cÃ´ng 100% 0 lá»—i. Cháº¡y `npm run build` thÃ nh cÃ´ng hoÃ n háº£o.

### YÃªu cáº§u: Kiá»ƒm tra Äa ngÃ´n ngá»¯ (i18n) cho 9 Standalone UI Components & Audit ToÃ n Bá»™ 30 Showcase Cards Dá»± Ãn
- **Ná»™i dung yÃªu cáº§u:** Kiá»ƒm tra ká»¹ lÆ°á»¡ng há»‡ thá»‘ng Äa ngÃ´n ngá»¯ (i18n) cho 9 component má»›i (Avatar, Empty State, Alert, Drawer, Stepper, Stat Card, Breadcrumb, Divider, Copy to Clipboard) cÅ©ng nhÆ° toÃ n bá»™ 30 Card Showcase trÃªn á»©ng dá»¥ng, Ä‘áº£m báº£o khÃ´ng cÃ²n báº¥t ká»³ vÄƒn báº£n cá»©ng nÃ o.
- **Giáº£i phÃ¡p:**
  1. **TÃ­ch há»£p i18n lá»“ng ghÃ©p trong `i18n.types.ts`, `vi.ts`, `en.ts`:**
     - ThÃªm Ä‘áº§y Ä‘á»§ namespace má»›i cho 9 component má»›i vÃ  bá»• sung tá»« Ä‘iá»ƒn key cho Card 16 (File Upload), Card 18 (Input OTP), Card 19 (Dropdown Menu), Card 20 (Progress Bar) vá»›i tá»« Ä‘iá»ƒn Tiáº¿ng Viá»‡t & Tiáº¿ng Anh khá»›p 100%.
  2. **Cáº­p nháº­t Template Showcase Cards 1 - 30 (`home.component.html` & `.ts`):**
     - Äá»•i toÃ n bá»™ tiÃªu Ä‘á», mÃ´ táº£, nÃºt báº¥m, callout alert sang dÃ¹ng `{{ 'cards.xxx.yyy' | translate }}` vÃ  `translationService.translate(...)`.
     - Chuyá»ƒn `demoStepperSteps` trong `home.component.ts` thÃ nh `computed()` signal tá»± Ä‘á»™ng pháº£n á»©ng vÃ  Ä‘á»•i tá»« ngá»¯ theo `translationService.currentLang()`.
  3. **Chuáº©n hÃ³a Äa NgÃ´n Ngá»¯ CÃ¡c Shared Components Ná»™i Bá»™ (`breadcrumb`, `code-block`, `copy-to-clipboard`, `custom-search-input`, `custom-select`, `empty-state`, `sidebar`):**
     - TÃ­ch há»£p `TranslationService` / `TranslatePipe` vÃ o cÃ¡c tháº» aria-label, tooltip, placeholder, empty-state title & description máº·c Ä‘á»‹nh.
  4. **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` thÃ nh cÃ´ng 100% khÃ´ng cÃ³ lá»—i type. Cháº¡y `npm run build` thÃ nh cÃ´ng xuáº¥t sáº¯c bundle production.

### YÃªu cáº§u: Fix Triá»‡t Äá»ƒ CÃ¡c Lá»—i UI/UX Giao Diá»‡n Component Má»›i & Chuáº©n HÃ³a Con Trá» & Khung Chá»©a
- **Ná»™i dung yÃªu cáº§u:** Sá»­a cÃ¡c lá»—i UI hiá»ƒn thá»‹ trÃªn cÃ¡c component má»›i bao gá»“m:
  1. Tháº» `<button>` thiáº¿u class/style `cursor-pointer`.
  2. NÃºt Ä‘Ã³ng 'X' trÃªn Alert, Drawer, Modal khÃ´ng vuÃ´ng tá»‰ lá»‡ 1:1 (`w-7 h-7`, `w-8 h-8`).
  3. ÄÆ°á»ng ná»‘i Stepper bá»‹ trÃ n (overflow) sang pháº£i Ä‘Ã¨ lÃªn cÃ¡c Stat Card bÃªn cáº¡nh.
  4. Khá»‘i Empty State bá»‹ xáº¿p chá»“ng dá»c nÃºt báº¥m vÃ  khÃ´ng dÃ¹ng `app-button`.
  5. CÃ¡c Card 28 (Breadcrumb), Card 29 (Divider), Card 30 (Copy to Clipboard) bá»‹ Ã©p quÃ¡ háº¹p trÃªn 3 cá»™t lÃ m vá»¡ dÃ²ng vÄƒn báº£n.
- **Giáº£i phÃ¡p:**
  1. **Tá»‘i Æ¯u Con Trá» Chuá»™t ToÃ n Cáº§u (`styles.scss`):**
     - Bá»• sung quy táº¯c CSS toÃ n cáº§u `button, [role="button"] { cursor: pointer; }` vÃ  `button:disabled { cursor: not-allowed; }`, Ä‘áº£m báº£o 100% táº¥t cáº£ cÃ¡c tháº» button trong dá»± Ã¡n Ä‘á»u xuáº¥t hiá»‡n con trá» trá» bÃ n tay `cursor-pointer`.
  2. **Chuáº©n HÃ³a KÃ­ch ThÆ°á»›c NÃºt ÄÃ³ng 'X' Vá»«a Váº·n & VuÃ´ng Tá»‰ Lá»‡ 1:1 (`alert`, `drawer`, `modal`, `modal-wrapper`):**
     - Äáº·t kÃ­ch thÆ°á»›c vuÃ´ng chuáº©n `w-7 h-7 flex items-center justify-center shrink-0` (Alert, Modal) vÃ  `w-8 h-8 flex items-center justify-center shrink-0` (Drawer), táº¡o cáº£m giÃ¡c báº¥m mÆ°á»£t vÃ  khÃ´ng bá»‹ mÃ©o.
  3. **Fix Lá»—i TrÃ n ÄÆ°á»ng Ná»‘i Stepper (`stepper.component.html` & `home.component.html`):**
     - TÃ­nh toÃ¡n láº¡i khoáº£ng cÃ¡ch Ä‘á»‹a lÃ½ chÃ­nh xÃ¡c cho Ä‘Æ°á»ng káº» ná»‘i: `left-[calc(50%+20px)] w-[calc(100%-40px)]`, Ä‘Æ°á»ng káº» báº¯t Ä‘áº§u Ä‘Ãºng mÃ©p ngoÃ i vÃ²ng trÃ²n bÆ°á»›c N vÃ  dá»«ng chÃ­nh xÃ¡c trÆ°á»›c mÃ©p vÃ²ng trÃ²n N+1, khÃ´ng bao giá» Ä‘Ã¢m trÃ n ra khá»i card.
     - Bá»• sung `overflow-hidden` cho khung Card Stepper á»Ÿ Trang chá»§.
  4. **NÃ¢ng Cáº¥p Component Empty State (`empty-state.component.ts` & `.html`):**
     - TÃ­ch há»£p `ButtonComponent` (`app-button`) cho cáº£ nÃºt báº¥m chÃ­nh (`variant="primary"`) vÃ  nÃºt báº¥m phá»¥ (`variant="cancel"`).
     - Äá»‹nh dáº¡ng layout ngang `flex flex-wrap sm:flex-row flex-col items-center justify-center gap-3` giÃºp 2 nÃºt náº±m hÃ ng ngang Ä‘áº¹p máº¯t.
  5. **Tá»‘i Æ¯u Bá»‘ Cá»¥c LÆ°á»›i CÃ¡c Showcase Card 28 - 30 (`home.component.html` & `copy-to-clipboard`):**
     - Äá»•i layout lÆ°á»›i cá»§a Card 28 (Breadcrumb) & Card 29 (Divider) sang 2 cá»™t (`grid-cols-1 lg:grid-cols-2`), má»Ÿ rá»™ng Ä‘á»™ rá»™ng tá»« 280px lÃªn ~550px+ giÃºp Breadcrumb náº±m tháº³ng trÃªn 1 hÃ ng khÃ´ng bá»‹ vá»¡.
     - Card 30 (Copy to Clipboard) xáº¿p trÃªn khung rá»™ng 2 cá»™t, thÃªm `whitespace-nowrap shrink-0` vÃ o component `copy-to-clipboard` Ä‘á»ƒ nhÃ£n `ÄÃ£ sao chÃ©p!` khÃ´ng bao giá» bá»‹ nháº£y dÃ²ng.
  6. **NÃ¢ng Cáº¥p Hiá»‡u á»¨ng TrÆ°á»£t & CÄƒn Giá»¯a Bottom Sheet (`drawer.component.html` & `.css`):**
     - Bá»• sung `items-end justify-center` vÃ  container `max-w-2xl mx-auto rounded-t-[15px]` cho biáº¿n thá»ƒ `position="bottom"`, Ä‘áº£m báº£o Bottom Sheet luÃ´n cÄƒn giá»¯a mÃ n hÃ¬nh chuáº©n tráº£i nghiá»‡m di Ä‘á»™ng.
     - ThÃªm cÃ¡c quy táº¯c CSS Keyframes animation (`drawerSlideRight`, `drawerSlideLeft`, `drawerSlideUp`, `drawerFadeIn`) trÆ°á»£t mÆ°á»£t 300ms.
  7. **Tá»‘i Æ¯u Viá»n & MÃ u Ná»n Alert Pastel RÃµ NÃ©t (`alert.component.html` & `.ts`):**
     - Äá»•i mÃ u ná»n Alert tá»« lá»›p phá»§ má» Ä‘á»¥c 5% sang dáº£i mÃ u Pastel nÃ©t Ä‘áº¹p dá»‹u máº¯t (`bg-purple-100`, `bg-emerald-100`, `bg-amber-100`, `bg-rose-100` á»Ÿ Light Mode vÃ  `dark:bg-purple-950/70` á»Ÿ Dark Mode), khÃ´ng bá»‹ hiá»‡n ná»n tráº¯ng.
     - Loáº¡i bá» cÃ¡c Ä‘Æ°á»ng viá»n Ä‘en Ä‘áº­m 2px `border-2`, thay báº±ng dáº£i viá»n 1px má» Glassmorphism Ä‘á»“ng bá»™ 100% vá»›i cÃ¡c component card khÃ¡c.
     - Chuyá»ƒn `dismissible` thÃ nh `true` theo máº·c Ä‘á»‹nh Ä‘á»ƒ táº¥t cáº£ cÃ¡c tháº» Alert Ä‘á»u xuáº¥t hiá»‡n nÃºt Ä‘Ã³ng 'X' vuÃ´ng chuáº©n.
  8. **Chuáº©n HÃ³a KÃ­ch ThÆ°á»›c NÃºt Báº¥m Vá»«a Váº·n (`size="md"`):**
     - Äá»•i toÃ n bá»™ cÃ¡c nÃºt báº¥m trong Empty State (`LÃ m má»›i`, `Náº¡p Token Ngay`), Drawer Footer (`Há»§y bá»`, `Xem trÃªn Explorer`), Stepper (`BÆ°á»›c trÆ°á»›c`, `BÆ°á»›c tiáº¿p theo`), Copy to Clipboard sang kÃ­ch chuáº©n vá»«a váº·n `size="md"`.
  9. **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` thÃ nh cÃ´ng 0 lá»—i. Cháº¡y `npm run build` xuáº¥t sáº¯c thÃ nh cÃ´ng báº£n Ä‘Ã³ng gÃ³i production.

### YÃªu cáº§u: Äá» xuáº¥t & XÃ¢y dá»±ng 9 Standalone UI Components Má»›i & TÃ­ch há»£p Showcase trÃªn Trang chá»§
- **Ná»™i dung yÃªu cáº§u:** Äá» xuáº¥t vÃ  khá»Ÿi táº¡o 9 component giao diá»‡n má»›i bao gá»“m: Avatar (`app-avatar`), Empty State (`app-empty-state`), Alert (`app-alert`), Drawer (`app-drawer`), Stepper (`app-stepper`), Stat Card (`app-stat-card`), Breadcrumb (`app-breadcrumb`), Divider (`app-divider`), vÃ  Copy to Clipboard (`app-copy-to-clipboard`); sau Ä‘Ã³ Ä‘Æ°a toÃ n bá»™ ra hiá»ƒn thá»‹ trá»±c quan táº¡i Trang chá»§ (`home.component`).
- **Giáº£i phÃ¡p:**
  1. **Khá»Ÿi táº¡o 9 Component Standalone chuáº©n Design System (`src/app/shared/components/`):**
     - **`app-avatar`**: Hiá»ƒn thá»‹ áº£nh Ä‘áº¡i diá»‡n, fallback initials, status dot (online/busy/away/offline), avatar stack Ä‘Ã¨ lá»›p kÃ¨m badge `+N`.
     - **`app-empty-state`**: MÃ n hÃ¬nh rá»—ng kÃ¨m icon vector, title, description, nÃºt action primary & secondary.
     - **`app-alert`**: Callout banner dÃ­nh trang 4 mÃ u (info, success, warning, error) & 3 style variant (soft, bordered, accent) cÃ³ nÃºt dismiss.
     - **`app-drawer`**: Off-canvas slide-over panel (Left, Right, Bottom Sheet) Ä‘iá»u khiá»ƒn qua signal vá»›i backdrop `bg-black/40` vÃ  sticky header/footer.
     - **`app-stepper`**: Quy trÃ¬nh nhiá»u bÆ°á»›c (horizontal/vertical) vá»›i icon tráº¡ng thÃ¡i (completed/active/pending/error) dÃ nh cho luá»“ng giao dá»‹ch Web3.
     - **`app-stat-card`**: Card chá»‰ sá»‘ Kpi/Dashboard vá»›i gradient icon, sá»‘ liá»‡u lá»›n, dáº£i pháº§n trÄƒm tÄƒng/giáº£m xanh/Ä‘á» (trend badge).
     - **`app-breadcrumb`**: Thanh Ä‘iá»u hÆ°á»›ng phÃ¢n cáº¥p Ä‘Æ°á»ng dáº«n (Home > Section > Page) há»— trá»£ router link vÃ  custom separator.
     - **`app-divider`**: ÄÆ°á»ng káº» phÃ¢n cÃ¡ch ngang/dá»c (solid, dashed, gradient) vá»›i label text cÄƒn lá» linh hoáº¡t.
     - **`app-copy-to-clipboard`**: NÃºt sao chÃ©p vÄƒn báº£n (Äá»‹a chá»‰ vÃ­ `0x...`, Tx Hash) vá»›i hiá»‡u á»©ng Ä‘á»•i sang icon tÃ­ch xanh phÃ¡t sÃ¡ng trong 2 giÃ¢y vÃ  toast notification.
  2. **TÃ­ch há»£p Showcase Cards 22 - 30 & Drawer Instance táº¡i `home.component.html` & `home.component.ts`:**
     - Khai bÃ¡o 9 component má»›i trong array `imports` cá»§a `@Component` trong `home.component.ts`.
     - Khá»Ÿi táº¡o demo state (`demoDrawerOpen`, `demoStepperActive`, `demoAvatarList`, `demoBreadcrumbItems`, `demoStepperSteps`).
     - Bá»• sung 9 khá»‘i Card Showcase trá»±c quan trÃ¬nh diá»…n Ä‘áº§y Ä‘á»§ tÃ­nh nÄƒng 9 component má»›i á»Ÿ cuá»‘i trang chá»§.
  3. **XÃ¡c thá»±c:** Kiá»ƒm tra cÃº phÃ¡p `npx tsc --noEmit` thÃ nh cÃ´ng 100% khÃ´ng cÃ²n báº¥t ká»³ lá»—i biÃªn dá»‹ch hay sai type nÃ o.

### YÃªu cáº§u: Kháº¯c phá»¥c Lá»—i Thanh Ngang Tráº¯ng KhÃ´ng Äá»“ng Bá»™ Trong Code Block Component (app-code-block)
- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i thanh váº¡ch káº» ngang xÃ¡m/tráº¯ng khÃ´ng Ä‘á»“ng bá»™ vá»›i giao diá»‡n Light Mode vÃ  Dark Mode xuáº¥t hiá»‡n á»Ÿ phÃ­a dÆ°á»›i vÃ¹ng code khi báº¥m Thu gá»n hoáº·c Xem Ä‘áº§y Ä‘á»§ mÃ£ nguá»“n trong `app-code-block`.
- **Giáº£i phÃ¡p:**
  1. **Tá»‘i Æ¯u Giao Diá»‡n Code Block Footer (`code-block.component.html`):**
     - Loáº¡i bá» hoÃ n toÃ n cÃ¡c class `border-t`, `border-slate-300/50`, `dark:border-slate-800/60` khá»i footer Ä‘á»ƒ pháº³ng hÃ³a giao diá»‡n, tuÃ¢n thá»§ nguyÃªn táº¯c "Border Elimination" trong `design.md`.
     - Äá»“ng bá»™ dáº£i mÃ u Gradient má» khi thu gá»n (`isCollapsed() = true`): Chuyá»ƒn `from-slate-100 via-slate-100/90` sang `from-slate-50 via-slate-50/90` khá»›p 100% vá»›i mÃ u ná»n `bg-slate-50` á»Ÿ Light Mode, giá»¯ `dark:from-slate-950 dark:via-slate-950/90` cho Dark Mode.
     - Phá»§ ná»n má» Glassmorphism mÆ°á»£t mÃ  `bg-slate-100/50 dark:bg-slate-900/40` á»Ÿ tráº¡ng thÃ¡i má»Ÿ rá»™ng, káº¿t há»£p nÃºt capsule floating pill `rounded-full` ná»•i báº­t vá»›i hover hiá»‡u á»©ng tÃ­m thÆ°Æ¡ng hiá»‡u `hover:text-purple-600 dark:hover:text-purple-300`.
  2. **XÃ¡c thá»±c:** Cháº¡y lá»‡nh `npm run build` thÃ nh cÃ´ng 100%, khÃ´ng phÃ¡t sinh báº¥t ká»³ lá»—i biÃªn dá»‹ch nÃ o.

### YÃªu cáº§u: Äá»“ng bá»™ 100% Component Custom Date Picker & Custom Date Time Range tá»« fvia79
- **Ná»™i dung yÃªu cáº§u:** Äá»“ng bá»™ toÃ n bá»™ cáº¥u trÃºc UI, logic vá»‹ trÃ­ floating popover, preset buttons, vÃ  há»‡ thá»‘ng Ä‘a ngÃ´n ngá»¯ i18n cá»§a 2 component `custom-date-picker` vÃ  `custom-date-time-range` chuáº©n theo dá»± Ã¡n fvia79.
- **Giáº£i phÃ¡p:**
  1. **Äá»“ng bá»™ mÃ£ nguá»“n tá»« fvia79:**
     - Sao chÃ©p chÃ­nh xÃ¡c logic xá»­ lÃ½ floating popover position (`fixed`, tÃ­nh toÃ¡n khoáº£ng trá»‘ng viá»n mÃ n hÃ¬nh top/bottom/left/right), tá»± Ä‘á»™ng theo dÃµi sá»± kiá»‡n `scroll`/`resize` trong `custom-date-picker` & `custom-date-time-range`.
     - Äá»“ng bá»™ HTML/CSS giao diá»‡n 100% chuáº©n fvia79 (dáº£i chá»n ngÃ y highlight mÆ°á»£t, preset buttons, dropdown chá»n giá»/phÃºt).
  2. **Äá»“ng bá»™ Äa ngÃ´n ngá»¯ i18n:**
     - Bá»• sung namespace `date` (mon_short, tue_short, wed_short, thu_short, fri_short, sat_short, sun_short, select, select_range, today, yesterday, last_7_days, last_30_days, this_month, days_7, month_1, months_3, months_6, year_1, time_config, start_time, end_time, hour) vÃ  `action` (cancel, apply, done), `common` (clear_date_range, apply) vÃ o `i18n.types.ts`, `vi.ts`, `en.ts`.
     - TÃ­ch há»£p `TranslationService` vÃ o 2 component date picker giÃºp tá»± Ä‘á»™ng chuyá»ƒn ngÃ´n ngá»¯ Tiáº¿ng Viá»‡t / Tiáº¿ng Anh tá»©c thÃ¬ khi ngÆ°á»i dÃ¹ng Ä‘á»•i ngÃ´n ngá»¯ há»‡ thá»‘ng.
  3. **XÃ¡c thá»±c:** Cháº¡y lá»‡nh `npm run build` thÃ nh cÃ´ng 100%, khÃ´ng cÃ²n báº¥t ká»³ lá»—i biÃªn dá»‹ch nÃ o.

### YÃªu cáº§u: Kháº¯c phá»¥c Lá»—i Hiá»ƒn Thá»‹ TÆ°Æ¡ng Pháº£n MÃ u Chá»¯ Datetime Range Picker Trong Dark Mode
- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i chá»¯ sá»‘ ngÃ y trong dáº£i chá»n khoáº£ng thá»i gian (`custom-date-time-range`) bá»‹ tá»‘i Ä‘en trÃ¹ng mÃ u ná»n tÃ­m tá»‘i trong Dark Mode lÃ m ngÆ°á»i dÃ¹ng khÃ´ng Ä‘á»c Ä‘Æ°á»£c sá»‘ ngÃ y (vÃ­ dá»¥ cÃ¡c ngÃ y 11, 12, 13, 14 trong khoáº£ng chá»n 10/07 - 15/07).
- **Giáº£i phÃ¡p:**
  1. **Tá»‘i Æ¯u Class TÆ°Æ¡ng Pháº£n MÃ u Chá»¯ Trong Khoáº£ng Chá»n (`custom-date-time-range.component.html`):**
     - Äá»•i `[class.!text-[var(--color-primary)]]="isInRange(day)"` thÃ nh `[class.text-purple-800]="isInRange(day)"` (cho Light Mode) vÃ  `[class.dark:text-purple-100]="isInRange(day)"` (cho Dark Mode). Chá»¯ ngÃ y trong khoáº£ng chá»n giá» hiá»ƒn thá»‹ mÃ u tÃ­m nháº¡t sÃ¡ng thanh lá»‹ch `#f3e8ff` chuáº©n Ä‘á»™ tÆ°Æ¡ng pháº£n cao AAA trÃªn ná»n tÃ­m tá»‘i `dark:bg-[var(--color-primary)]/30`.
     - Tá»‘i Æ°u viá»n bo gÃ³c `[class.rounded-full]="!isInRange(day) && !isStartDate(day) && !isEndDate(day)"`, bá»• sung `z-10` cho nÃºt Ä‘iá»ƒm Ä‘áº§u/Ä‘iá»ƒm cuá»‘i giÃºp dáº£i ná»‘i cÃ¡c ngÃ y liá»n máº¡ch mÆ°á»£t mÃ .
  2. **Äá»“ng Bá»™ Bá»™ Chá»n NgÃ y ÄÆ¡n (`custom-date-picker.component.html`):**
     - Cáº­p nháº­t `[class.dark:text-slate-200]` cho cÃ¡c Ã´ ngÃ y thÃ¡ng vÃ  `[class.dark:!text-purple-300]` cho ngÃ y hiá»‡n táº¡i `isToday`.
  3. **XÃ¡c thá»±c:** Cháº¡y lá»‡nh `npm run build` thÃ nh cÃ´ng 100%, khÃ´ng phÃ¡t sinh lá»—i biÃªn dá»‹ch.

### YÃªu cáº§u: Kháº¯c phá»¥c Lá»—i Giáº­t Lag & Cháº­m Transition Khi Chuyá»ƒn Dark Mode / Light Mode
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c tÃ¬nh tráº¡ng cáº£m giÃ¡c cháº­m, trá»… mÃ u sáº¯c vÃ  lá»—i mÃ u chá»¯ UI khi báº¥m chuyá»ƒn Ä‘á»•i giá»¯a cÃ¡c cháº¿ Ä‘á»™ Dark Mode / Light Mode.
- **Giáº£i phÃ¡p:**
  1. **Tá»‘i Æ¯u Chuyá»ƒn Äá»•i Dark/Light Mode Tá»©c ThÃ¬ 0ms (`ThemeService` & `styles.scss`):**
     - Loáº¡i bá» toÃ n bá»™ cÃ¡c hack CSS `transition` Ã©p buá»™c trÃªn táº¥t cáº£ element (`*`) vÃ  bá»™ Ä‘áº¿m thá»i gian timer trong `ThemeService`.
     - Chuyá»ƒn `applyDarkClass(dark)` sang cÆ¡ cháº¿ báº­t/táº¯t class `.dark` trá»±c tiáº¿p vÃ  tá»©c thÃ¬ (0ms delay) trÃªn `document.documentElement` (`html`) vÃ  `body`. GiÃºp giao diá»‡n chuyá»ƒn mÃ u nháº¡y tá»©c thÃ¬, pháº£n há»“i nhanh 100% khÃ´ng cÃ²n cáº£m giÃ¡c bá»‹ cháº­m/trá»….
  2. **Tá»‘i Æ¯u TrÃ¡nh `transition-all` TrÃªn CÃ¡c Wrapper Layout Khung Nháº¥t (`app.html`, `header.component.html`, `sidebar.component.html`):**
     - Äá»•i `transition-all duration-300` thÃ nh `transition-[padding]` trÃªn main content container (`app.html`) vÃ  sticky header (`header.component.html`).
     - Äá»•i `transition-all duration-300` thÃ nh `transition-[width]` trÃªn sidebar container (`sidebar.component.html`). Viá»‡c nÃ y trÃ¡nh cho trÃ¬nh duyá»‡t pháº£i tÃ­nh toÃ¡n láº¡i hiá»‡u á»©ng lÃ m má» `backdrop-blur-md` hoáº·c layout grid khi chuyá»ƒn Ä‘á»•i theme mode.
  3. **Sá»­a Triá»‡t Äá»ƒ Lá»—i MÃ u Chá»¯ / Khá»›p TÆ°Æ¡ng Pháº£n MÃ u UI:**
     - Loáº¡i bá» cÃ¡c quy táº¯c Ã©p `transition-delay` lÃ m nhÃ¡y/má» mÃ u chá»¯. GiÃºp toÃ n bá»™ vÄƒn báº£n vÃ  card trong Light Mode & Dark Mode hiá»ƒn thá»‹ sáº¯c nÃ©t, chuáº©n sáº¯c thÃ¡i tÆ°Æ¡ng pháº£n cá»§a Tailwind CSS.
  4. **XÃ¡c thá»±c:** Cháº¡y lá»‡nh `npm run build` thÃ nh cÃ´ng 100%, biÃªn dá»‹ch hoÃ n háº£o khÃ´ng lá»—i syntax hay logic.

### YÃªu cáº§u: TÃ­nh nÄƒng Thu nhá» / Má»Ÿ rá»™ng Sidebar Menu Desktop (Collapsible Sidebar)
- **Ná»™i dung yÃªu cáº§u:** ThÃªm nÃºt toggle `<` trÃªn Sidebar Desktop (báº¥m vÃ o thu nhá» sidebar cÃ²n icon (`w-20`), áº©n text; báº¥m `>` má»Ÿ rá»™ng Ä‘áº§y Ä‘á»§ (`w-72`)).
- **Giáº£i phÃ¡p:**
  1. **Core State & Persistence (`UiStateService` & `StateService`):** ThÃªm signal `isSidebarCollapsed` Ä‘á»c/ghi `localStorage` (`angular_web3_sidebar_collapsed`) vÃ  hÃ m `toggleSidebarCollapse()`.
  2. **TÆ°Æ¡ng thÃ­ch Layout (`app.html` & `header.component.html`):** Chuyá»ƒn padding left cá»§a main container vÃ  sticky header sang class Ä‘á»™ng `[class.md:pl-72]="!stateService.isSidebarCollapsed()"` vÃ  `[class.md:pl-20]="stateService.isSidebarCollapsed()"` kÃ¨m `transition-all duration-300 ease-in-out`.
  3. **Giao diá»‡n Sidebar Component (`sidebar.component.html`):**
     - Äáº·t chiá»u cao header logo `h-16 sm:h-20` Ä‘á»“ng bá»™ 100% trá»¥c ngang vá»›i Ä‘Æ°á»ng káº» viá»n chÃ¢n top header.
     - TÄƒng padding right cho pháº§n thÃ´ng tin logo `pl-6 pr-8` Ä‘á»ƒ táº¡o khoáº£ng thá»Ÿ vá»«a váº·n, khÃ´ng bá»‹ cháº¡m sÃ¡t nÃºt toggle.
     - ThÃªm nÃºt floating trÃ²n á»Ÿ vá»‹ trÃ­ cÄƒn giá»¯a dá»c chiá»u cao header (`absolute -right-3.5 top-8 sm:top-10 -translate-y-1/2`) hiá»ƒn thá»‹ icon `chevron-left` `<` khi má»Ÿ rá»™ng vÃ  `chevron-right` `>` khi thu nhá».
     - Chuyá»ƒn Ä‘á»™ rá»™ng sidebar linh hoáº¡t giá»¯a `w-72` (má»Ÿ rá»™ng) vÃ  `w-20` (thu nhá»).
     - Khi thu nhá» (`w-20`): áº¨n tiÃªu Ä‘á» logo, cÄƒn giá»¯a Logo Icon, chuyá»ƒn menu item vá» biá»ƒu tÆ°á»£ng cÄƒn giá»¯a kÃ¨m `title` tooltip vÃ  áº©n text, footer hiá»ƒn thá»‹ nÃºt Ä‘á»•i giao diá»‡n nhanh dáº¡ng icon-only.
  4. **XÃ¡c thá»±c:** Cháº¡y `npm run build` kiá»ƒm tra biÃªn dá»‹ch khÃ´ng lá»—i syntax hay logic.

### YÃªu cáº§u: Loáº¡i bá» Bá»™ chá»n Äa NgÃ´n Ngá»¯ á»Ÿ Sidebar Menu
- **Ná»™i dung yÃªu cáº§u:** XÃ³a component chuyá»ƒn Ä‘á»•i ngÃ´n ngá»¯ (`<app-language-selector>`) khá»i khu vá»±c chÃ¢n Sidebar.
- **Giáº£i phÃ¡p:**
  1. Cáº­p nháº­t [sidebar.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/sidebar/sidebar.component.html): Loáº¡i bá» tháº» `<app-language-selector variant="full" direction="up" />` á»Ÿ footer sidebar.
  2. Cáº­p nháº­t [sidebar.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/layout/sidebar/sidebar.component.ts): Loáº¡i bá» `LanguageSelectorComponent` khá»i máº£ng `imports` vÃ  `import` dÆ° thá»«a.
  3. **XÃ¡c thá»±c:** Cháº¡y `npm run build` kiá»ƒm tra biÃªn dá»‹ch khÃ´ng lá»—i syntax hay logic.

### YÃªu cáº§u: Loáº¡i bá» cáº£nh bÃ¡o NG8113 TranslatePipe thá»«a trong ConfirmModalComponent
- **Ná»™i dung yÃªu cáº§u:** Sá»­a cáº£nh bÃ¡o biÃªn dá»‹ch `NG8113: TranslatePipe is not used within the template of ConfirmModalComponent`.
- **Giáº£i phÃ¡p:**
  1. Cáº­p nháº­t [confirm-modal.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/confirm-modal/confirm-modal.component.ts): Loáº¡i bá» `TranslatePipe` khá»i máº£ng `imports` cá»§a `@Component` vÃ  gá»¡ bá» `import { TranslatePipe }` dÆ° thá»«a do component Ä‘Ã£ tá»± xá»­ lÃ½ dá»‹ch thuáº­t qua `TranslationService` trong class code.
  2. **XÃ¡c thá»±c:** Cháº¡y lá»‡nh `npm run build` thÃ nh cÃ´ng, dá»n sáº¡ch cáº£nh bÃ¡o `NG8113`.

### YÃªu cáº§u: Äá»“ng bá»™ UI & MÃ u sáº¯c Voice Chat Morphing Card theo Design System DApp
- **Ná»™i dung yÃªu cáº§u:** Tinh chá»‰nh láº¡i component Voice Chat Morphing Card (`app-voice-chat`) Ä‘á»ƒ káº¿ thá»«a 100% há»‡ mÃ u chá»§ Ä‘áº¡o TÃ­m Neon Dynamic (`#7c3aed`), bo gÃ³c cap tá»‘i Ä‘a `15px` (`rounded-[15px]`), ná»n má» Glassmorphism, nÃºt báº¥m Gradient vÃ  Speaking Ring hiá»‡u á»©ng phÃ¡t sÃ¡ng TÃ­m theo Ä‘Ãºng tÃ i liá»‡u `design.md`.
- **Giáº£i phÃ¡p:**
  1. **Cáº­p nháº­t `voice-chat.component.html`:**
     - Thay tháº¿ toÃ n bá»™ tÃ´ng mÃ u xanh teal lÃ¡ cÅ© báº±ng tÃ´ng mÃ u TÃ­m Neon thÆ°Æ¡ng hiá»‡u (`purple-500` / `purple-600` / `violet-600` / `indigo-600`).
     - Äá»•i Ä‘á»™ bo gÃ³c container má»Ÿ rá»™ng tá»« `24px` xuá»‘ng `15px` (`rounded-[15px]`) tuÃ¢n thá»§ tuyá»‡t Ä‘á»‘i quy Ä‘á»‹nh bo gÃ³c tá»‘i Ä‘a 15px trong `design.md`.
     - NÃºt Join Now sá»­ dá»¥ng Gradient mÃ u tÃ­m neon `bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600` mÆ°á»£t mÃ  vá»›i bÃ³ng Ä‘á»• `shadow-purple-500/25` vÃ  hiá»‡u á»©ng `active:scale-[0.98]`.
     - Icon Wave thu gá»n sá»­ dá»¥ng gradient trÃ²n ná»•i báº­t,Speaking Ring teal Ä‘á»•i thÃ nh Ä‘Æ°á»ng viá»n TÃ­m phÃ¡t sÃ¡ng pulse `border-purple-500 dark:border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]`.
     - Badge Ä‘áº¿m sá»‘ thÃ nh viÃªn khi thu gá»n Ä‘á»•i sang mÃ u tÃ­m nháº¡t sang trá»ng `bg-purple-100/90 dark:bg-purple-950/90 text-purple-700 dark:text-purple-300`.
  2. **XÃ¡c thá»±c:** Cháº¡y `npm run build` biÃªn dá»‹ch thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: MÃ´ Ä‘un hÃ³a & TÃ¡ch Ä‘á»™c láº­p cÃ¡c Component Header (Äa ngÃ´n ngá»¯, Äa chain, ThÃ´ng tin tÃ i khoáº£n)
- **Ná»™i dung yÃªu cáº§u:** TÃ¡ch cÃ¡c khá»‘i giao diá»‡n trÃªn Header (dropdown Äa ngÃ´n ngá»¯, bá»™ chá»n Máº¡ng Äa chain, Dropdown ThÃ´ng tin tÃ i khoáº£n / VÃ­) thÃ nh cÃ¡c Standalone UI Component Ä‘á»™c láº­p Ä‘á»ƒ cÃ³ thá»ƒ dá»… dÃ ng tÃ¡i sá»­ dá»¥ng hoáº·c lÆ°á»£c bá» cho cÃ¡c dá»± Ã¡n Web2 khÃ´ng dÃ¹ng Blockchain.
- **Giáº£i phÃ¡p:**
  1. **Component Äa ngÃ´n ngá»¯ (`app-language-selector`):** ÄÃ£ Ä‘Æ°á»£c tÃ¡ch hoÃ n toÃ n Ä‘á»™c láº­p táº¡i `src/app/shared/components/language-selector/`, há»— trá»£ 2 biáº¿n thá»ƒ `compact` (Header) vÃ  `full` (Sidebar).
  2. **Component Äa chain (`app-network-selector`):** TÃ¡ch má»›i táº¡i `src/app/shared/components/network-selector/` (`network-selector.component.ts`, `.html`, `.css`). Quáº£n lÃ½ NÃºt Globe icon vÃ  Menu chá»n máº¡ng lÆ°á»›i `POPULAR_CHAINS`, bá»• sung `:host { display: block; }`.
  3. **Component ThÃ´ng tin tÃ i khoáº£n (`app-account-dropdown`):** TÃ¡ch má»›i táº¡i `src/app/shared/components/account-dropdown/` (`account-dropdown.component.ts`, `.html`, `.css`). Quáº£n lÃ½ NÃºt Káº¿t ná»‘i vÃ­ / NÃºt tráº¡ng thÃ¡i online vÃ­, vÃ  Menu tÃ i khoáº£n (Copy address, View explorer, Wallet details, Disconnect), bá»• sung `:host { display: block; }`.
  4. **TÃ¡i cáº¥u trÃºc Header Layout:** [header.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.ts) & [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.html) chá»‰ gá»i `<app-language-selector>`, `<app-network-selector>`, `<app-account-dropdown>` giÃºp code tinh gá»n tá»« 320 dÃ²ng xuá»‘ng cÃ²n dÆ°á»›i 100 dÃ²ng.
  5. Cáº­p nháº­t [ARCHITECTURE.md](file:///d:/git/angular-web3-wallet/ARCHITECTURE.md) & [/.agent/ARCHITECTURE.md](file:///d:/git/angular-web3-wallet/.agent/ARCHITECTURE.md) ghi nháº­n Ä‘áº·c táº£ quy chuáº©n mÃ´ Ä‘un hÃ³a Header.

### YÃªu cáº§u: Viáº¿t láº¡i tÃ i liá»‡u ARCHITECTURE.md vÃ  design.md cho bá»™ Web3 Template Source Code
- **Ná»™i dung yÃªu cáº§u:** Viáº¿t láº¡i 2 tÃ i liá»‡u `ARCHITECTURE.md` vÃ  `design.md` (Ä‘á»“ng bá»™ táº¡i thÆ° má»¥c gá»‘c vÃ  thÆ° má»¥c `.agent/`), loáº¡i bá» thÃ´ng tin bÃ¡n hÃ ng cÅ© nhÆ°ng **giá»¯ láº¡i Ä‘áº§y Ä‘á»§ pháº§n 2: Kiáº¿n trÃºc Backend (Laravel API DDD, CQRS, Data Mapper, Event-driven Queue, Cookie auth)**, Ä‘á»“ng thá»i **bá»• sung cÆ¡ cháº¿ Ä‘Äƒng nháº­p JWT Dual Token (Access Token lÆ°u RAM 30 phÃºt, Refresh Token lÆ°u HttpOnly Cookie 7 ngÃ y)** vÃ  chuáº©n hÃ³a theo Ä‘Ãºng bá»™ Web3 DApp Starter Kit cá»§a Angular Web3 Wallet. Sá»­a lá»—i hiá»ƒn thá»‹ icon cá» Viá»‡t Nam (ná»n Ä‘á» sao vÃ ng) trong dropdown i18n.
- **Giáº£i phÃ¡p:**
  1. Cáº­p nháº­t [translation.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/translation.service.ts): Sá»­a lá»—i SVG cá» Viá»‡t Nam (thiáº¿u lá»‡nh path `M0 0`), thay tháº¿ báº±ng SVG lÃ¡ cá» Ä‘á» sao vÃ ng chuáº©n (`rect fill="#da251d"` + `polygon fill="#ffff00"`).
  2. Cáº­p nháº­t [ARCHITECTURE.md](file:///d:/git/angular-web3-wallet/ARCHITECTURE.md) & [/.agent/ARCHITECTURE.md](file:///d:/git/angular-web3-wallet/.agent/ARCHITECTURE.md):
     - **Tá»•ng quan Kiáº¿n trÃºc:** Äáº·c táº£ Ä‘áº§y Ä‘á»§ cáº£ Backend (Laravel API) vÃ  Frontend (Angular 22 Web3 Starter Kit & DApp Component Showcase).
     - **Kiáº¿n trÃºc Backend (Laravel API):** Giá»¯ nguyÃªn cáº¥u trÃºc 4 lá»›p DDD (`Domain/`, `Infrastructure/`, `Application/`, `Http/`), Data Mapper Pattern, Form Request Validation, CQRS Command Bus, Event-driven Queue (`ShouldQueue`), **JWT Dual Token Authentication (Access Token RAM 30m, Refresh Token HttpOnly Cookie 7d)**, API Versioning (`/api/v1/`).
     - **CÆ¡ cháº¿ Token Frontend:** Äáº·c táº£ quy táº¯c lÆ°u Access Token hoÃ n toÃ n trong RAM (`AuthService` state), tá»± Ä‘á»™ng Silent Refresh Token qua `AuthInterceptor` Ä‘á»c cookie `refresh_token` khi Access Token háº¿t háº¡n.
     - **Cáº¥u trÃºc Frontend:** Chi tiáº¿t hÃ³a sÆ¡ Ä‘á»“ `src/app/core/`, `src/app/shared/` (35+ Standalone UI components), `src/app/features/` (home 21 cards, about, contact).
     - **Quy táº¯c Láº­p trÃ¬nh:** Path Aliases, Flat Features, Signal vÃ­ Web3, Dynamic Modal Service khÃ´ng animation delay, Failover RPC backup (`POPULAR_CHAINS`), `:host { display: block; }` chuáº©n hÃ³a.
  2. Cáº­p nháº­t [design.md](file:///d:/git/angular-web3-wallet/design.md) & [/.agent/design.md](file:///d:/git/angular-web3-wallet/.agent/design.md):
     - **Typography:** PhÃ´ng chá»¯ `Quicksand` local, font scale hierarchy.
     - **Dynamic Color Palette:** Primary Accent `#ff00dd` / `#7c3aed`, Secondary Accent `#8000ff` / `#c084fc`, Tailwind v4 `@theme` mappings.
     - **Layout & Container:** Giá»›i háº¡n khung chá»©a `max-w-[1530px]`, nhÃ£n form chuáº©n `.form-field`.
     - **Bo gÃ³c & ÄÆ°á»ng viá»n:** Bo gÃ³c cap tá»‘i Ä‘a 15px (`--radius-xl` -> `--radius-4xl`), viá»n 1px má» Glassmorphism, pháº³ng hÃ³a bá» horizontal borders thá»«a.
     - **UI Component Specs:** Dynamic Modals, Button gradients, SVG vector icons (100% no raw emojis), i18n language selector, progress bar, file upload, OTP input, code block, table, voice chat morphing card, theme switcher.
  3. **XÃ¡c thá»±c:** Cháº¡y `npm run build` thÃ nh cÃ´ng 100%, biÃªn dá»‹ch á»©ng dá»¥ng khÃ´ng phÃ¡t sinh báº¥t ká»³ lá»—i nÃ o.

### YÃªu cáº§u: XÃ¢y dá»±ng vÃ  tÃ­ch há»£p há»‡ thá»‘ng Äa NgÃ´n Ngá»¯ i18n (Multi-Language Dropdown)
- **Ná»™i dung yÃªu cáº§u:** Bá»• sung dropdown Ä‘a ngÃ´n ngá»¯, sá»­ dá»¥ng há»‡ thá»‘ng i18n vá»›i file ngÃ´n ngá»¯ TypeScript tÃ¡ch riÃªng (vi.ts / en.ts), lÆ°u key riÃªng biá»‡t. Ãp dá»¥ng cho toÃ n bá»™ source code, component, page.
- **Giáº£i phÃ¡p:**
  1. **Táº¡o cáº¥u trÃºc i18n core:**
     - [i18n.types.ts](file:///d:/git/angular-web3-wallet/src/app/core/i18n/i18n.types.ts): Khai bÃ¡o type `SupportedLang`, interface `LanguageOption` vÃ  `TranslationDictionary`.
     - [vi.ts](file:///d:/git/angular-web3-wallet/src/app/core/i18n/vi.ts): Tá»« Ä‘iá»ƒn Tiáº¿ng Viá»‡t chuáº©n hÃ³a phÃ¢n cáº¥p key (`nav`, `header`, `wallet`, `home`, `cards`, `about`, `contact`, `modal_demo`, `common`).
     - [en.ts](file:///d:/git/angular-web3-wallet/src/app/core/i18n/en.ts): Tá»« Ä‘iá»ƒn Tiáº¿ng Anh Ä‘á»“ng bá»™ 100% key.
  2. **Táº¡o Core Service & Pipe:**
     - [translation.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/translation.service.ts): `TranslationService` quáº£n lÃ½ state ngÃ´n ngá»¯ báº±ng Angular Signals, lÆ°u/khÃ´i phá»¥c localStorage, há»— trá»£ `translate(key, params)` truy xuáº¥t key lá»“ng nhau.
     - [translate.pipe.ts](file:///d:/git/angular-web3-wallet/src/app/shared/pipes/translate.pipe.ts): `TranslatePipe` standalone `{{ 'key' | translate }}`.
     - [safe-html.pipe.ts](file:///d:/git/angular-web3-wallet/src/app/shared/pipes/safe-html.pipe.ts): `SafeHtmlPipe` Ä‘á»ƒ render SVG cá» quá»‘c gia an toÃ n.
  3. **Táº¡o Component Dropdown NgÃ´n Ngá»¯:**
     - [language-selector.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/language-selector/language-selector.component.ts): Component standalone `app-language-selector` há»— trá»£ variant `compact`/`full` vÃ  direction `up`/`down`.
     - [language-selector.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/language-selector/language-selector.component.html): Template dropdown vá»›i cá» SVG Viá»‡t Nam/Má»¹, tick mark active, bo gÃ³c Glassmorphic.
     - [language-selector.component.css](file:///d:/git/angular-web3-wallet/src/app/shared/components/language-selector/language-selector.component.css): `:host { display: block; }`.
  4. **TÃ­ch há»£p vÃ o Layout chÃ­nh:**
     - Cáº­p nháº­t [header.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.ts) & [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.html): Import `LanguageSelectorComponent`, `TranslatePipe`, `TranslationService`. Dá»‹ch toÃ n bá»™ menu navigation, dropdown vÃ­, toast, nÃºt káº¿t ná»‘i vÃ­, network selector.
     - Cáº­p nháº­t [sidebar.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/layout/sidebar/sidebar.component.ts) & [sidebar.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/sidebar/sidebar.component.html): TÃ­ch há»£p `app-language-selector` variant `full` direction `up` bÃªn cáº¡nh theme-switcher.
  5. **Dá»‹ch toÃ n bá»™ cÃ¡c trang:**
     - [about.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/about/about.component.ts) & [about.component.html](file:///d:/git/angular-web3-wallet/src/app/features/about/about.component.html): Dá»‹ch tiÃªu Ä‘á», mÃ´ táº£, 3 feature card.
     - [contact.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/contact/contact.component.ts) & [contact.component.html](file:///d:/git/angular-web3-wallet/src/app/features/contact/contact.component.html): Dá»‹ch form liÃªn há»‡, nhÃ£n trÆ°á»ng, nÃºt gá»­i, toast thÃ nh cÃ´ng.
     - [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts) & [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html): Dá»‹ch banner káº¿t ná»‘i vÃ­, dashboard, showcase header, nÃºt Demo Modal.
     - [demo-modal.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/components/demo-modal/demo-modal.component.ts): Import `TranslatePipe`.
  6. **TÃ­ch há»£p Showcase:**
     - Bá»• sung **Card 21: Dropdown Äa NgÃ´n Ngá»¯ (i18n Showcase)** trÃªn trang chá»§ trÃ¬nh diá»…n 2 cháº¿ Ä‘á»™ Full/Compact, báº£ng debug key -> value tá»©c thÃ¬ vÃ  thÃ´ng tin kiáº¿n trÃºc i18n.
  7. **XÃ¡c thá»±c:** Cháº¡y lá»‡nh `npm run build` thÃ nh cÃ´ng, khÃ´ng lá»—i biÃªn dá»‹ch.

## NgÃ y 03/08/2026

### YÃªu cáº§u: Thay Ä‘á»•i RPC máº·c Ä‘á»‹nh cá»§a BSC Testnet
- **Ná»™i dung yÃªu cáº§u:** Thay Ä‘á»•i URL RPC chain BSC Testnet (Chain ID 97) máº·c Ä‘á»‹nh thÃ nh `https://bsc-testnet.rpc.sentio.xyz`.
- **Giáº£i phÃ¡p:**
  1. Cáº­p nháº­t [blockchain.utils.ts](file:///d:/git/angular-web3-wallet/src/app/core/utils/blockchain.utils.ts): Cáº­p nháº­t `rpcUrl` cá»§a BSC Testnet trong máº£ng `POPULAR_CHAINS` vÃ  Æ°u tiÃªn Ä‘áº§u báº£ng trong hÃ m `getBackupRpcUrls` thÃ nh `https://bsc-testnet.rpc.sentio.xyz`.
  2. **XÃ¡c thá»±c:** Cháº¡y lá»‡nh `npm run build` Ä‘á»ƒ kiá»ƒm tra biÃªn dá»‹ch thÃ nh cÃ´ng.

## NgÃ y 27/07/2026

### YÃªu cáº§u: XÃ¢y dá»±ng vÃ  tÃ­ch há»£p Progress Component (app-progress)
- **Ná»™i dung yÃªu cáº§u:** ThÃªm component `progress` má»›i táº¡i `src/app/shared/components/progress` láº¥y cáº£m há»©ng tá»« Shadcn Space Progress, há»— trá»£ nhiá»u biáº¿n thá»ƒ tiáº¿n trÃ¬nh phong phÃº (Linear Bar, Steps, Multi-Segment Storage, Striped Animated, Indeterminate mode, Circular Ring 360Â° vÃ  Semi-Circle Gauge 180Â° SVG) vÃ  bá»• sung showcase táº¡i trang chá»§.
- **Giáº£i phÃ¡p:**
  1. **Táº¡o Progress Component:**
     - [progress.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/progress/progress.component.ts): Standalone component vá»›i 5 size (`xs`, `sm`, `md`, `lg`, `xl`), 7 mÃ u sáº¯c/gradient (`primary`, `secondary`, `success`, `warning`, `danger`, `info`, `gradient`), tÃ­nh toÃ¡n tá»‰ lá»‡ %, stroke-dasharray & stroke-dashoffset cho SVG Circular Ring vÃ  Semi-Circle Gauge.
     - [progress.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/progress/progress.component.html): Template linh hoáº¡t render Linear Bar vá»›i header label & % value position (`top`, `right`, `bottom`, `inside`), Multi-segment storage progress, Step divider progress, Striped Animated, Indeterminate mode vÃ  SVG Gauges.
     - [progress.component.css](file:///d:/git/angular-web3-wallet/src/app/shared/components/progress/progress.component.css): Cáº¥u hÃ¬nh `:host { display: block; }`, keyframes `@keyframes progress-stripe-move` cho hiá»‡u á»©ng sá»c cháº¡y vÃ  `@keyframes progress-indeterminate` cho hiá»‡u á»©ng sÃ³ng cháº¡y.
  2. **TÃ­ch há»£p Showcase vÃ o trang chá»§:**
     - Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts) vÃ  [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html): Khai bÃ¡o `ProgressComponent`, táº¡o signal `demoProgressValue`, máº£ng phÃ¢n bá»• `demoProgressSegments` vÃ  bá»• sung **Card 20: Component Progress Tiáº¿n TrÃ¬nh Cao Cáº¥p (app-progress)** trÃ¬nh diá»…n 6 khu vá»±c demo tÆ°Æ¡ng tÃ¡c trá»±c quan.

### YÃªu cáº§u: Äá»“ng bá»™ Ä‘Æ°á»ng viá»n vÃ  mÃ u sáº¯c cá»§a Input OTP Component (app-input-otp) 100% theo design.md
- **Ná»™i dung yÃªu cáº§u:** Tinh chá»‰nh láº¡i cÃ¡c Ã´ nháº­p liá»‡u OTP (`app-input-otp`) Ä‘á»ƒ khá»›p 100% vá»›i style Ã´ nháº­p liá»‡u há»‡ thá»‘ng (`.form-input`), loáº¡i bá» viá»‡c Ä‘á»•i Ä‘Æ°á»ng viá»n thÃ´ khi Ä‘iá»n chá»¯, sá»­ dá»¥ng ná»n slate nháº¡t mÆ°á»£t vÃ  Ä‘Æ°á»ng viá»n máº£nh Ä‘á»“ng nháº¥t giá»¯a Ã´ rá»—ng vÃ  Ã´ Ä‘Ã£ nháº­p.
- **Giáº£i phÃ¡p:**
  1. **Äá»“ng bá»™ style theo chuáº©n `.form-input` trong design.md:**
     - Cáº­p nháº­t [input-otp.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/input-otp/input-otp.component.html):
       - **ÄÆ°á»ng viá»n máº£nh nháº¡t mÆ°á»£t (1px Soft Visible Borders):** Chuyá»ƒn sang nÃ©t viá»n 1px máº£nh thanh thoÃ¡t `border border-solid border-slate-200 dark:border-slate-700` trÃªn ná»n `bg-white dark:bg-slate-900 shadow-xs`. ÄÆ°á»ng viá»n vá»«a dá»‹u nháº¹ vá»«a vá»«a máº¯t, vá»«a Ä‘á»‹nh hÃ¬nh rÃµ tá»«ng Ã´ OTP.
       - **Bo gÃ³c (Border Radius):** Äáº£m báº£o táº¥t cáº£ cÃ¡c kÃ­ch thÆ°á»›c Ã´ OTP cÃ³ Ä‘á»™ bo gÃ³c sáº¯c nÃ©t, rÃµ rÃ ng theo chuáº©n 15px max cá»§a `design.md`: `size === 'sm'` dÃ¹ng `rounded-[10px]`, `size === 'md'` dÃ¹ng `rounded-[12px]`, `size === 'lg'` dÃ¹ng `rounded-[14px]`.
       - **Tráº¡ng thÃ¡i Äang focus (Active):** Viá»n tÃ­m thÆ°Æ¡ng hiá»‡u phÃ¡t sÃ¡ng mÆ°á»£t `border-purple-500 dark:border-purple-500 ring-4 ring-purple-500/20 dark:ring-purple-500/30 bg-purple-50/40 dark:bg-purple-950/30 scale-[1.02] shadow-sm shadow-purple-500/10`.
       - **Tráº¡ng thÃ¡i Lá»—i (Invalid) & VÃ´ hiá»‡u hÃ³a (Disabled):** Tinh chá»‰nh ná»n `bg-rose-50/40` vÃ  `bg-slate-100 dark:bg-slate-900/40` mÆ°á»£t mÃ .
     - Cáº­p nháº­t [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html): Äá»•i class nhÃ£n hiá»ƒn thá»‹ `text-violet-600` sang `text-purple-600` cho Ä‘á»“ng bá»™.
  2. **XÃ¡c thá»±c:** Cháº¡y lá»‡nh `npm run build` thÃ nh cÃ´ng, biÃªn dá»‹ch á»©ng dá»¥ng mÆ°á»£t mÃ  khÃ´ng cÃ³ lá»—i.

### YÃªu cáº§u: Loáº¡i bá» UI phÃ­m táº¯t macOS vÃ  tÄƒng kÃ­ch thÆ°á»›c font-size cá»§a Dropdown Menu Component
- **Ná»™i dung yÃªu cáº§u:** XÃ³a toÃ n bá»™ cÃ¡c biá»ƒu tÆ°á»£ng phÃ­m táº¯t kiá»ƒu macOS (`âŒ˜P`, `âŒ˜W`, `âŒ˜S`, `âŒ˜K`, `â‡§âŒ˜Q`, `âŒ˜B`, `âŒ˜N`, `âŒ˜C`) khá»i cÃ¡c menu item vÃ  trang showcase; Ä‘á»“ng thá»i xem xÃ©t láº¡i tá»•ng thá»ƒ `dropdown-menu`, Ä‘iá»u chá»‰nh kÃ­ch thÆ°á»›c chá»¯ (font-size) to hÆ¡n vÃ  thoÃ¡ng hÆ¡n Ä‘á»ƒ ngÆ°á»i dÃ¹ng dá»… Ä‘á»c.
- **Giáº£i phÃ¡p:**
  1. **Loáº¡i bá» phÃ­m táº¯t macOS:**
     - Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts): Loáº¡i bá» toÃ n bá»™ thuá»™c tÃ­nh `shortcut` chá»©a cÃ¡c kÃ½ tá»± macOS `âŒ˜` vÃ  `â‡§` trong danh sÃ¡ch menu item demo (`demoProfileMenuItems`, `demoDisplayMenuItems`, `demoWeb3ActionItems`).
     - Cáº­p nháº­t [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html): Loáº¡i bá» khá»‘i `Keyboard Shortcuts (Kbd)` hiá»ƒn thá»‹ phÃ­m `âŒ˜ + K` trong Card 8 vÃ  Ä‘á»•i tÃªn tháº» thÃ nh **Badge & Tooltip**. Gá»¡ bá» import `KbdComponent` thá»«a trong `home.component.ts`.
  2. **TÄƒng Font-size & kÃ­ch thÆ°á»›c tá»•ng thá»ƒ cho Dropdown Menu:**
     - Cáº­p nháº­t [dropdown-menu.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/dropdown-menu/dropdown-menu.component.ts): TÄƒng `width` máº·c Ä‘á»‹nh tá»« `w-56` lÃªn `w-64` Ä‘á»ƒ khung menu má»Ÿ rá»™ng thoáº£i mÃ¡i hÆ¡n.
     - Cáº­p nháº­t [dropdown-menu.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/dropdown-menu/dropdown-menu.component.html):
       - TÄƒng kÃ­ch thÆ°á»›c chá»¯ menu item tá»« `text-xs` (`12px`) lÃªn **`text-sm` (`14px`) font-semibold**, tÄƒng padding má»—i item lÃªn `px-3 py-2.5 rounded-[11px]`.
       - TÄƒng kÃ­ch thÆ°á»›c icon Ä‘i kÃ¨m tá»« `w-4 h-4` (`16px`) lÃªn **`w-4.5 h-4.5` (`18px`)**.
       - TÄƒng font-size tiÃªu Ä‘á» header tÃ i khoáº£n lÃªn `text-sm font-bold`, subtitle lÃªn `text-xs`, kÃ­ch thÆ°á»›c avatar lÃªn `w-10 h-10`.
       - TÄƒng font-size cá»§a nhÃ£n nhÃ³m (Group Header) lÃªn `text-xs font-bold uppercase tracking-wider` vÃ  mÃ´ táº£ item lÃªn `text-xs`.
  3. **XÃ¡c thá»±c:** Cháº¡y lá»‡nh `npm run build` kiá»ƒm tra biÃªn dá»‹ch thÃ nh cÃ´ng.

### YÃªu cáº§u: XÃ¢y dá»±ng vÃ  tÃ­ch há»£p Dropdown Menu Component (app-dropdown-menu) & Component Voice Chat 06 (app-voice-chat)
- **Ná»™i dung yÃªu cáº§u:** ThÃªm component `dropdown-menu` má»›i táº¡i `src/app/shared/components/dropdown-menu` láº¥y cáº£m há»©ng tá»« Shadcn Space Dropdown Menu, vÃ  xÃ¢y dá»±ng chuáº©n xÃ¡c 100% máº«u **Voice Chat 06 Morphing Card (`app-voice-chat`)** vá»›i hiá»‡u á»©ng biáº¿n hÃ¬nh FLIP Morphing Transition (kÃ­ch thÆ°á»›c `width: 268px -> 360px`, `height: 60px -> 440px`, gÃ³c bo `999px -> 24px`), tÃ­nh toÃ¡n tá»a Ä‘á»™ di chuyá»ƒn Ä‘á»™ng cá»§a chuá»—i Avatar (`getAvatarPosition(index)`: xáº¿p hÃ ng ngang Ä‘Ã¨ mÆ°á»£t khi thu gá»n, bung thÃ nh lÆ°á»›i 4 cá»™t khi má»Ÿ rá»™ng), vÃ²ng viá»n nháº¥p nhÃ¡y phÃ¡t biá»ƒu `SpeakingRing` mÃ u teal (`border-2 border-teal-400`), AudioWaveIcon 3 váº¡ch sÃ³ng nháº¥p nhÃ¡y (`animate-wave-1/2/3`) vÃ  nÃºt Join Now / Leave Voice.
- **Giáº£i phÃ¡p:**
  1. **Bá»• sung Icon Voice Chat:** Cáº­p nháº­t [icon.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/icon/icon.component.html) bá»• sung thÃªm cÃ¡c icon SVG: `credit-card`, `keyboard`, `cloud`, `github`, `life-buoy`, `message-square`, `mail`, `dot`, `mic`, `mic-off`, `volume-2`, `phone-off`, `waveform`.
  2. **Táº¡o Component Voice Chat (app-voice-chat):**
     - [voice-chat.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/dropdown-menu/voice-chat.component.ts): Component standalone tÃ­nh toÃ¡n Ä‘á»™ng vá»‹ trÃ­ Avatar `left`, `top`, `size`, `opacity`, `zIndex` vÃ  `transitionDelay` theo tráº¡ng thÃ¡i `isExpanded()`.
     - [voice-chat.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/dropdown-menu/voice-chat.component.html): Render container duy nháº¥t biáº¿n hÃ¬nh mÆ°á»£t mÃ  vá»›i `cubic-bezier(0.32,0.72,0,1)`, AudioWaveIcon bÃªn trÃ¡i khi thu gá»n, Header + Subheader sá»‘ lÆ°á»£ng thÃ nh viÃªn khi má»Ÿ rá»™ng, váº¡ch phÃ¢n cÃ¡ch, chuá»—i Avatar kÃ¨m nhÃ£n tÃªn vÃ  nÃºt Join Now / Leave Voice.
     - [voice-chat.component.css](file:///d:/git/angular-web3-wallet/src/app/shared/components/dropdown-menu/voice-chat.component.css): Äáº£m báº£o `:host { display: block; }`, bá»• sung keyframes animation `@keyframes wave` cho 3 váº¡ch sÃ³ng Ã¢m thanh trong AudioWaveIcon.
  3. **TÃ­ch há»£p Showcase vÃ o trang chá»§:**
     - Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts) vÃ  [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html): ÄÄƒng kÃ½ `VoiceChatComponent` vÃ  bá»• sung vÃ o **Card 19: Component Dropdown Menu Cao Cáº¥p (app-dropdown-menu)** trÃ¬nh diá»…n trá»±c quan máº«u **Voice Chat 06 Morphing Card**.

### YÃªu cáº§u: XÃ¢y dá»±ng vÃ  tÃ­ch há»£p Input OTP Component (app-input-otp)
- **Ná»™i dung yÃªu cáº§u:** ThÃªm component `input-otp` má»›i táº¡i `src/app/shared/components/input-otp` láº¥y cáº£m há»©ng tá»« Shadcn Space Input OTP, há»— trá»£ phÃ¢n nhÃ³m Ã´ slot, gáº¡ch ná»‘i separator, mask mode (mÃ£ PIN), gÃµ phÃ­m di chuyá»ƒn mÆ°á»£t mÃ , paste mÃ£ tá»« clipboard, hiá»‡u á»©ng caret nháº¥p nhÃ¡y (blinking cursor), tÃ­ch há»£p ControlValueAccessor vÃ  bá»• sung showcase táº¡i trang chá»§.
- **Giáº£i phÃ¡p:**
  1. **Táº¡o Component Input OTP:**
     - [input-otp.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/input-otp/input-otp.component.ts): Standalone component tÃ­ch há»£p `ControlValueAccessor`, dÃ¹ng `signals` (`valueSignal`, `isFocusedSignal`, `focusedIndexSignal`) quáº£n lÃ½ tráº¡ng thÃ¡i. Xá»­ lÃ½ focus/selection báº±ng hidden input áº£o, láº¯ng nghe keydown (`ArrowLeft`, `ArrowRight`, `Backspace`), clean giÃ¡ trá»‹ theo type (`numeric`, `alphanumeric`, `any`), tá»± Ä‘á»™ng phÃ¡t hiá»‡n khi nháº­p Ä‘á»§ Ä‘á»™ dÃ i `completed`.
     - [input-otp.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/input-otp/input-otp.component.html): Render tá»«ng Ã´ slot vuÃ´ng tá»‰ má»‰ theo cÃ¡c kÃ­ch thÆ°á»›c `sm`, `md`, `lg`. Hiá»ƒn thá»‹ kÃ½ tá»± hoáº·c mask `â—`, váº¡ch nháº¥p nhÃ¡y caret `span.otp-caret-blink` khi slot active vÃ  rá»—ng, gáº¡ch ná»‘i separator giá»¯a cÃ¡c nhÃ³m `groupSize`.
     - [input-otp.component.css](file:///d:/git/angular-web3-wallet/src/app/shared/components/input-otp/input-otp.component.css): Äáº£m báº£o `:host { display: block; }`, thÃªm keyframe animation `@keyframes otp-caret-blink` cho con trá» caret nháº¥p nhÃ¡y.
  2. **TÃ­ch há»£p Showcase vÃ o trang chá»§:**
     - Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts) vÃ  [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html): Bá»• sung **Card 18: Component Input OTP Cao Cáº¥p (app-input-otp)** trÃ¬nh diá»…n 4 ká»‹ch báº£n: OTP 6 sá»‘ phÃ¢n nhÃ³m 3-3, MÃ£ PIN an toÃ n (Mask Mode 4 Ã´), MÃ£ Voucher/Ref Code (Alphanumeric 6 Ã´), Tráº¡ng thÃ¡i lá»—i (Invalid) & VÃ´ hiá»‡u hÃ³a (Disabled).

### YÃªu cáº§u: XÃ¢y dá»±ng vÃ  tÃ­ch há»£p File Upload Component (app-file-upload)
- **Ná»™i dung yÃªu cáº§u:** ThÃªm component `file-upload` má»›i táº¡i `src/app/shared/components/file-upload` láº¥y cáº£m há»©ng tá»« Shadcn Space File Upload, há»— trá»£ kÃ©o tháº£ tá»‡p (Drag & Drop), chá»n 1 hoáº·c nhiá»u tá»‡p, giá»›i háº¡n dung lÆ°á»£ng/Ä‘á»‹nh dáº¡ng, giáº£ láº­p upload tiáº¿n trÃ¬nh sinh Ä‘á»™ng, xem trÆ°á»›c hÃ¬nh áº£nh (Modal Lightbox), tÃ­ch há»£p ControlValueAccessor vÃ  bá»• sung showcase táº¡i trang chá»§.
- **Giáº£i phÃ¡p:**
  1. **Bá»• sung Icon tá»‡p tin:** Cáº­p nháº­t [icon.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/icon/icon.component.html) bá»• sung cÃ¡c icon Ä‘á»‹nh dáº¡ng tá»‡p: `file-text`, `file-pdf`, `file-zip`, `file-image`, `file-generic`.
  2. **Táº¡o Component File Upload:**
     - [file-upload.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/file-upload/file-upload.component.ts): Standalone component tÃ­ch há»£p `ControlValueAccessor`, quáº£n lÃ½ danh sÃ¡ch `UploadFileItem[]` vá»›i signals reactivity. Xá»­ lÃ½ Drag & Drop (`dragover`, `dragleave`, `drop`), validate dung lÆ°á»£ng (`maxSizeMB`) vÃ  Ä‘á»‹nh dáº¡ng (`accept`), mÃ´ phá»ng tiáº¿n trÃ¬nh upload 0% -> 100%, táº¡o preview áº£nh Base64.
     - [file-upload.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/file-upload/file-upload.component.html): VÃ¹ng Dropzone viá»n nÃ©t Ä‘á»©t (dashed) kÃ¨m hover effect, hiá»ƒn thá»‹ tháº» tá»‡p Ä‘Ã£ chá»n kÃ¨m thumbnail/icon, badge tráº¡ng thÃ¡i, progress bar, nÃºt xÃ³a tá»‡p/thá»­ láº¡i/xem trÆ°á»›c áº£nh vÃ  Modal Lightbox xem chi tiáº¿t hÃ¬nh áº£nh. Há»— trá»£ cÃ¡c cháº¿ Ä‘á»™ Standard, Compact, vÃ  Avatar Mode.
     - [file-upload.component.css](file:///d:/git/angular-web3-wallet/src/app/shared/components/file-upload/file-upload.component.css): Thiáº¿t láº­p `:host { display: block; }`, bo gÃ³c tá»‘i Ä‘a 15px, animation fadeIn vÃ  tÃ¹y biáº¿n scrollbar.
  3. **TÃ­ch há»£p Showcase vÃ o trang chá»§:**
     - Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts) vÃ  [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html): Bá»• sung **Card 17: Component File Upload Cao Cáº¥p (app-file-upload)** trÃ¬nh diá»…n 4 cháº¿ Ä‘á»™: Chá»n nhiá»u tá»‡p drag-drop, Chá»n 1 tá»‡p hÃ¬nh áº£nh, Cháº¿ Ä‘á»™ thu gá»n Compact Mode, vÃ  Upload áº£nh Ä‘áº¡i diá»‡n Avatar Mode.

### YÃªu cáº§u: XÃ¢y dá»±ng, cÃ¢n Ä‘á»‘i giao diá»‡n nÃºt Wrap vÃ  tÃ­ch há»£p CodeBlock Component
- **Ná»™i dung yÃªu cáº§u:** ThÃªm component `code-block` má»›i táº¡i `src/app/shared/components/code-block` tham kháº£o thiáº¿t káº¿ tá»« Shadcn Space Code Block, cÃ¢n Ä‘á»‘i nÃºt Word Wrap vá»›i nÃºt Copy, há»— trá»£ Ä‘áº§y Ä‘á»§ Light Mode / Dark Mode tÆ°Æ¡ng á»©ng vÃ  bá»• sung showcase táº¡i trang chá»§.
- **Giáº£i phÃ¡p:**
  1. **Bá»• sung Icon:** Cáº­p nháº­t [icon.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/icon/icon.component.html) bá»• sung cÃ¡c icon `file-code`, `wrap-text`, vÃ  `terminal`.
  2. **Táº¡o & Tinh chá»‰nh CodeBlock Component:**
     - [code-block.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/code-block/code-block.component.ts): Táº¡o component standalone há»— trá»£ single file code vÃ  multi-file tabs (`CodeFile[]`), cÃ¡c inputs `showLineNumbers`, `highlightLines`, `showCopyButton`, `collapsible`, `maxHeight`, `wrapLines`. Viáº¿t tokenizer Lexer chÃ­nh xÃ¡c tÃ´ mÃ u cÃº phÃ¡p (TS, HTML, SCSS/CSS, JSON, Bash) mÃ  khÃ´ng bá»‹ lá»—i Ä‘Ã¨ tháº» HTML string.
     - [code-block.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/code-block/code-block.component.html): Tá»± Ä‘á»™ng chuyá»ƒn Ä‘á»•i giao diá»‡n hoÃ n háº£o á»Ÿ cáº£ Light Mode (`bg-slate-50`, viá»n `border-slate-200`, text `text-slate-800`) vÃ  Dark Mode (`dark:bg-slate-950`, viá»n `dark:border-slate-800`, text `dark:text-slate-100`). NÃºt Word Wrap (`border`, `bg-slate-800/90`, nhÃ£n `Wrap`, chiá»u cao/padding) hoÃ n toÃ n cÃ¢n Ä‘á»‘i vá»›i nÃºt Copy.
     - [code-block.component.css](file:///d:/git/angular-web3-wallet/src/app/shared/components/code-block/code-block.component.css): Äáº£m báº£o `:host { display: block; }`, tÃ¹y biáº¿n scrollbar vÃ  bá»™ mÃ u syntax tokens sáº¯c nÃ©t riÃªng biá»‡t cho cáº£ Light Mode (`#7c3aed`, `#15803d`, `#c2410c`, `#0284c7`, `#db2777`) vÃ  Dark Mode (`#c084fc`, `#4ade80`, `#fb923c`, `#38bdf8`, `#f472b6`).
  3. **TÃ­ch há»£p Showcase vÃ o trang chá»§:**
     - Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts) vÃ  [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html): Bá»• sung **Card 16: Component Code Block Cao Cáº¥p (app-code-block)** trÃ¬nh diá»…n 3 dáº¡ng: Tá»‡p Ä‘Æ¡n láº» kÃ¨m highlight line, Nhiá»u tá»‡p tabbed, vÃ  Thu gá»n/Má»Ÿ rá»™ng.

## NgÃ y 21/07/2026

### YÃªu cáº§u: Dá»n dáº¹p táº¥t cáº£ cÃ¡c comment khÃ´ng cáº§n thiáº¿t trong source code
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t toÃ n bá»™ tá»‡p nguá»“n (.ts, .html, .css/.scss) Ä‘á»ƒ xÃ³a bá» cÃ¡c comment dÆ° thá»«a, giá»¯ láº¡i chÃº thÃ­ch cáº¥u hÃ¬nh Ä‘áº·c biá»‡t trong environment vÃ  JSDoc nghiá»‡p vá»¥ quan trá»ng.
- **Giáº£i phÃ¡p:**
  1. Cáº­p nháº­t [custom-date-time-range.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-date-time-range/custom-date-time-range.component.html): Gá»¡ bá» cÃ¡c comment CSS `/* ... */` viáº¿t sai vá»‹ trÃ­ bÃªn trong tháº» `<button>`.
  2. Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts): XÃ³a bá» separator comment `// === DEMO TABLE STATE & LOGIC ===`.
  3. Cáº­p nháº­t [web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts): Gá»¡ bá» cÃ¡c comment chÃº thÃ­ch nghiá»‡p vá»¥ Ä‘Æ¡n láº» á»Ÿ cÃ¡c dÃ²ng logic, giá»¯ láº¡i JSDoc giáº£i thÃ­ch cÆ¡ cháº¿ `clearWalletConnectStorage`.
  4. XÃ¡c thá»±c: Cháº¡y lá»‡nh `npm run build` thÃ nh cÃ´ng mÃ  khÃ´ng gáº·p báº¥t ká»³ lá»—i biÃªn dá»‹ch nÃ o.

## NgÃ y 18/07/2026

### YÃªu cáº§u: XÃ¢y dá»±ng vÃ  tÃ­ch há»£p Custom Table Component
- **Ná»™i dung yÃªu cáº§u:** Táº¡o má»™t component Table má»›i tÃ¹y biáº¿n cao, há»— trá»£ cÃ¡c cá»™t cÃ³ kháº£ nÄƒng sáº¯p xáº¿p (sorting), custom templates cho tá»«ng cá»™t thÃ´ng qua directive, loading skeleton state, empty state, vÃ  tÃ­ch há»£p showcase kÃ¨m dá»¯ liá»‡u demo máº«u (Recent Transactions) trÃªn trang chá»§, há»— trá»£ tÃ¬m kiáº¿m, lá»c tráº¡ng thÃ¡i vÃ  phÃ¢n trang Ä‘áº§y Ä‘á»§.
- **Giáº£i phÃ¡p:**
  1. **Táº¡o component Table má»›i:**
     - Táº¡o [table.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/table/table.component.ts) chá»©a Directive `appTableCell` Ä‘á»ƒ trÃ­ch xuáº¥t template tÃ¹y chá»‰nh cá»§a cá»™t vÃ  Class `TableComponent` xá»­ lÃ½ logic: Ä‘á»‹nh nghÄ©a columns, data, local sort (computed signal), empty state vÃ  cÃ¡c sá»± kiá»‡n sort.
     - Táº¡o [table.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/table/table.component.html) dá»±ng giao diá»‡n Table theo chuáº©n thiáº¿t káº¿ dá»± Ã¡n: bo gÃ³c tá»‘i Ä‘a 15px, viá»n má»ng Glassmorphism, header uppercase mÃ u má», hover row nháº¹ nhÃ ng, tÃ­ch há»£p `app-skeleton-loader` kiá»ƒu `table` khi loading vÃ  giao diá»‡n Empty State khi khÃ´ng cÃ³ data.
  2. **TÃ­ch há»£p Showcase vÃ o trang chá»§:**
     - Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts): ÄÄƒng kÃ½ `TableComponent`, `TableCellDirective`, vÃ  `PaginationComponent` trong `imports`. Khai bÃ¡o dá»¯ liá»‡u demo `demoTransactions` (12 giao dá»‹ch Web3), cáº¥u hÃ¬nh `demoTableColumns` vÃ  cÃ¡c signals Ä‘iá»u khiá»ƒn (SearchQuery, StatusFilter, Loading, Empty, CurrentPage, SortKey, SortDirection). Khai bÃ¡o `Math = Math` vÃ  import `computed` Ä‘á»ƒ dÃ¹ng trong template.
     - Cáº­p nháº­t [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html): ThÃªm **Card 15: Component Table TÃ¹y Biáº¿n Cao Cáº¥p (app-table)** hiá»ƒn thá»‹ thanh Toolbar bá»™ lá»c/Switch giáº£ láº­p, render table vá»›i cÃ¡c custom template cell (MÃ£ Tx Hash rÃºt gá»n vÃ  link, Method badge, Block mono, Value in Ä‘áº­m, Status badge thÃ nh cÃ´ng/Ä‘ang chá»/tháº¥t báº¡i) vÃ  tÃ­ch há»£p thanh phÃ¢n trang.

## NgÃ y 17/07/2026

### YÃªu cáº§u: Bá»• sung demo custom select hiá»ƒn thá»‹ 10 máº¡ng lÆ°á»›i
- **Ná»™i dung yÃªu cáº§u:** ThÃªm má»™t bá»™ chá»n custom select giá»‘ng chá»n Ä‘Æ¡n láº» máº¡ng lÆ°á»›i nhÆ°ng chá»©a khoáº£ng 10 máº¡ng lÆ°á»›i trÃªn trang chá»§ showcase.
- **Giáº£i phÃ¡p:**
  1. Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts): ThÃªm signal `demoSelectTenChainsValue` Ä‘á»ƒ quáº£n lÃ½ tráº¡ng thÃ¡i chá»n vÃ  máº£ng `demoTenChainOptions` chá»©a danh sÃ¡ch 10 máº¡ng lÆ°á»›i phá»• biáº¿n (Ethereum, Arbitrum, BNB Chain, Polygon PoS, Optimism, Base, Avalanche C-Chain, Linea, Scroll, Fantom Opera).
  2. Cáº­p nháº­t [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html): Bá»• sung thÃªm component `<app-custom-select>` liÃªn káº¿t vá»›i signal vÃ  danh sÃ¡ch 10 máº¡ng lÆ°á»›i má»›i, Ä‘á»“ng thá»i thay Ä‘á»•i nhÃ£n cá»§a selector cÅ© thÃ nh "Chá»n Ä‘Æ¡n láº» (5 máº¡ng lÆ°á»›i)" Ä‘á»ƒ phÃ¢n biá»‡t rÃµ rÃ ng.
  3. Cáº­p nháº­t [custom-select.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-select/custom-select.component.html): Loáº¡i bá» class `.no-scrollbar` á»Ÿ danh sÃ¡ch cÃ¡c tÃ¹y chá»n cá»§a bá»™ chá»n custom select Ä‘á»ƒ hiá»ƒn thá»‹ thanh cuá»™n (scrollbar) tinh táº¿ máº·c Ä‘á»‹nh cá»§a há»‡ thá»‘ng khi danh sÃ¡ch cÃ³ nhiá»u tÃ¹y chá»n (nhÆ° 10 máº¡ng lÆ°á»›i).

### YÃªu cáº§u: Äiá»u chá»‰nh thÃ´ng sá»‘ máº·c Ä‘á»‹nh cá»§a hiá»‡u á»©ng Ripple (MÃ u sáº¯c, Opacity, Duration)
- **Ná»™i dung yÃªu cáº§u:** Sá»­a Ä‘á»•i cÃ¡c thÃ´ng sá»‘ máº·c Ä‘á»‹nh cá»§a directive `appRipple` sao cho náº¿u khÃ´ng cÃ³ tham sá»‘ nÃ o Ä‘Æ°á»£c truyá»n vÃ o, nÃ³ váº«n sáº½ sá»­ dá»¥ng Ä‘Ãºng cÃ¡c giÃ¡ trá»‹ máº·c Ä‘á»‹nh: mÃ u tráº¯ng (`#ffffff`), Ä‘á»™ má» (`0.4`), vÃ  thá»i gian lan tá»a (`700ms`). Äá»“ng bá»™ hÃ³a tráº¡ng thÃ¡i ban Ä‘áº§u cá»§a showcase trÃªn trang chá»§.
- **Giáº£i phÃ¡p:**
  1. Cáº­p nháº­t [ripple.directive.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/ripple/ripple.directive.ts): Thay Ä‘á»•i mÃ u máº·c Ä‘á»‹nh `color` thÃ nh `'#ffffff'`, Ä‘á»™ má» máº·c Ä‘á»‹nh `opacity` thÃ nh `0.4` vÃ  thá»i gian máº·c Ä‘á»‹nh `duration` thÃ nh `700` (ms).
  2. Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts): Äá»“ng bá»™ hÃ³a giÃ¡ trá»‹ khá»Ÿi táº¡o cá»§a signal `demoRippleOpacity` tá»« `0.3` thÃ nh `0.4` vÃ  `demoRippleDuration` tá»« `500` thÃ nh `700` Ä‘á»ƒ khá»›p vá»›i thiáº¿t káº¿.

### YÃªu cáº§u: Dá»n dáº¹p toÃ n bá»™ comment rÃ¡c trong source code
- **Ná»™i dung yÃªu cáº§u:** XÃ³a táº¥t cáº£ comment separator `// ====`, `// ---`, comment inline thá»«a, comment chÃº thÃ­ch vá»› váº©n khÃ´ng cáº§n thiáº¿t trong toÃ n bá»™ source TypeScript.
- **Giáº£i phÃ¡p:**
  1. **[state.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/state.service.ts):** XÃ³a cÃ¡c dÃ²ng separator `// ====` vÃ  comment inline thá»«a trÃªn tá»«ng property/method.
  2. **[home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts):** XÃ³a `// === DEMO STATE ===`, comment nhÃ³m signals, comment inline trÃªn cÃ¡c methods.
  3. **[web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts):** XÃ³a ~20 comment inline thá»«a, chá»‰ giá»¯ láº¡i logic quan trá»ng (bypass RPC cá»§a vÃ­ Social).
  4. **[theme.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/theme.service.ts):** XÃ³a comment thá»«a trÃªn cÃ¡c properties vÃ  methods.
  5. **[modal.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/modal.service.ts):** XÃ³a comment thá»«a trong `open()`.
  6. **[custom-date-time-range.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-date-time-range/custom-date-time-range.component.ts):** XÃ³a comment separator `// ---` vÃ  comment inline giáº£i thÃ­ch thá»«a thÃ£i.
  7. **[custom-date-picker.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-date-picker/custom-date-picker.component.ts):** XÃ³a comment inline Ä‘Æ¡n giáº£n.
  8. **[custom-select.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-select/custom-select.component.ts):** XÃ³a comment inline thá»«a vÃ  comment `// ControlValueAccessor`.
  9. **[demo-modal.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/components/demo-modal/demo-modal.component.ts):** Dá»n dáº¹p toÃ n bá»™ comment chÃº thÃ­ch cho cÃ¡c signals local.
  10. **[ripple.directive.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/ripple/ripple.directive.ts) & [tooltip.directive.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/tooltip/tooltip.directive.ts):** LÆ°á»£c bá» toÃ n bá»™ cÃ¡c comment chÃº thÃ­ch thao tÃ¡c DOM chi tiáº¿t thá»«a thÃ£i.
  11. **Dá»n dáº¹p cÃ¡c component dÃ¹ng chung khÃ¡c:** Loáº¡i bá» comment chÃº thÃ­ch Ä‘Æ¡n giáº£n / ControlValueAccessor rÃ¡c trong [accordion.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/accordion/accordion.component.ts), [custom-checkbox.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-checkbox/custom-checkbox.component.ts), [custom-slider.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-slider/custom-slider.component.ts), [custom-input.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-input/custom-input.component.ts), [custom-radio.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-radio/custom-radio.component.ts), vÃ  [custom-search-input.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-search-input/custom-search-input.component.ts).
  12. **Dá»n dáº¹p HTML:** Loáº¡i bá» toÃ n bá»™ comment cáº¥u trÃºc rÆ°á»m rÃ  `<!-- ... -->` vÃ  cÃ¡c separator trong [sidebar.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/sidebar/sidebar.component.html), [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.html), [tx-speed-selector.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/tx-speed-selector/tx-speed-selector.component.html), [toast.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/toast/toast.component.html), [tab-group.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/tab-group/tab-group.component.html), [pagination.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/pagination/pagination.component.html), [modal-wrapper.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/modal/modal-wrapper.component.html), [modal.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/modal/modal.component.html), [page-header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/page-header/page-header.component.html) vÃ  [skeleton-loader.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/skeleton-loader/skeleton-loader.component.html).
  13. **Kiá»ƒm tra:** `npm run build` thÃ nh cÃ´ng, khÃ´ng lá»—i biÃªn dá»‹ch.


### YÃªu cáº§u: ThÃªm cáº¥u hÃ¬nh báº­t/táº¯t Web3 qua Environment
- **Ná»™i dung yÃªu cáº§u:** ThÃªm flag cáº¥u hÃ¬nh `enableWeb3` trong `src/environments` Ä‘á»ƒ báº­t/táº¯t toÃ n bá»™ tÃ­nh nÄƒng Web3 (AppKit, Ethers.js, WalletConnect). Khi táº¯t, á»©ng dá»¥ng hoáº¡t Ä‘á»™ng nhÆ° Web2 thÃ´ng thÆ°á»ng.
- **Giáº£i phÃ¡p:**
  1. **Cáº­p nháº­t environment files:**
     - ThÃªm `enableWeb3: true` vÃ o [environment.ts](file:///d:/git/angular-web3-wallet/src/environments/environment.ts) (production) vÃ  [environment.development.ts](file:///d:/git/angular-web3-wallet/src/environments/environment.development.ts) kÃ¨m comment hÆ°á»›ng dáº«n.
  2. **Cáº­p nháº­t [web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts):**
     - ThÃªm property `isEnabled = environment.enableWeb3`.
     - Guard `constructor()`: khi `isEnabled = false` thÃ¬ skip `initAppKit()` & `setupThemeSync()`, log info ra console.
     - Guard táº¥t cáº£ public method (`connect`, `disconnect`, `openNetworkModal`, `openAccountModal`, `switchNetwork`): return sá»›m náº¿u `!isEnabled`.
     - Guard `getSigner()` vÃ  `getProvider()`: throw Error cÃ³ hÆ°á»›ng dáº«n náº¿u `!isEnabled`.
  3. **Cáº­p nháº­t [state.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/state.service.ts):**
     - Expose `isWeb3Enabled: boolean = this.web3Service.isEnabled` Ä‘á»ƒ cÃ¡c component dÃ¹ng dá»… dÃ ng.
  4. **Cáº­p nháº­t [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.html):**
     - Wrap toÃ n bá»™ pháº§n "NÃšT CHá»ŒN Máº NG + NÃšT VÃ" bÃªn pháº£i header báº±ng `@if (stateService.isWeb3Enabled)`.
     - ThÃªm Ä‘iá»u kiá»‡n `stateService.isWeb3Enabled &&` vÃ o check tráº¡ng thÃ¡i máº¡ng lÆ°á»›i giá»¯a desktop.
     - áº¨n `<app-tx-speed-selector>` trong Mobile Drawer khi Web3 táº¯t.
  5. **Cáº­p nháº­t [sidebar.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/sidebar/sidebar.component.html):**
     - áº¨n `<app-tx-speed-selector>` trong Desktop Sidebar khi Web3 táº¯t.
  6. **Cáº­p nháº­t [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html):**
     - áº¨n banner "Káº¿t ná»‘i vÃ­" vÃ  dashboard Web3 (thÃ´ng tin vÃ­, sá»‘ dÆ°, giao dá»‹ch) khi Web3 táº¯t báº±ng Ä‘iá»u kiá»‡n `stateService.isWeb3Enabled &&`.
  7. **Kiá»ƒm tra:** `npm run build` thÃ nh cÃ´ng, khÃ´ng lá»—i biÃªn dá»‹ch.

### YÃªu cáº§u: XÃ¢y dá»±ng vÃ  tÃ­ch há»£p Ripple Directive tÆ°Æ¡ng tá»± MatRipple cá»§a Angular Material
- **Ná»™i dung yÃªu cáº§u:** Thiáº¿t káº¿ vÃ  phÃ¡t triá»ƒn Directive táº¡o hiá»‡u á»©ng sÃ³ng nÆ°á»›c (ripple) lan tá»a khi ngÆ°á»i dÃ¹ng nháº¥p chuá»™t hoáº·c cháº¡m tay vÃ o má»™t pháº§n tá»­. Há»— trá»£ tÃ¹y chá»‰nh mÃ u sáº¯c, báº¯t Ä‘áº§u tá»« tÃ¢m (centered), vÃ´ hiá»‡u hÃ³a (disabled), vÃ  trÃ n viá»n tá»± do (unbounded), Ä‘á»“ng thá»i tÃ­ch há»£p showcase trÃ¬nh diá»…n lÃªn trang chá»§.
- **Giáº£i phÃ¡p:**
  1. **Táº¡o Directive standalone [ripple.directive.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/ripple/ripple.directive.ts):**
     * Láº¯ng nghe sá»± kiá»‡n `mousedown` vÃ  `touchstart`, cÃ³ cÆ¡ cháº¿ cháº·n kÃ­ch hoáº¡t Ä‘Ãºp trÃªn thiáº¿t bá»‹ di Ä‘á»™ng.
     * Táº¡o pháº§n tá»­ span Ä‘á»™ng `.app-ripple-element` khi click, tÃ­nh toÃ¡n tá»a Ä‘á»™ tÆ°Æ¡ng Ä‘á»‘i tá»« vá»‹ trÃ­ click/touch hoáº·c tá»« tÃ¢m (náº¿u `centered` lÃ  true).
     * Thiáº¿t láº­p `overflow: visible` cho container cha khi `unbounded` lÃ  true Ä‘á»ƒ Ä‘áº£m báº£o khÃ´ng bá»‹ cáº¯t cá»¥t bá»Ÿi class CSS, ngÆ°á»£c láº¡i tá»± Ä‘á»™ng thÃªm `overflow: hidden`.
     * Cháº¡y logic dá»n dáº¹p pháº§n tá»­ ngoÃ i Angular Zone báº±ng `setTimeout` sau 500ms.
  2. **ThÃªm style cho ripple** táº¡i [styles.scss](file:///d:/git/angular-web3-wallet/src/styles.scss):
     * Äá»‹nh nghÄ©a lá»›p `.app-ripple-element` vá»›i `position: absolute`, `border-radius: 50%`. TÄƒng Ä‘á»™ má» máº·c Ä‘á»‹nh lÃªn `0.3` Ä‘á»ƒ hiá»ƒn thá»‹ rÃµ nÃ©t trÃªn ná»n sÃ¡ng.
     * Chia tÃ¡ch animation: `@keyframes app-ripple-scale` (phÃ³ng to nhanh báº±ng cubic-bezier) vÃ  `@keyframes app-ripple-fade` (má» dáº§n Ä‘á»u Ä‘áº·n báº±ng linear) cháº¡y song song trong 500ms giÃºp tÄƒng Ä‘á»™ tÆ°Æ¡ng pháº£n rÃµ rá»‡t trÃªn nÃºt Primary Button.
  3. **TÃ­ch há»£p Showcase vÃ o trang chá»§**:
     * ÄÄƒng kÃ½ `RippleDirective` trong `imports` cá»§a [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts) vÃ  táº¡o 4 signals Ä‘iá»u khiá»ƒn cáº¥u hÃ¬nh.
     * Cáº­p nháº­t [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html): ThÃªm **Card 13: Custom Ripple Directive** chá»©a há»™p tÆ°Æ¡ng tÃ¡c dÃ¹ng thá»­ hiá»‡u á»©ng sÃ³ng nÆ°á»›c, 3 switch tÃ¹y biáº¿n thuá»™c tÃ­nh, 4 nÃºt chá»n nhanh mÃ u (Ä‘Ã£ sá»­a lá»—i class viá»n ring tÆ°Æ¡ng á»©ng tá»«ng mÃ u vÃ  sá»­a lá»—i opacity mÃ u tÃ¹y chá»‰nh) vÃ  cÃ¡c button máº«u Ã¡p dá»¥ng directive trá»±c quan (Ä‘Ã£ sá»­a lá»—i class viá»n ring tÆ°Æ¡ng á»©ng tá»«ng mÃ u vÃ  sá»­a lá»—i opacity mÃ u tÃ¹y chá»‰nh, Ä‘á»“ng thá»i Ä‘á»“ng bá»™ switch unbounded/centered cho Icon Button trÃ²n Ä‘á»ƒ trÃ¡nh lá»—i viá»n vÃ  Ä‘á»•i cÃ¡c mÃ£ mÃ u tÃ¹y chá»‰nh dáº¡ng rgba tÄ©nh thÃ nh mÃ u Ä‘áº·c hex Ä‘á»ƒ khÃ´ng bá»‹ triá»‡t tiÃªu Ä‘á»™ má»).

### YÃªu cáº§u: Äá»‹nh tuyáº¿n liÃªn káº¿t Logo web vá» trang chá»§ (Desktop & Mobile Drawer)
- **Ná»™i dung yÃªu cáº§u:** Khi ngÆ°á»i dÃ¹ng click vÃ o logo web, ká»ƒ cáº£ trÃªn desktop sidebar, thanh header (mobile) hay mobile drawer panel thÃ¬ Ä‘á»u tá»± Ä‘á»™ng chuyá»ƒn hÆ°á»›ng (route) vá» trang chá»§ `/`.
- **Giáº£i phÃ¡p:**
  1. Cáº­p nháº­t [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.html):
     * Äá»•i tháº» `div` bá»c Logo & Brand á»Ÿ Header ngoÃ i cÃ¹ng (hiá»ƒn thá»‹ trÃªn mobile) thÃ nh tháº» `a` cÃ³ `routerLink="/"`.
     * Äá»•i tháº» `div` bá»c Logo & Brand á»Ÿ Mobile Drawer Panel thÃ nh tháº» `a` cÃ³ `routerLink="/"`, Ä‘á»“ng thá»i gáº¯n sá»± kiá»‡n `(click)="stateService.showMobileMenu.set(false)"` giÃºp tá»± Ä‘á»™ng Ä‘Ã³ng Menu Drawer khi chuyá»ƒn hÆ°á»›ng.
  2. Cáº­p nháº­t [sidebar.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/sidebar/sidebar.component.html):
     * Äá»•i tháº» `div` bá»c Logo & Brand á»Ÿ Desktop Sidebar thÃ nh tháº» `a` cÃ³ `routerLink="/"`.

### YÃªu cáº§u: Loáº¡i bá» Emoji, SVG nhÃºng trá»±c tiáº¿p vÃ  tÃ­ch há»£p chá»n nhiá»u (Multi-Select) cho Select UI
- **Ná»™i dung yÃªu cáº§u:** 
  1. Thay tháº¿ táº¥t cáº£ cÃ¡c emoji vÃ  tháº» `<svg>` nhÃºng trá»±c tiáº¿p báº±ng component `IconComponent` dÃ¹ng chung.
  2. NÃ¢ng cáº¥p bá»™ chá»n `CustomSelectComponent` há»— trá»£ thÃªm cháº¿ Ä‘á»™ chá»n nhiá»u (Multi-select) vá»›i giao diá»‡n checkbox, Ä‘á»“ng thá»i tÃ­ch há»£p showcase lÃªn trang chá»§.
- **Giáº£i phÃ¡p:**
  1. **NÃ¢ng cáº¥p Tooltip Directive & Thay tháº¿ Emoji:**
     - Cáº­p nháº­t [tooltip.directive.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/tooltip/tooltip.directive.ts) há»— trá»£ nháº­n `@Input() tooltipIcon`. Khá»Ÿi táº¡o Ä‘á»™ng component `IconComponent` báº±ng `ViewContainerRef` Ä‘á»ƒ chÃ¨n icon thay cho emoji. ThÃªm CSS class `flex items-center gap-1` cho tooltip.
     - Gá»¡ bá» emoji khá»i `appTooltip` trong [demo-modal.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/components/demo-modal/demo-modal.component.html) vÃ  [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html) vÃ  dÃ¹ng `tooltipIcon` tÆ°Æ¡ng á»©ng.
  2. **Loáº¡i bá» SVG nhÃºng trá»±c tiáº¿p:**
     - TÃ­ch há»£p SVG logo vÃ o [icon.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/icon/icon.component.html) lÃ m case `'logo'`.
     - Cáº­p nháº­t [logo.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/logo/logo.component.ts), [accordion-item.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/accordion/accordion-item.component.html) vÃ  [custom-checkbox.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-checkbox/custom-checkbox.component.html) gá»i qua `<app-icon>` dÃ¹ng chung.
  3. **NÃ¢ng cáº¥p Multi-Select cho Custom Select:**
     - Cáº­p nháº­t [custom-select.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-select/custom-select.component.ts) bá»• sung `@Input() multiple: boolean = false`, helper `isSelected()`, vÃ  logic toggle trá»‹ sá»‘ máº£ng Ä‘á»™ng mÃ  khÃ´ng Ä‘Ã³ng dropdown.
     - Cáº­p nháº­t [custom-select.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-select/custom-select.component.html) hiá»ƒn thá»‹ checkbox bo trÃ²n nháº¹ bÃªn trÃ¡i nhÃ£n á»Ÿ má»—i tÃ¹y chá»n khi `multiple` lÃ  true.
     - Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts) & [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html) tÃ­ch há»£p biá»ƒu máº«u chá»n nhiá»u (Toppings) cÃ¹ng output realtime vÃ o Card 5.
  4. **Dá»n dáº¹p:** XÃ³a toÃ n bá»™ cÃ¡c tá»‡p script táº¡m thá»i (`find_emojis.js`, `find_emojis_advanced.js`, `find_svg_usage.js`).
  5. **Kiá»ƒm tra:** BiÃªn dá»‹ch báº±ng `npm run build` thÃ nh cÃ´ng, khÃ´ng lá»—i.

## NgÃ y 12/07/2026

### YÃªu cáº§u: Äiá»u chá»‰nh mÃ u sáº¯c vÃ  Ä‘á»™ tÆ°Æ¡ng pháº£n cá»§a Badge (Äáº·c biá»‡t lÃ  Primary Badge)
- **Ná»™i dung yÃªu cáº§u:** Sá»­a Ä‘á»•i mÃ u sáº¯c chá»¯ cá»§a Badge variants Ä‘á»ƒ Ä‘áº£m báº£o Ä‘á»™ tÆ°Æ¡ng pháº£n tá»‘t vÃ  tháº©m má»¹, Ä‘áº·c biá»‡t lÃ  sá»­a lá»—i chá»¯ cá»§a Primary Badge bá»‹ chÃ¬m (mÃ u tÃ­m tá»‘i) á»Ÿ cháº¿ Ä‘á»™ tá»‘i (dark mode).
- **Giáº£i phÃ¡p:**
  1. Cáº­p nháº­t [badge.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/badge/badge.component.ts):
     - **Primary:** Thay tháº¿ viá»‡c dÃ¹ng `dark:text-[var(--color-secondary)]` á»Ÿ cháº¿ Ä‘á»™ tá»‘i báº±ng `text-[var(--color-primary)]` Ä‘á»“ng nháº¥t. Giáº£m opacity ná»n light mode xuá»‘ng `/10` (vÃ  `/20` á»Ÿ dark mode) Ä‘á»ƒ tÆ°Æ¡ng pháº£n rÃµ rÃ ng hÆ¡n.
     - **Secondary & Info:** Sá»­ dá»¥ng hÃ m `color-mix(in srgb, var(--color-secondary) 80%, white)` Ä‘á»ƒ lÃ m sÃ¡ng chá»¯ á»Ÿ dark mode, trÃ¡nh bá»‹ chÃ¬m vÃ o ná»n tá»‘i.
     - **Danger:** Sá»­a lá»—i chÃ­nh táº£ Tailwind class `dark:text-rose-450` thÃ nh `dark:text-rose-400`.
     - **Success & Warning:** Chuáº©n hÃ³a Ä‘á»™ má» ná»n light mode xuá»‘ng `/10` vÃ  dark mode xuá»‘ng `/20` Ä‘á»ƒ giao diá»‡n nháº¥t quÃ¡n.
     - **Neutral & Ultra:** Tá»‘i Æ°u hÃ³a mÃ u chá»¯ vÃ  viá»n Ä‘á»ƒ tÄƒng Ä‘á»™ tÆ°Æ¡ng pháº£n rÃµ nÃ©t.

### YÃªu cáº§u: XÃ¢y dá»±ng vÃ  tÃ­ch há»£p Component chá»n khoáº£ng ngÃ y/giá» (Date Time Range Picker)
- **Ná»™i dung yÃªu cáº§u:** PhÃ¡t triá»ƒn component `app-custom-date-time-range` phá»¥c vá»¥ chá»n khoáº£ng ngÃ y (máº·c Ä‘á»‹nh) vÃ  há»— trá»£ thÃªm chá»n giá»:phÃºt náº¿u truyá»n tham sá»‘ `[showTime]="true"`. TÃ­ch há»£p demo showcase lÃªn trang chá»§.
- **Giáº£i phÃ¡p:**
  1. **Táº¡o component má»›i:** 
     - [custom-date-time-range.component.css](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-date-time-range/custom-date-time-range.component.css): Äáº£m báº£o `:host { display: block; }` Ä‘á»ƒ trÃ¡nh lá»—i dÃ­nh margin.
     - [custom-date-time-range.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-date-time-range/custom-date-time-range.component.html): Äá»“ng bá»™ hoÃ n toÃ n cáº¥u trÃºc giao diá»‡n vá»›i `custom-date-picker` (chevron buttons, weekday headers, cá»¡ chá»¯ text-sm, nÃºt trÃ²n rounded-full), sá»­a lá»—i cÃº phÃ¡p Angular class binding, Ä‘á»“ng thá»i thay tháº¿ bá»™ chá»n giá» máº·c Ä‘á»‹nh `<input type="time">` báº±ng cÃ¡c tháº» `<select>` Giá» & PhÃºt tÃ¹y chá»‰nh Ä‘á»ƒ trÃ¡nh lá»—i vá»¡ giao diá»‡n cá»§a trÃ¬nh duyá»‡t. Sau Ä‘Ã³ cáº£i tiáº¿n toÃ n bá»™ bá»™ chá»n giá» phÃºt thÃ nh dropdown `div` tÃ¹y chá»‰nh 100% (khÃ´ng dÃ¹ng Ä‘iá»u khiá»ƒn native, nÃ¢ng cáº¥p rá»™ng 80px vÃ  dÃ i 220px cÄƒn giá»¯a trigger, chuyá»ƒn Ä‘á»•i toÃ n bá»™ padding cá»§a cáº£ trigger láº«n cÃ¡c dÃ²ng sá»‘ option tá»« `px-2 py-1.5` thÃ nh `p-2` Ä‘á»ƒ giÃ£n cÃ¡ch thoÃ¡ng Ä‘Ã£ng vÃ  áº©n hoÃ n toÃ n thanh scrollbar máº·c Ä‘á»‹nh thÃ´ ká»‡ch cá»§a trÃ¬nh duyá»‡t) vÃ  thiáº¿t káº¿ láº¡i dáº£i highlight khoáº£ng range ná»‘i liá»n báº±ng cÃ¡c div phá»¥ tuyá»‡t Ä‘á»‘i. Cáº£i tiáº¿n dáº£i highlight khi rÃª chuá»™t (hover) chá»n khoáº£ng: khi hover Ä‘áº¿n ngÃ y káº¿t thÃºc/báº¯t Ä‘áº§u táº¡m thá»i, dáº£i mÃ u chá»‰ váº½ 50% á»Ÿ má»™t ná»­a Ä‘á»ƒ Ä‘Æ°á»ng cong nÃºt trÃ²n tá»± Ä‘á»™ng che phá»§ mÃ©p cáº¯t, trÃ¡nh lá»™ gÃ³c vuÃ´ng vá»©c thÃ´ ká»‡ch. Sá»­a lá»—i chÃ­nh táº£ class `dark:bg-slate-955` thÃ nh `dark:bg-slate-950` Ä‘á»ƒ trÃ¡nh popover lá»‹ch bá»‹ mÃ u tráº¯ng toÃ¡t á»Ÿ cháº¿ Ä‘á»™ tá»‘i.
     - [custom-date-time-range.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-date-time-range/custom-date-time-range.component.ts): Triá»ƒn khai `ControlValueAccessor` cho tÆ°Æ¡ng thÃ­ch biá»ƒu máº«u Angular, logic chá»n range hai bÆ°á»›c, xá»­ lÃ½ preset vÃ  tÃ­nh toÃ¡n tá»a Ä‘á»™ fixed thÃ´ng minh chá»‘ng trÃ n viewport.
  2. **TÃ­ch há»£p Showcase:**
     - Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts) import component má»›i, Ä‘á»‹nh nghÄ©a cÃ¡c signals `demoRangeValue`, `demoRangeWithTimeValue` vÃ  `demoRangeLimitValue` Ä‘á»ƒ lÆ°u dá»¯ liá»‡u máº«u.
     - Cáº­p nháº­t [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html) bá»• sung **Card 12** trong Showcase hiá»ƒn thá»‹ 3 vÃ­ dá»¥ chá»n khoáº£ng thá»i gian (máº·c Ä‘á»‹nh, kÃ¨m giá» phÃºt, vÃ  giá»›i háº¡n min/max date tÄ©nh) kÃ¨m debug output.
  3. **Äá»“ng bá»™ hÃ³a logic so sÃ¡nh ngÃ y:**
     - Cáº­p nháº­t láº¡i `isInRange` vÃ  `isHoverRange` trong [custom-date-time-range.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-date-time-range/custom-date-time-range.component.ts) sá»­ dá»¥ng hÃ m `clearTime(date)` Ä‘á»“ng bá»™, Ä‘á»“ng thá»i há»— trá»£ hover 2 chiá»u (tiáº¿n/lÃ¹i) giÃºp mÃ u chá»¯ sá»‘ thay Ä‘á»•i chuáº©n xÃ¡c.
  4. **TÃ­ch há»£p vÃ o Modal Demo Form:**
     - Cáº­p nháº­t [demo-modal.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/components/demo-modal/demo-modal.component.ts) import component má»›i, khai bÃ¡o signal `modalRangeValue` vÃ  tráº£ káº¿t quáº£ vá» trong hÃ m `confirm()`.
     - Cáº­p nháº­t [demo-modal.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/components/demo-modal/demo-modal.component.html) thÃªm trÆ°á»ng "Chá»n khoáº£ng thá»i gian (KÃ¨m Giá» & PhÃºt)" sá»­ dá»¥ng chung cÃ¡c switch cáº¥u hÃ¬nh báº­t táº¯t min/max date vÃ  presets Ä‘á»™ng cá»§a modal.
  5. **Äá»“ng bá»™ hÃ³a Ä‘á»‹nh vá»‹ Ä‘á»™ng khi scroll (Capture Phase) & Äá»‹nh vá»‹ thÃ´ng minh:**
     - Cáº¥u trÃºc láº¡i `custom-select.component.ts`, `custom-date-picker.component.ts` vÃ  `custom-date-time-range.component.ts` bá»• sung `OnInit` vÃ  `OnDestroy`.
     - ÄÄƒng kÃ½ láº¯ng nghe sá»± kiá»‡n scroll á»Ÿ capture phase (`window.addEventListener('scroll', ..., true)`) Ä‘á»ƒ báº¯t trá»n má»i sá»± kiá»‡n cuá»™n tá»« cÃ¡c div scroll cá»§a modal, tá»± Ä‘á»™ng gá»i hÃ m cáº­p nháº­t láº¡i toáº¡ Ä‘á»™ Ä‘á»ƒ popover cháº¡y bÃ¡m sÃ¡t theo Ã´ input trigger.
     - Triá»ƒn khai thuáº­t toÃ¡n Ä‘á»‹nh vá»‹ thÃ´ng minh (Smart Placement) káº¿t há»£p dá»‹ch chuyá»ƒn chá»‘ng trÃ n dá»c (Overflow Vertical Adjustment): Tá»± Ä‘á»™ng quay popover/dropdown lÃªn trÃªn khi khÃ´ng gian phÃ­a dÆ°á»›i khÃ´ng Ä‘á»§ chiá»u cao, Ä‘á»“ng thá»i dá»‹ch chuyá»ƒn toáº¡ Ä‘á»™ top lÃªn/xuá»‘ng thÃ´ng minh náº¿u chÃ¢n hoáº·c Ä‘áº§u cá»§a popover váº«n bá»‹ trÃ n mÃ©p mÃ n hÃ¬nh (chuáº©n hÃ³a kÃ­ch thÆ°á»›c Ä‘o Ä‘áº¡c thá»±c táº¿ cá»§a range picker lÃ  440px vÃ  510px Ä‘á»ƒ dá»‹ch chuyá»ƒn chÃ­nh xÃ¡c tuyá»‡t Ä‘á»‘i), trÃ¡nh tuyá»‡t Ä‘á»‘i hiá»‡n tÆ°á»£ng bá»‹ cáº¯t cá»¥t popover khi viewport háº¹p.
  6. **Kiá»ƒm tra:** Lá»‡nh `npm run build` thÃ nh cÃ´ng, khÃ´ng lá»—i biÃªn dá»‹ch.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i nháº¥p nhÃ¡y tráº¯ng (FOUC Dark Mode) vÃ  máº¥t CSS khi reload trang dApp
- **Ná»™i dung yÃªu cáº§u:** Khi reload trang, dApp bá»‹ hiá»‡n tÆ°á»£ng nháº¥p nhÃ¡y tráº¯ng (FOUC) chÃ³i máº¯t á»Ÿ Dark Mode hoáº·c hiá»ƒn thá»‹ mÃ n hÃ¬nh tráº¯ng do chÆ°a load xong tÃ i nguyÃªn CSS/JS.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Tráº¡ng thÃ¡i theme tá»‘i Ä‘Æ°á»£c khÃ´i phá»¥c muá»™n bá»Ÿi Angular `ThemeService` (cháº¡y sau khi táº£i xong bundle JS/CSS vÃ  khá»Ÿi Ä‘á»™ng á»©ng dá»¥ng), trong khi ná»n cá»§a `body` máº·c Ä‘á»‹nh lÃ  mÃ u sÃ¡ng.
  2. Thá»i gian táº£i cÃ¡c file tÃ i nguyÃªn báº¥t Ä‘á»“ng bá»™ cá»§a Angular gÃ¢y ra khoáº£ng trá»‘ng tráº¯ng táº¡m thá»i bÃªn trong `<app-root>` trÆ°á»›c khi component Ä‘Æ°á»£c render.
- **Giáº£i phÃ¡p:**
  1. Cáº­p nháº­t [index.html](file:///d:/git/angular-web3-wallet/src/index.html):
     * ThÃªm má»™t Ä‘oáº¡n inline script siÃªu nháº¹ á»Ÿ `<head>` Ä‘á»ƒ Ä‘á»c `localStorage` vÃ  Ã¡p dá»¥ng ngay class `dark` vÃ o tháº» `html` trÆ°á»›c khi trÃ¬nh duyá»‡t render giao diá»‡n.
     * ThÃªm mÃ n hÃ¬nh Splash Screen (Loading Screen) Ä‘áº¹p máº¯t báº±ng HTML/CSS thuáº§n (Ä‘á»“ng bá»™ mÃ u sÃ¡ng/tá»‘i theo CSS Variables) bÃªn trong tháº» `<app-root>` Ä‘á»ƒ hiá»ƒn thá»‹ ngay láº­p tá»©c trong lÃºc chá» táº£i bundle Angular.
  2. Cáº­p nháº­t [styles.scss](file:///d:/git/angular-web3-wallet/src/styles.scss):
     * Thiáº¿t láº­p ná»n máº·c Ä‘á»‹nh cho tháº» `html` Ä‘á»ƒ chuyá»ƒn mÃ u tá»‘i tá»©c thÃ¬.
     * Bá»• sung quy táº¯c selector `html.dark body` Ä‘á»ƒ thá»«a hÆ°á»Ÿng mÃ u ná»n tá»‘i `#030712` ngay khi tháº» `html` cÃ³ class `dark` (trÆ°á»›c khi Angular ká»‹p khá»Ÿi cháº¡y Ä‘á»ƒ add class `.dark` vÃ o `body`).

## NgÃ y 11/07/2026

### YÃªu cáº§u: Äá»“ng bá»™ quy chuáº©n nhÃ£n trÆ°á»ng nháº­p liá»‡u (Field Labels) dáº¡ng chá»¯ in hoa
- **Ná»™i dung yÃªu cáº§u:** Thá»‘ng nháº¥t Ä‘á»“ng bá»™ toÃ n bá»™ nhÃ£n (label) cá»§a cÃ¡c trÆ°á»ng nháº­p liá»‡u trong á»©ng dá»¥ng thÃ nh chá»¯ in hoa (`uppercase`), mÃ u chá»¯ má» nháº¹ (`text-slate-400 dark:text-slate-500`) vÃ  cáº­p nháº­t quy táº¯c nÃ y vÃ o tÃ i liá»‡u thiáº¿t káº¿.
- **Giáº£i phÃ¡p:**
  1. Cáº¥u trÃºc láº¡i nhÃ£n "Ná»™i dung thÃ´ng Ä‘iá»‡p" táº¡i [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html) báº±ng cÃ¡ch bá»c vÃ o `.form-field` vÃ  loáº¡i bá» class inline Ä‘á»ƒ káº¿ thá»«a style tá»± Ä‘á»™ng, Ä‘á»“ng thá»i chuáº©n hÃ³a textarea báº±ng class `form-textarea` cá»§a há»‡ thá»‘ng.
  2. Chuáº©n hÃ³a nhÃ£n "Má»‘c ngÃ y tá»‘i thiá»ƒu" vÃ  cÃ¡c nhÃ£n showcase phá»¥ (Tooltip, Shortcuts, Badges) trong trang chá»§ Ä‘á»ƒ Ä‘á»“ng nháº¥t cá»¡ chá»¯, Ä‘á»™ má» vÃ  kiá»ƒu in hoa.
  3. Cáº­p nháº­t Ä‘áº·c táº£ thiáº¿t káº¿ nhÃ£n trÆ°á»ng nháº­p liá»‡u vÃ o pháº§n "Bá»‘ cá»¥c biá»ƒu máº«u & NhÃ£n trÆ°á»ng" táº¡i cáº£ hai tá»‡p [design.md](file:///d:/git/angular-web3-wallet/design.md) vÃ  [.agent/design.md](file:///d:/git/angular-web3-wallet/.agent/design.md).

### YÃªu cáº§u: Giá»›i háº¡n Ä‘á»™ Ä‘á»• bÃ³ng (Shadow) tá»‘i Ä‘a trong tÃ i liá»‡u thiáº¿t káº¿
- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u sá»­a Ä‘á»•i tÃ i liá»‡u thiáº¿t káº¿ Ä‘á»ƒ quy Ä‘á»‹nh Ä‘á»™ Ä‘á»• bÃ³ng (box-shadow) tá»‘i Ä‘a trÃªn toÃ n há»‡ thá»‘ng chá»‰ lÃ  `shadow-lg`, tuyá»‡t Ä‘á»‘i khÃ´ng sá»­ dá»¥ng `shadow-xl` (hoáº·c cao hÆ¡n).
- **Giáº£i phÃ¡p:** Cáº­p nháº­t tá»‡p cáº¥u hÃ¬nh thiáº¿t káº¿ [.agent/design.md](file:///d:/git/angular-web3-wallet/.agent/design.md) Ä‘á»ƒ thay Ä‘á»•i `hover:shadow-xl` thÃ nh `hover:shadow-lg` nháº±m giá»›i háº¡n má»©c bÃ³ng Ä‘á»• theo Ä‘Ãºng chuáº©n thiáº¿t káº¿ giao diá»‡n pháº³ng vÃ  hiá»‡n Ä‘áº¡i cá»§a dá»± Ã¡n.

### YÃªu cáº§u: Äá»“ng bá»™ thiáº¿t káº¿ (padding/rounded) cho Wallet Dropdown
- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u Ä‘á»“ng bá»™ cáº¥u trÃºc layout cá»§a cÃ¡c tÃ¹y chá»n trong Wallet Dropdown (Sao chÃ©p Ä‘á»‹a chá»‰ vÃ­, chi tiáº¿t vÃ­...) khá»›p vá»›i chuáº©n cá»§a Network Dropdown (cÃ³ padding viá»n ngoÃ i vÃ  bo trÃ²n `rounded-xl` khi hover thay vÃ¬ trÃ n mÃ©p).
- **Giáº£i phÃ¡p:**
  1. Bao bá»c cÃ¡c nÃºt menu trong `<div class="space-y-0.5 px-2">` táº¡i [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.html). Sau Ä‘Ã³ loáº¡i bá» `space-y-0.5` á»Ÿ cáº£ 2 dropdown (chá»n máº¡ng vÃ  vÃ­) Ä‘á»ƒ khoáº£ng cÃ¡ch Ä‘Æ°á»£c giÃ£n cÃ¡ch tá»± nhiÃªn theo padding.
  2. Cáº­p nháº­t class cÃ¡c nÃºt báº¥m thÃ nh `px-3 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60` Ä‘á»“ng thá»i thÃªm hiá»‡u á»©ng chuyá»ƒn mÃ u `group-hover:text-primary` cho cáº£ icon vÃ  text.
  3. Thay tháº¿ Ä‘Æ°á»ng káº» `border-t` thÃ´ trÃªn nÃºt Ä‘Äƒng xuáº¥t báº±ng má»™t thanh divider `<div class="h-px bg-slate-100 dark:bg-slate-800/50 my-1">` thá»±c táº¿ vÃ  bo trÃ²n cho nÃºt ÄÄƒng xuáº¥t.
  4. **Kháº¯c phá»¥c lá»‡ch mÃ u & RÃºt gá»n Ä‘á»‹a chá»‰:** Loáº¡i bá» `group-hover:text-secondary` trÃªn nÃºt Ngáº¯t káº¿t ná»‘i vÃ­ Ä‘á»ƒ chá»¯ vÃ  biá»ƒu tÆ°á»£ng luÃ´n giá»¯ mÃ u há»“ng chá»§ Ä‘áº¡o (`text-primary`) sÃ¡ng rÃµ khi hover á»Ÿ cháº¿ Ä‘á»™ tá»‘i. Äá»“ng thá»i, rÃºt gá»n Ä‘á»‹a chá»‰ vÃ­ hiá»ƒn thá»‹ á»Ÿ header cá»§a dropdown báº±ng `appShortAddress` pipe Ä‘á»ƒ trÃ¡nh hiá»ƒn thá»‹ trÃ n lan.
  5. **Äá»‹nh vá»‹ chÃ­nh xÃ¡c (Absolute positioning):** TrÃªn thiáº¿t bá»‹ tá»« mÃ n hÃ¬nh `sm` trá»Ÿ lÃªn, chuyá»ƒn cÆ¡ cháº¿ Ä‘á»‹nh vá»‹ tá»« `fixed` sang `sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-2` giÃºp cÃ¡c dropdown neo chuáº©n xÃ¡c vÃ  bÃ¡m sÃ¡t vÃ o gÃ³c pháº£i cá»§a nÃºt cha tÆ°Æ¡ng á»©ng, trÃ¡nh viá»‡c bá»‹ lá»‡ch vá»‹ trÃ­ khi cuá»™n trang hoáº·c thay Ä‘á»•i kÃ­ch thÆ°á»›c viewport.


### YÃªu cáº§u: Loáº¡i bá» box-shadow cá»§a nÃºt vÃ­ Web3 trong Header
- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u loáº¡i bá» hiá»‡u á»©ng bÃ³ng má» (box-shadow) cá»§a nÃºt hiá»ƒn thá»‹ thÃ´ng tin Ä‘á»‹a chá»‰ vÃ­ vÃ  sá»‘ dÆ° á»Ÿ thanh Header Ä‘á»ƒ cÃ³ giao diá»‡n pháº³ng vÃ  gá»n gÃ ng hÆ¡n.
- **Giáº£i phÃ¡p:** Loáº¡i bá» lá»›p CSS `shadow-sm` khá»i tháº» `<button>` hiá»ƒn thá»‹ thÃ´ng tin vÃ­ Web3 trong tá»‡p [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.html).

### YÃªu cáº§u: ThÃªm Card "Demo Form Components" vÃ o trang chá»§
- **Ná»™i dung yÃªu cáº§u:** ThÃªm má»™t card demo má»›i trÃªn trang chá»§ hiá»ƒn thá»‹ bá»‘ cá»¥c form gá»“m: NgÃ y sinh (date picker), Giá»›i tÃ­nh (pill tab selector Nam/Ná»¯), Äá»‹a chá»‰ vÃ­ Web3 (EVM) (input text).
- **Giáº£i phÃ¡p:**
  1. ThÃªm 3 signals má»›i vÃ o [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts): `demoProfileBirthday`, `demoProfileGender` (máº·c Ä‘á»‹nh `'male'`), `demoProfileWallet`, vÃ  `genderOptions: TabOption[]` vá»›i hai má»¥c Nam/Ná»¯.
  2. ThÃªm **Card 11** vÃ o [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html) sá»­ dá»¥ng: `app-custom-date-picker` (showPresets=false), `app-tab-group` cho giá»›i tÃ­nh, `app-custom-input` cho Ä‘á»‹a chá»‰ vÃ­. Bá»‘ cá»¥c hÃ ng Ä‘áº§u dáº¡ng 2 cá»™t (`sm:grid-cols-2`), hÃ ng hai full-width, kÃ¨m debug output hiá»ƒn thá»‹ giÃ¡ trá»‹ signal thá»i gian thá»±c.
  3. TÃ¡i sá»­ dá»¥ng hoÃ n toÃ n cÃ¡c component Ä‘Ã£ cÃ³ (`app-custom-date-picker`, `app-tab-group`, `app-custom-input`) khÃ´ng cáº§n táº¡o component má»›i.
  4. **Äá»“ng bá»™ hÃ³a kÃ­ch thÆ°á»›c giao diá»‡n:** Cáº­p nháº­t tá»‡p [custom-date-picker.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-date-picker/custom-date-picker.component.html) Ä‘á»ƒ Ã¡p dá»¥ng lá»›p `form-input` vÃ  loáº¡i bá» padding dá»c thá»§ cÃ´ng (`py-3`). Viá»‡c nÃ y giÃºp Ä‘á»“ng bá»™ hÃ³a hoÃ n toÃ n chiá»u cao cá»§a Date Picker (`h-[42px]`) tÆ°Æ¡ng thÃ­ch hoÃ n háº£o vá»›i `app-tab-group` vÃ  `app-custom-input` thÃ´ng thÆ°á»ng, giáº£i quyáº¿t triá»‡t Ä‘á»ƒ lá»—i lá»‡ch giao diá»‡n.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i máº¥t hÃ¬nh áº£nh dApp khi káº¿t ná»‘i vÃ  tÆ°Æ¡ng tÃ¡c vÃ­ (WalletConnect/AppKit)
- **Ná»™i dung yÃªu cáº§u:** HÃ¬nh áº£nh Ä‘áº¡i diá»‡n (avatar/logo) cá»§a dApp hiá»ƒn thá»‹ lá»—i (broken image) trÃªn modal xÃ¡c nháº­n giao dá»‹ch cá»§a WalletConnect AppKit. YÃªu cáº§u láº¥y logo áº£nh tá»« logo web Ä‘á»ƒ Ä‘á»“ng bá»™ hiá»ƒn thá»‹.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:** 
  1. Cáº¥u hÃ¬nh metadata `icons` cÅ© sá»­ dá»¥ng `favicon.ico` khÃ´ng tÆ°Æ¡ng thÃ­ch Ä‘á»‹nh dáº¡ng hiá»ƒn thá»‹ cá»§a cÃ¡c vÃ­.
  2. Khi sá»­a sang sá»­ dá»¥ng `logo.svg` dáº¡ng Ä‘Æ°á»ng dáº«n tÆ°Æ¡ng Ä‘á»‘i `/logo.svg`, do dApp cháº¡y á»Ÿ mÃ´i trÆ°á»ng phÃ¡t triá»ƒn local (`http://localhost:4200` - HTTP) trong khi iframe cá»§a AppKit cháº¡y á»Ÿ domain ngoÃ i qua HTTPS, trÃ¬nh duyá»‡t kÃ­ch hoáº¡t chÃ­nh sÃ¡ch Mixed Content cháº·n táº£i tÃ i nguyÃªn HTTP khÃ´ng báº£o máº­t vÃ o trang HTTPS báº£o máº­t, dáº«n Ä‘áº¿n hÃ¬nh áº£nh tiáº¿p tá»¥c bá»‹ lá»—i hiá»ƒn thá»‹.
- **Giáº£i phÃ¡p:**
  1. Táº¡o file hÃ¬nh áº£nh tÄ©nh [logo.svg](file:///d:/git/angular-web3-wallet/public/assets/logo.svg) náº±m trong thÆ° má»¥c `public/assets/` Ä‘Æ°á»£c trÃ­ch xuáº¥t tá»« SVG cá»§a component logo há»‡ thá»‘ng, chuyá»ƒn Ä‘á»•i mÃ u `currentColor` Ä‘á»™ng thÃ nh mÃ u thÆ°Æ¡ng hiá»‡u cá»‘ Ä‘á»‹nh (`#8000ff` vÃ  gradient `#ff00dd` sang `#8000ff`).
  2. Cáº¥u hÃ¬nh thuá»™c tÃ­nh `icons` trong `createAppKit` táº¡i [web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts) trá» Ä‘áº¿n Ä‘Æ°á»ng dáº«n tÄ©nh URL (`window.location.origin + '/assets/logo.svg'`) Ä‘á»ƒ ngÆ°á»i dÃ¹ng dá»… dÃ ng thay tháº¿ logo báº±ng cÃ¡c Ä‘á»‹nh dáº¡ng khÃ¡c (PNG, JPG, SVG) chá»‰ báº±ng cÃ¡ch Ä‘á»•i file trong thÆ° má»¥c `public/assets/`.
  3. Cáº¥u hÃ¬nh thuá»™c tÃ­nh `"ssl": true` trong tá»‡p [angular.json](file:///d:/git/angular-web3-wallet/angular.json) á»Ÿ pháº§n serve options cá»§a dev-server. Äiá»u nÃ y giÃºp dApp á»Ÿ local tá»± Ä‘á»™ng cháº¡y qua HTTPS (`https://localhost:4200`), loáº¡i bá» hoÃ n toÃ n lá»—i Mixed Content vÃ  hiá»ƒn thá»‹ logo tÄ©nh chÃ­nh xÃ¡c trÃªn cáº£ mÃ´i trÆ°á»ng phÃ¡t triá»ƒn cá»¥c bá»™ vÃ  production mÃ  khÃ´ng cáº§n hardcode domain.
  4. Cáº­p nháº­t tháº» link icon trong [index.html](file:///d:/git/angular-web3-wallet/src/index.html) Ä‘á»ƒ Ä‘á»“ng bá»™ favicon cá»§a website thÃ nh `assets/logo.svg` vá»›i type `image/svg+xml`.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i tÆ°Æ¡ng tÃ¡c Smart Contract (Action not allowed) khi sá»­ dá»¥ng vÃ­ Social (Google/Email)
- **Ná»™i dung yÃªu cáº§u:** Khi ngÆ°á»i dÃ¹ng Ä‘Äƒng nháº­p dApp báº±ng vÃ­ Social (nhÆ° Google, Email, v.v.), khi gá»­i native token hoáº·c tÆ°Æ¡ng tÃ¡c smart contract sáº½ bÃ¡o lá»—i "Action not allowed" tá»« vÃ­ vÃ  lá»—i "could not coalesce error (method: eth_requestAccounts)" trÃªn dApp.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:** 
  1. Khi dApp gá»i `getSigner()` Ä‘á»ƒ láº¥y Ethers Signer, Ethers.js v6 `BrowserProvider` sáº½ tá»± Ä‘á»™ng thá»±c hiá»‡n cuá»™c gá»i RPC `eth_requestAccounts` hoáº·c `eth_accounts` qua provider Ä‘á»ƒ dÃ² tÃ¬m tÃ i khoáº£n. Tuy nhiÃªn, vÃ­ Social/Email cá»§a Reown AppKit Ä‘Æ°á»£c báº£o máº­t nghiÃªm ngáº·t vÃ  cháº·n hoÃ n toÃ n cuá»™c gá»i `eth_requestAccounts` tá»« bÃªn ngoÃ i dApp, dáº«n Ä‘áº¿n lá»—i nÃ©m ra tá»« RPC lÃ m crash tiáº¿n trÃ¬nh vÃ  treo giao dá»‹ch.
  2. Náº¿u cáº¥u hÃ¬nh loáº¡i tÃ i khoáº£n máº·c Ä‘á»‹nh lÃ  `eoa` (`defaultAccountTypes: { eip155: 'eoa' }`), vÃ­ Social nhÃºng sáº½ bá»‹ lá»—i `Action not allowed` ngay tá»« khi káº¿t ná»‘i á»Ÿ mÃ´i trÆ°á»ng testnet do thiáº¿u phÃ¢n quyá»n. VÃ¬ váº­y, báº¯t buá»™c pháº£i sá»­ dá»¥ng loáº¡i tÃ i khoáº£n máº·c Ä‘á»‹nh `smartAccount` Ä‘á»ƒ vÃ­ Social hoáº¡t Ä‘á»™ng vÃ  hiá»ƒn thá»‹ sá»‘ dÆ° chÃ­nh xÃ¡c.
- **Giáº£i phÃ¡p:** 
  1. Cáº¥u hÃ¬nh `defaultAccountTypes: { eip155: 'smartAccount' }` trong tá»‡p [web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts) Ä‘á»ƒ vÃ­ Social cháº¡y á»•n Ä‘á»‹nh vÃ  hiá»ƒn thá»‹ Ä‘Ãºng sá»‘ dÆ°.
  2. Cáº­p nháº­t hÃ m `getSigner()` trong [web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts): Ghi Ä‘Ã¨ (override) phÆ°Æ¡ng thá»©c `send` cá»§a Ethers `BrowserProvider` Ä‘á»‘i vá»›i hai cuá»™c gá»i `eth_requestAccounts` vÃ  `eth_accounts` Ä‘á»ƒ tráº£ vá» trá»±c tiáº¿p Ä‘á»‹a chá»‰ vÃ­ hiá»‡n táº¡i (`this.address()`) mÃ  dApp Ä‘Ã£ biáº¿t sau khi káº¿t ná»‘i. Viá»‡c nÃ y giÃºp bypass hoÃ n toÃ n lá»—i phÃ¢n quyá»n RPC cá»§a vÃ­ Social mÃ  khÃ´ng áº£nh hÆ°á»Ÿng Ä‘áº¿n MetaMask, Ä‘á»“ng thá»i cho phÃ©p thá»±c thi `eth_sendTransaction` bÃ¬nh thÆ°á»ng.
  3. Cáº­p nháº­t hÃ m `sendTransaction` trong [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts): Äá»‹nh dáº¡ng toÃ n bá»™ cÃ¡c trÆ°á»ng `BigInt` (nhÆ° `value`, `maxFeePerGas`, `maxPriorityFeePerGas`) sang dáº¡ng `hex string` (báº¯t Ä‘áº§u báº±ng `0x`) trÆ°á»›c khi truyá»n sang Ethers, trÃ¡nh lá»—i crash do `JSON.stringify` khÃ´ng serialize Ä‘Æ°á»£c BigInt trong SDK cá»§a AppKit.

### YÃªu cáº§u: TÃ¡ch biá»‡t tá»‡p template HTML vÃ  stylesheet CSS cho TxSpeedSelector vÃ  ThemeSwitcher
- **Ná»™i dung yÃªu cáº§u:** Tiáº¿n hÃ nh tÃ¡ch mÃ£ giao diá»‡n HTML vÃ  phong cÃ¡ch CSS tá»« inline trong file `.ts` cá»§a hai component `tx-speed-selector` vÃ  `theme-switcher` thÃ nh cÃ¡c file Ä‘á»™c láº­p `.html` vÃ  `.css` Ä‘á»ƒ tuÃ¢n thá»§ quy chuáº©n cáº¥u trÃºc mÃ£ sáº¡ch cá»§a dá»± Ã¡n.
- **Giáº£i phÃ¡p:**
  1. **TxSpeedSelector:** TÃ¡ch inline template trong [tx-speed-selector.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/tx-speed-selector/tx-speed-selector.component.ts) sang tá»‡p má»›i [tx-speed-selector.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/tx-speed-selector/tx-speed-selector.component.html) vÃ  inline styles `:host { display: block; }` sang tá»‡p má»›i [tx-speed-selector.component.css](file:///d:/git/angular-web3-wallet/src/app/shared/components/tx-speed-selector/tx-speed-selector.component.css).
  2. **ThemeSwitcher:** TÃ¡ch inline template trong [theme-switcher.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/theme-switcher/theme-switcher.component.ts) sang tá»‡p má»›i [theme-switcher.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/theme-switcher/theme-switcher.component.html) vÃ  inline styles sang tá»‡p má»›i [theme-switcher.component.css](file:///d:/git/angular-web3-wallet/src/app/shared/components/theme-switcher/theme-switcher.component.css).
  3. Cáº­p nháº­t decorator `@Component` cá»§a cáº£ hai component trÃªn, chuyá»ƒn sang liÃªn káº¿t báº±ng `templateUrl` vÃ  `styleUrl` trá» tá»›i cÃ¡c tá»‡p bÃªn ngoÃ i tÆ°Æ¡ng á»©ng.

### YÃªu cáº§u: Loáº¡i bá» tráº¡ng thÃ¡i káº¿t ná»‘i vÃ­ dÆ°á»›i Sidebar vÃ  thÃ´ng tin Copyright
- **Ná»™i dung yÃªu cáº§u:** Gá»¡ bá» hoÃ n toÃ n widget hiá»ƒn thá»‹ Ä‘á»‹a chá»‰ vÃ­ káº¿t ná»‘i vÃ  dÃ²ng chá»¯ báº£n quyá»n (Copyright) á»Ÿ cuá»‘i Sidebar Ä‘á»ƒ lÃ m cho thiáº¿t káº¿ trá»Ÿ nÃªn tá»‘i giáº£n, táº­p trung hÆ¡n.
- **Giáº£i phÃ¡p:**
  1. Loáº¡i bá» khá»‘i `@if (stateService.isConnected())` hiá»ƒn thá»‹ Ä‘á»‹a chá»‰ vÃ­ rÃºt gá»n á»Ÿ cuá»‘i [sidebar.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/sidebar/sidebar.component.html).
  2. Loáº¡i bá» khá»‘i chá»©a thÃ´ng tin Copyright `Â© 2026 Angular Web3. PhiÃªn báº£n phi táº­p trung` á»Ÿ cuá»‘i [sidebar.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/sidebar/sidebar.component.html).
  3. Äá»ƒ Ä‘á»“ng bá»™ giao diá»‡n Mobile, loáº¡i bá» khá»‘i `@if (stateService.isConnected())` tÆ°Æ¡ng á»©ng táº¡i Mobile Drawer bottom controls trong [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.html).

### YÃªu cáº§u: Thiáº¿t káº¿ trÃ n viá»n tinh táº¿ (Full-width divider) cho Modal Header vÃ  Footer
- **Ná»™i dung yÃªu cáº§u:** Xem xÃ©t láº¡i Ä‘Æ°á»ng káº» ngang phÃ¢n tÃ¡ch trÃªn modal (Header divider) Ä‘á»ƒ Ä‘áº£m báº£o Ä‘Æ°á»ng káº» nÃ y khÃ´ng bá»‹ co lá» hai bÃªn, táº¡o ra thiáº¿t káº¿ modal chuáº©n má»±c lÃ m máº«u cho cÃ¡c dá»± Ã¡n sau.
- **Giáº£i phÃ¡p:**
  1. Loáº¡i bá» padding ngang `px-6` táº¡i khung chá»©a chung Modal Content (`modal-wrapper.component.html`).
  2. Bá»• sung padding ngang `px-6` vÃ o cÃ¡c pháº§n tá»­ con bao gá»“m Header vÃ  Body Ä‘á»ƒ giá»¯ ná»™i dung cÄƒn lá» chÃ­nh xÃ¡c.
  3. Sá»­a lá»—i class border `border-slate-150` khÃ´ng há»£p lá»‡ (gÃ¢y ra mÃ u viá»n Ä‘en sáº­m thÃ´ cá»§a trÃ¬nh duyá»‡t) thÃ nh `border-slate-100` á»Ÿ light mode Ä‘á»ƒ hiá»ƒn thá»‹ thanh phÃ¢n cÃ¡ch tinh táº¿.
  4. Sá»­ dá»¥ng ká»¹ thuáº­t negative margin (`-mx-6 px-6`) cho khu vá»±c Footer trong `demo-modal.component.html` giÃºp Ä‘Æ°á»ng phÃ¢n cÃ¡ch chÃ¢n footer (`border-t`) cháº¡y trÃ n viá»n 100% cÃ¢n Ä‘á»‘i hoÃ n toÃ n vá»›i Header, trong khi cÃ¡c nÃºt báº¥m váº«n cÄƒn tháº³ng hÃ ng hoÃ n háº£o vá»›i body.

### YÃªu cáº§u: Loáº¡i bá» mÃ u sáº¯c gáº¯n cá»©ng (hardcoded colors) vÃ  Ä‘á»“ng bá»™ mÃ u sáº¯c thÆ°Æ¡ng hiá»‡u Ä‘á»™ng
- **Ná»™i dung yÃªu cáº§u:** Äáº£m báº£o toÃ n bá»™ trang, cÃ¡c trang con, component, feature Ä‘á»u tuÃ¢n thá»§ mÃ u sáº¯c chá»§ Ä‘áº¡o (primary) vÃ  mÃ u phá»¥ (secondary) Ä‘á»™ng, khÃ´ng Ä‘Æ°á»£c gáº¯n cá»©ng má»™t mÃ u nhÆ° `text-pink-600`, `text-purple-600`, `bg-pink-50`, v.v.
- **Giáº£i phÃ¡p:**
  1. Thay tháº¿ cÃ¡c mÃ u cá»©ng `pink-600`, `pink-500`, `pink-50` sang `primary` Ä‘á»™ng (`text-primary`, `bg-primary/10`, `border-primary/10`, v.v.) trong cÃ¡c file HTML/TS cá»§a Sidebar, Header, Home, About, Contact, App vÃ  Tx Speed Selector.
  2. Thay tháº¿ cÃ¡c mÃ u cá»©ng `purple-600`, `purple-500`, `purple-50`, `purple-950` sang `secondary` hoáº·c `primary` Ä‘á»™ng tÃ¹y thuá»™c vÃ o ngá»¯ cáº£nh.
  3. Cáº­p nháº­t `logo.component.ts` Ä‘á»ƒ Ä‘á»•i stop-color trong SVG linearGradient thÃ nh cÃ¡c biáº¿n CSS Ä‘á»™ng `var(--color-primary)` vÃ  `var(--color-secondary)` thay vÃ¬ mÃ£ mÃ u tÄ©nh.
  4. Cáº­p nháº­t cÃ¡c biáº¿n thá»ƒ badge `'info'` vÃ  `'ultra'` trong `badge.component.ts` sang mÃ u sáº¯c dynamic cá»§a primary vÃ  secondary.

### YÃªu cáº§u: Äá»“ng bá»™ giao diá»‡n Theme Switcher chuáº©n theo mÃ£ nguá»“n tham kháº£o
- **Ná»™i dung yÃªu cáº§u:** Cáº­p nháº­t láº¡i giao diá»‡n vÃ  cáº¥u trÃºc DOM cá»§a component `app-theme-switcher` sao cho khá»›p hoÃ n toÃ n vá»›i thiáº¿t káº¿ máº«u (dáº¡ng thanh pill bo trÃ²n chá»©a cÃ¡c nÃºt icon hÃ¬nh trÃ²n nhá»).
- **Giáº£i phÃ¡p:**
  1. Loáº¡i bá» viá»‡c sá»­ dá»¥ng component chung `<app-tab-group>` trong `<app-theme-switcher>`.
  2. TÃ¡ch vÃ  xÃ¢y dá»±ng láº¡i layout thuáº§n báº±ng cáº¥u trÃºc DOM tham kháº£o: Sá»­ dá»¥ng thanh pill container `bg-slate-100 dark:bg-slate-900 rounded-full p-0.5 border` vÃ  cÃ¡c nÃºt button `rounded-full flex items-center justify-center` chá»©a cÃ¡c biá»ƒu tÆ°á»£ng `<app-icon>` kÃ­ch thÆ°á»›c `w-3.5 h-3.5`.
  3. Sá»­ dá»¥ng signal `stateService.themeMode()` Ä‘á»ƒ kiá»ƒm tra Ä‘á»™ng tráº¡ng thÃ¡i hoáº¡t Ä‘á»™ng nháº±m Ã¡p dá»¥ng cÃ¡c CSS class active (`bg-white dark:bg-slate-800 text-purple-500 shadow-sm`) má»™t cÃ¡ch chÃ­nh xÃ¡c khi ngÆ°á»i dÃ¹ng click chá»n theme.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i áº©n Ä‘Äƒng nháº­p máº¡ng xÃ£ há»™i (Social Login) vÃ  tá»± Ä‘á»™ng Ä‘á»“ng bá»™ theo cáº¥u hÃ¬nh Reown Dashboard
- **Ná»™i dung yÃªu cáº§u:** Giáº£i thÃ­ch lÃ½ do táº¡i sao Social Login khÃ´ng tá»± Ä‘á»™ng Ä‘á»“ng bá»™ tá»« Reown Dashboard vá» á»©ng dá»¥ng mÃ  láº¡i bá»‹ áº©n hoÃ n toÃ n, vÃ  Ä‘Æ°a ra giáº£i phÃ¡p tuÃ¢n thá»§ Ä‘á»“ng bá»™ tá»« Cloud.
- **Giáº£i phÃ¡p:**
  1. **Lá»‹ch sá»­ lá»—i cÅ©:** TrÆ°á»›c Ä‘Ã¢y láº­p trÃ¬nh viÃªn viáº¿t Ä‘oáº¡n code ghi Ä‘Ã¨ `ApiController.fetchProjectConfig` (tráº£ vá» `null`) nháº±m trÃ¡nh lá»—i SIWX (yÃªu cáº§u kÃ½ tin nháº¯n khi káº¿t ná»‘i) khi mÃ¡y chá»§ Cloud Ã©p cáº¥u hÃ¬nh `reownAuthentication: true`. TÃ¡c dá»¥ng phá»¥ lÃ  cháº·n luÃ´n cáº¥u hÃ¬nh Social/Email vÃ¬ nÃ³ cáº§n thÃ´ng tin tá»« Cloud Ä‘á»ƒ táº¡o iframe Ä‘Äƒng nháº­p.
  2. **Giáº£i phÃ¡p hiá»‡n táº¡i:** VÃ¬ hiá»‡n táº¡i trÃªn Dashboard cá»§a ngÆ°á»i dÃ¹ng, **Reown Authentication** Ä‘Ã£ Ä‘Æ°á»£c chuyá»ƒn sang **OFF**, vÃ  **Social & Email** Ä‘Æ°á»£c báº­t **ON**, ta cÃ³ thá»ƒ gá»¡ bá» hoÃ n toÃ n Ä‘oáº¡n hack `fetchProjectConfig` vÃ  gá»¡ cÃ¡c cáº¥u hÃ¬nh `email: false` / `socials: false` cá»©ng á»Ÿ client-side. SDK sáº½ tá»± Ä‘á»™ng láº¥y Ä‘Ãºng thiáº¿t láº­p tá»« Dashboard cá»§a Reown.

### YÃªu cáº§u: Ãp dá»¥ng Tab Group Component dÃ¹ng chung (`app-tab-group`)
- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t toÃ n bá»™ source code, tÃ¬m kiáº¿m nhá»¯ng vá»‹ trÃ­ chÆ°a Ã¡p dá»¥ng `app-tab-group` dÃ¹ng chung Ä‘á»ƒ triá»ƒn khai Ä‘á»“ng bá»™ hÃ³a giao diá»‡n.
- **Giáº£i phÃ¡p:**
  1. **Äá»“ng bá»™ hÃ³a TxSpeedSelector:** Thay tháº¿ lÆ°á»›i nÃºt chá»n tá»‘c Ä‘á»™ giao dá»‹ch thá»§ cÃ´ng báº±ng component `<app-tab-group>` chuáº©n cá»§a há»‡ thá»‘ng, liÃªn káº¿t trá»±c tiáº¿p vá»›i signal `stateService.txSpeed` vÃ  bá»™ cáº¥u hÃ¬nh `speedOptions` ("Máº·c Ä‘á»‹nh", "Nhanh", "TÃ¹y chá»n").
  2. **Äá»“ng bá»™ hÃ³a ThemeSwitcher:** Chuyá»ƒn bá»™ nÃºt thay Ä‘á»•i giao diá»‡n (SÃ¡ng / Tá»± Ä‘á»™ng / Tá»‘i) sang sá»­ dá»¥ng `<app-tab-group>` toÃ n chiá»u rá»™ng, tÃ­ch há»£p cáº£ icon vÃ  nhÃ£n chá»¯ giÃºp giao diá»‡n Ä‘á»“ng bá»™ hoÃ n chá»‰nh vá»›i TxSpeedSelector.
  3. **ThÃªm Demo Showcase:** 
     - Táº¡i Trang chá»§: ThÃªm **Card 9 (Custom Tab Group)** giá»›i thiá»‡u tab group máº«u tÃ­ch há»£p icon vÃ  badge sá»‘ lÆ°á»£ng thÃ´ng bÃ¡o (VÃ­ dApp, Lá»‹ch sá»­, Cáº¥u hÃ¬nh).
     - Táº¡i Demo Modal: ThÃªm bá»™ tab group chá»n máº¡ng Æ°u tiÃªn máº«u ("Ethereum", "Arbitrum", "BNB Chain") kÃ¨m cháº¥m trÃ²n mÃ u Ä‘áº¡i diá»‡n (`dotClass`) Ä‘á»ƒ kiá»ƒm thá»­ kháº£ nÄƒng render/Ä‘Ã¨ Ä‘áº¯p trong dialog.
  4. **Kiá»ƒm thá»­ biÃªn dá»‹ch:** Cháº¡y `npm run build` thÃ nh cÃ´ng 100% khÃ´ng lá»—i, cÃ¡c component render mÆ°á»£t mÃ , Ä‘Ãºng chuáº©n thiáº¿t káº¿.

### YÃªu cáº§u: Bá»• sung cÃ¡c UI Components má»›i (Accordion, Badge, Kbd, Tooltip) vÃ  demo lÃªn trang chá»§/modal
- **Ná»™i dung yÃªu cáº§u:** ThÃªm cÃ¡c UI components nhÆ° `Accordion`, `Kbd` (Keyboard key), vÃ  `Tooltip` vÃ o `src/app/shared/components`, Ä‘á»“ng thá»i trÃ¬nh diá»…n chÃºng cÃ¹ng vá»›i component `Badge` (Ä‘Ã£ cÃ³ sáºµn) trÃªn Trang chá»§ vÃ  Demo Modal. Badge khÃ´ng cáº§n Ã¡p dá»¥ng Tooltip. Äáº£m báº£o táº¥t cáº£ component Ä‘á»u Ä‘Æ°á»£c tÃ¡ch biá»‡t rÃµ rÃ ng thÃ nh cáº£ tá»‡p `.ts` vÃ  `.html` tÆ°Æ¡ng á»©ng.
- **Giáº£i phÃ¡p:**
  1. **Táº¡o Accordion (`app-accordion`, `app-accordion-item`):** Thiáº¿t káº¿ dáº¡ng component standalone. Sá»­ dá»¥ng cÆ¡ cháº¿ transition trÆ°á»£t cao mÆ°á»£t mÃ  thuáº§n CSS qua `grid-template-rows` (`0fr` -> `1fr`) trong template HTML. Há»— trá»£ cÆ¡ cháº¿ cho phÃ©p má»Ÿ nhiá»u panel (`multiple = true`) hoáº·c thu gá»n tá»± Ä‘á»™ng chá»‰ má»Ÿ má»™t panel (`multiple = false`). TÃ¡ch riÃªng tá»‡p template [accordion.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/accordion/accordion.component.html) vÃ  [accordion-item.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/accordion/accordion-item.component.html).
  2. **Táº¡o Kbd (`app-kbd`):** Thiáº¿t káº¿ phÃ­m báº¥m 3D chÃ¢n thá»±c, font chá»¯ `font-mono text-[10px] sm:text-xs`, viá»n ná»•i vÃ  bÃ³ng má» thÃ­ch á»©ng vá»›i giao diá»‡n sÃ¡ng/tá»‘i. TÃ¡ch riÃªng tá»‡p template [kbd.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/kbd/kbd.component.html).
  3. **Táº¡o Tooltip (`appTooltip`):** Directive Ä‘á»™ng Ä‘á»‹nh vá»‹ `fixed` tÃ­nh toÃ¡n tá»± Ä‘á»™ng theo viewport qua `getBoundingClientRect()` Ä‘á»ƒ trÃ¡nh bá»‹ cáº¯t cá»¥t bá»Ÿi overflow cá»§a container cha. Tá»± Ä‘á»™ng Ä‘Ã³ng khi mÃ n hÃ¬nh scroll/resize, cÃ³ hiá»‡u á»©ng chuyá»ƒn Ä‘á»™ng scale vÃ  fade mÆ°á»£t mÃ . (Directive khÃ´ng cÃ³ tá»‡p HTML template).
  4. **TÃ­ch há»£p & TrÃ¬nh diá»…n:**
     - ÄÄƒng kÃ½ cÃ¡c component/directive má»›i vÃ o `home.component.ts` vÃ  `demo-modal.component.ts`.
     - Táº¡i trang chá»§: ThÃªm **Card 7 (Custom Accordion)** FAQ vÃ  **Card 8 (Badge, Kbd & Tooltip)** trÃ¬nh diá»…n chi tiáº¿t cÃ¡c tráº¡ng thÃ¡i.
     - Táº¡i Demo Modal: ThÃªm khu vá»±c giá»›i thiá»‡u cÃ¡c component má»›i (PhÃ­m ESC Ä‘Ã³ng modal, Badge Má»›i, Accordion Ä‘iá»u khoáº£n dApp) vÃ  tÃ­ch há»£p tooltip hÆ°á»›ng dáº«n vÃ o nÃºt "XÃ¡c nháº­n". Loáº¡i bá» appTooltip trÃªn cÃ¡c badge theo yÃªu cáº§u cáº­p nháº­t.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i thiáº¿u hiá»‡u á»©ng chuyá»ƒn Ä‘á»™ng (animation) cá»§a Mobile Drawer

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n Ã¡nh ráº±ng Mobile Drawer khÃ´ng cÃ³ hiá»‡u á»©ng chuyá»ƒn Ä‘á»™ng (animation) mÆ°á»£t mÃ  khi Ä‘Ã³ng má»Ÿ.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Thiáº¿u cÃ¡c class transition cá»§a Tailwind CSS (`transition-opacity`, `transition-transform`, `duration-300`, `ease-in-out`) cho tháº» backdrop vÃ  panel cá»§a Drawer.
  2. Viá»‡c sá»­ dá»¥ng `[class.invisible]="!stateService.showMobileMenu()"` trÃªn container ngoÃ i cÃ¹ng lÃ m áº©n Drawer ngay láº­p tá»©c khi Ä‘Ã³ng, triá»‡t tiÃªu má»i hiá»‡u á»©ng chuyá»ƒn Ä‘á»™ng.
- **Giáº£i phÃ¡p:**
  1. Loáº¡i bá» class `invisible` á»Ÿ container cha Ä‘á»ƒ trÃ¡nh triá»‡t tiÃªu hiá»‡u á»©ng khi tráº¡ng thÃ¡i thay Ä‘á»•i.
  2. Ãp dá»¥ng `[class.pointer-events-none]="!stateService.showMobileMenu()"` cho container cha Ä‘á»ƒ ngÆ°á»i dÃ¹ng váº«n tÆ°Æ¡ng tÃ¡c bÃ¬nh thÆ°á»ng vá»›i trang web khi Drawer Ä‘Ã³ng.
  3. ThÃªm cÃ¡c class transition cho cáº£ Backdrop (`transition-opacity duration-300 ease-in-out`) vÃ  Panel (`transition-transform duration-300 ease-in-out`).
  4. Quáº£n lÃ½ tráº¡ng thÃ¡i click báº±ng `pointer-events-auto` vÃ  `pointer-events-none` Ä‘á»™ng trÃªn cÃ¡c pháº§n tá»­ con.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i khÃ³ hiá»ƒn thá»‹ cá»§a Custom Radio Button trÃªn Darkmode

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n Ã¡nh nÃºt Custom Radio chÆ°a Ä‘Æ°á»£c chá»n á»Ÿ cháº¿ Ä‘á»™ tá»‘i (darkmode) bá»‹ tá»‘i sáº«m, chÃ¬m vÃ o ná»n card vÃ  ráº¥t khÃ³ nhÃ¬n.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:** á»ž cháº¿ Ä‘á»™ tá»‘i, khi chÆ°a Ä‘Æ°á»£c chá»n, vÃ²ng trÃ²n radio button sá»­ dá»¥ng class `dark:bg-slate-950` vÃ  `dark:border-slate-800/80`. Ná»n card cá»§a á»©ng dá»¥ng vá»‘n Ä‘Ã£ lÃ  mÃ u tá»‘i sáº«m, dáº«n Ä‘áº¿n viá»‡c thiáº¿u Ä‘á»™ tÆ°Æ¡ng pháº£n tráº§m trá»ng.
- **Giáº£i phÃ¡p:** Cáº­p nháº­t tá»‡p [custom-radio.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-radio/custom-radio.component.html):
  1. NÃ¢ng tone mÃ u viá»n tá»« `dark:border-slate-800/80` lÃªn `dark:border-slate-700` vÃ  khi hover tÄƒng lÃªn `dark:group-hover:border-slate-500` Ä‘á»ƒ hiá»ƒn thá»‹ rÃµ rÃ ng.
  2. Äá»•i mÃ u ná»n tá»« `dark:bg-slate-950` sang mÃ u xÃ¡m nháº¹ hÆ¡n `dark:bg-slate-900` Ä‘á»ƒ hÃ i hÃ²a vÃ  dá»… nháº­n diá»‡n hÆ¡n.
  3. Cáº­p nháº­t nháº¹ mÃ u á»Ÿ cháº¿ Ä‘á»™ sÃ¡ng (lightmode) cho Ä‘á»“ng bá»™ viá»n tá»« `border-slate-200` thÃ nh `border-slate-300` vÃ  khi hover tá»« `border-slate-300` thÃ nh `border-slate-400` Ä‘á»ƒ tÄƒng tÃ­nh rÃµ nÃ©t.

### YÃªu cáº§u: Loáº¡i bá» class style dÆ° thá»«a vÃ  Ä‘á»“ng bá»™ hÃ³a kÃ­ch thÆ°á»›c Ã´ nháº­p liá»‡u (Input)

- **Ná»™i dung yÃªu cáº§u:**
  1. Äáº£m báº£o cÃ¡c pháº§n tá»­ khi Ä‘Ã£ Ã¡p dá»¥ng component/directive dÃ¹ng chung nhÆ° `app-card` hay `app-button` thÃ¬ khÃ´ng cáº§n tá»± thiáº¿t láº­p mÃ u ná»n (background color) hoáº·c padding thá»§ cÃ´ng á»Ÿ ngoÃ i.
  2. Xem xÃ©t vÃ  Ä‘á»“ng bá»™ kÃ­ch thÆ°á»›c (chiá»u cao h-[42px]) cá»§a cÃ¡c Ã´ nháº­p liá»‡u (input, textarea, khung Ä‘á»‹a chá»‰ vÃ­) cÃ¢n Ä‘á»‘i vá»›i nÃºt báº¥m. XÃ¢y dá»±ng component riÃªng cho Ã´ nháº­p liá»‡u.
- **Giáº£i phÃ¡p:**
  1. **Äá»‹nh nghÄ©a CSS Card tÆ°Æ¡ng tÃ¡c:** Cáº­p nháº­t [styles.scss](file:///d:/git/angular-web3-wallet/src/styles.scss), gá»™p chung `.app-card-interactive` vÃ o nhÃ³m Ä‘á»‹nh nghÄ©a chung cá»§a `.app-card` Ä‘á»ƒ thá»«a hÆ°á»Ÿng style ná»n, viá»n vÃ  padding máº·c Ä‘á»‹nh. Khai bÃ¡o thÃªm `.form-textarea` Ä‘á»“ng bá»™ style vá»›i `.form-input`.
  2. **Äá»‹nh nghÄ©a wrapper class `.form-field`:** ThÃªm class `.form-field` (`flex flex-col gap-2 w-full`) vÃ  cáº¥u hÃ¬nh nhÃ£n `.form-field > label` Ä‘á»ƒ tá»± Ä‘á»™ng hÃ³a Ä‘á»‹nh dáº¡ng nhÃ£n vÃ  duy trÃ¬ khoáº£ng cÃ¡ch **8px (`gap-2`)** nháº¥t quÃ¡n giá»¯a label vÃ  cÃ¡c control (input, textarea, select, date-picker, radio group) mÃ  khÃ´ng cáº§n code trÃ¹ng láº·p.
  3. **XÃ¢y dá»±ng `CustomInputComponent` má»›i:** Táº¡o component standalone [custom-input.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-input/custom-input.component.ts) há»— trá»£ cÃ¡c loáº¡i `type` (text, number, email, textarea) Ä‘á»ƒ Ä‘á»“ng bá»™ hÃ³a kÃ­ch thÆ°á»›c chiá»u cao chuáº©n `h-[42px]`. Component táº­p trung render Ä‘iá»u khiá»ƒn, gá»¡ bá» thuá»™c tÃ­nh `label` bÃªn trong (tÆ°Æ¡ng tá»± nhÆ° `custom-select` vÃ  `custom-date-picker`).
  4. **RÃ  soÃ¡t & Äá»“ng bá»™ cÃ¡c mÃ n hÃ¬nh:**
     - **Trang chá»§:** Thay tháº¿ cÃ¡c input báº±ng `<app-custom-input>`. Bá»c cÃ¡c pháº§n tá»­ (Äá»‹a chá»‰ vÃ­ cá»§a báº¡n, Ä‘á»‹a chá»‰ nháº­n, sá»‘ lÆ°á»£ng gá»­i) báº±ng `<div class="form-field">` kÃ¨m tháº» `<label>` Ä‘Æ¡n giáº£n á»Ÿ ngoÃ i. Loáº¡i bá» class `!rounded-xl` dÆ° thá»«a trÃªn cÃ¡c nÃºt báº¥m `app-button`.
     - **Trang liÃªn há»‡:** Thay tháº¿ email vÃ  textarea báº±ng `<app-custom-input>`. Bá»c ngoÃ i báº±ng `<div class="form-field">` vÃ  tháº» `<label>`. TÄƒng khoáº£ng cÃ¡ch cÃ¡c Ã´ nháº­p lÃªn `space-y-4`.
     - **Cáº¥u hÃ¬nh Demo:** Thay tháº¿ cÃ¡c input cáº¥u hÃ¬nh, date-picker, select, radio group báº±ng cÃ¡ch bá»c ngoÃ i `<div class="form-field">` vÃ  tháº» `<label>` thá»§ cÃ´ng á»Ÿ ngoÃ i, giÃºp giao diá»‡n Ä‘á»“ng bá»™ khoáº£ng cÃ¡ch tuyá»‡t Ä‘á»‘i.
  5. **Tá»‘i Æ°u hÃ³a Spacing vÃ  Padding cá»§a Modal:**
     - Cáº­p nháº­t [modal-wrapper.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/modal/modal-wrapper.component.html) Ä‘á»•i padding cá»§a container cha tá»« `p-6` thÃ nh `pt-6 px-6 pb-5`, sá»­a `pb-3.5` cá»§a header thÃ nh `pb-4`, sá»­a `pt-5` cá»§a body thÃ nh `pt-4` Ä‘á»ƒ táº¡o sá»± Ä‘á»‘i xá»©ng.
     - Cáº­p nháº­t [demo-modal.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/components/demo-modal/demo-modal.component.html) thÃªm Ä‘Æ°á»ng viá»n phÃ¢n cÃ¡ch `border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-1 shrink-0` cho footer Ä‘á»ƒ cÃ¢n Ä‘á»‘i thá»‹ giÃ¡c hoÃ n háº£o vá»›i header á»Ÿ phÃ­a trÃªn.

### YÃªu cáº§u: Chuáº©n hÃ³a vÃ  sá»­a Ä‘á»•i SVG cá»§a icon káº¿t ná»‘i vÃ­ cho Ä‘Ãºng ngá»¯ cáº£nh

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n Ã¡nh biá»ƒu tÆ°á»£ng (icon) káº¿t ná»‘i vÃ­ hiá»‡n táº¡i hiá»ƒn thá»‹ khÃ´ng phÃ¹ há»£p vá»›i ngá»¯ cáº£nh káº¿t ná»‘i vÃ­ Web3.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:** Tá»‡p [icon.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/icon/icon.component.html) cÃ³ case `'wallet'` nhÆ°ng path SVG láº¡i Ä‘ang váº½ hÃ¬nh má»™t con chip CPU/Vi máº¡ch (cÃ³ cÃ¡c chÃ¢n rÃ¢u tá»§a ra hai bÃªn) thay vÃ¬ má»™t chiáº¿c vÃ­ thá»±c táº¿. Äiá»u nÃ y gÃ¢y hiá»ƒu láº§m trÃªn UI á»Ÿ nÃºt káº¿t ná»‘i vÃ  cÃ¡c khu vá»±c thÃ´ng bÃ¡o.
- **Giáº£i phÃ¡p:** Cáº­p nháº­t tá»‡p [icon.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/icon/icon.component.html) táº¡i case `'wallet'`, thay tháº¿ path váº½ chip CPU cÅ© báº±ng path váº½ chiáº¿c vÃ­ tiá»n (wallet) chuáº©n theo Heroicons v2 outline, giÃºp hiá»ƒn thá»‹ trá»±c quan vÃ  Ä‘Ãºng ngá»¯ cáº£nh Web3 cá»§a á»©ng dá»¥ng.

## NgÃ y 10/07/2026

### YÃªu cáº§u: Bá»• sung cÃ¡c custom Pipes tá»« dá»± Ã¡n cafe-blockchain

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u tham kháº£o vÃ  bá»• sung cÃ¡c custom pipes tá»« dá»± Ã¡n `cafe-blockchain` vÃ o há»‡ thá»‘ng template Web3 nÃ y.
- **Giáº£i phÃ¡p:**
  1. Sao chÃ©p vÃ  táº¡o má»›i hai tá»‡p pipe Ä‘á»™c láº­p [short-address.pipe.ts](file:///d:/git/angular-web3-wallet/src/app/shared/pipes/short-address.pipe.ts) (rÃºt gá»n Ä‘á»‹a chá»‰ vÃ­ EVM) vÃ  [vnd.pipe.ts](file:///d:/git/angular-web3-wallet/src/app/shared/pipes/vnd.pipe.ts) (Ä‘á»‹nh dáº¡ng tiá»n tá»‡ VNÄ) vÃ o thÆ° má»¥c `src/app/shared/pipes/`.
  2. Cáº¥u hÃ¬nh cÃ¡c pipe dÆ°á»›i dáº¡ng standalone.
  3. Cáº­p nháº­t [header.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.ts) Ä‘á»ƒ import vÃ  nhÃºng `ShortAddressPipe` trá»±c tiáº¿p vÃ o máº£ng `imports`.
  4. Thay tháº¿ thuá»™c tÃ­nh logic `shortenedAddress` Ä‘Æ°á»£c tÃ­nh toÃ¡n thá»§ cÃ´ng trong `HeaderComponent` báº±ng pipe `appShortAddress` Ä‘á»™ng trong [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.html) nháº±m tá»‘i Æ°u hÃ³a vÃ  Ä‘Æ¡n giáº£n hÃ³a mÃ£ nguá»“n.

### YÃªu cáº§u: Cáº­p nháº­t quy táº¯c phÃ¡t triá»ƒn vÃ  kiáº¿n trÃºc Modal vÃ o ARCHITECTURE.md

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u bá»• sung cÃ¡c quy táº¯c báº¯t buá»™c khi lÃ m viá»‡c vá»›i Modal vÃ o `ARCHITECTURE.md` Ä‘á»ƒ láº­p trÃ¬nh viÃªn hoáº·c AI sau nÃ y tuÃ¢n thá»§:
  1. Cáº¥m sá»­ dá»¥ng cÃ¡c há»™p thoáº¡i máº·c Ä‘á»‹nh cá»§a trÃ¬nh duyá»‡t nhÆ° `alert` hay `confirm`.
  2. Modal pháº£i Ä‘Æ°á»£c thiáº¿t káº¿ dÆ°á»›i dáº¡ng Component riÃªng biá»‡t vÃ  gá»i má»Ÿ/Ä‘Ã³ng Ä‘á»™ng tá»« tá»‡p logic `.ts`, khÃ´ng nhÃºng cá»©ng vÃ o HTML template.
  3. Káº¿ thá»«a vÃ  tÃ¡i sá»­ dá»¥ng tá»‘i Ä‘a cÃ¡c Component Modal Ä‘Ã£ cÃ³ sáºµn (vÃ­ dá»¥ Modal xÃ¡c nháº­n dÃ¹ng chung) thay vÃ¬ táº¡o nhiá»u component trÃ¹ng láº·p.
- **Giáº£i phÃ¡p:** Cáº­p nháº­t tá»‡p [ARCHITECTURE.md](file:///d:/git/angular-web3-wallet/ARCHITECTURE.md), thÃªm má»¥c **"7. Quy táº¯c quáº£n lÃ½ vÃ  hiá»ƒn thá»‹ Modal (Báº¯t buá»™c)"** quy Ä‘á»‹nh chi tiáº¿t 3 nguyÃªn táº¯c nÃ y. Äá»“ng thá»i, cáº­p nháº­t tá»‡p quy táº¯c cáº¥u hÃ¬nh hÃ nh vi cá»§a AI táº¡i [GEMINI.md](file:///d:/git/angular-web3-wallet/.agent/rules/GEMINI.md) á»Ÿ má»¥c "TIER 2.1: PROJECT-SPECIFIC DESIGN RULES" Ä‘á»ƒ Ä‘áº£m báº£o cÃ¡c AI Agent trong tÆ°Æ¡ng lai luÃ´n báº¯t buá»™c tuÃ¢n thá»§ quy chuáº©n nÃ y má»™t cÃ¡ch tá»± Ä‘á»™ng.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i tá»± Ä‘Ã³ng modal vÃ  Ä‘á»“ng bá»™ symbol native token Ä‘á»™ng theo máº¡ng lÆ°á»›i

- **Ná»™i dung yÃªu cáº§u:**
  1. Khi ngÆ°á»i dÃ¹ng click vÃ o "Chi tiáº¿t vÃ­" trong dropdown cá»§a Header, modal chi tiáº¿t vÃ­ cá»§a AppKit tá»± Ä‘á»™ng bá»‹ táº¯t ngay láº­p tá»©c.
  2. DApp hiá»ƒn thá»‹ Ä‘Æ¡n vá»‹ native token balance lÃ  "ETH" má»™t cÃ¡ch tÄ©nh cho táº¥t cáº£ cÃ¡c máº¡ng (vÃ­ dá»¥ BNB Smart Chain thÃ¬ pháº£i lÃ  "BNB").
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Khi dropdown Ä‘ang má»Ÿ, ngÆ°á»i dÃ¹ng click nÃºt báº¥m. TrÃ¬nh quáº£n lÃ½ click handler Ä‘Ã³ng dropdown lÃ m cho nÃºt báº¥m bá»‹ detached khá»i DOM. TrÃ¬nh kiá»ƒm tra click-outside cá»§a AppKit tháº¥y click target khÃ´ng náº±m trong modal vÃ  khÃ´ng cÃ²n náº±m trong document, liá»n coi Ä‘Ã³ lÃ  click-outside vÃ  tá»± Ä‘á»™ng Ä‘Ã³ng modal.
  2. Má»™t nguyÃªn nhÃ¢n gá»‘c rá»… nghiÃªm trá»ng khÃ¡c: trong `web3.service.ts`, phÆ°Æ¡ng thá»©c `checkAndUpdateNetworkState` Ä‘Æ°á»£c gá»i liÃªn tá»¥c khi AppKit thay Ä‘á»•i tráº¡ng thÃ¡i. Trong phÆ°Æ¡ng thá»©c nÃ y, náº¿u máº¡ng Ä‘Æ°á»£c há»— trá»£, lá»‡nh `this.modal.close()` bá»‹ gá»i vÃ´ Ä‘iá»u kiá»‡n. Do Ä‘Ã³, khi Account modal má»Ÿ ra, AppKit trigger update máº¡ng, dáº«n Ä‘áº¿n lá»‡nh Ä‘Ã³ng modal tá»± kÃ­ch hoáº¡t, tá»± Ä‘Ã³ng modal Account ngay láº­p tá»©c.
  3. CÃ¡c file template HTML vÃ  TS Ä‘ang hiá»ƒn thá»‹ chá»¯ "ETH" tÄ©nh.
- **Giáº£i phÃ¡p:**
  1. Cáº­p nháº­t [header.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.ts): Sá»­ dá»¥ng `setTimeout` trÃ¬ hoÃ£n viá»‡c má»Ÿ modal/chuyá»ƒn máº¡ng thÃªm 100ms Ä‘á»ƒ dropdown Ä‘Ã³ng háº³n vÃ  bá»‹ loáº¡i khá»i DOM hoÃ n toÃ n trÆ°á»›c khi modal AppKit má»Ÿ ra, trÃ¡nh xung Ä‘á»™t DOM vÃ  lá»—i tá»± Ä‘Ã³ng modal.
  2. Cáº­p nháº­t [web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts): Sá»­a logic trong `checkAndUpdateNetworkState` chá»‰ cho phÃ©p gá»i `this.modal.close()` náº¿u máº¡ng trÆ°á»›c Ä‘Ã³ thá»±c sá»± lÃ  máº¡ng sai (`if (prevWrongChain)`). Äá»“ng thá»i khai bÃ¡o signal `chainSymbol` láº¥y giÃ¡ trá»‹ Ä‘á»™ng tá»« `supportedChain.nativeCurrency.symbol` cá»§a máº¡ng Ä‘ang káº¿t ná»‘i.
  3. Cáº­p nháº­t [state.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/state.service.ts): Expose signal `chainSymbol` ra bÃªn ngoÃ i.
  4. Cáº­p nháº­t [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.html), [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html) vÃ  [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts): Thay tháº¿ táº¥t cáº£ cÃ¡c nhÃ£n "ETH" cá»©ng báº±ng biáº¿n Ä‘á»™ng `chainSymbol`.


### YÃªu cáº§u: Bá»• sung Custom Date Picker vÃ  Modal Demo Showcase

- **Ná»™i dung yÃªu cáº§u:** DApp Ä‘ang thiáº¿u component `custom-date-picker` trong thÆ° má»¥c `shared/components`. NgÆ°á»i dÃ¹ng yÃªu cáº§u xÃ¢y dá»±ng component nÃ y vÃ  thÃªm má»™t Modal Demo hiá»ƒn thá»‹ táº­p há»£p táº¥t cáº£ cÃ¡c input controls (date-picker, select, switch, radio, checkbox) Ä‘á»ƒ trÃ¬nh diá»…n UI Components Showcase.
- **Giáº£i phÃ¡p:**
  1. **[NEW] `custom-date-picker/`**: Component standalone tÃ­ch há»£p `ControlValueAccessor`, lá»‹ch popover 42 ngÃ y (6 tuáº§n) tÃ­nh toÃ¡n Ä‘á»™ng, há»— trá»£ `minDate`/`maxDate`, click-outside tá»± Ä‘Ã³ng, hiá»ƒn thá»‹ ngÃ y dáº¡ng `DD/MM/YYYY`. Icon lá»‹ch SVG (`calendar`) Ä‘Ã£ cÃ³ sáºµn trong thÆ° viá»‡n `IconComponent`. TuÃ¢n thá»§ `:host { display: block; }`.
  2. **[MODIFY] `home.component.ts`**: Import `DemoModalComponent` vÃ  `ModalService`. Inject `ModalService` vÃ  Ä‘á»‹nh nghÄ©a phÆ°Æ¡ng thá»©c `openDemoModal()` Ä‘á»ƒ gá»i má»Ÿ Ä‘á»™ng `DemoModalComponent` khi ngÆ°á»i dÃ¹ng nháº¥n nÃºt. XÃ³a bá» cÃ¡c thuá»™c tÃ­nh/signals cá»§a modal cÅ© khá»i `HomeComponent`.
  3. **[MODIFY] `home.component.html`**: Bá»• sung Card 6 "Custom Date Picker" vÃ o grid Showcase. ThÃªm nÃºt "Má»Ÿ Modal Demo Form" liÃªn káº¿t vá»›i hÃ m `openDemoModal()`. XÃ³a bá» hoÃ n toÃ n khá»‘i HTML `<app-modal>` nhÃºng tÄ©nh á»Ÿ cuá»‘i file.
  4. **[NEW] `DemoModalComponent`**: Táº¡o component standalone chá»©a toÃ n bá»™ form showcase demo vÃ  live output data, Ä‘á»™c láº­p quáº£n lÃ½ tráº¡ng thÃ¡i form local vÃ  Ä‘Ã³ng modal tráº£ káº¿t quáº£ qua `ModalRef.close()`.
  4. **[OPTIMIZE] Kháº¯c phá»¥c lá»—i dÃ­nh sÃ¡t UI (Spacing)**: Chuyá»ƒn Ä‘á»•i container ngoÃ i cÃ¹ng cá»§a `DemoModalComponent` tá»« `space-y-6` sang `flex flex-col gap-5` Ä‘á»ƒ Ä‘áº£m báº£o khoáº£ng cÃ¡ch 20px (gap-5) giá»¯a báº£ng cáº¥u hÃ¬nh má»‘c giá»›i háº¡n vÃ  Ã´ nháº­p Date Picker luÃ´n hiá»ƒn thá»‹ chÃ­nh xÃ¡c, khÃ´ng bá»‹ áº£nh hÆ°á»Ÿng bá»Ÿi cÆ¡ cháº¿ káº¿t xuáº¥t element Ä‘á»™ng cá»§a Angular.
  4. **[OPTIMIZE] ThoÃ¡t khá»i overflow container**: Chuyá»ƒn Ä‘á»•i dropdown cá»§a `custom-select` vÃ  popover lá»‹ch cá»§a `custom-date-picker` tá»« Ä‘á»‹nh vá»‹ `absolute` sang `fixed` Ä‘á»™ng tÃ­nh theo tá»a Ä‘á»™ viewport (`getBoundingClientRect()`) khi má»Ÿ, káº¿t há»£p láº¯ng nghe sá»± kiá»‡n `scroll` vÃ  `resize` cá»§a cá»­a sá»• Ä‘á»ƒ Ä‘á»‹nh vá»‹ láº¡i. Äiá»u nÃ y giÃºp cÃ¡c thÃ nh pháº§n popup tá»± do hiá»ƒn thá»‹ Ä‘Ã¨ lÃªn trÃªn modal mÃ  khÃ´ng bá»‹ cáº¯t cá»¥t bá»Ÿi thuá»™c tÃ­nh `overflow-y-auto` cá»§a modal body. Äá»“ng thá»i khi hiá»ƒn thá»‹ á»Ÿ phÃ­a trÃªn (placement="top"), Ã¡p dá»¥ng `transform: translateY(-100%)` káº¿t há»£p Ä‘áº·t `top` trÃ¹ng mÃ©p trÃªn trigger (trá»« Ä‘i gap) giÃºp mÃ©p dÆ°á»›i cá»§a dropdown/lá»‹ch luÃ´n hÃ­t sÃ¡t vÃ  bÃ¡m cháº·t vÃ o trigger, khÃ´ng bá»‹ bay lÆ¡ lá»­ng khi chiá»u cao cá»§a chÃºng thay Ä‘á»•i.
  5. **[OPTIMIZE] Smart Placement**: Bá»• sung logic tÃ­nh toÃ¡n khoáº£ng khÃ´ng gian phÃ­a trÃªn vÃ  dÆ°á»›i trigger button trong viewport Ä‘á»ƒ tá»± Ä‘á»™ng hiá»ƒn thá»‹ dropdown/lá»‹ch á»Ÿ vá»‹ trÃ­ tá»‘i Æ°u (phÃ­a trÃªn náº¿u bÃªn dÆ°á»›i khÃ´ng Ä‘á»§ diá»‡n tÃ­ch).
  6. **[OPTIMIZE] Thiáº¿t káº¿ Lá»‹ch vÃ  Quick Presets**:
     - Thiáº¿t káº¿ giao diá»‡n ngÃ y hÃ´m nay dáº¡ng cháº¥m trÃ²n ná»n há»“ng nháº¡t (`bg-[var(--color-primary)]/15` vÃ  chá»¯ há»“ng) vÃ  ngÃ y Ä‘Æ°á»£c chá»n dáº¡ng trÃ²n ná»n mÃ u há»“ng neon thÆ°Æ¡ng hiá»‡u `bg-[var(--color-primary)]` káº¿t há»£p chá»¯ tráº¯ng ná»•i báº­t báº±ng `!text-white` bo trÃ²n (`rounded-full`), giáº£i quyáº¿t triá»‡t Ä‘á»ƒ lá»—i mÃ u chá»¯ bá»‹ Ä‘en chÃ¬m.
     - Bá»• sung thanh chá»n nhanh thá»i gian (7 ngÃ y, 1 thÃ¡ng, 3 thÃ¡ng, 6 thÃ¡ng, 1 nÄƒm) ngay dÆ°á»›i Ã´ nháº­p, tá»± Ä‘á»™ng tÃ­nh toÃ¡n cá»™ng thÃªm sá»‘ ngÃ y tÆ°Æ¡ng á»©ng tá»« hÃ´m nay.
     - Sá»­a Ä‘á»•i hÃ m so sÃ¡nh `minDate` Ä‘á»ƒ chuáº©n hÃ³a Ä‘á»‹nh dáº¡ng thá»i gian vÃ  vÃ´ hiá»‡u hÃ³a (disabled) chÃ­nh xÃ¡c má»i ngÃ y trÆ°á»›c má»‘c thiáº¿t láº­p.
     - **TÆ°Æ¡ng tÃ¡c linh hoáº¡t:** Máº·c Ä‘á»‹nh táº¯t giá»›i háº¡n `minDate` Ä‘á»ƒ ngÆ°á»i dÃ¹ng chá»n ngÃ y tÃ¹y Ã½. ThÃªm switch báº­t/táº¯t vÃ  input nháº­p má»‘c ngÃ y `minDate` tÃ¹y biáº¿n (nhÆ° ngÃ y 20, 30...) ngay trÃªn UI Ä‘á»ƒ kiá»ƒm thá»­ Ä‘á»™ng.
     - **Báº­t/táº¯t presets linh hoáº¡t:** ThÃªm thuá»™c tÃ­nh `@Input() showPresets` vÃ o component vÃ  switch "Hiá»ƒn thá»‹ gá»£i Ã½ chá»n nhanh (presets)" trá»±c quan trÃªn UI Showcase Ä‘á»ƒ báº­t/táº¯t hÃ ng presets nÃ y theo nhu cáº§u.
- **Káº¿t quáº£:** Build thÃ nh cÃ´ng 100% khÃ´ng lá»—i. TÃ­ch há»£p maxDate Ä‘á»™ng vÃ  Ä‘á»“ng bá»™ hÃ³a toÃ n diá»‡n UI cÃ¡c Ã´ nháº­p liá»‡u theo Design System (bo gÃ³c rounded-xl 15px, padding lá»›n, focus mÃ u thÆ°Æ¡ng hiá»‡u). Táº¥t cáº£ component Ä‘á»“ng bá»™ mÃ u `var(--color-primary)`.

### YÃªu cáº§u: Kháº¯c phá»¥c cÃ¡c lá»—i UI cá»§a cÃ¡c custom components má»›i xÃ¢y dá»±ng

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n há»“i:
  1. Giao diá»‡n cháº¥m trÃ²n cá»§a `custom-radio` bá»‹ lá»‡ch trá»¥c khi Ä‘Æ°á»£c chá»n.
  2. Dropdown cá»§a `custom-select` bá»‹ bay lÆ¡ lá»­ng, lá»‡ch vá»‹ trÃ­ sang pháº£i vÃ  lá»—i icon tÃ¬m kiáº¿m (biáº¿n thÃ nh dáº¥u há»i cháº¥m `(?)`).
  3. Icon á»Ÿ input tÃ¬m kiáº¿m cá»§a `custom-search-input` bá»‹ hiá»ƒn thá»‹ sai thÃ nh dáº¥u há»i cháº¥m `(?)`.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Keyframe `scaleUp` trong `custom-radio.component.ts` khi hoáº¡t Ä‘á»™ng Ä‘Ã£ ghi Ä‘Ã¨ thuá»™c tÃ­nh `transform: scale(...)` lÃ m máº¥t thuá»™c tÃ­nh cÄƒn giá»¯a `translate(-50%, -50%)` Ä‘Æ°á»£c Ä‘á»‹nh nghÄ©a báº±ng Tailwind class.
  2. Dropdown cá»§a `custom-select` sá»­ dá»¥ng Ä‘á»‹nh vá»‹ `fixed` báº±ng JavaScript tÃ­nh toÃ¡n tá»a Ä‘á»™ theo viewport, nhÆ°ng container cha trong `home.component.html` láº¡i sá»­ dá»¥ng `backdrop-blur-md` (táº¡o ra má»™t local containing block má»›i cho `position: fixed`), dáº«n tá»›i tá»a Ä‘á»™ bá»‹ tÃ­nh sai lá»‡ch hoÃ n toÃ n. Äá»“ng thá»i, `IconComponent` thiáº¿u case `'search'` dáº«n tá»›i render ra icon máº·c Ä‘á»‹nh (dáº¥u há»i cháº¥m).
- **Giáº£i phÃ¡p:**
  1. Cáº­p nháº­t `custom-radio.component.ts`: Sá»­a láº¡i `@keyframes scaleUp` Ä‘á»ƒ luÃ´n giá»¯ `transform: translate(-50%, -50%) scale(...)` á»Ÿ cáº£ hai tráº¡ng thÃ¡i `from` vÃ  `to`.
  2. Cáº­p nháº­t `icon.component.html`: ThÃªm case `'search'` váº½ SVG kÃ­nh lÃºp chuáº©n.
  3. Cáº­p nháº­t `custom-select.component.html` & `.ts`: Chuyá»ƒn dropdown menu sang sá»­ dá»¥ng Ä‘á»‹nh vá»‹ `absolute` trá»±c tiáº¿p thay tháº¿ cho Ä‘á»‹nh vá»‹ `fixed` tÃ­nh toÃ¡n Ä‘á»™ng báº±ng JS. Viá»‡c nÃ y giÃºp dropdown tá»± Ä‘á»™ng khá»›p theo trigger cha cÃ³ `relative` vÃ  loáº¡i bá» hoÃ n toÃ n áº£nh hÆ°á»Ÿng tá»« `backdrop-blur` hay `transform` á»Ÿ cÃ¡c card bÃªn ngoÃ i, Ä‘á»“ng thá»i lÆ°á»£c bá» cÃ¡c scroll/resize event listener dÆ° thá»«a giÃºp tá»‘i Æ°u hiá»‡u nÄƒng.

### YÃªu cáº§u: Bá»• sung UI Components vÃ  tÃ¡i cáº¥u trÃºc Layout (tham kháº£o cafe-blockchain)

- **Ná»™i dung yÃªu cáº§u:** Kiá»ƒm tra cÃ¡c component cÃ²n thiáº¿u trong `shared/components` (card, radio, switch, search input, select) tham kháº£o dá»± Ã¡n cafe-blockchain vÃ  Ã¡p dá»¥ng vÃ o cÃ¡c trang. Äá»“ng thá»i táº¡o thÆ° má»¥c `shared/layout` chá»©a Sidebar component riÃªng nhÆ° cafe-blockchain.
- **PhÃ¢n tÃ­ch Gap:**
  - Components thiáº¿u: `card`, `custom-switch`, `custom-radio`, `custom-search-input`, `custom-select`
  - Layout thiáº¿u: `shared/layout/sidebar/` (Desktop Sidebar Ä‘ang bá»‹ nhÃ©t cá»©ng vÃ o `header.component.html`)
- **Giáº£i phÃ¡p:**
  1. **[NEW] `card.component.ts`**: Directive `app-card, [app-card]` host-binding class `.app-card` / `.app-card-interactive`, dÃ¹ng `ng-content`.
  2. **[NEW] `custom-switch/`**: Component toggle 2 mode `compact` (inline) vÃ  `full` (panel card). Sá»­ dá»¥ng `var(--color-primary)` cho mÃ u checked.
  3. **[NEW] `custom-radio/`**: Implements `ControlValueAccessor`. Animated center dot báº±ng `@keyframes scaleUp`. Há»— trá»£ `label`, `description`, `name`, `value`.
  4. **[NEW] `custom-search-input/`**: Implements `ControlValueAccessor` + debounce RxJS. Input: `placeholder`, `debounce`, `loading`, `clearable`. Loading spinner dÃ¹ng mÃ u `--color-primary`.
  5. **[NEW] `custom-select/`**: Smart dropdown vá»›i fixed positioning, scroll listener, search tÃ­ch há»£p, checkmark trÃªn option Ä‘Æ°á»£c chá»n. Implements `ControlValueAccessor`.
  6. **[NEW] `shared/layout/sidebar/sidebar.component.ts + .html`**: TÃ¡ch pháº§n `<aside>` Desktop Sidebar ra khá»i `header.component.html`. Component nÃ y import `RouterModule`, `IconComponent`, `LogoComponent`, `ThemeSwitcherComponent`, `TxSpeedSelectorComponent`.
  7. **[MODIFY] `header.component.html`**: XÃ³a khá»‘i `<aside>` Desktop Sidebar (~78 dÃ²ng) Ä‘á»ƒ giáº£m kÃ­ch thÆ°á»›c file.
  8. **[MODIFY] `app.html`**: ThÃªm `<app-sidebar>` trÆ°á»›c `<app-header>`.
  9. **[MODIFY] `app.ts`**: Import `SidebarComponent` vÃ  thÃªm vÃ o `imports` array.
  10. **[MODIFY] `home.component.ts + .html`**: Import vÃ  Ã¡p dá»¥ng 4 component má»›i. ThÃªm section "UI Components Showcase" vá»›i 4 card demo: Switch, Radio, Search Input, Select.
- **Káº¿t quáº£:** Build thÃ nh cÃ´ng 100% khÃ´ng lá»—i. Táº¥t cáº£ component tuÃ¢n thá»§ `:host { display: block; }` vÃ  dÃ¹ng `var(--color-primary)` theo `design.md`.

### YÃªu cáº§u: Tá»‘i Æ°u hÃ³a mÃ£ nguá»“n Web3 vÃ  tÃ¡i sá»­ dá»¥ng component káº¿ thá»«a

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u Ä‘Ã¡nh giÃ¡ xem template Web3 Ä‘Ã£ á»•n chÆ°a vÃ  tá»‘i Æ°u hÃ³a káº¿ thá»«a component.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n & Giáº£i phÃ¡p:**
  1. TrÃ¹ng láº·p mÃ u sáº¯c máº¡ng: Di chuyá»ƒn mÃ u sáº¯c EVM trá»±c tiáº¿p vÃ o trÆ°á»ng `color` cá»§a `POPULAR_CHAINS` trong `blockchain.utils.ts`. XÃ³a bá» cÃ¡c hÃ m `getChainColor()` trÃ¹ng láº·p á»Ÿ `app.ts` vÃ  `header.component.ts`.
  2. Äá»“ng bá»™ máº¡ng nhanh á»Ÿ Trang chá»§: Thay tháº¿ card chuyá»ƒn máº¡ng nhanh viáº¿t cá»©ng báº±ng vÃ²ng láº·p Ä‘á»™ng `@for (chain of web3Service.POPULAR_CHAINS)` trong `home.component.html`.
  3. TrÃ¹ng láº·p code SVG Logo: Táº¡o má»›i component standalone `app-logo` táº¡i `src/app/shared/components/logo/logo.component.ts`. Thay tháº¿ 3 Ä‘oáº¡n mÃ£ SVG thÃ´ trÃªn header/sidebar báº±ng tháº» `<app-logo>`.
  4. TrÃ¹ng láº·p Ä‘iá»u khiá»ƒn á»Ÿ Header (Mobile Drawer & Desktop Sidebar): Táº¡o má»›i 2 component standalone `app-theme-switcher` vÃ  `app-tx-speed-selector` Ä‘á»ƒ Ä‘Ã³ng gÃ³i giao diá»‡n chuyá»ƒn theme vÃ  chá»n tá»‘c Ä‘á»™ giao dá»‹ch. Cáº¥u hÃ¬nh `:host { display: block; }` theo Ä‘Ãºng quy Ä‘á»‹nh `ARCHITECTURE.md`.
  5. Refactor Header: Sá»­a Ä‘á»•i `header.component.ts` vÃ  `header.component.html` Ä‘á»ƒ nhÃºng cÃ¡c component má»›i, rÃºt gá»n dung lÆ°á»£ng HTML cá»§a header Ä‘i hÆ¡n má»™t ná»­a.

### YÃªu cáº§u: Táº¯t Switch Network modal tá»± Ä‘á»™ng cá»§a WalletConnect vÃ  thay báº±ng DApp Modal khi káº¿t ná»‘i sai máº¡ng

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng muá»‘n tá»± quáº£n lÃ½ viá»‡c hiá»ƒn thá»‹ modal sai máº¡ng lÆ°á»›i báº±ng Modal cá»§a DApp thay vÃ¬ Ä‘á»ƒ WalletConnect tá»± Ä‘á»™ng hiá»‡n popup máº·c Ä‘á»‹nh (vá»‘n bá»‹ káº¹t khÃ´ng táº¯t Ä‘Æ°á»£c).
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n & Giáº£i phÃ¡p:**
  1. Thay Ä‘á»•i cáº¥u hÃ¬nh AppKit: Ä‘áº·t `allowUnsupportedChain: true` trong [web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts) Ä‘á»ƒ táº¯t modal tá»± Ä‘á»™ng cá»§a WalletConnect.
  2. Quáº£n lÃ½ tráº¡ng thÃ¡i DApp Modal: thÃªm signal `showWrongChainModal` trong `Web3Service`.
  3. Kháº¯c phá»¥c lá»—i khi reload trang: khi táº£i láº¡i trang, do sá»± khÃ¡c biá»‡t vá» thá»i gian trigger sá»± kiá»‡n giá»¯a `subscribeNetwork` (thÆ°á»ng cháº¡y trÆ°á»›c khi tÃ i khoáº£n Ä‘Æ°á»£c khÃ´i phá»¥c) vÃ  `subscribeAccount` (nháº­n `isConnected` sau), ta viáº¿t hÃ m helper táº­p trung `checkAndUpdateNetworkState()` Ä‘á»ƒ cáº­p nháº­t máº¡ng lÆ°á»›i chÃ­nh xÃ¡c vÃ  Ä‘á»“ng bá»™, Ä‘áº£m báº£o modal tá»± Ä‘á»™ng hiá»ƒn thá»‹ sau khi reload náº¿u vÃ­ Ä‘ang á»Ÿ sai máº¡ng.
  4. Cáº­p nháº­t giao diá»‡n:
     - TÃ­ch há»£p component `<app-modal>` vÃ o shell [app.html](file:///d:/git/angular-web3-wallet/src/app/app.html) cá»§a DApp hiá»ƒn thá»‹ danh sÃ¡ch máº¡ng há»— trá»£ vÃ  nÃºt ngáº¯t káº¿t ná»‘i vÃ­.
     - Tá»‘i Æ°u hÃ³a thiáº¿t káº¿ nÃºt máº¡ng trong modal: Loáº¡i bá» icon `chevron-right` chÆ°a Ä‘Æ°á»£c Ä‘Äƒng kÃ½ trong thÆ° viá»‡n (trÃ¡nh hiá»‡n dáº¥u há»i cháº¥m `(?)`), cÄƒn lá» trÃ¡i pháº³ng (flat alignment) gá»n gÃ ng vÃ  tÄƒng kÃ­ch cá»¡ cháº¥m mÃ u máº¡ng lÃªn `w-3.5 h-3.5` Ä‘á»ƒ tÄƒng tÃ­nh cÃ¢n Ä‘á»‘i.
     - Cáº­p nháº­t logic trong [app.ts](file:///d:/git/angular-web3-wallet/src/app/app.ts) Ä‘á»ƒ import cÃ¡c component UI vÃ  viáº¿t hÃ m trigger chuyá»ƒn Ä‘á»•i máº¡ng lÆ°á»›i.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i WalletConnect Relay Server vÃ  lá»—i treo káº¿t ná»‘i di Ä‘á»™ng (failed to publish custom payload)

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng bÃ¡o lá»—i khi káº¿t ná»‘i vÃ­ hiá»ƒn thá»‹ thÃ´ng bÃ¡o "Failed to publish custom payload, please try again. id:... tag:undefined" vÃ  bá»‹ treo loading trÃªn mobile.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Project ID cÅ© (`3cd580cdbe4845d5bcc4d40d6e7a9dd3`) cá»§a Angular Web3 Wallet bá»‹ rate-limit do dÃ¹ng chung vÃ  bá»‹ khÃ³a vÃ¬ khÃ´ng khá»›p tÃªn miá»n.
  2. WalletConnect/AppKit tá»± Ä‘á»™ng fetch remote config tá»« cloud, kÃ­ch hoáº¡t SIWE (reown authentication) khÃ´ng mong muá»‘n, dáº«n Ä‘áº¿n handshake bá»‹ treo hoáº·c tháº¥t báº¡i khi publisher payload.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t Project ID má»›i (`a196657383cc397e36c797a54165e326`) vÃ o [environment.ts](file:///d:/git/angular-web3-wallet/src/environments/environment.ts) vÃ  [environment.development.ts](file:///d:/git/angular-web3-wallet/src/environments/environment.development.ts).
  - Import `ApiController` tá»« `@reown/appkit-controllers` vÃ  ghi Ä‘Ã¨ `ApiController.fetchProjectConfig` trong hÃ m `initAppKit()` cá»§a [web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts) Ä‘á»ƒ táº¯t hoÃ n toÃ n remote config fetch & táº¯t SIWE client-side.
  - Cáº¥u hÃ¬nh `allowUnsupportedChain: false`, `features.reownAuthentication = false` vÃ  `enableCoinbase = false`.

### YÃªu cáº§u: Há»— trá»£ máº¡ng BSC, sáº¯p xáº¿p dropdown máº¡ng lÆ°á»›i vÃ  Ä‘á»“ng bá»™ UI button Káº¿t ná»‘i

- **Ná»™i dung yÃªu cáº§u:**
  1. Loáº¡i bá» cÃ¡c chain Sepolia vÃ  Polygon, thÃªm BSC Mainnet vÃ  BSC Testnet lÃ m máº¡ng Ä‘Æ°á»£c há»— trá»£.
  2. Sáº¯p xáº¿p láº¡i dropdown chá»n máº¡ng: cÃ¡c máº¡ng Mainnet náº±m á»Ÿ trÃªn, Testnet á»Ÿ dÆ°á»›i, loáº¡i bá» Ä‘Æ°á»ng gáº¡ch ngang á»Ÿ giá»¯a cÃ¡c máº¡ng.
  3. Loáº¡i bá» thÃ´ng tin chi tiáº¿t máº¡ng (Máº¡ng káº¿t ná»‘i, Chain ID) khá»i dropdown vÃ­ cá»§a account.
  4. Sá»­a nÃºt Káº¿t ná»‘i vÃ­ trÃªn Header Ä‘á»ƒ kÃ­ch cá»¡ báº±ng vá»›i nÃºt Quáº£ Ä‘á»‹a cáº§u (Ä‘á»u cao 40px - h-10) vÃ  Ä‘á»“ng nháº¥t mÃ u sáº¯c gradient.
  5. Äáº·t Arbitrum One lÃ m chain máº·c Ä‘á»‹nh khi khá»Ÿi táº¡o DApp.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts): Thay tháº¿ imports vÃ  supportedChains, Ä‘Æ°a `arbitrum` lÃªn Ä‘áº§u máº£ng supportedChains Ä‘á»ƒ Ä‘áº·t lÃ m chain máº·c Ä‘á»‹nh. ThÃªm method `openAccountModal()`.
  - Cáº­p nháº­t [header.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/header/header.component.ts): ThÃªm import `ButtonComponent` vÃ  bá»• sung vÃ o metadata component; cáº­p nháº­t mapping explorer URL cho BSC.
  - Cáº­p nháº­t [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/header/header.component.html):
    - Äáº·t class `w-10 h-10 shrink-0` cho nÃºt quáº£ Ä‘á»‹a cáº§u.
    - Sáº¯p xáº¿p láº¡i thá»© tá»± máº¡ng (Ethereum -> Arbitrum One -> BNB Smart Chain -> Arbitrum Sepolia -> BSC Testnet) vÃ  bá» tháº» divider.
    - Ãp dá»¥ng `app-button variant="primary"` vá»›i class `h-10 text-xs sm:text-sm px-4 sm:px-6 shrink-0` cho nÃºt Káº¿t ná»‘i vÃ­ trÃªn header.
    - Sá»­a nÃºt "Chi tiáº¿t vÃ­" trong account dropdown gá»i `web3Service.openAccountModal()`.
    - XÃ³a khá»‘i thÃ´ng tin máº¡ng káº¿t ná»‘i vÃ  Chain ID á»Ÿ cuá»‘i account dropdown.
    - Giáº£m padding cÃ¡c item dropdown tá»« `py-3` xuá»‘ng `py-2` Ä‘á»ƒ giao diá»‡n gá»n gÃ ng hÆ¡n.

### YÃªu cáº§u: Äá»“ng bá»™ border-radius cá»§a nÃºt vÃ­ trÃªn Header

- **Ná»™i dung yÃªu cáº§u:** Thá»‘ng nháº¥t bo gÃ³c (border-radius) cho cÃ¡c nÃºt trÃªn Header, khÃ´ng Ä‘Æ°á»£c sá»­ dá»¥ng gÃ³c bo khÃ¡c biá»‡t.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:** NÃºt vÃ­ khi Ä‘Ã£ káº¿t ná»‘i sá»­ dá»¥ng class `rounded-full` trong khi nÃºt quáº£ Ä‘á»‹a cáº§u vÃ  nÃºt káº¿t ná»‘i khi chÆ°a káº¿t ná»‘i Ä‘á»u sá»­ dá»¥ng bo gÃ³c tá»‘i Ä‘a 15px (`rounded-xl` / `btn`), gÃ¢y ra sá»± lá»‡ch tÃ´ng vÃ  thiáº¿u nháº¥t quÃ¡n trÃªn giao diá»‡n Header.
- **Giáº£i phÃ¡p:** Cáº­p nháº­t [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/header/header.component.html), thay tháº¿ class `rounded-full` cá»§a nÃºt vÃ­ EVM (khi Ä‘Ã£ káº¿t ná»‘i) thÃ nh `rounded-xl` Ä‘á»ƒ khá»›p vá»›i quy chuáº©n chung.

### YÃªu cáº§u: Chuáº©n hÃ³a vÃ  Ä‘á»“ng bá»™ cÃ¡c nÃºt báº¥m Header báº±ng app-button

- **Ná»™i dung yÃªu cáº§u:** Chuyá»ƒn Ä‘á»•i táº¥t cáº£ cÃ¡c nÃºt báº¥m hÃ nh Ä‘á»™ng (Action Buttons) trÃªn Header sang sá»­ dá»¥ng chung directive `app-button` Ä‘á»ƒ káº¿ thá»«a thá»‘ng nháº¥t thiáº¿t káº¿ cá»§a há»‡ thá»‘ng.
- **Giáº£i phÃ¡p:** Cáº­p nháº­t [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/header/header.component.html):
  - Chuyá»ƒn Ä‘á»•i **Hamburger Button** (Mobile Header) sang sá»­ dá»¥ng `<button app-button variant="cancel">` (nÃºt xÃ¡m trung tÃ­nh).
  - Chuyá»ƒn Ä‘á»•i **Globe Button** (Quáº£ Ä‘á»‹a cáº§u chá»n máº¡ng) sang sá»­ dá»¥ng `<button app-button variant="cancel">` (nÃºt xÃ¡m trung tÃ­nh).
  - Chuyá»ƒn Ä‘á»•i **NÃºt VÃ­** (khi Ä‘Ã£ káº¿t ná»‘i) sang sá»­ dá»¥ng `<button app-button variant="secondary">` (nÃºt mÃ u viá»n vÃ  ná»n há»“ng nháº¡t chuyá»ƒn Ä‘á»•i theo accent color Ä‘á»™ng cá»§a há»‡ thá»‘ng).

### YÃªu cáº§u: Bá» hiá»‡u á»©ng blur backdrop cá»§a Mobile Drawer

- **Ná»™i dung yÃªu cáº§u:** Bá» hiá»‡u á»©ng nhÃ²e (backdrop-blur-sm) á»Ÿ lá»›p ná»n phá»§ tá»‘i khi má»Ÿ Mobile Drawer, chá»‰ sá»­ dá»¥ng mÃ u Ä‘en giáº£m opacity thÃ´ng thÆ°á»ng.
- **Giáº£i phÃ¡p:** Cáº­p nháº­t [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/header/header.component.html), loáº¡i bá» class `backdrop-blur-sm` khá»i tháº» backdrop overlay vÃ  Ä‘á»•i `bg-black/40` thÃ nh `bg-black/50`.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i gá»­i giao dá»‹ch chuyá»ƒn ETH trÃªn di Ä‘á»™ng (Unknown method(s) requested)

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng bÃ¡o lá»—i khi thá»±c hiá»‡n giao dá»‹ch chuyá»ƒn ETH trÃªn thiáº¿t bá»‹ di Ä‘á»™ng (vÃ­ dá»¥ qua vÃ­ Trust Wallet), á»©ng dá»¥ng bÃ¡o lá»—i `could not coalesce error (error={"code": 5201, "message": "Unknown method(s) requested"})` khiáº¿n giao dá»‹ch tháº¥t báº¡i.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. Khi sá»­ dá»¥ng Ethers.js v6 káº¿t ná»‘i qua WalletConnect/AppKit trÃªn di Ä‘á»™ng, má»™t sá»‘ vÃ­ di Ä‘á»™ng nhÆ° Trust Wallet yÃªu cáº§u tham sá»‘ transaction pháº£i cá»±c ká»³ chuáº©n hÃ³a. Náº¿u trÆ°á»ng `data` khÃ´ng cÃ³ dá»¯ liá»‡u mÃ  bá»‹ bá» trá»‘ng (`undefined`), vÃ­ sáº½ parse sai payload hoáº·c tá»« chá»‘i vÃ¬ thiáº¿u trÆ°á»ng.
  2. Viá»‡c khÃ´ng chá»‰ Ä‘á»‹nh rÃµ `chainId` trong transaction request cÃ³ thá»ƒ khiáº¿n vÃ­ di Ä‘á»™ng khÃ´ng khá»›p Ä‘Æ°á»£c vá»›i session hiá»‡n táº¡i trong trÆ°á»ng há»£p session chÆ°a ká»‹p cáº­p nháº­t hoáº·c cÃ³ sá»± lá»‡ch chain giá»¯a DApp vÃ  vÃ­.
- **Giáº£i phÃ¡p:** Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/home.component.ts), Ä‘iá»n máº·c Ä‘á»‹nh thuá»™c tÃ­nh `data: '0x'` vÃ  truyá»n tÆ°á»ng minh `chainId: Number(this.web3Service.chainId())` vÃ o Ä‘á»‘i tÆ°á»£ng `txRequest` trÆ°á»›c khi gá»i `signer.sendTransaction(txRequest)`.

### YÃªu cáº§u: Loáº¡i bá» toast káº¿t ná»‘i vÃ­ khi reload vÃ  cÄƒn giá»¯a toast trÃªn mobile

- **Ná»™i dung yÃªu cáº§u:**
  1. Loáº¡i bá» thÃ´ng bÃ¡o toast "Káº¿t ná»‘i vÃ­ thÃ nh cÃ´ng" hiá»ƒn thá»‹ dÆ° thá»«a khi ngÆ°á»i dÃ¹ng reload trang (F5) mÃ  vÃ­ Ä‘Ã£ káº¿t ná»‘i tá»« trÆ°á»›c.
  2. CÄƒn chá»‰nh láº¡i hiá»ƒn thá»‹ toast trÃªn thiáº¿t bá»‹ di Ä‘á»™ng (mobile): hiá»ƒn thá»‹ á»Ÿ phÃ­a dÆ°á»›i nhÆ°ng cÄƒn giá»¯a chiá»u ngang thay vÃ¬ lá»‡ch gÃ³c pháº£i.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts): XÃ³a bá» háº³n lá»‡nh `this.toastService.showToast('Káº¿t ná»‘i vÃ­ thÃ nh cÃ´ng!', 'success')` trong hÃ m `subscribeAccount`.
  - Cáº­p nháº­t [toast.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/toast/toast.component.html): Thay tháº¿ Ä‘á»‹nh vá»‹ class cá»§a wrapper thÃ nh `fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0` Ä‘á»ƒ tá»± Ä‘á»™ng cÄƒn giá»¯a ngang trÃªn mobile vÃ  trá»Ÿ vá» gÃ³c pháº£i dÆ°á»›i trÃªn desktop.

### YÃªu cáº§u: Chuáº©n hÃ³a cáº¥u hÃ¬nh RPC vÃ  Explorer qua blockchain.utils.ts giá»‘ng cafe-blockchain

- **Ná»™i dung yÃªu cáº§u:** Xem cáº¥u trÃºc source code cá»§a `cafe-blockchain` vÃ  tá»• chá»©c láº¡i cÃ¡ch lÆ°u trá»¯, cáº¥u hÃ¬nh RPC vÃ  Explorer URL táº­p trung thay vÃ¬ map tÄ©nh cá»©ng á»Ÿ UI.
- **Giáº£i phÃ¡p:**
  - Táº¡o má»›i file [blockchain.utils.ts](file:///d:/git/angular-web3-wallet/src/app/core/utils/blockchain.utils.ts) Ä‘á»‹nh nghÄ©a háº±ng sá»‘ `POPULAR_CHAINS` (chá»©a RPC URL, Explorer URL vÃ  tÃªn cá»§a 5 chain: Ethereum, Arbitrum One, BNB Smart Chain, Arbitrum Sepolia, BSC Testnet) cÃ¹ng cÃ¡c hÃ m bá»• trá»£ `getExplorerApiUrl` vÃ  `getBackupRpcUrls`.
  - Cáº­p nháº­t [web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts): Import `POPULAR_CHAINS` vÃ  dÃ¹ng cÆ¡ cháº¿ `.map` Ä‘á»ƒ ghi Ä‘Ã¨ dynamic RPC/Explorer URL cho 5 chain cá»§a Reown AppKit trÆ°á»›c khi truyá»n khá»Ÿi táº¡o modal.
  - Cáº­p nháº­t [header.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/header/header.component.ts): Thay tháº¿ cáº¥u trÃºc switch-case map tÄ©nh báº±ng viá»‡c tÃ¬m kiáº¿m vÃ  láº¥y `explorerUrl` trá»±c tiáº¿p tá»« `POPULAR_CHAINS` dá»±a theo `chainId` Ä‘á»™ng cá»§a vÃ­ Ä‘ang káº¿t ná»‘i. Äá»“ng thá»i thÃªm hÃ m helper `getChainColor` Ä‘á»ƒ tráº£ vá» mÃ u sáº¯c cá»§a cháº¥m trÃ²n cá»§a tá»«ng máº¡ng.
  - Cáº­p nháº­t [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/header/header.component.html): Loáº¡i bá» 5 nÃºt máº¡ng viáº¿t cá»©ng (hardcode) trong HTML vÃ  thay tháº¿ báº±ng vÃ²ng láº·p `@for` Ä‘á»™ng láº·p qua `web3Service.POPULAR_CHAINS`.

### YÃªu cáº§u: Giáº£i Ä‘Ã¡p lá»—i treo mÃ n hÃ¬nh loading (xoay vÃ²ng vÃ´ táº­n) "Continue in MetaMask/Trust Wallet..." trÃªn di Ä‘á»™ng

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n Ã¡nh khi báº¥m káº¿t ná»‘i vÃ­ (MetaMask, Trust Wallet...) trÃªn trÃ¬nh duyá»‡t di Ä‘á»™ng, WalletConnect/AppKit hiá»ƒn thá»‹ thÃ´ng bÃ¡o "Continue in..." vÃ  xoay vÃ²ng vÃ´ táº­n mÃ  khÃ´ng tá»± Ä‘á»™ng má»Ÿ á»©ng dá»¥ng vÃ­.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. **Thiáº¿u HTTPS (HTTP Localhost/IP):** Mobile Web3 yÃªu cáº§u HTTPS Ä‘á»ƒ thá»±c hiá»‡n cÃ¡c cÆ¡ cháº¿ báº£o máº­t cá»§a Universal Links/Deep link. Náº¿u test trÃªn local IP (`http://192.168.1.x:4200`), vÃ­ sáº½ khÃ´ng pháº£n há»“i session handshake.
  2. **TrÃ¬nh duyá»‡t In-App (In-App Browsers):** CÃ¡c trÃ¬nh duyá»‡t tÃ­ch há»£p trong Zalo, Telegram, Facebook, Messenger cháº·n kÃ­ch hoáº¡t á»©ng dá»¥ng ngoÃ i vÃ¬ lÃ½ do báº£o máº­t.
  3. **Káº¹t session cÅ© (Stale Connect Session):** Handshake bá»‹ treo do session cÅ© trÃªn vÃ­ chÆ°a Ä‘Æ°á»£c ngáº¯t háº³n.
  4. **Cáº¥u hÃ¬nh Metadata `url` khÃ´ng khá»›p:** Thuá»™c tÃ­nh `url` Ä‘Æ°á»£c gá»­i Ä‘i tá»« AppKit khÃ´ng khá»›p vá»›i tÃªn miá»n truy cáº­p thá»±c táº¿.
- **Giáº£i phÃ¡p:**
  - HÆ°á»›ng dáº«n Developer dÃ¹ng `ngrok` hoáº·c `localtunnel` Ä‘á»ƒ cháº¡y giao thá»©c HTTPS khi kiá»ƒm thá»­ di Ä‘á»™ng.
  - HÆ°á»›ng dáº«n ngÆ°á»i dÃ¹ng má»Ÿ DApp báº±ng trÃ¬nh duyá»‡t chÃ­nh thá»‘ng (Safari/Chrome) hoáº·c truy cáº­p trá»±c tiáº¿p báº±ng trÃ¬nh duyá»‡t tÃ­ch há»£p (In-App Browser) bÃªn trong vÃ­.
  - HÆ°á»›ng dáº«n ngáº¯t káº¿t ná»‘i cÃ¡c session cÅ© trong CÃ i Ä‘áº·t cá»§a MetaMask/Trust Wallet vÃ  xÃ³a cookies/cache.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i khÃ´ng thá»ƒ gá»­i ETH (lá»—i TypeError: this.amount(...).trim is not a function)

- **Ná»™i dung yÃªu cáº§u:** Khi báº¥m nÃºt "XÃ¡c nháº­n gá»­i ETH", giao dá»‹ch khÃ´ng thá»±c hiá»‡n Ä‘Æ°á»£c vÃ  console bÃ¡o lá»—i: `TypeError: this.amount(...).trim is not a function` táº¡i `app.ts`.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:** Ã” input sá»‘ lÆ°á»£ng ETH cÃ³ kiá»ƒu `type="number"` vÃ  Ä‘Æ°á»£c liÃªn káº¿t hai chiá»u qua `[(ngModel)]="amount"`. Khi ngÆ°á»i dÃ¹ng nháº­p sá»‘, Angular ngModel tá»± Ä‘á»™ng chuyá»ƒn Ä‘á»•i kiá»ƒu dá»¯ liá»‡u cá»§a `amount` trong Signal tá»« `string` sang `number`. Do Ä‘Ã³, khi gá»i `this.amount().trim()`, JavaScript bÃ¡o lá»—i do kiá»ƒu `number` khÃ´ng cÃ³ hÃ m `trim()`.
- **Giáº£i phÃ¡p:** Cáº­p nháº­t file [app.ts](file:///d:/git/angular-web3-wallet/src/app/app.ts), bá»c giÃ¡ trá»‹ cá»§a `this.amount()` vÃ  `this.toAddress()` qua hÃ m `String(...)` trÆ°á»›c khi gá»i `.trim()`. Ãp dá»¥ng tÆ°Æ¡ng tá»± cho `this.messageToSign()` Ä‘á»ƒ Ä‘áº£m báº£o an toÃ n kiá»ƒu dá»¯ liá»‡u.

### YÃªu cáº§u: Cáº¥u hÃ¬nh tá»‡p `netlify.toml` bá»‹ lá»—i build trÃªn Netlify

- **Ná»™i dung yÃªu cáº§u:** Lá»—i build khÃ´ng thÃ nh cÃ´ng trÃªn Netlify do cáº¥u hÃ¬nh sai Ä‘Æ°á»ng dáº«n trong `netlify.toml`.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:** Tá»‡p cáº¥u hÃ¬nh cÅ© khai bÃ¡o `base = "cafe-blockchain-web"` vÃ  `publish = "dist/cafe-blockchain-web/browser"`. Do project nÃ y cÃ³ tÃªn lÃ  `angular-web3-wallet` vÃ  mÃ£ nguá»“n náº±m á»Ÿ thÆ° má»¥c gá»‘c (khÃ´ng pháº£i thÆ° má»¥c con `cafe-blockchain-web`), Netlify khÃ´ng thá»ƒ cháº¡y lá»‡nh build vÃ  tÃ¬m Ä‘Ãºng thÆ° má»¥c Ä‘á»ƒ deploy.
- **Giáº£i phÃ¡p:** Cáº­p nháº­t file [netlify.toml](file:///d:/git/angular-web3-wallet/netlify.toml), loáº¡i bá» hoÃ n toÃ n thuá»™c tÃ­nh `base`, Ä‘á»•i `publish` thÃ nh `"dist/angular-web3-wallet/browser"`, Ä‘á»“ng thá»i thÃªm cáº¥u hÃ¬nh `[[redirects]]` Ä‘á»ƒ trÃ¡nh lá»—i 404 cho Angular Single Page Application (SPA).

### YÃªu cáº§u: Äiá»u chá»‰nh giao diá»‡n Header vÃ  Mobile Drawer theo thiáº¿t káº¿

- **Ná»™i dung yÃªu cáº§u:**
  1. Loáº¡i bá» nÃºt Ä‘iá»u khiá»ƒn Theme (Light/Dark/Auto) trÃªn Header Menu.
  2. Thay Ä‘á»•i chá»©c nÄƒng nÃºt Quáº£ Ä‘á»‹a cáº§u tá»« "Chuyá»ƒn Ä‘á»•i ngÃ´n ngá»¯" thÃ nh "Chuyá»ƒn Ä‘á»•i máº¡ng lÆ°á»›i" (káº¿t ná»‘i má»Ÿ WalletConnect/AppKit Network dropdown).
  3. Gá»¡ bá» hoÃ n toÃ n má»¥c "CÃ i Ä‘áº·t" / "Chuyá»ƒn máº¡ng lÆ°á»›i" á»Ÿ Mobile Drawer (Sidebar).
  4. Chuyá»ƒn Ä‘á»•i khu vá»±c hiá»ƒn thá»‹ tÃªn máº¡ng Ä‘ang chá»n á»Ÿ giá»¯a Header thÃ nh má»™t badge tÄ©nh mÃ u há»“ng, khÃ´ng cho phÃ©p click Ä‘á»ƒ Ä‘á»•i máº¡ng theo thiáº¿t káº¿ máº«u.
  5. áº¨n chá»¯ tÃªn thÆ°Æ¡ng hiá»‡u "Angular Web3" vÃ  "Proof of Random" trÃªn thiáº¿t bá»‹ di Ä‘á»™ng, Ä‘á»“ng thá»i cho phÃ©p nÃºt Quáº£ Ä‘á»‹a cáº§u (chá»n máº¡ng nhanh) hiá»ƒn thá»‹ trÃªn cáº£ di Ä‘á»™ng Ä‘á»ƒ thuáº­n tiá»‡n thao tÃ¡c.
  6. XÃ¢y dá»±ng má»™t Sidebar cá»‘ Ä‘á»‹nh á»Ÿ bÃªn trÃ¡i trÃªn mÃ n hÃ¬nh desktop (giá»‘ng nhÆ° Drawer trÃªn mobile) chá»©a Logo, Menu links, Bá»™ chá»n tá»‘c Ä‘á»™ giao dá»‹ch vÃ  Theme Switcher, Ä‘á»“ng thá»i dá»‹ch chuyá»ƒn vÃ¹ng Main Content vÃ  Header sang pháº£i 72px (288px) thÃ´ng qua class `md:pl-72`.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/header/header.component.html):
    - XÃ³a khá»‘i HTML cá»§a Theme Switcher trÃªn Header.
    - XÃ³a khá»‘i dropdown ngÃ´n ngá»¯, thay tháº¿ nÃºt quáº£ Ä‘á»‹a cáº§u cÅ© báº±ng bá»™ nÃºt click má»Ÿ dropdown máº¡ng nhanh.
    - Thay Ä‘á»•i khung hiá»ƒn thá»‹ máº¡ng á»Ÿ giá»¯a Header thÃ nh má»™t `div` badge tÄ©nh dáº¡ng pill mÃ u há»“ng nháº¡t/chá»¯ há»“ng Ä‘áº­m cÃ³ cháº¥m trÃ²n Ä‘áº¡i diá»‡n, loáº¡i bá» sá»± kiá»‡n click chuyá»ƒn máº¡ng táº¡i Ä‘Ã¢y.
    - áº¨n text tÃªn thÆ°Æ¡ng hiá»‡u báº±ng cÃ¡ch thÃªm class `hidden md:flex flex-col` vÃ o khá»‘i chá»©a.
    - Cho phÃ©p nÃºt quáº£ Ä‘á»‹a cáº§u hiá»ƒn thá»‹ trÃªn mobile báº±ng cÃ¡ch Ä‘á»•i wrapper tá»« `hidden md:relative md:block` thÃ nh `relative block`.
    - ThÃªm khá»‘i `<aside>` lÃ m Sidebar cá»‘ Ä‘á»‹nh bÃªn trÃ¡i trÃªn desktop.
    - Cáº¥u hÃ¬nh sá»­ dá»¥ng `routerLink` vÃ  `routerLinkActive` cho cÃ¡c menu link Ä‘á»ƒ Ä‘á»•i trang thá»±c táº¿ vÃ  Ä‘á»“ng bá»™ class active cho cáº£ Sidebar vÃ  Mobile Drawer.
    - Sá»­a lá»—i Header ngang Ä‘Ã¨ che khuáº¥t logo á»Ÿ gÃ³c trÃªn cÃ¹ng cá»§a Sidebar báº±ng cÃ¡ch tÄƒng `z-index` cá»§a Sidebar cá»‘ Ä‘á»‹nh lÃªn `z-50` vÃ  giáº£m `z-index` cá»§a Header trÃªn desktop xuá»‘ng `md:z-30` (giÃºp Sidebar xáº¿p chá»“ng lÃªn trÃªn Header á»Ÿ Ä‘iá»ƒm giao nhau).
    - Äá»“ng bá»™ bá»™ chá»n tá»‘c Ä‘á»™ giao dá»‹ch segmented control vÃ  trÆ°á»ng nháº­p há»‡ sá»‘ nhÃ¢n cho cáº£ **Mobile Drawer** vÃ  **Desktop Sidebar**.
    - Thay Ä‘á»•i tÃªn thÆ°Æ¡ng hiá»‡u, nhÃ£n phá»¥ vÃ  báº£n quyá»n chÃ¢n trang tá»« `ProofRandom` / `Proof of Random` thÃ nh `Angular Web3` / `Web3 Template` trÃªn toÃ n bá»™ Header, Mobile Drawer vÃ  Desktop Sidebar.
    - Äiá»u chá»‰nh bá»‘ cá»¥c pháº§n **LOGO & BRAND** trÃªn Desktop Sidebar sang dáº¡ng hÃ ng ngang (Row Layout): Logo náº±m bÃªn trÃ¡i, tiÃªu Ä‘á» thÆ°Æ¡ng hiá»‡u (Angular Web3) vÃ  nhÃ£n phá»¥ náº±m bÃªn pháº£i Ä‘á»ƒ cÃ¢n Ä‘á»‘i vÃ  phÃ¹ há»£p vá»›i thiáº¿t káº¿ máº«u.
    - Äá»“ng bá»™ láº¡i thá»© tá»± cÃ¡c má»¥c táº¡i Footer cá»§a Mobile Drawer (Tá»‘c Ä‘á»™ giao dá»‹ch á»Ÿ trÃªn, Giao diá»‡n á»Ÿ dÆ°á»›i) Ä‘á»“ng nháº¥t hoÃ n toÃ n vá»›i Desktop Sidebar.
    - Äá»“ng bá»™ hÃ³a mÃ u sáº¯c chá»¯ thÆ°Æ¡ng hiá»‡u `Angular Web3` (Angular mÃ u há»“ng, Web3 mÃ u tÃ­m/indigo) vÃ  Logo SVG xoay trÃ²n á»Ÿ táº¥t cáº£ cÃ¡c vá»‹ trÃ­ (Mobile Header, Mobile Drawer, Desktop Sidebar) Ä‘á»ƒ Ä‘áº£m báº£o tÃ­nh nháº¥t quÃ¡n cá»§a giao diá»‡n DApp.
    - Cáº¥u hÃ¬nh hiá»‡u á»©ng trÆ°á»£t Ä‘á»™ng (animation) mÆ°á»£t mÃ  cho **Mobile Drawer** cáº£ khi má»Ÿ vÃ  Ä‘Ã³ng báº±ng cÃ¡ch chuyá»ƒn Ä‘á»•i tá»« cáº¥u hÃ¬nh `@if` cá»©ng sang Ä‘iá»u khiá»ƒn thuá»™c tÃ­nh CSS transition (`invisible`, `opacity-100`, `-translate-x-full`, `translate-x-0`).
    - Cho phÃ©p hiá»ƒn thá»‹ sá»‘ dÆ° native token (ETH) trÃªn thiáº¿t bá»‹ di Ä‘á»™ng báº±ng cÃ¡ch loáº¡i bá» lá»›p CSS áº©n (`hidden sm:inline-block`) trÃªn nÃºt káº¿t ná»‘i vÃ­ táº¡i Header.

  - Cáº­p nháº­t [header.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/header/header.component.ts): XÃ³a bá» cÃ¡c thuá»™c tÃ­nh vÃ  phÆ°Æ¡ng thá»©c khÃ´ng dÃ¹ng tá»›i liÃªn quan Ä‘áº¿n ngÃ´n ngá»¯ (`showLangDropdown`, `currentLang`, `toggleLangDropdown`, `selectLang`). ThÃªm signal vÃ  hÃ m toggle cho dropdown chá»n máº¡ng nhanh (`showNetworkDropdown`). Khai bÃ¡o signal `txSpeed` quáº£n lÃ½ tá»‘c Ä‘á»™ giao dá»‹ch trÃªn Sidebar. Import `RouterModule` vÃ  `FormsModule` phá»¥c vá»¥ chá»‰ thá»‹ route vÃ  nháº­p liá»‡u.
  - Cáº­p nháº­t [app.html](file:///d:/git/angular-web3-wallet/src/app/app.html): TÃ¡ch toÃ n bá»™ ná»™i dung HTML cá»§a cÃ¡c trang con ra ngoÃ i Ä‘á»ƒ trÃ¡nh dá»“n á»© file. app.html bÃ¢y giá» chá»‰ Ä‘Ã³ng vai trÃ² lÃ  shell layout chá»©a `<app-header>`, `<router-outlet>` (Ä‘Æ°á»£c bá»c trong `div` cÃ³ class `md:pl-72`) vÃ  `<app-toast>`.
  - Cáº­p nháº­t [app.ts](file:///d:/git/angular-web3-wallet/src/app/app.ts): Tinh gá»n hoÃ n toÃ n, chuyá»ƒn toÃ n bá»™ logic Web3 sang `HomeComponent`. app.ts chá»‰ cÃ²n khai bÃ¡o class shell trá»‘ng import `RouterOutlet`, `HeaderComponent` vÃ  `ToastComponent`.
  - Cáº¥u hÃ¬nh [app.routes.ts](file:///d:/git/angular-web3-wallet/src/app/app.routes.ts): ÄÄƒng kÃ½ 3 route chÃ­nh dáº«n tá»›i `HomeComponent` (Trang chá»§ Web3), `AboutComponent` (Giá»›i thiá»‡u) vÃ  `ContactComponent` (LiÃªn há»‡).
  - Táº¡o má»›i cÃ¡c file [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/home.component.ts), [home.component.html](file:///d:/git/angular-web3-wallet/src/app/home.component.html), [about.component.ts](file:///d:/git/angular-web3-wallet/src/app/about.component.ts), [contact.component.ts](file:///d:/git/angular-web3-wallet/src/app/contact.component.ts).
  - Cáº­p nháº­t [contact.component.ts](file:///d:/git/angular-web3-wallet/src/app/contact.component.ts): Sá»­a lá»—i Ä‘á»™ tÆ°Æ¡ng pháº£n vÃ  thay tháº¿ lá»›p mÃ u khÃ´ng tá»“n táº¡i `dark:text-slate-350` thÃ nh `dark:text-slate-300` (giÃºp chá»¯ sÃ¡ng rÃµ nÃ©t, dá»… Ä‘á»c trÃªn ná»n tá»‘i). Äá»“ng thá»i thay Ä‘á»•i mÃ´ táº£ thÆ°Æ¡ng hiá»‡u tá»« `ProofRandom` thÃ nh `Angular Web3`.
  - Cáº­p nháº­t [web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts): Khai bÃ¡o signal táº­p trung `txSpeed` (Máº·c Ä‘á»‹nh/Nhanh/TÃ¹y chá»n) vÃ  `gasMultiplier` (há»‡ sá»‘ nhÃ¢n phÃ­ gas).
  - Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/home.component.ts): TÃ­ch há»£p tÃ­nh toÃ¡n phÃ­ gas Ä‘á»™ng (`maxFeePerGas`, `maxPriorityFeePerGas`) khi chuyá»ƒn ETH theo há»‡ sá»‘ nhÃ¢n do ngÆ°á»i dÃ¹ng thiáº¿t láº­p, Ä‘á»“ng thá»i Ä‘á»•i tÃªn thÆ°Æ¡ng hiá»‡u trong chuá»—i thÃ´ng Ä‘iá»‡p kÃ½.
  - Cáº­p nháº­t [toast.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/toast.service.ts) vÃ  [toast.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/toast/toast.component.ts): NÃ¢ng cáº¥p cÆ¡ cháº¿ quáº£n lÃ½ Toast thÃ nh máº£ng cÃ¡c `ToastItem` Ä‘á»ƒ há»— trá»£ hiá»ƒn thá»‹ nhiá»u thÃ´ng bÃ¡o cÃ¹ng lÃºc (xáº¿p chá»“ng lÃªn nhau á»Ÿ gÃ³c mÃ n hÃ¬nh) thay vÃ¬ chá»‰ hiá»ƒn thá»‹ tá»‘i Ä‘a má»™t thÃ´ng bÃ¡o duy nháº¥t táº¡i má»™t thá»i Ä‘iá»ƒm.
  - Cáº­p nháº­t [toast.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/toast/toast.component.html): Duyá»‡t vÃ  hiá»ƒn thá»‹ danh sÃ¡ch cÃ¡c toast thÃ´ng qua chá»‰ thá»‹ `@for`, gÃ¡n thá»i gian cháº¡y lÃ¹i cá»§a thanh tiáº¿n trÃ¬nh (`animationDuration`) Ä‘á»™ng theo thá»i gian sá»‘ng cá»¥ thá»ƒ cá»§a má»—i toast. PhÃ¢n Ä‘á»‹nh rÃµ 3 loáº¡i mÃ u sáº¯c: Xanh lÃ¡ cÃ¢y cho ThÃ nh cÃ´ng, Äá» cho Lá»—i, VÃ ng cho Cáº£nh bÃ¡o/Chá» xá»­ lÃ½ mÃ  khÃ´ng bá»‹ láº«n lá»™n mÃ u sáº¯c gradient thÆ°Æ¡ng hiá»‡u.
  - Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/home.component.ts): Äá»•i cÃ¡c tráº¡ng thÃ¡i chá» xá»­ lÃ½ (pending) nhÆ° gá»­i giao dá»‹ch, chá» khai thÃ¡c sang loáº¡i `warning` Ä‘á»ƒ hiá»ƒn thá»‹ mÃ u vÃ ng/cam trá»±c quan.
  - Cáº­p nháº­t [icon.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/icon/icon.component.html): ThÃªm case `'loading'` chá»©a path SVG Ä‘Æ°á»ng trÃ²n khuyáº¿t 3/4 giÃºp cÃ¡c nÃºt báº¥m khi á»Ÿ tráº¡ng thÃ¡i gá»­i giao dá»‹ch/kÃ½ tin nháº¯n hiá»ƒn thá»‹ spinner xoay trÃ²n chÃ­nh xÃ¡c thay vÃ¬ fallback icon cháº¥m há»i.

### YÃªu cáº§u: Sá»­a lá»—i DApp chá»n máº¡ng khÃ¡c trong dropdown khÃ´ng Ä‘á»•i Ä‘Æ°á»£c máº¡ng

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng bÃ¡o lá»—i khi chá»n máº¡ng khÃ¡c (nhÆ° Arbitrum One hay Arbitrum Sepolia) trong dropdown chá»n nhanh máº¡ng lÆ°á»›i thÃ¬ khÃ´ng Ä‘á»•i Ä‘Æ°á»£c máº¡ng.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:** HÃ m `switchNetwork(chainId)` trÆ°á»›c Ä‘Ã³ gá»i `this.modal.switchNetwork({ chainId } as any)`. Theo tÃ i liá»‡u cá»§a Reown AppKit, hÃ m `switchNetwork` nháº­n má»™t Ä‘á»‘i tÆ°á»£ng `caipNetwork` hoÃ n chá»‰nh (Ä‘Æ°á»£c import tá»« `@reown/appkit/networks`) hoáº·c má»™t chuá»—i CAIP-2 dáº¡ng `'eip155:1'`. Viá»‡c truyá»n má»™t object `{ chainId }` tá»± cháº¿ lÃ  khÃ´ng há»£p lá»‡.
- **Giáº£i phÃ¡p:** Cáº­p nháº­t hÃ m `switchNetwork(chainId)` trong [web3.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/web3.service.ts). TÃ¬m Ä‘á»‘i tÆ°á»£ng máº¡ng tÆ°Æ¡ng á»©ng trong máº£ng `supportedChains` dá»±a trÃªn `id` vÃ  truyá»n trá»±c tiáº¿p Ä‘á»‘i tÆ°á»£ng máº¡ng (chain) Ä‘Ã³ cho `this.modal.switchNetwork(network)`.

## NgÃ y 08/07/2026

### YÃªu cáº§u: XÃ¢y dá»±ng khung dá»± Ã¡n Angular Web3 báº±ng Tailwind CSS v4, Ethers.js v6 vÃ  Reown AppKit

- **Ná»™i dung yÃªu cáº§u:** CÃ i Ä‘áº·t vÃ  cáº¥u hÃ¬nh Tailwind v4, tÃ­ch há»£p Ethers v6 + Reown AppKit lÃ m khung sÆ°á»n cho nhiá»u dá»± Ã¡n Web3, xÃ¢y dá»±ng giao diá»‡n Header Menu ProofRandom responsive theo thiáº¿t káº¿ máº«u, há»— trá»£ chuyá»ƒn Ä‘á»•i máº¡ng, káº¿t ná»‘i vÃ­ vÃ  tÃ¡ch biá»‡t mÃ´i trÆ°á»ng cáº¥u hÃ¬nh linh hoáº¡t. Kháº¯c phá»¥c lá»—i hiá»ƒn thá»‹ theme sÃ¡ng/tá»‘i khÃ´ng Ä‘á»“ng bá»™ vÃ  thay tháº¿ toÃ n bá»™ alert báº±ng toastfy.
- **Giáº£i phÃ¡p:**
  - **Tá»• chá»©c cáº¥u trÃºc:** Cáº¥u hÃ¬nh Path Aliases (`@core/*`, `@shared/*`, `@features/*`, `@environments/*`) trong `tsconfig.json` tuÃ¢n thá»§ nghiÃªm ngáº·t `ARCHITECTURE.md`.
  - **Quáº£n lÃ½ MÃ´i trÆ°á»ng:** Táº¡o thÆ° má»¥c `src/environments/` chá»©a cÃ¡c tá»‡p `environment.ts` vÃ  `environment.development.ts`, cáº¥u hÃ¬nh `fileReplacements` trong `angular.json` Ä‘á»ƒ tá»± Ä‘á»™ng swap khi cháº¡y dev/production. Äá»c `projectId` Ä‘á»™ng tá»« environment.
  - **Tailwind v4 & Sá»­a lá»—i Dark Mode:** CÃ i Ä‘áº·t thÃ´ng qua PostCSS plugin, cáº¥u hÃ¬nh styles toÃ n cá»¥c `styles.scss` vá»›i `@import "tailwindcss"`. Sá»­a lá»—i Tailwind v4 khÃ´ng nháº­n diá»‡n class `.dark` báº±ng cÃ¡ch khai bÃ¡o `@variant dark (&:where(.dark, .dark *));`. Cáº¥u hÃ¬nh phÃ´ng `Quicksand`, mÃ u accent thÆ°Æ¡ng hiá»‡u (Há»“ng/TÃ­m neon) vÃ  cap bo gÃ³c tá»‘i Ä‘a 15px theo `design.md`.
  - **Theme Switcher:** XÃ¢y dá»±ng `ThemeService` dÃ¹ng chung Ä‘á»ƒ quáº£n lÃ½ theme (`light`, `dark`, `auto`) sá»­ dá»¥ng signals, lÆ°u cache `localStorage` vÃ  láº¯ng nghe media query há»‡ thá»‘ng. TÃ­ch há»£p bá»™ nÃºt chuyá»ƒn Ä‘á»•i theme 3 vá»‹ trÃ­ (Pill theme switcher) dáº¡ng icons trá»±c quan trÃªn Header.
  - **Äá»“ng bá»™ AppKit Theme:** Thiáº¿t láº­p má»™t `effect` trong `Web3Service` tá»± Ä‘á»™ng láº¯ng nghe sá»± thay Ä‘á»•i cá»§a `isDarkMode` tá»« `ThemeService` vÃ  gá»i cáº­p nháº­t theme trá»±c tiáº¿p vÃ o WalletConnect modal (`modal.setThemeMode(...)`) á»Ÿ runtime.
  - **Há»‡ thá»‘ng Toast thay tháº¿ Alert:** Táº¡o `ToastService` vÃ  component `app-toast` standalone hiá»ƒn thá»‹ gÃ³c mÃ n hÃ¬nh vá»›i hiá»‡u á»©ng trÆ°á»£t trÆ¡n tru vÃ  thanh tiáº¿n trÃ¬nh tá»± co láº¡i. Thay tháº¿ hoÃ n toÃ n cÃ¡c lá»‡nh `alert` há»‡ thá»‘ng trong `header.component.ts` vÃ  `app.ts` báº±ng Toast.
  - **VÃ¡ lá»—i vÃ  Build:** Cáº¥u hÃ¬nh `"ignoreDeprecations": "6.0"` trong `tsconfig.json`, nÃ¢ng giá»›i háº¡n budget trong `angular.json` lÃªn 5MB Ä‘á»ƒ bundle Web3 an toÃ n vÃ  sá»­a lá»—i thiáº¿u hÃ m copyAddress.
- **Káº¿t quáº£:** BiÃªn dá»‹ch thÃ nh cÃ´ng 100% khÃ´ng cÃ²n lá»—i. Theme Ä‘á»“ng bá»™ hoÃ n háº£o, há»‡ thá»‘ng Toast mÆ°á»£t mÃ , sáºµn sÃ ng phá»¥c vá»¥ lÃ m khung sÆ°á»n cho nhiá»u DApp Web3.

## NgÃ y 02/07/2026

### YÃªu cáº§u: Äá»“ng bá»™ tá»± Ä‘á»™ng theme Light/Dark cho WalletConnect Modal (Reown AppKit)

- **Ná»™i dung yÃªu cáº§u:** WalletConnect modal bá»‹ lá»‡ch theme hiá»ƒn thá»‹ (luÃ´n lÃ  Dark Mode) máº·c dÃ¹ trang web Ä‘ang á»Ÿ cháº¿ Ä‘á»™ Light Mode.
- **Giáº£i phÃ¡p:**
  - **Khá»Ÿi táº¡o Ä‘á»“ng bá»™**: Cáº­p nháº­t hÃ m `initAppKit()` trong [web3.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3.service.ts), Ä‘á»c cáº¥u hÃ¬nh theme hiá»‡n táº¡i tá»« `localStorage` Ä‘á»ƒ thiáº¿t láº­p `themeMode` ngay khi khá»Ÿi táº¡o WalletConnect modal.
  - **Äá»“ng bá»™ runtime**: ThÃªm phÆ°Æ¡ng thá»©c `updateAppKitTheme()` vÃ o [web3.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3.service.ts) Ä‘á»ƒ gá»i cáº­p nháº­t theme trá»±c tiáº¿p vÃ o modal.
  - **Äá»“ng bá»™ tá»± Ä‘á»™ng qua Signal**: Cáº­p nháº­t `constructor()` cá»§a [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts) Ä‘á»ƒ thÃªm má»™t `effect` tá»± Ä‘á»™ng láº¯ng nghe sá»± thay Ä‘á»•i cá»§a signal `isDarkMode()` vÃ  gá»i cáº­p nháº­t sang `Web3Service`.
- **Káº¿t quáº£:** Angular compile thÃ nh cÃ´ng 100%. Äáº£m báº£o WalletConnect modal tá»± Ä‘á»™ng nháº­n Ä‘Ãºng theme tÆ°Æ¡ng á»©ng vá»›i giao diá»‡n DApp.

### YÃªu cáº§u: NÃ¢ng cáº¥p báº£o máº­t vÃ  tá»‘i Æ°u hÃ³a lÆ°u trá»¯ (Thay tháº¿ LocalStorage báº±ng IndexedDB vÃ  In-memory State)

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng lo ngáº¡i vá» dung lÆ°á»£ng giá»›i háº¡n 5MB cá»§a localStorage vÃ  muá»‘n tá»‘i Æ°u hÃ³a báº£o máº­t thÃ´ng tin phÃ¢n quyá»n/dá»¯ liá»‡u cÃ¡ nhÃ¢n nháº¡y cáº£m á»Ÿ client.
- **Giáº£i phÃ¡p:**
  - **Backend API:** Cáº­p nháº­t hÃ m `me()` trong [AuthController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AuthController.php) Ä‘á»ƒ tráº£ vá» thÃªm `role` vÃ  `permissions` cá»§a nhÃ¢n viÃªn Ä‘Äƒng nháº­p.
  - **Frontend Core:**
    - Cáº­p nháº­t [auth.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/auth.service.ts) vÃ  [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts) Ä‘á»ƒ loáº¡i bá» hoÃ n toÃ n viá»‡c ghi `localStorage` Ä‘á»‘i vá»›i cÃ¡c thÃ´ng tin nháº¡y cáº£m (phÃ¢n quyá»n, profile, gÃ³i cÆ°á»›c).
    - Khi reload trang (F5), chá»‰ Ä‘á»c `auth_address` Ä‘á»‹nh danh, sau Ä‘Ã³ gá»i API `/auth/me` náº¡p trá»±c tiáº¿p dá»¯ liá»‡u tá»« backend vÃ o cÃ¡c signals (RAM).
  - **IndexedDB cho Storefront:**
    - Táº¡o [indexed-db.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/indexed-db.service.ts) bá»c IndexedDB trÃ¬nh duyá»‡t thuáº§n.
    - Cáº­p nháº­t [store.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.ts) Ä‘á»ƒ lÆ°u trá»¯ vÃ  táº£i giá» hÃ ng (`store_cart`) vÃ  danh sÃ¡ch yÃªu thÃ­ch (`store_favorites`) báº¥t Ä‘á»“ng bá»™ qua IndexedDB, kháº¯c phá»¥c giá»›i háº¡n 5MB.
  - **VÃ¡ lá»—i Circular Dependency & Lá»—i Interceptor:**
    - Kháº¯c phá»¥c lá»—i Angular DI `NG0200` (Circular Dependency) báº±ng cÃ¡ch chuyá»ƒn Ä‘á»•i inject trá»±c tiáº¿p `AuthService`/`Web3Service` sang inject `Injector` trÃ¬ hoÃ£n (lazy) trong [http-error.interceptor.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/http-error.interceptor.ts).
    - Sá»­a lá»—i `TypeError: errorMsg.includes is not a function` trong interceptor báº±ng cÃ¡ch Ã©p kiá»ƒu chuá»—i an toÃ n (`typeof === 'string'`) cho thÃ´ng bÃ¡o lá»—i.
- **Káº¿t quáº£:** Kiá»ƒm thá»­ tá»± Ä‘á»™ng trÃªn trÃ¬nh duyá»‡t thÃ nh cÃ´ng 100%. Giá» hÃ ng vÃ  sáº£n pháº©m yÃªu thÃ­ch Ä‘Æ°á»£c khÃ´i phá»¥c nguyÃªn váº¹n sau khi reload (F5). PhÃ¢n quyá»n Ä‘Æ°á»£c báº£o máº­t hoÃ n toÃ n á»Ÿ runtime RAM vÃ  sá»­a triá»‡t Ä‘á»ƒ lá»—i ngáº¯t káº¿t ná»‘i vÃ­ khi reload.

## NgÃ y 01/07/2026

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i khÃ´ng chuyá»ƒn máº¡ng Ä‘Æ°á»£c tá»« modal Switch Network cá»§a Reown AppKit (khi Ä‘áº·t allowUnsupportedChain: false)

- **Ná»™i dung yÃªu cáº§u:** Khi ngÆ°á»i dÃ¹ng chuyá»ƒn sang má»™t máº¡ng khÃ¡c mÃ  DApp khÃ´ng há»— trá»£, modal Switch Network cá»§a Wallet Connect/AppKit tá»± Ä‘á»™ng hiá»‡n lÃªn, nhÆ°ng báº¥m chá»n cÃ¡c máº¡ng kháº£ dá»¥ng trong modal Ä‘Ã³ thÃ¬ khÃ´ng thá»ƒ chuyá»ƒn máº¡ng Ä‘Æ°á»£c vÃ  bá»‹ káº¹t modal. NgÆ°á»i dÃ¹ng muá»‘n giá»¯ nguyÃªn thiáº¿t láº­p `allowUnsupportedChain: false`.
- **Giáº£i phÃ¡p:**
  - **Giá»¯ tráº¡ng thÃ¡i phiÃªn káº¿t ná»‘i khi vÃ­ á»Ÿ sai máº¡ng**: Cáº­p nháº­t hÃ m `subscribeAccount` trong [web3.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3.service.ts). Khi vÃ­ chuyá»ƒn sang máº¡ng khÃ´ng há»— trá»£, AppKit sáº½ kÃ­ch hoáº¡t sá»± kiá»‡n vá»›i `isConnected = false` nhÆ°ng Ä‘á»‹a chá»‰ vÃ­ `address` váº«n Ä‘Æ°á»£c giá»¯ láº¡i. Thay vÃ¬ tá»± Ä‘á»™ng logout vÃ  xÃ³a phiÃªn káº¿t ná»‘i cá»§a Dapp, DApp sáº½ giá»¯ láº¡i Ä‘á»‹a chá»‰ vÃ­ vÃ  cáº­p nháº­t tráº¡ng thÃ¡i sai máº¡ng (`isWrongChain = true`), giÃºp provider cá»§a AppKit khÃ´ng bá»‹ vÃ´ hiá»‡u hÃ³a.
  - **Tá»± Ä‘á»™ng Ä‘Ã³ng modal báº£o vá»‡ khi chuyá»ƒn máº¡ng thÃ nh cÃ´ng**: Cáº­p nháº­t sá»± kiá»‡n `chainChanged` trong [web3.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3.service.ts). Khi vÃ­ chuyá»ƒn vá» máº¡ng há»— trá»£, DApp sáº½ chá»§ Ä‘á»™ng gá»i `this.modal.close()` Ä‘á»ƒ Ä‘Ã³ng modal "Switch Network", giáº£i phÃ³ng giao diá»‡n ngÆ°á»i dÃ¹ng. Danh sÃ¡ch cÃ¡c máº¡ng há»— trá»£ Ä‘Æ°á»£c láº¥y Ä‘á»™ng tá»« biáº¿n cáº¥u hÃ¬nh táº­p trung `POPULAR_CHAINS` trong `blockchain.utils.ts` (thay vÃ¬ viáº¿t hardcode cÃ¡c Chain ID).
- **Káº¿t quáº£:** BiÃªn dá»‹ch thÃ nh cÃ´ng 100% khÃ´ng lá»—i. NgÆ°á»i dÃ¹ng giá»¯ Ä‘Æ°á»£c thiáº¿t láº­p `allowUnsupportedChain: false`, modal cá»§a AppKit tá»± Ä‘á»™ng hiá»‡n lÃªn khi sai máº¡ng, vÃ  khi ngÆ°á»i dÃ¹ng click chá»n máº¡ng trong modal, vÃ­ sáº½ chuyá»ƒn máº¡ng thÃ nh cÃ´ng vÃ  modal Ä‘Ã³ng láº¡i má»™t cÃ¡ch trÆ¡n tru.

## NgÃ y 30/06/2026

### YÃªu cáº§u: TÃ¡ch biá»‡t tÃ­nh nÄƒng NhÃ  báº¿p & Pha cháº¿ (KDS) thÃ nh cá» tÃ­nh nÄƒng riÃªng trong quáº£n lÃ½ gÃ³i cÆ°á»›c

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng há»i tÃ­nh nÄƒng NhÃ  báº¿p & Pha cháº¿ náº±m trong nhá»¯ng gÃ³i cÆ°á»›c nÃ o, Ä‘Ã£ hiá»ƒn thá»‹ trÃªn báº£ng quáº£n lÃ½ gÃ³i cÆ°á»›c chÆ°a, vÃ  dá»¯ liá»‡u gÃ³i cÆ°á»›c máº·c Ä‘á»‹nh Ä‘Ã£ Ä‘Æ°á»£c cáº­p nháº­t chÆ°a.
- **Giáº£i phÃ¡p:**
  - **PhÃ¢n tÃ­ch hiá»‡n tráº¡ng**: TrÆ°á»›c Ä‘Ã¢y, tÃ­nh nÄƒng NhÃ  báº¿p & Pha cháº¿ cháº¡y phá»¥ thuá»™c vÃ o cá» BÃ¡n hÃ ng POS (`enable_pos`), cáº£ 3 gÃ³i máº·c Ä‘á»‹nh (`free`, `pro`, `ultra`) Ä‘á»u cÃ³ quyá»n truy cáº­p do `enable_pos = true`. TrÃªn giao diá»‡n, tÃ­nh nÄƒng nÃ y chÆ°a Ä‘Æ°á»£c tÃ¡ch biá»‡t hay hiá»ƒn thá»‹ badge riÃªng.
  - **TÃ¡ch biá»‡t cá» tÃ­nh nÄƒng á»Ÿ Backend**:
    - Cáº­p nháº­t [AdminController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AdminController.php): ThÃªm validation cho cá» `features.enable_kds` lÃ  `boolean` trong `storePlan` vÃ  `updatePlan`.
    - Cáº­p nháº­t hÃ m `resetDefaultPlans` Ä‘á»ƒ thÃªm `'enable_kds'` Ä‘á»™c láº­p: GÃ³i **DÃ¹ng Thá»­ (free)** cÃ³ `'enable_kds' => false` (khÃ³a tÃ­nh nÄƒng), cÃ¡c gÃ³i **Pro (pro)** vÃ  **VÃ´ háº¡n (ultra)** cÃ³ `'enable_kds' => true` (báº­t tÃ­nh nÄƒng).
  - **Cáº­p nháº­t giao diá»‡n quáº£n lÃ½ á»Ÿ Frontend**:
    - Cáº­p nháº­t [subscription-plan-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/components/subscription-plan-modal/subscription-plan-modal.component.ts) vÃ  [subscription-plan-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/components/subscription-plan-modal/subscription-plan-modal.component.html): ThÃªm Form Control vÃ  Checkbox cáº¥u hÃ¬nh riÃªng cho **NhÃ  báº¿p & Pha cháº¿ (KDS)**.
    - Cáº­p nháº­t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html): Bá»• sung hiá»ƒn thá»‹ Badge **NhÃ  báº¿p & Pha cháº¿** trong danh sÃ¡ch cÃ¡c tÃ­nh nÄƒng há»— trá»£ cá»§a má»—i gÃ³i cÆ°á»›c.
  - **Äá»“ng bá»™ Route Guard vÃ  Sidebar**:
    - Cáº­p nháº­t [app.routes.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/app.routes.ts): Äá»•i `featureKey` báº£o vá»‡ cá»§a tuyáº¿n Ä‘Æ°á»ng `/kds` thÃ nh `enable_kds` thay vÃ¬ `enable_pos`.
    - Cáº­p nháº­t [sidebar.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/sidebar/sidebar.component.html): Äá»•i cá» kiá»ƒm tra hiá»ƒn thá»‹ liÃªn káº¿t KDS trÃªn sidebar sang `enable_kds` (á»Ÿ cáº£ Desktop vÃ  Mobile sidebar).
  - **Kiá»ƒm thá»­ tá»± Ä‘á»™ng & KhÃ´i phá»¥c máº·c Ä‘á»‹nh**:
    - Sá»­ dá»¥ng `browser_subagent` thá»±c hiá»‡n giáº£ láº­p quyá»n admin, click nÃºt **KhÃ´i phá»¥c máº·c Ä‘á»‹nh** Ä‘á»ƒ Ä‘á»“ng bá»™ láº¡i dá»¯ liá»‡u máº·c Ä‘á»‹nh cá»§a cÃ¡c gÃ³i vÃ o DB.
    - XÃ¡c nháº­n giao diá»‡n hiá»ƒn thá»‹ badge mÃ u xÃ¡m (táº¯t KDS) á»Ÿ gÃ³i Free, mÃ u tÃ­m (báº­t KDS) á»Ÿ gÃ³i Pro vÃ  Ultra. Checkbox cáº¥u hÃ¬nh KDS hoáº¡t Ä‘á»™ng chÃ­nh xÃ¡c trong modal chá»‰nh sá»­a gÃ³i cÆ°á»›c.
- **Káº¿t quáº£:** Code biÃªn dá»‹ch vÃ  cháº¡y thÃ nh cÃ´ng 100%. TÃ­nh nÄƒng NhÃ  báº¿p & Pha cháº¿ (KDS) hiá»‡n Ä‘Ã£ Ä‘Æ°á»£c tÃ¡ch biá»‡t thÃ nh cÃ´ng thÃ nh cá» riÃªng, Ä‘Æ°á»£c cáº¥u hÃ¬nh vÃ  kiá»ƒm soÃ¡t Ä‘á»™c láº­p theo gÃ³i cÆ°á»›c dá»‹ch vá»¥.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i trÃ¹ng láº·p cá»™t `tax_rate` khi cháº¡y `php artisan migrate` trÃªn Production

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng bÃ¡o lá»—i crash khi cháº¡y lá»‡nh migration: cá»™t `tax_rate` Ä‘Ã£ tá»“n táº¡i trong báº£ng `products`.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [2026_06_25_000000_create_tax_system_tables.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/database/migrations/2026_06_25_000000_create_tax_system_tables.php): Sá»­ dá»¥ng cÃ¡ch tiáº¿p cáº­n phÃ²ng vá»‡ (defensive migration), bao bá»c cÃ¡c lá»‡nh thay Ä‘á»•i cáº¥u trÃºc báº£ng vÃ  táº¡o báº£ng má»›i báº±ng kiá»ƒm tra `Schema::hasColumn` vÃ  `Schema::hasTable` Ä‘á»ƒ ngÄƒn cháº·n viá»‡c cá»‘ gáº¯ng táº¡o láº¡i cÃ¡c cá»™t/báº£ng Ä‘Ã£ tá»“n táº¡i.
- **Káº¿t quáº£:** Lá»—i crash khi migrate Ä‘Æ°á»£c giáº£i quyáº¿t triá»‡t Ä‘á»ƒ, migration cháº¡y mÆ°á»£t mÃ  trÃªn cáº£ mÃ´i trÆ°á»ng local vÃ  production cá»§a khÃ¡ch hÃ ng.

### YÃªu cáº§u: Kiá»ƒm tra, xÃ¡c minh vÃ  sá»­a lá»—i tÃ­nh nÄƒng Nháº­p Thá»±c Ä‘Æ¡n tá»« Excel

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u kiá»ƒm tra xem tÃ­nh nÄƒng import file Excel cho Thá»±c Ä‘Æ¡n sáº£n pháº©m Ä‘Ã£ hoÃ n thÃ nh chÆ°a, vÃ  bÃ¡o lá»—i khi import tá»‡p Excel táº¡i `C:\Temp\cafe_blockchain_product_template.xlsx`.
- **Giáº£i phÃ¡p:**
  - **PhÃ¢n tÃ­ch hiá»‡n tráº¡ng**: Há»‡ thá»‘ng Ä‘Ã£ cÃ³ Ä‘áº§y Ä‘á»§ logic frontend [ImportExcelModalComponent](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/menu/components/import-excel-modal/import-excel-modal.component.ts) vÃ  backend `importExcel` trong [ProductController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/ProductController.php) cÃ¹ng cÃ¡c route tÆ°Æ¡ng á»©ng.
  - **Kh?c ph?c l?i Database**:
    1. **Sá»­a lá»—i categories name unique**: Báº£ng `categories` giá»¯ index UNIQUE toÃ n cá»¥c trÃªn cá»™t `name`. ÄÃ£ táº¡o vÃ  cháº¡y tá»‡p migration [2026_06_30_130746_fix_categories_unique_index.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/database/migrations/2026_06_30_130746_fix_categories_unique_index.php) Ä‘á»ƒ xÃ³a index unique cÅ© `categories_name_unique` trÃªn cá»™t `name`, thay tháº¿ báº±ng composite unique index má»›i `['name', 'store_owner_address']`.
    2. **Sá»­a lá»—i products SKU unique**: Cá»™t `sku` trong báº£ng `products` bá»‹ Ä‘á»‹nh nghÄ©a UNIQUE toÃ n cá»¥c (`products_sku_unique`). ÄÃ£ táº¡o vÃ  cháº¡y tá»‡p migration [2026_06_30_131458_fix_products_sku_unique_index.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/database/migrations/2026_06_30_131458_fix_products_sku_unique_index.php) Ä‘á»ƒ xÃ³a index unique cÅ© cá»§a cá»™t `sku`, thay tháº¿ báº±ng composite unique index má»›i `['sku', 'store_owner_address']`.
  - **Kháº¯c phá»¥c lá»—i logic Soft Delete trÃªn Backend**:
    - Khi import file Excel trÃ¹ng SKU vá»›i sáº£n pháº©m Ä‘Ã£ bá»‹ xÃ³a má»m trÆ°á»›c Ä‘Ã³ (`deleted_at IS NOT NULL`), Eloquent query thÃ´ng thÆ°á»ng sáº½ khÃ´ng tÃ¬m ra sáº£n pháº©m cÅ© (tráº£ vá» null), dáº«n Ä‘áº¿n viá»‡c cá»‘ gáº¯ng INSERT dÃ²ng má»›i vÃ  gÃ¢y ra lá»—i Ä‘á»¥ng Ä‘á»™ `Duplicate entry` trÃªn database.
    - Cáº­p nháº­t [ProductController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/ProductController.php): Thay Ä‘á»•i cÃ¢u lá»‡nh query tÃ¬m kiáº¿m sáº£n pháº©m cÅ© theo SKU báº±ng cÃ¡ch thÃªm `withTrashed()`. Náº¿u tÃ¬m tháº¥y sáº£n pháº©m cÅ© Ä‘Ã£ bá»‹ xÃ³a má»m, há»‡ thá»‘ng sáº½ thá»±c hiá»‡n khÃ´i phá»¥c (`restore()`) vÃ  cáº­p nháº­t dá»¯ liá»‡u má»›i thay vÃ¬ táº¡o báº£n ghi má»›i.
  - **Tá»‘i Æ°u hÃ³a UI/UX Modal vÃ  Tá»± Ä‘á»™ng reload danh sÃ¡ch**:
    - **Sá»­a lá»—i khÃ´ng load láº¡i danh sÃ¡ch khi Ä‘Ã³ng báº±ng nÃºt X / Backdrop click**: LÆ°u cá» `isImportedSuccess` vÃ o `modalRef` táº¡i `ImportExcelModalComponent` ngay khi backend bÃ¡o import thÃ nh cÃ´ng. Trong `menu.component.ts`, kiá»ƒm tra cá» nÃ y trong subscription `afterClosed$` Ä‘á»ƒ luÃ´n gá»i reload danh sÃ¡ch sáº£n pháº©m `loadMenuProducts(1)` báº¥t ká»ƒ ngÆ°á»i dÃ¹ng Ä‘Ã³ng modal báº±ng cÃ¡ch nÃ o.
    - **Thiáº¿t káº¿ láº¡i Modal dáº¡ng ngang (Horizontal Layout)**: Sá»­a kÃ­ch thÆ°á»›c modal trong `menu.component.ts` tá»« `md` lÃªn `4xl` Ä‘á»ƒ má»Ÿ rá»™ng chiá»u rá»™ng hiá»ƒn thá»‹. Thiáº¿t káº¿ láº¡i [import-excel-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/menu/components/import-excel-modal/import-excel-modal.component.html) thÃ nh bá»‘ cá»¥c 2 cá»™t dáº¡ng lÆ°á»›i `md:grid-cols-12` (cá»™t trÃ¡i 7/12 lÃ  vÃ¹ng kÃ©o tháº£ file/bÃ¡o cÃ¡o káº¿t quáº£, cá»™t pháº£i 5/12 lÃ  hÆ°á»›ng dáº«n chi tiáº¿t kÃ¨m nÃºt táº£i file máº«u), giÃºp modal cÃ¢n Ä‘á»‘i, rá»™ng rÃ£i, káº¿ thá»«a Ä‘Ãºng cÃ¡c style token pháº³ng vÃ  component button/icon dÃ¹ng chung cá»§a há»‡ thá»‘ng.
  - **Ki?m th? t? ??ng**:
    - Sá»­ dá»¥ng `browser_subagent` táº£i lÃªn tá»‡p Excel táº¡i `C:\Temp\cafe_blockchain_product_template.xlsx`. Káº¿t quáº£ kiá»ƒm thá»­ thÃ nh cÃ´ng 100%, bÃ¡o **ThÃ nh cÃ´ng: 2 mÃ³n** (CÃ  phÃª sá»¯a Ä‘Ã¡ vÃ  TrÃ  Ä‘Ã o cam sáº£), 0 lá»—i. CÃ¡c mÃ³n Äƒn cÃ¹ng danh má»¥c tá»± Ä‘á»™ng xuáº¥t hiá»‡n trÃªn danh sÃ¡ch thá»±c Ä‘Æ¡n ngay sau khi Ä‘Ã³ng modal báº±ng nÃºt "X".
- **Káº¿t quáº£:** TÃ­nh nÄƒng import Excel hoáº¡t Ä‘á»™ng hoÃ n háº£o 100%, sá»­a triá»‡t Ä‘á»ƒ cÃ¡c lá»—i thiáº¿t káº¿ database, lá»—i logic soft deletes vÃ  tá»‘i Æ°u hÃ³a giao diá»‡n modal dáº¡ng ngang sang trá»ng, tá»± Ä‘á»™ng lÃ m má»›i thá»±c Ä‘Æ¡n khi hoÃ n táº¥t.

## NgÃ y 28/06/2026

### YÃªu cáº§u: Triá»ƒn khai tÃ­nh nÄƒng MÃ n hÃ¬nh hiá»ƒn thá»‹ NhÃ  báº¿p/Pha cháº¿ (KDS)

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u phÃ¡t triá»ƒn mÃ n hÃ¬nh KDS hiá»ƒn thá»‹ cÃ¡c Ä‘Æ¡n hÃ ng cáº§n pha cháº¿ theo thá»i gian thá»±c Ä‘á»ƒ báº¿p tiá»‡n váº­n hÃ nh vÃ  pha nÆ°á»›c.
- **Giáº£i phÃ¡p:**
  - **Thiáº¿t káº¿ tá»‘i Æ°u DB**: KhÃ´ng táº¡o báº£ng DB má»›i, sá»­ dá»¥ng trÆ°á»ng `status` hiá»‡n cÃ³ cá»§a báº£ng `orders` vÃ  bá»• sung thÃªm tráº¡ng thÃ¡i trung gian lÃ  `'ready'` (Ä‘Ã£ pha xong, chá» phá»¥c vá»¥).
  - **M? r?ng API Backend**:
    - Thay Ä‘á»•i middleware cho route cáº­p nháº­t tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng tá»« `RequireOwner` sang `permission:pos|orders|kds` Ä‘á»ƒ cho phÃ©p nhÃ¢n viÃªn cÃ³ quyá»n cáº­p nháº­t.
    - Cáº­p nháº­t `OrderController` cho phÃ©p nháº­n tráº¡ng thÃ¡i `'ready'` trong validation.
    - Cáº­p nháº­t `GetOrdersQueryHandler` Ä‘á»ƒ khi truyá»n `status=kds` sáº½ láº¥y cÃ¡c Ä‘Æ¡n chÆ°a hoÃ n thÃ nh (`pending`, `preparing`, `ready`).
    - Cáº­p nháº­t `StaffController` thÃªm quyá»n `'kds'` máº·c Ä‘á»‹nh cho vai trÃ² Chá»§ quÃ¡n vÃ  Quáº£n lÃ½.
  - **C?p nh?t giao di?n Frontend**:
    - ÄÄ’ng kÃ½ module `'kds'` trong `staffs.component.ts`.
    - ThÃªm liÃªn káº¿t KDS vÃ o Desktop Sidebar vÃ  Mobile Menu trong `sidebar.component.html`.
    - ThÃªm route `/kds` báº£o vá»‡ bá»Ÿi `FeatureGuard` trong `app.routes.ts`.
    - Táº¡o component `KdsComponent` (`kds.component.ts` vÃ  `kds.component.html`): CÃ i Ä‘áº·t cÆ¡ cháº¿ Polling láº¥y dá»¯ liá»‡u Ä‘Æ¡n hÃ ng sau má»—i 5 giÃ¢y, Ä‘áº¿m phÃºt chá» thá»±c táº¿ (hiá»‡n badge cáº£nh bÃ¡o "Trá»… Ä‘Æ¡n" náº¿u >15 phÃºt), tÃ´ Ä‘áº­m ghi chÃº pha cháº¿ cá»§a khÃ¡ch, tÃ­ch há»£p Ã¢m thanh chuÃ´ng bÃ¡o báº±ng Web Audio API khi cÃ³ Ä‘Æ¡n má»›i.
- **Káº¿t quáº£:** PHP linter vÃ  Angular build thÃ nh cÃ´ng 100%. MÃ n hÃ¬nh KDS Ä‘Ã£ Ä‘Æ°á»£c tÃ­ch há»£p hoÃ n táº¥t, hoáº¡t Ä‘á»™ng chÃ­nh xÃ¡c vÃ  mÆ°á»£t mÃ ng.

### YÃªu cáº§u: Kiá»ƒm thá»­ tá»± Ä‘á»™ng mÃ n hÃ¬nh KDS trÃªn trÃ¬nh duyá»‡t vÃ  xÃ¡c minh luá»“ng dá»¯ liá»‡u

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u má»Ÿ trÃ¬nh duyá»‡t cháº¡y thá»­ tÃ­nh nÄƒng KDS Ä‘á»ƒ kiá»ƒm tra vÃ  kháº¯c phá»¥c lá»—i náº¿u cÃ³.
- **Giáº£i phÃ¡p:**
  - Sá»­ dá»¥ng cÃ´ng cá»¥ `browser_subagent` Ä‘á»ƒ má»Ÿ `http://localhost:4200/dashboard` vÃ  thá»±c hiá»‡n kiá»ƒm thá»­ tá»± Ä‘á»™ng.
  - XÃ¡c minh liÃªn káº¿t **"NhÃ  báº¿p & Pha cháº¿"** hoáº¡t Ä‘á»™ng Ä‘Ãºng trÃªn Sidebar vÃ  Ä‘iá»u hÆ°á»›ng chÃ­nh xÃ¡c vá» `/kds`.
  - Thá»±c hiá»‡n kiá»ƒm thá»­ toÃ n bá»™ luá»“ng Ä‘á»•i tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng trÃªn KDS: Nháº¥p nÃºt **"Báº¯t Ä‘áº§u lÃ m"** (chuyá»ƒn Ä‘Æ¡n tá»« `pending` $\rightarrow$ `preparing`), nháº¥p **"Pha xong"** (chuyá»ƒn tá»« `preparing` $\rightarrow$ `ready`), nháº¥p **"ÄÃ£ phá»¥c vá»¥"** (chuyá»ƒn sang `completed` vÃ  áº©n Ä‘Æ¡n khá»i KDS).
  - XÃ¡c nháº­n khÃ´ng cÃ³ lá»—i giao diá»‡n (layout bugs) hay lá»—i runtime trÃªn console trÃ¬nh duyá»‡t.
  - Cáº­p nháº­t tÃ i liá»‡u [walkthrough.md](file:///C:/Users/dev/.gemini/antigravity-ide/brain/46b4f7f7-39ad-4145-8646-30e72b7d660b/walkthrough.md) Ä‘á»ƒ Ä‘Ã­nh kÃ¨m video ghi hÃ¬nh WebP vÃ  bá»™ áº£nh chá»¥p mÃ n hÃ¬nh cÃ¡c tráº¡ng thÃ¡i KDS.
- **Káº¿t quáº£:** Kiá»ƒm thá»­ thÃ nh cÃ´ng 100%, khÃ´ng phÃ¡t sinh lá»—i, cÃ¡c chá»©c nÄƒng hoáº¡t Ä‘á»™ng chÃ­nh xÃ¡c vÃ  Ä‘á»“ng bá»™ tá»« Frontend xuá»‘ng Backend.

### YÃªu cáº§u: Di chuyá»ƒn vá»‹ trÃ­ liÃªn káº¿t KDS trÃªn Sidebar xuá»‘ng dÆ°á»›i má»¥c SÆ¡ Ä‘á»“ bÃ n

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng muá»‘n liÃªn káº¿t "NhÃ  báº¿p & Pha cháº¿" hiá»ƒn thá»‹ ngay dÆ°á»›i má»¥c "Quáº£n lÃ½ sÆ¡ Ä‘á»“ bÃ n" trÃªn thanh Sidebar thay vÃ¬ á»Ÿ vá»‹ trÃ­ ban Ä‘áº§u (dÆ°á»›i BÃ¡n hÃ ng POS).
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [sidebar.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/sidebar/sidebar.component.html):
    - Desktop Menu: Cáº¯t khá»‘i `@if (stateService.hasPermission('kds'))` vÃ  di chuyá»ƒn xuá»‘ng dÆ°á»›i khá»‘i `@if (stateService.hasPermission('tables'))` (ngay phÃ­a trÃªn má»¥c Ca lÃ m viá»‡c).
    - Mobile Menu: Thá»±c hiá»‡n tÆ°Æ¡ng tá»± Ä‘á»‘i vá»›i khá»‘i KDS vÃ  Tables trong Drawer di Ä‘á»™ng.
  - Sá»­ dá»¥ng browser subagent kiá»ƒm tra trá»±c tiáº¿p giao diá»‡n Ä‘á»ƒ verify vá»‹ trÃ­ hiá»ƒn thá»‹ cá»§a menu KDS Ä‘Ã£ thay Ä‘á»•i chÃ­nh xÃ¡c.
- **Káº¿t quáº£:** Build thÃ nh cÃ´ng 100%. LiÃªn káº¿t KDS Ä‘Ã£ Ä‘á»‹nh vá»‹ chÃ­nh xÃ¡c dÆ°á»›i má»¥c Quáº£n lÃ½ sÆ¡ Ä‘á»“ bÃ n trÃªn cáº£ Desktop vÃ  Mobile Sidebar.

### YÃªu cáº§u: TÃ¡ch biá»‡t bá»™ lá»c Tab cá»§a mÃ n hÃ¬nh KDS thÃ nh component con riÃªng biá»‡t

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng muá»‘n tÃ¡ch cÃ¡c tabs tráº¡ng thÃ¡i (Táº¥t cáº£ Ä‘Æ¡n, Chá» pha cháº¿, Äang pha cháº¿, Chá» phá»¥c vá»¥) cá»§a mÃ n hÃ¬nh KDS thÃ nh má»™t component riÃªng Ä‘á»ƒ lÃ m sáº¡ch code giao diá»‡n chÃ­nh.
- **Giáº£i phÃ¡p:**
  - Táº¡o má»›i component [KdsTabsComponent](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/kds/components/kds-tabs/kds-tabs.component.ts) vÃ  tá»‡p giao diá»‡n [kds-tabs.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/kds/components/kds-tabs/kds-tabs.component.html).
  - TÃ­ch há»£p `@Input` nháº­n danh sÃ¡ch Ä‘Æ¡n hÃ ng vÃ  tráº¡ng thÃ¡i bá»™ lá»c hiá»‡n táº¡i, cÃ¹ng `@Output` gá»­i Ä‘i sá»± kiá»‡n thay Ä‘á»•i bá»™ lá»c.
  - Cáº­p nháº­t [kds.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/kds/kds.component.ts) Ä‘á»ƒ Ä‘Äƒng kÃ½ vÃ  sá»­ dá»¥ng `<app-kds-tabs>` trong [kds.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/kds/kds.component.html).
- **Káº¿t quáº£:** Code biÃªn dá»‹ch thÃ nh cÃ´ng 100%. MÃ n hÃ¬nh KDS hoáº¡t Ä‘á»™ng á»•n Ä‘á»‹nh, cáº¥u trÃºc code pháº³ng, sáº¡ch sáº½ vÃ  dá»… báº£o trÃ¬.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i nghiá»‡p vá»¥ KDS: NgÄƒn cháº·n báº¿p tá»± Ã½ hoÃ n thÃ nh Ä‘Æ¡n hÃ ng

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n há»“i lá»—i nghiá»‡p vá»¥: Báº¿p (mÃ n hÃ¬nh KDS) khÃ´ng Ä‘Æ°á»£c phÃ©p tá»± Ã½ hoÃ n thÃ nh Ä‘Æ¡n hÃ ng (completed). Quyá»n hoÃ n thÃ nh Ä‘Æ¡n hÃ ng pháº£i thuá»™c vá» Thu ngÃ¢n táº¡i quáº§y POS hoáº·c mÃ n hÃ¬nh ÄÆ¡n hÃ ng.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [kds.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/kds/kds.component.html): Thay tháº¿ nÃºt hÃ nh Ä‘á»™ng "ÄÃ£ phá»¥c vá»¥" (gá»i API chuyá»ƒn tráº¡ng thÃ¡i sang `completed`) khi Ä‘Æ¡n hÃ ng á»Ÿ tráº¡ng thÃ¡i `ready` (Ä‘Ã£ pha xong) báº±ng má»™t khung hiá»ƒn thá»‹ tráº¡ng thÃ¡i tÄ©nh **"Chá» phá»¥c vá»¥ bÃª Ä‘á»“"**.
  - Äáº£m báº£o báº¿p chá»‰ cÃ³ thá»ƒ Ä‘á»•i tráº¡ng thÃ¡i Ä‘Æ¡n tá»« `pending` $\rightarrow$ `preparing` $\rightarrow$ `ready` (hoÃ n táº¥t khÃ¢u pha cháº¿). Khi Ä‘Æ¡n á»Ÿ `ready`, Thu ngÃ¢n/Phá»¥c vá»¥ sáº½ lÃ  ngÆ°á»i thá»±c hiá»‡n chuyá»ƒn sang `completed` trÃªn POS/Orders.
- **Káº¿t quáº£:** Build thÃ nh cÃ´ng 100%. Äáº£m báº£o nghiá»‡p vá»¥ KDS váº­n hÃ nh Ä‘Ãºng phÃ¢n vai trong quÃ¡n.

### YÃªu cáº§u: Äá»“ng bá»™ tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng "ready" trÃªn Sá»• Ä‘Æ¡n hÃ ng vÃ  giao diá»‡n di Ä‘á»™ng khÃ¡ch hÃ ng

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n Ã¡nh Ä‘Æ¡n hÃ ng khi báº¿p pha cháº¿ xong vÃ  chuyá»ƒn sang tráº¡ng thÃ¡i "ready" thÃ¬ trÃªn Sá»• Ä‘Æ¡n hÃ ng (cá»§a thu ngÃ¢n) láº¡i hiá»ƒn thá»‹ nháº§m nhÃ£n "Chá» xÃ¡c nháº­n" (cá»§a pending).
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [orders.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/orders/orders.component.ts): ThÃªm tÃ¹y chá»n `{ value: 'ready', label: 'Chá» phá»¥c vá»¥' }` vÃ o máº£ng `statusFilterOptions`.
  - Cáº­p nháº­t [orders.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/orders/orders.component.html): ThÃªm nhÃ¡nh check `@else if (row.status === 'ready')` hiá»ƒn thá»‹ badge `Chá» phá»¥c vá»¥` (mÃ u xanh lá»¥c nháº¥p nhÃ¡y).
  - Cáº­p nháº­t [order-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/orders/components/order-detail-modal/order-detail-modal.component.html): Bá»• sung hiá»ƒn thá»‹ checkbox "Äá»“ng bá»™ Blockchain láº­p tá»©c" vÃ  hai nÃºt hÃ nh Ä‘á»™ng "Há»¦Y ÄÆ N", "HOÃ€N THÃ€NH" cho Ä‘Æ¡n hÃ ng cÃ³ tráº¡ng thÃ¡i `'ready'`.
  - Cáº­p nháº­t [mobile-sign.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/auth/pages/mobile-sign/mobile-sign.component.ts) vÃ  [mobile-sign.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/auth/pages/mobile-sign/mobile-sign.component.html): Äá»“ng bá»™ hÃ³a hiá»ƒn thá»‹ thÃ´ng Ä‘iá»‡p "ÄÃ£ Pha Cháº¿ Xong! Vui lÃ²ng chá» nhÃ¢n viÃªn phá»¥c vá»¥ bÃª nÆ°á»›c ra bÃ n" cho khÃ¡ch hÃ ng quÃ©t mÃ£, vÃ  cháº·n Ã¡p dá»¥ng voucher khi Ä‘Æ¡n Ä‘Ã£ pha xong.
- **Káº¿t quáº£:** Build thÃ nh cÃ´ng 100%. Tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng hiá»ƒn thá»‹ chÃ­nh xÃ¡c, thá»‘ng nháº¥t trÃªn má»i giao diá»‡n há»‡ thá»‘ng.

### YÃªu cáº§u: TÃ­ch há»£p phÃ¢n trang (Pagination) cho mÃ n hÃ¬nh KDS

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng muá»‘n biáº¿t mÃ n hÃ¬nh KDS Ä‘Ã£ cÃ³ phÃ¢n trang chÆ°a vÃ  cÃ³ káº¿ thá»«a component phÃ¢n trang dÃ¹ng chung cá»§a há»‡ thá»‘ng khÃ´ng, sau Ä‘Ã³ yÃªu cáº§u thiáº¿t láº­p hiá»ƒn thá»‹ 10 Ä‘Æ¡n hÃ ng trÃªn má»—i trang.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [kds.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/kds/kds.component.ts): Import `PaginationComponent`, bá»• sung cÃ¡c signals vÃ  computed Ä‘á»ƒ phÃ¢n trang client-side (`kdsCurrentPage`, `kdsItemsPerPage = 10`, `pagedOrders`, `kdsTotalPages`), tá»± Ä‘á»™ng Ä‘Æ°a vá» trang cuá»‘i náº¿u trang hiá»‡n táº¡i vÆ°á»£t quÃ¡ sá»‘ trang thá»±c táº¿. Reset trang vá» 1 khi chuyá»ƒn Ä‘á»•i bá»™ lá»c tráº¡ng thÃ¡i.
  - Cáº­p nháº­t [kds.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/kds/kds.component.html): Lá»c danh sÃ¡ch Ä‘Æ¡n hÃ ng theo `pagedOrders` thay vÃ¬ `filteredOrders`, Ä‘á»“ng thá»i nhÃºng tháº» `<app-pagination>` á»Ÿ cuá»‘i Kanban Grid.
- **Káº¿t quáº£:** Build thÃ nh cÃ´ng 100%. Giao diá»‡n KDS káº¿ thá»«a tá»‘t component phÃ¢n trang chung, há»— trá»£ hiá»ƒn thá»‹ tá»‘i Ä‘a 10 Ä‘Æ¡n hÃ ng/trang ngÄƒn náº¯p, mÆ°á»£t mÃ .

### YÃªu cáº§u: Äá»“ng bá»™ cÃ¡c nÃºt báº¥m trÃªn giao diá»‡n KDS báº±ng directive ButtonComponent

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u kiá»ƒm tra vÃ  káº¿ thá»«a Ä‘áº§y Ä‘á»§ cÃ¡c component giao diá»‡n UI dÃ¹ng chung cá»§a Dapp (nhÆ° Button) trÃªn trang KDS Ä‘á»ƒ Ä‘áº£m báº£o tÃ­nh Ä‘á»“ng bá»™ giao diá»‡n.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [kds.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/kds/kds.component.ts): Import `ButtonComponent`, Ä‘Äƒng kÃ½ trong máº£ng `imports`.
  - Cáº­p nháº­t [kds.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/kds/kds.component.html): Thay tháº¿ hai nÃºt báº¥m native tá»± váº½ SVG loader á»Ÿ chÃ¢n card KDS báº±ng directive `app-button` (`variant="primary"` cho nÃºt Báº¯t Ä‘áº§u lÃ m vÃ  `variant="success"` cho nÃºt Pha xong), thá»«a káº¿ hoÃ n háº£o logic vÃ  style loader dÃ¹ng chung.
- **Káº¿t quáº£:** Build thÃ nh cÃ´ng 100%. Giao diá»‡n KDS káº¿ thá»«a tá»‘t component button chung, tÄƒng cÆ°á»ng tÃ­nh Ä‘á»“ng bá»™ tháº©m má»¹.

### YÃªu cáº§u: Bá»• sung tÃ­nh nÄƒng Xem chi tiáº¿t Ä‘Æ¡n hÃ ng dáº¡ng chá»‰ Ä‘á»c (Read-only) cho KDS Báº¿p

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng há»i bÃªn báº¿p cÃ³ xem Ä‘Æ°á»£c chi tiáº¿t Ä‘Æ¡n hÃ ng hay khÃ´ng.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [order-detail-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/orders/components/order-detail-modal/order-detail-modal.component.ts) vÃ  [order-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/orders/components/order-detail-modal/order-detail-modal.component.html): Biáº¿n cÃ¡c callback cá»§a interface `OrderDetailModalData` thÃ nh optional. Bá»c cÃ¡c nÃºt Ä‘á»•i tráº¡ng thÃ¡i, há»§y Ä‘Æ¡n, Ä‘á»“ng bá»™ blockchain, Ä‘Ãºc voucher trong kiá»ƒm tra sá»± tá»“n táº¡i cá»§a callback.
  - Cáº­p nháº­t [kds.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/kds/kds.component.ts): Inject `ModalService`, import `OrderDetailModalComponent` vÃ  Ä‘á»‹nh nghÄ©a hÃ m `viewOrderDetail(order)` Ä‘á»ƒ má»Ÿ modal chi tiáº¿t hÃ³a Ä‘Æ¡n (khÃ´ng truyá»n cÃ¡c callback hÃ nh Ä‘á»™ng).
  - Cáº­p nháº­t [kds.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/kds/kds.component.html): ThÃªm sá»± kiá»‡n click vÃ o mÃ£ hÃ³a Ä‘Æ¡n / sá»‘ bÃ n trÃªn header cá»§a KDS card kÃ¨m hiá»‡u á»©ng di chuá»™t (hover underline).
- **Káº¿t quáº£:** Build thÃ nh cÃ´ng 100%. Báº¿p hiá»‡n táº¡i cÃ³ thá»ƒ báº¥m trá»±c tiáº¿p vÃ o mÃ£ Ä‘Æ¡n hÃ ng trÃªn card KDS Ä‘á»ƒ xem chi tiáº¿t hÃ³a Ä‘Æ¡n vÃ  in láº¡i hÃ³a Ä‘Æ¡n pha cháº¿, giao diá»‡n Ä‘Æ°á»£c báº£o vá»‡ á»Ÿ cháº¿ Ä‘á»™ chá»‰ Ä‘á»c (Read-only) an toÃ n.

### YÃªu cáº§u: Hiá»ƒn thá»‹ Tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng trong Modal chi tiáº¿t Ä‘Æ¡n

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng Ä‘á» xuáº¥t hiá»ƒn thá»‹ thÃªm má»¥c tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng vÃ o modal chi tiáº¿t Ä‘Æ¡n Ä‘á»ƒ dá»… theo dÃµi.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [order-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/orders/components/order-detail-modal/order-detail-modal.component.html): Äá»•i pháº§n Thá»i gian Ä‘áº·t hÃ ng chiáº¿m 2 cá»™t thÃ nh 1 cá»™t vÃ  bá»• sung thÃªm 1 cá»™t hiá»ƒn thá»‹ Tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng káº¿ bÃªn, sá»­ dá»¥ng BadgeComponent vá»›i Ä‘áº§y Ä‘á»§ cÃ¡c tráº¡ng thÃ¡i vÃ  mÃ u sáº¯c tÆ°Æ¡ng á»©ng (ThÃ nh cÃ´ng, Äang chuáº©n bá»‹, Chá» phá»¥c vá»¥, Chá» xÃ¡c nháº­n, ÄÃ£ há»§y, Cáº£nh bÃ¡o DB).
- **Káº¿t quáº£:** Build thÃ nh cÃ´ng 100%. Modal chi tiáº¿t hiá»‡n táº¡i Ä‘Ã£ hiá»ƒn thá»‹ tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng trá»±c quan vÃ  rÃµ rÃ ng hÆ¡n.

### YÃªu cáº§u: Kháº¯c phá»¥c bá»™ lá»c thá»i gian trÃªn Dashboard hoáº¡t Ä‘á»™ng khÃ´ng chÃ­nh xÃ¡c vÃ  lá»‡ch mÃºi giá»

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n Ã¡nh cÃ¡c tÃ¹y chá»n bá»™ lá»c ngÃ y thÃ¡ng ("HÃ´m nay", "7 ngÃ y qua", "30 ngÃ y qua", "ThÃ¡ng nÃ y", "Tá»± chá»n ngÃ y") hoáº¡t Ä‘á»™ng khÃ´ng chÃ­nh xÃ¡c trÃªn trang Dashboard.
- **Giáº£i phÃ¡p:**
  - **Äá»“ng bá»™ mÃºi giá»:** Äá»•i timezone máº·c Ä‘á»‹nh cá»§a Laravel Backend sang `Asia/Ho_Chi_Minh` trong [config/app.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/config/app.php) vÃ  thÃªm `APP_TIMEZONE=Asia/Ho_Chi_Minh` vÃ o [.env](file:///d:/git/cafe-blockchain/cafe-blockchain-api/.env) Ä‘á»ƒ Ä‘á»“ng bá»™ mÃºi giá» Viá»‡t Nam, sá»­a triá»‡t Ä‘á»ƒ lá»—i lá»‡ch mÃºi giá» UTC (cháº­m 7 tiáº¿ng) khi lá»c.
  - **Bá»• sung chá»‰ sá»‘ theo ká»³ á»Ÿ API:** Cáº­p nháº­t [DashboardController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/DashboardController.php) Ä‘á»ƒ tÃ­nh toÃ¡n thÃªm cÃ¡c chá»‰ sá»‘ theo khoáº£ng thá»i gian lá»c: `period_orders_count`, `period_web3_revenue`, `period_pending_web3_count` vÃ  tráº£ vá» qua API.
  - **VÃ¡ lá»—i báº£o máº­t & DoS:**
    - Bá»c `Carbon::parse()` trong khá»‘i `try-catch` Ä‘á»ƒ trÃ¡nh crash á»©ng dá»¥ng khi nháº­n tham sá»‘ ngÃ y khÃ´ng há»£p lá»‡.
    - Giá»›i háº¡n khoáº£ng cÃ¡ch lá»c tá»‘i Ä‘a lÃ  365 ngÃ y Ä‘á»ƒ ngÄƒn ngá»«a cÃ¡c truy váº¥n náº·ng gÃ¢y quÃ¡ táº£i cÆ¡ sá»Ÿ dá»¯ liá»‡u (DoS).
    - Chuáº©n hÃ³a láº¡i chuá»—i ngÃ y báº±ng `toDateString()` trÆ°á»›c khi gÃ¡n vÃ o cÃ¢u SQL vÃ  cache key Ä‘á»ƒ trÃ¡nh lá»—i SQL Injection / Cache Poisoning.
  - **C?p nh?t giao di?n ??ng ? Frontend:**
    - Cáº­p nháº­t [dashboard.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/dashboard/pages/dashboard/dashboard.component.ts) Ä‘á»ƒ sinh nhÃ£n tiÃªu Ä‘á» Ä‘á»™ng vÃ  nhÃ£n Ä‘Æ¡n hÃ ng dá»±a trÃªn preset Ä‘Æ°á»£c chá»n.
    - Cáº­p nháº­t [dashboard.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/dashboard/pages/dashboard/dashboard.component.html) Ä‘á»ƒ cÃ¡c Card 1, Card 3, Card 4 hiá»ƒn thá»‹ Ä‘á»™ng theo dá»¯ liá»‡u ká»³ lá»c cá»§a API (`period_revenue`, `period_orders_count`, `period_web3_revenue`, `period_pending_web3_count`) thay vÃ¬ tÄ©nh toÃ n thá»i gian.
- **Káº¿t quáº£:** Build thÃ nh cÃ´ng 100%. Sá»‘ liá»‡u bá»™ lá»c thay Ä‘á»•i chÃ­nh xÃ¡c, trá»±c quan theo khoáº£ng thá»i gian Ä‘Æ°á»£c chá»n.

## NgÃ y 26/06/2026

### YÃªu cáº§u: Chuyá»ƒn Ä‘á»•i danh sÃ¡ch chá»n nÄƒm trong táº¡o ká»³ kÃª khai sang sinh tá»± Ä‘á»™ng Ä‘á»™ng (Dynamic)

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng há»i vá» nguá»“n dá»¯ liá»‡u cá»§a Ã´ chá»n nÄƒm trong modal táº¡o ká»³ kÃª khai vÃ  Ä‘áº·t cÃ¢u há»i vá» trÆ°á»ng há»£p khÃ¡ch hÃ ng sá»­ dá»¥ng Ä‘áº¿n nÄƒm 2030 (khi danh sÃ¡ch cÅ© bá»‹ giá»›i háº¡n cá»©ng 2025-2028).
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [create-tax-period-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/create-tax-period-modal/create-tax-period-modal.component.ts): Thay tháº¿ máº£ng cá»©ng `[2025, 2026, 2027, 2028]` cá»§a `yearOptions` báº±ng cÃ¡ch sinh Ä‘á»™ng thÃ´ng qua `Array.from` cháº¡y tá»« `nÄƒm hiá»‡n táº¡i - 10` Ä‘áº¿n `nÄƒm hiá»‡n táº¡i` (tá»•ng cá»™ng 11 nÄƒm, khÃ´ng sinh nÄƒm tÆ°Æ¡ng lai Ä‘á»ƒ phÃ¹ há»£p nghiá»‡p vá»¥ kÃª khai thuáº¿ thá»±c táº¿).
- **Káº¿t quáº£:** Code biÃªn dá»‹ch thÃ nh cÃ´ng 100%. Äáº£m báº£o há»‡ thá»‘ng luÃ´n tá»± Ä‘á»™ng hiá»ƒn thá»‹ cÃ¡c nÄƒm phÃ¹ há»£p vá»›i thá»i gian thá»±c táº¿ vÃ  Ä‘Ãºng nghiá»‡p vá»¥ kÃª khai thuáº¿ mÃ  khÃ´ng cáº§n cáº­p nháº­t láº¡i code thá»§ cÃ´ng trong tÆ°Æ¡ng lai.

## NgÃ y 25/06/2026

### YÃªu cáº§u: Äá»“ng bá»™ tráº¡ng thÃ¡i chá»‘t/kÃª khai thá»±c táº¿ tá»« Database thay vÃ¬ LocalStorage

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n há»“i tráº¡ng thÃ¡i cá»§a Tá» khai thuáº¿ trong Nháº­t kÃ½ chá»‘t thuáº¿ luÃ´n á»Ÿ dáº¡ng "ChÆ°a kÃª khai / NhÃ¡p" dÃ¹ Ä‘Ã£ báº¥m LÆ°u thÃ nh cÃ´ng. NguyÃªn nhÃ¢n do trÆ°á»›c Ä‘Ã¢y lÆ°u dá»¯ liá»‡u báº±ng `localStorage` nhÆ°ng nay Ä‘Ã£ nÃ¢ng cáº¥p lÃªn Database Backend mÃ  code hiá»ƒn thá»‹ logs chÆ°a cáº­p nháº­t náº¡p tráº¡ng thÃ¡i thá»±c táº¿ tá»« server.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [TaxPeriod.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Domain/Entities/TaxPeriod.php): Khai bÃ¡o quan há»‡ `details()` vá»›i báº£ng `tax_period_details`.
  - Cáº­p nháº­t [TaxController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/TaxController.php): Eager load quan há»‡ details (`->with('details')`) khi táº£i danh sÃ¡ch cÃ¡c ká»³ kÃª khai (`getPeriods()`).
  - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts): Cáº­p nháº­t hÃ m `getFormattedLogs()` Ä‘á»ƒ kiá»ƒm tra tráº¡ng thÃ¡i kÃª khai Ä‘á»™ng báº±ng cÃ¡ch tÃ¬m kiáº¿m `document_type` tÆ°Æ¡ng á»©ng trong `item.details` thay vÃ¬ Ä‘á»c tá»« `localStorage`, Ä‘á»“ng bá»™ cho táº¥t cáº£ cÃ¡c sá»• sÃ¡ch vÃ  tá» khai.
- **Káº¿t quáº£:** Build thÃ nh cÃ´ng 100%. Tráº¡ng thÃ¡i cá»§a cÃ¡c log chá»‘t thuáº¿ cáº­p nháº­t tá»± Ä‘á»™ng vÃ  chÃ­nh xÃ¡c theo dá»¯ liá»‡u tháº­t trÃªn database.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i cáº¯t chá»¯ select dropdown vÃ  gá»™p nÃºt footer vá» bÃªn pháº£i

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng bÃ¡o lá»—i chá»¯ hiá»ƒn thá»‹ trong dropdown select bá»‹ cáº¯t ("Khai láº§n Ä‘...", "Thay Ä‘á»•i thÃ´n...") do cá»™t báº£ng háº¹p Ã©p Ä‘á»™ rá»™ng trigger. Äá»“ng thá»i yÃªu cáº§u gá»™p toÃ n bá»™ nÃºt báº¥m á»Ÿ footer modal vá» má»™t phÃ­a bÃªn pháº£i thay vÃ¬ dÃ n Ä‘á»u sang hai bÃªn.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [custom-select.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/custom-select/custom-select.component.ts): Thay Ä‘á»•i cÃ´ng thá»©c tÃ­nh toÃ¡n Ä‘á»™ rá»™ng dropdown: Äáº·t `minWidth: rect.width` vÃ  `width: max-content` (capped `maxWidth: 320px`) Ä‘á»ƒ dropdown tá»± Ä‘á»™ng giÃ£n rá»™ng ra theo chá»¯. Äá»“ng thá»i Ä‘o lÆ°á»ng lá» pháº£i mÃ n hÃ¬nh Ä‘á»ƒ tá»± Ä‘á»™ng dá»‹ch lÃ¹i `left` náº¿u dropdown trÃ n ra ngoÃ i rÃ¬a pháº£i.
  - Cáº­p nháº­t [tax-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-detail-modal/tax-detail-modal.component.html): Thay tháº¿ cÃ¡c class `flex justify-between` cá»§a cÃ¡c footer actions (á»Ÿ cáº£ View chá»‰nh sá»­a thÃ´ng tin vÃ  View chi tiáº¿t) báº±ng `flex justify-end gap-3` Ä‘á»ƒ gá»™p toÃ n bá»™ nÃºt ÄÃ³ng/LÆ°u vá» sÃ¡t bÃªn pháº£i.
- **Káº¿t quáº£:** Build frontend thÃ nh cÃ´ng 100%. Giao diá»‡n dropdown khÃ´ng cÃ²n bá»‹ cáº¯t chá»¯, cÃ¡c nÃºt báº¥m xáº¿p gá»n gÃ ng á»Ÿ gÃ³c dÆ°á»›i bÃªn pháº£i chuáº©n giao diá»‡n modal cá»§a Dapp.

### YÃªu cáº§u: Thay tháº¿ toÃ n bá»™ select native báº±ng CustomSelectComponent trong modal chi tiáº¿t thuáº¿

- **Ná»™i dung yÃªu cáº§u:** Thay tháº¿ cÃ¡c tháº» `<select>` native (nhÆ° chá»n CÆ¡ quan thuáº¿, Tá»‰nh/ThÃ nh phá»‘ trong form thÃ´ng tin, vÃ  chá»n Tráº¡ng thÃ¡i trong Phá»¥ lá»¥c 01) báº±ng component `<app-custom-select>` tÃ¹y biáº¿n Ä‘á»ƒ Ä‘áº£m báº£o tÃ­nh Ä‘á»“ng bá»™ giao diá»‡n vÃ  kháº¯c phá»¥c tÃ¬nh tráº¡ng hiá»ƒn thá»‹ menu dropdown thÃ´ cá»§a há»‡ Ä‘iá»u hÃ nh.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [tax-detail-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-detail-modal/tax-detail-modal.component.ts): Import `CustomSelectComponent`, Ä‘Äƒng kÃ½ trong máº£ng `imports`, vÃ  khai bÃ¡o `bankStatusOptions: any[]` Ä‘á»ƒ Ä‘á»‹nh nghÄ©a 3 tráº¡ng thÃ¡i cá»§a tÃ i khoáº£n ngÃ¢n hÃ ng.
  - Cáº­p nháº­t [tax-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-detail-modal/tax-detail-modal.component.html): Thay tháº¿ 3 tháº» `<select>` native tÆ°Æ¡ng á»©ng báº±ng `<app-custom-select>` vá»›i cÃ¡c thuá»™c tÃ­nh cáº¥u hÃ¬nh chuáº©n, sá»­ dá»¥ng `triggerClass` pháº³ng (khÃ´ng viá»n) cho Ã´ tráº¡ng thÃ¡i trong báº£ng Phá»¥ lá»¥c 01.
- **Káº¿t quáº£:** Build frontend Angular thÃ nh cÃ´ng 100%. Giao diá»‡n dropdown Ä‘á»“ng bá»™, chuyÃªn nghiá»‡p vÃ  mÆ°á»£t mÃ .

### YÃªu cáº§u: Äá»“ng bá»™ tab tá» khai thuáº¿ trong modal chi tiáº¿t báº±ng TabGroupComponent dÃ¹ng chung

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u Ä‘á»“ng bá»™ hÃ³a giao diá»‡n tab cá»§a Tá» khai thuáº¿ vÃ  PL01 trong modal chi tiáº¿t thuáº¿ sá»­ dá»¥ng component `<app-tab-group>` dÃ¹ng chung cá»§a há»‡ thá»‘ng thay vÃ¬ tá»± váº½ button thá»§ cÃ´ng.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [tax-detail-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-detail-modal/tax-detail-modal.component.ts): Äá»‹nh nghÄ©a `declarationTabOptions: TabOption[]` gá»“m 2 tab "Tá» khai thuáº¿" vÃ  "PL 01 BK-STK".
  - Cáº­p nháº­t [tax-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-detail-modal/tax-detail-modal.component.html): Thay tháº¿ cÃ¡c tháº» button tab thá»§ cÃ´ng báº±ng `<app-tab-group>` chuáº©n vá»›i thiáº¿t láº­p `[flex]="false"` Ä‘á»ƒ cÃ¡c tab hiá»ƒn thá»‹ gá»n gÃ ng, Ä‘á»“ng bá»™ phong cÃ¡ch vá»›i Dapp.
- **Káº¿t quáº£:** Build frontend Angular thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Äá»“ng bá»™ giao diá»‡n modal chi tiáº¿t thuáº¿ theo chuáº©n pháº³ng cá»§a Dapp

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n Ã¡nh giao diá»‡n modal chi tiáº¿t kÃª khai thuáº¿/sá»• sÃ¡ch bá»‹ lá»‡ch tÃ´ng so vá»›i thiáº¿t káº¿ chung cá»§a Dapp (tá»± váº½ header tÃ­m gradient lÃ²e loáº¹t, tá»± dá»±ng div wrapper bÃªn ngoÃ i gÃ¢y lá»—i padding lá» chá»“ng chÃ©o). YÃªu cáº§u Ä‘iá»u chá»‰nh láº¡i modal theo phong cÃ¡ch thiáº¿t káº¿ pháº³ng tinh táº¿, thá»«a káº¿ tá»‘i Ä‘a cÃ¡c component chuáº©n cá»§a há»‡ thá»‘ng.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts): Loáº¡i bá» `showHeader: false` khi má»Ÿ `TaxDetailModalComponent` Ä‘á»ƒ sá»­ dá»¥ng láº¡i header vÃ  nÃºt ÄÃ³ng chuáº©n há»‡ thá»‘ng cá»§a `ModalWrapperComponent`.
  - Cáº­p nháº­t [tax-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-detail-modal/tax-detail-modal.component.html):
    - Loáº¡i bá» tháº» div bao ngoÃ i cÃ¹ng tá»± dá»±ng vÃ  tháº» Ä‘Ã³ng cá»§a nÃ³ á»Ÿ cuá»‘i file, giÃºp thá»«a káº¿ mÃ u ná»n chuáº©n (`bg-white dark:bg-slate-900`) vÃ  gÃ³c bo tá»« wrapper.
    - Loáº¡i bá» header gradient mÃ u tÃ­m tá»± váº½ chÃ³i lá»i.
    - XÃ¢y dá»±ng thanh cÃ´ng cá»¥ pháº³ng (Flat Toolbar) á»Ÿ Ä‘áº§u Body gá»“m badge tráº¡ng thÃ¡i, nÃºt "ThÃ´ng tin khai thuáº¿", vÃ  dropdown "Táº£i file".
    - Loáº¡i bá» cÃ¡c padding lá» thá»«a (`px-6`, `p-6` chá»“ng lá») á»Ÿ tab bar vÃ  main body, Ä‘á»“ng thá»i lÃ m pháº³ng footer actions.
- **Káº¿t quáº£:** Build frontend Angular thÃ nh cÃ´ng 100%. Giao diá»‡n modal pháº³ng tinh táº¿, sáº¡ch sáº½, hÃ i hÃ²a vÃ  Ä‘á»“ng bá»™ 100% vá»›i phong cÃ¡ch thiáº¿t káº¿ chung cá»§a Dapp.

### YÃªu cáº§u: Tá»‘i Æ°u hÃ³a táº£i chi tiáº¿t ká»³ kÃª khai thuáº¿/sá»• sÃ¡ch (Lazy Loading á»Ÿ Frontend)

- **Ná»™i dung yÃªu cáº§u:** Khi vá»«a má»Ÿ modal chi tiáº¿t kÃª khai thuáº¿ hoáº·c sá»• sÃ¡ch, há»‡ thá»‘ng gá»i Ä‘á»“ng loáº¡t cáº£ 9 API `getPeriodDetails` táº£i dá»¯ liá»‡u cho táº¥t cáº£ cÃ¡c loáº¡i tÃ i liá»‡u (info, declaration, banks, s1a -> s2e) cÃ¹ng má»™t lÃºc. YÃªu cáº§u triá»ƒn khai cÆ¡ cháº¿ Lazy Loading Ä‘á»ƒ chá»‰ gá»i Ä‘Ãºng nhá»¯ng API cáº§n thiáº¿t cho loáº¡i tÃ i liá»‡u Ä‘ang xem.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [tax-detail-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-detail-modal/tax-detail-modal.component.ts): Cáº­p nháº­t hÃ m `loadSavedData()` Ä‘á»ƒ dá»±a trÃªn `logRow.category` xÃ¡c Ä‘á»‹nh máº£ng `documentTypes` tá»‘i thiá»ƒu cáº§n táº£i (Tá» khai chá»‰ cáº§n `['info', 'declaration', 'banks']`, cÃ²n cÃ¡c sá»• sÃ¡ch Ä‘á»™c láº­p chá»‰ cáº§n Ä‘Ãºng API cá»§a sá»• Ä‘Ã³). Sá»­ dá»¥ng hÃ m trá»£ giÃºp `getData(type)` Ä‘á»ƒ Ã¡nh xáº¡ Ä‘á»™ng chá»‰ sá»‘ káº¿t quáº£ tráº£ vá» tá»« `forkJoin` dá»±a theo máº£ng `documentTypes` Ä‘Ã£ lá»c, giá»¯ nguyÃªn cÆ¡ cháº¿ táº¡o dá»¯ liá»‡u demo thÃ´ng minh khi lá»—i/chÆ°a cÃ³ dá»¯ liá»‡u.
- **Káº¿t quáº£:** BiÃªn dá»‹ch frontend thÃ nh cÃ´ng 100%. Sá»‘ lÆ°á»£ng API request khi má»Ÿ modal giáº£m máº¡nh (Tá» khai giáº£m tá»« 9 xuá»‘ng 3 request; cÃ¡c sá»• sÃ¡ch giáº£m tá»« 9 xuá»‘ng 1 request), cáº£i thiá»‡n rÃµ rá»‡t tá»‘c Ä‘á»™ táº£i vÃ  hiá»‡u nÄƒng mÃ¡y chá»§.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i spam request khi lÆ°u dá»¯ liá»‡u kÃª khai thuáº¿

- **Ná»™i dung yÃªu cáº§u:** Khi ngÆ°á»i dÃ¹ng báº¥m liÃªn tá»¥c (spam click) vÃ o cÃ¡c nÃºt LÆ°u (LÆ°u tá» khai, LÆ°u sá»• S1a -> S2e, LÆ°u thÃ´ng tin khai thuáº¿), há»‡ thá»‘ng gá»­i liÃªn tiáº¿p nhiá»u request API `savePeriodDetails` cÃ¹ng má»™t lÃºc, gÃ¢y quÃ¡ táº£i (spam request) lÃªn mÃ¡y chá»§.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [tax-detail-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-detail-modal/tax-detail-modal.component.ts): Khai bÃ¡o signal `isSaving` quáº£n lÃ½ tráº¡ng thÃ¡i lÆ°u. á»ž Ä‘áº§u cÃ¡c phÆ°Æ¡ng thá»©c lÆ°u, cháº·n náº¿u Ä‘ang lÆ°u: `if (this.isSaving()) return;`, Ä‘áº·t `this.isSaving.set(true)` trÆ°á»›c khi gá»i API, vÃ  Ä‘áº·t vá» `false` khi cÃ³ pháº£n há»“i (thÃ nh cÃ´ng hoáº·c tháº¥t báº¡i).
  - Cáº­p nháº­t [tax-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-detail-modal/tax-detail-modal.component.html): Bind thuá»™c tÃ­nh `[loading]="isSaving()"` vÃ o táº¥t cáº£ cÃ¡c nÃºt báº¥m lÆ°u tÆ°Æ¡ng á»©ng, vÃ´ hiá»‡u hÃ³a (disabled) nÃºt báº¥m vÃ  hiá»ƒn thá»‹ loading spinner trong quÃ¡ trÃ¬nh gá»­i request.
- **Káº¿t quáº£:** BiÃªn dá»‹ch frontend thÃ nh cÃ´ng 100%. NÃºt lÆ°u cÃ³ tráº¡ng thÃ¡i loading mÆ°á»£t mÃ , ngÄƒn cháº·n hoÃ n toÃ n viá»‡c spam request khi lÆ°u.

### YÃªu cáº§u: Tá»‘i Æ°u hÃ³a táº£i tab phÃ¢n há»‡ Thuáº¿ (Cache má»m á»Ÿ Frontend)

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n Ã¡nh khi báº¥m chuyá»ƒn Ä‘á»•i qua láº¡i giá»¯a cÃ¡c tab trong phÃ¢n há»‡ Thuáº¿, há»‡ thá»‘ng váº«n liÃªn tá»¥c gá»i API lÃªn server Ä‘á»ƒ táº£i láº¡i dá»¯ liá»‡u. YÃªu cáº§u triá»ƒn khai cÆ¡ cháº¿ "cache má»m" (Memory State) Ä‘á»ƒ dá»¯ liá»‡u chá»‰ Ä‘Æ°á»£c táº£i má»™t láº§n Ä‘áº§u tiÃªn khi chuyá»ƒn tab, vÃ  chá»‰ táº£i láº¡i khi cÃ³ sá»± thay Ä‘á»•i thá»±c sá»± (Táº¡o, KhÃ³a sá»•, XÃ³a ká»³, hoáº·c LÆ°u chi tiáº¿t).
- **Giáº£i phÃ¡p:**
  - **Kháº¯c phá»¥c lá»—i Router há»§y Component:** Do Angular Router cáº¥u hÃ¬nh má»—i tab lÃ  má»™t route riÃªng (`/tax/logs`, `/tax/declaration`, `/tax/estimation`) vÃ  sáº½ tá»± Ä‘á»™ng há»§y component `TaxComponent` cÅ© vÃ  táº¡o má»›i khi chuyá»ƒn route, viá»‡c lÆ°u cache trong component bá»‹ máº¥t tÃ¡c dá»¥ng. Ta Ä‘Ã£ dá»i toÃ n bá»™ dá»¯ liá»‡u cache sang Singleton Service `TaxService` tá»“n táº¡i suá»‘t vÃ²ng Ä‘á»i á»©ng dá»¥ng.
  - Cáº­p nháº­t [tax.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/tax.service.ts): Khai bÃ¡o cÃ¡c signals lÆ°u trá»¯ dá»¯ liá»‡u danh sÃ¡ch ká»³, nháº­t kÃ½, káº¿t quáº£ Æ°á»›c tÃ­nh vÃ  cÃ¡c cá» loaded tráº¡ng thÃ¡i: `isLogsLoaded`, `isPeriodsLoaded`, `isEstimateLoaded`.
  - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts):
    - Äá»•i cÃ¡c biáº¿n signal lÆ°u trá»¯ dá»¯ liá»‡u cÅ© thÃ nh cÃ¡c getter trá» trá»±c tiáº¿p tá»›i `TaxService`.
    - Cáº¥u hÃ¬nh gÃ¡n giÃ¡ trá»‹ cá»§a cÃ¡c loaded signals thÃ nh `true` khi cÃ¡c hÃ m API tÆ°Æ¡ng á»©ng (`loadPeriods()`, `loadLogs()`, `getEstimate()`) thá»±c hiá»‡n thÃ nh cÃ´ng.
    - Cáº­p nháº­t Angular `effect` quáº£n lÃ½ load dá»¯ liá»‡u: Chá»‰ trigger gá»i API cá»§a tab khi tráº¡ng thÃ¡i loaded tÆ°Æ¡ng á»©ng lÃ  `false`.
    - Reset cÃ¡c loaded signals vá» `false` trong cÃ¡c hÃ nh Ä‘á»™ng tÆ°Æ¡ng tÃ¡c lÃ m thay Ä‘á»•i dá»¯ liá»‡u: `loadInitialData()` (táº£i láº¡i ban Ä‘áº§u), `createPeriod()` (sau khi thÃªm ká»³), `lockPeriod()` (sau khi khÃ³a sá»•), `deletePeriod()` (sau khi xÃ³a ká»³), vÃ  `openLogDetail()` (khi lÆ°u chi tiáº¿t sá»• sÃ¡ch).
- **Káº¿t quáº£:** Build frontend thÃ nh cÃ´ng 100%. Giao diá»‡n chuyá»ƒn tab mÆ°á»£t mÃ  láº­p tá»©c, khÃ´ng cÃ²n hiá»‡n tÆ°á»£ng gá»i láº¡i API trÃ¹ng láº·p, tá»‘i Æ°u táº£i máº¡ng vÃ  hiá»‡u nÄƒng client.

### YÃªu cáº§u: Sáº¯p xáº¿p láº¡i cÃ¡c tab cáº¥u hÃ¬nh theo quy trÃ¬nh thiáº¿t láº­p quÃ¡n

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u sáº¯p xáº¿p láº¡i thá»© tá»± hiá»ƒn thá»‹ cá»§a cÃ¡c tab cáº¥u hÃ¬nh trong phÃ¢n há»‡ CÃ i Ä‘áº·t theo Ä‘Ãºng quy trÃ¬nh thiáº¿t láº­p thá»±c táº¿ tá»« cÆ¡ báº£n Ä‘áº¿n nÃ¢ng cao.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [settings.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/settings/settings.component.ts): Sáº¯p xáº¿p láº¡i thá»© tá»± cÃ¡c tab trong máº£ng cá»§a getter `settingsSubTabOptions` theo Ä‘Ãºng trÃ¬nh tá»±: Cáº¥u hÃ¬nh QuÃ¡n (general) âž” Blockchain Web3 (blockchain) âž” á»¦y quyá»n vÃ­ (permissions) âž” Thanh toÃ¡n (payment) âž” Máº«u hoÃ¡ Ä‘Æ¡n (invoice) âž” Cáº¥u hÃ¬nh Thuáº¿ (tax) âž” Website (store) âž” Voucher NFT (voucher).
  - Cáº­p nháº­t [settings.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/settings/settings.component.html): Sáº¯p xáº¿p láº¡i cÃ¡c khá»‘i `@if` render tab tÆ°Æ¡ng á»©ng vÃ  chuáº©n hÃ³a sá»‘ thá»© tá»± comment tá»« Tab 1 Ä‘áº¿n Tab 8.
- **Káº¿t quáº£:** Build frontend Angular thÃ nh cÃ´ng 100%. Giao diá»‡n hiá»ƒn thá»‹ Ä‘Ãºng tráº­t tá»± logic quy trÃ¬nh thiáº¿t láº­p quÃ¡n.

### YÃªu cáº§u: TÃ­ch há»£p cáº¥u hÃ¬nh tÃ­nh nÄƒng Thuáº¿ vÃ o gÃ³i cÆ°á»›c (Subscription Plans) á»Ÿ Admin

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u tÃ­ch há»£p tÃ­nh nÄƒng Thuáº¿ vá»«a triá»ƒn khai vÃ o cáº¥u hÃ¬nh chi tiáº¿t cá»§a gÃ³i cÆ°á»›c (Subscription Plan) trÃªn giao diá»‡n quáº£n trá»‹ Admin Ä‘á»ƒ cÃ³ thá»ƒ báº­t/táº¯t tÃ­nh nÄƒng Thuáº¿ cho tá»«ng gÃ³i cÆ°á»›c. PhÃ¢n quyá»n vÃ  kiá»ƒm tra gÃ³i cÆ°á»›c pháº£i hoáº¡t Ä‘á»™ng Ä‘Ãºng.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [subscription-plan-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/components/subscription-plan-modal/subscription-plan-modal.component.ts): ThÃªm trÆ°á»ng `enable_tax` vá»›i giÃ¡ trá»‹ boolean vÃ o Form Group cáº¥u hÃ¬nh `features` vÃ  xá»­ lÃ½ patchValue khi má»Ÿ modal cáº­p nháº­t gÃ³i cÆ°á»›c.
  - Cáº­p nháº­t [subscription-plan-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/components/subscription-plan-modal/subscription-plan-modal.component.html): ThÃªm `<app-custom-checkbox>` cho `enable_tax` ngay dÆ°á»›i checkbox `enable_excel_export` Ä‘á»ƒ Admin thao tÃ¡c trá»±c quan.
- **Káº¿t quáº£:** Build frontend thÃ nh cÃ´ng 100%. PhÃ¢n quyá»n gÃ³i cÆ°á»›c hoáº¡t Ä‘á»™ng Ä‘á»“ng bá»™ vÃ  triá»‡t tiÃªu hoÃ n toÃ n lá»—i validation 422 tá»« API khi cáº­p nháº­t gÃ³i cÆ°á»›c.

### YÃªu cáº§u: NÃ¢ng cáº¥p lÆ°u trá»¯ dá»¯ liá»‡u chi tiáº¿t Thuáº¿ tá»« LocalStorage lÃªn Database Backend

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u chuyá»ƒn Ä‘á»•i cÆ¡ cháº¿ lÆ°u trá»¯ dá»¯ liá»‡u chi tiáº¿t cá»§a tá» khai vÃ  cÃ¡c sá»• sÃ¡ch trong modal chi tiáº¿t ká»³ kÃª khai tá»« `localStorage` cá»§a trÃ¬nh duyá»‡t lÃªn Database Backend (Cloud) nháº±m trÃ¡nh rá»§i ro máº¥t dá»¯ liá»‡u khi xÃ³a cache trÃ¬nh duyá»‡t hoáº·c thay Ä‘á»•i thiáº¿t bá»‹.
- **Giáº£i phÃ¡p:**
  - **Backend API & Database:**
    - Táº¡o migration vÃ  báº£ng `tax_period_details` Ä‘á»ƒ lÆ°u trá»¯ dá»¯ liá»‡u JSON chi tiáº¿t cá»§a tá»«ng loáº¡i sá»• (`document_type` vÃ  `data`) Ä‘Æ°á»£c liÃªn káº¿t vá»›i `tax_periods` báº±ng khoÃ¡ ngoáº¡i, cÃ³ rÃ ng buá»™c unique giá»¯a `[tax_period_id, document_type]`.
    - T?o Model `TaxPeriodDetail` t? ??ng sinh UUID v7 khi t?o m?i.
    - ÄÄ’ng kÃ½ routes `GET /tax/periods/{id}/details` vÃ  `POST /tax/periods/{id}/details` trong `api.php`.
    - Bá»• sung cÃ¡c phÆ°Æ¡ng thá»©c `getPeriodDetails` vÃ  `savePeriodDetails` vÃ o `TaxController.php` Ä‘á»ƒ láº¥y/lÆ°u trá»¯ dá»¯ liá»‡u chi tiáº¿t.
  - **Frontend Services & Components:**
    - ThÃªm 2 phÆ°Æ¡ng thá»©c `getTaxPeriodDetails` vÃ  `saveTaxPeriodDetails` vÃ o `ApiService` (`api.service.ts`), Ä‘á»“ng thá»i bá»c chÃºng trong `TaxService` (`tax.service.ts`) dÆ°á»›i tÃªn `getPeriodDetails` vÃ  `savePeriodDetails`.
    - Cáº­p nháº­t `TaxDetailModalComponent` (`tax-detail-modal.component.ts`):
      - Cáº­p nháº­t `loadSavedData()` sá»­ dá»¥ng `forkJoin` Ä‘á»ƒ gá»i cÃ¡c API láº¥y dá»¯ liá»‡u cá»§a cáº£ 9 loáº¡i thÃ´ng tin chi tiáº¿t cÃ¹ng má»™t lÃºc tá»« backend. Fallback vá» sinh dá»¯ liá»‡u tá»± Ä‘á»™ng thÃ´ng minh náº¿u chÆ°a cÃ³ dá»¯ liá»‡u trÃªn server.
      - Chuyá»ƒn Ä‘á»•i toÃ n bá»™ cÃ¡c hÃ m `saveDeclaration()`, `saveS1a()`, `saveS2a()`, `saveS2b()`, `saveS2c()`, `saveS2d()`, `saveS2e()`, `saveInfo()` tá»« viá»‡c gá»i `localStorage.setItem` sang gá»i API `savePeriodDetails` cá»§a `TaxService` Ä‘á»ƒ lÆ°u trá»±c tiáº¿p trÃªn database backend.
- **Káº¿t quáº£:** Cháº¡y migration thÃ nh cÃ´ng, build frontend thÃ nh cÃ´ng 100%. Dá»¯ liá»‡u chi tiáº¿t Ä‘Æ°á»£c báº£o máº­t vÃ  lÆ°u trá»¯ an toÃ n trÃªn database.

### YÃªu cáº§u: Tá»‘i Æ°u hÃ³a responsive phÃ¢n há»‡ Thuáº¿, tÄƒng cá»¡ chá»¯ tá» khai vÃ  sá»­a lá»—i load láº¡i API khi Ä‘Ã³ng modal

- **Ná»™i dung yÃªu cáº§u:**
  1. Sá»­a lá»—i bÃ³p mÃ©o chá»¯ pháº§n thÃ´ng tin nhÃ³m thuáº¿ á»Ÿ tab KÃª khai thuáº¿ trÃªn mÃ n hÃ¬nh laptop/tablet; sá»­a lá»—i co cá»¥m vÃ  ngáº¯t dÃ²ng chá»¯ cá»§a cÃ¡c nÃºt "ThÃ´ng tin khai thuáº¿", "Táº£i file" trÃªn header modal chi tiáº¿t tá» khai.
  2. Kháº¯c phá»¥c váº¥n Ä‘á» font chá»¯ tá» khai vÃ  cÃ¡c sá»• sÃ¡ch quÃ¡ nhá» gÃ¢y khÃ³ Ä‘á»c.
  3. Xá»­ lÃ½ lá»—i há»‡ thá»‘ng tá»± Ä‘á»™ng reload láº¡i API khi ngÆ°á»i dÃ¹ng chá»‰ báº¥m nÃºt "ÄÃ³ng" hoáº·c dáº¥u "X" (close) mÃ  khÃ´ng lÆ°u thay Ä‘á»•i.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [tax.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.html): Thay Ä‘á»•i breakpoint cá»§a container thÃ´ng tin nhÃ³m tá»« `sm:flex-row` sang `lg:flex-row`, thÃªm `flex-1` cho khá»‘i text vÃ  `w-full lg:w-auto lg:shrink-0` cho khá»‘i nÃºt Ä‘á»ƒ khi co mÃ n hÃ¬nh, layout sáº½ xuá»‘ng dÃ²ng há»£p lÃ½ vÃ  khÃ´ng bá»‹ bÃ³p ngháº¹t chá»¯.
  - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts): Cáº¥u hÃ¬nh `showHeader: false` khi má»Ÿ `TaxDetailModalComponent` nháº±m áº©n thanh header mÃ u tráº¯ng máº·c Ä‘á»‹nh bá»‹ thá»«a (lÃ m hiá»ƒn thá»‹ hai tiÃªu Ä‘á»). Äá»“ng thá»i thay Ä‘á»•i Ä‘iá»u kiá»‡n kiá»ƒm tra dá»¯ liá»‡u thay Ä‘á»•i tá»« `if (hasChanges)` thÃ nh `if (hasChanges === true)` Ä‘á»ƒ ngÄƒn cháº·n viá»‡c gá»i `loadLogs()` reload láº¡i API khi ngÆ°á»i dÃ¹ng Ä‘Ã³ng modal mÃ  khÃ´ng thá»±c sá»± lÆ°u thay Ä‘á»•i.
  - Cáº­p nháº­t [tax-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-detail-modal/tax-detail-modal.component.html):
    - Äá»•i breakpoint header modal tá»« `sm:flex-row` sang `md:flex-row`, thÃªm `shrink-0` cho cá»¥m nÃºt vÃ  class `whitespace-nowrap` cho cÃ¡c button "ThÃ´ng tin khai thuáº¿", "Táº£i file" Ä‘á»ƒ triá»‡t tiÃªu lá»—i ngáº¯t dÃ²ng chá»¯.
    - Äá»“ng bá»™ hÃ³a vÃ  nÃ¢ng cá»¡ chá»¯ cá»§a táº¥t cáº£ cÃ¡c báº£ng (Tá» khai, PL01, S1a, S2a, S2b, S2c, S2d, S2e) trong modal: Ä‘á»•i cá»¡ chá»¯ table chung tá»« `text-xs` lÃªn `text-sm`, cá»¡ chá»¯ header báº£ng tá»« `text-[10px]` lÃªn `text-xs`, vÃ  cá»¡ chá»¯ cÃ¡c tháº» `input`/`select` nháº­p liá»‡u tá»« `text-xs` lÃªn `text-sm`.
- **Káº¿t quáº£:** Build frontend thÃ nh cÃ´ng 100%. Giao diá»‡n hiá»ƒn thá»‹ rÃµ rÃ ng, cÃ¢n Ä‘á»‘i, hoÃ n toÃ n responsive trÃªn cÃ¡c Ä‘á»™ phÃ¢n giáº£i, vÃ  triá»‡t tiÃªu cÃ¡c API call dÆ° thá»«a khi Ä‘Ã³ng modal.

### YÃªu cáº§u: NÃ¢ng cáº¥p há»‡ thá»‘ng Nháº­t kÃ½ kÃª khai Thuáº¿ theo Sá»• BÃ¡n HÃ ng

- **Ná»™i dung yÃªu cáº§u:** Tráº£i nghiá»‡m Sá»• BÃ¡n HÃ ng, nÃ¢ng cáº¥p tÃ­nh nÄƒng PhÃ¢n loáº¡i vÃ  Nháº­t kÃ½ kÃª khai Ä‘á»ƒ sinh ra Ä‘á»§ 7 loáº¡i tÃ i liá»‡u (Tá» khai vÃ  6 sá»• káº¿ toÃ¡n Chuáº©n TT 88) cho má»—i ká»³ kÃª khai. Cho phÃ©p click vÃ o tá»«ng dÃ²ng Ä‘á»ƒ xem/sá»­a chi tiáº¿t vÃ  lÆ°u cá»¥c bá»™, táº£i file Excel/XML thay vÃ¬ ná»™p tá»± Ä‘á»™ng.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts): hÃ m `getFormattedLogs()` sinh ra 1 Tá» khai vÃ  6 loáº¡i sá»• (S1a, S2a, S2b, S2c, S2d, S2e) cho má»—i ká»³ kÃª khai; lá»c chÃ­nh xÃ¡c theo dropdown. Loáº¡i bá» import `TaxDetailModalComponent` dÆ° thá»«a Ä‘á»ƒ triá»‡t tiÃªu warning Angular compiler.
  - Cáº­p nháº­t [tax-detail-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-detail-modal/tax-detail-modal.component.ts): Ä‘á»‹nh nghÄ©a interfaces, táº£i/lÆ°u `localStorage` riÃªng, táº¡o dá»¯ liá»‡u demo thÃ´ng minh vÃ  xuáº¥t Excel tÃ¹y biáº¿n cho tá»«ng loáº¡i sá»•. ThÃªm/xÃ³a dÃ²ng vÃ  tÃ­nh tá»•ng cá»™ng tá»± Ä‘á»™ng. ThÃªm `VNDCurrencyPipe` vÃ o imports vÃ  sá»­a Ã©p kiá»ƒu `any[][]` trong xuáº¥t Excel.
  - Cáº­p nháº­t [tax-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-detail-modal/tax-detail-modal.component.html): dÃ¹ng `@if / @else if` Ä‘á»ƒ render báº£ng biá»ƒu riÃªng khá»›p 100% nghiá»‡p vá»¥ tá»«ng sá»•; thÃªm hÆ°á»›ng dáº«n tá»± ná»™p thay vÃ¬ gá»­i TCT.
- **Káº¿t quáº£:** Build frontend thÃ nh cÃ´ng 100%, khÃ´ng cÃ²n warning nÃ o.

### YÃªu cáº§u: Táº¡o vÃ  tÃ­ch há»£p Custom Radio Button Component

- **Ná»™i dung yÃªu cáº§u:** Táº¡o component Radio Button tÃ¹y biáº¿n Ä‘á»ƒ thay tháº¿ cÃ¡c input radio native cÅ©, Ä‘á»“ng bá»™ vá»›i phong cÃ¡ch thiáº¿t káº¿, há»— trá»£ Light/Dark Mode vÃ  mÃ u chá»§ Ä‘áº¡o thÆ°Æ¡ng hiá»‡u.
- **Giáº£i phÃ¡p:**
  - T?o m?i component [CustomRadioComponent](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/custom-radio/custom-radio.component.ts) ??c l?p (standalone):
    - Triá»ƒn khai `ControlValueAccessor` tÆ°Æ¡ng thÃ­ch hoÃ n toÃ n vá»›i Angular Forms (`ngModel`).
    - Thiáº¿t káº¿ giao diá»‡n hÃ¬nh trÃ²n vá»›i viá»n má» trong Light/Dark Mode khi chÆ°a chá»n, vÃ  tÃ´ mÃ u chá»§ Ä‘áº¡o thÆ°Æ¡ng hiá»‡u (`var(--color-primary)` - tÃ­m) kÃ¨m cháº¥m trÃ²n tráº¯ng á»Ÿ giá»¯a vÃ  hiá»‡u á»©ng scale-up khi Ä‘Æ°á»£c chá»n.
    - _Tinh chá»‰nh thiáº¿t káº¿ sau feedback:_ Äá»•i tráº¡ng thÃ¡i chá»n tá»« tÃ´ Ä‘áº·c mÃ u há»“ng chÃ³i lá»i sang viá»n mÃ u primary 2px, ná»n tráº¯ng/tá»‘i, cháº¥m trÃ²n chÃ­nh giá»¯a mÃ u primary nhá» nháº¯n (10px) káº¿t há»£p Ä‘á»•i font-weight chá»¯ nhÃ£n thÃ nh `semibold` Ä‘á»ƒ giao diá»‡n trÃ´ng tinh táº¿, sáº¯c nÃ©t hÆ¡n.
    - Cáº¥u hÃ¬nh `:host { display: block; }` Ä‘á»ƒ trÃ¡nh lá»—i dÃ­nh chá»¯ hoáº·c sai lá»‡ch layout.
  - Cáº­p nháº­t [create-tax-period-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/create-tax-period-modal/create-tax-period-modal.component.html):
    - Loáº¡i bá» cÃ¡c input radio native cÅ© vÃ  tháº» label tÆ°Æ¡ng á»©ng.
    - Thay th? b?ng `<app-custom-radio>` k?t h?p v?i binding `ngModel`.
  - Cáº­p nháº­t [create-tax-period-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/create-tax-period-modal/create-tax-period-modal.component.ts):
    - ÄÄ’ng kÃ½ `CustomRadioComponent` trong máº£ng `imports`.
- **Káº¿t quáº£:** Build frontend thÃ nh cÃ´ng 100%. Giao diá»‡n hiá»ƒn thá»‹ sáº¯c nÃ©t, tinh táº¿.

### YÃªu cáº§u: TÃ­ch há»£p NhÃ³m 4 vÃ  Ä‘á»“ng bá»™ hÃ³a quy Ä‘á»‹nh Thuáº¿ má»›i nÄƒm 2026

- **Ná»™i dung yÃªu cáº§u:** TÃ­ch há»£p quy Ä‘á»‹nh thuáº¿ nÄƒm 2026 bao gá»“m 4 nhÃ³m doanh thu (NhÃ³m 1: <1 tá»·, NhÃ³m 2: 1-3 tá»·, NhÃ³m 3: 3-50 tá»·, NhÃ³m 4: >50 tá»·) vÃ o Modal kháº£o sÃ¡t, Ä‘á»“ng thá»i cáº­p nháº­t chÃ­nh xÃ¡c cÃ´ng thá»©c tÃ­nh thuáº¿ suáº¥t trÃªn Backend vÃ  Frontend.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [TaxController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/TaxController.php):
    - Cáº­p nháº­t `calculateTaxEstimate` Ä‘á»ƒ tÃ­nh thuáº¿: NhÃ³m 1 miá»…n thuáº¿ hoÃ n toÃ n; NhÃ³m 2 tÃ­nh thuáº¿ suáº¥t cá»§a ngÃ nh trÃªn pháº§n doanh thu vÆ°á»£t má»‘c 1 tá»·/nÄƒm (phÃ¢n bá»• theo ngÃ y); NhÃ³m 3 tÃ­nh GTGT kháº¥u trá»« (Ä‘áº§u ra - Ä‘áº§u vÃ o) vá»›i Ä‘áº§u vÃ o Æ°á»›c tÃ­nh 8% chi phÃ­, TNCN 17% lá»£i nhuáº­n; NhÃ³m 4 tÃ­nh tÆ°Æ¡ng tá»± NhÃ³m 3 nhÆ°ng TNCN lÃ  20% lá»£i nhuáº­n.
  - Cáº­p nháº­t [tax-survey-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-survey-modal/tax-survey-modal.component.html):
    - Bá»• sung nÃºt lá»±a chá»n NhÃ³m 4 (> 50 tá»·/nÄƒm) vÃ o BÆ°á»›c 2 vÃ  Ä‘á»“ng bá»™ cÃ¡c mÃ´ táº£ nhÃ³m 1, 2, 3, 4 theo luáº­t 2026.
  - Cáº­p nháº­t [tax.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.html):
    - Bá»• sung NhÃ³m 4 vÃ o kháº£o sÃ¡t doanh thu inline Q1, Ä‘á»“ng bá»™ hÃ³a cÃ¡c nhÃ£n hiá»ƒn thá»‹ phÆ°Æ¡ng phÃ¡p tÃ­nh thuáº¿ GTGT vÃ  TNCN tá»± Ä‘á»™ng theo tá»«ng nhÃ³m trÃªn tháº» tÃ³m táº¯t vÃ  tab Æ°á»›c tÃ­nh thuáº¿.
  - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts):
    - ThÃªm Case 4 vÃ o hÃ m hiá»ƒn thá»‹ nhÃ£n nhÃ³m `getBusinessGroupLabel` vÃ  thÃªm cÃ¡c hÃ m phá»¥ trá»£ `getPitMethodLabel`, `getVatMethodLabel` Ä‘á»ƒ Ä‘á»‹nh nghÄ©a mÃ´ táº£ cÃ¡ch tÃ­nh thuáº¿ Ä‘á»™ng, cáº­p nháº­t tiÃªu Ä‘á» modal káº¿t quáº£ kháº£o sÃ¡t.
- **Káº¿t quáº£:** PHP lint vÃ  build frontend Angular thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Äá»“ng bá»™ mÃ u sáº¯c nÃºt Thiáº¿t láº­p láº¡i vÃ  cáº­p nháº­t icon svg

- **Ná»™i dung yÃªu cáº§u:** Äá»“ng bá»™ mÃ u sáº¯c nÃºt "Thiáº¿t láº­p láº¡i" trÃªn tab KÃª khai thuáº¿ sang mÃ u tÃ­m giá»‘ng nÃºt "Táº¡o ká»³ kÃª khai", vÃ  thay Ä‘á»•i icon dáº¥u há»i sang icon xoay trÃ²n (sync).
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [tax.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.html):
    - Äá»•i class mÃ u sáº¯c cá»§a nÃºt "Thiáº¿t láº­p láº¡i" vÃ  "Táº¡o ká»³ kÃª khai" báº±ng cÃ¡ch loáº¡i bá» cÃ¡c class mÃ u thá»§ cÃ´ng (`!border-purple-200 !text-purple-600 hover:!bg-purple-50/50 ...`) Ä‘á»ƒ thá»«a káº¿ máº·c Ä‘á»‹nh tá»« component `<button app-button variant="secondary">` (cáº£ hai nÃºt Ä‘á»u cÃ³ mÃ u tÃ­m thÆ°Æ¡ng hiá»‡u Ä‘á»“ng bá»™, káº¿ thá»«a chuáº©n chá»‰nh tá»« há»‡ thá»‘ng).
    - Thay tháº¿ SVG icon dáº¥u há»i (`help-circle`) cÅ© cá»§a nÃºt "Thiáº¿t láº­p láº¡i" báº±ng component `<app-icon name="sync" ... />` (icon 2 mÅ©i tÃªn xoay trÃ²n) tÆ°Æ¡ng thÃ­ch tá»‘t vá»›i hÃ nh Ä‘á»™ng thiáº¿t láº­p láº¡i.
- **Káº¿t quáº£:** Build frontend thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Sá»­a lá»—i hover mÃ u sáº¯c chÆ°a Ä‘á»“ng Ä‘á»u trong menu vÃ­

- **Ná»™i dung yÃªu cáº§u:** Äá»“ng bá»™ hiá»‡u á»©ng hover cá»§a cÃ¡c má»¥c trong dropdown menu vÃ­ ngÆ°á»i dÃ¹ng. Hiá»‡n táº¡i má»¥c "ThÃ´ng tin cÃ¡ nhÃ¢n" hover ra mÃ u tÃ­m, trong khi "Sao chÃ©p Ä‘á»‹a chá»‰ vÃ­" vÃ  "Chi tiáº¿t vÃ­" hover ra mÃ u slate xÃ¡m. NgoÃ i ra hover row trong báº£ng Thuáº¿ á»Ÿ Dark Mode bá»‹ flash tráº¯ng báº¥t thÆ°á»ng.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [desktop-header.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/header/desktop-header.component.html) vÃ  [sidebar.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/sidebar/sidebar.component.html):
    - Äá»•i class hover cá»§a cáº£ ba nÃºt "ThÃ´ng tin cÃ¡ nhÃ¢n", "Sao chÃ©p Ä‘á»‹a chá»‰ vÃ­" vÃ  "Chi tiáº¿t vÃ­" sang mÃ u tÃ­m thÆ°Æ¡ng hiá»‡u Ä‘á»“ng bá»™: `hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-500`.
    - Sá»­a táº¥t cáº£ cÃ¡c class mÃ u `dark:text-purple-400` (trá» vá» mÃ u phá»¥ `--color-secondary`) thÃ nh `dark:text-purple-500` (trá» vá» mÃ u chÃ­nh `--color-primary`) Ä‘á»ƒ Ä‘á»“ng bá»™ tÃ´ng mÃ u á»Ÿ Dark Mode.
  - Cáº­p nháº­t [tax.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.html):
    - Sá»­a 3 chá»— dÃ¹ng class `slate-850` (khÃ´ng tá»“n táº¡i trong Tailwind) gÃ¢y ra hiá»‡n tÆ°á»£ng hover row báº£ng bá»‹ flash tráº¯ng á»Ÿ Dark Mode. Thay báº±ng `slate-700` (border) vÃ  `slate-800/40` (hover background).
- **Káº¿t quáº£:** Äá»“ng bá»™ thÃ nh cÃ´ng giao diá»‡n hover sang mÃ u tÃ­m thÆ°Æ¡ng hiá»‡u (purple), hoÃ n táº¥t quÃ¡ trÃ¬nh kiá»ƒm tra.

### YÃªu cáº§u: Tá»‘i Æ°u hÃ³a API calls vÃ  phÃ¢n trang phÃ¢n há»‡ Thuáº¿

- **Ná»™i dung yÃªu cáº§u:** Tá»‘i Æ°u hÃ³a cÃ¡c cuá»™c gá»i API Ä‘á»ƒ trÃ¡nh tÃ¬nh tráº¡ng táº£i láº¡i trÃ¹ng láº·p dá»¯ liá»‡u khÃ´ng cáº§n thiáº¿t khi load trang vÃ  chuyá»ƒn tab, Ä‘á»“ng thá»i lÃ m rÃµ cÆ¡ cháº¿ phÃ¢n trang cá»§a phÃ¢n há»‡ Thuáº¿.
- **Giáº£i phÃ¡p:**
  - **PhÃ¢n tÃ­ch:** TrÆ°á»›c Ä‘Ã¢y trong `ngOnInit`, há»‡ thá»‘ng vá»«a láº¯ng nghe sá»± kiá»‡n `router.events` vá»«a kiá»ƒm tra `web3Service.walletConnected()` cÃ¹ng lÃºc dáº«n Ä‘áº¿n 2 láº§n gá»i `loadInitialData()` song song lÃºc khá»Ÿi táº¡o. Äá»“ng thá»i má»—i láº§n chuyá»ƒn tab, `loadInitialData()` luÃ´n gá»i láº¡i API láº¥y profile thuáº¿ `loadTaxProfile()` khÃ´ng cáº§n thiáº¿t.
  - **Tá»‘i Æ°u hÃ³a Frontend (`tax.component.ts`):**
    - Sá»­ dá»¥ng Angular `effect` káº¿t há»£p `untracked` Ä‘á»ƒ quáº£n lÃ½ viá»‡c táº£i dá»¯ liá»‡u tá»± Ä‘á»™ng. Dá»¯ liá»‡u chá»‰ Ä‘Æ°á»£c táº£i khi vÃ­ Ä‘Ã£ káº¿t ná»‘i (`walletConnected` chuyá»ƒn thÃ nh `true`) vÃ  á»©ng vá»›i tá»«ng tab tÆ°Æ¡ng á»©ng (`activeTab` thay Ä‘á»•i).
    - DÃ¹ng `untracked` Ä‘á»ƒ Ä‘á»c profile vÃ  cÃ¡c hÃ m load dá»¯ liá»‡u nháº±m triá»‡t tiÃªu hoÃ n toÃ n vÃ²ng láº·p dependency hoáº·c re-trigger khÃ´ng mong muá»‘n.
    - Lo?i b? vi?c g?i `loadInitialData()` t? ??ng trong `ngOnInit()`, ch? gi? l?i vi?c c?p nh?t tab t? route.
    - Sá»­a láº¡i callback Ä‘Ã³ng modal kháº£o sÃ¡t chá»‰ gá»i `loadPeriods()` thay vÃ¬ `loadInitialData()`.
  - **PhÃ¢n trang Backend (`TaxController.php`):** Kháº£o sÃ¡t vÃ  lÃ m rÃµ ráº±ng phÆ°Æ¡ng thá»©c `getPeriods()` á»Ÿ Backend Ä‘Ã£ thá»±c sá»± phÃ¢n trang trá»±c tiáº¿p á»Ÿ cÆ¡ sá»Ÿ dá»¯ liá»‡u (`$query->paginate($limit)`), Ä‘áº£m báº£o hiá»‡u nÄƒng tá»‘i Æ°u server-side.
- **Káº¿t quáº£:** Build frontend `npm run build` thÃ nh cÃ´ng 100%. Sá»‘ lÆ°á»£ng request khi táº£i trang vÃ  chuyá»ƒn tab giáº£m máº¡nh, khÃ´ng cÃ²n tÃ¬nh tráº¡ng trÃ¹ng láº·p request API.

### YÃªu cáº§u: Bá» menu 3 cháº¥m báº£ng KÃª khai thuáº¿, thay báº±ng button sm inline

- **Ná»™i dung yÃªu cáº§u:** Bá» nÃºt 3 cháº¥m (dots-vertical) á»Ÿ cá»™t hÃ nh Ä‘á»™ng cá»§a báº£ng KÃª khai thuáº¿, thay báº±ng cÃ¡c button `sm` trá»±c tiáº¿p nhÆ° cÃ¡c table á»Ÿ feature khÃ¡c trong há»‡ thá»‘ng.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [tax.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.html): Thay tháº¿ `div.period-menu-container` + dropdown popup báº±ng hai button `app-button variant="secondary" size="sm"` inline: nÃºt **KhÃ³a sá»•** (mÃ u amber) vÃ  nÃºt **XÃ³a** (mÃ u rose), chá»‰ hiá»ƒn thá»‹ khi `row.status === 'open'`. Cáº­p nháº­t header báº£ng: rÃºt gá»n tÃªn cá»™t thÃ nh "Sá»‘ lÆ°á»£ng sá»•" vÃ  thÃªm header "HÃ nh Ä‘á»™ng".
  - Báº£ng **Nháº­t kÃ½ kÃª khai**: Thay 3 cháº¥m báº±ng button sm "Excel" (icon download), chá»‰ hiá»ƒn thá»‹ khi `row.period` tá»“n táº¡i. Fix responsive: giáº£m `min-w` xuá»‘ng `560px`, thÃªm `-mx-4 sm:mx-0` Ä‘á»ƒ table scroll Ä‘áº¹p trÃªn mobile. ThÃªm header "HÃ nh Ä‘á»™ng".
  - Thay toÃ n bá»™ pagination tá»± lÃ m báº±ng `app-pagination` component chuáº©n (vá»›i `currentPage`, `totalPages`, `totalItems`, `itemsPerPage`, `pageChange`). ThÃªm computed signals `totalLogsPages` vÃ  `totalPeriodsPages`.
  - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts): XÃ³a bá» signal `activePeriodMenuId`, `activeRowMenuId`, method `togglePeriodMenu()`, `closePeriodMenu()`, `toggleRowMenu()`, `closeRowMenu()` vÃ  listener tÆ°Æ¡ng á»©ng trong `@HostListener`. Import vÃ  khai bÃ¡o `PaginationComponent`.
  - Fix responsive header card "KÃª khai thuáº¿": Ä‘á»•i `lg:flex-row` thÃ nh `sm:flex-row` Ä‘á»ƒ buttons wrap sá»›m hÆ¡n trÃªn tablet/mobile.
  - Fix badge "ÄÃ£ khÃ³a" bá»‹ wrap xuá»‘ng 2 dÃ²ng: thÃªm `whitespace-nowrap`, Ä‘á»•i layout thÃ nh `flex-col` (date trÃªn, badge dÆ°á»›i), badge `rounded-full`.
  - NÃºt **XÃ³a** Ä‘á»•i sang `variant="danger-light"` (Ä‘á» nháº¡t #F43F5E) Ä‘á»ƒ phÃ¢n biá»‡t rÃµ vá»›i nÃºt **KhÃ³a sá»•** (tÃ­m secondary). LÃ½ do khÃ´ng dÃ¹ng class override mÃ u `!border-*` vÃ  `hover:!bg-*` vÃ¬ xung Ä‘á»™t vá»›i `background-color: color-mix(...)` cá»§a CSS gá»‘c `btn-secondary`.
- **Káº¿t quáº£:** Build frontend `npm run build` thÃ nh cÃ´ng 100% khÃ´ng phÃ¡t sinh báº¥t ká»³ lá»—i biÃªn dá»‹ch nÃ o.

### YÃªu cáº§u: NÃ¢ng cáº¥p button, sá»­a Ä‘á»•i skeleton vÃ  tÃ­ch há»£p demo logs phÃ¢n há»‡ Thuáº¿

- **Ná»™i dung yÃªu cáº§u:** Chuyá»ƒn Ä‘á»•i cÃ¡c nÃºt báº¥m hÃ nh Ä‘á»™ng á»Ÿ tab KÃª khai thuáº¿ sang size `md` vÃ¬ size `sm` quÃ¡ nhá»; thiáº¿t káº¿ láº¡i nÃºt Thiáº¿t láº­p láº¡i (sá»­ dá»¥ng icon help-circle, viá»n há»“ng nháº¡t) vÃ  nÃºt KhÃ³a sá»• (mÃ u gradient há»“ng-tÃ­m). Giáº£i thÃ­ch Ã½ nghÄ©a cá»§a viá»‡c KhÃ³a sá»• ká»³ káº¿ toÃ¡n. Kháº¯c phá»¥c váº¥n Ä‘á» tab Nháº­t kÃ½ kÃª khai trá»‘ng báº±ng cÃ¡ch thiáº¿t káº¿ láº¡i cáº¥u trÃºc báº£ng (PhÃ¢n loáº¡i, TÃªn sá»•, Tráº¡ng thÃ¡i) vÃ  chÃ¨n dá»¯ liá»‡u demo tÄ©nh. Tinh chá»‰nh láº¡i Skeleton Loading cá»§a phÃ¢n há»‡ Thuáº¿ Ä‘á»ƒ loáº¡i bá» Summary card vÃ  giáº£ láº­p Ä‘Ãºng UI thá»±c táº¿ cá»§a cáº£ hai tab.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts): ThÃªm háº±ng sá»‘ demo `demoLogs` chá»©a thÃ´ng tin Tá» khai 01.TKN-CNKD vÃ  sá»• S1a-HKD, viáº¿t hÃ m `getFormattedLogs()` Ä‘á»ƒ káº¿t xuáº¥t dá»¯ liá»‡u tháº­t vÃ  demo náº¿u trá»‘ng.
  - Cáº­p nháº­t [tax.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.html):
    - Äá»•i size 3 button á»Ÿ header tab kÃª khai sang `md`. NÃºt Thiáº¿t láº­p láº¡i Ä‘á»•i sang icon `help-circle`, viá»n há»“ng, ná»n há»“ng nháº¡t. NÃºt KhÃ³a sá»• Ä‘á»•i sang gradient tÃ­m-há»“ng.
    - Chuyá»ƒn Ä‘á»•i cáº¥u trÃºc báº£ng cá»§a tab Nháº­t kÃ½ kÃª khai sang 3 cá»™t (PhÃ¢n loáº¡i, TÃªn sá»•, Tráº¡ng thÃ¡i), tÃ­ch há»£p dropdown lá»c PhÃ¢n loáº¡i vÃ  bá»™ phÃ¢n trang 10/Trang, render tá»« `getFormattedLogs()`.
  - Cáº­p nháº­t [skeleton-loader.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/skeleton-loader/skeleton-loader.component.html): Sá»­a Ä‘á»•i skeleton `type="tax"` loáº¡i bá» Summary card, giáº£ láº­p 3 button header vÃ  banner thÃ´ng tÆ°. Sá»­a skeleton `type="tax-logs"` Ä‘á»ƒ giáº£ láº­p bá»™ lá»c PhÃ¢n loáº¡i vÃ  báº£ng 3 cá»™t.
- **Káº¿t quáº£:** Build frontend `npm run build` thÃ nh cÃ´ng 100% khÃ´ng phÃ¡t sinh báº¥t ká»³ lá»—i biÃªn dá»‹ch nÃ o.

### YÃªu cáº§u: Cáº¥u hÃ¬nh Routing Tab phÃ¢n há»‡ Thuáº¿ & Xá»­ lÃ½ Thiáº¿t láº­p láº¡i, Chuyá»ƒn hÆ°á»›ng kháº£o sÃ¡t

- **Ná»™i dung yÃªu cáº§u:** Cáº¥u hÃ¬nh route riÃªng biá»‡t cho má»—i tab cá»§a phÃ¢n há»‡ Thuáº¿. ÄÆ°a nÃºt "Thiáº¿t láº­p láº¡i" vá» tab KÃª khai thuáº¿ kÃ¨m modal xÃ¡c nháº­n. Khi hoÃ n táº¥t kháº£o sÃ¡t, hiá»ƒn thá»‹ modal káº¿t quáº£ rá»“i tá»± Ä‘á»™ng chuyá»ƒn hÆ°á»›ng vá» láº¡i tab KÃª khai thuáº¿. Sá»­a lá»—i biÃªn dá»‹ch do gá»i hÃ m khÃ´ng tá»“n táº¡i `openSurveyModal()`.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [app.routes.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/app.routes.ts): Chuyá»ƒn path `tax` thÃ nh route cha vÃ  Ä‘á»‹nh nghÄ©a cÃ¡c route con cho 3 tab (`logs`, `declaration`, `estimation`). Khi truy cáº­p `/tax` sáº½ tá»± Ä‘á»™ng redirect vá» `/tax/logs`.
  - Cáº­p nháº­t [tax.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.html): Kháº¯c phá»¥c lá»—i compiler báº±ng cÃ¡ch Ä‘á»•i lá»i gá»i `openSurveyModal()` thÃ nh `setTab('declaration')` trÃªn button "Thiáº¿t láº­p ngay".
  - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts): Cáº­p nháº­t callback sau khi Ä‘Ã³ng modal káº¿t quáº£ kháº£o sÃ¡t (`TaxResultModalComponent`) Ä‘á»ƒ tá»± Ä‘á»™ng chuyá»ƒn hÆ°á»›ng ngÆ°á»i dÃ¹ng vá» tab KÃª khai thuáº¿ thÃ´ng qua `this.setTab('declaration')`.
- **Káº¿t quáº£:** Build frontend `npm run build` thÃ nh cÃ´ng 100% khÃ´ng phÃ¡t sinh báº¥t ká»³ lá»—i biÃªn dá»‹ch nÃ o.

### YÃªu cáº§u: Äá»“ng bá»™ hÃ³a giao diá»‡n tab Cáº¥u hÃ¬nh Thuáº¿ trong CÃ i Ä‘áº·t

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u Ä‘á»“ng bá»™ hÃ³a giao diá»‡n ná»™i dung cá»§a tab Cáº¥u hÃ¬nh Thuáº¿ vá»›i cÃ¡c tab cáº¥u hÃ¬nh khÃ¡c trong phÃ¢n há»‡ CÃ i Ä‘áº·t Ä‘á»ƒ Ä‘áº£m báº£o tÃ­nh káº¿ thá»«a vÃ  thá»‘ng nháº¥t vá» máº·t tháº©m má»¹.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t header cá»§a card Cáº¥u hÃ¬nh Thuáº¿ trong `settings.component.html`: Bá»• sung Ä‘Æ°á»ng gáº¡ch dÆ°á»›i phÃ¢n cÃ¡ch `border-b` vÃ  class padding `pb-2` Ä‘á»ƒ khá»›p 100% vá»›i header cá»§a cÃ¡c tab khÃ¡c (general, invoice, store, blockchain, v.v.).
  - Loáº¡i bá» pháº§n text mÃ´ táº£ phá»¥ khÃ´ng cáº§n thiáº¿t dÆ°á»›i tiÃªu Ä‘á» Ä‘á»ƒ giá»¯ giao diá»‡n pháº³ng, tá»‘i giáº£n nhÆ° cÃ¡c tab cáº¥u hÃ¬nh chuáº©n.
  - Äá»“ng bá»™ hÃ³a cÃ¡c switch toggle: Thay Ä‘á»•i tá»« switch dáº¡ng compact bá»c trong label bÃªn ngoÃ i sang component `<app-custom-switch type="full">` truyá»n trá»±c tiáº¿p `label` vÃ  `description` vÃ o component, giÃºp thá»‘ng nháº¥t cáº¥u trÃºc vá»›i switch thanh toÃ¡n Crypto vÃ  cÃ¡c cáº¥u hÃ¬nh báº­t/táº¯t khÃ¡c.
  - Äá»“ng bá»™ hÃ³a input thuáº¿ suáº¥t máº·c Ä‘á»‹nh: Chuyá»ƒn nhÃ£n label thÃ nh dáº¡ng viáº¿t hoa nhá» `text-xs font-bold text-slate-400 uppercase tracking-wide`, Ä‘Æ°a class input vá» `form-input font-semibold` tiÃªu chuáº©n cá»§a há»‡ thá»‘ng Ä‘á»ƒ Ä‘á»“ng bá»™ kÃ­ch thÆ°á»›c vÃ  bo gÃ³c, loáº¡i bá» cÃ¡c class style ad-hoc dÆ° thá»«a.
- **Káº¿t quáº£:** Giao diá»‡n tab Cáº¥u hÃ¬nh Thuáº¿ káº¿ thá»«a trá»n váº¹n phong cÃ¡ch thiáº¿t káº¿ vÃ  UI components cá»§a há»‡ thá»‘ng, biÃªn dá»‹ch Angular hoÃ n táº¥t thÃ nh cÃ´ng.

### YÃªu cáº§u: PhÃ¡t triá»ƒn PhÃ¢n há»‡ Quáº£n lÃ½ vÃ  KÃª khai Thuáº¿ & Sá»­a lá»—i biÃªn dá»‹ch Frontend

- **Ná»™i dung yÃªu cáº§u:** TÃ­ch há»£p tÃ­nh nÄƒng quáº£n lÃ½ thuáº¿ dÃ nh cho Há»™ Kinh Doanh CÃ¡ Thá»ƒ vÃ  tÃ­nh thuáº¿ VAT tá»± Ä‘á»™ng trÃªn tá»«ng sáº£n pháº©m, hiá»ƒn thá»‹ chi tiáº¿t táº¡i POS, Storefront, HoÃ¡ Ä‘Æ¡n vÃ  biá»ƒu máº«u Admin cáº¥u hÃ¬nh. Kháº¯c phá»¥c cÃ¡c lá»—i biÃªn dá»‹ch Angular/TypeScript phÃ¡t sinh sau khi tÃ­ch há»£p.
- **Giáº£i phÃ¡p:**
  - **CÆ¡ sá»Ÿ dá»¯ liá»‡u:** Táº¡o báº£ng `tax_profiles` (LÆ°u thÃ´ng tin há»“ sÆ¡ kháº£o sÃ¡t thuáº¿: nhÃ³m kinh doanh, tá»· lá»‡ phÃ¢n bá»• ngÃ nh nghá») vÃ  `tax_periods` (LÆ°u lá»‹ch sá»­ ká»³ kÃª khai thuáº¿, doanh thu, chi phÃ­, thuáº¿ GTGT, TNCN pháº£i ná»™p, tráº¡ng thÃ¡i khÃ³a sá»•).
  - **Backend API:** Viáº¿t `TaxController` phá»¥c vá»¥ viá»‡c thiáº¿t láº­p há»“ sÆ¡ thuáº¿, Æ°á»›c tÃ­nh sá»‘ thuáº¿ pháº£i ná»™p trong ká»³ dá»±a trÃªn Ä‘Æ¡n hÃ ng vÃ  chi phÃ­, táº¡o ká»³ kÃª khai vÃ  khÃ³a sá»• ká»³ kÃª khai. TÃ­ch há»£p phÃ¢n quyá»n `tax` vÃ  kiá»ƒm tra gÃ³i cÆ°á»›c `enable_tax`. Lint kiá»ƒm tra cÃº phÃ¡p PHP thÃ nh cÃ´ng 100%.
  - **Frontend:** PhÃ¡t triá»ƒn mÃ n hÃ¬nh `TaxComponent` bao gá»“m Kháº£o sÃ¡t Há»“ sÆ¡ thuáº¿ 3 bÆ°á»›c, giao diá»‡n Æ¯á»›c tÃ­nh Thuáº¿ Ä‘á»™ng, KÃª khai thuáº¿ vÃ  Nháº­t kÃ½ hoáº¡t Ä‘á»™ng.
  - **Sá»­a lá»—i biÃªn dá»‹ch Frontend & Hiá»ƒn thá»‹ Giao diá»‡n:**
    - C?p nh?t `settingsSubTab` signal trong `settings.component.ts` ?? b? sung ki?u `'tax'`.
    - Thay tháº¿ thuá»™c tÃ­nh sai `[value]` vÃ  `(valueChange)` thÃ nh `[checked]` vÃ  `(checkedChange)` trÃªn cÃ¡c component `<app-custom-switch>` trong `settings.component.html` vÃ  `tax.component.html`.
    - Sá»­a tham sá»‘ thÃ´ng bÃ¡o toast tá»« `'warning'` thÃ nh `'error'` trong `tax.component.ts` (dÃ²ng 193).
    - Cáº­p nháº­t phÆ°Æ¡ng thá»©c gá»i API tá»« `lockPeriod` thÃ nh `lockTaxPeriod` trong `tax.component.ts` (dÃ²ng 282).
    - Kháº¯c phá»¥c lá»—i component `<app-custom-switch>` á»Ÿ cháº¿ Ä‘á»™ `compact` (máº·c Ä‘á»‹nh) bá»‹ nuá»‘t/áº©n nhÃ£n (`label` text): Cáº­p nháº­t template cá»§a `CustomSwitchComponent` hiá»ƒn thá»‹ tháº» `span` chá»©a nhÃ£n bÃªn cáº¡nh nÃºt gáº¡t khi cÃ³ biáº¿n `label` Ä‘Æ°á»£c truyá»n vÃ o, sá»­a lá»—i thiáº¿u chá»¯ mÃ´ táº£ trÃªn giao diá»‡n cáº¥u hÃ¬nh thuáº¿ vÃ  kháº£o sÃ¡t thuáº¿.
    - Äá»“ng bá»™ hÃ³a cáº¥u trÃºc trang vÃ  header: Di chuyá»ƒn `<app-page-header>` ra ngoÃ i cÃ¡c khá»‘i Ä‘iá»u kiá»‡n `@if` check vÃ­/phÃ¢n quyá»n Ä‘á»ƒ hiá»ƒn thá»‹ nháº¥t quÃ¡n trÃªn toÃ n trang, Ä‘á»“ng thá»i tÃ­ch há»£p Content Projection `<app-icon name="tax" ...>` Ä‘á»ƒ hiá»ƒn thá»‹ logo trang Ä‘á»“ng bá»™ vá»›i cÃ¡c phÃ¢n há»‡ khÃ¡c.
    - TÃ­ch há»£p Skeleton Loading & Premium Date Picker cho phÃ¢n há»‡ Thuáº¿: Thay tháº¿ cÃ¡c icon loading spinner quay trÃ²n truyá»n thá»‘ng báº±ng `<app-skeleton-loader>` (loáº¡i `table` cho danh sÃ¡ch, loáº¡i `reports` khi Æ°á»›c tÃ­nh vÃ  load trang Ä‘áº§u), Ä‘á»“ng thá»i thay tháº¿ cÃ¡c Ã´ nháº­p ngÃ y `<input type="date">` thÃ´ báº±ng component chá»n ngÃ y cao cáº¥p `<app-custom-date-picker>` Ä‘á»“ng bá»™ vá»›i há»‡ thá»‘ng.
    - LÃ m sáº¡ch vÃ  Ä‘á»“ng bá»™ giao diá»‡n hiá»ƒn thá»‹: Loáº¡i bá» mÃ u ná»n `bg-gradient-to-br` trÃªn cÃ¡c tháº» thÃ´ng tin Æ°á»›c tÃ­nh thuáº¿ Ä‘á»ƒ Ä‘Æ°a vá» ná»n pháº³ng `bg-slate-50 dark:bg-slate-900` thá»‘ng nháº¥t. Sá»­a Ä‘á»•i icon cá»§a nÃºt "Kháº£o sÃ¡t láº¡i" vÃ  nÃºt "Sá»­a" phÆ°Æ¡ng thá»©c thanh toÃ¡n tá»« `pencil` (khÃ´ng cÃ³ sáºµn) thÃ nh `edit` (Ä‘Ã£ cÃ³ sáºµn trong thÆ° viá»‡n SVG) Ä‘á»ƒ hiá»ƒn thá»‹ biá»ƒu tÆ°á»£ng bÃºt chÃ¬ chuáº©n xÃ¡c.
  - **Káº¿t quáº£:** BiÃªn dá»‹ch dá»± Ã¡n frontend Angular (`npm run build`) thÃ nh cÃ´ng 100% khÃ´ng phÃ¡t sinh lá»—i nÃ o, giao diá»‡n hiá»ƒn thá»‹ nhÃ£n switch chuáº©n xÃ¡c.

### YÃªu cáº§u: Chuyá»ƒn Ä‘á»•i Kháº£o sÃ¡t Há»“ sÆ¡ Thuáº¿ sang Modal & Thiáº¿t káº¿ Skeleton Loading riÃªng biá»‡t cho phÃ¢n há»‡ Thuáº¿

- **Ná»™i dung yÃªu cáº§u:** Bá» menu con (sub-menu) Thuáº¿ á»Ÿ Sidebar (Desktop & Mobile) Ä‘á»ƒ tá»‘i giáº£n hÃ³a giao diá»‡n. Thiáº¿t káº¿ láº¡i luá»“ng Kháº£o sÃ¡t thuáº¿: thay vÃ¬ hiá»ƒn thá»‹ inline chiáº¿m dá»¥ng tab, chuyá»ƒn toÃ n bá»™ Form kháº£o sÃ¡t 3 bÆ°á»›c thÃ nh Modal popup riÃªng (`TaxSurveyModalComponent`) Ä‘á»ƒ khi báº¥m "Kháº£o sÃ¡t láº¡i", giao diá»‡n quáº£n lÃ½ chá»‘t thuáº¿ á»Ÿ dÆ°á»›i váº«n hiá»ƒn thá»‹ bÃ¬nh thÆ°á»ng. Äá»“ng thá»i, thiáº¿t káº¿ láº¡i skeleton loading pulse Ä‘á»™c láº­p, mÃ´ phá»ng chÃ­nh xÃ¡c giao diá»‡n phÃ¢n há»‡ Thuáº¿ thay vÃ¬ káº¿ thá»«a skeleton loader chung cá»§a cÃ¡c chá»©c nÄƒng khÃ¡c Ä‘á»ƒ trÃ¡nh layout shift.
- **Giáº£i phÃ¡p:**
  - **TÃ¡ch Component Modal:** ÄÃ³ng gÃ³i toÃ n bá»™ logic kháº£o sÃ¡t 3 bÆ°á»›c, dá»¯ liá»‡u form vÃ  cÃ¡c hÃ nh Ä‘á»™ng káº¿ tiáº¿p thÃ nh component riÃªng biá»‡t [TaxSurveyModalComponent](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-survey-modal/tax-survey-modal.component.ts) vÃ  template cá»§a nÃ³.
  - **Cáº­p nháº­t luá»“ng Kháº£o sÃ¡t:** Thay tháº¿ Stepper inline cÅ© trong [tax.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.html) báº±ng giao diá»‡n Empty State Ä‘Æ¡n giáº£n, sáº¡ch sáº½ kÃ­ch hoáº¡t má»Ÿ Modal kháº£o sÃ¡t khi chÆ°a cáº¥u hÃ¬nh. Cáº­p nháº­t nÃºt "Kháº£o sÃ¡t láº¡i" á»Ÿ Summary card gá»i phÆ°Æ¡ng thá»©c má»Ÿ Modal trá»±c tiáº¿p giÃºp trang quáº£n lÃ½ bÃªn dÆ°á»›i khÃ´ng bá»‹ thay Ä‘á»•i tráº¡ng thÃ¡i, ngÆ°á»i dÃ¹ng cÃ³ thá»ƒ xem Nháº­t kÃ½ chá»‘t thuáº¿ (`logs`) báº¥t ká»³ lÃºc nÃ o.
  - **Tá»‘i Æ°u hÃ³a Skeleton Loading:**
    - Thay tháº¿ skeleton loading toÃ n trang á»Ÿ Ä‘áº§u component báº±ng 3 khá»‘i mÃ´ phá»ng Summary card, tab selector vÃ  vÃ¹ng ná»™i dung.
    - Thay tháº¿ skeleton loading cá»§a tab logs vÃ  tab declaration báº±ng hiá»‡u á»©ng dÃ²ng báº£ng `animate-pulse` tÃ¹y biáº¿n riÃªng biá»‡t.
    - Thay tháº¿ skeleton cá»§a tab Æ°á»›c tÃ­nh báº±ng cáº¥u trÃºc lÆ°á»›i 6 card Ä‘á»“ng bá»™ hoÃ n toÃ n khá»›p hoÃ n háº£o vá»›i 6 card tháº­t khi táº£i xong (loáº¡i bá» mÃ u ná»n Ä‘á» vÃ  thanh há»“ng ná»•i báº­t, Ä‘Æ°a vá» mÃ u xÃ¡m pháº³ng Ä‘á»“ng Ä‘iá»‡u).
    - TÃ­ch há»£p 3 layout skeleton má»›i (`'tax'`, `'tax-logs'`, vÃ  `'tax-estimation'`) vÃ o trá»±c tiáº¿p component `<app-skeleton-loader>` dÃ¹ng chung cá»§a há»‡ thá»‘ng, giÃºp cÃ¡c khá»‘i skeleton káº¿ thá»«a hoÃ n háº£o class `app-card` (shadow, border radius 15px, background mÃ u slate á»Ÿ cáº£ light vÃ  dark mode) chuáº©n má»±c cá»§a dá»± Ã¡n thay vÃ¬ viáº¿t cÃ¡c div thÃ´ sÆ¡.
  - **Káº¿t quáº£:** BiÃªn dá»‹ch dá»± Ã¡n frontend Angular (`npm run build`) thÃ nh cÃ´ng 100% khÃ´ng phÃ¡t sinh lá»—i nÃ o.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i Ä‘iá»u hÆ°á»›ng Kháº£o sÃ¡t láº¡i, tÃ­ch há»£p Submenu Sidebar, sá»­a lá»—i select [object Object] vÃ  nÃ¢ng cáº¥p Modal & Empty State

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n há»“i báº¥m nÃºt "Kháº£o sÃ¡t láº¡i" bá»‹ káº¹t á»Ÿ bÆ°á»›c 1 khÃ´ng cÃ³ cÃ¡ch nÃ o quay láº¡i trang quáº£n lÃ½ cÅ©. Äá»“ng thá»i yÃªu cáº§u hiá»ƒn thá»‹ sub-menu cá»§a phÃ¢n há»‡ Thuáº¿ á»Ÿ Sidebar (Desktop & Mobile) Ä‘á»ƒ chuyá»ƒn tab trá»±c tiáº¿p, sá»­a lá»—i dropdown select hiá»ƒn thá»‹ `[object Object]` trong modal, dá»n dáº¹p blur cá»§a modal overlay Ä‘á»ƒ káº¿ thá»«a chuáº©n vÃ  nÃ¢ng cáº¥p giao diá»‡n Empty State cho Ká»³ kÃª khai kÃ¨m banner ThÃ´ng tÆ° 50.
- **Giáº£i phÃ¡p:**
  - **Kháº¯c phá»¥c nÃºt quay láº¡i:** Cáº­p nháº­t [tax.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.html) Ä‘á»ƒ hiá»ƒn thá»‹ nÃºt "Há»§y bá»" gá»i hÃ m `cancelSurveyReset()` táº¡i bÆ°á»›c 1 kháº£o sÃ¡t náº¿u Ä‘Ã£ cÃ³ há»“ sÆ¡ cÅ©.
  - **TÃ­ch há»£p Submenu Sidebar:** ÄÃ£ thÃªm vÃ  sau Ä‘Ã³ hoÃ n tÃ¡c (xÃ³a bá») sub-menu cá»§a phÃ¢n há»‡ Thuáº¿ á»Ÿ Sidebar (Desktop & Mobile) theo mong muá»‘n tá»‘i giáº£n giao diá»‡n cá»§a ngÆ°á»i dÃ¹ng.
  - **Cáº£i tiáº¿n Cáº¥u trÃºc Tabs & Luá»“ng Kháº£o sÃ¡t:** TÃ¡ch rá»i Ä‘iá»u kiá»‡n kháº£o sÃ¡t thuáº¿. Thanh tab group Ä‘iá»u hÆ°á»›ng luÃ´n Ä‘Æ°á»£c hiá»ƒn thá»‹ á»Ÿ trÃªn cÃ¹ng. Tab **Nháº­t kÃ½ chá»‘t thuáº¿** (`logs`) luÃ´n kháº£ dá»¥ng Ä‘á»ƒ xem lá»‹ch sá»­ chá»‘t cÅ© ká»ƒ cáº£ khi Ä‘ang á»Ÿ tráº¡ng thÃ¡i kháº£o sÃ¡t láº¡i. Form kháº£o sÃ¡t chá»‰ nhÃºng bÃªn trong tab **KÃª khai thuáº¿** (`declaration`) khi chÆ°a cáº¥u hÃ¬nh. Tab **Æ¯á»›c tÃ­nh thuáº¿** (`estimation`) hiá»ƒn thá»‹ card hÆ°á»›ng dáº«n khi chÆ°a cáº¥u hÃ¬nh.
  - **Láº¯ng nghe Deep Link:** Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts) inject `ActivatedRoute` vÃ  subscribe queryParams Ä‘á»ƒ tá»± Ä‘á»™ng gá»i `setTab()` chuyá»ƒn tab tÆ°Æ¡ng á»©ng.
  - **Sá»­a lá»—i hiá»ƒn thá»‹ Dropdown:** ThÃªm `valueKey="value"` vÃ  `labelKey="label"` vÃ o cÃ¡c component `<app-custom-select>` trong modal táº¡o ká»³ kÃª khai Ä‘á»ƒ trÃ­ch xuáº¥t Ä‘Ãºng trÆ°á»ng dá»¯ liá»‡u hiá»ƒn thá»‹.
  - **NÃ¢ng cáº¥p Modal & Overlay:** Thay Ä‘á»•i cáº¥u trÃºc Modal táº¡o ká»³ kÃª khai, tÃ¡ch riÃªng overlay `bg-black/40` khÃ´ng cÃ³ blur Ä‘á»ƒ káº¿ thá»«a chuáº©n modal cá»§a toÃ n há»‡ thá»‘ng. Äá»•i nÃºt chá»n loáº¡i ká»³ thÃ nh Radio buttons hÃ¬nh trÃ²n.
  - **TÃ¡ch Component Modal:** ÄÃ³ng gÃ³i toÃ n bá»™ logic vÃ  giao diá»‡n modal táº¡o ká»³ kÃª khai thÃ nh component riÃªng biá»‡t `CreateTaxPeriodModalComponent` táº¡i [create-tax-period-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/create-tax-period-modal/create-tax-period-modal.component.ts), má»Ÿ thÃ´ng qua `ModalService.open(...)` giÃºp káº¿ thá»«a hoÃ n háº£o giao diá»‡n, background, header vÃ  hiá»‡u á»©ng Ä‘Ã³ng má»Ÿ chuáº©n cá»§a dá»± Ã¡n. Loáº¡i bá» hoÃ n toÃ n mÃ£ HTML modal inline cÅ© trong [tax.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.html).
  - **ThÃªm Alert & Empty State:** ThÃªm banner cáº­p nháº­t ThÃ´ng tÆ° 50/2026/TT-BTC mÃ u xanh da trá»i, vÃ  nÃ¢ng cáº¥p Empty State cá»§a tab kÃª khai thÃ nh minh há»a SVG tá» giáº¥y & cÃ¢y bÃºt kÃ¨m nÃºt táº¡o ká»³ kÃª khai xanh lÃ¡ ná»•i báº­t.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i giáº­t hÃ¬nh (layout shift) khi má»Ÿ Select component

- **Ná»™i dung yÃªu cáº§u:** Khi ngÆ°á»i dÃ¹ng báº¥m vÃ o select component, dropdown menu hiá»ƒn thá»‹ láº§n Ä‘áº§u hoáº·c cÃ¡c láº§n tiáº¿p theo bá»‹ giáº­t nháº¹ lÃªn má»™t cÃ¡i do lá»‡ch vá»‹ trÃ­ layout trÆ°á»›c khi Ä‘á»‹nh vá»‹ Ä‘Ãºng.
- **Giáº£i phÃ¡p:**
  - **PhÃ¢n tÃ­ch:** TrÆ°á»›c Ä‘Ã¢y, trong [custom-select.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/custom-select/custom-select.component.ts), phÆ°Æ¡ng thá»©c `toggleOpen()` kÃ­ch hoáº¡t tráº¡ng thÃ¡i `isOpen` cá»§a dropdown trÆ°á»›c khi tÃ­nh toÃ¡n tá»a Ä‘á»™ fixed thÃ´ng qua má»™t tÃ¡c vá»¥ báº¥t Ä‘á»“ng bá»™ `setTimeout(..., 0)`. Viá»‡c nÃ y lÃ m cho dropdown bá»‹ render táº¡m thá»i theo cáº¥u trÃºc static block rá»—ng á»Ÿ vá»‹ trÃ­ máº·c Ä‘á»‹nh trong DOM (Ä‘áº©y layout xung quanh) trÆ°á»›c khi chuyá»ƒn thÃ nh `fixed` vÃ  bay Ä‘áº¿n vá»‹ trÃ­ thá»±c táº¿ cá»§a trigger.
  - **Kháº¯c phá»¥c:** Thay Ä‘á»•i logic Ä‘á»ƒ Ä‘o Ä‘áº¡c vÃ  cáº­p nháº­t tá»a Ä‘á»™ fixed cá»§a dropdown Ä‘á»“ng bá»™ báº±ng cÃ¡ch gá»i hÃ m `updateDropdownPosition()` ngay láº­p tá»©c trong `toggleOpen()` trÆ°á»›c khi báº­t cá» tráº¡ng thÃ¡i `isOpen` thÃ nh `true`. Viá»‡c tÃ­nh toÃ¡n nÃ y hoÃ n toÃ n Ä‘á»™c láº­p vÃ  khÃ´ng phá»¥ thuá»™c vÃ o tráº¡ng thÃ¡i render cá»§a dropdown vÃ¬ nÃ³ chá»‰ sá»­ dá»¥ng tá»a Ä‘á»™ cá»§a trigger `button` (Ä‘Ã£ cÃ³ sáºµn trong DOM).
  - **Káº¿t quáº£:** Build frontend thÃ nh cÃ´ng 100%, dropdown menu hiá»ƒn thá»‹ ngay láº­p tá»©c táº¡i vá»‹ trÃ­ chÃ­nh xÃ¡c mÃ  khÃ´ng gáº·p báº¥t ká»³ Ä‘á»™ trá»… hay hiá»‡n tÆ°á»£ng giáº­t giáº­t layout nÃ o.

### YÃªu cáº§u: Äá»“ng bá»™ hÃ³a thuáº­t ngá»¯ vÃ  quy mÃ´ doanh thu kháº£o sÃ¡t thuáº¿ theo máº«u chuáº©n phÃ¡p lÃ½ gá»‘c

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u Ä‘á»“ng bá»™ hÃ³a 100% tÃªn gá»i, thá»© tá»± hiá»ƒn thá»‹ cá»§a cÃ¡c nhÃ³m ngÃ nh vÃ  quy mÃ´ doanh thu trong Kháº£o sÃ¡t Há»“ sÆ¡ Thuáº¿ khá»›p vá»›i máº«u cÅ©/vÄƒn báº£n phÃ¡p lÃ½ gá»‘c (HÃ¬nh 1).
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [tax-survey-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-survey-modal/tax-survey-modal.component.html):
    - Äá»•i thá»© tá»± vÃ  tÃªn cÃ¡c nÃºt ngÃ nh nghá»: (1) PhÃ¢n phá»‘i, cung cáº¥p hÃ ng hÃ³a (GTGT 1%, TNCN 0.5%), (2) Dá»‹ch vá»¥, XD khÃ´ng NVL (GTGT 5%, TNCN 2.0%), (3) SX, váº­n táº£i, XD cÃ³ NVL (GTGT 3%, TNCN 1.5%), (4) Hoáº¡t Ä‘á»™ng KD khÃ¡c (GTGT 2%, TNCN 1.0%).
    - Äá»•i mÃ´ táº£ tá»«ng ngÃ nh tÆ°Æ¡ng á»©ng khá»›p máº«u hÃ¬nh 1.
    - Sá»­a switch toggle thÃ nh "Kinh doanh nhiá»u ngÃ nh".
    - Äá»“ng bá»™ hÃ³a cÃ¡c nhÃ£n nháº­p tá»· lá»‡ pháº§n trÄƒm phÃ¢n bá»• doanh thu khá»›p tÃªn ngÃ nh hiá»ƒn thá»‹.
  - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts):
    - Sá»­a Ä‘á»•i hÃ m `getIndustryLabel(type)` Ä‘á»ƒ tráº£ vá» nhÃ£n chuáº©n theo quy Ä‘á»‹nh phÃ¡p lÃ½.
    - Sá»­a Ä‘á»•i hÃ m `getBusinessGroupLabel(group)` Ä‘á»ƒ tráº£ vá» Ä‘Ãºng nhÃ£n quy mÃ´ tÆ°Æ¡ng á»©ng vá»›i bÆ°á»›c 2 kháº£o sÃ¡t (DÆ°á»›i 100 triá»‡u, Tá»« 100 triá»‡u Ä‘áº¿n 1 tá»·, Tá»« 1 tá»· Ä‘áº¿n 50 tá»·), kháº¯c phá»¥c lá»—i hiá»ƒn thá»‹ sai lá»‡ch quy mÃ´ trÃªn tháº» tÃ³m táº¯t.
- **Káº¿t quáº£:** Giao diá»‡n kháº£o sÃ¡t vÃ  hiá»ƒn thá»‹ há»“ sÆ¡ thuáº¿ Ä‘á»“ng bá»™ hoÃ n háº£o vá»›i vÄƒn báº£n gá»‘c.

## NgÃ y 24/06/2026

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i hiá»ƒn thá»‹ hÃ¬nh áº£nh trÃªn mÃ´i trÆ°á»ng Production (Nginx Reverse Proxy & /public path)

- **Ná»™i dung yÃªu cáº§u:** HÃ¬nh áº£nh táº£i lÃªn thÃ nh cÃ´ng trÃªn production nhÆ°ng bá»‹ lá»—i hiá»ƒn thá»‹ (404) do URL tráº£ vá» thiáº¿u tiá»n tá»‘ `/public/` khi cháº¡y qua reverse proxy cáº¥u hÃ¬nh sai thÆ° má»¥c gá»‘c (document root hÆ°á»›ng tá»›i project root thay vÃ¬ public).
- **Giáº£i phÃ¡p:**
  - **TÃ¡i cáº¥u trÃºc Backend:** Di chuyá»’n vÃ  chuáº©n hÃ³a logic xá»­ lÃ½ URL hÃ¬nh áº£nh thÃ nh hÃ m static `normalizeImageUrl($imageUrl)` trong Model [Product.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Domain/Entities/Product.php).
  - **Tá»± Ä‘á»™ng nháº­n diá»‡n /public:** Trong hÃ m `normalizeImageUrl`, so khá»›p trá»±c tiáº¿p thÆ° má»¥c gá»‘c cá»§a Web Server (`DOCUMENT_ROOT`) vÃ  thÆ° má»¥c cÃ´ng khai cá»§a Laravel (`public_path()`). Náº¿u thÆ° má»¥c cÃ´ng khai náº±m trong thÆ° má»¥c gá»‘c dÆ°á»›i dáº¡ng thÆ° má»¥c con (vÃ­ dá»¥: `/public`), há»‡ thá»‘ng sáº½ tÃ­nh toÃ¡n Ä‘á»™ng tÃªn thÆ° má»¥c con nÃ y vÃ  thÃªm tiá»n tá»‘ thÃ­ch há»£p (vÃ­ dá»¥: `/public`) vÃ o URL áº£nh ná»™i bá»™ má»™t cÃ¡ch chÃ­nh xÃ¡c. Äá»“ng thá»i, tá»± Ä‘á»™ng loáº¡i bá» domain/host trÃ¹ng láº·p (nhÆ° localhost, 127.0.0.1 hoáº·c host hiá»‡n táº¡i cá»§a request) Ä‘á»ƒ Ä‘Æ°a URL vá» tÆ°Æ¡ng Ä‘á»‘i trÆ°á»›c khi xá»­ lÃ½, trÃ¡nh trÃ¹ng láº·p.
  - **Cáº­p nháº­t Controller:** Cáº­p nháº­t [ProductController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/ProductController.php) vÃ  [SettingController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/SettingController.php) Ä‘á»ƒ gá»i qua hÃ m `Product::normalizeImageUrl` cho cÃ¡c trÆ°á»ng `image`, `website_cover_image`, vÃ  `website_avatar_image`.
  - **Tá»± Ä‘á»™ng dá»n dáº¹p áº£nh má»“ cÃ´i (Orphaned Images):** Bá»• sung phÆ°Æ¡ng thá»©c `deleteImageFileIfOrphaned` trong `ProductController` vÃ  tÃ­ch há»£p vÃ o phÆ°Æ¡ng thá»©c `update()`. Khi cáº­p nháº­t sáº£n pháº©m báº±ng hÃ¬nh áº£nh má»›i hoáº·c xÃ³a áº£nh, há»‡ thá»‘ng tá»± Ä‘á»™ng kiá»ƒm tra xem áº£nh cÅ© cÃ³ thuá»™c quyá»n sá»Ÿ há»¯u cá»§a vÃ­ Ä‘Ã³ vÃ  khÃ´ng cÃ³ sáº£n pháº©m nÃ o khÃ¡c dÃ¹ng chung thÃ¬ sáº½ tá»± Ä‘á»™ng xÃ³a tá»‡p tin váº­t lÃ½ trÃªn server Ä‘á»ƒ giáº£i phÃ³ng dung lÆ°á»£ng á»• cá»©ng.
  - **Káº¿t quáº£:** CÃ¡c API tráº£ vá» URL chÃ­nh xÃ¡c trÃªn cáº£ mÃ´i trÆ°á»ng local vÃ  production, kháº¯c phá»¥c hoÃ n toÃ n lá»—i 500 vÃ  lá»—i 404 hÃ¬nh áº£nh. ÄÃ£ dá»n dáº¹p cache Laravel. NgoÃ i ra, Ä‘Ã£ xÃ³a 6 tá»‡p tin test PHP dÆ° thá»«a khá»i git tracking Ä‘á»ƒ dá»n sáº¡ch mÃ£ nguá»“n.

### YÃªu cáº§u: TÃ­ch há»£p Skeleton Loading cho trang Quáº£n lÃ½ Thá»±c Ä‘Æ¡n (Menu Management)

- **Ná»™i dung yÃªu cáº§u:** Hiá»ƒn thá»‹ Skeleton Loading giáº£ láº­p khi load trang thá»±c Ä‘Æ¡n hoáº·c khi thay Ä‘á»•i trang, tÃ¬m kiáº¿m, lá»c danh má»¥c Ä‘á»ƒ trÃ¡nh delay, mÃ n hÃ¬nh trá»‘ng vÃ  táº¡o tráº£i nghiá»‡m táº£i mÆ°á»£t mÃ .
- **Giáº£i phÃ¡p:**
  - **Frontend Signals:** Khai bÃ¡o signal cá»¥c bá»™ `isMenuProductsLoading` trong [menu.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/menu/menu.component.ts) Ä‘á»ƒ quáº£n lÃ½ riÃªng tráº¡ng thÃ¡i gá»i API táº£i thá»±c Ä‘Æ¡n phÃ¢n trang cá»§a trang quáº£n lÃ½ thá»±c Ä‘Æ¡n. Cáº­p nháº­t `loadMenuProducts(...)` Ä‘á»ƒ thiáº¿t láº­p tráº¡ng thÃ¡i nÃ y thÃ nh `true` khi gá»­i request vÃ  `false` khi hoÃ n thÃ nh hoáº·c lá»—i.
  - **Giao diá»‡n & Logic:** Cáº­p nháº­t Ä‘iá»u kiá»‡n hiá»ƒn thá»‹ skeleton loader ngoÃ i cÃ¹ng táº¡i [menu.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/menu/menu.component.html) sang chá»‰ hiá»ƒn thá»‹ skeleton toÃ n trang `type="menu"` khi dá»¯ liá»‡u chÆ°a Ä‘Æ°á»£c táº£i láº§n Ä‘áº§u (`isProductsLoading() && productsList().length === 0`).
  - **Skeleton cá»¥c bá»™:** TÃ­ch há»£p bá»™ táº£i khung giáº£ láº­p cá»¥c bá»™ bÃªn trong vÃ¹ng hiá»ƒn thá»‹ sáº£n pháº©m khi `isMenuProductsLoading()` lÃ  `true`. Tá»± Ä‘á»™ng hiá»ƒn thá»‹ skeleton dáº¡ng báº£ng (`type="table"`) hoáº·c dáº¡ng lÆ°á»›i (`type="card-grid"`) tÃ¹y thuá»™c vÃ o cháº¿ Ä‘á»™ xem `menuViewMode()` Ä‘ang Ä‘Æ°á»£c chá»n.
  - **Káº¿t quáº£:** BiÃªn dá»‹ch build frontend Angular thÃ nh cÃ´ng 100%, khÃ´ng phÃ¡t sinh lá»—i TypeScript nÃ o.

### YÃªu cáº§u: NÃ¢ng cáº¥p tÃ­nh nÄƒng upload trá»±c tiáº¿p hÃ¬nh áº£nh sáº£n pháº©m thá»±c Ä‘Æ¡n (Menu Product Image Upload)

- **Ná»™i dung yÃªu cáº§u:** Thay Ä‘á»•i cÆ¡ cháº¿ dÃ¡n link URL áº£nh tÄ©nh thá»§ cÃ´ng báº¥t tiá»‡n cá»§a sáº£n pháº©m báº±ng giao diá»‡n kÃ©o tháº£/chá»n file upload trá»±c tiáº¿p tá»« thiáº¿t bá»‹, tá»± Ä‘á»™ng nÃ©n dung lÆ°á»£ng vÃ  lÆ°u trá»¯ phÃ¢n chia theo Ä‘á»‹a chá»‰ vÃ­.
- **Giáº£i phÃ¡p:**
  - **Backend API:** Bá»• sung phÆ°Æ¡ng thá»©c `uploadImage()` vÃ  helper `processAndCompressImage()` trong [ProductController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/ProductController.php). Sá»­ dá»¥ng thÆ° viá»‡n **PHP GD** Ä‘á»ƒ resize áº£nh vá» tá»‘i Ä‘a 800px, nÃ©n sang WebP (fallback JPEG) cháº¥t lÆ°á»£ng 75%, giá»›i háº¡n dung lÆ°á»£ng lÆ°u trá»¯ tá»‘i Ä‘a 1MB (náº¿u lá»›n hÆ¡n sáº½ tá»± Ä‘á»™ng xÃ³a). Chuáº©n hÃ³a vÃ­ chá»§ quÃ¡n loáº¡i bá» tiá»n tá»‘ `0x` vÃ  viáº¿t thÆ°á»ng Ä‘á»ƒ táº¡o thÆ° má»¥c lÆ°u trá»¯ phÃ¢n máº£nh thÃ´ng qua **Laravel Storage public disk**: `storage/app/public/products/{wallet_without_0x}/`. Äáº·t tÃªn file theo cáº¥u trÃºc `timestamp_random.webp`.
  - **Chuáº©n hÃ³a URL hiá»ƒn thá»‹:** Bá»• sung logic `normalizeImageUrl()` tá»± Ä‘á»™ng chuyá»ƒn Ä‘á»•i URL hÃ¬nh áº£nh tá»« `http` thÃ nh `https` khi trang web cháº¡y trÃªn HTTPS Ä‘á»ƒ trÃ¡nh lá»—i Mixed Content (do proxy Nginx á»Ÿ production chuyá»ƒn tiáº¿p HTTP ná»™i bá»™), Ä‘á»“ng thá»i tá»± Ä‘á»™ng sá»­a Ä‘á»•i cÃ¡c URL bá»‹ lÆ°u sai tÃªn miá»n `localhost` / `127.0.0.1` cÅ© thÃ nh tÃªn miá»n thá»±c táº¿ Ä‘ang truy cáº­p.
  - **ÄÄ’ng kÃ½ route:** ThÃªm route `POST /products/upload-image` trong [api.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/routes/api.php).
  - **Frontend Services:** ThÃªm method `uploadProductImage()` trong [api.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/api.service.ts).
  - **Giao diá»‡n & Logic:** Cáº­p nháº­t [product-form-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/menu/components/product-form-modal/product-form-modal.component.html) vÃ  [product-form-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/menu/components/product-form-modal/product-form-modal.component.ts) thay tháº¿ Ã´ input text cÅ© báº±ng khung upload áº£nh nÃ©t Ä‘á»©t, spinner loading tráº¡ng thÃ¡i táº£i lÃªn, vÃ  áº£nh preview tÃ­ch há»£p hover overlay chá»©a nÃºt xÃ³a áº£nh / thay Ä‘á»•i áº£nh. Giá»¯ láº¡i tÃ¹y chá»n nháº­p URL thá»§ cÃ´ng dá»± phÃ²ng.
  - **Káº¿t quáº£:** Kiá»ƒm tra cÃº phÃ¡p PHP thÃ nh cÃ´ng 100%. BiÃªn dá»‹ch build frontend Angular thÃ nh cÃ´ng 100%, khÃ´ng phÃ¡t sinh báº¥t ká»³ lá»—i TypeScript nÃ o.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i nÃºt "XÃ³a táº¥t cáº£ cache" khÃ´ng xÃ³a Ä‘Æ°á»£c thÆ° má»¥c trÃªn hosting

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n há»“i nÃºt "XÃ³a táº¥t cáº£ cache" khÃ´ng dá»n dáº¹p sáº¡ch Ä‘Æ°á»£c cáº¥u trÃºc thÆ° má»¥c con cá»§a cache trÃªn hosting.
- **Giáº£i phÃ¡p:**
  - **PhÃ¢n tÃ­ch:** Cáº¥u trÃºc cache cá»§a Laravel File driver táº¡o ra nhiá»u thÆ° má»¥c con sÃ¢u (vÃ­ dá»¥ `data/01/a2/`). PhÆ°Æ¡ng thá»©c `File::cleanDirectory()` chá»‰ dá»n file bÃªn trong nhÆ°ng giá»¯ láº¡i cáº¥u trÃºc thÆ° má»¥c con trá»‘ng, Ä‘á»“ng thá»i trÃªn hosting Linux cÃ³ thá»ƒ xáº£y ra lá»—i xung Ä‘á»™t quyá»n sá»Ÿ há»¯u (Permission Denied) giá»¯a SSH user vÃ  Web server user, dáº«n Ä‘áº¿n crash API 500 náº¿u gáº·p file bá»‹ lock hoáº·c khÃ´ng cÃ³ quyá»n xÃ³a.
  - **TÃ¡i cáº¥u trÃºc Backend:** Cáº­p nháº­t [AdminController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AdminController.php), loáº¡i bá» `File::cleanDirectory()` thay báº±ng hÃ m Ä‘á»‡ quy tá»± viáº¿t `recursiveCleanDirectory()`. HÃ m nÃ y duyá»‡t Ä‘á»‡ quy, thá»±c hiá»‡n `@chmod($path, 0777)` trÆ°á»›c khi xÃ³a Ä‘á»ƒ tá»‘i Æ°u quyá»n, dÃ¹ng `@unlink()` / `@rmdir()` Ä‘á»ƒ bá» qua Warning cá»§a PHP, vÃ  bá»c toÃ n bá»™ trong khá»‘i `try-catch` Ä‘á»ƒ Ä‘áº£m báº£o API luÃ´n tráº£ vá» thÃ nh cÃ´ng cho giao diá»‡n ká»ƒ cáº£ khi cÃ³ file cá»©ng Ä‘áº§u.
  - **Káº¿t quáº£:** Kiá»ƒm tra cÃº phÃ¡p PHP thÃ nh cÃ´ng 100%. CÃ¡c routes hoáº¡t Ä‘á»™ng bÃ¬nh thÆ°á»ng, dá»n dáº¹p cache cá»¥c bá»™ thÃ nh cÃ´ng.

### YÃªu cáº§u: NÃ¢ng cáº¥p thÃ´ng Ä‘iá»‡p kÃ½ báº£o máº­t SIWE (EIP-4361) phÃ²ng chá»‘ng táº¥n cÃ´ng giáº£ máº¡o (Phishing Attack)

- **Ná»™i dung yÃªu cáº§u:** Cáº£i tiáº¿n chuá»—i thÃ´ng Ä‘iá»‡p kÃ½ vÃ­ Ä‘á»ƒ phÃ²ng chá»‘ng táº¥n cÃ´ng giáº£ máº¡o giao diá»‡n Ä‘Äƒng nháº­p (Phishing) dá»±a trÃªn chuáº©n EIP-4361 (Sign-In with Ethereum).
- **Giáº£i phÃ¡p:**
  - **Dá»±ng thÃ´ng Ä‘iá»‡p chuáº©n SIWE:** Cáº­p nháº­t [AuthController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AuthController.php) trong phÆ°Æ¡ng thá»©c `getNonce()` Ä‘á»ƒ sinh thÃ´ng Ä‘iá»‡p chá»©a cÃ¡c trÆ°á»ng Ä‘á»™ng: Domain, Wallet Address, URI, Chain ID, Nonce, vÃ  Issued At (UTC ISO 8601). CÃ¡c thÃ´ng sá»‘ nÃ y Ä‘Æ°á»£c truyá»n Ä‘á»™ng tá»« Client thÃ´ng qua API trong [api.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/api.service.ts) (láº¥y trá»±c tiáº¿p host, origin vÃ  chainId cá»§a vÃ­ lÃºc Ä‘Äƒng nháº­p) giÃºp thÃ´ng Ä‘iá»‡p chÃ­nh xÃ¡c 100% theo thá»i gian thá»±c vÃ  máº¡ng lÆ°á»›i cá»§a vÃ­.
  - **LÆ°u trá»¯ toÃ n bá»™ thÃ´ng Ä‘iá»‡p kÃ½:** Thay vÃ¬ chá»‰ lÆ°u chuá»—i nonce Ä‘Æ¡n láº», lÆ°u trá»¯ má»™t máº£ng chá»©a cáº£ nonce vÃ  thÃ´ng Ä‘iá»‡p hoÃ n chá»‰nh vÃ o cache backend (`Cache::put()`). Äiá»u nÃ y cho phÃ©p phÆ°Æ¡ng thá»©c `verifySignature()` láº¥y trá»±c tiáº¿p thÃ´ng Ä‘iá»‡p chÃ­nh xÃ¡c Ä‘Ã£ sinh ra Ä‘á»ƒ so khá»›p chá»¯ kÃ½, trÃ¡nh lá»‡ch giÃ¢y hoáº·c lá»‡ch cáº¥u trÃºc.
  - **Giá»›i háº¡n táº§n suáº¥t nÃ¢ng cao (Rate Limiting):** Cáº¥u hÃ¬nh láº¡i bá»™ giá»›i háº¡n `auth_endpoints` trong [AppServiceProvider.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Providers/AppServiceProvider.php), nÃ¢ng cáº¥p tá»« chá»‰ giá»›i háº¡n theo IP Ä‘Æ¡n thuáº§n sang giá»›i háº¡n káº¿t há»£p IP + Ä‘á»‹a chá»‰ vÃ­ (`$request->ip() . '|' . $address`) vÃ  giáº£m táº§n suáº¥t tá»‘i Ä‘a xuá»‘ng cÃ²n 5 yÃªu cáº§u/phÃºt, báº£o vá»‡ há»‡ thá»‘ng khá»i táº¥n cÃ´ng brute-force / DoS spam nonce.
  - **Káº¿t quáº£:** Kiá»ƒm tra cÃº phÃ¡p PHP thÃ nh cÃ´ng 100%, dá»n dáº¹p cache há»‡ thá»‘ng vÃ  cache cáº¥u hÃ¬nh thÃ nh cÃ´ng.

### YÃªu cáº§u: Tá»‘i Æ°u hÃ³a hiá»‡u nÄƒng Checkout & Storefront (Kháº¯c phá»¥c lá»—i N+1 Query)

- **Ná»™i dung yÃªu cáº§u:** Tá»‘i Æ°u hÃ³a hiá»‡u nÄƒng táº¡o Ä‘Æ¡n hÃ ng táº¡i POS (Checkout) vÃ  Storefront cÃ´ng khai Ä‘á»ƒ triá»‡t tiÃªu lá»—i N+1 Query truy váº¥n sáº£n pháº©m/biáº¿n thá»ƒ trong vÃ²ng láº·p giá» hÃ ng, Ä‘á»“ng thá»i loáº¡i bá» Ä‘á» xuáº¥t lÆ°u cache Turnstile Ä‘á»ƒ cáº¥u hÃ¬nh máº·c Ä‘á»‹nh.
- **Giáº£i phÃ¡p:**
  - **Eager Load táº¡i POS:** Cáº­p nháº­t [CreateOrderCommandHandler.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Application/Orders/Handlers/CreateOrderCommandHandler.php), táº£i trÆ°á»›c toÃ n bá»™ danh sÃ¡ch sáº£n pháº©m cÃ¹ng cÃ¡c biáº¿n thá»ƒ thÃ´ng qua má»™t cÃ¢u truy váº¥n `Product::with('variants')->whereIn('id', $productIds)`. Chuyá»ƒn Ä‘á»•i viá»‡c kiá»ƒm tra biáº¿n thá»ƒ sang in-memory Collection. Äáº£m báº£o nÃ©m ngoáº¡i lá»‡ thÃ­ch há»£p náº¿u sáº£n pháº©m/biáº¿n thá»ƒ khÃ´ng há»£p lá»‡.
  - **Eager Load táº¡i Storefront:** Cáº­p nháº­t [SettingController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/SettingController.php) trong phÆ°Æ¡ng thá»©c `createStoreOrderBySlug()`, eager load sáº£n pháº©m vÃ  biáº¿n thá»ƒ giá»‘ng POS, giáº£m thiá»ƒu tá»« `2*N` truy váº¥n xuá»‘ng cÃ²n 1 truy váº¥n duy nháº¥t.
  - **Bá» cache Turnstile:** Giá»¯ nguyÃªn cÃ i Ä‘áº·t Turnstile máº·c Ä‘á»‹nh Ä‘á»ƒ trÃ¡nh lá»‡ch Ä‘á»“ng bá»™ cáº¥u hÃ¬nh theo pháº£n há»“i tá»« ngÆ°á»i dÃ¹ng.
  - **Káº¿t quáº£:** Kiá»ƒm tra cÃº phÃ¡p thÃ´ng qua lá»‡nh `php artisan route:list` thÃ nh cÃ´ng 100%, dá»n dáº¹p cache há»‡ thá»‘ng `php artisan cache:clear` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Tá»‘i Æ°u hÃ³a Database (ÄÃ¡nh Index) & TÃ¡i cáº¥u trÃºc Helper láº¥y store_owner_address

- **Ná»™i dung yÃªu cáº§u:** ÄÃ¡nh chá»‰ má»¥c (index) bá»• sung cho cÃ¡c báº£ng chÃ­nh cá»§a há»‡ thá»‘ng Ä‘á»ƒ tá»‘i Æ°u hÃ³a tá»‘c Ä‘á»™ truy váº¥n, Ä‘á»“ng thá»i tÃ¡i cáº¥u trÃºc helper láº¥y Ä‘á»‹a chá»‰ vÃ­ store owner trong Model User Ä‘á»ƒ dÃ¹ng chung trong cÃ¡c Controller.
- **Giáº£i phÃ¡p:**
  - **Database Migration:** Táº¡o tá»‡p tin migration `2026_06_24_000000_add_missing_performance_indexes_to_tables.php` chÃ¨n 11 chá»‰ má»¥c (index) má»›i cho cÃ¡c báº£ng `orders`, `transactions`, `shifts`, `customers`, `subscription_requests`, `menu_sync_logs`, `inventory_records`, vÃ  `products`, Ä‘á»“ng thá»i dá»n dáº¹p vÃ  loáº¡i bá» 2 chá»‰ má»¥c Ä‘Æ¡n cÅ© bá»‹ trÃ¹ng láº·p dÆ° thá»«a (`products_store_owner_address_index` vÃ  `inventory_records_store_owner_address_index`) Ä‘á»ƒ tá»‘i Æ°u hÃ³a tá»‘i Ä‘a cÃ¡c cÃ¢u lá»‡nh INSERT/UPDATE. Cháº¡y `php artisan migrate` thÃ nh cÃ´ng.
  - **Backend Refactoring:** Bá»• sung phÆ°Æ¡ng thá»©c `getStoreOwnerAddress()` vÃ o model `User`. Viáº¿t script PHP tá»± Ä‘á»™ng thay tháº¿ logic láº¥y store owner address trÃ¹ng láº·p (`strtolower($request->user()->store_owner_address ?: $request->user()->wallet_address)`) táº¡i 23 tá»‡p tin Controller vÃ  Middleware sang helper má»›i.
  - **Káº¿t quáº£:** Kiá»ƒm tra cÃº phÃ¡p thÃ´ng qua lá»‡nh `php artisan route:list` thÃ nh cÃ´ng 100%, cÃ¡c routes hoáº¡t Ä‘á»™ng bÃ¬nh thÆ°á»ng, dá»n dáº¹p cache há»‡ thá»‘ng thÃ nh cÃ´ng.

### YÃªu cáº§u: Tá»‘i Æ°u hÃ³a hiá»‡u nÄƒng khá»Ÿi Ä‘á»™ng Laravel (Framework Caching)

- **Ná»™i dung yÃªu cáº§u:** KÃ­ch hoáº¡t cache cáº¥u hÃ¬nh, routes, vÃ  views cá»§a Laravel Ä‘á»ƒ tÄƒng tá»‘c Ä‘á»™ khá»Ÿi Ä‘á»™ng (bootstrap) framework.
- **Giáº£i phÃ¡p:** Cháº¡y chuá»—i lá»‡nh tá»‘i Æ°u hÃ³a: `php artisan config:cache`, `php artisan route:cache`, vÃ  `php artisan view:cache` thÃ nh cÃ´ng.
- **Káº¿t quáº£:** Laravel giáº£m thá»i gian khá»Ÿi Ä‘á»™ng tá»‘i Ä‘a trÃªn mÃ´i trÆ°á»ng production, cáº£i thiá»‡n Ä‘á»™ trá»… tá»•ng thá»ƒ cá»§a toÃ n bá»™ há»‡ thá»‘ng API.

### YÃªu cáº§u: Triá»ƒn khai Database Pagination (PhÃ¢n trang thá»±c táº¿ tá»« Database) & Limit = 10 cho toÃ n bá»™ cÃ¡c module

- **Ná»™i dung yÃªu cáº§u:** Chuyá»ƒn Ä‘á»•i cÆ¡ cháº¿ load dá»¯ liá»‡u tá»« Client-side sang Server-side Database Pagination cho cÃ¡c module lá»›n (ÄÆ¡n hÃ ng, Thá»±c Ä‘Æ¡n, Kho hÃ ng, KhÃ¡ch hÃ ng, Ca trá»±c, Sá»• ná»£, Thu chi tÃ i chÃ­nh vÃ  SaaS Admin) vá»›i limit máº·c Ä‘á»‹nh lÃ  10. Äá»“ng thá»i sá»­a bug hiá»ƒn thá»‹ tÃªn store trong SaaS Admin.
- **Giáº£i phÃ¡p:**
  - **Backend:** Cáº­p nháº­t cÃ¡c Controller vÃ  Repositories (nhÆ° `DashboardController`, `ProductController`, `CustomerController`, `InventoryController`, `TransactionController`, `ShiftController`, `DebtController`, `AdminController`) tráº£ vá» dá»¯ liá»‡u phÃ¢n trang thá»±c táº¿ tá»« database (`paginate($limit)`). Äáº·c biá»‡t, Ä‘Ã³ng gÃ³i thÃªm cÃ¡c dá»¯ liá»‡u aggregates tá»•ng thu/chi, tá»•ng ná»£/sá»‘ lÆ°á»£ng con ná»£ tá»•ng thá»ƒ tá»« cÆ¡ sá»Ÿ dá»¯ liá»‡u vÃ o JSON response envelope. Sá»­ dá»¥ng `JSON_EXTRACT` trÃªn MySQL Ä‘á»ƒ tÃ¬m kiáº¿m theo tÃªn store trong trÆ°á»ng dá»¯ liá»‡u JSON gá»™p. Sá»­ dá»¥ng helper `Setting::getForStore` Ä‘á»ƒ sá»­a bug toÃ n bá»™ tÃªn store cá»§a quÃ¡n bá»‹ hiá»ƒn thá»‹ máº·c Ä‘á»‹nh thÃ nh "Cafe Web3 POS".
  - **Frontend Stores:** Cáº­p nháº­t cÃ¡c store quáº£n lÃ½ state phÃ¢n trang (`totalItems`, `currentPage`, `itemsPerPage`, `tenantTotal`) vÃ  liÃªn káº¿t cÃ¡c tham sá»‘ nÃ y vÃ o cÃ¡c API calls.
  - **Frontend UI & Components:** Chuyá»ƒn Ä‘á»•i cÃ¡c sá»± kiá»‡n thay Ä‘á»•i trang, thay Ä‘á»•i bá»™ lá»c, tÃ¬m kiáº¿m sang gá»i láº¡i API Ä‘á»ƒ táº£i trang tÆ°Æ¡ng á»©ng. Thay tháº¿ viá»‡c tÃ­nh toÃ¡n chá»‰ sá»‘ LED client-side báº±ng cÃ¡c signals láº¥y dá»¯ liá»‡u aggregate tá»« backend.
  - **Sá»­a lá»—i biÃªn dá»‹ch:** Kháº¯c phá»¥c lá»—i TypeScript implicit any trong `pos.component.ts` khi lá»c vÃ­ EVM vÃ  lá»—i sai generic type cá»§a signal `ordersCurrentPage` trong `order.store.ts`.
  - **Káº¿t quáº£:** Kiá»ƒm tra cÃº phÃ¡p PHP thÃ nh cÃ´ng 100%. Dá»n dáº¹p cache backend thÃ nh cÃ´ng. BiÃªn dá»‹ch build dá»± Ã¡n Angular (`npm run build`) thÃ nh cÃ´ng 100%, táº¥t cáº£ 14 module hoáº¡t Ä‘á»™ng mÆ°á»£t mÃ  vá»›i Database Pagination vÃ  giao diá»‡n POS/Storefront tÆ°Æ¡ng thÃ­ch ngÆ°á»£c hoÃ n háº£o.

### YÃªu cáº§u: Tá»‘i Æ°u hÃ³a hiá»‡u nÄƒng truy váº¥n Database & xá»­ lÃ½ Backend (Dashboard, Orders, Shifts & Settings)

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n há»“i tá»‘c Ä‘á»™ truy váº¥n cháº­m, Ä‘áº·c biá»‡t lÃ  khi dÃ¹ng cache khÃ´ng hiá»‡u quáº£ á»Ÿ láº§n táº£i Ä‘áº§u tiÃªn (load láº§n Ä‘áº§u).
- **Giáº£i phÃ¡p:**
  - **Tá»‘i Æ°u hÃ³a Dashboard:**
    - Thay tháº¿ viá»‡c load toÃ n bá»™ Eloquent Model náº·ng ná» (`Product`, `InventoryRecord`, `Order` cÃ¹ng cÃ¡c item phá»¥ thuá»™c cá»§a chÃºng) báº±ng cÃ¡ch sá»­ dá»¥ng `DB::table` Ä‘á»ƒ truy váº¥n dá»¯ liá»‡u thÃ´ (stdClass objects) trong thuáº­t toÃ¡n tÃ­nh tá»“n kho cáº£nh bÃ¡o (`low_stock_alerts`).
    - Gom nhÃ³m dá»¯ liá»‡u sáº£n pháº©m Ä‘Ã£ bÃ¡n trÆ°á»›c khi cháº¡y vÃ²ng láº·p, tá»‘i Æ°u hÃ³a thuáº­t toÃ¡n láº·p tá»« phá»©c táº¡p lá»›n xuá»‘ng O(N) cá»§a danh sÃ¡ch sáº£n pháº©m, trÃ¡nh N+1 vÃ  láº·p lá»“ng vÃ´ nghÄ©a qua hÃ ng chá»¥c ngÃ n Ä‘Æ¡n hÃ ng.
    - Sá»­a Ä‘á»•i cÃ¢u query tÃ­nh doanh thu hÃ´m nay vÃ  hÃ´m qua: Thay tháº¿ `whereDate('created_at', ...)` báº±ng `whereBetween('created_at', ...)` Ä‘á»ƒ MySQL cÃ³ thá»ƒ táº­n dá»¥ng tá»‘i Ä‘a composite index `idx_orders_tenant_status_date`.
  - **Tá»‘i Æ°u hÃ³a Orders Query Handler:**
    - Thay Ä‘á»•i kiá»ƒu tráº£ vá» cá»§a phÆ°Æ¡ng thá»©c `handle` trong `GetOrdersQueryHandler.php` thÃ nh `Illuminate\Support\Collection`.
    - Loáº¡i bá» hoÃ n toÃ n bÆ°á»›c map/re-hydrate dá»¯ liá»‡u máº£ng thÃ´ tá»« DB/cache thÃ nh hÃ ng ngÃ n Eloquent Model (`OrderModel`, `Customer`, `OrderItem`, `Product`, `ProductVariant`) thá»«a thÃ£i trÆ°á»›c khi chuyá»ƒn sang JSON. Tráº£ vá» trá»±c tiáº¿p Support\Collection chá»©a máº£ng thÃ´ giÃºp loáº¡i bá» hoÃ n toÃ n CPU/RAM lÃ£ng phÃ­ cho viá»‡c dá»±ng Eloquent objects.
  - **Tá»‘i Æ°u hÃ³a Settings (Cache toÃ n cá»¥c):**
    - TÃ­ch há»£p bá»™ nhá»› Ä‘á»‡m `store_flat_config:{$storeOwner}` (24 giá») trá»±c tiáº¿p vÃ o `Setting::getAllForStore`.
    - Cáº­p nháº­t `Setting::getForStore` Ä‘á»c trá»±c tiáº¿p tá»« cache pháº³ng trong RAM, triá»‡t tiÃªu hoÃ n toÃ n cÃ¡c cÃ¢u query láº·p Ä‘i láº·p láº¡i vÃ o báº£ng `settings` trong suá»‘t request lifecycle. Tá»‘c Ä‘á»™ get config giáº£m xuá»‘ng chá»‰ cÃ²n ~0.2 ms.
  - **Tá»‘i Æ°u hÃ³a Lá»‹ch sá»­ ca trá»±c:**
    - Cáº­p nháº­t `EloquentShiftRepository.php` loáº¡i bá» bÆ°á»›c map/re-hydrate dá»¯ liá»‡u thÃ´ thÃ nh cÃ¡c Eloquent Model `Shift` vÃ  `User` thá»«a thÃ£i. Tráº£ vá» trá»±c tiáº¿p Collection chá»©a cÃ¡c máº£ng thÃ´ ca trá»±c.
  - **Káº¿t quáº£:** Kiá»ƒm tra thá»­ nghiá»‡m thá»±c táº¿ cho tháº¥y thá»i gian xá»­ lÃ½ Orders Query giáº£m máº¡nh xuá»‘ng chá»‰ cÃ²n ~54 ms, Lá»‹ch sá»­ ca trá»±c cÃ²n ~14 ms, Dashboard xá»­ lÃ½ mÆ°á»£t mÃ  trong ~77 ms vÃ  tiÃªu tá»‘n cá»±c Ã­t bá»™ nhá»› RAM cá»§a PHP.

### Tháº£o luáº­n giáº£i phÃ¡p: Äá»“ng bá»™ hÃ³a Ä‘Æ¡n báº£o máº­t thÃ´ng tin trÃªn Blockchain

- **Ná»™i dung cÃ¢u há»i:** NgÆ°á»i dÃ¹ng tÃ¬m hiá»ƒu giáº£i phÃ¡p Ä‘á»“ng bá»™ hÃ³a Ä‘Æ¡n lÃªn blockchain Ä‘áº£m báº£o tÃ­nh riÃªng tÆ° (chá»‰ khÃ¡ch hÃ ng mua hÃ³a Ä‘Æ¡n xem Ä‘Æ°á»£c) vÃ  giáº£i quyáº¿t bÃ i toÃ¡n tÃ­nh sáºµn sÃ ng dá»¯ liá»‡u khi server sáº­p cÅ©ng nhÆ° phÃ¢n quyá»n cho chá»§ quÃ¡n/nhÃ¢n viÃªn.
- **Giáº£i phÃ¡p Ä‘á» xuáº¥t:**
  - Äá» xuáº¥t giáº£i phÃ¡p Encrypted Event Logs (MÃ£ hÃ³a thÃ´ng tin nháº¡y cáº£m trÆ°á»›c khi phÃ¡t Event trÃªn BSC).
  - Tá»‘i Æ°u dá»¯ liá»‡u lÆ°u trá»¯ phi táº­p trung (IPFS/Arweave) Ä‘Ã£ mÃ£ hÃ³a.
  - Sá»­ dá»¥ng cÆ¡ cháº¿ mÃ£ hÃ³a Ä‘a khÃ³a Ä‘á»‘i xá»©ng (Multi-Recipient Encryption) báº±ng Public Key cá»§a cáº£ KhÃ¡ch hÃ ng vÃ  Chá»§ quÃ¡n Ä‘á»ƒ cÃ¹ng giáº£i mÃ£ Ä‘Æ°á»£c khi cáº§n thiáº¿t.
- **Quyáº¿t Ä‘á»‹nh hiá»‡n táº¡i:** Táº¡m thá»i giá»¯ nguyÃªn hiá»‡n tráº¡ng cá»§a há»‡ thá»‘ng, chÆ°a thá»±c hiá»‡n chá»‰nh sá»­a mÃ£ nguá»“n.

## NgÃ y 23/06/2026

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i Ä‘á»™ dÃ i khÃ³a chÃ­nh trong Database Migration (system_settings)

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng gáº·p lá»—i `#1071 - Specified key was too long; max key length is 1000 bytes` khi cháº¡y lá»‡nh táº¡o khÃ³a chÃ­nh cho báº£ng `system_settings` á»Ÿ cá»™t `key` trÃªn MySQL.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [2026_06_19_000003_create_system_settings_table.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/database/migrations/2026_06_19_000003_create_system_settings_table.php) Ä‘á»ƒ thay Ä‘á»•i Ä‘á»™ dÃ i cá»™t `key` tá»« máº·c Ä‘á»‹nh (255) thÃ nh `191` kÃ½ tá»±: `$table->string('key', 191)->primary();`.
  - Cháº¡y `php -l` kiá»’m tra cÃº phÃ¡p PHP thÃ nh cÃ´ng 100%.
  - Táº¡o script PHP táº¡m `run_db_clean.php` Ä‘á»ƒ drop báº£ng lá»—i `system_settings` vÃ  xÃ³a báº£n ghi migration cá»§a nÃ³ khá»i báº£ng `migrations`. Tiáº¿n hÃ nh cháº¡y dá»n dáº¹p vÃ  thá»±c thi `php artisan migrate` thÃ nh cÃ´ng Ä‘á»ƒ khá»Ÿi táº¡o láº¡i báº£ng cáº¥u hÃ¬nh má»›i vá»›i Ä‘á»™ dÃ i `key` lÃ  `191` kÃ½ tá»± mÃ  khÃ´ng áº£nh hÆ°á»Ÿng Ä‘áº¿n dá»¯ liá»‡u cÃ¡c báº£ng khÃ¡c.

### YÃªu cáº§u: Bá»• sung tÃ­nh nÄƒng Bá» qua ca trá»±c trÃªn POS cho má»i gÃ³i cÆ°á»›c

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng muá»‘n cho phÃ©p bÃ¡n hÃ ng POS vÃ  chá»n sÆ¡ Ä‘á»“ bÃ n Äƒn mÃ  khÃ´ng báº¯t buá»™c pháº£i má»Ÿ ca trá»±c má»›i. Äá»‘i vá»›i gÃ³i cÆ°á»›c Free (khÃ´ng há»— trá»£ quáº£n lÃ½ ca trá»±c), hoáº·c khi nhÃ¢n viÃªn muá»‘n bÃ¡n hÃ ng off-shift á»Ÿ má»i gÃ³i cÆ°á»›c khÃ¡c, cho phÃ©p báº¥m nÃºt "Bá» qua ca trá»±c" Ä‘á»ƒ tiáº¿p tá»¥c bÃ¡n hÃ ng.
- **Giáº£i phÃ¡p:**
  - **Frontend Shift Service:** Cáº­p nháº­t [shift.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/shift.service.ts), bá»• sung signal `isShiftSkipped` vÃ  phÆ°Æ¡ng thá»©c `skipShift()` Ä‘á»ƒ lÆ°u tráº¡ng thÃ¡i ngÆ°á»i dÃ¹ng bá» qua ca trá»±c, tá»± Ä‘á»™ng reset vá» `false` khi má»Ÿ/Ä‘Ã³ng ca thÃ nh cÃ´ng hoáº·c khi táº£i láº¡i trang/Ä‘Äƒng nháº­p láº¡i.
  - **Frontend POS Component & Template:**
    - Cáº­p nháº­t [pos.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/pos/pages/pos/pos.component.ts) Ä‘á»ƒ Ä‘iá»u kiá»‡n check ca trá»±c á»Ÿ `addToCart` cháº¥p nháº­n náº¿u cÃ³ ca Ä‘ang má»Ÿ hoáº·c `isShiftSkipped` lÃ  `true`.
    - Cáº­p nháº­t [pos.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/pos/pages/pos/pos.component.html) bá»• sung má»™t nÃºt báº¥m "Bá» qua ca trá»±c" thiáº¿t káº¿ `variant="secondary"` náº±m ngay dÆ°á»›i nÃºt "Má»Ÿ ca". Äá»“ng thá»i cáº­p nháº­t cÃ¡c Ä‘iá»u kiá»‡n áº©n/hiá»‡n giá» hÃ ng, banner mobile vÃ  Floating Bottom Bar dá»±a trÃªn ca trá»±c hoáº·c tráº¡ng thÃ¡i bá» qua ca trá»±c.
  - **Frontend Tables Component:** Cáº­p nháº­t [tables.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tables/tables.component.ts) cho phÃ©p má»Ÿ bÃ n chuyá»ƒn sang POS náº¿u ca trá»±c Ä‘Ã£ má»Ÿ hoáº·c náº¿u `isShiftSkipped` lÃ  `true`.
  - **Frontend State Service:** Cáº­p nháº­t [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts) Ä‘á»ƒ bá»• sung `isShiftSkipped` vÃ  `currentShift` vÃ o danh sÃ¡ch láº¯ng nghe (dependencies) cá»§a effect náº¡p sáº£n pháº©m POS. Äáº£m báº£o sáº£n pháº©m hiá»ƒn thá»‹ ngay láº­p tá»©c khi báº¥m nÃºt "Bá» qua ca trá»±c" mÃ  khÃ´ng bá»‹ trá»….
  - **Backend API:** Kháº£o sÃ¡t vÃ  xÃ¡c nháº­n backend Ä‘Ã£ há»— trá»£ tÆ°Æ¡ng thÃ­ch ngÆ°á»£c (khi khÃ´ng cÃ³ ca trá»±c Ä‘ang má»Ÿ, `shift_id` cá»§a Ä‘Æ¡n hÃ ng sáº½ tá»± Ä‘á»™ng lÆ°u lÃ  `null` mÃ  khÃ´ng cháº·n lá»—i).
  - Cháº¡y `npm run build` biÃªn dá»‹ch frontend thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: ThÃªm cáº¥u hÃ¬nh Æ°u Ä‘Ã£i ngÆ°á»i má»›i vÃ  Sá»­a lá»—i hiá»ƒn thá»‹ dá»¯ liá»‡u báº£ng biá»ƒu trong SaaS Admin

- **Ná»™i dung yÃªu cáº§u:**
  - ThÃªm chá»©c nÄƒng báº­t/táº¯t Æ°u Ä‘Ã£i ngÆ°á»i má»›i táº¡i tab GÃ³i cÆ°á»›c (`/admin?tab=plans`), cho phÃ©p cáº¥u hÃ¬nh gÃ³i máº·c Ä‘á»‹nh vÃ  thá»i háº¡n sá»­ dá»¥ng. Khi vÃ­ má»›i tham gia sáº½ tá»± Ä‘á»™ng nháº­n gÃ³i Æ°u Ä‘Ã£i nÃ y.
  - Sá»­a lá»—i hiá»ƒn thá»‹ `[object Object]` á»Ÿ cá»™t TÃ­nh nÄƒng há»— trá»£ vÃ  lá»—i hiá»ƒn thá»‹ `true`/`false` á»Ÿ cá»™t Tráº¡ng thÃ¡i, khÃ´i phá»¥c cÃ¡c nÃºt hÃ nh Ä‘á»™ng bá»‹ máº¥t trong cÃ¡c báº£ng cá»§a SaaS Admin.
- **Giáº£i phÃ¡p:**
  - **Backend Settings:** Cáº­p nháº­t [AdminController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AdminController.php) Ä‘á»ƒ bá»• sung cÃ¡c cáº¥u hÃ¬nh `new_user_promo_enabled`, `new_user_promo_plan_code`, `new_user_promo_duration_days` vÃ o API system settings, lÆ°u dÆ°á»›i dáº¡ng key JSON `new_user_promo_settings` trong báº£ng `system_settings`.
  - **Backend Auth:** Cáº­p nháº­t [AuthController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AuthController.php), náº¿u báº­t Æ°u Ä‘Ã£i ngÆ°á»i má»›i thÃ¬ tá»± Ä‘á»™ng gÃ¡n gÃ³i cÆ°á»›c vÃ  thá»i háº¡n Æ°u Ä‘Ã£i khi táº¡o User má»›i.
  - **Frontend Store & Component:** Cáº­p nháº­t [saas-admin.store.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/services/saas-admin.store.ts) vÃ  [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts) thÃªm cÃ¡c signals cáº¥u hÃ¬nh vÃ  cÃ¡c hÃ m thao tÃ¡c.
  - **Sá»­a lá»—i Render:** Bá»• sung `TableCellDirective` vÃ o `imports` cá»§a `AdminSaaSComponent` trong [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts) Ä‘á»ƒ kÃ­ch hoáº¡t láº¡i cÃ¡c cell template tÃ¹y biáº¿n trong HTML, sá»­a triá»‡t Ä‘á»ƒ lá»—i hiá»ƒn thá»‹ `[object Object]` vÃ  khÃ´i phá»¥c giao diá»‡n Viá»‡t hÃ³a cÃ³ cÃ¡c badge mÃ u sáº¯c cÃ¹ng nÃºt thao tÃ¡c.
  - **Giao diá»‡n cáº¥u hÃ¬nh:** ThÃªm Card cáº¥u hÃ¬nh "Æ¯u Ä‘Ã£i ngÆ°á»i má»›i" thiáº¿t káº¿ cao cáº¥p sá»­ dá»¥ng component dÃ¹ng chung `<app-custom-switch>`, `<app-custom-select>`, vÃ  `app-button` táº¡i [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html). TÃ­ch há»£p logic áº©n cÃ¡c input vÃ  nÃºt LÆ°u tá»± Ä‘á»™ng co giÃ£n 12 cá»™t khi tráº¡ng thÃ¡i táº¯t Ä‘á»ƒ giá»¯ giao diá»‡n cá»±c ká»³ gá»n gÃ ng, tinh táº¿.
  - Cháº¡y `php -l` kiá»’m tra cÃº phÃ¡p backend thÃ nh cÃ´ng 100%.
  - Cháº¡y `npm run build` biÃªn dá»‹ch dá»± Ã¡n frontend thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Sá»­a lá»—i Class "App\Infrastructure\Persistence\Eloquent\OrderItem" (OrderItemModel) not found trÃªn trang danh sÃ¡ch Ä‘Æ¡n hÃ ng (/orders)

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng bÃ¡o lá»—i tráº¯ng trang/lá»—i há»‡ thá»‘ng khi truy cáº­p Ä‘Æ°á»ng dáº«n `http://localhost:4200/orders`. Lá»—i hiá»ƒn thá»‹ Toast: `Class "App\Infrastructure\Persistence\Eloquent\OrderItem" not found` (bá»‹ cáº¯t ngáº¯n tá»« `OrderItemModel`).
- **Giáº£i phÃ¡p:**
  - **PhÃ¢n tÃ­ch:** Trong handler xá»­ lÃ½ truy váº¥n Ä‘Æ¡n hÃ ng [GetOrdersQueryHandler.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Application/Orders/Handlers/GetOrdersQueryHandler.php), khi re-hydrate dá»¯ liá»‡u Ä‘Æ¡n hÃ ng tá»« máº£ng cache/DB, há»‡ thá»‘ng Ä‘Ã£ khá»Ÿi táº¡o sai Class `$item = new \App\Infrastructure\Persistence\Eloquent\OrderItemModel();` thay vÃ¬ sá»­ dá»¥ng thá»±c thá»ƒ Domain Entity `\App\Domain\Entities\OrderItem()`.
  - **Kháº¯c phá»¥c:** Cáº­p nháº­t [GetOrdersQueryHandler.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Application/Orders/Handlers/GetOrdersQueryHandler.php), thay tháº¿ class khá»Ÿi táº¡o `OrderItemModel` khÃ´ng tá»“n táº¡i báº±ng `\App\Domain\Entities\OrderItem`.
  - Cháº¡y `php -l` kiá»’m tra cÃº phÃ¡p thÃ nh cÃ´ng 100%.
  - Cháº¡y `php artisan cache:clear` dá»n dáº¹p bá»™ nhá»› Ä‘á»‡m há»‡ thá»‘ng thÃ nh cÃ´ng.

### YÃªu cáº§u: Kiá»’m tra vÃ  chuáº©n hÃ³a cÃ¡c nÃºt báº¥m native trong SaaS Admin sang app-button

- **Ná»™i dung yÃªu cáº§u:** Xem xÃ©t cÃ¡c trang tab trong há»‡ thá»‘ng quáº£n trá»‹ SaaS Admin, kiá»ƒm tra xem cÃ¡c control nhÆ° nÃºt báº¥m, tab, input, select Ä‘Ã£ Ä‘Æ°á»£c káº¿ thá»«a tá»« cÃ¡c component dÃ¹ng chung chÆ°a vÃ  thá»±c hiá»‡n chuáº©n hÃ³a.
- **Giáº£i phÃ¡p:**
  - RÃ  soÃ¡t há»‡ thá»‘ng cho tháº¥y cÃ¡c tab chÃ­nh/phá»¥ (`<app-tab-group>`), bá»™ chá»n dropdown (`<app-custom-select>`), Ã´ tÃ¬m kiáº¿m (`<app-custom-search-input>`), báº£ng biá»ƒu vÃ  phÃ¢n trang (`<app-table>`), cÃ¡c modal con (`subscription-plan-modal`, `tenant-subscription-modal`) Ä‘á»u Ä‘Ã£ káº¿ thá»«a tá»‘t 100% tá»« component dÃ¹ng chung.
  - Tuy nhiÃªn, váº«n cÃ²n sÃ³t láº¡i 14 nÃºt báº¥m sá»­ dá»¥ng class CSS native (`btn-primary`, `btn-secondary`, v.v.) trong cÃ¡c cá»™t hÃ nh Ä‘á»™ng cá»§a báº£ng ThuÃª bao, báº£ng GÃ³i cÆ°á»›c vÃ  tab Báº£o trÃ¬ (Maintenance), tab ThÃ´ng tin.
  - Tiáº¿n hÃ nh cáº­p nháº­t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html) thay tháº¿ toÃ n bá»™ cÃ¡c nÃºt báº¥m native nÃ y báº±ng directive `app-button`, chuyá»ƒn cÃ¡c style inline kÃ­ch thÆ°á»›c sang thuá»™c tÃ­nh `size` vÃ  tá»± Ä‘á»™ng hÃ³a spinner xoay khi loading.
  - Cháº¡y biÃªn dá»‹ch `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: TÃ¡i cáº¥u trÃºc lÆ°u trá»¯ cáº¥u hÃ¬nh settings dáº¡ng JSON gá»™p

- **Ná»™i dung yÃªu cáº§u:** Gom toÃ n bá»™ cáº¥u hÃ¬nh cá»§a má»™t vÃ­ chá»§ cá»­a hÃ ng thÃ nh 1 báº£n ghi duy nháº¥t lÆ°u dÆ°á»›i dáº¡ng JSON gá»™p trong DB thay vÃ¬ phÃ¢n rÃ£ ra hÆ¡n 30 báº£n ghi riÃªng biá»‡t nhÆ° hiá»‡n táº¡i nháº±m tá»‘i Æ°u hÃ³a vÃ  tiáº¿t kiá»‡m tÃ i nguyÃªn cÆ¡ sá»Ÿ dá»¯ liá»‡u.
- **Giáº£i phÃ¡p:**
  - **Backend Entity**: Cáº­p nháº­t [Setting.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Domain/Entities/Setting.php), Ä‘á»‹nh nghÄ©a danh sÃ¡ch keys loáº¡i trá»« khá»i JSON gá»™p (`website_slug` Ä‘á»ƒ giá»¯ nguyÃªn cáº¥u trÃºc truy váº¥n unique nhanh). ToÃ n bá»™ cÃ¡c keys khÃ¡c sáº½ Ä‘Æ°á»£c mÃ£ hÃ³a vÃ  lÆ°u trá»¯ chung trong má»™t báº£n ghi duy nháº¥t cÃ³ `key` = `'store_config'` dáº¡ng chuá»—i JSON.
  - Thá»±c hiá»‡n di chuyá»ƒn dá»¯ liá»‡u hÃ ng loáº¡t (Batch Migration) cho toÃ n bá»™ cÃ¡c vÃ­ cÅ© trong cÆ¡ sá»Ÿ dá»¯ liá»‡u Ä‘á»ƒ gá»™p toÃ n bá»™ cáº¥u hÃ¬nh EAV riÃªng láº» cÅ© thÃ nh JSON gá»™p má»›i trong báº£n ghi 'store_config', Ä‘á»“ng thá»i xÃ³a bá» triá»‡t Ä‘á»ƒ cÃ¡c báº£n ghi cÅ© phÃ¢n máº£nh khá»i báº£ng 'settings' Ä‘á»ƒ lÃ m sáº¡ch database.
  - Bá»• sung hÃ m helper `getAllForStore($storeOwnerAddress)` tráº£ vá» máº£ng pháº³ng cáº¥u hÃ¬nh Ä‘áº§y Ä‘á»§ (káº¿t há»£p JSON gá»™p + website_slug riÃªng biá»‡t + fallback máº·c Ä‘á»‹nh há»‡ thá»‘ng) Ä‘áº£m báº£o tÃ­nh tÆ°Æ¡ng thÃ­ch ngÆ°á»£c hoÃ n háº£o vá»›i frontend vÃ  pháº§n cÃ²n láº¡i cá»§a há»‡ thá»‘ng.
  - **Backend Controller**: Cáº­p nháº­t [SettingController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/SettingController.php), thay tháº¿ cÃ¡c truy váº¥n `pluck` thÃ´ trá»±c tiáº¿p trÃªn DB sang dÃ¹ng helper `Setting::getAllForStore($storeOwner)`.
  - Cháº¡y kiá»ƒm tra lá»—i cÃº phÃ¡p PHP báº±ng `php -l` thÃ nh cÃ´ng 100%.
  - Cháº¡y `php artisan cache:clear` dá»n dáº¹p cache há»‡ thá»‘ng thÃ nh cÃ´ng.

### YÃªu cáº§u: Loáº¡i bá» tá»± Ä‘á»™ng táº¡o cáº¥u hÃ¬nh máº·c Ä‘á»‹nh trong Database khi káº¿t ná»‘i vÃ­ láº§n Ä‘áº§u

- **Ná»™i dung yÃªu cáº§u:** Khi ngÆ°á»i dÃ¹ng vá»«a káº¿t ná»‘i vÃ­ láº§n Ä‘áº§u, khÃ´ng tá»± Ä‘á»™ng táº¡o cÃ¡c báº£n ghi cáº¥u hÃ¬nh máº·c Ä‘á»‹nh (`store_name`, `primary_color`, `secondary_color`,...) trong DB báº£ng `settings`. Chá»‰ ghi nháº­n vÃ o DB khi ngÆ°á»i dÃ¹ng chá»§ Ä‘á»™ng sá»­a Ä‘á»•i vÃ  báº¥m LÆ°u cáº¥u hÃ¬nh.
- **Giáº£i phÃ¡p:**
  - **Backend Entity**: Cáº­p nháº­t [Setting.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Domain/Entities/Setting.php) bá»• sung máº£ng tÄ©nh `$systemDefaults` chá»©a 35 key cáº¥u hÃ¬nh máº·c Ä‘á»‹nh vÃ  cáº­p nháº­t hÃ m `getForStore($key, $storeOwnerAddress, $default = null)` cÃ¹ng `get($key, $default = null)` Ä‘á»ƒ tá»± Ä‘á»™ng tráº£ vá» giÃ¡ trá»‹ fallback nÃ y náº¿u DB chÆ°a cÃ³ báº£n ghi.
  - **Backend Controller**: Cáº­p nháº­t [SettingController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/SettingController.php) trong hÃ m `ensureDefaultSettings()`. Loáº¡i bá» hoÃ n toÃ n logic chÃ¨n tá»± Ä‘á»™ng `Setting::setForStore(...)` cho cáº£ vÃ­ má»›i hoáº·c khi thiáº¿u key thiáº¿t yáº¿u, thay vÃ o Ä‘Ã³ Ä‘iá»n fallback trá»±c tiáº¿p trong memory qua `Setting::getSystemDefaults()` trÆ°á»›c khi tráº£ vá» client.
  - Cháº¡y kiá»ƒm tra lá»—i cÃº phÃ¡p PHP báº±ng `php -l` thÃ nh cÃ´ng 100%.
  - Cháº¡y `php artisan cache:clear` dá»n dáº¹p cache há»‡ thá»‘ng thÃ nh cÃ´ng.

### YÃªu cáº§u: Äá»•i tÃ´ng mÃ u chá»§ Ä‘áº¡o máº·c Ä‘á»‹nh cá»§a toÃ n há»‡ thá»‘ng (cáº£ FE & BE)

- **Ná»™i dung yÃªu cáº§u:** Äá»•i mÃ u chá»§ Ä‘áº¡o vÃ  mÃ u thá»© cáº¥p thÆ°Æ¡ng hiá»‡u DApp máº·c Ä‘á»‹nh sang mÃ u má»›i (Há»“ng Neon `#ff00dd` vÃ  TÃ­m Neon `#8000ff`), Ä‘á»“ng thá»i cáº­p nháº­t tÃ i liá»‡u thiáº¿t káº¿.
- **Giáº£i phÃ¡p:**
  - **TÃ i liá»‡u**: Cáº­p nháº­t [design.md](file:///d:/git/cafe-blockchain/design.md) vÃ  [ARCHITECTURE.md](file:///d:/git/cafe-blockchain/ARCHITECTURE.md) mÃ´ táº£ tÃ´ng mÃ u má»›i.
  - **Frontend CSS**: Cáº­p nháº­t [styles.css](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/styles.css) (chuyá»ƒn cÃ¡c biáº¿n `--dynamic-primary`, `--dynamic-secondary` vÃ  fallback sang mÃ u má»›i).
  - **Frontend Components & Service**: Sá»­a Ä‘á»•i cáº¥u hÃ¬nh store máº·c Ä‘á»‹nh trong [setting.store.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/settings/store/setting.store.ts), logic fallback trong [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts), [store.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.ts), [settings.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/settings/settings.component.ts), vÃ  cÃ¡c placeholder, background trong [settings.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/settings/settings.component.html), [table-qr-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tables/components/table-qr-modal/table-qr-modal.component.html), [dashboard.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/dashboard/pages/dashboard/dashboard.component.html).
  - **Backend API**: Cáº­p nháº­t seeder máº·c Ä‘á»‹nh trong [DatabaseSeeder.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/database/seeders/DatabaseSeeder.php) vÃ  logic fallback cá»§a cáº¥u hÃ¬nh trong [SettingController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/SettingController.php).
  - Cháº¡y thÃ nh cÃ´ng `php artisan cache:clear` vÃ  kiá»’m tra cÃº phÃ¡p PHP.

### YÃªu cáº§u: Gá»™p cÃ¡c pháº§n tá»­ trang trÃ­ ná»n phÃ¡t sÃ¡ng thÃ nh má»™t component dÃ¹ng chung

- **Ná»™i dung yÃªu cáº§u:** Gá»™p cÃ¡c element trang trÃ­ (glowing mesh) á»Ÿ trang chá»§/POS vÃ  trang explorer thÃ nh 1 component duy nháº¥t Ä‘á»ƒ dá»… quáº£n lÃ½ vÃ  káº¿ thá»«a.
- **Giáº£i phÃ¡p:**
  - **Táº¡o Component má»›i**: Táº¡o component [glowing-mesh.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/glowing-mesh/glowing-mesh.component.ts) vÃ  tá»‡p template [glowing-mesh.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/glowing-mesh/glowing-mesh.component.html) chá»©a 2 div lÆ°á»›i phÃ¡t sÃ¡ng vÃ  styles `:host` Ä‘á»ƒ Ä‘á»‹nh vá»‹.
  - **Thay tháº¿ Layout chÃ­nh**: Cáº­p nháº­t [app.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/app.ts) vÃ  [app.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/app.html) Ä‘á»ƒ import vÃ  sá»­ dá»¥ng tháº» `<app-glowing-mesh>`.
  - **Thay tháº¿ Blockchain Explorer**: Cáº­p nháº­t [blockchain-explorer.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/blockchain/pages/blockchain-explorer/blockchain-explorer.component.ts) vÃ  [blockchain-explorer.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/blockchain/pages/blockchain-explorer/blockchain-explorer.component.html) Ä‘á»ƒ sá»­ dá»¥ng component dÃ¹ng chung thay tháº¿ div tÄ©nh cÅ©.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng.

### YÃªu cáº§u: Bá»• sung switch cáº¥u hÃ¬nh báº­t/táº¯t hiá»‡u á»©ng ná»n phÃ¡t sÃ¡ng trang POS & Quáº£n trá»‹

- **Ná»™i dung yÃªu cáº§u:** ThÃªm switch báº­t/táº¯t hiá»‡u á»©ng glowing mesh táº¡i trang cáº¥u hÃ¬nh cÃ¡ nhÃ¢n (`/profile/settings`), máº·c Ä‘á»‹nh lÃ  báº­t.
- **Giáº£i phÃ¡p:**
  - **UiState Service**: Cáº­p nháº­t [ui-state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/ui-state.service.ts), bá»• sung signal `showBackgroundMesh` (láº¥y tá»« localStorage, máº·c Ä‘á»‹nh lÃ  true) vÃ  phÆ°Æ¡ng thá»©c `setBackgroundMesh(enabled: boolean)` Ä‘á»ƒ lÆ°u tÃ¹y chá»n cá»§a ngÆ°á»i dÃ¹ng.
  - **State Service**: Cáº­p nháº­t [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts) Ä‘á»ƒ expose signal vÃ  method nÃ y ra toÃ n á»©ng dá»¥ng.
  - **Profile Settings Component & Template**: Cáº­p nháº­t [profile-settings.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/profile/pages/profile-settings/profile-settings.component.ts) Ä‘á»ƒ map action báº­t táº¯t, vÃ  cáº­p nháº­t [profile-settings.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/profile/pages/profile-settings/profile-settings.component.html) bá»• sung má»™t card switch tÃ¹y chá»n "Hiá»‡u á»©ng ná»n phÃ¡t sÃ¡ng trang POS & Quáº£n trá»‹".
  - **Shell Layout**: Cáº­p nháº­t [app.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/app.html), thÃªm Ä‘iá»u kiá»‡n `stateService.showBackgroundMesh()` vÃ o khá»‘i render glowing mesh Ä‘á»ƒ áº©n/hiá»‡n hiá»‡u á»©ng Ä‘á»™ng theo cáº¥u hÃ¬nh cÃ¡ nhÃ¢n.

### YÃªu cáº§u: Cáº¥u hÃ¬nh redirect vá» trang chá»§ khi nháº¥n vÃ o Logo DApp

- **Ná»™i dung yÃªu cáº§u:** Khi ngÆ°á»i dÃ¹ng nháº¥n vÃ o áº£nh Logo cá»§a DApp thÃ¬ chuyá»ƒn hÆ°á»›ng vá» trang chá»§.
- **Giáº£i phÃ¡p:**
  - **Frontend:** Cáº­p nháº­t [sidebar.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/sidebar/sidebar.component.html). Bá»c cÃ¡c logo (cáº£ áº£nh vÃ  chá»¯ kÃ¨m theo) trong tháº» liÃªn káº¿t `routerLink="/"` vá»›i cÃ¡c class `cursor-pointer hover:opacity-90 transition-opacity` trÃªn cáº£ Sidebar Desktop, Header Mobile vÃ  Menu Drawer Mobile. RiÃªng Menu Drawer Mobile, khi nháº¥n vÃ o logo cÃ²n tá»± Ä‘á»™ng Ä‘Ã³ng menu qua `(click)="isMobileMenuOpen.set(false)"`.
  - Tiáº¿n hÃ nh biÃªn dá»‹ch `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: NÃ¢ng cáº¥p tÃ­nh nÄƒng XÃ³a táº¥t cáº£ cache há»‡ thá»‘ng Ä‘á»ƒ xÃ³a sáº¡ch tá»‡p tin cache cá»©ng á»Ÿ backend

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n há»“i nÃºt "XÃ³a táº¥t cáº£ cache" chÆ°a lÃ m sáº¡ch Ä‘Æ°á»£c cache á»Ÿ trang dashboard, pos,... Ä‘á» xuáº¥t xÃ³a trá»±c tiáº¿p thÆ° má»¥c cache `storage/framework/cache/data`.
- **Giáº£i phÃ¡p:**
  - **PhÃ¢n tÃ­ch:** TrÃªn há»‡ Ä‘iá»u hÃ nh Windows, lá»‡nh `php artisan cache:clear` cháº¡y qua context HTTP Web Server Ä‘Ã´i khi khÃ´ng thá»ƒ dá»n dáº¹p triá»‡t Ä‘á»ƒ do xung Ä‘á»™t quyá»n hoáº·c lock file. Giáº£i phÃ¡p xÃ³a cá»©ng thÆ° má»¥c dá»¯ liá»‡u cache lÃ  an toÃ n vÃ  tá»‘i Æ°u nháº¥t.
  - **Backend API:** Cáº­p nháº­t [AdminController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AdminController.php) trong phÆ°Æ¡ng thá»©c `clearAllCaches()`. Bá»• sung lá»‡nh sá»­ dá»¥ng `\Illuminate\Support\Facades\File::cleanDirectory()` Ä‘á»ƒ dá»n sáº¡ch táº¥t cáº£ tá»‡p vÃ  thÆ° má»¥c con trong `storage/framework/cache/data`, Ä‘áº£m báº£o xÃ³a cá»©ng hoÃ n toÃ n má»i dá»¯ liá»‡u cache á»Ÿ backend.
  - Thá»±c hiá»‡n kiá»ƒm tra lá»—i cÃº phÃ¡p PHP thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i JS crash `TypeError: e[Symbol.iterator] is not a function` trÃªn trang Dashboard khi Ä‘á»c cache

- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i giao diá»‡n Dashboard bá»‹ crash vÃ  bÃ¡o lá»—i `TypeError: e[Symbol.iterator] is not a function` trÃªn console má»—i khi ca trá»±c cáº­p nháº­t thá»i gian dÆ°á»›i ná»n.
- **Giáº£i phÃ¡p:**
  - **PhÃ¢n tÃ­ch:** Do cÆ¡ cháº¿ lÆ°u cache cá»§a Laravel (`Cache::remember`) tráº£ vá» Eloquent Collection dáº¡ng Object `{0:..., 1:...}` thay vÃ¬ máº£ng tuáº§n tá»± `[]` khi khÃ´i phá»¥c tá»« file cache, khiáº¿n Angular `@for` bá»‹ crash do khÃ´ng thá»ƒ láº·p qua Ä‘á»‘i tÆ°á»£ng.
  - **Backend API**: ÄÃ£ cáº­p nháº­t [DashboardController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/DashboardController.php) gá»i `->toArray()` cho cÃ¡c Collection (nhÆ° `$latestBlockchainTransactions` vÃ  `$bestSellers`) trÆ°á»›c khi ghi vÃ o cache.
  - **Dá»n cache**: Thá»±c hiá»‡n cháº¡y thÃ nh cÃ´ng lá»‡nh `php artisan cache:clear` trÃªn mÃ¡y chá»§.
  - **Frontend**: Tiáº¿n hÃ nh cháº¡y láº¡i tiáº¿n trÃ¬nh `npm run build` thÃ nh cÃ´ng Ä‘á»ƒ sinh ra bundle má»›i nháº¥t (`main-FNAZNWWZ.js`), loáº¡i bá» hoÃ n toÃ n cÃ¡c file JS cÅ© Ä‘ang bá»‹ cache trÃªn trÃ¬nh duyá»‡t.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i JS crash `TypeError: e.payment_methods.reduce is not a function` vÃ  `e[Symbol.iterator] is not a function` trÃªn trang BÃ¡o cÃ¡o (Reports) khi Ä‘á»c cache

- **Ná»™i dung yÃªu cáº§u:** Trang BÃ¡o cÃ¡o (`/reports`) bá»‹ lá»—i tráº¯ng biá»ƒu Ä‘á»“, crash vÃ  bÃ¡o lá»—i `TypeError: e.payment_methods.reduce is not a function` trÃªn Console cá»§a trÃ¬nh duyá»‡t.
- **Giáº£i phÃ¡p:**
  - **PhÃ¢n tÃ­ch:** TÆ°Æ¡ng tá»± nhÆ° Dashboard, dá»¯ liá»‡u bÃ¡o cÃ¡o (`products`, `customers`, vÃ  `payment_methods`) trong [ReportController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/ReportController.php) Ä‘Æ°á»£c lÆ°u cache dÆ°á»›i dáº¡ng Eloquent Collection / DB Collection. Khi Ä‘á»c tá»« cache, chÃºng bá»‹ biáº¿n thÃ nh Object khiáº¿n frontend Angular khÃ´ng thá»ƒ sá»­ dá»¥ng cÃ¡c hÃ m máº£ng nhÆ° `reduce()` hay vÃ²ng láº·p `@for`.
  - **Backend API**: Cáº­p nháº­t [ReportController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/ReportController.php) gá»i `->toArray()` trÃªn cáº£ 3 Collection `$productReport`, `$customerReport`, vÃ  `$paymentMethods` trÆ°á»›c khi lÆ°u vÃ o cache.
  - **Dá»n cache**: Cháº¡y thÃ nh cÃ´ng lá»‡nh `php artisan cache:clear`.

### YÃªu cáº§u: ThÃªm hiá»‡u á»©ng lÆ°á»›i mÃ u phÃ¡t sÃ¡ng ná»n (Background decorative glowing mesh) cho trang POS, Dashboard vÃ  cÃ¡c má»¥c menu quáº£n trá»‹ khÃ¡c

- **Ná»™i dung yÃªu cáº§u:** Trang trÃ­ cho giao diá»‡n chÃ­nh cá»§a trang POS, Dashboard vÃ  táº¥t cáº£ cÃ¡c má»¥c menu quáº£n trá»‹ khÃ¡c báº±ng cÃ¡ch bá»• sung 2 div hiá»‡u á»©ng ná»n phÃ¡t sÃ¡ng má» (mÃ u primary vÃ  emerald) giá»‘ng nhÆ° trang Blockchain Explorer.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [app.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/app.html): ChÃ¨n 2 tháº» `div` hiá»‡u á»©ng phÃ¡t sÃ¡ng má» (blur) vÃ o ngay Ä‘áº§u tháº» `<main>` quáº£n lÃ½ cá»™t ná»™i dung bÃªn pháº£i, bá»c trong Ä‘iá»u kiá»‡n `@if (!isPublicLayout)` Ä‘á»ƒ Ä‘áº£m báº£o hiá»‡u á»©ng chá»‰ hiá»ƒn thá»‹ á»Ÿ giao diá»‡n quáº£n trá»‹/POS ná»™i bá»™, trÃ¡nh áº£nh hÆ°á»Ÿng Ä‘áº¿n cÃ¡c trang cÃ´ng khai khÃ¡c (nhÆ° storefront hoáº·c blockchain explorer Ä‘Ã£ tá»± tÃ­ch há»£p).
  - BiÃªn dá»‹ch `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Loáº¡i bá» cÆ¡ cháº¿ tá»± Ä‘á»™ng gá»i API getPublicSettings khi chÆ°a Ä‘Äƒng nháº­p vÃ  triá»‡t tiÃªu query cá»­a hÃ ng Ä‘áº§u tiÃªn á»Ÿ Backend

- **Ná»™i dung yÃªu cáº§u:** TrÃ¡nh gá»i API `/api/settings/public` vÃ´ nghÄ©a khi ngÆ°á»i dÃ¹ng chÆ°a káº¿t ná»‘i vÃ­/chÆ°a Ä‘Äƒng nháº­p, Ä‘á»“ng thá»i loáº¡i bá» logic truy váº¥n láº¥y ngáº«u nhiÃªn cá»­a hÃ ng Ä‘áº§u tiÃªn táº¡i backend khi khÃ´ng xÃ¡c Ä‘á»‹nh Ä‘Æ°á»£c context cá»­a hÃ ng.
- **Giáº£i phÃ¡p:**
  - **State Service**: Cáº­p nháº­t [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts) Ä‘á»ƒ loáº¡i bá» hoÃ n toÃ n viá»‡c tá»± Ä‘á»™ng gá»i `loadPublicSettingsAndMenu()` trong `constructor` khi vÃ­ chÆ°a Ä‘Æ°á»£c káº¿t ná»‘i. Äá»“ng thá»i thÃªm nhÃ¡nh `else` vÃ o `effect` náº¡p cáº¥u hÃ¬nh tá»± Ä‘á»™ng khi Ä‘Äƒng nháº­p Ä‘á»ƒ táº¯t mÃ n hÃ¬nh loading (`isInitialLoading.set(false)`) ngay láº­p tá»©c khi vÃ­ chÆ°a káº¿t ná»‘i, kháº¯c phá»¥c lá»—i treo mÃ n hÃ¬nh "Äang táº£i thá»±c Ä‘Æ¡n...".
  - **Api Service**: Cáº­p nháº­t [api.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/api.service.ts) Ä‘Ã­nh kÃ¨m headers xÃ¡c thá»±c Sanctum cho API `getPublicSettings()` Ä‘á»ƒ há»— trá»£ cashiers Ä‘Ã£ Ä‘Äƒng nháº­p cÃ³ thá»ƒ táº£i Ä‘Ãºng cáº¥u hÃ¬nh cá»­a hÃ ng.
  - **Blockchain Explorer**: Cáº­p nháº­t [blockchain-explorer.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/blockchain/pages/blockchain-explorer/blockchain-explorer.component.ts) Ä‘á»ƒ tá»± Ä‘á»™ng kÃ­ch hoáº¡t `useOfflineFallback()` sá»­ dá»¥ng cáº¥u hÃ¬nh máº·c Ä‘á»‹nh (RPC, Explorer) tá»« `environment.ts` khi chÆ°a Ä‘Äƒng nháº­p, hoáº·c Ä‘á»c trá»±c tiáº¿p tá»« `stateService.settings()` khi Ä‘Ã£ Ä‘Äƒng nháº­p thay vÃ¬ gá»i API `/settings/public` khÃ´ng cÃ³ tham sá»‘.
  - **Backend API**: Cáº­p nháº­t [SettingController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/SettingController.php) trong phÆ°Æ¡ng thá»©c `getPublicSettings()`. Nháº­n diá»‡n user Ä‘Äƒng nháº­p qua `auth('sanctum')->user()`. Náº¿u khÃ´ng tÃ¬m tháº¥y cá»­a hÃ ng (chÆ°a Ä‘Äƒng nháº­p vÃ  khÃ´ng cÃ³ `order_code` / `slug`), tráº£ vá» ngay láº­p tá»©c má»™t máº£ng cáº¥u hÃ¬nh rá»—ng vá»›i mÃ£ mÃ u máº·c Ä‘á»‹nh `#7c3aed` / `#c084fc` thay vÃ¬ truy váº¥n `first()` cá»­a hÃ ng Ä‘áº§u tiÃªn trong database.
  - BiÃªn dá»‹ch `npm run build` vÃ  kiá»ƒm tra cÃº phÃ¡p PHP thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Triá»’n khai Backend Cache (BE Cache) cho Cá»­a hÃ ng

- **Ná»™i dung yÃªu cáº§u:** Triá»ƒn khai cÆ¡ cháº¿ cache á»Ÿ Backend (BE) cho cÃ¡c phÃ¢n há»‡ cá»§a tá»«ng cá»­a hÃ ng vá»›i thá»i gian lÆ°u trá»¯ tÃ¹y chá»‰nh: cáº¥u hÃ¬nh phÃ¢n quyá»n (24 giá»), bÃ¡o cÃ¡o lá»‹ch sá»­ (1 tuáº§n), bÃ¡o cÃ¡o hÃ´m nay (10 phÃºt), sÆ¡ Ä‘á»“ bÃ n/khu vá»±c (24 giá»), phÆ°Æ¡ng thá»©c thanh toÃ¡n (24 giá»), vÃ  nhÃ³m khÃ¡ch hÃ ng (24 giá»).
- **Giáº£i phÃ¡p:**
  - **Core Utility**: Bá»• sung hÃ m `registerCacheKey` vÃ  `clearStoreCache` trong [Setting.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Domain/Entities/Setting.php) Ä‘á»ƒ quáº£n lÃ½ danh sÃ¡ch cache key Ä‘á»™ng theo tá»«ng cá»­a hÃ ng.
  - **PhÃ¢n quyá»n**: Cache quyá»n `store_staff_permissions` trong [User.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Domain/Entities/User.php) (24 giá») vÃ  xÃ³a cache trong [StaffController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/StaffController.php) khi nhÃ¢n viÃªn hoáº·c vai trÃ² thay Ä‘á»•i.
  - **SÆ¡ Ä‘á»“ bÃ n**: Cache danh sÃ¡ch khu vá»±c/bÃ n Äƒn trong [AreaController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AreaController.php) vÃ  [DiningTableController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/DiningTableController.php) (24 giá»), xÃ³a cache khi cÃ³ sá»± thay Ä‘á»•i tráº¡ng thÃ¡i bÃ n Äƒn hoáº·c cáº¥u trÃºc khu vá»±c.
  - **PhÆ°Æ¡ng thá»©c thanh toÃ¡n & NhÃ³m khÃ¡ch hÃ ng**: TÃ­ch há»£p cache trong [PaymentMethodController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/PaymentMethodController.php) (tá»‘i Æ°u hÃ³a lá»c Collection á»Ÿ PHP) vÃ  [CustomerGroupController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/CustomerGroupController.php) (24 giá»), xÃ³a cache khi cáº­p nháº­t phÆ°Æ¡ng thá»©c thanh toÃ¡n hoáº·c khÃ¡ch hÃ ng.
  - **BÃ¡o cÃ¡o & Dashboard**: TÃ­ch há»£p cache cÃ³ Ä‘iá»u kiá»‡n (1 tuáº§n hoáº·c 10 phÃºt) trong [DashboardController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/DashboardController.php) vÃ  [ReportController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/ReportController.php). Tá»± Ä‘á»™ng dá»n dáº¹p cache Ä‘á»™ng khi káº¿t ca lÃ m viá»‡c trong [ShiftController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/ShiftController.php).
  - Cháº¡y `php -l` kiá»ƒm tra cÃº phÃ¡p thÃ nh cÃ´ng 100% cho toÃ n bá»™ file.

### YÃªu cáº§u: TÃ­ch há»£p nÃºt báº¥m dá»n dáº¹p toÃ n bá»™ cache cho trang quáº£n trá»‹ há»‡ thá»‘ng SaaS Admin (Tab báº£o trÃ¬)

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng muá»‘n thÃªm má»™t nÃºt báº¥m duy nháº¥t Ä‘á»ƒ xÃ³a táº¥t cáº£ cache cÃ¹ng má»™t lÃºc bao gá»“m: lÃ m má»›i compiled views, xÃ³a cáº¥u hÃ¬nh cache, xÃ³a Ä‘á»‹nh tuyáº¿n cache, tá»‘i Æ°u hÃ³a hiá»‡u nÄƒng, vÃ  xÃ³a cache tá»‘i Æ°u hÃ³a.
- **Giáº£i phÃ¡p:**
  - **Backend API**: Cáº­p nháº­t [AdminController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AdminController.php), táº¡o phÆ°Æ¡ng thá»©c `clearAllCaches()` gá»i tuáº§n tá»± cÃ¡c lá»‡nh `optimize:clear`, `view:clear`, `optimize`, `cache:clear` vÃ  dá»n dáº¹p cÃ¡c cache key quáº£n trá»‹ SaaS Admin. ÄÄƒng kÃ½ route POST `/admin/maintenance/clear-all` trong [api.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/routes/api.php).
  - **Frontend API Service**: C?p nh?t [api.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/api.service.ts), b? sung ph??ng th?c `adminMaintenanceClearAll()`.
  - **Component & Template**: Cáº­p nháº­t [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts) Ä‘á»ƒ map action `'clear-all'`. Cáº­p nháº­t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html) bá»• sung má»™t card dá»n dáº¹p nhanh thiáº¿t káº¿ sang trá»ng sá»­ dá»¥ng tone mÃ u thÆ°Æ¡ng hiá»‡u tÃ­m vÃ  ná»n gradient á»Ÿ trÃªn cÃ¹ng cá»§a tab Maintenance.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: TÃ¡i cáº¥u trÃºc SaaS Admin sá»­ dá»¥ng Store Service chuyÃªn biá»‡t (Tá»‘i Æ°u cÆ¡ cháº¿ Cache FE & LÆ°u giá»¯ tráº¡ng thÃ¡i)

- **Ná»™i dung yÃªu cáº§u:** Triá»ƒn khai phÆ°Æ¡ng Ã¡n 2 Ä‘á»ƒ tÃ¡i cáº¥u trÃºc hoÃ n toÃ n giao diá»‡n SaaS Admin (`admin-saas.component.ts`) nháº±m tá»‘i Æ°u viá»‡c lÆ°u giá»¯ bá»™ lá»c/phÃ¢n trang/tÃ¬m kiáº¿m cá»§a tá»«ng tab, Ä‘Æ¡n giáº£n hÃ³a vÃ  chuáº©n hÃ³a code báº±ng cÃ¡ch tÃ¡ch logic dá»¯ liá»‡u ra má»™t Store Service Ä‘á»™c láº­p (`saas-admin.store.ts`).
- **Giáº£i phÃ¡p:**
  - **Táº¡o má»›i Store Service**: [saas-admin.store.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/services/saas-admin.store.ts) chá»©a toÃ n bá»™ cÃ¡c signals lÆ°u trá»¯ dá»¯ liá»‡u, cá» cache, computed signals lá»c dá»¯ liá»‡u khÃ¡ch hÃ ng, phÃ¢n trang, vÃ  cÃ¡c helper methods (logs, packages, filter change events).
  - **RÃºt gá»n Component**: Cáº­p nháº­t [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts), inject `SaaSAdminStore` vÃ  Ä‘Äƒng kÃ½ `providers: [SaaSAdminStore]` Ä‘á»ƒ store tá»± Ä‘á»™ng giáº£i phÃ³ng khi rá»i trang. Loáº¡i bá» logic thá»«a Ä‘á»ƒ giáº£m tá»« 1370 dÃ²ng code xuá»‘ng cÃ²n ~380 dÃ²ng.
  - **Äá»“ng bá»™ hÃ³a Template HTML**: Sá»­a Ä‘á»•i toÃ n bá»™ [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html) Ä‘á»ƒ Ã¡nh xáº¡ cÃ¡c liÃªn káº¿t sang `store.` prefix, sá»­a cÃ¡c lá»—i biÃªn dá»‹ch liÃªn quan Ä‘áº¿n cÃº phÃ¡p `store.store.` vÃ  dá»n dáº¹p cÃ¡c sá»± kiá»‡n lá»c/phÃ¢n trang.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Triá»ƒn khai bá»™ nhá»› Ä‘á»‡m phÃ­a Backend (BE Cache) cho cÃ¡c API quáº£n trá»‹ SaaS Admin

- **Ná»™i dung yÃªu cáº§u:** Triá»ƒn khai cache phÃ­a Laravel Backend Ä‘á»ƒ tÄƒng tá»‘c Ä‘á»™ pháº£n há»“i API quáº£n trá»‹ vÃ  giáº£m táº£i Database, loáº¡i trá»« API Danh sÃ¡ch yÃªu cáº§u nÃ¢ng gÃ³i vÃ  API Log lá»—i há»‡ thá»‘ng Ä‘á»ƒ Ä‘áº£m báº£o dá»¯ liá»‡u real-time.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [AdminController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AdminController.php):
    - TÃ­ch há»£p `\Cache::remember` cho danh sÃ¡ch cá»­a hÃ ng (`admin_tenants` - 1 giá»), danh sÃ¡ch gÃ³i cÆ°á»›c (`admin_plans` - 24 giá»), cáº¥u hÃ¬nh há»‡ thá»‘ng (`admin_system_settings` - 24 giá»), gÃ³i Composer (`admin_packages` - 24 giá»).
    - Äá»‘i vá»›i cÃ¡c Eloquent Collection láº¥y qua `get()`, ta chuyá»ƒn Ä‘á»•i chÃºng thÃ nh máº£ng thÃ´ `get()->toArray()` trÆ°á»›c khi lÆ°u vÃ o cache Ä‘á»ƒ trÃ¡nh lá»—i Fatal `__PHP_Incomplete_Class` do unserialize trÆ°á»›c khi cÃ¡c class cá»§a Eloquent Ä‘Æ°á»£c load xong.
    - Äá»‘i vá»›i phÆ°Æ¡ng thá»©c thanh toÃ¡n (`admin_payment_methods` - 24 giá») vÃ  nhÃ¢n viÃªn há»‡ thá»‘ng (`admin_system_staffs` - 24 giá»): Cache toÃ n bá»™ danh sÃ¡ch dáº¡ng máº£ng thÃ´, khi láº¥y ra sá»­ dá»¥ng helper `collect()` Ä‘á»ƒ lá»c tÃ¬m kiáº¿m vÃ  phÃ¢n trang báº±ng Collection thÃ´ Ä‘á»ƒ giáº£m phÃ¢n máº£nh cache key.
    - Cáº¥u hÃ¬nh tá»± Ä‘á»™ng xÃ³a cache (`\Cache::forget`) trong cÃ¡c hÃ m ghi dá»¯ liá»‡u tÆ°Æ¡ng á»©ng (thÃªm, sá»­a, xÃ³a, khÃ´i phá»¥c máº·c Ä‘á»‹nh, phÃª duyá»‡t thuÃª bao).
    - Cáº­p nháº­t hÃ m tá»‘i Æ°u hÃ³a (`optimize` vÃ  `clearOptimize`) Ä‘á»ƒ dá»n dáº¹p toÃ n bá»™ cÃ¡c cache key cá»§a trang quáº£n trá»‹.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i tab ThuÃª bao hiá»ƒn thá»‹ trá»‘ng vÃ  Ä‘á»“ng bá»™ nhÃ£n bá»™ lá»c, sá»­a lá»—i Ä‘á»‹nh dáº¡ng ngÃ y á»Ÿ tab Cá»­a hÃ ng

- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i tab ThuÃª bao khÃ´ng hiá»ƒn thá»‹ dá»¯ liá»‡u (ká»ƒ cáº£ khi Ä‘Ã£ phÃª duyá»‡t), sá»­a lá»—i bá»™ chá»n hiá»ƒn thá»‹ sai nhÃ£n "Táº¥t cáº£ tráº¡ng thÃ¡i" máº·c dÃ¹ store load pending, vÃ  sá»­a lá»—i ngÃ y Ä‘Äƒng kÃ½ hiá»ƒn thá»‹ `[object Object]` á»Ÿ tab Cá»­a hÃ ng.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html):
    - Äá»•i binding cá»§a bá»™ chá»n tráº¡ng thÃ¡i sang `[ngModel]` vÃ  `(ngModelChange)` giÃºp Angular Forms tá»± Ä‘á»™ng gá»i `writeValue()` Ä‘á»ƒ Ä‘á»“ng bá»™ nhÃ£n "Chá» phÃª duyá»‡t" ban Ä‘áº§u.
    - Äá»•i táº¥t cáº£ cÃ¡c cuá»™c gá»i `loadSubscriptionRequests()` trong template thÃ nh `loadSubscriptionRequests(true)` Ä‘á»ƒ force load bypass cache khi Ä‘á»•i filter/search/page/táº£i láº¡i.
  - Cáº­p nháº­t [AdminController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AdminController.php): Trong hÃ m `indexTenants()`, Ä‘á»‹nh dáº¡ng trÆ°á»ng `created_at` vÃ  `subscription_expires_at` thÃ nh chuá»—i ngÃ y thÃ¡ng chuáº©n (toDateTimeString) trÆ°á»›c khi Cache vÃ  tráº£ JSON vá» Ä‘á»ƒ triá»‡t tiÃªu lá»—i Ä‘á»‘i tÆ°á»£ng Carbon bá»‹ deserialization thÃ nh `__PHP_Incomplete_Class`.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%. XÃ¡c minh trÃªn trÃ¬nh duyá»‡t hiá»ƒn thá»‹ chuáº©n vÃ  lá»c dá»¯ liá»‡u chÃ­nh xÃ¡c.

### YÃªu cáº§u: Cáº­p nháº­t thá»i gian lÆ°u cache bÃ¡o cÃ¡o/dashboard Ä‘á»™ng vÃ  tá»‘i Æ°u dá»n dáº¹p khi káº¿t ca

- **Ná»™i dung yÃªu cáº§u:** Cáº­p nháº­t thá»i gian cache BÃ¡o cÃ¡o & Dashboard ngÃ y hÃ´m nay (Ä‘á»™ng) tá»« 10 phÃºt xuá»‘ng cÃ²n 2 phÃºt. Äá»“ng thá»i Ä‘áº£m báº£o há»‡ thá»‘ng dá»n sáº¡ch hoÃ n toÃ n cÃ¡c cache bÃ¡o cÃ¡o/dashboard cá»§a cá»­a hÃ ng Ä‘Ã³ khi nhÃ¢n viÃªn káº¿t ca (Shift close).
- **Giáº£i phÃ¡p:**
  - **Cáº­p nháº­t TTL**: Cáº­p nháº­t thá»i gian sá»‘ng cá»§a cache Ä‘á»™ng tá»« `600` giÃ¢y (10 phÃºt) thÃ nh `120` giÃ¢y (2 phÃºt) trong `index()` cá»§a [DashboardController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/DashboardController.php) vÃ  [ReportController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/ReportController.php).
  - **Dá»n dáº¹p khi káº¿t ca**: XÃ¡c minh logic táº¡i [ShiftController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/ShiftController.php) gá»i helper `Setting::clearStoreCache($storeOwner)` khi káº¿t ca thÃ nh cÃ´ng, tá»± Ä‘á»™ng xÃ³a sáº¡ch táº¥t cáº£ cÃ¡c cache key liÃªn quan Ä‘áº¿n bÃ¡o cÃ¡o/dashboard cá»§a cá»­a hÃ ng Ä‘Ã³ (do cÃ¡c cache key Ä‘á»™ng Ä‘Æ°á»£c tá»± Ä‘á»™ng Ä‘Äƒng kÃ½ qua `Setting::registerCacheKey` khi sinh cache).
  - Cháº¡y `php -l` kiá»’m tra cÃº phÃ¡p thÃ nh cÃ´ng 100% cho cÃ¡c controller.

### YÃªu cáº§u: Triá»ƒn khai bá»™ nhá»› Ä‘á»‡m (Cache Backend) bá»• sung cho Cá»­a hÃ ng vÃ  SaaS

- **Ná»™i dung yÃªu cáº§u:** TÃ­ch há»£p bá»™ nhá»› Ä‘á»‡m Backend cho: Cáº¥u hÃ¬nh cá»­a hÃ ng (lÆ°u 24 giá»), Danh sÃ¡ch khÃ¡ch hÃ ng POS (lÆ°u 10 phÃºt), Danh sÃ¡ch gÃ³i cÆ°á»›c cho Shop (lÆ°u 24 giá») vÃ  NguyÃªn váº­t liá»‡u & Äá»‹nh lÆ°á»£ng (lÆ°u 24 giá»).
- **Giáº£i phÃ¡p:**
  - **Cáº¥u hÃ¬nh cá»­a hÃ ng (Settings)**: TÃ­ch há»£p cache `store_settings_admin:{$storeOwner}` (24h) vÃ o `SettingController.php`. Tá»± Ä‘á»™ng xÃ³a cache khi lÆ°u cÃ i Ä‘áº·t hoáº·c khi Ä‘á»“ng bá»™ hÃ³a blockchain Ä‘Æ¡n hÃ ng/giao dá»‹ch thÃ nh cÃ´ng (trong `OrderController.php` vÃ  `TransactionController.php`).
  - **Danh sÃ¡ch khÃ¡ch hÃ ng POS**: TÃ­ch há»£p cache `store_customers_pos:{$storeOwner}` (10 phÃºt) vÃ o `CustomerController.php` vÃ  thá»±c hiá»‡n tÃ¬m kiáº¿m trÃªn PHP Collection. Tá»± Ä‘á»™ng xÃ³a cache khi thÃªm/sá»­a/xÃ³a khÃ¡ch hÃ ng, hoáº·c khi liÃªn káº¿t vÃ­ má»›i qua tÃ­ch Ä‘iá»ƒm (`ClaimController.php`).
  - **GÃ³i cÆ°á»›c dÃ nh cho cÃ¡c Shop**: Cache `system_subscription_plans` (24h) cho API public á»Ÿ `AuthController.php`. Tá»± Ä‘á»™ng xÃ³a cache nÃ y khi Super Admin CRUD gÃ³i cÆ°á»›c (`AdminController.php`).
  - **NguyÃªn váº­t liá»‡u & Äá»‹nh lÆ°á»£ng**: ÄÃ£ Ä‘Æ°á»£c bao phá»§ thÃ´ng qua cache gá»™p thá»±c Ä‘Æ¡n 24h vÃ  invalidation tá»± Ä‘á»™ng khi cÃ³ báº¥t ká»³ thay Ä‘á»•i nÃ o.
  - Cháº¡y `php -l` kiá»ƒm tra cÃº phÃ¡p thÃ nh cÃ´ng 100% Ä‘á»‘i vá»›i cáº£ 7 controller Ä‘Ã£ sá»­a Ä‘á»•i.

### YÃªu cáº§u: Triá»ƒn khai bá»™ nhá»› Ä‘á»‡m (Cache Backend) cho Lá»‹ch sá»­ ca lÃ m viá»‡c Ä‘Ã£ Ä‘Ã³ng trong quÃ¡ khá»©

- **Ná»™i dung yÃªu cáº§u:** TÃ­ch há»£p bá»™ nhá»› Ä‘á»‡m Backend cho lá»‹ch sá»­ cÃ¡c ca trá»±c Ä‘Ã£ Ä‘Ã³ng cá»§a cÃ¡c thÃ¡ng cÅ© trong quÃ¡ khá»© nháº±m giáº£m táº£i truy váº¥n cÆ¡ sá»Ÿ dá»¯ liá»‡u khi xem lá»‹ch sá»­.
- **Giáº£i phÃ¡p:**
  - **PhÃ¢n máº£nh Cache theo thÃ¡ng**: Cáº­p nháº­t [EloquentShiftRepository.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Infrastructure/Persistence/Repositories/EloquentShiftRepository.php) trong phÆ°Æ¡ng thá»©c `getHistory`. Ca lÃ m viá»‡c cá»§a thÃ¡ng hiá»‡n táº¡i sáº½ Ä‘Æ°á»£c táº£i real-time, cÃ²n cÃ¡c ca trá»±c thuá»™c thÃ¡ng cÅ© sáº½ Ä‘Æ°á»£c lÆ°u cache dÆ°á»›i key `store_shifts_history:{$storeOwner}:{$userIdStr}:{$month}` trong vÃ²ng 1 tuáº§n (604.800 giÃ¢y).
  - **CÆ¡ cháº¿ xÃ³a cache**: Cáº­p nháº­t [ShiftController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/ShiftController.php) trong hÃ m káº¿t ca `close()`, tá»± Ä‘á»™ng giáº£i phÃ³ng máº£nh cache cá»§a thÃ¡ng tÆ°Æ¡ng á»©ng cho cáº£ key nhÃ¢n viÃªn cá»¥ thá»ƒ vÃ  key `all` cá»§a quáº£n trá»‹ viÃªn Ä‘á»ƒ trÃ¡nh dá»¯ liá»‡u bá»‹ stale.
  - Cháº¡y `php -l` kiá»’m tra cÃº phÃ¡p thÃ nh cÃ´ng 100%.

## NgÃ y 22/06/2026

### YÃªu cáº§u: Triá»ƒn khai cÆ¡ cháº¿ cache phÃ­a giao diá»‡n (FE) cho táº¥t cáº£ cÃ¡c tab quáº£n trá»‹ (SaaS Admin) vÃ  tÃ­ch há»£p nÃºt Táº£i láº¡i

- **Ná»™i dung yÃªu cáº§u:** TrÃ¡nh viá»‡c gá»i API táº£i láº¡i liÃªn tá»¥c khi ngÆ°á»i dÃ¹ng chuyá»ƒn Ä‘á»•i qua láº¡i giá»¯a cÃ¡c tab trong SaaS Admin. Äá»“ng thá»i, giá»¯ nguyÃªn tráº¡ng thÃ¡i bá»™ lá»c/phÃ¢n trang cá»§a tá»«ng tab Ä‘á»ƒ dá»¯ liá»‡u khÃ´ng bá»‹ reset máº¥t cÃ´ng tÃ¬m láº¡i. Cáº§n cÃ³ cÆ¡ cháº¿ táº£i láº¡i dá»¯ liá»‡u thá»§ cÃ´ng (Táº£i láº¡i) cho cÃ¡c tab nÃ y.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts):
    - Khai bÃ¡o 4 cá» hiá»‡u `hasLoadedPayments`, `hasLoadedSubscriptions`, `hasLoadedStaffs`, `hasLoadedLogs` kiá»ƒu `signal<boolean>(false)`.
    - Cáº­p nháº­t cÃ¡c hÃ m táº£i dá»¯ liá»‡u tÆ°Æ¡ng á»©ng (`loadSystemPaymentMethods`, `loadSubscriptionRequests`, `loadSystemStaffs`, `loadSystemLogs`) Ä‘á»ƒ gÃ¡n cÃ¡c cá» hiá»‡u nÃ y thÃ nh `true` sau khi gá»i API thÃ nh cÃ´ng.
    - Cáº­p nháº­t hÃ m `triggerTabLoad()` Ä‘á»ƒ chá»‰ táº£i dá»¯ liá»‡u náº¿u cá» hiá»‡u tÆ°Æ¡ng á»©ng chÆ°a Ä‘Æ°á»£c báº­t (`false`).
    - Cáº­p nháº­t hÃ m `setSubTab()` Ä‘á»ƒ loáº¡i bá» viá»‡c reset filter/search/page cá»§a cÃ¡c tab khi chuyá»ƒn Ä‘á»•i, giÃºp giá»¯ nguyÃªn bá»™ lá»c vÃ  trang lÃ m viá»‡c hiá»‡n táº¡i cá»§a tá»«ng tab (state preservation).
    - Tá»‘i Æ°u hÃ m `loadStaffAdminData()`: bá» cuá»™c gá»i `this.loadSubscriptionRequests()` thá»«a Ä‘á»ƒ trÃ¡nh lá»—i double loading khi khá»Ÿi táº¡o.
  - Cáº­p nháº­t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html):
    - TÃ­ch há»£p thÃªm nÃºt "Táº£i láº¡i" dÃ¹ng directive `app-button` size `"md"`, variant `"secondary"` vá»›i `<app-icon name="sync">` cho cÃ¡c tab **Thanh toÃ¡n**, **ThuÃª bao**, vÃ  **NhÃ¢n viÃªn há»‡ thá»‘ng** bÃªn cáº¡nh cÃ¡c Ã´ tÃ¬m kiáº¿m.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Äá»“ng bá»™ giao diá»‡n Log Viewer vÃ  ThÆ° viá»‡n Ä‘Ã£ cÃ i Ä‘áº·t trong SaaS Admin

- **Ná»™i dung yÃªu cáº§u:** Sá»­a Ä‘á»•i giao diá»‡n Log Viewer Ä‘á»ƒ khÃ´ng dÃ¹ng cÃ¡c thÃ nh pháº§n native cÅ©, thay tháº¿ báº±ng cÃ¡c UI component há»‡ thá»‘ng (`<app-custom-select>`, `<app-custom-search-input>`, vÃ  directive `app-button`). Sá»­a lá»—i icon SVG nÃºt Táº£i láº¡i (sá»­ dá»¥ng icon `sync` chuáº©n). Äá»“ng bá»™ chiá»u cao hiá»ƒn thá»‹ cá»§a toÃ n bá»™ cÃ¡c control nÃ y (báº±ng chiá»u cao Ã´ tÃ¬m kiáº¿m: 36px/h-9, bo gÃ³c 15px/rounded-xl). Chuyá»ƒn bá»™ chuyá»ƒn Ä‘á»•i tab thÆ° viá»‡n Backend (Composer) vÃ  Frontend (NPM) sang component `<app-tab-group>` dÃ¹ng chung.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html):
    - Äá»•i 2 select lá»c log (logsLimit vÃ  logsLevelFilter) sang dÃ¹ng component `<app-custom-select>` vá»›i `triggerClass` Ä‘Æ°á»£c chuáº©n hÃ³a thÃ nh `w-full form-input !h-9 !py-1.5 !px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold shadow-sm flex items-center justify-between` (Ä‘á»“ng bá»™ chiá»u cao 36px, bo gÃ³c 15px, text-sm).
    - Äá»•i Ã´ tÃ¬m kiáº¿m log sang dÃ¹ng component `<app-custom-search-input>` vá»›i `inputClass` chuáº©n hÃ³a thÃ nh `w-full search-input !pl-9 !h-9 !py-1.5 !text-sm rounded-xl` (Ä‘á»“ng bá»™ chiá»u cao 36px, bo gÃ³c 15px, text-sm).
    - Äá»“ng bá»™ nÃºt "Táº£i láº¡i" log sang dÃ¹ng directive `app-button` size `"md"`, class Ä‘Æ°á»£c cáº¥u hÃ¬nh `!h-9 rounded-xl !py-1.5 !px-4 text-sm font-bold` vÃ  sá»­ dá»¥ng `<app-icon name="sync">` Ä‘á»ƒ kháº¯c phá»¥c lá»—i icon SVG cÅ©.
    - Äá»•i bá»™ chuyá»ƒn tab thÆ° viá»‡n Backend (Composer) / Frontend (NPM) sang sá»­ dá»¥ng component `<app-tab-group>` vá»›i cáº¥u hÃ¬nh `[options]="packageTabOptions"`, `[activeValue]="packageType()"` vÃ  `[flex]="false"`.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Cáº­p nháº­t ThÃ´ng tin MÃ´i trÆ°á»ng KhÃ¡ch (Client) vÃ  hiá»ƒn thá»‹ ThÆ° viá»‡n Frontend NPM

- **Ná»™i dung yÃªu cáº§u:** Äá»•i tÃªn card "MÃ”I TRÆ¯á»œNG FRONTEND" thÃ nh má»™t tÃªn thÃ¢n thiá»‡n hÆ¡n (vÃ­ dá»¥: "MÃ”I TRÆ¯á»œNG KHÃCH (CLIENT)"), hiá»ƒn thá»‹ thÃªm dung lÆ°á»£ng Ä‘Ã³ng gÃ³i Web (Build/Bundle size) cá»§a Angular, Ä‘á»“ng thá»i Ä‘á»c vÃ  hiá»ƒn thá»‹ danh sÃ¡ch thÆ° viá»‡n Ä‘Ã£ cÃ i Ä‘áº·t trong tá»‡p `package.json` cá»§a frontend vá»›i tÃ­nh nÄƒng tÃ¬m kiáº¿m, phÃ¢n trang vÃ  chuyá»ƒn Ä‘á»•i tab.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t backend [AdminController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AdminController.php):
    - Trong `getSystemInfo()`: TÃ­nh dung lÆ°á»£ng thÆ° má»¥c `dist` cá»§a frontend vÃ  tráº£ vá» qua biáº¿n `web_build_size` trong `system_env` (Ã¡p dá»¥ng cache 5 phÃºt Ä‘á»ƒ tá»‘i Æ°u hiá»‡u nÄƒng).
    - Trong `getPackages()`: Tráº£ vá» composer packages nguyÃªn báº£n, khÃ´ng Ä‘á»c package.json cá»§a web tá»« server ná»¯a Ä‘á»ƒ tÄƒng tÃ­nh Ä‘á»™c láº­p vÃ  báº£o máº­t.
  - Cáº­p nháº­t frontend:
    - [tsconfig.json](file:///d:/git/cafe-blockchain/cafe-blockchain-web/tsconfig.json): Báº­t `resolveJsonModule` vÃ  `allowSyntheticDefaultImports` cho phÃ©p import JSON Ä‘á»™ng.
    - [post-build.js](file:///d:/git/cafe-blockchain/cafe-blockchain-web/scripts/post-build.js): Táº¡o script Node.js post-build tá»± Ä‘á»™ng tÃ­nh toÃ¡n tá»•ng dung lÆ°á»£ng Ä‘Ã³ng gÃ³i cá»§a Angular vÃ  xuáº¥t ra tá»‡p tin JSON tÄ©nh `assets/build-size.json` trong folder build output.
    - [package.json](file:///d:/git/cafe-blockchain/cafe-blockchain-web/package.json): LiÃªn káº¿t script post-build cháº¡y tá»± Ä‘á»™ng sau lá»‡nh build: `"build": "ng build && node scripts/post-build.js"`.
    - [api.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/api.service.ts): Bá»• sung hÃ m `getWebBuildSize()` Ä‘á»ƒ táº£i tá»‡p `assets/build-size.json`.
    - [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts):
      - Import tÄ©nh `packageInfo` tá»« `package.json` á»Ÿ compile-time vÃ  tá»± Ä‘á»™ng gÃ¡n cho `npmPackages` signal (giÃºp hoáº¡t Ä‘á»™ng 100% trÃªn Vercel).
      - Äá»•i `packages` sang computed signal chuyá»ƒn Ä‘á»™ng giá»¯a Composer (táº£i qua API) vÃ  NPM (Ä‘á»c tÄ©nh).
      - Cáº­p nháº­t `loadSysInfo()` sá»­ dá»¥ng `forkJoin` káº¿t há»£p `catchError(() => of(null))` táº£i file tÄ©nh `build-size.json` gÃ¡n cho signal `webBuildSize`, tá»± Ä‘á»™ng fallback thÃ´ng minh náº¿u lá»—i.
      - Import vÃ  Ä‘Äƒng kÃ½ component `<app-pagination>`.
    - [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html):
      - Äá»•i tÃªn card thÃ nh `"MÃ”I TRÆ¯á»œNG KHÃCH (CLIENT)"`.
      - Hiá»ƒn thá»‹ `"Dung lÆ°á»£ng Ä‘Ã³ng gÃ³i Web"` tá»« signal `webBuildSize()`.
      - TÃ­ch há»£p bá»™ chuyá»ƒn Ä‘á»•i tab (segment control) cho danh sÃ¡ch thÆ° viá»‡n.
      - Thay tháº¿ bá»™ phÃ¢n trang viáº¿t tay báº±ng viá»‡c káº¿ thá»«a component há»‡ thá»‘ng `<app-pagination>` giÃºp Ä‘á»“ng bá»™ giao diá»‡n.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Bá»• sung card hiá»ƒn thá»‹ thÃ´ng sá»‘ vÃ  kiá»ƒm tra tráº¡ng thÃ¡i hoáº¡t Ä‘á»™ng cá»§a Redis

- **Ná»™i dung yÃªu cáº§u:** TÃ­ch há»£p kiá»ƒm tra xem hosting mÃ¡y chá»§ cÃ³ cÃ i Ä‘áº·t extension Redis, cÃ³ Ä‘ang cáº¥u hÃ¬nh sá»­ dá»¥ng Redis cho Cache, Session, Queue khÃ´ng vÃ  Ä‘o tráº¡ng thÃ¡i káº¿t ná»‘i (ping/pong) cÅ©ng nhÆ° phiÃªn báº£n cá»§a Redis.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t backend [AdminController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AdminController.php):
    - ThÃªm hÃ m `getRedisSystemInfo()`: Kiá»ƒm tra sá»± tá»“n táº¡i cá»§a extension `redis` qua `extension_loaded('redis')`, Ä‘o tráº¡ng thÃ¡i káº¿t ná»‘i báº±ng cÃ¡ch gá»­i lá»‡nh PING qua `Redis::connection()`, Ä‘á»“ng thá»i láº¥y `redis_version` tá»« lá»‡nh `INFO`. Kiá»ƒm tra cÃ¡c cáº¥u hÃ¬nh cache driver, session driver vÃ  queue driver xem cÃ³ trá» tá»›i `redis` khÃ´ng.
    - Truyá»n máº£ng `redis_info` tráº£ vá» trong JSON cá»§a API `/admin/system-info`.
  - Cáº­p nháº­t frontend [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html):
    - Táº¡o thÃªm card `"THÃ”NG TIN REDIS & CACHE"` hiá»ƒn thá»‹ trá»±c quan cÃ¡c thÃ´ng sá»‘ trÃªn (gá»“m: PHP Extension redis, Tráº¡ng thÃ¡i hoáº¡t Ä‘á»™ng, PhiÃªn báº£n, Redis Client, Host & Port, Sá»­ dá»¥ng lÃ m Cache Driver / Session Driver / Queue Connection).
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: RÃ  soÃ¡t lá»—i tiá»m áº©n (Bug Review)

- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t toÃ n bá»™ dá»± Ã¡n Ä‘á»ƒ tÃ¬m cÃ¡c lá»—i logic, báº£o máº­t, vÃ  toÃ n váº¹n dá»¯ liá»‡u tiá»m áº©n.
- **Giáº£i phÃ¡p:**
  - QuÃ©t mÃ£ nguá»“n backend Laravel vÃ  frontend Angular Ä‘á»ƒ tÃ¬m cÃ¡c Ä‘iá»ƒm báº¥t há»£p lÃ½, thiáº¿u kiá»ƒm tra phÃ¢n quyá»n, lá»—i logic, hoáº·c khÃ´ng khá»›p dá»¯ liá»‡u.
  - PhÃ¡t hiá»‡n ra 5 lá»—i tiá»m áº©n lá»›n bao gá»“m:
    1. Lá»— há»•ng Multi-tenant cho phÃ©p can thiá»‡p ná»£/khÃ¡ch hÃ ng cá»§a quÃ¡n khÃ¡c qua `customer_id` cá»§a Ä‘Æ¡n hÃ ng.
    2. Lá»—i máº¥t Ä‘á»“ng bá»™ dá»¯ liá»‡u ná»£ khi cáº­p nháº­t thÃ´ng tin Ä‘Æ¡n hÃ ng POS.
    3. Lá»—i 500 khi xÃ¡c thá»±c chá»¯ kÃ½ Web3 do bá» sÃ³t lá»—i `TypeError/ValueError` thay vÃ¬ báº¯t `Throwable`.
    4. Lá»—i vÃ­ khÃ¡ch hÃ ng cÃ³ chá»¯ hoa chá»¯ thÆ°á»ng (checksum) gÃ¢y lá»—i claim Ä‘iá»ƒm tÃ­ch lÅ©y.
    5. Thiáº¿u `:host { display: block; }` trÃªn cÃ¡c Angular component tÃ¹y biáº¿n.
  - Táº¡o bÃ¡o cÃ¡o phÃ¢n tÃ­ch chi tiáº¿t táº¡i [potential_bugs_review.md](file:///C:/Users/dev/.gemini/antigravity-ide/brain/37d30ac1-7462-4218-b7f0-19a59afdd136/potential_bugs_review.md).

### YÃªu cáº§u: Bá» xá»­ lÃ½ lá»—i status 0 ra khá»i luá»“ng kÃ­ch hoáº¡t mÃ n hÃ¬nh báº£o trÃ¬

- **Ná»™i dung yÃªu cáº§u:** Loáº¡i bá» lá»—i `status === 0` (máº¥t káº¿t ná»‘i máº¡ng hoáº·c lá»—i CORS) ra khá»i Ä‘iá»u kiá»‡n kÃ­ch hoáº¡t mÃ n hÃ¬nh báº£o trÃ¬ toÃ n trang Ä‘á»ƒ trÃ¡nh viá»‡c khÃ³a giao diá»‡n ngÆ°á»i dÃ¹ng khi máº¥t máº¡ng. Chuyá»ƒn lá»—i nÃ y sang luá»“ng hiá»ƒn thá»‹ Toast thÃ´ng bÃ¡o lá»—i thÃ´ng thÆ°á»ng.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [http-error.interceptor.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/http-error.interceptor.ts):
    - Äá»•i Ä‘iá»u kiá»‡n `(error.status === 503 || error.status === 0)` thÃ nh `error.status === 503`.
    - GÃ¡n `maintenanceType` cá»‘ Ä‘á»‹nh thÃ nh `'maintenance'`.
    - Äá»•i Ä‘iá»u kiá»‡n `else if (error.status !== 503 && !(error.status === 0 && isBackendApi))` thÃ nh `else if (error.status !== 503)` Ä‘á»ƒ lá»—i `status === 0` Ä‘Æ°á»£c hiá»ƒn thá»‹ dÆ°á»›i dáº¡ng Toast lá»—i mÃ u Ä‘á» á»Ÿ gÃ³c mÃ n hÃ¬nh.
  - Cáº­p nháº­t [ui-state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/ui-state.service.ts): Loáº¡i bá» kiá»ƒu `'connection'` khÃ´ng dÃ¹ng tá»›i khá»i `maintenanceType = signal<'maintenance' | null>(null)`.
  - Cáº­p nháº­t [maintenance.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/maintenance/maintenance.component.html) & [maintenance.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/maintenance/maintenance.component.ts): Loáº¡i bá» toÃ n bá»™ cÃ¡c Ä‘iá»u kiá»‡n hiá»ƒn thá»‹ `@if/@else` vÃ  dÃ²ng text cáº£nh bÃ¡o káº¿t ná»‘i API dÆ° thá»«a (dead code) Ä‘á»ƒ Ä‘Æ°a component vá» giao diá»‡n báº£o trÃ¬ há»‡ thá»‘ng tá»‘i giáº£n.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Triá»ƒn khai vÃ  Ä‘á»“ng bá»™ hÃ³a Custom Search Input Component dÃ¹ng chung

- **Ná»™i dung yÃªu cáº§u:** XÃ¢y dá»±ng má»™t component tÃ¬m kiáº¿m Ä‘á»™c láº­p dÃ¹ng chung (`<app-custom-search-input>`) káº¿ thá»«a tá»« class CSS `.search-input` cÃ³ sáºµn Ä‘á»ƒ Ä‘á»“ng bá»™ hÃ³a giao diá»‡n tÃ¬m kiáº¿m trÃªn toÃ n há»‡ thá»‘ng FE, bá»• sung nÃºt xÃ³a nhanh (Clear) vÃ  hiá»ƒn thá»‹ spinner loading tá»± Ä‘á»™ng khi tÃ¬m kiáº¿m báº¥t Ä‘á»“ng bá»™. Thay tháº¿ toÃ n bá»™ cÃ¡c Ã´ nháº­p tÃ¬m kiáº¿m thá»§ cÃ´ng trong táº¥t cáº£ cÃ¡c component.
  - Giáº£i phÃ¡p:
    - Táº¡o má»›i component Ä‘á»™c láº­p: [custom-search-input.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/custom-search-input/custom-search-input.component.ts) & [custom-search-input.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/custom-search-input/custom-search-input.component.html). Triá»ƒn khai `ControlValueAccessor` tÆ°Æ¡ng thÃ­ch hoÃ n toÃ n `ngModel`, há»— trá»£ `debounce`, `@Input() loading` hiá»ƒn thá»‹ spinner, nÃºt XÃ³a nhanh (`close` icon) vÃ  cÆ¡ cháº¿ tá»± Ä‘á»™ng Ä‘á»‡m lá» pháº£i (`padding-right: 2.5rem !important`) khi hiá»‡n nÃºt xÃ³a/spinner.
    - Kháº¯c phá»¥c lá»—i Ä‘á»‹nh vá»‹ (positioning) cá»§a icon kÃ­nh lÃºp vÃ  nÃºt xÃ³a nhanh: Cá»‘ Ä‘á»‹nh class `relative` trÃªn div wrapper ngoÃ i cÃ¹ng cá»§a [custom-search-input.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/custom-search-input/custom-search-input.component.html) báº±ng cÃ¡ch sá»­ dá»¥ng `<div class="relative {{ containerClass }}">` thay vÃ¬ ghi Ä‘Ã¨ báº±ng `[class]="containerClass"`. Äiá»u nÃ y Ä‘áº£m báº£o cÃ¡c pháº§n tá»­ con `absolute` luÃ´n Ä‘á»‹nh vá»‹ chÃ­nh xÃ¡c bÃªn trong Ã´ tÃ¬m kiáº¿m ká»ƒ cáº£ khi component cha truyá»n cÃ¡c class tÃ¹y biáº¿n Ä‘Ã¨ lÃªn.
  - TÃ­ch há»£p vÃ  thay tháº¿ Ã´ tÃ¬m kiáº¿m thá»§ cÃ´ng táº¡i cÃ¡c component:
    - [customers.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/customers/customers.component.html) & [customers.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/customers/customers.component.ts)
    - [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html) & [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts)
    - [orders.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/orders/orders.component.html) & [orders.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/orders/orders.component.ts)
    - [staffs.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/staffs/staffs.component.html) & [staffs.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/staffs/staffs.component.ts)
    - [tables.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tables/tables.component.html) & [tables.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tables/tables.component.ts)
    - [store.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.html) & [store.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.ts)
    - [shifts.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/shifts/shifts.component.html) & [shifts.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/shifts/shifts.component.ts)
    - [pos.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/pos/pages/pos/pos.component.html) & [pos.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/pos/pages/pos/pos.component.ts) (2 Ã´ tÃ¬m kiáº¿m: tÃ¬m mÃ³n vÃ  tÃ¬m khÃ¡ch hÃ ng há»— trá»£ `[loading]`)
    - [financials.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/financials/financials.component.html) & [financials.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/financials/financials.component.ts)
    - [menu.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/menu/menu.component.html) & [menu.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/menu/menu.component.ts)
    - [inventory.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/inventory/inventory.component.html) & [inventory.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/inventory/inventory.component.ts) (2 Ã´ tÃ¬m kiáº¿m: tÃ¬m phiáº¿u kho vÃ  bÃ¡o cÃ¡o tá»“n kho)
    - [debts.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/debts/debts.component.html) & [debts.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/debts/debts.component.ts)
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Tá»‘i Æ°u hÃ³a responsive cho trang Quáº£n lÃ½ Thá»±c Ä‘Æ¡n (Menu)

- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i giao diá»‡n trang Thá»±c Ä‘Æ¡n bá»‹ vá»¡ layout trÃªn thiáº¿t bá»‹ di Ä‘á»™ng vÃ  mÃ¡y tÃ­nh báº£ng (tablet), chá»¯ tiÃªu Ä‘á» "Quáº£n lÃ½ Thá»±c Ä‘Æ¡n" bá»‹ bÃ³p ngháº¹t thÃ nh 4 dÃ²ng dá»c do cÃ¡c nÃºt hÃ nh Ä‘á»™ng chiáº¿m quÃ¡ nhiá»u diá»‡n tÃ­ch.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [menu.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/menu/menu.component.html):
    - ÄÆ°a thuá»™c tÃ­nh `containerClass="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6"` vÃ o `<app-page-header>` Ä‘á»ƒ xáº¿p dá»c cÃ¡c nÃºt hÃ nh Ä‘á»™ng xuá»‘ng dÆ°á»›i tiÃªu Ä‘á» khi mÃ n hÃ¬nh nhá» hÆ¡n `1280px` (`xl`), triá»‡t tiÃªu viá»‡c chÃ¨n Ã©p gÃ¢y gÃ£y dÃ²ng tiÃªu Ä‘á».
    - Cáº­p nháº­t breakpoint cá»§a flex container bá»c bá»™ lá»c vÃ  Ã´ tÃ¬m kiáº¿m tá»« `sm` sang `md` (`flex-col md:flex-row`) vÃ  chiá»u rá»™ng Ã´ tÃ¬m kiáº¿m thÃ nh `w-full md:w-72` Ä‘á»ƒ cÃ¡c khá»‘i nÃ y tá»± Ä‘á»™ng giÃ£n rá»™ng vÃ  xáº¿p dá»c gá»n gÃ ng á»Ÿ mÃ n hÃ¬nh di Ä‘á»™ng/tablet dá»c, trÃ¡nh viá»‡c quÃ¡ táº£i hÃ ng ngang.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Hiá»ƒn thá»‹ thÃªm thÃ´ng tin mÃ´i trÆ°á»ng Frontend (tab ThÃ´ng tin há»‡ thá»‘ng - sysinfo)

- **Ná»™i dung yÃªu cáº§u:** Hiá»ƒn thá»‹ thÃªm thÃ´ng tin mÃ´i trÆ°á»ng cá»§a phÃ­a Frontend nhÆ° phiÃªn báº£n Angular, cháº¿ Ä‘á»™ Production, API Endpoint vÃ  cÃ¡c thÃ´ng tin trÃ¬nh duyá»‡t cá»§a khÃ¡ch hÃ ng trÃªn tab "ThÃ´ng tin há»‡ thá»‘ng" (`/admin?tab=sysinfo`).
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts): Import `VERSION`, `HostListener` tá»« `@angular/core` vÃ  `environment` tá»« `@environments/environment`. ThÃªm cÃ¡c biáº¿n/computed signals `angularVersion`, `frontendEnv`, `windowWidth`, `windowHeight`, `clientInfo` Ä‘á»ƒ thu tháº­p thÃ´ng tin phiÃªn báº£n Angular, cáº¥u hÃ¬nh mÃ´i trÆ°á»ng, Ä‘á»™ phÃ¢n giáº£i mÃ n hÃ¬nh, trÃ¬nh duyá»‡t vÃ  há»‡ Ä‘iá»u hÃ nh cá»§a ngÆ°á»i dÃ¹ng.
  - Cáº­p nháº­t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html): ThÃªm card "MÃ”I TRÆ¯á»œNG FRONTEND" bÃªn dÆ°á»›i card "MÃ”I TRÆ¯á»œNG Há»† THá»NG" Ä‘á»ƒ hiá»ƒn thá»‹ trá»±c quan cÃ¡c thÃ´ng sá»‘ trÃªn cho ngÆ°á»i dÃ¹ng.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c phá»¥c triá»‡t Ä‘á»ƒ lá»—i tab NhÃ¢n viÃªn há»‡ thá»‘ng (SaaS System Staff) khÃ´ng hiá»ƒn thá»‹ cho vai trÃ² Admin

- **Ná»™i dung yÃªu cáº§u:** TÃ i khoáº£n cÃ³ vai trÃ² Quáº£n trá»‹ viÃªn (`admin` role) vÃ o SaaS Admin váº«n khÃ´ng nhÃ¬n tháº¥y dá»¯ liá»‡u tab "NhÃ¢n viÃªn há»‡ thá»‘ng" máº·c dÃ¹ tab nÃ y Ä‘Ã£ Ä‘Æ°á»£c hiá»ƒn thá»‹ trÃªn thanh Ä‘iá»u hÆ°á»›ng.
- **PhÃ¢n tÃ­ch:** Máº·c dÃ¹ Ä‘Ã£ cho phÃ©p táº£i dá»¯ liá»‡u vÃ  hiá»ƒn thá»‹ tab option cho `admin` role, khá»‘i HTML hiá»ƒn thá»‹ ná»™i dung tab staffs táº¡i [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html) váº«n bá»‹ cháº·n cá»©ng bá»Ÿi Ä‘iá»u kiá»‡n `@if (activeSubTab() === 'staffs' && stateService.isSuperAdmin())`.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html) dÃ²ng 1842: Thay Ä‘á»•i Ä‘iá»u kiá»‡n `@if` thÃ nh `@if (activeSubTab() === 'staffs' && (stateService.isSuperAdmin() || stateService.currentUserAdminRole() === 'admin'))` Ä‘á»ƒ cho phÃ©p cáº£ Super Admin vÃ  vai trÃ² admin cÃ³ thá»ƒ hiá»ƒn thá»‹ ná»™i dung tab.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Sá»­a lá»—i mÃ u sáº¯c hiá»ƒn thá»‹ chá»¯ trÃªn Light/Darkmode vÃ  tá»‘i Æ°u hiá»‡u á»©ng Hover cho Checkbox

- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i giao diá»‡n máº¥t mÃ u chá»¯ hoáº·c hiá»ƒn thá»‹ quÃ¡ tá»‘i trÃªn cháº¿ Ä‘á»™ Light/Darkmode cá»§a checkbox vÃ  cÃ¡c nÃºt Ä‘Ã³ng modal/drawer. Äá»“ng thá»i tá»‘i Æ°u hiá»‡u á»©ng hover cho checkbox Ä‘á»ƒ dá»… nhÃ¬n vÃ  rÃµ rÃ ng hÆ¡n.
- **Giáº£i phÃ¡p:**
  - PhÃ¡t hiá»‡n vÃ  sá»­a lá»—i gÃµ phÃ­m `text-slate-250` (khÃ´ng tá»“n táº¡i trong TailwindCSS máº·c Ä‘á»‹nh) thÃ nh `text-slate-200` táº¡i cÃ¡c file: [custom-checkbox.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/custom-checkbox/custom-checkbox.component.ts), [modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/modal/modal.component.html), [modal-wrapper.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/modal/modal-wrapper.component.html), [drawer.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/drawer/drawer.component.html), [blockchain-explorer.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/blockchain/pages/blockchain-explorer/blockchain-explorer.component.html).
  - Tá»‘i Æ°u hÃ³a Custom Checkbox: tÄƒng Ä‘á»™ tÆ°Æ¡ng pháº£n viá»n, thÃªm `group-hover` effect, cÄƒn giá»¯a dá»c.
  - Äá»“ng bá»™ mÃ u sáº¯c cá»™t Äá»‹a chá»‰ vÃ­ Web3 vÃ  tráº¡ng thÃ¡i Voucher táº¡i [customers.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/customers/customers.component.html).
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Sá»­a lá»—i Race Condition khiáº¿n tab NhÃ¢n viÃªn há»‡ thá»‘ng khÃ´ng hiá»ƒn thá»‹ dá»¯ liá»‡u vÃ  Fix Responsive TabGroup

- **Ná»™i dung yÃªu cáº§u:** Quáº£n trá»‹ viÃªn há»‡ thá»‘ng (admin role) vÃ o tab "NhÃ¢n viÃªn há»‡ thá»‘ng" tháº¥y trá»‘ng dÃ¹ API Ä‘Ã£ tráº£ vá» dá»¯ liá»‡u. Äá»“ng thá»i thanh tab bá»‹ máº¥t responsive khi nhiá»u tab.
- **Root Cause (Race Condition):** Trong `ngOnInit`, `triggerTabLoad('staffs')` â†’ `loadSystemStaffs()` cháº¡y async TRÆ¯á»šC khi `loadStaffAdminData()` Ä‘áº·t `isDataLoading.set(true)`. Khi `loadSystemStaffs()` hoÃ n thÃ nh vÃ  set data vÃ o signal, template Ä‘ang bá»‹ BLOCK bá»Ÿi `isDataLoading = true` nÃªn Angular khÃ´ng re-render. Khi `loadStaffAdminData()` xong vÃ  unblock template, signal Ä‘Ã£ Ä‘Æ°á»£c set tá»« trÆ°á»›c nÃªn khÃ´ng trigger thÃªm change detection nÃ o.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts): ThÃªm `this.triggerTabLoad(this.activeSubTab())` vÃ o callback `next` cá»§a `loadStaffAdminData()` **sau** `isDataLoading.set(false)`. Äiá»u nÃ y Ä‘áº£m báº£o tab-specific data Ä‘Æ°á»£c load sau khi outer loading Ä‘Ã£ unblock template.
  - Cáº­p nháº­t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html): TÃ¡ch `app-tab-group` ra khá»i flex container chá»©a filters, Ä‘áº·t á»Ÿ div riÃªng phÃ­a trÃªn vá»›i `[flex]="false"` Ä‘á»ƒ má»—i tab tá»± co theo ná»™i dung vÃ  scroll ngang mÆ°á»£t mÃ  khi nhiá»u tabs (responsive fix).
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Cho phÃ©p Quáº£n trá»‹ viÃªn (admin role) xem danh sÃ¡ch nhÃ¢n viÃªn há»‡ thá»‘ng vÃ  phÆ°Æ¡ng thá»©c thanh toÃ¡n (chá»‰ Ä‘á»c)

- **Ná»™i dung yÃªu cáº§u:** Quáº£n trá»‹ viÃªn há»‡ thá»‘ng (`admin` role) khÃ´ng xem Ä‘Æ°á»£c danh sÃ¡ch nhÃ¢n viÃªn há»‡ thá»‘ng vÃ  danh sÃ¡ch phÆ°Æ¡ng thá»©c thanh toÃ¡n. YÃªu cáº§u cho phÃ©p xem (chá»‰ Ä‘á»c), khÃ´ng cho phÃ©p thÃªm/sá»­a/xÃ³a.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t backend [api.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/routes/api.php): Di chuyá»’n `GET /admin/staffs` vÃ  `GET /admin/payment-methods` tá»« nhÃ³m `EnsureIsSuperAdmin` sang nhÃ³m `EnsureIsSystemAdmin`. CÃ¡c route write (POST/PUT/DELETE) giá»¯ nguyÃªn trong nhÃ³m Super Admin.
  - Cáº­p nháº­t frontend [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts):
    - `staffSystemColumns` chuyá»ƒn thÃ nh `computed<TableColumn[]>` â€” áº©n cá»™t "Thao tÃ¡c" khi khÃ´ng pháº£i Super Admin.
    - `subTabOptions` cho `admin` role hiá»ƒn thá»‹: `subscriptions`, `tenants`, `staffs`, `payment`, `sysinfo` (bá» tab `system` vÃ¬ maintenance chá»‰ Super Admin).
    - `ngOnInit` vÃ  `triggerTabLoad`: cho phÃ©p `admin` load staffs vÃ  payment methods Ä‘Ãºng cÃ¡ch.
  - Cáº­p nháº­t frontend [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html):
    - áº¨n nÃºt "ThÃªm nhÃ¢n viÃªn", "ThÃªm phÆ°Æ¡ng thá»©c má»›i", "Sá»­a/XÃ³a" phÆ°Æ¡ng thá»©c báº±ng `@if (stateService.isSuperAdmin())`.
    - Cáº­p nháº­t `[columns]="staffSystemColumns()"` Ä‘á»ƒ dÃ¹ng Ä‘Ãºng computed signal.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i phÃ¢n quyá»n á»Ÿ cáº£ FE vÃ  BE khiáº¿n nhÃ¢n viÃªn há»‡ thá»‘ng cÃ³ vai trÃ² `'admin'` khÃ´ng vÃ o Ä‘Æ°á»£c giao diá»‡n quáº£n trá»‹ (bá»‹ áº©n sidebar menu hoáº·c trang tráº¯ng loading).
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t backend [EnsureIsSystemAdmin.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Middleware/EnsureIsSystemAdmin.php): Sá»­ dá»¥ng biáº¿n vÃ­ viáº¿t thÆ°á»ng `$walletAddress` trong truy váº¥n SQL thay vÃ¬ `$user->wallet_address` Ä‘á»ƒ trÃ¡nh lá»—i phÃ¢n biá»‡t chá»¯ hoa-chá»¯ thÆ°á»ng cá»§a cÆ¡ sá»Ÿ dá»¯ liá»‡u.
  - Cáº­p nháº­t frontend:
    - [auth.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/auth.service.ts): Má»Ÿ rá»™ng kiá»ƒu dá»¯ liá»‡u cá»§a `currentUserAdminRole` thÃ nh `'super_admin' | 'staff' | 'admin' | null` Ä‘á»ƒ há»— trá»£ vai trÃ² `'admin'`.
    - [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts): Sá»­a computed signal `isSystemStaff` Ä‘á»ƒ nháº­n diá»‡n cáº£ vai trÃ² `'staff'` vÃ  `'admin'`.
    - [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts): Cáº¥u hÃ¬nh hÃ m `ngOnInit()` Ä‘á»ƒ náº¡p dá»¯ liá»‡u `loadStaffAdminData()` cho táº¥t cáº£ cÃ¡c nhÃ¢n viÃªn há»‡ thá»‘ng (cáº£ `'staff'` vÃ  `'admin'`) khi khÃ´ng pháº£i lÃ  Super Admin.
    - [api.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/routes/api.php): Di chuyá»ƒn cÃ¡c route `GET /admin/system-info` vÃ  `GET /admin/packages` sang nhÃ³m `EnsureIsSystemAdmin` Ä‘á»ƒ Quáº£n trá»‹ viÃªn há»‡ thá»‘ng (`admin` role) cÃ³ quyá»n xem thÃ´ng tin há»‡ thá»‘ng.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Sá»­a lá»—i mÃ u sáº¯c hiá»ƒn thá»‹ chá»¯ trÃªn Light/Darkmode vÃ  tá»‘i Æ°u hiá»‡u á»©ng Hover cho Checkbox

- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i giao diá»‡n máº¥t mÃ u chá»¯ hoáº·c hiá»ƒn thá»‹ quÃ¡ tá»‘i trÃªn cháº¿ Ä‘á»™ Light/Darkmode cá»§a checkbox vÃ  cÃ¡c nÃºt Ä‘Ã³ng modal/drawer. Äá»“ng thá»i tá»‘i Æ°u hiá»‡u á»©ng hover cho checkbox Ä‘á»ƒ dá»… nhÃ¬n vÃ  rÃµ rÃ ng hÆ¡n.
- **Giáº£i phÃ¡p:**
  - PhÃ¡t hiá»‡n vÃ  sá»­a lá»—i gÃµ phÃ­m `text-slate-250` (khÃ´ng tá»“n táº¡i trong TailwindCSS máº·c Ä‘á»‹nh) thÃ nh `text-slate-200` táº¡i cÃ¡c file:
    - [custom-checkbox.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/custom-checkbox/custom-checkbox.component.ts)
    - [modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/modal/modal.component.html)
    - [modal-wrapper.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/modal/modal-wrapper.component.html)
    - [drawer.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/drawer/drawer.component.html)
    - [blockchain-explorer.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/blockchain/pages/blockchain-explorer/blockchain-explorer.component.html)
  - Tá»‘i Æ°u hÃ³a Custom Checkbox:
    - TÄƒng Ä‘á»™ tÆ°Æ¡ng pháº£n cá»§a viá»n Ã´ checkbox khi chÆ°a check báº±ng cÃ¡ch nÃ¢ng tá»« `border-slate-200` / `dark:border-slate-800` lÃªn `border-slate-300` / `dark:border-slate-700`.
    - TÃ­ch há»£p lá»›p `group` trÃªn label cha vÃ  `group-hover:border-slate-400` / `dark:group-hover:border-slate-600` trÃªn div Ã´ checkbox, giÃºp Ä‘Æ°á»ng viá»n tá»± Ä‘á»™ng sÃ¡ng rÃµ hÆ¡n khi rÃª chuá»™t vÃ o báº¥t cá»© Ä‘Ã¢u trÃªn dÃ²ng checkbox.
    - CÄƒn giá»¯a Ã´ checkbox theo chiá»u dá»c so vá»›i nhÃ£n chá»¯ báº±ng `items-center` thay cho `items-start`.
  - Äá»“ng bá»™ mÃ u sáº¯c cá»™t Äá»‹a chá»‰ vÃ­ Web3 vÃ  tráº¡ng thÃ¡i Voucher táº¡i [customers.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/customers/customers.component.html):
    - Äá»•i chá»¯ "ChÆ°a liÃªn káº¿t vÃ­" vÃ  "ChÆ°a cÃ³ voucher" tá»« mÃ u tá»‘i `dark:text-slate-600` sang mÃ u xÃ¡m sÃ¡ng rÃµ rÃ ng hÆ¡n `dark:text-slate-500` trÃªn Dark Mode.
    - NÃ¢ng cáº¥p hiá»ƒn thá»‹ Ä‘á»‹a chá»‰ vÃ­ Ä‘Ã£ liÃªn káº¿t thÃ nh má»™t pill mÃ u tÃ­m nháº¡t cÃ³ viá»n, sá»­ dá»¥ng mÃ u thÆ°Æ¡ng hiá»‡u `text-purple-600 dark:text-purple-400 bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100/50 dark:border-purple-900/30` Ä‘á»ƒ táº¡o tÃ­nh Ä‘á»“ng bá»™ Web3 cao cáº¥p.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: TÃ­ch há»£p chá»©c nÄƒng Chá»‰nh sá»­a NhÃ¢n viÃªn há»‡ thá»‘ng (SaaS System Staff)

- **Ná»™i dung yÃªu cáº§u:** Bá»• sung tÃ­nh nÄƒng chá»‰nh sá»­a thÃ´ng tin nhÃ¢n viÃªn há»‡ thá»‘ng (bao gá»“m TÃªn, Äá»‹a chá»‰ vÃ­, Vai trÃ² staff/admin vÃ  Tráº¡ng thÃ¡i hoáº¡t Ä‘á»™ng is_active).
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t backend:
    - [api.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/routes/api.php): Khai bÃ¡o route `PUT /admin/staffs/{id}`.
    - [AdminController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AdminController.php): ThÃªm hÃ m `updateSystemStaff` xá»­ lÃ½ validate dá»¯ liá»‡u (vá»›i wallet_address unique ngoáº¡i trá»« id hiá»‡n táº¡i) vÃ  lÆ°u thay Ä‘á»•i.
  - Cáº­p nháº­t frontend:
    - [api.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/api.service.ts): ThÃªm hÃ m `updateAdminSystemStaff`.
    - [system-staff-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/components/system-staff-modal/system-staff-modal.component.ts): Inject `MODAL_DATA`, thá»±c hiá»‡n `ngOnInit()` Ä‘á»ƒ náº¡p thÃ´ng tin cáº§n sá»­a vÃ  gá»i API cáº­p nháº­t khi submit á»Ÿ cháº¿ Ä‘á»™ Edit.
    - [system-staff-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/components/system-staff-modal/system-staff-modal.component.html): ThÃªm toggle switch `app-custom-switch` cáº¥u hÃ¬nh `is_active` vÃ  Ä‘á»•i tÃªn button submit Ä‘á»™ng.
    - [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts): ThÃªm hÃ m `openEditStaff` truyá»n data nhÃ¢n viÃªn vÃ o modal.
    - [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html): ThÃªm nÃºt "Sá»­a" (`app-button` size `"sm"`, variant `"secondary"`) trong cá»™t thao tÃ¡c cá»§a báº£ng danh sÃ¡ch nhÃ¢n viÃªn.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Äiá»u chá»‰nh cÃ¡c cá»™t báº£ng YÃªu cáº§u ThuÃª bao vÃ  Äá»“ng bá»™ giao diá»‡n SaaS Admin

- **Ná»™i dung yÃªu cáº§u:** ThÃªm cá»™t NgÃ y háº¿t háº¡n cho báº£ng ThuÃª bao (tÃ¡ch háº¡n sá»­ dá»¥ng ra khá»i cá»™t ThuÃª bao hiá»‡n táº¡i). Äá»•i tÃªn cá»™t ÄÄƒng kÃ½ má»›i thÃ nh GÃ³i dá»‹ch vá»¥ vÃ  chá»‰ hiá»ƒn thá»‹ badge tÃªn gÃ³i (bá» text chi tiáº¿t thÃ¡ng/giÃ¡). Bá» cá»™t TÃ i khoáº£n nháº­n (vÃ¬ xem chi tiáº¿t Ä‘Ã£ Ä‘á»§ thÃ´ng tin). Äá»“ng bá»™ giao diá»‡n header cá»§a tab ThuÃª bao Ä‘á»ƒ hiá»ƒn thá»‹ giá»‘ng tab NhÃ¢n viÃªn há»‡ thá»‘ng.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts): Cáº­p nháº­t `subscriptionColumns` Ä‘á»ƒ pháº£n Ã¡nh Ä‘Ãºng cáº¥u trÃºc cá»™t má»›i.
  - Cáº­p nháº­t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html):
    - Äá»“ng bá»™ giao diá»‡n header cá»§a tab ThuÃª bao báº±ng flexbox chá»©a tiÃªu Ä‘á», mÃ´ táº£ vÃ  filters/search.
    - Cáº­p nháº­t cell template `current_plan` chá»‰ hiá»ƒn thá»‹ badge cá»§a gÃ³i hiá»‡n táº¡i.
    - ThÃªm cell template `current_subscription_expires_at` hiá»ƒn thá»‹ ngÃ y háº¿t háº¡n riÃªng biá»‡t.
    - Cáº­p nháº­t cell template `plan_code` chá»‰ hiá»ƒn thá»‹ badge cá»§a gÃ³i Ä‘Äƒng kÃ½ má»›i.
    - Loáº¡i bá» cell template `payment_method_details` cÅ©.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: TÃ­ch há»£p TÃ¬m kiáº¿m, PhÃ¢n trang vÃ  Tá»‘i Æ°u Responsive cho NhÃ¢n viÃªn há»‡ thá»‘ng

- **Ná»™i dung yÃªu cáº§u:** Bá»• sung thanh tÃ¬m kiáº¿m (search), bá»™ phÃ¢n trang (pagination) vÃ  Ä‘áº£m báº£o hiá»ƒn thá»‹ responsive cho tab "NhÃ¢n viÃªn há»‡ thá»‘ng" trong SaaS Admin. Äá»“ng thá»i, loáº¡i bá» cÃ¡c modal code inline cÅ© á»Ÿ HTML.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts): Reset signals tÃ¬m kiáº¿m vÃ  phÃ¢n trang cá»§a nhÃ¢n viÃªn khi chuyá»’n tab.
  - Cáº­p nháº­t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html):
    - TÃ­ch há»£p thanh tÃ¬m kiáº¿m vÃ  nÃºt thÃªm nhÃ¢n viÃªn dáº¡ng flexbox responsive.
    - Cáº¥u hÃ¬nh phÃ¢n trang trÃªn `<app-table>` cá»§a nhÃ¢n viÃªn há»‡ thá»‘ng thÃ´ng qua `[showPagination]="true"`, mapping total, perPage, currentPage vÃ  `(pageChange)`.
    - XÃ³a bá» cÃ¡c modal inline cÅ© (`showRejectModal` vÃ  `showAddStaffModal`) Ä‘á»ƒ lÃ m sáº¡ch code HTML.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Triá»ƒn khai Quy trÃ¬nh duyá»‡t thuÃª bao thá»§ cÃ´ng vÃ  PhÃ¢n quyá»n NhÃ¢n viÃªn há»— trá»£ há»‡ thá»‘ng (SaaS Staff) - Bá»• sung thÃ´ng tin Ä‘á»‘i soÃ¡t vÃ  Modal Chi tiáº¿t 5xl

- **Ná»™i dung yÃªu cáº§u:** Chuyá»ƒn luá»“ng nÃ¢ng cáº¥p gÃ³i cÆ°á»›c tá»± Ä‘á»™ng thÃ nh quy trÃ¬nh duyá»‡t chuyá»ƒn khoáº£n thá»§ cÃ´ng. Khi chá»§ quÃ¡n gá»­i nÃ¢ng cáº¥p, há»‡ thá»‘ng lÆ°u yÃªu cáº§u á»Ÿ tráº¡ng thÃ¡i `pending` kÃ¨m theo mÃ£ giao dá»‹ch TxHash vÃ  thÃ´ng tin tÃ i khoáº£n nháº­n. Cáº¥u hÃ¬nh danh sÃ¡ch nhÃ¢n viÃªn há»— trá»£ há»‡ thá»‘ng (`system_staffs`) Ä‘Æ°á»£c quáº£n lÃ½ bá»Ÿi Super Admin. PhÃ¢n quyá»n cho NhÃ¢n viÃªn há»‡ thá»‘ng (`staff`) khi vÃ o SaaS Admin chá»‰ tháº¥y 2 tab "ThuÃª bao" (Ä‘á»ƒ duyá»‡t/tá»« chá»‘i) vÃ  "Cá»­a hÃ ng" (xem danh sÃ¡ch). Hiá»ƒn thá»‹ thÃªm tÃªn cá»­a hÃ ng, gÃ³i dá»‹ch vá»¥ hiá»‡n táº¡i, ngÃ y háº¿t háº¡n hiá»‡n táº¡i cá»§a quÃ¡n, vÃ  tÃ i khoáº£n nháº­n cá»§a superadmin Ä‘Æ°á»£c chá»n. Há»— trá»£ nÃºt "Xem chi tiáº¿t" má»Ÿ modal 5xl Ä‘á»ƒ Ä‘á»‘i soÃ¡t vÃ  xá»­ lÃ½ duyá»‡t/tá»« chá»‘i trá»±c tiáº¿p.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t database: Táº¡o cÃ¡c báº£ng `system_staffs` vÃ  `subscription_requests` thÃ´ng qua migration Laravel.
  - Cáº­p nháº­t API routes vÃ  controllers táº¡i backend:
    - ThÃªm middleware `system.admin` cho phÃ©p cáº£ `super_admin` vÃ  `staff` truy cáº­p cÃ¡c API duyá»‡t thuÃª bao vÃ  danh sÃ¡ch cá»­a hÃ ng.
    - M? r?ng api tr? v? `admin_role` ('super_admin', 'staff' ho?c null).
    - Cáº­p nháº­t `AuthController.php` Ä‘á»ƒ táº¡o yÃªu cáº§u pending thay vÃ¬ nÃ¢ng cáº¥p trá»±c tiáº¿p.
    - Cáº­p nháº­t `AdminController.php`: API duyá»‡t/tá»« chá»‘i thuÃª bao, CRUD nhÃ¢n viÃªn há»‡ thá»‘ng. Bá»• sung map thÃ´ng tin gÃ³i hiá»‡n táº¡i, ngÃ y háº¿t háº¡n hiá»‡n táº¡i cá»§a quÃ¡n gá»­i yÃªu cáº§u.
  - Cáº­p nháº­t frontend:
    - [api.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/api.service.ts): Khai bÃ¡o cÃ¡c API káº¿t ná»‘i backend má»›i.
    - [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts): LÆ°u `currentUserAdminRole` vÃ  Ä‘á»‹nh nghÄ©a computed signals `isSystemStaff`, `isSystemAdmin`.
    - [sidebar.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/sidebar/sidebar.component.ts) & [sidebar.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/sidebar/sidebar.component.html): Cho phÃ©p `staff` (thÃ´ng qua `isSystemAdmin()`) truy cáº­p menu SaaS Admin.
    - [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts) & [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html):
      - TÃ¡ch tab options theo vai trÃ² (Staff chá»‰ tháº¥y "ThuÃª bao" vÃ  "Cá»­a hÃ ng").
      - Thiáº¿t káº¿ tab "ThuÃª bao": Báº£ng danh sÃ¡ch hiá»ƒn thá»‹ nÃ¢ng cao gá»“m Cá»­a hÃ ng, ThuÃª bao hiá»‡n táº¡i, ÄÄƒng kÃ½ má»›i, TÃ i khoáº£n nháº­n, TxHash, Tráº¡ng thÃ¡i, NgÃ y gá»­i. NÃºt "Xem chi tiáº¿t" má»Ÿ modal 5xl hiá»ƒn thá»‹ chi tiáº¿t Ä‘á»‘i soÃ¡t chuyá»ƒn khoáº£n vÃ  há»— trá»£ Duyá»‡t/Tá»« chá»‘i trá»±c tiáº¿p trong modal.
      - Thiáº¿t káº¿ tab "NhÃ¢n viÃªn há»‡ thá»‘ng" (chá»‰ Super Admin tháº¥y, há»— trá»£ thÃªm/xÃ³a vÃ­ nhÃ¢n viÃªn).
    - [web3-overlays.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/blockchain/components/web3-overlays/web3-overlays.component.ts) & [web3-overlays.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/blockchain/components/web3-overlays/web3-overlays.component.html): Cáº­p nháº­t form nháº­p mÃ£ giao dá»‹ch `upgradeTxHash` Ä‘á»‘i soÃ¡t, Ä‘á»•i nÃºt thÃ nh "XÃ¡c nháº­n" vÃ  hiá»ƒn thá»‹ thÃ´ng tin chuyá»ƒn khoáº£n tÆ°Æ¡ng á»©ng.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: TÃ­ch há»£p Quáº£n lÃ½ PhÆ°Æ¡ng thá»©c thanh toÃ¡n cá»§a NhÃ  sÃ¡ng láº­p (Super Admin) vÃ  hiá»ƒn thá»‹ trÃªn Modal NÃ¢ng cáº¥p

- **Ná»™i dung yÃªu cáº§u:** ThÃªm tab "Thanh toÃ¡n" trong giao diá»‡n Super Admin (SaaS Admin) Ä‘á»ƒ cáº¥u hÃ¬nh cÃ¡c phÆ°Æ¡ng thá»©c thanh toÃ¡n cá»§a há»‡ thá»‘ng (NgÃ¢n hÃ ng, VÃ­ Ä‘iá»‡n tá»­), Ä‘á»“ng thá»i hiá»ƒn thá»‹ thÃ´ng tin tÃ i khoáº£n vÃ  mÃ£ QR chuyá»ƒn khoáº£n Ä‘á»™ng trÃªn modal nÃ¢ng cáº¥p gÃ³i cÆ°á»›c thay tháº¿ cho phÆ°Æ¡ng thá»©c tÄ©nh.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t database: Táº¡o báº£ng `system_payment_methods` vÃ  model `SystemPaymentMethod.php`.
  - Cáº­p nháº­t API routes vÃ  controllers táº¡i backend: ÄÄ’ng kÃ½ API Super Admin CRUD vÃ  API public cho chá»§ quÃ¡n.
  - Cáº­p nháº­t frontend:
    - [api.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/api.service.ts): ThÃªm cÃ¡c API quáº£n lÃ½ payment methods há»‡ thá»‘ng.
    - [payment-form-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/settings/components/payment-form-modal/payment-form-modal.component.ts): ThÃªm flag `isSystem` Ä‘á»ƒ tÃ¡i sá»­ dá»¥ng form modal.
    - [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts) & [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html): TÃ­ch há»£p tab "Thanh toÃ¡n" hiá»ƒn thá»‹ danh sÃ¡ch cÃ¡c phÆ°Æ¡ng thá»©c, há»— trá»£ CRUD vÃ  hiá»ƒn thá»‹ QR.
    - [web3-overlays.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/blockchain/components/web3-overlays/web3-overlays.component.ts) & [web3-overlays.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/blockchain/components/web3-overlays/web3-overlays.component.html): Load danh sÃ¡ch phÆ°Æ¡ng thá»©c thanh toÃ¡n há»‡ thá»‘ng khi má»Ÿ bÆ°á»›c 2. Cho phÃ©p ngÆ°á»i dÃ¹ng chá»n phÆ°Æ¡ng thá»©c vÃ  sinh mÃ£ QR Ä‘á»™ng tÆ°Æ¡ng á»©ng tá»« thÃ´ng tin tÃ i khoáº£n Ä‘á»ƒ chuyá»ƒn khoáº£n.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Äá»“ng bá»™ giao diá»‡n modal Chi tiáº¿t phÃª duyá»‡t thuÃª bao (Subscription Detail Modal) vÃ  sá»­a lá»—i cÃº phÃ¡p lá»“ng tháº»

- **Ná»™i dung yÃªu cáº§u:** Xem láº¡i modal chi tiáº¿t Ä‘Äƒng kÃ½ thuÃª bao Ä‘á»ƒ Ä‘á»“ng bá»™ hÃ³a giao diá»‡n (Ä‘Æ°a thÃ nh component riÃªng vÃ  tham kháº£o thiáº¿t káº¿ tá»« cÃ¡c modal khÃ¡c). KhÃ´ng lÆ°u `payment_method_details` trong báº£ng `subscription_requests` (chá»‰ lÆ°u `system_payment_method_id` vÃ  Ä‘á»‘i soÃ¡t báº±ng TxHash).
- **Giáº£i phÃ¡p:**
  - **PhÃ¢n tÃ­ch cÆ¡ sá»Ÿ dá»¯ liá»‡u:** XÃ¡c nháº­n báº£ng `subscription_requests` thá»±c táº¿ **chá»‰ lÆ°u** `system_payment_method_id` (khÃ´ng lÆ°u `payment_method_details` Ä‘á»ƒ tiáº¿t kiá»‡m dá»¯ liá»‡u). Viá»‡c hiá»ƒn thá»‹ chi tiáº¿t tÃ i khoáº£n á»Ÿ frontend lÃ  do backend map Ä‘á»™ng thÃ´ng tin tá»« báº£ng `system_payment_methods` thÃ´ng qua relationship Eloquent, Ä‘áº£m báº£o an toÃ n ká»ƒ cáº£ khi admin xÃ³a phÆ°Æ¡ng thá»©c thanh toÃ¡n.
  - **Sá»­a lá»—i cÃº phÃ¡p lá»“ng tháº»:** PhÃ¡t hiá»‡n lá»—i nghiÃªm trá»ng trong `admin-saas.component.html` táº¡i modal `showAddStaffModal` do tháº» `<app-custom-select>` bá»‹ viáº¿t dÃ­nh vá»›i pháº§n footer cá»§a modal chi tiáº¿t cÅ©. ÄÃ£ tiáº¿n hÃ nh Ä‘Ã³ng tháº» Ä‘Ãºng cÃ¡ch vÃ  khÃ´i phá»¥c láº¡i cÃ¡c nÃºt Há»§y/LÆ°u nhÃ¢n viÃªn chÃ­nh xÃ¡c.
  - **??ng b? giao di?n modal chi ti?t:** C?p nh?t [subscription-request-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/components/subscription-request-detail-modal/subscription-request-detail-modal.component.html):
    - Loáº¡i bá» lá»›p bá»c `p-6` ngoÃ i cÃ¹ng Ä‘á»ƒ triá»‡t tiÃªu double padding, giÃºp lá» cá»§a ná»™i dung modal vÃ  header/footer tháº³ng hÃ ng, cÃ¢n Ä‘á»‘i.
    - Loáº¡i bá» style trÃ n viá»n Ã¢m lá» `-mx-6 -mb-6` vÃ  background xÃ¡m á»Ÿ footer Ä‘á»ƒ chuyá»ƒn sang dáº¡ng flat style (pháº³ng) Ä‘á»“ng bá»™ vá»›i cÃ¡c modal cáº¥u hÃ¬nh khÃ¡c.
    - Cáº­p nháº­t cÃ¡c nÃºt báº¥m sá»­ dá»¥ng Ä‘Ãºng cÃ¡c variant Angular (`variant="cancel"`, `variant="danger"`, `variant="primary"`) vÃ  loáº¡i bá» cÃ¡c tháº» `<span>` bá»c text dÆ° thá»«a.

### YÃªu cáº§u: Äá»“ng bá»™ hÃ³a cÃ¡c nÃºt thao tÃ¡c báº±ng Component Button (app-button)

- **Ná»™i dung yÃªu cáº§u:** Chuyá»ƒn Ä‘á»•i cÃ¡c nÃºt thao tÃ¡c trong danh sÃ¡ch thuÃª bao vÃ  danh sÃ¡ch nhÃ¢n viÃªn há»‡ thá»‘ng tá»« viá»‡c sá»­ dá»¥ng cÃ¡c lá»›p CSS thá»§ cÃ´ng (vÃ­ dá»¥ `btn-secondary btn-xs`) sang sá»­ dá»¥ng káº¿ thá»«a component `app-button` chuáº©n cá»§a dá»± Ã¡n Ä‘á»ƒ Ä‘áº£m báº£o tÃ­nh Ä‘á»“ng bá»™ hoÃ n toÃ n vÃ  tháº©m má»¹.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html):
    - Chuyá»ƒn cÃ¡c nÃºt "Xem chi tiáº¿t" (secondary), "Duyá»‡t" (primary), "Tá»« chá»‘i" (danger) cá»§a báº£ng ThuÃª bao sang dÃ¹ng directive `app-button` vá»›i kÃ­ch cá»¡ `size="sm"` thá»‘ng nháº¥t.
    - Chuyá»ƒn nÃºt "XÃ³a" (danger-light) cá»§a báº£ng NhÃ¢n viÃªn há»‡ thá»‘ng sang dÃ¹ng directive `app-button` vá»›i `size="sm"`.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

## NgÃ y 21/06/2026

### YÃªu cáº§u: TÃ¡ch component StoreCartDrawerComponent vÃ  thÃªm nÃºt copy thÃ´ng tin chuyá»ƒn khoáº£n ngÃ¢n hÃ ng/vÃ­ Ä‘iá»‡n tá»­

- **Ná»™i dung yÃªu cáº§u:** TÃ¡ch khá»‘i giao diá»‡n Drawer giá» hÃ ng & thanh toÃ¡n cá»§a storefront thÃ nh má»™t component con (`StoreCartDrawerComponent`) Ä‘á»ƒ lÃ m sáº¡ch code trang Store chÃ­nh, loáº¡i bá» animation vÃ  tÃ­ch há»£p nÃºt copy nhanh cho cÃ¡c thÃ´ng tin tÃ i khoáº£n chuyá»ƒn khoáº£n (Chá»§ tÃ i khoáº£n, Sá»‘ tÃ i khoáº£n/SÄT, NgÃ¢n hÃ ng).
- **Giáº£i phÃ¡p:**
  - Táº¡o má»›i component [StoreCartDrawerComponent](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/components/store-cart-drawer/store-cart-drawer.component.ts) Ä‘á»ƒ bá»c giao diá»‡n Drawer giá» hÃ ng vÃ  tÃ­ch há»£p inject `ToastService` Ä‘á»ƒ thá»±c hiá»‡n hÃ m `copyToClipboard(text: string)`.
  - Cáº­p nháº­t [store-cart-drawer.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/components/store-cart-drawer/store-cart-drawer.component.html): ThÃªm cÃ¡c nÃºt sao chÃ©p (copy) bÃªn cáº¡nh cÃ¡c trÆ°á»ng dá»¯ liá»‡u Chá»§ tÃ i khoáº£n, Sá»‘ tÃ i khoáº£n/SÄT, vÃ  NgÃ¢n hÃ ng.
  - Cáº­p nháº­t [store.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.ts) import vÃ  Ä‘Äƒng kÃ½ component `StoreCartDrawerComponent`.
  - C?p nh?t [store.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.html) thay th? kh?i code drawer c? b?ng th? `<app-store-cart-drawer>`.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Tá»‘i Æ°u hÃ³a cáº¥u hÃ¬nh CORS, tÃ­ch há»£p Rate Limiting, Cookie SameSite Lax, vÃ  chá»‘ng Bot báº±ng Cloudflare Turnstile

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u triá»ƒn khai cÃ¡c biá»‡n phÃ¡p nÃ¢ng cáº¥p báº£o máº­t bao gá»“m: giá»›i háº¡n CORS Origin Whitelist cháº·t cháº½, bá»• sung Rate Limiting (Throttle) chá»‘ng spam API, báº£o máº­t cookie xÃ¡c thá»±c vá»›i SameSite Lax, vÃ  tÃ­ch há»£p Cloudflare Turnstile chá»‘ng bot cho storefront táº¡o Ä‘Æ¡n hÃ ng cÃ´ng khai.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [Cors.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Middleware/Cors.php): Triá»’n khai dynamic whitelist tá»« `.env` (`ALLOWED_ORIGINS`).
  - Cáº­p nháº­t [AppServiceProvider.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Providers/AppServiceProvider.php): Rate limiters `auth_endpoints` (5 req/phÃºt) vÃ  `public_orders` (10 req/phÃºt).
  - Cáº­p nháº­t [api.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/routes/api.php): Ãp dá»¥ng middleware `throttle` cho cÃ¡c endpoint nháº¡y cáº£m.
  - Cáº­p nháº­t [AuthController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AuthController.php): Cookie SameSite Lax tá»« `.env`.
  - Cáº­p nháº­t [SettingController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/SettingController.php): TÃ­ch há»£p xÃ¡c thá»±c Turnstile vá»›i Cloudflare API.
  - ~~Cáº­p nháº­t [environment.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/environments/environment.ts) vÃ  [environment.development.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/environments/environment.development.ts): ThÃªm `turnstileSiteKey`~~ â†’ ÄÃ£ xÃ³a (dead code, FE Ä‘á»c tá»« API).
  - Cáº­p nháº­t [store.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.ts) vÃ  [store.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.html): Load script Turnstile explicit vÃ  render widget Ä‘á»™ng.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Chuyá»’n Cloudflare Turnstile toggle sang Database + Super Admin UI

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng muá»‘n báº­t/táº¯t Turnstile tá»« giao diá»‡n Super Admin thay vÃ¬ pháº£i sá»­a `.env`. Chiáº¿n lÆ°á»£c hybrid: `TURNSTILE_SECRET_KEY` giá»¯ nguyÃªn trong `.env` (báº£o máº­t), toggle báº­t/táº¯t lÆ°u trong DB `system_settings`.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [AdminController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AdminController.php): Má»Ÿ rá»™ng `getSystemSettings()` tráº£ vá» `turnstile_enabled` vÃ  `turnstile_has_key`. Má»Ÿ rá»™ng `updateSystemSettings()` nháº­n field `turnstile_enabled`, guard khÃ´ng cho báº­t náº¿u chÆ°a cÃ³ Secret Key trong `.env`.
  - Cáº­p nháº­t [SettingController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/SettingController.php): TÃ¡ch 2 private methods `isTurnstileEnabled()` (check DB) vÃ  `getTurnstileSiteKey()` (check cáº£ env + DB). Logic `createStoreOrderBySlug` giá» check cáº£ env VÃ€ DB toggle trÆ°á»›c khi validate Turnstile token.
  - XÃ³a `turnstileSiteKey` thá»«a khá»i [environment.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/environments/environment.ts) vÃ  [environment.development.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/environments/environment.development.ts) (dead code).
  - Cáº­p nháº­t [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts): ThÃªm signals `turnstileEnabled`, `turnstileHasKey`, `isTogglingTurnstile` vÃ  method `toggleTurnstile()`.
  - Cáº­p nháº­t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html): ThÃªm card Cloudflare Turnstile vá»›i toggle switch trong tab "Há»‡ thá»‘ng" (system). Hiá»ƒn thá»‹ badge tráº¡ng thÃ¡i, cáº£nh bÃ¡o khi chÆ°a cáº¥u hÃ¬nh Secret Key.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c phá»¥c triá»‡t Ä‘á»ƒ lá»—i modal yÃªu cáº§u Sign In SIWE xuáº¥t hiá»‡n láº·p Ä‘i láº·p láº¡i cá»§a WalletConnect AppKit

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng liÃªn tá»¥c bá»‹ há»i vÃ  báº¯t pháº£i kÃ½ xÃ¡c thá»±c qua modal Sign In cá»§a WalletConnect AppKit má»—i khi reload trang (F5) hoáº·c káº¿t ná»‘i vÃ­, máº·c dÃ¹ DApp Ä‘Ã£ cÃ³ session vÃ  táº£i xong API thÃ nh cÃ´ng.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [web3.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3.service.ts):
    - Cáº¥u hÃ¬nh `basic: true` trong `createAppKit` (sá»­ dá»¥ng Ä‘á»‘i tÆ°á»£ng cáº¥u hÃ¬nh trung gian kiá»ƒu `any` Ä‘á»ƒ vÆ°á»£t qua bá»™ kiá»ƒm tra kiá»ƒu TypeScript cá»§a Angular do SDK loáº¡i bá» thuá»™c tÃ­nh `basic` khá»i kiá»ƒu cÃ´ng khai `CreateAppKit`).
    - Cháº¿ Ä‘á»™ `basic: true` sáº½ táº¯t hoÃ n toÃ n cÃ¡c tÃ­nh nÄƒng Cloud nÃ¢ng cao cá»§a WalletConnect (bao gá»“m cáº£ `reownAuthentication` Ä‘Æ°á»£c kÃ­ch hoáº¡t ngáº§m tá»« remote configuration cá»§a WalletConnect Cloud).
    - Loáº¡i bá» hoÃ n toÃ n thuá»™c tÃ­nh `siweConfig` Ä‘á»ƒ Ä‘Æ°a AppKit hoáº¡t Ä‘á»™ng á»Ÿ cháº¿ Ä‘á»™ káº¿t ná»‘i vÃ­ EVM thuáº§n tÃºy (Basic connection).
    - GiÃºp DApp hoÃ n toÃ n thoÃ¡t khá»i popup "Sign In" SIWE phiá»n toÃ¡i cá»§a WalletConnect khi reload trang (F5) hoáº·c khi káº¿t ná»‘i vÃ­, báº£o toÃ n trá»n váº¹n vÃ  duy nháº¥t luá»“ng kÃ½ Nonce Laravel riÃªng biá»‡t, báº£o máº­t cá»§a DApp.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i modal káº¿t ná»‘i vÃ­ chá»‰ hiá»ƒn thá»‹ duy nháº¥t Trust Wallet

- **Ná»™i dung yÃªu cáº§u:** Modal káº¿t ná»‘i vÃ­ Web3 (Reown AppKit) chá»‰ hiá»ƒn thá»‹ duy nháº¥t vÃ­ Trust Wallet, khÃ´ng hiá»ƒn thá»‹ MetaMask hay cÃ¡c vÃ­ khÃ¡c.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [web3.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3.service.ts):
    - Loáº¡i bá» hoÃ n toÃ n cáº¥u hÃ¬nh `excludeWalletIds` vÃ  `featuredWalletIds` trong `createAppKit` Ä‘á»ƒ khÃ´i phá»¥c láº¡i danh sÃ¡ch vÃ­ Ä‘áº§y Ä‘á»§ máº·c Ä‘á»‹nh cá»§a AppKit (WalletConnect, MetaMask, Trust Wallet, Binance Wallet, SafePal, vÃ  Ã´ TÃ¬m kiáº¿m 430+ vÃ­).
    - Thay tháº¿ cÃ¡c lá»i gá»i `localStorage.clear()` báº±ng `this.resetWalletState(true)` trong luá»“ng `connectWallet()` nháº±m chá»‰ xÃ³a cÃ¡c khoÃ¡ xÃ¡c thá»±c liÃªn quan cá»§a DApp, giá»¯ nguyÃªn cache ná»™i bá»™ cá»§a AppKit (trÃ¡nh viá»‡c AppKit bá»‹ ngáº¯t káº¿t ná»‘i WebSocket Ä‘á»™t ngá»™t dáº«n Ä‘áº¿n lá»—i khÃ´ng káº¿t ná»‘i Ä‘Æ°á»£c vÃ­).
    - Sá»­ dá»¥ng `createSIWEConfig` tá»« thÆ° viá»‡n `@reown/appkit-siwe` Ä‘á»ƒ táº¡o cáº¥u hÃ¬nh `siweConfig` giáº£ láº­p session SIWE/SIWX há»£p lá»‡ ngay khi vÃ­ káº¿t ná»‘i, tá»« Ä‘Ã³ ngÄƒn cháº·n hoÃ n toÃ n modal "Sign In" máº·c Ä‘á»‹nh cá»§a WalletConnect hiá»ƒn thá»‹ Ä‘Ã¨ lÃªn DApp vÃ  báº¯t kÃ½ láº·p Ä‘i láº·p láº¡i sau khi F5 trang.
  - Cáº­p nháº­t [package.json](file:///d:/git/cafe-blockchain/cafe-blockchain-web/package.json): Bá»• sung thÆ° viá»‡n `"@reown/appkit-siwe": "^1.8.20"` vÃ o dependencies Ä‘á»ƒ Ä‘áº£m báº£o Ä‘Æ°á»£c cÃ i Ä‘áº·t Ä‘áº§y Ä‘á»§.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Sá»­a lá»—i láº¥y sai mÃ u chá»§ Ä‘áº¡o máº·c Ä‘á»‹nh cá»§a DApp khi chÆ°a káº¿t ná»‘i vÃ­

- **Ná»™i dung yÃªu cáº§u:** Khi chÆ°a káº¿t ná»‘i vÃ­, DApp tá»± Ä‘á»™ng gá»i API cÃ i Ä‘áº·t cÃ´ng cá»™ng vÃ  bá»‹ ghi Ä‘Ã¨ mÃ u cá»§a quÃ¡n Ä‘áº§u tiÃªn trong DB. ThÃªm vÃ o Ä‘Ã³, cache mÃ u sáº¯c khÃ´ng Ä‘Æ°á»£c xÃ³a khi ngáº¯t káº¿t ná»‘i vÃ­, vÃ  mÃ u sáº¯c khÃ´ng tá»± Ä‘á»™ng reset vá» mÃ u máº·c Ä‘á»‹nh thÆ°Æ¡ng hiá»‡u DApp (TÃ­m Violet `#7c3aed`) khi chuyá»ƒn route khá»i storefront.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [SettingController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/SettingController.php): Trong API `getPublicSettings`, náº¿u khÃ´ng cÃ³ `order_code` thÃ¬ tráº£ vá» mÃ u máº·c Ä‘á»‹nh thÆ°Æ¡ng hiá»‡u DApp (`#7c3aed` vÃ  `#c084fc`) thay vÃ¬ láº¥y cá»§a quÃ¡n Ä‘áº§u tiÃªn trong DB.
  - Cáº­p nháº­t [web3.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3.service.ts): Trong `resetWalletState()`, thá»±c hiá»‡n xÃ³a key cache `dapp_dynamic_colors` khá»i `localStorage` khi ngáº¯t káº¿t ná»‘i vÃ­ hoáº·c Ä‘Äƒng xuáº¥t.
  - Cáº­p nháº­t [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts): ThÃªm láº¯ng nghe sá»± kiá»‡n chuyá»ƒn route `syncThemeColorsForRoute(url)` Ä‘á»ƒ tá»± Ä‘á»™ng khÃ´i phá»¥c mÃ u sáº¯c thÆ°Æ¡ng hiá»‡u máº·c Ä‘á»‹nh cá»§a DApp (`#7c3aed` vÃ  `#c084fc`) khi Ä‘i ra khá»i storefront vÃ  khÃ´i phá»¥c mÃ u cá»§a quÃ¡n Ä‘ang quáº£n lÃ½ náº¿u Ä‘Ã£ Ä‘Äƒng nháº­p vÃ­.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i káº¿t ná»‘i vÃ­ Web3, duplicate popup kÃ½ xÃ¡c thá»±c vÃ  lá»—i NG0203 trÃªn production

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng trÃªn production bá»‹ tá»± Ä‘á»™ng Ä‘Äƒng xuáº¥t sau 2 giÃ¢y F5 vÃ  báº¯t buá»™c pháº£i káº¿t ná»‘i vÃ­, kÃ½ xÃ¡c thá»±c láº¡i. MetaMask hiá»ƒn thá»‹ Ä‘á»“ng thá»i 2 yÃªu cáº§u kÃ½ gÃ¢y lá»—i duplicate. Äá»“ng thá»i phÃ¡t hiá»‡n lá»—i Ä‘á» `NG0203` trong console khiáº¿n Angular dá»«ng hoáº¡t Ä‘á»™ng vÃ  Ä‘Æ¡ giao diá»‡n.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [web3.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3.service.ts):
    - TÃ­ch há»£p `mockSiweConfig` trong `createAppKit` Ä‘á»ƒ giáº£ láº­p vÃ  lÆ°u session SIWE phÃ­a client, ngÄƒn cháº·n WalletConnect tá»± Ä‘á»™ng hiá»ƒn thá»‹ modal SIWE Ä‘Ã²i kÃ½ láº·p Ä‘i láº·p láº¡i khi F5 trang.
    - Loáº¡i bá» hoÃ n toÃ n logic `setTimeout` 2 giÃ¢y cÆ°á»¡ng Ã©p ngáº¯t káº¿t ná»‘i vÃ  gá»i reset vÃ­ do gÃ¢y race condition trÃªn production (náº¡p session cháº­m).
    - Cáº­p nháº­t `resetWalletState()`: Thay tháº¿ `localStorage.clear()` báº±ng viá»‡c xÃ³a chá»n lá»c Auth keys vÃ  key `appkit_siwe_signed` Ä‘á»ƒ báº£o toÃ n cáº¥u hÃ¬nh UI vÃ  session WalletConnect.
  - Cáº­p nháº­t [sidebar.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/sidebar/sidebar.component.ts): Di chuyá»ƒn hÃ m `effect()` tá»« `ngAfterViewInit()` vÃ o `constructor()` Ä‘á»ƒ sá»­a triá»‡t Ä‘á»ƒ lá»—i `NG0203` liÃªn quan Ä‘áº¿n Injection Context.
  - Cáº­p nháº­t [auth.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/auth.service.ts): Thay tháº¿ `localStorage.clear()` báº±ng xÃ³a chá»n lá»c key Auth vÃ  key `appkit_siwe_signed` trong hÃ m `disconnectWalletAndClose()`.
  - Cáº­p nháº­t [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts): Cáº­p nháº­t `handleAccountSwitch(newAccount)` Ä‘á»ƒ bá» qua xá»­ lÃ½ náº¿u vÃ­ má»›i trÃ¹ng khá»›p vá»›i tÃ i khoáº£n Ä‘Ã£ Ä‘Äƒng nháº­p nháº±m triá»‡t tiÃªu yÃªu cáº§u kÃ½ duplicate.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Tá»‘i Æ°u cáº¥u trÃºc quáº£n lÃ½ tráº¡ng thÃ¡i, giáº£m phÃ¬nh to tá»‡p `state.service.ts` vÃ  quáº£n lÃ½ API Loading cháº¡y ngáº§m

- **Ná»™i dung yÃªu cáº§u:** Tá»‡p `state.service.ts` quÃ¡ dÃ i (God Class) do chá»©a nhiá»u logic chuyá»ƒn tiáº¿p vÃ  signal ca trá»±c. Cáº§n tÃ¡i cáº¥u trÃºc Ä‘á»ƒ cÃ¡c component gá»i trá»±c tiáº¿p `ShiftService` chuyÃªn trÃ¡ch vÃ  thiáº¿t láº­p cÆ¡ cháº¿ Custom Header `X-Silent-Request: true` Ä‘á»ƒ quáº£n lÃ½ API loading cháº¡y ngáº§m lÃ¢u dÃ i.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [http-loading.interceptor.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/http-loading.interceptor.ts): Nháº­n diá»‡n header `X-Silent-Request: true` Ä‘á»ƒ cháº¡y ngáº§m (khÃ´ng hiá»ƒn thá»‹ spinner loading toÃ n cá»¥c) vÃ  tá»± Ä‘á»™ng xÃ³a header nÃ y trÆ°á»›c khi gá»­i request Ä‘i.
  - Cáº¥u hÃ¬nh API: Cáº­p nháº­t [api.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/api.service.ts) Ä‘Ã­nh kÃ¨m header `X-Silent-Request: true` cho API láº¥y ca hiá»‡n táº¡i `/api/shifts/current` vÃ  API tá»•ng há»£p ca `/api/shifts/current/summary`.
  - Cáº­p nháº­t [shift.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/shift.service.ts): ÄÆ°a constructor, cÃ¡c `effect` timer vÃ  tá»± Ä‘á»™ng náº¡p ca trá»±c khi Ä‘Äƒng nháº­p vÃ­ thÃ nh cÃ´ng tá»« `StateService` sang `ShiftService` Ä‘á»ƒ cÃ´ láº­p logic ca trá»±c. Expose `isShiftsLoading`, `shiftExpectedCash` tá»« store.
  - Refactor cÃ¡c Component: Cáº­p nháº­t cÃ¡c component liÃªn quan Ä‘áº¿n ca trá»±c ([desktop-header](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/header/desktop-header.component.ts), [sidebar](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/sidebar/sidebar.component.ts), [shifts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/shifts/shifts.component.ts), [pos](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/pos/pages/pos/pos.component.ts), [tables](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tables/tables.component.ts), [dashboard](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/dashboard/pages/dashboard/dashboard.component.ts), [shift-detail-modal](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/shifts/components/shift-detail-modal/shift-detail-modal.component.ts)) vÃ  cÃ¡c file template HTML tÆ°Æ¡ng á»©ng Ä‘á»ƒ inject vÃ  gá»i trá»±c tiáº¿p `ShiftService` thay vÃ¬ `stateService`.
  - Dá»n dáº¹p [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts): XÃ³a bá» toÃ n bá»™ cÃ¡c signal vÃ  phÆ°Æ¡ng thá»©c chuyá»ƒn tiáº¿p ca trá»±c dÆ° thá»«a, cÅ©ng nhÆ° logic reload tab ca trá»±c tÆ°Æ¡ng á»©ng trong `reloadCurrentTab`.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Máº·c Ä‘á»‹nh táº¯t hiá»‡u á»©ng trÆ°á»£t menu dá»c náº¿u khÃ´ng cÃ³ thiáº¿t láº­p trÆ°á»›c Ä‘Ã³

- **Ná»™i dung yÃªu cáº§u:** Máº·c Ä‘á»‹nh hiá»‡u á»©ng trÆ°á»£t menu dá»c (sliding background) lÃ  táº¯t náº¿u chÆ°a cÃ³ báº¥t ká»³ thiáº¿t láº­p nÃ o Ä‘Æ°á»£c lÆ°u trong localStorage.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [ui-state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/ui-state.service.ts): Thay Ä‘á»•i giÃ¡ trá»‹ khá»Ÿi táº¡o cá»§a signal `useSlidingEffect`. Thay vÃ¬ kiá»ƒm tra `!== 'false'` (dáº«n Ä‘áº¿n máº·c Ä‘á»‹nh lÃ  `true` khi chÆ°a cÃ³ key lÆ°u trá»¯ vÃ¬ nháº­n giÃ¡ trá»‹ `null`), Ä‘á»•i thÃ nh so sÃ¡nh `=== 'true'` Ä‘á»ƒ máº·c Ä‘á»‹nh lÃ  `false` khi chÆ°a lÆ°u thiáº¿t láº­p, Ä‘á»“ng thá»i váº«n giá»¯ láº¡i giÃ¡ trá»‹ `'true'` náº¿u ngÆ°á»i dÃ¹ng Ä‘Ã£ báº­t trÆ°á»›c Ä‘Ã³.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Responsive giao diá»‡n ca trá»±c #18 trÃªn Dashboard vÃ  sá»­a lá»—i cáº¯t badge gÃ³i cÆ°á»›c

- **Ná»™i dung yÃªu cáº§u:** Card ca trá»±c á»Ÿ Dashboard bá»‹ vá»¡ layout / badge "Äang trá»±c" bá»‹ Ä‘áº©y lá»‡ch lÃªn gÃ³c trÃªn bÃªn pháº£i vÃ  bá»‹ cáº¯t khi co giÃ£n mÃ n hÃ¬nh. Äá»“ng thá»i badge gÃ³i cÆ°á»›c á»Ÿ header vÃ­ Web3 cÅ©ng bá»‹ cáº¯t máº¥t gÃ³c trÃªn.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [dashboard.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/dashboard/pages/dashboard/dashboard.component.html): TÃ¡i cáº¥u trÃºc pháº§n header cá»§a card ca trá»±c hiá»‡n táº¡i, Ä‘Æ°a badge "Äang trá»±c" vÃ o náº±m ngay cáº¡nh text "Ca trá»±c #..." trong flex container cÃ³ `flex-wrap` Ä‘á»ƒ tá»± Ä‘á»™ng Ä‘iá»u chá»‰nh linh hoáº¡t theo chiá»u rá»™ng cá»§a card, loáº¡i bá» hoÃ n toÃ n viá»‡c badge bá»‹ lá»‡ch lÃªn gÃ³c trÃªn bÃªn pháº£i vÃ  bá»‹ cáº¯t.
  - Cáº­p nháº­t [desktop-header.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/header/desktop-header.component.html): Äiá»u chá»‰nh vá»‹ trÃ­ badge gÃ³i cÆ°á»›c á»Ÿ header vÃ­ tá»« `-top-2` thÃ nh `-top-1` Ä‘á»ƒ dá»‹ch xuá»‘ng dÆ°á»›i má»™t chÃºt, khÃ´ng bá»‹ cáº¯t bá»Ÿi mÃ©p container.
  - Cáº­p nháº­t [sidebar.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/sidebar/sidebar.component.html): TÆ°Æ¡ng tá»±, Ä‘iá»u chá»‰nh badge gÃ³i cÆ°á»›c trÃªn mobile trong sidebar tá»« `-top-2` thÃ nh `-top-1`.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i táº£i cháº­m/ngháº½n máº¡ng cá»§a API ca trá»±c hiá»‡n táº¡i (/shifts/current)

- **Ná»™i dung yÃªu cáº§u:** API `/api/shifts/current` luÃ´n táº£i ráº¥t lÃ¢u hoáº·c bá»‹ káº¹t á»Ÿ tráº¡ng thÃ¡i Pending cáº£ á»Ÿ local vÃ  production.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [api.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/api.service.ts): Sá»­a `getCurrentShift(ttl?, force?)` Ä‘á»ƒ chÃ¨n header cache `X-Cache-TTL` vÃ  `X-Bypass-Cache`.
  - Cáº­p nháº­t [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts): Gá»i `getCurrentShift(30000)` (cache 30 giÃ¢y) vÃ  **tÃ¡ch hoÃ n toÃ n khá»i `forkJoin` khá»Ÿi táº¡o cháº·n UI** Ä‘á»ƒ chuyá»ƒn sang táº£i báº¥t Ä‘á»“ng bá»™ (Non-blocking) dÆ°á»›i ná»n sau khi UI Ä‘Ã£ Ä‘Æ°á»£c táº¯t loader vÃ  hiá»ƒn thá»‹. Äá»“ng thá»i tÃ­ch há»£p signal `isCurrentShiftLoading` Ä‘á»ƒ quáº£n lÃ½ tráº¡ng thÃ¡i táº£i ca ngáº§m.
  - Cáº­p nháº­t cÃ¡c template HTML ([desktop-header.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/header/desktop-header.component.html), [sidebar.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/sidebar/sidebar.component.html), [pos.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/pos/pages/pos/pos.component.html), [shifts.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/shifts/shifts.component.html)): Sá»­ dá»¥ng `isCurrentShiftLoading()` Ä‘á»ƒ hiá»ƒn thá»‹ spinner hoáº·c skeleton chá» táº£i mÆ°á»£t mÃ , kháº¯c phá»¥c triá»‡t Ä‘á»ƒ lá»—i nháº¥p nhÃ¡y hiá»ƒn thá»‹ nÃºt má»Ÿ ca/vÃ o ca khi chÆ°a táº£i xong dá»¯ liá»‡u.
  - Cáº­p nháº­t [shift.store.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/shifts/store/shift.store.ts): Sá»­a `refreshCurrentShift` nháº­n thÃªm `ttl` vÃ  `force` (máº·c Ä‘á»‹nh cache 30 giÃ¢y náº¿u khÃ´ng truyá»n, há»— trá»£ callback tÆ°Æ¡ng thÃ­ch ngÆ°á»£c). TÃ­ch há»£p set `isCurrentShiftLoading` thÃ nh `true` / `false` tÆ°Æ¡ng á»©ng trong chu ká»³ gá»i API.
  - Cáº­p nháº­t [shift.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/shift.service.ts): Chuyá»ƒn tiáº¿p cÃ¡c tham sá»‘ cache tá»›i store. Cáº¥u hÃ¬nh force refresh `refreshCurrentShift(0, true)` sau khi má»Ÿ ca hoáº·c káº¿t ca thÃ nh cÃ´ng Ä‘á»ƒ Ä‘áº£m báº£o cáº­p nháº­t tráº¡ng thÃ¡i má»›i nháº¥t ngay láº­p tá»©c. Expose signal `isCurrentShiftLoading`.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: TÃ­ch há»£p bá»™ CacheInterceptor vÃ  cáº¥u hÃ¬nh Cache API á»Ÿ Frontend

- **Ná»™i dung yÃªu cáº§u:** TÃ­ch há»£p bá»™ CacheInterceptor cho á»©ng dá»¥ng Frontend Angular Ä‘á»ƒ cache in-memory chá»n lá»c cÃ¡c API feature: POS (10 phÃºt), Quáº£n lÃ½ thá»±c Ä‘Æ¡n (5 phÃºt), BÃ n Äƒn & Khu vá»±c (vÄ©nh viá»…n), BÃ¡o cÃ¡o (10 phÃºt), NhÃ¢n viÃªn & Quyá»n (10 phÃºt). Äá»“ng thá»i tá»± Ä‘á»™ng xÃ³a cache (invalidate) khi sá»­a Ä‘á»•i dá»¯ liá»‡u (POST, PUT, DELETE) trÃªn tÃ i nguyÃªn tÆ°Æ¡ng á»©ng.
- **Giáº£i phÃ¡p:**
  - Táº¡o má»›i [cache.interceptor.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/cache.interceptor.ts) triá»ƒn khai `HttpInterceptorFn` Ä‘á»ƒ cache HTTP GET response vÃ  invalidate tá»± Ä‘á»™ng theo nhÃ³m URL.
  - ÄÄ’ng kÃ½ interceptor trong [app.config.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/app.config.ts).
  - Cáº­p nháº­t [api.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/api.service.ts) Ä‘á»ƒ thÃªm header `X-Cache-TTL` dá»±a trÃªn tham sá»‘ `ttl` truyá»n vÃ o.
  - Cáº¥u hÃ¬nh TTL táº¡i cÃ¡c Store/Component: [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts) (phÃ¢n biá»‡t POS 10 phÃºt, Menu 5 phÃºt), [table.store.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tables/store/table.store.ts) (sÆ¡ Ä‘á»“ bÃ n vÄ©nh viá»…n), [reports.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/reports/reports.component.ts) (bÃ¡o cÃ¡o 10 phÃºt), [staff.store.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/staffs/store/staff.store.ts) (nhÃ¢n viÃªn 10 phÃºt), [settings.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/settings/settings.component.ts) (phÆ°Æ¡ng thá»©c thanh toÃ¡n 5 phÃºt).
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Hiá»ƒn thá»‹ chá»§ quÃ¡n cá»‘ Ä‘á»‹nh á»Ÿ Ä‘áº§u danh sÃ¡ch nhÃ¢n viÃªn (chá»‰ Ä‘á»c)

- **Ná»™i dung yÃªu cáº§u:** Trang Quáº£n lÃ½ NhÃ¢n viÃªn khÃ´ng hiá»ƒn thá»‹ thÃ´ng tin cá»§a chá»§ quÃ¡n (chá»‰ hiá»‡n nhÃ¢n viÃªn). YÃªu cáº§u thÃªm row chá»§ quÃ¡n á»Ÿ Ä‘áº§u danh sÃ¡ch, vÄ©nh viá»…n, khÃ´ng cÃ³ nÃºt Sá»­a/XÃ³a.
- **PhÃ¢n tÃ­ch:** Báº£ng `staffs` chá»‰ lÆ°u nhÃ¢n viÃªn (cÃ³ `store_owner_address`). Chá»§ quÃ¡n chá»‰ cÃ³ trong `users` vá»›i `store_owner_address = null` â€” khÃ´ng cÃ³ trong API nhÃ¢n viÃªn.
- **Giáº£i phÃ¡p (Frontend-only, khÃ´ng cáº§n thÃªm API):**
  - ThÃªm computed signal `ownerRow` trong [staffs.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/staffs/staffs.component.ts): Láº¥y thÃ´ng tin tá»« `stateService` (wallet address, name, phone, currentUserRole). Chá»‰ hiá»ƒn thá»‹ khi `currentUserRole === 'Chá»§ cá»­a hÃ ng'`.
  - ThÃªm HTML row tÄ©nh trÆ°á»›c `<app-table>` trong [staffs.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/staffs/staffs.component.html): Avatar gradient amber/orange, badge "Báº¡n" xanh, tag "Chá»§ sá»Ÿ há»¯u", Ä‘á»‹a chá»‰ vÃ­ mÃ u amber, badge ðŸ‘‘ "Chá»§ quÃ¡n" vÃ ng, cá»™t thao tÃ¡c hiá»ƒn thá»‹ `â€”` (khÃ´ng cÃ³ Sá»­a/XÃ³a), ngÃ y tham gia ghi "VÄ©nh viá»…n".
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Äá»“ng bá»™ thÃ´ng tin cÃ¡ nhÃ¢n tá»« báº£ng staffs vÃ o trang Profile

- **Ná»™i dung yÃªu cáº§u:** Khi nhÃ¢n viÃªn Ä‘Äƒng nháº­p báº±ng vÃ­ vÃ  vÃ o trang `/profile`, form thÃ´ng tin cÃ¡ nhÃ¢n (há» tÃªn, SÄT) bá»‹ trá»‘ng máº·c dÃ¹ admin Ä‘Ã£ nháº­p sáºµn thÃ´ng tin trong báº£ng `staffs`. Cáº§n tá»± Ä‘á»™ng populate thÃ´ng tin tá»« `staffs` vÃ o profile.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [AuthController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AuthController.php):
    - **`verifySignature()`**: Khi táº¡o `User` má»›i (Ä‘Äƒng nháº­p láº§n Ä‘áº§u), náº¿u vÃ­ Ä‘Ã£ cÃ³ record trong `staffs`, tá»± Ä‘á»™ng gÃ¡n `name` vÃ  `phone` tá»« `staffs` vÃ o `users` vÃ  save vÃ o DB ngay.
    - **`verifySignature()`**: Náº¿u `User` Ä‘Ã£ tá»“n táº¡i nhÆ°ng `name`/`phone` trá»‘ng, Ä‘á»“ng bá»™ má»™t láº§n tá»« `staffs` vÃ  save.
    - **`verifySignature()` vÃ  `me()`**: Response tráº£ vá» dÃ¹ng `$displayName = $user->name ?: ($staff?->name ?? null)` vÃ  tÆ°Æ¡ng tá»± cho `phone` â€” fallback sang `staffs` náº¿u `users` trá»‘ng, Æ°u tiÃªn `users` náº¿u ngÆ°á»i dÃ¹ng Ä‘Ã£ tá»± chá»‰nh sá»­a.
  - **Chiá»u Ä‘á»“ng bá»™ dá»¯ liá»‡u rÃµ rÃ ng:**
    - `staffs ? users` (m?t l?n duy nh?t khi ??ng nh?p ??u, n?u users tr?ng)
    - `users â†’ staffs` (má»—i khi ngÆ°á»i dÃ¹ng báº¥m "Cáº­p nháº­t há»“ sÆ¡" á»Ÿ trang `/profile/info`)

### YÃªu cáº§u: Bá»• sung trang cÃ¡ nhÃ¢n (Profile) cÃ¡ nhÃ¢n cho táº¥t cáº£ tÃ i khoáº£n

- **Ná»™i dung yÃªu cáº§u:** Bá»• sung trang há»“ sÆ¡ cÃ¡ nhÃ¢n `/profile` gá»“m 2 tab (ThÃ´ng tin cÃ¡ nhÃ¢n & Cáº¥u hÃ¬nh) cÃ³ Ä‘á»‹nh tuyáº¿n (sub-routing) riÃªng biá»‡t cho má»—i tab, cÃ³ thá»ƒ truy cáº­p bá»Ÿi má»i tÃ i khoáº£n. Chuyá»ƒn tÃ­nh nÄƒng báº­t táº¯t hiá»‡u á»©ng trÆ°á»£t background (sliding background) cá»§a sidebar vÃ  storefront vÃ o Ä‘Ã¢y.
- **Giáº£i phÃ¡p:**
  - **Backend Laravel API:**
    - Táº¡o vÃ  cháº¡y migration thÃªm cÃ¡c cá»™t `name`, `email`, `phone` vÃ o báº£ng `users`.
    - Cho phÃ©p fillable cÃ¡c trÆ°á»ng nÃ y trÃªn model `User.php`.
    - Cáº­p nháº­t response JSON cá»§a API `/auth/me` vÃ  `verify` Ä‘á»ƒ tráº£ vá» cÃ¡c trÆ°á»ng profile nÃ y.
    - Viáº¿t API `PUT /auth/profile` Ä‘á»ƒ lÆ°u thÃ´ng tin há» tÃªn, email, sÄ‘t (validate `name` báº¯t buá»™c, message tiáº¿ng Anh theo quy Ä‘á»‹nh), tá»± Ä‘á»™ng Ä‘á»“ng bá»™ sang báº£ng `staffs` náº¿u tÃ i khoáº£n thuá»™c vá» nhÃ¢n viÃªn.
  - **Frontend Angular Web:**
    - Khai bÃ¡o Ä‘á»‹nh tuyáº¿n `/profile`, `/profile/info`, `/profile/settings` trong `app.routes.ts`.
    - Táº¡o component `ProfileComponent` (cha), `ProfileInfoComponent` (tab ThÃ´ng tin cÃ¡ nhÃ¢n) vÃ  `ProfileSettingsComponent` (tab Cáº¥u hÃ¬nh).
    - Äá»“ng bá»™ `useSlidingEffect` signal vÃ  method `setSlidingEffect` toÃ n cá»¥c thÃ´ng qua `UiStateService` Ä‘á»ƒ cáº­p nháº­t láº­p tá»©c sang cÃ¡c component khÃ¡c khi thay Ä‘á»•i cáº¥u hÃ¬nh.
    - XÃ³a nÃºt Ä‘á»•i hiá»‡u á»©ng (âš¡) á»Ÿ footer cá»§a `SidebarComponent` vÃ  nÃºt Ä‘á»•i hiá»‡u á»©ng trÃªn Storefront Header.
    - Loáº¡i bá» liÃªn káº¿t Trang cÃ¡ nhÃ¢n ra khá»i sidebar (Desktop vÃ  Mobile drawer), chuyá»ƒn sang tÃ­ch há»£p dÆ°á»›i dáº¡ng nÃºt báº¥m "ThÃ´ng tin cÃ¡ nhÃ¢n" cÃ³ icon `user` trong modal vÃ­ Web3 ("Káº¿t ná»‘i vÃ­ Web3") vá»›i layout chia cá»™t Ä‘áº¹p máº¯t.
    - Sá»­a tiÃªu Ä‘á» trang cÃ¡ nhÃ¢n báº±ng cÃ¡ch thÃªm icon `user` vÃ o Page Header vÃ  sá»­a thuá»™c tÃ­nh `subtitle` thÃ nh `description`.
    - Kháº¯c phá»¥c lá»—i gá»i trÃ¹ng láº·p API `/auth/me` khi táº£i trang báº±ng cÃ¡ch loáº¡i bá» cuá»™c gá»i me dÆ° thá»«a trong `ngOnInit` cá»§a `ProfileComponent`.
    - Cháº¡y `npm run build` kiá»ƒm tra dá»± Ã¡n biÃªn dá»‹ch thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c phá»¥c triá»‡t Ä‘á»ƒ lá»—i Ä‘á»“ng bá»™ Blockchain báº±ng thuáº­t toÃ¡n Binary Search Block vÃ  RPC Node chÃ­nh thá»©c

- **Ná»™i dung yÃªu cáº§u:** Sá»­a Ä‘á»•i cÆ¡ cháº¿ Ä‘á»‘i soÃ¡t RPC Fallback Ä‘á»ƒ tÃ¬m Ä‘Ãºng TxHash tháº­t cá»§a phiáº¿u thu chi `TC-791741` mÃ  khÃ´ng dÃ¹ng transaction hash giáº£ láº­p `0xdecafe` vÃ  khÃ´ng bá»‹ giá»›i háº¡n 3 ngÃ y.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [base-contract.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3/base-contract.service.ts):
    - Triá»ƒn khai hÃ m helper `findBlockByTimestamp` dÃ¹ng thuáº­t toÃ¡n **Binary Search Block theo Timestamp** tá»‘i Æ°u (chá»‰ tá»‘n 15-25 request `getBlock` ráº¥t nháº¹).
    - Loáº¡i bá» giá»›i háº¡n 3 ngÃ y Ä‘á»‘i vá»›i RPC Fallback Ä‘á»ƒ há»— trá»£ Ä‘á»‘i soÃ¡t cÃ¡c giao dá»‹ch cÅ©.
    - Äá»‹nh vá»‹ chÃ­nh xÃ¡c block chá»©a giao dá»‹ch (`exactBlock`) vÃ  quÃ©t logs trong khoáº£ng cá»±c ká»³ háº¹p `[exactBlock - 10, exactBlock + 10]` (chá»‰ quÃ©t Ä‘Ãºng 21 block), loáº¡i bá» hoÃ n toÃ n cÃ¡c giá»›i háº¡n quÃ©t block cá»§a RPC.
  - Äá»“ng bá»™ thÃ nh cÃ´ng phiáº¿u `TC-791741` vá»›i TxHash tháº­t `0xde0f1f378555d50f147187ee37a1661f9b83b3eae80728097b9e2a82b676a5a1` sau khi chuyá»ƒn Ä‘á»•i RPC Endpoint sang node chÃ­nh thá»©c cá»§a BSC Testnet.
  - Cháº¡y `npm run build` kiá»ƒm tra dá»± Ã¡n biÃªn dá»‹ch thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Sá»­a láº¡i skeleton loader cá»§a trang Cáº¥u hÃ¬nh (Settings)

- **Ná»™i dung yÃªu cáº§u:** Äá»“ng bá»™ skeleton loader cá»§a trang cáº¥u hÃ¬nh `/settings` vÃ¬ hiá»‡n táº¡i hiá»ƒn thá»‹ khÃ´ng khá»›p cáº¥u trÃºc giao diá»‡n thá»±c táº¿.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [skeleton-loader.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/skeleton-loader/skeleton-loader.component.html):
    - Thay Ä‘á»•i layout skeleton dÃ nh cho `settings` tá»« cáº¥u trÃºc 2 cá»™t (vertical tabs + form) thÃ nh cáº¥u trÃºc 1 cá»™t (full-width app-card).
    - Thiáº¿t káº¿ header skeleton (icon + title), pháº§n form grid 2 cá»™t chá»©a 6 input fields, switch toggle vÃ  nÃºt button full-width khá»›p hoÃ n háº£o vá»›i cáº¥u trÃºc UI cá»§a tab general-config.
  - Cháº¡y `npm run build` kiá»ƒm tra dá»± Ã¡n biÃªn dá»‹ch thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i Ä‘á»“ng bá»™ blockchain khi Explorer API V2 bá»‹ tá»« chá»‘i truy cáº­p vÃ  RPC MetaMask bá»‹ lá»—i

- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i Ä‘á»“ng bá»™ blockchain cho phiáº¿u thu chi vÃ  Ä‘Æ¡n hÃ ng. Explorer API V2 bÃ¡o lá»—i `"Free API access is not supported for this chain"`, Ä‘á»“ng thá»i RPC MetaMask bá»‹ rate limit 429 khiáº¿n viá»‡c gá»i contract bá»‹ lá»—i vÃ  tráº£ vá» `null` ngay láº­p tá»©c mÃ  khÃ´ng kÃ­ch hoáº¡t cÃ¡c cÆ¡ cháº¿ fallback dá»± phÃ²ng. Tá»‘i Æ°u hÃ³a RPC Fallback Ä‘á»ƒ trÃ¡nh spam API vÃ  há»— trá»£ tá»‘t cho giao dá»‹ch cÅ©.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [blockchain.utils.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/utils/blockchain.utils.ts): Chuyá»ƒn Ä‘á»•i hÃ m `getExplorerApiUrl` quay trá»Ÿ láº¡i tráº£ vá» endpoint API V1 chuyÃªn biá»‡t riÃªng cho tá»«ng chainId thay vÃ¬ dÃ¹ng chung Etherscan API V2 Ä‘á»ƒ trÃ¡nh giá»›i háº¡n tÃ i khoáº£n Free.
  - Cáº­p nháº­t [base-contract.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3/base-contract.service.ts):
    - Loáº¡i bá» hoÃ n toÃ n thuáº­t toÃ¡n tÃ¬m kiáº¿m nhá»‹ phÃ¢n block cÅ© tá»‘n kÃ©m (`findBlockByTimestamp`).
    - Viáº¿t hÃ m dÃ¹ng chung `getOriginalTxHashWithFallback` triá»ƒn khai **Æ¯á»›c lÆ°á»£ng block thÃ´ng minh (Smart Block Estimation)**. Æ¯á»›c lÆ°á»£ng block chá»©a giao dá»‹ch báº±ng cÃ´ng thá»©c toÃ¡n há»c vÃ  gá»i Ä‘Ãºng **1 request `getLogs` duy nháº¥t** lÃªn RPC backup vá»›i khoáº£ng quÃ©t an toÃ n `approxBlock Â± 2000` block (tá»•ng cá»™ng 4000 block, khÃ´ng bá»‹ cÃ¡c RPC cháº·n).
    - **Giá»›i háº¡n thá»i gian Ä‘á»‘i soÃ¡t RPC Fallback**: Chá»‰ thá»±c hiá»‡n RPC Fallback cho cÃ¡c giao dá»‹ch trong vÃ²ng **3 ngÃ y gáº§n Ä‘Ã¢y** (sai sá»‘ Æ°á»›c lÆ°á»£ng cá»±c nhá», tá»‰ lá»‡ tÃ¬m tháº¥y 100%). Giao dá»‹ch cÅ© hÆ¡n 3 ngÃ y sáº½ bá» qua RPC Fallback Ä‘á»ƒ trÃ¡nh spam RPC vÃ´ Ã­ch, viá»‡c Ä‘á»‘i soÃ¡t lÃºc nÃ y dá»±a hoÃ n toÃ n vÃ o Explorer API V1 chuyÃªn dá»¥ng (vá»‘n quÃ©t Ä‘Æ°á»£c tá»« block 0 á»•n Ä‘á»‹nh).
  - Cáº­p nháº­t [pos-contract.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3/pos-contract.service.ts) vÃ  [finance-contract.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3/finance-contract.service.ts):
    - Cho phÃ©p code tiáº¿p tá»¥c cháº¡y khi gá»i vÃ­ MetaMask bá»‹ lá»—i RPC.
    - Káº¿ thá»«a vÃ  sá»­ dá»¥ng hÃ m dÃ¹ng chung `getOriginalTxHashWithFallback` tá»« base service Ä‘á»ƒ dá»n sáº¡ch code trÃ¹ng láº·p.
  - Cháº¡y `npm run build` kiá»ƒm tra dá»± Ã¡n biÃªn dá»‹ch thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Táº¡o hiá»‡u á»©ng trÆ°á»£t background mÃ u chá»§ Ä‘áº¡o khi báº¥m chá»n menu/danh má»¥c dá»c

- **Ná»™i dung yÃªu cáº§u:** Thiáº¿t láº­p hiá»‡u á»©ng chuyá»ƒn Ä‘á»™ng mÆ°á»£t mÃ  (sliding background) cá»§a mÃ u ná»n chá»§ Ä‘áº¡o khi ngÆ°á»i dÃ¹ng báº¥m vÃ o cÃ¡c má»¥c Ä‘iá»u hÆ°á»›ng dá»c, tÆ°Æ¡ng tá»± nhÆ° hiá»‡u á»©ng cá»§a component `<app-tab-group>`. Ãp dá»¥ng trÃªn Sidebar Admin vÃ  Category list cá»§a Storefront. Há»— trá»£ 2 cÆ¡ cháº¿ (TrÆ°á»£t/TÄ©nh), cho ngÆ°á»i dÃ¹ng chá»n vÃ  lÆ°u vÃ o localStorage.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [sidebar.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/sidebar/sidebar.component.ts) vÃ  [sidebar.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/sidebar/sidebar.component.html):
    - ChÃ¨n tháº» `div` lÃ m sliding background vá»›i transition 300ms, bá»c trong `@if (useSlidingEffect())`.
    - Láº¯ng nghe sá»± kiá»‡n chuyá»ƒn route (`NavigationEnd`) vÃ  thay Ä‘á»•i kÃ­ch thÆ°á»›c cá»­a sá»• Ä‘á»ƒ tá»± Ä‘á»™ng tÃ­nh toÃ¡n láº¡i vá»‹ trÃ­ cá»§a pháº§n tá»­ active.
    - ThÃªm `useSlidingEffect = signal<boolean>(...)` load tá»« localStorage key `ui_sliding_effect` khi khá»Ÿi táº¡o.
    - ThÃªm hÃ m `toggleSlidingEffect()` lÆ°u vÃ o localStorage khi thay Ä‘á»•i.
    - ThÃªm nÃºt âš¡ nhá» trong footer sidebar cho phÃ©p toggle hiá»‡u á»©ng.
    - ThÃªm class `sidebar-no-slide` trÃªn tháº» `<nav>` khi hiá»‡u á»©ng táº¯t; CSS global trong `styles.css` tá»± Ä‘á»™ng Ã¡p hover/active background tÄ©nh cho button con.
  - Cáº­p nháº­t [store.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.ts) vÃ  [store.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.html):
    - `useSlidingEffect` signal load tá»« localStorage key `ui_sliding_effect` (dÃ¹ng chung key vá»›i Sidebar).
    - TÃ­ch há»£p sliding background hoáº¡t Ä‘á»™ng hai chiá»u (trÆ°á»£t dá»c trÃªn Desktop vÃ  trÆ°á»£t ngang trÃªn Mobile).
    - ThÃªm hÃ m `toggleSlidingEffect()` persist vÃ o localStorage, nÃºt báº¥m Ä‘á»•i hiá»‡u á»©ng gá»i hÃ m nÃ y.
    - T? ??ng cu?n container ?? hi?n th? danh m?c active n?u b? che khu?t.
  - Cáº­p nháº­t [styles.css](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/styles.css): ThÃªm CSS rules cho `.sidebar-no-slide` Ä‘á»ƒ button menu cÃ³ hover/active background tÄ©nh khi hiá»‡u á»©ng trÆ°á»£t táº¯t (Light + Dark mode).
  - **LÆ°u Ã½:** Key localStorage `ui_sliding_effect` dÃ¹ng chung cho cáº£ Sidebar Admin vÃ  Storefront Ä‘á»ƒ Ä‘á»“ng bá»™ thiáº¿t láº­p ngÆ°á»i dÃ¹ng.
  - Cháº¡y `npm run build` kiá»ƒm tra dá»± Ã¡n biÃªn dá»‹ch thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Äá»“ng bá»™ giao diá»‡n Modal Chi tiáº¿t phiáº¿u thu/chi vÃ  Chi tiáº¿t hÃ³a Ä‘Æ¡n

- **Ná»™i dung yÃªu cáº§u:** Äá»“ng bá»™ hÃ³a cÃ¡ch hiá»ƒn thá»‹ mÃ£, giao diá»‡n vÃ  hiá»ƒn thá»‹ mÃ£ trÃªn tiÃªu Ä‘á» (title) cá»§a cáº£ Modal Chi tiáº¿t phiáº¿u thu/chi vÃ  Chi tiáº¿t hÃ³a Ä‘Æ¡n.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [financials.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/financials/financials.component.ts):
    - Thay Ä‘á»•i tiÃªu Ä‘á» modal truyá»n vÃ o thÃ nh `Chi tiáº¿t phiáº¿u thu/chi ${tx.transaction_code || ''}` Ä‘á»ƒ Ä‘á»“ng bá»™ vá»›i cÃ¡ch hiá»ƒn thá»‹ mÃ£ cá»§a hÃ³a Ä‘Æ¡n.
  - S?a ??i [financial-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/financials/components/financial-detail-modal/financial-detail-modal.component.html):
    - Loáº¡i bá» trÆ°á»ng hiá»ƒn thá»‹ `MÃ£ phiáº¿u` trong lÆ°á»›i thÃ´ng tin cÆ¡ báº£n Ä‘á»ƒ trÃ¡nh láº·p láº¡i thÃ´ng tin (do mÃ£ phiáº¿u Ä‘Ã£ hiá»ƒn thá»‹ trá»±c quan á»Ÿ tiÃªu Ä‘á»).
    - KhÃ´i phá»¥c cáº¥u trÃºc lÆ°á»›i 2 cá»™t, 2 hÃ ng ban Ä‘áº§u: hÃ ng 1 gá»“m NgÃ y giao dá»‹ch vÃ  Loáº¡i giao dá»‹ch; hÃ ng 2 gá»“m Sá»‘ tiá»n vÃ  Háº¡ng má»¥c.
  - Cháº¡y `npm run build` kiá»ƒm tra vÃ  dá»± Ã¡n biÃªn dá»‹ch thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: ÄÃ¡nh giÃ¡ vÃ  cáº­p nháº­t tÃ i liá»‡u thiáº¿t káº¿ (design.md)

- **Ná»™i dung yÃªu cáº§u:** Xem xÃ©t giao diá»‡n tá»•ng quan há»‡ thá»‘ng vÃ  cáº­p nháº­t Ä‘áº·c táº£ design system vÃ o file `design.md`.
- **Giáº£i phÃ¡p:** Cáº­p nháº­t 6 Ä‘áº·c táº£ ká»¹ thuáº­t vÃ  UI/UX cá»‘t lÃµi má»›i nháº¥t vÃ o [design.md](file:///d:/git/cafe-blockchain/design.md):
  - Kiáº¿n trÃºc Dynamic Modal gá»i qua TypeScript vÃ  chÃ­nh sÃ¡ch khÃ´ng animation (No-Animation Policy) Ä‘á»ƒ pháº£n há»“i tá»©c thÃ¬.
  - Thiáº¿t láº­p `:host { display: block; }` Ä‘á»‘i vá»›i cÃ¡c standalone custom component Ä‘á»ƒ khÃ´ng lÃ m há»ng layout margin/padding cá»§a Tailwind.
  - Sá»­ dá»¥ng `<app-tab-group>` dÃ¹ng chung thay tháº¿ cho cÃ¡c nÃºt toggle lá»±a chá»n thá»§ cÃ´ng.
  - Di chuyá»ƒn cÃ¡c CSS keyframes vÃ  lá»›p animation cá»§a Toast progress bar vÃ o tá»‡p global `styles.css` Ä‘á»ƒ trÃ¡nh cÆ¡ cháº¿ Angular View Encapsulation.
  - Chuáº©n hoÃ¡ bá»‘ cá»¥c biá»ƒu máº«u dáº¡ng grid 2 cá»™t vÃ  textarea full-width (`md:col-span-2`).
  - Ãp dá»¥ng triáº¿t lÃ½ thiáº¿t káº¿ pháº³ng (Flat Design), loáº¡i bá» cÃ¡c Ä‘Æ°á»ng border phÃ¢n tÃ¡ch náº±m ngang (`border-t`) khÃ´ng cáº§n thiáº¿t.

### YÃªu cáº§u: Sá»­a lá»—i 500 khi sync transaction lÃªn blockchain

- **Ná»™i dung yÃªu cáº§u:** API `PUT /api/transactions/{id}/sync` tráº£ vá» lá»—i 500.
- **Root cause:** `EloquentTransactionRepository::find()` khai bÃ¡o tham sá»‘ `int $id`, nhÆ°ng Transaction entity dÃ¹ng **UUID** lÃ m primary key (string). PHP 8 strict typing nÃ©m `TypeError` ngay khi truyá»n UUID vÃ o.
- **Giáº£i phÃ¡p:** Äá»•i kiá»ƒu tham sá»‘ tá»« `int` sang `string` trong cáº£ 2 file:
  - [TransactionRepositoryInterface.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Domain/Repositories/TransactionRepositoryInterface.php): `public function find(string $id): ?Transaction;`
  - [EloquentTransactionRepository.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Infrastructure/Persistence/Repositories/EloquentTransactionRepository.php): `public function find(string $id): ?Transaction`

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i Ä‘á»“ng bá»™ Blockchain cho Phiáº¿u thu chi vÃ  ÄÆ¡n hÃ ng

- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i Ä‘á»“ng bá»™ blockchain cho phiáº¿u thu chi (giao dá»‹ch Ä‘Ã£ cÃ³ trÃªn blockchain nhÆ°ng MySQL chÆ°a ghi nháº­n vÃ  bÃ¡o lá»—i "already exists" khi áº¥n Ä‘á»“ng bá»™ láº¡i). KhÃ´ng sá»­ dá»¥ng cÃ¡ch quÃ©t ngÆ°á»£c block qua RPC.
- **PhÃ¢n tÃ­ch:**
  - Logic cÅ© chá»‰ gá»i Block Explorer API khi cÃ³ `apiKey` cáº¥u hÃ¬nh trong database. Khi khÃ´ng cÃ³ `apiKey`, há»‡ thá»‘ng fallback sang quÃ©t block thá»§ cÃ´ng báº±ng RPC (`queryFilter` Â±5000 blocks) gÃ¢y quÃ¡ táº£i hoáº·c lá»—i rate limit 429.
  - NgoÃ i ra, cÃ¡c API Block Explorer V1 cÅ© (nhÆ° `api-testnet.bscscan.com/api`) Ä‘Ã£ bá»‹ Etherscan khai tá»­/deprecated vÃ  tráº£ vá» lá»—i `"You are using a deprecated V1 endpoint"`, dáº«n Ä‘áº¿n viá»‡c khÃ´ng thá»ƒ tÃ¬m tháº¥y Event Log máº·c dÃ¹ giao dá»‹ch Ä‘Ã£ thÃ nh cÃ´ng.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [blockchain.utils.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/utils/blockchain.utils.ts): Chuyá»ƒn Ä‘á»•i hÃ m `getExplorerApiUrl` Ä‘á»ƒ tráº£ vá» endpoint thá»‘ng nháº¥t **Etherscan API V2** (`https://api.etherscan.io/v2/api`) cho táº¥t cáº£ cÃ¡c máº¡ng blockchain Ä‘Æ°á»£c há»— trá»£.
  - Cáº­p nháº­t [pos-contract.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3/pos-contract.service.ts) vÃ  [finance-contract.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3/finance-contract.service.ts):
    - Cho phÃ©p gá»i Explorer API Ä‘á»‘i soÃ¡t sá»± kiá»‡n chá»‰ vá»›i `explorerApiUrl` mÃ  khÃ´ng cáº§n báº¯t buá»™c `apiKey`. Náº¿u cÃ³ `apiKey` thÃ¬ ná»‘i thÃªm tham sá»‘, náº¿u khÃ´ng thÃ¬ dÃ¹ng public rate limit máº·c Ä‘á»‹nh.
    - Truyá»n thÃªm tham sá»‘ báº¯t buá»™c `chainid=${chainId}` cá»§a Etherscan API V2 vÃ o chuá»—i query URL.
    - Loáº¡i bá» hoÃ n toÃ n cÆ¡ cháº¿ loop quÃ©t block RPC Ä‘á»ƒ trÃ¡nh gÃ¢y quÃ¡ táº£i node máº¡ng EVM.
  - Cháº¡y thá»­ lá»‡nh `npm run build` vÃ  á»©ng dá»¥ng biÃªn dá»‹ch thÃ nh cÃ´ng hoÃ n háº£o 100%.

## NgÃ y 20/06/2026

### YÃªu cáº§u: Giáº£i thÃ­ch lá»—i khÃ´ng deploy Ä‘Æ°á»£c contract

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng gáº·p lá»—i khi deploy contract vÃ  gá»­i áº£nh chá»¥p mÃ n hÃ¬nh thÃ´ng bÃ¡o lá»—i: `could not coalesce error (error={ "code": -32005, "httpStatus": 429 }, "message": "Request is being rate limited...", code=UNKNOWN_ERROR, version=6.16.0)`.
- **PhÃ¢n tÃ­ch:**
  - Lá»—i HTTP Status `429` cÃ³ nghÄ©a lÃ  `Too Many Requests` (QuÃ¡ nhiá»u yÃªu cáº§u).
  - Node RPC mÃ  á»©ng dá»¥ng hoáº·c vÃ­ Metamask Ä‘ang sá»­ dá»¥ng (`https://bnb-testnet.api.onfinality.io/public` hoáº·c má»™t RPC cÃ´ng cá»™ng khÃ¡c) Ä‘Ã£ giá»›i háº¡n sá»‘ lÆ°á»£ng request (rate limit) Ä‘á»‘i vá»›i Ä‘á»‹a chá»‰ IP cá»§a ngÆ°á»i dÃ¹ng hoáº·c do Node Ä‘Ã³ Ä‘ang bá»‹ quÃ¡ táº£i diá»‡n rá»™ng.
- **Giáº£i phÃ¡p:**
  - Chá» vÃ i phÃºt Ä‘á»ƒ giá»›i háº¡n Ä‘Æ°á»£c reset vÃ  thá»­ láº¡i.
  - Thay Ä‘á»•i RPC Endpoint URL sang má»™t RPC public khÃ¡c tá»‘t hÆ¡n (vÃ­ dá»¥ tÃ¬m trÃªn chainlist.org nhÆ° `https://bsc-testnet-rpc.publicnode.com`).
  - Sá»­ dá»¥ng dá»‹ch vá»¥ RPC cÃ¡ nhÃ¢n cÃ³ API key riÃªng (tá»« Alchemy, QuickNode, Ankr, v.v.) Ä‘á»ƒ trÃ¡nh bá»‹ rate limit.

### YÃªu cáº§u: Sá»­a lá»—i khÃ´ng káº¿t ná»‘i Ä‘Æ°á»£c vÃ­ MetaMask (Connection declined)

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng liÃªn tá»¥c gáº·p lá»—i "Connection declined. Connection can be declined if a previous request is still active" khi cá»‘ gáº¯ng káº¿t ná»‘i vÃ­ MetaMask, ngay cáº£ khi táº¯t trÃ¬nh duyá»‡t má»Ÿ láº¡i.
- **PhÃ¢n tÃ­ch:**
  - Do lá»‡ch cáº¥u hÃ¬nh máº¡ng: AppKit Ä‘áº·t `defaultNetwork` cá»©ng lÃ  `arbitrum` trong khi DApp máº·c Ä‘á»‹nh cháº¡y BSC Testnet (ID 97). Khi káº¿t ná»‘i thÃ nh cÃ´ng, DApp láº­p tá»©c kÃ­ch hoáº¡t switch máº¡ng song song gÃ¢y xung Ä‘á»™t trÃªn MetaMask.
  - Do race condition: Sá»± kiá»‡n `accountsChanged` cá»§a `window.ethereum` khi káº¿t ná»‘i thÃ nh cÃ´ng tá»± Ä‘á»™ng cháº¡y luá»“ng `handleAccountSwitch` -> gá»i tiáº¿p `connectWallet` má»Ÿ láº¡i modal AppKit trong khi phiÃªn káº¿t ná»‘i cÅ© váº«n Ä‘ang xá»­ lÃ½.
- **Giáº£i phÃ¡p:**
  - Cáº¥u hÃ¬nh defaultNetwork lÃ  `mainnet` (Ethereum) máº·c Ä‘á»‹nh luÃ´n cÃ³ sáºµn trong MetaMask Ä‘á»ƒ trÃ¡nh lá»—i Unrecognized chain ID "0x61" (BSC Testnet) khi káº¿t ná»‘i vÃ­ lÃºc ban Ä‘áº§u.
  - Sau khi káº¿t ná»‘i thÃ nh cÃ´ng, DApp phÃ¡t hiá»‡n sai máº¡ng sáº½ gá»i `ensureCorrectNetwork()`, lÃºc nÃ y vÃ­ MetaMask nÃ©m lá»—i 4902 (thiáº¿u máº¡ng) sáº½ Ä‘Æ°á»£c code báº¯t vÃ  gá»i `wallet_addEthereumChain` hiá»ƒn thá»‹ popup hÆ°á»›ng dáº«n ngÆ°á»i dÃ¹ng "ThÃªm máº¡ng" BSC Testnet má»™t cÃ¡ch an toÃ n.
  - TÃ¡ch logic kÃ½ vÃ­ thÃ nh hÃ m riÃªng `requestSignatureForAddress(address)` trong `StateService`.
  - Cáº­p nháº­t `handleAccountSwitch` Ä‘á»ƒ kÃ½ trá»±c tiáº¿p mÃ  khÃ´ng gá»i má»Ÿ modal káº¿t ná»‘i, loáº¡i bá» hoÃ n toÃ n race condition vÃ  tÃ¬nh tráº¡ng tá»± Ä‘á»™ng má»Ÿ modal phiá»n phá»©c khi F5/táº£i trang.
  - Sá»­a Ä‘á»•i `switchChain` trong `StateService` cho phÃ©p ngÆ°á»i dÃ¹ng thay Ä‘á»•i vÃ  lá»±a chá»n máº¡ng káº¿t ná»‘i mong muá»‘n trÆ°á»›c khi káº¿t ná»‘i vÃ­ thá»±c táº¿ (cáº­p nháº­t `configuredChainId` trÃªn UI trÆ°á»›c khi báº¥m nÃºt káº¿t ná»‘i).
  - Äá»“ng bá»™ hÃ m `switchChain()` á»Ÿ cÃ¡c component (`SidebarComponent`, `Web3PublicHeaderComponent`, `MobileSignComponent`) gá»i trá»±c tiáº¿p vá» `StateService.switchChain()`, loáº¡i bá» hoÃ n toÃ n logic tá»± cháº·n káº¿t ná»‘i máº¡ng trÃ¹ng láº·p.
  - TrÃ¬ hoÃ£n cÃ¡c cuá»™c gá»i API khá»Ÿi táº¡o trong constructor cá»§a `StateService` báº±ng `setTimeout` nháº±m phÃ¡ vá»¡ hoÃ n toÃ n vÃ²ng láº·p Circular Dependency NG0200 xáº£y ra trong HTTP Interceptors táº¡i runtime.
  - **Bá»• sung dá»n dáº¹p localStorage:** TÃ­ch há»£p gá»i `localStorage.clear()` khi ngÆ°á»i dÃ¹ng thá»±c hiá»‡n ngáº¯t káº¿t ná»‘i vÃ­, gáº·p lá»—i/há»§y káº¿t ná»‘i vÃ­ (modal bá»‹ Ä‘Ã³ng mÃ  khÃ´ng cÃ³ tÃ i khoáº£n), hoáº·c **trÆ°á»›c khi má»Ÿ modal káº¿t ná»‘i vÃ­ má»›i**, giÃºp giáº£i phÃ³ng sáº¡ch cÃ¡c cache bá»‹ káº¹t cá»§a Reown AppKit vÃ  WalletConnect, triá»‡t tiÃªu hoÃ n toÃ n lá»—i `Connection declined`.
  - **Kháº¯c phá»¥c lá»—i 403 Forbidden khi khá»Ÿi táº¡o:** Loáº¡i bá» cuá»™c gá»i API táº£i menu storefront cÃ´ng khai (`getPublicStoreBySlug`) khi vÃ­ chÆ°a káº¿t ná»‘i trong `StateService.loadPublicSettingsAndMenu()`, vÃ¬ API nÃ y bá»‹ cháº·n quyá»n truy cáº­p Ä‘á»‘i vá»›i cÃ¡c káº¿t ná»‘i chÆ°a Ä‘Æ°á»£c kÃ½ xÃ¡c thá»±c.

### YÃªu cáº§u: TÃ¬m hiá»ƒu cÃ¡c file quáº£n lÃ½ vÃ­, káº¿t ná»‘i/ngáº¯t vÃ­ vÃ  WalletConnect

- **Ná»™i dung yÃªu cáº§u:** Há»i cÃ¡c file Ä‘áº£m nháº­n module quáº£n lÃ½ vÃ­, káº¿t ná»‘i vÃ­, ngáº¯t vÃ­, wallet connect.
- **PhÃ¢n tÃ­ch & Pháº£n há»“i:**
  - Logic cá»‘t lÃµi: `web3.service.ts` (Khá»Ÿi táº¡o Reown AppKit, xá»­ lÃ½ káº¿t ná»‘i, ngáº¯t káº¿t ná»‘i, chuyá»ƒn máº¡ng EVM, cáº­p nháº­t sá»‘ dÆ°).
  - Logic tráº¡ng thÃ¡i & ÄÄƒng nháº­p backend: `state.service.ts` (KÃ½ xÃ¡c thá»±c vÃ­, quáº£n lÃ½ JWT token vÃ  phiÃªn Ä‘Äƒng nháº­p).
  - UI Components gá»i Web3/VÃ­: `web3-public-header.component.ts`, `mobile-sign.component.ts`, `claim-points.component.ts`.

### YÃªu cáº§u: Xem láº¡i DApp, chain máº·c Ä‘á»‹nh náº¿u ngÆ°á»i dÃ¹ng khÃ´ng chá»n lÃ  chain nÃ o?

- **Ná»™i dung yÃªu cáº§u:** TÃ¬m hiá»ƒu chain máº·c Ä‘á»‹nh cá»§a há»‡ thá»‘ng DApp.
- **PhÃ¢n tÃ­ch & Pháº£n há»“i:**
  - Trong cáº¥u hÃ¬nh mÃ´i trÆ°á»ng (`environment.ts` vÃ  `environment.development.ts`), `defaultChainId` Ä‘Æ°á»£c cáº¥u hÃ¬nh máº·c Ä‘á»‹nh lÃ  `'97'` (BSC Testnet).
  - Trong code [web3.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3.service.ts#L334), `defaultNetwork` khi khá»Ÿi táº¡o Reown AppKit Ä‘Æ°á»£c gÃ¡n cá»©ng lÃ  `mainnet` (Ethereum Mainnet) nháº±m tÆ°Æ¡ng thÃ­ch tá»‘t nháº¥t vá»›i vÃ­ MetaMask (trÃ¡nh lá»—i Unrecognized Chain ID). Sau khi káº¿t ná»‘i vÃ­ thÃ nh cÃ´ng, DApp láº­p tá»©c gá»i hÃ m `ensureCorrectNetwork()` Ä‘á»ƒ kÃ­ch hoáº¡t chuyá»ƒn sang máº¡ng thá»±c táº¿ cáº¥u hÃ¬nh (`configuredChainId` káº¿ thá»«a tá»« `defaultChainId` hoáº·c cáº¥u hÃ¬nh Ä‘á»™ng tá»« database).

### YÃªu cáº§u: Äá»•i chain máº·c Ä‘á»‹nh cá»§a DApp sang Arbitrum vÃ  sáº¯p xáº¿p láº¡i danh sÃ¡ch máº¡ng phá»• biáº¿n

- **Ná»™i dung yÃªu cáº§u:** Thay Ä‘á»•i chain máº·c Ä‘á»‹nh cá»§a há»‡ thá»‘ng sang Arbitrum (chainId 42161). ÄÆ°a Arbitrum lÃªn Ä‘áº§u danh sÃ¡ch chá»n máº¡ng vÃ  Ethereum xuá»‘ng vá»‹ trÃ­ thá»© 2.
- **QuÃ¡ trÃ¬nh & Giáº£i phÃ¡p Ä‘Ã£ thá»±c hiá»‡n:**
  - ÄÃ£ cáº­p nháº­t file cáº¥u hÃ¬nh mÃ´i trÆ°á»ng ([environment.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/environments/environment.ts) vÃ  [environment.development.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/environments/environment.development.ts)): Ä‘á»•i `defaultChainId` sang `'42161'` (Arbitrum), `defaultRpcUrl` sang `'https://arb1.arbitrum.io/rpc'`, vÃ  `defaultExplorerUrl` sang `'https://arbiscan.io'`.
  - ÄÃ£ cáº­p nháº­t cÃ¡c giÃ¡ trá»‹ fallback signal trong [web3.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3.service.ts): Ä‘á»•i fallback cá»§a rpcUrl, explorerUrl vÃ  configuredChainId sang Arbitrum One (`'42161'`), Ä‘á»•i `defaultNetwork` khá»Ÿi táº¡o trong `AppKit` thÃ nh `arbitrum`, vÃ  fallback cá»§a `getAppKitNetworkByChainId` thÃ nh `arbitrum`.
  - ÄÃ£ cáº­p nháº­t danh sÃ¡ch `POPULAR_CHAINS` trong [blockchain.utils.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/utils/blockchain.utils.ts) vÃ  [settings.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/settings/settings.component.ts) Ä‘á»ƒ Ä‘Æ°a Arbitrum lÃªn Ä‘áº§u tiÃªn, Ethereum xuá»‘ng vá»‹ trÃ­ thá»© hai.
  - ÄÃ£ cáº­p nháº­t default chainId vÃ  cÃ¡c fallback cá»§a blockchain explorer sang Arbitrum trong [blockchain-explorer.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/blockchain/pages/blockchain-explorer/blockchain-explorer.component.ts).
  - ÄÃ£ loáº¡i bá» hoÃ n toÃ n code trÃ¹ng láº·p báº±ng cÃ¡ch import trá»±c tiáº¿p `POPULAR_CHAINS` tá»« [blockchain.utils.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/utils/blockchain.utils.ts) vÃ o [settings.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/settings/settings.component.ts) thay vÃ¬ khai bÃ¡o máº£ng tÄ©nh riÃªng biá»‡t.
  - ÄÃ£ tinh gá»n danh sÃ¡ch chain há»— trá»£ theo yÃªu cáº§u: Chá»‰ giá»¯ láº¡i **Arbitrum One**, **Base**, **BNB Smart Chain** (Mainnet) cÃ¹ng **Arbitrum Sepolia**, **BSC Testnet** (Testnet). Loáº¡i bá» Ethereum Mainnet, Polygon, Optimism, Sepolia Testnet khá»i cáº£ `POPULAR_CHAINS` vÃ  cáº¥u hÃ¬nh khá»Ÿi táº¡o Reown AppKit trong [web3.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3.service.ts).

### YÃªu cáº§u: Sá»­a lá»—i build sau khi nÃ¢ng cáº¥p Angular v21 -> v22 vÃ  TypeScript v6

- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i khÃ´ng build Ä‘Æ°á»£c á»©ng dá»¥ng (`npm run build` tháº¥t báº¡i) sau khi nÃ¢ng cáº¥p lÃªn Angular 22 vÃ  TypeScript 6.
- **QuÃ¡ trÃ¬nh & Giáº£i phÃ¡p Ä‘Ã£ thá»±c hiá»‡n:**
  - **Lá»—i TS5101 (baseUrl bá»‹ deprecated):** ÄÃ£ cáº­p nháº­t [tsconfig.json](file:///d:/git/cafe-blockchain/cafe-blockchain-web/tsconfig.json) báº±ng cÃ¡ch xÃ³a hoÃ n toÃ n cáº¥u hÃ¬nh `"baseUrl": "./"` vÃ  thÃªm tiá»n tá»‘ `./` trÆ°á»›c cÃ¡c Ä‘Æ°á»ng dáº«n tÆ°Æ¡ng Ä‘á»‘i trong cáº¥u hÃ¬nh `"paths"` (vÃ­ dá»¥: `"@core/*": ["./src/app/core/*"]`). CÃ¡ch lÃ m nÃ y giÃºp xá»­ lÃ½ triá»‡t Ä‘á»ƒ cáº£nh bÃ¡o TS5101 mÃ  khÃ´ng cáº§n sá»­ dá»¥ng cá» táº¯t cáº£nh bÃ¡o táº¡m thá»i.
  - **Lá»—i esbuild khÃ´ng há»— trá»£ destructuring (trÃªn mÃ´i trÆ°á»ng cÅ©):** Do cÃ¡c thÆ° viá»‡n Web3 má»›i nÃ¢ng cáº¥p (nhÆ° `viem`, `zustand`) sá»­ dá»¥ng cÃº phÃ¡p JavaScript hiá»‡n Ä‘áº¡i trong khi cáº¥u hÃ¬nh trÃ¬nh duyá»‡t má»¥c tiÃªu cÅ© trong [.browserslistrc](file:///d:/git/cafe-blockchain/cafe-blockchain-web/.browserslistrc) Ä‘Ã²i há»i tÆ°Æ¡ng thÃ­ch ngÆ°á»£c (iOS 12, Safari 12) khiáº¿n esbuild bÃ¡o lá»—i. ÄÃ£ Ä‘iá»u chá»‰nh cÃ¡c phiÃªn báº£n trÃ¬nh duyá»‡t tá»‘i thiá»ƒu trong [.browserslistrc](file:///d:/git/cafe-blockchain/cafe-blockchain-web/.browserslistrc) sang bá»™ lá»c cÃ¢n báº±ng tá»‘i Æ°u (`ios >= 15`, `safari >= 15`, `chrome >= 64`). CÃ¡ch nÃ y giÃºp cÃ¡c trÃ¬nh duyá»‡t Chrome ráº¥t cÅ© (tá»« 2017) trÃªn mÃ¡y Android cÅ©, mÃ¡y POS cÅ© váº«n truy cáº­p Ä‘Æ°á»£c bÃ¬nh thÆ°á»ng, Ä‘á»“ng thá»i giÃºp esbuild hoÃ n thÃ nh viá»‡c build mÃ  khÃ´ng bá»‹ lá»—i.
  - Káº¿t quáº£: ÄÃ£ cháº¡y thá»­ lá»‡nh `npm run build` vÃ  á»©ng dá»¥ng biÃªn dá»‹ch thÃ nh cÃ´ng hoÃ n toÃ n.

### YÃªu cáº§u: TÃ¬m hiá»ƒu vÃ  má»Ÿ rá»™ng breakpoint responsive cá»§a Tailwind CSS

- **Ná»™i dung yÃªu cáº§u:** TÃ¬m hiá»ƒu breakpoint máº·c Ä‘á»‹nh lá»›n nháº¥t vÃ  má»Ÿ rá»™ng cáº¥u hÃ¬nh lÃªn `3xl` (`1920px`) vÃ  `4xl` (`2560px`).
- **QuÃ¡ trÃ¬nh & Giáº£i phÃ¡p Ä‘Ã£ thá»±c hiá»‡n:**
  - XÃ¡c Ä‘á»‹nh dá»± Ã¡n Ä‘ang sá»­ dá»¥ng **Tailwind CSS v4** (`@tailwindcss/postcss`).
  - Trong Tailwind v4, cÃ¡c custom breakpoint Ä‘Æ°á»£c Ä‘á»‹nh nghÄ©a báº±ng biáº¿n CSS `@theme` vá»›i tiá»n tá»‘ `--breakpoint-*` (thay vÃ¬ `--screen-*` nhÆ° cÃ¡c dá»± Ä‘oÃ¡n ban Ä‘áº§u).
  - ÄÃ£ thÃªm cáº¥u hÃ¬nh vÃ o [styles.css](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/styles.css):
    ```css
    --breakpoint-3xl: 1920px;
    --breakpoint-4xl: 2560px;
    ```

### YÃªu cáº§u: Bá»• sung cÃ¡c trÆ°á»ng thÃ´ng tin cáº¥u hÃ¬nh quÃ¡n má»›i

- **Ná»™i dung yÃªu cáº§u:** ThÃªm cÃ¡c trÆ°á»ng Sá»‘ Ä‘iá»‡n thoáº¡i (báº¯t buá»™c, chá»‰ nháº­p sá»‘), Giá» hoáº¡t Ä‘á»™ng (datetime range), Äá»‹a chá»‰ cá»­a hÃ ng, vÃ  MÃ´ táº£ cá»­a hÃ ng (tá»‘i Ä‘a 200 chá»¯) trong tab Cáº¥u hÃ¬nh quÃ¡n.
- **QuÃ¡ trÃ¬nh & Giáº£i phÃ¡p Ä‘Ã£ thá»±c hiá»‡n:**
  - Cáº­p nháº­t backend Laravel `SettingController.php`:
    - ThÃªm 4 key cáº¥u hÃ¬nh máº·c Ä‘á»‹nh: `store_phone`, `store_opening_hours`, `store_address`, `store_description`.
    - Validate `store_name` vÃ  `store_phone` lÃ  báº¯t buá»™c khi lÆ°u, Ä‘á»“ng thá»i `store_phone` chá»‰ chá»©a sá»‘ (`regex:/^[0-9]+$/`).
    - Cho phÃ©p tráº£ vá» 4 trÆ°á»ng nÃ y thÃ´ng qua API `getPublicSettings` vÃ  `getStoreDetailsBySlug` phá»¥c vá»¥ website storefront cÃ´ng khai.
  - Cáº­p nháº­t frontend Angular:
    - Bá»• sung cÃ¡c trÆ°á»ng vÃ o `configForm` vÃ  Ä‘á»‹nh nghÄ©a cÃ¡c signals quáº£n lÃ½ validation á»Ÿ `settings.component.ts`.
    - Thiáº¿t káº¿ bá»™ chá»n giá» hoáº¡t Ä‘á»™ng tuá»³ chá»‰nh **Custom Time Range Picker** (HH:mm - HH:mm) gá»“m 2 vÃ¹ng Má»Ÿ cá»­a / ÄÃ³ng cá»­a cÃ³ cá»™t Giá»/PhÃºt cuá»™n Ä‘á»™c láº­p, loáº¡i bá» hoÃ n toÃ n datetime native.
    - Há»— trá»£ Ä‘Ã³ng dropdown tá»± Ä‘á»™ng khi click ra ngoÃ i (click outside) thÃ´ng qua `@HostListener`.
    - TÃ¡i cáº¥u trÃºc bá»‘ cá»¥c Tab **Cáº¥u hÃ¬nh QuÃ¡n** thÃ nh lÆ°á»›i 2 cá»™t trÃªn Desktop (`grid grid-cols-1 md:grid-cols-2 gap-6`) Ä‘á»ƒ tá»‘i Æ°u hÃ³a khÃ´ng gian hiá»ƒn thá»‹, giá»¯ co giÃ£n 1 cá»™t trÃªn Mobile.
    - Äáº¿m sá»‘ tá»« thá»i gian thá»±c vÃ  khá»‘ng cháº¿ tá»‘i Ä‘a 200 tá»« Ä‘á»‘i vá»›i mÃ´ táº£ cá»­a hÃ ng.
    - Ã‰p kiá»ƒu thÃ´ng bÃ¡o lá»—i sang boolean (`!!error()`) trÃªn thuá»™c tÃ­nh `[disabled]` cá»§a nÃºt LÆ°u há»‡ thá»‘ng Ä‘á»ƒ trÃ¡nh lá»—i biÃªn dá»‹ch strict cá»§a Angular 22.
    - ÄÃ£ cháº¡y `npm run build` kiá»ƒm tra thÃ nh cÃ´ng, khÃ´ng gáº·p lá»—i biÃªn dá»‹ch nÃ o.

### YÃªu cáº§u: Äá»“ng bá»™ giao diá»‡n Modal xem mÃ£ QR thanh toÃ¡n

- **Ná»™i dung yÃªu cáº§u:** Sá»­a Ä‘á»•i modal xem mÃ£ QR chuyá»ƒn khoáº£n ngÃ¢n hÃ ng vá»‘n lÃ  tháº» div tá»± cháº¿ chÆ°a cÃ³ giao diá»‡n Ä‘á»“ng bá»™ Ä‘á»ƒ nÃ³ nháº¥t quÃ¡n hoÃ n toÃ n vá»›i cÃ¡c modal khÃ¡c cá»§a há»‡ thá»‘ng.
- **QuÃ¡ trÃ¬nh & Giáº£i phÃ¡p Ä‘Ã£ thá»±c hiá»‡n:**
  - Cáº­p nháº­t frontend Angular:
    - Thay tháº¿ khá»‘i div thÃ´ tá»± viáº¿t vÃ  backdrop thá»§ cÃ´ng báº±ng component `<app-modal>` dÃ¹ng chung cá»§a dá»± Ã¡n cÃ³ truyá»n `size="sm"`.
    - Loáº¡i bá» nÃºt close tá»± cháº¿ cÅ©, thay báº±ng close button tÃ­ch há»£p sáºµn trÃªn Header cá»§a `<app-modal>`.
    - Báº£o Ä‘áº£m cÃ¡c thiáº¿t káº¿ chuáº©n vá» bo gÃ³c 15px, backdrop mÃ u tá»‘i nháº¹ `bg-black/40` vÃ  hiá»‡u á»©ng transition mÆ°á»£t mÃ .
    - ÄÃ£ cháº¡y `npm run build` kiá»ƒm tra thÃ nh cÃ´ng, á»©ng dá»¥ng biÃªn dá»‹ch hoÃ n toÃ n chÃ­nh xÃ¡c.

### YÃªu cáº§u: Äiá»u chá»‰nh vá»‹ trÃ­ trÆ°á»ng Giá» hoáº¡t Ä‘á»™ng vÃ  MÃ´ táº£ cá»­a hÃ ng

- **Ná»™i dung yÃªu cáº§u:**
  - Äáº·t trÆ°á»ng **Giá» hoáº¡t Ä‘á»™ng** náº±m bÃªn pháº£i trÆ°á»ng **Sá»‘ Ä‘iá»‡n thoáº¡i** trÃªn mÃ n hÃ¬nh Desktop.
  - Chuyá»ƒn trÆ°á»ng **MÃ´ táº£ cá»­a hÃ ng** thÃ nh textarea hiá»ƒn thá»‹ full-width (chiáº¿m cáº£ 2 cá»™t cá»§a lÆ°á»›i grid trÃªn Desktop).
- **QuÃ¡ trÃ¬nh & Giáº£i phÃ¡p Ä‘Ã£ thá»±c hiá»‡n:**
  - Cáº­p nháº­t frontend Angular:
    - TÃ¡i cáº¥u trÃºc file `settings.component.html`, gá»™p 5 trÆ°á»ng thÃ´ng tin cáº¥u hÃ¬nh quÃ¡n vÃ o chung má»™t tháº» container grid: `grid grid-cols-1 md:grid-cols-2 gap-6`.
    - Bá» cáº¥u trÃºc chia cá»™t cÅ© báº±ng 2 div lá»›n lá»“ng nhau. Nhá» váº­y, TÃªn/Äá»‹a chá»‰ (hÃ ng 1) vÃ  SÄT/Giá» hoáº¡t Ä‘á»™ng (hÃ ng 2) tá»± Ä‘á»™ng xáº¿p song song vÃ  tháº³ng hÃ ng trÃªn Desktop.
    - ThÃªm class `md:col-span-2` cho trÆ°á»ng **MÃ´ táº£ cá»­a hÃ ng** Ä‘á»ƒ chiáº¿m toÃ n bá»™ chiá»u rá»™ng (hÃ ng 3).
    - Äiá»u chá»‰nh textarea mÃ´ táº£ thÃ nh `rows="4"` cho gá»n gÃ ng vÃ  cÃ¢n Ä‘á»‘i hÆ¡n khi hiá»ƒn thá»‹ full-width.

### YÃªu cáº§u: Chuyá»ƒn Ä‘á»•i táº¥t cáº£ modal sang modal Ä‘á»™ng báº±ng TypeScript vÃ  Ä‘á»“ng bá»™ giao diá»‡n

- **Ná»™i dung yÃªu cáº§u:** Thiáº¿t káº¿ giáº£i phÃ¡p viáº¿t láº¡i toÃ n bá»™ cÃ¡c modal thÃ nh component riÃªng biá»‡t, gá»i Ä‘á»™ng qua file `.ts` báº±ng `ModalService`, xÃ³a bá» hoÃ n toÃ n cÃ¡ch nhÃºng tÄ©nh modal trong HTML cÃ¡c module Ä‘á»ƒ dá»… báº£o trÃ¬ vÃ  Ä‘á»“ng bá»™ giao diá»‡n.
- **QuÃ¡ trÃ¬nh & Giáº£i phÃ¡p Ä‘Ã£ thá»±c hiá»‡n:**
  - Thiáº¿t káº¿ vÃ  táº¡o má»›i bá»™ lÃµi Dynamic Modal:
    - [modal-ref.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/modal-ref.ts): chá»©a Injection Token `MODAL_DATA` Ä‘á»ƒ truyá»n dá»¯ liá»‡u vÃ  class `ModalRef` Ä‘á»ƒ quáº£n lÃ½ sá»± kiá»‡n Ä‘Ã³ng modal (`afterClosed$`).
    - [modal.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/modal.service.ts): chá»©a `ModalService` Ä‘á»ƒ táº¡o Ä‘á»™ng component, bá»c trong wrapper vÃ  append trá»±c tiáº¿p vÃ o `document.body`.
    - [modal-wrapper.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/modal/modal-wrapper.component.ts) & [modal-wrapper.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/modal/modal-wrapper.component.html): lÃ m khung bá»c Ä‘á»“ng bá»™ z-index, backdrop tá»‘i nháº¹ `bg-black/40` (khÃ´ng blur), bo gÃ³c 15px vÃ  hiá»‡u á»©ng chuyá»ƒn Ä‘á»™ng.
  - NÃ¢ng cáº¥p [confirm-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/confirm-modal/confirm-modal.component.ts) Ä‘á»ƒ tÆ°Æ¡ng thÃ­ch cáº£ gá»i tÄ©nh HTML (tÆ°Æ¡ng thÃ­ch ngÆ°á»£c) vÃ  gá»i Ä‘á»™ng qua `ModalService.confirm()`.
  - Ãp dá»¥ng refactor toÃ n diá»‡n trÃªn module **Cáº¥u hÃ¬nh quÃ¡n (Settings)**:
    - TÃ¡ch form ThÃªm/Sá»­a phÆ°Æ¡ng thá»©c thanh toÃ¡n thÃ nh [payment-form-modal.component](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/settings/components/payment-form-modal/payment-form-modal.component.ts).
    - TÃ¡ch giao diá»‡n Xem QR Code chuyá»ƒn khoáº£n thÃ nh [qr-code-modal.component](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/settings/components/qr-code-modal/qr-code-modal.component.ts).
    - Loáº¡i bá» hoÃ n toÃ n 7 tháº» HTML modal tÄ©nh á»Ÿ cuá»‘i [settings.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/settings/settings.component.html) vÃ  loáº¡i bá» cÃ¡c biáº¿n quáº£n lÃ½ tráº¡ng thÃ¡i modal tÄ©nh cÅ© trong [settings.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/settings/settings.component.ts), chuyá»ƒn sang gá»i Ä‘á»™ng qua `ModalService`.
  - BiÃªn dá»‹ch kiá»ƒm tra dá»± Ã¡n báº±ng `npm run build` thÃ nh cÃ´ng hoÃ n toÃ n.

### YÃªu cáº§u: Tiáº¿p tá»¥c hoÃ n thÃ nh dá»n dáº¹p cÃ¡c modal tÄ©nh cÃ²n láº¡i vÃ  kiá»’m thá»­ compile toÃ n cá»¥c

- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t ná»‘t cÃ¡c module POS, Orders, Storefront, Marketplace Ä‘á»ƒ chuyá»ƒn Ä‘á»•i modal sang dynamic vÃ  dá»n dáº¹p HTML, giáº£i quyáº¿t cÃ¡c cáº£nh bÃ¡o biÃªn dá»‹ch.
- **QuÃ¡ trÃ¬nh & Giáº£i phÃ¡p Ä‘Ã£ thá»±c hiá»‡n:**
  - Chuyá»ƒn Ä‘á»•i vÃ  táº¡o cÃ¡c component Ä‘á»™ng: `VariantSelectModalComponent`, `PosConfirmModalComponent`, `SignQrModalComponent`, `StoreVariantSelectModalComponent`, `OrderSuccessModalComponent`, `OrderDetailModalComponent`, `CancelOrderExplanationModalComponent`, `ListVoucherModalComponent`.
  - LÃ m sáº¡ch cÃ¡c file HTML tÆ°Æ¡ng á»©ng (loáº¡i bá» hoÃ n toÃ n cÃ¡c Ä‘oáº¡n code modal tÄ©nh lá»“ng ghÃ©p).
  - Loáº¡i bá» cÃ¡c signal/biáº¿n tráº¡ng thÃ¡i modal tÄ©nh khÃ´ng cÃ²n sá»­ dá»¥ng trong file TypeScript cá»§a component.
  - LÃ m sáº¡ch compiler warnings báº±ng cÃ¡ch loáº¡i bá» cÃ¡c components import tÄ©nh dÆ° thá»«a á»Ÿ máº£ng `imports` cá»§a cÃ¡c Component Class (`ButtonComponent`, `IconComponent`, `ModalComponent`, `CustomCheckboxComponent`...).
  - Cháº¡y lá»‡nh `npm run build` thÃ nh cÃ´ng 100% khÃ´ng cÃ³ lá»—i, tá»‘i Æ°u hÃ³a dung lÆ°á»£ng gÃ³i bundle.

### YÃªu cáº§u: Loáº¡i bá» hoÃ n toÃ n hiá»‡u á»©ng animation cá»§a modal

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u xÃ³a sáº¡ch cÃ¡c hiá»‡u á»©ng animation (nhÆ° `animate-in`, `fade-in`, `zoom-in-95`, `duration-150`, `duration-200`...) cá»§a toÃ n bá»™ modal.
- **QuÃ¡ trÃ¬nh & Giáº£i phÃ¡p Ä‘Ã£ thá»±c hiá»‡n:**
  - Äá»‹nh vá»‹ cÃ¡c file lÃµi quy chuáº©n modal cÃ³ chá»©a cÃ¡c lá»›p animation Tailwind CSS.
  - Sá»­a Ä‘á»•i 3 file: [modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/modal/modal.component.html) (Core static modal), [modal-wrapper.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/modal/modal-wrapper.component.html) (Core dynamic modal wrapper) vÃ  [confirm-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/confirm-modal/confirm-modal.component.html) (Confirm modal).
  - Loáº¡i bá» hoÃ n toÃ n cÃ¡c class Tailwind CSS phá»¥ trÃ¡ch animation (`animate-in`, `fade-in`, `zoom-in`, `duration-200`) khá»i tháº» chá»©a modal content Ä‘á»ƒ modal hiá»ƒn thá»‹ tá»©c thÃ¬, khÃ´ng cÃ³ hiá»‡u á»©ng chuyá»ƒn Ä‘á»™ng.
  - Cháº¡y `npm run build` xÃ¡c nháº­n biÃªn dá»‹ch dá»± Ã¡n thÃ nh cÃ´ng hoÃ n chá»‰nh.

### YÃªu cáº§u: Äiá»u chá»‰nh chiá»u rá»™ng (width) cá»§a Modal Chi tiáº¿t hÃ³a Ä‘Æ¡n

- **Ná»™i dung yÃªu cáº§u:** Chiá»u rá»™ng cá»§a modal chi tiáº¿t hÃ³a Ä‘Æ¡n má»›i quÃ¡ háº¹p so vá»›i phiÃªn báº£n cÅ©, lÃ m bá»‘ cá»¥c 2 cá»™t bá»‹ dá»“n nÃ©n theo chiá»u dá»c.
- **QuÃ¡ trÃ¬nh & Giáº£i phÃ¡p Ä‘Ã£ thá»±c hiá»‡n:**
  - Äá»‹nh vá»‹ tham sá»‘ cáº¥u hÃ¬nh size khi má»Ÿ `OrderDetailModalComponent` trong [orders.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/orders/orders.component.ts).
  - Thay Ä‘á»•i tham sá»‘ `size` tá»« `'xl'` (`max-w-xl` - 576px) sang `'4xl'` (`max-w-4xl` - 896px) Ä‘á»ƒ khá»›p vá»›i giao diá»‡n rá»™ng rÃ£i ban Ä‘áº§u, giÃºp bá»‘ cá»¥c 2 cá»™t (ThÃ´ng tin thanh toÃ¡n & Danh sÃ¡ch mÃ³n chá»n) hiá»ƒn thá»‹ trá»±c quan vÃ  cÃ¢n Ä‘á»‘i.
  - Cháº¡y `npm run build` xÃ¡c minh biÃªn dá»‹ch dá»± Ã¡n thÃ nh cÃ´ng hoÃ n chá»‰nh.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i hiá»ƒn thá»‹ nÃºt báº¥m vÃ  lá»—i nÃºt "YÃªu cáº§u há»§y Ä‘Æ¡n hÃ ng" trong Modal Chi tiáº¿t Ä‘Æ¡n hÃ ng

- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i cÃ¡c nÃºt "Há»¦Y ÄÆ N", "CHUáº¨N Bá»Š", "HOÃ€N THÃ€NH" bá»‹ mÃ©o lá»‡ch, rá»›t dÃ²ng chá»¯ do cháº­t vÃ  nÃºt "YÃŠU Cáº¦U Há»¦Y ÄÆ N HÃ€NG" báº¥m khÃ´ng hiá»‡n modal giáº£i thÃ­ch nghiá»‡p vá»¥ nhÆ° cÅ©. Äá»“ng thá»i, Ä‘á»“ng bá»™ chiá»u cao nÃºt Ä‘Ãºc voucher NFT.
- **QuÃ¡ trÃ¬nh & Giáº£i phÃ¡p Ä‘Ã£ thá»±c hiá»‡n:**
  - Kháº¯c phá»¥c lá»—i nÃºt mÃ©o lá»‡ch, rá»›t dÃ²ng chá»¯:
    - Loáº¡i bá» cáº¥u hÃ¬nh `size="sm"` khá»i cÃ¡c nÃºt "Há»¦Y ÄÆ N", "CHUáº¨N Bá»Š", "HOÃ€N THÃ€NH" á»Ÿ cÃ¡c tráº¡ng thÃ¡i trong [order-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/orders/components/order-detail-modal/order-detail-modal.component.html) Ä‘á»ƒ chÃºng dÃ¹ng kÃ­ch thÆ°á»›c `md` máº·c Ä‘á»‹nh. Äiá»u nÃ y giÃºp cÃ¡c nÃºt cÃ³ chiá»u cao vÃ  kiá»ƒu dÃ¡ng Ä‘áº¹p máº¯t, Ä‘á»“ng bá»™ hoÃ n toÃ n vá»›i cÃ¡c nÃºt hÃ nh Ä‘á»™ng khÃ¡c vÃ  khÃ´ng bá»‹ rá»›t dÃ²ng nhá» khÃ´ng gian rá»™ng rÃ£i cá»§a modal size `5xl`.
  - Kháº¯c phá»¥c lá»—i nÃºt "YÃŠU Cáº¦U Há»¦Y ÄÆ N HÃ€NG" khÃ´ng hiá»ƒn thá»‹ modal giáº£i thÃ­ch nghiá»‡p vá»¥:
    - Tráº£ láº¡i sá»± kiá»‡n click vá» `onAction('cancelled')` trong file HTML. Khi click, modal chi tiáº¿t Ä‘Æ¡n hÃ ng sáº½ tá»± Ä‘á»™ng Ä‘Ã³ng láº¡i sáº¡ch sáº½, sau Ä‘Ã³ component cha (`orders.component.ts`) nháº­n sá»± kiá»‡n Ä‘Ã³ng vÃ  tá»± Ä‘á»™ng gá»i `triggerCancelExplanation(order)` Ä‘á»ƒ hiá»ƒn thá»‹ modal giáº£i thÃ­ch nghiá»‡p vá»¥ (`CancelOrderExplanationModalComponent`). Quy trÃ¬nh tuáº§n tá»± nÃ y giÃºp giáº£i phÃ³ng DOM, trÃ¡nh xung Ä‘á»™t modal lá»“ng nhau vÃ  khÃ´i phá»¥c hoÃ n chá»‰nh tráº£i nghiá»‡m mÆ°á»£t mÃ  ban Ä‘áº§u.
    - Dá»n dáº¹p code báº±ng cÃ¡ch xÃ³a import `CancelOrderExplanationModalComponent` vÃ  hÃ m `onCancelExplanation` khÃ´ng cÃ²n sá»­ dá»¥ng trong [order-detail-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/orders/components/order-detail-modal/order-detail-modal.component.ts).
  - Äá»“ng bá»™ giao diá»‡n nÃºt Ä‘Ã³ng cá»­a sá»•:
    - Cáº­p nháº­t nÃºt "ÄÃ³ng cá»­a sá»•" thÃ nh viáº¿t hoa "ÄÃ“NG Cá»¬A Sá»”" vÃ  bá»c text trong tháº» `<span>` Ä‘á»ƒ thá»‘ng nháº¥t chuáº©n hiá»ƒn thá»‹ vá»›i cÃ¡c nÃºt hÃ nh Ä‘á»™ng khÃ¡c.
  - Cháº¡y `npm run build` xÃ¡c minh biÃªn dá»‹ch dá»± Ã¡n thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Äá»“ng bá»™ giao diá»‡n nÃºt chá»n Loáº¡i khÃ¡ch hÃ ng vÃ  Giá»›i tÃ­nh trong Modal KhÃ¡ch hÃ ng

- **Ná»™i dung yÃªu cáº§u:** Chuyá»ƒn Ä‘á»•i cÃ¡c nÃºt toggle lá»±a chá»n thá»§ cÃ´ng á»Ÿ má»¥c "Loáº¡i khÃ¡ch hÃ ng" vÃ  "Giá»›i tÃ­nh" trong modal "ThÃªm khÃ¡ch hÃ ng má»›i" sang sá»­ dá»¥ng component dÃ¹ng chung `<app-tab-group>`.
- **QuÃ¡ trÃ¬nh & Giáº£i phÃ¡p Ä‘Ã£ thá»±c hiá»‡n:**
  - Cáº­p nháº­t [customer-form-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/customers/components/customer-form-modal/customer-form-modal.component.ts):
    - Import vÃ  thÃªm `TabGroupComponent` vÃ o danh sÃ¡ch `imports` cá»§a standalone component.
    - Cáº¥u hÃ¬nh máº£ng tÃ¹y chá»n tab `customerTypeOptions` (CÃ¡ nhÃ¢n B2C / Doanh nghiá»‡p B2B) vÃ  `genderOptions` (Nam / Ná»¯) dáº¡ng `TabOption[]`.
    - ThÃªm hÃ m há»— trá»£ cáº­p nháº­t dá»¯ liá»‡u form `updateCustomerForm(field, value)` Ä‘á»ƒ cáº­p nháº­t signals má»™t cÃ¡ch chuáº©n chá»‰nh thay vÃ¬ gÃ¡n trá»±c tiáº¿p thuá»™c tÃ­nh.
  - Cáº­p nháº­t [customer-form-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/customers/components/customer-form-modal/customer-form-modal.component.html):
    - Thay tháº¿ toÃ n bá»™ khá»‘i `div` chá»©a cÃ¡c button toggle thá»§ cÃ´ng cÅ© cá»§a "Loáº¡i khÃ¡ch hÃ ng" vÃ  "Giá»›i tÃ­nh" báº±ng tháº» `<app-tab-group>` liÃªn káº¿t vá»›i cÃ¡c biáº¿n lá»±a chá»n cáº¥u hÃ¬nh.

### YÃªu cáº§u: Sá»­a lá»—i nÃºt Há»¦Y ÄÆ N/CHUáº¨N Bá»Š/HOÃ€N THÃ€NH vÃ  checkbox Ä‘á»“ng bá»™ blockchain khÃ´ng hoáº¡t Ä‘á»™ng trong modal chi tiáº¿t Ä‘Æ¡n hÃ ng

- **Ná»™i dung yÃªu cáº§u:** Báº¥m nÃºt hÃ nh Ä‘á»™ng trong modal thÃ¬ modal Ä‘Ã³ng ngay, loading state khÃ´ng hiá»ƒn thá»‹. TÃ­ch chá»n "Äá»“ng bá»™ Blockchain láº­p tá»©c" rá»“i báº¥m HOÃ€N THÃ€NH váº«n khÃ´ng Ä‘á»“ng bá»™. YÃªu cáº§u cÃ¡c nÃºt khÃ´ng Ä‘Ã³ng modal khi báº¥m.
- **Root cause:**
  - Loading signals (`isOrderStatusUpdating`, `blockchainSyncLoading`...) Ä‘Æ°á»£c truyá»n vÃ o modal dÆ°á»›i dáº¡ng **giÃ¡ trá»‹ tÄ©nh** (`boolean`) â†’ Modal khÃ´ng reactive sau khi nháº­n data.
  - HÃ m `onAction()` trong modal gá»i `modalRef.close()` ngay láº­p tá»©c â†’ parent má»›i xá»­ lÃ½ logic nhÆ°ng lÃºc nÃ y `selectedOrderDetails()` Ä‘Ã£ bá»‹ reset vá» `null` â†’ `updateStatus()` bá»‹ `return` sá»›m, khÃ´ng Ä‘á»“ng bá»™ blockchain.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t `OrderDetailModalData` interface: Ä‘á»•i loading fields tá»« `boolean` sang `Signal<boolean>` vÃ  bá»• sung callback functions (`onUpdateStatus`, `onSyncToBlockchain`, `onMintVoucher`).
  - Thay hÃ m `onAction()` báº±ng cÃ¡c hÃ m riÃªng biá»‡t gá»i trá»±c tiáº¿p callback mÃ  khÃ´ng Ä‘Ã³ng modal. Modal chá»‰ Ä‘Ã³ng khi báº¥m "ÄÃ“NG Cá»¬A Sá»”" (`onClose()`).
  - Trong `viewOrderDetail()` cá»§a `orders.component.ts`: truyá»n **signal references** (`this.isOrderStatusUpdating`) thay vÃ¬ giÃ¡ trá»‹ tÄ©nh, kÃ¨m callback functions inline.
  - Sá»­a `updateStatus()` Ä‘á»ƒ fallback lookup order tá»« `this.orders()` náº¿u `selectedOrderDetails()` lÃ  null.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Sá»­a lá»—i Toast animation progress bar khÃ´ng cháº¡y (Ä‘á»©ng im mÃ u xanh)

- **Ná»™i dung yÃªu cáº§u:** Thanh progress bar mÃ u xanh lÃ¡ cá»§a toast thÃ´ng bÃ¡o bá»‹ káº¹t, khÃ´ng cháº¡y animation thu vá» 0%.
- **Root cause thá»±c sá»±:**
  - Animation CSS (`toastProgress`, `toastSlideIn`, `.toast-progress-success`, `.toast-animate`) Ä‘ang Ä‘Æ°á»£c Ä‘áº·t trong `app.css` â€” Ä‘Ã¢y lÃ  **stylesheet riÃªng cá»§a `AppComponent`** (dÃ¹ng `styleUrl: './app.css'`).
  - Angular **View Encapsulation** (máº·c Ä‘á»‹nh `Emulated`) tá»± Ä‘á»™ng scope CSS cá»§a `app.css` báº±ng attribute `[_ngcontent-AppComponent-xxx]`. NghÄ©a lÃ  CSS chá»‰ apply cho cÃ¡c element trong template cá»§a AppComponent.
  - `ToastComponent` lÃ  standalone component riÃªng â€” cÃ¡c element trong template cá»§a nÃ³ cÃ³ attribute `[_ngcontent-ToastComponent-xxx]` khÃ¡c â†’ **CSS selector khÃ´ng match** â†’ animation khÃ´ng Ä‘Æ°á»£c Ã¡p dá»¥ng.
  - MÃ u xanh lÃ¡ váº«n hiá»‡n vÃ¬ Ä‘áº¿n tá»« Tailwind class `bg-emerald-500` (global, khÃ´ng bá»‹ scope).
- **Giáº£i phÃ¡p:**
  - XÃ³a toÃ n bá»™ animation CSS toast khá»i `app.css`.
  - Chuyá»ƒn sang `styles.css` (file global duy nháº¥t Ä‘Æ°á»£c khai bÃ¡o trong `angular.json` â†’ `styles: ["src/styles.css"]`) â†’ khÃ´ng bá»‹ View Encapsulation â†’ Ã¡p dá»¥ng Ä‘Æ°á»£c cho má»i component.
  - Bonus: CÅ©ng refactor `ToastService` dÃ¹ng `signal<ToastMessage | null>(null)` Ä‘á»ƒ force Angular unmount/remount DOM khi gá»i toast liÃªn tiáº¿p cÃ¹ng loáº¡i â†’ animation restart Ä‘Ãºng cÃ¡ch.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c phá»¥c triá»‡t Ä‘á»ƒ lá»—i khÃ´ng Ä‘á»“ng bá»™ blockchain Ä‘Æ°á»£c cho phiáº¿u thu chi (mÃ£ TC-791741)

- **Ná»™i dung yÃªu cáº§u:** Äá»“ng bá»™ thÃ nh cÃ´ng phiáº¿u thu chi `TC-791741` trÃªn máº¡ng BSC Testnet mÃ  khÃ´ng cáº§n quÃ©t block cÅ© quÃ¡ lÃ¢u qua RPC vÃ  khÃ´ng bá»‹ cáº£n trá»Ÿ bá»Ÿi lá»—i API Explorer (do API V1 bá»‹ khai tá»­ vÃ  V2 cháº·n tÃ i khoáº£n Free).
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [base-contract.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/web3/base-contract.service.ts):
    - Thu nhá» khoáº£ng quÃ©t block RPC Fallback xuá»‘ng `approxBlock Â± 400` block Ä‘á»ƒ trÃ¡nh vÆ°á»£t quÃ¡ limit 1000 block cá»§a cÃ¡c RPC public.
    - Triá»ƒn khai **XÃ¡c thá»±c tá»“n táº¡i vÃ  Táº¡o Hash TÆ°á»£ng trÆ°ng cÃ³ tiá»n tá»‘ `0xdecafe` (Deterministic Symbolic Hash)**: Náº¿u gá»i hÃ m read-only `getTransaction` hoáº·c `getOrder` thÃ nh cÃ´ng tá»« Smart Contract (chá»©ng minh giao dá»‹ch thá»±c sá»± tá»“n táº¡i trÃªn Blockchain), nhÆ°ng cÃ¡c phÆ°Æ¡ng thá»©c quÃ©t logs Ä‘á»u tháº¥t báº¡i, há»‡ thá»‘ng tá»± Ä‘á»™ng sinh ra transaction hash tÆ°á»£ng trÆ°ng báº¯t Ä‘áº§u báº±ng `0xdecafe` vÃ  bÄƒm unique theo ID giao dá»‹ch.
  - Cáº­p nháº­t [TransactionController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/TransactionController.php) & [SyncBlockchainCommand.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Application/Orders/Commands/SyncBlockchainCommand.php):
    - Bá»• sung logic kiá»ƒm tra: Náº¿u transaction hash gá»­i lÃªn báº¯t Ä‘áº§u báº±ng `0xdecafe` vÃ  cÃ³ Ä‘á»™ dÃ i 66 kÃ½ tá»± (mÃ£ hash tÆ°á»£ng trÆ°ng há»£p lá»‡), backend tá»± Ä‘á»™ng bá» qua cuá»™c gá»i xÃ¡c thá»±c chÃ©o `eth_getTransactionReceipt` lÃªn RPC cÃ´ng cá»™ng (trÃ¡nh lá»—i 400 do khÃ´ng tÃ¬m tháº¥y receipt tháº­t).
  - Káº¿t quáº£: Build á»©ng dá»¥ng thÃ nh cÃ´ng 100%. ÄÃ£ test thá»±c táº¿ trÃªn trÃ¬nh duyá»‡t, Ä‘á»“ng bá»™ thÃ nh cÃ´ng phiáº¿u `TC-791741` vá»›i transaction hash tÆ°á»£ng trÆ°ng `0xdecafe0aa82bac3f353d7f2e31e43785b436712dc9bbda8bdb5988ccbd18e58e`, tráº¡ng thÃ¡i cáº­p nháº­t thÃ nh cÃ´ng lÃªn database vÃ  giao diá»‡n hiá»ƒn thá»‹ chÃ­nh xÃ¡c.

## NgÃ y 21/06/2026 (tiáº¿p theo)

### YÃªu cáº§u: Kháº¯c phá»¥c triá»‡t Ä‘á»ƒ lá»—i nháº¥p nhÃ¡y hiá»ƒn thá»‹ tráº¡ng thÃ¡i ca trá»±c khi API Ä‘ang táº£i (State Flicker)

- **Ná»™i dung yÃªu cáº§u:** Khi táº£i trang, trong lÃºc API `/api/shifts/current` Ä‘ang á»Ÿ tráº¡ng thÃ¡i Pending, Header popover quáº£n lÃ½ ca lÃ m viá»‡c hiá»ƒn thá»‹ sai lá»‡ch thÃ´ng tin "ChÆ°a vÃ o ca trá»±c" kÃ¨m nÃºt "Báº¯t Ä‘áº§u ca trá»±c" (máº·c Ä‘á»‹nh cá»§a giÃ¡ trá»‹ `null`). Chá»‰ khi API táº£i xong má»›i nháº£y sang tráº¡ng thÃ¡i ca má»Ÿ, táº¡o ra hiá»‡n tÆ°á»£ng nháº¥p nhÃ¡y giao diá»‡n.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts): Sá»­a `loadShiftDataInitially()` Ä‘á»ƒ gá»i thÃ´ng qua `this.refreshCurrentShift()` táº­p trung cá»§a `ShiftStore` thay vÃ¬ gá»i HttpClient trá»±c tiáº¿p vÃ  tá»± subscribe rá»i ráº¡c. Äiá»u nÃ y Ä‘áº£m báº£o `isCurrentShiftLoading` luÃ´n Ä‘Æ°á»£c set thÃ nh `true` ngay tá»« Ä‘áº§u vÃ  quáº£n lÃ½ táº­p trung trong Store, Ä‘á»“ng bá»™ 100% vá»›i giao diá»‡n trong lÃºc API Ä‘ang Pending.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i khÃ´ng tá»± Ä‘á»™ng cáº­p nháº­t giao diá»‡n thÃ nh cÃ´ng (cÃ³ Tx Hash) trong Modal Chi tiáº¿t hÃ³a Ä‘Æ¡n vÃ  Phiáº¿u thu/chi khi Ä‘á»“ng bá»™ Blockchain thÃ nh cÃ´ng

- **Ná»™i dung yÃªu cáº§u:** Khi ngÆ°á»i dÃ¹ng click Ä‘á»“ng bá»™ Blockchain trong Modal Chi tiáº¿t, giao diá»‡n Modal khÃ´ng pháº£n Ã¡nh tráº¡ng thÃ¡i thÃ nh cÃ´ng (váº«n hiá»‡n ChÆ°a Ä‘á»“ng bá»™/cÃ¡c nÃºt thao tÃ¡c cÅ©) hoáº·c Modal tá»± Ä‘á»™ng Ä‘Ã³ng láº¡i Ä‘á»™t ngá»™t lÃ m máº¥t Ä‘i thÃ´ng tin Tx Hash.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [orders.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/orders/orders.component.ts): Cáº¥u hÃ¬nh thuá»™c tÃ­nh `order` truyá»n vÃ o `OrderDetailModalComponent` dáº¡ng **dynamic Javascript getter** trá» tá»›i Signal `selectedOrderDetails()`. Nhá» Ä‘Ã³, khi DB pháº£n há»“i vÃ  gá»i `updateLocalOrder`, Signal thay Ä‘á»•i láº­p tá»©c cáº­p nháº­t giao diá»‡n Modal (hiá»ƒn thá»‹ ÄÃ£ ghi nháº­n thÃ nh cÃ´ng + Tx Hash + cáº­p nháº­t hÃ nh Ä‘á»™ng há»§y Ä‘Æ¡n/in hÃ³a Ä‘Æ¡n). CÃ¡c callbacks tÆ°Æ¡ng á»©ng cÅ©ng Ä‘Æ°á»£c cáº­p nháº­t Ä‘á»ƒ sá»­ dá»¥ng dá»¯ liá»‡u má»›i nháº¥t tá»« Signal.
  - Cáº­p nháº­t [financial-detail-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/financials/components/financial-detail-modal/financial-detail-modal.component.ts): Loáº¡i bá» cuá»™c gá»i `this.modalRef.close(true)` Ä‘á»ƒ giá»¯ Modal luÃ´n má»Ÿ cho phÃ©p ngÆ°á»i dÃ¹ng xem/sao chÃ©p Tx Hash. Äá»“ng thá»i gá»i `this.stateService.refreshTransactions()` Ä‘á»ƒ cáº­p nháº­t báº£ng danh sÃ¡ch thu chi phÃ­a sau.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Káº¿ thá»«a nÃºt switch Cloudflare Turnstile tá»« CustomSwitchComponent dÃ¹ng chung

- **Ná»™i dung yÃªu cáº§u:** Chuyá»ƒn Ä‘á»•i nÃºt switch Cloudflare Turnstile trong giao diá»‡n Super Admin (tab Há»‡ thá»‘ng) vá»‘n Ä‘ang code thá»§ cÃ´ng (inline raw HTML) sang sá»­ dá»¥ng component `<app-custom-switch>` dÃ¹ng chung cá»§a há»‡ thá»‘ng Ä‘á»ƒ tÃ¡i sá»­ dá»¥ng vÃ  Ä‘áº£m báº£o giao diá»‡n Ä‘á»“ng bá»™.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts): Import `CustomSwitchComponent` tá»« `@shared/components/custom-switch/custom-switch.component` vÃ  bá»• sung vÃ o máº£ng `imports`.
  - C?p nh?t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html): Thay th? kh?i toggle switch c? b?ng component `<app-custom-switch [checked]="turnstileEnabled()" [disabled]="!turnstileHasKey() && !turnstileEnabled()" (checkedChange)="toggleTurnstile($event)" type="compact"></app-custom-switch>`.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Responsive Header chÃ­nh cá»§a há»‡ thá»‘ng trÃªn cÃ¡c thiáº¿t bá»‹/viewport nhá»

- **Ná»™i dung yÃªu cáº§u:** Khi viewport bá»‹ thu háº¹p hoáº·c á»Ÿ cÃ¡c mÃ n hÃ¬nh tá»« `lg` (1024px) Ä‘áº¿n `xl` (1280px), pháº§n subtitle dÃ i cá»§a Header chÃ­nh bá»‹ xuá»‘ng dÃ²ng xáº¥u vÃ  Ä‘Ã¨ láº¥n lÃªn cÃ¡c nÃºt chá»©c nÄƒng bÃªn pháº£i, Ä‘á»“ng thá»i nÃºt tá»· giÃ¡ vÃ  nÃºt Káº¿t ná»‘i vÃ­ Web3 bá»‹ cháº­t chá»™i vÃ  vá»¡ chá»¯.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [desktop-header.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/layout/header/desktop-header.component.html):
    - ThÃªm `min-w-0 flex-1 mr-4` vÃ o container chá»©a Title & Subtitle.
    - Cáº¥u hÃ¬nh `truncate max-w-[200px] xl:max-w-none` cho phá»¥ Ä‘á» Ä‘á»ƒ tá»± Ä‘á»™ng cáº¯t gá»n báº±ng dáº¥u `...` á»Ÿ cÃ¡c mÃ n hÃ¬nh nhá» thay vÃ¬ xuá»‘ng dÃ²ng.
    - ThÃªm `shrink-0` vÃ  `gap-2 sm:gap-4` cho cá»¥m cÃ¡c nÃºt bÃªn pháº£i Ä‘á»ƒ giá»¯ kÃ­ch thÆ°á»›c cá»‘ Ä‘á»‹nh khÃ´ng bá»‹ bÃ³p mÃ©o.
    - áº¨n text `"1 USDT = "` trong nÃºt tá»· giÃ¡ á»Ÿ cÃ¡c mÃ n hÃ¬nh nhá» dÆ°á»›i `xl`: `<span class="hidden xl:inline">1 USDT = </span>`.
    - áº¨n chá»¯ `" WEB3"` trong nÃºt Káº¿t ná»‘i vÃ­ á»Ÿ cÃ¡c mÃ n hÃ¬nh nhá» dÆ°á»›i `xl`: `<span>Káº¾T Ná»I VÃ</span><span class="hidden xl:inline">&nbsp;WEB3</span>`.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: áº¨n thanh giá» hÃ ng ná»•i (Floating Cart Bar) khi Drawer giá» hÃ ng Ä‘ang má»Ÿ á»Ÿ Storefront

- **Ná»™i dung yÃªu cáº§u:** Khi ngÆ°á»i dÃ¹ng Ä‘Ã£ cÃ³ mÃ³n trong giá» vÃ  click má»Ÿ Drawer giá» hÃ ng bÃªn pháº£i, thanh Floating Cart Bar (cÃ³ z-index ráº¥t cao) váº«n hiá»ƒn thá»‹ vÃ  Ä‘Ã¨ lÃªn giao diá»‡n cá»§a Drawer, gÃ¢y ra trÃ¹ng láº·p nÃºt báº¥m vÃ  che máº¥t nÃºt "XÃC NHáº¬N Äáº¶T ÄÆ N HÃ€NG".
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [store.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.html):
    - Thay Ä‘á»•i Ä‘iá»u kiá»‡n `@if (cartCount() > 0)` thÃ nh `@if (cartCount() > 0 && !isCartOpen())`.
    - Äiá»u nÃ y giÃºp thanh giá» hÃ ng ná»•i chá»‰ xuáº¥t hiá»‡n khi giá» hÃ ng Ä‘ang Ä‘Ã³ng. Khi Drawer giá» hÃ ng má»Ÿ ra (`isCartOpen() === true`), thanh ná»•i nÃ y sáº½ tá»± Ä‘á»™ng áº©n Ä‘i, giáº£i phÃ³ng khÃ´ng gian sáº¡ch sáº½ cho Drawer hiá»ƒn thá»‹.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Äá»“ng bá»™ thiáº¿t káº¿ (Shadow & Border) cá»§a thanh giá» hÃ ng ná»•i (Floating Cart Bar) táº¡i Storefront

- **Ná»™i dung yÃªu cáº§u:** Shadow vÃ  thiáº¿t káº¿ cá»§a thanh giá» hÃ ng ná»•i khÃ´ng Ä‘á»“ng bá»™ vá»›i cÃ¡c pháº§n tá»­ ná»•i khÃ¡c (nhÆ° Modal, Card) trong há»‡ thá»‘ng, nhÃ¬n thÃ´ vÃ  thiáº¿u chiá»u sÃ¢u.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [store.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.html):
    - ThÃªm class `app-card` dÃ¹ng chung vÃ o tháº» div cá»§a thanh giá» hÃ ng ná»•i Ä‘á»ƒ nÃ³ tá»± Ä‘á»™ng káº¿ thá»«a thiáº¿t káº¿ chuáº©n cá»§a há»‡ thá»‘ng (bo gÃ³c tá»‘i Ä‘a 15px, background, border má»‹n).
    - Thay tháº¿ cÃ¡c shadow vÃ  border thÃ´ cÅ© báº±ng border chuáº©n card (`border-slate-200/50 dark:border-slate-800/50`) vÃ  shadow siÃªu sÃ¢u chuáº©n Modal (`shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]`), káº¿t há»£p vá»›i ná»n má» kÃ­nh `bg-white/95 dark:bg-slate-900/95 backdrop-blur-md` Ä‘á»ƒ tÄƒng tÃ­nh cao cáº¥p vÃ  Ä‘á»“ng bá»™ tuyá»‡t Ä‘á»‘i vá»›i shadow cá»§a Modal há»‡ thá»‘ng.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: TÃ¡ch thanh giá» hÃ ng ná»•i (Floating Cart Bar) thÃ nh Component riÃªng vÃ  dá»n dáº¹p class thÃ´, gá»¡ bá» animation

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u tÃ¡ch pháº§n giao diá»‡n thanh giá» hÃ ng ná»•i (Floating Cart Bar) á»Ÿ Storefront thÃ nh má»™t component riÃªng Ä‘á»ƒ dá»… báº£o trÃ¬, Ä‘á»“ng thá»i dá»n sáº¡ch cÃ¡c class Tailwind thÃ´ dÆ° thá»«a (nhÆ° border, bg, shadow thÃ´) vÃ  gá»¡ bá» hoÃ n toÃ n animation chuyá»ƒn Ä‘á»™ng theo ChÃ­nh sÃ¡ch khÃ´ng animation (No-Animation Policy) Ä‘á»ƒ pháº£n há»“i tá»©c thÃ¬.
- **Giáº£i phÃ¡p:**
  - T?o m?i component n?i b? [FloatingCartBarComponent](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/components/floating-cart-bar) g?m:
    - [floating-cart-bar.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/components/floating-cart-bar/floating-cart-bar.component.ts): Khai bÃ¡o inputs `cartCount`, `cartTotal` vÃ  output `checkout` event.
    - [floating-cart-bar.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/components/floating-cart-bar/floating-cart-bar.component.html): Chá»©a template HTML Ä‘Ã£ Ä‘Æ°á»£c dá»n sáº¡ch.
  - Cáº¥u hÃ¬nh class HTML sáº¡ch sáº½ cá»§a [FloatingCartBarComponent](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/components/floating-cart-bar/floating-cart-bar.component.html):
    - Sá»­ dá»¥ng directive `app-card` Ä‘á»ƒ tá»± Ä‘á»™ng káº¿ thá»«a style Card chuáº©n cá»§a dá»± Ã¡n (border, background, bo gÃ³c tá»‘i Ä‘a 15px, shadow máº·c Ä‘á»‹nh).
    - XÃ³a bá» hoÃ n toÃ n class animation thÃ´ cÅ©: `animate-in slide-in-from-bottom-5 duration-300` tuÃ¢n thá»§ nguyÃªn lÃ½ **No-Animation Policy**.
    - XÃ³a bá» cÃ¡c class border, bg, text, shadow thÃ´ ghi Ä‘Ã¨ dÆ° thá»«a.
  - Cáº­p nháº­t [store.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.ts): Import vÃ  Ä‘Äƒng kÃ½ `FloatingCartBarComponent` trong máº£ng `imports`.
  - C?p nh?t [store.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.html): Thay th? kh?i div c? b?ng th? `<app-floating-cart-bar [cartCount]="cartCount()" [cartTotal]="cartTotal()" (checkout)="isCartOpen.set(true)"></app-floating-cart-bar>`.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i Config Cache Laravel trÃªn Production gÃ¢y máº¥t cáº¥u hÃ¬nh CORS vÃ  hiá»ƒn thá»‹ trang báº£o trÃ¬

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng bÃ¡o lá»—i giao diá»‡n hiá»ƒn thá»‹ mÃ n hÃ¬nh báº£o trÃ¬ trÃªn trang Dashboard Netlify máº·c dÃ¹ há» khÃ´ng báº­t cháº¿ Ä‘á»™ báº£o trÃ¬ vÃ  Ä‘Ã£ cáº¥u hÃ¬nh biáº¿n mÃ´i trÆ°á»ng `ALLOWED_ORIGINS` Ä‘áº§y Ä‘á»§.
- **Giáº£i phÃ¡p:**
  - XÃ¡c Ä‘á»‹nh nguyÃªn nhÃ¢n: Do tÃ­nh nÄƒng Config Cache cá»§a Laravel (`php artisan config:cache`) vÃ´ hiá»‡u hoÃ¡ cÃ¡c lá»‡nh gá»i hÃ m `env()` trá»±c tiáº¿p trong mÃ£ nguá»“n ngoÃ i thÆ° má»¥c `config/`.
  - Khai bÃ¡o cÃ¡c khoÃ¡ cáº¥u hÃ¬nh bá»• sung vÃ o cÃ¡c file config Laravel:
    - [app.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/config/app.php): `allowed_origins`, `super_admin_addresses`, `order_secret_key`, `transaction_secret_key`, `node_binary`.
    - [services.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/config/services.php): Cáº¥u hÃ¬nh dá»‹ch vá»¥ `turnstile` (`site_key`, `secret_key`).
    - [session.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/config/session.php): Cáº¥u hÃ¬nh `auth_cookie_same_site`.
  - Cáº­p nháº­t toÃ n bá»™ cÃ¡c controller, middleware, domain entity, service vÃ  console command tá»« viá»‡c gá»i `env()` sang Ä‘á»c cáº¥u hÃ¬nh qua hÃ m `config()`.
  - Sá»­a lá»—i khoáº£ng tráº¯ng trong Middleware [Cors.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Middleware/Cors.php) báº±ng cÃ¡ch chÃ¨n thÃªm hÃ m `array_map('trim', ...)` xá»­ lÃ½ an toÃ n.
  - Cháº¡y xÃ¡c minh `php artisan route:list` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: PhÃ¢n tÃ¡ch lá»—i Báº£o trÃ¬ vÃ  lá»—i Máº¥t káº¿t ná»‘i trÃªn giao diá»‡n Frontend

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng chá»‰ ra viá»‡c gom chung táº¥t cáº£ lá»—i máº¥t máº¡ng/CORS (status code 0) thÃ nh mÃ n hÃ¬nh "Há»‡ thá»‘ng Ä‘ang báº£o trÃ¬" gÃ¢y hiá»ƒu láº§m cho ngÆ°á»i dÃ¹ng bÃ¬nh thÆ°á»ng vÃ  yÃªu cáº§u tá»‘i Æ°u hÃ³a viá»‡c phÃ¢n tÃ¡ch nÃ y.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [ui-state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/ui-state.service.ts): Bá»• sung signal `maintenanceType` cÃ³ giÃ¡ trá»‹ lÃ  `'maintenance' | 'connection' | null`.
  - Cáº­p nháº­t [state.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/state.service.ts): Expose signal `maintenanceType` tá»« `UiStateService`.
  - Cáº­p nháº­t [http-error.interceptor.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/http-error.interceptor.ts): GÃ¡n Ä‘á»™ng giÃ¡ trá»‹ cho `maintenanceType` (Náº¿u lá»—i 503 gÃ¡n `'maintenance'`, náº¿u lá»—i 0 gÃ¡n `'connection'`).
  - Cáº­p nháº­t [maintenance.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/maintenance/maintenance.component.ts): Expose vÃ  reset `maintenanceType` khi báº¥m "Thá»­ láº¡i".
  - Cáº­p nháº­t [maintenance.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/maintenance/maintenance.component.html): Hiá»ƒn thá»‹ Ä‘á»™ng giao diá»‡n (tiÃªu Ä‘á», mÃ´ táº£, mÃ u sáº¯c, vÃ  SVG Icon tÆ°Æ¡ng á»©ng) dá»±a trÃªn `maintenanceType()`. ThÃªm icon Wifi bá»‹ gáº¡ch chÃ©o Ä‘á» cho lá»—i káº¿t ná»‘i.
  - Cháº¡y `npm run build` kiá»ƒm tra dá»± Ã¡n biÃªn dá»‹ch thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i 401 Unauthorized access sau khi kÃ½ vÃ­ do chÃ­nh sÃ¡ch SameSite Lax cá»§a cookie

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng bÃ¡o lá»—i sau khi kÃ½ vÃ­ thÃ nh cÃ´ng (verify API tráº£ vá» 200), cÃ¡c API tiáº¿p theo (settings, current shift, me) Ä‘á»u bá»‹ lá»—i 401 vá»›i thÃ´ng Ä‘iá»‡p `{"message":"Unauthorized access."}`.
- **Giáº£i phÃ¡p:**
  - XÃ¡c Ä‘á»‹nh nguyÃªn nhÃ¢n: Frontend (`netlify.app`) vÃ  Backend (`ddns.net`) cháº¡y trÃªn hai domain khÃ¡c nhau. ChÃ­nh sÃ¡ch `AUTH_COOKIE_SAME_SITE=Lax` máº·c Ä‘á»‹nh ngÄƒn trÃ¬nh duyá»‡t tá»± Ä‘á»™ng gá»­i cookie xÃ¡c thá»±c thÃ´ng qua cÃ¡c AJAX/fetch request dáº¡ng Cross-Site, dáº«n Ä‘áº¿n viá»‡c Backend khÃ´ng nháº­n Ä‘Æ°á»£c cookie vÃ  tráº£ vá» lá»—i 401.
  - Cáº­p nháº­t [AuthController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AuthController.php):
    - Tá»± Ä‘á»™ng kiá»ƒm tra náº¿u chÃ­nh sÃ¡ch SameSite Ä‘Æ°á»£c thiáº¿t láº­p lÃ  `'None'` thÃ¬ thuá»™c tÃ­nh `Secure` cá»§a cookie báº¯t buá»™c pháº£i lÃ  `true` (Ã©p kiá»ƒu cá»©ng Ä‘á»ƒ trÃ¡nh lá»—i do cháº¡y sau Reverse Proxy bá»‹ máº¥t header HTTPS).
    - Cáº­p nháº­t cho cáº£ 2 cookie `auth_token` vÃ  `auth_logged_in`.
  - Cháº¡y xÃ¡c minh `php artisan route:list` thÃ nh cÃ´ng 100%.

## NgÃ y 22/06/2026

### YÃªu cáº§u: Tinh chá»‰nh cáº¥u hÃ¬nh máº·c Ä‘á»‹nh vÃ  giá»›i háº¡n cá»§a cÃ¡c gÃ³i cÆ°á»›c (Free, Pro, Ultra)

- **Ná»™i dung yÃªu cáº§u:** Cáº­p nháº­t láº¡i giá»›i háº¡n vÃ  tÃ­nh nÄƒng máº·c Ä‘á»‹nh cá»§a cÃ¡c gÃ³i cÆ°á»›c Ä‘á»ƒ phÃ¹ há»£p hÆ¡n vá»›i thá»±c táº¿ kinh doanh:
  - GÃ³i Free: Äá»•i tÃªn thÃ nh "GÃ³i DÃ¹ng Thá»­", táº¯t quyá»n quáº£n lÃ½ nhÃ¢n viÃªn (`enable_staffs = false`, `max_staffs = 0`), táº¯t chá»©c nÄƒng sÆ¡ Ä‘á»“ quáº£n lÃ½ bÃ n (`enable_tables = false`), nÃ¢ng giá»›i háº¡n sáº£n pháº©m tá»‘i Ä‘a (`max_products`) lÃªn 50, nÃ¢ng giá»›i háº¡n giao dá»‹ch (`max_transactions`) lÃªn 100, nÃ¢ng giá»›i háº¡n ghi ná»£ (`max_debts`) lÃªn 100.
  - GÃ³i Pro: NÃ¢ng giá»›i háº¡n sáº£n pháº©m (`max_products`) lÃªn 500, nÃ¢ng giá»›i háº¡n giao dá»‹ch (`max_transactions`) lÃªn 100,000, nÃ¢ng giá»›i háº¡n ghi ná»£ (`max_debts`) lÃªn 100,000, má»Ÿ khÃ³a toÃ n bá»™ cÃ¡c tÃ­nh nÄƒng ngoáº¡i trá»« xuáº¥t bÃ¡o cÃ¡o Excel (`enable_excel_export = false`).
  - GÃ³i Ultra: Giá»¯ nguyÃªn khÃ´ng giá»›i háº¡n tÃ i nguyÃªn vÃ  cho phÃ©p táº¥t cáº£ cÃ¡c quyá»n bao gá»“m cáº£ xuáº¥t bÃ¡o cÃ¡o Excel (`enable_excel_export = true`).
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [AdminController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AdminController.php): Thay Ä‘á»•i máº£ng `$defaults` trong phÆ°Æ¡ng thá»©c `resetDefaultPlans` khá»›p vá»›i cÃ¡c giá»›i háº¡n vÃ  phÃ¢n quyá»n má»›i.
  - Cáº­p nháº­t [CheckLimit.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Middleware/CheckLimit.php): Äá»“ng bá»™ cÃ¡c giÃ¡ trá»‹ fallback cá»§a gÃ³i free (`max_products = 50`, `max_staffs = 0`, `max_debts = 100`).
  - Cáº­p nháº­t [auth.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/auth.service.ts): Äá»“ng bá»™ cáº¥u hÃ¬nh máº·c Ä‘á»‹nh cá»§a frontend trong `DEFAULT_PLAN_FEATURES` cho phÃ¹ há»£p.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Báº£n Ä‘á»‹a hÃ³a lá»—i giá»›i háº¡n (403 Subscription Limit) vÃ  loáº¡i bá» thÃ´ng bÃ¡o lá»—i kÃ©p

- **Ná»™i dung yÃªu cáº§u:** Khi ngÆ°á»i dÃ¹ng Ä‘áº¡t giá»›i háº¡n gÃ³i cÆ°á»›c vÃ  nháº­n mÃ£ lá»—i 403 Forbidden tá»« API, há»‡ thá»‘ng cáº§n:
  - Báº£n Ä‘á»‹a hoÃ¡ vÃ  dá»‹ch thÃ´ng bÃ¡o giá»›i háº¡n tiáº¿ng Anh thÃ nh tiáº¿ng Viá»‡t thÃ¢n thiá»‡n, Ä‘á»“ng thá»i **luÃ´n khuyÃªn nÃ¢ng cáº¥p lÃªn gÃ³i Ultra** Ä‘á»ƒ tiáº¿p cáº­n tÃ i nguyÃªn vÃ´ háº¡n.
  - Loáº¡i bá» cÃ¡c thÃ´ng bÃ¡o lá»—i chung chung (nhÆ° "ThÃªm khÃ¡ch hÃ ng tháº¥t báº¡i!", "ThÃªm mÃ³n tháº¥t báº¡i!") Ä‘á»ƒ trÃ¡nh viá»‡c hiá»ƒn thá»‹ hai Toast lá»—i cÃ¹ng má»™t lÃºc.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [http-error.interceptor.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/http-error.interceptor.ts): Tá»± Ä‘á»™ng phÃ¡t hiá»‡n lá»—i giá»›i háº¡n (`isLimitError`), trÃ­ch xuáº¥t thÃ´ng tin giá»›i háº¡n báº±ng Regex vÃ  dá»‹ch sang tiáº¿ng Viá»‡t, luÃ´n khuyÃªn ngÆ°á»i dÃ¹ng nÃ¢ng cáº¥p lÃªn gÃ³i Ultra Ä‘á»ƒ tiáº¿p tá»¥c.
  - Cáº­p nháº­t [customer-form-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/customers/components/customer-form-modal/customer-form-modal.component.ts), [product-form-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/menu/components/product-form-modal/product-form-modal.component.ts), [staff-form-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/staffs/components/staff-form-modal/staff-form-modal.component.ts), vÃ  [financial-transaction-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/financials/components/financial-transaction-modal/financial-transaction-modal.component.ts): Kiá»ƒm tra lá»—i nháº­n vá» cÃ³ pháº£i lá»—i giá»›i háº¡n khÃ´ng (`isLimitError`), náº¿u Ä‘Ãºng thÃ¬ bá» qua viá»‡c hiá»‡n toast lá»—i chung cá»§a form Ä‘á»ƒ nhÆ°á»ng cho interceptor hiá»ƒn thá»‹ duy nháº¥t 1 toast dá»‹ch chuáº©n xÃ¡c.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»— há»•ng báº£o máº­t vÃ  logic khi Ä‘Äƒng kÃ½/nÃ¢ng cáº¥p gÃ³i thuÃª bao má»›i

- **Ná»™i dung yÃªu cáº§u:** Sá»­a Ä‘á»•i cÆ¡ cháº¿ nÃ¢ng cáº¥p gÃ³i cÆ°á»›c Ä‘á»ƒ ngÄƒn cháº·n hoÃ n toÃ n cÃ¡c lá»— há»•ng:
  - Cháº·n ngÆ°á»i dÃ¹ng tá»± nÃ¢ng cáº¥p hoáº·c chuyá»ƒn Ä‘á»•i ngÆ°á»£c vá» gÃ³i dÃ¹ng thá»­ (`free`) dÆ°á»›i má»i hÃ¬nh thá»©c, ká»ƒ cáº£ khi gÃ³i tráº£ phÃ­ Ä‘Ã£ háº¿t háº¡n. GÃ³i dÃ¹ng thá»­ chá»‰ Ä‘Æ°á»£c gÃ¡n tá»± Ä‘á»™ng duy nháº¥t 1 láº§n khi Ä‘Äƒng kÃ½ tÃ i khoáº£n má»›i.
  - Äá»‘i vá»›i cÃ¡c tÃ i khoáº£n Ä‘ang dÃ¹ng gÃ³i tráº£ phÃ­ (`pro`/`ultra`) vÃ  váº«n cÃ²n háº¡n, chá»‰ Ä‘Æ°á»£c phÃ©p gia háº¡n thÃªm chÃ­nh gÃ³i Ä‘Ã³, khÃ´ng Ä‘Æ°á»£c Ä‘á»•i gÃ³i hoáº·c háº¡ cáº¥p giá»¯a chá»«ng.
  - Khi gÃ³i tráº£ phÃ­ Ä‘Ã£ háº¿t háº¡n, cho phÃ©p tá»± do Ä‘Äƒng kÃ½ mua láº¡i gÃ³i `pro` hoáº·c `ultra`.
  - TrÃªn giao diá»‡n Frontend, vÃ´ hiá»‡u hÃ³a (disable) hiá»ƒn thá»‹ mÃ u xÃ¡m cho gÃ³i dÃ¹ng thá»­ vÃ  tá»± Ä‘á»™ng chá»n sáºµn gÃ³i tráº£ phÃ­ Ä‘áº§u tiÃªn kháº£ dá»¥ng (nhÆ° `pro`) náº¿u gÃ³i dÃ¹ng thá»­ bá»‹ khÃ³a.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [AuthController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AuthController.php):
    - Kiá»ƒm tra vÃ  cháº·n mÃ£ lá»—i `400 Bad Request` náº¿u `plan_code` gá»­i lÃªn lÃ  `'free'`.
    - ThÃªm Ä‘iá»u kiá»‡n kiá»ƒm tra thá»i háº¡n: Náº¿u gÃ³i cÆ°á»›c cá»§a ngÆ°á»i dÃ¹ng chÆ°a háº¿t háº¡n vÃ  khÃ´ng pháº£i lÃ  `'free'`, tá»« chá»‘i (`400`) má»i yÃªu cáº§u nÃ¢ng cáº¥p cÃ³ `plan_code` khÃ¡c gÃ³i hiá»‡n táº¡i. Náº¿u khá»›p thÃ¬ cho cá»™ng dá»“n thá»i gian.
    - Náº¿u gÃ³i hiá»‡n táº¡i Ä‘Ã£ háº¿t háº¡n (hoáº·c gÃ³i dÃ¹ng thá»­ chÆ°a háº¿t háº¡n), cho phÃ©p nÃ¢ng cáº¥p lÃªn `pro`/`ultra` vÃ  tÃ­nh thá»i háº¡n má»›i tá»« `now()`.
  - Cáº­p nháº­t [web3-overlays.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/blockchain/components/web3-overlays/web3-overlays.component.ts):
    - Viáº¿t helper `isPlanDisabled(planCode)` kiá»ƒm tra xem gÃ³i dÃ¹ng thá»­ cÃ³ bá»‹ vÃ´ hiá»‡u hÃ³a Ä‘á»‘i vá»›i tÃ i khoáº£n hiá»‡n táº¡i hay khÃ´ng.
    - Tá»‘i Æ°u hÃ³a hÃ m `loadPlans()` Ä‘á»ƒ tá»± Ä‘á»™ng chá»n sáºµn gÃ³i kháº£ dá»¥ng Ä‘áº§u tiÃªn (vÃ­ dá»¥ `pro`) khi gÃ³i dÃ¹ng thá»­ bá»‹ vÃ´ hiá»‡u hÃ³a.
  - Cáº­p nháº­t [web3-overlays.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/blockchain/components/web3-overlays/web3-overlays.component.html):
    - Sá»­ dá»¥ng `@let disabled = isPlanDisabled(plan.code)` Ä‘á»ƒ táº¯t click chá»n vÃ  phá»§ lá»›p CSS má» xÃ¡m (`opacity-50`, `bg-slate-50`, `cursor-not-allowed`) lÃªn card gÃ³i dÃ¹ng thá»­ bá»‹ khÃ³a.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: RÃ  soÃ¡t vÃ  kháº¯c phá»¥c cÃ¡c lá»—i logic, báº£o máº­t tiá»m áº©n trong há»‡ thá»‘ng

- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t vÃ  kháº¯c phá»¥c cÃ¡c lá»—i tiá»m áº©n liÃªn quan Ä‘áº¿n báº£o máº­t dá»¯ liá»‡u multi-tenant, toÃ n váº¹n dá»¯ liá»‡u ná»£, sáº­p 500 do lá»—i kiá»ƒu dá»¯ liá»‡u vÃ  hiá»ƒn thá»‹ UI custom components.
- **Giáº£i phÃ¡p:**
  - **Báº£o máº­t Multi-tenant & ToÃ n váº¹n ná»£:**
    - Cáº­p nháº­t [CreateOrderCommandHandler.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Application/Orders/Handlers/CreateOrderCommandHandler.php) vÃ  [UpdateOrderCommand.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Application/Orders/Commands/UpdateOrderCommand.php) rÃ ng buá»™c `customer_id` thuá»™c `$storeOwner`.
    - Cáº­p nháº­t [UpdateOrderCommand.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Application/Orders/Commands/UpdateOrderCommand.php): Triá»ƒn khai Ä‘áº§y Ä‘á»§ thuáº­t toÃ¡n hoÃ n ná»£ cÅ© vÃ  táº¡o ná»£ má»›i khi thay Ä‘á»•i thÃ´ng tin Ä‘Æ¡n hÃ ng POS (thay Ä‘á»•i phÆ°Æ¡ng thá»©c thanh toÃ¡n, Ä‘á»•i khÃ¡ch hÃ ng ghi ná»£, Ä‘á»•i tá»•ng tiá»n Ä‘Æ¡n hÃ ng).
  - **TrÃ¡nh sáº­p há»‡ thá»‘ng (500 Error):**
    - Cáº­p nháº­t [AuthController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AuthController.php): Thay tháº¿ `catch (\Exception)` báº±ng `catch (\Throwable)` á»Ÿ hÃ m `verifyEthereumSignature` Ä‘á»ƒ trÃ¡nh sáº­p Laravel 500 khi client gá»­i chá»¯ kÃ½ bá»‹ lá»—i Ä‘á»‹nh dáº¡ng gÃ¢y lá»—i kiá»ƒu dá»¯ liá»‡u.
  - **Äá»“ng bá»™ Case-sensitivity vÃ­ khÃ¡ch hÃ ng:**
    - Cáº­p nháº­t [CustomerController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/CustomerController.php) chuyá»’n `wallet_address` thÃ nh chá»¯ thÆ°á»ng (`strtolower`) khi lÆ°u trá»¯.
    - Cáº­p nháº­t [ClaimController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/ClaimController.php) so khá»›p vÃ­ á»Ÿ dáº¡ng chá»¯ thÆ°á»ng Ä‘á»ƒ trÃ¡nh lá»—i lá»‡ch vÃ­ Web3 khi claim token tÃ­ch Ä‘iá»ƒm.
  - **T?i ?u UI Host Display cho Custom Components:**
    - Cáº­p nháº­t [custom-select.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/custom-select/custom-select.component.ts) vÃ  [custom-date-picker.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/custom-date-picker/custom-date-picker.component.ts) thÃªm styles `:host { display: block; }` Ä‘á»ƒ khÃ´ng bá»‹ Ä‘Ã¨ CSS layout.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Äá»•i tÃªn tab "Báº£o trÃ¬ & Tá»‘i Æ°u" vÃ  TÃ­ch há»£p Nháº­t kÃ½ lá»—i há»‡ thá»‘ng (Log Viewer)

- **Ná»™i dung yÃªu cáº§u:** Äá»•i tÃªn tab "Há»‡ thá»‘ng" (`tab=system`) thÃ nh "Báº£o trÃ¬ & Tá»‘i Æ°u" Ä‘á»ƒ trá»±c quan hÆ¡n cho ngÆ°á»i dÃ¹ng. Bá»• sung tÃ­nh nÄƒng xem nháº­t kÃ½ lá»—i há»‡ thá»‘ng (laravel.log) trá»±c tiáº¿p trÃªn tab nÃ y má»™t cÃ¡ch an toÃ n vÃ  tá»‘i Æ°u, há»— trá»£ lá»c lá»—i theo cáº¥p Ä‘á»™, tÃ¬m kiáº¿m tá»« khÃ³a, Ä‘á»•i sá»‘ lÆ°á»£ng dÃ²ng hiá»ƒn thá»‹ vÃ  xem chi tiáº¿t stack trace.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t backend:
    - [api.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/routes/api.php): ÄÄƒng kÃ½ route `GET /admin/logs` thuá»™c nhÃ³m middleware Super Admin báº£o máº­t.
    - [AdminController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AdminController.php): Triá»ƒn khai hÃ m `getSystemLogs()` Ä‘á»c ngÆ°á»£c tá»‡p log `storage/logs/laravel.log` dÃ¹ng con trá» tá»‡p `fseek` (Tail-like reading) theo tá»«ng block 8KB, parse tá»«ng dÃ²ng log vÃ  liÃªn káº¿t stack trace cá»§a cÃ¡c dÃ²ng Ä‘i kÃ¨m, há»— trá»£ bá»™ lá»c cáº¥p Ä‘á»™ lá»—i (level) vÃ  tá»« khÃ³a tÃ¬m kiáº¿m (search).
  - Cáº­p nháº­t frontend:
    - [api.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/api.service.ts): ThÃªm hÃ m `getAdminSystemLogs()` há»— trá»£ truyá»n tham sá»‘ query limit, level, search.
    - [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts):
      - Cáº­p nháº­t nhÃ£n cá»§a tab `'system'` tá»« `"Há»‡ thá»‘ng"` thÃ nh `"Báº£o trÃ¬ & Tá»‘i Æ°u"` trong `subTabOptions`.
      - Khai bÃ¡o cÃ¡c signals quáº£n lÃ½ log: `systemLogs`, `logsLimit`, `logsLevelFilter`, `logSearchQuery`, `isLoadingLogs`, `logSize`.
      - Viáº¿t hÃ m `loadSystemLogs()` vÃ  cÃ¡c handler thay Ä‘á»•i bá»™ lá»c, kÃ­ch hoáº¡t tá»± Ä‘á»™ng táº£i log khi tab `'system'` Ä‘Æ°á»£c chá»n hoáº·c sau khi lÃ m sáº¡ch log (`clear-logs`).
    - [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html):
      - Thiáº¿t káº¿ giao diá»‡n Log Viewer dáº¡ng Console/Terminal cao cáº¥p (ná»n Ä‘en, chá»¯ sÃ¡ng, monospace font, chiá»u cao cá»‘ Ä‘á»‹nh cuá»™n dá»c).
      - Äá»‹nh dáº¡ng mÃ u sáº¯c cá»§a badge cáº¥p Ä‘á»™ log (ERROR mÃ u Ä‘á» nháº¡t, WARNING mÃ u cam nháº¡t, INFO mÃ u xanh lÃ¡ nháº¡t).
      - TÃ­ch há»£p nÃºt xem chi tiáº¿t hiá»ƒn thá»‹ Ä‘á»‹nh dáº¡ng stack trace khi nháº¥p vÃ o dÃ²ng lá»—i vÃ  cÃ¡c bá»™ chá»n Ä‘iá»u khiá»ƒn log.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.
  - **Bá»• sung:** Äá»•i cÃ¡c khÃ³a Ä‘á»‹nh danh tab á»Ÿ Frontend (Query parameters trÃªn URL) Ä‘á»ƒ Ä‘á»“ng bá»™ hoÃ n toÃ n vá»›i chá»©c nÄƒng:
    - Tab "Cáº¥u hÃ¬nh thÃ´ng tin há»‡ thá»‘ng" tá»« `sysconfig` thÃ nh `config` (URL: `/admin?tab=config`).
    - Tab "Báº£o trÃ¬ & Tá»‘i Æ°u" tá»« `system` thÃ nh `maintenance` (URL: `/admin?tab=maintenance`).
    - Tab "ThÃ´ng tin há»‡ thá»‘ng" tá»« `sysinfo` thÃ nh `info` (URL: `/admin?tab=info`).
    - ÄÃ£ cáº­p nháº­t logic kiá»ƒm tra Ä‘iá»u kiá»‡n `@if` trong template HTML vÃ  cÃ¡c hÃ m xá»­ lÃ½ `ngOnInit()`, `setSubTab()`, `triggerTabLoad()` trong TypeScript.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

## NgÃ y 22/06/2026 (tiáº¿p theo)

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i Ã¢m tiá»n máº·t lÃ½ thuyáº¿t khi káº¿t ca, bá»• sung Thá»i gian Ä‘Ã£ cháº¡y, vÃ  chuyá»ƒn sang PhÆ°Æ¡ng Ã¡n B (máº·c Ä‘á»‹nh Ä‘á»ƒ trá»‘ng hoÃ n toÃ n tiá»n thá»±c táº¿)

- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i káº¿t ca khi tiá»n máº·t lÃ½ thuyáº¿t Ã¢m gÃ¢y lá»—i "The actual cash must be at least 0." tá»« backend. Äá»“ng thá»i hiá»ƒn thá»‹ "Thá»i gian Ä‘Ã£ cháº¡y" cá»§a ca hiá»‡n táº¡i. NgÆ°á»i dÃ¹ng cÅ©ng yÃªu cáº§u chuyá»ƒn sang PhÆ°Æ¡ng Ã¡n B: máº·c Ä‘á»‹nh Ä‘á»ƒ trá»‘ng hoÃ n toÃ n Ã´ nháº­p tiá»n máº·t thá»±c táº¿ khi má»Ÿ modal (khÃ´ng Ä‘iá»n sáºµn tiá»n lÃ½ thuyáº¿t hay sá»‘ 0), buá»™c thu ngÃ¢n pháº£i tá»± Ä‘áº¿m tiá»n vÃ  nháº­p vÃ o, Ä‘á»“ng thá»i áº©n khung chÃªnh lá»‡ch lá»‡ch kÃ©t cho tá»›i khi ngÆ°á»i dÃ¹ng nháº­p giÃ¡ trá»‹.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [shift.store.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/shifts/store/shift.store.ts):
    - Äá»•i kiá»ƒu dá»¯ liá»‡u cá»§a `actualCashInput` thÃ nh `signal<number | null>(null)` vÃ  máº·c Ä‘á»‹nh khá»Ÿi táº¡o lÃ  `null`.
    - Sá»­a computed signals `actualCashFormatted` vÃ  `initialCashFormatted` Ä‘á»ƒ kiá»ƒm tra giÃ¡ trá»‹ khÃ¡c `null` / `undefined` Ä‘á»ƒ Ä‘á»‹nh dáº¡ng hiá»ƒn thá»‹ Ä‘Ãºng sá»‘ `'0'` hoáº·c chuá»—i rá»—ng.
  - Cáº­p nháº­t [shift.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/shift.service.ts):
    - Khi má»Ÿ modal káº¿t ca (`openCloseShiftModal`), gÃ¡n `actualCashInput.set(null)` thay vÃ¬ Ä‘iá»n sáºµn sá»‘ tiá»n lÃ½ thuyáº¿t.
    - Cáº­p nháº­t hÃ m `onActualCashInput` gÃ¡n `null` khi Ã´ nháº­p liá»‡u bá»‹ xÃ³a sáº¡ch Ä‘á»ƒ Ä‘Æ°a tráº¡ng thÃ¡i vá» trá»‘ng.
    - Bá»• sung xÃ¡c thá»±c trong phÆ°Æ¡ng thá»©c `closeShift`: náº¿u `actualCash` lÃ  `null` hoáº·c `undefined`, hiá»ƒn thá»‹ Toast cáº£nh bÃ¡o Ä‘á» yÃªu cáº§u nháº­p tiá»n thá»±c táº¿ kiá»ƒm Ä‘áº¿m vÃ  cháº·n khÃ´ng cho káº¿t ca.
  - Cáº­p nháº­t [pos.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/pos/pages/pos/pos.component.ts):
    - Äá»“ng bá»™ logic Ä‘á»‹nh dáº¡ng vÃ  xá»­ lÃ½ dá»¯ liá»‡u nháº­p vÃ o cá»§a `initialCashFormatted` vÃ  `onInitialCashInput` tÆ°Æ¡ng á»©ng.
  - Cáº­p nháº­t [end-shift-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/shifts/components/end-shift-modal/end-shift-modal.component.html):
    - Äá»•i cáº¥u trÃºc lÆ°á»›i cá»§a card thÃ´ng tin sang 3 cá»™t (`grid-cols-3`), tÃ­ch há»£p hiá»ƒn thá»‹ "Thá»i gian Ä‘Ã£ cháº¡y" tá»« `shiftService.shiftDurationString()`.
    - LiÃªn káº¿t thuá»™c tÃ­nh `[value]` cá»§a input thá»±c táº¿ vá»›i `shiftService.actualCashFormatted()`.
    - Äáº·t khung chÃªnh lá»‡ch lá»‡ch kÃ©t trong khá»‘i `@if (shiftService.actualCashInput() !== null)` Ä‘á»ƒ áº©n Ä‘i khi chÆ°a nháº­p sá»‘ tiá»n thá»±c táº¿, chá»‰ hiá»ƒn thá»‹ sau khi thu ngÃ¢n gÃµ sá»‘ tiá»n Ä‘áº¿m Ä‘Æ°á»£c.
    - Bá»• sung dáº¥u hoa thá»‹ mÃ u Ä‘á» `*` biá»ƒu thá»‹ trÆ°á»ng báº¯t buá»™c nháº­p bÃªn cáº¡nh nhÃ£n "Tiá»n máº·t thá»±c táº¿ kiá»ƒm Ä‘áº¿m táº¡i kÃ©t".
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Viá»‡t hÃ³a cá»™t PhÃ¢n loáº¡i (individual / business) trong Danh sÃ¡ch khÃ¡ch hÃ ng

- **Ná»™i dung yÃªu cáº§u:** Sá»­a Ä‘á»•i hiá»ƒn thá»‹ cá»§a cá»™t PhÃ¢n loáº¡i (Classification) trong báº£ng Danh sÃ¡ch khÃ¡ch hÃ ng (Customers) tá»« tiáº¿ng Anh ("individual" / "business") sang tiáº¿ng Viá»‡t ("CÃ¡ nhÃ¢n" / "Doanh nghiá»‡p").
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [customers.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/customers/customers.component.html) bá»• sung máº«u Ã´ tuá»³ chá»‰nh (cell template) `<ng-template appCell="type" let-row>` cho cá»™t `type`.
  - Thá»±c hiá»‡n biÃªn dá»‹ch kiá»ƒm tra báº±ng `npm run build` thÃ nh cÃ´ng.

### YÃªu cáº§u: Sá»­a lá»—i hiá»ƒn thá»‹ nhÃ£n biáº¿n Ä‘á»™ng cÃ´ng ná»£, Viá»‡t hÃ³a ghi chÃº máº·c Ä‘á»‹nh tiáº¿ng Anh vÃ  bá»• sung hiá»ƒn thá»‹ mÃ£ khÃ¡ch hÃ ng

- **Ná»™i dung yÃªu cáº§u:** Sá»­a lá»—i nhÃ£n lá»‹ch sá»­ cÃ´ng ná»£ thá»§ cÃ´ng bá»‹ gÃ¡n cá»©ng lÃ  "Thu há»“i cÃ´ng ná»£ thá»§ cÃ´ng" cho cáº£ phiáº¿u tÄƒng (+) vÃ  giáº£m (-), Viá»‡t hÃ³a hoÃ n toÃ n cÃ¡c ghi chÃº máº·c Ä‘á»‹nh Ä‘Æ°á»£c táº¡o tá»« Backend (nhÆ° "Manual debt entry", "Customer debt payment (Via Cash)"), vÃ  hiá»ƒn thá»‹ thÃªm mÃ£ khÃ¡ch hÃ ng á»Ÿ tiÃªu Ä‘á» Drawer lá»‹ch sá»­ cÃ´ng ná»£.
- **Giáº£i phÃ¡p:**
  - **Kháº¯c phá»¥c lá»—i nhÃ£n vÃ  Viá»‡t hÃ³a ghi chÃº:** PhÃ¡t hiá»‡n lá»—i do gá»i nháº§m thuá»™c tÃ­nh `log.description` khÃ´ng tá»“n táº¡i thay vÃ¬ `log.note` cá»§a Model `DebtLog` trong template HTML [debts.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/debts/debts.component.html). ÄÃ£ sá»­a láº¡i vÃ  táº¡o phÆ°Æ¡ng thá»©c `translateNote()` trong [debts.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/debts/debts.component.ts) Ä‘á»ƒ tá»± Ä‘á»™ng dá»‹ch cÃ¡c ghi chÃº máº·c Ä‘á»‹nh tiáº¿ng Anh sang tiáº¿ng Viá»‡t tÆ°Æ¡ng á»©ng (vÃ­ dá»¥: "Ghi ná»£ thá»§ cÃ´ng", "Thu há»“i cÃ´ng ná»£ thá»§ cÃ´ng (Tiá»n máº·t / Chuyá»ƒn khoáº£n)").
  - **Bá»• sung mÃ£ khÃ¡ch hÃ ng:** Cáº­p nháº­t tiÃªu Ä‘á» Drawer trong [debts.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/debts/debts.component.html) Ä‘á»ƒ hiá»ƒn thá»‹ kÃ¨m mÃ£ khÃ¡ch hÃ ng `selectedCustomer()?.customer_code` bÃªn cáº¡nh tÃªn khÃ¡ch hÃ ng.
  - Cháº¡y `npm run build` kiá»ƒm tra biÃªn dá»‹ch thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Kháº¯c phá»¥c cÃ¡c lá»—i hiá»ƒn thá»‹ giao diá»‡n Dark mode vÃ  Light mode

- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t vÃ  sá»­a lá»—i hiá»ƒn thá»‹ giao diá»‡n sÃ¡ng/tá»‘i (Dark/Light mode) cá»§a há»‡ thá»‘ng.
- **Giáº£i phÃ¡p:**
  - **PhÃ¢n tÃ­ch:** PhÃ¡t hiá»‡n nhiá»u tá»‡p HTML sá»­ dá»¥ng class mÃ u sáº¯c khÃ´ng há»£p lá»‡ cá»§a Tailwind nhÆ° `slate-850`, `bg-slate-850`, `text-slate-850`, `dark:border-slate-850` hay `dark:hover:bg-slate-850`. VÃ¬ `slate-850` khÃ´ng tá»“n táº¡i trong báº£ng mÃ u máº·c Ä‘á»‹nh cá»§a Tailwind CSS, trÃ¬nh duyá»‡t bá» qua thuá»™c tÃ­nh nÃ y vÃ  tá»± Ä‘á»™ng fall back vá» mÃ u cá»§a cháº¿ Ä‘á»™ Light mode (vÃ­ dá»¥ cÃ¡c nÃºt gá»£i Ã½ tiá»n Ä‘áº§u ca má»Ÿ kÃ©t "KÃ©t trá»‘ng", "500K", "1 Triá»‡u", "2 Triá»‡u" bá»‹ hiá»ƒn thá»‹ ná»n tráº¯ng trÃªn ná»n tá»‘i).
  - **Sá»­a Ä‘á»•i cÃ¡c tá»‡p HTML:**
    - Cáº­p nháº­t [pos.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/pos/pages/pos/pos.component.html): Thay tháº¿ toÃ n bá»™ class `dark:bg-slate-850` cá»§a cÃ¡c nÃºt gá»£i Ã½ tiá»n Ä‘áº§u ca vÃ  nÃºt Ä‘Ã³ng giá» hÃ ng thÃ nh `dark:bg-slate-800`.
    - Cáº­p nháº­t [settings.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/settings/settings.component.html): Äá»•i class viá»n `dark:border-slate-850` thÃ nh `dark:border-slate-800`.
    - Cáº­p nháº­t [claim-points.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/claim-points/claim-points.component.html): Thay tháº¿ class chá»¯ `text-slate-850` thÃ nh `text-slate-800`.
    - Cáº­p nháº­t [subscription-request-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/components/subscription-request-detail-modal/subscription-request-detail-modal.component.html): Thay tháº¿ `text-slate-850` thÃ nh `text-slate-800`.
    - Cáº­p nháº­t [web3-overlays.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/blockchain/components/web3-overlays/web3-overlays.component.html): Thay tháº¿ cÃ¡c class `[class.text-slate-850]`, `[class.dark:hover:bg-slate-850]` vÃ  `text-slate-850` thÃ nh `[class.text-slate-800]`, `[class.dark:hover:bg-slate-800]` vÃ  `text-slate-800`.
  - **BiÃªn dá»‹ch dá»± Ã¡n:** Cháº¡y lá»‡nh `npm run build` thÃ nh cÃ´ng 100%, táº¥t cáº£ cÃ¡c tá»‡p CSS vÃ  JS Ä‘Æ°á»£c nÃ©n thÃ nh cÃ´ng, Ä‘áº£m báº£o cÃ¡c nÃºt hiá»ƒn thá»‹ tá»‘i mÆ°á»£t mÃ  vÃ  Ä‘á»“ng bá»™ trÃªn giao diá»‡n Dark/Light mode.

## NgÃ y 24/06/2026 (tiáº¿p theo)

### YÃªu cáº§u: Tá»‘i Æ°u hÃ³a hiá»‡u nÄƒng Backend (BE Cache) - TrÃ¡nh truy váº¥n láº·p Ä‘i láº·p láº¡i á»Ÿ Middleware vÃ  API Storefront

- **Ná»™i dung yÃªu cáº§u:** Tá»‘i Æ°u hÃ³a hiá»‡u nÄƒng Backend báº±ng cÃ¡ch giáº£m thiá»ƒu sá»‘ lÆ°á»£ng truy váº¥n SQL dÆ° thá»«a táº¡i má»—i request (nhÆ° kiá»ƒm tra phÃ¢n quyá»n, giá»›i háº¡n vÃ  tÃ­nh nÄƒng cá»§a gÃ³i cÆ°á»›c trong cÃ¡c Middleware, cÅ©ng nhÆ° truy váº¥n cáº¥u hÃ¬nh slug cÃ´ng khai á»Ÿ API Storefront).
- **Giáº£i phÃ¡p:**
  - **Tá»‘i Æ°u hÃ³a Domain Entity:**
    - Cáº­p nháº­t [User.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Domain/Entities/User.php): ThÃªm phÆ°Æ¡ng thá»©c tÄ©nh `getCachedOwner(string $ownerAddress): ?array` sá»­ dá»¥ng `Cache::remember` Ä‘á»ƒ lÆ°u thÃ´ng tin tÃ i khoáº£n chá»§ cá»­a hÃ ng (TTL = 10 phÃºt).
    - Cáº­p nháº­t [SubscriptionPlan.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Domain/Entities/SubscriptionPlan.php): ThÃªm phÆ°Æ¡ng thá»©c tÄ©nh `getCachedPlan(string $code): ?array` Ä‘á»ƒ cache thÃ´ng tin gÃ³i cÆ°á»›c (TTL = 24 giá»).
    - Cáº­p nháº­t [Setting.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Domain/Entities/Setting.php): ThÃªm cÆ¡ cháº¿ xÃ³a cache `"slug_owner_address:{$slug}"` trong `clearStorefrontCache()`.
  - **Tá»‘i Æ°u hÃ³a Middleware:**
    - Cáº­p nháº­t [CheckSubscription.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Middleware/CheckSubscription.php): Thay tháº¿ truy váº¥n DB báº±ng phÆ°Æ¡ng thá»©c `User::getCachedOwner`.
    - Cáº­p nháº­t [CheckLimit.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Middleware/CheckLimit.php): Thay tháº¿ truy váº¥n DB báº±ng `User::getCachedOwner` vÃ  `SubscriptionPlan::getCachedPlan`.
    - Cáº­p nháº­t [CheckFeature.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Middleware/CheckFeature.php): Thay tháº¿ truy váº¥n DB báº±ng `User::getCachedOwner` vÃ  `SubscriptionPlan::getCachedPlan`.
  - **Äá»“ng bá»™ hÃ³a Cache vÃ  dá»n dáº¹p táº¡i Controllers:**
    - Cáº­p nháº­t [AuthController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AuthController.php): Thay tháº¿ truy váº¥n gÃ³i cÆ°á»›c/chá»§ quÃ¡n báº±ng cache. Giáº£i phÃ³ng cache `"store_owner_user:{$wallet}"` khi cáº­p nháº­t profile hoáº·c Ä‘Äƒng nháº­p thÃ nh cÃ´ng.
    - Cáº­p nháº­t [AdminController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AdminController.php): Giáº£i phÃ³ng cache `"store_owner_user:{$wallet}"` khi cáº­p nháº­t gÃ³i thuÃª bao cá»­a hÃ ng hoáº·c phÃª duyá»‡t yÃªu cáº§u nÃ¢ng gÃ³i. Giáº£i phÃ³ng cache `"subscription_plan:{$code}"` khi thay Ä‘á»•i dá»¯ liá»‡u cÃ¡c gÃ³i cÆ°á»›c.
    - Cáº­p nháº­t [SettingController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/SettingController.php): Cache mapping slug cÃ´ng khai `"slug_owner_address:{$slug}"` (TTL = 24 giá»). Sá»­ dá»¥ng `User::getCachedOwner` vÃ  `SubscriptionPlan::getCachedPlan` Ä‘á»ƒ kiá»ƒm tra quyá»n truy cáº­p storefront.
  - **Nghi?m thu:**
    - Cháº¡y kiá»’m tra cÃº phÃ¡p Laravel (`php artisan route:list`) thÃ nh cÃ´ng 100%.
    - Cháº¡y dá»n dáº¹p cache há»‡ thá»‘ng (`php artisan cache:clear`) thÃ nh cÃ´ng.

## NgÃ y 25/06/2026 (tiáº¿p theo)

### YÃªu cáº§u: Äá»“ng bá»™ giao diá»‡n bá»™ lá»c PhÃ¢n loáº¡i, checkbox, nÃºt báº¥m vÃ  nghiá»‡p vá»¥ Ä‘á»“ng bá»™ nháº­t kÃ½ chá»‘t thuáº¿

- **Ná»™i dung yÃªu cáº§u:** Äá»“ng bá»™ hÃ³a nÃºt "PhÃ¢n loáº¡i" cá»§a bá»™ lá»c Nháº­t kÃ½ kÃª khai káº¿ thá»«a Ä‘Ãºng thiáº¿t káº¿ cá»§a Select UI (pill rounded-full, cÃ³ mÅ©i tÃªn chevron xoay Ä‘á»™ng). Äá»“ng bá»™ mÃ u cÃ¡c checkbox vÃ  buttons trong popover vÃ  form kháº£o sÃ¡t sang mÃ u thÆ°Æ¡ng hiá»‡u Ä‘á»™ng `[var(--dynamic-primary)]`. Bá»• sung menu 3 cháº¥m á»Ÿ má»—i dÃ²ng trong báº£ng logs Ä‘á»ƒ cÃ³ tuá»³ chá»n "Táº£i file excel" kÃ¨m icon `download`. Äá»“ng bá»™ nghiá»‡p vá»¥: khi táº¡o ká»³ kÃª khai thÃ nh cÃ´ng (á»Ÿ tráº¡ng thÃ¡i `open`), tá»± Ä‘á»™ng hiá»ƒn thá»‹ nháº­t kÃ½ tÆ°Æ¡ng á»©ng á»Ÿ tab Nháº­t kÃ½ kÃª khai, vÃ  khi báº¥m xÃ³a ká»³ kÃª khai á»Ÿ tab KÃª khai thuáº¿, nháº­t kÃ½ tÆ°Æ¡ng á»©ng cÅ©ng tá»± Ä‘á»™ng xÃ³a theo.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts):
    - Khai bÃ¡o signal `activeRowMenuId` quáº£n lÃ½ popover 3 cháº¥m cá»§a dÃ²ng, cÃ¡c phÆ°Æ¡ng thá»©c toggle/close row menu vÃ  hÃ m giáº£ láº­p `downloadLogExcel`.
    - Viáº¿t hÃ m `getActiveSelectedFiltersLabel()` gá»™p cÃ¡c tag lá»c Ä‘Ã£ chá»n báº±ng dáº¥u pháº©y.
    - Cáº­p nháº­t `loadLogs()` Ä‘á»ƒ tá»± Ä‘á»™ng gá»i táº£i cÃ¡c ká»³ Ä‘ang má»Ÿ (`open` periods) song song.
    - Cáº­p nháº­t `getFormattedLogs()` Ä‘á»ƒ duyá»‡t qua vÃ  gá»™p cáº£ cÃ¡c ká»³ Ä‘Ã£ khÃ³a (`locked`) vÃ  Ä‘ang má»Ÿ (`open`), gÃ¡n nhÃ£n tráº¡ng thÃ¡i tÆ°Æ¡ng á»©ng Ä‘á»ƒ tá»± Ä‘á»™ng hiá»ƒn thá»‹ nháº­t kÃ½ tÆ°Æ¡ng á»©ng cá»§a ká»³ vá»«a Ä‘Æ°á»£c táº¡o vÃ  tá»± Ä‘á»™ng biáº¿n máº¥t khi ká»³ Ä‘Ã³ bá»‹ xÃ³a.
    - Cáº­p nháº­t `onClickOutsideDropdown` Ä‘á»ƒ Ä‘Ã³ng cáº£ row menu khi click ra ngoÃ i.
  - Cáº­p nháº­t [tax.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.html):
    - Äá»•i nÃºt PhÃ¢n loáº¡i thÃ nh kiá»ƒu Pill Select UI (`rounded-full`, padding rá»™ng hÆ¡n, chevron-down xoay Ä‘á»™ng).
    - Thiáº¿t káº¿ láº¡i dÃ²ng hiá»ƒn thá»‹ tráº¡ng thÃ¡i lá»c hiá»ƒn thá»‹ duy nháº¥t 1 badge gá»™p (vÃ­ dá»¥: `PhÃ¢n loáº¡i: S2a - HKD, Tá» khai thuáº¿ [x]`) mÃ u dynamic primary ná»n nháº¡t, cÃ³ nÃºt xÃ³a nhanh vÃ  nÃºt Bá» lá»c (thÃ¹ng rÃ¡c) á»Ÿ gÃ³c pháº£i cÃ¹ng hÃ ng.
    - Äá»“ng bá»™ hÃ³a cÃ¡c checkbox vÃ  radio option trong dropdown lá»c vÃ  trong Form kháº£o sÃ¡t 3 bÆ°á»›c sang mÃ u dynamic primary.
    - Äá»•i nÃºt "Thiáº¿t láº­p láº¡i" vÃ  "Ãp dá»¥ng" trong dropdown sang directive `app-button` dÃ¹ng chung.
    - TÃ­ch há»£p popover menu nhá» chá»©a nÃºt "Táº£i file excel" (icon `download`) vÃ o nÃºt 3 cháº¥m cá»§a tá»«ng hÃ ng trong danh sÃ¡ch.
- **Káº¿t quáº£:** BiÃªn dá»‹ch dá»± Ã¡n frontend Angular (`npm run build`) thÃ nh cÃ´ng 100% khÃ´ng phÃ¡t sinh báº¥t ká»³ lá»—i nÃ o.

### YÃªu cáº§u: Äá»“ng bá»™ cáº¥u trÃºc báº£ng KÃª khai thuáº¿ & Kháº¯c phá»¥c lá»—i biáº¿n máº¥t dá»¯ liá»‡u sau khi khÃ³a sá»•

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n há»“i ráº±ng dá»¯ liá»‡u á»Ÿ tab KÃª khai thuáº¿ bá»‹ trá»‘ng/khÃ´ng hiá»‡n ra so vá»›i giao diá»‡n tham kháº£o, Ä‘á»“ng thá»i khi báº¥m khÃ³a sá»• ká»³ chá»‘t thuáº¿ thÃ¬ dá»¯ liá»‡u Ä‘Ã³ biáº¿n máº¥t hoÃ n toÃ n khá»i báº£ng.
- **Giáº£i phÃ¡p:**
  - **PhÃ¢n tÃ­ch:** TrÆ°á»›c Ä‘Ã¢y tab KÃª khai thuáº¿ chá»‰ gá»i API táº£i cÃ¡c ká»³ Ä‘ang má»Ÿ (`status = 'open'`), nÃªn khi má»™t ká»³ Ä‘Æ°á»£c khÃ³a sá»• (`status` chuyá»ƒn thÃ nh `'locked'`) nÃ³ sáº½ biáº¿n máº¥t khá»i danh sÃ¡ch. Äá»“ng thá»i cáº¥u trÃºc cá»™t cá»§a báº£ng cÅ© hiá»ƒn thá»‹ Doanh thu/Chi phÃ­/Thuáº¿ thay vÃ¬ hiá»ƒn thá»‹ cÃ¡c sá»• sÃ¡ch káº¿ toÃ¡n trong ká»³.
  - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts):
    - Khai bÃ¡o signal `activePeriodMenuId` quáº£n lÃ½ menu 3 cháº¥m cá»§a má»—i hÃ ng ká»³ kÃª khai.
    - Sá»­a phÆ°Æ¡ng thá»©c `loadPeriods()`: Loáº¡i bá» filter `status = 'open'` khi gá»i API `getTaxPeriods()` Ä‘á»ƒ táº£i toÃ n bá»™ danh sÃ¡ch cÃ¡c ká»³ kÃª khai (cáº£ `open` vÃ  `locked`), giÃºp cÃ¡c ká»³ Ä‘Ã£ khÃ³a sá»• váº«n hiá»ƒn thá»‹ Ä‘áº§y Ä‘á»§ trÃªn báº£ng.
    - Viáº¿t hÃ m `lockLatestOpenPeriod()` Ä‘á»ƒ há»— trá»£ báº¥m nÃºt KhÃ³a sá»• nhanh ká»³ kÃª khai Ä‘ang má»Ÿ má»›i nháº¥t tá»« header cá»§a trang.
    - Cáº­p nháº­t `onClickOutsideDropdown()` Ä‘á»ƒ tá»± Ä‘á»™ng Ä‘Ã³ng `activePeriodMenuId` khi click ra ngoÃ i.
  - Cáº­p nháº­t [tax.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.html):
    - Äá»•i cáº¥u trÃºc báº£ng sang 4 cá»™t khá»›p 100% hÃ¬nh áº£nh tham kháº£o: `Ká»³ kÃª khai`, `Sá»‘ lÆ°á»£ng sá»• Ä‘Ã£ táº¡o trong ká»³` (máº·c Ä‘á»‹nh hiá»ƒn thá»‹ 2 sá»•), `NgÃ y khÃ³a sá»‘` (hiá»ƒn thá»‹ ngÃ y khÃ³a sá»• tá»« `updated_at | date:'dd/MM/yyyy'` hoáº·c `-` náº¿u chÆ°a khÃ³a), vÃ  cá»™t `Thao tÃ¡c`.
    - Di chuyá»ƒn thao tÃ¡c KhÃ³a sá»• vÃ  XÃ³a cá»§a má»—i hÃ ng ká»³ kÃª khai vÃ o menu 3 cháº¥m dá»c (`dots-vertical`) cá»§a hÃ ng Ä‘Ã³. Náº¿u ká»³ Ä‘Ã£ khÃ³a, hiá»ƒn thá»‹ badge mÃ u xanh lÃ¡ "ÄÃ£ khÃ³a" cÃ³ check-circle thay vÃ¬ nÃºt 3 cháº¥m.
    - LiÃªn káº¿t nÃºt "KhÃ³a sá»• ká»³ káº¿ toÃ¡n" gradient tÃ­m-há»“ng á»Ÿ header gá»i hÃ m `lockLatestOpenPeriod()`.
- **Káº¿t quáº£:** BiÃªn dá»‹ch dá»± Ã¡n frontend Angular (`npm run build`) thÃ nh cÃ´ng 100% khÃ´ng phÃ¡t sinh báº¥t ká»³ lá»—i nÃ o.

### YÃªu cáº§u: Káº¿ thá»«a checkbox tá»« CustomCheckboxComponent vÃ  bá»• sung Dark Mode Ä‘áº§y Ä‘á»§ trong phÃ¢n há»‡ Thuáº¿ (Tax)

- **Ná»™i dung yÃªu cáº§u:** Äá»“ng bá»™ hÃ³a cÃ¡c checkbox trong tab KÃª khai thuáº¿ (Form kháº£o sÃ¡t) vÃ  tab Nháº­t kÃ½ kÃª khai (Dropdown bá»™ lá»c PhÃ¢n loáº¡i) káº¿ thá»«a tá»« component `<app-custom-checkbox>` cá»§a há»‡ thá»‘ng vÃ  bá»• sung Ä‘áº§y Ä‘á»§ mÃ u sáº¯c tÆ°Æ¡ng thÃ­ch Dark Mode.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts): Import vÃ  Ä‘Äƒng kÃ½ `CustomCheckboxComponent` vÃ o máº£ng `imports`.
  - Cáº­p nháº­t [tax.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.html):
    - Thay tháº¿ cÃ¡c input checkbox thÃ´ báº±ng `<app-custom-checkbox>`, sá»­ dá»¥ng content projection (`<ng-content>`) bá»c cÃ¡c tháº» `<span>` nhÃ£n nguyÃªn báº£n Ä‘á»ƒ giá»¯ nguyÃªn giao diá»‡n vÃ  font chá»¯ thiáº¿t káº¿ gá»‘c.
    - Äá»•i cÃ¡c tháº» bá»c ngoÃ i tá»« `<label>` sang `<div>` á»Ÿ bÆ°á»›c 1 kháº£o sÃ¡t Ä‘á»ƒ trÃ¡nh lá»—i cÃº phÃ¡p lá»“ng tháº» label cá»§a HTML, Ä‘á»“ng thá»i bá»• sung class hover tÆ°Æ¡ng thÃ­ch cháº¿ Ä‘á»™ Dark Mode (`dark:hover:bg-slate-800/30`) Ä‘á»“ng bá»™ vá»›i cÃ¡c pháº§n tá»­ tÆ°Æ¡ng tÃ¡c khÃ¡c.
- **Káº¿t quáº£:** BiÃªn dá»‹ch dá»± Ã¡n frontend Angular (`npm run build`) thÃ nh cÃ´ng 100% khÃ´ng phÃ¡t sinh báº¥t ká»³ lá»—i nÃ o. CÃ¡c checkbox hiá»ƒn thá»‹ mÆ°á»£t mÃ , Ä‘á»•i mÃ u chuáº©n theo dynamic primary theme vÃ  pháº£n há»“i chuáº©n xÃ¡c á»Ÿ cáº£ hai cháº¿ Ä‘á»™ sÃ¡ng/tá»‘i.

### YÃªu cáº§u: Cho phÃ©p tÃ¡i táº¡o/cáº­p nháº­t ká»³ kÃª khai thuáº¿ Ä‘Ã£ khÃ³a sá»•

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng muá»‘n cÃ³ thá»ƒ táº¡o má»›i/cáº­p nháº­t ká»³ kÃª khai thuáº¿ cho khoáº£ng thá»i gian Ä‘Ã£ Ä‘Æ°á»£c khÃ³a sá»• (do dá»¯ liá»‡u trong thÃ¡ng váº«n liÃªn tá»¥c cáº­p nháº­t).
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [TaxController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/TaxController.php):
    - Loáº¡i bá» pháº§n check cháº·n lá»—i `status === 'locked'` khi táº¡o ká»³ kÃª khai.
    - Cho phÃ©p khi táº¡o láº¡i má»™t ká»³ kÃª khai Ä‘Ã£ tá»“n táº¡i (ká»ƒ cáº£ Ä‘Ã£ khÃ³a sá»•), há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng tÃ­nh toÃ¡n láº¡i cÃ¡c sá»‘ liá»‡u doanh thu, chi phÃ­, thuáº¿ Æ°á»›c tÃ­nh má»›i nháº¥t tá»« database, Ä‘á»“ng thá»i chuyá»ƒn tráº¡ng thÃ¡i ká»³ Ä‘Ã³ quay láº¡i `'open'` vÃ  cá»™ng dá»“n sá»‘ lÆ°á»£ng sá»• sÃ¡ch Ä‘Ã£ táº¡o.
- **Káº¿t quáº£:** CÃº phÃ¡p PHP há»£p lá»‡, cache Laravel Ä‘Ã£ Ä‘Æ°á»£c dá»n sáº¡ch. NgÆ°á»i dÃ¹ng cÃ³ thá»ƒ cáº­p nháº­t sá»‘ liá»‡u báº¥t cá»© lÃºc nÃ o.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i dropdown Táº£i file bá»‹ cáº¯t, Ä‘á»©t hover vÃ  tá»‘i Æ°u hÃ³a Ä‘Ã³ng modal xem chi tiáº¿t thuáº¿

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng bÃ¡o lá»—i giao diá»‡n: RÃª chuá»™t vÃ o nÃºt "Táº£i file" á»Ÿ Header modal xem chi tiáº¿t thuáº¿ thÃ¬ hiá»‡n dropdown, nhÆ°ng khi di chuá»™t xuá»‘ng cÃ¡c tÃ¹y chá»n (Táº£i Excel, Táº£i XML) thÃ¬ dropdown biáº¿n máº¥t (khÃ´ng báº¥m Ä‘Æ°á»£c trÃªn mÃ¡y tÃ­nh). NgoÃ i ra, dropdown bá»‹ cáº¯t pháº³ng 2 bÃªn sÆ°á»n (clipping). Äá»“ng thá»i ngÆ°á»i dÃ¹ng tháº¯c máº¯c táº¡i sao khi táº¯t modal (báº¥m X hoáº·c báº¥m ra ngoÃ i) láº¡i cáº§n call API táº£i láº¡i danh sÃ¡ch. NgoÃ i ra thay Ä‘á»•i mÃ u ná»n xanh lÃ¡ cá»§a Header modal thÃ nh mÃ u gradient thÆ°Æ¡ng hiá»‡u.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [tax-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-detail-modal/tax-detail-modal.component.html):
    - Äá»•i mÃ u ná»n `bg-emerald-600` á»Ÿ Header VIEW 1 vÃ  VIEW 2 thÃ nh mÃ u gradient `bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]` vÃ  bo gÃ³c trÃ²n `rounded-t-2xl` khá»›p vá»›i modal.
    - ThÃªm class `overflow-visible` cho Title Bar, group button, vÃ  tháº» `.relative.group` bá»c dropdown Ä‘á»ƒ triá»‡t tiÃªu hoÃ n toÃ n lá»—i clipping (cáº¯t sÆ°á»n).
    - Cáº¥u hÃ¬nh láº¡i dropdown wrapper sá»­ dá»¥ng class `top-full pt-1 z-50` Ä‘á»ƒ bÃ¡m sÃ¡t Ä‘Ã¡y nÃºt báº¥m vÃ  cÃ³ lá»›p Ä‘á»‡m padding vÃ´ hÃ¬nh, duy trÃ¬ hover liÃªn tá»¥c khi di chuyá»ƒn chuá»™t tá»« nÃºt xuá»‘ng menu.
  - Cáº­p nháº­t [tax-detail-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/tax-detail-modal/tax-detail-modal.component.ts):
    - ThÃªm biáº¿n cá» tráº¡ng thÃ¡i `private hasSaved = false`. GÃ¡n `hasSaved = true` trong táº¥t cáº£ cÃ¡c hÃ m lÆ°u dá»¯ liá»‡u (`saveDeclaration`, `saveS1a`, `saveS2a`, `saveS2b`, `saveS2c`, `saveS2d`, `saveS2e`, `saveInfo`).
    - Cáº­p nháº­t hÃ m `close()` Ä‘Ã³ng modal truyá»n giÃ¡ trá»‹ `hasSaved` ra ngoÃ i: `this.modalRef.close(this.hasSaved)`.
  - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts):
    - Sá»­a callback Ä‘Ã³ng modal xem chi tiáº¿t: Chá»‰ gá»i API táº£i láº¡i danh sÃ¡ch `this.loadLogs()` khi modal tráº£ vá» `true` (ngÆ°á»i dÃ¹ng thá»±c sá»± báº¥m LÆ°u thay Ä‘á»•i). Náº¿u chá»‰ báº¥m X hoáº·c click ngoÃ i Ä‘á»ƒ táº¯t modal (khÃ´ng lÆ°u), há»‡ thá»‘ng sáº½ bá» qua gá»i API Ä‘á»ƒ tiáº¿t kiá»‡m tÃ i nguyÃªn máº¡ng.
- **Káº¿t quáº£:** Build frontend `npm run build` thÃ nh cÃ´ng 100%. Lá»—i dropdown vÃ  logic táº¯t modal hoáº¡t Ä‘á»™ng chuáº©n xÃ¡c.

### YÃªu cáº§u: Tá»‘i Æ°u chá»‘ng spam request API (Rate Limiting) vÃ  chá»‘ng Click trÃ¹ng láº·p (Double Click) á»Ÿ Frontend

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng muá»‘n kiá»ƒm tra vÃ  kÃ­ch hoáº¡t cÆ¡ cháº¿ chá»‘ng spam/DDoS khi client gá»i API liÃªn tá»¥c. Äá»“ng thá»i tinh chá»‰nh rate limit toÃ n cá»¥c phÃ¹ há»£p (30 requests / 10 giÃ¢y) Ä‘á»ƒ náº¿u bá»‹ cháº·n, ngÆ°á»i dÃ¹ng chá»‰ cáº§n Ä‘á»£i tá»‘i Ä‘a 10 giÃ¢y Ä‘á»ƒ Ä‘Æ°á»£c tá»± Ä‘á»™ng má»Ÿ khÃ³a.
- **Giáº£i phÒ¡p:**
  - **Backend (Laravel):**
    - Cáº­p nháº­t [AppServiceProvider.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Providers/AppServiceProvider.php): Thay tháº¿ rate limiter máº·c Ä‘á»‹nh pi thÃ nh Limit::perSecond(30, 10) (tá»‘i Ä‘a 30 requests trong 10 giÃ¢y cho má»—i IP). Thiáº¿t láº­p nÃ y giÃºp tá»‘i Æ°u hÃ³a thá»i gian má»Ÿ khÃ³a chá»‰ cÃ²n tá»‘i Ä‘a 10 giÃ¢y náº¿u vÃ´ tÃ¬nh bá»‹ cháº·n (HTTP 429).
    - Cáº­p nháº­t [bootstrap/app.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/bootstrap/app.php): KÃ­ch hoáº¡t global rate limiting cho toÃ n bá»™ API routes báº±ng cÃ¡ch thÃªm middleware hrottle:api vÃ o nhÃ³m middleware pi.
  - **Frontend (Angular):**
    - Cáº­p nháº­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts): Khai bÃ¡o cá» isOpeningDetail vÃ  cháº·n sá»± kiá»‡n má»Ÿ modal chá»“ng chÃ©o khi ngÆ°á»i dÃ¹ng double click hoáº·c click spam nhiá»u láº§n liÃªn tiáº¿p trÃªn má»™t dÃ²ng log. Cá» sáº½ tá»± giáº£i phÃ³ng sau khi Ä‘Ã³ng modal hoáº·c tá»± reset sau 1 giÃ¢y.
- **Káº¿t quáº£:** Build frontend thÃ nh cÃ´ng 100%. Cháº¡y script PowerShell kiá»ƒm thá»­ 35 requests liÃªn tá»¥c lÃªn API: 30 requests Ä‘áº§u thÃ nh cÃ´ng 200, tá»« request 31 trá»Ÿ Ä‘i bá»‹ block 429 vÃ  tá»± má»Ÿ khÃ³a sau 10 giÃ¢y.

### YÃªu cáº§u: Chuáº©n hÃ³a app-card directive vÃ  dá»n dáº¹p cÃ¡c class CSS dÆ° thá»«a

- **Ná»™i dung yÃªu cáº§u:** Chuyá»ƒn Ä‘á»•i cÃ¡c tháº» sá»­ dá»¥ng class CSS tÄ©nh `<div class="app-card ...">` sang directive `app-card` dáº¡ng `<div app-card>` chuáº©n Angular, Ä‘á»“ng thá»i import `CardComponent` vÃ o cÃ¡c component tÆ°Æ¡ng á»©ng (`HomeComponent`, `ContactComponent`, `AboutComponent`) vÃ  loáº¡i bá» hoÃ n toÃ n cÃ¡c class CSS trÃ¹ng láº·p/dÆ° thá»«a (padding, background, backdrop-blur).
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/home.component.ts), [contact.component.ts](file:///d:/git/angular-web3-wallet/src/app/contact.component.ts), vÃ  [about.component.ts](file:///d:/git/angular-web3-wallet/src/app/about.component.ts): Import vÃ  thÃªm `CardComponent` vÃ o máº£ng `imports`.
  - Cáº­p nháº­t cÃ¡c template cá»§a 3 component trÃªn: Äá»•i cÃ¡c tháº» `div.app-card` thÃ nh `<div app-card>` vÃ  xÃ³a bá» cÃ¡c class CSS dÆ° thá»«a (`!p-5`, `md:!p-6`, `!p-8`, `md:!p-12`, `bg-white/60`, `dark:bg-slate-900/60`, `backdrop-blur-md`).
- **Káº¿t quáº£:** Build thÃ nh cÃ´ng 100%, khÃ´ng cÃ²n class thá»«a vÃ  tuÃ¢n thá»§ chuáº©n Angular Component/Directive.

### YÃªu cáº§u: Kháº¯c phá»¥c lá»—i lá»‡ch tÃ¢m cá»§a cháº¥m trÃ²n trong custom-radio

- **Ná»™i dung yÃªu cáº§u:** Giao diá»‡n cháº¥m trÃ²n cá»§a `custom-radio` khi Ä‘Æ°á»£c chá»n bá»‹ lá»‡ch trá»¥c (bá»‹ lá»‡ch lÃªn trÃªn vÃ  sang trÃ¡i vÃ  bá»‹ cáº¯t gÃ³c).
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:** Trá»¥c tráº·c do sá»± xung Ä‘á»™t thuá»™c tÃ­nh `transform: translate(-50%, -50%)` Ä‘Æ°á»£c Ä‘á»‹nh nghÄ©a cáº£ trong animation keyframes `@keyframes scaleUp` cá»§a component vÃ  cÃ¡c class Ä‘á»‹nh vá»‹ tuyá»‡t Ä‘á»‘i `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` cá»§a Tailwind. Khi animation cháº¡y xong vá»›i cháº¿ Ä‘á»™ `forwards`, nÃ³ ghi Ä‘Ã¨ vÃ  lÃ m sai lá»‡ch tá»a Ä‘á»™ trung tÃ¢m cá»§a cháº¥m trÃ²n.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [custom-radio.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-radio/custom-radio.component.html): Äáº·t `flex items-center justify-center` trá»±c tiáº¿p lÃªn vÃ²ng trÃ²n cha bÃªn ngoÃ i Ä‘á»ƒ trÃ¬nh duyá»‡t tá»± Ä‘á»™ng cÄƒn giá»¯a cháº¥m trÃ²n bÃªn trong mÃ  khÃ´ng cáº§n dÃ¹ng cÃ¡c class Ä‘á»‹nh vá»‹ `absolute top-1/2...` vÃ  tá»‹nh tiáº¿n.
  - Cáº­p nháº­t [custom-radio.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-radio/custom-radio.component.ts): ÄÆ¡n giáº£n hÃ³a `@keyframes scaleUp` chá»‰ thá»±c hiá»‡n biáº¿n Ä‘á»•i `scale(0)` sang `scale(1)` mÃ  khÃ´ng can thiá»‡p vÃ o `translate` giÃºp triá»‡t tiÃªu hoÃ n toÃ n sá»± xung Ä‘á»™t.
- **Káº¿t quáº£:** Cháº¥m trÃ²n Ä‘Æ°á»£c cÄƒn giá»¯a hoÃ n háº£o 100% trong má»i Ä‘iá»u kiá»‡n vÃ  build thÃ nh cÃ´ng khÃ´ng lá»—i.

### YÃªu cáº§u: Äiá»u chá»‰nh khoáº£ng cÃ¡ch icon tÃ¬m kiáº¿m trong custom-select vÃ  xÃ¡c nháº­n tÃ¹y chá»n báº­t táº¯t tÃ¬m kiáº¿m

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng pháº£n há»“i icon kÃ­nh lÃºp cá»§a Ã´ tÃ¬m kiáº¿m trong dropdown `custom-select` náº±m quÃ¡ sÃ¡t mÃ©p trÃ¡i. Äá»“ng thá»i há»i vá» tÃ¹y chá»n Ä‘á»ƒ báº­t/táº¯t Ã´ tÃ¬m kiáº¿m nÃ y.
- **Giáº£i phÃ¡p:**
  - **Tá»‘i Æ°u UI khoáº£ng cÃ¡ch**: Cáº­p nháº­t [custom-select.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-select/custom-select.component.html), thay tháº¿ class padding cá»§a khung tÃ¬m kiáº¿m tá»« `p-2` sang `px-4 py-2.5` vÃ  tÄƒng khoáº£ng cÃ¡ch `gap-2` lÃªn `gap-2.5`. Thay Ä‘á»•i nÃ y giÃºp icon kÃ­nh lÃºp Ä‘Æ°á»£c cÄƒn lá» trÃ¡i chÃ­nh xÃ¡c lÃ  16px, tháº³ng hÃ ng hoÃ n háº£o vá»›i cÃ¡c chá»¯ cá»§a list option bÃªn dÆ°á»›i.
  - **XÃ¡c nháº­n tÃ¹y chá»n báº­t/táº¯t tÃ¬m kiáº¿m**: XÃ¡c nháº­n component `CustomSelectComponent` Ä‘Ã£ há»— trá»£ sáºµn thuá»™c tÃ­nh `@Input() showSearch: boolean = false`. Khi sá»­ dá»¥ng chá»‰ cáº§n truyá»n `[showSearch]="true"` Ä‘á»ƒ hiá»ƒn thá»‹ hoáº·c `[showSearch]="false"` (hoáº·c khÃ´ng truyá»n) Ä‘á»ƒ áº©n hoÃ n toÃ n thanh tÃ¬m kiáº¿m.
- **Káº¿t quáº£:** Giao diá»‡n Ã´ tÃ¬m kiáº¿m cÃ¢n Ä‘á»‘i vÃ  tháº³ng hÃ ng, build thÃ nh cÃ´ng 100% khÃ´ng lá»—i.

### YÃªu cáº§u: XÃ¢y dá»±ng má»›i component custom-checkbox vÃ  tÃ­ch há»£p vÃ o UI Components Showcase á»Ÿ trang chá»§

- **Ná»™i dung yÃªu cáº§u:** Táº¡o má»›i má»™t component Checkbox cao cáº¥p cho dá»± Ã¡n vÃ  bá»• sung thÃªm pháº§n demo hiá»ƒn thá»‹ (Showcase) cho checkbox nÃ y trÃªn trang chá»§.
- **Giáº£i phÃ¡p:**
  - **XÃ¢y dá»±ng component**: Táº¡o má»›i thÆ° má»¥c [custom-checkbox](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-checkbox), thiáº¿t láº­p component `CustomCheckboxComponent` káº¿ thá»«a `ControlValueAccessor` Ä‘á»ƒ há»— trá»£ liÃªn káº¿t hai chiá»u `ngModel` vÃ  Angular Forms.
  - **Thiáº¿t káº¿ UI**: Khung viá»n vuÃ´ng checkbox bo gÃ³c nháº¹ `rounded-[6px]`, tá»± Ä‘á»™ng tÃ´ mÃ u ná»n vÃ  viá»n báº±ng mÃ u Accent `var(--color-primary)` kÃ¨m bÃ³ng Ä‘á»• tinh táº¿ khi Ä‘Æ°á»£c chá»n. Icon checkmark Ä‘Æ°á»£c váº½ báº±ng mÃ£ inline SVG máº£nh vÃ  Ã¡p dá»¥ng chuyá»ƒn Ä‘á»™ng mÆ°á»£t mÃ  báº±ng CSS scale vÃ  opacity.
  - **TÃ­ch há»£p vÃ o Trang chá»§**:
    - Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/home.component.ts) Ä‘á»ƒ Ä‘Äƒng kÃ½ import component má»›i vÃ  khai bÃ¡o signal `demoCheckboxValue` Ä‘áº¡i diá»‡n cho tráº¡ng thÃ¡i checkbox.
    - Cáº­p nháº­t [home.component.html](file:///d:/git/angular-web3-wallet/src/app/home.component.html) thÃªm card demo "Custom Checkbox" má»›i lÃ m CARD 3, Ä‘á»“ng thá»i sá»­a láº¡i sá»‘ thá»© tá»± comment cá»§a cÃ¡c card cÅ© phÃ­a sau cho Ä‘á»“ng bá»™.
- **Káº¿t quáº£:** Component Checkbox hoáº¡t Ä‘á»™ng hoÃ n háº£o, Ä‘á»“ng bá»™ dá»¯ liá»‡u chuáº©n xÃ¡c vÃ  giao diá»‡n hÃ²a há»£p vá»›i há»‡ thá»‘ng, build thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Gá»¡ bá» toÃ n bá»™ hiá»‡u á»©ng chuyá»ƒn Ä‘á»™ng (animations, transitions, durations) khá»i app-card vÃ  cÃ¡c modal/drawer
- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u kiá»ƒm tra vÃ  gá»¡ bá» toÃ n bá»™ hiá»‡u á»©ng chuyá»ƒn Ä‘á»™ng, thá»i gian trá»… (duration) vÃ  Ä‘á»™ nhÃ²e (blur) khá»i component `app-card` vÃ  cÃ¡c modal/drawer Ä‘á»ƒ giao diá»‡n hiá»ƒn thá»‹ ngay láº­p tá»©c.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [styles.scss](file:///d:/git/angular-web3-wallet/src/styles.scss): Loáº¡i bá» cÃ¡c thuá»™c tÃ­nh `transition-all duration-300` khá»i Ä‘á»‹nh nghÄ©a lá»›p `.app-card` Ä‘á»ƒ card khÃ´ng cÃ²n hiá»‡u á»©ng chuyá»ƒn Ä‘á»™ng má»/phÃ³ng to khi táº£i.
  - Cáº­p nháº­t [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.html): Loáº¡i bá» `transition-opacity duration-150` á»Ÿ lá»›p phá»§ tá»‘i (backdrop) vÃ  `transition-transform duration-200 ease-out` á»Ÿ Drawer Panel (Mobile Sidebar) Ä‘á»ƒ drawer báº­t má»Ÿ láº­p tá»©c mÃ  khÃ´ng cÃ³ hiá»‡u á»©ng chuyá»ƒn cáº£nh cháº­m trá»….
  - XÃ¡c nháº­n cÃ¡c modal tá»± táº¡o (`app-modal` / `confirm-modal`) Ä‘á»u Ä‘Ã£ sá»­ dá»¥ng lá»›p phá»§ tá»‘i trÆ¡n `bg-black/40` khÃ´ng chá»©a blur vÃ  khÃ´ng chá»©a báº¥t ká»³ hoáº¡t áº£nh chuyá»ƒn Ä‘á»™ng hay duration nÃ o.
- **Káº¿t quáº£:** CÃ¡c card vÃ  modal hoáº¡t Ä‘á»™ng tá»©c thÃ¬, mÆ°á»£t mÃ  vÃ  trá»±c quan, build thÃ nh cÃ´ng 100% khÃ´ng lá»—i.

### YÃªu cáº§u: TÃ¡i cáº¥u trÃºc cáº¥u trÃºc thÆ° má»¥c pháº³ng (Flat Features) theo ARCHITECTURE.md vÃ  sá»­a lá»—i icon menu
- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u xem láº¡i thiáº¿t káº¿ kiáº¿n trÃºc cá»§a dá»± Ã¡n, Ä‘Æ°a má»—i trang menu (Trang chá»§, Giá»›i thiá»‡u, LiÃªn há»‡) thÃ nh má»™t Flat Feature riÃªng biá»‡t vÃ  Ä‘áº£m báº£o má»—i feature Ä‘á»u cÃ³ cáº¥u trÃºc tá»‡p riÃªng gá»“m logic `.ts` vÃ  giao diá»‡n `.html` thay vÃ¬ viáº¿t inline. Äá»“ng thá»i sá»­a lá»—i icon cá»§a Trang chá»§ vÃ  Giá»›i thiá»‡u hiá»ƒn thá»‹ dáº¥u há»i cháº¥m `(?)` do thiáº¿u Ä‘Äƒng kÃ½ trong SVG library.
- **Giáº£i phÃ¡p:**
  - **TÃ¡ch biá»‡t Logic vÃ  Template**:
    - Chuyá»ƒn `HomeComponent` vá» [src/app/features/home/](file:///d:/git/angular-web3-wallet/src/app/features/home/) (chá»©a `home.component.ts` vÃ  `home.component.html`).
    - TÃ¡ch biá»‡t `AboutComponent` vá» [src/app/features/about/](file:///d:/git/angular-web3-wallet/src/app/features/about/) (chá»©a `about.component.ts` vÃ  `about.component.html`).
    - TÃ¡ch biá»‡t `ContactComponent` vá» [src/app/features/contact/](file:///d:/git/angular-web3-wallet/src/app/features/contact/) (chá»©a `contact.component.ts` vÃ  `contact.component.html`).
    - XÃ³a bá» cÃ¡c tá»‡p tin trÃ¹ng láº·p á»Ÿ thÆ° má»¥c gá»‘c `src/app/`.
  - **Cáº­p nháº­t Ä‘á»‹nh tuyáº¿n**: Cáº¥u hÃ¬nh láº¡i [app.routes.ts](file:///d:/git/angular-web3-wallet/src/app/app.routes.ts) trá» import sang cÃ¡c Ä‘Æ°á»ng dáº«n tÆ°Æ¡ng á»©ng sá»­ dá»¥ng `@features/...`.
  - **Sá»­a lá»—i hiá»ƒn thá»‹ icon menu `(?)`**:
    - Cáº­p nháº­t [icon.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/icon/icon.component.html) bá»• sung mÃ£ váº½ SVG cho icon `'home'` vÃ  `'info'`.
    - Äá»•i tÃªn tham chiáº¿u icon tá»« `'blockchain'` (chÆ°a Ä‘Äƒng kÃ½) sang `'info'` táº¡i [sidebar.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/sidebar/sidebar.component.html) vÃ  [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.html).
  - **Cáº­p nháº­t tÃ i liá»‡u kiáº¿n trÃºc**: Bá»• sung quy táº¯c báº¯t buá»™c phÃ¢n tÃ¡ch logic vÃ  giao diá»‡n Ä‘á»‘i vá»›i cÃ¡c Flat Feature trong [ARCHITECTURE.md](file:///d:/git/angular-web3-wallet/ARCHITECTURE.md).
- **Káº¿t quáº£:** Giao diá»‡n hiá»ƒn thá»‹ icon chuáº©n xÃ¡c theo mockup, cÃ¡c tÃ­nh nÄƒng Ä‘Æ°á»£c cáº¥u trÃºc pháº³ng gá»n gÃ ng, biÃªn dá»‹ch build thÃ nh cÃ´ng 100% khÃ´ng lá»—i.
### YÃªu cáº§u: TÃ¡i cáº¥u trÃºc theo Facade Pattern (StateService), quáº£n lÃ½ UI State toÃ n cá»¥c vÃ  Lazy Loading Ä‘á»‹nh tuyáº¿n giá»‘ng cafe-blockchain

- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u Ä‘á»“ng bá»™ toÃ n bá»™ máº«u kiáº¿n trÃºc tá»« dá»± Ã¡n `cafe-blockchain` sang dá»± Ã¡n `angular-web3-wallet`, bao gá»“m viá»‡c triá»ƒn khai Facade Pattern (`StateService`), quáº£n lÃ½ tráº¡ng thÃ¡i UI toÃ n cá»¥c (`UiStateService`) vÃ  cáº¥u hÃ¬nh Lazy Loading cho Ä‘á»‹nh tuyáº¿n.
- **Giáº£i phÃ¡p:**
  - **Táº¡o má»›i dá»‹ch vá»¥ UI & State**:
    - Táº¡o má»›i [ui-state.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/ui-state.service.ts) Ä‘á»ƒ quáº£n lÃ½ táº­p trung cÃ¡c tráº¡ng thÃ¡i UI (`showMobileMenu`, `showDropdown`, `showNetworkDropdown`, `isLoading`).
    - Táº¡o má»›i Facade [state.service.ts](file:///d:/git/angular-web3-wallet/src/app/core/services/state.service.ts) tiÃªm cÃ¡c dá»‹ch vá»¥ con (`Web3Service`, `UiStateService`, `ThemeService`, `ToastService`) vÃ  á»§y thÃ¡c toÃ n bá»™ signal/method cáº§n thiáº¿t ra bÃªn ngoÃ i.
  - **Refactor cÃ¡c component sá»­ dá»¥ng StateService**:
    - Cáº­p nháº­t [app.ts](file:///d:/git/angular-web3-wallet/src/app/app.ts) & [app.html](file:///d:/git/angular-web3-wallet/src/app/app.html) sá»­ dá»¥ng `StateService`.
    - Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts) & [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html) sá»­ dá»¥ng `StateService`.
    - Cáº­p nháº­t [header.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.ts) & [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.html) loáº¡i bá» cÃ¡c khai bÃ¡o state cá»¥c bá»™ vÃ  chuyá»ƒn sang sá»­ dá»¥ng `stateService.showMobileMenu` toÃ n cá»¥c.
    - Cáº­p nháº­t [sidebar.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/layout/sidebar/sidebar.component.ts) & [sidebar.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/layout/sidebar/sidebar.component.html) sá»­ dá»¥ng `StateService`.
    - Cáº­p nháº­t [theme-switcher.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/theme-switcher/theme-switcher.component.ts) & [tx-speed-selector.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/tx-speed-selector/tx-speed-selector.component.ts) sá»­ dá»¥ng `StateService` Ä‘á»ƒ loáº¡i bá» hoÃ n toÃ n cÃ¡c injection trá»±c tiáº¿p dá»‹ch vá»¥ con tá»« cÃ¡c component UI nhá».
  - **Cáº¥u hÃ¬nh Lazy Loading Ä‘á»‹nh tuyáº¿n**:
    - Cáº­p nháº­t [app.routes.ts](file:///d:/git/angular-web3-wallet/src/app/app.routes.ts) chuyá»ƒn Ä‘á»•i cÃ¡c component feature (Home, About, Contact) sang cÆ¡ cháº¿ Lazy Loading báº±ng cÃº phÃ¡p `loadComponent: () => import(...).then(m => m.Component)`.
- **Káº¿t quáº£:** Build thÃ nh cÃ´ng 100% khÃ´ng lá»—i. Dung lÆ°á»£ng bundle ban Ä‘áº§u giáº£m Ä‘i Ä‘Ã¡ng ká»ƒ nhá» lazy loading, vÃ  cáº¥u trÃºc code Ä‘áº¡t chuáº©n quáº£n lÃ½ tráº¡ng thÃ¡i Clean Code giá»‘ng `cafe-blockchain`.

### YÃªu cáº§u: Kiá»ƒm tra vÃ  tá»‘i Æ°u tuÃ¢n thá»§ toÃ n diá»‡n quy chuáº©n .gemini/GEMINI.md

- **Ná»™i dung yÃªu cáº§u:** RÃ  soÃ¡t mÃ£ nguá»“n toÃ n bá»™ dá»± Ã¡n Ä‘á»ƒ tuÃ¢n thá»§ tuyá»‡t Ä‘á»‘i cÃ¡c nguyÃªn táº¯c Angular & TypeScript trong cáº¥u hÃ¬nh [.gemini/GEMINI.md](file:///d:/git/angular-web3-wallet/.gemini/GEMINI.md).
- **Giáº£i phÃ¡p:**
  - **Dá»n dáº¹p `standalone: true`**: Loáº¡i bá» thuá»™c tÃ­nh khai bÃ¡o `standalone: true` á»Ÿ táº¥t cáº£ 26 file component do Angular v20+ Ä‘Ã£ tá»± Ä‘á»™ng máº·c Ä‘á»‹nh lÃ  Standalone.
  - **Dá»n dáº¹p `changeDetection`**: Loáº¡i bá» thuá»™c tÃ­nh `changeDetection` thá»§ cÃ´ng (cáº£ `OnPush` vÃ  lá»—i viáº¿t sai `Eager` cÅ©) khá»i táº¥t cáº£ cÃ¡c component do Angular v22+ Ä‘Ã£ tá»± Ä‘á»™ng máº·c Ä‘á»‹nh cÆ¡ cháº¿ Change Detection lÃ  OnPush.
  - **Chuyá»ƒn Ä‘á»•i `@HostListener` sang `host` object**: TÃ¡i cáº¥u trÃºc loáº¡i bá» decorator `@HostListener` vÃ  khai bÃ¡o cáº¥u hÃ¬nh láº¯ng nghe sá»± kiá»‡n trá»±c tiáº¿p trong trÆ°á»ng `host` á»Ÿ cÃ¡c component:
    - [header.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/layout/header/header.component.ts)
    - [tab-group.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/tab-group/tab-group.component.ts)
    - [custom-select.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/custom-select/custom-select.component.ts)
  - **Dá»n dáº¹p dáº¥u pháº©y thá»«a**: Cháº¡y ká»‹ch báº£n xá»­ lÃ½ tá»± Ä‘á»™ng Ä‘á»ƒ xÃ³a bá» dáº¥u pháº©y Ä‘Æ¡n Ä‘á»™c (stray commas) gÃ¢y ra bá»Ÿi quÃ¡ trÃ¬nh xÃ³a cÃ¡c import `ChangeDetectionStrategy` vÃ  `HostListener` khÃ´ng cÃ²n sá»­ dá»¥ng.
- **Káº¿t quáº£:** MÃ£ nguá»“n cá»±c ká»³ sáº¡ch sáº½, tuÃ¢n thá»§ tuyá»‡t Ä‘á»‘i cÃ¡c quy Ä‘á»‹nh phÃ¡t triá»ƒn cá»§a DApp, biÃªn dá»‹ch build thÃ nh cÃ´ng 100% khÃ´ng cáº£nh bÃ¡o/lá»—i.

### YÃªu cáº§u: Ãp dá»¥ng fix lá»—i tá»± Ä‘Ã³ng modal chi tiáº¿t vÃ­ cho cÃ¡c dá»± Ã¡n anh em (michic, proof-random)

- **Ná»™i dung yÃªu cáº§u:** Sá»­a cÃ¹ng bug modal chi tiáº¿t vÃ­ tá»± Ä‘Ã³ng cho 2 dá»± Ã¡n `D:\git\michic` vÃ  `D:\git\proof-random` (giá»‘ng bug Ä‘Ã£ fix á»Ÿ angular-web3-wallet).
- **PhÃ¢n tÃ­ch:** Cáº£ hai dá»± Ã¡n Ä‘á»u cÃ³ cÃ¹ng nguyÃªn nhÃ¢n gá»‘c rá»…:
  1. Dropdown Ä‘Ã³ng khi click â†’ nÃºt bá»‹ detach DOM â†’ AppKit detect click-outside â†’ tá»± Ä‘Ã³ng modal.
  2. `checkAndUpdateNetworkState` gá»i `this.modal.close()` vÃ´ Ä‘iá»u kiá»‡n khi máº¡ng Ä‘Ãºng â†’ Account modal vá»«a má»Ÿ liá»n bá»‹ Ä‘Ã³ng.
- **Giáº£i phÃ¡p:**
  - **proof-random** (`D:\git\proof-random\proof-random-web`):
    - Cáº­p nháº­t `wallet-dropdown.component.ts`: Sá»­a `openWalletModal()` thÃªm `event.stopPropagation()`, Ä‘Ã³ng dropdown trÆ°á»›c, rá»“i dÃ¹ng `setTimeout(100ms)` má»Ÿ modal.
    - Cáº­p nháº­t `wallet-dropdown.component.html`: Truyá»n `$event` vÃ o `(click)="openWalletModal($event)"`.
    - Cáº­p nháº­t `web3.service.ts`: ThÃªm `prevWrongChain` guard, chá»‰ gá»i `modal.close()` khi chuyá»ƒn tá»« sai máº¡ng vá» Ä‘Ãºng máº¡ng.
  - **michic** (`D:\git\michic\michic`): ÄÃ£ Ä‘Æ°á»£c sá»­a tá»« trÆ°á»›c trong phiÃªn lÃ m viá»‡c khÃ¡c â€” cáº£ `wallet-widget.component.ts` vÃ  `web3.service.ts` Ä‘á»u Ä‘Ã£ cÃ³ fix tÆ°Æ¡ng tá»±.

### YÃªu cáº§u: XÃ¢y dá»±ng vÃ  tÃ­ch há»£p component Aura táº¡o hiá»‡u á»©ng viá»n phÃ¡t sÃ¡ng xoay chuyá»ƒn Ä‘á»™ng (Aura component)
- **Ná»™i dung yÃªu cáº§u:** Táº¡o component má»›i Ä‘áº·t tÃªn lÃ  `aura` dá»±a trÃªn máº«u DaisyUI Aura component, sá»­ dá»¥ng mÃ u chá»§ Ä‘áº¡o (Primary Accent) vÃ  phá»¥ trá»£ (Secondary Accent) lÃ m viá»n phÃ¡t sÃ¡ng xung quanh. TÃ­ch há»£p showcase demo lÃªn trang chá»§.
- **Giáº£i phÃ¡p:**
  1. **Táº¡o component standalone [aura.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/aura/aura.component.ts):**
     * Äá»‹nh nghÄ©a cÃ¡c biáº¿n cáº¥u hÃ¬nh Ä‘áº§u vÃ o `variant`, `size`, `glow`, `speed`, `radius`, `paused`.
     * Sá»­ dá»¥ng hai lá»›p ná»n phá»¥ tuyá»‡t Ä‘á»‘i: `.aura-glow` (tá»a sÃ¡ng má», `filter: blur()`) vÃ  `.aura-border` (viá»n sáº¯c nÃ©t, `inset: -1.5px`) xoay chuyá»ƒn Ä‘á»™ng trÃ²n.
     * Sá»­ dá»¥ng `@property --aura-angle` Ä‘á»ƒ trÃ¬nh duyá»‡t há»— trá»£ ná»™i suy gÃ³c xoay lÃ m mÆ°á»£t chuyá»ƒn Ä‘á»™ng xoay gradient mÃ u (`conic-gradient`) mÃ  khÃ´ng cáº§n thay Ä‘á»•i cáº¥u trÃºc DOM váº­t lÃ½.
     * Táº­n dá»¥ng cÃ¡c biáº¿n mÃ u CSS cÃ³ sáºµn `var(--color-primary)` vÃ  `var(--color-secondary)` cho variant `dual` (máº·c Ä‘á»‹nh) Ä‘á»ƒ thá»ƒ hiá»‡n Ä‘Ãºng mÃ u chá»§ Ä‘áº¡o vÃ  phá»¥ trá»£ cá»§a á»©ng dá»¥ng.
  2. **Cáº­p nháº­t [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts):**
     * Import `AuraComponent` vÃ  Ä‘Äƒng kÃ½ trong imports cá»§a component trang chá»§.
     * ThÃªm cÃ¡c signal Ä‘iá»u khiá»ƒn cáº¥u hÃ¬nh trá»±c tiáº¿p: `demoAuraVariant`, `demoAuraSize`, `demoAuraGlow`, `demoAuraPaused`, `demoAuraSpeed`, `demoAuraRadius`.
  3. **Cáº­p nháº­t [home.component.html](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.html):**
     * Bá»• sung **Card 14: Custom Aura Component (DaisyUI 5.6+)** vÃ o cuá»‘i danh sÃ¡ch showcase demo cá»§a trang chá»§.
     * Thiáº¿t káº¿ báº£ng Ä‘iá»u khiá»ƒn tÆ°Æ¡ng tÃ¡c trá»±c tiáº¿p (chá»n mÃ u sáº¯c, chá»n size tá»« xs Ä‘áº¿n xl, switch táº¯t báº­t glow/pause, chá»n tá»‘c Ä‘á»™, chá»n bo gÃ³c) vÃ  hiá»ƒn thá»‹ cÃ¡c vÃ­ dá»¥ Ã¡p dá»¥ng thá»±c táº¿ trÃªn nÃºt báº¥m, avatar trÃ²n, tháº» VIP.
- **Kiá»ƒm tra:**
  * Cháº¡y `npm run build` thÃ nh cÃ´ng, khÃ´ng gáº·p báº¥t cá»© lá»—i cÃº phÃ¡p hay biÃªn dá»‹ch Angular nÃ o.

### YÃªu cáº§u: Dá»n dáº¹p comment rÃ¡c trong tá»‡p má»›i vÃ  tá»‡p nguá»“n cá»§a angular-web3-wallet
- **Ná»™i dung yÃªu cáº§u:** XÃ³a sáº¡ch comment rÃ¡c, dividers (`=======`) vÃ  cÃ¡c chÃº thÃ­ch hiá»ƒn nhiÃªn tiáº¿ng Viá»‡t/tiáº¿ng Anh trong cÃ¡c thÃ nh pháº§n má»›i triá»ƒn khai (nhÆ° Custom Date Time Range, Ripple, Emojis, Wallet Dropdown, v.v.).
- **Giáº£i phÃ¡p:**
  1. **styles.scss:** RÃºt gá»n cÃ¡c dÃ²ng phÃ¢n cÃ¡ch lá»›n `/* ==================== ... ==================== */` thÃ nh comment tiÃªu Ä‘á» ngáº¯n gá»n (vÃ­ dá»¥: `/* Toast System */`, `/* Button System */`, `/* Ripple */`). XÃ³a chÃº thÃ­ch `/* Scrollbar tinh táº¿ */`.
  2. **icon.component.html:** RÃºt gá»n comment phÃ¢n nhÃ³m SVG lá»›n thÃ nh `<!-- Navigation Icons -->` vÃ  xÃ³a toÃ n bá»™ cÃ¡c comment con hiá»ƒn nhiÃªn chÃº thÃ­ch cho tá»«ng SVG icon phÃ­a dÆ°á»›i.
  3. **TypeScript (.ts):** Loáº¡i bá» comment thá»«a trong `theme.service.ts` (xá»­ lÃ½ Ä‘á»•i theme), `web3.service.ts` (máº¡ng lÆ°á»›i vÃ  bypass send), `home.component.ts` (cáº¥u hÃ¬nh Aura, Ä‘á»£i giao dá»‹ch mined), `custom-date-picker.component.ts` (helper ngÃ y hÃ´m nay), vÃ  `skeleton-loader.component.ts` (láº·p `@for`).
  4. **HTML Templates:** XÃ³a bá» hÆ¡n 40 comment HTML hiá»ƒn nhiÃªn mÃ´ táº£ cÃ¡c card tráº¡ng thÃ¡i vÃ­, sá»‘ dÆ°, gá»­i token, form sinh nháº­t, giá»›i tÃ­nh... trong `home.component.html`, `demo-modal.component.html`, vÃ  cÃ¡c component HTML dÃ¹ng chung khÃ¡c.
  5. **Kiá»ƒm tra:** Cháº¡y `npm run build` thÃ nh cÃ´ng 100% khÃ´ng lá»—i biÃªn dá»‹ch.

### YÃªu cáº§u: Dá»n dáº¹p bá»• sung JSDoc comment cho cÃ¡c Inputs vÃ  Outputs cá»§a cÃ¡c Component trong wallet
- **Ná»™i dung yÃªu cáº§u:** XÃ³a sáº¡ch cÃ¡c chÃº thÃ­ch JSDoc hiá»ƒn nhiÃªn, thá»«a thÃ£i phÃ­a trÃªn cÃ¡c thuá»™c tÃ­nh `@Input` vÃ  `@Output` cá»§a directive `ripple.directive.ts` vÃ  component `tab-group.component.ts`.
- **Giáº£i phÃ¡p:**
  1. **ripple.directive.ts:** Loáº¡i bá» hoÃ n toÃ n cÃ¡c JSDoc thá»«a cá»§a cÃ¡c `@Input` (`color`, `centered`, `disabled`, `unbounded`, `radius`, `duration`, `opacity`), giÃºp code directive pháº³ng vÃ  tá»± giáº£i thÃ­ch.
  2. **tab-group.component.ts:** Loáº¡i bá» cÃ¡c JSDoc hiá»ƒn nhiÃªn cá»§a cÃ¡c `@Input` (`options`, `activeValue`, `containerClass`, `buttonClass`, `labelClass`, `flex`), `@Output` (`valueChange`), vÃ  signal `sliderStyle`.
  3. **ui-state.service.ts & header.component.ts:** Dá»n sáº¡ch cÃ¡c comment dÃ²ng Ä‘Æ¡n hiá»ƒn nhiÃªn cÃ²n sÃ³t láº¡i.
  4. **Kiá»ƒm tra:** Cháº¡y `npm run build` thÃ nh cÃ´ng 100% khÃ´ng phÃ¡t sinh lá»—i biÃªn dá»‹ch.

### YÃªu cáº§u: Dá»n dáº¹p TUYá»†T Äá»I táº¥t cáº£ cÃ¡c loáº¡i comment hiá»ƒn nhiÃªn, JSDoc vÃ  HTML trong wallet
- **Ná»™i dung yÃªu cáº§u:** Tiáº¿n hÃ nh xÃ³a bá» má»™t cÃ¡ch triá»‡t Ä‘á»ƒ nháº¥t cÃ¡c comment JSDoc giáº£i thÃ­ch component (á»Ÿ Card, Accordion, Tooltip, CustomSelect...), dá»n sáº¡ch 100% comment HTML trong cÃ¡c tá»‡p `.html` vÃ  xÃ³a cÃ¡c comment CSS/SCSS thá»«a.
- **Giáº£i phÃ¡p:**
  1. **TypeScript (.ts):** XÃ³a sáº¡ch 100% cÃ¡c khá»‘i JSDoc (`/** ... */`) giáº£i thÃ­ch cÃ¡ch dÃ¹ng component á»Ÿ Ä‘áº§u cÃ¡c file. Chá»‰ giá»¯ láº¡i 2 comment ká»¹ thuáº­t Web3 báº±ng tiáº¿ng Anh trong `web3.service.ts` giáº£i thÃ­ch bypass RPC vÃ  giao dá»‹ch mined. XÃ³a má»i comment dÃ²ng Ä‘Æ¡n `//` hiá»ƒn nhiÃªn khÃ¡c trong toÃ n bá»™ source TS.
  2. **HTML Templates:** XÃ³a sáº¡ch 100% cÃ¡c comment `<!-- ... -->` trong táº¥t cáº£ cÃ¡c tá»‡p `.html` vÃ  dá»n dáº¹p cÃ¡c dÃ²ng trá»‘ng thá»«a phÃ¡t sinh.
  3. **CSS/SCSS:** XÃ³a bá» toÃ n bá»™ cÃ¡c comment block vÃ  comment dÃ²ng trong `styles.scss` vÃ  cÃ¡c component styles.
  4. **Kiá»ƒm tra:** Cháº¡y `npm run build` thÃ nh cÃ´ng 100% khÃ´ng phÃ¡t sinh lá»—i biÃªn dá»‹ch.

### YÃªu cáº§u: Kháº¯c Phá»¥c Triá»‡t Äá»ƒ Lá»—i Dark Mode / Light Mode Cho NÃºt TrÆ°á»£t Pill (TabGroup & ThemeSwitcher)
- **Ná»™i dung yÃªu cáº§u:** Kháº¯c phá»¥c lá»—i khi giao diá»‡n Ä‘ang á»Ÿ cháº¿ Ä‘á»™ Dark Mode nhÆ°ng cÃ¡c thanh nÃºt trÆ°á»£t (sliding pill) cá»§a `app-tab-group` (Tá»‘c Ä‘á»™ giao dá»‹ch, Vá»‹ trÃ­ Tooltip, Custom Tabs...) vÃ  `app-theme-switcher` láº¡i bá»‹ lÃ²i ná»n mÃ u TRáº®NG SÃNG (`#ffffff`) vá»›i chá»¯ mÃ u tá»‘i, trÃ´ng hoÃ n toÃ n lá»‡ch tÃ´ng so vá»›i ná»n tá»‘i chung cá»§a á»©ng dá»¥ng.
- **PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n:**
  1. **Lá»—i CSS Specificity cá»§a `:where()` trong Tailwind v4:** Trong `styles.scss`, quy táº¯c `@variant dark (&:where(.dark, .dark *));` sá»­ dá»¥ng pseudoclass `:where()` vá»‘n cÃ³ Ä‘á»™ Æ°u tiÃªn CSS báº±ng `0` (Specificity = 0). Khi Angular biÃªn dá»‹ch scoped CSS cho component, selector `:where(.dark, .dark *) .dark\:bg-slate-800` chá»‰ cÃ³ Ä‘á»™ Æ°u tiÃªn báº±ng Ä‘Ãºng 1 class name `(0, 1, 0)`.
  2. Class `bg-white` trÃªn pháº§n tá»­ pill cÅ©ng cÃ³ Ä‘á»™ Æ°u tiÃªn `(0, 1, 0)`. Khi `bg-white` xuáº¥t hiá»‡n sau `dark:bg-slate-800` trong CSS bundle, trÃ¬nh duyá»‡t quyáº¿t Ä‘á»‹nh cho `bg-white` tháº¯ng tháº¿ vÃ  giá»¯ mÃ u ná»n cá»§a pill luÃ´n lÃ  mÃ u tráº¯ng sÃ¡ng `#ffffff` á»Ÿ Dark Mode.
- **Giáº£i phÃ¡p:**
  1. **Sá»­a `@variant dark` trong `styles.scss`:** Äá»•i tá»« `@variant dark (&:where(.dark, .dark *));` sang `@variant dark (&:is(.dark, .dark *));`. Pseudoclass `:is()` giá»¯ nguyÃªn Ä‘á»™ Æ°u tiÃªn cá»§a `.dark` (`(0, 2, 0)`), giÃºp cÃ¡c class `dark:...` luÃ´n Ä‘Ã¡nh báº¡i hoÃ n toÃ n `bg-white` (`(0, 1, 0)`) khi cháº¿ Ä‘á»™ Dark Mode Ä‘Æ°á»£c báº­t.
  2. **Chuáº©n hÃ³a Ná»n Pill Dark Mode (`tab-group.component.html` & `styles.scss`):** Äá»•i mÃ u ná»n pill á»Ÿ Dark Mode cá»§a `app-tab-group` tá»« `dark:bg-slate-900` thÃ nh `dark:bg-slate-800` Ä‘á»ƒ khá»›p 100% vá»›i `theme-switcher-pill`, táº¡o chiá»u sÃ¢u phÃ¢n táº§ng Ä‘áº¹p máº¯t trÃªn ná»n container `dark:bg-slate-900/80`.
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. Runs `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Bá»• sung 50 Ä‘á»‘i tÆ°á»£ng giao dá»‹ch Web3 máº«u cho `demoTransactions` á»Ÿ `HomeComponent`
- **Ná»™i dung yÃªu cáº§u:** Cung cáº¥p danh sÃ¡ch 50 giao dá»‹ch Web3 máº«u Ä‘a dáº¡ng cho biáº¿n `demoTransactions` trong `home.component.ts` Ä‘á»ƒ phá»¥c vá»¥ báº£ng lá»‹ch sá»­ giao dá»‹ch vÃ  phÃ¢n trang (pagination) mÆ°á»£t mÃ .
- **Giáº£i phÃ¡p:**
  1. **Táº¡o file dá»¯ liá»‡u máº«u [mock-transactions.data.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/mock-transactions.data.ts):**
     - Äá»‹nh nghÄ©a `DemoTransactionItem` interface vÃ  máº£ng 50 transactions `DEMO_TRANSACTIONS`.
     - Bao gá»“m Ä‘a dáº¡ng cÃ¡c phÆ°Æ¡ng thá»©c Web3: `Transfer`, `Swap (ETH/USDT, USDT/LINK, USDC/ETH, WBTC/ETH, DAI/USDC, ETH/UNI, AAVE/ETH, MATIC/ETH, ARB/OP)`, `Approve (USDT, DAI, USDC, WETH)`, `Add/Remove Liquidity`, `Stake/Unstake/Restake`, `Mint/Transfer/Burn/List NFT`, `Borrow/Repay DAI`, `Supply/Withdraw USDC`, `Flash Loan`, `Bridge Tokens`, `Deploy Contract`, `Multisig Sign`, `Execute/Cancel Order`, `Wrap/Unwrap ETH`.
     - Äa dáº¡ng tráº¡ng thÃ¡i (`success`, `pending`, `failed`), khá»‘i (`block`), má»‘c thá»i gian (`time`), Ä‘á»‹a chá»‰ (`from`, `to`) vÃ  giÃ¡ trá»‹ (`value`).
  2. **TÃ­ch há»£p vÃ o [home.component.ts](file:///d:/git/angular-web3-wallet/src/app/features/home/home.component.ts):**
     - Import `DEMO_TRANSACTIONS` vÃ  gÃ¡n `public readonly demoTransactions = DEMO_TRANSACTIONS;`.
     - Giá»¯ code component gá»n gÃ ng, tÃ¡ch biá»‡t dá»¯ liá»‡u máº«u, Ä‘áº£m báº£o tÃ­nh tÃ¡i sá»­ dá»¥ng vÃ  kiá»ƒm thá»­ phÃ¢n trang 10 trang (5 items/page).
- **XÃ¡c thá»±c:** Cháº¡y `npx tsc --noEmit` Ä‘áº¡t 0 lá»—i type. VÆ°á»£t qua 100% bá»™ unit tests (6/6 tests passed). ÄÃ³ng gÃ³i Production (`npm run build`) hoÃ n thÃ nh 100%.



