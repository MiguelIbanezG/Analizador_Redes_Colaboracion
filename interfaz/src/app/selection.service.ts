import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {

  private selectedTitles: string[] = [];
  private conferenceOption = "";
  private venueName: string[] = [];

  addTitles(title: any[]) {
    this.selectedTitles = title.reduce((arr, title) => {
      arr.push(title);
      return arr;
    }, []);
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
