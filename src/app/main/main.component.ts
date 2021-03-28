import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostsService } from '../state/posts.service';
import { PostsQuery } from '../state/posts.query';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { PostsStore } from '../state/posts.store';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit, OnDestroy {
  constructor(
    private postsService: PostsService,
    private postQuery: PostsQuery,
    private postStore: PostsStore
  ) {}

  public posts$ = this.postQuery.selectAll();
  public loading$ = this.postQuery.selectLoading();

  ngOnInit(): void {
    console.log(this.postStore['storeValue']['entities']);
    //connect to postService store, untilDestroyed unsubscribe from the observable once the component is destroyed
    this.postsService
      .connect()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        console.log(this.postStore['storeValue']['entities']);
      });
  }

  ngOnDestroy(): void {}
}
