/*
https://github.com/cloudant/nodejs-cloudant#cloudant-query
https://www.npmjs.com/package/@cloudant/cloudant
https://github.com/cloudant-labs/cloudant-nano
https://console.bluemix.net/docs/services/Cloudant/basics/index.html#cloudant-basics
*/

const Cloudant = require("@cloudant/cloudant");
var should = require('should');

const dbCredentials = {
    url: "https://14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix:24d869ab9780da53caa7cee957d62359868704f69497f65cce05d4b46d04f633@14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix.cloudant.com"
}

let cloudant = null;

before(() => {
    console.log("TEST before 1");
    cloudant = new Cloudant({ url: dbCredentials.url, plugins: 'promises' });
});

describe.skip("Cloudant database functions", () => {
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

    it("replication.enable function", (done) => {
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
    it("replication.disable function", (done) => {
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

describe.only("Cloudant document functions", () => {
    before(async () => {
        const dbName = "testdb";
        await cloudant.db.destroy(dbName);
        await cloudant.db.create(dbName);
        db = cloudant.use(dbName);
    });

    it("Can get information about database", async () => {
        const dbName = 'testdb';
        const result = await cloudant.db.get(dbName);
        result.db_name.should.eql(dbName);
    });

    it("Check if database exists", async () => {
        const dbName = 'testdb';
        const list = await cloudant.db.list();
        list.should.containEql(dbName);
    });

    it("Should return an error when trying to access a document what doesn't exist", (done) => {
        db.get("non-existing-doc")
            .catch((err) => {
                err.error.should.eql("not_found");
                done();
            });
    });

    it("Can insert document into a database without id", async () => {
        const inputDoc = {
            title: "title 1",
            description: "test 1"
        };

        const inputResult = await db.insert(inputDoc);
        const getResult = await db.get(inputResult.id)
        getResult.should.have.properties(inputDoc);
    });

    it("Can insert document into a database using id (as a argument)", async () => {
        const inputDoc = {
            title: "title 2",
            description: "test 2"
        };
        const id = "Test2ID";

        const insertResult = await db.insert(inputDoc, id);
        const getResult = await db.get(insertResult.id);
        getResult.should.have.properties({ _id: id });
        getResult.should.have.properties(inputDoc);
    });

    it("Can insert document into a database using id (as part of the document)", async () => {
        const inputDoc = {
            title: "title 3",
            description: "test 3",
            _id: "Test3ID"
        };

        await db.insert(inputDoc);
        const getResult = await db.get(inputDoc._id);
        getResult.should.have.properties(inputDoc);
    });

    it("Can modify document", async () => {
        const inputDoc = {
            title: "title 4",
            description: "test 4"
        };
        const updatedTitle = "title 4 updated";
        const updatedDescription = "test 4 updated";

        const insertResult = await db.insert(inputDoc);
        const getResult = await db.get(insertResult.id);

        const newInputDoc = {
            ...getResult,
            title: updatedTitle,
            description: updatedDescription
        };

        const insertResult2 = await db.insert(newInputDoc);
        const getResult2 = await db.get(insertResult2.id);
        getResult2.title.should.eql(updatedTitle);
        getResult2.description.should.eql(updatedDescription);
    });

    it("can insert bulk data", async () => {
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

        const result = await db.bulk({ docs: testData });
        result.forEach(element => {
            element.ok.should.eql(true);
        });
    });

    it("can list data", async () => {
        let list = await db.list();
        const originalLength = list.rows.length;

        const testData = [
            {
                title: "title 8",
                description: "test 8",
                _id: "Test8ID"
            },
            {
                title: "title 9",
                description: "test 9",
                _id: "Test9ID"
            }
        ];

        await db.bulk({ docs: testData });

        list = await db.list();
        const newLength = list.rows.length;

        newLength.should.eql(originalLength + testData.length);
    })

    it("Can copy document", async () => {
        const inputID = "Test2ID";
        const outputID = "Test2IDcopy";

        const result = await db.copy(inputID, outputID, { overwrite: false });
        result.ok.should.eql(true);
    });

    it("Returns registered indexes", async () => {
        const result = await db.index();
        result.should.have.a.property('indexes').which.is.an.Array;
    });
});

describe("Query", () => {
    before(async () => {
        const dbName = "movies-demo";
        // await cloudant.db.destroy(dbName);
        // const dbURL = `https://examples.cloudant.com/${dbName}`;
        // const dbReplicaURL = `https://14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix:24d869ab9780da53caa7cee957d62359868704f69497f65cce05d4b46d04f633@14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix.cloudant.com/${dbName}`;
        // await cloudant.db.replicate(dbURL, dbReplicaURL, { create_target: true });
        db = cloudant.use(dbName);
    });

    it("Can query documents using Conditional opreator ($gt), but can't sort by 'Movie_year' (unless adding 'Movie_year' as a new index).", async () => {
        // I only need to add this index, because I want to sort by 'Movie_year'
        const year = { name: "Movie_year", type: "json", index: { fields: ["Movie_year"] } };
        await db.index(year);

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
        result.docs.length.should.eql(10);
    });

    it("Can search documents using Combination operators (implicit $and oprator)", async () => {
        const query = {
            "selector": {
                "Person_name": "Adam Sandler",
                "Movie_year": 2003
            }
        };

        const result = await db.find(query);
        result.docs.length.should.eql(2);
    });

    it("$and, $or and $eq operators", async () => {
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
        result.docs.length.should.eql(2);
    });

    it("$and, $or and $eq operators 2", async () => {
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
        result.docs.length.should.eql(4);
    });

    it("$and, $nor and $eq operator", async () => {
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
        result.docs.length.should.eql(10);
    });

    it("$and, $not and $eq operator", async () => {
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
        result.docs.length.should.eql(10);
    });
});

describe("Cloudant views and design functions", () => {
    before(async () => {
        const dbName = "animaldb";
        // await cloudant.db.destroy(dbName);
        // const dbURL = `https://examples.cloudant.com/${dbName}`;
        // const dbReplicaURL = `https://14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix:24d869ab9780da53caa7cee957d62359868704f69497f65cce05d4b46d04f633@14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix.cloudant.com/${dbName}`;
        // await cloudant.db.replicate(dbURL, dbReplicaURL, { create_target: true });
        db = cloudant.use(dbName);
    });

    it("Can query views for a single key.", async () => {
        const result = await db.view('views101', 'diet', {
            'key': 'carnivore',
            'include_docs': true
        });
        result.rows.length.should.eql(2);
    });

    it("Can query views for multiple keys.", async () => {
        const result = await db.view('views101', 'diet', {
            'keys': ['carnivore', 'herbivore']
        });
        result.rows.length.should.eql(6);
    });

    it("Can query views without params.", async () => {
        const result = await db.view('views101', 'diet');
        result.rows.length.should.eql(10);
    });
});

describe("Cloudant search", () => {
    before(() => {
        const dbName = "animaldb";
        // await cloudant.db.destroy(dbName);
        // const dbURL = `https://examples.cloudant.com/${dbName}`;
        // const dbReplicaURL = `https://14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix:24d869ab9780da53caa7cee957d62359868704f69497f65cce05d4b46d04f633@14d0e96f-539c-413a-b1b2-dfa47baaaf92-bluemix.cloudant.com/${dbName}`;
        // await cloudant.db.replicate(dbURL, dbReplicaURL, { create_target: true });
        db = cloudant.use(dbName);
    });

    it("Search should work on views using $text search", async () => {
        const result = await db.search('views101', 'animals', { q: "zebra" });
        result.total_rows.should.eql(1);
    });

    it("Search should work using a JSON search", async () => {
        const result = await db.search('views101', 'animals', { q: "class: bird" });
        result.total_rows.should.eql(2);
    });

    it("Can find animals starting with l.", async () => {
        const result = await db.search('views101', 'animals', { q: "l*" });
        result.total_rows.should.eql(2);
    });

    it("Can find Carnivorous birds", async () => {
        const result = await db.search('views101', 'animals', { q: "class:bird AND diet:carnivore" });
        result.total_rows.should.eql(1);
    });

    it("Can find Herbivores that start with letter l", async () => {
        const result = await db.search('views101', 'animals', { q: "l* AND diet:herbivore" });
        result.total_rows.should.eql(1);
    });

    it("Can find medium-sized herbivores", async () => {
        const result = await db.search('views101', 'animals', { q: "min_length:[1 TO 3] AND diet:herbivore" });
        result.total_rows.should.eql(2);
    });

    it("Can find Herbivores that are 2m long or less", async () => {
        const result = await db.search('views101', 'animals', { q: "diet:herbivore AND min_length:[-Infinity TO 2]" });
        result.total_rows.should.eql(2);
    });

    it("Can find Mammals that are at least 1.5m long", async () => {
        const result = await db.search('views101', 'animals', { q: "class:mammal AND min_length:[1.5 TO Infinity]" });
        result.total_rows.should.eql(4);
    });

    it("Can find Mammals who are herbivore or carnivore", async () => {
        const result = await db.search('views101', 'animals', { q: "diet:(herbivore OR omnivore) AND class:mammal" });
        result.total_rows.should.eql(7);
    });
});