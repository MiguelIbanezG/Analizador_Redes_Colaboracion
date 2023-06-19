import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  publications: any[] = [];
  title = 'front_api';
  info = 'Web app for dblp stats'

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // this.http.get<any[]>('http://localhost:3000/api/publications')
    //   .subscribe((response) => {
    //     this.publications = response;
    //   });
  }
}
