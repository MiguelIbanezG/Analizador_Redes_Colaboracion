import { Component, OnInit, TemplateRef } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Observable, Subscription, map, startWith } from 'rxjs';
import { Router } from '@angular/router';
import { StadisticsService } from '../services/stadistics.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { InfoService } from '../services/info.service';
import { HomeService } from '../services/home.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  filtersString : string = '';
  filtersBOX: string = '';
  filtersList: string[] = [];
  communities: { name: string, filtersList: string[], selected: boolean  }[] = [];
  filterComunities: string[] = [];
  currentConferences: string[] = [];
  nameCommunity: string = '';
  completeConference: string[] = [];
  filteredResults: string[] = [];
  filteredTitles: { title: string, pr_objeto: any, selected: boolean }[] = [];
  filteredTitlesJournal: { title: string, pr_objeto: any, selected: boolean }[] = [];
  filteredTitlesConference: { title: string, pr_objeto: any, selected: boolean }[] = [];
  selectAll = false;
  selectDecades = false;
  selectDecades2 = false;
  selectDecades3 = false;
  selectDecades4 = false;
  conferenceOption: string = "main";
  showYears: boolean = false;
  showDecades: boolean = false;
  repeated: boolean = false;
  noResultsFoundConference = false;
  noResultsFoundJournal = false;
  modalRef: BsModalRef | undefined;
  showButtons = false;
 

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private stadisticsService: StadisticsService,
    private modalService: BsModalService,
    private infoService: InfoService,
    public homeService: HomeService
  ) { }
  
  ngOnInit() {
    this.communities = this.homeService.Communities   
  }

  autocompleteConference(term: string): void {
    this.apiService.autocompleteConference(term).subscribe({
      next: (response: string[]) => {
        this.completeConference = response;
      },
      error: (error: any) => {
        console.error('Error in autocompleteConference', error);
      }
    });
  }


  isFilteringDisabled(): boolean {
    return this.filtersList.length === 0 && this.homeService.Communities.every(community => !community.selected);
  }

  completeSuggestion(suggestion: string) {


    if (suggestion.trim() !== '') {
      const filtros = suggestion.trim();

    if(this.filterComunities.includes(filtros)){
      this.repeated = true;
    }else{
      this.repeated = false;
    }
    
   
      this.apiService.getFilteredNodesConference([filtros]).subscribe({
        next: (response: any[]) => {

          if (response.length !== 0) {

            this.noResultsFoundConference = false;

            if (!this.filtersList.includes(filtros)) {
              this.filtersList.push(filtros);
              
              const newFilters = this.filterComunities.filter(item => !this.filtersList.includes(item));

              this.filtersList = this.filtersList.concat(newFilters);
              this.filtersString  = this.filtersList.join(','); 
            }
          } else {

            this.apiService.getFilteredNodesJournal([filtros]).subscribe({
              next: (response: any[]) => {
      
                if (response.length !== 0) {
      
                  this.noResultsFoundJournal = false;
      
                  if (!this.filtersList.includes(filtros)) {
                    this.filtersList.push(filtros);
                    const newFilters = this.filterComunities.filter(item => !this.filtersList.includes(item));
      
                    this.filtersList = this.filtersList.concat(newFilters);
                    this.filtersString  = this.filtersList.join(','); 
                  }

                  for (const filter of this.filtersList) {
                    if (!this.filterComunities.includes(filter)) {
                        this.currentConferences.push(filter);
                   
                    }
        
                    const filtersListSinDuplicados: string[] = this.currentConferences.filter((valor, indice, self) => {
                      return self.indexOf(valor) === indice;
                    });
        
                    this.currentConferences = filtersListSinDuplicados
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
          for (const filter of this.filtersList) {
            if (!this.filterComunities.includes(filter)) {
                this.currentConferences.push(filter);
           
            }

            const filtersListSinDuplicados: string[] = this.currentConferences.filter((valor, indice, self) => {
              return self.indexOf(valor) === indice;
            });

            this.currentConferences = filtersListSinDuplicados
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

  selectSuggestion(suggestion: string) {
    this.filtersBOX = suggestion;
  }

  deleteFilter(filter: string) {
    const i = this.filtersList.indexOf(filter);
    if (i !== -1) {
      this.filtersList.splice(i, 1); 
      this.filtersString = this.filtersList.join(',');
    }

    const R = this.currentConferences.indexOf(filter);
    if (R !== -1) {
      this.currentConferences.splice(i, 1); 
    }
  }

  deleteCommunity(communityToDelete: { name: string, filtersList: string[], selected: boolean }) {
 
    this.homeService.Communities = this.homeService.Communities.filter(community => {

      return !(community.name === communityToDelete.name && community.filtersList === communityToDelete.filtersList && community.selected === communityToDelete.selected);
    });
    
    for (const filter of communityToDelete.filtersList) {
            
      const i = this.filtersList.indexOf(filter);
      if (i !== -1) {
        this.filtersList.splice(i, 1); 
        this.filtersString = this.filtersList.join(',');
      }


    }

  }

  createCommunity(filtersList: string[]){
   
    this.homeService.Communities.push({ name: this.nameCommunity, filtersList: filtersList, selected: false });
    this.communities = this.homeService.Communities
    this.closeModal()
    this.nameCommunity = '';

    this.filtersList = [];
    this.currentConferences = [];

  }

  async waitTitlesNoEmpty() {
    while (!this.filteredTitles || this.filteredTitles.length === 0 ) {
      await new Promise(resolve => setTimeout(resolve, 100)); 
    }
  }

  execFunctionsYear(){
    this.showButtons= true;
    this.filteredTitlesJournal = [];
    this.filteredTitlesConference = [];
    this.filteredTitles = [];
    this.getFilteredNodesJournal();
    this.getFilteredNodesConference();
    this.waitTitlesNoEmpty();
    const uniqueTitles: { title: string; pr_objeto: any; selected: boolean; }[] = [];
    
    for (const title of this.filteredTitles) {
        if (!uniqueTitles.some(existingTitle => existingTitle.title == title.title)) {
            uniqueTitles.push(title);
        }
    }
    this.toggleYears();
  }

  execFunctionsDecades(){
    this.showButtons= true;
    this.filteredTitlesJournal = [];
    this.filteredTitlesConference = [];
    this.filteredTitles = [];
    this.getFilteredNodesJournal();
    this.getFilteredNodesConference();
    this.waitTitlesNoEmpty();
    this.toggleDecades();
  }

  toggleYears() {
    this.showYears = !this.showYears;
      if(this.showDecades == true){
        this.showDecades = false;
      }
  }

  toggleDecades() {
    this.showDecades = !this.showDecades;
      if(this.showYears == true){
        this.showYears = false;
      }
  }

  clear(){
    this.filteredTitles = [];
    this.filtersList = [];
    this.filteredTitlesConference = [];
    this.filteredTitlesJournal = [];
    this.completeConference = [];
    this.currentConferences = [];
    this.filteredTitlesJournal = [];
    this.filteredTitlesConference = [];
    this.showButtons= false;
  }

  getFilteredNodesConference() {

    this.homeService.Communities.forEach(community => {

      if(community.selected == true){
        this.filterComunities = this.filterComunities.concat(community.filtersList);
      }else{
        this.filterComunities = this.filterComunities.filter(filterItem => !community.filtersList.includes(filterItem));
        this.filtersList = this.filtersList.filter(filterItem => !community.filtersList.includes(filterItem));
      }
    
    });

    this.filtersList = this.filtersList.concat(this.filterComunities);
    this.filtersString  = this.filtersList.join(','); 

    this.filtersList = this.filtersList.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    this.filterComunities = this.filterComunities.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    this.apiService.getFilteredNodesConference(this.filtersList).subscribe({
      next: (response: any[]) => {
        // this.resultadosFiltrados = response.map(item => JSON.stringify(item));
        this.filteredResults = response.map(item => item);
        if(this.filteredTitlesConference.length < 1){
          this.filteredTitlesConference = Object.values(response.reduce((obj, item) => {
            const yearNode = item.properties;
            obj[yearNode.name] = {
              title: yearNode.name,
              pr_objeto: item,
              selected: false
            };
            return obj;
          }, {}));
          if (this.filteredResults.length === 0) {
            this.noResultsFoundConference = true;
          } else {
            this.noResultsFoundConference = false;
          }
        }
        this.filteredTitles = [];
        this.filteredTitles = [...this.filteredTitlesJournal, ...this.filteredTitlesConference];
        const uniqueTitles: { title: string; pr_objeto: any; selected: boolean; }[] = [];

        for (const title of this.filteredTitles) {
            if (!uniqueTitles.some(existingTitle => existingTitle.title == title.title)) {
                uniqueTitles.push(title);
            }
        }

        function compararPorAño(a: { title: string; }, b: { title: string; }) {
          const yearA = parseInt(a.title);
          const yearB = parseInt(b.title);
          return yearA - yearB;
        }

        uniqueTitles.sort(compararPorAño);
    
        this.filteredTitles = uniqueTitles;
        
      },
      error: (error: any) => {
        console.error('Error al obtener los resultados filtrados:', error);
      }
      
    });

  }

  getFilteredNodesJournal() {

    this.homeService.Communities.forEach(community => {

      if(community.selected == true){
        this.filterComunities = this.filterComunities.concat(community.filtersList);
      }else{
        this.filterComunities = this.filterComunities.filter(filterItem => !community.filtersList.includes(filterItem));
        this.filtersList = this.filtersList.filter(filterItem => !community.filtersList.includes(filterItem));
      }
    
    });

    this.filtersList = this.filtersList.concat(this.filterComunities);
    this.filtersString  = this.filtersList.join(','); 

    this.filtersList = this.filtersList.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    this.filterComunities = this.filterComunities.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    this.apiService.getFilteredNodesJournal(this.filtersList).subscribe({
      next: (response: any[]) => {
        // this.resultadosFiltrados = response.map(item => JSON.stringify(item));
        this.filteredResults = response.map(item => item);
        if(this.filteredTitlesJournal.length < 1){
          this.filteredTitlesJournal = Object.values(response.reduce((obj, item) => {
            const yearNode = item.properties;
            obj[yearNode.name] = {
              title: yearNode.name,
              pr_objeto: item,
              selected: false
            };
            return obj;
          }, {}));

          if (this.filteredResults.length === 0) {
            this.noResultsFoundJournal = true;
          } else {
            this.noResultsFoundJournal = false;
          }
        }
        this.filteredTitles = [];
        this.filteredTitles = [...this.filteredTitlesJournal, ...this.filteredTitlesConference];
        const uniqueTitles: { title: string; pr_objeto: any; selected: boolean; }[] = [];

        for (const title of this.filteredTitles) {
            if (!uniqueTitles.some(existingTitle => existingTitle.title == title.title)) {
                uniqueTitles.push(title);
            }
        }

        function compararPorAño(a: { title: string; }, b: { title: string; }) {
          const yearA = parseInt(a.title);
          const yearB = parseInt(b.title);
          return yearA - yearB;
        }

        uniqueTitles.sort(compararPorAño);
    
        this.filteredTitles = uniqueTitles;
      },
      error: (error: any) => {
        console.error('Error al obtener los resultados filtrados:', error);
      }
      
    });
  }

  existSelectTitle(): boolean {
    let select = false;
    if (this.filteredTitlesJournal.some(titulo => titulo.selected) || this.filteredTitlesConference.some(titulo => titulo.selected)){
      select = true;
    }
    return select;
  }

  selectAlls() {
    if (this.filteredTitlesConference.length > 0 || this.filteredTitlesJournal.length > 0){
      for (let title of this.filteredTitlesJournal) {
        title.selected = this.selectAll;
      }
      for (let title of this.filteredTitlesConference) {
        title.selected = this.selectAll;
      }
    }
  }

  selectDecade() {
    for (let year of this.filteredTitlesConference) {
      if (year.title == "1989" || year.title == "1990" ||year.title == "1991" || year.title == "1992" ||
      year.title == "1993" || year.title == "1994" ||year.title == "1995" || year.title == "1996" ||
      year.title == "1997" || year.title == "1998" || year.title == "1999") {
        year.selected = this.selectDecades;
      } 
    }
    for (let year of this.filteredTitlesJournal) {
      if (year.title == "1989" || year.title == "1990" ||year.title == "1991" || year.title == "1992" ||
      year.title == "1993" || year.title == "1994" ||year.title == "1995" || year.title == "1996" ||
      year.title == "1997" || year.title == "1998" || year.title == "1999") {
        year.selected = this.selectDecades;
      } 
    }
  }

  selectDecade2() {
  
    for (let year of this.filteredTitlesConference) {
      if (year.title == "2000" || year.title == "2001" ||year.title == "2002" ||year.title == "2003" ||
      year.title == "2004" || year.title == "2005" ||year.title == "2006" ||year.title == "2007" ||
      year.title == "2008" || year.title == "2009") {
        year.selected = this.selectDecades2;
      } 
    }
    for (let year of this.filteredTitlesJournal) {
      if (year.title == "2000" || year.title == "2001" ||year.title == "2002" ||year.title == "2003" ||
      year.title == "2004" || year.title == "2005" ||year.title == "2006" ||year.title == "2007" ||
      year.title == "2008" || year.title == "2009") {
        year.selected = this.selectDecades2;
      } 
    }
  }

  selectDecade3() {
  
    for (let year of this.filteredTitlesConference) {
      if (year.title == "2010" ||year.title == "2011" ||year.title == "2012" ||
      year.title == "2013" || year.title == "2014" ||year.title == "2015" || year.title == "2016" ||
      year.title == "2017" || year.title == "2018" || year.title == "2019") {
        year.selected = this.selectDecades3;
      } 
    }

    for (let year of this.filteredTitlesJournal) {
      if (year.title == "2010" ||year.title == "2011" ||year.title == "2012" ||
      year.title == "2013" || year.title == "2014" ||year.title == "2015" || year.title == "2016" ||
      year.title == "2017" || year.title == "2018" || year.title == "2019") {
        year.selected = this.selectDecades3;
      } 
    }
  }

  selectDecade4() {
  
    for (let year of this.filteredTitlesConference) {
      if (year.title == "2020" ||year.title == "2021" ||year.title == "2022" ||
      year.title == "2023" || year.title == "2024"){
        year.selected = this.selectDecades4;
      } 
    }

    for (let year of this.filteredTitlesJournal) {
      if (year.title == "2020" ||year.title == "2021" ||year.title == "2022" ||
      year.title == "2023" || year.title == "2024"){
        year.selected = this.selectDecades4;
      } 
    }
  }

  titleChanged() {
    let all = true;

    for (let titulo1 of this.filteredTitles) {
      for (let titulo of this.filteredTitlesJournal) {
        if (titulo1.title == titulo.title) {
          if(titulo1.selected == true){
            titulo.selected == true;
          }
        }
      }
      for (let titulo of this.filteredTitlesConference) {
        if (titulo1.title == titulo.title) {
          if(titulo1.selected == true){
            titulo.selected == true;
          }
        }
      }
    }

    for (let titulo of this.filteredTitlesConference) {
      if (!titulo.selected) {
        all = false;
        break;
      }
    }
    for (let titulo of this.filteredTitlesJournal) {
      if (!titulo.selected) {
        all = false;
        break;
      }
    }

    this.selectAll = all;
  }

  activateLink() {
    this.homeService.setActiveLink(true);
  }


  async generateStatistics() {

    const titles = this.filteredTitlesConference.
    filter(titulo => titulo.selected).map(titulo => titulo.pr_objeto);
    
    const titles2 = this.filteredTitlesJournal
    .filter(titulo => titulo.selected && !this.filteredTitlesConference.map(titulo => titulo.title).includes(titulo.title))
    .map(titulo => titulo.pr_objeto);
    const titles3 = [...titles, ...titles2];
    const splitFilters = this.filtersString.split(',').map(filtersString => filtersString.trim());
    this.stadisticsService.cleanTitles();
    this.stadisticsService.addTitles(titles3);
    this.stadisticsService.flagNameVenue(splitFilters)

    this.activateLink();

    this.router.navigateByUrl('/statistics');

  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template)
  }

  closeModal() {
    this.modalRef?.hide();
  }


}
