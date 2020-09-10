import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
// import * as geo from 'd3/geo';

const Map = props => {

    // const [possibleCountries, setPossibleCountries] = useState(null)
    // const [targetCountries, setTargetCountries] = useState(null)
    // const [possibleCities, setPossibleCities] = useState(null)
    const [targetCities, setTargetCities] = useState(null)
    const [data, setData] = useState(null)

    const d3Container = useRef(null);


    console.log(props)

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

    var time = 0
    var countUp = setInterval(function () {
        time++
        // document.querySelector("h3").innerText = `Time: ${time} seconds`
    }, 1000)

    /* This would be called on initial page load */
    useEffect(() => {
        Promise.all([d3.json("./assets/world.geo.json"), d3.json("./assets/capitals.geojson")])
            .then(data => {
                setData(data);
                console.log(data)
            })
    }, [])


    /* This would be called when store/state data is updated */
    useEffect(() => {
        if (data) {
            var topology = topojson.topology({ foo: data[0], bar: data[1] });

            const countries = topojson.feature(topology, topology.objects.foo).features
            const cities = topojson.feature(topology, topology.objects.bar).features
            // const countries = topojson.feature(data, data.objects.ne_110m_admin_0_countries1).features

            let targetCountries = countries
            console.log(cities)
            let targetCities = cities.filter(city => city.properties.FEATURECLA === "Admin-0 capital" && city.properties.TIMEZONE.includes("Europe"))
            console.log(targetCities)
            // selectCountry()

            let combined = d3.merge([countries, cities])
            console.log(combined)


            svg.selectAll(".country")
                .data(combined) /* binder selectAll till enter() */
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
                    if (d.targetCity && !d.previousTarget) {
                        let index = targetCountries.indexOf(d)
                        d.previousTarget = true

                        targetCountries.splice(index, 1)
                        selectCountry()
                    }
                    d3.select(this).classed("selected", true)
                })

        };
        function selectCountry() {
            if (targetCities.length == 0) {
                document.querySelector("h2").innerText = `Solved it in ${time} seconds!`
                clearInterval(countUp)
                return
            }
            let rand = Math.floor(Math.random() * targetCities.length)
            console.log(targetCities)
            for (let country in targetCities) {
                targetCities[country].targetCity = false
                if (country == rand) {
                    targetCities[country].targetCity = true
                    document.querySelector("h2").innerText = `Click on ${targetCities[country].properties.NAME}`
                }
            }
        }
    }, [data]);

    return (
        <div>
            <h3></h3>
            <h2></h2>
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