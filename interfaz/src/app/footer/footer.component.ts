import { Component, OnInit,  } from '@angular/core';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  
  fechaHoraActual = "";

  constructor(
  ) {
    this.obtenerFechaHoraActual();
  }


  obtenerFechaHoraActual() {
    const fechaHora = new Date();
    this.fechaHoraActual = fechaHora.toLocaleString(); // Formatear la fecha y la hora
  }

}
 