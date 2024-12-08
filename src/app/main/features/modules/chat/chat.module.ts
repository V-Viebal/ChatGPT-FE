import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '@main/common/shared/shared.module';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './components/chat.component';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TimelineModule } from 'primeng/timeline';
import { DialogModule } from 'primeng/dialog';
import { AutoFocusModule } from 'primeng/autofocus';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { TabViewModule } from 'primeng/tabview';
import { OrderListModule } from 'primeng/orderlist';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';

import { ChatService } from './services/chat.service';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		TranslateModule,
		ReactiveFormsModule,

		ChatRoutingModule,

		SharedModule,

		MarkdownModule.forRoot(),

		ButtonModule,
		TooltipModule,
		TimelineModule,
		DialogModule,
		AutoFocusModule,
		ConfirmPopupModule,
		ToastModule,
		SkeletonModule,
		TabViewModule,
		OrderListModule,
		InputTextModule,
		InputTextareaModule,
		DropdownModule,

		DragDropModule,
	],
	exports: [ChatComponent],
	declarations: [ChatComponent],
	providers: [ChatService],
})
export class ChatModule {}
