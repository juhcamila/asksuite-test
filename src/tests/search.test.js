const express = require('express');
const request = require("supertest");
const router = require('../routes/router.js');
require("dotenv").config();

const app = express();
app.use(express.json());
app.use('/', router);

describe("SEARCH / ", () => {
    jest.setTimeout(30000);

    test("It should respond with errors", async () => {
        const response = await request(app).post("/search", {});
        expect(response.body).toHaveProperty('errors')
        expect(response.statusCode).toBe(400);
    });

    test("It should respond with 'The value must be date'", async () => {
        await request(app).post("/search").send({
            "checkin": "aaa",
            "checkout": "2024-08-15"
        })
        .expect(400)
        .then(({body}) => {
            expect(body).toHaveProperty('errors')
            expect(body?.errors[0].msg).toBe('The value must be date')
        });
    });

    test("It should respond with 'The format is invalid. The format must be YYYY-MM-DD.'", async () => {
        await request(app).post("/search").send({
            "checkin": "2024/08/25",
            "checkout": "2024-08-15"
        })
        .expect(400)
        .then(({body}) => {
            expect(body).toHaveProperty('errors')
            expect(body?.errors[0].msg).toBe('The format is invalid. The format must be YYYY-MM-DD.')
        });
    });

    test("It should respond with 'Date must be today or later'", async () => {
        await request(app).post("/search").send({
            "checkin": "2024-07-10",
            "checkout": "2024-07-10"
        })
        .expect(400)
        .then(({body}) => {
            expect(body).toHaveProperty('errors')
            expect(body?.errors[0].msg).toBe('Date must be today or later')
        });
    });

    test("It should respond with 'Date must be on or after check-in date'", async () => {
        const date = new Date()
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        await request(app).post("/search").send({
            "checkin": date.toISOString().split('T')[0],
            "checkout": yesterday.toISOString().split('T')[0]
        })
        .expect(400)
        .then(({body}) => {
            expect(body).toHaveProperty('errors')
            expect(body?.errors[0].msg).toBe('Date must be on or after check-in date')
        });
    });

    test("It should respond with bookings", async () => {
        await request(app).post("/search").send({
            "checkin": "2024-08-15",
            "checkout": "2024-08-18"
        })
        .expect(200)
        .then(({body}) => {
            expect(body[0]).toHaveProperty('name')
            expect(body[0]).toHaveProperty('price')
            expect(body[0]).toHaveProperty('description')
            expect(body[0]).toHaveProperty('image')
        });
    });
});