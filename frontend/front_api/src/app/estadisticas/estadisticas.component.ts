import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { SeleccionService } from '../seleccion.service';
import { Chart, CategoryScale, LineController  } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

//Interfaz para los graficos, para el multiple
interface Dataset {
  label: string;
  data: number[];
  fill: boolean;
  borderColor: string;
  yAxisID: string;
}
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
  commonNames: { [key: string]: { frec_paises: { [key: string]: number }, genero: string } } = {};

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private seleccionService: SeleccionService,
    private http: HttpClient
  ) {}

  loadCommonNames() {
    this.http.get('assets/common_names.txt', { responseType: 'text' }).subscribe(
      (data: string) => {
        this.commonNames = this.parseCommonNames(data);
      },
      (error: any) => {
        console.error('Error al cargar los datos:', error);
      }
    );
  }

  parseCommonNames(data: string) {
    const lineas = data.split('\n');
    const diccionario: { [key: string]: { frec_paises: { [key: string]: number }, genero: string } } = {};
    let nombreActual = '';
    let datosActuales: { frec_paises: { [key: string]: number }, genero: string } = {
      frec_paises: {},
      genero: ''
    };
  
    for (const linea of lineas) {
      if (linea.startsWith('nombre:')) {
        nombreActual = linea.split(':')[1].trim();
        datosActuales = { frec_paises: {}, genero: '' };
      } else if (linea.startsWith('frec_paises:')) {
        const frec_paisesStr = linea.substring(linea.indexOf('{'), linea.lastIndexOf('}') + 1);
        const frec_paises = JSON.parse(frec_paisesStr);
        datosActuales.frec_paises = frec_paises;
      } else if (linea.startsWith('genero:')) {
        datosActuales.genero = linea.split(':')[1].trim();
      } else if (linea.trim() === '') {
        diccionario[nombreActual] = datosActuales;
      }
    }
    return diccionario;
  }

  ngOnInit() {
    this.loadCommonNames();
    //LLamada a la funcion principal para la ejecucion de todo
    this.main();
  }

  ngAfterViewInit() {
    // Este método se ejecutará después de que Angular haya inicializado la vista
    // Perfe para realizar cualquier manipulación adicional del DOM relacionada con el gráfico
    // como ajustes de estilo, cambios dinámicos en los datos, etc.
  }

  async obtenerResearchers() {
    this.apiService.obtenerResearchers(this.titulosSeleccionados).subscribe({
      next: (response: any) => {
        this.researchers = response;
        this.statsResearchers();
        console.log("RESEARCHERS");
        console.log(this.researchers);
        this.generarGrafico3('lineChart1', 'Número de investigadores', this.estadisticas[0].anios, this.estadisticas[0].numResearchers);
      },
      error: (error: any) => {
        console.error('Error al obtener los researchers:', error);
      }
    });
  }

  async obtenerPapers() {
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

  async obtenerColaboraciones() {
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

  async obtenerInstituciones(){
    // que son las instituciones?
  }

  async obtenerSingleAuthorPapers(): Promise<void> {
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

  async obtenerDistribuciones(){
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
  
    this.papersPorAutoresTable = papersPorAutoresLabels.map((label, index) => {
      return {
        '# papers (%)': label,
        '# autores': papersPorAutoresData[index]
      };
    });

  }

  async obtenerDatosDemograficos(): Promise<void> {
    return new Promise<void>((resolve, reject) => {

      const datasets = this.researchers.map(researcher => {
        let nombre = researcher.researcher.properties.name.split(' ')[0];
        if(nombre.includes("-")){
          nombre = nombre.split('-')[0];
        }
        const anios = Array.isArray(researcher.years) ? researcher.years : [researcher.years];
      
        const datasetPorAnio = anios.map((year: any) => {
          const info = this.commonNames[nombre];
          const genero = info ? info.genero : 'Desconocido';
          const frecuencias = info ? info.frec_paises : {};
      
          return {
            year,
            nombre,
            genero,
            frecuencias
          };
        });
        return datasetPorAnio;
      }).flat();
      
      console.log("dataset?")
      console.log(datasets);    

      this.statsGenero(datasets);
      this.statsGeografia(datasets);
      //this.generarGraficoMultiple('lineChart4', ['Hombres', 'Mujeres'], [this.estadisticas[5].anios, this.estadisticas[6].anios], [this.estadisticas[5].conteo, this.estadisticas[6].conteo]);
    
    });
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

  statsGenero(datasets: any[]){
    const datasetsPorGenero: { [genero: string]: { year: string; count: number }[] } = {};

      datasets.forEach((data: { year: any; genero: any; }) => {
        const { year, genero } = data;
        
        let genderKey = '';
        
        if (genero == 'M' || genero == '?M' || genero == '1M' || genero == '?') {
          genderKey = 'Hombres';
        } else if (genero == 'F' || genero == '?F' || genero == '1F') {
          genderKey = 'Mujeres';
        } else{
          genderKey = 'Desconocido';
        }
        
        if (!datasetsPorGenero[genderKey]) {
          datasetsPorGenero[genderKey] = [];
        }
        
        const existingData = datasetsPorGenero[genderKey].find(d => d.year === year);
        
        if (existingData) {
          existingData.count++;
        } else {
          datasetsPorGenero[genderKey].push({
            year,
            count: 1
          });
        }
      });

      // Crear un objeto para almacenar los datos ordenados
      const datosOrdenados: { [anio: string]: { hombres?: number; mujeres?: number } } = {};
      const hombres = datasetsPorGenero['Hombres'];
      const mujeres = datasetsPorGenero['Mujeres'];

      // Ordenar los datos de hombres
      hombres.forEach(dato => {
        const anio = dato.year;
        const conteo = dato.count;

        datosOrdenados[anio] = { hombres: conteo };
      });

      // Ordenar los datos de mujeres y combinarlos con los datos de hombres
      mujeres.forEach(dato => {
        const anio = dato.year;
        const conteo = dato.count;

        if (datosOrdenados[anio]) {
          datosOrdenados[anio].mujeres = conteo;
        } else {
          datosOrdenados[anio] = { mujeres: conteo };
        }
      });

      // Obtener los años ordenados
      const aniosOrdenados = Object.keys(datosOrdenados).sort();


      const conteosHombres = aniosOrdenados.map(anio => datosOrdenados[anio].hombres);
      const conteosMujeres = aniosOrdenados.map(anio => datosOrdenados[anio].mujeres);
      
      this.generarGraficoMultiple('lineChart4', aniosOrdenados, ['Hombres', 'Mujeres'], [conteosHombres, conteosMujeres]);

  }

  statsGeografia(datasets: any[]){
    const mapeoFecha: {[fecha: string]: {[pais: string]: number}} = {};
    const datasetFiltrado = datasets.filter((objeto: any) => Object.keys(objeto.frecuencias).length > 0);
    
    // Obtener todas las fechas únicas
    const fechasUnicas = [...new Set(datasetFiltrado.map(dato => dato.year))];
    console.log("fechasUnicas");
    console.log(fechasUnicas);

    // Iterar sobre las fechas
    for (const fecha of fechasUnicas) {
      const objetosFecha = datasetFiltrado.filter(dato => dato.year === fecha);

      // Crear objeto de mapeo para la fecha actual
      mapeoFecha[fecha] = {};
  
    for (const objeto of objetosFecha) {
      let paisMasAlto = '';
      let frecuenciaMasAlta = -1;

      for (const pais in objeto.frecuencias) {
          if (objeto.frecuencias[pais] > frecuenciaMasAlta) {
            paisMasAlto = pais;
            frecuenciaMasAlta = objeto.frecuencias[pais];
          }
        }
        if(!(paisMasAlto in mapeoFecha[fecha])){
          mapeoFecha[fecha][paisMasAlto] = 1;
        }else{
          mapeoFecha[fecha][paisMasAlto] = mapeoFecha[fecha][paisMasAlto] + 1;
        }
      }
    }

    console.log("mapeo fecha ????");
    console.log(mapeoFecha);

    const years = Object.keys(mapeoFecha); // Obtener las llaves de los años
    const countries = Object.keys(mapeoFecha[years[0]]); // Obtener los nombres de los países
    const datasetsLabels = countries; // Etiquetas de los conjuntos de datos serán los nombres de los países

    // Crear la matriz de datos para los países
    const datasetsData = countries.map((country) =>
      years.map((year) => mapeoFecha[year][country])
    );

    this.generarGraficoMultiple('lineChart5', years, datasetsLabels, datasetsData);
    
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

  generarGraficoMultiple(idChart: string, labels: string[], datasetsLabels: string[], datasetsData: any[][]) {
    const ctx = document.getElementById(idChart) as HTMLCanvasElement;
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasetsLabels.map((label, index) => ({
          label: label,
          data: datasetsData[index],
          fill: false,
          borderColor: this.getRandomColor(index),
          tension: 0.4
        }))
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Gráfico de línea múltiple'
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Años'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Conteo'
            }
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

  getRandomColor(index: number) {
    let colors: Record<number, string> = {
      0: "rgba(75, 192, 192, 1)",
      1: "rgba(192, 75, 75, 1)",
      2: "rgba(98, 192, 75, 1)", 
      3: "rbga(192, 141, 75, 1)",
      4: "rgba(226, 232, 107, 1)",
      5: "rgba(176, 75, 192, 1)"
    };

    return colors[index];
  }

  async main(){
    try {
      this.titulosSeleccionados = this.seleccionService.obtenerTitulosSeleccionados();
      this.conferenceOption = this.seleccionService.obtenerOpcionConferencia();
      this.venueName = this.seleccionService.obtenerNombreVenue();

      this.obtenerPapers();
      this.obtenerColaboraciones();
      this.obtenerSingleAuthorPapers();

      await this.obtenerResearchers();

      while (this.researchers.length === 0) {
        // Esperar hasta que this.researchers tenga valores
        await new Promise(resolve => setTimeout(resolve, 100)); 
      }
      
      await this.obtenerDistribuciones();
      await this.obtenerDatosDemograficos();
  } catch (error) {
    console.error('Error al obtener los datos:', error);
  }
  }

}