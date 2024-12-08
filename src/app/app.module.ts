import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';

import { ServiceWorkerModule as SWkerModule } from '@angular/service-worker';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { FeaturesModule } from './main/features/features.module';

import { ENVIRONMENT } from 'environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { FIREBASE_OPTIONS, AngularFireModule  } from '@angular/fire/compat';
import { AuthModule } from './main/auth/auth.module';
import { SharedModule } from './main/common/shared/shared.module';
import { DatePipe } from '@angular/common';

const ServiceWorkerModule = SWkerModule.register('ngsw-worker.js', {
  enabled: !isDevMode(),
  registrationStrategy: 'registerWhenStable:30000',
});

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,

    AppRoutingModule,

    FeaturesModule,
    AuthModule,
    SharedModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      }
    }),

    NgxSpinnerModule,

    ServiceWorkerModule,

    provideFirebaseApp(() => initializeApp( ENVIRONMENT.FIREBASE_CONFIG )),
    provideFirestore(() => getFirestore()),

    AngularFireModule.initializeApp( ENVIRONMENT.FIREBASE_CONFIG ),
    AngularFireStorageModule
  ],
  providers: [ { provide: FIREBASE_OPTIONS, useValue: ENVIRONMENT.FIREBASE_CONFIG }, DatePipe ],
  bootstrap: [AppComponent],
})
export class AppModule {}
