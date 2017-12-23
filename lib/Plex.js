"use strict";

const PlexApi = require("plex-api"),
    RateLimiter = require("limiter").RateLimiter;

class Plex {
    constructor (opts) {
        this.hostname = opts.hostname;
        this.api = new PlexApi(opts);
        this._limiter = new RateLimiter(1, "second");
    }

    query (path) {
        return new Promise((resolve, reject) => {
            this._limiter.removeTokens(1, async () => {
                try {
                    const result = this.api.query(path);

                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    sections (section) {
        return this.query("/library/sections")
    }

    sectionLeaves (section) {
        return this.query(`/library/sections/${section}/allLeaves`);
    }

    markWatched (key) {
        return this.query(`/:/scrobble?identifier=com.plexapp.plugins.library&key=${key}`)
    }
}

module.exports = Plex;
