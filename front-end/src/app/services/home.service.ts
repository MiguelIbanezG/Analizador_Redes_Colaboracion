import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class HomeService {
  private communities: {
    name: string;
    filtersList: string[];
    selected: boolean;
  }[] = [];
  public filtersList: string[] = [];
  public currentConferences: string[] = [];
  public showButtons = false;
  public filteredTitles: { title: string; selected: boolean }[] = [];
  public filteredTitlesJournal: { title: string; selected: boolean }[] = [];
  public filteredTitlesConference: { title: string; selected: boolean }[] = [];
  private activeLinkSubjectStatistics: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  private activeLinkSubjectNetwork: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  get Communities() {
    return this.communities;
  }

  set Communities(
    communities: { name: string; filtersList: string[]; selected: boolean }[]
  ) {
    this.communities = communities;
  }

  get activeLinkStatistics$(): Observable<boolean> {
    return this.activeLinkSubjectStatistics.asObservable();
  }

  setActiveLinkStatistics(value: boolean) {
    this.activeLinkSubjectStatistics.next(value);
  }

  get activeLinkNetwork$(): Observable<boolean> {
    return this.activeLinkSubjectNetwork.asObservable();
  }

  setActiveLinkNetwork(value: boolean) {
    this.activeLinkSubjectNetwork.next(value);
  }
}
