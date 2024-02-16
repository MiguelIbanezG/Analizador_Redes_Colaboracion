import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  private publicationsByYear: { yearName: string, allPublications: number }[] = [];
  private authorsByYear: { yearName: string, allAuthors: number }[] = [];
  private conferencesByYear: { yearName: string, allConferences: number }[] = [];
  private allPublications = 0;
  private allAuthors = 0;
  private allConferences = 0;
  private publicationsCombined: number[] = [];
  private authorsCombined: number[] = [];
  private conferencesCombined: number[] = [];

  get PublicationsByYear() {
    return this.publicationsByYear;
  }

  set PublicationsByYear(publicationsByYear: { yearName: string, allPublications:number}[] ) {
     this.publicationsByYear = publicationsByYear;
  }
  
  get AuthorsByYear() {
    return this.authorsByYear;
  }

  set AuthorsByYear(authorsByYear: { yearName: string, allAuthors: number }[]) {
     this.authorsByYear = authorsByYear;
  }
  
  get ConferencesByYear() {
    return this.conferencesByYear;
  }

  set ConferencesByYear(conferencesByYear: { yearName: string, allConferences: number }[]) {
    this.conferencesByYear = conferencesByYear;
  }


  get AllPublications() {
    return this.allPublications;
  }

  set AllPublications(allPublications: number) {
    this.allPublications = allPublications;
  }
  
  
  get AllAuthors() {
    return this.allAuthors;
  }

  set AllAuthors(allAuthors: number) {
    this.allAuthors = allAuthors;
  }
  
  get AllConferences() {
    return this.allConferences;
  }

  set AllConferences(allConferences: number) {
     this.allConferences = allConferences;
  }

  get PublicationsCombined() {
    return this.publicationsCombined;
  }

  set PublicationsCombined(publicationsCombined: number[]) {
    this.publicationsCombined = publicationsCombined;
  }
  
  get AuthorsCombined() {
    return this.authorsCombined;
  }

  set AuthorsCombined(authorsCombined: number[]) {
    this.authorsCombined = authorsCombined;
  }
  
  get ConferencesCombineds() {
    return this.conferencesCombined;
  }

  set ConferencesCombineds(conferencesCombined: number[]) {
    this.conferencesCombined= conferencesCombined;
  }



}
