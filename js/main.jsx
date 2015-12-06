import 'css/app.css'
import React from 'nestedreact'
import ReactDOM from 'react-dom'
import cx from 'classnames'

import { Group, Test, LocalStorage } from './model.js'

const App = React.createClass( {
    Model : LocalStorage,

    attributes : {
        id     : 'MyJsPerf',
        groups : Group.Collection
    },

    componentWillMount(){
        window.groups = this.state.groups;
        /* this.state.fetch();
         window.onunload = () => this.state.save(); */
    },

    render(){
        let { groups } = this.state;

        return (
            <div className="viewport">
                { groups.map( group => <CGroup key={ group.cid } group={ group }/> )}
            </div>
        );
    }
} );

const CGroup = ( { group } ) => (
    <div className="group">
        <div className="group-header" onClick={ () => group.run() }>
            <span>{ group.name }</span>
            { group.iterations && <span> ({group.iterations} iterations)</span> }
        </div>
        <div className="groupBody">
            { group.tests.map( test => <CTest key={ test.cid }
                                              test={ test }
                                              selected={ group.getLink( 'selected' ) }
                                              iterations={ group.iterations }
                                        />
                )}
        </div>
    </div>
);

const CTest = ({ test, selected, iterations }) => {
    const iAmSelected = test === selected.value,
          compare = test.count && selected.value,
        classes = cx({
            'test' : true,
            'exception' : test.exception,
            'faster' : compare && test.faster > 1.5,
            'slower' : compare && test.faster < 0.67,
            'selected' : iAmSelected
        });

    const howFast = test.faster > 1.05 ? test.faster.toFixed( 1 ) + 'x faster' : (
        test.faster < 0.95 ? ( 1 / test.faster ).toFixed( 1 ) + 'x slower ' : 'same shit'
    );

    return (
        <div className={ classes } onClick={ () => selected.set( test ) }>
            <div>{ test.name }</div>

            <div>Time: { ( test.time / 1000 ).toFixed( 3 ) + ' s'}</div>
            <div>Count: { test.count}</div>
            <div>Kops: { Integer( test.ops / 1000 ) }</div>
            { compare && !iAmSelected ?
                <div>{ howFast }</div> :
                <button onClick={ () => test.run( iterations )} >Run</button>
            }

        </div>
    );
};

ReactDOM.render( <App />, document.getElementById( 'app-mount-root' ) );

