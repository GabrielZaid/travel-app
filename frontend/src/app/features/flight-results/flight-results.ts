import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FlightsService } from '../../core/services/flights';
import { Flight } from '../../core/models/flight.interface';

@Component({
  selector: 'app-flight-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flight-results.html',
  styleUrls: ['./flight-results.scss'],
})
export class FlightResults implements OnInit {
  flights: Flight[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private flightsService: FlightsService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const { origin, destination, date } = params;

      // Guard: only call backend when we have all required params
      if (!origin || !destination || !date) {
        // no search params provided
        this.flights = [];
        this.loading = false;
        return;
      }

      this.loading = true;
      this.flightsService.searchFlights(origin, destination, date).subscribe(
        (res) => {
          this.flights = res.data;
          this.loading = false;
        },
        (err) => {
          console.error('Flights fetch error:', err);
          this.flights = [];
          this.loading = false;
        }
      );
    });
  }
}
