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

