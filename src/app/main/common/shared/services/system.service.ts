import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { ENVIRONMENT } from 'environments/environment';
import _ from 'lodash';


export interface ISystem {
	version: number;
	key: string[];
}


@Injectable({
  providedIn: 'root'
})
export class SystemService {

	public systemSubject: BehaviorSubject<ISystem[]> = new BehaviorSubject<any>(null);

	public system$: Observable<any> = this.systemSubject.asObservable();

	private _systemCollectionUrl = 'SYSTEM';

	constructor(
		private _afs: AngularFirestore,
	) {}

	createSystem(): Promise<ISystem> {
		const id = this._afs.createId();
		const docRef = this._afs.collection(this._systemCollectionUrl).doc(id);
		const system: ISystem = { version: ENVIRONMENT.VERSION, key: ENVIRONMENT.OPENAI_KEY };

		return docRef.set(system).then( () => system);
	}

	getSystem(): Observable<ISystem[]> {
		return this._afs.collection<ISystem>( this._systemCollectionUrl ).valueChanges();
	}

}
