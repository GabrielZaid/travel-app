export const AMADEUS_CONFIG_KEYS = {
  CLIENT_ID: 'AMADEUS_CLIENT_ID',
  CLIENT_SECRET: 'AMADEUS_CLIENT_SECRET',
  AUTH_URL_AMADEUS: 'AUTH_URL_AMADEUS',
  AMADEUS_API_URL: 'AMADEUS_API_URL',
  ENDPOINT_FLIGHT_OFFERS: 'ENDPOINT_FLIGHT_OFFERS',
  ENDPOINT_FLIGHT_DESTINATIONS: 'ENDPOINT_FLIGHT_DESTINATIONS',
  ENDPOINT_FLIGHT_DATES: 'ENDPOINT_FLIGHT_DATES',
} as const;

export const AMADEUS_AUTH_FIELDS = {
  GRANT_TYPE: 'grant_type',
  CLIENT_ID: 'client_id',
  CLIENT_SECRET: 'client_secret',
} as const;

export const AMADEUS_AUTH_VALUES = {
  CLIENT_CREDENTIALS: 'client_credentials',
} as const;

export const AMADEUS_HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
} as const;

export const AMADEUS_HTTP_HEADER_VALUES = {
  FORM_URL_ENCODED: 'application/x-www-form-urlencoded',
} as const;

export const BEARER = 'Bearer';
export const EXPIRED = 'expired';
