import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FlightResponse } from '../../core/models/flight.interface';

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
}
