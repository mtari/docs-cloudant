/*
https://github.com/cloudant/nodejs-cloudant#cloudant-query
https://www.npmjs.com/package/@cloudant/cloudant
https://github.com/cloudant-labs/cloudant-nano
https://console.bluemix.net/docs/services/Cloudant/basics/index.html#cloudant-basics
*/

var should = require('should');

const dbCredentials = {
    url: "https://14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix:24d869ab9780da53caa7cee957d62359868704f69497f65cce05d4b46d04f633@14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix.cloudant.com"
}

let cloudant = null;

before(() => {
    console.log("TEST before 1");
    cloudant = require('@cloudant/cloudant')(dbCredentials.url);
});

describe("Cloudant database functions", () => {
    it("replication function", (done) => {
        const dbName = 'animaldb';
        const dbReplicaName = 'animaldb-replica';
        cloudant.db.replicate(dbName, dbReplicaName, { create_target: true }, (err, body) => {
            if (err) {
                throw body;
            }

            body.ok.should.eql(true);
            done();
        });
    });

    it.skip("replication.enable function", (done) => {
        const url = "https://14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix:24d869ab9780da53caa7cee957d62359868704f69497f65cce05d4b46d04f633@14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix.cloudant.com";
        const dbName = `animaldb`;
        const dbURL = `${url}/${dbName}`;
        const dbReplicaName = `animaldb-replica-2`;
        const dbReplicaURL = `${url}/${dbReplicaName}`;
        cloudant.db.replication.enable(dbURL, dbReplicaURL, { create_target: true }, (err, body) => {
            if (err) {
                throw err;
            }
            body.ok.should.eql(true);
            done();
        });
    });

    it("replication.query function", (done) => {
        const url = "https://14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix:24d869ab9780da53caa7cee957d62359868704f69497f65cce05d4b46d04f633@14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix.cloudant.com";
        const dbName = `animaldb`;
        const dbURL = `${url}/${dbName}`;
        const dbReplicaName = `animaldb-replica-2`;
        const dbReplicaURL = `${url}/${dbReplicaName}`;
        cloudant.db.replication.enable(dbURL, dbReplicaURL, { create_target: true }, (err, body) => {
            if (err) {
                throw err;
            }
            body.ok.should.eql(true);
            cloudant.db.replication.query(body.id, (err, response) => {
                if (err) {
                    throw err;
                }
                console.log(response);
                done();
            });
        });
    });

    // TODO test replication.disable function
    it.skip("replication.disable function", (done) => {
        const url = "https://14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix:24d869ab9780da53caa7cee957d62359868704f69497f65cce05d4b46d04f633@14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix.cloudant.com";
        const dbName = `animaldb`;
        const dbURL = `${url}/${dbName}`;
        const dbReplicaName = `animaldb-replica-2`;
        const dbReplicaURL = `${url}/${dbReplicaName}`;
        cloudant.db.replication.enable(dbURL, dbReplicaURL, { create_target: true }, (err, body) => {
            if (err) {
                throw err;
            }
            body.ok.should.eql(true);
            console.log(body);
            setTimeout(function () {
                cloudant.db.replication.query(body.id, (err, response) => {
                    cloudant.db.replication.disable(body.id, (err, resp) => {
                        console.log(error);
                        console.log(reply);
                        if (error) {
                            throw error;
                        }
                        console.log(reply);
                        done();
                    });
                });
            }, 3000);


        });
    });

    it("changes function", (done) => {
        const dbName = 'animaldb';
        cloudant.db.changes(dbName, function (err, body) {
            if (err) {
                throw err;
            }
            body.should.have.a.property('results').which.is.an.Array;
            done();
        });
    });
});

