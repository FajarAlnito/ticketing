import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async (done) => {
	//create an instance of a ticket
	const ticket = Ticket.build({
		title: 'concert',
		price: 5,
		userId: '123',
	});
	//save the ticket to the database
	await ticket.save();
	//fetch the ticket twice
	const first = await Ticket.findById(ticket.id);
	const second = await Ticket.findById(ticket.id);

	//make two seperates change
	first.set({ price: 10 });
	second.set({ price: 15 });

	//save the first fetched ticket
	await first.save();
	//save the second fetched ticket
	try {
		await second.save();
	} catch (err) {
		return done();
	}
	throw new Error('should not reach this point');
});

it('increment the version number', async () => {
	//create an instance of a ticket
	const ticket = Ticket.build({
		title: 'concert',
		price: 5,
		userId: '123',
	});
	//save the ticket to the database
	await ticket.save();
	expect(ticket.version).toEqual(0);
	await ticket.save();
	expect(ticket.version).toEqual(1);
	await ticket.save();
	expect(ticket.version).toEqual(2);
});
