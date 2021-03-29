import { Component, OnDestroy, OnInit } from '@angular/core';
import { PostsService } from '../state/posts.service';
import { PostsQuery } from '../state/posts.query';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit, OnDestroy {
  constructor(
    private postsService: PostsService,
    private postQuery: PostsQuery,
  ) {}

  public posts$ = this.postQuery.selectAll();
  public loading$ = this.postQuery.selectLoading();

  //connect to postService store, untilDestroyed unsubscribe from the observable once the component is destroyed
  ngOnInit(): void {
    this.postsService
      .connect()
      .pipe(untilDestroyed(this))
      .subscribe(() => {});
  }
  ngOnDestroy(): void {}
}
