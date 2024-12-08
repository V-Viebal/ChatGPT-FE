import {
	Component, OnInit, OnChanges,
	Input, ViewChild, ElementRef,
	Output, EventEmitter, SimpleChanges,
	ChangeDetectionStrategy, ChangeDetectorRef
} from "@angular/core";
import { CONSTANT } from "../../resources/constant";
import { Media } from "../../interfaces/media.interface";


@Component({
	selector: "app-picture-upload",
	templateUrl: "./picture-upload.component.pug",
	styleUrls: ["./picture-upload.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PictureUploadComponent implements OnInit, OnChanges {
	@Input() avatar!: boolean;
	@Input() imgSrc!: string;
	@Input() imgSrcArray!: Media[];

	@Output() outputImg = new EventEmitter<File | string>();
	@Output() outputImgArray = new EventEmitter<File[]>();
	@Output() outputOldImgArray = new EventEmitter<Media[]>();

	isImageLoading: boolean = false;
	file: any = {};
	avatarDefaultUrl!: string;
	imgSrcPreviewUrl: any = {};
	@ViewChild("fileInput") fileInput!: ElementRef;

	constructor( private _cdr: ChangeDetectorRef ) {
		this.handleImageChange = this.handleImageChange.bind(this);
	}

	ngOnInit() {
		this.file = null;
		this.avatarDefaultUrl = localStorage.getItem( 'theme' ) === 'dark' ? CONSTANT.BACKGROUND_DEFAULT_DARK : CONSTANT.BACKGROUND_DEFAULT_LIGHT;
	}

	ngOnChanges(changes: SimpleChanges): void {
		if ( changes['imgSrc'] ) this.imgSrcPreviewUrl = changes['imgSrc'].currentValue;
	}

	handleClick() {
		this.isImageLoading = true;
		this.fileInput.nativeElement.click();

		this._cdr.markForCheck();
	}

	handleRemove() {
		this.file = null;
		this.isImageLoading = false;
		this.imgSrcPreviewUrl = this.avatarDefaultUrl = localStorage.getItem( 'theme' ) === 'dark' ? CONSTANT.BACKGROUND_DEFAULT_DARK : CONSTANT.BACKGROUND_DEFAULT_LIGHT;
		this.fileInput.nativeElement.value = null;
		this.outputImg.emit(this.imgSrcPreviewUrl);
	}

	handleImageChange( event: any ) {
		if (event.target.files && event.target.files.length > 0) {
			if(this.avatar) {
				event.preventDefault();
				let reader = new FileReader();
				let file = event.target.files[0];
				reader.onloadend = () => {
					this.file = file;
					this.imgSrcPreviewUrl = reader.result;
				};

				this.outputImg.emit( file );
				reader.readAsDataURL( file );
			} else {
				this.outputImgArray.emit( event.currentFiles );

			}
		}

		this.isImageLoading = false;

		this._cdr.markForCheck();
	}

	remove( file: any ) {
		this.imgSrcArray = this.imgSrcArray.filter((obj) => {
			return file.id !== obj.id;
		});
		this.outputOldImgArray.emit(this.imgSrcArray);
	}
}
