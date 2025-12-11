import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FlightResponse, CheapestDateResponse } from '../../core/models/flight.interface';

@Injectable({
  providedIn: 'root',
})
export class FlightsService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  searchFlights(
    origin: string,
    destination: string,
    date: string,
    page?: number,
    limit?: number,
  ): Observable<FlightResponse> {
    const params: Record<string, string> = { origin, destination, date } as Record<string, string>;
    if (typeof page === 'number') params['page'] = String(page);
    if (typeof limit === 'number') params['limit'] = String(limit);

    return this.http.get<FlightResponse>(`${this.baseUrl}/flights`, {
      params,
    });
  }

  getCheapestDates(
    origin: string,
    destination: string,
    options?: { nonStop?: boolean; oneWay?: boolean },
  ): Observable<CheapestDateResponse> {
    const params: Record<string, string> = { origin, destination };
    if (options?.nonStop !== undefined) params['nonStop'] = String(options.nonStop);
    if (options?.oneWay !== undefined) params['oneWay'] = String(options.oneWay);

    return this.http.get<CheapestDateResponse>(
      `${this.baseUrl}/flights/cheapest-dates`,
      { params },
    );
  }
}
