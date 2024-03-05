import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StadisticsService {

  private selectedTitles: string[] = [];
  private conferenceOption = "";
  private venueName: string[] = [];
  public venueNameConfirm: string[] = [];
  public conferencesNames: string[] = [];
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

  markOptionConference(option: string) {
    this.conferenceOption = option;
  }
  
  getConferenceOption() {
    return this.conferenceOption;
  }

  flagNameVenue(venue: string[]) {
    this.venueName = venue;
  }
  
  getVenueName() {
    return this.venueName;
  }


}
