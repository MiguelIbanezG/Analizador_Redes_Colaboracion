import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private communities: { name: string, filtersList: string[], selected: boolean  }[] = [];
  private _activeLinkSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get Communities() {
    return this.communities;
  }

  set Communities( communities: { name: string, filtersList: string[], selected: boolean  }[] ) {
     this.communities = communities;
  }

  get activeLink$(): Observable<boolean> {
    return this._activeLinkSubject.asObservable();
  }

  setActiveLink(value: boolean) {
    this._activeLinkSubject.next(value);
  }



}
