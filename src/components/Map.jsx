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
    const [targetUnitText, setTargetUnitText] = useState("")
    const [simulatedClick, setSimulatedClick] = useState(false)
    const [time, setTime] = useState(0)
    const [solved, setSolved] = useState(false)
    const [rightOrWrongText, setRightOrWrongText] = useState("")
    const [wrongGuesses, setWrongGuesses] = useState(0)
    const [totalGuesses, setTotalGuesses] = useState(0)

    const d3Container = useRef(null);
    const currentTargetPath = useRef(null)

    var margin = { top: 20, left: 50, right: 50, bottom: 50 },
        // height = 1200 - margin.top - margin.bottom,
        // width = 1800 - margin.left - margin.right;
        height = 2400 - margin.top - margin.bottom,
        width = 3600 - margin.left - margin.right;

    var svg = d3.select(d3Container.current)
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // PROJECTION
    // var projection = d3.geoMercator()
    var projection = d3.geoEqualEarth()
        .translate([width / 5.5, height / 5.5])
        // .scale(150)
        .scale(250)
    // .center()

    // geocentroid




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
        // SET VIEW DEPENDING ON CONTINENT
        switch (props.continent) {
            case "Africa":
                window.scroll(100, 250)
                break;
            case "Asia":
                window.scroll(250, 150)
                break;
            case "Europe":
                window.scroll(100, 50)
                break;
            case "North America":
                window.scroll(0, 50)
                break;
        }
    }, [])

    useEffect(() => {
        Promise.all([d3.json("./assets/world.geo.json"), d3.json("./assets/fewer-capitals.geo.json")])
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
            setTargetUnitText("")
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

        // for the "d.currentTarget__data__" that matches currentTargetUnit, set up a new useState var
        // map.forEach(path => console.log(path))
        d3.selectAll(".unit").
            on("click", function (d) {
                d3.selectAll(".unit")
                    .classed("wrong", false)

                if (d.currentTarget.__data__ === currentTargetUnit) {
                    handleRightAnswerOrCheat()
                } else {
                    setTotalGuesses(totalGuesses + 1)
                    setWrongGuesses(wrongGuesses + 1)
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

    function setRightAnswerOrCheatColor(node){
        if (simulatedClick) {
            // d3.select(nodelist._groups[0].item(i))
            // .transition()
            // .style("fill", "red")
            // .transition()
            // .delay(1500)
            // .style("fill", "#333333")
            d3.select(node).classed("wrong", true)
        } else {
            d3.select(node).classed("previousTarget", true)
        }
    }

    function handleRightAnswerOrCheat() {

        let nodelist = d3.selectAll(".unit")
        for (let i = 0; i < nodelist._groups[0].length; i++) {
            if (props.unit === "capitals") {
                if (nodelist._groups[0].item(i).__data__.properties.city === currentTargetUnit.properties.city) {
                    setRightAnswerOrCheatColor(nodelist._groups[0].item(i))
                }
            } else if (props.unit === "countries") {
                if (nodelist._groups[0].item(i).__data__.properties.filename === currentTargetUnit.properties.filename) {
                    setRightAnswerOrCheatColor(nodelist._groups[0].item(i))
                }
            }
        }

        if (simulatedClick) {
            // POSSIBLY ZOOM IN ON CORRECT COUNTRY IN THE FUTURE
            // let surroundingRect = nodelist._groups[0][pathIndex].getBoundingClientRect();
            // let x = surroundingRect.right - ((surroundingRect.right - surroundingRect.width) / 2);
            // let y = surroundingRect.bottom - ((surroundingRect.bottom - surroundingRect.height) / 2);
            // console.log(nodelist._groups[0][pathIndex])
            // window.scroll(x, y)
            setWrongGuesses(wrongGuesses + 1)
            if (props.unit === "capitals") {
                setRightOrWrongText(`${currentTargetUnit.properties.city} is here!`)
            } else if (props.unit === "countries") {
                setRightOrWrongText(`${currentTargetUnit.properties.admin} is here!`)
            }
        } else {
            setRightOrWrongText(`Correct!`)
        }

        
        let index = targetUnits.indexOf(currentTargetUnit)

        let updatedArr = []
        for (let unit in targetUnits) {
            if (+unit !== index) {
                updatedArr.push(targetUnits[unit])
            }
        }
        setTotalGuesses(totalGuesses + 1)
        setSimulatedClick(false)
        setTargetUnits(updatedArr)
    }

    useEffect(() => {
        if (simulatedClick === false) return

        handleRightAnswerOrCheat()
    }, [simulatedClick])

    return (
        <div>
            <article className="fixed">
                <h4>{targetUnitText}</h4>
                <h4>{(solved ? `You got ${(totalGuesses - wrongGuesses)}/${props.numProblems} correct in ${time} seconds!` : time)}</h4>
                {solved ? null :
                    <button onClick={() => setSimulatedClick(true)}>Teach me</button>
                }
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