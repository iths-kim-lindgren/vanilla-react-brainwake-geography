import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Map from './Map';
import * as WorldMap from './../maps/world.geo.json'
import * as Capitals from './../maps/fewer-capitals.geo.json'

const StartingScreen = props => {

    const [unit, setUnit] = useState("countries")
    const [continent, setContinent] = useState("Africa")
    const [numProblems, setNumProblems] = useState(1)
    const [numbersOption, setNumbersOption] = useState([])

    useEffect(() => {
        let arr = []
        let initCountries = WorldMap.default.features.filter(country => country.properties.continent.includes(continent))
        for (let index in initCountries) {
            arr.push(parseInt(index) + 1)
        }
        setNumbersOption(arr)
    }, [])

    useEffect(() => {
        let arr = []
        let units = []
        if (unit === "countries") {
            units = WorldMap.default.features.filter(country => country.properties.continent.includes(continent))
            console.log(WorldMap)
        } else if (unit === "capitals") {
            console.log(Capitals)
            units = Capitals.default.features.filter(city => city.properties.continent.includes(continent))
        }
        // units = WorldMap.default.features.filter(country => country.properties.continent === continent)
        for (let index in units) {
            arr.push(parseInt(index) + 1)
        }
        setNumbersOption(arr)
        if (arr.length < numProblems) {
            setNumProblems(arr.length)
        }
    }, [continent, unit])
    // DESSA TVÅ OVAN BORDE GÅ ATT SLÅ IHOP!

    return (
        <section>
            <article>
                <button>What?</button>
                <select onChange={e => setUnit(e.currentTarget.value)}>
                    <option value="countries">Countries</option>
                    <option value="capitals">Capitals</option>
                </select>
                <button>Where?</button>
                <select onChange={e => setContinent(e.currentTarget.value)}>
                    <option value="Africa">Africa</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="North America">North America</option>
                    <option value="South America">South America</option>
                    {/* <option value="Middle East">Middle East</option>
                    <option value="Caribbean">Caribbean</option> */}
                    <option value="Oceania">Oceania</option>
                </select>
                <button>How many?</button>
                <select onChange={e => setNumProblems(e.currentTarget.value)}
                    value={numProblems}>
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
                <p>{unit}</p>
                <p>{continent}</p>
                <p>{numProblems}</p>
            </article>
            <Router>
                <Link to="/Map"><button>Begin</button></Link>
                <Switch>
                    <Route path="/Map">
                        <Map unit={unit} continent={continent} numProblems={numProblems}></Map>
                    </Route>
                </Switch>
            </Router>
        </section>
    )
}

export default StartingScreen;

