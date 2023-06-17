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
  conferenceOption: string = "";
  venueName: string = "";
  papers: any[] = [];
  colaboraciones: any[] = [];
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
    this.conferenceOption = this.seleccionService.obtenerOpcionConferencia();
    this.venueName = this.seleccionService.obtenerNombreVenue();
    this.obtenerResearchers();
    this.obtenerPapers();
    this.obtenerColaboraciones();
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
        this.generarGrafico3('lineChart1', 'Número de investigadores', this.estadisticas[0].anios, this.estadisticas[0].numResearchers);
      },
      error: (error: any) => {
        console.error('Error al obtener los researchers:', error);
      }
    });
  }

  obtenerPapers() {
    this.apiService.obtenerPapers(this.titulosSeleccionados, this.conferenceOption, this.venueName).subscribe({
      next: (response: any) => {
        this.papers = response;
        this.statsPapers();
        this.generarGrafico3('lineChart2', 'Número de papers', this.estadisticas[1].anios, this.estadisticas[1].numPapers);
      },
      error: (error: any) => {
        console.error('Error al obtener los papers:', error);
      }
    });
  }

  obtenerColaboraciones() {
    this.apiService.obtenerColaboraciones(this.titulosSeleccionados, this.conferenceOption, this.venueName).subscribe({
      next: (response: any) => {
        this.colaboraciones = response;
        console.log("colaboraciones");
        console.log(this.colaboraciones);
        this.statsColaboraciones();
        console.log("stats3");
        console.log(this.estadisticas[3]);
        this.generarGrafico3('lineChart3', 'Densidad', this.estadisticas[3].anios, this.estadisticas[3].densidades);
      },
      error: (error: any) => {
        console.error('Error al obtener las colaboraciones:', error);
      }
    });
  }

  obtenerInstituciones(){
    // que son las instituciones?
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
    const anios = this.papers.map(paper => paper.year); // Extraer los años de this.numPapers
    const numPapers = this.papers.map(paper => paper.numPapers); 

    this.estadisticas[1] = {
      anios: anios,
      numPapers: numPapers
    };
  }  
  
  statsInstitutions() {
    const anios = this.papers.map(paper => paper.year); 
    // Extraer los años de this.numPapers
    // const numPapers = this.papers.map(paper => paper.numPapers); 

    this.estadisticas[2] = {
      anios: anios,
      numPapers: anios
    };
  }

  statsColaboraciones(){
    
    const colaboracionesPorAnio = this.colaboraciones.reduce((map, colaboracion) => {
      const { numColabs, year } = colaboracion;
      if (!map.has(year)) {
        map.set(year, { numColabs, numPapers: 0 });
      }
      return map;
    }, new Map());
    console.log("colabsxaño");
    console.log(colaboracionesPorAnio);
    
    const papersPorAnio = this.papers.reduce((map, paper) => {
      const { numPapers, year } = paper;
      if (map.has(year)) {
        map.get(year).numPapers = numPapers;
      } else {
        map.set(year, { numColabs: 0, numPapers });
      }
      return map;
    }, colaboracionesPorAnio);

    console.log("papersxaño");
    console.log(papersPorAnio);
    
    const densidades = [];
    for (const [year, { numColabs, numPapers }] of colaboracionesPorAnio.entries()) {
      const densidad = numColabs / numPapers;
      densidades.push({ year, densidad });
    }

    const anios = densidades.map(densidad => densidad.year);
    const densidad = densidades.map(densidad => densidad.densidad);
    
    this.estadisticas[3] = {
      anios: anios,
      densidades: densidad
    };
  }

  generarGrafico3(idChart: string, label: string, labels: any[], data: any[]) {
    this.lineChart = new Chart(idChart, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: data,
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
