import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Departmens } from './departmens';

describe('Departmens', () => {
  let component: Departmens;
  let fixture: ComponentFixture<Departmens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Departmens]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Departmens);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
