var Zebra = {}; // the namespace

/************** Graph Store **************/

Zebra.G = {}; // the prototype

Zebra.graph = function (V, E) {
    var graph = Object.create(Zebra.G);

    graph.edges = [];
    graph.vertices = [];
    graph.vertexIndex = {}; // for lookup optimization

    graph.autoid = 1;

    if (Array.isArray(V)) {
        graph.addVertices(V);
    }
    if (Array.isArray(E)) {
        graph.addEdges(E);
    }

    return graph
};

Zebra.G.addVertex = function (vertex) {
    if (!vertex._id) {
        vertex._id = this.autoid++;
    } else if (this.findVertexById(vertex._id)) {
        return Zebra.error("A vertex with that ID already exists");
    }

    this.vertices.push(vertex);
    this.vertexIndex[vertex._id] = vertex;
    vertex._out = [];
    vertex._in = [];

    return vertex._id;
};

Zebra.G.addEdge = function (edge) {
    edge._in = this.findVertexById(edge._in);
    edge._out = this.findVertexById(edge._out);

    if (!(edge._in && edge._out)) {
        return Zebra.error("That edge's " + (edge._in ? "out" : "in") + " vertex wasn't found");
    }

    edge._out._out.push(edge);
    edge._in._in.push(edge);

    this.edges.push(edge);
};

Zebra.G.addVertices = function (vs) {
    vs.forEach(this.addVertex.bind(this));
};

Zebra.G.addEdges = function (es) {
    es.forEach(this.addEdge.bind(this));
};

// Zebra.G.removeVertex
// Zebra.G.removeEdge

// Zebra.G.findVertex

Zebra.G.findVertexById = function (vertex_id) {
    return this.vertexIndex[vertex_id];
}

// Zebra.G.findVertices
// Zebra.G.findVerticesByIds

// Zebra.G.searchVertices

// Zebra.G.findOutEdges
// Zebra.G.findInEdges

// Zebra.fromString

Zebra.error = function (msg) {
    console.log(msg);
    return false;
};

/************** Graph Query **************/

Zebra.Q = {};

Zebra.query = function (graph) {
    var query = Object.create(Zebra.Q);

    query.graph = graph; // the graph itself
    query.state = [];    // state for each step
    query.program = [];  // list of steps to take
    query.gremlins = []; // gremlins,  a creature that travels through the graph for each step

    return query;
};

Zebra.Q.add = function (pipetype, args) {
    var step = [pipetype, args];
    this.program.push(step);
    return this;
};

// query initializer
Zebra.G.v = function () {
    var query = Zebra.query(this);
    query.add('vertex', [].slice.call(arguments));
    return query;
};

/************** Test **************/
V = [{ name: 'alice' }                                         // alice gets auto-_id (prolly 1)
    , { _id: 10, name: 'bob', hobbies: ['asdf', { x: 3 }] }];
E = [{ _out: 1, _in: 10, _label: 'knows' }];
g = Zebra.graph(V, E);
g.addVertex({ name: 'charlie', _id: 'charlie' });                // string ids are fine
g.addVertex({ name: 'delta', _id: '30' });                       // in fact they're all strings
g.addEdge({ _out: 10, _in: 30, _label: 'parent' });
g.addEdge({ _out: 10, _in: 'charlie', _label: 'knows' });
console.log(g);
// g.v(1).out('knows').out().run();                               // returns [charlie, delta]
// q = g.v(1).out('knows').out().take(1);
// q.run();                                                       // returns [charlie]
// q.run();                                                       // returns [delta]    (but don't rely on result order!)
// q.run();                                                       // returns []
