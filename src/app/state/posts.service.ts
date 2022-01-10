import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { HttpClient } from '@angular/common/http';
import { PostsStore } from './posts.store';
import { Post } from './post.model';
import { tap } from 'rxjs/operators';

import { Observable, BehaviorSubject } from 'rxjs';
import { syncCollection } from '../libs/syncCollection';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { PostsQuery } from './posts.query';

@Injectable({ providedIn: 'root' })
export class PostsService {

  constructor(
    private postsStore: PostsStore,
    private http: HttpClient,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private postsQuery: PostsQuery
  ) {}

  filepath: any;
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  public percentage: any = 0;
  public percentageChanges: BehaviorSubject<any> = new BehaviorSubject<any>(
    this.percentage
  );

  setPercentage(percent: any): void {
    this.percentage = percent;
    this.percentageChanges.next(percent);
  }

  private collection = this.firestore.collection('posts');

  // pass postsStore entity
  public connect(): Observable<Post[]> {
    return syncCollection(this.collection, this.postsStore);
  }

  // note the website https://api.com is no longer available- replaced with rick and morty
  get(): Observable<Post[]> {
    return this.http.get<Post[]>('https://rickandmortyapi.com/api').pipe(
      tap((entities) => {
        this.postsStore.set(entities);
      })
    );
  }

  // get id object from Akita
  getPostEntity(id: ID): Observable<Post> {
    if (this.postsQuery.hasEntity(id)) {
      return this.postsQuery.selectEntity(id);
    }
  }

  async add(post: Post, files: any) {
    await this.uploadImage(files);

    let newpost = {
      title: post['title'],
      content: post['content'],
      cover: this.downloadURL,
      fileref: this.filepath,
    };

    let p = await this.firestore.collection('posts').add(newpost);
    this.setPercentage(null);
  }

  // id type is string or number or type ID
  async update(id: any, post: Partial<Post>, files: any[]) {
    let updatedPost = {
      title: post.title,
      content: post.content,
    };
    console.log(files);
    if (files != null) {
      await this.uploadImage(files);

      updatedPost['cover'] = this.downloadURL;
      updatedPost['fileref'] = this.filepath;

      const storageRef = this.storage.storage.ref();
      storageRef
        .child(post.fileref)
        .delete()
        .then(() => {
          console.log('image deleted');
        })
        .catch((err) => {
          console.log(err);
        });
    }

    await this.firestore
      .collection('posts')
      .doc(id)
      .set(updatedPost, { merge: true });
  }

  remove(id: any, image: string) {
    const storageRef = this.storage.storage.ref();
    storageRef
      .child(image)
      .delete()
      .then(() => {
        console.log('image deleted');
      })
      .catch((err) => {
        console.log(err);
      });

    this.firestore
      .collection('posts')
      .doc(id)
      .delete()
      .then(() => {
        this.postsStore.remove(id);
        console.log('post removed');
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public async uploadImage(files: any[]) {
    const image = files[0];
    this.filepath = Date.now() + '-' + files[0]['name'];
    //get the reference
    const fileRef = this.storage.ref(this.filepath);
    const task = this.storage.upload(this.filepath, image);

    //get the percentage
    this.uploadPercent = task.percentageChanges();

    //subscribe to the percentage. Truncate percentage
    this.uploadPercent.subscribe((percent) => {
      console.log(percent + ' %');
      this.setPercentage(Math.trunc(percent));
    });

    let upload = await task.snapshotChanges().toPromise();
    this.downloadURL = await fileRef.getDownloadURL().toPromise();
  }
}
