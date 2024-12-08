import {
	ChangeDetectionStrategy, Component, OnInit,
	ChangeDetectorRef, isDevMode } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem, MessageService } from 'primeng/api';
import { AuthService, ISocialProfile } from '../../auth/services/auth.service';
import { ChatService } from '../modules/chat/services/chat.service';
import { ISystem, SystemService } from '../../common/shared/services/system.service';
import { finalize }  from 'rxjs/operators';
import { Subscription }  from 'rxjs';
import { CONSTANT as SHARED_CONSTANT } from '@main/common/shared/resources';
import { IUser } from '../modules/chat/interfaces';
import { FeaturesService } from '../services/features.service';
import { ENVIRONMENT } from '@environments/environment';
import { CONSTANT } from '@main/auth/resources';

declare const google: any;
declare const gapi: any;

@Component({
	selector: 'features',
	templateUrl: '../templates/features.component.pug',
	styleUrls: ['../styles/features.component.scss'],
	providers: [ TranslateService, MessageService, ChatService],
	changeDetection	: ChangeDetectionStrategy.OnPush,
})

export class FeaturesComponent implements OnInit {

	hamburgerItems!: MenuItem[];
	dockItems!: MenuItem[];

	isShowLanguageDialog: boolean;
	isShowSettingDialog: boolean;
	isLightStatus: boolean;
	isGoogleSubmitting: boolean;
	isShowOneTap: boolean;
	isScrollUp: boolean = true;
	languageSelected: string = 'vi';
	theme: string = '';
	backgroundImageUrl!: string;
	languageOptions: any[] = [{label: 'Tiếng Việt', value: 'vi'}, {label: 'English', value: 'en'}];
	profile: any;
	toast: any[] = [];
	system!: ISystem;
	previousScrollPosition: number = 0;

	public auth2: any;

	constructor(
		private _translateService: TranslateService,
		private _cdr: ChangeDetectorRef,
		private _authService: AuthService,
		private _messageService: MessageService,
		private _systemService: SystemService,
		private _featuresService: FeaturesService
	) {
		localStorage.getItem('language') === 'vi' && (this.languageSelected = 'vi');
		localStorage.getItem('language') === 'en' && (this.languageSelected = 'en');
		this._translateService.use(this.languageSelected)
		this.backgroundImageUrl = localStorage.getItem( 'background' )!;
		this.detectColorScheme();

		document.body.style.backgroundImage = 'url(' + this.backgroundImageUrl + ')';

		this.hamburgerItems = [
			{
				icon: 'pi pi-comments',
				command: () => {

				}
			},
			{
				icon: 'pi pi-images',
				command: () => {

				}
			},
			{
				icon: 'pi pi-play',
				command: () => {

				}
			},
			{
				icon: 'pi pi-cog',
				command: () => {
					this.isShowSettingDialog = true;
				}
			},
		];

		this.dockItems = [
			{
				label: 'Chat',
				icon: 'pi pi-comments'
			},
			{
				label: 'Image',
				icon: 'pi pi-images'
			},
			{
				label: 'Audio',
				icon: 'pi pi-play'
			},
			{
				label: 'Setting',
				icon: 'pi pi-cog',
				command: () => {
					this.isShowSettingDialog = true;
				}
			}
		];

		if ( isDevMode() ) {
			this.hamburgerItems.push( {
				icon: 'pi pi-refresh',
				command: () => {
					this.updateSystemOnCloud();
				}
			} );
			this.dockItems.push( {
				label: 'Update',
				icon: 'pi pi-refresh',
				command: () => {
					this.updateSystemOnCloud();
				}
			} )
		}

		this._initSubscription();

	}

	updateSystemOnCloud() {
		this._systemService.createSystem().then( ( system: ISystem ) => {
			localStorage.setItem('key', system.key[0]);
			localStorage.setItem('version', system.version.toString());
			this._systemService.systemSubject.next( [system] );
			console.log( 'Update done: ', system );
		} )
	}

	ngOnInit() {
		setTimeout(() => {
			document.getElementById("messagesContainer").addEventListener('scroll', this.onScroll.bind(this));
		});
	}

	onScroll() {
		const element = document.getElementById('messagesContainer');
		const scrollPosition = element.scrollTop || 0;

		if (scrollPosition > this.previousScrollPosition) {
			this.isScrollUp = false;
		} else if (scrollPosition < this.previousScrollPosition) {
			this.isScrollUp = true;
		}

		this.previousScrollPosition = scrollPosition;

		this._cdr.markForCheck();

	}

	async reloadSite() {
		const cacheNames = await caches.keys();
		await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
		localStorage.setItem( 'version', this.system.version.toString() );
		const currentUrl = window.location.href;
  		window.location.replace(currentUrl);
	}

	detectColorScheme(): void {
		this.theme='light';

		if(localStorage.getItem('theme')){
			if(localStorage.getItem('theme') == 'dark'){
				this.theme = 'dark';
			}
		} else if(window.matchMedia('(prefers-color-scheme: dark)').matches) {
			this.theme = 'dark';
		} else if(window.matchMedia('(prefers-color-scheme: light)').matches) {
			this.theme = 'light';
		}

		this.isLightStatus = ( this.theme === 'dark' ? false : true );

		if ( this.theme === 'dark' ) {
			document.documentElement.setAttribute('data-theme', 'dark');
			!this.backgroundImageUrl && ( this.backgroundImageUrl = SHARED_CONSTANT.BACKGROUND_DEFAULT_DARK );
		} else {
			document.documentElement.setAttribute('data-theme', 'light');
			!this.backgroundImageUrl && ( this.backgroundImageUrl = SHARED_CONSTANT.BACKGROUND_DEFAULT_LIGHT );
		}

	}

