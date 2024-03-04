import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthorsService {

    private authors:String[] = []

    get Communities() {
        return this.authors;
    }
    
    set Communities( authors:String[] ) {
        this.authors = authors;
    }
    
}
