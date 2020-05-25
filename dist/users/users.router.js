"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("../common/model-router");
const restify = require("restify");
const users_model_1 = require("../users/users.model");
const restify_errors_1 = require("restify-errors");
const auth_handler_1 = require("../security/auth.handler");
const authz_handler_1 = require("../security/authz.handler");
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
        this.editingYourUser = (req, resp, next) => {
            const condicaoOne = req.authenticated.hasAny('user') && !req.authenticated.hasAny('admin') && req.authenticated._id == req.params.id;
            const condicaoTwo = req.authenticated.hasAny('admin');
            if (condicaoOne || condicaoTwo) {
                next();
            }
            else {
                next(new restify_errors_1.ForbiddenError('Permission denied'));
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
            { version: '2.0.0', handler: [authz_handler_1.authorize('admin'), this.findByEmail, this.findAll] },
            { version: '1.0.0', handler: this.findAll },
        ]));
        //application.get({path:'/users', version: '2.0.0'}, [this.findByEmail, this.findAll])
        //application.get({path:'/users', version: '1.0.0'}, this.findAll)
        application.get(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.validateId, this.findById]);
        application.post(`${this.basePath}`, [authz_handler_1.authorize('admin'), this.save]);
        application.put(`${this.basePath}/:id`, [authz_handler_1.authorize('admin', 'user'), this.validateId, this.editingYourUser, this.replace]);
        application.patch(`${this.basePath}/:id`, [authz_handler_1.authorize('admin', 'user'), this.validateId, this.editingYourUser, this.update]);
        application.del(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.validateId, this.delete]);
        application.post(`${this.basePath}/authenticate`, auth_handler_1.authenticate);
    }
}
exports.usersRouter = new UsersRouter();
//# sourceMappingURL=users.router.js.map