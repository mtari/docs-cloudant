# IBM Cloudant

Cloudant is primarily delivered as a cloud-based service. Cloudant is a non-relational, distributed database service of the same name. Cloudant is based on the Apache-backed CouchDB project and the open source BigCouch project.

Cloudant's service provides integrated data management, search, and analytics engine designed for web applications. Cloudant scales databases on the CouchDB framework and provides hosting, administrative tools, analytics and commercial support for CouchDB and BigCouch. Cloudant's distributed CouchDB service is used the same way as standalone CouchDB, with the added advantage of data being redundantly distributed over multiple machines.

**Recommended:**
You can read more about [Apache CouchDB](https://en.wikipedia.org/wiki/Apache_CouchDB)

You can also read the [official documentation](https://console.bluemix.net/docs/services/Cloudant/basics/index.html#ibm-cloudant-basics)

# HTTP API

All requests to IBM Cloudant go over the web. This means any system that can speak to the web can speak to IBM Cloudant. All language-specific libraries for IBM Cloudant are really just wrappers that provide some convenience and linguistic niceties to help you work with a simple API. Many users choose to use raw HTTP libraries for working with IBM Cloudant.

Specific details about how IBM Cloudant uses HTTP are provided in the [HTTP topic of the API Reference](https://console.bluemix.net/docs/services/Cloudant/api/http.html#http).

# Cloudant Node.js Client
We use [@cloudant/cloudant](https://www.npmjs.com/package/@cloudant/cloudant) in our applications. This library is the offical Cloudant library for Node.js.

##table of content
[Database functions](#cloudant_database_functions)
[Document functions](#cloudant_document_functions)
[Cloudant views and design](#cloudant_views_and_design)
[Cloudant query](#cloudant_query)

<a name="cloudant_database_functions"></a>

## Database functions

### cloudant.db.create(name, [callback])
creates a database with the given name.
```
cloudant.db.create('alice', function(err, body) {
  if (!err) {
    console.log('database alice created!');
  }
});
```

### cloudant.db.get(name, [callback])
get informations about name.
```
cloudant.db.get('alice', function(err, body) {
  if (!err) {
    console.log(body);
  }
});
```

###cloudant.db.destroy(name, [callback])
destroys name.
```
cloudant.db.destroy('alice');
```
even though this examples looks sync it is an async function.

###cloudant.db.list([callback])
lists all the databases
```
cloudant.db.list(function(err, body) {
  // body is an array
  body.forEach(function(db) {
    console.log(db);
  });
});
```

###cloudant.db.replicate(source, target, [opts], [callback])
replicates source on target with options opts. target has to exist, add create_target:true to opts to create it prior to replication.
```
cloudant.db.replicate('alice', 'http://admin:password@otherhost.com:5984/alice',
                  { create_target:true }, function(err, body) {
    if (!err)
      console.log(body);
});
```

###cloudant.db.replication.enable(source, target, [opts], [callback])
enables replication using the new api from source to target with options opts. target has to exist, add create_target:true to opts to create it prior to replication. replication will survive server restarts.
```
cloudant.db.replication.enable('alice', 'http://admin:password@otherhost.com:5984/alice',
                  { create_target:true }, function(err, body) {
    if (!err)
      console.log(body);
});
```

###cloudant.db.replication.query(id, [opts], [callback])
queries the state of replication using the new api. id comes from the response given by the call to enable.
```
cloudant.db.replication.enable('alice', 'http://admin:password@otherhost.com:5984/alice',
                   { create_target:true }, function(err, body) {
    if (!err) {
      cloudant.db.replication.query(body.id, function(error, reply) {
        if (!err)
          console.log(reply);
      }
    }
});
```

###cloudant.db.replication.disable(id, [opts], [callback])
disables replication using the new api. id comes from the response given by the call to enable.
```
cloudant.db.replication.enable('alice', 'http://admin:password@otherhost.com:5984/alice',
                   { create_target:true }, function(err, body) {
    if (!err) {
      cloudant.db.replication.disable(body.id, function(error, reply) {
        if (!err)
          console.log(reply);
      }
    }
});
```

###cloudant.use(name)
creates a scope where you operate inside name.
```
var alice = cloudant.use('alice');
```

<a name="cloudant_document_functions"></a>

##Document functions
###db.insert(doc, [params], [callback])
inserts doc in the database with optional params. if params is a string, its assumed as the intended document name. if params is an object, its passed as query string parameters and docName is checked for defining the document name.

```
var alice = cloudant.use('alice');
alice.insert({ crazy: true }, 'rabbit', function(err, body) {
  if (!err)
    console.log(body);
});
```

The insert function can also be used with the method signature db.insert(doc,[callback]), where the doc contains the _id field e.g.
```
var alice = cloudant.use('alice')
alice.insert({ _id: 'myid', crazy: true }, function(err, body) {
  if (!err)
    console.log(body)
})
```

and also used to update an existing document, by including the _rev token in the document being saved:
```
var alice = cloudant.use('alice')
alice.insert({ _id: 'myid', _rev: '1-23202479633c2b380f79507a776743d5', crazy: false }, function(err, body) {
  if (!err)
    console.log(body)
})
```

###db.destroy(docname, rev, [callback])
removes revision rev of docname.
```
alice.destroy('rabbit', '3-66c01cdf99e84c83a9b3fe65b88db8c0', function(err, body) {
  if (!err)
    console.log(body);
});
```

###db.get(docname, [params], [callback])
gets docname from the database with optional query string additions params.
```
alice.get('rabbit', { revs_info: true }, function(err, body) {
  if (!err)
    console.log(body);
});
```

###db.head(docname, [callback])
same as get but lightweight version that returns headers only.
```
alice.head('rabbit', function(err, _, headers) {
  if (!err)
    console.log(headers);
});
```

###db.copy(src_doc, dest_doc, opts, [callback])
copy the contents (and attachments) of a document to a new document, or overwrite an existing target document
```
alice.copy('rabbit', 'rabbit2', { overwrite: true }, function(err, _, headers) {
  if (!err)
    console.log(headers);
});
```

###db.bulk(docs, [params], [callback])
bulk operations(update/delete/insert) on the database, refer to the doc.
```
const testData = [
    {
        title: "title 5",
        description: "test 5",
        _id: "Test5ID"
    },
    {
        title: "title 6",
        description: "test 6",
        _id: "Test6ID"
    },
    {
        title: "title 7",
        description: "test 7",
        _id: "Test7ID"
    }
];

db.bulk({ docs: testData }, (error, result) => {
    if(!error)
        console.log(result);
});
```

###db.list([params], [callback])
list all the docs in the database with optional query string additions params.
```
alice.list(function(err, body) {
  if (!err) {
    body.rows.forEach(function(doc) {
      console.log(doc);
    });
  }
});
```

<a name="cloudant_views_and_design"></a>

##Cloudant view and design functions
###db.view(designname, viewname, [params], [callback])
calls a view of the specified design with optional query string additions params. if you're looking to filter the view results by key(s) pass an array of keys, e.g { keys: ['key1', 'key2', 'key_n'] }, as params.
```
alice.view('characters', 'crazy_ones', {
  'key': 'Tea Party',
  'include_docs': true
}, function(err, body) {
  if (!err) {
    body.rows.forEach(function(doc) {
      console.log(doc.value);
    });
  }
});
```
```
alice.view('characters', 'soldiers', {
  'keys': ['Hearts', 'Clubs']
}, function(err, body) {
  if (!err) {
    body.rows.forEach(function(doc) {
      console.log(doc.value);
    });
  }
});
```

When params is not supplied, or no keys are specified, it will simply return all docs in the view.
```
alice.view('characters', 'crazy_ones', function(err, body) {
  if (!err) {
    body.rows.forEach(function(doc) {
      console.log(doc.value);
    });
  }
});
```
```
alice.view('characters', 'crazy_ones', { include_docs: true }, function(err, body) {
  if (!err) {
    body.rows.forEach(function(doc) {
      console.log(doc.value);
    });
  }
});
```

###db.show(designname, showname, doc_id, [params], [callback])
calls a show function of the specified design for the document specified by doc_id with optional query string additions params.
```
alice.show('characters', 'format_doc', '3621898430', function(err, doc) {
  if (!err) {
    console.log(doc);
  }
});
```

<a name="cloudant_query"></a>

##Cloundant query
###db.index([callback])
To see all the indexes in a database, call the database .index() method with a callback function.

```
db.index(function(er, result) {
  if (er) {
    throw er;
  }
 
  console.log('The database has %d indexes', result.indexes.length);
  for (var i = 0; i < result.indexes.length; i++) {
    console.log('  %s (%s): %j', result.indexes[i].name, result.indexes[i].type, result.indexes[i].def);
  }
 
  result.should.have.a.property('indexes').which.is.an.Array;
  done();
});
```

To create an index, use the same .index() method but with an extra initial argument: the index definition. For example, to make an index on middle names in the data set:
```
var first_name = {name:'first-name', type:'json', index:{fields:['name']}}
db.index(first_name, function(er, response) {
  if (er) {
    throw er;
  }
 
  console.log('Index creation result: %s', response.result);
});
```

###db.find(selector, [callback])
To query using the index, use the .find() method.
```
db.find({selector:{name:'Alice'}}, function(er, result) {
  if (er) {
    throw er;
  }
 
  console.log('Found %d documents with name Alice', result.docs.length);
  for (var i = 0; i < result.docs.length; i++) {
    console.log('  Doc id: %s', result.docs[i]._id);
  }
});
```

###Using Conditional and Combination operators
####Greater than operator.
```
const query = {
    "selector": {
        "Movie_year": {
            "$gt": 2010
        }
    },
    "fields": ["_id", "_rev", "Movie_year", "Movie_name"],
    "sort": [{ "Movie_year": "asc" }],
    "limit": 10,
    "skip": 0
};

const result = await db.find(query);
```

####Implicit $and operator.
```
const query = {
    "selector": {
        "Person_name": "Adam Sandler",
        "Movie_year": 2003
    }
};

const result = await db.find(query);
```

####$and, $or and $eq operators
```
const query = {
    "selector": {
        "$and": [
            {
                "Person_name": {
                    "$or": ["Adam Sandler", "Abigail Breslin"]
                }
            },
            {
                "Movie_genre": {
                    "$eq": "CDY"
                }
            }
        ]
    },
    "fields": ["_id", "_rev", "Movie_year", "Person_name", "Movie_name", "Movie_genre"]
};

const result = await db.find(query);
```

####$and, $nor and $eq operator
```
const query = {
    "selector": {
        "Movie_year": 2006,
        "$or": [
            { "Person_name": "Adam Sandler" },
            { "Person_name": "Abigail Breslin" }
        ]
    },
    "fields": ["_id", "_rev", "Movie_year", "Person_name", "Movie_name", "Movie_genre"]
};

const result = await db.find(query);
```

####$and, $nor and $eq operator
```
const query = {
    "selector": {
        "$and": [
            {
                "Person_name": {
                    "$or": ["Adam Sandler", "Abigail Breslin"]
                }
            },
            {
                "Movie_year": {
                    "$gte": 2000
                },
                "Movie_year": {
                    "$lte": 2010
                },
                "$nor": [
                    { "Movie_year": 2001 },
                    { "Movie_year": 2003 },
                    { "Movie_year": 2006 }
                ]
            }
        ]
    },
    "fields": ["_id", "_rev", "Movie_year", "Person_name", "Movie_name", "Movie_genre"]
};

const result = await db.find(query);
```

####$and, $not and $eq operator
```
const query = {
    "selector": {
        "$and": [
            {
                "Person_name": {
                    "$or": ["Adam Sandler", "Abigail Breslin"]
                }
            },
            {
                "Movie_year": {
                    "$gte": 2000
                },
                "Movie_year": {
                    "$lte": 2010
                },
                "$not": {
                    "Movie_year": 2003
                }
            }
        ]
    },
    "fields": ["_id", "_rev", "Movie_year", "Person_name", "Movie_name", "Movie_genre"]
};

const result = await db.find(query);
```