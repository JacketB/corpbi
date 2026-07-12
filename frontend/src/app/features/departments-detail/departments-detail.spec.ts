import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentsDetail } from './departments-detail';

describe('DepartmentsDetail', () => {
  let component: DepartmentsDetail;
  let fixture: ComponentFixture<DepartmentsDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentsDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentsDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
