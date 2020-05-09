import 'jest'
import * as request from 'supertest'

let address: string = (<any>global).address

//test.only => realiza somente esse teste
//test.skip => pula essa teste e execulta os outros

test('get /users',()=>{
    return request(address)
    .get('/users')
    .then(response=>{
        expect(response.status).toBe(200)
        expect(response.body.items).toBeInstanceOf(Array)
    })
    .catch(fail)
})

test('post /users', ()=>{
    return request(address)
        .post('/users')
        .send({
            name: 'usuario3',
            email: 'usuario3@email.com',
            password: '123456',
            cpf: '182.257.210-04',
            gender: 'Male'
        })
        .then(response=>{
            expect(response.status).toBe(200)
            expect(response.body._id).toBeDefined()
            expect(response.body.name).toBe('usuario3')
            expect(response.body.email).toBe('usuario3@email.com')
            expect(response.body.cpf).toBe('182.257.210-04')
            expect(response.body.password).toBeUndefined()
        }).catch(fail)
})

test('get /users/aaaaa',()=>{
    return request(address)
    .get('/users/aaaaa')
    .then(response=>{
        expect(response.status).toBe(404)
    })
    .catch(fail)
})

test('patch /users/:id', ()=>{
    return request(address)
       .post('/users')
       .send({
         name: 'usuario2',
         email: 'usuario2@email.com',
         password: '123456',
         cpf: '182.257.210-04',
         gender: 'Male'
       })
       .then(response => request(address)
                        .patch(`/users/${response.body._id}`)
                        .send({
                          name: 'usuario2 - patch'
                        }))
       .then(response=>{
         expect(response.status).toBe(200)
         expect(response.body._id).toBeDefined()
         expect(response.body.name).toBe('usuario2 - patch')
         expect(response.body.email).toBe('usuario2@email.com')
         expect(response.body.password).toBeUndefined()
       })
       .catch(fail)
  })