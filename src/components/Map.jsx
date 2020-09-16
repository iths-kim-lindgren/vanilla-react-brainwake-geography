import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
// import * as geo from 'd3/geo';

const Map = props => {

    const [targetCountryText, setTargetCountryText] = useState("")
    const [files, setFiles] = useState(null)
    const [time, setTime] = useState(0)
    const [solved, setSolved] = useState(false)
    const [actualData, setActualData] = useState(null)
    const [countriesOrCities, setCountriesOrCities] = useState(null)

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
        if (files) {
            console.log(props)

            // RENDER COUNTRIES AND CITIES, OR JUST COUNTRIES
            if (props.unit == "countries") {
                let topology = topojson.topology({ foo: files[0] });
                setActualData(topojson.feature(topology, topology.objects.foo).features)

            } else if (props.unit === "capitals") {
                let topology = topojson.topology({ foo: files[0], bar: files[1] });
                let countries = topojson.feature(topology, topology.objects.foo).features
                let cities = topojson.feature(topology, topology.objects.bar).features
                setActualData(d3.merge([countries, cities]))
            }
        }

    }, [files])

    useEffect(() => {
        // SELECT COUNTRIES OR CITIES AS TARGETS
        if (actualData){
            console.log(actualData)
            if (actualData.length > 250){
                let cities = actualData.filter(city => city.properties.city)
                console.log(cities)
                // cities = cities.filter = (city => city.properties.continent === props.continent)
                setCountriesOrCities(cities)
            } else {
                let countries = actualData.filter(country => country.properties.continent.includes(props.continent)) /* to be filtered */
                setCountriesOrCities(countries)
            }
        }
    }, [actualData])

    useEffect(() => {
        if (countriesOrCities){
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
            let placeholderCountryArr = []
            for (let num of randomNumberArray) {
                placeholderCountryArr.push(countriesOrCities[num])
            }
            let targetUnits = placeholderCountryArr
    
            if (props.unit === "cities") {
                // var targetCities = cities.filter(city => city.properties.FEATURECLA === "Admin-0 capital" && city.properties.TIMEZONE.includes("Europe"))
            }
            // console.log(targetCities)
            selectCountry(targetUnits)
    
            svg.selectAll(".country")
                .data(actualData) /* binder selectAll till enter() */
                .enter().append("path")
                .attr("class", "country")
                .attr("d", path)
                .on("mouseover", function (d) {
                    d3.select(this).classed("targeted", true)
                })
                .on("mouseout", function (d) {
                    d3.select(this).classed("targeted", false)
                })
                .on("click", function (d) {
                    d3.selectAll(".country")
                        .classed("selected", false)
                        if (d.currentTarget.__data__.properties.city){
                            console.log(d.currentTarget.__data__.properties.city)
                        } else { console.log(d.currentTarget.__data__.properties.admin)}
                    if (d.currentTarget.__data__.targetCountry && !d.currentTarget.__data__.previousTarget) { 
                        let index = targetUnits.indexOf(d.currentTarget.__data__)
                        d.currentTarget.__data__.previousTarget = true
                        d3.select(d.currentTarget).classed("previousTarget", true)
    
                        targetUnits.splice(index, 1)
                        selectCountry(targetUnits)
                    }
                    d3.select(this).classed("selected", true)
                })
        }

        function selectCountry(targetCountries) {
            console.log(targetCountries)
            if (targetCountries.length === 0) {
                setSolved(true)
                return
            }
            let rand = Math.floor(Math.random() * targetCountries.length)
            console.log(targetCountries)
            for (let country in targetCountries) {
                targetCountries[country].targetCountry = false
                if (+country === rand) {
                    targetCountries[country].targetCountry = true
                    if (targetCountries[country].properties.admin){
                        setTargetCountryText(`Click on ${targetCountries[country].properties.admin}`)
                    } else { setTargetCountryText(`Click on ${targetCountries[country].properties.city}`) }
                }
            }
        }
    }, [countriesOrCities])



    return (
        <div>
            <article className="fixed">
                <h3>{targetCountryText}</h3>
                <h2>{(solved ? `Solved it in ${time} seconds!` : time)}</h2>
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