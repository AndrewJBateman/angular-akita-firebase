import { Component, AfterContentChecked } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterContentChecked {
  title = 'angular-akita-firebase';

  constructor(private router: Router) {}

  addItem: boolean = true;

  checkUrl() {
    this.router.events.subscribe(() => {
      if (!this.router.url.indexOf('/addpost')) {
        this.addItem = false;
      } else {
        this.addItem = true;
      }
    });
  }

  ngOnInit(): void {
    this.checkUrl();
  }

  //
  ngAfterContentChecked(): void {
    let bodyEl = document.querySelector('body');
    if (
      !this.router.url.indexOf('/addpost') ||
      !this.router.url.indexOf('/post')
    ) {
      console.log('data');
      bodyEl.style.background = '#00159C';
    } else {
      bodyEl.style.background = '';
    }
  }
}
