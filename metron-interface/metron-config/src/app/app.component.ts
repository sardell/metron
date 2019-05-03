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
import {Component} from '@angular/core';
import {AuthenticationService} from './service/authentication.service';


@Component({
  selector: 'metron-config-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent {

  loggedIn = false;
  collapseMenu: boolean;
  centralNavLinks = [
    {
      linkName: 'Alerts',
      iconClass: 'fa-exclamation-triangle',
      subLinks: [
        {
          linkName: 'Overview',
          routerLink: ':4201/alerts-list',
          externalLink: true
        },
        {
          linkName: 'PCAP',
          routerLink: ':4201/pcap',
          externalLink: true
        }
      ]
    },
    {
      linkName: 'Management',
      iconClass: 'fa-wrench',
      subLinks: [
        {
          linkName: 'Sensors',
          routerLink: '/sensors',
        },
        {
          linkName: 'General Settings',
          routerLink: '/general-settings'
        }
      ]
    }
  ];
  logo = ['assets/images/logo-symbol.png', 'assets/images/logo-name.png'];
  baseNav = 'Management';

  constructor(private authService: AuthenticationService) {
    this.authService.onLoginEvent.subscribe(result => {
      this.loggedIn = result;
    });
  }

  menuToggle(val) {
    this.collapseMenu = val;
  }

}
