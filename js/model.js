import Nested, { Model } from 'nestedtypes'

window.Nested = Nested;

function emptyTest( n, context ){
    for( var i = 0; i < n; i++ ){
        // do nothing
    }
}

function delay( fun ){
    setTimeout( fun, 0 );
}

function measure( fun, iterations, context ){
    const start = window.performance.now();
    fun( iterations, context );
    return window.performance.now() - start;
}

export const Test = Model.extend( {
    idAttribute : 'name',

    defaults : {
        executedAt : Date.value( null ),
        name       : String,
        time       : Number.value( null ),
        count      : Integer,
        iterations : Integer,
        faster     : Number.value( null ),
        exception  : Error.value( null ),
        init       : Function.has.toJSON( false ),
        test       : Function.has.toJSON( false ).value( emptyTest )
    },

    properties : {
        ops(){
            return this.time ? Integer( this.count * 1000 / this.time ) : 0;
        }
    },

    _measure( iterations, cumulative = false ){
        if( !cumulative ){
            this.time = this.count = 0;
        }

        const context = this.init( iterations ) || {};
        this.time += measure( this.test, iterations, context );
        this.count += iterations;
    },

    _estimate(){
        this._measure( 100 );

        for( let n = 200; this.time < 200; n *= 2 ){
            this._measure( n, true );
        }

        return this.ops * 3;
    },

    run( a_iterations ){
        this.transaction( () =>{
            this.exception  = null;
            this.executedAt = new Date();

            try{
                var iterations = this.iterations || a_iterations || this._estimate();
                this._measure( iterations );
            }
            catch( e ){
                this.exception = e;
                console.error( e );
            }
        } );
    },

    collection : {
        whoIsFaster( thanMe ){
            const ops = thanMe && thanMe.ops;

            this.transaction( () =>{
                this.each( test => test.faster = ops && test.ops ? test.ops / ops : null );
            } );
        },

        properties : {
            time(){
                return this.reduce( ( ( sum, test ) => sum + test.time ), 0 );
            },

            count(){
                return this.reduce( ( ( sum, test ) => sum + test.count ), 0 );
            },

            ops(){
                return this.time ? Integer( this.count * 1000 / this.time ) : 0;
            }
        }
    }
} );

export const Group = Model.extend( {
    idAttribute : 'name',

    defaults : {
        executedAt : Date.value( null ),
        name       : String,
        tests      : Test.Collection,
        selected   : Test.from( 'tests' ),
        iterations : Integer
    },

    initialize(){
        this.listenTo( this, 'change:selected change:tests', () =>{
            this.tests.whoIsFaster( this.selected );
        } );
    },

    run(){
        this.executedAt = new Date();
        this.tests.each( test => test.run( this.iterations ) );
    },

    save(){}
} );

export const LocalStorage = Model.extend( {
    fetch(){
        if( this.id ){
            const json = localStorage.getItem( this.id );
            json && ( this.set( JSON.parse( json ), { parse : true } ) );
        }
    },

    save( attrs ){
        if( attrs ){
            this.set( attrs );
        }

        if( this.id ){
            localStorage.setItem( this.id, JSON.stringify( this ) );
        }
    }
} );
