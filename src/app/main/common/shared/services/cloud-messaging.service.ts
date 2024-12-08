import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { from, Observable } from 'rxjs';
import { ENVIRONMENT } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CloudMessagingService {

	constructor( private _http: HttpClient ) {}

	requestPermission(): Observable<string> {
		const messaging = getMessaging();
		return from(
			getToken(messaging, { vapidKey: ENVIRONMENT.FIREBASE_CONFIG.vapidKey })
		);
	}

	listen() {
		const messaging = getMessaging();
		return new Observable((subscriber) => {
			const unsubscribe = onMessage(messaging, (payload) => {
				subscriber.next(payload);
			});
			return () => {
				unsubscribe();
			};
		});
	}

	sendFCM(token: string) {
		const url = 'https://fcm.googleapis.com/fcm/send';
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${ENVIRONMENT.FIREBASE_CONFIG.accessToken}`
		});

		const payload = {
		  message: {
			token: token,
			notification: {
				title: 'Test FCM',
				body: 'This is a test message from FCM'
			}
		  }
		};

		this._http.post(url, payload, { headers }).subscribe(
			(response) => {
				console.log('FCM sent successfully:', response);
			},
			(error) => {
				console.log('Error sending FCM:', error);
			}
		);
	}
}
