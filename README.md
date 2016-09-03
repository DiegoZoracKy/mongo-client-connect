# Mongo Client Connect
Provides an easy way to specify *N* collections from *N* connectionURIs to be retrieved at once, in one call (**DRY!**). It reuses the same **connection** objects (**creating only one connection pool per connectionURI**) and **collection** instances, avoiding the creation of many, unnecessary, connections pools to a same connectionURI.

**[Mongo DB Native NodeJS Driver](https://github.com/mongodb/node-mongodb-native)** is the engine under the hood.

## Installation

```
npm install mongo-client-connect
```

## Usage

OBS: Examples are created for **Nodejs v6+** (Destructuring!).

### Connect to a MongoDB

A simple connection to a MongoDB

```javascript
MongoClientConnect('mongodb://localhost/dbName').then(db => {});
```

But in case you have more than one call in your project:

```javascript
// Somewhere
MongoClientConnect('mongodb://localhost/dbName').then(db => {});

//[...]

// Somewhere else...
MongoClientConnect('mongodb://localhost/dbName').then(db => {});
```
by mistake, or intentionally because of by some file structure strategy, **only one connection pool will be created**

### Connect to many MongoDBs

A simple connection to *N* MongoDBs

```javascript
MongoClientConnect([
	'mongodb://localhost/dbName1',
	'mongodb://anotherHost/dbName2'
]).then(([ db1, db2 ]) => {
	console.log(db1.databaseName);
	console.log(db2.databaseName);
});
```

### Connect and gets Collections

It will connect and return the collections that has been asked for.

```javascript
MongoClientConnect('mongodb://localhost/dbName', [
	'dbCollectionName1',
	'dbCollectionName2'
])
.then( ([ dbCollectionName1, dbCollectionName2 ]) => {
    // Example of something with one collection
    dbCollectionName1.find({}).toArray().then(docs => console.log(docs.length));
  	// Example of something with the other collection
    dbCollectionName2.find({}).toArray().then(docs => console.log(docs.length));
});
```

### Connect to many DBs and get Collections

It connects to N MongoDBs and returns collections for each of them.

```javascript
MongoClientConnect({
	'mongodb://localhost/dbName': ['dbCollectionName1'],
	'mongodb://someOtherHost/dbName': ['dbCollectionName2', 'dbCollectionName3']
})
.then(([[ dbCollectionName1 ], [ dbCollectionName2, dbCollectionName3 ]]) => {
	console.log(dbCollectionName1.s.dbName, dbCollectionName2.s.dbName, dbCollectionName3.s.dbName);
})
```

### Connect and gets Collections (by `Object`)

It will connect and return collections, the same as above, but the collections are specified by an `Object`, in case you prefer the response to be an Object. The collections can also be configured with an alias.

```javascript
MongoClientConnect('mongodb://localhost/dbName', { someAlias: 'dbCollectionName' })
	.then(({ someAlias }) => {
    	// 'someAlias' will be a reference to collection 'dbCollectionName'
		someAlias.find({}).toArray().then(r => console.log(r.length))
	});
```

### Connect to many DBs and get Collections (by `Object`)

Same as above, it connects to N MongoDBs and returns collections for each of them, but defining collections as an `Object` in case you prefer the response to be an Object. The collections can also be configured with an alias.

```javascript
MongoClientConnect({
	'mongodb://localhost/dbName': {
		alias1: 'dbCollectionName1'
	},
	'mongodb://someOtherHost/dbName': {
		alias2: 'dbCollectionName2',
		alias3: 'dbCollectionName3'
	}
})
.then(([{ alias1 }, { alias2, alias3 }]) => {
	console.log(alias1.s.name, alias2.s.name, alias3.s.name);
});
```
