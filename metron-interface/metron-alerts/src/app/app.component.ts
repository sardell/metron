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
import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from './service/authentication.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'metron-alerts-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  loggedIn = false;
  noTransition = false;
  collapseMenu: boolean;
  centralNavLinks = [
    {
      linkName: 'Alerts',
      iconClass: 'fa-exclamation-triangle',
      subLinks: [
        {
          linkName: 'Overview',
          routerLink: '/alerts-list'
        },
        {
          linkName: 'PCAP',
          routerLink: '/pcap'
        }
      ]
    },
    {
      linkName: 'Management',
      iconClass: 'fa-wrench',
      subLinks: [
        {
          linkName: 'Sensors',
          routerLink: ':4200/sensors',
          externalLink: true
        },
        {
          linkName: 'General Settings',
          routerLink: ':4200/general-settings',
          externalLink: true
        }
      ]
    }
  ]
  logo = ['assets/images/logo-symbol.png', 'assets/images/logo-name.png'];
  baseNav = 'Alerts';

  constructor(private authService: AuthenticationService) {
    this.authService.onLoginEvent.subscribe(result => {
      this.loggedIn = result;
    });
    this.noTransition = environment.noTransition;
  }

  ngOnInit(): void {

  }

  menuToggle(val) {
    this.collapseMenu = val;
  }
}
