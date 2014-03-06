'use strict';

var _ = require('lodash');

module.exports = function setOperation(model, update, options) {
    _.forIn(update, function (value, key) {
        if (!updatePositionalValue(model, options.conditions, key, value)) {
            model[key] = value;
        }
    });
};

/**
 * Implementation of Positional values $
 * @see http://docs.mongodb.org/manual/reference/operator/update/positional/
 */
function updatePositionalValue(model, condition, key, value) {
    if (key.indexOf('.$') !== -1) {
        var arrayKeys = stripKeys(key.split('$'));
        var positionalArray = model[arrayKeys[0]];
        if (!_.isUndefined(condition) && _.isArray(positionalArray)) {
            var conditionKey = arrayKeys[0];
            _.forIn(condition, function (value, key) {
                if (key.indexOf(arrayKeys[0]) > -1) {
                    conditionKey = key;
                    return false;
                }
            });
            var originalValue = condition[conditionKey];
            var childPropertyArray = conditionKey.split('.');
            var childProperty = childPropertyArray[childPropertyArray.length-1];
            var length = positionalArray.length;
            for (var i = 0; i < length; i++) {
                var child = positionalArray[i];
                var childValue = child;
                if(_.isObject(child)){
                    childValue = child[childProperty];
                }
                if (_.isEqual(originalValue, childValue)) {
                    if(_.isObject(child)){
                        child[arrayKeys[arrayKeys.length-1]] = value;
                    }else{
                        positionalArray.splice(i, 1, value);
                    }
                    return true;
                }
            }
        }
    }
    return false;
}

function stripKeys(keys) {
    var strippedKeys = [];
    _.forEach(keys, function (key) {
        strippedKeys.push(key.replace('.', ''));
    });
    return strippedKeys;
}