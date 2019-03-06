import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralNavigationComponent } from './central-navigation.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('CentralNavigationComponent', () => {
  let component: CentralNavigationComponent;
  let fixture: ComponentFixture<CentralNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [ CentralNavigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentralNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
