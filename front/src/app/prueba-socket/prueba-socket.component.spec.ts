import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruebaSocketComponent } from './prueba-socket.component';

describe('PruebaSocketComponent', () => {
  let component: PruebaSocketComponent;
  let fixture: ComponentFixture<PruebaSocketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PruebaSocketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PruebaSocketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
