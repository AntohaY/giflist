import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-favourite-subreddit-list',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>Favourite subreddits</ion-card-title>
      </ion-card-header>

      <ion-card-content>
        <div *ngIf="favouriteSubredditList && favouriteSubredditList.length">
          <ion-chip (click)="emitLoadSubreddit(subreddit)" *ngFor="let subreddit of favouriteSubredditList">
            {{subreddit}}
          </ion-chip>
        </div>

        <div *ngIf="favouriteSubredditList.length === 0">There are no favourite subreddits!</div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [
    `

    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class FavouriteSubredditListComponent {
  @Input() favouriteSubredditList!: string[];
  @Output() loadSubreddit = new EventEmitter<string>();

  emitLoadSubreddit(subredditName: string) {
    this.loadSubreddit.emit(subredditName);
  }
}

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  declarations: [FavouriteSubredditListComponent],
  exports: [FavouriteSubredditListComponent],
})

export class FavouriteSubredditListComponentModule {}
