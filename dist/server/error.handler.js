"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = (req, resp, err, done) => {
    err.toJSON = () => {
        return {
            message: err.message
        };
    };
    switch (err.name) {
        case 'MongoError':
            if (err.code === 11000) {
                err.statusCode = 400;
            }
            break;
        case 'ValidationError':
            err.statusCode = 400;
            const message = [];
            for (let name in err.errors) {
                message.push({ message: err.errors[name].message });
            }
            err.toJSON = () => {
                return {
                    message: 'Error in validation',
                    errors: message
                };
            };
            break;
    }
    done();
};
//# sourceMappingURL=error.handler.js.map