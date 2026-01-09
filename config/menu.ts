/**
 * Menu Configuration
 * Controls visibility of menu sections and page availability
 */

export interface MenuSectionConfig {
  /** Whether this section should be visible in the menu */
  visible: boolean;
  /** Whether pages in this section should show "coming soon" instead of actual content */
  comingSoon?: boolean;
}

export interface MenuConfig {
  observe: MenuSectionConfig;
  resources: MenuSectionConfig;
  feedback: MenuSectionConfig;
  admin: MenuSectionConfig;
}

/**
 * Main menu configuration
 * Set visible: false to hide a section entirely
 * Set comingSoon: true to show "coming soon" message instead of actual page content
 */
export const menuConfig: MenuConfig = {
  observe: {
    visible: true,
    comingSoon: false,
  },
  resources: {
    visible: true,
    comingSoon: false,
  },
  feedback: {
    visible: true,
    comingSoon: true, // Show "coming soon" for all feedback pages
  },
  admin: {
    visible: false, // Hide admin section entirely
    comingSoon: false,
  },
};
