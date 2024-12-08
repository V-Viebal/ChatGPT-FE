import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ISession, IUsage } from '../interfaces';
import { Observable } from 'rxjs';
import { ISocialProfile } from '@main/auth/services/auth.service';
import { IPresets } from '../interfaces/preset.interface';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';

@Injectable({
	providedIn: 'root'
})
export class ChatService {

	get userLocalStorage(): ISocialProfile {
		return JSON.parse( localStorage.getItem( 'profile') || '' );
	}

	constructor( private _afs: AngularFirestore, private _translateService: TranslateService ) {}

	public getPresets( _presets: IUsage[] ): IUsage[] {
		let presets: IUsage[] = this.getPresetsTranslations();
		let result: IUsage[] = [];

		_presets.forEach( ( _preset: IUsage ) => {
			result.push( _.find( presets, { id: _preset.id } ) );
		});

		return result;
	}

	public createNewPreset( presets: IPresets ): Promise<IPresets> {
		const docRef = this._afs.collection( 'PRESET' ).doc( presets.userID );
		return docRef.set( presets ).then( () => { return presets; } );
	}

	public getPreset( _userID: string ): Observable<IPresets> {
		return this._afs.collection<IPresets>( 'PRESET' ).doc( _userID ).valueChanges();
	}

	public updatePreset( preset: IPresets ): boolean | Promise<boolean> {
		let docRef = this._afs.collection( 'PRESET' ).doc( preset.userID );
		return docRef.update( preset ).then( () => { return true; } );
	}

	public createNewSession( data: ISession ): Promise<ISession> {
		const id = this._afs.createId();
		const docRef = this._afs.collection( 'SESSION' ).doc( id );
		const session: ISession = { ...data, id: id };
		return docRef.set( session ).then( () => { return session; } );
	}

	public getSessions( userID: string ) {
		return this._afs.collection( 'SESSION', ref => ref.where( 'userID', '==', userID ) ).valueChanges();
	}

	public getSession( sessionID: string, _userID: string ): Observable<ISession | undefined> {
		return this._afs.collection<ISession>( 'SESSION', ref => ref.where( 'userID', '==', _userID ) ).doc( sessionID ).valueChanges();
	}

	public updateSession( session: ISession ): boolean | Promise<boolean> {
		let docRef = this._afs.collection( 'SESSION' ).doc( session.id );
		return docRef.update( session ).then( () => { return true; } );
	}

	public deleteSession( sessionID: string, userID: string ): Promise<any> {
		const docRef = this._afs.collection(
			'SESSION',
			ref => ref.where( 'userID', '==', userID )
		).doc( sessionID );

		return docRef.delete();
	}

