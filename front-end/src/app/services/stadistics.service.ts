import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StadisticsService {

  public selectedYears: any[] = [];
  public connected: any[] = [];
  public newComers: any[] = [];
  public ConferenceOrJournalName: string[] = [];
  public ConferenceOrJournalConfirm: string[] = [];
  public ConferenceOrJournalNames: string[] = [];
  public years: string[] = [];
  public inprocedings: number[] = [];

  addTitles(titles: any[]) {
    this.selectedYears = this.selectedYears.concat(titles);
}

  cleanTitles(){
    this.selectedYears = [];
  }

  getSelectedTitles() {
    return this.selectedYears;
  }
  
  flagConferenceOrJournalName(venue: string[]) {
    this.ConferenceOrJournalName = venue;
  }
  
  getConferenceOrJournalName() {
    return this.ConferenceOrJournalName;
  }


}
