import * as d3 from d3

(async function () {
    var margin = { top: 20, left: 50, right: 50, bottom: 50 },
        height = 3500 - margin.top - margin.bottom,
        width = 5000 - margin.left - margin.right;
        

    var svg = d3.select("#map")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // var margin = { top: 2000, left: 50, right: 50, bottom: 50 },
        // height = 3500
        // width = 5000
        

        // var svg = d3.select("#map")
        //     .append("svg")
        //     .attr("height", height)
        //     .attr("width", width)
        //     .append("g")
        //     .attr("transform", "translate(" + 50 + "," + 50 + ")");

    // PROJECTION
    var projection = d3.geoEqualEarth()
        .translate([width / 2.5, height / 1.5])
        .scale(1000)
    // center()

    // geocentroid

    console.log(d3)

    // CREATE PATH

    var path = d3.geoPath()
        .projection(projection)

        var time = 0
        var countUp = setInterval(function (){
            time++
            document.querySelector("h3").innerText = `Time: ${time} seconds`
        }, 1000)

    const data = await d3.json("world.geo.json")

    var topology = topojson.topology({ foo: data });

    const countries = topojson.feature(topology, topology.objects.foo).features
    // const countries = topojson.feature(data, data.objects.ne_110m_admin_0_countries1).features
    console.log(countries)
    let targetCountries = countries
    selectCountry()


    svg.selectAll(".country")
        .data(countries) /* binder selectAll till enter() */
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
                if (d.targetCountry && !d.previousTarget){
                    let index = targetCountries.indexOf(d)
                    d.previousTarget = true

                    targetCountries.splice(index, 1)
                    selectCountry()
                }
            d3.select(this).classed("selected", true)
        })
        
        function selectCountry() {
            if (targetCountries.length == 0) {
                document.querySelector("h2").innerText = `Solved it in ${time} seconds!`
                clearInterval(countUp)
           return
        }
        let rand = Math.floor(Math.random() * targetCountries.length)
        console.log(targetCountries)
        for (let country in targetCountries) {
            targetCountries[country].targetCountry = false
            if (country == rand) {
                targetCountries[country].targetCountry = true
                document.querySelector("h2").innerText = `Click on ${targetCountries[country].properties.admin}`
            }
        }
    }
})()