	public getPresetsTranslations(): IUsage[] {
		return [
			{
				id: 1,
				name: this._translateService.instant( "NAME.ALL_FIELDS" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.ALL_FIELDS" ),
				},
				temperature: 0.6,
				top_p: 0.9,
			},
			{
				id: 2,
				name: this._translateService.instant( "NAME.INFORMATION_TECHNOLOGY" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.INFORMATION_TECHNOLOGY" ),
				},
				temperature: 0.4,
				top_p: 0.9,
			},
			{
				id: 3,
				name: this._translateService.instant( "NAME.IELTS" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.IELTS" ),
				},
				temperature: 0.6,
				top_p: 0.7,
			},
			{
				id: 4,
				name: this._translateService.instant( "NAME.SAP" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.SAP" ),
				},
				temperature: 0.6,
				top_p: 0.7,
			},
			{
				id: 5,
				name: this._translateService.instant( "NAME.SOFTWARE_ENGINEERING" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.SOFTWARE_ENGINEERING" ),
				},
				temperature: 0.5,
				top_p: 0.8,
			},
			{
				id: 6,
				name: this._translateService.instant( "NAME.NETWORK_SECURITY" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.NETWORK_SECURITY" ),
				},
				temperature: 0.5,
				top_p: 0.8,
			},
			{
				id: 7,
				name: this._translateService.instant( "NAME.AI_ENGINEERING" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.AI_ENGINEERING" ),
				},
				temperature: 0.5,
				top_p: 0.8,
			},
			{
				id: 8,
				name: this._translateService.instant( "NAME.DATA_ENGINEERING" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.DATA_ENGINEERING" ),
				},
				temperature: 0.5,
				top_p: 0.8,
			},
			{
				id: 9,
				name: this._translateService.instant( "NAME.COMPUTER_ENGINEERING" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.COMPUTER_ENGINEERING" ),
				},
				temperature: 0.5,
				top_p: 0.8,
			},
			{
				id: 10,
				name: this._translateService.instant( "NAME.COMPUTER_NETWORKING" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.COMPUTER_NETWORKING" ),
				},
				temperature: 0.5,
				top_p: 0.8,
			},
			{
				id: 11,
				name: this._translateService.instant( "NAME.ROBOTICS" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.ROBOTICS" ),
				},
				temperature: 0.5,
				top_p: 0.8,
			},
			{
				id: 12,
				name: this._translateService.instant( "NAME.ECOMMERCE" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.ECOMMERCE" ),
				},
				temperature: 0.5,
				top_p: 0.8,
			},
			{
				id: 13,
				name: this._translateService.instant( "NAME.SOCIAL_MEDIA" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.SOCIAL_MEDIA" ),
				},
				temperature: 0.7,
				top_p: 0.9,
			},
			{
				id: 14,
				name: this._translateService.instant( "NAME.ELECTRONICS_ENGINEERING" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.ELECTRONICS_ENGINEERING" ),
				},
				temperature: 0.5,
				top_p: 0.8,
			},
			{
				id: 15,
				name: this._translateService.instant( "NAME.CHEMICAL_ENGINEERING" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.CHEMICAL_ENGINEERING" ),
				},
				temperature: 0.5,
				top_p: 0.8,
			},
			{
				id: 16,
				name: this._translateService.instant( "NAME.MECHANICAL_ENGINEERING" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.MECHANICAL_ENGINEERING" ),
				},
				temperature: 0.5,
				top_p: 0.8,
			},
			{
				id: 17,
				name: this._translateService.instant( "NAME.ELECTRICAL_ENGINEERING" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.ELECTRICAL_ENGINEERING" ),
				},
				temperature: 0.5,
				top_p: 0.8,
			},
			{
				id: 18,
				name: this._translateService.instant( "NAME.HEALTHCARE_MANAGEMENT" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.HEALTHCARE_MANAGEMENT" ),
				},
				temperature: 0.7,
				top_p: 0.9,
			},
			{
				id: 19,
				name: this._translateService.instant( "NAME.MATERIALS_ENGINEERING" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.MATERIALS_ENGINEERING" ),
				},
				temperature: 0.5,
				top_p: 0.8,
			},
			{
				id: 20,
				name: this._translateService.instant( "NAME.BIOTECHNOLOGY" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.BIOTECHNOLOGY" ),
				},
				temperature: 0.7,
				top_p: 0.9,
			},
			{
				id: 21,
				name: this._translateService.instant( "NAME.SERVICE_INDUSTRY" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.SERVICE_INDUSTRY" ),
				},
				temperature: 0.7,
				top_p: 0.6,
			},
			{
				id: 22,
				name: this._translateService.instant( "NAME.INDUSTRIAL_SECTOR" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.INDUSTRIAL_SECTOR" ),
				},
				temperature: 0.6,
				top_p: 0.7,
			},
			{
				id: 23,
				name: this._translateService.instant( "NAME.AGRICULTURE" ),
				system: {
					role: 'system',
					content: this._translateService.instant( "CONTENT.AGRICULTURE" ),
				},
				temperature: 0.5,
				top_p: 0.8,
			},
		];
	}
}
