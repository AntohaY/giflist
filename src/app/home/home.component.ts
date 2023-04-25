import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { GifListComponentModule } from './ui/gif-list.components';
import { RedditService } from '../shared/data-access/reddit.service';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';
import { Gif } from '../shared/interfaces';
import { FormControl } from '@angular/forms';
import { SearchBarComponentModule } from './ui/search-bar.component';
import { SettingsComponentModule } from '../settings/settings.component';
@Component({
  selector: 'app-home',
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <ion-header>
        <ion-toolbar color="primary">
          <app-search-bar
            [subredditFormControl]="subredditFormControl"
          ></app-search-bar>
          <ion-buttons slot="end">
            <ion-button slot="start"
              id="random-button"
              (click)="randomSubreddit()"
            >
              <ion-icon name="balloon-outline"></ion-icon>
            </ion-button>
            <ion-button
              id="settings-button"
              (click)="settingsModalIsOpen$.next(true)"
            >
              <ion-icon slot="icon-only" name="settings"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
        <ion-progress-bar
          color="dark"
          *ngIf="vm.isLoading"
          type="indeterminate"
          reversed="true"
        ></ion-progress-bar>
      </ion-header>
      <ion-content>
        <app-gif-list
          *ngIf="vm.gifs"
          [gifs]="vm.gifs"
          (gifLoadStart)="setLoading($event)"
          (gifLoadComplete)="setLoadingComplete($event)"
        ></app-gif-list>
        <ion-infinite-scroll
          threshold="100px"
          (ionInfinite)="loadMore($event, vm.gifs)"
        >
          <ion-infinite-scroll-content
            loadingSpinner="bubbles"
            loadingText="Fetching gifs..."
          >
          </ion-infinite-scroll-content>
        </ion-infinite-scroll>
        <ion-popover
          trigger="settings-button"
          [isOpen]="vm.modalIsOpen"
          (ionPopoverDidDismiss)="settingsModalIsOpen$.next(false)"
        >
          <ng-template>
            <app-settings></app-settings>
          </ng-template>
        </ion-popover>
      </ion-content>
    </ng-container>
  `,
  styles: [
    `
      ion-infinite-scroll-content {
        margin-top: 20px;
      }
      ion-buttons {
        margin: auto 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  currentlyLoadingGifs$ = new BehaviorSubject<string[]>([]);
  loadedGifs$ = new BehaviorSubject<string[]>([]);
  settingsModalIsOpen$ = new BehaviorSubject<boolean>(false);

  randomSubredditList = ['damnthatsinteresting', 'science', 'highqualitygifs'];

  currentSubreddit$ = new BehaviorSubject<string>('gifs');

  subredditFormControl = new FormControl('gifs');
  // Combine the stream of gifs with the streams determining their loading status
  gifs$ = combineLatest([
    this.redditService.getGifs(this.subredditFormControl),
    this.currentlyLoadingGifs$,
    this.loadedGifs$,
  ]).pipe(
    map(([gifs, currentlyLoadingGifs, loadedGifs]) =>
      gifs.map((gif) => ({
        ...gif,
        loading: currentlyLoadingGifs.includes(gif.permalink),
        dataLoaded: loadedGifs.includes(gif.permalink),
      }))
    )
  );

  vm$ = combineLatest([
    this.gifs$.pipe(startWith([])),
    this.redditService.isLoading$,
    this.settingsModalIsOpen$,
  ]).pipe(
    map(([gifs, isLoading, modalIsOpen]) => ({
      gifs,
      isLoading,
      modalIsOpen,
    }))
  );

  constructor(private redditService: RedditService) {}

  setLoading(permalink: string) {
    this.currentlyLoadingGifs$.next([
      ...this.currentlyLoadingGifs$.value,
      permalink,
    ]);
  }

  loadMore(ev: Event, currentGifs: Gif[]) {
    this.redditService.nextPage(ev, currentGifs[currentGifs.length - 1].name);
  }

  setLoadingComplete(permalinkToComplete: string) {
    this.loadedGifs$.next([...this.loadedGifs$.value, permalinkToComplete]);

    this.currentlyLoadingGifs$.next([
      ...this.currentlyLoadingGifs$.value.filter(
        (permalink) => !this.loadedGifs$.value.includes(permalink)
      ),
    ]);
  }

  randomSubreddit() {
    this.currentSubreddit$.next(this.randomSubredditList[Math.floor(Math.random() * this.randomSubredditList.length)]);
    this.subredditFormControl.patchValue(this.currentSubreddit$.value);
  }
}
@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
      },
    ]),
    GifListComponentModule,
    SearchBarComponentModule,
    SettingsComponentModule,
  ],
  declarations: [HomeComponent],
})
export class HomeComponentModule {}
