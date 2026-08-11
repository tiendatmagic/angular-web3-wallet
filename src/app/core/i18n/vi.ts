import { TranslationDictionary } from './i18n.types';

export const VI_TRANSLATIONS: TranslationDictionary = {
  nav: {
    home: 'Trang chủ',
    about: 'Giới thiệu',
    contact: 'Liên hệ',
    tagline: 'Web3 Template'
  },
  header: {
    open_menu: 'Mở menu',
    select_network: 'Chọn nhanh mạng lưới',
    popular_networks: '-- Chọn nhanh mạng phổ biến nhất --',
    wrong_network: 'Sai mạng lưới',
    connecting: 'Đang kết nối...',
    connect_wallet: 'Kết nối ví',
    connected_wallet: 'Ví đang kết nối',
    copy_address: 'Sao chép địa chỉ ví',
    wallet_details: 'Chi tiết ví',
    view_explorer: 'Xem trên Explorer',
    disconnect: 'Ngắt kết nối ví',
    copied_address_toast: 'Đã sao chép địa chỉ ví vào bộ nhớ tạm!'
  },
  language: {
    select_language: 'Chọn ngôn ngữ',
    vietnamese: 'Tiếng Việt',
    english: 'English',
    change_success: 'Đã chuyển đổi sang Tiếng Việt!'
  },
  theme: {
    label: 'Giao diện',
    light: 'Sáng',
    dark: 'Tối',
    auto: 'Tự động'
  },
  tx_speed: {
    label: 'Tốc độ giao dịch',
    default: 'Mặc định',
    fast: 'Nhanh',
    custom: 'Tùy chọn',
    fee_multiplier: 'Hệ số nhân:'
  },
  date_picker_ui: {
    select_date: 'Chọn ngày...',
    select_range: 'Chọn khoảng thời gian...',
    apply: 'Áp dụng',
    cancel: 'Hủy bỏ',
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    last_7_days: '7 ngày qua',
    last_30_days: '30 ngày qua',
    this_month: 'Tháng này',
    days_count: '{days} ngày',
    months_count: '{months} tháng',
    years_count: '{years} năm'
  },
  date: {
    mon_short: 'T2',
    tue_short: 'T3',
    wed_short: 'T4',
    thu_short: 'T5',
    fri_short: 'T6',
    sat_short: 'T7',
    sun_short: 'CN',
    select: 'Chọn ngày',
    select_range: 'Chọn khoảng thời gian...',
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    last_7_days: '7 ngày qua',
    last_30_days: '30 ngày qua',
    this_month: 'Tháng này',
    days_7: '7 ngày',
    month_1: '1 tháng',
    months_3: '3 tháng',
    months_6: '6 tháng',
    year_1: '1 năm',
    time_config: 'CẤU HÌNH THỜI GIAN',
    start_time: 'Thời gian bắt đầu',
    end_time: 'Thời gian kết thúc',
    hour: 'Giờ'
  },
  action: {
    cancel: 'Hủy bỏ',
    apply: 'Áp dụng',
    done: 'Xong'
  },

  file_upload_ui: {
    select_files: 'Chọn tệp',
    select_avatar: 'Tải lên ảnh đại diện',
    select_from_device: 'Chọn file từ thiết bị',
    drag_drop_files: 'Kéo thả tệp tin vào đây hoặc nhấp để chọn',
    drag_drop_avatar: 'Kéo thả ảnh vào đây để thay đổi đại diện',
    max_size: 'Dung lượng tệp tối đa:',
    selected_files: 'Tệp đã chọn ({count})',
    clear_all: 'Xóa tất cả',
    waiting: 'Chờ tải',
    completed: 'Hoàn tất',
    error: 'Lỗi',
    preview: 'Xem ảnh',
    retry: 'Thử lại',
    remove: 'Xóa tệp',
    close_modal: 'Đóng cửa sổ'
  },
  table_ui: {
    empty_title: 'Không có dữ liệu hiển thị',
    empty_desc: 'Vui lòng kiểm tra lại bộ lọc hoặc điều kiện tìm kiếm.'
  },
  pagination_ui: {
    showing: 'Hiển thị',
    of: 'trên tổng số',
    records: 'bản ghi'
  },
  wallet: {
    dashboard_title: 'Bảng Điều Khiển Ví Web3',
    account_address: 'Địa chỉ tài khoản',
    balance: 'Số dư khả dụng',
    network: 'Mạng lưới hiện tại',
    chain_id: 'Chain ID',
    status: 'Trạng thái kết nối',
    connected: 'Đã kết nối',
    not_connected: 'Chưa kết nối',
    connect_prompt_title: 'Kết Nối Ví Web3 Của Bạn',
    connect_prompt_desc: 'Kết nối ví MetaMask, WalletConnect hoặc ví Web3 để trải nghiệm đầy đủ các tính năng dApp cao cấp.',
    switch_network_btn: 'Đổi mạng lưới',
    open_account_btn: 'Quản lý tài khoản'
  },
  home: {
    hero_badge: 'Bộ Nguyên Mẫu Angular 19 + Web3',
    hero_title: 'Nền Tảng DApp Hiện Đại Cho Angular Web3 Wallet',
    hero_desc: 'Thư viện component UI/UX cao cấp tích hợp Ethers.js v6, WalletConnect, thiết kế Glassmorphism và màu sắc thương hiệu linh hoạt.',
    explore_btn: 'Khám Phá Showcase',
    connect_now_btn: 'Kết Nối Ví Ngay',
    showcase_title: 'Bộ Thư viện Component & Giao Diện Cao Cấp',
    showcase_subtitle: 'Tổng hợp các thành phần UI/UX được thiết kế chuẩn mực theo design.md, hỗ trợ Dark Mode và tương tác mượt mà.'
  },
  cards: {
    buttons: {
      title: 'Hệ Thống Nút Bấm (Button System)',
      subtitle: 'Đa dạng biến thể (variant), kích thước, hiệu ứng hover/active và trạng thái loading.',
      primary: 'Nút Chính (Primary)',
      secondary: 'Nút Phụ (Secondary)',
      cancel: 'Nút Hủy (Cancel)',
      danger: 'Nút Cảnh Báo (Danger)',
      loading: 'Đang Tải...',
      icon_button: 'Nút Kèm Icon'
    },
    badges: {
      title: 'Hệ Thống Badge & Tooltip',
      subtitle: 'Nhãn trạng thái màu sắc nổi bật kèm chú thích tương tác mượt mà.',
      active: 'Hoạt Động',
      pending: 'Đang Chờ',
      error: 'Thất Bại',
      info: 'Thông Tin',
      hover_tooltip: 'Rê chuột xem Tooltip'
    },
    inputs: {
      title: 'Các Ô Nhập Liệu Chuẩn (Form Inputs)',
      subtitle: 'Input văn bản, ô tìm kiếm và nhóm nhập liệu bọc form-field.',
      label_address: 'ĐỊA CHỈ VÍ NHẬN',
      label_amount: 'SỐ LƯỢNG TOKEN',
      label_search: 'TÌM KIẾM DỮ LIỆU',
      placeholder_address: 'Nhập địa chỉ ví 0x...',
      placeholder_amount: '0.00',
      placeholder_search: 'Nhập từ khóa tìm kiếm...'
    },
    selects: {
      title: 'Bộ Chọn Tùy Biến (Custom Select & Multi-Select)',
      subtitle: 'Hỗ trợ chọn đơn lẻ, chọn nhiều tùy chọn với giao diện Checkbox và danh sách 10 mạng lưới.',
      label_single: 'CHỌN ĐƠN LẺ (5 MẠNG LƯỚI)',
      label_ten: 'CHỌN ĐƠN LẺ (10 MẠNG LƯỚI)',
      label_multi: 'CHỌN NHIỀU (MULTI-SELECT)'
    },
    controls: {
      title: 'Công Tắc, Checkbox & Radio Button',
      subtitle: 'Các điều khiển tùy chọn tương tác trực quan.',
      switch_dark: 'Chế độ Tối',
      switch_notif: 'Thông báo Push',
      checkbox_agree: 'Tôi đồng ý với điều khoản sử dụng',
      radio_fast: 'Nhanh (Fast)',
      radio_normal: 'Chuẩn (Normal)',
      radio_slow: 'Tiết kiệm (Slow)'
    },
    slider: {
      title: 'Thanh Trượt Giá Trị (Custom Slider)',
      subtitle: 'Kéo trượt khoảng giá trị với mốc định vị trực quan.',
      label: 'GIAO DỊCH SLIPPAGE (%)'
    },
    modal_demo: {
      title: 'Hệ Thống Hộp Thoại Modal Động',
      subtitle: 'Mở modal động qua ModalService không bị đè DOM.',
      open_btn: 'Mở Modal Demo Form'
    },
    date_picker: {
      title: 'Bộ Chọn Ngày & Khoảng Thời Gian',
      subtitle: 'Custom Date Picker & Custom Date Time Range Picker cao cấp bám sát viewport.',
      single_date: 'CHỌN NGÀY SINH',
      range_date: 'CHỌN KHOẢNG THỜI GIAN',
      range_time: 'KHOẢNG THỜI GIAN KÈM GIỜ & PHÚT'
    },
    ripple: {
      title: 'Hiệu Ứng Sóng Nước (Ripple Directive)',
      subtitle: 'Lan tỏa hiệu ứng sóng nước mượt mà khi nhấp chuột.',
      interactive_box: 'Nhấp chuột vào đây để thử hiệu ứng Ripple'
    },
    accordion: {
      title: 'Khung Thu Gọn Nội Dung (Accordion Component)',
      subtitle: 'Đóng/mở thông tin linh hoạt với chuyển động mượt.',
      item1_title: '1. Ví Web3 hỗ trợ những mạng lưới nào?',
      item1_content: 'Hệ thống hỗ trợ Ethereum, Arbitrum, BNB Chain, Polygon PoS, Optimism, Base, Avalanche C-Chain và các mạng EVM phổ biến.',
      item2_title: '2. Làm thế nào để thay đổi chủ đề giao diện?',
      item2_content: 'Bạn có thể chuyển đổi giữa chế độ Sáng, Tối và Tự động ở góc dưới Sidebar hoặc trong cài đặt Header.'
    },
    table: {
      title: 'Bảng Dữ Liệu Tùy Biến (Custom Table & Sorting)',
      subtitle: 'Hiển thị bảng dữ liệu Web3 cao cấp với bộ lọc, sắp xếp cột và phân trang.',
      search_placeholder: 'Tìm theo Tx Hash...',
      filter_all: 'Tất cả trạng thái',
      col_tx: 'TX HASH',
      col_method: 'PHƯƠNG THỨC',
      col_block: 'BLOCK',
      col_value: 'GIÁ TRỊ',
      col_status: 'TRẠNG THÁI'
    },
    code_block: {
      title: 'Khung Hiển Thị Mã Nguồn (Code Block Component)',
      subtitle: 'Tô màu cú pháp Syntax Highlighting cho TypeScript, HTML, CSS, JSON và Bash.',
      copy_btn: 'Sao Chép Code'
    },
    file_upload: {
      title: 'Tải Lên Tệp Tin (File Upload Drag & Drop)',
      subtitle: 'Kéo thả tệp tin, xem trước hình ảnh và giả lập tiến trình tải lên sinh động.',
      drag_drop_text: 'Kéo thả tệp tin vào đây hoặc nhấp để chọn',
      support_text: 'Hỗ trợ tệp PNG, JPG, PDF, ZIP tối đa 10MB',
      card_title: 'Card 16: Component File Upload Cao Cấp (app-file-upload)',
      demo1_title: '1. Giao diện Thanh ngang (Horizontal Bar - Theo mẫu ví dụ)',
      demo1_field_title: 'Chọn file sao lưu SQL',
      demo1_field_desc: 'Nhấn để chọn file .sql từ thiết bị của bạn',
      select_btn: 'Chọn file',
      demo2_title: '2. Chọn nhiều tệp đính kèm (Multi-file Attachments)',
      demo2_field_title: 'Tải lên tài liệu đính kèm',
      demo2_field_desc: 'Nhấn hoặc kéo thả các tệp PDF, ZIP, Docx từ thiết bị',
      browse_btn: 'Duyệt tệp',
      demo3_title: '3. Vùng Kéo thả hình ảnh (Vertical Dropzone)',
      demo3_field_title: 'Kéo thả hình ảnh vào đây',
      demo3_field_desc: 'Hỗ trợ tải lên nhiều hình ảnh cùng lúc',
      select_image: 'Chọn ảnh',
      demo4_title: '4. Upload Ảnh Đại Diện',
      avatar_title: 'Ảnh đại diện',
      avatar_desc: 'PNG, JPG tối đa 3MB'
    },
    input_otp: {
      title: 'Nhập Mã Xác Thực OTP (Input OTP Component)',
      subtitle: 'Gõ phím di chuyển mượt mà, phân nhóm ô slot, mask mode và caret nhấp nháy.',
      label_6digit: 'XÁC THỰC OTP 6 SỐ (3 - 3)',
      label_pin: 'MÃ PIN BẢO MẬT (MASK MODE 4 Ô)',
      invalid_title: '4. Trạng Thái Lỗi (Invalid) & Vô Hiệu Hóa (Disabled)',
      invalid_desc: 'Cảnh báo sai mã hoặc đang chờ xử lý',
      incorrect_code: 'Mã OTP không chính xác',
      disabled_label: 'Đã vô hiệu hóa',
      card_title: 'Card 18: Component Input OTP Cao Cấp (app-input-otp)',
      demo1_title: '1. Mã Xác Thực OTP (6 số - Phân nhóm 3-3)',
      demo1_desc: 'Xác thực giao dịch Web3 / Đăng nhập 2FA',
      input_val: 'Giá trị nhập',
      empty_val: '(trống)',
      resend_code: 'Gửi lại mã',
      demo2_title: '2. Mã PIN An Toàn (Mask Mode - 4 số)',
      demo2_desc: 'Ẩn ký tự bằng ký tự bảo mật',
      hide_pin: 'Ẩn mã PIN',
      show_pin: 'Hiện mã PIN',
      demo3_title: '3. Mã Voucher / Giới Thiệu (Chữ & Số)',
      demo3_desc: 'Chấp nhận cả chữ cái và chữ số (A-Z, 0-9)',
      paste_support: 'Hỗ trợ Ctrl+V (Paste)'
    },
    dropdown: {
      title: 'Dropdown Menu & Voice Chat Morphing Card',
      subtitle: 'Biến hình FLIP Morphing Card 268px -> 360px mượt mà với hiệu ứng vạch sóng âm thanh.',
      card_title: 'Card 19: Component Dropdown Menu Cao Cấp (app-dropdown-menu)',
      card_desc: 'Menu điều hướng thả xuống đa dạng: User Profile, Submenu cấp 2, Checkbox/Radio options, Trigger linh hoạt & hiệu ứng Glassmorphism.',
      demo1_title: '1. Menu Tài Khoản & Profile (Header + User Info)',
      demo1_desc: 'Tích hợp Avatar, Email, Status Badge và Đăng xuất',
      demo2_title: '2. Checkbox & Radio Items (Cấu Hình Giao Diện)',
      demo2_desc: 'Bật/tắt tùy chỉnh & lựa chọn chế độ duy nhất',
      demo3_title: '3. Submenu Nhánh Cấp 2 (Nested Menu)',
      demo3_desc: 'Menu nhô mượt sang phải khi hover hoặc click',
      demo4_title: '4. Nút Trigger Icon & Vị Trí Placement',
      demo4_desc: 'Trigger kiểu icon-only hoặc căn lề bottom-right',
      customize_ui: 'Tùy chỉnh giao diện',
      web3_actions: 'Thao tác Web3 Ví',
      ghost_btn: 'Nút Ghost'
    },
    voice_chat: {
      title: 'Dropdown Menu & Voice Chat Morphing Card',
      subtitle: 'Biến hình FLIP Morphing Card 268px -> 360px mượt mà với hiệu ứng vạch sóng âm thanh.',
      voice_title: 'Phòng Thoại Web3 Developers',
      members_count: '4 Thành viên đang nói',
      join_btn: 'Tham Gia Ngay',
      leave_btn: 'Rời Phòng'
    },
    progress: {
      title: 'Thanh Tiến Trình (Progress Bar & Gauge Components)',
      subtitle: 'Linear bar, Multi-segment storage, Animated stripe, SVG Circular & Semi-Gauge.',
      storage_label: 'DUNG LƯỢNG LƯU TRỮ DAPP',
      gauge_label: 'TIẾN TRÌNH KHỐI BLOCKCHAIN',
      card_title: 'Card 20: Component Progress Tiến Trình Cao Cấp (app-progress)',
      card_desc: 'Thanh tiến trình đa dạng biến thể: Linear Bar, Steps, Multi-Segment, Striped Animated, Indeterminate, Circular Ring & Semi-Circle Gauge.',
      demo1_title: '1. Các Kích Thước (xs, sm, md, lg, xl)',
      demo1_desc: 'Độ cao linh hoạt phù hợp mọi ngữ cảnh UI',
      demo2_title: '2. Màu Sắc & Gradient Thương Hiệu',
      demo2_desc: 'Hệ màu status: Success, Warning, Danger, Info & Gradient',
      demo3_title: '3. Striped, Animated & Indeterminate Mode',
      demo3_desc: 'Hiệu ứng sọc cuộn & sóng chạy không định lượng',
      demo4_title: '4. Phân Đoạn Steps & Multi-Segment Storage',
      demo4_desc: 'Đồng hồ quy trình 4 bước & phân bổ lưu trữ ví',
      demo5_title: '5. Điều Chỉnh Tiến Trình Real-Time',
      demo5_desc: 'Kéo slider để thay đổi % trực tiếp',
      demo6_title: '6. Circular Ring & Semi-Circle Gauge',
      demo6_desc: 'Vòng tròn 360° & Bán nguyệt 180° SVG',
      striped_animated: 'Striped Animated (Đang tải tệp lên IPFS...)',
      indeterminate: 'Indeterminate (Đang đồng bộ khối Blockchain...)',
      step_workflow: 'Quy trình xác nhận 4 bước (Step 3/4)',
      storage_allocation: 'Phân bổ dung lượng lưu trữ ví DApp',
      empty_label: 'Trống',
      loading_state: 'Trạng thái tải dữ liệu Web3',
      adjust_value: 'Điều chỉnh giá trị tiến trình',
      circle_label: 'Vòng Tròn',
      semicircle_label: 'Bán Nguyệt'
    },
    lang_showcase: {
      title: 'Dropdown Đa Ngôn Ngữ (Multi-Language i18n Dropdown)',
      subtitle: 'Hệ thống i18n sử dụng Angular Signals, tách file ngôn ngữ vi.ts / en.ts riêng biệt, lưu trữ key chuẩn hóa và phản hồi tức thì.',
      active_lang: 'Ngôn ngữ hiện tại:',
      select_placeholder: 'Chọn ngôn ngữ hệ thống'
    },
    avatar: {
      title: 'Avatar & Avatar Group Component',
      subtitle: 'Ảnh đại diện cá nhân, status indicator (online/offline), fallback initials & mảng đè lớp (Avatar Stack).',
      single_label: 'Single Avatars & Status Dots',
      group_label: 'Avatar Group Stack (+N counter)'
    },
    empty_state: {
      title: 'Empty State Component',
      subtitle: 'Khối dữ liệu rỗng với SVG vector minh họa mượt, tiêu đề, mô tả và nút hành động nhanh.',
      sample_title: 'Chưa có giao dịch nào',
      sample_desc: 'Địa chỉ ví của bạn chưa thực hiện bất kỳ giao dịch nạp/rút token nào trên chuỗi khối.',
      action_btn: 'Nạp Token Ngay',
      secondary_btn: 'Làm mới'
    },
    alert: {
      title: 'Alert & Callout Component',
      subtitle: 'Banner thông báo dính trang (Info, Success, Warning, Error) với các style Soft, Bordered & Accent.',
      info_title: 'Cập nhật mạng lưới',
      info_msg: 'BSC Testnet RPC đã được chuyển đổi sang Sentio Node để tối ưu tốc độ phản hồi.',
      success_title: 'Giao dịch thành công',
      success_msg: 'Đã Mint thành công 1,000 DAPP Token vào ví của bạn.',
      warning_title: 'Cảnh báo biến động Gas',
      warning_msg: 'Tốc độ mạng Ethereum Mainnet đang cao hơn 45 Gwei.',
      error_title: 'Sai mạng lưới ví',
      error_msg: 'Vui lòng chuyển mạng ví sang Arbitrum Sepolia để tiếp tục.'
    },
    drawer: {
      title: 'Drawer (Off-Canvas Slide-Over) Component',
      subtitle: 'Bảng trượt slide-over từ các lề màn hình (Phải, Trái, Dưới - Bottom Sheet trên Mobile).',
      btn_right: 'Mở Drawer (Lề Phải)',
      btn_left: 'Mở Drawer (Lề Trái)',
      btn_bottom: 'Bottom Sheet (Mobile)',
      panel_title: 'Chi Tiết Giao Dịch Web3',
      panel_subtitle: 'Mã hash: 0x9a8f...4e1b'
    },
    stepper: {
      title: 'Stepper (Multi-Step Timeline Workflow) Component',
      subtitle: 'Quy trình nhiều bước tuyến tính với icon trạng thái dành cho các luồng giao dịch Web3.',
      prev_btn: 'Bước Trước',
      next_btn: 'Bước Tiếp Theo'
    },
    stat_card: {
      title: 'Stat Card (KPI Dashboard Metrics)',
      subtitle: 'Card chỉ số tài chính/DApp số lớn tích hợp icon gradient và trend phần trăm.',
      tvl_title: 'Total Value Locked (TVL)',
      tvl_subtitle: 'Tổng giá trị khóa trong Pool',
      vol_title: 'Khối Lượng Giao Dịch 24h',
      vol_subtitle: 'Khối lượng giao dịch trong 24h qua',
      stakers_title: 'Người Dùng Staking Active',
      stakers_subtitle: 'Người dùng đang Stake Token'
    },
    breadcrumb: {
      title: 'Breadcrumb Navigation Component',
      subtitle: 'Thanh điều hướng phân cấp đường dẫn với icon Home và router link.'
    },
    divider: {
      title: 'Divider & Separator Component',
      subtitle: 'Đường kẻ phân cách Solid, Dashed & Gradient hỗ trợ căn lề nhãn text.',
      label_or: 'HOẶC KẾT NỐI BẰNG',
      label_dashed: 'DASHED LINE',
      label_gradient: 'GRADIENT GLOW'
    },
    copy_to_clipboard: {
      title: 'Copy to Clipboard Component',
      subtitle: 'Nút sao chép văn bản với feedback icon tích xanh phát sáng và toast notification.',
      copy_btn: 'Sao chép ví',
      copied_btn: 'Đã sao chép!'
    }
  },
  about: {
    title: 'Về Dự Án Angular Web3 Wallet',
    subtitle: 'Nền tảng khởi tạo dApp chuyên nghiệp cho các lập trình viên Angular 19.',
    desc1: 'Angular Web3 Wallet được phát triển dựa trên các quy chuẩn UI/UX hiện đại nhất, kết hợp sức mạnh của Angular 19 Standalone Components, Signal State Management và hệ thống màu sắc thương hiệu động (Dynamic Theme).',
    desc2: 'Tích hợp đầy đủ các công cụ Web3 hàng đầu bao gồm Ethers.js v6, AppKit WalletConnect, quản lý mạng lưới tùy chỉnh và các component dùng chung đạt chuẩn thiết kế design.md.',
    feature1_title: 'Kiến Trúc Hiện Đại',
    feature1_desc: 'Sử dụng Angular Standalone Component, Signals reactivity và TypeScript strict type checking.',
    feature2_title: 'Tích Hợp Web3 Toàn Diện',
    feature2_desc: 'Hỗ trợ kết nối ví MetaMask, WalletConnect, chuyển mạng mượt mà và tương tác Smart Contract.',
    feature3_title: 'Thiết Kế Đỉnh Cao',
    feature3_desc: 'Hệ thống giao diện Glassmorphism, bo góc 15px chuẩn mực, hỗ trợ Dark Mode và Responsive.'
  },
  contact: {
    title: 'Liên Hệ Với Chúng Tôi',
    subtitle: 'Gửi thắc mắc hoặc góp ý cho đội ngũ phát triển Angular Web3 Wallet.',
    name_label: 'HỌ VÀ TÊN',
    name_placeholder: 'Nhập họ và tên của bạn',
    email_label: 'ĐỊA CHỈ EMAIL',
    email_placeholder: 'name@example.com',
    subject_label: 'CHỦ ĐỀ',
    subject_placeholder: 'Chọn hoặc nhập chủ đề liên hệ',
    message_label: 'NỘI DUNG THÔNG ĐIỆP',
    message_placeholder: 'Nhập chi tiết thông điệp của bạn...',
    send_btn: 'Gửi Thông Điệp',
    success_toast: 'Cảm ơn bạn! Thông điệp liên hệ đã được gửi thành công.',
    info_title: 'Thông Tin Hỗ Trợ',
    info_desc: 'Đội ngũ hỗ trợ phát triển luôn sẵn sàng lắng nghe ý kiến đóng góp của bạn.'
  },
  modal_demo: {
    title: 'Chỉnh Sửa Cấu Hình Dự Án',
    desc: 'Điền thông tin và kiểm tra sự tương tác của các form control tùy biến.',
    project_name: 'TÊN DỰ ÁN DAPP',
    chain: 'MẠNG LƯỚI CHÍNH',
    release_date: 'NGÀY PHÁT HÀNH',
    date_range: 'KHOẢNG THỜI GIAN HOẠT ĐỘNG (KÈM GIỜ & PHÚT)',
    enable_notif: 'Bật thông báo sự kiện Smart Contract',
    cancel: 'Hủy Bỏ',
    confirm: 'Lưu Cấu Hình',
    updated_toast: 'Đã cập nhật cấu hình thành công!'
  },
  common: {
    search: 'Tìm kiếm',
    close: 'Đóng',
    copy: 'Sao chép',
    copied: 'Đã sao chép!',
    success: 'Thành công',
    error: 'Lỗi',
    loading: 'Đang tải...',
    save: 'Lưu',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    all: 'Tất cả',
    clear_date_range: 'Xóa khoảng thời gian',
    apply: 'Áp dụng'
  }
};
