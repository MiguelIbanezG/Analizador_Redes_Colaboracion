import { Component, OnInit, TemplateRef } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Observable, Subscription, map, startWith } from 'rxjs';
import { Router } from '@angular/router';
import { StadisticsService } from '../services/stadistics.service';
import { FormControl } from '@angular/forms';
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
  selectAll = false;
  selectDecades = false;
  selectDecades2 = false;
  selectDecades3 = false;
  selectDecades4 = false;
  conferenceOption: string = "main";
  showYears: boolean = false;
  showDecades: boolean = false;
  repeated: boolean = false;
  noResultsFoundConference: boolean | undefined;
  noResultsFoundJournal: boolean | undefined;
  modalRef: BsModalRef | undefined;
  showButtons = false;
  filVenues: Observable<string[]> | undefined;
  control = new FormControl();

  //info


  constructor(
    private apiService: ApiService, 
    private router: Router,
    private stadisticsService: StadisticsService,
    private modalService: BsModalService,
    private infoService: InfoService,
    public homeService: HomeService
  ) { }
  
  async ngOnInit() {
    this.communities = this.homeService.Communities
    this.filVenues = this.control.valueChanges
    
    if(this.infoService.AllPublications < 1 && this.infoService.AllAuthors < 1 
      && this.infoService.AllAuthors < 1){
        this.getPublications();
        this.getAuthors();
        this.getConferences();
    }

    await Promise.all([
      this.getPublicationsbyYear(),
      this.getAuthorsbyYear(),
      this.getConferencesbyYear()
    ]);
    
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
      const conference = suggestion.trim();

    if(this.filterComunities.includes(conference)){
      this.repeated = true;
    }else{
      this.repeated = false;
    }
    
   
      this.apiService.getFilteredNodesConference([conference]).subscribe({
        next: (response: any[]) => {

          if (response.length !== 0) {

            this.noResultsFoundConference = false;

            if (!this.filtersList.includes(conference)) {
              this.filtersList.push(conference);
              
              const newFilters = this.filterComunities.filter(item => !this.filtersList.includes(item));

              this.filtersList = this.filtersList.concat(newFilters);
              this.filtersString  = this.filtersList.join(','); 
            }
          } else {
            this.noResultsFoundConference = true;
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

  execFunctionsYear(){
    this.showButtons= true;
    this.clear()
    this.getFilteredNodesJournal();
    this.getFilteredNodesConference();
    this.toggleYears();
  }

  execFunctionsDecades(){
    this.showButtons= true;
    this.clear()
    this.getFilteredNodesJournal();
    this.getFilteredNodesConference();
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
  }

  clear2(){
    this.filteredTitles = [];
    this.showButtons= false;
  }

  getFilteredNodesConference() {

    this.homeService.Communities.forEach(community => {

      if(community.selected == true){
        console.log("ddd" + community.selected)
        this.filterComunities = this.filterComunities.concat(community.filtersList);
      }else{
        // Puedes utilizar filter para eliminar elementos de this.filterComunities que estén en community.filtersList
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
        if(this.filteredTitles.length < 1){
          this.filteredTitles = Object.values(response.reduce((obj, item) => {
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
          console.log(this.noResultsFoundConference)

        }
      },
      error: (error: any) => {
        console.error('Error al obtener los resultados filtrados:', error);
      }
      
    });

  }

  getFilteredNodesJournal() {
    this.apiService.getFilteredNodesJournal(this.filtersString).subscribe({
      next: (response: any[]) => {
        // this.resultadosFiltrados = response.map(item => JSON.stringify(item));
        this.filteredResults = response.map(item => item);
        
        if(this.filteredTitles.length < 1){
          this.filteredTitles = Object.values(response.reduce((obj, item) => {
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
          console.log(this.noResultsFoundJournal)
        }

        
      },
      error: (error: any) => {
        console.error('Error al obtener los resultados filtrados:', error);
      }
    });
  }

  getPublicationsbyYear() {

    this.apiService.getPublicationsbyYear().subscribe({
      next: (response: any[]) => {
        this.infoService.PublicationsByYear = response; 
        this.infoService.PublicationsByYear.sort((a, b) => {
          return parseInt(a.yearName) - parseInt(b.yearName);
        });
        this.infoService.PublicationsCombined = this.infoService.PublicationsByYear.map(item => item.allPublications);  
      },
      error: (error: any) => {
        console.error('Error al obtener las publicaciones en getPublicationsbyYear:', error);
      }
    });
  }

  getAuthorsbyYear() {

    this.apiService.getAuthorsbyYear().subscribe({
      next: (response: any[]) => {
        this.infoService.AuthorsByYear = response; 
        this.infoService.AuthorsByYear.sort((a, b) => {
          return parseInt(a.yearName) - parseInt(b.yearName);
        });

        this.infoService.AuthorsCombined = this.infoService.AuthorsByYear.map(item => item.allAuthors);
  
      },
      error: (error: any) => {
        console.error('Error al obtener los autores en getAuthorsbyYear:', error);
      }
    });
  }

  getConferencesbyYear() {
 
    this.apiService.getConferencesbyYear().subscribe({
      next: (response: any[]) => {
        this.infoService.ConferencesByYear = response; 
        this.infoService.ConferencesByYear .sort((a, b) => {
          return parseInt(a.yearName) - parseInt(b.yearName);
        });
    
        this.infoService.ConferencesCombineds  = this.infoService.ConferencesByYear.map(item => item.allConferences);
 
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

  existSelectTitle(): boolean {
    let select = false;
    if (this.filteredTitles.some(titulo => titulo.selected)){
      select = true;
    }
    return select;
  }

  selectAlls() {
    if (this.filteredTitles.length > 0){
      for (let title of this.filteredTitles) {
        title.selected = this.selectAll;
      }
    }
  }

  selectDecade() {
    for (let year of this.filteredTitles) {
      if (year.title == "1989" || year.title == "1990" ||year.title == "1991" || year.title == "1992" ||
      year.title == "1993" || year.title == "1994" ||year.title == "1995" || year.title == "1996" ||
      year.title == "1997" || year.title == "1998" || year.title == "1999") {
        year.selected = this.selectDecades;
      } 
    }
  }

  selectDecade2() {
  
    for (let year of this.filteredTitles) {
      if (year.title == "2000" || year.title == "2001" ||year.title == "2002" ||year.title == "2003" ||
      year.title == "2004" || year.title == "2005" ||year.title == "2006" ||year.title == "2007" ||
      year.title == "2008" || year.title == "2009") {
        year.selected = this.selectDecades2;
      } 
    }
  }

  selectDecade3() {
  
    for (let year of this.filteredTitles) {
      if (year.title == "2010" ||year.title == "2011" ||year.title == "2012" ||
      year.title == "2013" || year.title == "2014" ||year.title == "2015" || year.title == "2016" ||
      year.title == "2017" || year.title == "2018" || year.title == "2019") {
        year.selected = this.selectDecades3;
      } 
    }
  }

  selectDecade4() {
  
    for (let year of this.filteredTitles) {
      if (year.title == "2020" ||year.title == "2021" ||year.title == "2022" ||
      year.title == "2023" || year.title == "2024"){
        year.selected = this.selectDecades4;
      } 
    }
  }

  titleChanged() {
    let all = true;
    for (let titulo of this.filteredTitles) {
      if (!titulo.selected) {
        all = false;
        break;
      }
    }
    for (let titulo of this.filteredTitles) {
      if (!titulo.selected) {
        all = false;
        break;
      }
    }
    this.selectAll = all;
  }


  generateStatistics() {

    const titles = this.filteredTitles.
    filter(titulo => titulo.selected).map(titulo => titulo.pr_objeto);

    console.log("quepasa"+JSON.stringify(titles))
    
   
    this.stadisticsService.addTitles(titles);
    const splitFilters = this.filtersString.split(',').map(filtersString => filtersString.trim());
    this.stadisticsService.flagNameVenue(splitFilters);
    console.log("aaTT"+splitFilters)

    this.router.navigateByUrl('/statistics');
  }

  generateConf() {

    this.router.navigateByUrl('/config');
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template)
  }

  closeModal() {
    this.modalRef?.hide();
  }


}
