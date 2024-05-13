import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalAdminComponent } from './portal-admin.component';

describe('UsuariosAdminComponent', () => {
  let component: PortalAdminComponent;
  let fixture: ComponentFixture<PortalAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortalAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PortalAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
