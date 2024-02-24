import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  autocompleteConference(term: string): Observable<string[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<string[]>(`${this.baseUrl}/autocompleteConference/${term}`, { params });
  }

  getFilteredNodesConference(filtros: string[]): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/filterConferences`, { filterNames: filtros });
  }

  getFilteredNodesJournal(filtros: string[]): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/filterJournals`, { filterNames: filtros });
  }

  getResearchersConference(titulosSeleccionados: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/researchersConference`, { titulosSeleccionados });
  }

  getPapers(titulosSeleccionados: any[], option: string, venue: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/papers`, { titulosSeleccionados, option, venue });
  }

  getCollaborations(titulosSeleccionados: any[], option: string, venue: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/collaborations`, { titulosSeleccionados, option, venue });
  }

  getAuthorsPapers(titulosSeleccionados: any[], option: string, venue: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AuthorsPapers`, { titulosSeleccionados, option, venue });
  }

  getAuthorsDegree(titulosSeleccionados: any[], option: string, venue: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AuthorsDegree`, { titulosSeleccionados, option, venue });
  }

  getPublicationsbyYear(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/searchPublications`, {});
  }

  getAuthorsbyYear(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/searchAuthors`, {});
  }

  getConferencesbyYear(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/searchConference`, {});
  }

  getPublications(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/allPublications`, {});
  }

  getConferences(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/allConferences`, {});
  }

  getAuthors(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/allAuthors`, {});
  }

  getSchools(): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/schools`, {});
  }

  getConnectedComponents(titulosSeleccionados: any[], venue: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/connectedComponents`, { titulosSeleccionados, venue });
  }

  getConnectedComponentsByvenue(titulosSeleccionados: any[], venue: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/connectedComponentsBYvenue`, { titulosSeleccionados, venue });
  }

  getConferencebyProceeding(titulosSeleccionados: any[], venue: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ConferencebyProceeding`, { titulosSeleccionados, venue });
  }

}
