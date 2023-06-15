import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { SeleccionService } from '../seleccion.service';
import { Chart, CategoryScale  } from 'chart.js';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  titulosSeleccionados: any[] = [];
  numPapers: number = 0;
  estadisticas: any[] = [];
  lineChart!: Chart;
  researchers: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private seleccionService: SeleccionService
  ) {}

  ngOnInit() {
    this.titulosSeleccionados = this.seleccionService.obtenerTitulosSeleccionados();
    this.obtenerResearchers();
  }

  ngAfterViewInit() {
    // Este método se ejecutará después de que Angular haya inicializado la vista
    // Perfe para realizar cualquier manipulación adicional del DOM relacionada con el gráfico
    // como ajustes de estilo, cambios dinámicos en los datos, etc.
  }

  obtenerResearchers() {
    this.apiService.obtenerResearchers(this.titulosSeleccionados).subscribe({
      next: (response: any) => {
        this.researchers = response;
        this.statsResearchers();
        this.generarGrafico1();
      },
      error: (error: any) => {
        console.error('Error al obtener los researchers:', error);
      }
    });
  }

  obtenerPapers() {
    this.apiService.obtenerPapers(this.titulosSeleccionados).subscribe({
      next: (response: any) => {
        this.numPapers = response;
        this.statsPapers();
        this.generarGrafico2();
      },
      error: (error: any) => {
        console.error('Error al obtener los researchers:', error);
      }
    });
  }

  statsResearchers() {
    const numResearchers = this.researchers.length;
    const anios = this.titulosSeleccionados.map(titulo => titulo.properties.name);
    const numResearchersPorAnio = anios.map(anio =>
      this.researchers.filter(researcher => researcher.years.includes(anio)).length
    );
    this.estadisticas[0] = {
      anios: anios,
      numResearchers: numResearchersPorAnio
    };
  }

  statsPapers() {
    const numPapers = this.researchers.length;
    const anios = this.titulosSeleccionados.map(titulo => titulo.properties.name);
    const numResearchersPorAnio = anios.map(anio =>
      this.researchers.filter(researcher => researcher.years.includes(anio)).length
    );
    this.estadisticas[0] = {
      anios: anios,
      numResearchers: numResearchersPorAnio
    };
  }

  generarGrafico1() {
    this.lineChart = new Chart('lineChart', {
      type: 'line',
      data: {
        labels: this.estadisticas[0].anios,
        datasets: [
          {
            label: 'Número de investigadores',
            data: this.estadisticas[0].numResearchers,
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          y: {
            display: true
          }
        }
      }
    });
  }

  generarGrafico2() {
    this.lineChart = new Chart('lineChart', {
      type: 'line',
      data: {
        labels: this.estadisticas[0].anios,
        datasets: [
          {
            label: 'Número de investigadores',
            data: this.estadisticas[0].numResearchers,
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          y: {
            display: true
          }
        }
      }
    });
  }
  
}
