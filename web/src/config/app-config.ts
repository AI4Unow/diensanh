/**
 * Application-wide configuration
 */

// Check if we should use mock data
// Default to false in production, checks env var in dev
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false

// Other global config constants can go here
export const APP_CONFIG = {
    USE_MOCK_DATA,
    DEFAULT_PAGE_SIZE: 20,
}
