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
import { TestBed } from '@angular/core/testing';
import { StoreModule, Store, combineReducers, Action } from '@ngrx/store';
import { SensorsEffects } from './sensors.effects';
import { SensorsModule } from '../sensors.module';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as fromModule from '../reducers';
import { EffectsModule } from '@ngrx/effects';
import * as fromActions from '../actions';
import { ParserMetaInfoModel } from '../models/parser-meta-info.model';
import { ParserGroupModel } from '../models/parser-group.model';
import { ParserConfigModel } from '../models/parser-config.model';
import { SensorParserConfigService } from '../../service/sensor-parser-config.service';
import { Injectable } from '@angular/core';
import { ApplyChanges } from '../actions';
import { of, throwError } from 'rxjs';
import { MetronAlerts } from '../../shared/metron-alerts';
import { RestError } from '../../model/rest-error';


@Injectable()
class FakeParserService {
  syncConfigs = jasmine.createSpy().and.returnValue(of({}));
  syncGroups = jasmine.createSpy().and.returnValue(of({}));
  getAllConfig = jasmine.createSpy().and.returnValue(of([]));
  getAllGroups = jasmine.createSpy().and.returnValue(of([]));
}

@Injectable()
class FakeMetronAlerts {
  showErrorMessage = jasmine.createSpy();
  showSuccessMessage = jasmine.createSpy();
}

describe('sensor.effects.ts', () => {
  let store: Store<fromModule.State>;
  let service: FakeParserService;
  let userNotificationSvc: MetronAlerts;
  let effects: SensorsEffects;
  let testParsers: ParserMetaInfoModel[];
  let testGroups: ParserMetaInfoModel[];

  function fillStoreWithTestData() {
    testParsers = [
      { config: new ParserConfigModel('TestConfig01', { sensorTopic: 'TestKafkaTopicId01' })},
      { config: new ParserConfigModel('TestConfig01', { sensorTopic: 'TestKafkaTopicId02' })},
    ];
    testGroups = [
      { config: new ParserGroupModel({ name: 'TestGroup01', description: '' })},
      { config: new ParserGroupModel({ name: 'TestGroup02', description: '' })},
    ];

    store.dispatch(new fromActions.LoadSuccess({
      parsers: testParsers,
      groups: testGroups,
      statuses: []
    }));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SensorsModule,
        StoreModule.forRoot({ sensors: combineReducers(fromModule.reducers) }),
        EffectsModule.forRoot([]),
        HttpClientTestingModule
      ],
      providers: [
        SensorsEffects,
        HttpClient,
        { provide: SensorParserConfigService, useClass: FakeParserService },
        { provide: MetronAlerts, useClass: FakeMetronAlerts },
      ]
    });

    store = TestBed.get(Store);
    service = TestBed.get(SensorParserConfigService);
    userNotificationSvc = TestBed.get(MetronAlerts);
    effects = TestBed.get(SensorsEffects);

    fillStoreWithTestData();
  });

  it('Should pass state of parsers to service.syncConfigs() on action ApplyChanges', () => {
    store.dispatch(new fromActions.ApplyChanges());
    expect(service.syncConfigs).toHaveBeenCalledWith(testParsers);
  });

  it('Should pass state of groups to service.syncGroup() on action ApplyChanges', () => {
    store.dispatch(new fromActions.ApplyChanges());
    expect(service.syncGroups).toHaveBeenCalledWith(testGroups);
  });

  it('Should return with an LoadStart action when syncConfigs() and syncGroups() finished', () => {
    effects.applyChanges$.subscribe((result: Action) => {
      expect(result.type).toBeDefined(fromActions.SensorsActionTypes.LoadStart);
    });

    store.dispatch(new fromActions.ApplyChanges());
  });

  it('Should show notification when operation SUCCESSFULL', () => {
    store.dispatch(new fromActions.ApplyChanges());
    expect(userNotificationSvc.showSuccessMessage).toHaveBeenCalled();
  });

  it('Should show notification when operation FAILED', () => {
    service.syncConfigs = jasmine.createSpy().and.callFake(params => throwError(new RestError()));
    store.dispatch(new fromActions.ApplyChanges());
    expect(userNotificationSvc.showErrorMessage).toHaveBeenCalled();
  });

});
