import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Map from './Map';

const StartingScreen = props => {

    const [unit, setUnit] = useState("countries")
    const [continent, setContinent] = useState("africa")
    const [numProblems, setNumProblems] = useState(1)

    const numbersOption = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    useEffect(() => {
        // setUnit(unit)
        // setContinent(continent)
        // setNumProblems(numProblems)
        console.log("useEffect har körts")
    }, [])

    return (
        <section>
            <article>
                <select onChange={e => setUnit(e.currentTarget.value)}>
                    <option value="countries">Countries</option>
                    <option value="capitals">Capitals</option>
                </select>
                <select onChange={e => setContinent(e.currentTarget.value)}>
                    <option value="africa">Africa</option>
                    <option value="asia">Asia</option>
                    <option value="europe">Europe</option>
                    <option value="north-america">North America</option>
                    <option value="south-america">South America</option>
                </select>
                <select onChange={e => setNumProblems(e.currentTarget.value)}>
                    {numbersOption.map(num => (
                        <option
                        key={num}
                        value={num}
                        >
                            {num}
                        </option>
                    ))}
                </select>
            </article>
            <article>
                <button>Where?</button>
                <p>{unit}</p>
                <p>{continent}</p>
                <p>{numProblems}</p>
            </article>
            <Router>
                <Link to="/Map"><button>Begin</button></Link>
                <Switch>
                    <Route path="/Map">
                        <Map></Map>
                        <Map unit={unit} continent={continent} numProblems={numProblems}></Map>
                    </Route>
                </Switch>
            </Router>
        </section>
    )
}

export default StartingScreen;