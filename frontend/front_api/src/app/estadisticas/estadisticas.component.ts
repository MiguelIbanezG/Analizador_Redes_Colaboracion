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
  estadisticas: any;
  chart!: Chart;
  researchers: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private seleccionService: SeleccionService
  ) {}

  ngOnInit() {
    Chart.register(CategoryScale);
    this.titulosSeleccionados = this.seleccionService.obtenerTitulosSeleccionados();
    this.obtenerResearchers();
  }

  ngAfterViewInit() {
  }

  obtenerResearchers() {
    console.log("en obtener researchers");
    console.log(this.titulosSeleccionados);
    this.apiService.obtenerResearchers(this.titulosSeleccionados).subscribe({
      next: (response: any) => {
        this.researchers = response;
        this.generarEstadisticas();
      },
      error: (error: any) => {
        console.error('Error al obtener los researchers:', error);
      }
    });
  }

  generarEstadisticas() {
    console.log("Researchers");
    console.log(this.researchers);
    const numResearchers = this.researchers.length;
    const anios = this.titulosSeleccionados.map(titulo => titulo.properties.name);
    console.log("años");
    console.log(anios);
    const numResearchersPorAnio = anios.map(anio =>
      this.researchers.filter(researcher => researcher.years.includes(anio)).length
    );
    console.log("numReserarcherxaño");
    console.log(numResearchersPorAnio);

    this.estadisticas = {
      anios: anios,
      numResearchers: numResearchersPorAnio
    };

    console.log("estadisticas");
    console.log(this.estadisticas);
    this.generarGrafico();
  }

  generarGrafico() {
    const canvas: HTMLCanvasElement | null = this.chartCanvas.nativeElement;
    const ctx: CanvasRenderingContext2D | null = canvas ? canvas.getContext('2d') : null;
    console.log("estadisticas dentro de geerar");
    console.log(this.estadisticas);

    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: 'Número de Researchers',
              data: this.estadisticas.anios.map((anio: string, index: number) => ({
                x: anio,
                y: this.estadisticas.numResearchers[index]
              })),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: 'Años'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Número de Researchers'
              }
            }
          }
        }
      });
    }
  }
  
}
