import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { BehaviorSubject, Observable, from, switchMap } from 'rxjs';

export interface ISocialProfile {
	id: string;
	email: string;
	name: string;
	picture: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeaturesService {

	public settingSubject: BehaviorSubject<boolean | undefined> = new BehaviorSubject<boolean | undefined>(undefined);
	public setting$: Observable<boolean | undefined> = this.settingSubject.asObservable();

	constructor(
		private _storage: AngularFireStorage,
	) {}

	uploadImage(imageFile: File): Observable<string> {
		const filePath = `background/${ imageFile.name }`;

		return from( this._storage.upload( filePath, imageFile ) ).pipe(
			switchMap( ( task: any ) => from( task.ref.getDownloadURL() ) as Observable<string> )
		);
	}
}
