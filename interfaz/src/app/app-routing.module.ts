import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { StatisticsComponent } from './estadisticas/statistics.component';
import { ConfigComponent } from './config/config.component';
import { ModalModule } from 'ngx-bootstrap/modal';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'config', component: ConfigComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
            ModalModule.forRoot()],

  exports: [RouterModule]
})
export class AppRoutingModule { }
