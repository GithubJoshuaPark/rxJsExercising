import { Component, OnDestroy } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, combineLatest, filter, forkJoin, map, merge, Observable, ReplaySubject, Subject, Subscription, switchMap, takeUntil, zip } from 'rxjs';
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

  mySubject = new Subject();
  howManyCalled = 0;

  myBehaviorSubject = new BehaviorSubject('initial value');
  howManyCalledBehaviorSubject = 0;

  myReplaySubject = new ReplaySubject(3);
  howManyCalledReplaySubject = 0;

  items: { label: string; no: number }[] = [];

  private destroy = new Subject();
  private subscriptions: Subscription[] = [];

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

    this.mySubject.next
    this.mySubject.complete();

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
    this.subscriptions.push(
      myObservable1.subscribe((value) => console.log(value, 'of')) // emited all at once
    );

    const myObservable2 = from(myArray);
    this.subscriptions.push(
      myObservable2.subscribe((value) => console.log(value, 'from')) // emited one by one
    );

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
      this.subscriptions.push(
        forkJoin([userObservable, postObservable]).subscribe(([user, posts]) => {
          // using the forkJoin operator to combine these two observables
          // into a single observable that emits both values as an array.
          this.posts = posts.map((post, index) => ({
            id: index,
            title: post.title,
            author: user.name,
            body: 'body',
          }));
        })
      );

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
      this.subscriptions.push(
        zip([userObservable, postObservable]).subscribe(([user, posts]) => {
          // using the zip operator to combine these two observables into a single observable
          // that emits an array containing the latest values from both observables.
          this.posts = posts.map((post, index) => ({
            id: index,
            title: post.title,
            author: user.name,
            body: 'body',
          }));
        })
      );

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
      this.subscriptions.push(
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
        )
      );

    } catch (error) {
      console.log(error);
    } finally {
      loadingCtr.dismiss();
    }
  }

  /**
   * merge() is a static method of the Observable class.
   */
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
      this.subscriptions.push(
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
        })
      );

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
   * map() is an operator that takes a function as an argument.
   */
  async callMapExample() {
    console.log('callMapExample');
    const userObservable = this.http.get(
      'https://swapi.dev/api/people/1'
    ).pipe(map((data: any) => {
      return data.films;
    }));

    const loadingCtr = await this.showLoading('');
    try {
      this.subscriptions.push(
        userObservable.subscribe((data) => {
          console.log(data);
          loadingCtr.dismiss();
        })
      );

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
   * switchMap() is an operator that takes a function as an argument.
   */
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

      this.subscriptions.push(
        userObservable.subscribe((data) => {
          console.log(data);
          loadingCtr.dismiss();
        })
      );

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
   * filter() is an operator that takes a predicate function as an argument.
   */
  async filterCallExample() {
    console.log('filterCallExample');

    const loadingCtr = await this.showLoading('');
    try {
      const userObservable = this.http.get(
        'https://swapi.dev/api/people/1'
      ).pipe(filter((data: any) => {
        return data.films.length > 0;
      }));

      this.subscriptions.push(
        userObservable.subscribe((data) => {
          console.log(data);
          loadingCtr.dismiss();
        })
      );

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
   * takeUntil() is an operator that takes an observable as an argument.
   */
  async takeUntilCallExample() {
    console.log('takeUntilCallExample');

    const loadingCtr = await this.showLoading('');
    try {
      const userObservable = this.http.get(
        'https://swapi.dev/api/people/1'
      ).pipe(takeUntil(this.destroy));

      this.subscriptions.push(
        userObservable.subscribe((data) => {
          console.log(data);
          loadingCtr.dismiss();
        })
      );

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
   * subject subscribe example
   */
  async callSubjectExample() {
    console.log('callSubjectExample');

    const loadingCtr = await this.showLoading('');
    try {
      this.subscriptions.push(
        this.mySubject.subscribe((data) => {
          console.log(data);
          loadingCtr.dismiss();
        })
      );

      this.howManyCalled += 1;
      this.mySubject.next(`called ${this.howManyCalled} times by Subject`);
      console.log(`called ${this.subscriptions.length} times by Subject.subscribe`);
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
   * behavior subject subscribe example
   */
  async callBehaviorSubjectExample() {
    console.log('callBehaviorSubjectExample');

    const loadingCtr = await this.showLoading('');
    try {
      this.subscriptions.push(
        this.myBehaviorSubject.subscribe((data) => {
          console.log(data);
          loadingCtr.dismiss();
        })
      );

      this.howManyCalledBehaviorSubject += 1;
      this.myBehaviorSubject.next(`called ${this.howManyCalledBehaviorSubject} times by BehaviorSubject`);
      console.log(`called ${this.subscriptions.length} times by BehaviorSubject.subscribe`);
    } catch (error) {
      console.log(error);
    } finally {
      const loadingCtr_ = await this.loadingCtrl.getTop();
      if (loadingCtr_) {
        loadingCtr_.dismiss();
      }
    }
  }

  async callReplaySubjectExample() {
    console.log('callReplaySubjectExample');

    const loadingCtr = await this.showLoading('');
    try {
      this.subscriptions.push(
        this.myReplaySubject.subscribe((data) => {
          console.log(data);
          loadingCtr.dismiss();
        })
      );

      for(let i = 0; i < 3; i++) {
        this.howManyCalledReplaySubject += 1;
        this.myReplaySubject.next(`called ${this.howManyCalledReplaySubject} times by ReplaySubject`);
      }

      console.log(`called ${this.subscriptions.length}: times by ReplaySubject.subscribe`);
    } catch (error) {
      console.log(error);
    } finally {
      const loadingCtr_ = await this.loadingCtrl.getTop();
      if (loadingCtr_) {
        loadingCtr_.dismiss();
      }
    }
  }

  callDefaultExample() {
    console.log('callDefaultExample');
  }

  /**
   * call rxjs function
   * @param e
   */
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
      case 'subject':
        this.callSubjectExample();
        break;
      case 'behaviorSubject':
        this.callBehaviorSubjectExample();
        break;
      case 'replaySubject':
        this.callReplaySubjectExample();
        break;
      default:
        this.callDefaultExample();
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
