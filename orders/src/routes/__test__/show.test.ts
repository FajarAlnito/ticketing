import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/tickets';
import mongoose from 'mongoose';
const ticketId = mongoose.Types.ObjectId().toHexString();

it('fetches the order', async () => {
	const ticket = Ticket.build({
		id: ticketId,
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	const user = global.signin();

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	const { body: fetchedOrder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.send()
		.expect(200);

	expect(fetchedOrder.id).toEqual(order.id);
});

it('return an error the order not has by same user', async () => {
	const ticket = Ticket.build({
		id: ticketId,
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	const user = global.signin();

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	const { body: fetchedOrder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', global.signin())
		.send()
		.expect(401);
});