describe("Cloudant document functions", () => {
    before((done) => {
        const dbName = "testdb";
        cloudant.db.destroy(dbName, () => {
            cloudant.db.create(dbName, (err, res) => {
                if (err) {
                    throw err;
                }
                db = cloudant.use(dbName);
                done();
            });
        });
    });

    it("Check if database exists", (done) => {
        const dbName = 'testdb';
        cloudant.db.list((err, body, headers) => {
            if (err) {
                throw err;
            }
            body.should.containEql(dbName);
            done();
        });
    });

    it("Should return an error when trying to access a document what doesn't exist", (done) => {
        db.get("non-existing-doc", (err, data) => {
            err.error.should.eql("not_found");
            done();
        });
    });

    it("Can insert document into a database without id", (done) => {
        const inputDoc = {
            title: "title 1",
            description: "test 1"
        };

        db.insert(inputDoc, (err, body, header) => {
            if (err) {
                throw err;
            }

            db.get(body.id, (err, data) => {
                if (err) {
                    throw err;
                }
                data.should.have.properties(inputDoc);
                done();
            });
        });
    });

    it("Can insert document into a database using id (as a argument)", (done) => {
        const inputDoc = {
            title: "title 2",
            description: "test 2"
        };
        const id = "Test2ID";

        db.insert(inputDoc, id, (err, body, header) => {
            if (err) {
                throw err;
            }

            db.get(id, (err, data) => {
                if (err) {
                    throw err;
                }
                data.should.have.properties({ _id: id });
                data.should.have.properties(inputDoc);
                done();
            });
        });
    });

    it("Can insert document into a database using id (as part of the document)", (done) => {
        const inputDoc = {
            title: "title 2",
            description: "test 2",
            _id: "Test3ID"
        };

        db.insert(inputDoc, (err, body, header) => {
            if (err) {
                throw err;
            }

            db.get(inputDoc._id, (err, data) => {
                if (err) {
                    throw err;
                }
                data.should.have.properties(inputDoc);
                done();
            });
        });
    });

    it("Can modify document", (done) => {
        const inputID = "Test3ID"

        db.get(inputID, (err, data) => {
            if (err) {
                throw err;
            }
            console.log(JSON.stringify(data));
            const inputDoc = { ...data };
            inputDoc.title = "title 2 updated";
            inputDoc.description = "test 2 updated";
            db.insert(inputDoc, (error, body, header) => {
                if (error) {
                    throw error;
                }
                done();
            })
        });
    });

    it("can insert bulk data", (done) => {
        const testData = [
            {
                title: "title 4",
                description: "test 4",
                _id: "Test4ID"
            },
            {
                title: "title 5",
                description: "test 5",
                _id: "Test5ID"
            },
            {
                title: "title 6",
                description: "test 6",
                _id: "Test6ID"
            }
        ];

        db.bulk({ docs: testData }, function (er) {
            if (er) {
                throw er;
            }
            done();
        });

    });

    it("can list data", (done) => {
        db.list(function (err, body) {
            if (err) {
                throw err;
            }

            body.rows.forEach(function (doc) {
                console.log(doc);
            });
            done();
        });
    })

    it("Can copy document", (done) => {
        const inputID = "Test2ID";
        const outputID = "Test2IDcopy";

        db.copy(inputID, outputID, (err, body, header) => {
            if (err) {
                throw err;
            }

            console.log(body);
            console.log(header);
            done();
        });
    });

    it("Returns registered indexes", (done) => {
        db.index(function (er, result) {
            if (er) {
                throw er;
            }

            console.log('The database has %d indexes', result.indexes.length);
            for (var i = 0; i < result.indexes.length; i++) {
                console.log(JSON.stringify(result.indexes[i]));
            }

            result.should.have.a.property('indexes').which.is.an.Array;
            done();
        });
    });

    // TODO query data from testdb
    it("Search should work", (done) => {
        done();
    });
});

describe.only("Query", () => {
    before((done) => {
        // TODO could remove the saved db, and then replicate the original
        const dbName = "movies-demo";
        db = cloudant.use(dbName);
        done();
    });

    it("Can query documents using number (greater than), but can't sort by 'Movie_year' (unless adding 'Movie_year' as a new index).", (done) => {
        // I only need to add this index, because I want to sort by 'Movie_year'
        const year = { name: "Movie_year", type: "json", index: { fields: ["Movie_year"] } };
        db.index(year, (error, response) => {
            console.log(error);
            console.log(response);

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

            db.find(query, (error, result) => {
                console.log("error: " + error);
                console.log("result: " + JSON.stringify(result));
                done();
            });
        });
    });

    it("Selector basics", () => {
        const query = {
            "selector": {
                "Person_name": "Adam Sandler",
                "Movie_year": 2003
            }
        };

        db.find(query, (error, result) => {
            console.log("error: " + error);
            console.log("result: " + JSON.stringify(result));
            done();
        });
    });

    it("$and, $or and $eq operators", () => {
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

        db.find(query, (error, result) => {
            console.log("error: " + error);
            console.log("result: " + JSON.stringify(result));
            done();
        });
    });

    it("$and, $or and $eq operators 2", () => {
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

        db.find(query, (error, result) => {
            console.log("error: " + error);
            console.log("result: " + JSON.stringify(result));
            done();
        });
    });

    it("$and, $nor and $eq operator", () => {
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

        db.find(query, (error, result) => {
            console.log("error: " + error);
            console.log("result: " + JSON.stringify(result));
            done();
        });
    });

    it("$and, $not and $eq operator", () => {
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

        db.find(query, (error, result) => {
            console.log("error: " + error);
            console.log("result: " + JSON.stringify(result));
            done();
        });
    });
});

