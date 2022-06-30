import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Post } from '../state/post.model';
import { PostsService } from '../state/posts.service';

@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.css'],
})
export class AddpostComponent implements OnInit {
  constructor(private router: Router, private postsService: PostsService) {}

  public percentage = this.postsService.percentage;
  public image: any;
  public postForm = new UntypedFormGroup({
    title: new UntypedFormControl('', Validators.required),
    content: new UntypedFormControl('', Validators.required),
    cover: new UntypedFormControl('', Validators.required),
  });

  public handleInput($event: Event) {
    this.image = $event.target['files'];
    console.log(this.image);
  }

  public async addPost(formData: Post) {
    await this.postsService.add(formData, this.image);
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    this.postsService.percentageChanges.subscribe((changesPercent) => {
      this.percentage = changesPercent;
    });
  }
}
