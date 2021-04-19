import request from 'supertest'
import { app } from '../../app'

const createTicket = () => {
    return request(app)
      .post('/api/tickets')
      .set('Cookie', global.signIn())
      .send({
          title: 'fmwop2',
          price: 20
      })
}

it('returns a list of tickets', async () => {
    await createTicket()
    await createTicket()
    await createTicket()

    const response = await request(app)
      .get('/api/tickets')
      .send({})
      .expect(200)

    expect(response.body.length).toEqual(3)

})

it('returns an empty list of tickets', async () => {
    const response = await request(app)
      .get('/api/tickets')
      .send({})
      .expect(200)

    expect(response.body.length).toEqual(0)
})

it.todo('only returns tickets that are not reserved (orderId is undefined)')