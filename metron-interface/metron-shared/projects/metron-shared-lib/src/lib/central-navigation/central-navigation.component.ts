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
  @Output() collapse: BehaviorSubject<any> = new BehaviorSubject(false);
  @ViewChildren('navbarParent', { read: ElementRef }) navbarParent: QueryList<
    ElementRef
  >;
  collapsed = false;
  hovered = null;
  collapsedSubMenu = {
    position: 'fixed',
    display: 'block',
    top: '0'
  };

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
}

export class CentralNavSublink {
  linkName: string;
  routerLink: string;
}
