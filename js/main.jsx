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
        <GroupHeader group={ group } />
        { group.tests.map( test => <CTest key={ test.cid } test={ test } selected={ group.getLink( 'selected' ) } /> )}
    </div>
);

const GroupHeader = ({ group }) => (
    <div className="header-col" onClick={ () => group.run() }>
        <div>{ group.name }</div>
        <div> { group.iterations } </div>
        <div> <label>Executed At:</label> { group.executedAt ? group.executedAt.toString() : '-' }</div>
        <div> <label>Total time:</label> { group.tests.time }</div>
        <div> <label>Avg. ops:</label> { group.tests.ops  }</div>
    </div>
);

const CTest = ({ test, selected }) => {
    const classes = cx({
            'test' : true,
            'exception' : test.exception,
            'faster' : test.faster > 1.2,
            'slower' : test.faster < 0.80,
            'selected' : test === selected.value
    });

    const howFast = test.faster > 1.05 ? test.faster.toFixed( 2 ) + 'x faster' : (
        test.faster < 0.95 ? ( 1 / test.faster ).toFixed( 2 ) + 'x slower ' : 'same shit'
    );

    return (
        <div className={ classes } onClick={ () => selected.set( test ) }>
            <div>{ test.name }</div>
            <div onClick={ () => test.run() }>
                <div>{ ( test.time / 1000 ).toFixed( 1 ) + ' s'}</div>
                <div>{ Integer( test.ops / 1000 ) + ' K op/s' }</div>
                <div>{ howFast } </div>
            </div>
        </div>
    );
};

ReactDOM.render( <App />, document.getElementById( 'app-mount-root' ) );

