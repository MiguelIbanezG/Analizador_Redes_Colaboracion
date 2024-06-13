import { TestBed } from '@angular/core/testing';

import { ChartsStatisticsService } from './charts-statistics.service';

describe('ChartsStatisticsService', () => {
  let service: ChartsStatisticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartsStatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
