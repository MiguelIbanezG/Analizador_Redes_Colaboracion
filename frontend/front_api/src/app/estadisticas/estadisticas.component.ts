import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { SeleccionService } from '../seleccion.service';



@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit{
  titulosSeleccionados: any[] = [];
  estadisticas: any;

  constructor(
    private route: ActivatedRoute, 
    private apiService: ApiService,
    private seleccionService: SeleccionService  
  ) {}

  ngOnInit() {
  //   const titulosSeleccionados = this.seleccionService.obtenerTitulosSeleccionados();
    
  //   // Llama al método de generación de estadísticas en el servicio ApiService
  //   this.apiService.generarEstadisticas(titulosSeleccionados).subscribe({
  //     next: (response: any) => {
  //       this.estadisticas = response;
  //     },
  //     error: (error: any) => {
  //       console.error('Error al generar estadísticas:', error);
  //     }
  //   });
  // }
    this.titulosSeleccionados = this.seleccionService.obtenerTitulosSeleccionados();
    this.generarEstadisticas();
  }

  generarEstadisticas() {
    const titulosSeleccionados = this.titulosSeleccionados.map(titulo => titulo.objeto);
    this.apiService.generarEstadisticas(titulosSeleccionados).subscribe({
      next: (response: any) => {
        this.estadisticas = response;
      },
      error: (error: any) => {
        console.error('Error al generar las estadísticas:', error);
      }
    });
  }
}
