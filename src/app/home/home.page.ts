import { Component, OnDestroy } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { combineLatest, filter, forkJoin, map, merge, Observable, Subject, switchMap, takeUntil, zip } from 'rxjs';
import { of, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';

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
export class HomePage implements OnDestroy{
  inputValue = '';
  storedValue: string | null = '';
  myObservable: any;

  posts: Post[] = [];
  users: User[] = [];

  items: { label: string; no: number }[] = [];

  private destroy = new Subject();

  constructor(
              private http: HttpClient,
              private loadingCtrl: LoadingController
            ) {
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

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.destroy.next(0);
    this.destroy.complete();
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

  /**
   * forkJoin() is a static method of the Observable class.
   */
  async callForkJoinExample() {
    console.log('callForkJoinExample');

    const userObservable = this.http.get<User>(
      'https://jsonplaceholder.typicode.com/users/1'
    );
    const postObservable = this.http.get<Post[]>(
      'https://jsonplaceholder.typicode.com/posts?userId=1'
    );

    this.posts = [];
    const loadingCtr = await this.showLoading('');
    try {
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
      loadingCtr.dismiss();
    } catch (error) {
      console.log(error);
    } finally {
      const loadingCtr_ = await this.loadingCtrl.getTop();
      if (loadingCtr_) {
        loadingCtr_.dismiss();
      }
    }

  }

  /**
   *  zip() is a static method of the Observable class.
   */
  async callZipExample() {
    console.log('callZipExample');

    const userObservable = this.http.get<User>(
      'https://jsonplaceholder.typicode.com/users/1'
    );
    const postObservable = this.http.get<Post[]>(
      'https://jsonplaceholder.typicode.com/posts?userId=1'
    );

    this.posts = [];
    const loadingCtr = await this.showLoading('');
    try {
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
      loadingCtr.dismiss();
    } catch (error) {
      console.log(error);
    } finally {
      const loadingCtr_ = await this.loadingCtrl.getTop();
      if (loadingCtr_) {
        loadingCtr_.dismiss();
      }
    }

  }

  /**
   * combineLatest() is a static method of the Observable class.
   */
  async callCombineLatestExample() {
    console.log('callCombineLatestExample');

    const userObservable = this.http.get<User>(
      'https://jsonplaceholder.typicode.com/users/1'
    );
    const postObservable = this.http.get<Post[]>(
      'https://jsonplaceholder.typicode.com/posts?userId=1'
    );

    this.posts = [];
    const loadingCtr = await this.showLoading('');
    try {
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
    } catch (error) {
      console.log(error);
    } finally {
      loadingCtr.dismiss();
    }

  }

  async callMergeExample() {
    console.log('callMergeExample');

    const userObservable = this.http.get<User>(
      'https://jsonplaceholder.typicode.com/users/1'
    );
    const postObservable = this.http.get<Post[]>(
      'https://jsonplaceholder.typicode.com/posts?userId=1'
    );

    this.posts = [];
    const loadingCtr = await this.showLoading('');
    try {
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
      loadingCtr.dismiss();
    } catch (error) {
      console.log(error);
    } finally {
      const loadingCtr_ = await this.loadingCtrl.getTop();
      if (loadingCtr_) {
        loadingCtr_.dismiss();
      }
    }

  }

  async callMapExample() {
    console.log('callMapExample');
    const userObservable = this.http.get(
      'https://swapi.dev/api/people/1'
    ).pipe(map((data: any) => {
      return data.films;
    }));

    const loadingCtr = await this.showLoading('');
    try {
      userObservable.subscribe((data) => {
        console.log(data);
        loadingCtr.dismiss();
      });
    } catch (error) {
      console.log(error);
    } finally {
      const loadingCtr_ = await this.loadingCtrl.getTop();
      if (loadingCtr_) {
        loadingCtr_.dismiss();
      }
    }
  }

  async callSwitchMapExample() {
    console.log('callSwitchMapExample');

    const loadingCtr = await this.showLoading('');
    try {
      const userObservable = this.http.get(
        'https://swapi.dev/api/people/1'
      ).pipe(switchMap((data: any) => {
        const firstFilm = data.films[0];
        return this.http.get(firstFilm);
      }));

      userObservable.subscribe((data) => {
        console.log(data);
        loadingCtr.dismiss();
      });
    } catch (error) {
      console.log(error);
    } finally {
      const loadingCtr_ = await this.loadingCtrl.getTop();
      if (loadingCtr_) {
        loadingCtr_.dismiss();
      }
    }

  }

  async filterCallExample() {
    console.log('filterCallExample');

    const loadingCtr = await this.showLoading('');
    try {
      const userObservable = this.http.get(
        'https://swapi.dev/api/people/1'
      ).pipe(filter((data: any) => {
        return data.films.length > 0;
      }));

      userObservable.subscribe((data) => {
        console.log(data);
        loadingCtr.dismiss();
      });
    } catch (error) {
      console.log(error);
    } finally {
      const loadingCtr_ = await this.loadingCtrl.getTop();
      if (loadingCtr_) {
        loadingCtr_.dismiss();
      }
    }

  }

  async takeUntilCallExample() {
    console.log('takeUntilCallExample');

    const loadingCtr = await this.showLoading('');
    try {
      const userObservable = this.http.get(
        'https://swapi.dev/api/people/1'
      ).pipe(takeUntil(this.destroy));

      userObservable.subscribe((data) => {
        console.log(data);
        loadingCtr.dismiss();
      });
    } catch (error) {
      console.log(error);
    } finally {
      const loadingCtr_ = await this.loadingCtrl.getTop();
      if (loadingCtr_) {
        loadingCtr_.dismiss();
      }
    }

  }

  callFunction(e: any) {
    console.log(e.target.value);
    const functionName = e.target.value;

    switch (functionName) {
      case 'forkJoin':
        this.callForkJoinExample();
        break;
      case 'zip':
        this.callZipExample();
        break;
      case 'combineLatest':
        this.callCombineLatestExample();
        break;
      case 'merge':
        this.callMergeExample();
        break;
      case 'map':
        this.callMapExample();
        break;
      case 'switchMap':
        this.callSwitchMapExample();
        break;
      case 'takeUntil':
        this.takeUntilCallExample();
        break;
      default:
        break;
    }

  }


  async showLoading(caller: string = '') {
    const loading = await this.loadingCtrl.create({
      message: '무사퇴근...',
      duration: 500,
      spinner: 'bubbles',
      cssClass: 'custom-loading',
      mode: 'ios',
    });
    await loading.present();
    return loading;
  }

}
