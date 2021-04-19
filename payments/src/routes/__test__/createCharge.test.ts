import request from 'supertest'
import { app } from '../../app'
import { Order } from '../../models/order'
import mongoose from 'mongoose'
import { OrderStatus } from '@ticketing.org/common'
import { stripe } from '../../stripe'
import { Payment } from '../../models/payment'


it('throws 404 if the request order does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signIn())
    .send({
      token: 'fkofwkwf0',
      orderId: mongoose.Types.ObjectId().toHexString()
    })
    .expect(404)
})

it('throws 401 if user tries to pay for someone elses ticket', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signIn())
    .send({
      token: 'fkofwkwf0',
      orderId: order.id
    })
    .expect(401) 
})

it('returns 400 when purchasing a cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    price: 20,
    version: 0,
    status: OrderStatus.CancelledByPayment
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signIn(userId))
    .send({
      token: 'fnmofw09',
      orderId: order.id
    })
    .expect(400)
})

it('returns a 201 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const price = Math.floor(Math.random() * 100000)

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    price,
    version: 0,
    status: OrderStatus.Created
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signIn(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201)

  const charges = await stripe.charges.list({ limit: 50 })
  const charge = charges.data.find(el => {
    return el.amount === price * 100
  })

  expect(charge).toBeDefined()
  expect(charge?.currency).toEqual('usd')
})

it('returns a 400 given invalid token', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const price = Math.floor(Math.random() * 100000)

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    price,
    version: 0,
    status: OrderStatus.Created
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signIn(userId))
    .send({
      token: 'trwm220mom',
      orderId: order.id
    })
    .expect(400)
    
  expect(app).toThrowError()

})

it('saves the succesfull payment to the db', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const price = Math.floor(Math.random() * 100000)

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    price,
    version: 0,
    status: OrderStatus.Created
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signIn(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201)

  const payment = await Payment.findOne({
    orderId: order.id
  })

  expect(payment).not.toBeNull()
  expect(payment?.orderId).toEqual(order.id)
})