import mongoose, { mongo } from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'


const createTicket = () => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signIn())
    .send({
      title: 'fmwop2',
      price: 20
    })
}

it('returns a 404 if the provided id does not exist', async () => {
  const id = mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signIn())
    .send({
      title: 'asljfwi',
      price: 20
    })
    .expect(404)

})

it('returns a 401 if the user is not authenticated', async () => {
  const id = mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'asljfwi',
      price: 20
    })
    .expect(401)
})

it('returns a 401 if the user does not own the ticket', async () => {
  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signIn())
    .send({
      title: 'sfmwopop',
      price: 20
    })

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', global.signIn())
    .send({
      title: 'fmowf',
      price: 30
    })
    .expect(401)

})

it('returns 400 if the title or price is invalid', async () => {
  const usersCookie = global.signIn()

  const usersTicket = await request(app)
    .post('/api/tickets')
    .set('Cookie', usersCookie)
    .send({
      title: 'sfmwopop',
      price: 20
    })

  await request(app)
    .put(`/api/tickets/${usersTicket.body.id}`)
    .set('Cookie', usersCookie)
    .send({
      title: '',
      price: 30
    })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${usersTicket.body.id}`)
    .set('Cookie', usersCookie)
    .send({
      title: 'fmowf',
      price: -30
    })
    .expect(400)
})

it('updates the ticket provided valid inputs', async () => {
  const usersCookie = global.signIn()

  const usersTicket = await request(app)
    .post('/api/tickets')
    .set('Cookie', usersCookie)
    .send({
      title: 'sfmwopop',
      price: 20
    })

  const newTitle = 'prwfijkvow'
  const newPrice = 300

  await request(app)
    .put(`/api/tickets/${usersTicket.body.id}`)
    .set('Cookie', usersCookie)
    .send({
      title: newTitle,
      price: newPrice
    })
    .expect(200)

  const updatedTicket = await request(app)
    .get(`/api/tickets/${usersTicket.body.id}`)
    .send({})
    .expect(200)

  expect(updatedTicket.body.title).toEqual(newTitle)
  expect(updatedTicket.body.price).toEqual(newPrice)
})

it('publishes an event', async () => {
  const usersCookie = global.signIn()

  const usersTicket = await request(app)
    .post('/api/tickets')
    .set('Cookie', usersCookie)
    .send({
      title: 'sfmwopop',
      price: 20
    })

  const newTitle = 'prwfijkvow'
  const newPrice = 300

  await request(app)
    .put(`/api/tickets/${usersTicket.body.id}`)
    .set('Cookie', usersCookie)
    .send({
      title: newTitle,
      price: newPrice
    })
    .expect(200)

  const updatedTicket = await request(app)
    .get(`/api/tickets/${usersTicket.body.id}`)
    .send({})
    .expect(200)

  expect(updatedTicket.body.title).toEqual(newTitle)
  expect(updatedTicket.body.price).toEqual(newPrice)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects updates if the ticket is reserved', async () => {
  const usersCookie = global.signIn()

  const usersTicket = await request(app)
    .post('/api/tickets')
    .set('Cookie', usersCookie)
    .send({
      title: 'sfmwopop',
      price: 20
    })

  const ticket = await Ticket.findById(usersTicket.body.id)
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() })
  await ticket!.save()

  const newTitle = 'prwfijkvow'
  const newPrice = 300

  await request(app)
    .put(`/api/tickets/${usersTicket.body.id}`)
    .set('Cookie', usersCookie)
    .send({
      title: newTitle,
      price: newPrice
    })
    .expect(400)
})