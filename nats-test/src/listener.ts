import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';

import { TicketCreatedListener } from './events/ticket-created-listener';
import { TicketUpdatedListener } from './events/ticket-updated-listener';
const clientID = randomBytes(4).toString('hex');

console.clear();

const stan = nats.connect('ticketing', clientID, {
	url: 'http://localhost:4222',
});

stan.on('connect', () => {
	console.log('Listener connected to NATS');

	stan.on('close', () => {
		console.log('NATS connection closed!');
		process.exit();
	});

	new TicketCreatedListener(stan).listen();
	new TicketUpdatedListener(stan).listen();
});
