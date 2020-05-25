import {Router} from './router'
import * as mongoose from 'mongoose'
import {NotFoundError} from 'restify-errors'

export abstract class ModelRouter<D extends mongoose.Document> extends Router {
    
    basePath: string

    pageSize: number = 2
    
    constructor(protected model: mongoose.Model<D>) {
        super()
        this.basePath = `/${this.model.collection.name}`
    }

    // protected => disponivel somente para herdeiros
    protected prepareOne(query: mongoose.DocumentQuery<D,D>): mongoose.DocumentQuery<D,D>{
        return query
    }

    // protected => disponivel somente para herdeiros
    protected prepareAll(query: mongoose.DocumentQuery<D[],D>): mongoose.DocumentQuery<D[],D>{
        return query
    }

    envelope(document: any): any {
        let resource = Object.assign({_links:{}}, document.toJSON())
        resource._links.self = `${this.basePath}/${resource._id}`
        return resource
    }

    envelopeAll(documents: any[], options: any = {}): any {
        let resource: any = {
            _links:{
                self: `${options.url}`
            },
            items: documents
        }
        if(options.page && options.pageSize && options.count){
            if(options.page > 1){
                resource._links.previous = `${this.basePath}?_page=${options.page-1}`
            }
            let remaining = options.count - (options.pageSize * options.page)
            if(remaining>0){
                resource._links.next = `${this.basePath}?_page=${options.page+1}`
            }
        }
        
        return resource
    }

    validateId = (req,resp,next) => {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            next(new NotFoundError('Document Not Found'))
        }else{
            next()
        }
    }

    findAll = (req,resp,next) => {
        let page = parseInt(req.query._page || 1)
        page = page > 0 ? page : 1

        let skip = (page-1) * this.pageSize

        this.model
        .count({})
        .exec()
        .then(count=>{
            this.prepareAll(this.model.find())
            .skip(skip)
            .limit(this.pageSize)
            .then(this.renderAll(resp,next, {
                page, count, pageSize: this.pageSize, url: req.url
            }))
            .catch(next)
        })
    }

    findById = (req,resp,next) => {
        this.prepareOne(this.model.findById(req.params.id))
        .then(this.render(resp,next))
        .catch(next)
    }

    save = (req,resp,next) => {
        let document = new this.model(req.body)
        document.save()
        .then(this.render(resp,next))
        .catch(next)
    }

    // sobrescreve o obj por completo
    replace = (req,resp,next) => {
        const options = {runValidators:true, overwrite: true}
        this.model.update({_id: req.params.id}, req.body, options)
        .exec()
        .then(result=>{
            if(result.n){
                return this.model.findById(req.params.id)
            }else{
                throw new NotFoundError('Document Not Found')                    
            }
        })
        .then(this.render(resp,next))
        .catch(next)
    }

    update =  (req,resp,next) => {
        const options = {runValidators:true, new: true}
        this.model.findByIdAndUpdate(req.params.id, req.body, options)
        .then(this.render(resp,next))
        .catch(next)
    }

    delete = (req,resp,next) => {
        this.model.findByIdAndRemove(req.params.id)
        .then(userDeleted =>{
            if(userDeleted) {
                resp.send(204)
            }else{
                throw new NotFoundError('Document Not Found')
            }
            return next()
        })
        .catch(next)
    }
}