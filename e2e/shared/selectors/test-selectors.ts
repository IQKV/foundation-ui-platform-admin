/**
 * Test selector constants for Playwright E2E tests
 *
 * Centralized location for all data-testid values to ensure consistency
 * and make test maintenance easier.
 */

export const TestSelectors = {
  // Layout
  APP_ROOT: "app-root",
  ADMIN_LAYOUT: "admin-layout",

  // Header
  ADMIN_HEADER: "admin-header",
  HEADER_LOGO: "header-logo",
  HEADER_USER_MENU: "header-user-menu",
  HEADER_USER_MENU_BUTTON: "header-user-menu-button",
  HEADER_COLOR_SCHEME_TOGGLE: "header-color-scheme-toggle",
  HEADER_MOBILE_MENU_TOGGLE: "header-mobile-menu-toggle",

  // Navigation
  ADMIN_NAV: "admin-nav",
  NAV_ITEM: (name: string) => `nav-item--${name}`,
  NAV_SUBMENU: (name: string) => `nav-submenu--${name}`,

  // Common UI Elements
  BUTTON: (name: string) => `button--${name}`,
  LINK: (name: string) => `link--${name}`,
  INPUT: (name: string) => `input--${name}`,
  FORM: (name: string) => `form--${name}`,
  MODAL: (name: string) => `modal--${name}`,
  ALERT: (name: string) => `alert--${name}`,
  LOADING_OVERLAY: "loading-overlay",
  ERROR_BOUNDARY: "error-boundary",

  // Pages
  PAGE: (name: string) => `page--${name}`,
  PAGE_HEADER: (name: string) => `page-header--${name}`,

  // Auth
  SIGN_IN_PAGE: "page-sign-in",
  SIGN_IN_WELCOME_HEADING: "sign-in-welcome-heading",
  SIGN_IN_SUBHEADING: "sign-in-subheading",
  SIGN_IN_FORM: "sign-in-form",
  SIGN_IN_EMAIL_INPUT: "sign-in-email-input",
  SIGN_IN_PASSWORD_INPUT: "sign-in-password-input",
  SIGN_IN_SUBMIT_BUTTON: "sign-in-submit-button",
  ALERT_SESSION_TIMEOUT: "alert--session-timeout",
  ALERT_ACCESS_FORBIDDEN: "alert--access-forbidden",

  // Error Pages
  PAGE_404: "page-404",
  PAGE_500: "page-500",
  PAGE_UNAUTHORIZED: "page-unauthorized",

  // Notifications
  NOTIFICATION: (type: string) => `notification--${type}`,
  NOTIFICATION_CONTAINER: "notifications-container",

  // Modals
  MODAL_CONTAINER: "modals-container",
  MODAL_CLOSE_BUTTON: "modal-close-button",
  MODAL_CONFIRM_BUTTON: "modal-confirm-button",
  MODAL_CANCEL_BUTTON: "modal-cancel-button",

  // User Management Modals
  MODAL_EDIT_USER: "modal--edit-user",
  MODAL_SET_USER_PASSWORD: "modal--set-password",
  MODAL_BAN_USER: "modal--ban-user",
  MODAL_UNBAN_USER: "modal--unban-user",
  MODAL_UNLOCK_USER: "modal--unlock-user",

  // Tenant Management Modals
  MODAL_EDIT_TENANT: "modal--edit-tenant",

  // Account Management Modals
  MODAL_EDIT_ACCOUNT: "modal--edit-account",
  MODAL_CHANGE_ADMIN_PASSWORD: "modal--change-admin-password",

  // Platform Authority Modals
  MODAL_GRANT_PLATFORM_ADMIN: "modal--grant-platform-admin",
  MODAL_REVOKE_PLATFORM_ADMIN: "modal--revoke-platform-admin",

  // Announcement Modals
  MODAL_CREATE_ANNOUNCEMENT: "modal--create-announcement",
  MODAL_EDIT_ANNOUNCEMENT: "modal--edit-announcement",
  MODAL_DELETE_ANNOUNCEMENT: "modal--delete-announcement",

  // Invitation Modals
  MODAL_PROPOSE_INVITATION: "modal--propose-invitation",
  MODAL_EDIT_INVITATION: "modal--edit-invitation",

  // Plan Modals
  MODAL_CREATE_PLAN: "modal--create-plan",
} as const;

/**
 * Helper function to create data-testid attribute
 */
export const testId = (value: string): { "data-testid": string } => ({
  "data-testid": value,
});

/**
 * Helper function to create test selector for Playwright
 */
export const byTestId = (value: string): string => `[data-testid="${value}"]`;
