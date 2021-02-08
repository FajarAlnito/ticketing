import {
	Subjects,
	Publisher,
	ExpirationCompleteEvent,
} from '@grizzlytickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete;
}
