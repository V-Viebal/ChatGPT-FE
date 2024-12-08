import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CONSTANT } from './resources/constant';

const routes: Routes = [
  { path: '', redirectTo: CONSTANT.MAIN_PATH, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
