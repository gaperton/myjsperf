
function median( arr ){
    var sorted = arr.sort(),
        len = sorted.length - 1,
        first = Math.floor( len / 2 ),
        second = Math.ceil( len / 2 );

    return ( sorted[ first ] + sorted[ second ] ) / 2;
}