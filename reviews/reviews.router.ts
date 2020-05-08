import {ModelRouter} from '../common/model-router'
import * as restify from 'restify'
import * as mongoose from 'mongoose'
import {NotFoundError} from 'restify-errors'
import {Review} from './reviews.model'

class ReviwesRouter extends ModelRouter<Review> {
  constructor(){
    super(Review)
  }

  envelope(document){
    let resource = super.envelope(document)
    let restId = resource.restaurant._id ? resource.restaurant._id : resource.restaurant
    resource._links.restaurant = `/restaurants/${restId}`
    let userId = resource.user._id ? resource.user._id : resource.user
    resource._links.user = `/users/${userId}`
    return resource
  }

  /*
  findById = (req,resp,next) => {
    this.model.findById(req.params.id)
    .populate('user','name')
    .populate('restaurant','name')
    .then(this.render(resp,next))
    .catch(next)
  }
  */

  protected prepareOne(query: mongoose.DocumentQuery<Review,Review>): mongoose.DocumentQuery<Review,Review>{
    return query
          .populate('user','name')
          .populate('restaurant','name')
  }

  /*
  protected prepareAll(query: mongoose.DocumentQuery<Review[],Review>): mongoose.DocumentQuery<Review[],Review>{
    return query
          .populate('user','name')
          .populate('restaurant','name')
  }
  */

  applyRoutes(application: restify.Server){
    application.get(`${this.basePath}`, this.findAll)
    application.get(`${this.basePath}/:id`, [this.validateId, this.findById])
    application.post(`${this.basePath}`, this.save)
    application.put(`${this.basePath}/:id`, [this.validateId,this.replace])
    application.patch(`${this.basePath}/:id`, [this.validateId,this.update])
    application.del(`${this.basePath}/:id`, [this.validateId,this.delete])
  }

}

export const reviwesRouter = new ReviwesRouter()