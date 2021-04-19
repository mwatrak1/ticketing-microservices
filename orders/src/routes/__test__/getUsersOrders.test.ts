import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import mongoose from 'mongoose'

it('returns 401 if user is not authenticated', async () => {
    await request(app)
     .get('/api/orders')
     .send({})
     .expect(401)
})

it('returns empty list if user has no orders', async () => {
    const response = await request(app)
      .get('/api/orders')
      .set('Cookie', global.signIn())
      .send({})
      .expect(200)
    
      expect(response.body).toEqual([])
})

it('returns a list with orders only belonging to particular user', async () => {
    const cookie = global.signIn()

    const anotherUser = global.signIn()

    // Some random user also creates an order for a ticket

    const anotherUsersTicket = await Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'ticket',
        price: 300
    }).save()

    await request(app)
      .post('/api/orders')
      .set('Cookie', anotherUser)
      .send({
          ticketId: anotherUsersTicket.id
      })
      .expect(201)

    // Our test users requests

    const ticket1 = await Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'ticket1',
        price: 20
    }).save()

    const ticket2 = await Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'ticket2',
        price: 40
    }).save()

    const ticket3 = await Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'ticket3',
        price: 20
    }).save()

    await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({
          ticketId: ticket1.id
      })
      .expect(201)

    await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({
          ticketId: ticket2.id
      })
      .expect(201)

    await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({
          ticketId: ticket3.id
      })
      .expect(201)

    const response = await request(app)
      .get('/api/orders')
      .set('Cookie', cookie)
      .send({})
      .expect(200)

    expect(response.body.length).toEqual(3)
    expect(response.body[0]).toHaveProperty('ticket')
    expect(response.body[0].ticket).toHaveProperty('title')
})

