import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisSalasComponent } from './mis-salas.component';

describe('MisSalasComponent', () => {
  let component: MisSalasComponent;
  let fixture: ComponentFixture<MisSalasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisSalasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MisSalasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
