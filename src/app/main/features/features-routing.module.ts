import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CONSTANT } from './resources';
import { CONSTANT as MAIN_CONSTANT } from '../../resources/constant';
import { FeaturesComponent } from './components/features.component';

export const routes: Routes = [
  {
    path: MAIN_CONSTANT.MAIN_PATH,
    component: FeaturesComponent,
    children: [
      { path: '',
        redirectTo: CONSTANT.PATH.CHAT,
        pathMatch: 'full'
      },
      {
        path: CONSTANT.PATH.CHAT,
        loadChildren: () =>
          import('./modules/chat/chat.module').then((m) => m.ChatModule)
      },
      {
        path: CONSTANT.PATH.IMAGE,
        loadChildren: () =>
          import('./modules/image/image.module').then((m) => m.ImageModule)
      },
      {
        path: CONSTANT.PATH.AUDIO,
        loadChildren: () =>
          import('./modules/audio/audio.module').then((m) => m.AudioModule)
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturesRoutingModule {}
