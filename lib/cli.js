"use strict";

const sync = require("./sync");

const argv = require("yargs")
    .usage("sync-plex 10.0.1.5 10.0.1.10\n" +
        "          [https://][username:password@]IP[:PORT] ....\n\n" +
        "Syncs the watched status of like-named libraries across multiple " +
        "Plex servers. For example `TV shows` and `TV Shows` would match. " +
        "Shows and movies are matched via title and year, it's helpful to " +
        "make sure the agent settings across all servers are in sync for " +
        "this to work well."
    )
    .options({
        token: {
            alias: "t",
            description: "plex.tv authentication token (optional)"
        }
    })
    .help()
    .argv;

module.exports = () => {
    sync({
        serverUris: argv._,
        token: argv.token
    })
    .catch(console.error);
};
