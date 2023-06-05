import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SeleccionService } from '../seleccion.service';



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
  titulosSeleccionados: any[] = []; // Lista de titulos seleccionados para generar estadisticas

  private nodosSubscription: Subscription | undefined;
  private informacionNodoSubscription: Subscription | undefined;

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private seleccionService: SeleccionService
  ) { }
  
  ngOnInit() {
    // this.apiService.obtenerEtiquetas().subscribe({
    //   next: (response: any) => {
    //     this.etiquetas = response.etiquetas;
    //   },
    //   error: (error: any) => {
    //     console.error('Error al obtener las etiquetas:', error);
    //   }
    // });
  }
  
  // obtenerPublicaciones() {
  //   this.apiService.getPublications().subscribe({
  //     next: (response: any[]) => {
  //       this.publicaciones = response;
  //     },
  //     error: (error: any) => {
  //       console.error('Error al obtener las publicaciones:', error);
  //     }
  //   });
  // }

  // obtenerNodosFiltrados() {
  //   const filtros = this.filtros.split(',').map(filtro => filtro.trim());

  //   this.apiService.obtenerNodosFiltrados(filtros).subscribe({
  //     next: (response: any[]) => {
  //       this.resultadosFiltrados = response.map(item => JSON.stringify(item));
  //       this.titulosFiltrados = response.map(item => ({title: JSON.parse(JSON.stringify(item)).title, objeto: JSON.stringify(item), selected: false}));
  //     },
  //     error: (error: any) => {
  //       console.error('Error al obtener los resultados filtrados:', error);
  //     }
  //   });
  // }
  obtenerNodosFiltrados() {
    this.apiService.obtenerNodosFiltrados(this.filtros).subscribe({
      next: (response: any[]) => {
        this.resultadosFiltrados = response.map(item => JSON.stringify(item));
        this.titulosFiltrados = response.map(item => ({ title: item, objeto: JSON.stringify(item), selected: false }));
      },
      error: (error: any) => {
        console.error('Error al obtener los resultados filtrados:', error);
      }
    });
  }

  hayTitulosSeleccionados(): boolean {
    return this.titulosFiltrados.some(titulo => titulo.selected);
  }
  
  
  seleccionarTitulo(titulo: string) {
    if (this.titulosSeleccionados.includes(titulo)) {
      // Eliminar el título de la lista de seleccionados
      this.titulosSeleccionados = this.titulosSeleccionados.filter(t => t !== titulo);
    } else {
      // Agregar el título a la lista de seleccionados
      this.titulosSeleccionados.push(titulo);
    }
  }

  generarEstadisticas() {
    // Filtra los títulos seleccionados
    const titulosSeleccionados = this.titulosFiltrados
    .filter(titulo => titulo.selected).map(titulo => titulo);
    
    // Almacena los títulos seleccionados en el servicio de selección
    this.seleccionService.agregarTitulos(titulosSeleccionados);

    // Redirige a la página de estadísticas
    this.router.navigateByUrl('/estadisticas');
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
