# sync-plex

A simple command-line utility to synchronize watched / seen status between different [Plex Media Servers](https://plex.tv). Inspired by [plex-sync](https://github.com/jacobwgillespie/plex-sync).


## Features

* Syncs watch status between different Plex servers.

## Requirements

* NodeJS 8+

## Installation

`sync-plex` is installed via NPM:

```shell
$ npm install -g sync-plex
```

## Usage
Syncs the watched status of like-named libraries across multiple Plex servers. For example `TV shows` and `TV Shows` would match. Shows and movies are matched via title and year, it's helpful to make sure the agent settings across all servers are in sync for this to work well. 


Next, use the CLI as follows:

```shell
$ sync-plex [https://][username:password@]IP[:PORT] [https://][username:password@]IP[:PORT]
            [[https://][username:password@]IP[:PORT]...]
```

### Options
- **--token, -t**: plex.tv [authentication token](https://support.plex.tv/hc/en-us/articles/204059436-Finding-an-authentication-token-X-Plex-Token) (optional). 

### Examples

Sync watched status between two servers, using the default port (`32400`).

```shell
$ sync-plex 10.0.1.5 10.0.1.10
```

Sync three servers, with different ports:

```shell
$ sync-plex 10.0.1.5:32401 10.0.1.5:32402 10.0.1.10
```

Sync with a server via HTTPS:

```shell
$ sync-plex 10.0.1.2 https://server-domain
```

## Contributing

Contributions are welcome.  Open a pull request or issue to contribute.

## License

MIT
