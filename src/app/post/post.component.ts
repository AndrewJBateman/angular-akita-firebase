import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostsService } from '../state/posts.service';
import { PostsQuery } from '../state/posts.query';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../state/post.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { PostsStore } from '../state/posts.store';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postsQuery: PostsQuery,
    private postStore: PostsStore,
    private postsService: PostsService
  ) {}

  public currentPost: Post;
  public currentId: any = this.route.snapshot.paramMap.get('id');
  public editMode: boolean = false;
  public image: any;
  public busy: boolean;

  public editForm = new FormGroup({
    title: new FormControl('', Validators.required),
    content: new FormControl('', Validators.required),
    oldcover: new FormControl('', Validators.required),
  });

  public getPost() {
    if (this.postsService.getPostEntity(this.currentId) !== undefined) {
      this.postsService
        .getPostEntity(this.currentId)
        .pipe(untilDestroyed(this))
        .subscribe((entity) => {
          this.currentPost = entity;

          //edit form handling
          this.editForm.setValue({
            title: entity.title,
            content: entity.content,
            oldcover: entity.cover,
          });
        });
    } else {
      this.postsService
        .connect()
        .pipe(
          untilDestroyed(this),
          map(async () => {
            await new Promise<void>((resolve) => {
              this.postsQuery
                .selectEntity(this.currentId)
                .pipe(
                  take(1),
                  map((entity) => {
                    return entity;
                  })
                )
                .subscribe((postData) => {
                  console.log(postData);
                  this.currentPost = postData;

                  //edit form handling here too
                  this.editForm.setValue({
                    title: postData.title,
                    content: postData.content,
                    oldcover: postData.cover,
                  });
                  resolve();
                });
            });
          })
        )
        .subscribe();
    }
  }

  public handleInput($event: Event) {
    this.image = $event.target['files'];
    console.log(this.image);
  }

  public enableEdit() {
    this.editMode = !this.editMode;
  }

  //edit the post
  public async editPost(formData: Post) {
    this.busy = true;
    formData['fileref'] = this.currentPost.fileref;
    await this.postsService.update(this.currentId, formData, this.image);
    this.busy = false;
  }

  //delete the post
  public async deletePost(postId: string) {
    this.postsService.remove(postId, this.currentPost.fileref);
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    this.getPost();
  }

  ngOnDestroy(): void {}
}
