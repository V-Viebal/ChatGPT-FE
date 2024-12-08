import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'audio',
    templateUrl: '../templates/audio.pug',
    styleUrls: ['../styles/audio.scss'],
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class AudioComponent implements OnInit {
    constructor() { }

    ngOnInit(): void { }
}
