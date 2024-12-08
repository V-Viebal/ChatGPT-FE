import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@main/common/shared/shared.module';
import { AudioRoutingModule } from './audio-routing.module';
import { AudioComponent } from './components/audio.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,

    AudioRoutingModule,

    SharedModule,
  ],
  exports: [AudioComponent],
  declarations: [AudioComponent],
  providers: [],
})
export class AudioModule {}
