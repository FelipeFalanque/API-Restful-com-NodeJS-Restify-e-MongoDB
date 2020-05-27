import {ModelRouter} from '../common/model-router'
import * as restify from 'restify'
import {User} from '../users/users.model'
import {NotFoundError, ForbiddenError} from 'restify-errors'
import {authenticate} from '../security/auth.handler'
import {authorize} from '../security/authz.handler'

class UsersRouter extends ModelRouter<User> {

    constructor() {
        super(User)
        this.on('beforeRender', document=>{
            document.password = undefined
            //OR
            //delete document.password
        })
    }

    findByEmail = (req, resp, next)=>{
      if(req.query.email){
          User.findByEmail(req.query.email)
          .then(user => user ? [user] : [])
          .then(this.renderAll(resp, next, { 
                pageSize: this.pageSize,
                url: req.url
              }))
          .catch(next)
      }else{
        next()
      }
    }

    editingYourUser = (req, resp, next)=>{

      const condicaoOne = (<any>req).authenticated.hasAny('user') && !(<any>req).authenticated.hasAny('admin') && (<any>req).authenticated._id == req.params.id
      const condicaoTwo = (<any>req).authenticated.hasAny('admin')

      if(condicaoOne || condicaoTwo){
        next()
      } else {
        next(new ForbiddenError('Permission denied'))
      }
    }

    applyRoutes(application: restify.Server) {


        application.get(`${this.basePath}`, restify.plugins.conditionalHandler([
            { version: '2.0.0', handler: [this.findByEmail, this.findAll] },
            { version: '1.0.0', handler: this.findAll },
          ]));

        //application.get({path:'/users', version: '2.0.0'}, [this.findByEmail, this.findAll])
        //application.get({path:'/users', version: '1.0.0'}, this.findAll)
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById])
        application.post(`${this.basePath}`, [this.save])
        application.put(`${this.basePath}/:id`, [this.validateId, this.editingYourUser, this.replace])
        application.patch(`${this.basePath}/:id`, [this.validateId, this.editingYourUser, this.update])
        application.del(`${this.basePath}/:id`, [this.validateId, this.delete])


        application.post(`${this.basePath}/authenticate`, authenticate)
    }
}

export const usersRouter = new UsersRouter()