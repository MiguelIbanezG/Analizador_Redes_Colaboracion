import { Component, OnInit, TemplateRef } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable, Subscription, map, startWith } from 'rxjs';
import { Router } from '@angular/router';
import { SelectionService } from '../selection.service';
import { FormControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {


  filtersString : string = '';
  filtersBOX: string = '';
  filtersList: string[] = [];
  communities: { name: string, filtersList: string[] }[] = [];
  selectedCommunities: { name: string, selectedFilter: string }[] = [];
  filterComunities: string[] = [];
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
  noResultsFoundConference: boolean | undefined;
  noResultsFoundJournal: boolean | undefined;
  modalRef: BsModalRef | undefined;
  showButtons = false;
  showAppend = false;
  showComunities = false;
  filVenues: Observable<string[]> | undefined;
  control = new FormControl();


  constructor(
    private apiService: ApiService, 
    private router: Router,
    private selectionService: SelectionService,
    private modalService: BsModalService,
  ) { }
  
  ngOnInit() {
    this.filVenues = this.control.valueChanges
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

  isSelected(item: { name: string, selectedFilter: string }): boolean {
    return this.selectedCommunities.some(selectedItem => selectedItem.name === item.name);
  }

  toggleSelection(item: { name: string, selectedFilter: string }): void {
    const index = this.selectedCommunities.findIndex(selectedItem => selectedItem.name === item.name);

    if (index !== -1) {
      // Desseleccionar si ya está seleccionado
      this.selectedCommunities.splice(index, 1);
    } else {
      // Seleccionar si no está seleccionado
      this.selectedCommunities.push(item);
    }
  }


  completeSuggestion(suggestion: string) {

    if (suggestion.trim() !== '') {
      const conference = suggestion.trim();
   
      this.apiService.getFilteredNodesConference([conference]).subscribe({
        next: (response: any[]) => {

          if (response.length !== 0) {

            this.noResultsFoundConference = false;
     
            if (!this.filtersList.includes(conference)) {
              this.filtersList.push(conference);
              this.filtersString  = this.filtersList.join(','); 
            }
          } else {
            this.noResultsFoundConference = true;
          }
        },
        error: (error: any) => {
          console.error('Error in getFilteredNodesConference:', error);
        },
        complete: () => {
          this.filtersBOX = "";
          this.showAppend = true;
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
  }

  deleteCommunity(communityToDelete: { name: string, selectedFilter: string }) {
    // Filtrar las comunidades para excluir la que se va a eliminar
    this.selectedCommunities = this.selectedCommunities.filter(community => {
      // Devolver true si la comunidad actual no coincide con la comunidad a eliminar
      return !(community.name === communityToDelete.name && community.selectedFilter === communityToDelete.selectedFilter);
    });
  }



  createCommunity(filtersList: string[]){
    this.communities.push({ name: this.nameCommunity, filtersList: filtersList });
    this.closeModal()
  }

  onFilterSelected(selectedCommunities: { name: string, selectedFilter: string }[]) {
 
    selectedCommunities.forEach(community => {
      this.filterComunities.push(community.selectedFilter);
    });
    this.showAppend = false;
    this.showComunities= true;

    this.filtersList = [];

    this.closeModal();

  
  
    

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

    const titles = this.filteredTitles
    .filter(titulo => titulo.selected).map(titulo => titulo.pr_objeto);
    
    this.selectionService.addTitles(titles);
    const splitFilters = this.filtersString.split(',').map(filtersString => filtersString.trim());
    this.selectionService.flagNameVenue(splitFilters);

    this.router.navigateByUrl('/statistics');
  }

  generateConf() {

    const titles = this.filteredTitles
    .filter(titulo => titulo.selected).map(titulo => titulo.pr_objeto);
    
    this.selectionService.addTitles(titles);
    const splitFilters = this.filtersString.split(',').map(filtersString => filtersString.trim());
    this.selectionService.flagNameVenue(splitFilters);

    this.router.navigateByUrl('/config');
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template)
  }

  closeModal() {
    this.modalRef?.hide();
  }


}
