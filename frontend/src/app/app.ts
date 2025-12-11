import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FlightSearch } from './features/flight-search/flight-search';
import { FlightResults } from './features/flight-results/flight-results';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FlightSearch, FlightResults],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
