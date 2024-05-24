import { Component, OnInit, TemplateRef } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { StadisticsService } from '../services/stadistics.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HomeService } from '../services/home.service';

import { LangChangeEvent, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  languagePage: String = "es";

  filtersString: string = '';
  filtersBOX: string = '';
  filterComunities: string[] = [];
  nameCommunity: string = '';
  completeTextBox: string[] = [];
  filteredResults: string[] = [];
  selectAll = false;
  showYears: boolean = false;
  showDecades: boolean = false;
  repeated: boolean = false;
  noResultsFoundConference = false;
  noResultsFoundJournal = false;
  modalRef: BsModalRef | undefined;
  selectYears = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private stadisticsService: StadisticsService,
    private modalService: BsModalService,
    public homeService: HomeService,
    private translate: TranslateService,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.languagePage = event.lang
    });
  }

  ngOnInit(): void {
    this.languagePage = this.translate.currentLang;
  }

  // API CALL: Function to autocomplete the text box.
  autocompleteTextBox(term: string): void {
    this.apiService.autocompleteConferenceAndJournals(term).subscribe({
      next: (response: string[]) => {
        this.completeTextBox = response;
      },
      error: (error: any) => {
        console.error('Error in autocompleteConference', error);
      }
    });
  }

  // Function to check that the chosen journal or conference exists and is not duplicated
  completeSuggestion(suggestion: string) {

    if (suggestion.trim() !== '') {
      const filtros = suggestion.trim();

      if (this.homeService.currentConferences.includes(filtros)) {
        this.repeated = true;
      } else {
        this.repeated = false;
      }

      this.apiService.getFilteredNodesConference([filtros]).subscribe({
        next: (response: any[]) => {

          if (response.length !== 0) {

            this.noResultsFoundConference = false;

            if (!this.homeService.filtersList.includes(filtros)) {
              this.homeService.filtersList.push(filtros);

              const newFilters = this.filterComunities.filter(item => !this.homeService.filtersList.includes(item));

              this.homeService.filtersList = this.homeService.filtersList.concat(newFilters);
              this.filtersString = this.homeService.filtersList.join(',');
            }
          } else {

            this.noResultsFoundConference = true;
            this.apiService.getFilteredNodesJournal([filtros]).subscribe({
              next: (response: any[]) => {

                if (response.length !== 0) {

                  this.noResultsFoundJournal = false;

                  if (!this.homeService.filtersList.includes(filtros)) {
                    this.homeService.filtersList.push(filtros);
                    const newFilters = this.filterComunities.filter(item => !this.homeService.filtersList.includes(item));

                    this.homeService.filtersList = this.homeService.filtersList.concat(newFilters);
                    this.filtersString = this.homeService.filtersList.join(',');
                  }

                  for (const filter of this.homeService.filtersList) {
                    if (!this.filterComunities.includes(filter)) {
                      this.homeService.currentConferences.push(filter);

                    }

                    const filtersListSinDuplicados: string[] = this.homeService.currentConferences.filter((valor, indice, self) => {
                      return self.indexOf(valor) === indice;
                    });

                    this.homeService.currentConferences = filtersListSinDuplicados
                  }
                } else {
                  this.noResultsFoundJournal = true;
                }

              },
              error: (error: any) => {
                console.error('Error in getFilteredNodesJournal:', error);
              },
              complete: () => {
                this.filtersBOX = "";
              }
            });
          }
          for (const filter of this.homeService.filtersList) {
            if (!this.filterComunities.includes(filter)) {
              this.homeService.currentConferences.push(filter);

            }

            const filtersListSinDuplicados: string[] = this.homeService.currentConferences.filter((valor, indice, self) => {
              return self.indexOf(valor) === indice;
            });

            this.homeService.currentConferences = filtersListSinDuplicados
          }
        },
        error: (error: any) => {
          console.error('Error in getFilteredNodesConference:', error);
        },
        complete: () => {
          this.filtersBOX = "";
        }
      });
    }
  }

  // Function to select conference o jorunal
  selectSuggestion(suggestion: string) {
    this.filtersBOX = suggestion;
  }

  // Function to delete the conference or journal
  deleteFilter(filter: string) {
    const i = this.homeService.filtersList.indexOf(filter);
    if (i !== -1) {
      this.homeService.filtersList.splice(i, 1);
      this.filtersString = this.homeService.filtersList.join(',');
    }

    const R = this.homeService.currentConferences.indexOf(filter);
    if (R !== -1) {
      this.homeService.currentConferences.splice(i, 1);
    }
  }

  // Function to delete Community
  deleteCommunity(communityToDelete: { name: string, filtersList: string[], selected: boolean }) {

    this.homeService.Communities = this.homeService.Communities.filter(community => {
      return !(community.name === communityToDelete.name && community.filtersList === communityToDelete.filtersList && community.selected === communityToDelete.selected);
    });

    for (const filter of communityToDelete.filtersList) {
      const i = this.homeService.filtersList.indexOf(filter);
      if (i !== -1) {
        this.homeService.filtersList.splice(i, 1);
        this.filtersString = this.homeService.filtersList.join(',');
      }
    }
  }

  // Function to create Community
  createCommunity(filtersList: string[]) {

    this.homeService.Communities.push({ name: this.nameCommunity, filtersList: filtersList, selected: false });
    this.closeModal()
    this.nameCommunity = '';
    this.homeService.filtersList = [];
    this.homeService.currentConferences = [];

  }

  // Function to wait for the titles of Confrenece or Journal
  async waitTitlesNoEmpty() {
    while (!this.homeService.filteredTitles || this.homeService.filteredTitles.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Function to search for the years of the selected conferences and journals
  execFunctionsYear() {
    this.homeService.filteredTitlesJournal = [];
    this.homeService.showButtons = false;
    this.homeService.filteredTitlesConference = [];
    this.homeService.filteredTitles = [];
    this.getFilteredNodesJournal();
    this.getYearsConference();
    this.waitTitlesNoEmpty();
    this.toggleYears();
  }

  // Function to search for the decades of the selected conferences and journals
  execFunctionsDecades() {
    this.homeService.showButtons = false;
    this.homeService.filteredTitlesJournal = [];
    this.homeService.filteredTitlesConference = [];
    this.homeService.filteredTitles = [];
    this.getFilteredNodesJournal();
    this.getYearsConference();
    this.waitTitlesNoEmpty();
    this.toggleDecades();
  }

  // Function to change the selection of years
  toggleYears() {
    this.showYears = !this.showYears;
    if (this.showDecades == true) {
      this.showDecades = false;
    }
  }

  // Function to change the selection of decades
  toggleDecades() {
    this.showDecades = !this.showDecades;
    if (this.showYears == true) {
      this.showYears = false;
    }
  }

  // Function to clear all selections
  clear() {
    this.homeService.filteredTitles = [];
    this.homeService.filtersList = [];
    this.homeService.filteredTitlesConference = [];
    this.homeService.filteredTitlesJournal = [];
    this.completeTextBox = [];
    this.homeService.currentConferences = [];
    this.homeService.filteredTitlesJournal = [];
    this.homeService.filteredTitlesConference = [];
    this.homeService.showButtons = false;
  }

  // API CALL: Function to search for the years of the conferences
  getYearsConference() {

    this.homeService.Communities.forEach(community => {
      if (community.selected == true) {
        this.filterComunities = this.filterComunities.concat(community.filtersList);
      } else {
        this.filterComunities = this.filterComunities.filter(filterItem => !community.filtersList.includes(filterItem));
        this.homeService.filtersList = this.homeService.filtersList.filter(filterItem => !community.filtersList.includes(filterItem));
      }
    });

    this.homeService.filtersList = this.homeService.filtersList.concat(this.filterComunities);
    this.filtersString = this.homeService.filtersList.join(',');

    this.homeService.filtersList = this.homeService.filtersList.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    this.filterComunities = this.filterComunities.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    this.apiService.getFilteredNodesConference(this.homeService.filtersList).subscribe({
      next: (response: any[]) => {

        this.filteredResults = response.map(item => item);

        if (this.homeService.filteredTitlesConference.length < 1) {
          this.homeService.showButtons = true;
          const uniqueYears = [...new Set(response)];

          this.homeService.filteredTitlesConference = uniqueYears.map(year => ({
            title: year,
            selected: false
          }));

          if (this.filteredResults.length === 0) {
            this.noResultsFoundConference = true;
          } else {
            this.noResultsFoundConference = false;
          }
        }

        this.homeService.filteredTitles = [];
        this.homeService.filteredTitles = [...this.homeService.filteredTitlesJournal, ...this.homeService.filteredTitlesConference];

        const uniqueTitlesSet = new Set(this.homeService.filteredTitles.map(title => title.title));

        this.homeService.filteredTitles = Array.from(uniqueTitlesSet).map(title => ({
          title,
          selected: false
        }));

        this.homeService.filteredTitles.sort((a, b) => {
          const yearA = parseInt(a.title, 10);
          const yearB = parseInt(b.title, 10);
          return yearA - yearB;
        });
      },
      error: (error: any) => {
        console.error('Error al obtener los resultados filtrados:', error);
      }
    });
  }

  // API CALL: Function to search for the years of the Journals
  getFilteredNodesJournal() {

    this.homeService.Communities.forEach(community => {

      if (community.selected == true) {
        this.filterComunities = this.filterComunities.concat(community.filtersList);
      } else {
        this.filterComunities = this.filterComunities.filter(filterItem => !community.filtersList.includes(filterItem));
        this.homeService.filtersList = this.homeService.filtersList.filter(filterItem => !community.filtersList.includes(filterItem));
      }

    });

    this.homeService.filtersList = this.homeService.filtersList.concat(this.filterComunities);
    this.filtersString = this.homeService.filtersList.join(',');

    this.homeService.filtersList = this.homeService.filtersList.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    this.filterComunities = this.filterComunities.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    this.apiService.getFilteredNodesJournal(this.homeService.filtersList).subscribe({
      next: (response: any[]) => {

        this.filteredResults = response.map(item => item);

        if (this.homeService.filteredTitlesJournal.length < 1) {
          this.homeService.showButtons = true;
          const uniqueYears = [...new Set(response)];

          this.homeService.filteredTitlesJournal = uniqueYears.map(year => ({
            title: year,
            selected: false
          }));

          if (this.filteredResults.length === 0) {
            this.noResultsFoundJournal = true;
          } else {
            this.noResultsFoundJournal = false;
          }
        }

        this.homeService.filteredTitles = [];
        this.homeService.filteredTitles = [...this.homeService.filteredTitlesJournal, ...this.homeService.filteredTitlesConference];

        const uniqueTitlesSet = new Set(this.homeService.filteredTitles.map(title => title.title));

        this.homeService.filteredTitles = Array.from(uniqueTitlesSet).map(title => ({
          title,
          selected: false
        }));

        this.homeService.filteredTitles.sort((a, b) => {
          const yearA = parseInt(a.title, 10);
          const yearB = parseInt(b.title, 10);
          return yearA - yearB;
        });
      },
      error: (error: any) => {
        console.error('Error al obtener los resultados filtrados:', error);
      }
    });
  }

  // Function to check if there is any selected year
  existSelectTitle() {
    if (this.homeService.filteredTitles.some(titulo => titulo.selected)) {
      this.selectYears = true;
    } else {
      this.selectYears = false;
    }
  }

  // Function to select all years
  selectAlls() {

    if (this.selectAll) {
      this.homeService.filteredTitles.forEach(title => {
        title.selected = true;
      });
    } else {
      this.homeService.filteredTitles.forEach(title => {
        title.selected = false;
      });
    }

    this.existSelectTitle();
  }

  // Select the decade of the 1980s
  selectDecade1980() {

    for (let year of this.homeService.filteredTitles) {
      if (year.title == "1979" || year.title == "1980" || year.title == "1981" || year.title == "1982" ||
        year.title == "1983" || year.title == "1984" || year.title == "1985" || year.title == "1986" ||
        year.title == "1987" || year.title == "1988" || year.title == "1989") {
        year.selected = true;
      }
    }
    this.existSelectTitle()
  }

  // Select the decade of the 1990s
  selectDecade1990() {
    for (let year of this.homeService.filteredTitles) {
      if (year.title == "1989" || year.title == "1990" || year.title == "1991" || year.title == "1992" ||
        year.title == "1993" || year.title == "1994" || year.title == "1995" || year.title == "1996" ||
        year.title == "1997" || year.title == "1998" || year.title == "1999") {
        year.selected = true;
      }
    }
    this.existSelectTitle()
  }

  // Select the decade of the 2000s
  selectDecade2000() {

    for (let year of this.homeService.filteredTitles) {
      if (year.title == "1999" || year.title == "2000" || year.title == "2001" || year.title == "2002" || year.title == "2003" ||
        year.title == "2004" || year.title == "2005" || year.title == "2006" || year.title == "2007" ||
        year.title == "2008" || year.title == "2009") {
        year.selected = true;
      }
    }
    this.existSelectTitle()
  }

  // Select the decade of the 2010s
  selectDecade2010() {

    for (let year of this.homeService.filteredTitles) {
      if (year.title == "2009" || year.title == "2010" || year.title == "2011" || year.title == "2012" ||
        year.title == "2013" || year.title == "2014" || year.title == "2015" || year.title == "2016" ||
        year.title == "2017" || year.title == "2018" || year.title == "2019") {
        year.selected = true;
      }
    }
    this.existSelectTitle()
  }

  // Select the decade of the 2020s
  selectDecade2020() {

    for (let year of this.homeService.filteredTitles) {
      if (year.title == "2019" || year.title == "2020" || year.title == "2021" || year.title == "2022" ||
        year.title == "2023" || year.title == "2024") {
        year.selected = true;
      }
    }
    this.existSelectTitle()
  }

  // Function to activate the statistics link
  activateLink() {
    this.homeService.setActiveLinkStatistics(true);
  }

  // Function to generate statistics.
  async generateStatistics() {

    const titles = this.homeService.filteredTitles.
      filter(titulo => titulo.selected).map(titulo => titulo.title);

    const splitFilters = this.filtersString.split(',').map(filtersString => filtersString.trim());
    this.stadisticsService.cleanTitles();
    this.stadisticsService.addTitles(titles);
    this.stadisticsService.flagConferenceOrJournalName(splitFilters)

    this.activateLink();
    this.router.navigateByUrl('/statistics');
  }

  // Function to open the modal
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template)
  }

  // Function to close the modal
  closeModal() {
    this.modalRef?.hide();
  }


}
