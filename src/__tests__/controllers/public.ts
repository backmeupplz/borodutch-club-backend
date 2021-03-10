const request = require('supertest')
import app from '@/app'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { runMongo } from '@/models/index'

const mongoServer = new MongoMemoryServer()

beforeEach(async () => {
  runMongo(await mongoServer.getUri())
})

test('public root route test', async () => {
  const response = await request(app.callback()).get('/')
  expect(response.body).toBe('All your club belong to us')
})
