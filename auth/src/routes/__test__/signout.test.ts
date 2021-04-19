import request from 'supertest'
import { app } from '../../app'

it('should remove a cookie from an request after signing out', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
          email: 'test@test.com',
          password: 'testtest'
      })
      .expect(201)

    const signInResponse = await request(app)
      .post('/api/users/signin')
      .send({
          email: 'test@test.com',
          password: 'testtest'
      })
      .expect(200)

    expect(signInResponse.get('Set-Cookie')).toBeDefined()

    const response = await request(app)
      .post('/api/users/signout')
      .expect(200)
    
    expect(response.get('Set-Cookie')[0]).toEqual(
        'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
    )
})