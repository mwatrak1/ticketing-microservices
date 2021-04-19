import request from 'supertest'
import { app } from '../../app'


it('should return a valid current user object', async () => {
    const cookie = await global.signIn()

    const response = await request(app)
      .get('/api/users/currentuser')
      .set('Cookie', cookie)
      .expect(200)

    expect(response.body).toBeInstanceOf(Object)
    expect(response.body).toHaveProperty('currentUser')
    expect(response.body.currentUser).toBeInstanceOf(Object)
    expect(response.body.currentUser).toHaveProperty('email')
    expect(response.body.currentUser).toHaveProperty('id')
    expect(response.body.currentUser).toHaveProperty('iat')
    expect(response.body.currentUser.email).toEqual('test@test.com')

})

it('should return a current user object equal to null', async () => {

    const response = await request(app)
      .get('/api/users/currentuser')
      .expect(200)

    expect(response.body).toBeInstanceOf(Object)
    expect(response.body).toHaveProperty('currentUser')
    expect(response.body.currentUser).toEqual(null)
})