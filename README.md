# Website 4: NodeJS Session Users

A website primer for Node Express sessions using [Redis](https://redis.io/) for in-memory storage and [Postgres](https://www.postgresql.org/) for disk storage. This site is built upon [Website 2: NodeJS Marko Templates](https://github.com/jpfluger/website-2-nodejs-marko-templates) which uses Marko (v4+), Twitter Bootstrap (v3.3), Bootstrap-Dialog, JQuery, lodash, numeral, moment, and [zazzy-browser](https://github.com/jpfluger/zazzy-browser).

This website template includes support for (simple) page-tracking and user session management.

It also uses a [docker-compose](https://docs.docker.com/compose/) to assist in the creation and deletion of Redis/Postgres. 

## Install `docker-compose`

Follow the directions to install [docker](https://docs.docker.com/engine/installation/) and [docker-compose](https://docs.docker.com/compose/)

> Note: We purposefully retain comments in the source to assist users.

## Redis and Postgres

Run Redis and Postgres in the background.

```bash
$ docker-compose -p web4 -f docker-dev.yml up -d
```

Destroy Redis and Postgres. This will stop the containers if they are already running.

```bash
$ docker-compose -p web4 -f docker-dev.yml down
```

Stop Redis and Postgres but do not destroy them.

```bash
$ docker-compose -p web4 -f docker-dev.yml stop
```

## Install `node`

Download [NodeJS](https://nodejs.org/en/) and install the version for your operating system. 

## Install `npm` and `bower` modules

We include a script, `install.sh` that initializes:

* local npm modules in directory `node_modules`
* local bower modules in directory `bower_components`

Then it copies only the required files from `bower_components/` into `public/_third/`, a directory we use to serve public web pages.

Run installation:

```bash
./install.sh
```

## Run

We've switched to using npm, so we can easily set modes for `production` or `development`.

For production mode, run

```bash
$ npm run start
```

For development (debug) mode, run

```bash
$ npm run debug
```

> Note: Type Ctrl-C to quit the server.

Open the client web browser to url [http://localhost:8080](http://localhost:8080).

## [MIT Licensed](LICENSE)
