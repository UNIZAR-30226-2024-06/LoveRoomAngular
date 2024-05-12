import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaUnitariaComponent } from './sala-unitaria.component';

describe('SalaUnitariaComponent', () => {
  let component: SalaUnitariaComponent;
  let fixture: ComponentFixture<SalaUnitariaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaUnitariaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalaUnitariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
