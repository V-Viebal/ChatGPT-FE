import {
	AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef,
	Component, ElementRef, OnDestroy, OnInit,
	Renderer2, ViewChild
} from '@angular/core';
import { take, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';

import { ConfirmationService, MessageService } from 'primeng/api';
import { Timestamp } from 'firebase/firestore';
import { ChatService } from '../services/chat.service';
import { IUser } from '../interfaces/user.interface';
import { ChatGptService } from '../services/chat-gpt.service';
import { ICompletion, IMessage, IPresets, ISession, IUsage } from '../interfaces';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService, ISocialProfile } from 'app/main/auth/services/auth.service';
import { ENVIRONMENT } from 'environments/environment';
import { CONSTANT } from 'app/main/auth/resources';
import { Clipboard } from '@angular/cdk/clipboard';
import { Platform } from '@angular/cdk/platform';
import { FeaturesService } from 'app/main/features/services/features.service';
import { HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MindsetType } from '../resources';

const favicon = <HTMLLinkElement>document.getElementById('favicon');

declare const google: any;
declare const gapi: any;

@Component({
	selector: 'chat',
	templateUrl: '../templates/chat.component.pug',
	styleUrls: ['../styles/chat.component.scss'],
	providers: [ TranslateService, ConfirmationService ],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {

	@ViewChild('messageInput') myInput!: ElementRef;

	readonly MINDSET_TYPE: typeof MindsetType = MindsetType;

	isEndOfConversation: boolean;
	isShowSessionDialog: boolean;
	isResponding: boolean;
	isTextareaFocused: boolean;
	isShowScrollButton: boolean;
	isShowWaitingText: boolean;
	isShowResent: boolean;
	isGoogleSubmitting: boolean;
	isReloading: boolean;
	isInputSessionName: boolean;
	isShowGGButtonInSession: boolean;
	isQuickToolbarSubmit: boolean;
	isScreenSizeSmall: boolean;
	isSessionCreating: boolean;
	isSessionGetting: boolean;
	isPresetShow: boolean;
	isNewPresetShow: boolean;
	isMaximize: boolean;
	isScrollUp: boolean = true;
	tempSessionName: string;
	userMessage: string;
	aiAvatar: string;
	userAvatar: string;
	assistantMessage: string;
	textResponding: string;
	helloText: string;
	reloadCount: number = 0;
	previousScrollPosition: number = 0;
	messageCanResent: IMessage;
	profile: ISocialProfile;
	selectedSession: ISession;
	presetsSubscription?: Subscription;
	sessionSubscription?: Subscription;
	translationSubscription: Subscription;
	conversation: IMessage[] = [];
	sessions: ISession[] = [];
	chatSubscription: Subscription;
	auth2: any;
	sessionEditing: ISession;
	presetsObject: IPresets;
	presetForm: FormGroup;
	toast: any[] = [];
	presets: IUsage[];
	customPresets: IUsage[];
	presetSelected: IUsage;
	tempPresets: IUsage[];
	tempCustomPresets: IUsage[];
	mindsets: any;

	constructor(
		private _confirmationService: ConfirmationService,
		private _chatGptService: ChatGptService,
		private _cdr: ChangeDetectorRef,
		private _renderer: Renderer2,
		private _translateService: TranslateService,
		private _chatService: ChatService,
		private _authService: AuthService,
		private _messageService: MessageService,
		private _clipboard: Clipboard,
		private spinner: NgxSpinnerService,
		private _platform: Platform,
		private _featureService: FeaturesService,
		private _elementRef: ElementRef,
		private _fb: FormBuilder,
	) {

		this.presets = this._chatService.getPresetsTranslations();
		this._translateService.onLangChange.subscribe(() => {
			this.presets && ( this.presets = this._chatService.getPresets( this.presets ) );
			this.tempPresets && ( this.tempPresets = this._chatService.getPresets( this.tempPresets ) );
			this.tempCustomPresets && ( this.tempCustomPresets = this._chatService.getPresets( this.tempCustomPresets ) );
			this.presetSelected && ( this.presetSelected = this._chatService.getPresets( [this.presetSelected] )[ 0 ] );
		});

		this._authService.profile$
		.subscribe({
			next: ( profile: ISocialProfile ) => {
				if( profile ) {
					this.presetsSubscription && this.presetsSubscription.unsubscribe();
					this.sessionSubscription && this.sessionSubscription.unsubscribe();

					this.getPreset( profile );
					this.profile = profile;
					localStorage.setItem( 'profile', JSON.stringify( this.profile ) );
					this.getSessions();
					this.isShowGGButtonInSession = false;

				} else {
					this.presetSelected = this._chatService.getPresetsTranslations()[ 0 ];
					this.profile = undefined;
					this.sessions = [];
					this.conversation = [];
					this.isShowGGButtonInSession = true;
				}
			}
		})

		this.presetForm = this._fb.group(
			{
				presetName: [
					undefined,
					[ Validators.required, Validators.maxLength( 255 ) ],
				],
				presetMindset: [
					undefined,
					[ Validators.required, Validators.maxLength( 255 ) ],
				],
				presetDescription: [
					undefined,
					[ Validators.required, Validators.maxLength( 255 ) ],
				],
			},
		);

		this.mindsets = [
			{
				name: this._translateService.instant('MESSAGE.EXAC'),
				type: this.MINDSET_TYPE.EXAC,
			},
			{
				name: this._translateService.instant('MESSAGE.BALANCED'),
				type: this.MINDSET_TYPE.BALANCED,
			},
			{
				name: this._translateService.instant('MESSAGE.CREATIVE'),
				type: this.MINDSET_TYPE.CREATIVE,
			}
		]
	}

	ngOnInit(): void {
		this.animateText();
		this.checkScreenSize();
		this._renderer.listen('window', 'resize', () => {
			this.checkScreenSize();
		});

		this.profile = JSON.parse( localStorage.getItem( 'profile' )! );

		if ( this.profile ) {
			this._authService.profileSubject.next( this.profile );

			const sessionID = localStorage.getItem( 'sessionID' );
			if ( sessionID ) {
				this.getSession( sessionID );
			}
		}

		this.spinner.hide();
		this._cdr.markForCheck();
	}

	ngAfterViewChecked(): void {
		if (this.myInput && !this.isTextareaFocused) {
			this.focusInputTextarea();
		}
	}

	ngOnDestroy(): void {
		this.chatSubscription && this.chatSubscription.unsubscribe();
		this.sessionSubscription && this.sessionSubscription.unsubscribe();
		this.translationSubscription && this.translationSubscription.unsubscribe();
		this.presetsSubscription && this.presetsSubscription.unsubscribe();
	}

	public cancelNewPreset() {
		this.isNewPresetShow = false;

	}

	public createNewPreset() {

	}

	public getPreset( profile: ISocialProfile ) {
		this.presetsSubscription = this._chatService.getPreset( profile.id ).pipe( take( 1 ) ).subscribe({
			next: ( presetsObject: IPresets ) => {

				if ( presetsObject ) {
					this.presetsObject = presetsObject;

					this.presets = this.orderObjectsByIndex( presetsObject.order );
					this.presetSelected = this.presets[ presetsObject.selectedIndex[ 0 ] >= 0 ? presetsObject.selectedIndex[ 0 ] : presetsObject.selectedIndex[ 1 ] ];

				} else {
					this.presetSelected = this.presets[ 0 ];
					this._chatService.createNewPreset({ order: _.map( this.presets, 'id' ), userID: profile.id, selectedIndex: [ 0, -1 ] }).then( ( _presetsObject: IPresets ) => this.presetsObject = _presetsObject );
				}

				this._cdr.markForCheck();
			},
		});
	}

	public continue() {
		this.isResponding = true;
		this.sendingObservable();
	}

	public orderObjectsByIndex( indexArray: number[] ) {
		const presets: IUsage[] = this._chatService.getPresetsTranslations();
		const result: IUsage[] = [];

		for ( let i = 0; i < indexArray.length; i++ ) {

			result.push( presets[ _.findIndex( presets, { id: indexArray[i] } ) ] );
		}

		return result;
	}

	public onPresetReorder() {
		if ( !this.presetsObject ) return;

		this.presetsObject.order = _.map( this.presets, 'id' );

		( this._chatService.updatePreset( this.presetsObject ) as Promise<boolean> ).then( ( isDone: boolean ) => {
			if ( !isDone ) return;

			this.onPresetReorder();
		});
	}

	public onPresetChange( event: IUsage[] ) {
		this.presetSelected = event[ 0 ];

		if ( !this.presetsObject ) return;

		this.presetsObject.selectedIndex = [ _.findIndex( this.presets, { id: this.presetSelected.id } ), -1 ];

		( this._chatService.updatePreset( this.presetsObject ) as Promise<boolean> ).then( ( isDone: boolean ) => {
			if ( !isDone ) return;

			this.onPresetReorder();
		});;
	}

	public animateText() {
		setTimeout(() => {
			this.helloText = '';

			let index = 0;
			let intervalId;

			const executeCode = () => {
			this.helloText += this._translateService.instant('MESSAGE.HELLO')[index];
			index++;
			this._cdr.markForCheck();

			if (index > this._translateService.instant('MESSAGE.HELLO').length) {
				this.helloText = this._translateService.instant('MESSAGE.HELLO');
				clearInterval(intervalId);
				setTimeout(() => {
					this.helloText = '';
					index = 0;

					this._cdr.markForCheck();
					intervalId = setInterval(executeCode, 100);
				}, 1000);
			}
			};

			// Start the interval
			intervalId = setInterval(executeCode, 100);
		});
	}

	public onScroll() {
		const element = this._elementRef.nativeElement.querySelector('#messagesContainer');
		const scrollPosition = element.scrollTop || 0;

		this.isScrollUp = scrollPosition < this.previousScrollPosition;
		this.previousScrollPosition = scrollPosition;

		if ( !this.isScrollUp ) {
			const isEndOfScroll
				= element.scrollTop + element.clientHeight - 100 <= element.scrollHeight
					&& element.scrollTop + element.clientHeight + 100 >= element.scrollHeight;

			isEndOfScroll ? ( this.isEndOfConversation = true ) : ( this.isEndOfConversation = false );
		} else {
			this.isEndOfConversation = false;
		}
	}

	public updateHeightOfChatContainer() {
		const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		document.getElementById("messagesContainer")!.style.height = (windowHeight - ( this.isScreenSizeSmall || this.isMaximize ? 122 : 170 ) ) + "px";
	}

	public checkScreenSize() {
		const maxWidth = 1200;
		const maxHeight = 420;

		this.isScreenSizeSmall = window.matchMedia(`(max-width: ${maxWidth}px) or (max-height: ${maxHeight}px)`).matches;

		this.isScreenSizeSmall && this.resize( false );

		var styleSheet = document.styleSheets[0];
		var cssText = this.isScreenSizeSmall ? '.resize { display: none !important; }' : '.resize { display: flex !important; }';
		styleSheet.insertRule(cssText, styleSheet.cssRules.length);


		this.updateHeightOfChatContainer();
	}

	public focusInputTextarea() {
		if ( this._platform.IOS || this._platform.ANDROID ) return;

		this.myInput.nativeElement.focus();
		this.isTextareaFocused = true;
	}

	public getSessions() {
		this.profile = JSON.parse( localStorage.getItem( 'profile' )! );

		if ( !this.profile ) {
			this.spinner.hide();
			this._cdr.markForCheck();
			return;
		}

		this.sessionSubscription = this._chatService.getSessions( this.profile.id )
		.pipe( take(1) )
		.subscribe({
			next: ( sessions: any ) => {
				if ( this.isSessionCreating ) return;

				_.forEach( sessions, ( session: ISession ) => {
					session.createAt = ( session.createAt as Timestamp ).toDate();
				});

				this.sessions =  _.reverse( _.sortBy( sessions, 'createAt' ) );

				this.checkBeforeGetSession();
				this._cdr.markForCheck();
			}
		});
	}

	public checkBeforeGetSession() {
		const sessionID = localStorage.getItem( 'sessionID' );

		if ( ( this.conversation.length > 0 && this.conversation[ 0 ].role === 'user' && !sessionID) || this.sessions.length === 0 ) {
			const newSession: ISession = {
				id: '',
				userID: ( this.profile as ISocialProfile ).id,
				name: this._translateService.instant('MESSAGE.NEW_CHAT'),
				messages: this.conversation,
				createAt: new Date(),
			}

			this.createSessionObs( newSession );
		} else {
			sessionID ? this.getSession( sessionID ) : this.getSession( this.sessions[ 0 ].id );
		}
	}

	public getSession( sessionID: string, newSessions?: ISession[] ) {
		this.messageCanResent = undefined;
		this.isShowResent = false;
		this.isSessionGetting = true;
		this.profile = JSON.parse( localStorage.getItem( 'profile' )! );
		if ( !this.profile ) {
			this.isSessionGetting = false;
			this.spinner.hide();
			this._cdr.markForCheck();
			return;
		}

		this._chatService.getSession( sessionID, this.profile.id )
		.pipe( take(1) )
		.subscribe( ( session: ISession | undefined ) => {
			if ( session ) {
				this.isSessionGetting = false;
				session.createAt = ( session.createAt as Timestamp ).toDate();
				this.selectedSession = session;

				newSessions && ( this.sessions = newSessions );
				this.tempSessionName = '';

				localStorage.setItem( 'sessionID', session.id );

				this.conversation = session.messages;
				this.cancelSendMessage();

				this._cdr.markForCheck();

				setTimeout(() => {
					this.checkScrollHeight();
					this.scrollToBottom( true, true );
					this.spinner.hide();

					if ( this.conversation.length > 0 && this.conversation[ this.conversation.length - 1 ].role === 'user' ) {
						this.isResponding = true;
						this.sendingObservable();
					}

					this._cdr.markForCheck();
				});
			} else {
				this.getSession( this.sessions[ 0 ].id );
			}
		})
	}

	public editSession( session: ISession ) {
		this.sessionEditing = _.cloneDeep( session );

		this._cdr.markForCheck();
	}

	public cancelEditSessionName() {
		this.sessionEditing = undefined;

		this._cdr.markForCheck();
	}

	public changeSessionName( session: ISession ) {
		( this._chatService.updateSession( session ) as Promise<boolean> ).then( ( isDone: boolean ) => {
			if ( !isDone ) return;

			this.cancelEditSessionName();
		});
	}

	public deleteSession( session: ISession, event: any ) {
		if ( this.sessions.length === 1 ) {
			this._messageService.add({
				key: 'delete-error',
				severity: 'warn',
				summary: this._translateService.instant('MESSAGE.DELETE_ERROR'),
				detail: this._translateService.instant('MESSAGE.DELETE_ERROR_CONTENT')
			});

		} else {
			this.profile = JSON.parse( localStorage.getItem( 'profile' )! );
			if ( !this.profile ) return;

			this._confirmationService.confirm({
				target: event.target || undefined,
				message: this._translateService.instant('MESSAGE.DELETE_ALERT'),
				icon: 'pi pi-exclamation-triangle',
				acceptLabel: this._translateService.instant('LABEL.YES'),
				rejectLabel: this._translateService.instant('LABEL.NO'),
				acceptButtonStyleClass: 'accept-cancel',
				rejectButtonStyleClass: 'reject-cancel',
				accept: () => {
					this._chatService.deleteSession( session.id, (this.profile as ISocialProfile).id ).then( () => {
						_.pullAt( this.sessions, _.findIndex( this.sessions, { id: session.id } ) );

						this.sessions = _.cloneDeep( this.sessions );

						if ( localStorage.getItem( 'sessionID' ) === session.id ) {
							this.getSession( this.sessions[0].id );
						}

						this._cdr.markForCheck();
					})
				},
				reject: () => {}
			});
		}
	}

	public checkScrollHeight() {
		const contentDiv = this._elementRef.nativeElement.querySelector('#messagesContainer');

		if ( !this.isShowScrollButton ) {
			if ( contentDiv.scrollHeight > contentDiv.clientHeight ) {
				this.scrollToBottom( true );
			}
		}

		this.isShowScrollButton = contentDiv.scrollHeight > contentDiv.clientHeight;
	}

	public clearToast() {
		this.toast.forEach(toast => {
			this._messageService.clear( toast );
		});
	}

	public sendMessage( message: string ): void {
		if (!message.trim()) return;

		if ( !this.profile ) {
			setTimeout( () => {
				this.toast.push( this._messageService.add({ key: 'save', severity: 'info', summary: '', detail: '', sticky: true }) );
			}, 1000 );
		}

		this.conversation.push({
			role: 'user',
			content: message,
		});
		this.userMessage = '';

		this.isResponding = true;
		this.isShowResent = false;
		this.isScrollUp = false;
		this._checkAndScrollBottom( true );
		this.sendingObservable();
	}

	public getIndexOfAssistant( conversation: IMessage[] ): number {
		let tempIndex: number[] = [];
		_.forEach( conversation, ( message, index ) => {
			message.role === 'assistant' && ( tempIndex.push( index ) )
		})
		return _.defaultTo(_.max(tempIndex), -1) + 1;
	}

	public sendingObservable( isLongerModel?: boolean ) {
		this.isResponding = true;
		this.isShowResent = false;
		this.chatSubscription && this.chatSubscription.unsubscribe();

		let conversationClone: IMessage[] = _.reverse( _.cloneDeep( this.conversation ) );
		let conversationRequest: IMessage[] = [];
		let contentSum: number = 0;

		_.forEach( conversationClone, ( message: IMessage ) => {
			message.content && ( contentSum += message.content.replace(/\s/g, "").length );

			if ( contentSum <= 14000 ) {
				conversationRequest.push( message );
			}
		} )

		conversationRequest = _.reverse( conversationRequest )

		if ( conversationRequest.length === 0 && this.reloadCount === 0 ) {
			this.reloadCount = 11;
			this.toast.push( this._messageService.add({ severity: 'error', summary: 'Error', detail: this._translateService.instant( 'MESSAGE.ERROR_TEXT_SO_LONG' ) }) );
		}

		let respondingIndex: number = 0;
		let tokenIndex: number = 0;
		let text: string = '';

		this.chatSubscription = this._chatGptService.createCompletions( conversationRequest, isLongerModel, this.presetSelected ).subscribe({
			next: ( event: any ) => {

				if ( event.type === HttpEventType.DownloadProgress ) {

					if ( event.total ) {
						this._handleError();
						return;
					}

					this.isShowWaitingText = false;

					const lines: string[] = event.partialText.split( '\n' );
					let  parsedLines: ICompletion[] = this._getParsedStreamedCompletionResponse( lines );
					const parsedLinesLength: number = parsedLines.length;

					parsedLines = _.slice( parsedLines, respondingIndex, parsedLines.length );

					respondingIndex = parsedLinesLength;

						for ( let line of parsedLines ) {
							if ( line.error ) {
								this._handleError();
								return;
							}

							!this.textResponding && ( this.textResponding = '' );

							if ( this.textResponding.length === 0 ) {
								!this.isScrollUp && this.scrollToBottom( true );
							};

							const { choices } = line;
							const { delta } = choices[ 0 ];

							if ( delta?.content ) {
								let hasFirstScroll: boolean;

								if ( !hasFirstScroll && tokenIndex % 1 === 0 ) {
									hasFirstScroll = true;
									this._checkAndScrollBottom( true );
								}

								tokenIndex % 10 === 0 && this._checkAndScrollBottom( true );

								text += delta.content;
								++tokenIndex;

								tokenIndex % 2 === 0 && ( this.textResponding = text );
							}
						}

				} else if ( event.type === HttpEventType.Response && this.textResponding && this.textResponding.length > 0) {
					this._checkAndScrollBottom( true );
					this.reloadCount = 0;
					this.isResponding = false;
					this.conversation.push({
						role: 'assistant',
						content: this.textResponding,
					});

					this.textResponding = '';

					this.updateConversation();

					this._chatGptService.controller.abort();
				}

				this._cdr.markForCheck();
			},
			error: () => {
				if ( this._chatGptService.signal.aborted ) {
					console.error( 'Request aborted.' );
				} else {
					this._handleError();
				}
			}
		});

	}

	public updateConversation() {
		if ( localStorage.getItem( 'sessionID' ) && this.selectedSession ) {
			this.selectedSession.messages = this.conversation;

			( this._chatService.updateSession( this.selectedSession ) as Promise<boolean> ).then( ( isDone: boolean ) => {
				if ( !isDone ) {
					this.conversation.pop();

					setTimeout(() => {
						this.sendingObservable();
					}, 200);
				}
			});
		}
	}

	public handleEnterKey(event: Event): void {
		event.preventDefault();
		this.sendMessage( this.userMessage );
	}

	public scrollToBottom( isSmoothSkip: boolean, isLoadFirst?: boolean ): void {
		const msContainer = this._renderer.selectRootElement(
			'#messagesContainer',
			true
		);

		!this.isShowSessionDialog && !this.isQuickToolbarSubmit && this.focusInputTextarea();

		if ( this.isQuickToolbarSubmit ) this.isQuickToolbarSubmit = !this.isQuickToolbarSubmit;

		msContainer.scrollTo(
			isLoadFirst || isSmoothSkip
			? { top: msContainer.scrollHeight }
			: { top: msContainer.scrollHeight, behavior: 'smooth' }
		);

		this.onScroll();

		isLoadFirst ? this.isScrollUp = true : ( this.isShowScrollButton && ( this.isScrollUp = false ) );
	}

	public reload() {
		this.isReloading = true;
		this.isShowResent = false;
		this.isResponding = true;
		this.reloadCount = 0;
		this.conversation.push(this.messageCanResent);
		this.sendingObservable();
	}

	public onFocus() {
		favicon.classList.remove('has-new-message');
	}

	public openSessionDialog() {
		this.profile = JSON.parse( localStorage.getItem( 'profile' )! );
		this.isShowSessionDialog = true;
		if ( !this.profile ) {
			this.isShowGGButtonInSession = true;
			this._cdr.markForCheck();
		}
	}

	public hideSessionDialog() {
		this.isShowSessionDialog = false;
		this.focusInputTextarea();
	}

	public createSessionFromButton() {
		this.profile = JSON.parse( localStorage.getItem( 'profile' )! );

		if ( this.profile ) {
			this.isInputSessionName = true;

		} else {
			this.isInputSessionName = false;
			this.isShowGGButtonInSession = !this.isShowGGButtonInSession;
		}

		this._cdr.markForCheck();
	}

	public cancelNewSessionAction() {
		this.isInputSessionName = false;
		this.tempSessionName = "";

		this._cdr.markForCheck();
	}

	public createNewSession( isQuickCreate: boolean ) {
		this._cdr.markForCheck();
		if ( !this.profile ) return;

		const newSession: ISession = {
			id: '',
			userID: JSON.parse( localStorage.getItem( 'profile' )! ).id,
			name: isQuickCreate ? this._translateService.instant( 'MESSAGE.NEW_CHAT' ) : this.tempSessionName,
			createAt: new Date(),
			messages: !this.selectedSession ? this.conversation : [],
		};
		this.createSessionObs( newSession );
	}

	public createSessionObs( newSession: ISession ) {
		this.isSessionCreating = true;

		this._chatService.createNewSession( newSession ).then( ( _session: ISession ) => {
			this.isSessionCreating = false;
			this.cancelNewSessionAction();

			_session.createAt = newSession.createAt;
			this.selectedSession = _session;
			localStorage.setItem( 'sessionID', _session.id );

			let sessionsClone = _.cloneDeep( this.sessions);

			sessionsClone.unshift( _session );
			this.getSession( _session.id, sessionsClone );
		})
	}

	public cancelResendButton() {
		this._confirmationService.confirm({
			target: event.target || undefined,
			message: this._translateService.instant( 'MESSAGE.CANCEL_ALERT' ),
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: this._translateService.instant( 'LABEL.YES' ),
			rejectLabel: this._translateService.instant( 'LABEL.NO' ),
			acceptButtonStyleClass: 'accept-cancel',
			rejectButtonStyleClass: 'reject-cancel',
			accept: () => {
				this.isShowResent = false;

				this._cdr.markForCheck();
			},
			reject: () => {}
		});
	}

	public cancel() {
		if ( this.conversation[ this.conversation.length - 1 ].role === "user") {
			const index: number = _.findLastIndex( this.conversation, { role: "user" } );
			this.userMessage = this.conversation[ index ].content;
			_.pullAt( this.conversation, index );
		}

		this.cancelSendMessage();
		this._cdr.markForCheck();
	}

	public cancelSendMessage() {
		this.isShowWaitingText = false;
		this.isResponding = false;
		this.textResponding = null;
		this.chatSubscription && this.chatSubscription.unsubscribe();
		this._chatGptService.controller.abort();
		this.focusInputTextarea();
	}

	public resend() {
		this.isQuickToolbarSubmit = true;

		this.conversation = _.dropRight( this.conversation );
		this.sendingObservable()
	}

	public ortherRequest( request: string ) {
		this.isQuickToolbarSubmit = true;

		this.conversation.push({
			role: 'user',
			content: this._translateService.instant( request ),
		});

		this.userMessage = '';
		this.sendingObservable( true );

		setTimeout(() => {
			this.scrollToBottom( false );
		});
	}

	public signInByGoogle() {
		this.isGoogleSubmitting = true;
		// init google
		gapi.load( 'client', () => {} );
		this.auth2 = google.accounts.oauth2.initTokenClient({
			client_id: ENVIRONMENT.GOOGLE_CLIENT_ID,
			scope: CONSTANT.GOOGLE_SCOPE,
			callback: '',
			error_callback: () => {
				this.isGoogleSubmitting = false;
				this._cdr.markForCheck();
			},
		});

		do {
			if ( this.auth2 ) {
				this._authService.signInByGoogle( this.auth2, gapi ).subscribe( ( profile: ISocialProfile ) => {
					this.isInputSessionName = this.isShowGGButtonInSession = this.isGoogleSubmitting = false;
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
		} while ( !this.auth2 );
	}

	public showPrompt() {
		this.clearToast();
		this._authService.showGoogleOneTab( google );
	}

	public copyMessage( message ) {
		this._clipboard.copy( message.content );
	}

	public deleteMessage( message ) {
		this._confirmationService.confirm({
			target: event.target || undefined,
			message: this._translateService.instant('MESSAGE.DELETE_MESAGE_ALERT'),
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: this._translateService.instant('LABEL.YES'),
			rejectLabel: this._translateService.instant('LABEL.NO'),
			acceptButtonStyleClass: 'accept-cancel',
			rejectButtonStyleClass: 'reject-cancel',
			accept: () => {
				const index = _.findIndex( this.conversation, { content: message.content } );
				if ( !index ) {
					this._messageService.add({
						key: 'delete-error',
						severity: 'warn',
						summary: this._translateService.instant('MESSAGE.DELETE_ERROR')
					});
					return;
				}

				_.pullAt( this.conversation, index );
				this.conversation = _.cloneDeep( this.conversation );
				this.updateConversation();

				this._cdr.markForCheck();
			},
			reject: () => {}
		});
	}

	public viewUserDetail() {
		this._featureService.settingSubject.next( true );
	}

	public search( text: string ): void {
		this.tempPresets = [];
		this.tempCustomPresets = [];

		_.forEach( this.presets, ( preset: IUsage ) => {
			if ( _.includes( preset.name, text ) || _.includes( preset.system.content, text ) ) {

				this.tempPresets ? this.tempPresets.push( preset ) : ( this.tempPresets = [ preset ] )

			}

		});

		_.forEach( this.customPresets, ( preset: IUsage ) => {
			if ( _.includes( preset.name, text ) || _.includes( preset.system.content, text ) ) {
				this.tempCustomPresets ? this.tempCustomPresets.push( preset ) : ( this.tempCustomPresets = [ preset ] )
			}
		});

		this._cdr.markForCheck();
	}

	public resize( isMaximize: boolean ) {
		if ( isMaximize ) {
			var stylesheets = document.styleSheets;
			for (var i = 0; i < stylesheets.length; i++) {
				var rules = stylesheets[i].cssRules || stylesheets[i].rules;
				for (var j = 0; j < rules.length; j++) {
				var rule: any = rules[j];
				if ( rule.media && rule.media.mediaText.includes('max-width: 1200px') && rule.media.mediaText.includes('max-height: 600px')) {
					var newMediaText = rule.media.mediaText.replace('max-width: 1200px', 'min-width: 1201px');
					rule.media.mediaText = newMediaText;
				}
				}
			}

			this.isMaximize = true;
		} else {
			var stylesheets = document.styleSheets;
			for (var i = 0; i < stylesheets.length; i++) {
				var rules = stylesheets[i].cssRules || stylesheets[i].rules;
				for (var j = 0; j < rules.length; j++) {
				var rule: any = rules[j];
				if (rule.media && rule.media.mediaText.includes('min-width: 1201px')) {
					var newMediaText = rule.media.mediaText.replace('min-width: 1201px', 'max-width: 1200px');
					rule.media.mediaText = newMediaText;
				}
				}
			}

			this.isMaximize = false;
		}

		this.updateHeightOfChatContainer();
	}

	private _checkAndScrollBottom( isSmoothSkip: boolean ) {
		this.checkScrollHeight();

		!this.isScrollUp && this.isEndOfConversation && this.scrollToBottom( isSmoothSkip );
	}

	private _getParsedStreamedCompletionResponse( lines: string[] ): ICompletion[] {
		return lines
			.map( (line) => line.replace(/^data: /, '').trim() )
			.filter( (line) => line !== '' && line !== '[DONE]' )
			.map( (line) => JSON.parse(line) );
	}

	private _changeKey() {
		let keys: string[] = ENVIRONMENT.OPENAI_KEY;

		const itemIndex = _.indexOf( keys, localStorage.getItem( 'key' ));
		localStorage.setItem( 'key', _.nth( keys, ( itemIndex + 1 ) % keys.length) );
	}


	private _handleError() {

		this._checkAndScrollBottom( true );

		if ( this.reloadCount > 10 ) {
			this.messageCanResent = this.conversation[ this.getIndexOfAssistant(this.conversation) ];
			this.conversation = _.slice( this.conversation, 0, this.getIndexOfAssistant( this.conversation ) );
			this.isShowResent = true;
			this.isShowWaitingText = false;
			this.isResponding = false;

			this.reloadCount = 0;
			localStorage.setItem( 'key', ENVIRONMENT.OPENAI_KEY[ 0 ] );

			this._confirmationService.close();
			this._chatGptService.controller.abort();
		} else {
			!this.isReloading && ( this.isShowWaitingText = true );

			this._changeKey();

			setTimeout(() => {
				this._chatGptService.controller.abort();
				this.reloadCount += 1;
				this.sendingObservable();
			}, 1000);
		}
	}

}
