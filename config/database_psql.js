//database.js

var psql = require('pg');

var connectionString = "postgres://psqladmin:portaleinnovazioni@localhost:5432/portale";

var client = new psql.Client(connectionString);
client.connect();

module.exports = client;
