import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private router: Router) {}

  search(form?: NgForm) {
    this.submitted = true;

    // If form passed, use its validity; otherwise fallback to simple check
    const valid = form ? form.valid : (this.origin && this.destination && this.date);
    if (!valid) {
      return;
    }

    this.router.navigate(['/results'], {
      queryParams: {
        origin: this.origin,
        destination: this.destination,
        date: this.date,
      },
    });
  }
}
