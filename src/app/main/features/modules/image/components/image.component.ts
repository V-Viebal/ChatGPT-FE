import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'image',
    templateUrl: '../templates/image.pug',
    styleUrls: ['../styles/image.scss'],
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent implements OnInit {
    constructor() { }

    ngOnInit(): void { }
}
