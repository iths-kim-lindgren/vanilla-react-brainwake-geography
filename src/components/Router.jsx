import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import StartingScreen from './StartingScreen'
import Map from './Map'
import FinishScreen from './FinishScreen'

const RouterComp = props => {
    return (
        <Router>
            <Switch>
                <Route path="/Map">
                    <Map></Map>
                </Route>
                <Route path="/FinishScreen">
                    <FinishScreen></FinishScreen>
                </Route>
                <Route path="/">
                    <StartingScreen></StartingScreen>
                    {/* <Map></Map> */}
                </Route>
            </Switch>
        </Router>
    )
}



export default RouterComp;