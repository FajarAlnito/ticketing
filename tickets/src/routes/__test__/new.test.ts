import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets from post request', async () => {
	const response = await request(app).post('/api/tickets').send({});
	expect(response.status).not.toEqual(404);
});

it('can only accessed if user is signed in', async () => {
	const response = await request(app).post('/api/tickets').send({}).expect(401);
});

it('return status other than 401 if the user is signed in', async () => {
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({});
	expect(response.status).not.toEqual(401);
});

it('return an error if an invalid title is provided', async () => {
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: '',
			price: 10,
		})
		.expect(400);

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			price: 10,
		})
		.expect(400);
});

it('return an error if an invalid prce is provided', async () => {
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: 'ticket',
			price: -10,
		})
		.expect(400);

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: 'ticket',
		})
		.expect(400);
});

it('creates a ticket with valid inputs', async () => {
	//TODO: add in a chect to make sure a ticket was saved
	let tickets = await Ticket.find({});
	expect(tickets.length).toEqual(0);
	const title = 'tickets';
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title,
			price: 10,
		})
		.expect(201);

	tickets = await Ticket.find({});
	expect(tickets.length).toEqual(1);
	expect(tickets[0].price).toEqual(10);
	expect(tickets[0].title).toEqual(title);
});

it('publish an event', async () => {
	const title = 'tickets';
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title,
			price: 10,
		})
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
