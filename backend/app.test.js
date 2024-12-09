const userCredentials = {
    fullName: "Test User",
    email: "qwerty@uiop.com",
    password: "qwertyuiop",
};
const uri = process.env.MONGO_URI ;
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./index');

let mongoServer;
// jest.mock('./index', () => {
//     const express = require('express');
//     const app = express();
//     app.use(express.json());
//     return app;
// });

jest.mock('./logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

beforeAll(async () => {
    // Start the in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Disconnect any existing connection
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    // Connect to the in-memory database
    await mongoose.connect(uri);
});

afterAll(async () => {
    // Disconnect from the database and stop the in-memory server
    await mongoose.disconnect();
    await mongoServer.stop();
    
});
// afterAll(async () => {
//     await mongoose.connection.close(); // Close the mongoose connection
// });

afterEach(async () => {
    // Clear all collections after each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
});

describe('API Endpoints', () => {

    let accessToken;

    it('should create a new user', async () => {
        const res = await request(app).post('/create-account').send(userCredentials);
        expect(res.statusCode).toBe(200);
        expect(res.body.error).toBe(false);
        expect(res.body.user).toBeDefined();
        expect(res.body.accessToken).toBeDefined();
        accessToken = res.body.accessToken;
    });

    // it('should login a user successfully', async () => {
    //     const res = await request(app).post('/login').send({
    //         email: userCredentials.email,
    //         password: userCredentials.password,
    //     });
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.error).toBe(false);
    //     expect(res.body.accessToken).toBeDefined();
    // });

    it('should add a new note', async () => {
        const noteData = {
            title: 'Test Note',
            content: 'This is a test note.',
            tags: ['test', 'note'],
        };
        const res = await request(app)
            .post('/add-note')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(noteData);
        expect(res.statusCode).toBe(200);
        expect(res.body.error).toBe(false);
        expect(res.body.note).toBeDefined();
    });

    it('should fetch all notes', async () => {
        const res = await request(app)
            .get('/get-all-notes')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.error).toBe(false);
        expect(res.body.notes).toBeInstanceOf(Array);
    });

    it('should handle invalid token error', async () => {
        const res = await request(app)
            .get('/get-user')
            .set('Authorization', 'Bearer invalidToken');
        expect(res.statusCode).toBe(401);
    });
});
