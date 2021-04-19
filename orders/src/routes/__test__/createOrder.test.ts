import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'

it('returns 401 if request is not authenticated', async () => {
    await request(app)
      .post('/api/orders')
      .send({
          ticketId: 'poencwu32bk1'
      })
      .expect(401)
})

it('returns 404 if the ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId()
    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signIn())
      .send({
          ticketId: ticketId
      })
      .expect(404)
})

it('returns 400 if the ticketId is not valid', async () => {
    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signIn())
      .send({
          ticketId: 'asf'
      })
      .expect(400)
})

it('returns 201 if the order is succesfully created', async () => {
    const ticket = await Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'ticket',
        price: 20
    }).save()

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signIn())
      .send({
          ticketId: ticket.id
      })
      .expect(201)
})

it('returns 400 if the ticket is already reserved', async () => {
    const ticket = await Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'ticket',
        price: 20
    }).save()

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signIn())
      .send({
          ticketId: ticket.id
      })
      .expect(201)

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signIn())
      .send({
          ticketId: ticket.id
      })
      .expect(400)
})

it('emits an order created event', async () => {
    const ticket = await Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'ticket',
        price: 20
    }).save()

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signIn())
      .send({
          ticketId: ticket.id
      })
      .expect(201)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})