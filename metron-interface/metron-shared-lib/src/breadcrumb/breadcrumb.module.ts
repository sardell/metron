import { NgModule, ModuleWithProviders } from '@angular/core';
import { BreadcrumbComponent } from './breadcrumb.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [BreadcrumbComponent],
  exports: [BreadcrumbComponent],
  entryComponents: [BreadcrumbComponent]
})
export class BreadcrumbModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: BreadcrumbModule,
      providers: []
    };
  }
}
