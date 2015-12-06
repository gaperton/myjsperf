import Nested, { Model } from 'nestedtypes'

window.Nested = Nested;

function median( arr ){
    var sorted = arr.sort(),
        len = sorted.length - 1,
        first = Math.floor( len / 3 ),
        second = Math.ceil( len / 3 * 2 );

    console.log( sorted );

    var representative = sorted.slice( first, second ),
        sum = 0;

    for( var i = 0; i < representative.length; i++ ){
        sum += representative[ i ];
    }

    return sum / representative.length;
}

function emptyTest( n, context ){}

function delay( fun ){
    setTimeout( fun, 0 );
}

function measure( fun, iterations, context ){
    let i;
    const start = window.performance.now();
    for( i = 0; i < iterations; i++ ) emptyTest( i, context );
    const adjustment = window.performance.now();
    for( i = 0; i < iterations; i++ ) fun( i, context );
    const end = window.performance.now();
    return end - adjustment - ( adjustment - start );
}

export const Test = Model.extend( {
    idAttribute : 'name',

    defaults : {
        executedAt : Date.value( null ),
        name       : String,
        time       : Number.value( null ),
        count      : Integer,
        iterations : Integer,
        ops        : Integer,
        faster     : Number.value( null ),
        exception  : Error.value( null ),
        init       : Function.has.toJSON( false ),
        test       : Function.has.toJSON( false ).value( emptyTest )
    },

    _measure( iterations ){
        const context = this.init( iterations ) || {};
        return measure( this.test, iterations, context );
    },

    _adaptive(){
        var measurements = [], time = 0;

        for( var n = 1000, i = 0; i < 10 && time < 1000; n *= 2, i++ ){
            time = this._measure( n );
            measurements.push( Integer( n * 1000 / time ) );
        }

        for( ; i < 20; i++ ){
            measurements.push( Integer( n * 1000 / this._measure( n ) ) );
        }

        console.log( measurements );
        this.ops = median( measurements );
    },

    _fixed( n ){
        var measurements = [], time = 0;

        for( var i = 0; i < 40; i++ ){
            time = this._measure( n );
            measurements.push( Integer( n * 1000 / time ) );
        }

        this.ops = median( measurements );
    },

    run( a_iterations ){
        this.transaction( () =>{
            this.exception  = null;
            this.executedAt = new Date();

            try{
                var iterations = this.iterations || a_iterations;
                if( iterations ){
                    this._fixed( iterations );
                }
                else{
                    this._adaptive();
                }

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
