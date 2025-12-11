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

  searchFlights(origin: string, destination: string, date: string): Observable<FlightResponse> {
    return this.http.get<FlightResponse>(`${this.baseUrl}/flights`, {
      params: { origin, destination, date },
    });
  }
}
