import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';
declare global {
	namespace NodeJS {
		interface Global {
			signin(): string[];
		}
	}
}
jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => {
	process.env.JWT_KEY = 'asdasd';

	mongo = new MongoMemoryServer();
	const mongoUri = await mongo.getUri();

	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
});

beforeEach(async () => {
	jest.clearAllMocks();
	const collections = await mongoose.connection.db.collections();
	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	await mongo.stop();
	await mongoose.connection.close();
});

global.signin = () => {
	//build a jwt payload {id, email}
	const id = new mongoose.Types.ObjectId().toHexString();

	const payload = {
		id,
		email: 'test@test.com',
	};
	//create the jwt
	const token = jwt.sign(payload, process.env.JWT_KEY!);

	//build the session object
	const session = { jwt: token };

	//turn that session into JSON
	const sessionJSON = JSON.stringify(session);

	//take json and encode it as base64
	const base64 = Buffer.from(sessionJSON).toString('base64');

	//return a string thats the cookie with a encoded data
	return [`express:sess=${base64}`];
};
