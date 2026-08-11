export type SupportedLang = 'vi' | 'en';

export interface LanguageOption {
  code: SupportedLang;
  label: string;
  nativeName: string;
  flagSvg: string;
}

export interface TranslationDictionary {
  nav: {
    home: string;
    about: string;
    contact: string;
    tagline: string;
  };
  header: {
    open_menu: string;
    select_network: string;
    popular_networks: string;
    wrong_network: string;
    connecting: string;
    connect_wallet: string;
    connected_wallet: string;
    copy_address: string;
    wallet_details: string;
    view_explorer: string;
    disconnect: string;
    copied_address_toast: string;
  };
  language: {
    select_language: string;
    vietnamese: string;
    english: string;
    change_success: string;
  };
  theme: {
    label: string;
    light: string;
    dark: string;
    auto: string;
  };
  tx_speed: {
    label: string;
    default: string;
    fast: string;
    custom: string;
    fee_multiplier: string;
  };
  date_picker_ui: {
    select_date: string;
    select_range: string;
    apply: string;
    cancel: string;
    today: string;
    yesterday: string;
    last_7_days: string;
    last_30_days: string;
    this_month: string;
    days_count: string;
    months_count: string;
    years_count: string;
  };
  file_upload_ui: {
    select_files: string;
    select_avatar: string;
    select_from_device: string;
    drag_drop_files: string;
    drag_drop_avatar: string;
    max_size: string;
    selected_files: string;
    clear_all: string;
    waiting: string;
    completed: string;
    error: string;
    preview: string;
    retry: string;
    remove: string;
    close_modal: string;
  };
  table_ui: {
    empty_title: string;
    empty_desc: string;
  };
  pagination_ui: {
    showing: string;
    of: string;
    records: string;
  };
  wallet: {
    dashboard_title: string;
    account_address: string;
    balance: string;
    network: string;
    chain_id: string;
    status: string;
    connected: string;
    not_connected: string;
    connect_prompt_title: string;
    connect_prompt_desc: string;
    switch_network_btn: string;
    open_account_btn: string;
  };
  home: {
    hero_badge: string;
    hero_title: string;
    hero_desc: string;
    explore_btn: string;
    connect_now_btn: string;
    showcase_title: string;
    showcase_subtitle: string;
  };
  cards: {
    buttons: {
      title: string;
      subtitle: string;
      primary: string;
      secondary: string;
      cancel: string;
      danger: string;
      loading: string;
      icon_button: string;
    };
    badges: {
      title: string;
      subtitle: string;
      active: string;
      pending: string;
      error: string;
      info: string;
      hover_tooltip: string;
    };
    inputs: {
      title: string;
      subtitle: string;
      label_address: string;
      label_amount: string;
      label_search: string;
      placeholder_address: string;
      placeholder_amount: string;
      placeholder_search: string;
    };
    selects: {
      title: string;
      subtitle: string;
      label_single: string;
      label_ten: string;
      label_multi: string;
    };
    controls: {
      title: string;
      subtitle: string;
      switch_dark: string;
      switch_notif: string;
      checkbox_agree: string;
      radio_fast: string;
      radio_normal: string;
      radio_slow: string;
    };
    slider: {
      title: string;
      subtitle: string;
      label: string;
    };
    modal_demo: {
      title: string;
      subtitle: string;
      open_btn: string;
    };
    date_picker: {
      title: string;
      subtitle: string;
      single_date: string;
      range_date: string;
      range_time: string;
    };
    ripple: {
      title: string;
      subtitle: string;
      interactive_box: string;
    };
    accordion: {
      title: string;
      subtitle: string;
      item1_title: string;
      item1_content: string;
      item2_title: string;
      item2_content: string;
    };
    table: {
      title: string;
      subtitle: string;
      search_placeholder: string;
      filter_all: string;
      col_tx: string;
      col_method: string;
      col_block: string;
      col_value: string;
      col_status: string;
    };
    code_block: {
      title: string;
      subtitle: string;
      copy_btn: string;
    };
    file_upload: {
      title: string;
      subtitle: string;
      drag_drop_text: string;
      support_text: string;
    };
    input_otp: {
      title: string;
      subtitle: string;
      label_6digit: string;
      label_pin: string;
    };
    voice_chat: {
      title: string;
      subtitle: string;
      voice_title: string;
      members_count: string;
      join_btn: string;
      leave_btn: string;
    };
    progress: {
      title: string;
      subtitle: string;
      storage_label: string;
      gauge_label: string;
    };
    lang_showcase: {
      title: string;
      subtitle: string;
      active_lang: string;
      select_placeholder: string;
    };
  };
  about: {
    title: string;
    subtitle: string;
    desc1: string;
    desc2: string;
    feature1_title: string;
    feature1_desc: string;
    feature2_title: string;
    feature2_desc: string;
    feature3_title: string;
    feature3_desc: string;
  };
  contact: {
    title: string;
    subtitle: string;
    name_label: string;
    name_placeholder: string;
    email_label: string;
    email_placeholder: string;
    subject_label: string;
    subject_placeholder: string;
    message_label: string;
    message_placeholder: string;
    send_btn: string;
    success_toast: string;
    info_title: string;
    info_desc: string;
  };
  modal_demo: {
    title: string;
    desc: string;
    project_name: string;
    chain: string;
    release_date: string;
    date_range: string;
    enable_notif: string;
    cancel: string;
    confirm: string;
    updated_toast: string;
  };
  common: {
    search: string;
    close: string;
    copy: string;
    copied: string;
    success: string;
    error: string;
    loading: string;
    save: string;
    cancel: string;
    confirm: string;
    all: string;
  };
}
