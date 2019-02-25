import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-central-navigation',
  templateUrl: './central-navigation.component.html',
  styleUrls: ['./central-navigation.component.scss']
})

export class CentralNavigationComponent implements OnInit {
  collapsed = false;
  @Input() links: CentralNavLink[];
  @Output() collapse: BehaviorSubject<any> = new BehaviorSubject(this.collapsed);

  constructor() { }

  ngOnInit() {
  }

  toggleMenu() {
    this.collapsed = !this.collapsed;
    this.collapse.next(this.collapsed);
  }

}

export class CentralNavLink {
  linkName: string;
  subLinks: CentralNavSublink[];
  iconClass: string;
}

export class CentralNavSublink {
  linkName: string;
  routerLink: string;
}
