import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StadisticsService {

  public selectedTitles: any[] = [];
  public connected: any[] = [];
  public newComers: any[] = [];
  public ConferenceOrJournalName: string[] = [];
  public ConferenceOrJournalConfirm: string[] = [];
  public ConferenceOrJournalNames: string[] = [];
  public years: string[] = [];
  public inprocedings: number[] = [];

  addTitles(titles: any[]) {
    this.selectedTitles = this.selectedTitles.concat(titles);
}

  cleanTitles(){
    this.selectedTitles = [];
  }

  getSelectedTitles() {
    return this.selectedTitles;
  }
  
  flagConferenceOrJournalName(venue: string[]) {
    this.ConferenceOrJournalName = venue;
  }
  
  getConferenceOrJournalName() {
    return this.ConferenceOrJournalName;
  }


}
