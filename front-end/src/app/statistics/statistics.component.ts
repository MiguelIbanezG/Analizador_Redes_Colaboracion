import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ApiService } from "../services/api.service";
import { StadisticsService } from "../services/stadistics.service";
import { Chart, registerables } from "chart.js";
import { HttpClient } from "@angular/common/http";
import { CloudData, CloudOptions } from "angular-tag-cloud-module";
import { singular } from "pluralize";
import { SpinnerService } from "../services/spinner.service";
import { Author } from "../models/statistics.model";
import { DecadeStats } from "../models/statistics.model";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { LanguageService } from "../services/language.service";
import { Subscription } from "rxjs";
import { NetworkService } from "../services/network.service";
import { NetworkInitService } from "../services/network.init.service";
import { Node } from "../models/network.model";
import { Network, DataSet, Edge } from "vis";
import { NewComersLCC } from "../models/comers.model";
import { ChartsStatisticsService } from "../services/charts-statistics.service";

Chart.register(...registerables);

@Component({
  selector: "statistics",
  templateUrl: "./statistics.component.html",
  styleUrls: ["./statistics.component.scss"],
})
export class StatisticsComponent implements OnInit {
  @ViewChild("treeContainer", { static: true })
  treeContainer!: ElementRef;
  selectedYears: any[] = [];
  PapersAndArticles: any[] = [];
  collaborations: any[] = [];
  singleAuthor: any[] = [];
  statistics: any[] = [];
  statsAuthors: any[] = [];
  statsPaperAndArticle: any[] = [];
  connectedYears: any[] = [];
  ConferencesAndJournalCount: number = 0;
  ConferencesAndJournalAuthors: number = 0;
  totalAuthorsByYear: any[] = [];
  PapersAndArticlesByYear: any[] = [];
  totalArticlesByYear: any[] = [];
  totalPapersByYear: any[] = [];
  singlePapersAndArticle: any[] = [];
  decadeStats: any[] = [];
  researchers: any[] = [];
  papersAndarticlesWithAuthors: any[] = [];
  loadingTable1 = true;
  loadingTable2 = true;
  commonNames: {[key: string]: { frec_paises: { [key: string]: number }; genero: string }; } = {};
  languagePage: String = "es";
  languageChangeSubscription: Subscription | undefined;
  organizedYears: string[] = [];
  countMen: number[] = [];
  countWomen: number[] = [];
  private data: any = {};
  private nodes: DataSet<Node> = new DataSet<Node>();
  private edges: DataSet<Edge> = new DataSet<Edge>();

  options: CloudOptions = {
    width: 500,
    height: 200,
    overflow: false,
    realignOnResize: false,
    strict: false,
    step: 2,
  };

  cloudData: CloudData[] = [];

