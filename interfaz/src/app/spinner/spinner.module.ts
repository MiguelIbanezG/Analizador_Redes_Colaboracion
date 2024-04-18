import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { TagCloudComponent } from 'angular-tag-cloud-module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import {MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { SpinnerComponent } from './spinner.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    SpinnerComponent,
  
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    TagCloudComponent,
    ModalModule,
    NgSelectModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatOptionModule,
    MatInputModule,
    ReactiveFormsModule,
  ], exports: [SpinnerComponent]
})
export class SpinnerModule { }
