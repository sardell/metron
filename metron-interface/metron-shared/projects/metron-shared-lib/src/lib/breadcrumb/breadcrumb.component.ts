import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute, Router, ResolveStart } from '@angular/router';
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

  constructor(private route: ActivatedRoute, private router: Router) {}

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
