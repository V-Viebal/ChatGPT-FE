import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioComponent } from './components/audio.component';

const routes: Routes = [
    { path: "", component: AudioComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AudioRoutingModule {}
