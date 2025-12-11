import { Routes } from '@angular/router';
import { LegacyHostComponent } from './features/legacy-host/legacy-host.component';
import { FlightAvailabilityComponent } from './features/flight-availability/flight-availability.component';

export const routes: Routes = [
  { path: '', component: LegacyHostComponent },
  { path: 'results', component: LegacyHostComponent },
  { path: 'flight-availability', component: FlightAvailabilityComponent },
  { path: '**', redirectTo: '' },
];
