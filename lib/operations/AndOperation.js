'use strict';

var _ = require('lodash');
var operations = require('./Operations');
//http://docs.mongodb.org/manual/reference/operator/query/and/
/*jshint -W098 *///options
module.exports = function operation(model, update, options) {
    var results = _.every(update.$and, function (value) {
        var valid = false;
        _.forIn(value, function (item, key) {
            if (operations.isOperation(item)) {
                valid = operations.getOperation(item)(model, value[key], {queryItem: key});
            } else {
                valid = _.isEqual(model[key], item);
            }
        });
        return valid;
    });
    return results;
};
