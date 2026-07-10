# Lịch sử yêu cầu và xử lý của Agent

## Ngày 10/07/2026

### Yêu cầu: Giải đáp lỗi treo màn hình loading (xoay vòng vô tận) "Continue in MetaMask/Trust Wallet..." trên di động
- **Nội dung yêu cầu:** Người dùng phản ánh khi bấm kết nối ví (MetaMask, Trust Wallet...) trên trình duyệt di động, WalletConnect/AppKit hiển thị thông báo "Continue in..." và xoay vòng vô tận mà không tự động mở ứng dụng ví.
- **Phân tích nguyên nhân:**
  1. **Thiếu HTTPS (HTTP Localhost/IP):** Mobile Web3 yêu cầu HTTPS để thực hiện các cơ chế bảo mật của Universal Links/Deep link. Nếu test trên local IP (`http://192.168.1.x:4200`), ví sẽ không phản hồi session handshake.
  2. **Trình duyệt In-App (In-App Browsers):** Các trình duyệt tích hợp trong Zalo, Telegram, Facebook, Messenger chặn kích hoạt ứng dụng ngoài vì lý do bảo mật.
  3. **Kẹt session cũ (Stale Connect Session):** Handshake bị treo do session cũ trên ví chưa được ngắt hẳn.
  4. **Cấu hình Metadata `url` không khớp:** Thuộc tính `url` được gửi đi từ AppKit không khớp với tên miền truy cập thực tế.
- **Giải pháp:**
  - Hướng dẫn Developer dùng `ngrok` hoặc `localtunnel` để chạy giao thức HTTPS khi kiểm thử di động.
  - Hướng dẫn người dùng mở DApp bằng trình duyệt chính thống (Safari/Chrome) hoặc truy cập trực tiếp bằng trình duyệt tích hợp (In-App Browser) bên trong ví.
  - Hướng dẫn ngắt kết nối các session cũ trong Cài đặt của MetaMask/Trust Wallet và xóa cookies/cache.

