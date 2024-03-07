import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { HomeService } from './services/home.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  publications: any[] = [];
  title = 'interfaz';
  info = 'Web app for dblp stats'

  constructor(
    private http: HttpClient,
    private homeService: HomeService
  ){

  }

  activeLink = true


  ngOnInit() {
    this.homeService.activeLink$.subscribe((activeLink) => {
      this.activeLink = activeLink;
    });
  }
}
