import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeleccionService {
  private titulosSeleccionados: string[] = [];

  agregarTitulos(titulos: any[]) {
    this.titulosSeleccionados = titulos.reduce((arr, titulo) => {
      arr.push(titulo);
      return arr;
    }, []);
  }

  obtenerTitulosSeleccionados() {
    return this.titulosSeleccionados;
  }

  limpiarTitulosSeleccionados() {
    this.titulosSeleccionados = [];
  }
  
}