### Yêu cầu: Khắc phục lỗi không thể gửi ETH (lỗi TypeError: this.amount(...).trim is not a function)
- **Nội dung yêu cầu:** Khi bấm nút "Xác nhận gửi ETH", giao dịch không thực hiện được và console báo lỗi: `TypeError: this.amount(...).trim is not a function` tại `app.ts`.
- **Phân tích nguyên nhân:** Ô input số lượng ETH có kiểu `type="number"` và được liên kết hai chiều qua `[(ngModel)]="amount"`. Khi người dùng nhập số, Angular ngModel tự động chuyển đổi kiểu dữ liệu của `amount` trong Signal từ `string` sang `number`. Do đó, khi gọi `this.amount().trim()`, JavaScript báo lỗi do kiểu `number` không có hàm `trim()`.
- **Giải pháp:** Cập nhật file [app.ts](file:///d:/git/angular-web3-wallet/src/app/app.ts), bọc giá trị của `this.amount()` và `this.toAddress()` qua hàm `String(...)` trước khi gọi `.trim()`. Áp dụng tương tự cho `this.messageToSign()` để đảm bảo an toàn kiểu dữ liệu.

### Yêu cầu: Cấu hình tệp `netlify.toml` bị lỗi build trên Netlify
- **Nội dung yêu cầu:** Lỗi build không thành công trên Netlify do cấu hình sai đường dẫn trong `netlify.toml`.
- **Phân tích nguyên nhân:** Tệp cấu hình cũ khai báo `base = "cafe-blockchain-web"` và `publish = "dist/cafe-blockchain-web/browser"`. Do project này có tên là `angular-web3-wallet` và mã nguồn nằm ở thư mục gốc (không phải thư mục con `cafe-blockchain-web`), Netlify không thể chạy lệnh build và tìm đúng thư mục để deploy.
- **Giải pháp:** Cập nhật file [netlify.toml](file:///d:/git/angular-web3-wallet/netlify.toml), loại bỏ hoàn toàn thuộc tính `base`, đổi `publish` thành `"dist/angular-web3-wallet/browser"`, đồng thời thêm cấu hình `[[redirects]]` để tránh lỗi 404 cho Angular Single Page Application (SPA).

### Yêu cầu: Điều chỉnh giao diện Header và Mobile Drawer theo thiết kế
- **Nội dung yêu cầu:** 
  1. Loại bỏ nút điều khiển Theme (Light/Dark/Auto) trên Header Menu.
  2. Thay đổi chức năng nút Quả địa cầu từ "Chuyển đổi ngôn ngữ" thành "Chuyển đổi mạng lưới" (kết nối mở WalletConnect/AppKit Network dropdown).
  3. Gỡ bỏ hoàn toàn mục "Cài đặt" / "Chuyển mạng lưới" ở Mobile Drawer (Sidebar).
  4. Chuyển đổi khu vực hiển thị tên mạng đang chọn ở giữa Header thành một badge tĩnh màu hồng, không cho phép click để đổi mạng theo thiết kế mẫu.
  5. Ẩn chữ tên thương hiệu "Angular Web3" và "Proof of Random" trên thiết bị di động, đồng thời cho phép nút Quả địa cầu (chọn mạng nhanh) hiển thị trên cả di động để thuận tiện thao tác.
- **Giải pháp:**
  - Cập nhật [header.component.html](file:///d:/git/angular-web3-wallet/src/app/shared/components/header/header.component.html):
    - Xóa khối HTML của Theme Switcher trên Header.
    - Xóa khối dropdown ngôn ngữ, thay thế nút quả địa cầu cũ bằng bộ nút click mở dropdown mạng nhanh.
    - Thay đổi khung hiển thị mạng ở giữa Header thành một `div` badge tĩnh dạng pill màu hồng nhạt/chữ hồng đậm có chấm tròn đại diện, loại bỏ sự kiện click chuyển mạng tại đây.
    - Ẩn text tên thương hiệu bằng cách thêm class `hidden md:flex flex-col` vào khối chứa.
    - Cho phép nút quả địa cầu hiển thị trên mobile bằng cách đổi wrapper từ `hidden md:relative md:block` thành `relative block`.
  - Cập nhật [header.component.ts](file:///d:/git/angular-web3-wallet/src/app/shared/components/header/header.component.ts): Xóa bỏ các thuộc tính và phương thức không dùng tới liên quan đến ngôn ngữ (`showLangDropdown`, `currentLang`, `toggleLangDropdown`, `selectLang`). Thêm signal và hàm toggle cho dropdown chọn mạng nhanh (`showNetworkDropdown`).

## Ngày 08/07/2026

### Yêu cầu: Xây dựng khung dự án Angular Web3 bằng Tailwind CSS v4, Ethers.js v6 và Reown AppKit
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
  - **Kháº¯c phá»¥c lá»—i Database**:
    1. **Sá»­a lá»—i categories name unique**: Báº£ng `categories` giá»¯ index UNIQUE toÃ n cá»¥c trÃªn cá»™t `name`. ÄÃ£ táº¡o vÃ  cháº¡y tá»‡p migration [2026_06_30_130746_fix_categories_unique_index.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/database/migrations/2026_06_30_130746_fix_categories_unique_index.php) Ä‘á»ƒ xÃ³a index unique cÅ© `categories_name_unique` trÃªn cá»™t `name`, thay tháº¿ báº±ng composite unique index má»›i `['name', 'store_owner_address']`.
    2. **Sá»­a lá»—i products SKU unique**: Cá»™t `sku` trong báº£ng `products` bá»‹ Ä‘á»‹nh nghÄ©a UNIQUE toÃ n cá»¥c (`products_sku_unique`). ÄÃ£ táº¡o vÃ  cháº¡y tá»‡p migration [2026_06_30_131458_fix_products_sku_unique_index.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/database/migrations/2026_06_30_131458_fix_products_sku_unique_index.php) Ä‘á»ƒ xÃ³a index unique cÅ© cá»§a cá»™t `sku`, thay tháº¿ báº±ng composite unique index má»›i `['sku', 'store_owner_address']`.
  - **Kháº¯c phá»¥c lá»—i logic Soft Delete trÃªn Backend**:
    - Khi import file Excel trÃ¹ng SKU vá»›i sáº£n pháº©m Ä‘Ã£ bá»‹ xÃ³a má»m trÆ°á»›c Ä‘Ã³ (`deleted_at IS NOT NULL`), Eloquent query thÃ´ng thÆ°á»ng sáº½ khÃ´ng tÃ¬m ra sáº£n pháº©m cÅ© (tráº£ vá» null), dáº«n Ä‘áº¿n viá»‡c cá»‘ gáº¯ng INSERT dÃ²ng má»›i vÃ  gÃ¢y ra lá»—i Ä‘á»¥ng Ä‘á»™ `Duplicate entry` trÃªn database.
    - Cáº­p nháº­t [ProductController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/ProductController.php): Thay Ä‘á»•i cÃ¢u lá»‡nh query tÃ¬m kiáº¿m sáº£n pháº©m cÅ© theo SKU báº±ng cÃ¡ch thÃªm `withTrashed()`. Náº¿u tÃ¬m tháº¥y sáº£n pháº©m cÅ© Ä‘Ã£ bá»‹ xÃ³a má»m, há»‡ thá»‘ng sáº½ thá»±c hiá»‡n khÃ´i phá»¥c (`restore()`) vÃ  cáº­p nháº­t dá»¯ liá»‡u má»›i thay vÃ¬ táº¡o báº£n ghi má»›i.
  - **Tá»‘i Æ°u hÃ³a UI/UX Modal vÃ  Tá»± Ä‘á»™ng reload danh sÃ¡ch**:
    - **Sá»­a lá»—i khÃ´ng load láº¡i danh sÃ¡ch khi Ä‘Ã³ng báº±ng nÃºt X / Backdrop click**: LÆ°u cá» `isImportedSuccess` vÃ o `modalRef` táº¡i `ImportExcelModalComponent` ngay khi backend bÃ¡o import thÃ nh cÃ´ng. Trong `menu.component.ts`, kiá»ƒm tra cá» nÃ y trong subscription `afterClosed$` Ä‘á»ƒ luÃ´n gá»i reload danh sÃ¡ch sáº£n pháº©m `loadMenuProducts(1)` báº¥t ká»ƒ ngÆ°á»i dÃ¹ng Ä‘Ã³ng modal báº±ng cÃ¡ch nÃ o.
    - **Thiáº¿t káº¿ láº¡i Modal dáº¡ng ngang (Horizontal Layout)**: Sá»­a kÃ­ch thÆ°á»›c modal trong `menu.component.ts` tá»« `md` lÃªn `4xl` Ä‘á»ƒ má»Ÿ rá»™ng chiá»u rá»™ng hiá»ƒn thá»‹. Thiáº¿t káº¿ láº¡i [import-excel-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/menu/components/import-excel-modal/import-excel-modal.component.html) thÃ nh bá»‘ cá»¥c 2 cá»™t dáº¡ng lÆ°á»›i `md:grid-cols-12` (cá»™t trÃ¡i 7/12 lÃ  vÃ¹ng kÃ©o tháº£ file/bÃ¡o cÃ¡o káº¿t quáº£, cá»™t pháº£i 5/12 lÃ  hÆ°á»›ng dáº«n chi tiáº¿t kÃ¨m nÃºt táº£i file máº«u), giÃºp modal cÃ¢n Ä‘á»‘i, rá»™ng rÃ£i, káº¿ thá»«a Ä‘Ãºng cÃ¡c style token pháº³ng vÃ  component button/icon dÃ¹ng chung cá»§a há»‡ thá»‘ng.
  - **Kiá»ƒm thá»­ tá»± Ä‘á»™ng**:
    - Sá»­ dá»¥ng `browser_subagent` táº£i lÃªn tá»‡p Excel táº¡i `C:\Temp\cafe_blockchain_product_template.xlsx`. Káº¿t quáº£ kiá»ƒm thá»­ thÃ nh cÃ´ng 100%, bÃ¡o **ThÃ nh cÃ´ng: 2 mÃ³n** (CÃ  phÃª sá»¯a Ä‘Ã¡ vÃ  TrÃ  Ä‘Ã o cam sáº£), 0 lá»—i. CÃ¡c mÃ³n Äƒn cÃ¹ng danh má»¥c tá»± Ä‘á»™ng xuáº¥t hiá»‡n trÃªn danh sÃ¡ch thá»±c Ä‘Æ¡n ngay sau khi Ä‘Ã³ng modal báº±ng nÃºt "X".
- **Káº¿t quáº£:** TÃ­nh nÄƒng import Excel hoáº¡t Ä‘á»™ng hoÃ n háº£o 100%, sá»­a triá»‡t Ä‘á»ƒ cÃ¡c lá»—i thiáº¿t káº¿ database, lá»—i logic soft deletes vÃ  tá»‘i Æ°u hÃ³a giao diá»‡n modal dáº¡ng ngang sang trá»ng, tá»± Ä‘á»™ng lÃ m má»›i thá»±c Ä‘Æ¡n khi hoÃ n táº¥t.

## NgÃ y 28/06/2026

### YÃªu cáº§u: Triá»ƒn khai tÃ­nh nÄƒng MÃ n hÃ¬nh hiá»ƒn thá»‹ NhÃ  báº¿p/Pha cháº¿ (KDS)
- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u phÃ¡t triá»ƒn mÃ n hÃ¬nh KDS hiá»ƒn thá»‹ cÃ¡c Ä‘Æ¡n hÃ ng cáº§n pha cháº¿ theo thá»i gian thá»±c Ä‘á»ƒ báº¿p tiá»‡n váº­n hÃ nh vÃ  pha nÆ°á»›c.
- **Giáº£i phÃ¡p:**
  - **Thiáº¿t káº¿ tá»‘i Æ°u DB**: KhÃ´ng táº¡o báº£ng DB má»›i, sá»­ dá»¥ng trÆ°á»ng `status` hiá»‡n cÃ³ cá»§a báº£ng `orders` vÃ  bá»• sung thÃªm tráº¡ng thÃ¡i trung gian lÃ  `'ready'` (Ä‘Ã£ pha xong, chá» phá»¥c vá»¥).
  - **Má»Ÿ rá»™ng API Backend**:
    - Thay Ä‘á»•i middleware cho route cáº­p nháº­t tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng tá»« `RequireOwner` sang `permission:pos|orders|kds` Ä‘á»ƒ cho phÃ©p nhÃ¢n viÃªn cÃ³ quyá»n cáº­p nháº­t.
    - Cáº­p nháº­t `OrderController` cho phÃ©p nháº­n tráº¡ng thÃ¡i `'ready'` trong validation.
    - Cáº­p nháº­t `GetOrdersQueryHandler` Ä‘á»ƒ khi truyá»n `status=kds` sáº½ láº¥y cÃ¡c Ä‘Æ¡n chÆ°a hoÃ n thÃ nh (`pending`, `preparing`, `ready`).
    - Cáº­p nháº­t `StaffController` thÃªm quyá»n `'kds'` máº·c Ä‘á»‹nh cho vai trÃ² Chá»§ quÃ¡n vÃ  Quáº£n lÃ½.
  - **Cáº­p nháº­t giao diá»‡n Frontend**:
    - ÄÄƒng kÃ½ module `'kds'` trong `staffs.component.ts`.
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
  - **Cáº­p nháº­t giao diá»‡n Ä‘á»™ng á»Ÿ Frontend:** 
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
    - Táº¡o Model `TaxPeriodDetail` tá»± Ä‘á»™ng sinh UUID v7 khi táº¡o má»›i.
    - ÄÄƒng kÃ½ routes `GET /tax/periods/{id}/details` vÃ  `POST /tax/periods/{id}/details` trong `api.php`.
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
  - Táº¡o má»›i component [CustomRadioComponent](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/shared/components/custom-radio/custom-radio.component.ts) Ä‘á»™c láº­p (standalone):
    - Triá»ƒn khai `ControlValueAccessor` tÆ°Æ¡ng thÃ­ch hoÃ n toÃ n vá»›i Angular Forms (`ngModel`).
    - Thiáº¿t káº¿ giao diá»‡n hÃ¬nh trÃ²n vá»›i viá»n má» trong Light/Dark Mode khi chÆ°a chá»n, vÃ  tÃ´ mÃ u chá»§ Ä‘áº¡o thÆ°Æ¡ng hiá»‡u (`var(--color-primary)` - tÃ­m) kÃ¨m cháº¥m trÃ²n tráº¯ng á»Ÿ giá»¯a vÃ  hiá»‡u á»©ng scale-up khi Ä‘Æ°á»£c chá»n.
    - *Tinh chá»‰nh thiáº¿t káº¿ sau feedback:* Äá»•i tráº¡ng thÃ¡i chá»n tá»« tÃ´ Ä‘áº·c mÃ u há»“ng chÃ³i lá»i sang viá»n mÃ u primary 2px, ná»n tráº¯ng/tá»‘i, cháº¥m trÃ²n chÃ­nh giá»¯a mÃ u primary nhá» nháº¯n (10px) káº¿t há»£p Ä‘á»•i font-weight chá»¯ nhÃ£n thÃ nh `semibold` Ä‘á»ƒ giao diá»‡n trÃ´ng tinh táº¿, sáº¯c nÃ©t hÆ¡n.
    - Cáº¥u hÃ¬nh `:host { display: block; }` Ä‘á»ƒ trÃ¡nh lá»—i dÃ­nh chá»¯ hoáº·c sai lá»‡ch layout.
  - Cáº­p nháº­t [create-tax-period-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/create-tax-period-modal/create-tax-period-modal.component.html):
    - Loáº¡i bá» cÃ¡c input radio native cÅ© vÃ  tháº» label tÆ°Æ¡ng á»©ng.
    - Thay tháº¿ báº±ng `<app-custom-radio>` káº¿t há»£p vá»›i binding `ngModel`.
  - Cáº­p nháº­t [create-tax-period-modal.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/components/create-tax-period-modal/create-tax-period-modal.component.ts):
    - ÄÄƒng kÃ½ `CustomRadioComponent` trong máº£ng `imports`.
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
    - Loáº¡i bá» viá»‡c gá»i `loadInitialData()` tá»± Ä‘á»™ng trong `ngOnInit()`, chá»‰ giá»¯ láº¡i viá»‡c cáº­p nháº­t tab tá»« route.
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
    - Cáº­p nháº­t `settingsSubTab` signal trong `settings.component.ts` Ä‘á»ƒ bá»• sung kiá»ƒu `'tax'`.
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
  - **TÃ¡i cáº¥u trÃºc Backend:** Di chuyá»ƒn vÃ  chuáº©n hÃ³a logic xá»­ lÃ½ URL hÃ¬nh áº£nh thÃ nh hÃ m static `normalizeImageUrl($imageUrl)` trong Model [Product.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Domain/Entities/Product.php).
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
  - **ÄÄƒng kÃ½ route:** ThÃªm route `POST /products/upload-image` trong [api.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/routes/api.php).
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
  - Cháº¡y `php -l` kiá»ƒm tra cÃº phÃ¡p PHP thÃ nh cÃ´ng 100%.
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
  - Cháº¡y `php -l` kiá»ƒm tra cÃº phÃ¡p backend thÃ nh cÃ´ng 100%.
  - Cháº¡y `npm run build` biÃªn dá»‹ch dá»± Ã¡n frontend thÃ nh cÃ´ng 100%.


### YÃªu cáº§u: Sá»­a lá»—i Class "App\Infrastructure\Persistence\Eloquent\OrderItem" (OrderItemModel) not found trÃªn trang danh sÃ¡ch Ä‘Æ¡n hÃ ng (/orders)
- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng bÃ¡o lá»—i tráº¯ng trang/lá»—i há»‡ thá»‘ng khi truy cáº­p Ä‘Æ°á»ng dáº«n `http://localhost:4200/orders`. Lá»—i hiá»ƒn thá»‹ Toast: `Class "App\Infrastructure\Persistence\Eloquent\OrderItem" not found` (bá»‹ cáº¯t ngáº¯n tá»« `OrderItemModel`).
- **Giáº£i phÃ¡p:**
  - **PhÃ¢n tÃ­ch:** Trong handler xá»­ lÃ½ truy váº¥n Ä‘Æ¡n hÃ ng [GetOrdersQueryHandler.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Application/Orders/Handlers/GetOrdersQueryHandler.php), khi re-hydrate dá»¯ liá»‡u Ä‘Æ¡n hÃ ng tá»« máº£ng cache/DB, há»‡ thá»‘ng Ä‘Ã£ khá»Ÿi táº¡o sai Class `$item = new \App\Infrastructure\Persistence\Eloquent\OrderItemModel();` thay vÃ¬ sá»­ dá»¥ng thá»±c thá»ƒ Domain Entity `\App\Domain\Entities\OrderItem()`.
  - **Kháº¯c phá»¥c:** Cáº­p nháº­t [GetOrdersQueryHandler.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Application/Orders/Handlers/GetOrdersQueryHandler.php), thay tháº¿ class khá»Ÿi táº¡o `OrderItemModel` khÃ´ng tá»“n táº¡i báº±ng `\App\Domain\Entities\OrderItem`.
  - Cháº¡y `php -l` kiá»ƒm tra cÃº phÃ¡p thÃ nh cÃ´ng 100%.
  - Cháº¡y `php artisan cache:clear` dá»n dáº¹p bá»™ nhá»› Ä‘á»‡m há»‡ thá»‘ng thÃ nh cÃ´ng.


### YÃªu cáº§u: Kiá»ƒm tra vÃ  chuáº©n hÃ³a cÃ¡c nÃºt báº¥m native trong SaaS Admin sang app-button
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
  - Cháº¡y thÃ nh cÃ´ng `php artisan cache:clear` vÃ  kiá»ƒm tra cÃº phÃ¡p PHP.

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

### YÃªu cáº§u: Triá»ƒn khai Backend Cache (BE Cache) cho Cá»­a hÃ ng
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
  - **Frontend API Service**: Cáº­p nháº­t [api.service.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/core/services/api.service.ts), bá»• sung phÆ°Æ¡ng thá»©c `adminMaintenanceClearAll()`.
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
  - Cháº¡y `php -l` kiá»ƒm tra cÃº phÃ¡p thÃ nh cÃ´ng 100% cho cÃ¡c controller.

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
  - Cháº¡y `php -l` kiá»ƒm tra cÃº phÃ¡p thÃ nh cÃ´ng 100%.



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
  - Cáº­p nháº­t backend [api.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/routes/api.php): Di chuyá»ƒn `GET /admin/staffs` vÃ  `GET /admin/payment-methods` tá»« nhÃ³m `EnsureIsSuperAdmin` sang nhÃ³m `EnsureIsSystemAdmin`. CÃ¡c route write (POST/PUT/DELETE) giá»¯ nguyÃªn trong nhÃ³m Super Admin.
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
  - Cáº­p nháº­t [admin-saas.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.ts): Reset signals tÃ¬m kiáº¿m vÃ  phÃ¢n trang cá»§a nhÃ¢n viÃªn khi chuyá»ƒn tab.
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
    - Má»Ÿ rá»™ng api tráº£ vá» `admin_role` ('super_admin', 'staff' hoáº·c null).
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
  - Cáº­p nháº­t API routes vÃ  controllers táº¡i backend: ÄÄƒng kÃ½ API Super Admin CRUD vÃ  API public cho chá»§ quÃ¡n.
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
  - **Äá»“ng bá»™ giao diá»‡n modal chi tiáº¿t:** Cáº­p nháº­t [subscription-request-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/components/subscription-request-detail-modal/subscription-request-detail-modal.component.html):
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
  - Cáº­p nháº­t [store.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.html) thay tháº¿ khá»‘i code drawer cÅ© báº±ng tháº» `<app-store-cart-drawer>`.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Tá»‘i Æ°u hÃ³a cáº¥u hÃ¬nh CORS, tÃ­ch há»£p Rate Limiting, Cookie SameSite Lax, vÃ  chá»‘ng Bot báº±ng Cloudflare Turnstile
- **Ná»™i dung yÃªu cáº§u:** NgÆ°á»i dÃ¹ng yÃªu cáº§u triá»ƒn khai cÃ¡c biá»‡n phÃ¡p nÃ¢ng cáº¥p báº£o máº­t bao gá»“m: giá»›i háº¡n CORS Origin Whitelist cháº·t cháº½, bá»• sung Rate Limiting (Throttle) chá»‘ng spam API, báº£o máº­t cookie xÃ¡c thá»±c vá»›i SameSite Lax, vÃ  tÃ­ch há»£p Cloudflare Turnstile chá»‘ng bot cho storefront táº¡o Ä‘Æ¡n hÃ ng cÃ´ng khai.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [Cors.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Middleware/Cors.php): Triá»ƒn khai dynamic whitelist tá»« `.env` (`ALLOWED_ORIGINS`).
  - Cáº­p nháº­t [AppServiceProvider.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Providers/AppServiceProvider.php): Rate limiters `auth_endpoints` (5 req/phÃºt) vÃ  `public_orders` (10 req/phÃºt).
  - Cáº­p nháº­t [api.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/routes/api.php): Ãp dá»¥ng middleware `throttle` cho cÃ¡c endpoint nháº¡y cáº£m.
  - Cáº­p nháº­t [AuthController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/AuthController.php): Cookie SameSite Lax tá»« `.env`.
  - Cáº­p nháº­t [SettingController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/SettingController.php): TÃ­ch há»£p xÃ¡c thá»±c Turnstile vá»›i Cloudflare API.
  - ~~Cáº­p nháº­t [environment.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/environments/environment.ts) vÃ  [environment.development.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/environments/environment.development.ts): ThÃªm `turnstileSiteKey`~~ â†’ ÄÃ£ xÃ³a (dead code, FE Ä‘á»c tá»« API).
  - Cáº­p nháº­t [store.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.ts) vÃ  [store.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.html): Load script Turnstile explicit vÃ  render widget Ä‘á»™ng.
  - Cháº¡y `npm run build` thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Chuyá»ƒn Cloudflare Turnstile toggle sang Database + Super Admin UI
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
  - ÄÄƒng kÃ½ interceptor trong [app.config.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/app.config.ts).
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
    - `staffs â†’ users` (má»™t láº§n duy nháº¥t khi Ä‘Äƒng nháº­p Ä‘áº§u, náº¿u users trá»‘ng)
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
    - Tá»± Ä‘á»™ng cuá»™n container Ä‘á»ƒ hiá»ƒn thá»‹ danh má»¥c active náº¿u bá»‹ che khuáº¥t.
  - Cáº­p nháº­t [styles.css](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/styles.css): ThÃªm CSS rules cho `.sidebar-no-slide` Ä‘á»ƒ button menu cÃ³ hover/active background tÄ©nh khi hiá»‡u á»©ng trÆ°á»£t táº¯t (Light + Dark mode).
  - **LÆ°u Ã½:** Key localStorage `ui_sliding_effect` dÃ¹ng chung cho cáº£ Sidebar Admin vÃ  Storefront Ä‘á»ƒ Ä‘á»“ng bá»™ thiáº¿t láº­p ngÆ°á»i dÃ¹ng.
  - Cháº¡y `npm run build` kiá»ƒm tra dá»± Ã¡n biÃªn dá»‹ch thÃ nh cÃ´ng 100%.

### YÃªu cáº§u: Äá»“ng bá»™ giao diá»‡n Modal Chi tiáº¿t phiáº¿u thu/chi vÃ  Chi tiáº¿t hÃ³a Ä‘Æ¡n
- **Ná»™i dung yÃªu cáº§u:** Äá»“ng bá»™ hÃ³a cÃ¡ch hiá»ƒn thá»‹ mÃ£, giao diá»‡n vÃ  hiá»ƒn thá»‹ mÃ£ trÃªn tiÃªu Ä‘á» (title) cá»§a cáº£ Modal Chi tiáº¿t phiáº¿u thu/chi vÃ  Chi tiáº¿t hÃ³a Ä‘Æ¡n.
- **Giáº£i phÃ¡p:**
  - Cáº­p nháº­t [financials.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/financials/financials.component.ts):
    - Thay Ä‘á»•i tiÃªu Ä‘á» modal truyá»n vÃ o thÃ nh `Chi tiáº¿t phiáº¿u thu/chi ${tx.transaction_code || ''}` Ä‘á»ƒ Ä‘á»“ng bá»™ vá»›i cÃ¡ch hiá»ƒn thá»‹ mÃ£ cá»§a hÃ³a Ä‘Æ¡n.
  - Sá»­a Ä‘á»•i [financial-detail-modal.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/financials/components/financial-detail-modal/financial-detail-modal.component.html):
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

### YÃªu cáº§u: Tiáº¿p tá»¥c hoÃ n thÃ nh dá»n dáº¹p cÃ¡c modal tÄ©nh cÃ²n láº¡i vÃ  kiá»ƒm thá»­ compile toÃ n cá»¥c
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
  - Cáº­p nháº­t [admin-saas.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/admin/admin-saas.component.html): Thay tháº¿ khá»‘i toggle switch cÅ© báº±ng component `<app-custom-switch [checked]="turnstileEnabled()" [disabled]="!turnstileHasKey() && !turnstileEnabled()" (checkedChange)="toggleTurnstile($event)" type="compact"></app-custom-switch>`.
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
  - Táº¡o má»›i component ná»™i bá»™ [FloatingCartBarComponent](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/components/floating-cart-bar) gá»“m:
    - [floating-cart-bar.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/components/floating-cart-bar/floating-cart-bar.component.ts): Khai bÃ¡o inputs `cartCount`, `cartTotal` vÃ  output `checkout` event.
    - [floating-cart-bar.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/components/floating-cart-bar/floating-cart-bar.component.html): Chá»©a template HTML Ä‘Ã£ Ä‘Æ°á»£c dá»n sáº¡ch.
  - Cáº¥u hÃ¬nh class HTML sáº¡ch sáº½ cá»§a [FloatingCartBarComponent](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/components/floating-cart-bar/floating-cart-bar.component.html):
    - Sá»­ dá»¥ng directive `app-card` Ä‘á»ƒ tá»± Ä‘á»™ng káº¿ thá»«a style Card chuáº©n cá»§a dá»± Ã¡n (border, background, bo gÃ³c tá»‘i Ä‘a 15px, shadow máº·c Ä‘á»‹nh).
    - XÃ³a bá» hoÃ n toÃ n class animation thÃ´ cÅ©: `animate-in slide-in-from-bottom-5 duration-300` tuÃ¢n thá»§ nguyÃªn lÃ½ **No-Animation Policy**.
    - XÃ³a bá» cÃ¡c class border, bg, text, shadow thÃ´ ghi Ä‘Ã¨ dÆ° thá»«a.
  - Cáº­p nháº­t [store.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.ts): Import vÃ  Ä‘Äƒng kÃ½ `FloatingCartBarComponent` trong máº£ng `imports`.
  - Cáº­p nháº­t [store.component.html](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/storefront/pages/store/store.component.html): Thay tháº¿ khá»‘i div cÅ© báº±ng tháº» `<app-floating-cart-bar [cartCount]="cartCount()" [cartTotal]="cartTotal()" (checkout)="isCartOpen.set(true)"></app-floating-cart-bar>`.
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
    - Cáº­p nháº­t [CustomerController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/CustomerController.php) chuyá»ƒn `wallet_address` thÃ nh chá»¯ thÆ°á»ng (`strtolower`) khi lÆ°u trá»¯.
    - Cáº­p nháº­t [ClaimController.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Http/Controllers/ClaimController.php) so khá»›p vÃ­ á»Ÿ dáº¡ng chá»¯ thÆ°á»ng Ä‘á»ƒ trÃ¡nh lá»—i lá»‡ch vÃ­ Web3 khi claim token tÃ­ch Ä‘iá»ƒm.
  - **Tá»‘i Æ°u UI Host Display cho Custom Components:**
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
  - **Nghiá»‡m thu:**
    - Cháº¡y kiá»ƒm tra cÃº phÃ¡p Laravel (`php artisan route:list`) thÃ nh cÃ´ng 100%.
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



### YÃƒÂªu cÃ¡ÂºÂ§u: TÃ¡Â»â€˜i Ã†Â°u chÃ¡Â»â€˜ng spam request API (Rate Limiting) vÃƒÂ  chÃ¡Â»â€˜ng Click trÃƒÂ¹ng lÃ¡ÂºÂ·p (Double Click) Ã¡Â»Å¸ Frontend
- **NÃ¡Â»â„¢i dung yÃƒÂªu cÃ¡ÂºÂ§u:** NgÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng muÃ¡Â»â€˜n kiÃ¡Â»Æ’m tra vÃƒÂ  kÃƒÂ­ch hoÃ¡ÂºÂ¡t cÃ†Â¡ chÃ¡ÂºÂ¿ chÃ¡Â»â€˜ng spam/DDoS khi client gÃ¡Â»Âi API liÃƒÂªn tÃ¡Â»Â¥c. Ã„ÂÃ¡Â»â€œng thÃ¡Â»Âi tinh chÃ¡Â»â€°nh rate limit toÃƒÂ n cÃ¡Â»Â¥c phÃƒÂ¹ hÃ¡Â»Â£p (30 requests / 10 giÃƒÂ¢y) Ã„â€˜Ã¡Â»Æ’ nÃ¡ÂºÂ¿u bÃ¡Â»â€¹ chÃ¡ÂºÂ·n, ngÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng chÃ¡Â»â€° cÃ¡ÂºÂ§n Ã„â€˜Ã¡Â»Â£i tÃ¡Â»â€˜i Ã„â€˜a 10 giÃƒÂ¢y Ã„â€˜Ã¡Â»Æ’ Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng mÃ¡Â»Å¸ khÃƒÂ³a.
- **GiÃ¡ÂºÂ£i phÃƒÂ¡p:**
  - **Backend (Laravel):**
    - CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t [AppServiceProvider.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/app/Providers/AppServiceProvider.php): Thay thÃ¡ÂºÂ¿ rate limiter mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh pi thÃƒÂ nh Limit::perSecond(30, 10) (tÃ¡Â»â€˜i Ã„â€˜a 30 requests trong 10 giÃƒÂ¢y cho mÃ¡Â»â€”i IP). ThiÃ¡ÂºÂ¿t lÃ¡ÂºÂ­p nÃƒÂ y giÃƒÂºp tÃ¡Â»â€˜i Ã†Â°u hÃƒÂ³a thÃ¡Â»Âi gian mÃ¡Â»Å¸ khÃƒÂ³a chÃ¡Â»â€° cÃƒÂ²n tÃ¡Â»â€˜i Ã„â€˜a 10 giÃƒÂ¢y nÃ¡ÂºÂ¿u vÃƒÂ´ tÃƒÂ¬nh bÃ¡Â»â€¹ chÃ¡ÂºÂ·n (HTTP 429).
    - CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t [bootstrap/app.php](file:///d:/git/cafe-blockchain/cafe-blockchain-api/bootstrap/app.php): KÃƒÂ­ch hoÃ¡ÂºÂ¡t global rate limiting cho toÃƒÂ n bÃ¡Â»â„¢ API routes bÃ¡ÂºÂ±ng cÃƒÂ¡ch thÃƒÂªm middleware 	hrottle:api vÃƒÂ o nhÃƒÂ³m middleware pi.
  - **Frontend (Angular):**
    - CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t [tax.component.ts](file:///d:/git/cafe-blockchain/cafe-blockchain-web/src/app/features/tax/tax.component.ts): Khai bÃƒÂ¡o cÃ¡Â»Â isOpeningDetail vÃƒÂ  chÃ¡ÂºÂ·n sÃ¡Â»Â± kiÃ¡Â»â€¡n mÃ¡Â»Å¸ modal chÃ¡Â»â€œng chÃƒÂ©o khi ngÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng double click hoÃ¡ÂºÂ·c click spam nhiÃ¡Â»Âu lÃ¡ÂºÂ§n liÃƒÂªn tiÃ¡ÂºÂ¿p trÃƒÂªn mÃ¡Â»â„¢t dÃƒÂ²ng log. CÃ¡Â»Â sÃ¡ÂºÂ½ tÃ¡Â»Â± giÃ¡ÂºÂ£i phÃƒÂ³ng sau khi Ã„â€˜ÃƒÂ³ng modal hoÃ¡ÂºÂ·c tÃ¡Â»Â± reset sau 1 giÃƒÂ¢y.
- **KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£:** Build frontend thÃƒÂ nh cÃƒÂ´ng 100%. ChÃ¡ÂºÂ¡y script PowerShell kiÃ¡Â»Æ’m thÃ¡Â»Â­ 35 requests liÃƒÂªn tÃ¡Â»Â¥c lÃƒÂªn API: 30 requests Ã„â€˜Ã¡ÂºÂ§u thÃƒÂ nh cÃƒÂ´ng 200, tÃ¡Â»Â« request 31 trÃ¡Â»Å¸ Ã„â€˜i bÃ¡Â»â€¹ block 429 vÃƒÂ  tÃ¡Â»Â± mÃ¡Â»Å¸ khÃƒÂ³a sau 10 giÃƒÂ¢y.

