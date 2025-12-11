import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription, combineLatest, of } from 'rxjs';
import { filter, switchMap, tap, catchError, startWith, map, shareReplay } from 'rxjs/operators';
import { FlightsService } from '../../core/services/flights';
import { Flight, FlightResponse } from '../../core/models/flight.interface';
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
  readonly loading$obs = this.loading$.asObservable();

  readonly pageSize = 5;
  // expose Math for use in template
  readonly Math = Math;
  // observable for current page (for template binding)
  readonly page$obs = this.page$.asObservable();

  // results$ emits the backend paginated response shape (initialized in ngOnInit)
  results$!: import('rxjs').Observable<FlightResponse>;

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

    this.results$ = combineLatest([searchWithReset$, this.page$]).pipe(
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

    this.pages$ = this.results$.pipe(
      map((res) => {
        const total = res.total ?? 0;
        const size = res.pageSize ?? this.pageSize;
        const count = Math.max(1, Math.ceil(total / size));
        return Array.from({ length: count }, (_, i) => i + 1);
      })
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
}