  constructor(
    private apiService: ApiService,
    private stadisticsService: StadisticsService,
    private http: HttpClient,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private networkService: NetworkService,
    private statisticsChart: ChartsStatisticsService,
    public networkInitService: NetworkInitService
  ) {
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.languagePage = event.lang;
    });
  }

  async ngOnInit() {
    this.loadCommonNames();
    this.main();
    this.languagePage = this.translateService.currentLang;
    this.languageChangeSubscription = this.languageService.languageChange$.subscribe((language) => {
      this.changeLanguage(language);
    });


  }

  ngOnDestroy() {
    if (this.languageChangeSubscription) {
      this.languageChangeSubscription.unsubscribe();
    }
  }

  changeLanguage(language: string) {
    this.languagePage = language;
    this.updateTranslations();
  }

  updateTranslations() {
    this.statisticsChart.destroyChartsTrnslate();
    this.statisticsChart.generateTotalAuthorsChart("lineChart6",this.translateService.instant("Statistics.TotalAuthors"), this.totalAuthorsByYear);
    this.statisticsChart.generateChartDensity("lineChart3", this.translateService.instant("Statistics.Density"), this.statistics[3].years, this.statistics[3].densidades);
    this.statisticsChart.generateBarChart("barChart1",this.translateService.instant("Statistics.Single"), this.statistics[4].years, this.statistics[4].percentages);
    this.statisticsChart.generateCircularChart("lineChart4",this.organizedYears,[this.translateService.instant("Statistics.Men"),this.translateService.instant("Statistics.Men"),],[this.countMen, this.countWomen]);
    this.statisticsChart.generateMultipleChart("lineChart8",this.organizedYears,[this.translateService.instant("Statistics.Men"),this.translateService.instant("Statistics.Women"),],[this.countMen, this.countWomen]);
    this.statisticsChart.generateTotalAuthorsChart("lineChart7","Total Papers and Articles by Year", this.PapersAndArticlesByYear);
  }

  getResearchersConferenceAndJournals() {
    this.apiService.getResearchersConferenceAndJournals(this.stadisticsService.selectedYears,this.stadisticsService.ConferenceOrJournalName)
      .subscribe({
        next: (response: any) => {
          this.researchers = [];
          this.researchers = response;
          console.log(this.researchers)
          this.statsResearchers();
          this.statsTotalAuthorsByYear();
          if (this.researchers.length > 1) {
            this.statisticsChart.generateChartJournalsAndVenue("lineChart1", this.statsAuthors);
            this.statisticsChart.generateTotalAuthorsChart("lineChart6", this.translateService.instant("Statistics.TotalAuthors"), this.totalAuthorsByYear);
          }
        },
        error: (error: any) => {
          console.error("Error in getResearchersConferenceAndJournals:", error);
        },
      });
  }

  getPapersAndArticles() {
    this.apiService.getPapersAndArticles(this.stadisticsService.selectedYears, this.stadisticsService.ConferenceOrJournalName)
      .subscribe({
        next: (response: any) => {
          this.PapersAndArticles = response;
          if (this.PapersAndArticles.length > 0) {
            this.statsPapersAndArticles();
            this.statsTotalPapersAndArticlesByYear();
          }
        },
        error: (error: any) => {
          console.error("Error in getPapersAndArticles:", error);
        },
      });
  }

  getCollaborations() {
    this.apiService.getCollaborations(this.stadisticsService.selectedYears, this.stadisticsService.ConferenceOrJournalName)
      .subscribe({
        next: (response: any) => {
          this.collaborations = response;
          this.statsColaboraciones();
          this.statisticsChart.generateChartDensity("lineChart3", this.translateService.instant("Statistics.Density"), this.statistics[3].years, this.statistics[3].densidades);
        },
        error: (error: any) => {
          console.error("Error in getCollaborations:", error);
        },
      });
  }

  getConferencebyProceeding() {
    this.apiService.getConferencebyProceeding(this.stadisticsService.selectedYears, this.stadisticsService.ConferenceOrJournalName)
      .subscribe({
        next: (response: any) => {
          this.stadisticsService.ConferenceOrJournalNames = [];
          this.stadisticsService.years = [];
          this.stadisticsService.inprocedings = [];

          response.forEach(({title, year,numberOfInProceedings,}: {
              title: string;
              year: string;
              numberOfInProceedings: number;
            }) => {
              this.stadisticsService.ConferenceOrJournalNames.push(title);
              this.stadisticsService.years.push(year);
              this.stadisticsService.inprocedings.push(numberOfInProceedings);
            }
          );

          this.loadingTable1 = false;
          this.generateTablesProceeding(this.stadisticsService.ConferenceOrJournalNames, this.stadisticsService.years, this.stadisticsService.inprocedings);
        },
        error: (error: any) => {
          console.error("Error in getConferencebyProceeding:", error);
        },
      });
  }

  getAuthorsPapersAndArticles() {
    this.apiService.getAuthorsPapersAndArticles(this.stadisticsService.selectedYears,this.stadisticsService.ConferenceOrJournalName)
      .subscribe({
        next: async (response: any) => {
          this.singleAuthor = response;
          this.statsSingleAuthor();
        },
        error: (error: any) => {
          console.error("Error in getAuthorsPapers:", error);
        },
      });
  }

  getConnectedComponentsYears() {
    this.apiService.getConnectedComponentsYears(this.stadisticsService.selectedYears, this.stadisticsService.ConferenceOrJournalName)
      .subscribe({
        next: (response: any) => {
          const { labels, datasets, venueYears } = this.statsConnectedComponets(response);
          const allYears = new Set<string>();
  
          const unifiedVenueYears: { [key: string]: string[] } = {};
          const unifiedDatasets: { [key: string]: number[] } = {};
  
          Object.keys(venueYears).forEach((venue) => {
            let unifiedVenue = venue;
            if (venue === "Business Process Management") {
              unifiedVenue = "BPM";
            }
  
            if (!unifiedVenueYears[unifiedVenue]) {
              unifiedVenueYears[unifiedVenue] = [];
            }
            unifiedVenueYears[unifiedVenue].push(...venueYears[venue]);
  
            if (!unifiedDatasets[unifiedVenue]) {
              unifiedDatasets[unifiedVenue] = [];
            }
            unifiedDatasets[unifiedVenue].push(...datasets[venue]);
          });
  
          Object.values(unifiedVenueYears).forEach((years) => {
            years.forEach((year) => allYears.add(year));
          });
  
          const sortedAllYears = Array.from(allYears).sort();
  
          this.connectedYears = Object.keys(unifiedDatasets).map((label) => {
            const years = unifiedVenueYears[label];
            const relations = unifiedDatasets[label];
  
            const yearRelationMap: { [key: string]: number } = {};
            years.forEach((year, index) => {
              yearRelationMap[year] = relations[index];
            });
  
            const filledRelations = sortedAllYears.map(
              (year) => yearRelationMap[year] || 0
            );
  
            return {
              name: label,
              years: sortedAllYears,
              relations: filledRelations,
            };
          });

          this.statisticsChart.generateChartJournalsAndVenue("lineChart9", this.connectedYears);
        },
        error: (error: any) => {
          console.error("Error in getConnectedComponentsYears:", error);
        },
      });
  }

  getnewComers() {
    this.apiService.getNewComers(this.stadisticsService.selectedYears, this.stadisticsService.ConferenceOrJournalName)
      .subscribe({
        next: async (response: any) => {
          const newComersLCCdata = this.NewComersLCCstats(response);
          this.statisticsChart.generateNewComers("lineChart10", newComersLCCdata);
        },
        error: (error: any) => {
          console.error("Error in getnewComers:", error);
        },
      });
  }

  NewComersLCCstats(newComersLCCdata: any[]): NewComersLCC {
    const processedData: NewComersLCC = {};

    const sortedData = newComersLCCdata.sort((a, b) => a.year - b.year);

    sortedData.forEach((entry) => {
      const year = entry.year;
      const venue = entry.VenueOrJournal;
      const researchers = entry.researchers;

      if (!processedData[venue]) {
        processedData[venue] = {
          newComers: {},
          LCC: {},
          allResearchers: new Set<string>(),
          cumulativeNewComers: new Set<string>(),
        };
      }

      const venueData = processedData[venue];

      const newComers = researchers.filter(
        (r: string) => !venueData.allResearchers.has(r)
      );
      newComers.forEach((r: string) => venueData.allResearchers.add(r));
      venueData.newComers[year] = newComers.length;

      const yearRelations = this.connectedYears.find(
        (connectedYear: any) => connectedYear.name === venue
      );

      if (yearRelations) {
        const yearIndex = yearRelations.years.indexOf(year.toString());
        if (yearIndex !== -1 && yearIndex < yearRelations.relations.length) {
          const relationsOfYear = yearRelations.relations[yearIndex];
          const newComersInYear = venueData.newComers[year];
          var LCCSize = relationsOfYear - newComersInYear;
          if (LCCSize < 1) {
            LCCSize = 0;
          }

          venueData.LCC[year] = LCCSize;
        }
      }
    });

    return processedData;
  }

  statsConnectedComponets(response: any) {
    const globalYears: Set<string> = new Set();
    const venueYears: { [key: string]: Set<string> } = {};
    const datasets: { [key: string]: number[] } = {};

    response.forEach(
      (item: {
        year: string;
        totalRelations: { low: number; high: number };
        venueORjournal: string;
      }) => {
        const { year, venueORjournal, totalRelations } = item;
        globalYears.add(year);

        if (!datasets[venueORjournal]) {
          datasets[venueORjournal] = [];
        }
        if (!venueYears[venueORjournal]) {
          venueYears[venueORjournal] = new Set();
        }

        venueYears[venueORjournal].add(year);
        datasets[venueORjournal].push(totalRelations.low);
      }
    );

    const venueYearsArray = Object.fromEntries(
      Object.entries(venueYears).map(([key, value]) => [
        key,
        Array.from(value).sort(),
      ])
    );

    return {
      labels: Array.from(globalYears).sort(),
      datasets,
      venueYears: venueYearsArray,
    };
  }

  statsTotalAuthorsByYear() {
    const years = this.stadisticsService.selectedYears;
    years.sort((a, b) => parseInt(a) - parseInt(b));
    this.totalAuthorsByYear = years.map((year) => {
      const totalAuthors = this.researchers.reduce((total, researcher) => {
        if (researcher.years.includes(year)) {
          return total + 1;
        }
        return total;
      }, 0);
      return {
        year: year,
        totalAuthors: totalAuthors,
      };
    });
  }

  statsTotalPapersAndArticlesByYear() {
    let years = this.PapersAndArticles.map((item) => item.year);
    years = years.filter((value, index, self) => self.indexOf(value) === index);
    years.sort((a, b) => parseInt(a) - parseInt(b));

    const papersByYear = this.PapersAndArticles.filter((item) => item.type === "Paper");
    const articlesByYear = this.PapersAndArticles.filter((item) => item.type === "Article");

    this.PapersAndArticlesByYear = years.map((year) => {
      const papersOfYear = papersByYear.filter((paper) => paper.year === year);
      const articlesOfYear = articlesByYear.filter((article) => article.year === year);

      const totalPapers = papersOfYear.reduce((total, paper) => {
        return total + paper.numPapersAndArticles.low;
      }, 0);

      const totalArticles = articlesOfYear.reduce((total, article) => {
        return total + article.numPapersAndArticles.low;
      }, 0);

      return {
        year: year,
        totalPapers: totalPapers,
        totalArticles: totalArticles,
      };
    });

    this.statisticsChart.generateTotalAuthorsChart("lineChart7","Total Papers and Articles by Year",this.PapersAndArticlesByYear);
  }

  generateTablesProceeding( venueTitles: string[], years: string[], numberOfInProceedings: number[] ) {
    const table = document.querySelector("#tableProceeding tbody");
    if (table instanceof HTMLElement) {
      table.innerHTML = "";

      venueTitles.forEach((venueTitle, index) => {
        const parts = venueTitle.split(",");

        if (parts.length == 6) {
          parts[4] = parts[4].replace("Proceedings", "");
          const date = parts[4].split(".");

          const rowData = {
            name: parts[0] + "-" + parts[1].trim(),
            location: parts[2] + "," + parts[3],
            date: date.slice(0).join(" "),
          };

          const row = document.createElement("tr");
          row.innerHTML = `<td>${rowData.name}</td><td>${rowData.location}</td><td>${rowData.date}</td><td>${years[index]}</td><td>${numberOfInProceedings[index]}</td>`;

          table.appendChild(row);
        }

        if (parts.length == 5) {
          parts[3] = parts[3].replace("Proceedings", "").trim();
          const date = parts[3].split(".");
          const hasNumber = /\d/.test(date[0]);

          if (hasNumber) {
            if (parts[1].includes("Florence")) {
              const rowData = {
                name: parts[0],
                location: parts[1].trim() + "," + parts[2],
                date: date[0],
              };
              const row = document.createElement("tr");
              row.innerHTML = `<td>${rowData.name}</td><td>${rowData.location}</td><td>${rowData.date}</td><td>${years[index]}</td><td>${numberOfInProceedings[index]}</td>`;
              table.appendChild(row);
            } else {
              const rowData = {
                name: parts[0] + "-" + parts[1].trim(),
                location: parts[2],
                date: date[0],
              };
              const row = document.createElement("tr");
              row.innerHTML = `<td>${rowData.name}</td><td>${rowData.location}</td><td>${rowData.date}</td><td>${years[index]}</td><td>${numberOfInProceedings[index]}</td>`;
              table.appendChild(row);
            }
          } else {
            const rowData = {
              name: parts[0] + "-" + parts[1].trim(),
              location: parts[2] + ", " + parts[3],
              date: parts[4],
            };

            const row = document.createElement("tr");
            row.innerHTML = `<td>${rowData.name}</td><td>${rowData.location}</td><td>${rowData.date}</td><td>${years[index]}</td><td>${numberOfInProceedings[index]}</td>`;
            table.appendChild(row);
          }
        }

        if (parts.length == 7) {
          parts[5] = parts[5].replace("Proceedings", "");
          const date = parts[5].split(".");

          if (parts[2].length > 15) {
            const rowData = {
              name: parts[0] + "-" + parts[1].trim(),
              location: parts[3] + ", " + parts[4],
              date: date[0],
            };
            const row = document.createElement("tr");
            row.innerHTML = `<td>${rowData.name}</td><td>${rowData.location}</td><td>${rowData.date}</td><td>${years[index]}</td><td>${numberOfInProceedings[index]}</td>`;
            table.appendChild(row);
          } else {
            const isValidFormat =
              /^[a-zA-Z]+\s+\d{1,2}(-\d{1,2}|\d{1,2}[a-zA-Z]+\s+\d{1,2})$/.test(
                date[0].trim()
              );

            if (isValidFormat) {
              if (
                this.stadisticsService.ConferenceOrJournalName.some((name) =>
                  parts[2].includes(name)
                )
              ) {
                const rowData = {
                  name: parts[0] + "," + parts[1].trim() + "-" + parts[2],
                  location: parts[3] + ", " + parts[4],
                  date: date[0],
                };
                const row = document.createElement("tr");
                row.innerHTML = `<td>${rowData.name}</td><td>${rowData.location}</td><td>${rowData.date}</td><td>${years[index]}</td><td>${numberOfInProceedings[index]}</td>`;
                table.appendChild(row);
              } else {
                const rowData = {
                  name: parts[0] + "-" + parts[1].trim(),
                  location: parts[2] + ", " + parts[3] + ", " + parts[4],
                  date: date[0],
                };

                const row = document.createElement("tr");
                row.innerHTML = `<td>${rowData.name}</td><td>${rowData.location}</td><td>${rowData.date}</td><td>${years[index]}</td><td>${numberOfInProceedings[index]}</td>`;
                table.appendChild(row);
              }
            } else {
              const rowData = {
                name: parts[0] + "-" + parts[1].trim(),
                location: parts[2] + ", " + parts[3],
                date: parts[4] + ", " + date[0],
              };
              const row = document.createElement("tr");
              row.innerHTML = `<td>${rowData.name}</td><td>${rowData.location}</td><td>${rowData.date}</td><td>${years[index]}</td><td>${numberOfInProceedings[index]}</td>`;
              table.appendChild(row);
            }
          }
        }
      });
    }
  }

  getDistributions() {
    const labels: string[] = ["1", "2", "3", "4", "5 o más"];

    const authorsByPaper: number[] = [1, 2, 3, 4].map(
      (numAuthors) =>
        this.papersAndarticlesWithAuthors.filter(
          (item) => item.numAuthors === numAuthors
        ).length
    );
    authorsByPaper[4] = this.papersAndarticlesWithAuthors.filter(
      (item) => item.numAuthors >= 5
    ).length;
    let allPapers = this.PapersAndArticles.reduce(
      (all, item) => all + item.numPapersAndArticles.low,
      0
    );

    const papersByAuthor: number[] = [1, 2, 3, 4].map(
      (numPubs) =>
        this.singleAuthor.filter((paper) => paper.numPublications === numPubs)
          .length
    );
    papersByAuthor[4] = this.singleAuthor.filter(
      (paper) => paper.numPublications >= 5
    ).length;
    const allAuthors = this.singleAuthor.length;

    const authorsTable = document.querySelector("#authorsTable tbody");
    const papersTable = document.querySelector("#papersTable tbody");

    if (authorsTable !== null) {
      authorsByPaper.forEach((amount, index) => {
        const row = document.createElement("tr");
        const percentage = ((amount / allPapers) * 100).toFixed(2);
        const worth = amount.toString() + "(" + percentage + ")";
        row.innerHTML = `<td>${labels[index]}</td><td>${worth}</td>`;
        authorsTable.appendChild(row);
      });
    }

    if (papersTable !== null) {
      papersByAuthor.forEach((amount, index) => {
        const row = document.createElement("tr");
        const percentage = ((amount / allAuthors) * 100).toFixed(2);
        const worth = amount.toString() + "(" + percentage + ")";
        row.innerHTML = `<td>${labels[index]}</td><td>${worth}</td>`;
        papersTable.appendChild(row);
      });
    }
  }

  getDemographicData() {
    const datasets = this.researchers
      .map((researcher) => {
        let name = researcher.researcher.properties.name.split(" ")[0];
        if (name.includes("-")) {
          name = name.split("-")[0];
        }
        const years = Array.isArray(researcher.years) ? researcher.years : [researcher.years];

        const datasetByYear = years.map((year: any) => {
          const info = this.commonNames[name];
          const genero = info ? info.genero : "Unknown";
          const frecuencias = info ? info.frec_paises : {};

          return {
            year,
            name,
            genero,
            frecuencias,
          };
        });
        return datasetByYear;
      })
      .flat();

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
    const words = title.toLowerCase().split(" ").map((word) => word.replace(/[^\w\s]/g, ""));
    const wordsNoRepeat = words.map((word) => word.replace(/(.)\1+/g, "$1"));
    const singularWords = wordsNoRepeat.map((word) => singular(word));
    const filteredWords = singularWords.filter(
      (word) => !stopwords.includes(word)
    );
    const newTitle = filteredWords.join(" ");

    return newTitle;
  }

  getTopN(frequencies: Map<string, number>, n: number): [string, number][] {
    const sortedFrequencies = [...frequencies.entries()].sort((a, b) => b[1] - a[1]);
    return sortedFrequencies.slice(0, n);
  }

  getTopicAnalysis() {
    const stopwords = ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is","are","was","were","be","been","being","have","has","had","having","do", "does","did","doing","a","an","the","and","but","if","or","because","as","until","while","of","at","by", "for","with","about","against","between","into","through","during","before","after","above","below", "to","from","up","down","in","out","on","off","over","under","again","further","then","once","here", "there","when","where","why","how","all","any","both","each","few","more","most","other","some", "such","no","nor","not","only","own","same","so","than","too","very","s","t","can","will","just","don","should","now",".",","];

    const cleanTitles = this.papersAndarticlesWithAuthors.map((item) => {
      const ipName = this.clearTitle(item.ipName, stopwords);
      const year = parseInt(item.year);
      return { ipName, year };
    });

    const bigrams = this.generateNGrams(cleanTitles.map((item) => item.ipName),2);
    const trigrams = this.generateNGrams(cleanTitles.map((item) => item.ipName),3);
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

    const table1 = document.querySelector("#tableBigramas tbody");
    const table2 = document.querySelector("#tableTrigramas tbody");

    if (table1 instanceof HTMLElement && table2 instanceof HTMLElement) {
      top20BigramsWithYears.forEach(({ ngram, count, years }) => {
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);

        const row = document.createElement("tr");
        row.innerHTML = `<td>${ngram}</td><td>${count}</td><td>${minYear}</td><td>${maxYear}</td>`;

        table1.appendChild(row);
      });

      top20TrigramsWithYears.forEach(({ ngram, count, years }) => {
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);

        const row = document.createElement("tr");
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
      weight: this.calculateWeight(
        item.count,
        maxFrecuencia,
        minWeight,
        maxWeight
      ),
      color: this.statisticsChart.getRandomColor(index),
    }));

    this.cloudData = wordCloudData;
  }

  calculateWeight(
    frec: number,
    maxFrec: number,
    minWeight: number,
    maxWeight: number
  ): number {
    const weight = frec / maxFrec;
    const normWeight = weight * (maxWeight - minWeight) + minWeight;
    return Math.round(normWeight);
  }

  statsResearchers() {
    const names = new Set(this.researchers.map((researcher) => researcher.name));
    this.ConferencesAndJournalAuthors = names.size;
    this.statsAuthors = [];
    const unifiedNames = new Set(
      Array.from(names).map((name) => {
        if (name === "Business Process Management") {
          return "BPM";
        }
        return name;
      })
    );
    
    this.statsAuthors = Array.from(unifiedNames).map((name) => {
      const years = this.stadisticsService.selectedYears;
      years.sort((a, b) => parseInt(a) - parseInt(b));
      this.selectedYears = years;
      const numResearchersPorAnio = years.map((anio) =>
        this.researchers.reduce((total, researcher) => {
          if ((researcher.name === name || (name === "BPM" && researcher.name === "Business Process Management")) && researcher.years.includes(anio)) {
            return total + 1;
          }
          return total;
        }, 0)
      );
      return {
        name: name,
        years: years,
        numResearchers: numResearchersPorAnio,
      };
    });
  }

  statsPapersAndArticles() {
    // Preprocesamiento: Fusionar datos de "Business Process Management" en "BPM"
    this.PapersAndArticles = this.PapersAndArticles.map(item => {
      if (item.name === "Business Process Management") {
        return { ...item, name: "BPM" };
      }
      return item;
    });
  
    // Eliminar duplicados "Business Process Management"
    this.PapersAndArticles = this.PapersAndArticles.filter(
      item => item.name !== "Business Process Management"
    );
  
    // Continuar con el procesamiento normal
    const names = new Set(this.PapersAndArticles.map((item) => item.name));
    this.ConferencesAndJournalCount = names.size;
    this.statsPaperAndArticle = Array.from(names).map((name) => {
      let years = this.PapersAndArticles.map((item) => item.year);
      years = years.filter(
        (value, index, self) => self.indexOf(value) === index
      );
      years.sort((a, b) => parseInt(a) - parseInt(b));
      const numPapersAndArticlesPorAnio = years.map((year) =>
        this.PapersAndArticles.reduce((total, item) => {
          const numPapersAndArticles = item.numPapersAndArticles.low;
          if (item.name === name && item.year === year) {
            return total + numPapersAndArticles;
          }
          return total;
        }, 0)
      );
      return {
        name: name,
        years: years,
        numResearchers: numPapersAndArticlesPorAnio,
      };
    });
  
    console.log(this.statsPaperAndArticle);
    this.statisticsChart.generateChartJournalsAndVenue("lineChart2", this.statsPaperAndArticle);
  }
  

  statsColaboraciones() {
    let colabsXtotal: {year: number; numColabs: number; numPapersAndArticles: number;}[] = [];

    const colabsPapers = this.PapersAndArticles.map((item) => {
      const colab = this.collaborations.find((c) => c.year === item.year);
      const integer = item.numPapersAndArticles.low;
      return {
        year: item.year,
        numColabs: colab ? colab.numColabs : 0,
        numPapersAndArticles: integer,
      };
    });
    colabsXtotal = colabsXtotal.concat(colabsPapers);

    const densidadesPorAño: { [key: number]: number } = {};
    colabsXtotal.forEach((dato) => {
      const { year, numColabs, numPapersAndArticles } = dato;
      if (!densidadesPorAño[year]) {
        densidadesPorAño[year] = 0;
      }
      densidadesPorAño[year] += numColabs / numPapersAndArticles;
    });

    const density = Object.entries(densidadesPorAño).map(([year, density]) => ({
      year: parseInt(year),
      density,
    }));

    this.statistics[3] = {
      years: density.map((dato) => dato.year),
      densidades: density.map((dato) => dato.density),
    };
  }

  statsSingleAuthor() {
    const papersWithAuthors: {
      ipName: string;
      numAuthors: number;
      authorNames: string[];
      year: string;
    }[] = [];

    this.singleAuthor.forEach(
      (author: { ipNames: string[]; researcher: string; year: string }) => {
        author.ipNames.forEach((ipName) => {
          const paperIndex = papersWithAuthors.findIndex(
            (paper) => paper.ipName === ipName
          );
          if (paperIndex !== -1) {
            papersWithAuthors[paperIndex].numAuthors++;
            papersWithAuthors[paperIndex].authorNames.push(author.researcher);
          } else {
            papersWithAuthors.push({
              ipName,
              numAuthors: 1,
              authorNames: [author.researcher],
              year: author.year,
            });
          }
        });
      }
    );

    this.papersAndarticlesWithAuthors = papersWithAuthors;

    const papersAndarticlesWithOneAuthor = papersWithAuthors.filter(
      (item) => item.numAuthors === 1
    );

    const porcentajeByYear = this.PapersAndArticles.map((item) => {
      const year = item.year;
      const numPapersAndArticles = item.numPapersAndArticles.low;
      const numPapersAndArticlesWithSingleAuthor =
        papersAndarticlesWithOneAuthor.filter(
          (item) => item.year === year
        ).length;
      const percentage =
        (numPapersAndArticlesWithSingleAuthor / numPapersAndArticles) * 100;

      return { year, percentage };
    });

    this.statistics[4] = {
      years: porcentajeByYear.map((dato) => dato.year),
      percentages: porcentajeByYear.map((dato) => dato.percentage),
    };

    let years = this.statistics[4].years;
    let percentages = this.statistics[4].percentages;

    let dataByYear: any = {};

    for (let i = 0; i < years.length; i++) {
      let year = years[i];
      let percentage = percentages[i];

      if (!dataByYear[year]) {
        dataByYear[year] = [percentage];
      } else {
        dataByYear[year].push(percentage);
      }
    }

    let singleYear = [];
    let AveragePercentages = [];

    for (let año in dataByYear) {
      let percentageYear = dataByYear[año];
      let average =
        percentageYear.reduce((acc: any, curr: any) => acc + curr, 0) /
        percentageYear.length;

      singleYear.push(año);
      AveragePercentages.push(average);
    }

    this.statistics[4] = [];

    this.statistics[4].years = singleYear;
    this.statistics[4].percentages = AveragePercentages;

    this.singlePapersAndArticle = this.statistics[4];
    this.statisticsChart.generateBarChart("barChart1",this.translateService.instant("Statistics.Single"), this.statistics[4].years, this.statistics[4].percentages);
  }

  statsGeography(datasets: any[]) {
    const mappingDate: { [date: string]: { [country: string]: number } } = {};
    const datasetFiltered = datasets.filter(
      (object: any) => Object.keys(object.frecuencias).length > 0
    );

    const uniqueDates = [...new Set(datasetFiltered.map((dato) => dato.year))];

    for (const date of uniqueDates) {
      const objectDate = datasetFiltered.filter((dato) => dato.year === date);
      mappingDate[date] = {};

      for (const object of objectDate) {
        let countryHighest = "";
        let highestFrequency = -1;

        for (const country in object.frecuencias) {
          if (object.frecuencias[country] > highestFrequency) {
            countryHighest = country;
            highestFrequency = object.frecuencias[country];
          }
        }
        if (!(countryHighest in mappingDate[date])) {
          mappingDate[date][countryHighest] = 1;
        } else {
          mappingDate[date][countryHighest] =
            mappingDate[date][countryHighest] + 1;
        }
      }
    }

    for (const year in mappingDate) {
      let total = 0;
      for (const country in mappingDate[year]) {
        total += mappingDate[year][country];
      }
      for (const country in mappingDate[year]) {
        mappingDate[year][country] = Number(
          (mappingDate[year][country] / total).toFixed(4)
        );
      }
    }

    const years = Object.keys(mappingDate);

    const countries = Object.keys(mappingDate[years[0]]) ;
    const datasetsLabels = countries;

    const datasetsData = countries.map((country) =>
      years.map((year) => mappingDate[year][country])
    );

    this.statisticsChart.generateMultipleChart("lineChart5", years, datasetsLabels, datasetsData);
  }

  filterAuthorsByDecade(authors: Author[], startYear: number, endYear: number ): Author[] {
    const filteredAuthors: Author[] = [];

    authors.forEach((author) => {
      const authorYears = author.year.split(",").map(Number).filter((year) => year >= startYear && year <= endYear);

      if (authorYears.length > 0) {
        const existingAuthor = filteredAuthors.find(
          (filteredAuthor) => filteredAuthor.researcher === author.researcher && filteredAuthor.VenueOrJournal === author.VenueOrJournal
        );
        if (existingAuthor) {
          existingAuthor.numPublications += author.numPublications;
          existingAuthor.year += `, ${author.year}`;
        } else {
          filteredAuthors.push({
            ipNames: author.ipNames,
            numPublications: author.numPublications,
            researcher: author.researcher,
            year: author.year,
            VenueOrJournal: author.VenueOrJournal,
          });
        }
      }
    });

    return filteredAuthors;
  }

  statsProlificAuthors(selectedYears: number[]): DecadeStats[] {
    const startYear = Math.min(...selectedYears);
    const endYear = Math.max(...selectedYears);

    const startDecade = Math.floor(startYear / 10) * 10;
    const endDecade = Math.floor(endYear / 10) * 10;

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
        authors: decadeAuthors,
      });
    }

    return decades;
  }

  generateTablesDecades(decadeStats: any[]) {
    const tables: { [key: string]: HTMLElement | null } = {
      "1990s": document.querySelector("#table90 tbody"),
      "2000s": document.querySelector("#table00 tbody"),
      "2010s": document.querySelector("#table10 tbody"),
      "2020s": document.querySelector("#table20 tbody"),
    };
  
    let uniqueVenues: Set<string> = new Set();
    decadeStats.forEach((decade) => {
      decade.authors.forEach((autor: { VenueOrJournal: string }) => {
        uniqueVenues.add(autor.VenueOrJournal);
      });
    });
  
    for (const decade of decadeStats) {
      const table = tables[decade.label];
      if (table instanceof HTMLElement) {
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `<th>Autor</th>`;
  
        uniqueVenues.forEach((venue) => {
          const th = document.createElement("th");
          th.textContent = venue;
          th.style.padding = "5px";
          headerRow.appendChild(th);
        });
  
        headerRow.style.fontSize = "1.2em";
        table.appendChild(headerRow);
  
        const authorsMap = new Map<string, { [key: string]: number }>();
  
        decade.authors.forEach((autor: { researcher: string; numPublications: number; VenueOrJournal: string }) => {
          if (!authorsMap.has(autor.researcher)) {
            authorsMap.set(autor.researcher, {});
          }
          const authorVenues = authorsMap.get(autor.researcher)!;
          authorVenues[autor.VenueOrJournal] = (authorVenues[autor.VenueOrJournal] || 0) + autor.numPublications;
        });
  
        const sortedAuthors = Array.from(authorsMap.entries()).sort((a, b) => {
          const totalA = Object.values(a[1]).reduce((sum, num) => sum + num, 0);
          const totalB = Object.values(b[1]).reduce((sum, num) => sum + num, 0);
          return totalB - totalA;
        });
  
        const limitedAuthors = sortedAuthors.slice(0, 30);
  
        limitedAuthors.forEach(([researcher, authorVenues]) => {
          const row = document.createElement("tr");
          row.innerHTML = `<td>${researcher}</td>`;
  
          uniqueVenues.forEach((venue) => {
            row.innerHTML += `<td>${authorVenues[venue] || 0}</td>`;
          });
  
          table.appendChild(row);
        });
      }
    }
  }

  statsDegreeAuthors(selectedYears: number[]) {
    const startYear = Math.min(...selectedYears);
    const endYear = Math.max(...selectedYears);

    const allAuthors = this.filterAuthorsByDecade(
      this.singleAuthor,
      startYear,
      endYear
    );
    const topAuthors = allAuthors
      .sort((a, b) => b.numPublications - a.numPublications)
      .slice(0, 20);

    const tables = {
      degree: document.querySelector("#degree tbody"),
    };

    for (const author of topAuthors) {
      const table = tables["degree"];

      if (table instanceof HTMLElement) {
        const yearsArray = author.year.split(",").map(Number);
        const minYear = Math.min(...yearsArray);
        const maxYear = Math.max(...yearsArray);

        const row = document.createElement("tr");
        row.innerHTML = `<td >${author.researcher}</td><td >${author.numPublications}</td><td >${minYear}</td> <td >${maxYear}</td><td >${author.VenueOrJournal}</td>`;

        table.appendChild(row);
      }
    }
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

      const sortedData: { [anio: string]: { hombres: number; mujeres: number; total: number} } = {};
      const men = datasetsByGenre["Men"] || [];
      const women = datasetsByGenre["Women"] || [];

      men.forEach(dato => {
        const year = dato.year;
        const count = dato.count;

        sortedData[year] = { hombres: count, mujeres: 0, total: count };
      });

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

      this.organizedYears = Object.keys(sortedData).sort();

      this.countMen = this.organizedYears.map(anio => Number((sortedData[anio].hombres/(sortedData[anio].total)).toFixed(4)));
      
      this.countWomen = this.organizedYears.map(anio => Number((sortedData[anio].mujeres/(sortedData[anio].total)).toFixed(4)));
      this.statisticsChart.generateCircularChart('lineChart4', this.organizedYears, [this.translateService.instant('Statistics.Men'), this.translateService.instant('Statistics.Women')], [ this.countMen,  this.countWomen]);
      this.statisticsChart.generateMultipleChart('lineChart8', this.organizedYears, [this.translateService.instant('Statistics.Men'), this.translateService.instant('Statistics.Women')], [ this.countMen,  this.countWomen]);
  }

  loadCommonNames() {
    this.http
      .get("assets/common_names.txt", { responseType: "text" })
      .subscribe(
        (data: string) => {
          this.commonNames = this.parseCommonNames(data);
        },
        (error: any) => {
          console.error("Error in get assets/common_names.txt", error);
        }
      );
  }

  parseCommonNames(data: string) {
    const lines = data.split("\n");
    const dict: {[key: string]: { frec_paises: { [key: string]: number }; genero: string };} = {};
    let currentName = "";
    let currentData: {frec_paises: { [key: string]: number };genero: string;} = {
      frec_paises: {},
      genero: "",
    };

    for (const linea of lines) {
      if (linea.startsWith("nombre:")) {
        currentName = linea.split(":")[1].trim();
        currentData = { frec_paises: {}, genero: "" };
      } else if (linea.startsWith("frec_paises:")) {
        const frec_paisesStr = linea.substring(
          linea.indexOf("{"),
          linea.lastIndexOf("}") + 1
        );
        const frec_paises = JSON.parse(frec_paisesStr);
        currentData.frec_paises = frec_paises;
      } else if (linea.startsWith("genero:")) {
        currentData.genero = linea.split(":")[1].trim();
      } else if (linea.trim() === "") {
        dict[currentName] = currentData;
      }
    }
    return dict;
  }

  async waitResearcherNoEmpty() {
    while (!this.researchers || this.researchers.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async waitPapersAndArticlesNoEmpty() {
    while (!this.PapersAndArticles || this.PapersAndArticles.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async waitAuthorsWithPapersAndArticlesNoEmpty() {
    while (!this.papersAndarticlesWithAuthors || this.papersAndarticlesWithAuthors.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async waitSingleAuthorsNoEmpty() {
    while (!this.singleAuthor || this.singleAuthor.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async waitCommonNames() {
    while (!this.commonNames || Object.keys(this.commonNames).length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async main() {
    try {
      if (this.stadisticsService.ConferenceOrJournalConfirm != this.stadisticsService.getConferenceOrJournalName()) {
        this.getConferencebyProceeding();
      } else {
        this.generateTablesProceeding(this.stadisticsService.ConferenceOrJournalNames, this.stadisticsService.years, this.stadisticsService.inprocedings);
      }
      this.getResearchersConferenceAndJournals();
      this.getPapersAndArticles();
      this.getConferencebyProceeding();
      this.getConnectedComponentsYears();

      if (this.researchers.length == 0 || Object.keys(this.commonNames).length === 0) {
        await this.waitResearcherNoEmpty();
        await this.waitCommonNames();
        this.getDemographicData();
      } else {
        this.getDemographicData();
      }

      if (this.PapersAndArticles.length == 0) {
        await this.waitPapersAndArticlesNoEmpty();
        this.getCollaborations();
        this.getAuthorsPapersAndArticles();
      } else {
        this.getCollaborations();
        this.getAuthorsPapersAndArticles();
      }

      while (this.collaborations.length < 1) {
        this.loadingTable2 = true;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        this.spinnerService.show();
      }
      this.loadingTable2 = false;

      if (this.papersAndarticlesWithAuthors.length == 0) {
        await this.waitAuthorsWithPapersAndArticlesNoEmpty();
        this.getTopicAnalysis();
        this.getDistributions();
      } else {
        this.getTopicAnalysis();
        this.getDistributions();
      }

      if (this.singleAuthor.length == 0) {
        await this.waitSingleAuthorsNoEmpty();
        this.decadeStats = this.statsProlificAuthors(this.selectedYears);
        this.generateTablesDecades(this.decadeStats);
      } else {
        this.decadeStats = this.statsProlificAuthors(this.selectedYears);
        this.generateTablesDecades(this.decadeStats);
        this.getnewComers();
      }
      this.statsDegreeAuthors(this.selectedYears);

      while (this.stadisticsService.ConferenceOrJournalNames.length < 1) {
        this.loadingTable1 = true;
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.spinnerService.show();
      }
      this.loadingTable1 = false;
      this.stadisticsService.ConferenceOrJournalConfirm =
        this.stadisticsService.getConferenceOrJournalName();
    } catch (error) {
      console.error("Error in main with:", error);
    }
  }
}