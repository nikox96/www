//database.js

var psql = require('pg');

var connectionString = "postgres://jdwyclejvuhnbn:93900209ba3d62c1cef2d38668ed323499743030aaaea8b99ee9a4d84c013103@ec2-54-247-95-125.eu-west-1.compute.amazonaws.com:5432/d886407on8mun6";

var client = new psql.Client(connectionString);
client.connect();

module.exports = client;
