import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@main/common/shared/shared.module';
import { ImageComponent } from './components/image.component';
import { ImageRoutingModule } from './image-routing.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,

    ImageRoutingModule,

    SharedModule,
  ],
  exports: [ImageComponent],
  declarations: [ImageComponent],
  providers: [],
})
export class ImageModule {}
