import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../../core/services/search.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flight-search.html',
  styleUrls: ['./flight-search.scss'],
})
export class FlightSearch {
  origin = '';
  destination = '';
  date = '';
  submitted = false;

  constructor(private router: Router, private searchService: SearchService) {}

  search(form?: NgForm) {
    this.submitted = true;

    // If form passed, use its validity; otherwise fallback to simple check
    const valid = form ? form.valid : (this.origin && this.destination && this.date);
    if (!valid) {
      return;
    }

    // Update browser URL and emit a DOM event so the static results component can react.
    const params = new URLSearchParams({ origin: this.origin, destination: this.destination, date: this.date });
    const url = `/results?${params.toString()}`;
    try {
      history.pushState({}, '', url);
    } catch (e) {
      // ignore pushState errors in older browsers
    }

    // Emit via SearchService so components receive the search reliably
    this.searchService.emit({ origin: this.origin, destination: this.destination, date: this.date });
    // Keep DOM event for backward-compat (optional)
    window.dispatchEvent(new CustomEvent('travelapp:search', { detail: { origin: this.origin, destination: this.destination, date: this.date } }));
  }
}
