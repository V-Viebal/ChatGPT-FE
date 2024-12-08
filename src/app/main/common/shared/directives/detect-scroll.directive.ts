import { Directive, ElementRef, NgZone, OnInit, ChangeDetectorRef } from '@angular/core';

@Directive({
  selector: '[detectScroll]',
})
export class DetectScrollDirective implements OnInit {
  constructor( private elementRef: ElementRef, private ngZone: NgZone, private _cdr: ChangeDetectorRef ) {}

  ngOnInit() {
	this.ngZone.runOutsideAngular(() => {
	  this.elementRef.nativeElement.addEventListener(
		'scroll',
		this.onScroll.bind(this)
	  );
	});
  }

  onScroll() {
	this.ngZone.run(() => {
	  this._cdr.detectChanges();
	});
  }
}
