import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private communities: { name: string, filtersList: string[], selected: boolean  }[] = [];

  get Communities() {
    return this.communities;
  }

  set Communities( communities: { name: string, filtersList: string[], selected: boolean  }[] ) {
     this.communities = communities;
  }


}
