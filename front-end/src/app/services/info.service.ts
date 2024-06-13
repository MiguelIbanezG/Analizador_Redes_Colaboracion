import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class InfoService {
  private publicationsByYear: {
    yearName: string;
    ConferencesAndPapers: number;
    JournalArticles: number;
    Thesis: number;
  }[] = [];
  private authorsByYear: { yearName: string; allAuthors: number }[] = [];
  private conferencesByYear: { yearName: string; allConferences: number }[] =
    [];
  private journalsByYear: { yearName: string; allJournals: number }[] = [];
  public allPublications = "0";
  public allAuthors = "0";
  public allConferences = "0";
  public allJournals = "0";

  public instituions: { institution: String; researchers: number }[] = [];

  get PublicationsByYear() {
    return this.publicationsByYear;
  }

  set PublicationsByYear(
    publicationsByYear: {
      yearName: string;
      ConferencesAndPapers: number;
      JournalArticles: number;
      Thesis: number;
    }[]
  ) {
    this.publicationsByYear = publicationsByYear;
  }

  get AuthorsByYear() {
    return this.authorsByYear;
  }

  set AuthorsByYear(authorsByYear: { yearName: string; allAuthors: number }[]) {
    this.authorsByYear = authorsByYear;
  }

  get ConferencesByYear() {
    return this.conferencesByYear;
  }

  set ConferencesByYear(
    conferencesByYear: { yearName: string; allConferences: number }[]
  ) {
    this.conferencesByYear = conferencesByYear;
  }

  get JournalsByYear() {
    return this.journalsByYear;
  }

  set JournalsByYear(
    journalsByYear: { yearName: string; allJournals: number }[]
  ) {
    this.journalsByYear = journalsByYear;
  }
}
