export interface AmadeusConfig {
  AMADEUS_CLIENT_ID: string;
  AMADEUS_CLIENT_SECRET: string;
  AMADEUS_API_URL: string;
  AUTH_URL_AMADEUS: string;
  ENDPOINT_FLIGHT_OFFERS: string;
  ENDPOINT_FLIGHT_DESTINATIONS: string;
  ENDPOINT_FLIGHT_DATES: string;
}

export interface AmadeusOAuthResponse {
  type: 'amadeusOAuth2Token';
  username: string;
  application_name: string;
  client_id: string;
  token_type: 'Bearer';
  access_token: string;
  expires_in: number;
  state: 'approved' | 'expired';
  scope: string;
}
