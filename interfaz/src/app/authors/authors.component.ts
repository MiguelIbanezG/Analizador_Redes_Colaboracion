import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { HomeService } from '../services/home.service';
import { AppNetworkInitService } from '../services/network.init.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authors',
  templateUrl: './authors.component.html',
  styleUrl: './authors.component.scss'
})

export class AuthorsComponent {

  filtersBOX: string = '';
  completeAuthor: string[] = [];
  authors: string[] = [];
  authorsQuery: string[] = [];
  publications: string[] = [];
  showPublications = false;
  networkData: string[] = [];
  noResults = false;
  repeated = false;
  

  constructor(
    private apiService: ApiService,
    public homeService: HomeService,
    private networkInitService: AppNetworkInitService,
    private router: Router,
  ) { }

  autocompleteAuthor(term: string): void {
    this.apiService.autocompleteAuthors(term).subscribe({
      next: (response: string[]) => {

        this.completeAuthor = response.map(author => {
          // Reemplazar caracteres especiales
          author = author.replace(/&aacute;/g, 'á')
            .replace(/&eacute;/g, 'é')
            .replace(/&iacute;/g, 'í')
            .replace(/&oacute;/g, 'ó')
            .replace(/&uacute;/g, 'ú')
            .replace(/&ntilde;/g, 'ñ')
            .replace(/&Aacute;/g, 'Á')
            .replace(/&Eacute;/g, 'É')
            .replace(/&Iacute;/g, 'Í')
            .replace(/&Oacute;/g, 'Ó')
            .replace(/&Uacute;/g, 'Ú')
            .replace(/&Ntilde;/g, 'Ñ')
            .replace(/&agrave;/g, 'à')
            .replace(/&egrave;/g, 'è')
            .replace(/&ograve;/g, 'ò')
            .replace(/&Agrave;/g, 'À')
            .replace(/&Egrave;/g, 'È')
            .replace(/&Ograve;/g, 'Ò')
            .replace(/&acirc;/g, 'â')
            .replace(/&Acirc;/g, 'Â')
            .replace(/&atilde;/g, 'ã')
            .replace(/&Atilde;/g, 'Ã')
            .replace(/&ouml;/g, 'ö')
            .replace(/&Ouml;/g, 'Ö');
          return author;
        });
        this.normalized()
      },
      error: (error: any) => {
        console.error('Error in autocompleteConference', error);
      }
    });
  }
  

  normalized() {
    const uniqueAuthors: string[] = [];
    const processedAuthors: string[] = [];

    for (const author of this.completeAuthor) {
        const normalizedAuthor = author.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (!processedAuthors.includes(normalizedAuthor)) {
            uniqueAuthors.push(author);
            processedAuthors.push(normalizedAuthor);
        }else{
          uniqueAuthors.push(normalizedAuthor);
          const index = uniqueAuthors.findIndex(a => a.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalizedAuthor);
            if (index !== -1) {
                uniqueAuthors.splice(index, 1); // Eliminar el autor que no está normalizado de uniqueAuthors
            }
        }

    }


    // Actualizar la lista completa de autores
    this.completeAuthor = uniqueAuthors;
}

  replace(){
    this.authorsQuery = this.authors.map(author => {
      // Reemplazar caracteres especiales
      author = author.replace(/á/g, '&aacute;')
        .replace(/é/g, '&eacute;')
        .replace(/í/g, '&iacute;')
        .replace(/ó/g, '&oacute;')
        .replace(/ú/g, '&uacute;')
        .replace(/ñ/g, '&ntilde;')
        .replace(/Á/g, '&Aacute;')
        .replace(/É/g, '&Eacute;')
        .replace(/Í/g, '&Iacute;')
        .replace(/Ó/g, '&Oacute;')
        .replace(/Ú/g, '&Uacute;')
        .replace(/Ñ/g, '&Ntilde;')
        .replace(/à/g, '&agrave;')
        .replace(/è/g, '&egrave;')
        .replace(/ò/g, '&ograve;')
        .replace(/À/g, '&Agrave;')
        .replace(/È/g, '&Egrave;')
        .replace(/Ò/g, '&Ograve;')
        .replace(/â/g, '&acirc;')
        .replace(/Â/g, '&Acirc;')
        .replace(/ã/g, '&atilde;')
        .replace(/Ã/g, '&Atilde;')
        .replace(/ö/g, '&ouml;')
        .replace(/Ö/g, '&Ouml;');
      return author;
    });

  }

  getAuthorsPublications(): void {
    this.publications = []
    this.replace();
    this.apiService.getAuthorsPublications(this.authorsQuery).subscribe({
      next: (response: string[]) => {
        this.publications = response;
        this.showPublications = true;
        this.generateTablePublications(this.publications);
      },
      error: (error: any) => {
        console.error('Error in getAuthorsPublications', error);
      }
    });

  }

  activateLink() {
    this.homeService.setActiveLinkNetwork(true);
  }

  async waitNetworks(){
    while (!this.networkInitService.nameAuthors || this.networkInitService.nameAuthors.length === 0 ) {
      await new Promise(resolve => setTimeout(resolve, 100)); 
    }
    this.activateLink();
    this.router.navigateByUrl('/network');
  }

  getNetworksAuthor(): void {
    this.replace();
    this.networkInitService.nameAuthors = [];
    this.apiService.getNetworksAuthor(this.authorsQuery).subscribe({
      next: (response: string[]) => {
        this.networkInitService.nameAuthors = response;
      },
      error: (error: any) => {
        console.error('Error in getNetworksAuthor', error);
      }
      
    });

    this.waitNetworks();
   
  }

  completeSuggestion(suggestion: string) {

    if (suggestion.trim() !== '') {

      const author:any[] = [suggestion.trim()]

      if(this.authors.includes(suggestion.trim())){
        this.repeated = true;
      }else{
        this.repeated = false;
      }
      
      this.apiService.getAuthorsPublications(author).subscribe({
        next: (response: string[]) => {
          if (response.length == 0) {
            this.noResults = true;

          }else{
            this.noResults = false;

            if(this.repeated == false){
              this.authors.push(suggestion.trim());
              this.networkInitService.selectedAuthors = this.authors;
            }
          }
        },
        error: (error: any) => {
          console.error('Error in getAuthorsPublications', error);
        }
      });
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
      publications.forEach(({ title, DayOfPublication, AuthorName, PublicationType }) => {
        const row = document.createElement('tr');
        let color;
        switch (PublicationType) {
          case 'Journal Article':
            color = 'red';
            break;
          case 'Workshop Paper':
            color = 'blue';
            break;
          case 'Part in Books or Collection':
            color = 'yellow';
            break;
          default:
            color = 'black';
        }
        const formattedAuthorNames = AuthorName.join(', '); 
        row.innerHTML = `<td style="background-color: ${color}; width: 15px; border: 1px solid black; height: 10px; max-height: 10px;white-space: nowrap;"></td><td style="padding-left: 20px; padding-right: 50px;">${title}</td><td style="padding-right: 30px; white-space: nowrap;">${DayOfPublication}</td><td>${formattedAuthorNames}</td>`;
  
        table.appendChild(row);
      });
    }
  }  

}


