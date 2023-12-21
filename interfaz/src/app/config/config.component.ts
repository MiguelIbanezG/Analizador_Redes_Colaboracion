import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { SeleccionService } from '../seleccion.service';
import { HttpClient } from '@angular/common/http';
import { CloudData, CloudOptions } from 'angular-tag-cloud-module';
import { singular } from 'pluralize';
import * as Chart from 'chart.js';


interface Author {
  ipNames: string[];
  numPublications: number;
  researcher: string;
  year: string;
}

interface DecadeStats {
  label: string;
  startYear: number;
  endYear: number;
  authors: Author[];
}

interface GeneroCounts {
  hombres: number;
  mujeres: number;
  desconocidos: number;
}

interface GeneroData {
  [anio: string]: GeneroCounts;
}


@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit{
  titulosSeleccionados: any[] = [];
  yearsSeleccionados: any[] = [];
  conferenceOption: string = "";
  venueName: any[] = [];
  papers: any[] = [];
  colaboraciones: any[] = [];
  singleAuthor: any[] = [];
  estadisticas: any[] = [];
  researchers: any[] = [];
  papersWithAuthors: any[] = [];
  autoresPorPapersTable: any[] = [];
  papersPorAutoresTable: any[] = [];
  decadeStats: any[] = [];
  sortedProceedings: any[] = [];
  
  commonNames: { [key: string]: { frec_paises: { [key: string]: number }, genero: string } } = {};
  options: CloudOptions = {
    // if width is between 0 and 1 it will be set to the width of the upper element multiplied by the value
    width: 500,
    // if height is between 0 and 1 it will be set to the height of the upper element multiplied by the value
    height: 200,
    overflow: false,
    realignOnResize: false,
    strict: false,
    step: 2,
  };
  cloudData: CloudData[] = []

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private seleccionService: SeleccionService,
    private http: HttpClient
  ) {}



  ngOnInit() {
    //LLamada a la funcion principal para la ejecucion de todo
    this.main();
  }

  obtenerBooks(){
    this.apiService.obtenerbooks(this.titulosSeleccionados, this.venueName).subscribe({
      next: (response: any[]) => {
      console.log("resss"+response)
      this.sortedProceedings = response
      },
      error: (error: any) => {
        console.error('Error al obtener los resultados filtrados:', error);
      }
    });
  }

  obtenerAuthorsBooks() {
      this.apiService.obtenerAuthorsNames(this.titulosSeleccionados, this.conferenceOption, this.venueName)
        .subscribe({
          next: async (response: any) => {
            console.log("wpoiefjwpej"+response)
            this.singleAuthor = response;
            this.statsSingleAuthor();
          },
          error: (error: any) => {
            console.error('Error al obtener los Author Papers:', error);
          }
        });
  }


  statsSingleAuthor() {
    const papersWithAuthors: { ipName: string, authorName: string, year: string }[] = [];
  
    // Iterar sobre los datos para crear la estructura papersWithAuthors
    this.singleAuthor.forEach((author: { ipName: string, researcher: string, year: string }) => {
      papersWithAuthors.push({
        ipName: author.ipName,
        authorName: author.researcher,
        year: author.year
      });
    });
  
    this.papersWithAuthors = papersWithAuthors;

  }

  async main(){
    try {
      this.titulosSeleccionados = this.seleccionService.obtenerTitulosSeleccionados();
      this.conferenceOption = this.seleccionService.obtenerOpcionConferencia();
      this.venueName = this.seleccionService.obtenerNombreVenue();

      this.obtenerAuthorsBooks();
    

  } catch (error) {
    console.error('Error al obtener los datos:', error);
  }
  }
 
}

