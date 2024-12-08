export enum MessageRoles {
	SYSTEM 		= 'system',
	USER 		= 'user',
	ASSISTANT 	= 'assistant',
	ERROR 		= 'error',
}

export interface IMessage {
	content: string;
	role: 'user' | 'assistant' | 'system' | 'error';
}

export interface IUsage {
	id: number;
	temperature: number;
	top_p: number;
	system: IMessage;
	name: string;
}

export interface IChoice {
	message?: IMessage;
	finish_reason: string;
	index: number;
	delta?: IMessage;
}

export interface ICompletion {
	id: string;
	object: string;
	created: number;
	model: string;
	usage: IUsage;
	choices: IChoice[];
	error?: any;
}
