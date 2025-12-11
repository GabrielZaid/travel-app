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
  AvailabilitySortOption,
  FlightAvailability,
  FlightAvailabilityClass,
  FlightAvailabilitySegment,
  FlightAvailabilityQuery,
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
    sortBy: ['closestDeparture' as AvailabilitySortOption],
  });

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly availabilities = signal<FlightAvailability[]>([]);
  readonly hasSubmitted = signal(false);
  readonly total = signal(0);
  readonly pageSize = 5;
  readonly currentPage = signal(1);

  private readonly lastQuery = signal<FlightAvailabilityQuery | null>(null);

  readonly sortOptions: { value: AvailabilitySortOption; label: string }[] = [
    { value: 'closestDeparture', label: 'Más próximos a la salida' },
    { value: 'shortestDuration', label: 'Menor duración' },
    { value: 'mostSeats', label: 'Más asientos disponibles' },
    { value: 'leastSeats', label: 'Menos asientos disponibles' },
  ];

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

  readonly totalPages = computed(() => {
    const total = this.total();
    return Math.max(1, Math.ceil(total / this.pageSize));
  });

  readonly pages = computed(() => {
    const count = this.totalPages();
    return Array.from({ length: count }, (_, index) => index + 1);
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.hasSubmitted.set(true);
    const payload = this.buildPayload();
    this.currentPage.set(1);
    this.lastQuery.set(payload);
    this.fetchAvailability(payload, 1);
  }

  showError(controlName: 'origin' | 'destination' | 'date' | 'time'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched || this.hasSubmitted());
  }

  trackByAvailability = (_: number, item: FlightAvailability) => item.id;

  trackBySegment = (_: number, segment: FlightAvailabilitySegment) => segment.id;

  trackByClass = (_: number, item: FlightAvailabilityClass) =>
    `${item.class}-${item.numberOfBookableSeats}`;

  trackByPage = (_: number, page: number) => page;

  routeLabel(flight: FlightAvailability): string {
    const first = flight.segments[0];
    const last = flight.segments[flight.segments.length - 1];
    return `${first?.departure.iataCode ?? '---'} → ${last?.arrival.iataCode ?? '---'}`;
  }

  goToPage(page: number) {
    const payload = this.lastQuery();
    if (!payload) return;
    const safePage = Math.max(1, Math.min(page, this.totalPages()));
    if (safePage === this.currentPage()) return;
    this.fetchAvailability(payload, safePage);
  }

  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  handleSortChange() {
    const payload = this.lastQuery();
    if (!payload) {
      return;
    }
    const sortBy = this.form.controls.sortBy.value as AvailabilitySortOption | null;
    const updatedPayload: FlightAvailabilityQuery = {
      ...payload,
      sortBy: sortBy ?? undefined,
    };
    this.lastQuery.set(updatedPayload);
    this.currentPage.set(1);
    this.fetchAvailability(updatedPayload, 1);
  }

  retryLastQuery() {
    const payload = this.lastQuery();
    if (!payload) {
      this.submit();
      return;
    }
    this.fetchAvailability(payload, this.currentPage());
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
    const { origin, destination, date, time, sortBy } = this.form.getRawValue();
    return {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      date,
      time: this.normalizeTime(time),
      sortBy: sortBy ?? undefined,
    };
  }

  private normalizeTime(value: string): string {
    if (!value) return '00:00:00';
    return value.length === 5 ? `${value}:00` : value;
  }

  private fetchAvailability(basePayload: FlightAvailabilityQuery, page: number) {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.availabilityService
      .searchAvailability({ ...basePayload, page, limit: this.pageSize })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.availabilities.set(response.data ?? []);
          this.total.set(response.total ?? 0);
          this.currentPage.set(response.page ?? page);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.availabilities.set([]);
          this.total.set(0);
          this.currentPage.set(page);
          this.errorMessage.set(this.resolveError(err));
        },
      });
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
