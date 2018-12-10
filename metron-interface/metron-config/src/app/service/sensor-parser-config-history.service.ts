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
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpUtil } from '../util/httpUtil';
import { IAppConfig } from '../app.config.interface';
import { SensorParserConfigHistory } from '../model/sensor-parser-config-history';
import { APP_CONFIG } from '../app.config';
import { ParserConfigModel } from '../sensors/models/parser-config.model';
import { RestError } from '../model/rest-error';

@Injectable()
export class SensorParserConfigHistoryService {
  url = this.config.apiEndpoint + '/sensor/parser/config';

  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: IAppConfig
  ) {}

  public get(name: string): Observable<RestError | SensorParserConfigHistory> {
    return this.http.get(this.url + '/' + name).pipe(
      map((response: ParserConfigModel) => {
        let sensorParserConfigHistory = new SensorParserConfigHistory();
        sensorParserConfigHistory.config = response;
        return sensorParserConfigHistory;
      }),
      catchError(HttpUtil.handleError)
    );
  }

  public getAll(): Observable<SensorParserConfigHistory[] | RestError> {
    return this.http.get(this.url).pipe(
      map((response: ParserConfigModel[]) => {
        let sensorParserConfigHistoryArray = [];
        let sensorParserConfigs: ParserConfigModel[] = response;
        for (let sensorParserConfig of sensorParserConfigs) {
          let sensorParserConfigHistory = new SensorParserConfigHistory();
          sensorParserConfigHistory.config = sensorParserConfig;
          sensorParserConfigHistoryArray.push(sensorParserConfigHistory);
        }
        return sensorParserConfigHistoryArray;
      }),
      catchError(HttpUtil.handleError)
    );
  }
}
