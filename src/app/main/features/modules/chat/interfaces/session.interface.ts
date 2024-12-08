import { Timestamp } from "firebase/firestore";
import { IMessage } from "./chat-response.interface";

export interface ISession {
	id: string;
	userID: string;
	name: string;
	messages: IMessage[];
	createAt: Date | Timestamp;
}
