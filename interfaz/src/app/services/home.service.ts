import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private communities: { name: string, filtersList: string[], selected: boolean  }[] = [];
  public filtersList: string[] = [];
  public currentConferences: string[] = [];
  public filteredTitles: { title: string, pr_objeto: any, selected: boolean }[] = [];
  public filteredTitlesJournal: { title: string, pr_objeto: any, selected: boolean }[] = [];
  public filteredTitlesConference: { title: string, pr_objeto: any, selected: boolean }[] = [];
  private _activeLinkSubjectStatistics: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _activeLinkSubjectNetwork: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get Communities() {
    return this.communities;
  }

  set Communities( communities: { name: string, filtersList: string[], selected: boolean  }[] ) {
     this.communities = communities;
  }

  get activeLinkStatistics$(): Observable<boolean> {
    return this._activeLinkSubjectStatistics.asObservable();
  }

  setActiveLinkStatistics(value: boolean) {
    this._activeLinkSubjectStatistics.next(value);
  }

  get activeLinkNetwork$(): Observable<boolean> {
    return this._activeLinkSubjectNetwork.asObservable();
  }

  setActiveLinkNetwork(value: boolean) {
    this._activeLinkSubjectNetwork.next(value);
  }




}
