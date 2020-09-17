import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Map from './Map';
import * as WorldMap from './../maps/world.geo.json'
import * as Capitals from './../maps/fewer-capitals.geojson'

const StartingScreen = props => {

    const [unit, setUnit] = useState("countries")
    const [continent, setContinent] = useState("Africa")
    const [numProblems, setNumProblems] = useState(1)
    const [numbersOption, setNumbersOption] = useState([])

    useEffect(() => {
        let arr = []
        let initCountries = WorldMap.default.features.filter(country => country.properties.continent === continent)
        for (let index in initCountries){
            arr.push(parseInt(index) + 1)
        }
        setNumbersOption(arr)
    }, [])

    const handleNumProblems = (continent) => {
        let arr = []
        let units = []
        /* console.log(WorldMap) console.log(Capitals) VARFÖR SKILLNADEN MELLAN DESSA LOGGAR */
        // if (unit === "countries"){
        //     units = WorldMap.default.features.filter(country => country.properties.continent === continent)
        // } else if (unit ==="capitals") {
        //     console.log(Capitals)
        //     units = Capitals.default.features.filter(city => city.properties.continent === continent)
        // }
        units = WorldMap.default.features.filter(country => country.properties.continent === continent)
        for (let index in units){
            arr.push(parseInt(index) + 1)
        }
        setNumbersOption(arr)
    }
    // DESSA TVÅ OVAN BORDE GÅ ATT SLÅ IHOP!

    return (
        <section>
            <article>
                <select onChange={e => setUnit(e.currentTarget.value)}>
                    <option value="countries">Countries</option>
                    <option value="capitals">Capitals</option>
                </select>
                <select onChange={e => {setContinent(e.currentTarget.value); handleNumProblems(e.currentTarget.value)}}>
                    <option value="Africa">Africa</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="North America">North America</option>
                    <option value="South America">South America</option>
                    <option value="Oceania">Oceania</option>
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
                        <Map unit={unit} continent={continent} numProblems={numProblems}></Map>
                    </Route>
                </Switch>
            </Router>
        </section>
    )
}

export default StartingScreen;