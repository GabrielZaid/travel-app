import { Component } from '@angular/core';
import { FlightSearch } from '../flight-search/flight-search';
import { FlightResults } from '../flight-results/flight-results';

@Component({
  selector: 'app-legacy-host',
  standalone: true,
  imports: [FlightSearch, FlightResults],
  templateUrl: './legacy-host.component.html',
  styleUrls: ['./legacy-host.component.scss'],
})
export class LegacyHostComponent {}
