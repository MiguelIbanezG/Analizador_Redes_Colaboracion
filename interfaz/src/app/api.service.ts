import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  obtenerNodosFiltradosConference(filtros: string[]): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/filtrar-conferences`, { filterNames: filtros });
  }

  buscarVenues(term: string): Observable<string[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<string[]>(`${this.baseUrl}/buscar-venues/${term}`, { params });
  }

  obtenerNodosFiltradosJournal(name: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}//filtrar-journals/${name}`);
  }

  generarEstadisticas(titulosSeleccionados: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/estadisticas`, { titulosSeleccionados });
  }

  obtenerEstadisticas(): Observable<any> {
    const url = `${this.baseUrl}/estadisticas`;
    return this.http.get<any>(url);
  }


  generarconf(titulosSeleccionados: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/config`, { titulosSeleccionados });
  }

  obtenerConfig(): Observable<any> {
    const url = `${this.baseUrl}/config`;
    return this.http.get<any>(url);
  }

  obtenerResearchersConference(titulosSeleccionados: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/researchersconference`, { titulosSeleccionados });
  }

  obtenerResearchersJournals(titulosSeleccionados: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/researchersjournals`, { titulosSeleccionados });
  }

  obtenerPapers(titulosSeleccionados: any[], option: string, venue: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/papers`, { titulosSeleccionados, option, venue });
  }

  obtenerColaboraciones(titulosSeleccionados: any[], option: string, venue: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/colaboraciones`, { titulosSeleccionados, option, venue });
  }

  obtenerAuthorsPapers(titulosSeleccionados: any[], option: string, venue: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AuthorsPapers`, { titulosSeleccionados, option, venue });
  }

  obtenerAuthorsNames(titulosSeleccionados: any[], option: string, venue: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/SearchNames`, { titulosSeleccionados, option, venue });
  }

  obtenerAuthorsGrade(titulosSeleccionados: any[], option: string, venue: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AuthorsDegree`, { titulosSeleccionados, option, venue });
  }

  obtenerbooks(titulosSeleccionados: any[], venue: string[]): Observable<any> {
    console.log("rolerher"+venue)
    return this.http.post<any>(`${this.baseUrl}/searchbook`, { titulosSeleccionados, venue});
  }

  obtenerSchools(): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/schools`, {});
  }
  
  
}
