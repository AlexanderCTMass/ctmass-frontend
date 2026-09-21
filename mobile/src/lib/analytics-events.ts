import {
  type EventProperties,
  getCurrentScreen,
  trackEvent,
} from "@/lib/analytics";
import type { GeoPlace } from "@/lib/mapbox";

type Role = string | null;

function define<P extends EventProperties | void = void>(name: string) {
  return (...args: P extends EventProperties ? [properties: P] : []): void => {
    trackEvent(name, args[0]);
  };
}

export function locationProps(place: GeoPlace | null | undefined): {
  city: string | null;
  state: string | null;
} {
  if (!place) return { city: null, state: null };
  const parts = place.place_name
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && !/^united states$/i.test(part));
  if (parts.length === 0) return { city: null, state: null };
  const state = parts[parts.length - 1].replace(/\s*\d.*$/, "") || null;
  const city = parts.length > 1 ? parts[parts.length - 2] : null;
  return { city, state };
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 300);
  if (typeof error === "string") return error.slice(0, 300);
  return "unknown";
}

export function currentScreen(): string {
  return getCurrentScreen();
}

export const analyticsEvents = {
  splashScreenShown: define<{
    trigger: "launch" | "error_recovery";
    duration_ms: number;
    theme: string;
  }>("splash_screen_shown"),
  errorBoundaryTriggered: define<{
    error_name: string;
    error_message: string;
    component_stack: string;
    screen: string;
    attempt: number;
    will_retry: boolean;
  }>("error_boundary_triggered"),
  errorBoundaryRetryTapped: define<{ attempt: number }>(
    "error_boundary_retry_tapped",
  ),
  deepLinkOpened: define<{
    path: string;
    initial: boolean;
    has_invite_ref: boolean;
  }>("deep_link_opened"),
  pushNotificationOpened: define<{
    type: string | null;
    app_link: string | null;
    cold_start: boolean;
  }>("push_notification_opened"),
  notificationPermissionResult: define<{
    granted: boolean;
    source: string;
  }>("notification_permission_result"),
  tabSelected: define<{ tab: string; previous_tab: string }>("tab_selected"),
  backButtonTapped: define<{ screen: string }>("back_button_tapped"),
  authRequiredPrompted: define<{ screen: string }>("auth_required_prompted"),

  themeInitialized: define<{ theme: string }>("theme_initialized"),
  themeChanged: define<{
    from_preference: string;
    to_preference: string;
    from_theme: string;
    to_theme: string;
  }>("theme_changed"),

  authScreenViewed: define<{
    role: Role;
    next: string | null;
    apple_available: boolean;
  }>("auth_screen_viewed"),
  signInStarted: define<{ method: "google" | "apple" }>("sign_in_started"),
  signInSucceeded: define<{ method: "google" | "apple"; duration_ms: number }>(
    "sign_in_succeeded",
  ),
  signInCancelled: define<{ method: "google" | "apple" }>("sign_in_cancelled"),
  signInFailed: define<{ method: "google" | "apple"; error_message: string }>(
    "sign_in_failed",
  ),
  legalDocumentOpened: define<{ document: string; screen: string }>(
    "legal_document_opened",
  ),
  devOnboardingRestarted: define("dev_onboarding_restarted"),
  guestGateViewed: define<{ gate: string }>("guest_gate_viewed"),
  guestGateSignInTapped: define<{ gate: string }>("guest_gate_sign_in_tapped"),

  onboardingWelcomeViewed: define("onboarding_welcome_viewed"),
  onboardingWelcomeContinueTapped: define("onboarding_welcome_continue_tapped"),
  onboardingRoleViewed: define("onboarding_role_viewed"),
  onboardingRoleSelected: define<{ role: string; previous_role: Role }>(
    "onboarding_role_selected",
  ),
  onboardingHowItWorksViewed: define<{ role: Role }>(
    "onboarding_how_it_works_viewed",
  ),
  onboardingHowItWorksContinueTapped: define<{ role: Role }>(
    "onboarding_how_it_works_continue_tapped",
  ),
  onboardingRewardsViewed: define<{ role: Role }>("onboarding_rewards_viewed"),
  onboardingRewardsContinueTapped: define<{ role: Role }>(
    "onboarding_rewards_continue_tapped",
  ),
  onboardingGetStartedViewed: define<{ role: Role }>(
    "onboarding_get_started_viewed",
  ),
  onboardingPrimaryActionTapped: define<{
    role: Role;
    action: "create_project" | "create_trade";
  }>("onboarding_primary_action_tapped"),
  onboardingExploreLaterTapped: define<{ role: Role }>(
    "onboarding_explore_later_tapped",
  ),
  onboardingCompleted: define<{ role: Role; path: string }>(
    "onboarding_completed",
  ),

  projectSpecialtyViewed: define("project_specialty_viewed"),
  projectSpecialtySelected: define<{
    specialty: string;
    is_other: boolean;
    position: number;
  }>("project_specialty_selected"),
  projectSpecialtyContinueTapped: define<{
    specialty: string;
    is_other: boolean;
    custom_specialty: string | null;
  }>("project_specialty_continue_tapped"),
  projectBriefViewed: define<{ specialty: string | null }>(
    "project_brief_viewed",
  ),
  projectBriefMessageSent: define<{
    step: "description" | "location";
    text: string;
    text_length: number;
    input_method: "typed" | "voice";
    specialty: string | null;
  }>("project_brief_message_sent"),
  projectBriefPhotoAdded: define<{ specialty: string | null }>(
    "project_brief_photo_added",
  ),
  projectBriefPhotoPickerCancelled: define(
    "project_brief_photo_picker_cancelled",
  ),
  projectBriefPhotoSkipped: define<{ specialty: string | null }>(
    "project_brief_photo_skipped",
  ),
  projectBriefCompleted: define<{
    specialty: string | null;
    has_photo: boolean;
    location: string | null;
  }>("project_brief_completed"),
  voiceInputStarted: define<{ screen: string }>("voice_input_started"),
  voiceInputStopped: define<{
    screen: string;
    duration_ms: number;
    transcript_length: number;
  }>("voice_input_stopped"),
  voiceInputFailed: define<{
    screen: string;
    reason: "permission_denied" | "unavailable";
  }>("voice_input_failed"),
  contentFilterBlocked: define<{ screen: string; fields: string[] }>(
    "content_filter_blocked",
  ),
  projectSpecialistsViewed: define<{
    specialty: string | null;
    is_authenticated: boolean;
    request_id: string | null;
  }>("project_specialists_viewed"),
  projectSpecialistsLoaded: define<{
    specialty: string | null;
    count: number;
    used_fallback: boolean;
  }>("project_specialists_loaded"),
  projectCreated: define<{
    project_id: string;
    request_id: string;
    specialty: string;
    has_photo: boolean;
    location: string | null;
    description_length: number;
  }>("project_created"),
  projectCreationFailed: define<{
    specialty: string | null;
    error_message: string;
  }>("project_creation_failed"),
  specialistMessageTapped: define<{
    screen: string;
    specialist_owner_id: string;
    trade_id: string;
    specialty: string;
    rating: number;
    reviews: number;
    position: number;
    project_id: string | null;
  }>("specialist_message_tapped"),
  projectSpecialistsLoginTapped: define<{ specialty: string | null }>(
    "project_specialists_login_tapped",
  ),
  projectSpecialistsGoHomeTapped: define<{ specialists_count: number }>(
    "project_specialists_go_home_tapped",
  ),

  tradeSetupViewed: define("trade_setup_viewed"),
  tradeSetupFieldCompleted: define<{
    field: string;
    value: string;
    value_length: number;
  }>("trade_setup_field_completed"),
  tradeSetupOptionSelected: define<{
    field: "specialty" | "commute_minutes" | "price_type";
    value: string;
  }>("trade_setup_option_selected"),
  tradeSetupSubmitted: define<{
    title: string;
    specialty: string;
    is_custom_specialty: boolean;
    commute_minutes: number;
    price_type: string;
    price: string;
    about: string;
    city: string | null;
    state: string | null;
  }>("trade_setup_submitted"),
  contractorReadyViewed: define<{
    title: string;
    specialty: string | null;
  }>("contractor_ready_viewed"),
  contractorReadySignInTapped: define("contractor_ready_sign_in_tapped"),
  tradeCreated: define<{
    trade_id: string;
    specialty: string;
    commute_minutes: number;
    price_type: string;
    city: string | null;
    state: string | null;
  }>("trade_created"),
  tradeCreationFailed: define<{ error_message: string }>(
    "trade_creation_failed",
  ),
  tradeCompletedDashboardTapped: define("trade_completed_dashboard_tapped"),

  locationPickerOpened: define<{ context: string; has_value: boolean }>(
    "location_picker_opened",
  ),
  locationSearchPerformed: define<{
    context: string;
    query_length: number;
    results_count: number;
  }>("location_search_performed"),
  locationSuggestionSelected: define<{
    context: string;
    position: number;
    city: string | null;
    state: string | null;
  }>("location_suggestion_selected"),
  locationPinMoved: define<{
    context: string;
    city: string | null;
    state: string | null;
  }>("location_pin_moved"),
  locationOutsideUsRejected: define<{ context: string }>(
    "location_outside_us_rejected",
  ),
  locationConfirmed: define<{
    context: string;
    city: string | null;
    state: string | null;
  }>("location_confirmed"),
  locationPickerCancelled: define<{ context: string }>(
    "location_picker_cancelled",
  ),

  homeModeChanged: define<{ mode: string; previous_mode: string }>(
    "home_mode_changed",
  ),
  homeMyRequestOpened: define<{
    project_id: string;
    state: string;
    response_count: number;
    position: number;
    page: number;
  }>("home_my_request_opened"),
  homeNearbyRequestOpened: define<{
    project_id: string;
    specialty: string;
    responded: boolean;
    destination: "chat" | "request";
    position: number;
    page: number;
  }>("home_nearby_request_opened"),
  homePageChanged: define<{ mode: string; page: number; total_pages: number }>(
    "home_page_changed",
  ),
  homeNewRequestTapped: define("home_new_request_tapped"),
  homeNewTradeTapped: define("home_new_trade_tapped"),
  homeEmptyStateShown: define<{ mode: string }>("home_empty_state_shown"),

  chatsSearchPerformed: define<{
    query_length: number;
    threads_count: number;
    people_count: number;
  }>("chats_search_performed"),
  chatThreadOpened: define<{
    thread_id: string;
    unread_count: number;
    position: number;
    source: "list" | "search";
  }>("chat_thread_opened"),
  chatNewConversationStarted: define<{ peer_uid: string }>(
    "chat_new_conversation_started",
  ),
  chatNewConversationFailed: define<{
    peer_uid: string;
    error_message: string;
  }>("chat_new_conversation_failed"),
  chatsEmptyStateShown: define<{ searching: boolean }>(
    "chats_empty_state_shown",
  ),
  chatOpened: define<{
    thread_id: string;
    has_project: boolean;
    project_state: string | null;
    messages_count: number;
    unread_count: number;
    is_blocked: boolean;
  }>("chat_opened"),
  chatMessageSent: define<{
    thread_id: string;
    text_length: number;
    has_project: boolean;
    is_first_message: boolean;
  }>("chat_message_sent"),
  chatMessageSendFailed: define<{ thread_id: string; error_message: string }>(
    "chat_message_send_failed",
  ),
  chatPhotoAttachTapped: define<{ thread_id: string }>(
    "chat_photo_attach_tapped",
  ),
  chatPhotoSent: define<{ thread_id: string }>("chat_photo_sent"),
  chatPhotoSendFailed: define<{ thread_id: string; error_message: string }>(
    "chat_photo_send_failed",
  ),
  chatPeerProfileOpened: define<{ thread_id: string; peer_uid: string }>(
    "chat_peer_profile_opened",
  ),
  specialistSelected: define<{
    project_id: string;
    specialist_uid: string;
    thread_id: string;
  }>("specialist_selected"),
  specialistSelectionFailed: define<{
    project_id: string;
    error_message: string;
  }>("specialist_selection_failed"),
  chatSelectedBannerDismissed: define<{ project_id: string | null }>(
    "chat_selected_banner_dismissed",
  ),
  chatBackHomeTapped: define<{ project_id: string | null }>(
    "chat_back_home_tapped",
  ),

  requestViewed: define<{
    project_id: string;
    specialty: string;
    state: string;
    has_photo: boolean;
    can_respond: boolean;
    needs_trade: boolean;
    needs_auth: boolean;
    is_own: boolean;
  }>("request_viewed"),
  requestResponseSubmitted: define<{
    project_id: string;
    message_length: number;
    price: string;
    has_price: boolean;
  }>("request_response_submitted"),
  requestResponseSent: define<{ project_id: string; thread_id: string }>(
    "request_response_sent",
  ),
  requestResponseFailed: define<{ project_id: string; error_message: string }>(
    "request_response_failed",
  ),
  requestSignInTapped: define<{ project_id: string }>("request_sign_in_tapped"),
  requestCreateTradeTapped: define<{ project_id: string }>(
    "request_create_trade_tapped",
  ),

  myRequestViewed: define<{
    project_id: string;
    state: string;
    response_count: number;
  }>("my_request_viewed"),
  myRequestResponderOpened: define<{
    project_id: string;
    responder_uid: string;
    position: number;
  }>("my_request_responder_opened"),
  myRequestOpenChatTapped: define<{
    project_id: string;
    contractor_uid: string | null;
  }>("my_request_open_chat_tapped"),

  tradeProfileViewed: define<{
    owner_id: string;
    trade_id: string;
    specialty: string;
    rating: number;
    reviews: number;
    from_project: boolean;
  }>("trade_profile_viewed"),
  tradeProfileMessageTapped: define<{
    owner_id: string;
    project_id: string | null;
  }>("trade_profile_message_tapped"),
  tradeProfileWebOpened: define<{ owner_id: string }>(
    "trade_profile_web_opened",
  ),

  publicProfileViewed: define<{
    target_uid: string;
    is_own: boolean;
    target_role: string | null;
    trades_count: number;
    certificates_count: number;
    via_invite: boolean;
    is_blocked: boolean;
  }>("public_profile_viewed"),
  publicProfileTradeOpened: define<{
    target_uid: string;
    trade_id: string;
    position: number;
  }>("public_profile_trade_opened"),
  publicProfileCertificateOpened: define<{
    target_uid: string;
    certificate_id: string;
  }>("public_profile_certificate_opened"),
  reportUserTapped: define<{ target_uid: string }>("report_user_tapped"),
  blockUserTapped: define<{ target_uid: string }>("block_user_tapped"),
  blockUserCancelled: define<{ target_uid: string }>("block_user_cancelled"),
  userBlocked: define<{ target_uid: string }>("user_blocked"),
  userUnblocked: define<{ target_uid: string }>("user_unblocked"),
  blockToggleFailed: define<{ target_uid: string; action: string }>(
    "block_toggle_failed",
  ),
  friendInviteAcceptTapped: define<{
    inviter_uid: string;
    is_authenticated: boolean;
  }>("friend_invite_accept_tapped"),
  friendInviteAccepted: define<{ inviter_uid: string }>(
    "friend_invite_accepted",
  ),
  friendInviteAcceptFailed: define<{ inviter_uid: string }>(
    "friend_invite_accept_failed",
  ),
  friendInviteExploreTapped: define<{ inviter_uid: string }>(
    "friend_invite_explore_tapped",
  ),
  profileShareLinkTapped: define<{ target_uid: string }>(
    "profile_share_link_tapped",
  ),
  profileQrOpened: define<{ target_uid: string }>("profile_qr_opened"),
  profileQrShared: define<{ target_uid: string }>("profile_qr_shared"),
  profileQrClosed: define<{ target_uid: string }>("profile_qr_closed"),

  reportReasonSelected: define<{ target_uid: string; reason: string }>(
    "report_reason_selected",
  ),
  reportPhotoAdded: define<{ target_uid: string }>("report_photo_added"),
  reportPhotoRemoved: define<{ target_uid: string }>("report_photo_removed"),
  reportSubmitted: define<{
    target_uid: string;
    reason: string;
    comment: string;
    has_photo: boolean;
  }>("report_submitted"),
  reportFailed: define<{ target_uid: string; error_message: string }>(
    "report_failed",
  ),

  profilePhotoUploadTapped: define("profile_photo_upload_tapped"),
  profilePhotoPickerCancelled: define("profile_photo_picker_cancelled"),
  profilePhotoUploaded: define("profile_photo_uploaded"),
  profilePhotoUploadFailed: define<{ error_message: string }>(
    "profile_photo_upload_failed",
  ),
  profileMenuItemTapped: define<{ item: string }>("profile_menu_item_tapped"),
  contactSupportOpened: define<{ method: "mailto" | "gmail" | "fallback" }>(
    "contact_support_opened",
  ),
  deleteAccountTapped: define("delete_account_tapped"),
  deleteAccountCancelled: define("delete_account_cancelled"),
  deleteAccountConfirmed: define("delete_account_confirmed"),
  accountDeleted: define("account_deleted"),
  accountDeletionFailed: define<{ error_message: string }>(
    "account_deletion_failed",
  ),

  profileSetupSubmitted: define<{
    is_contractor: boolean;
    name_filled: boolean;
    name_length: number;
    email_filled: boolean;
    phone_filled: boolean;
    business_name: string;
    professional_role: string;
    short_bio: string;
    city: string | null;
    state: string | null;
  }>("profile_setup_submitted"),
  profileSetupValidationFailed: define<{ fields: string[] }>(
    "profile_setup_validation_failed",
  ),
  profileSetupSaved: define("profile_setup_saved"),
  profileSetupSaveFailed: define<{ error_message: string }>(
    "profile_setup_save_failed",
  ),
  certificateAddTapped: define<{ certificates_count: number }>(
    "certificate_add_tapped",
  ),
  certificateDeleteTapped: define<{ certificate_id: string }>(
    "certificate_delete_tapped",
  ),
  certificateDeleteCancelled: define<{ certificate_id: string }>(
    "certificate_delete_cancelled",
  ),
  certificateDeleted: define<{ certificate_id: string }>("certificate_deleted"),
  certificateDeleteFailed: define<{ certificate_id: string }>(
    "certificate_delete_failed",
  ),
  certificatePhotoAdded: define<{ photos_count: number }>(
    "certificate_photo_added",
  ),
  certificatePhotoRemoved: define<{ photos_count: number }>(
    "certificate_photo_removed",
  ),
  certificateVisibilityToggled: define<{ is_public: boolean }>(
    "certificate_visibility_toggled",
  ),
  certificateSubmitted: define<{
    document_type: string;
    institution: string;
    specialty: string;
    year: string;
    photos_count: number;
    is_public: boolean;
  }>("certificate_submitted"),
  certificateValidationFailed: define<{ fields: string[] }>(
    "certificate_validation_failed",
  ),
  certificateSaved: define<{ photos_count: number; is_public: boolean }>(
    "certificate_saved",
  ),
  certificateSaveFailed: define<{ error_message: string }>(
    "certificate_save_failed",
  ),

  videoAddTapped: define<{ videos_count: number }>("video_add_tapped"),
  videoItemAdded: define<{ media_type: string; items_count: number }>(
    "video_item_added",
  ),
  videoValidationFailed: define<{ fields: string[] }>(
    "video_validation_failed",
  ),
  videoSaved: define<{ items_count: number; has_video: boolean }>(
    "video_saved",
  ),
  videoSaveFailed: define<{ error_message: string }>("video_save_failed"),
  videoDeleteTapped: define<{ video_id: string }>("video_delete_tapped"),
  videoDeleted: define<{ video_id: string }>("video_deleted"),
  videoDeleteFailed: define<{ video_id: string }>("video_delete_failed"),
  videoViewerOpened: define<{
    target_uid: string;
    videos_count: number;
    position: number;
  }>("video_viewer_opened"),
  videoLiked: define<{ video_id: string; liked: boolean }>("video_liked"),
  videoReported: define<{ video_id: string }>("video_reported"),

  notificationPreferenceToggled: define<{
    preference: string;
    enabled: boolean;
  }>("notification_preference_toggled"),
  notificationEnableTapped: define("notification_enable_tapped"),

  friendInviteSubmitted: define<{ email_filled: boolean }>(
    "friend_invite_submitted",
  ),
  friendInviteValidationFailed: define<{ fields: string[] }>(
    "friend_invite_validation_failed",
  ),
  friendInviteSent: define("friend_invite_sent"),
  friendInviteFailed: define<{ error_message: string }>("friend_invite_failed"),
  friendsListLoaded: define<{ count: number }>("friends_list_loaded"),
  friendMessageTapped: define<{ friend_uid: string; position: number }>(
    "friend_message_tapped",
  ),
  friendsInviteTapped: define("friends_invite_tapped"),

  shopBalanceTapped: define<{ balance: number }>("shop_balance_tapped"),
  shopCategoryFilterChanged: define<{ category: string; previous: string }>(
    "shop_category_filter_changed",
  ),
  shopSortChanged: define<{ sort: string; previous: string }>(
    "shop_sort_changed",
  ),
  shopItemActionTapped: define<{
    feature_key: string;
    name: string;
    category: string;
    price: number;
    action: string;
    can_afford: boolean;
    is_purchased: boolean;
    balance: number;
  }>("shop_item_action_tapped"),
  shopEmptyStateShown: define<{ category: string; sort: string }>(
    "shop_empty_state_shown",
  ),
  purchaseSheetOpened: define<{
    feature_key: string;
    name: string;
    category: string;
    price: number;
    balance: number;
    has_packages: boolean;
    has_sizes: boolean;
  }>("purchase_sheet_opened"),
  purchasePackageSelected: define<{
    feature_key: string;
    package_id: string;
    package_name: string;
    price: number;
  }>("purchase_package_selected"),
  purchaseSizeSelected: define<{
    feature_key: string;
    size: string;
    item_index: number;
  }>("purchase_size_selected"),
  purchaseQuantityChanged: define<{
    feature_key: string;
    quantity: number;
    delta: number;
    item_index: number;
  }>("purchase_quantity_changed"),
  purchaseItemAdded: define<{ feature_key: string; items_count: number }>(
    "purchase_item_added",
  ),
  purchaseItemRemoved: define<{ feature_key: string; items_count: number }>(
    "purchase_item_removed",
  ),
  purchaseSubmitted: define<{
    feature_key: string;
    category: string;
    total_price: number;
    total_quantity: number;
    package_id: string | null;
    sizes: string[];
    message: string;
    email_filled: boolean;
    phone_filled: boolean;
    address_filled: boolean;
    balance: number;
  }>("purchase_submitted"),
  purchaseValidationFailed: define<{ feature_key: string; fields: string[] }>(
    "purchase_validation_failed",
  ),
  purchaseSucceeded: define<{
    feature_key: string;
    ticket_number: string;
    total_price: number;
  }>("purchase_succeeded"),
  purchaseFailed: define<{ feature_key: string; error_message: string }>(
    "purchase_failed",
  ),
  purchaseSheetClosed: define<{ feature_key: string; step: string }>(
    "purchase_sheet_closed",
  ),
  coinsEarnedModalShown: define<{ amount: number; gap: number }>(
    "coins_earned_modal_shown",
  ),
  coinsEarnedModalDismissed: define<{ amount: number }>(
    "coins_earned_modal_dismissed",
  ),
  coinsEarnedOpenShopTapped: define<{ amount: number }>(
    "coins_earned_open_shop_tapped",
  ),
  earnCoinsViewed: define<{
    balance: number;
    gap: number;
    actions_count: number;
  }>("earn_coins_viewed"),

  webViewOpened: define<{ url: string; title: string }>("web_view_opened"),
  webViewLoaded: define<{ url: string; load_ms: number }>("web_view_loaded"),
};
