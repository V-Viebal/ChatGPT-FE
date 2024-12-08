import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemService } from './services/system.service';
import { PictureUploadComponent } from './components/picture-upload/picture-upload.component';

import { TranslateModule } from '@ngx-translate/core';

import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';

import { DetectScrollDirective } from './directives/detect-scroll.directive';
import { CloudMessagingService } from './services';

@NgModule({
	imports: [
		CommonModule,
		TranslateModule,

		ButtonModule,
		FileUploadModule,
	],
	exports: [ PictureUploadComponent, DetectScrollDirective ],
	declarations: [ PictureUploadComponent, DetectScrollDirective ],
	providers: [ SystemService, CloudMessagingService ],
})
export class SharedModule {}
