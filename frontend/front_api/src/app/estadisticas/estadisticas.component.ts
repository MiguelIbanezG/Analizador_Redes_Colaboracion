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
  singleAuthor: any[] = [];
  estadisticas: any[] = [];
  lineChart!: Chart;
  barChart!: Chart;
  researchers: any[] = [];
  papersWithAuthors: any[] = [];
  autoresPorPapersTable: any[] = [];
  papersPorAutoresTable: any[] = [];

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
    this.obtenerSingleAuthorPapers()
      .then(() => {
        this.obtenerDistribuciones();
      })
      .catch((error) => {
        console.error('Error al obtener los datos:', error);
      });
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
        this.statsColaboraciones();
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

  obtenerSingleAuthorPapers(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.apiService.obtenerAuthorsPapers(this.titulosSeleccionados, this.conferenceOption, this.venueName)
        .subscribe({
          next: (response: any) => {
            this.singleAuthor = response;
            this.statsSingleAuthor();
            this.generarGraficoBarras('barChart1', 'Single Author Papers', this.estadisticas[4].anios, this.estadisticas[4].porcentajes);
            resolve(); // Resuelve la Promesa para indicar que se ha completado la ejecución
          },
          error: (error: any) => {
            reject(error); // Rechaza la Promesa y pasa el error al flujo de ejecución
          }
        });
    });
  }

  obtenerDistribuciones(){
    const autoresPorPapersLabels: string[] = ['1', '2', '3', '4', '5 o más'];
    let autoresPorPapersData: number[] = [];
    const papersPorAutoresLabels: string[] = ['1', '2', '3', '4', '5 o más'];
    let papersPorAutoresData: number[] = [];
    const labels: number[] = [1, 2, 3, 4, 5]

    const numPapersPorAutor: { [key: number]: number } = {};

    this.papersWithAuthors.forEach((paper) => {
      const numAutores = paper.numAuthors;
      if (numPapersPorAutor[numAutores]) {
        numPapersPorAutor[numAutores]++;
      } else {
        numPapersPorAutor[numAutores] = 1;
      }
    });
    
    console.log("numPapersPorAutor");
    console.log(numPapersPorAutor);

    autoresPorPapersData = autoresPorPapersLabels.map((label) => {
      if (label === '5 o más') {
        return Object.values(numPapersPorAutor).slice(4).reduce((total, current) => total + current, 0);
      } else {
        return numPapersPorAutor[Number(label)] || 0;
      }
    });
    
    const numPapersPorAutores: { [key: number]: number } = {};

    this.papersWithAuthors.forEach((paper) => {
      const numAutores = paper.numAuthors;
      if (numPapersPorAutores[numAutores]) {
        numPapersPorAutores[numAutores]++;
      } else {
        numPapersPorAutores[numAutores] = 1;
      }
    });

    papersPorAutoresData = papersPorAutoresLabels.map((label) => {
      if (label === '5 o más') {
        return Object.values(numPapersPorAutores).slice(4).reduce((total, current) => total + current, 0);
      } else {
        return numPapersPorAutores[Number(label)] || 0;
      }
    });

    this.autoresPorPapersTable = autoresPorPapersLabels.map((label, index) => {
      return {
        '# autores': label,
        '# papers (%)': autoresPorPapersData[index]
      };
    });

    console.log("autoresPorPapersTable");
    console.log(this.autoresPorPapersTable);
  
    this.papersPorAutoresTable = papersPorAutoresLabels.map((label, index) => {
      return {
        '# papers (%)': label,
        '# autores': papersPorAutoresData[index]
      };
    });
    
    console.log("papersPorAutoresTable");
    console.log(this.papersPorAutoresTable);

  }

  /**
   * ############################################
   */

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
    const colabsXtotal = this.papers.map(paper => {
      const colab = this.colaboraciones.find(c => c.year === paper.year);
      return {
        year: paper.year,
        numColabs: colab ? colab.numColabs : 0,
        numPapers: paper.numPapers
      };
    });

    const densidad = colabsXtotal.map(dato => {
      const { year, numColabs, numPapers } = dato;
      const densidad = numColabs / numPapers;
      return { densidad, year };
    });

    this.estadisticas[3] = {
      anios: densidad.map(dato => dato.year),
      densidades: densidad.map(dato => dato.densidad)
    };
  }

  statsSingleAuthor() {

    // const authorsByYear: { [year: string]: number } = {};

    // this.singleAuthor.forEach((author: { numPublications: number, year: string }) => {
    // if (author.numPublications === 1) {
    //   const year = author.year;
    //   authorsByYear[year] = (authorsByYear[year] || 0) + 1;
    // }
    // });
    
    // console.log("una pub authors");
    // console.log(authorsByYear);
    
    const papersWithAuthors: { ipName: string, numAuthors: number, authorNames: string[], year: string }[] = [];

    this.singleAuthor.forEach((author: { ipNames: string[], researcher: string, year: string }) => {
      author.ipNames.forEach(ipName => {
        const paperIndex = papersWithAuthors.findIndex(paper => paper.ipName === ipName);
        if (paperIndex !== -1) {
          papersWithAuthors[paperIndex].numAuthors++;
          papersWithAuthors[paperIndex].authorNames.push(author.researcher);
        } else {
            papersWithAuthors.push({
              ipName,
              numAuthors: 1,
              authorNames: [author.researcher],
              year: author.year
            });
          }
        });
    });

    this.papersWithAuthors = papersWithAuthors;
    
    console.log("papersWithAuthors?");
    console.log(papersWithAuthors);

    const papersWithOneAuthor = papersWithAuthors.filter(paper => paper.numAuthors === 1);

    const porcentajeByYear = this.papers.map(paper => {
      const year = paper.year;
      const numPapers = paper.numPapers;
      const numPapersWithSingleAuthor = papersWithOneAuthor.filter(paper => paper.year === year).length;
      const porcentaje = (numPapersWithSingleAuthor / numPapers) * 100;
    
      return { year, porcentaje };
    });
    
    this.estadisticas[4] = {
      anios: porcentajeByYear.map(dato => dato.year),
      porcentajes: porcentajeByYear.map(dato => dato.porcentaje)
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

  generarGraficoBarras(idChart: string, label: string, labels: any[], data: any[]) {
    this.barChart = new Chart(idChart, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: data,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          }
        }
      },
    });
  }

  generarTablas(): void {
    const autoresPorPapersLabels: string[] = ['1', '2', '3', '4', '5 o más'];
    const autoresPorPapersData: number[] = this.autoresPorPapersTable.map((item) => item.numPapers);
  
    const papersPorAutoresLabels: string[] = ['1', '2', '3', '4', '5 o más'];
    const papersPorAutoresData: number[] = this.papersPorAutoresTable.map((item) => item.numAutores);
  
    const table1 = document.getElementById('table1');
    const table2 = document.getElementById('table2');
  
    if (table1 && table2) {
      table1.innerHTML = this.generateTableHTML(autoresPorPapersLabels, autoresPorPapersData);
      table2.innerHTML = this.generateTableHTML(papersPorAutoresLabels, papersPorAutoresData);
    }
  }
  
  generateTableHTML(labels: string[], data: number[]): string {
    let tableHTML = '<table>';
    tableHTML += '<tr><th># papers</th><th># autores (%)</th></tr>';
  
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      const value = data[i];
  
      tableHTML += `<tr><td>${label}</td><td>${value}</td></tr>`;
    }
  
    tableHTML += '</table>';
  
    return tableHTML;
  }

}
