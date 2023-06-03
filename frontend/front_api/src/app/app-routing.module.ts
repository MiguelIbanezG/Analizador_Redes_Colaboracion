import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FormularioFiltrosComponent } from './formulario-filtros/formulario-filtros.component';
import { PaginaEstadisticasComponent } from './pagina-estadisticas/pagina-estadisticas.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'formulario-filtros', component: FormularioFiltrosComponent },
  { path: 'pagina-estadisticas', component: PaginaEstadisticasComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
