import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { app } from '../app'
import jwt from 'jsonwebtoken'
require('dotenv').config()

declare global {
    namespace NodeJS {
        interface Global {
            signIn(id? : string): string[]
        }
    }
}

jest.mock('../nats-wrapper.ts')
process.env.STRIPE_KEY = process.env.STRIPE_KEY

let mongo: any

beforeAll(async () => {
    process.env.JWT_KEY = 'asdf'
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    
    mongo = new MongoMemoryServer()
    const mongoUri = await mongo.getUri()

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
})

beforeEach(async () => {
    jest.clearAllMocks()
    
    const collections = await mongoose.connection.db.collections()

    for (let collection of collections){
        await collection.deleteMany({})
    }
})

afterAll(async () => {
    await mongo.stop()
})

global.signIn = (id?: string) => {
    const userId = id ? id : new mongoose.Types.ObjectId().toHexString()
    
    const payload = {
        id: userId,
        email: 'test@test.com'
    }

    const token = jwt.sign(payload, process.env.JWT_KEY!)

    const session = {
        jwt: token
    }

    const sessionJSON = JSON.stringify(session)

    const base64 = Buffer.from(sessionJSON).toString('base64')

    return [`express:sess=${base64}`]
}
