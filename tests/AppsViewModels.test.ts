import { describe, it, expect } from 'vitest';
import { AppsIndexViewModel } from '../src/viewmodels/AppsIndexViewModel';
import { SSBMaxViewModel } from '../src/viewmodels/SSBMaxViewModel';
import { YogaOfEatingViewModel } from '../src/viewmodels/YogaOfEatingViewModel';
import { ActionStationViewModel } from '../src/viewmodels/ActionStationViewModel';
import { PayslipMaxViewModel } from '../src/viewmodels/PayslipMaxViewModel';
import { DefenceWireViewModel } from '../src/viewmodels/DefenceWireViewModel';
import { SecureMaxViewModel } from '../src/viewmodels/SecureMaxViewModel';

describe('App Suite ViewModels', () => {
  it('AppsIndexViewModel retrieves all 6 apps', () => {
    const vm = new AppsIndexViewModel();
    const apps = vm.getAllApps();
    expect(apps.length).toBe(6);
    expect(apps.map((a) => a.id)).toEqual(['payslipmax', 'ssbmax', 'yoga-of-eating', 'action-station', 'defencewire', 'securemax']);
  });

  it('PayslipMaxViewModel retrieves correct app metadata and compliance cards', () => {
    const vm = new PayslipMaxViewModel();
    const app = vm.getAppDetails();
    expect(app.id).toBe('payslipmax');
    expect(app.name).toBe('PayslipMax');

    const complianceCards = vm.getComplianceCards();
    expect(complianceCards.length).toBe(3);
    expect(complianceCards.map((c) => c.id)).toEqual(['privacy-policy', 'terms-of-service', 'data-deletion']);
    expect(complianceCards.find((c) => c.id === 'privacy-policy')?.url).toBe('/privacy-policy.html');
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

  it('DefenceWireViewModel retrieves correct app metadata', () => {
    const vm = new DefenceWireViewModel();
    const app = vm.getAppDetails();
    expect(app.id).toBe('defencewire');
    expect(app.name).toBe('DefenceWire.in');
    expect(app.category).toBe('Defense & Strategic Intelligence');
    expect(app.features.length).toBe(3);
    expect(app.webUrl).toBe('https://www.defencewire.in');
  });

  it('SecureMaxViewModel retrieves correct app metadata', () => {
    const vm = new SecureMaxViewModel();
    const app = vm.getAppDetails();
    expect(app.id).toBe('securemax');
    expect(app.name).toBe('SecureMax');
    expect(app.category).toBe('Enterprise & Physical Security');
    expect(app.features.length).toBe(3);
    expect(app.webUrl).toBe('https://raivanglobal.com');
  });
});
