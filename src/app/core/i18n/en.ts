import { TranslationDictionary } from './i18n.types';

export const EN_TRANSLATIONS: TranslationDictionary = {
  nav: {
    home: 'Home',
    about: 'About Us',
    contact: 'Contact',
    tagline: 'Web3 Template'
  },
  header: {
    open_menu: 'Open menu',
    select_network: 'Quick Select Network',
    popular_networks: '-- Select Most Popular Networks --',
    wrong_network: 'Wrong Network',
    connecting: 'Connecting...',
    connect_wallet: 'Connect Wallet',
    connected_wallet: 'Connected Wallet',
    copy_address: 'Copy Wallet Address',
    wallet_details: 'Wallet Details',
    view_explorer: 'View on Explorer',
    disconnect: 'Disconnect Wallet',
    copied_address_toast: 'Wallet address copied to clipboard!'
  },
  language: {
    select_language: 'Select Language',
    vietnamese: 'Tiếng Việt',
    english: 'English',
    change_success: 'Switched language to English!'
  },
  theme: {
    label: 'Theme',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto'
  },
  tx_speed: {
    label: 'Tx Speed',
    default: 'Default',
    fast: 'Fast',
    custom: 'Custom',
    fee_multiplier: 'Multiplier:'
  },
  date_picker_ui: {
    select_date: 'Select date...',
    select_range: 'Select date range...',
    apply: 'Apply',
    cancel: 'Cancel',
    today: 'Today',
    yesterday: 'Yesterday',
    last_7_days: 'Last 7 days',
    last_30_days: 'Last 30 days',
    this_month: 'This month',
    days_count: '{days} days',
    months_count: '{months} months',
    years_count: '{years} years'
  },
  date: {
    mon_short: 'Mon',
    tue_short: 'Tue',
    wed_short: 'Wed',
    thu_short: 'Thu',
    fri_short: 'Fri',
    sat_short: 'Sat',
    sun_short: 'Sun',
    select: 'Select date',
    select_range: 'Select date range...',
    today: 'Today',
    yesterday: 'Yesterday',
    last_7_days: 'Last 7 days',
    last_30_days: 'Last 30 days',
    this_month: 'This month',
    days_7: '7 days',
    month_1: '1 month',
    months_3: '3 months',
    months_6: '6 months',
    year_1: '1 year',
    time_config: 'TIME CONFIG',
    start_time: 'Start time',
    end_time: 'End time',
    hour: 'Hour'
  },
  action: {
    cancel: 'Cancel',
    apply: 'Apply',
    done: 'Done'
  },

  file_upload_ui: {
    select_files: 'Select files',
    select_avatar: 'Upload avatar',
    select_from_device: 'Browse from device',
    drag_drop_files: 'Drag & drop files here or click to browse',
    drag_drop_avatar: 'Drag & drop image here to update avatar',
    max_size: 'Maximum file size:',
    selected_files: 'Selected files ({count})',
    clear_all: 'Clear all',
    waiting: 'Waiting',
    completed: 'Completed',
    error: 'Error',
    preview: 'View image',
    retry: 'Retry',
    remove: 'Remove file',
    close_modal: 'Close window'
  },
  table_ui: {
    empty_title: 'No data available',
    empty_desc: 'Please check your search or filter criteria.'
  },
  pagination_ui: {
    showing: 'Showing',
    of: 'of',
    records: 'records'
  },
  wallet: {
    dashboard_title: 'Web3 Wallet Dashboard',
    account_address: 'Account Address',
    balance: 'Available Balance',
    network: 'Current Network',
    chain_id: 'Chain ID',
    status: 'Connection Status',
    connected: 'Connected',
    not_connected: 'Not Connected',
    connect_prompt_title: 'Connect Your Web3 Wallet',
    connect_prompt_desc: 'Connect MetaMask, WalletConnect, or your Web3 wallet to unlock full dApp features.',
    switch_network_btn: 'Switch Network',
    open_account_btn: 'Manage Account'
  },
  home: {
    hero_badge: 'Angular 19 + Web3 Starter Kit',
    hero_title: 'Modern DApp Platform For Angular Web3 Wallet',
    hero_desc: 'Premium UI/UX component library integrated with Ethers.js v6, WalletConnect, Glassmorphism design, and dynamic brand themes.',
    explore_btn: 'Explore Showcase',
    connect_now_btn: 'Connect Wallet Now',
    showcase_title: 'Premium Component Library & UI Showcase',
    showcase_subtitle: 'Curated collection of UI/UX components crafted following design.md, featuring Dark Mode & smooth interactions.'
  },
  cards: {
    buttons: {
      title: 'Button System',
      subtitle: 'Multiple variants, sizes, smooth hover/active states, and loading indicators.',
      primary: 'Primary Button',
      secondary: 'Secondary Button',
      cancel: 'Cancel Button',
      danger: 'Danger Button',
      loading: 'Loading...',
      icon_button: 'Icon Button'
    },
    badges: {
      title: 'Badge & Tooltip System',
      subtitle: 'Vibrant status badges with smooth interactive tooltip guidance.',
      active: 'Active',
      pending: 'Pending',
      error: 'Failed',
      info: 'Information',
      hover_tooltip: 'Hover to view Tooltip'
    },
    inputs: {
      title: 'Standard Form Inputs',
      subtitle: 'Text inputs, search boxes, and form-field wrappers.',
      label_address: 'RECEIVER WALLET ADDRESS',
      label_amount: 'TOKEN AMOUNT',
      label_search: 'SEARCH DATA',
      placeholder_address: 'Enter wallet address 0x...',
      placeholder_amount: '0.00',
      placeholder_search: 'Type search keywords...'
    },
    selects: {
      title: 'Custom Select & Multi-Select',
      subtitle: 'Supports single selection, multi-select with Checkbox UI, and 10 network dropdown.',
      label_single: 'SINGLE SELECT (5 NETWORKS)',
      label_ten: 'SINGLE SELECT (10 NETWORKS)',
      label_multi: 'MULTI-SELECT (TOPPINGS)'
    },
    controls: {
      title: 'Switches, Checkboxes & Radio Buttons',
      subtitle: 'Interactive option controls with vivid state changes.',
      switch_dark: 'Dark Mode',
      switch_notif: 'Push Notifications',
      checkbox_agree: 'I agree to the terms of service',
      radio_fast: 'Fast',
      radio_normal: 'Normal',
      radio_slow: 'Economy (Slow)'
    },
    slider: {
      title: 'Custom Value Slider',
      subtitle: 'Draggable value slider with clear step marks.',
      label: 'TRANSACTION SLIPPAGE (%)'
    },
    modal_demo: {
      title: 'Dynamic Modal Dialog System',
      subtitle: 'Open dynamic modals via ModalService without template cluttering.',
      open_btn: 'Open Demo Form Modal'
    },
    date_picker: {
      title: 'Date & Range Pickers',
      subtitle: 'Premium Custom Date Picker & Date Time Range Picker pinned to viewport.',
      single_date: 'SELECT BIRTHDATE',
      range_date: 'SELECT DATE RANGE',
      range_time: 'DATE RANGE WITH TIME'
    },
    ripple: {
      title: 'Ripple Wave Directive',
      subtitle: 'Smooth fluid wave animation expanding outward on click.',
      interactive_box: 'Click inside this area to test the Ripple effect'
    },
    accordion: {
      title: 'Collapsible Accordion Component',
      subtitle: 'Flexible expandable items with smooth transition keyframes.',
      item1_title: '1. Which networks does this Web3 Wallet support?',
      item1_content: 'Supports Ethereum, Arbitrum, BNB Chain, Polygon PoS, Optimism, Base, Avalanche C-Chain, and major EVM chains.',
      item2_title: '2. How do I switch the theme color mode?',
      item2_content: 'You can toggle Light, Dark, and Auto modes at the bottom of the Sidebar or in the Header settings.'
    },
    table: {
      title: 'Custom Table & Sorting',
      subtitle: 'Premium Web3 data table with searching, column sorting, and pagination.',
      search_placeholder: 'Search by Tx Hash...',
      filter_all: 'All Statuses',
      col_tx: 'TX HASH',
      col_method: 'METHOD',
      col_block: 'BLOCK',
      col_value: 'VALUE',
      col_status: 'STATUS'
    },
    code_block: {
      title: 'Code Block Component',
      subtitle: 'Syntax Highlighting tokenizer for TypeScript, HTML, CSS, JSON, and Bash.',
      copy_btn: 'Copy Code'
    },
    file_upload: {
      title: 'File Upload Drag & Drop',
      subtitle: 'Drag and drop files, live image previews, and simulated uploading progress.',
      drag_drop_text: 'Drag & drop files here or click to browse',
      support_text: 'Supports PNG, JPG, PDF, ZIP files up to 10MB',
      card_title: 'Card 16: Premium File Upload Component (app-file-upload)',
      demo1_title: '1. Horizontal Bar Layout (Standard Design)',
      demo1_field_title: 'Select SQL backup file',
      demo1_field_desc: 'Click to select .sql file from your device',
      select_btn: 'Select file',
      demo2_title: '2. Multi-file Attachments',
      demo2_field_title: 'Upload attachment documents',
      demo2_field_desc: 'Click or drag PDF, ZIP, Docx files from device',
      browse_btn: 'Browse files',
      demo3_title: '3. Vertical Image Dropzone',
      demo3_field_title: 'Drag & drop images here',
      demo3_field_desc: 'Supports uploading multiple images at once',
      select_image: 'Select image',
      demo4_title: '4. Avatar Profile Picture Upload',
      avatar_title: 'Profile avatar',
      avatar_desc: 'PNG, JPG max 3MB'
    },
    input_otp: {
      title: 'Input OTP Component',
      subtitle: 'Smooth key navigation, slot grouping, mask mode, and blinking caret.',
      label_6digit: '6-DIGIT OTP (3 - 3 GROUP)',
      label_pin: 'SECURITY PIN (4-SLOT MASK MODE)',
      invalid_title: '4. Invalid & Disabled States',
      invalid_desc: 'Warning for invalid code or pending state',
      incorrect_code: 'Incorrect OTP code',
      disabled_label: 'Disabled',
      card_title: 'Card 18: Premium Input OTP Component (app-input-otp)',
      demo1_title: '1. OTP Verification Code (6 digits - 3-3 Grouping)',
      demo1_desc: 'Web3 transaction authentication / 2FA Login',
      input_val: 'Input value',
      empty_val: '(empty)',
      resend_code: 'Resend code',
      demo2_title: '2. Secure PIN Code (Mask Mode - 4 digits)',
      demo2_desc: 'Hide characters using security mask',
      hide_pin: 'Hide PIN',
      show_pin: 'Show PIN',
      demo3_title: '3. Voucher / Referral Code (Alphanumeric)',
      demo3_desc: 'Accepts both letters and numbers (A-Z, 0-9)',
      paste_support: 'Supports Ctrl+V (Paste)'
    },
    dropdown: {
      title: 'Dropdown Menu & Voice Chat Morphing Card',
      subtitle: 'FLIP Morphing Card 268px -> 360px transition with animated audio waveform bars.',
      card_title: 'Card 19: Premium Dropdown Menu Component (app-dropdown-menu)',
      card_desc: 'Versatile dropdown navigation: User Profile, 2-Level Submenu, Checkbox/Radio options, Flexible triggers & Glassmorphism.',
      demo1_title: '1. Account & Profile Menu (Header + User Info)',
      demo1_desc: 'Integrated Avatar, Email, Status Badge, and Logout',
      demo2_title: '2. Checkbox & Radio Items (UI Configuration)',
      demo2_desc: 'Toggle options and single mode selection',
      demo3_title: '3. 2-Level Nested Submenu',
      demo3_desc: 'Smooth slide-out menu on hover or click',
      demo4_title: '4. Icon Trigger & Placements',
      demo4_desc: 'Icon-only trigger or bottom-right alignment',
      customize_ui: 'Customize UI',
      web3_actions: 'Web3 Wallet Actions',
      ghost_btn: 'Ghost Button'
    },
    voice_chat: {
      title: 'Dropdown Menu & Voice Chat Morphing Card',
      subtitle: 'FLIP Morphing Card 268px -> 360px transition with animated audio waveform bars.',
      voice_title: 'Web3 Developers Voice Room',
      members_count: '4 Members Speaking',
      join_btn: 'Join Now',
      leave_btn: 'Leave Room'
    },
    progress: {
      title: 'Progress Bar & Gauge Components',
      subtitle: 'Linear bar, Multi-segment storage, Animated stripe, SVG Circular & Semi-Gauge.',
      storage_label: 'DAPP STORAGE CAPACITY',
      gauge_label: 'BLOCKCHAIN SYNC PROGRESS',
      card_title: 'Card 20: Premium Progress Bar Component (app-progress)',
      card_desc: 'Multiple progress variants: Linear Bar, Steps, Multi-Segment, Striped Animated, Indeterminate, Circular Ring & Semi-Circle Gauge.',
      demo1_title: '1. Sizes (xs, sm, md, lg, xl)',
      demo1_desc: 'Flexible heights fitting all UI contexts',
      demo2_title: '2. Colors & Brand Gradients',
      demo2_desc: 'Status colors: Success, Warning, Danger, Info & Gradient',
      demo3_title: '3. Striped, Animated & Indeterminate Mode',
      demo3_desc: 'Scrolling stripe effect & infinite loading wave',
      demo4_title: '4. Steps & Multi-Segment Storage',
      demo4_desc: '4-step workflow indicator & wallet storage allocation',
      demo5_title: '5. Real-Time Interactive Demo',
      demo5_desc: 'Drag slider to dynamically adjust percentage',
      demo6_title: '6. Circular Ring & Semi-Circle Gauge',
      demo6_desc: '360° Circular & 180° Semi-Circle SVG Gauges',
      striped_animated: 'Striped Animated (Uploading file to IPFS...)',
      indeterminate: 'Indeterminate (Syncing Blockchain blocks...)',
      step_workflow: '4-Step Confirmation Workflow (Step 3/4)',
      storage_allocation: 'DApp Wallet Storage Allocation',
      empty_label: 'Free',
      loading_state: 'Web3 Data Loading State',
      adjust_value: 'Adjust Progress Value',
      circle_label: 'Circular Ring',
      semicircle_label: 'Semi-Circle'
    },
    lang_showcase: {
      title: 'Multi-Language i18n Dropdown',
      subtitle: 'i18n system powered by Angular Signals with separate vi.ts / en.ts files, key storage, and real-time updates.',
      active_lang: 'Active Language:',
      select_placeholder: 'Select system language'
    },
    avatar: {
      title: 'Avatar & Avatar Group Component',
      subtitle: 'User profile avatar, status indicators (online/offline), fallback initials & overlapping avatar stack.',
      single_label: 'Single Avatars & Status Dots',
      group_label: 'Avatar Group Stack (+N counter)'
    },
    empty_state: {
      title: 'Empty State Component',
      subtitle: 'Empty data container with smooth SVG vector illustrations, title, description, and action buttons.',
      sample_title: 'No Transactions Found',
      sample_desc: 'Your wallet address has not performed any deposit/withdraw token transactions on the blockchain.',
      action_btn: 'Deposit Tokens Now',
      secondary_btn: 'Refresh'
    },
    alert: {
      title: 'Alert & Callout Component',
      subtitle: 'Sticky notification banners (Info, Success, Warning, Error) with Soft, Bordered & Accent styles.',
      info_title: 'Network Update',
      info_msg: 'BSC Testnet RPC has been switched to Sentio Node for optimized response latency.',
      success_title: 'Transaction Successful',
      success_msg: 'Successfully minted 1,000 DAPP Tokens into your connected wallet.',
      warning_title: 'Gas Volatility Warning',
      warning_msg: 'Ethereum Mainnet gas fee is currently higher than 45 Gwei.',
      error_title: 'Incorrect Wallet Network',
      error_msg: 'Please switch your wallet network to Arbitrum Sepolia to proceed.'
    },
    drawer: {
      title: 'Drawer (Off-Canvas Slide-Over) Component',
      subtitle: 'Off-canvas slide-over panels from screen edges (Right, Left, Bottom Sheet on Mobile).',
      btn_right: 'Open Drawer (Right Side)',
      btn_left: 'Open Drawer (Left Side)',
      btn_bottom: 'Bottom Sheet (Mobile)',
      panel_title: 'Web3 Transaction Details',
      panel_subtitle: 'Tx Hash: 0x9a8f...4e1b'
    },
    stepper: {
      title: 'Stepper (Multi-Step Timeline Workflow) Component',
      subtitle: 'Linear multi-step workflow timeline with status icons designed for Web3 transaction flows.',
      prev_btn: 'Previous Step',
      next_btn: 'Next Step'
    },
    stat_card: {
      title: 'Stat Card (KPI Dashboard Metrics)',
      subtitle: 'Financial & DApp metric card with large numbers, gradient icons, and percentage trend badges.',
      tvl_title: 'Total Value Locked (TVL)',
      tvl_subtitle: 'Total value locked inside pool',
      vol_title: '24h Trading Volume',
      vol_subtitle: 'Total trading volume over past 24 hours',
      stakers_title: 'Active Stakers',
      stakers_subtitle: 'Users currently staking tokens'
    },
    breadcrumb: {
      title: 'Breadcrumb Navigation Component',
      subtitle: 'Hierarchical path navigation with Home icon and router links.'
    },
    divider: {
      title: 'Divider & Separator Component',
      subtitle: 'Solid, Dashed & Gradient line separators supporting text label alignment.',
      label_or: 'OR CONNECT WITH',
      label_dashed: 'DASHED LINE',
      label_gradient: 'GRADIENT GLOW'
    },
    copy_to_clipboard: {
      title: 'Copy to Clipboard Component',
      subtitle: 'Copy text button with glowing green checkmark feedback animation and toast notification.',
      copy_btn: 'Copy Address',
      copied_btn: 'Copied!'
    }
  },
  about: {
    title: 'About Angular Web3 Wallet',
    subtitle: 'Professional dApp starter kit built for Angular 19 developers.',
    desc1: 'Angular Web3 Wallet is built following modern UI/UX design standards, combining the power of Angular 19 Standalone Components, Signal State Management, and Dynamic Theme branding.',
    desc2: 'Pre-integrated with top-tier Web3 tools including Ethers.js v6, AppKit WalletConnect, custom network management, and reusable shared components conforming strictly to design.md.',
    feature1_title: 'Modern Architecture',
    feature1_desc: 'Built with Angular Standalone Components, Signals reactivity, and strict TypeScript checks.',
    feature2_title: 'Full Web3 Integration',
    feature2_desc: 'Supports MetaMask, WalletConnect, seamless chain switching, and Smart Contract calls.',
    feature3_title: 'Cutting-edge Design',
    feature3_desc: 'Glassmorphism aesthetic, 15px capped border radius, Dark Mode, and Responsive design.'
  },
  contact: {
    title: 'Contact Us',
    subtitle: 'Send your questions or feedback to the Angular Web3 Wallet development team.',
    name_label: 'FULL NAME',
    name_placeholder: 'Enter your full name',
    email_label: 'EMAIL ADDRESS',
    email_placeholder: 'name@example.com',
    subject_label: 'SUBJECT',
    subject_placeholder: 'Select or type message subject',
    message_label: 'MESSAGE CONTENT',
    message_placeholder: 'Type your message details...',
    send_btn: 'Send Message',
    success_toast: 'Thank you! Your contact message has been sent successfully.',
    info_title: 'Support Information',
    info_desc: 'Our development support team is always available to assist you.'
  },
  modal_demo: {
    title: 'Edit Project Settings',
    desc: 'Fill in details and test interactive form controls in real time.',
    project_name: 'DAPP PROJECT NAME',
    chain: 'PRIMARY NETWORK',
    release_date: 'RELEASE DATE',
    date_range: 'ACTIVE DATE RANGE (WITH TIME)',
    enable_notif: 'Enable Smart Contract Event Notifications',
    cancel: 'Cancel',
    confirm: 'Save Settings',
    updated_toast: 'Settings updated successfully!'
  },
  common: {
    search: 'Search',
    close: 'Close',
    copy: 'Copy',
    copied: 'Copied!',
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    all: 'All',
    clear_date_range: 'Clear date range',
    apply: 'Apply'
  }
};
