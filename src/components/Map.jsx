import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
// import * as geo from 'd3/geo';

const Map = props => {

    const [targetCountryText, setTargetCountryText] = useState("")
    const [data, setData] = useState(null)
    const [time, setTime] = useState(0)
    const [solved, setSolved] = useState(false)

    const d3Container = useRef(null);

    var margin = { top: 20, left: 50, right: 50, bottom: 50 },
        height = 4000 - margin.top - margin.bottom,
        width = 2000 - margin.left - margin.right;

    var svg = d3.select(d3Container.current)
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // PROJECTION
    var projection = d3.geoMercator()
        .translate([width / 5.5, height / 5.5])
        .scale(500)
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
        Promise.all([d3.json("./assets/world.geo.json"), d3.json("./assets/capitals.geojson")])
            .then(data => {
                setData(data);
            })
    }, [])

    useEffect(() => {
        if (data) {

            // RENDER WORLD MAP
            if (props.unit == "countries"){
                var topology = topojson.topology({foo: data[0]});
                // var countries = topojson.feature(data, data.objects.world.geo.json).features
                var countries = topojson.feature(topology, topology.objects.foo).features
                setData(countries)
                console.log("countries", countries)
                console.log("data", data)

            } else if (props.unit === "cities"){
                var topology = topojson.topology({ foo: data[0], bar: data[1] });
                var countries = topojson.feature(topology, topology.objects.foo).features
                var cities = topojson.feature(topology, topology.objects.bar).features
                var combined = d3.merge([countries, cities])
                setData(combined)
            }

            // INIT SELECTION LOGIC
            console.log("countries", countries)
            let targetCountries = countries.filter(country => country.properties.continent === props.continent) /* to be filtered */
            
            let randomNumberArray = []
            for (let i = 0; i<parseInt(props.numProblems); i++){

                // deklarera en rand, pusha till listan om den inte redan finns i listan
                let rand = Math.floor(Math.random() * targetCountries.length);
                if (!!!randomNumberArray.includes(rand)){
                    randomNumberArray.push(rand)
                } else {
                    // om den redan finns i listan, ändra dess värde tills den har ett värde som inte finns i listan
                    do {
                        rand = Math.floor(Math.random() * targetCountries.length);
                    } while (randomNumberArray.includes(rand));
                    randomNumberArray.push(rand)
                } 
            }
            // uppdatera targetCountries så att bara de som motsvarar ett index i listan blir kvar
            let placeholderCountryArr = []
            for (let num of randomNumberArray){
                placeholderCountryArr.push(targetCountries[num])
            }
            targetCountries = placeholderCountryArr
            
            if (props.unit === "cities"){
                var targetCities = cities.filter(city => city.properties.FEATURECLA === "Admin-0 capital" && city.properties.TIMEZONE.includes("Europe"))
            }
            // console.log(targetCities)
            selectCountry(targetCountries)

            svg.selectAll(".country")
                .data(data) /* binder selectAll till enter() */
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
                    if (d.currentTarget.__data__.targetCountry && !d.previousTarget) {
                        let index = targetCountries.indexOf(d.currentTarget.__data__)
                        d.currentTarget.__data__.previousTarget = true

                        targetCountries.splice(index, 1)
                        selectCountry(targetCountries)
                    }
                    d3.select(this).classed("selected", true)
                })

        };
        function selectCountry(targetCountries) {
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
                    setTargetCountryText(`Click on ${targetCountries[country].properties.admin}`)
                }
            }
        }
    }, [data]);

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