import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabeceraYMenuComponent } from './cabecera-y-menu.component';

describe('CabeceraYMenuComponent', () => {
  let component: CabeceraYMenuComponent;
  let fixture: ComponentFixture<CabeceraYMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabeceraYMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CabeceraYMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
