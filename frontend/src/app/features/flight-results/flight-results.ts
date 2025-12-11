import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription, combineLatest, of } from 'rxjs';
import { filter, switchMap, tap, catchError, startWith, map, shareReplay } from 'rxjs/operators';
import { FlightsService } from '../../core/services/flights';
import { Flight, FlightResponse, FlightCheapestDate } from '../../core/models/flight.interface';
import { SearchService, SearchParams } from '../../core/services/search.service';
// Note: reactive implementation — derive results from SearchService and page$.
@Component({
  selector: 'app-flight-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flight-results.html',
  styleUrls: ['./flight-results.scss'],
})
export class FlightResults implements OnInit, OnDestroy {
  // Reactive state
  private page$ = new BehaviorSubject<number>(1);
  private loading$ = new BehaviorSubject<boolean>(false);
  private sortOption$ = new BehaviorSubject<SortValue>('price-asc');
  private cheapestLoading$ = new BehaviorSubject<boolean>(false);
  readonly loading$obs = this.loading$.asObservable();
  readonly sortOptionObs = this.sortOption$.asObservable();
  readonly cheapestLoading$obs = this.cheapestLoading$.asObservable();

  readonly pageSize = 5;
  // expose Math for use in template
  readonly Math = Math;
  // observable for current page (for template binding)
  readonly page$obs = this.page$.asObservable();
  readonly sortOptions: SortOption[] = [
    { label: 'Precio ↑', value: 'price-asc' },
    { label: 'Precio ↓', value: 'price-desc' },
    { label: 'Duración ↑', value: 'duration-asc' },
    { label: 'Duración ↓', value: 'duration-desc' },
    { label: 'Aerolínea A-Z', value: 'airline-asc' },
    { label: 'Aerolínea Z-A', value: 'airline-desc' },
  ];

  // results$ emits the backend paginated response shape (initialized in ngOnInit)
  results$!: import('rxjs').Observable<FlightResponse>;
  cheapestDates$!: import('rxjs').Observable<FlightCheapestDate[]>;

  pages$!: import('rxjs').Observable<number[]>;

  private subs = new Subscription();
  private latestRes: FlightResponse | null = null;

  constructor(private flightsService: FlightsService, private searchService: SearchService) {
    // nothing here
  }

  ngOnInit(): void {
    // Build reactive pipeline now that services are available
    const searchWithReset$ = this.searchService.search$.pipe(
      filter((s): s is SearchParams => Boolean(s)),
      tap(() => this.page$.next(1))
    );

    const baseResults$ = combineLatest([searchWithReset$, this.page$]).pipe(
      tap(() => this.loading$.next(true)),
      switchMap(([s, page]) =>
        this.flightsService.searchFlights(s.origin, s.destination, s.date, page, this.pageSize).pipe(
          catchError((e) => {
            console.error('Flights fetch error:', e);
            return of<FlightResponse>({ data: [], total: 0, page, pageSize: this.pageSize });
          })
        )
      ),
      tap(() => this.loading$.next(false)),
      tap(res => this.latestRes = res),
      startWith({ data: [], total: 0, page: 1, pageSize: this.pageSize }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.results$ = combineLatest([baseResults$, this.sortOption$]).pipe(
      map(([res, sort]) => ({
        ...res,
        data: this.sortFlights(res.data ?? [], sort),
      })),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.pages$ = baseResults$.pipe(
      map((res) => {
        const total = res.total ?? 0;
        const size = res.pageSize ?? this.pageSize;
        const count = Math.max(1, Math.ceil(total / size));
        return Array.from({ length: count }, (_, i) => i + 1);
      })
    );

    this.cheapestDates$ = searchWithReset$.pipe(
      tap(() => this.cheapestLoading$.next(true)),
      switchMap((s) =>
        this.flightsService
          .getCheapestDates(s.origin, s.destination, { nonStop: true })
          .pipe(
            map((resp) => resp.data ?? []),
            catchError((error) => {
              console.error('Cheapest dates fetch error:', error);
              return of<FlightCheapestDate[]>([]);
            }),
          ),
      ),
      tap(() => this.cheapestLoading$.next(false)),
      startWith([] as FlightCheapestDate[]),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    // If URL contains params at load, emit them into the service so results$ triggers
    const params = new URLSearchParams(window.location.search);
    const o = params.get('origin');
    const dest = params.get('destination');
    const dt = params.get('date');
    if (o && dest && dt) {
      this.searchService.emit({ origin: o, destination: dest, date: dt });
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // Pagination controls
  goToPage(page: number) {
    if (!this.latestRes) {
      this.page$.next(page);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      return;
    }
    const total = this.latestRes.total ?? 0;
    const size = this.latestRes.pageSize ?? this.pageSize;
    const max = Math.max(1, Math.ceil(total / size));
    page = Math.max(1, Math.min(page, max));
    this.page$.next(page);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  prevPage() {
    const current = this.page$.value;
    this.goToPage(current - 1);
  }

  nextPage() {
    const current = this.page$.value;
    this.goToPage(current + 1);
  }

  trackByFlight(_: number, item: Flight) {
    return item.id ?? _;
  }

  trackByCheapest(_: number, item: FlightCheapestDate) {
    return `${item.origin}-${item.destination}-${item.departureDate}`;
  }

  setSort(value: SortValue) {
    this.sortOption$.next(value);
  }

  flightNumber(flight: Flight): string {
    const segment = flight?.segments && flight.segments.length > 0 ? flight.segments[0] : undefined;
    return segment?.flightNumber ?? '—';
  }

  private sortFlights(list: Flight[], option: SortValue): Flight[] {
    const copy = [...list];
    switch (option) {
      case 'price-asc':
        return copy.sort((a, b) => this.safeNumber(a.price?.total) - this.safeNumber(b.price?.total));
      case 'price-desc':
        return copy.sort((a, b) => this.safeNumber(b.price?.total, Number.NEGATIVE_INFINITY) - this.safeNumber(a.price?.total, Number.NEGATIVE_INFINITY));
      case 'duration-asc':
        return copy.sort((a, b) => this.durationToMinutes(a.duration) - this.durationToMinutes(b.duration));
      case 'duration-desc':
        return copy.sort((a, b) => this.durationToMinutes(b.duration) - this.durationToMinutes(a.duration));
      case 'airline-desc':
        return copy.sort((a, b) => (b.airline || '').localeCompare(a.airline || ''));
      case 'airline-asc':
      default:
        return copy.sort((a, b) => (a.airline || '').localeCompare(b.airline || ''));
    }
  }

  private safeNumber(value: number | undefined, fallback = Number.POSITIVE_INFINITY): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  private durationToMinutes(duration?: string): number {
    if (!duration || typeof duration !== 'string') return Number.POSITIVE_INFINITY;
    const match = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(duration);
    if (!match) return Number.POSITIVE_INFINITY;
    const hours = match[1] ? Number(match[1]) : 0;
    const minutes = match[2] ? Number(match[2]) : 0;
    return hours * 60 + minutes;
  }
}

type SortValue =
  | 'price-asc'
  | 'price-desc'
  | 'duration-asc'
  | 'duration-desc'
  | 'airline-asc'
  | 'airline-desc';

type SortOption = { label: string; value: SortValue };
