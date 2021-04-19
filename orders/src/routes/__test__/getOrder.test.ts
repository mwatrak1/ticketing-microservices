import request from 'supertest'
import { app } from '../../app'
import { Order} from '../../models/order'
import { Ticket } from '../../models/ticket'
import mongoose from 'mongoose'


it('returns 404 if the order does not exist', async () => {
    const validId = mongoose.Types.ObjectId()

    await request(app)
      .get(`/api/orders/${validId}`)
      .set('Cookie', global.signIn())
      .send({})
      .expect(404)

})

it('returns 200 if the order exists and belongs to logged user', async () => {
    const cookie = global.signIn()
    
    const ticket = await Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'ticket',
        price: 20
    }).save()

    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ ticketId: ticket.id})
      .expect(201)

    const { body: fetchedOrder } =  await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', cookie)
      .send({})
      .expect(200)

    expect(order.id).toEqual(fetchedOrder.id)
 
})

it('returns 401 if the order exists but belongs to other user', async () => {
    const cookie = global.signIn()
    
    const ticket = await Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'ticket',
        price: 20
    }).save()
    
    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', global.signIn())
      .send({ ticketId: ticket.id})
      .expect(201)

    await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', cookie)
      .send({})
      .expect(401)

})