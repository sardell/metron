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

import {
  Component,
  Input,
  Output,
  ElementRef,
  QueryList,
  ViewChildren
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'mtr-central-navigation',
  templateUrl: './central-navigation.component.html',
  styleUrls: ['./central-navigation.component.scss']
})
export class CentralNavigationComponent {
  @Input() links: CentralNavLink[];
  @Input() logo: string[];
  @Output() collapse: BehaviorSubject<any> = new BehaviorSubject(false);
  @ViewChildren('navbarParent', { read: ElementRef }) navbarParent: QueryList<
    ElementRef
  >;
  collapsed = false;
  hovered = null;
  collapsedSubMenu = {
    top: '0'
  };
  hostname = window.location.hostname;

  constructor() {}

  toggleMenu() {
    this.collapsed = !this.collapsed;
    this.collapse.next(this.collapsed);
  }

  hover(e, i) {
    if (this.collapsed) {
      this.collapsedSubMenu.top = `${e.target.offsetTop}px`;
      this.hovered = i;
    }
  }
}

export class CentralNavLink {
  linkName: string;
  subLinks: CentralNavSublink[];
  iconClass: string;
  routerLink: string;
  externalLink = false;
}

export class CentralNavSublink {
  linkName: string;
  routerLink: string;
  externalLink = false;
}
