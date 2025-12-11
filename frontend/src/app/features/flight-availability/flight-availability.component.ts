import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FlightAvailabilityService } from '../../core/services/flight-availability.service';
import {
  FlightAvailability,
  FlightAvailabilityClass,
  FlightAvailabilitySegment,
  SearchAvailabilityPayload,
} from '../../core/models/flight-availability.interface';

@Component({
  selector: 'app-flight-availability',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flight-availability.component.html',
  styleUrls: ['./flight-availability.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightAvailabilityComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly availabilityService = inject(FlightAvailabilityService);

  readonly form = this.fb.nonNullable.group({
    origin: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{3}$/)]],
    destination: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{3}$/)]],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
  });

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly availabilities = signal<FlightAvailability[]>([]);
  readonly hasSubmitted = signal(false);

  readonly showEmptyState = computed(
    () =>
      !this.loading() &&
      this.availabilities().length === 0 &&
      !this.errorMessage(),
  );

  readonly showResults = computed(
    () =>
      !this.loading() &&
      this.availabilities().length > 0 &&
      !this.errorMessage(),
  );

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.hasSubmitted.set(true);
    const payload = this.buildPayload();
    this.loading.set(true);
    this.errorMessage.set(null);

    this.availabilityService
      .searchAvailability(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.availabilities.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.availabilities.set([]);
          this.errorMessage.set(this.resolveError(err));
        },
      });
  }

  showError(controlName: 'origin' | 'destination' | 'date' | 'time'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched || this.hasSubmitted());
  }

  trackByAvailability = (_: number, item: FlightAvailability) => item.id;

  trackBySegment = (_: number, segment: FlightAvailabilitySegment) => segment.id;

  trackByClass = (_: number, item: FlightAvailabilityClass) =>
    `${item.class}-${item.numberOfBookableSeats}`;

  routeLabel(flight: FlightAvailability): string {
    const first = flight.segments[0];
    const last = flight.segments[flight.segments.length - 1];
    return `${first?.departure.iataCode ?? '---'} → ${last?.arrival.iataCode ?? '---'}`;
  }

  formatDuration(duration?: string): string {
    if (!duration) return '—';
    const match = /PT(?:(\d+)H)?(?:(\d+)M)?/i.exec(duration);
    if (!match) return duration;
    const hours = match[1] ? Number(match[1]) : 0;
    const minutes = match[2] ? Number(match[2]) : 0;
    const parts = [] as string[];
    if (hours) parts.push(`${hours}h`);
    if (minutes || parts.length === 0) parts.push(`${minutes}m`);
    return parts.join(' ');
  }

  formatDateTime(value?: string): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  private buildPayload(): SearchAvailabilityPayload {
    const { origin, destination, date, time } = this.form.getRawValue();
    return {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      date,
      time: this.normalizeTime(time),
    };
  }

  private normalizeTime(value: string): string {
    if (!value) return '00:00:00';
    return value.length === 5 ? `${value}:00` : value;
  }

  private resolveError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No pudimos comunicarnos con el servidor. Intenta nuevamente.';
      }
      if (error.error?.message) {
        return error.error.message as string;
      }
      return `Ocurrió un error (${error.status}).`;
    }
    return 'Algo salió mal al consultar la disponibilidad.';
  }
}
