import { NgModule, ModuleWithProviders } from '@angular/core';
import { CentralNavigationComponent } from './central-navigation.component';

@NgModule({
  declarations: [CentralNavigationComponent],
  exports: [CentralNavigationComponent],
  entryComponents: [CentralNavigationComponent]
})
export class CentralNavigationModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CentralNavigationModule,
      providers: []
    };
  }
}
