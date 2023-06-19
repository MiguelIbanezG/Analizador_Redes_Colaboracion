import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiService } from './api.service';
import { HomeComponent } from './home/home.component';
import { FormularioFiltrosComponent } from './formulario-filtros/formulario-filtros.component';
import { FormsModule } from '@angular/forms';
import { EstadisticasComponent } from './estadisticas/estadisticas.component';
import { SeleccionService } from './seleccion.service';
import { TagCloudComponent } from 'angular-tag-cloud-module';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FormularioFiltrosComponent,
    EstadisticasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    TagCloudComponent
  ],
  providers: [
    ApiService,
    SeleccionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
