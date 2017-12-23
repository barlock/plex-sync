"use strict";

const url = require("url"),
    Plex = require("./Plex"),
    _ = require("lodash");

function calculateSectionMappings (serverSections) {
    const mappings = serverSections.reduce((map, server) => {
        server.directory.forEach(section => {
            const normalizedTitle = section.title.toLowerCase(),
                key = `${section.type} - ${normalizedTitle}`;
            map[key] = map[key] || [];

            map[key].push(section);
        });

        return map;
    }, {});

    return Object.keys(mappings).map(key => mappings[key]);
}

function mediaSearchMap (mediaContainer) {
    return _(mediaContainer.Metadata)
        .map(item => ({
            matchKey: mediaContainer.viewGroup === "show" ?
                `${item.grandparentTitle} - s${item.parentIndex}e${item.index} - ${item.year} - ${item.title}` :
                `${item.title} (${item.year})`,
            key: item.ratingKey,
            watched: item.viewCount > 1,
        }))
        .keyBy("matchKey")
        .value();
}

function calculateNeedsWatched (serverMedia) {
    const serverMatchKeys = serverMedia
            .map(Object.keys),
        matchedMedia = _.intersection(...serverMatchKeys)
            .reduce((serverUpdates, key) => {
                const allWatched = serverMedia.every(server => server[key].watched),
                    someWatched = serverMedia.some(server => server[key].watched);

                if (!allWatched && someWatched) {
                    serverMedia.forEach((server, index) => {
                        const media = server[key];

                        serverUpdates[index] = serverUpdates[index] || [];

                        if (!media.watched) {
                            serverUpdates[index].push(media);
                        }
                    })
                }

                return serverUpdates;
            }, []);

    // Array of those that aren't matched across servers
    // console.log(_.xor(...serverMatchKeys).sort());

    return matchedMedia;
}

async function markWatched (mediaList, plex) {
    await Promise.all(mediaList.map(media => {
        return plex.markWatched(media.key)
            .then(() => {
                console.log(`Marked watched: (${plex.hostname}) ${media.matchKey}`);
            })
    }));
}

module.exports = async ({ token, serverUris }) => {
    const servers = serverUris.map(uri => {
        const {
            pathname: hostname,
            port, protocol, username, password
        } = url.parse(uri);

        return new Plex({
            hostname, port, username, password, token,
            https: protocol === "https",
        })
    });

    const serverSectionsResults = await Promise
            .all(servers.map(server => server.sections())),
        serverSections = serverSectionsResults
            .map((results, index) => ({
                api: servers[index],
                directory: results.MediaContainer.Directory
            })),
        sectionMappings = calculateSectionMappings(serverSections)
            .filter(mapping => mapping.length > 1);

    console.log("Mapping watched status:");

    await Promise.all(sectionMappings.map(async mappedSection => {
        console.log(mappedSection
            .map((section, index) => `${section.title} (${servers[index].hostname})`)
            .join(" <==> "));

        const leaves = await Promise.all(mappedSection
                .map((section, index) => servers[index].sectionLeaves(section.key))),
            media = leaves
                .map(leaf => mediaSearchMap(leaf.MediaContainer)),
            toMarkWatched = calculateNeedsWatched(media);

        // console.log(toMarkWatched);
        await Promise.all(toMarkWatched.map((serverMedia, index) => {
            return markWatched(serverMedia, servers[index])
        }));
    }));
};
