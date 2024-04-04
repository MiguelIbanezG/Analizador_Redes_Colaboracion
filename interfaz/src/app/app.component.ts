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
  info = 'Web app for dblp stats';
  fechaHoraActual = "";

  constructor(
    private http: HttpClient,
    private homeService: HomeService
  ){
    this.obtenerFechaHoraActual();
  }

  activeLinkStatistics = true
  activeLinkNetwork = true



  ngOnInit() {
    this.homeService.activeLinkStatistics$.subscribe((activeLinkStatistics) => {
      this.activeLinkStatistics = activeLinkStatistics;
    });

    this.homeService.activeLinkNetwork$.subscribe((activeLinkNetwork) => {
      this.activeLinkNetwork = activeLinkNetwork;
    });
  }

  obtenerFechaHoraActual() {
    const fechaHora = new Date();
    this.fechaHoraActual = fechaHora.toLocaleString(); // Formatear la fecha y la hora
  }
}
