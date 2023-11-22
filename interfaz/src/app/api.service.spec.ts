import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('should retrieve publications', () => {
  //   const dummyPublications = [
  //     { id: 1, title: 'Publication 1' },
  //     { id: 2, title: 'Publication 2' }
  //   ];

  //   service.getPublications().subscribe(publications => {
  //     expect(publications.length).toBe(2);
  //     expect(publications).toEqual(dummyPublications);
  //   });

  //   const req = httpMock.expectOne('http://localhost:3000/api/publications');
  //   expect(req.request.method).toBe('GET');
  //   req.flush(dummyPublications);
  // });
});
