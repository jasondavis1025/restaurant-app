import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalHost } from './modal-host';

describe('ModalHost', () => {
  let component: ModalHost;
  let fixture: ComponentFixture<ModalHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalHost],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalHost);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
