import request from 'supertest'
import { app } from '../../app'

beforeEach(async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
          email: 'test@test.com',
          password: 'testtest'
      })
      .expect(201)
})


it('returns 200 and valid user object given valid credentials', async () => {
    const response = await request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'testtest'
      })
      .expect(200)

    expect(response.body).toBeInstanceOf(Object)
    expect(response.body).toHaveProperty('email')
    expect(response.body).toHaveProperty('id')
    expect(response.get('Set-Cookie')).toBeDefined()
})

it('returns 400 and user object with a list of errors given empty form', async () => {
    const response = await request(app)
      .post('/api/users/signin')
      .send({})
      .expect(400)

    expect(response.body).toBeInstanceOf(Object)
    expect(response.body).toHaveProperty('errors')
    expect(response.body.errors).toBeInstanceOf(Array)
})

it('returns 400 and and user object with a list of errors given invalid password or invalid email', async () => {
    await request(app)
      .post('/api/users/signin')
      .send({
        email: 'bademail@test.com',
        password: 'testtest'
      })
      .expect(400)

    await request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'badpassword'
      })
      .expect(400)
})
