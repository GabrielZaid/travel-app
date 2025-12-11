import { TestBed } from '@angular/core/testing';

import { Flights } from './flights';

describe('Flights', () => {
  let service: Flights;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Flights);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
