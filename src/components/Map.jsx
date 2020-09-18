import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
// import * as geo from 'd3/geo';

const Map = props => {

    const [files, setFiles] = useState(null)
    const [actualData, setActualData] = useState(null)
    const [countriesOrCities, setCountriesOrCities] = useState(null)
    const [map, setMap] = useState(null)
    const [targetUnits, setTargetUnits] = useState(null)
    const [currentTargetUnit, setCurrentTargetUnit] = useState(null)
    const [previousTargets, setPreviousTargets] = useState(null)
    const [targetUnitText, setTargetUnitText] = useState("")
    const [time, setTime] = useState(0)
    const [solved, setSolved] = useState(false)
    const [clickedCountry, setClickedCountry] = useState(null)
    const [rightOrWrongText, setRightOrWrongText] = useState("")
    // const [wrongGuesses, setWrongGuesses] = useState(0)

    const d3Container = useRef(null);

    var margin = { top: 20, left: 50, right: 50, bottom: 50 },
        height = 4000 - margin.top - margin.bottom,
        width = 5000 - margin.left - margin.right;

    var svg = d3.select(d3Container.current)
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // PROJECTION
    var projection = d3.geoMercator()
        // var projection = d3.geoEqualEarth() bättre men städerna blir väldigt stora
        .translate([width / 5.5, height / 5.5])
        .scale(300)
    // .center()

    // geocentroid

    // console.log(d3)

    // CREATE PATH
    var path = d3.geoPath()
        .projection(projection)

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(time => time + 1)
        }, 1000);
        return () => clearInterval(interval);
    }, [solved]);

    useEffect(() => {
        Promise.all([d3.json("./assets/world.geo.json"), d3.json("./assets/fewer-capitals.geojson")])
            .then(files => {
                setFiles(files);
            })
    }, [])

    useEffect(() => {
        if (!files) return
        console.log(props)

        // RENDER COUNTRIES AND CITIES, OR JUST COUNTRIES
        if (props.unit == "countries") {
            let topology = topojson.topology({ foo: files[0] });
            setActualData(topojson.feature(topology, topology.objects.foo).features)

        } else if (props.unit === "capitals") {
            let topology = topojson.topology({ foo: files[0], bar: files[1] });
            let countries = topojson.feature(topology, topology.objects.foo).features
            console.log(topojson.feature(topology, topology.objects.bar).features[0].properties.continent)
            let cities = topology.objects.bar.geometries.filter(feature => feature.properties.continent.includes(props.continent))
            console.log(cities)
            // let cities = topojson.feature(topology, topology.objects.bar).features
            setActualData(d3.merge([countries, cities]))
        }
    }, [files])

    useEffect(() => {
        // SELECT COUNTRIES OR CITIES AS TARGETS
        if (!actualData) return
        console.log(actualData)
        if (actualData.find(el => el.properties.city)) {
            let cities = actualData.filter(function (city) {
                if (city.properties.city && city.properties.continent) {
                    return city.properties.continent.includes(props.continent)
                }
            })
            // cities = cities.filter = (city => city.properties.continent === props.continent)
            console.log(cities)
            setCountriesOrCities(cities)
        } else {
            let countries = actualData.filter(country => country.properties.continent.includes(props.continent)) /* to be filtered */
            setCountriesOrCities(countries)
        }
    }, [actualData])

    useEffect(() => {
        if (!countriesOrCities) return
        // SELECT SPECIFIC COUNTRIES OR CITIES TO BE TARGETED

        let randomNumberArray = []
        for (let i = 0; i < parseInt(props.numProblems); i++) {

            // deklarera en rand, pusha till listan om den inte redan finns i listan
            let rand = Math.floor(Math.random() * countriesOrCities.length);
            if (!!!randomNumberArray.includes(rand)) {
                randomNumberArray.push(rand)
            } else {
                // om den redan finns i listan, ändra dess värde tills den har ett värde som inte finns i listan
                do {
                    rand = Math.floor(Math.random() * countriesOrCities.length);
                } while (randomNumberArray.includes(rand));
                randomNumberArray.push(rand)
            }
        }
        // uppdatera targetUnits så att bara de som motsvarar ett index i listan blir kvar
        let placeholderArr = []
        for (let num of randomNumberArray) {
            placeholderArr.push(countriesOrCities[num])
        }
        setTargetUnits(placeholderArr)
    }, [countriesOrCities])

    useEffect(() => {
        if (!targetUnits) return
        console.log(targetUnits)
        if (targetUnits.length === 0) {
            setSolved(true)
            return
        }
        let rand = Math.floor(Math.random() * targetUnits.length)
        console.log(targetUnits)
        for (let unit in targetUnits) {
            // targetUnits[unit].target = false
            if (+unit === rand) {
                // setTargetUnits(targetUnits[unit]).target = true
                setCurrentTargetUnit(targetUnits[unit])
                if (targetUnits[unit].properties.admin) {
                    setTargetUnitText(`Click on ${targetUnits[unit].properties.admin}`)
                } else { setTargetUnitText(`Click on ${targetUnits[unit].properties.city}`) }
            }
        }
    }, [targetUnits])

    useEffect(() => {
        if (!actualData) return

        setMap(svg.selectAll(".unit")
            .data(actualData) /* binder selectAll till enter() */
            .enter().append("path")
            .attr("class", "unit")
            .attr("d", path)
            .on("mouseover", function (d) {
                d3.select(this).classed("targeted", true)
            })
            .on("mouseout", function (d) {
                d3.select(this).classed("targeted", false)
            })
        )
    }, [actualData])

    useEffect(() => {
        if (!currentTargetUnit) return

        let test = d3.selectAll(".unit")
        // var list = test._groups[0].childNodes;
        // console.log(list)

        // Using for..of 
        // for (var value of list.values()) {
        //     console.log(value);
        // }
        // console.log(test)
        // console.log(test._groups.__proto__.entries())
        // console.log(test._groups[0])
        // console.log(test._groups[0].item(0).path)
        // console.log(test._groups[0][0]).ariaAtomic
        // let test2 = Array.from(test._groups[0])
        // console.log(test2)
        // console.log(test2[0])
        test.filter(unit => unit.__data__ === currentTargetUnit)
        // for the "d.currentTarget__data__" that matches currentTargetUnit, set up a new useState var
        // map.forEach(path => console.log(path))
        d3.selectAll(".unit").
            on("click", function (d) {
                d3.selectAll(".unit")
                    .classed("wrong", false)
                    
                    if (d.currentTarget.__data__ === currentTargetUnit) {
                        d3.select(this).classed("previousTarget", true)
                        handleRightAnswer()
                    } else { 
                        d3.select(this).classed("wrong", true)
                        if (d.currentTarget.__data__.properties.city) {
                            console.log(d.currentTarget.__data__.properties.city)
                            setRightOrWrongText(`You clicked on ${d.currentTarget.__data__.properties.city} (${d.currentTarget.__data__.properties.country})`)
                        } else { 
                            console.log(d.currentTarget.__data__.properties.admin)
                            setRightOrWrongText(`You clicked on ${d.currentTarget.__data__.properties.admin}`)
                        }
                }
            })
    }, [currentTargetUnit])


    function handleRightAnswer() {
        // console.log(d)
        let index = targetUnits.indexOf(currentTargetUnit)
        console.log("d3", d3)
        d3.select(this)

        console.log("handleAnswer", targetUnits)
        let updatedArr = []
        for (let unit in targetUnits) {
            if (+unit !== index) {
                updatedArr.push(targetUnits[unit])
            }
        }
        console.log(updatedArr)
        setRightOrWrongText(`Correct!`)
        setTargetUnits(updatedArr)

        console.log("handleAnswer after setTargetUnits", targetUnits)

    }

    // function selectUnit(targetUnits) {





    return (
        <div>
            <article className="fixed">
                <h4>{targetUnitText}</h4>
                <h4>{(solved ? `Solved it in ${time} seconds!` : time)}</h4>
                <button onClick={() => handleRightAnswer(clickedCountry, targetUnits)}>Teach me</button>
                <h4>{rightOrWrongText}</h4>
            </article>
            <svg
                className="d3-component"
                width={4000}
                height={2000}
                ref={d3Container}
            />
        </div>
    )
}

export default Map;