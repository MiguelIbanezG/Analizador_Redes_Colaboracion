import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { SelectionService } from '../selection.service';


@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit{
  
  titulosSeleccionados: any[] = [];
  conferenceOption: string = "";
  venueName: any[] = [];
  singleAuthor: any[] = [];
  papersWithAuthors: any[] = [];
  sortedProceedings: any[] = [];
  

  constructor(
    private apiService: ApiService,
    private seleccionService: SelectionService,
  ) {}



  ngOnInit() {
    this.main();
  }

  getBooks(){
    this.apiService.getBooks(this.titulosSeleccionados, this.venueName).subscribe({
      next: (response: any[]) => {
      this.sortedProceedings = response
      },
      error: (error: any) => {
        console.error('Error al obtener in getBooks:', error);
      }
    });
  }

  getAuthorsNames() {
      this.apiService.getAuthorsNames(this.titulosSeleccionados, this.conferenceOption, this.venueName)
        .subscribe({
          next: async (response: any) => {
            this.singleAuthor = response;
            this.statsSingleAuthor();
          },
          error: (error: any) => {
            console.error('Error in getAuthorsNames:', error);
          }
        });
  }


  statsSingleAuthor() {
    const papersWithAuthors: { ipName: string, authorName: string, year: string }[] = [];

    this.singleAuthor.forEach((author: { ipName: string, researcher: string, year: string }) => {
      papersWithAuthors.push({
        ipName: author.ipName,
        authorName: author.researcher,
        year: author.year
      });
    });
  
    this.papersWithAuthors = papersWithAuthors;

  }

  async main(){
    try {
      this.titulosSeleccionados = this.seleccionService.getSelectedTitles();
      this.conferenceOption = this.seleccionService.getConferenceOption();
      this.venueName = this.seleccionService.getVenueName();

      this.getAuthorsNames();
    

  } catch (error) {
    console.error('Error in getData:', error);
  }
  }
 
}

