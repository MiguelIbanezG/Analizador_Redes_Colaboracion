import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SeleccionService } from '../seleccion.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  // Propiedades
  info: string = 'Home class';
  filtros: string = '';
  publicaciones: string[] = [];
  resultadosFiltrados: string[] = [];
  titulosFiltrados: { title: string, pr_objeto: any, selected: boolean }[] = [];
  etiquetas: string[] = []; // Lista de etiquetas posibles para filtrar 
  seleccionarTodos = false;
  selccionarDecadas = false;
  selccionarDecadas2 = false;
  selccionarDecadas3 = false;
  selccionarDecadas4 = false;
  conferenceOption: string = "main";
  count: number = 0;
  mostrarAnios: boolean = false;
  mostrarDecadas: boolean = false;
  selectedOption: string = '';
  noResultsFoundConference: boolean = false;
  noResultsFoundJournal: boolean = false;


  private nodosSubscription: Subscription | undefined;
  private informacionNodoSubscription: Subscription | undefined;

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private seleccionService: SeleccionService
  ) { }
  
  ngOnInit() {
    //INICIAL
  }

  filter2(){
    this.clear()
    this.obtenerNodosFiltradosConference();
    this.obtenerNodosFiltradosJournal();
    this.toggleDecades();
  }

  execFunctionsYear(){
    this.clear()
    this.obtenerNodosFiltradosJournal();
    this.obtenerNodosFiltradosConference();
    this.toggleYears();
  }

  execFunctionsDecades(){
    this.clear()
    this.obtenerNodosFiltradosJournal();
    this.obtenerNodosFiltradosConference();
    this.toggleDecades();
  }

  toggleYears() {
    this.mostrarAnios = !this.mostrarAnios;
      if(this.mostrarDecadas == true){
        this.mostrarDecadas = false;
      }
  }

  toggleDecades() {
    this.mostrarDecadas = !this.mostrarDecadas;
      if(this.mostrarAnios == true){
        this.mostrarAnios = false;
      }
  }

  clear(){
    this.titulosFiltrados = [];
  }
  
  handleSelection() {
    // Lógica para manejar la opción seleccionada
    if (this.conferenceOption === 'mainConference') {
      this.conferenceOption = "main";
    } else if (this.conferenceOption === 'mainAndWorkshops') {
      this.conferenceOption = "all";
    }
    this.seleccionService.marcarOpcionConferencia(this.conferenceOption);
  }

  obtenerNodosFiltradosConference() {
    const filtrosSeparados = this.filtros.split(',').map(filter => filter.trim());

    this.apiService.obtenerNodosFiltradosConference(filtrosSeparados).subscribe({
      next: (response: any[]) => {
        // this.resultadosFiltrados = response.map(item => JSON.stringify(item));
        this.resultadosFiltrados = response.map(item => item);
        if(this.titulosFiltrados.length < 1){
          this.titulosFiltrados = Object.values(response.reduce((obj, item) => {
            const yearNode = item.properties;
            obj[yearNode.name] = {
              title: yearNode.name,
              pr_objeto: item,
              selected: false
            };
            return obj;
          }, {}));
          if (this.resultadosFiltrados.length === 0) {
            this.noResultsFoundConference = true;
          } else {
            this.noResultsFoundConference = false;
          }
          console.log(this.noResultsFoundConference)
        }
      },
      error: (error: any) => {
        console.error('Error al obtener los resultados filtrados:', error);
      }
        
    });
  }

  obtenerNodosFiltradosJournal() {
    this.apiService.obtenerNodosFiltradosJournal(this.filtros).subscribe({
      next: (response: any[]) => {
        // this.resultadosFiltrados = response.map(item => JSON.stringify(item));
        this.resultadosFiltrados = response.map(item => item);
        
        if(this.titulosFiltrados.length < 1){
          this.titulosFiltrados = Object.values(response.reduce((obj, item) => {
            const yearNode = item.properties;
            obj[yearNode.name] = {
              title: yearNode.name,
              pr_objeto: item,
              selected: false
            };
            return obj;
          }, {}));
          if (this.resultadosFiltrados.length === 0) {
            this.noResultsFoundJournal = true;
          } else {
            this.noResultsFoundJournal = false;
          }
          console.log(this.noResultsFoundJournal)
        }

        
      },
      error: (error: any) => {
        console.error('Error al obtener los resultados filtrados:', error);
      }
    });
  }

  hayTitulosSeleccionados(): boolean {
    let seleccionados = false;
    if (this.titulosFiltrados.some(titulo => titulo.selected)){
      seleccionados = true;
    }
    return seleccionados;
  }

  seleccionarTodosChanged() {
    if (this.titulosFiltrados.length > 0){
      for (let titulo of this.titulosFiltrados) {
        titulo.selected = this.seleccionarTodos;
      }
    }
    
  }

  seleccionarDecadas() {
    for (let titulo of this.titulosFiltrados) {
      if (titulo.title == "1989" || titulo.title == "1990" ||titulo.title == "1991" ||titulo.title == "1992" ||
      titulo.title == "1993" || titulo.title == "1994" ||titulo.title == "1995" ||titulo.title == "1996" ||
      titulo.title == "1997" || titulo.title == "1998" || titulo.title == "1999") {
        titulo.selected = this.selccionarDecadas;
      } 
    }
  }

  seleccionarDecadas2() {
  
    for (let titulo of this.titulosFiltrados) {
      if (titulo.title == "1999" || titulo.title == "2001" ||titulo.title == "2002" ||titulo.title == "2003" ||
      titulo.title == "2004" || titulo.title == "2005" ||titulo.title == "2006" ||titulo.title == "2007" ||
      titulo.title == "2008" || titulo.title == "2009" || titulo.title == "2000") {
        titulo.selected = this.selccionarDecadas2;
      } 
    }
  }

  seleccionarDecadas3() {
  
    for (let titulo of this.titulosFiltrados) {
      if (titulo.title == "2009" || titulo.title == "2010" ||titulo.title == "2011" ||titulo.title == "2012" ||
      titulo.title == "2013" || titulo.title == "2014" ||titulo.title == "2015" ||titulo.title == "2016" ||
      titulo.title == "2017" || titulo.title == "2018" || titulo.title == "2019") {
        titulo.selected = this.selccionarDecadas3;
      } 
    }
  }

  seleccionarDecadas4() {
  
    for (let titulo of this.titulosFiltrados) {
      if (titulo.title == "2019" || titulo.title == "2020" ||titulo.title == "2021" ||titulo.title == "2022" ||
      titulo.title == "2023" || titulo.title == "2024"){
        titulo.selected = this.selccionarDecadas4;
      } 
    }
  }

  tituloChanged() {
    let todosSeleccionados = true;
    for (let titulo of this.titulosFiltrados) {
      if (!titulo.selected) {
        todosSeleccionados = false;
        break;
      }
    }
    for (let titulo of this.titulosFiltrados) {
      if (!titulo.selected) {
        todosSeleccionados = false;
        break;
      }
    }
    
    this.seleccionarTodos = todosSeleccionados;
  }


  generarEstadisticas() {
    // Filtra los títulos seleccionados
    const titulosSeleccionados = this.titulosFiltrados
    .filter(titulo => titulo.selected).map(titulo => titulo.pr_objeto);
    
    // Almacena los títulos seleccionados en el servicio de selección
    this.seleccionService.agregarTitulos(titulosSeleccionados);
    const filtrosSeparados = this.filtros.split(',').map(filter => filter.trim());
    this.seleccionService.marcarNombreVenue(filtrosSeparados);

    // Redirige a la página de estadísticas
    this.router.navigateByUrl('/estadisticas');
  }

  generarconf() {
    // Filtra los títulos seleccionados
    const titulosSeleccionados = this.titulosFiltrados
    .filter(titulo => titulo.selected).map(titulo => titulo.pr_objeto);
    
    // Almacena los títulos seleccionados en el servicio de selección
    this.seleccionService.agregarTitulos(titulosSeleccionados);
    this.seleccionService.marcarBook(this.filtros);


    // Redirige a la página de estadísticas
    this.router.navigateByUrl('/config');
  }


}
