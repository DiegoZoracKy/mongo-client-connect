'use strict';

//////////////////
// DEPENDENCIES //
//////////////////
const MongoClient = require('mongodb').MongoClient;


//////////
// MAIN //
//////////

/**
 * dbConnections :: Object that will store all unique connections per connection string
 * @type {Object}
 */
const dbConnections = {};
/**
 * dbCollections :: Object that will store all unique collections' instances required per connection string
 * @type {Object}
 */
const dbCollections = {};

/**
 * dbConnectMany :: Connects many connectionURIs at once
 * @param  {String[]]} connectionURIs - array of connectionURIs
 * @return {Promise[{Object}]} - returns a Promise that will be filled with mongo connections objects
 */
function dbConnectMany(connectionURIs){
	return Promise.all(connectionURIs.map(dbConnect));
}

/**
 * dbConnect :: Connects a connectionURI
 * @param  {String} connectionURI - just a connectionURI
 * @return {Promise.<Object>} - A Promise that will be resolved to a mongodb connection
 */
function dbConnect(connectionURI){
	if (!dbConnections[connectionURI]){
		dbConnections[connectionURI] = MongoClient.connect(connectionURI);
	}

	return Promise.resolve(dbConnections[connectionURI]);
}

/**
 * dbConnectManyAndGetCollections :: Connects to many connectionURIs and retrieves the collections' instances which has been asked for
 * @param  {Object} connectionURIsAndCollections - An object defining many connectionURIs as keys, and a list of collections' definitions for each of them e.g {mongurl1: ['dbCollectionName1', 'dbCollectionName2'], mongurl2: ['dbCollectionName1', 'dbCollectionName2']} OR {mongurl1: {collectionAlias: 'dbCollectionName1', collectionAlias2: 'dbCollectionName2'}}
 * @return {Promise[{Object}]} - returns a Promise that will be filled with the mongo collections, per connection
 */
function dbConnectManyAndGetCollections(connectionURIsAndCollections) {
	return Promise.all(Object.keys(connectionURIsAndCollections).map(connectionURI => getCollections(connectionURI, connectionURIsAndCollections[connectionURI])));
}

/**
 * getCollections :: Connects to a connectionURI and retrieves the collections' instances which has been asked for
 * @param  {String} connectionURI - just a connectionURI
 * @param  {Array|Object} collections - list of collections' name or collections' definitions (alias: doCollection) e.g. ['dbCollectionName1', 'dbCollectionName2'] OR {collectionAlias: 'dbCollectionName1', collectionAlias2: 'dbCollectionName2'}
 * @return {Promise[{Object}]} - returns a Promise that will be filled with the mongo collections, for the connectionURI specified
 */
function getCollections(connectionURI, collections) {
	if (collections.constructor === Object)
		return getCollectionsByObject(connectionURI, collections);
	else if (collections.constructor === Array)
		return getCollectionsByArray(connectionURI, collections);
}

/**
 * getCollectionsByObject :: Connects to a connectionURI and retrieves the collections' instances which has been asked for
 * @param  {String} connectionURI - just a connectionURI
 * @param  {Object} collections - list of collections' definitions (alias: doCollection) e.g. {collectionAlias: 'dbCollectionName1', collectionAlias2: 'dbCollectionName2'}
 * @return {Promise[{Object}]} - returns a Promise that will be filled with the mongo collections, for the connectionURI specified
 */
function getCollectionsByObject(connectionURI, collections) {
	return dbConnect(connectionURI).then(db => Object.keys(collections).reduce((dbCollectionsAlias, collectionAlias) => {
			dbCollections[db.databaseName + collections[collectionAlias]] = dbCollections[db.databaseName + collections[collectionAlias]] || db.collection(collections[collectionAlias]);
			dbCollectionsAlias[collectionAlias] = dbCollections[db.databaseName + collections[collectionAlias]];
			return dbCollectionsAlias;
		}, {})
	);
}

/**
 * getCollectionsByArray :: Connects to a connectionURI and retrieves the collections' instances which has been asked for
 * @param  {String} connectionURI - just a connectionURI
 * @param  {Object} collections - list of collections e.g. ['dbCollectionName1', 'dbCollectionName2']
 * @return {Promise[{Object}]} - returns a Promise that will be filled with the mongo collections, for the connectionURI specified
 */
function getCollectionsByArray(connectionURI, collections) {
	return dbConnect(connectionURI).then(db => collections.map(collectionName => {
		dbCollections[db.databaseName + collectionName] = dbCollections[db.databaseName + collectionName] || db.collection(collectionName);
        return dbCollections[db.databaseName + collectionName];
	}));
}
/**
 * connect :: The main function exposed by the module. Is able to connect to one connectionURI, reusing the same connection object in case it has been asked for a connection to the same connectionURI. Also is capable of connect to N connectionURIs and retrieve N collectons for each of the connections in one call
 * @param  {String} connectionURI - just a connectionURI
 * @param  {Array|Object} collections - list of collections' name or collections' definitions (alias: doCollection) e.g. ['dbCollectionName1', 'dbCollectionName2'] OR {collectionAlias: 'dbCollectionName1', collectionAlias2: 'dbCollectionName2'}
  * @return {Promise[{Object}]} - returns a Promise that will be filled with the mongo connections instances, or mongo collections, dependent of how the function has been called
 */
function connect(connectionURI, collections) {
	if (connectionURI.constructor === Object)
		return dbConnectManyAndGetCollections(connectionURI);
	else if (connectionURI.constructor === Array)
		return dbConnectMany(connectionURI);
	else if (connectionURI.constructor === String && collections)
		return getCollections(connectionURI, collections);
	else
		return dbConnect(connectionURI);
}

connect.dbCollections = dbCollections;
connect.dbConnections = dbConnections;

module.exports = connect;