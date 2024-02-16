import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { StadisticsService } from '../services/stadistics.service';
//import { Chart, CategoryScale, LineController  } from 'chart.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { HttpClient } from '@angular/common/http';
import { CloudData, CloudOptions } from 'angular-tag-cloud-module';
import { singular } from 'pluralize';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';

interface Author {
  ipNames: string[];
  numPublications: number;
  researcher: string;
  year: string;
}

interface DecadeStats {
  label: string;
  startYear: number;
  endYear: number;
  authors: Author[];
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})

export class StatisticsComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  selectedTitles: any[] = [];
  selectedYears: any[] = [];
  conferenceOption: string = "";
  venueName: any[] = [];
  papers: any[] = [];
  collaborations: any[] = [];
  connectedComponents: any[] = [];
  singleAuthor: any[] = [];
  statistics: any[] = [];
  lineChart!: Chart;
  lineChart2!: Chart;
  barChart!: Chart;
  researchers: any[] = [];
  researchers2: any[] = [];
  papersWithAuthors: any[] = [];
  decadeStats: any[] = [];
  commonNames: { [key: string]: { frec_paises: { [key: string]: number }, genero: string } } = {};
  options: CloudOptions = {
    width: 500,
    height: 200,
    overflow: false,
    realignOnResize: false,
    strict: false,
    step: 2,
  };
  cloudData: CloudData[] = []

  constructor(
    private apiService: ApiService,
    private stadisticsService: StadisticsService,
    private http: HttpClient
  ) {}


  ngOnInit() {
    this.loadCommonNames();
    this.main();
  }

  ngAfterViewInit() {
    // Este método se ejecutará después de que Angular haya inicializado la vista
    // Perfe para realizar cualquier manipulación adicional del DOM relacionada con el gráfico
    // como ajustes de estilo, cambios dinámicos en los datos, etc.
  }

  async waitResearcherNoEmpty() {
    while (!this.researchers || this.researchers.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100)); 
    }
  }

  getSchools() {
    this.apiService.getSchools().subscribe({
      next: (response: any[]) => {
        this.researchers2 = response;
        const table = document.querySelector('#tableInstitution tbody');
        if (table instanceof HTMLElement) {
          this.researchers2.forEach(({ School, NumberOfAuthors, Country }) => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${School}</td><td>${NumberOfAuthors}</td><td style="padding-left: 100px">${Country}</td>`;
      
            table.appendChild(row);
          });
        }
      },
      error: (error: any) => {
        console.error('Error in getSchools:', error);
      }
    });
  }

  getResearchersConference() {
    this.apiService.getResearchersConference(this.selectedTitles).subscribe({
      next: (response: any) => {
        this.researchers = response;
        this.statsResearchers();
        this.combineAndShowData(this.statistics[0].years, this.statistics[0].numResearchers);
      },
      error: (error: any) => {
        console.error('Error in getResearchersConference:', error);
      }
    });
    if(this.researchers.length < 1){
      this.apiService.getResearchersJournals(this.selectedTitles).subscribe({
        next: (response: any) => {
          this.researchers = response;
          this.statsResearchers();
          this.combineAndShowData(this.statistics[0].years, this.statistics[0].numResearchers);
        },
        error: (error: any) => {
          console.error('Error in getResearchersJournals:', error);
        }
      });
    }
    
  }

  combineAndShowData(researchersConference: any[], researchersJournals: any[]) {
    
    if(this.lineChart){
      this.lineChart.destroy();
    }
  
    this.generateChart3('lineChart1', 'Number of authors', researchersConference, researchersJournals);

  }

  getPapers() {
    this.apiService.getPapers(this.selectedTitles, this.conferenceOption, this.venueName).subscribe({
      next: (response: any) => {
        
        this.papers = response;
        this.statsPapers();
        this.generateChart3('lineChart2', 'Number of papers', this.statistics[1].years, this.statistics[1].numPapers);
      },
      error: (error: any) => {
        console.error('Error in getPapers:', error);
      }
    });
  }

  getCollaborations() {
    this.apiService.getCollaborations(this.selectedTitles, this.conferenceOption, this.venueName).subscribe({
      next: (response: any) => {
        this.collaborations = response;
        this.statsColaboraciones();
        this.generateChart3('lineChart3', 'Density', this.statistics[3].years, this.statistics[3].densidades);
      },
      error: (error: any) => {
        console.error('Error in getCollaborations:', error);
      }
    });
  }

  getConnectedComponents(){
    this.apiService.getConnectedComponents(this.selectedTitles, this.venueName).subscribe({
      next: (response: any) => {
        this.connectedComponents = response;
        console.log(response);
        console.log(this.connectedComponents);
        this.statsConnectedComponents();
        this.generateChart3('lineChart11', 'Number of Connected Components', this.statistics[5].years, this.statistics[5].connectedComponents);
      },
      error: (error: any) => {
        console.error('Error in getConnectedComponents:', error);
      }
    });
  }

  getConnectedComponentsByvenue(){
    this.apiService.getConnectedComponentsByvenue(this.selectedTitles, this.venueName).subscribe({
      next: (response: any) => {
        this.connectedComponents = response;
        console.log(response);
        console.log(this.connectedComponents);
        this.statsConnectedComponentsByvenue();
        this.generateChart4('lineChart12', 'Number of Connected Components', this.statistics[6]);
        this.generateChart4('lineChart13', 'Number of Connected Components', this.statistics[7]);
        
      },
      error: (error: any) => {
        console.error('Error in getConnectedComponents:', error);
      }
    });
  }


  async waitAuthorsWithPapersNoEmpty(){
    while (!this.papersWithAuthors || this.papersWithAuthors.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100)); 
    }
  }

  async waitSingleAuthorsNoEmpty(){
    while (!this.singleAuthor || this.singleAuthor.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100)); 
    }
  }

  getAuthorsPapers() {
      this.apiService.getAuthorsPapers(this.selectedTitles, this.conferenceOption, this.venueName)
        .subscribe({
          next: async (response: any) => {
            this.singleAuthor = response;
            this.statsSingleAuthor();
            this.generateBarChart('barChart1', 'Single Author Papers', this.statistics[4].years, this.statistics[4].porcentajes);          
          },
          error: (error: any) => {
            console.error('Error in getAuthorsPapers:', error);
          }
        });
  }

  /**Function to obtain the distributions of both authors by papers and papers by authors
   * 
   */
  getDistributions(){
    const labels: string[] = ['1', '2', '3', '4', '5 o más'];

    // This represents the number of authors that each paper has.
    const authorsByPaper: number[] = [1, 2, 3, 4].map((numAuthors) =>
    this.papersWithAuthors.filter((paper) => paper.numAuthors === numAuthors).length
    );
    authorsByPaper[4] = this.papersWithAuthors.filter((paper) => paper.numAuthors >= 5).length;
    let allPapers = this.papers.reduce((all, paper) => all + paper.numPapers, 0);

    // This represents the number of published papers that each author has.
    const papersByAuthor: number[] = [1, 2, 3, 4].map((numPubs) =>
    this.singleAuthor.filter((paper) => paper.numPublications === numPubs).length
    );
    papersByAuthor[4] = this.singleAuthor.filter((paper) => paper.numPublications >= 5).length
    const allAuthors = this.singleAuthor.length;

    // We create the two tables that are linked with the ids of the html
    const authorsTable = document.querySelector('#authorsTable tbody');
    const papersTable = document.querySelector('#papersTable tbody');
    
    if (authorsTable !== null) {
      authorsByPaper.forEach((amount, index) => {
        const row = document.createElement('tr');
        const percentage = (amount / allPapers * 100).toFixed(2);
        const worth = amount.toString() + "(" + percentage + ")";
        row.innerHTML = `<td>${labels[index]}</td><td>${worth}</td>`;
        authorsTable.appendChild(row);
      });
    }

    if (papersTable !== null) {
      papersByAuthor.forEach((amount, index) => {
        const row = document.createElement('tr');
        const percentage = (amount / allAuthors * 100).toFixed(2);
        const worth = amount.toString() + "(" + percentage + ")";
        row.innerHTML = `<td>${labels[index]}</td><td>${worth}</td>`;
        papersTable.appendChild(row);
      });
    }
  }

  getDemographicData(){
      const datasets = this.researchers.map(researcher => {
        let name = researcher.researcher.properties.name.split(' ')[0];
        if(name.includes("-")){
          name = name.split('-')[0];
        }
        const years = Array.isArray(researcher.years) ? researcher.years : [researcher.years];
      
        const datasetByYear = years.map((year: any) => {
          const info = this.commonNames[name];
          const genero = info ? info.genero : 'Unknown';
          const frecuencias = info ? info.frec_paises : {};
      
          return {
            year,
            name,
            genero,
            frecuencias
          };
        });
        return datasetByYear;
      }).flat(); 

      this.statsGender(datasets);
      this.statsGeography(datasets);
  }

  generateNGrams(titles: string[], n: number): string[] {
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

  clearTitle(title: string, stopwords: string[]) {
    // Separate the title into words
    const words = title.toLowerCase().split(" ").map(word => word.replace(/[^\w\s]/g, ""));

    // We eliminate repetitions of letters and plurals to improve frequency
    const wordsNoRepeat = words.map(word => word.replace(/(.)\1+/g, "$1"));
    const singularWords = wordsNoRepeat.map(word => singular(word));
    
    // Filter words to remove stopwords
    const filteredWords = singularWords.filter(word => !stopwords.includes(word));
  
    // Join the filtered words into a new title
    const newTitle = filteredWords.join(' ');
    
    return newTitle;
  }

  getTopN(frequencies: Map<string, number>, n: number): [string, number][] {
    const sortedFrequencies = [...frequencies.entries()].sort((a, b) => b[1] - a[1]);
    return sortedFrequencies.slice(0, n);
  }

  getTopicAnalysis(){

      // We require natural to tokenize and remove stopwords, and calculate frequencies
      const stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', '.', ','];

      const cleanTitles = this.papersWithAuthors.map(paper => {
        const ipName = this.clearTitle(paper.ipName, stopwords);
        const year = parseInt(paper.year);
        return { ipName, year };
      });

      const bigrams = this.generateNGrams(cleanTitles.map((paper) => paper.ipName), 2);
      const trigrams = this.generateNGrams(cleanTitles.map((paper) => paper.ipName), 3);

      const bigramFrequencies = this.countFrequencies(bigrams);
      const trigramFrequencies = this.countFrequencies(trigrams);

      const top20Bigrams = this.getTopN(bigramFrequencies, 20);
      const top20Trigrams = this.getTopN(trigramFrequencies, 20);

    
      const top20BigramsWithYears = top20Bigrams.map(([ngram, count]) => ({
        ngram,
        count,
        years: cleanTitles.filter((paper) => paper.ipName.includes(ngram)).map((paper) => paper.year),
      }));
    
      const top20TrigramsWithYears = top20Trigrams.map(([ngram, count]) => ({
        ngram,
        count,
        years: cleanTitles.filter((paper) => paper.ipName.includes(ngram)).map((paper) => paper.year),
      }));

      const table1 = document.querySelector('#tableBigramas tbody');
      const table2 = document.querySelector('#tableTrigramas tbody');
    
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

      const maxFrecuencia = combinedData[0].count;
      const minWeight = 0;
      const maxWeight = 20;


      const wordCloudData = combinedData.map((item, index) => ({
        text: item.ngram,
        weight: this.calculateWeight(item.count, maxFrecuencia, minWeight, maxWeight),
        color: this.randomColor()
      }));

      this.cloudData = wordCloudData;
     
  }

  generateTablesDecades() {
    const table = document.querySelector('#tableInstitution tbody');
    if (table instanceof HTMLElement) {
      this.researchers2.forEach(({ School, NumberOfAuthors, Country }) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${School}</td><td>${NumberOfAuthors}</td><td>${Country}</td>`;
  
        table.appendChild(row);
      });
    }
  }
  
  calculateWeight(frec: number, maxFrec: number, minWeight: number, maxWeight: number): number {
    const weight = frec / maxFrec;
    const normWeight = weight * (maxWeight - minWeight) + minWeight;
    return Math.round(normWeight);
  }

  /**
   * ############################################
   */

  statsResearchers() {
    const years = this.selectedTitles.map(titulo => titulo.properties.name);
    this.selectedYears = years;

    const numResearchersPorAnio = years.map(anio =>
      this.researchers.filter(researcher => researcher.years.includes(anio)).length
    );
    this.statistics[0] = {
      years: years,
      numResearchers: numResearchersPorAnio
    };
  }

  statsPapers() {
    const years = this.papers.map(paper => paper.year); 
    const numPapers = this.papers.map(paper => paper.numPapers); 

    this.statistics[1] = {
      years: years,
      numPapers: numPapers
    };
  }  

  statsColaboraciones(){    
    const colabsXtotal = this.papers.map(paper => {
      const colab = this.collaborations.find(c => c.year === paper.year);
      return {
        year: paper.year,
        numColabs: colab ? colab.numColabs : 0,
        numPapers: paper.numPapers
      };
    });

    const density = colabsXtotal.map(dato => {
      const { year, numColabs, numPapers } = dato;
      const density = numColabs / numPapers;
      return { density, year };
    });

    this.statistics[3] = {
      years: density.map(dato => dato.year),
      densidades: density.map(dato => dato.density)
    };
  }

  statsConnectedComponents() {
    // Copiar los datos originales para no afectar el orden original
    const copiedData = [...this.connectedComponents];

    // Ordenar los datos por año
    copiedData.sort((a, b) => a.year - b.year);

    // Extraer los años y componentes conectados ordenados
    const years = copiedData.map(item => item.year);
    const connectedComponents = copiedData.map(item => item.connectedComponents);
  
    this.statistics[5] = {
        years: years,
        connectedComponents: connectedComponents
        // Puedes agregar otras propiedades si es necesario
    };
}

  statsConnectedComponentsByvenue() {
    const venueDataMap: Map<string, { years: any[], connectedComponents: any[], venueName: string, index?: number } | undefined> = new Map();
    const venueDataMapRelative: Map<string, { years: any[], connectedComponents: any[], venueName: string, index?: number } | undefined> = new Map();

    let currentIndex = 0;
    let currentIndex2 = 0;

    this.connectedComponents.forEach((item) => {
      const venueName = item.venueName;

      if (!venueDataMap.has(venueName)) {
        venueDataMap.set(venueName, {
          years: [],
          connectedComponents: [],
          venueName: venueName,
          index: currentIndex
        });

        currentIndex++;  
      }

      const venueData = venueDataMap.get(venueName);
      if (venueData) {
        venueData.years.push(item.year);
        venueData.connectedComponents.push(item.connectedComponents);
      }
    });

    this.connectedComponents.forEach((item) => {
      const venueName = item.venueName;

      if (!venueDataMapRelative.has(venueName)) {
        venueDataMapRelative.set(venueName, {
          years: [],
          connectedComponents: [],
          venueName: venueName,
          index: currentIndex2
        });

        currentIndex2++;  
      }

      const venueData = venueDataMapRelative.get(venueName);
      if (venueData) {
        venueData.years.push(item.year);
        let adjustedComponents = item.connectedComponents;
        while (adjustedComponents > 1) {
          adjustedComponents /= 10;
        }
  
        venueData.connectedComponents.push(adjustedComponents);
      }
    });

    this.statistics[6] = Array.from(venueDataMap.values());
    this.statistics[7] = Array.from(venueDataMapRelative.values());
  }
  

  statsSingleAuthor() {
    
    const papersWithAuthors: { ipName: string, numAuthors: number, authorNames: string[], year: string }[] = [];

    // Map all the researchers, to create papersWithAuthors, which is an array that has the name of a publication
    // and the authors who have contributed to it.
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

    // We get all the entries whose author is one, for the statistics
    const papersWithOneAuthor = papersWithAuthors.filter(paper => paper.numAuthors === 1);

    const porcentajeByYear = this.papers.map(paper => {
      const year = paper.year;
      const numPapers = paper.numPapers;
      const numPapersWithSingleAuthor = papersWithOneAuthor.filter(paper => paper.year === year).length;
      const percentage = (numPapersWithSingleAuthor / numPapers) * 100;
    
      return { year, percentage };
    });
    
    this.statistics[4] = {
      years: porcentajeByYear.map(dato => dato.year),
      porcentajes: porcentajeByYear.map(dato => dato.percentage)
    };
  }  

  statsGeography(datasets: any[]){
    const mappingDate: {[date: string]: {[country: string]: number}} = {};
    const datasetFiltered = datasets.filter((object: any) => Object.keys(object.frecuencias).length > 0);
    
    // Obtener todas las fechas únicas
    const uniqueDates = [...new Set(datasetFiltered.map(dato => dato.year))];

    // Iterar sobre las fechas
    for (const date of uniqueDates) {
      const objectDate = datasetFiltered.filter(dato => dato.year === date);

      // Crear objeto de mapeo para la fecha actual
      mappingDate[date] = {};
  
    for (const object of objectDate) {
      let countryHighest = '';
      let highestFrequency = -1;

      for (const country in object.frecuencias) {
          if (object.frecuencias[country] > highestFrequency) {
            countryHighest = country;
            highestFrequency = object.frecuencias[country];
          }
        }
        if(!(countryHighest in mappingDate[date])){
          mappingDate[date][countryHighest] = 1;
        }else{
          mappingDate[date][countryHighest] = mappingDate[date][countryHighest] + 1;
        }
      }
    }

    // We normalize values according to their total
    for (const year in mappingDate) {
      let total = 0;
      for (const country in mappingDate[year]) {
        total += mappingDate[year][country];
      }
      for (const country in mappingDate[year]) {
        mappingDate[year][country] = Number((mappingDate[year][country]/total).toFixed(4));
      }
    }

    const years = Object.keys(mappingDate); // Get the keys of the years
    const countries = Object.keys(mappingDate[years[0]]); // Get country names
    const datasetsLabels = countries; // Labels of the data sets will be the names of the countries 

    // Create the data matrix for the countries
    const datasetsData = countries.map((country) =>
      years.map((year) => mappingDate[year][country])
    );

    this.generateMultipleGraph('lineChart5', years, datasetsLabels, datasetsData);
    
  }

  filterAuthorsByDecade(authors: Author[], startYear: number, endYear: number): Author[] {
    const filteredAuthors: Author[] = [];
  
    // Browse the original authors
    authors.forEach((author) => {
      // Check if the author is within the specified decade
      const authorYears = author.year.split(",").map(Number).filter((year) => year >= startYear && year <= endYear);

      if (authorYears.length > 0) {
        // Search if there is already a merged author with the same name and decade
        const existingAuthor = filteredAuthors.find((filteredAuthor) => filteredAuthor.researcher === author.researcher);
        if (existingAuthor) {
          // Merge the existing author's entries with the current author's entries
          existingAuthor.numPublications += author.numPublications;
          existingAuthor.year += `, ${author.year}`;
        } else {
          // Add the current author to the list of filtered authors
          filteredAuthors.push({
            ipNames: author.ipNames,
            numPublications: author.numPublications,
            researcher: author.researcher,
            year: author.year
          });
        }
      }
    });

    return filteredAuthors;
  }

  statsProlificAuthors(selectedYears: number[]): DecadeStats[] {
    // Get the range of years selected by the user
    const startYear = Math.min(...selectedYears);
    const endYear = Math.max(...selectedYears);
  
    // Calculate the decades corresponding to the selected range of years
    const startDecade = Math.floor(startYear / 10) * 10;
    const endDecade = Math.floor(endYear / 10) * 10;
  
    // Generate the decades within the selected year range
    const decades: DecadeStats[] = [];
    for (let decade = startDecade; decade <= endDecade; decade += 10) {
      const decadeLabel = `${decade}s`;
      const decadeStartYear = decade;
      const decadeEndYear = decade + 9;
      const decadeAuthors = this.filterAuthorsByDecade(this.singleAuthor, decadeStartYear, decadeEndYear);
  
      decades.push({
        label: decadeLabel,
        startYear: decadeStartYear,
        endYear: decadeEndYear,
        authors: decadeAuthors
      });
    }  
    // Sort authors by number of publications in each decade
    decades.forEach((decade) => {
      decade.authors.sort((a, b) => b.numPublications - a.numPublications);
      if (decade.authors.length > 20){
        decade.authors = decade.authors.slice(0, 20); 
      } 
    });
  
    // Return the decades with the authors ordered
    return decades;
  }

  statsProlificAuthors2(selectedYears: number[]) {
    const startYear = Math.min(...selectedYears);
    const endYear = Math.max(...selectedYears);
  
    const allAuthors = this.filterAuthorsByDecade(this.singleAuthor, startYear, endYear);
    const topAuthors = allAuthors.sort((a, b) => b.numPublications - a.numPublications).slice(0, 20);
  
    const tables = {
      'degree': document.querySelector('#degree tbody'),
    };
  
    for (const author of topAuthors) {
      const table = tables['degree'];
  
      if (table instanceof HTMLElement) {
        const yearsArray = author.year.split(",").map(Number);
        const minYear = Math.min(...yearsArray);
        const maxYear = Math.max(...yearsArray);

  
        const row = document.createElement('tr');
        row.innerHTML = `
  
                         <td >${author.researcher}</td>
                         <td style="padding-left: 50px" >${author.numPublications}</td>
                         <td style="padding-left: 50px">${minYear}</td> 
                         <td style="padding-left: 80px">${maxYear}</td>`;
  
        table.appendChild(row);
      }
    }

  }

  generateTablesDecades2(decadeStats: any[]){
    const tables: { [key: string]: HTMLElement | null } = {
      '1990s': document.querySelector('#table90 tbody'),
      '2000s': document.querySelector('#table00 tbody'),
      '2010s': document.querySelector('#table10 tbody'),
      '2020s': document.querySelector('#table20 tbody'),
    };
    for (const decade of decadeStats) {
      const table = tables[decade.label];
  
      if (table instanceof HTMLElement) {
        decade.authors.slice(0, 20).forEach((autor: { researcher: any; numPublications: any; year: any; }) => {
          const row = document.createElement('tr');
          row.innerHTML = `<td>${autor.researcher}</td><td>${autor.numPublications}</td>`;
  
          table.appendChild(row);
        });
      }
    }
  }

  generateChart3(idChart: string, label: string, labels: any[], data: any[]) {
    if(idChart=="lineChart1"){
      this.lineChart = new Chart(idChart, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: label,
              data: data,
              fill: false,
              borderColor: 'rgb(0, 22, 68)',
              borderWidth: 1
            }
          ]
        },
        options: {
          plugins: {
            legend: {
              labels: {
                color: 'black',
                font: {
                  size: 18, 
                  family: 'Roboto',
                }
              }
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true
            }
          },
        }
      });
    }
    if(idChart=="lineChart2" || idChart=="lineChart11" || idChart=="lineChart3"){
      this.lineChart2 = new Chart(idChart, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: label,
              data: data,
              fill: false,
              borderColor: 'rgb(0, 22, 68)',
              borderWidth: 1
            }
          ]
        },
        options: {
          plugins: {
            legend: {
              labels: {
                color: 'black',
                font: {
                  size: 18, 
                  family: 'Roboto',
                }
              }
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true
            }
          },
        }
      });
    }
    
   
  }

  generateChart4(idChart: string, label: string, venueDataMap: any) {
    const datasets = venueDataMap.map((venue: any) => {
      return {
        label: venue.venueName,
        data: venue.connectedComponents,
        years: venue.years,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderColor: this.getRandomColor(venue.index)
      };
    });
  
    const allYears = Array.from(new Set([].concat(...datasets.map((dataset: any) => dataset.years))));
    allYears.sort();
  
    this.lineChart = new Chart(idChart, {
      type: 'line',
      data: {
        labels: allYears,
        datasets: datasets.map((dataset: any) => {
          return {
            label: dataset.label,
            data: allYears.map(year => {
              const index = dataset.years.indexOf(year);
              return index !== -1 ? dataset.data[index] : null;
            }),
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderColor: dataset.borderColor,
          };
        })
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: 'black',
              font: {
                size: 18,
                family: 'Roboto',
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true
          }
        },
      }
    });
  }

  getRandomColor2(seed: string) {
    const colorSeed = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomColor = Math.floor(Math.abs(Math.sin(colorSeed) * 16777215) % 16777215).toString(16);
    return '#' + randomColor;
}
  
  
  
  

  statsGender(datasets: any[]){
    const datasetsByGenre: { [genero: string]: { year: string; count: number }[] } = {};

      datasets.forEach((data: { year: any; genero: any; }) => {
        const { year, genero } = data;
        
        let genderKey = '';
        
        if (genero == 'M' || genero == '?M' || genero == '1M' || genero == '?') {
          genderKey = 'Men';
        } else if (genero == 'F' || genero == '?F' || genero == '1F') {
          genderKey = 'Women';
        } else{
          genderKey = 'Unknown';
        }
        
        if (!datasetsByGenre[genderKey]) {
          datasetsByGenre[genderKey] = [];
        }
        
        const existingData = datasetsByGenre[genderKey].find(d => d.year === year);
        
        if (existingData) {
          existingData.count++;
        } else {
          datasetsByGenre[genderKey].push({
            year,
            count: 1
          });
        }
      });

      // Create an object to store the ordered data
      const sortedData: { [anio: string]: { hombres: number; mujeres: number; total: number} } = {};
      const men = datasetsByGenre['Men'];
      const women = datasetsByGenre['Women'];

      // Sort men's data
      men.forEach(dato => {
        const year = dato.year;
        const count = dato.count;

        sortedData[year] = { hombres: count, mujeres: 0, total: count };
      });

      // Sort the women's data and combine it with the men's data
      women.forEach(dato => {
        const year = dato.year;
        const count = dato.count;

        if (sortedData[year]) {
          sortedData[year].mujeres = count;
          sortedData[year].total += count;
        } else {
          sortedData[year] = { mujeres: count, hombres: 0, total: count };
        }
      });


      // Get the years sorted
      const organizedYears = Object.keys(sortedData).sort();


      const countMen = organizedYears.map(anio => Number((sortedData[anio].hombres/(sortedData[anio].total)).toFixed(4)));
      const countWoman = organizedYears.map(anio => Number((sortedData[anio].mujeres/(sortedData[anio].total)).toFixed(4)));

      
      this.generateCircularChart('lineChart4', organizedYears, ['Hombres', 'Mujeres'], [countMen, countWoman]);
      this.generateMultipleGraph('lineChart8', organizedYears, ['Hombres', 'Mujeres'], [countMen, countWoman]);
  }

  generateMultipleGraph(chartId: string, labels: string[], datasetsLabels: string[], datasetsData: number[][]) {
    const datasets = datasetsLabels.map((label, index) => ({
      label: label,
      data: datasetsData[index],
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderColor: this.getRandomColor(index),
    }));
  
    const chartConfig: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: 'black',
              font: {
                size: 18, 
                family: 'Roboto',
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
          },
        },
      },
    };
  
    const ctx = document.getElementById(chartId) as HTMLCanvasElement;
    new Chart(ctx, chartConfig);
  }

  generateCircularChart(chartId: string, labels: string[], datasetsLabels: string[], datasetsData: number[][]) {
    const colors = ['#FF5733', '#3399FF'];

    const datasets = datasetsLabels.map((label, index) => ({
      label: label,
      data: datasetsData[index],
      backgroundColor: colors[index],  // Cambia la opacidad a un valor más alto
      borderColor: 'black',
    }));
  
    const chartConfig: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        plugins: {
          legend: {
            display: false,
            labels: {
              color: 'black',
              font: {
                size: 18,
                family: 'Roboto',
              }
            }
          }
        },
      },
    };
    const ctx = document.getElementById(chartId) as HTMLCanvasElement;
    new Chart(ctx, chartConfig);
  }

  generateBarChart(idChart: string, label: string, labels: any[], data: any[]) {
    this.barChart = new Chart(idChart, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: data,
            backgroundColor: 'rgb(0, 22, 68)',
            borderColor: 'rgb(0, 22, 68)',
            borderWidth: 1
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: 'black',
              font: {
                size: 18, 
                family: 'Roboto',
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
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

    const lines = data.split('\n');
    const dict: { [key: string]: { frec_paises: { [key: string]: number }, genero: string } } = {};
    let currentName = '';
    let currentData: { frec_paises: { [key: string]: number }, genero: string } = {
      frec_paises: {},
      genero: ''
    };
  
    for (const linea of lines) {
      if (linea.startsWith('nombre:')) {
        currentName = linea.split(':')[1].trim();
        currentData = { frec_paises: {}, genero: '' };
      } else if (linea.startsWith('frec_paises:')) {
        const frec_paisesStr = linea.substring(linea.indexOf('{'), linea.lastIndexOf('}') + 1);
        const frec_paises = JSON.parse(frec_paisesStr);
        currentData.frec_paises = frec_paises;
      } else if (linea.startsWith('genero:')) {
        currentData.genero = linea.split(':')[1].trim();
      } else if (linea.trim() === '') {
        dict[currentName] = currentData;
      }
    }
    return dict;
  }

  async main(){
    try {
      this.selectedTitles = this.stadisticsService.getSelectedTitles();
      this.conferenceOption = this.stadisticsService.getConferenceOption();
      this.venueName = this.stadisticsService.getVenueName();

      this.getPapers();
      this.getCollaborations();
      this.getAuthorsPapers();
      this.getResearchersConference();
      this.getSchools();
      this.generateTablesDecades();
      

      if(this.researchers.length == 0){
        await this.waitResearcherNoEmpty();
        this.getDemographicData();
      } else{
        this.getDemographicData();
      }      

      if(this.papersWithAuthors.length == 0){
        await this.waitAuthorsWithPapersNoEmpty();
        this.getTopicAnalysis();
        this.getDistributions();
      }else{
        this.getTopicAnalysis();
        this.getDistributions();
      }
      
      if(this.singleAuthor.length == 0){
        await this.waitSingleAuthorsNoEmpty();
        this.decadeStats = this.statsProlificAuthors(this.selectedYears);
        this.generateTablesDecades2(this.decadeStats)
      }else{
        this.decadeStats = this.statsProlificAuthors(this.selectedYears);
        this.generateTablesDecades2(this.decadeStats)
      }
      this.statsProlificAuthors2(this.selectedYears);
 
      this.getConnectedComponents();
      this.getConnectedComponentsByvenue();
  } catch (error) {
    console.error('Error in getData with:', error);
  }
  }

}