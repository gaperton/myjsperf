function nt1attrModel(){
    return Nested.Model.defaults({ a1 : 0 });
}

function nt1attrModelInstance(){
    var M = nt1attrModel();
    return new M();
}

function bb1attrModel(){
    return Backbone.Model.extend({
        defaults : function(){
            return { a1 : 0 };
        }
    });
}

function bb1attrModelInstance(){
    var M = bb1attrModel();
    return new M();
}

function nt20attrModel(){
    return Nested.Model.defaults({
        a1 : 1, a2 : 2, a3 : 3, a4: 4, a5 : 5, a6: 6, a7: 7, a8: 8, a9: 9, a10 : 10,
        b1 : 1, b2 : 2, b3 : 3, b4: 4, b5 : 5, b6: 6, b7: 7, b8: 8, b9: 9, b10 : 10
    });
}

function nt20attrModelInstance(){
    var M = nt20attrModel();
    return new M();
}

function bb20attrModel(){
    return Backbone.Model.extend({
        defaults : function(){
            return {
                a1 : 1, a2 : 2, a3 : 3, a4: 4, a5 : 5, a6: 6, a7: 7, a8: 8, a9: 9, a10 : 10,
                b1 : 1, b2 : 2, b3 : 3, b4: 4, b5 : 5, b6: 6, b7: 7, b8: 8, b9: 9, b10 : 10
            };
        }
    });
}

function bb20attrModelInstance(){
    var M = bb20attrModel();
    return new M();
}

function createModel( count, Model ){
    var m;

    for( var i = 0; i < count; i++ ){
        m = new Model();
    }
}

function update1attr( count, m ){
    for( var i = 0; i < count; i++ ){
        m.set( 'a1', i );
    }
}

function update1attrNative( count, m ){
    for( var i = 0; i < count; i++ ){
        m.a1 = i;
    }
}

groups.create({
    name : 'Model creation',
    //iterations : 50000,
    tests : [
        {
            name : 'Backbone 1-attr',
            init : bb1attrModel,
            test : createModel
        },
        {
            name : 'Nested 1-attr',
            init : nt1attrModel,
            test : createModel
        },
        {
            name : 'Backbone 20-attr',
            init : bb20attrModel,
            test : createModel
        },
        {
            name : 'Nested 20-attr',
            init : nt20attrModel,
            test : createModel
        }
    ]
});

groups.create({
    name : 'Update single attribute',
    iterations : 50000,
    tests : [
        {
            name : 'Backbone 1-attr',
            init : bb1attrModelInstance,
            test : function( i, m ){
                m.set( 'a1', i );
            }
        },
        {
            name : 'Nested 1-attr',
            init : nt1attrModelInstance,
            test : function( i, m ){
                m.set( 'a1', i );
            }
        },
        {
            name : 'Nested 1-attr native',
            init : nt1attrModelInstance,
            test : function( i, m ){
                m.a1 = i;
            }
        },
        {
            name : 'Backbone 20-attr',
            init : bb20attrModelInstance,
            test : function( i, m ){
                m.set( 'a1', i );
            }
        },
        {
            name : 'Nested 20-attr',
            init : nt20attrModelInstance,
            test : function( i, m ){
                m.set( 'a1', i );
            }
        },
        {
            name : 'Nested 20-attr native',
            init : nt20attrModelInstance,
            test : function( i, m ){
                m.a1 = i;
            }
        },
        {
            name : 'Empty test',
            test : function( i ){ var m = i+1; }
        }

    ]
});