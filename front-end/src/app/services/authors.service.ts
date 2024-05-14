import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthorsService {

    private authors: string[] = []

    get Authors() {
        return this.authors;
    }

    set Authors(authors: string[]) {
        this.authors = authors;
    }

}
