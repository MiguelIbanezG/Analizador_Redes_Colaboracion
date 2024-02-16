import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Chart, registerables } from 'chart.js';
import { InfoService } from '../services/info.service';
Chart.register(...registerables);


@Component({
  selector: 'info-config',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit{
  
 
  combinedData: { yearName: string, allConferences: number, allAuthors: number, allPublications: number}[] = [];
  allPublications = 0;
  publicationsCombined: number[] = [];
  authorsCombined: number[] = [];
  conferencesCombined: number[] = [];
  allAuthors = 0;
  allConferences = 0;
  barChart!: Chart;
  

  constructor(
    private infoService: InfoService
  ) {}


  ngOnInit() {
    this.main();
  }

  createInfo(){

    //Publications by Year
    const Publicationsyears = this.infoService.PublicationsByYear.map(item => item.yearName);
    this.generateBarChart('barChart1', 'Publications by Year', Publicationsyears, this.infoService.PublicationsCombined);
    //Authors by Year
    const Authorsyears = this.infoService.AuthorsByYear.map(item => item.yearName);
    this.generateBarChart('barChart2', 'Authors by Year', Authorsyears, this.infoService.PublicationsCombined);
    //Conferences by Year
    const Conferencesyears = this.infoService.ConferencesByYear.map(item => item.yearName);
    this.generateBarChart('barChart1', 'Conferences by Year', Conferencesyears, this.infoService.ConferencesCombineds);

    this.allAuthors = this.infoService.AllAuthors
    this.allPublications = this.infoService.AllPublications
    this.allConferences = this.infoService.AllConferences
  }

 

  combineData() {
    // Creamos un conjunto para almacenar los años únicos
    const uniqueYears = new Set<string>();

    // Agregamos los años de cada consulta al conjunto
    this.infoService.PublicationsByYear.forEach(item => uniqueYears.add(item.yearName));
    this.infoService.AuthorsByYear.forEach(item => uniqueYears.add(item.yearName));
    this.infoService.ConferencesByYear.forEach(item => uniqueYears.add(item.yearName));

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
        const publicationsData = this.infoService.PublicationsByYear.find(item => item.yearName === year);
        if (publicationsData) {
            combinedItem.allPublications = publicationsData.allPublications;
        }

        const authorsData = this.infoService.AuthorsByYear.find(item => item.yearName === year);
        if (authorsData) {
            combinedItem.allAuthors = authorsData.allAuthors;
        }

        const conferencesData = this.infoService.ConferencesByYear.find(item => item.yearName === year);
        if (conferencesData) {
            combinedItem.allConferences = conferencesData.allConferences;
        }

        this.combinedData.push(combinedItem);

    });
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
    while (this.infoService.PublicationsByYear.length < 1 || this.infoService.ConferencesByYear.length < 1 || this.infoService.AuthorsByYear.length < 1) {
        // Espera 1 segundo antes de verificar de nuevo
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } 

  async main(){
    try {
          //Publications by Year
          const Publicationsyears = this.infoService.PublicationsByYear.map(item => item.yearName);
          this.generateBarChart('barChart1', 'Publications by Year', Publicationsyears, this.infoService.PublicationsCombined);
          //Authors by Year
          const Authorsyears = this.infoService.AuthorsByYear.map(item => item.yearName);
          this.generateBarChart('barChart2', 'Authors by Year', Authorsyears, this.infoService. AuthorsCombined);
          //Conferences by Year
          const Conferencesyears = this.infoService.ConferencesByYear.map(item => item.yearName);
          this.generateBarChart('barChart3', 'Conferences by Year', Conferencesyears, this.infoService.ConferencesCombineds);

          this.allAuthors = this.infoService.AllAuthors
          this.allPublications = this.infoService.AllPublications
          this.allConferences = this.infoService.AllConferences

        await this.waitForData();

        await this.combineData();

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

