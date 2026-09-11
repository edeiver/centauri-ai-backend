const assert = require('node:assert/strict');
const test = require('node:test');
const jwt = require('jsonwebtoken');
const auth = require('../src/middlewares/auth');

const createResponse = () => {
    const res = {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };

    return res;
};

test('auth middleware accepts a valid Bearer token', () => {
    process.env.JWT_SECRET = 'test-secret';
    const token = jwt.sign({ userId: 'user-1', username: 'edeiver' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createResponse();
    let nextCalled = false;

    auth(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.userId, 'user-1');
    assert.equal(req.user.username, 'edeiver');
});

test('auth middleware rejects missing Bearer prefix', () => {
    process.env.JWT_SECRET = 'test-secret';
    const token = jwt.sign({ userId: 'user-1' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: token } };
    const res = createResponse();

    auth(req, res, () => {
        throw new Error('next should not be called');
    });

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: 'Token required' });
});

test('auth middleware rejects invalid tokens', () => {
    process.env.JWT_SECRET = 'test-secret';
    const req = { headers: { authorization: 'Bearer invalid-token' } };
    const res = createResponse();

    auth(req, res, () => {
        throw new Error('next should not be called');
    });

    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, { error: 'Invalid or expired token' });
});
