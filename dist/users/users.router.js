"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("../common/model-router");
const restify = require("restify");
const users_model_1 = require("../users/users.model");
class UsersRouter extends model_router_1.ModelRouter {
    constructor() {
        super(users_model_1.User);
        this.findByEmail = (req, resp, next) => {
            if (req.query.email) {
                users_model_1.User.findByEmail(req.query.email)
                    .then(user => user ? [user] : [])
                    .then(this.renderAll(resp, next, {
                    pageSize: this.pageSize,
                    url: req.url
                }))
                    .catch(next);
            }
            else {
                next();
            }
        };
        this.on('beforeRender', document => {
            document.password = undefined;
            //OR
            //delete document.password
        });
    }
    applyRoutes(application) {
        application.get(`${this.basePath}`, restify.plugins.conditionalHandler([
            { version: '2.0.0', handler: [this.findByEmail, this.findAll] },
            { version: '1.0.0', handler: this.findAll },
        ]));
        //application.get({path:'/users', version: '2.0.0'}, [this.findByEmail, this.findAll])
        //application.get({path:'/users', version: '1.0.0'}, this.findAll)
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById]);
        application.post(`${this.basePath}`, this.save);
        application.put(`${this.basePath}/:id`, [this.validateId, this.replace]);
        application.patch(`${this.basePath}/:id`, [this.validateId, this.update]);
        application.del(`${this.basePath}/:id`, [this.validateId, this.delete]);
    }
}
exports.usersRouter = new UsersRouter();
//# sourceMappingURL=users.router.js.map