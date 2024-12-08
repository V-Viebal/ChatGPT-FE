import { Injectable } from '@angular/core';
import { IMessage, IUsage } from '../interfaces';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class ChatGptService {
	private apiOpenaiUrl = 'https://api.openai.com/v1/chat/completions';

	private _controller: AbortController;
	get controller(): AbortController { return this._controller; }
	set controller( value: AbortController ) { this._controller = value; }

	private _signal: AbortSignal;
	get signal(): AbortSignal { return this._signal; }
	set signal( value: AbortSignal ) { this._signal = value; }

	constructor( private _httpClient: HttpClient ) {
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	public createCompletions( messages: IMessage[], isLongerModel: boolean, preset: IUsage ): Observable<any> {
		const headers = {
			Authorization: `Bearer ${localStorage.getItem('key')}`,
			'Content-Type': 'application/json',
		};

		const body = preset
		?	{
				model: isLongerModel ? 'gpt-3.5-turbo-0125' : 'gpt-3.5-turbo-0125',
				messages: _.concat(
					{
						role: preset.system.role,
						content: preset.system.content,
					},
					messages ),
				stream: true,
				top_p: preset.top_p,
				temperature: preset.temperature,
			}
		:	{
				model: isLongerModel ? 'gpt-3.5-turbo-0125' : 'gpt-3.5-turbo-0125',
				messages: messages,
				stream: true,
			};

		const options = {
			headers: headers,
			responseType: 'text' as 'json',
			observe: 'events' as 'body',
			reportProgress: true,
			signal: this.signal,
		};

		return this._httpClient.post( this.apiOpenaiUrl, body, options );
	}

	public stopCompletions() {
		this.controller.abort();
	}
}
