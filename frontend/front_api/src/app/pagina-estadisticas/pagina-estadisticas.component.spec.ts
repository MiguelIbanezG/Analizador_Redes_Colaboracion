import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaEstadisticasComponent } from './pagina-estadisticas.component';

describe('PaginaEstadisticasComponent', () => {
  let component: PaginaEstadisticasComponent;
  let fixture: ComponentFixture<PaginaEstadisticasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaginaEstadisticasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaEstadisticasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
