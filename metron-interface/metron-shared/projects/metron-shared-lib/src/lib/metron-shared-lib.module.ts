import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MetronSharedLibComponent } from './metron-shared-lib.component';
import { CentralNavigationComponent } from './central-navigation/central-navigation.component';

@NgModule({
  imports: [ CommonModule, RouterModule
  ],
  declarations: [MetronSharedLibComponent, CentralNavigationComponent],
  exports: [MetronSharedLibComponent, CentralNavigationComponent]
})
export class MetronSharedLibModule { }