	changeLanguage( lang?: string ): void {
		if ( lang ) this.languageSelected = lang;

		this._translateService.use(this.languageSelected);
		localStorage.setItem('language', this.languageSelected === 'vi' ? 'vi' : 'en');
		this.isShowLanguageDialog = false;
		this._cdr.markForCheck();
	}

	hideSettingDialog() {
		this.isShowSettingDialog = false;
	}

	openSettingDialog() {
		this.isGoogleSubmitting = false;
	}

	changeAppearance( event: any ) {
		if( event.checked ) {
			localStorage.setItem('theme', 'light');
			document.documentElement.setAttribute('data-theme', 'light');
			this.theme = 'light';

			if ( !localStorage.getItem( 'background' ) ) {
				document.body.style.backgroundImage = 'url(' + SHARED_CONSTANT.BACKGROUND_DEFAULT_LIGHT + ')';
				this.backgroundImageUrl = SHARED_CONSTANT.BACKGROUND_DEFAULT_LIGHT;
			}
		} else {
			localStorage.setItem('theme', 'dark');
			document.documentElement.setAttribute('data-theme', 'dark');
			this.theme = 'dark';

			if ( !localStorage.getItem( 'background' ) ) {
				document.body.style.backgroundImage = 'url(' + SHARED_CONSTANT.BACKGROUND_DEFAULT_DARK + ')';
				this.backgroundImageUrl = SHARED_CONSTANT.BACKGROUND_DEFAULT_DARK;
			}
		}
		this._cdr.detectChanges();
	}

	logout() {
		this.profile = null;
		localStorage.removeItem( 'profile' );
		localStorage.removeItem( 'sessionID' );
		this._authService.profileSubject.next( undefined );
		this._cdr.markForCheck();
		setTimeout(() => {
			google.accounts.id.disableAutoSelect();
			this._cdr.markForCheck();
		});

		this._messageService.clear();
	}

	clearToast() {
		this.toast.forEach(toast => {
			this._messageService.clear( toast );
		});
	}

	signInByGoogle() {
		this.isGoogleSubmitting = true;

		// init google
		gapi.load( 'client', () => {} );
		this.auth2 = google.accounts.oauth2.initTokenClient({
			client_id: ENVIRONMENT.GOOGLE_CLIENT_ID,
			scope: CONSTANT.GOOGLE_SCOPE,
			callback: '',
			error_callback: ( ) => {
				this.isGoogleSubmitting = false;
				this._cdr.markForCheck();
			},
		});

		while ( !this.auth2 ) {};
		this._authService.signInByGoogle( this.auth2, gapi ).subscribe( ( profile: any ) => {
			this.isGoogleSubmitting = false;
			this.profile = {
				id: profile.id,
				name: profile.name,
				picture: profile.picture,
				email: profile.email,
			}

			this._authService.profileSubject.next( this.profile );

			this._authService.getUserDoc( this.profile ).subscribe( ( _profiles: IUser[] ) => {
				localStorage.setItem( 'profile', JSON.stringify( this.profile ) );
				if ( _profiles.length === 0 ) {
					this._authService.createUserDoc( this.profile as ISocialProfile ).then( ( _newProfile ) => {
						if ( !_newProfile ) localStorage.removeItem( 'profile' );
					} )
				}
				this._cdr.markForCheck();
			})
		});
	}

	public setbackgroundImage( imageFile: File | string ) {
		if ( typeof( imageFile ) === 'string' ) {
			this.backgroundImageUrl =  imageFile;
			document.body.style.backgroundImage = 'url(' + this.backgroundImageUrl + ')';
			localStorage.removeItem( 'background' );
			this._cdr.markForCheck();
		} else {
			this._featuresService.uploadImage( imageFile ).subscribe( ( url: string ) => {
				this.backgroundImageUrl =  url;
				document.body.style.backgroundImage = 'url(' + this.backgroundImageUrl + ')';
				localStorage.setItem( 'background', this.backgroundImageUrl );
				this._cdr.markForCheck();
			});
		}

	}

	private _initSubscription() {
		this._authService.profile$.subscribe( profile => {
			if( profile ) {
				this.profile = profile;
				this._cdr.markForCheck();

				this._messageService.clear();
			}
		});

		let systemSubscription: Subscription = this._systemService.system$
		.pipe( finalize( () => systemSubscription.unsubscribe() ))
		.subscribe( ( system: ISystem[] ) => {
			if ( !system ) return;

			this.system = system[0];

			if ( !localStorage.getItem( 'version' ) || parseFloat( localStorage.getItem( 'version' )! ) !== system[0].version ) {
				setTimeout(() => {
					this.toast.push( this._messageService.add({ key: 'reload', severity: 'info', summary: '', detail: '', sticky: true }) );
				});
			}
		})

		this._featuresService.setting$.subscribe( isOpenSetting => {
			if ( isOpenSetting ) {
				this.isShowSettingDialog = true;
				this._cdr.markForCheck();
			}
		})
	}
}
