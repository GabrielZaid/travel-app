import { Routes } from '@angular/router';
import { FlightSearch } from './features/flight-search/flight-search';
import { FlightResults } from './features/flight-results/flight-results';

export const routes: Routes = [
  { path: '', component: FlightSearch },
  { path: 'results', component: FlightResults },
];
