import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Chart } from 'chart.js';
import { InfoService } from '../services/info.service';
import { SpinnerService } from '../services/spinner.service';

@Component({
  selector: 'info-config',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {

  allPublications = 0;
  allAuthors = 0;
  allConferences = 0;
  allJournals = 0;
  loadingGraph1 = true;
  loadingGraph2 = true;
  loadingGraph3 = true;
  loadingGraph4 = true;
  loadingGraph5 = true;

  barChart!: Chart;

  constructor(
    private infoService: InfoService,
    private apiService: ApiService,
    private spinnerService: SpinnerService
  ) { }


  ngOnInit() {

    this.main();
  }

  // API CALL: Function to get Publications by Year
  getPublicationsbyYear() {
    this.apiService.getPublicationsbyYear().subscribe({
      next: (response: any[]) => {
        this.infoService.PublicationsByYear = response;
      },
      error: (error: any) => {
        console.error('Error al obtener las publicaciones en getPublicationsbyYear:', error);
      }
    });
  }

  // API CALL: Function to get Authors by Year
  getAuthorsbyYear() {
    this.apiService.getAuthorsbyYear().subscribe({
      next: (response: any[]) => {
        this.infoService.AuthorsByYear = response;
        this.infoService.AuthorsByYear.sort((a, b) => {
          return parseInt(a.yearName) - parseInt(b.yearName);
        });

      },
      error: (error: any) => {
        console.error('Error al obtener los autores en getAuthorsbyYear:', error);
      }
    });
  }

  // API CALL: Function to get Journals by Year
  getJournalsbyYear() {
    this.apiService.getJournalsbyYear().subscribe({
      next: (response: any[]) => {
        this.infoService.JournalsByYear = response;
        this.infoService.JournalsByYear.sort((a, b) => {
          return parseInt(a.yearName) - parseInt(b.yearName);
        });
      },
      error: (error: any) => {
        console.error('Error al obtener las conferencias en getConferencesbyYear:', error);
      }
    });
  }

  // API CALL: Function to get Conferences by Year
  getConferencesbyYear() {
    this.apiService.getConferencesbyYear().subscribe({
      next: (response: any[]) => {
        this.infoService.ConferencesByYear = response;
        this.infoService.ConferencesByYear.sort((a, b) => {
          return parseInt(a.yearName) - parseInt(b.yearName);
        });

      },
      error: (error: any) => {
        console.error('Error al obtener las conferencias en getConferencesbyYear:', error);
      }
    });
  }

  // API CALL: Function to get All Publications
  getPublications() {
    this.apiService.getPublications().subscribe({
      next: (response: any[]) => {

        if (response.length > 0) {
          this.infoService.AllPublications = response[0].all_publications;
        } else {
          this.infoService.AllPublications = 0;
        }
      },
      error: (error: any) => {
        console.error('Error al obtener las publicaciones en getPublications:', error);
      }
    });
  }

  // API CALL: Function to get All Conferences
  getConferences() {
    this.apiService.getConferences().subscribe({
      next: (response: any[]) => {

        if (response.length > 0) {
          this.infoService.AllConferences = response[0].all_conferences;
        } else {
          this.infoService.AllConferences = 0;
        }
      },
      error: (error: any) => {
        console.error('Error al obtener las conferencias en getConferences:', error);
      }
    });
  }

  // API CALL: Function to get All Journals
  getJournals() {
    this.apiService.getJournals().subscribe({
      next: (response: any[]) => {

        if (response.length > 0) {
          this.infoService.AllJournals = response[0].all_journals;
        } else {
          this.infoService.AllJournals = 0;
        }
      },
      error: (error: any) => {
        console.error('Error al obtener las conferencias en getConferences:', error);
      }
    });
  }

  // API CALL: Function to get All Authors
  getAuthors() {
    this.apiService.getAuthors().subscribe({
      next: (response: any[]) => {

        if (response.length > 0) {
          this.infoService.AllAuthors = response[0].all_authors;
        } else {
          this.infoService.AllAuthors = 0;
        }
      },
      error: (error: any) => {
        console.error('Error al obtener las publicaciones en getBooks:', error);
      }
    });
  }

  // API CALL: Function to get All Schools
  getSchools() {
    this.apiService.getSchools().subscribe({
      next: (response: any[]) => {
        this.infoService.instituions = response;
        this.generateTablesSchools(this.infoService.instituions);
      },
      error: (error: any) => {
        console.error('Error in getSchools:', error);
      }
    });
  }

  // Function to generate table School
  generateTablesSchools(researchers: any[]) {
    const table = document.querySelector('#tableInstitution tbody');
    if (table instanceof HTMLElement) {
      researchers.forEach(({ School, NumberOfAuthors }) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td >${School}</td><td>${NumberOfAuthors}</td>`;
        // Aplicar alineación de celdas
        const firstCell = row.querySelector('td:first-child') as HTMLElement;
        const lastCell = row.querySelector('td:last-child') as HTMLElement;
        if (firstCell && lastCell) {
          firstCell.style.textAlign = 'left';
          lastCell.style.textAlign = 'center';
        }
        table.appendChild(row);
      });
    }
  }

  // Function to generate BarChart
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

  // Function to generate Triple BarChart
  generateBarChartTriple(idChart: string, labels: any[], ConferencesAndPapers: any[], JournalArticles: any[], Thesis: any[]) {
    this.barChart = new Chart(idChart, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Conferences and Papers',
            data: ConferencesAndPapers,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 0.5)',
            borderWidth: 1
          },
          {
            label: 'Journal Articles',
            data: JournalArticles,
            backgroundColor: 'rgba(54, 162, 235, 1)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Thesis',
            data: Thesis,
            backgroundColor: 'rgba(255, 206, 86, 2)',
            borderColor: 'rgba(255, 206, 86, 2)',
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
          x: {
            stacked: true
          }
        }
      }
    });
  }

  // Function to wait Data
  async waitForData() {
    while (this.infoService.PublicationsByYear.length < 1 || this.infoService.ConferencesByYear.length < 1 || this.infoService.AuthorsByYear.length < 1) {
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  async main() {
    try {

      this.getAuthors();
      this.getConferences();
      this.getPublications();
      this.getJournals();

      if (this.infoService.instituions.length < 1) {
        this.getSchools();
      } else {
        this.generateTablesSchools(this.infoService.instituions);
      }

      while (this.infoService.AllPublications < 1 || this.infoService.AllConferences < 1
        || this.infoService.AllAuthors < 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
        this.spinnerService.show()
      }

      this.allAuthors = this.infoService.AllAuthors
      this.allPublications = this.infoService.AllPublications
      this.allConferences = this.infoService.AllConferences
      this.allJournals = this.infoService.AllJournals


      if (this.infoService.PublicationsByYear.length < 1) {
        this.getPublicationsbyYear();
      }

      if (this.infoService.ConferencesByYear.length < 1) {
        this.getConferencesbyYear();
      }

      if (this.infoService.AuthorsByYear.length < 1) {
        this.getAuthorsbyYear();
      }

      if (this.infoService.JournalsByYear.length < 1) {
        this.getJournalsbyYear();
      }

      while (this.infoService.ConferencesByYear.length < 1) {
        this.loadingGraph1 = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.spinnerService.show()
      }
      this.loadingGraph1 = false;

      //Conferences by Year
      const Conferencesyears = this.infoService.ConferencesByYear.map(item => item.yearName);
      this.generateBarChart('barChart', 'Conferences by Year', Conferencesyears, this.infoService.ConferencesByYear.map(item => item.allConferences));

      while (this.infoService.AuthorsByYear.length < 1) {
        this.loadingGraph2 = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.spinnerService.show()
      }
      this.loadingGraph2 = false;

      //Authors by Year
      const Authorsyears = this.infoService.AuthorsByYear.map(item => item.yearName);
      this.generateBarChart('barChart2', 'Authors by Year', Authorsyears, this.infoService.AuthorsByYear.map(item => item.allAuthors));

      
      while (this.infoService.JournalsByYear.length < 1) {
        this.loadingGraph5 = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.spinnerService.show()
      }
      this.loadingGraph5 = false;

      //Jorunals by Year
      const JournalsYears = this.infoService.JournalsByYear.map(item => item.yearName);
      this.generateBarChart('barChart3', 'Journals by Year', JournalsYears, this.infoService.JournalsByYear.map(item => item.allJournals));
     
      while (this.infoService.PublicationsByYear.length < 1) {
        this.loadingGraph3 = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.spinnerService.show()
      }
      this.loadingGraph3 = false;

      while (this.infoService.instituions.length < 1) {
        this.loadingGraph4 = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.spinnerService.show()
      }
      this.loadingGraph4 = false;

      //Publications by Year
      this.generateBarChartTriple(
        'tripleBarChart',
        this.infoService.PublicationsByYear.map(item => item.yearName),
        this.infoService.PublicationsByYear.map(item => item.ConferencesAndPapers),
        this.infoService.PublicationsByYear.map(item => item.JournalArticles),
        this.infoService.PublicationsByYear.map(item => item.Thesis)
      );

      this.spinnerService.hide()

    } catch (error) {
      console.error('Error in getData:', error);
    }

  }

}

