import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';
import { FeaturesComponent } from './components/features.component';
import { FeaturesRoutingModule } from './features-routing.module';
import { AudioModule } from './modules/audio/audio.module';
import { ChatModule } from './modules/chat/chat.module';
import { ImageModule } from './modules/image/image.module';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpeedDialModule } from 'primeng/speeddial';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CardModule } from 'primeng/card';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DockModule } from 'primeng/dock';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { MessageService } from 'primeng/api';
import { SharedModule } from '../common/shared/shared.module';
import { ChatGptService } from './modules/chat/services/chat-gpt.service';
@NgModule({
	imports: [
		CommonModule,
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		TranslateModule,

		AudioModule,
		ChatModule,
		ImageModule,
		SharedModule,

		FeaturesRoutingModule,

		SpeedDialModule,
		TooltipModule,
		DialogModule,
		ButtonModule,
		InputSwitchModule,
		CardModule,
		SelectButtonModule,
		DockModule,
		AvatarModule,
		ToastModule,

		DragDropModule,
	],
	exports: [FeaturesComponent],
	declarations: [FeaturesComponent],
	providers: [ MessageService, ChatGptService ],
})
export class FeaturesModule {}
