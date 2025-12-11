export const ERROR_MESSAGES = {
  AMADEUS_API_FAILURE: 'Amadeus API Error',
  AMADEUS_INSPIRATION_FAILURE: 'Amadeus Inspiration Error',
  PROVIDER_CONNECTION_FAILURE: 'Error connecting to flight provider',
  AMADEUS_INSPIRATION_EMPTY_RESULT:
    'Amadeus inspiration returned no data; returning empty list',
  AMADEUS_CHEAPEST_DATES_FAILURE: 'Amadeus Cheapest Dates Error',
  AMADEUS_CHEAPEST_DATES_EMPTY_RESULT:
    'Amadeus cheapest dates returned no data; returning empty list',
} as const;
