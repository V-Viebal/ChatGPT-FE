import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ISystem, SystemService } from './main/common/shared/services/system.service';
import _ from 'lodash';
import { CloudMessagingService } from './main/common/shared/services/cloud-messaging.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.pug',
	styleUrls: ['./app.component.scss'],
	providers: [ TranslateService ],
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
	isLoaded: boolean = false;

	constructor(
		private spinner: NgxSpinnerService,
		private cdRef: ChangeDetectorRef,
		private _translateService: TranslateService,
		private _systemService: SystemService,
		private _cloudMessagingService: CloudMessagingService,
	) {
		this._cloudMessagingService.requestPermission().subscribe({
			next: (currentToken) => {
				if (currentToken) {
					console.log('Hurraaa!!! we got the token.....');
					console.log(currentToken);

					// Use the token to send a Firebase Cloud Message
					this._cloudMessagingService.sendFCM(currentToken);
				} else {
					console.log(
					'No registration token available. Request permission to generate one.'
					);
				}
			}, error: (err) => {
				console.log('An error occurred while retrieving token. ', err);
			}
		});

		this._cloudMessagingService.listen().subscribe(( payload ) => {
			console.log('Message received. ', payload);
		});
	}

	ngOnInit(): void {
		this._translateService.use('vi');
		localStorage.getItem( 'language' ) === 'vi' && ( this._translateService.use( 'vi' ) );
		localStorage.getItem( 'language' ) === 'en' && ( this._translateService.use( 'en' ) );

		this.spinner.show();

		setTimeout( () => {
			this.isLoaded = true;
			this.cdRef.markForCheck();

			const systemObs = this._systemService.getSystem()
			.subscribe({
				next: (systems: ISystem[]) => {
					systems = _.reverse( _.sortBy( systems, 'version' ) );

					if (!localStorage.getItem('key')) localStorage.setItem('key', systems[0].key[0]);
					if (!localStorage.getItem('version')) localStorage.setItem('version', systems[0].version.toString());
					if (!systems[0].key.includes(localStorage.getItem('key')!)) localStorage.setItem('key', systems[0].key[0]);

					this._systemService.systemSubject.next(systems);

					systemObs.unsubscribe();
				},
				error: () => {}
			});
		}, 1000 );
	}
}
