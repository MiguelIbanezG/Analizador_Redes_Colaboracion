import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EstadisticasComponent } from './estadisticas/estadisticas.component';
import { ConfigComponent } from './config/config.component';
import { ModalModule } from 'ngx-bootstrap/modal';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'estadisticas', component: EstadisticasComponent },
  { path: 'config', component: ConfigComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
            ModalModule.forRoot()],

  exports: [RouterModule]
})
export class AppRoutingModule { }
