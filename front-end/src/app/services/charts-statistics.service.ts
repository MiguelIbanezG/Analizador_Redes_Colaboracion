import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChartConfiguration } from "chart.js";
import { Chart, registerables } from "chart.js";
import { NewComersLCC } from '../models/comers.model';

@Injectable({
  providedIn: 'root'
})
export class ChartsStatisticsService {

  constructor(
    private translateService: TranslateService,
  ) { }
  
  generateTotalAuthorsChart(idChart: string, label: string, data: any[]) {
    const years = data.map((entry) => entry.year);
    const totalAuthors = data.map((entry) => entry.totalAuthors);
    const totalPapers = data.map((entry) => entry.totalPapers);
    const totalArticles = data.map((entry) => entry.totalArticles);

    if (idChart == "lineChart6") {
      new Chart(idChart, {
        type: "line",
        data: {
          labels: years,
          datasets: [
            {
              label: label,
              data: totalAuthors,
              fill: false,
              borderColor: "rgb(0, 22, 68)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              labels: {
                color: "black",
                font: {
                  size: 18,
                  family: "Roboto",
                },
              },
            },
          },
          scales: {
            y: {
              type: "linear",
              display: true,
            },
          },
        },
      });
    }

    if (idChart == "lineChart7") {
        new Chart(idChart, {
        type: "line",
        data: {
          labels: years,
          datasets: [
            {
              label: this.translateService.instant("Statistics.Papers"),
              data: totalPapers,
              fill: false,
              borderColor: "rgba(51, 153, 255)",
              borderWidth: 1,
            },
            {
              label: this.translateService.instant("Statistics.Articles"),
              data: totalArticles,
              fill: false,
              borderColor: "rgba(255, 0, 0, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              labels: {
                color: "black",
                font: {
                  size: 18,
                  family: "Roboto",
                },
              },
            },
          },
          scales: {
            y: {
              type: "linear",
              display: true,
            },
          },
        },
      });
    }
  }

  generateNewComers(idChart: string, data: NewComersLCC) {
    const venues = Object.keys(data);
    const years = Object.keys(data[venues[0]].newComers);

    const datasets = venues.flatMap((venue, index) => [
      {
        label: `NewComers-${venue}`,
        data: years.map((year) => data[venue].newComers[year] || 0),
        fill: false,
        borderColor: this.getRandomColor(index * 2),
        borderWidth: 1,
      },
      {
        label: `LCC-${venue}`,
        data: years.map((year) => data[venue].LCC[year] || 0),
        fill: false,
        borderColor: this.getRandomColor(index * 2 + 1),
        borderWidth: 1,
      },
    ]);

    new Chart(idChart, {
      type: "line",
      data: {
        labels: years,
        datasets: datasets,
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: "black",
              font: {
                size: 18,
                family: "Roboto",
              },
            },
          },
        },
        scales: {
          y: {
            type: "linear",
            display: true,
          },
        },
      },
    });
  }

  generateChartJournalsAndVenue(idChart: string, data: any[]) {
    const datasets = data.map((entry, index) => ({
      label: entry.name,
      data: entry.numResearchers,
      fill: false,
      borderColor: this.getRandomColor(index),
      borderWidth: 1,
    }));

    const datasetsConnected = data.map((entry, index) => ({
      label: entry.name,
      data: entry.relations,
      fill: false,
      borderColor: this.getRandomColor(index),
      borderWidth: 1,
    }));

    if (idChart == "lineChart2") {
      new Chart(idChart, {
        type: "line",
        data: {
          labels: data[0].years,
          datasets: datasets,
        },
        options: {
          plugins: {
            legend: {
              labels: {
                color: "black",
                font: {
                  size: 18,
                  family: "Roboto",
                },
              },
            },
          },
          scales: {
            y: {
              type: "linear",
              display: true,
            },
          },
        },
      });
    }

    if (idChart == "lineChart1") {
      new Chart(idChart, {
        type: "line",
        data: {
          labels: data[0].years,
          datasets: datasets,
        },
        options: {
          plugins: {
            legend: {
              labels: {
                color: "black",
                font: {
                  size: 18,
                  family: "Roboto",
                },
              },
            },
          },
          scales: {
            y: {
              type: "linear",
              display: true,
            },
          },
        },
      });
    }

    if (idChart == "lineChart9") {
      new Chart(idChart, {
        type: "line",
        data: {
          labels: data[0].years,
          datasets: datasetsConnected,
        },
        options: {
          plugins: {
            legend: {
              labels: {
                color: "black",
                font: {
                  size: 18,
                  family: "Roboto",
                },
              },
            },
          },
          scales: {
            y: {
              type: "linear",
              display: true,
            },
          },
        },
      });
    }
  }

  generateChartDensity(
    idChart: string,
    label: string,
    labels: any[],
    data: any[]
  ) {
    new Chart(idChart, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: data,
            fill: false,
            borderColor: "rgb(0, 22, 68)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: "black",
              font: {
                size: 18,
                family: "Roboto",
              },
            },
          },
        },
        scales: {
          y: {
            type: "linear",
            display: true,
          },
        },
      },
    });
  }

  generateMultipleChart(
    chartId: string,
    labels: string[],
    datasetsLabels: string[],
    datasetsData: number[][]
  ) {
    const datasets = datasetsLabels.map((label, index) => ({
      label: label,
      data: datasetsData[index],
      fill: false,
      borderColor: this.getRandomColor(index),
      borderWidth: 1,
    }));

    const chartConfig: ChartConfiguration<"line"> = {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: "black",
              font: {
                size: 18,
                family: "Roboto",
              },
            },
          },
        },
        scales: {
          y: {
            type: "linear",
            display: true,
          },
        },
      },
    };

    const ctx = document.getElementById(chartId) as HTMLCanvasElement;
    new Chart(ctx, chartConfig);
  }

  generateCircularChart(
    chartId: string,
    labels: string[],
    datasetsLabels: string[],
    datasetsData: number[][]
  ) {
    const colors = ["#3399FF", "#FF5733"];

    const datasets = datasetsLabels.map((label, index) => ({
      label: label,
      data: datasetsData[index],
      backgroundColor: colors[index],
      borderColor: "black",
    }));

    const chartConfig: ChartConfiguration<"pie"> = {
      type: "pie",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        plugins: {
          legend: {
            display: false,
            labels: {
              color: "black",
              font: {
                size: 18,
                family: "Roboto",
              },
            },
          },
        },
      },
    };
    const ctx = document.getElementById(chartId) as HTMLCanvasElement;
    new Chart(ctx, chartConfig);
  }

  generateBarChart(idChart: string, label: string, labels: any[], data: any[]) {
    new Chart(idChart, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: data,
            backgroundColor: "rgb(0, 22, 68)",
            borderColor: "rgb(0, 22, 68)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: "black",
              font: {
                size: 18,
                family: "Roboto",
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  getRandomColor(index: number): string {
    let colors: Record<number, string> = {
      0: "rgba(51, 153, 255, 1)",
      1: "rgba(255, 0, 0, 1)",
      2: "rgba(98, 192, 75, 1)",
      3: "rgba(255, 165, 0, 1)",  // Naranja
      4: "rgba(176, 75, 192, 1)",    
      5: "rgba(192, 141, 75, 1)",
      6: "rgba(255, 153, 51, 1)",
      7: "rgba(102, 204, 204, 1)",
      8: "rgba(255, 102, 204, 1)",
      9: "rgba(153, 102, 204, 1)",
      10: "rgba(255, 204, 102, 1)"
    };

    if (index > 10) {
      if (!colors[index]) {
        colors[index] = this.generateRandomColor();
      }
    }

    return colors[index] || '';
  }

  private generateRandomColor(): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const a = Math.random().toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }


  destroyChartsTrnslate(){
    const existingChart = Chart.getChart("lineChart4");
    if (existingChart) {
      existingChart.destroy();
    }
    const existingChart2 = Chart.getChart("lineChart8");
    if (existingChart2) {
      existingChart2.destroy();
    }
    const existingChart3 = Chart.getChart("lineChart6");
    if (existingChart3) {
      existingChart3.destroy();
    }
    const existingChart4 = Chart.getChart("lineChart3");
    if (existingChart4) {
      existingChart4.destroy();
    }
    const existingChart5 = Chart.getChart("barChart1");
    if (existingChart5) {
      existingChart5.destroy();
    }
    const existingChart6 = Chart.getChart("lineChart7");
    if (existingChart6) {
      existingChart6.destroy();
    }
  }
  
}
