import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MetronSharedLibComponent } from './metron-shared-lib.component';
import { CentralNavigationComponent } from './central-navigation/central-navigation.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';

@NgModule({
  imports: [ CommonModule, RouterModule
  ],
  declarations: [MetronSharedLibComponent, CentralNavigationComponent, BreadcrumbComponent],
  exports: [MetronSharedLibComponent, CentralNavigationComponent, BreadcrumbComponent]
})
export class MetronSharedLibModule { }
