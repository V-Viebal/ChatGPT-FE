import { IUsage } from "./chat-response.interface";

export interface IPresets {
	order: number[];
	userID: string;
	customUsages?: IUsage[];
	selectedIndex: number[];
}
