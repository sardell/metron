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

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ResolveStart } from '@angular/router';
import { map, filter } from 'rxjs/operators';

@Component({
  selector: 'mtr-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  @Input() baseNav: string;
  public breadcrumb;
  public url;

  constructor(private router: Router) {}

  ngOnInit() {
    this.breadcrumb = this.router.events
      .pipe(
        filter(event => event instanceof ResolveStart),
        map(event => {
          let data = null;
          let route = event['state'].root;

          while (route) {
            data = route.data || data;
            route = route.firstChild;
          }
          this.url = data.breadcrumb;
          return data;
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.breadcrumb.unsubscribe();
  }
}
