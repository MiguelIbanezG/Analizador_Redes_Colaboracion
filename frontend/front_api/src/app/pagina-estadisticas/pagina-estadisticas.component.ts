import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';


@Component({
  selector: 'app-pagina-estadisticas',
  templateUrl: './pagina-estadisticas.component.html',
  styleUrls: ['./pagina-estadisticas.component.css']
})
export class PaginaEstadisticasComponent implements OnInit {
  estadisticas: any;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    // Realiza la llamada a la API para obtener las estadísticas
    this.apiService.obtenerEstadisticas().subscribe(
      (      response: any) => {
        this.estadisticas = response;
      },
      (      error: any) => {
        console.error(error);
      }
    );
  }
}
