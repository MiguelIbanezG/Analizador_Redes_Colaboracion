import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiService } from './api.service';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { StatisticsComponent } from './estadisticas/statistics.component';
import { SelectionService } from './selection.service';
import { TagCloudComponent } from 'angular-tag-cloud-module';
import { ConfigComponent } from './config/config.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import {MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    StatisticsComponent,
    ConfigComponent
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    TagCloudComponent,
    ModalModule,
    NgSelectModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatOptionModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  providers: [
    ApiService,
    SelectionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
