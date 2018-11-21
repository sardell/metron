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
import {routing} from './sensor-parser-list.routing';
import {SensorParserListComponent} from './sensor-parser-list.component';
import {SharedModule} from '../../shared/shared.module';
import {APP_CONFIG, METRON_REST_CONFIG} from '../../app.config';
import {MetronTableModule} from '../../shared/metron-table/metron-table.module';
import { SensorStatusPipe } from './sensor-status.pipe';

@NgModule ({
  imports: [ routing, SharedModule, MetronTableModule ],
  declarations: [ SensorParserListComponent, SensorStatusPipe ],
  providers: [{ provide: APP_CONFIG, useValue: METRON_REST_CONFIG }]
})
export class SensorParserListModule { }
