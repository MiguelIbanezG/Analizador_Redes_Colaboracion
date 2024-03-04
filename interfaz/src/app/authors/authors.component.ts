import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Chart } from 'chart.js';
import { InfoService } from '../services/info.service';
import { SpinnerService } from '../services/spinner.service';
import { HomeService } from '../services/home.service';

@Component({
  selector: 'app-authors',
  templateUrl: './authors.component.html',
  styleUrl: './authors.component.scss'
})
export class AuthorsComponent{

  filtersBOX: string = '';
  completeConference: string[] = [];
  authors: string[] = [];
  publications: string[] = [];
  showPublications = false;

  constructor(
    private apiService: ApiService, 
    public homeService: HomeService
  ) { }
  
  autocompleteAuthor(term: string): void {
    this.apiService.autocompleteAuthors(term).subscribe({
      next: (response: string[]) => {
        this.completeConference = response;
      },
      error: (error: any) => {
        console.error('Error in autocompleteConference', error);
      }
    });
  }

  getAuthorsPublications(term: string[]): void {
    this.publications = []
    this.apiService.getAuthorsPublications(this.authors).subscribe({
      next: (response: string[]) => {
        this.publications = response;
        this.showPublications = true;
        this.generateTablePublications(this.publications);
        console.log(this.publications);
      },
      error: (error: any) => {
        console.error('Error in getAuthorsPublications', error);
      }
    });
  }

  completeSuggestion(suggestion: string) {


    if (suggestion.trim() !== '') {
      this.authors.push(suggestion.trim());
    }
      
  }

  selectSuggestion(suggestion: string) {
    this.filtersBOX = suggestion;
  }


  deleteFilter(filter: string) {

    const i = this.authors.indexOf(filter);
    if (i !== -1) {
      this.authors.splice(i, 1); 
    }
  }


  generateTablePublications(publications: any[]) {
    const table = document.querySelector('#tablePublications tbody');

    if (table instanceof HTMLElement) {
      table.innerHTML = '';
      publications.forEach(({ title, DayOfPublication, AuthorName}) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${title}</td><td>${DayOfPublication}</td><td>${AuthorName}</td>`;
  
        table.appendChild(row);
      });
    }

  }



}
