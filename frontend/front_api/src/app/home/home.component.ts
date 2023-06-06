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
  titulosFiltrados: { title: string, pr_objeto: any, selected: boolean }[] = [];
  etiquetas: string[] = []; // Lista de etiquetas posibles para filtrar 
  titulosSeleccionados: any[] = []; // Lista de titulos seleccionados para generar estadisticas
  seleccionarTodos = false;

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

  obtenerNodosFiltrados() {
    this.apiService.obtenerNodosFiltrados(this.filtros).subscribe({
      next: (response: any[]) => {
        // this.resultadosFiltrados = response.map(item => JSON.stringify(item));
        this.resultadosFiltrados = response.map(item => item);

        this.titulosFiltrados = Object.values(response.reduce((obj, item) => {
          const yearNode = item.properties;
          obj[yearNode.name] = {
            title: yearNode.name,
            pr_objeto: item,
            selected: false
          };
          return obj;
        }, {}));
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

  seleccionarTodosChanged() {
    for (let titulo of this.titulosFiltrados) {
      titulo.selected = this.seleccionarTodos;
    }
  }
  
  tituloChanged() {
    let todosSeleccionados = true;
    for (let titulo of this.titulosFiltrados) {
      if (!titulo.selected) {
        todosSeleccionados = false;
        break;
      }
    }
    this.seleccionarTodos = todosSeleccionados;
  }

  generarEstadisticas() {
    // Filtra los títulos seleccionados
    const titulosSeleccionados = this.titulosFiltrados
    .filter(titulo => titulo.selected).map(titulo => titulo.pr_objeto);
    
    // Almacena los títulos seleccionados en el servicio de selección
    this.seleccionService.agregarTitulos(titulosSeleccionados);

    // Redirige a la página de estadísticas
    this.router.navigateByUrl('/estadisticas');
  }

}
