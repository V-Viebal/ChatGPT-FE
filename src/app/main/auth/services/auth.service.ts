import { Injectable, NgZone } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { IUser } from '../../features/modules/chat/interfaces/user.interface';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from 'environments/environment';

export interface ISocialProfile {
	id: string;
	email: string;
	name: string;
	picture: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

	profile!: ISocialProfile;
	public profileSubject: BehaviorSubject<ISocialProfile | undefined> = new BehaviorSubject<ISocialProfile | undefined>(undefined);
	public profile$: Observable<ISocialProfile | undefined> = this.profileSubject.asObservable();

	private collectionUrl = 'USERS';
	private _apiGoogleUrl: string = 'https://www.googleapis.com/oauth2/v1/userinfo';

	get timestamp() {
		const d = new Date();
		return d;
		// return firebase.firestore.FieldValue.serverTimestamp();
	}

	getCollUrls( collection: string ) {
		let _collection = 'USERS';
		if ( collection == 'USERS' ) _collection = "USERS";
		return _collection;
	}

	constructor(
		private _afs: AngularFirestore,
		private _ngZone: NgZone,
		private _httpClient: HttpClient
	) {}

	getUserDoc( profileData: ISocialProfile ): Observable<IUser[]> {
		return this._afs.collection<IUser>( this.getCollUrls( this.collectionUrl ), ref => ref.where( 'id', '==', profileData.id ) ).valueChanges();
	}

	createUserDoc( profileData: ISocialProfile ): Promise<IUser> {
		const timestamp = this.timestamp
		const docRef = this._afs.collection( this.getCollUrls( this.collectionUrl ) ).doc( profileData.id );
		const userData: IUser = { id: profileData.id, createDate: timestamp };
		return docRef.set( userData ).then( () => { return userData; } );
	}

	public signInByGoogle( auth2: any, gapi: any ): Observable<ISocialProfile> {
		return new Observable( ( observer: Observer<ISocialProfile> ) => {
			auth2.requestAccessToken();

			auth2.callback = ( response: any ) => {
				if ( response.error !== undefined ) {
					throw response;
				}

				const accessToken: string = gapi.client.getToken().access_token;
				this.getGoogleProfile( accessToken )
				.subscribe({
					next: ( profile: ISocialProfile ) => {
						observer.next( profile );
					},
					error	: observer.error.bind( observer ),
					complete: observer.complete.bind( observer ),
				});
			};
		})
	}

	public getGoogleProfile( accessToken: string ): Observable<ISocialProfile> {
		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${ accessToken }`,
		};

		return this._httpClient.get<ISocialProfile>( `${this._apiGoogleUrl}`, { headers } );
	}

	public showGoogleOneTab( google: any ) {
		this.profile = JSON.parse( localStorage.getItem( 'profile' )! ) || null;
		if( !this.profile ) {
			google.accounts.id.initialize({
				client_id: ENVIRONMENT.GOOGLE_CLIENT_ID,
				callback: ( credential: any ) => {
					this._ngZone.run(() => {
						this._loginWithGoogle( credential );
					});
				},
				auto_select: false,
				cancel_on_tap_outside: true,
			});
			google.accounts.id.prompt(( notification: any ) => {
				if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
				// continue with another identity provider.
				}
			});
		}
	}

	public _loginWithGoogle( response: any ) {
		const responsePayload = this.decodeJwtResponse(response.credential);
		this.profile = {
			id: responsePayload.sub,
			name: responsePayload.name,
			picture: responsePayload.picture,
			email: responsePayload.email,
		}
		this.profileSubject.next( this.profile );
	}

	decodeJwtResponse(credential: string) {
		let base64Url = credential.split('.')[1];
		let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		let jsonPayload = decodeURIComponent(window.atob(base64).split('').map( (c) => {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(''));

		return JSON.parse(jsonPayload);
	}
}
