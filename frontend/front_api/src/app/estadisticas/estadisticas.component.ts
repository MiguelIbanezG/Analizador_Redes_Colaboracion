import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { SeleccionService } from '../seleccion.service';
//import { Chart, CategoryScale, LineController  } from 'chart.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { CloudData, CloudOptions } from 'angular-tag-cloud-module';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css'],
  template: `
    <div>
      <angular-tag-cloud
        [data]="data"
        [width]="options.width"
        [height]="options.height"
        [overflow]="options.overflow">
      </angular-tag-cloud>
    </div>
  `
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
  options: CloudOptions = {
    // if width is between 0 and 1 it will be set to the width of the upper element multiplied by the value
    width: 1000,
    // if height is between 0 and 1 it will be set to the height of the upper element multiplied by the value
    height: 400,
    overflow: false,
    realignOnResize: false,
    strict: false,
    step: 2,
  };
  cloudData: CloudData[] = []

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

  async esperarResearcherNoVacio() {
    while (!this.researchers || this.researchers.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Esperar 100 milisegundos antes de volver a verificar
    }
  }

  async obtenerResearchers() {
    this.apiService.obtenerResearchers(this.titulosSeleccionados).subscribe({
      next: async (response: any) => {
        this.researchers = response;
        this.statsResearchers();
        this.generarGrafico3('lineChart1', 'Número de investigadores', this.estadisticas[0].anios, this.estadisticas[0].numResearchers);
      
        await this.esperarResearcherNoVacio();

        // Para ejecutar las siguientes se necesita this.researchers con valores
        console.log("researchers antes de las culpables");
        console.log(this.researchers);
        this.obtenerDistribuciones();
        this.obtenerDatosDemograficos();
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

  obtenerSingleAuthorPapers() {
      this.apiService.obtenerAuthorsPapers(this.titulosSeleccionados, this.conferenceOption, this.venueName)
        .subscribe({
          next: (response: any) => {
            this.singleAuthor = response;
            this.statsSingleAuthor();
            this.generarGraficoBarras('barChart1', 'Single Author Papers', this.estadisticas[4].anios, this.estadisticas[4].porcentajes);
            
            // ahora stats de topicos porque se necesita this.authorswithpapers y solo se guarda despues de statsSingleAuthor
            this.obtenerTopicAnalisis();

          },
          error: (error: any) => {
            console.error('Error al obtener los Author Papers:', error);
          }
        });
  }

  obtenerDistribuciones(){
    console.log("distribuciones antes o despues?");
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

  obtenerDatosDemograficos(){
    console.log("demograficos antes o despues?");
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

      this.statsGenero(datasets);
      this.statsGeografia(datasets);
  }

  generarNGrams(titles: string[], n: number): string[] {
    const ngrams: string[] = [];
    titles.forEach((title) => {
      const words = title.toLowerCase().split(" ");
      for (let i = 0; i < words.length - n + 1; i++) {
        ngrams.push(words.slice(i, i + n).join(" "));
      }
    });
    return ngrams;
  }
  
  countFrequencies(ngrams: string[]): Map<string, number> {
    const frequencies = new Map<string, number>();
    ngrams.forEach((ngram) => {
      const count = frequencies.get(ngram) || 0;
      frequencies.set(ngram, count + 1);
    });
    return frequencies;
  }

  limpiarTitulo(titulo: string, stopwords: string[]) {
    // Separar el título en palabras
    const palabras = titulo.toLowerCase().split(" ").map(palabra => palabra.replace(/[^\w\s]/g, ""));

    //const palabrasSingulares = palabras.map(palabra => pluralize.singular(palabra));
    // Filtrar las palabras para eliminar las stopwords
    const palabrasFiltradas = palabras.filter(palabra => !stopwords.includes(palabra));
  
    // Unir las palabras filtradas en un nuevo título
    const nuevoTitulo = palabrasFiltradas.join(' ');
  
    return nuevoTitulo;
  }

  getTopN(frequencies: Map<string, number>, n: number): [string, number][] {
    const sortedFrequencies = [...frequencies.entries()].sort((a, b) => b[1] - a[1]);
    return sortedFrequencies.slice(0, n);
  }

  obtenerTopicAnalisis(){

      // Requerimos natural para tokenizar y eliminar las stopwords, y calcular frecuencias
      const stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', '.', ','];

      const titulosLimpios = this.papersWithAuthors.map(paper => {
        const ipName = this.limpiarTitulo(paper.ipName, stopwords);
        const year = parseInt(paper.year);
        return { ipName, year };
      });

      const bigrams = this.generarNGrams(titulosLimpios.map((paper) => paper.ipName), 2);
      const trigrams = this.generarNGrams(titulosLimpios.map((paper) => paper.ipName), 3);

      const bigramFrequencies = this.countFrequencies(bigrams);
      const trigramFrequencies = this.countFrequencies(trigrams);

      const top20Bigrams = this.getTopN(bigramFrequencies, 20);
      const top20Trigrams = this.getTopN(trigramFrequencies, 20);

      
      console.log("bigrams");
      console.log(top20Bigrams);
      console.log("trigrams");
      console.log(top20Trigrams);
    
      const top20BigramsWithYears = top20Bigrams.map(([ngram, count]) => ({
        ngram,
        count,
        years: titulosLimpios.filter((paper) => paper.ipName.includes(ngram)).map((paper) => paper.year),
      }));
    
      const top20TrigramsWithYears = top20Trigrams.map(([ngram, count]) => ({
        ngram,
        count,
        years: titulosLimpios.filter((paper) => paper.ipName.includes(ngram)).map((paper) => paper.year),
      }));

      const table1 = document.querySelector('#tablaBigramas tbody');
      const table2 = document.querySelector('#tablaTrigramas tbody');
    
      if (table1 instanceof HTMLElement && table2 instanceof HTMLElement) {
        top20BigramsWithYears.forEach(({ ngram, count, years }) => {
          const minYear = Math.min(...years);
          const maxYear = Math.max(...years);
      
          const row = document.createElement('tr');
          row.innerHTML = `<td>${ngram}</td><td>${count}</td><td>${minYear}</td><td>${maxYear}</td>`;
      
          table1.appendChild(row);
        });
      
        top20TrigramsWithYears.forEach(({ ngram, count, years }) => {
          const minYear = Math.min(...years);
          const maxYear = Math.max(...years);
      
          const row = document.createElement('tr');
          row.innerHTML = `<td>${ngram}</td><td>${count}</td><td>${minYear}</td><td>${maxYear}</td>`;
      
          table2.appendChild(row);
        });
      }

      const combinedData = [...top20BigramsWithYears, ...top20TrigramsWithYears];
      
      combinedData.sort((a, b) => b.count - a.count);

      const maxCount = combinedData[0].count;

      const wordCloudData = combinedData.map((item, index) => ({
        text: item.ngram,
        weight: item.count * Math.exp(-0.1 * index),
        color: this.randomColor()
      }));

      console.log("wordcloud data");
      console.log(wordCloudData);

      if(wordCloudData.length > 200){
        this.cloudData = wordCloudData.slice(0,200);
      }else{
        this.cloudData = wordCloudData;
      }
      // this.cloudData = 
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
            type: 'linear',
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
            beginAtZero: true
          }
        }
      }
    });
  }

  generarWordCloud(data: { [key: string]: number }): void {
    
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

  randomColor(){
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 1)`;
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
  main(){
    try {
      this.titulosSeleccionados = this.seleccionService.obtenerTitulosSeleccionados();
      this.conferenceOption = this.seleccionService.obtenerOpcionConferencia();
      this.venueName = this.seleccionService.obtenerNombreVenue();

      this.obtenerPapers();
      this.obtenerColaboraciones();
      this.obtenerSingleAuthorPapers();

      this.obtenerResearchers();

  } catch (error) {
    console.error('Error al obtener los datos:', error);
  }
  }

}