import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type SearchParams = {
  origin: string;
  destination: string;
  date: string;
};

@Injectable({ providedIn: 'root' })
export class SearchService {
  private subject = new BehaviorSubject<SearchParams | null>(null);
  readonly search$: Observable<SearchParams | null> = this.subject.asObservable();

  emit(params: SearchParams) {
    this.subject.next(params);
  }
}
