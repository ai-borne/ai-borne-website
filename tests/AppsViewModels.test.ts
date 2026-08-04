import { describe, it, expect } from 'vitest';
import { AppsIndexViewModel } from '../src/viewmodels/AppsIndexViewModel';
import { SSBMaxViewModel } from '../src/viewmodels/SSBMaxViewModel';
import { YogaOfEatingViewModel } from '../src/viewmodels/YogaOfEatingViewModel';
import { ActionStationViewModel } from '../src/viewmodels/ActionStationViewModel';
import { PayslipMaxViewModel } from '../src/viewmodels/PayslipMaxViewModel';

describe('App Suite ViewModels', () => {
  it('AppsIndexViewModel retrieves all 4 apps', () => {
    const vm = new AppsIndexViewModel();
    const apps = vm.getAllApps();
    expect(apps.length).toBe(4);
    expect(apps.map((a) => a.id)).toEqual(['payslipmax', 'ssbmax', 'yoga-of-eating', 'action-station']);
  });

  it('PayslipMaxViewModel retrieves correct app metadata', () => {
    const vm = new PayslipMaxViewModel();
    const app = vm.getAppDetails();
    expect(app.id).toBe('payslipmax');
    expect(app.name).toBe('PayslipMax');
  });

  it('SSBMaxViewModel retrieves correct app metadata', () => {
    const vm = new SSBMaxViewModel();
    const app = vm.getAppDetails();
    expect(app.id).toBe('ssbmax');
    expect(app.name).toBe('SSBMax');
    expect(app.features.length).toBe(3);
  });

  it('YogaOfEatingViewModel retrieves correct app metadata', () => {
    const vm = new YogaOfEatingViewModel();
    const app = vm.getAppDetails();
    expect(app.id).toBe('yoga-of-eating');
    expect(app.name).toBe('Yoga of Eating');
    expect(app.features.length).toBe(3);
  });

  it('ActionStationViewModel retrieves correct app metadata', () => {
    const vm = new ActionStationViewModel();
    const app = vm.getAppDetails();
    expect(app.id).toBe('action-station');
    expect(app.name).toBe('ActionStation');
    expect(app.features.length).toBe(3);
  });
});
