import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  // Propiedades
  info: string = 'Home class';
  filtros: string = '';
  publicaciones: string[] = [];
  resultadosFiltrados: string[] = [];
  titulosFiltrados: { title: string, objeto: any, selected: boolean }[] = [];
  etiquetas: string[] = []; // Lista de etiquetas posibles para filtrar 

  private nodosSubscription: Subscription | undefined;
  private informacionNodoSubscription: Subscription | undefined;

  constructor(private apiService: ApiService) { }
  
  ngOnInit() {
    this.apiService.obtenerEtiquetas().subscribe({
      next: (response: any) => {
        this.etiquetas = response.etiquetas;
      },
      error: (error: any) => {
        console.error('Error al obtener las etiquetas:', error);
      }
    });
  }
  
  obtenerPublicaciones() {
    this.apiService.getPublications().subscribe({
      next: (response: any[]) => {
        this.publicaciones = response;
      },
      error: (error: any) => {
        console.error('Error al obtener las publicaciones:', error);
      }
    });
  }

  obtenerNodosFiltrados() {
    const filtros = this.filtros.split(',').map(filtro => filtro.trim());

    this.apiService.obtenerNodosFiltrados(filtros).subscribe({
      next: (response: any[]) => {
        this.resultadosFiltrados = response.map(item => JSON.stringify(item));
        this.titulosFiltrados = response.map(item => ({title: JSON.parse(JSON.stringify(item)).title, objeto: JSON.stringify(item), selected: false}));
      },
      error: (error: any) => {
        console.error('Error al obtener los resultados filtrados:', error);
      }
    });
  }

  generarEstadisticas() {
    const titulosSeleccionados = this.titulosFiltrados.filter(titulo => titulo.selected).map(titulo => titulo.objeto);
    // Realiza las operaciones de estadísticas con los objetos seleccionados
    // Puedes pasar los objetos a la página de estadísticas utilizando el servicio de enrutamiento como se mencionó anteriormente
  }
  
    /*
  enviarFiltros() {
    const filtros = this.filtros.split(',').map(filtro => filtro.trim());

    // Realiza la llamada a la API para obtener los resultados filtrados
    this.apiService.obtenerNodosFiltrados(filtros).subscribe({
      next: response => {
        this.resultados = response;
      },
      error: error => {
        console.error(error);
      }
    });
  }

  seleccionarNodo(nodo: string) {
    this.informacionNodoSubscription = this.apiService.getInformacionNodo(nodo).subscribe({
      next: (response: any) => {
        this.informacionNodo = response.informacion;
      },
      error: (error: any) => {
        console.error('Error al obtener la información del nodo:', error);
      }
    });
  }

  ngOnDestroy() {
    if (this.nodosSubscription) {
      this.nodosSubscription.unsubscribe();
    }
    if (this.informacionNodoSubscription) {
      this.informacionNodoSubscription.unsubscribe();
    }
  }
  */


}