describe("Cloudant views and design functions", () => {
    before(() => {
        const dbName = "animaldb";
        db = cloudant.use(dbName);
    });

    it("query view", (done) => {
        db.view('views101', 'diet', {
            'key': 'carnivore',
            'include_docs': true
        }, function (err, body) {
            console.log(err);
            console.log(body);
            if (!err) {
                body.rows.forEach(function (doc) {
                    console.log(JSON.stringify(doc));
                });
                done();
            }
        });
    });

    it("query views with multiple keys", (done) => {
        db.view('views101', 'diet', {
            'keys': ['carnivore', 'herbivore']
        }, function (err, body) {
            if (err) {
                throw err;
            }
            body.rows.forEach(function (doc) {
                console.log(JSON.stringify(doc));
            });
            done();
        });
    });

    it("query views without params", (done) => {
        db.view('views101', 'diet', function (err, body) {
            if (err) {
                throw err;
            }
            body.rows.forEach(function (doc) {
                console.log(JSON.stringify(doc));
            });
            done();
        });
    });

    // how can I make it work??? what is a format_doc and the doc_id???
    it.skip("show should work", () => {
        db.show('views101', 'format_doc', '3621898430', function (err, doc) {
            if (err) {
                throw err;
            }
            console.log(doc);
            done();
        });
    });
});

describe("Cloudant search", () => {
    before(() => {
        const dbName = "animaldb";
        db = cloudant.use(dbName);
    });

    it("search also works on views", (done) => {
        db.search('views101', 'animals', { q: "zebra" }, function (err, body) {
            if (err) {
                throw err;
            }
            body.rows.forEach(function (doc) {
                console.log(JSON.stringify(doc));
            });
            done();
        });
    });

    it("search 1", (done) => {
        db.search('views101', 'animals', { q: "class: bird" }, function (err, body) {
            if (err) {
                throw err;
            }
            body.rows.forEach(function (doc) {
                console.log(JSON.stringify(doc));
            });
            done();
        });
    });

    it("search 2", (done) => {
        db.search('views101', 'animals', { q: "l*" }, function (err, body) {
            if (err) {
                throw err;
            }
            body.rows.forEach(function (doc) {
                console.log(JSON.stringify(doc));
            });
            done();
        });
    });

    it("search 3", (done) => {
        db.search('views101', 'animals', { q: "class:bird AND diet:carnivore" }, function (err, body) {
            if (err) {
                throw err;
            }
            body.rows.forEach(function (doc) {
                console.log(JSON.stringify(doc));
            });
            done();
        });
    });

    it("search 4", (done) => {
        db.search('views101', 'animals', { q: "l* AND diet:herbivore" }, function (err, body) {
            if (err) {
                throw err;
            }
            body.rows.forEach(function (doc) {
                console.log(JSON.stringify(doc));
            });
            done();
        });
    });

    it("search 5", (done) => {
        db.search('views101', 'animals', { q: "min_length:[1 TO 3] AND diet:herbivore" }, function (err, body) {
            if (err) {
                throw err;
            }
            body.rows.forEach(function (doc) {
                console.log(JSON.stringify(doc));
            });
            done();
        });
    });

    it("search 6", (done) => {
        db.search('views101', 'animals', { q: "diet:herbivore AND min_length:[-Infinity TO 2]" }, function (err, body) {
            if (err) {
                throw err;
            }
            body.rows.forEach(function (doc) {
                console.log(JSON.stringify(doc));
            });
            done();
        });
    });

    it("search 7", (done) => {
        db.search('views101', 'animals', { q: "class:mammal AND min_length:[1.5 TO Infinity]" }, function (err, body) {
            if (err) {
                throw err;
            }
            body.rows.forEach(function (doc) {
                console.log(JSON.stringify(doc));
            });
            done();
        });
    });

    it("search 8", (done) => {
        db.search('views101', 'animals', { q: "diet:(herbivore OR omnivore) AND class:mammal" }, function (err, body) {
            if (err) {
                throw err;
            }
            body.rows.forEach(function (doc) {
                console.log(JSON.stringify(doc));
            });
            done();
        });
    });
});