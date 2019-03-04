/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuard} from './shared/auth-guard';
import {LoginGuard} from './shared/login-guard';

export const routes: Routes = [
  { path: '',  redirectTo: 'sensors', pathMatch: 'full'},
  { path: 'login', loadChildren: 'app/login/login.module#LoginModule', canActivate: [LoginGuard] },
  {
    path: 'sensors', loadChildren: 'app/sensors/sensor-parser-list/sensor-parser-list.module#SensorParserListModule',
    canActivate: [AuthGuard], data: {
      breadcrumb: 'Sensors'
    }
  }
];

export const appRoutingProviders: any[] = [
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})

export class MetronConfigRoutingModule { }
