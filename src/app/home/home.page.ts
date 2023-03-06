import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { combineLatest, forkJoin, map, merge, Observable, zip } from 'rxjs';
import { of, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface Post {
  id: number;
  title: string;
  author?: string;
  body: string;
}

interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  inputValue = '';
  storedValue: string | null = '';
  myObservable: any;

  posts: Post[] = [];

  items: { label: string; no: number }[] = [];

  constructor(private http: HttpClient) {
    this.myObservable = new Observable((observer) => {
      // This creates an observable that emits the values 1, 2, and 3, and then completes
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    });

    const mappedObservable = this.myObservable.pipe(
      map((value: number) => value * 2)
    );
    mappedObservable.subscribe((value: any) => console.log(value));

    this.items = []
      .constructor(10)
      .fill('label')
      .map((label: string, index: number) => ({
        label: label + ' (' + index + ')',
        no: index,
      }));
  }

  ngOnInit() {
    this.http
      .get<Post[]>('https://jsonplaceholder.typicode.com/posts')
      .subscribe((posts) => {
        this.posts = posts;
      });
  }

  async handleSave() {
    await Preferences.set({
      key: 'myValue',
      value: this.inputValue,
    });
    this.inputValue = '';
    await this.handleLoad();
  }

  async handleLoad() {
    const { value } = await Preferences.get({ key: 'myValue' });
    this.storedValue = value;
  }

  /**
   * of() and from() are two static methods of the Observable class.
   */
  showOfAndFromEx() {
    const myArray = [1, 2, 3];

    const myObservable1 = of(myArray);
    myObservable1.subscribe((value) => console.log(value, 'of')); // emited all at once

    const myObservable2 = from(myArray);
    myObservable2.subscribe((value) => console.log(value, 'from')); // emited one by one
  }

  onClick(item: number) {
    console.log(item);

    switch (item) {
      case 0:
        this.callForkJoinExample();
        break;
      case 1:
        this.callZipExample();
        break;
      case 2:
        this.callCombineLatestExample();
        break;
      case 3:
        this.callMergeExample();
        break;
      default:
        break;
    }
  }

  /**
   * forkJoin() is a static method of the Observable class.
   */
  callForkJoinExample() {
    console.log('callForkJoinExample');

    const userObservable = this.http.get<User>(
      'https://jsonplaceholder.typicode.com/users/1'
    );
    const postObservable = this.http.get<Post[]>(
      'https://jsonplaceholder.typicode.com/posts?userId=1'
    );

    forkJoin([userObservable, postObservable]).subscribe(([user, posts]) => {
      // using the forkJoin operator to combine these two observables
      // into a single observable that emits both values as an array.
      this.posts = posts.map((post, index) => ({
        id: index,
        title: post.title,
        author: user.name,
        body: 'body',
      }));
    });
  }

  /**
   *  zip() is a static method of the Observable class.
   */
  callZipExample() {
    console.log('callZipExample');

    const userObservable = this.http.get<User>(
      'https://jsonplaceholder.typicode.com/users/1'
    );
    const postObservable = this.http.get<Post[]>(
      'https://jsonplaceholder.typicode.com/posts?userId=1'
    );

    zip([userObservable, postObservable]).subscribe(([user, posts]) => {
      // using the zip operator to combine these two observables into a single observable
      // that emits an array containing the latest values from both observables.
      this.posts = posts.map((post, index) => ({
        id: index,
        title: post.title,
        author: user.name,
        body: 'body',
      }));
    });
  }

  /**
   * combineLatest() is a static method of the Observable class.
   */
  callCombineLatestExample() {
    console.log('callCombineLatestExample');

    const userObservable = this.http.get<User>(
      'https://jsonplaceholder.typicode.com/users/1'
    );
    const postObservable = this.http.get<Post[]>(
      'https://jsonplaceholder.typicode.com/posts?userId=1'
    );

    combineLatest([userObservable, postObservable]).subscribe(
      ([user, posts]) => {
        // using the combineLatest operator to combine these two observables
        // into a single observable that emits an array containing the latest values from both observables.
        this.posts = posts.map((post, index) => ({
          id: index,
          title: post.title,
          author: user.name,
          body: 'body',
        }));
      }
    );
  }

  callMergeExample() {
    console.log('callMergeExample');

    const userObservable = this.http.get<User>(
      'https://jsonplaceholder.typicode.com/users/1'
    );
    const postObservable = this.http.get<Post[]>(
      'https://jsonplaceholder.typicode.com/posts?userId=1'
    );

    merge(userObservable, postObservable).subscribe((data) => {
      let posts: Post[] = [];
      let user: User;

      if (Array.isArray(data)) {
        posts = data;
        //this.posts = posts.map((post: Post) => ({ title: post.title, author: user.name }));
      } else {
        // handle user or post data
        user = data;
      }

      this.posts = posts.map((post, index) => ({
        id: index,
        title: post.title,
        author: user?.name,
        body: 'body',
      }));
    });
  }
}
