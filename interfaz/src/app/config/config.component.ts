import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { SelectionService } from '../selection.service';
import { Chart, registerables } from 'chart.js';
import { combineLatest, forkJoin } from 'rxjs';
Chart.register(...registerables);


@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit{
  
  publicationsByYear: { yearName: string, allPublications: number }[] = [];
  authorsByYear: { yearName: string, allAuthors: number }[] = [];
  conferencesByYear: { yearName: string, allConferences: number }[] = [];
  combinedData: { yearName: string, allConferences: number, allAuthors: number, allPublications: number}[] = [];
  allPublications = 0;
  publicationsCombined: number[] = [];
  authorsCombined: number[] = [];
  conferencesCombined: number[] = [];
  allAuthors = 0;
  allConferences = 0;
  barChart!: Chart;
  

  constructor(
    private apiService: ApiService,
  ) {}




  ngOnInit() {
    this.main();
  }

  getPublicationsbyYear() {
 
    let totalPublications = 0;

    this.apiService.getPublicationsbyYear().subscribe({
      next: (response: any[]) => {
        this.publicationsByYear = response; 
        // Asigna la respuesta del servicio a la variable
        this.publicationsByYear.sort((a, b) => {
          return parseInt(a.yearName) - parseInt(b.yearName);
        });
    
        const years = this.publicationsByYear.map(item => item.yearName);
        this.publicationsCombined = this.publicationsByYear.map(item => item.allPublications);
    

        totalPublications = this.publicationsByYear.reduce((total, year) => total + year.allPublications, 0); // Suma el número total de publicaciones

        this.generateBarChart('barChart1', 'Publications by Year', years, this.publicationsCombined);
        console.log('Total de publicaciones por año: ', totalPublications);
 
      },
      error: (error: any) => {
        console.error('Error al obtener las publicaciones en getPublicationsbyYear:', error);
      }
    });
  }

  getAuthorsbyYear() {
 
    let totalAuthors = 0;

    this.apiService.getAuthorsbyYear().subscribe({
      next: (response: any[]) => {
        this.authorsByYear = response; 
        // Asigna la respuesta del servicio a la variable
        this.authorsByYear.sort((a, b) => {
          return parseInt(a.yearName) - parseInt(b.yearName);
        });
    
        const years = this.authorsByYear.map(item => item.yearName);
        this.authorsCombined = this.authorsByYear.map(item => item.allAuthors);
    

        totalAuthors = this.authorsByYear.reduce((total, year) => total + year.allAuthors, 0); // Suma el número total de publicaciones

        this.generateBarChart('barChart2', 'Authors by Year', years, this.authorsCombined);
        console.log('Total de autores por año: ', totalAuthors);
 
      },
      error: (error: any) => {
        console.error('Error al obtener los autores en getAuthorsbyYear:', error);
      }
    });
  }

  getConferencesbyYear() {
 
    let totalConferences = 0;

    this.apiService.getConferencesbyYear().subscribe({
      next: (response: any[]) => {
        this.conferencesByYear = response; 
        // Asigna la respuesta del servicio a la variable
        this.conferencesByYear.sort((a, b) => {
          return parseInt(a.yearName) - parseInt(b.yearName);
        });
    
        const years = this.conferencesByYear.map(item => item.yearName);
        this.conferencesCombined = this.conferencesByYear.map(item => item.allConferences);
    

        totalConferences = this.conferencesByYear.reduce((total, year) => total + year.allConferences, 0); // Suma el número total de publicaciones

        this.generateBarChart('barChart3', 'Conferences by Year', years, this.conferencesCombined);
        console.log('Total de conferencias por año:', totalConferences);
 
      },
      error: (error: any) => {
        console.error('Error al obtener las conferencias en getConferencesbyYear:', error);
      }
    });
  }

  getPublications() {
    this.apiService.getPublications().subscribe({
      next: (response: any[]) => {
  
        if (response.length > 0) {
          this.allPublications = response[0].all_publications;
        } else {
          this.allPublications = 0;
        }
        console.log('Total de publicaciones correcto:', this.allPublications);
      },
      error: (error: any) => {
        console.error('Error al obtener las publicaciones en getPublications:', error);
      }
    });
  }

  getConferences() {
    this.apiService.getConferences().subscribe({
      next: (response: any[]) => {
  
        if (response.length > 0) {
          this.allConferences = response[0].all_conferences;
        } else {
          this.allConferences = 0;
        }
        console.log('Total de conferencias correcto:', this.allConferences);
      },
      error: (error: any) => {
        console.error('Error al obtener las conferencias en getConferences:', error);
      }
    });
  }

  getAuthors() {
    this.apiService.getAuthors().subscribe({
      next: (response: any[]) => {
  
        if (response.length > 0) {
          this.allAuthors = response[0].all_authors;
        } else {
          this.allAuthors = 0;
        }
        console.log('Total de autores correcto:', this.allAuthors);
      },
      error: (error: any) => {
        console.error('Error al obtener las publicaciones en getBooks:', error);
      }
    });
  }

  combineData() {
    // Creamos un conjunto para almacenar los años únicos
    const uniqueYears = new Set<string>();
    console.log("Combined publications "+this.publicationsByYear)
    console.log("Combined conferences "+this.conferencesByYear)
    console.log("Combined authors "+this.authorsByYear)

    // Agregamos los años de cada consulta al conjunto
    this.publicationsByYear.forEach(item => uniqueYears.add(item.yearName));
    this.authorsByYear.forEach(item => uniqueYears.add(item.yearName));
    this.conferencesByYear.forEach(item => uniqueYears.add(item.yearName));

    // Convertimos el conjunto a un arreglo de años únicos
    const years = Array.from(uniqueYears);

    // Iteramos sobre los años únicos y llenamos los datos combinados
    years.forEach(year => {
        const combinedItem = {
            yearName: year,
            allConferences: 0,
            allAuthors: 0,
            allPublications: 0
        };

        // Buscamos y asignamos los valores correspondientes para cada año
        const publicationsData = this.publicationsByYear.find(item => item.yearName === year);
        if (publicationsData) {
            combinedItem.allPublications = publicationsData.allPublications;
        }

        const authorsData = this.authorsByYear.find(item => item.yearName === year);
        if (authorsData) {
            combinedItem.allAuthors = authorsData.allAuthors;
        }

        const conferencesData = this.conferencesByYear.find(item => item.yearName === year);
        if (conferencesData) {
            combinedItem.allConferences = conferencesData.allConferences;
        }

        // Agregamos el objeto combinado al arreglo combinedData
        this.combinedData.push(combinedItem);

    });
    console.log("Combined total"+ JSON.stringify(this.combinedData))
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

  generateBarChartTriple(idChart: string, label: string, labels: any[], authorsData: any[], conferencesData: any[], publicationsData: any[]) {
    this.barChart = new Chart(idChart, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Authors',
            data: authorsData,
            backgroundColor: 'rgba(255, 99, 132, 1)', // Color rojo transparente
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1
          },
          {
            label: 'Conferences',
            data: conferencesData,
            backgroundColor: 'rgba(54, 162, 235, 1)', // Color azul transparente
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          },
          {
            label: 'Publications',
            data: publicationsData,
            backgroundColor: 'rgba(255, 206, 86, 1)', // Color amarillo transparente
            borderColor: 'rgb(255, 206, 86)',
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
          },
          x:{
            stacked: true
          }
        }
      }
    });
  }

  async waitForData() {
    while (this.publicationsByYear.length < 1 || this.conferencesByYear.length < 1 || this.authorsByYear.length < 1) {
        // Espera 1 segundo antes de verificar de nuevo
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } 







  async main(){
    try {

        this.getPublications();
        this.getAuthors();
        this.getConferences();

        await Promise.all([
          this.getPublicationsbyYear(),
          this.getAuthorsbyYear(),
          this.getConferencesbyYear()
        ]);

        await this.waitForData();

        await this.combineData();

        console.log("Pasonumero44")
            this.generateBarChartTriple(
              'tripleBarChart',
              'Triple Bar Chart',
              this.combinedData.map(item => item.yearName),
              this.combinedData.map(item => item.allAuthors),
              this.combinedData.map(item => item.allConferences),
              this.combinedData.map(item => item.allPublications)
        );

  } catch (error) {
    console.error('Error in getData:', error);
  }

  }
 
}

