import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FlightAvailabilityResponse,
  SearchAvailabilityPayload,
} from '../models/flight-availability.interface';

@Injectable({ providedIn: 'root' })
export class FlightAvailabilityService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private readonly http: HttpClient) {}

  searchAvailability(
    payload: SearchAvailabilityPayload,
  ): Observable<FlightAvailabilityResponse> {
    return this.http.post<FlightAvailabilityResponse>(
      `${this.baseUrl}/flights/availability`,
      payload,
    );
  }
}
