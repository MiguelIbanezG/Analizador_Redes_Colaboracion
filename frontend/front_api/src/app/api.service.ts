import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // obtenerEtiquetas(): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}/etiquetas`);
  // }

  getPublications(): Observable<any[]> {
    const url = `${this.baseUrl}/publications`;
    return this.http.get<any[]>(url);
  }

  // obtenerNodosFiltrados(filtros: string): Observable<string[]> {
  //   const params = new HttpParams().set('filtros', filtros);
  //   return this.http.get<any[]>(`${this.baseUrl}/filtrar-resultados`, { params });
  // }

  obtenerNodosFiltrados(filterName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}//filtrar-resultados/${filterName}`);
  }

  // generarEstadisticas(titulosSeleccionados: any[]) {
  //   const url = `${this.baseUrl}/estadisticas`;
  //   return this.http.post(url, { titulosSeleccionados });
  // }

  // generarEstadisticas(titulosSeleccionados: string[]): Observable<any> {
  //   const params = { titulosSeleccionados: titulosSeleccionados.join(',') };
  //   return this.http.get(`${this.baseUrl}/estadisticas`, { params });
  // }

  generarEstadisticas(titulosSeleccionados: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/estadisticas`, { titulosSeleccionados });
  }

  obtenerEstadisticas(): Observable<any> {
    const url = `${this.baseUrl}/estadisticas`;
  
    return this.http.get<any>(url);
  }

  /*
  getInformacionNodo(nodo: string): Observable<string> {
    const endpoint = `${this.baseUrl}/nodo/${nodo}`;
    return this.http.get<string>(endpoint);
  }
  */

}
