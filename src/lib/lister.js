"use strict";

class Lister {
    constructor(options) {
        this.model = options.model;
        this.defaultLimit = options.defaultLimit || 10;
    }

    list(options) {
        return Promise.all([
                this.getCount(options),
                this.getItems(options)
            ])
            .then((responses) => {
                const count = responses[0];
                const rows = responses[1];
                return {count, rows};
            });
    }

    getCount(options) {
        const findQuery = options.find || {};
        const queryData = options.query || {};
        const search = queryData.search;

        if (search)
            findQuery['$text'] = { $search: queryData.search };

        return new Promise((resolve, reject) => {
            this.model
                .count(findQuery, (error, count) => {
                    if (error) return reject(error);
                    resolve(count);
                });
        });
    }

    getItems(options) {
        let deepPopulateQuery;

        if (options.deepPopulate) {
            deepPopulateQuery = options.deepPopulate;
            delete options.deepPopulate;
        }

        return new Promise((resolve, reject) => {
            const findQuery = options.find || {};
            const queryData = options.query || {};
            const search = queryData.search;
            const limit = queryData.limit || this.defaultLimit;
            const skip = queryData.skip || 0;
            let cmd;

            if (search)
                findQuery['$text'] = { $search: queryData.search };

            if (search)
                cmd = this.model.find(findQuery, {score : {$meta: 'textScore'}});
            else
                cmd = this.model.find(findQuery);

            if (options.select)
                cmd = cmd.select(options.select);

            if (options.populate)
                cmd = cmd.populate(options.populate);

            if (queryData.sort || search) {
                let sorts = queryData.sort ? this.parseSort(queryData.sort) : {};

                if (search)
                    sorts.score = { $meta : 'textScore' };

                cmd = cmd.sort(sorts);
            }

            cmd
                .skip(skip)
                .limit(limit)
                .exec((error, data) => {
                    if (error) return reject(error);

                    if (!deepPopulateQuery)
                        return resolve(data);

                    this.model.populate(data, deepPopulateQuery, (err, data) => {
                        if (err) return reject(err);
                        resolve(data);
                    })
                });
        });
    }

    parseSort(input) {
        const items = input.split(',');
        let parsed = {};

        items.forEach((item) => {
            const positive = item[0] != '-';

            if (['-', '+'].indexOf(item[0]) > -1)
                item = item.slice(1);

            if (!(/^[a-zA-Z0-9\_]+$/.test(item)))
                return;

            parsed[item] = positive ? 1 : -1;
        });

        return parsed;
    }
}

module.exports = Lister;
