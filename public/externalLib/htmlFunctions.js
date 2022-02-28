var url = window.location.pathname;
var page = url.split("/").pop();

function clearDiv(divID = '', canvasID = '') {
    document.getElementById(divID).innerHTML = "";
    var canvas = document.createElement('canvas');
    div = document.getElementById(divID);
    canvas.id     = canvasID;
    div.appendChild(canvas)
    document.getElementById(`${canvasID}`).classList.add('all_plots');
    // console.log("Cleared")
}

function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;
    
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function plotMSOA(ltlaName = "", partial_ID= "") {
    let LTLA_df = d3.csv("../Data/0_Combined_LTLA_Data.csv") 
    let MSOA_df = d3.csv("../Data/0_CombinedMSOA_Rates.csv")
    LTLA_df.then((result) => {
        let LTLA_df = d3.nest()
            .key(function(d) { return d.ltla; })
            .map(result);
        // console.log(LTLA_df)
        let countyLTLA = LTLA_df["$" + ltlaName]
        // console.log(countyLTLA)
        let ltlaData = []
        let ltlaLabels = []
        countyLTLA.forEach(row => {
            ltlaData.push(row.rate)
            ltlaLabels.push(row.date)
        });
        ltlaData = ltlaData.reverse()
        ltlaLabels = ltlaLabels.reverse()
        
        // get MSOA
        var msoaSelect = document.getElementById(`${partial_ID}_selectMSOA`);
        var msoaValue = msoaSelect.options[msoaSelect.selectedIndex].value;
        // console.log(msoaValue);
        
        MSOA_df.then((result) => {
            let MSOA_df = d3.nest()
                .key(function(d) { return d.areaName; })
                .map(result);

            let selectedMSOA = MSOA_df["$" + msoaValue]
            // console.log(selectedMSOA)
            let msoaData = []
            let msoaLabels = []

            selectedMSOA.forEach(row => {
                msoaData.push(row.newCasesBySpecimenDateRollingRate)
                msoaLabels.push(row.date)
            });
            msoaLabels = msoaLabels.reverse()
            // console.log(msoaLabels)
            msoaData = msoaData.reverse()
            // console.log(msoaData)

            let ltlaData_Struct = []
            for (let i = 0; i < ltlaData.length; i++) {
                ltlaStruct_row = { x: `${ltlaLabels[i]}`, y: `${ltlaData[i]}` }
                ltlaData_Struct.push(ltlaStruct_row)
            }
            let msoaData_Struct = []
            for (let i = 0; i < msoaData.length; i++) {
                msoaStruct_row = { x: `${msoaLabels[i]}`, y: `${msoaData[i]}` }
                msoaData_Struct.push(msoaStruct_row)
            }
            // console.log(ltlaData_Struct)
            // console.log(msoaData_Struct)
            var s1 = {
                label: `${ltlaName}`,
                backgroundColor: 'rgba(38, 161, 152, 0.0)',
                borderColor:  'rgba(38, 161, 152, 0.85)',
                data: ltlaData_Struct
            };

            var s2 = {
                label: `${msoaValue}`,
                backgroundColor: 'rgba(0, 0, 0,0.0)',
                borderColor: 'rgba(0, 0, 0,0.5)',
                data: msoaData_Struct,
                tension: 0.2
            };
            // maxY = d3.max(result, function(d) { return +d.rate;} );
            let ratesChart = new Chart(document.getElementById(`${partial_ID}_plot`), {
                type: 'line',
                data: { datasets: [s1, s2] },
                options: {
                    scales: {
                        xAxes: [{
                            type: 'time'
                    }]
                },
                title: {
                    display: true,
                    text: "Case Rates/100,000 people",
                },
                elements: {
                    point: {
                        radius: 0
                    }
                },
                hover: {
                    mode: 'nearest',
                    intersect: false
                },
                tooltips: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        });
    }).catch((err) => {
        // console.log("MSOA Error" + err)
    }).catch((err) => {
        // console.log("LTLA/Overall Error" + err)
    });
})
}

function plot_deaths(ltla_name = "", ID = "") {
    const deaths_df = d3.csv("../Data/0_Combined_Deaths_Data.csv") 
    // console.log(deaths_df)
    deaths_df.then((result) => {         
        let nested_data = d3.nest()
        .key(function(d) { return d.ltla; })
        .map(result);
        section = "$" + ltla_name
        nested_data = nested_data[section]
        // console.log(nested_data)
        // Update date
        let update = nested_data[0].date
        update = new Date(update).toDateString()
        let latest_date = update
        update = `Most recent update: ${update}`
        // console.log(`#get${ID}_updatedate`)
        document.querySelector(`#get${ID}_updatedate`).innerHTML = update;
        // Daily
        let daily = nested_data[0].deaths - nested_data[1].deaths
        document.querySelector(`#${ID}_dailydeaths`).innerHTML = daily;
        // Weekly sum
        const weeklySum = nested_data[0].deaths - nested_data[6].deaths
        document.querySelector(`#Insert_${ID}_weeklysum`).innerHTML = weeklySum
        
        // let priorWeeklySum = nested_data[7].deaths - nested_data[13].deaths
        // console.log(priorWeeklySum)
        // let weeklyChange = Math.round((weeklySum - priorWeeklySum) * 10)/10
        // let percentChange = Math.round(((Math.abs(weeklyChange)/weeklySum) * 100) * 10)/10
        // let sign = Math.sign(weeklyChange)
        // if (sign > 0) {
        //     let change = `+${weeklyChange}`
        //     document.querySelector(`#Insert_${ID}_weeklysum`).innerHTML = `${weeklySum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        // } else if (sign < 0) {
        //     let change = weeklyChange
        //     document.querySelector(`#Insert_${ID}_weeklysum`).innerHTML = `${weeklySum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        // } else {
        //     let change = weeklyChange
        //     document.querySelector(`#Insert_${ID}_weeklysum`).innerHTML = `${weeklySum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        // }

        let previousWeekStart = nested_data[6].date
        previousWeekStart = new Date(previousWeekStart).toDateString()
        const week = `${previousWeekStart} to ${latest_date}`
        document.querySelector(`#Insert_${ID}_Week_Duration`).innerHTML = week;
        //  totals
        let total = nested_data[0].deaths
        // console.log(total)
        document.querySelector(`#Insert_${ID}_Total`).innerHTML = total;
        //  Plotting code
        let data = []
        let labels = []
        for (let i = 0; i < nested_data.length; i++) {
            data.push(nested_data[i].deaths);
            labels.push(nested_data[i].date);
        }
        data = data.reverse()
        // data = data.slice(400)
        labels = labels.reverse()
        // labels = labels.slice(400)
        var maxY = d3.max(result, function(d) { return +d.deaths;} ); 
        let options = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Cumulative deaths in ${ltla_name}`,
                        data: data,
                        fill: true,
                        borderColor:  'rgba(38, 161, 152, 0.65)',
                        responsive: true,
                        tension: 1
                    }],
                },
                options: {
                    scales: {
                            yAxes: [{
                                display: true,
                                ticks: {
                                    suggestedMin: 0,
                                    suggestedMax: maxY,
                                }
                            }]},
                    elements: {
                        point: {
                            radius: 0
                        }
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: false
                    },
                    tooltips: {
                        mode: 'nearest',
                        intersect: false
                    }
                }
            };
            let deathsChart = new Chart(document.getElementById(`${ID}_plot`), options);
        })
}

function plot_hosp(trust_name = "", plot_name = "", plot_id = "", partial_id = "") {
    const hosp_df = d3.csv("../Data/0_Combined_HospAd_Data.csv") 
    // console.log(hosp_df)
    hosp_df.then((result) => {         
        let nested_data = d3.nest()
        .key(function(d) { return d.trust; })
        .map(result);
        section = "$" + trust_name
        nested_data = nested_data[section]
        // Update date
        let update = nested_data[0].date
        update = new Date(update).toDateString()
        let latest_date = update
        update = `Most recent update: ${update}`
        document.querySelector(`#get${partial_id}_updatedate`).innerHTML = update;
        // Daily
        let daily = nested_data[0].admissions
        document.querySelector(`#${partial_id}_dailyadmissions`).innerHTML = daily;
        // Weekly sum
        const weeklySum = d3.sum([
            nested_data[0].admissions, nested_data[1].admissions, 
            nested_data[2].admissions, nested_data[3].admissions,
            nested_data[4].admissions, nested_data[5].admissions,
            nested_data[6].admissions,]);
        let priorWeeklySum = d3.sum([
            nested_data[7].admissions, nested_data[8].admissions, 
            nested_data[9].admissions, nested_data[10].admissions,
            nested_data[11].admissions, nested_data[12].admissions,
            nested_data[13].admissions,]);
        let weeklyChange = Math.round((weeklySum - priorWeeklySum) * 10)/10
        let percentChange = Math.round(((Math.abs(weeklyChange)/weeklySum) * 100) * 10)/10
        let sign = Math.sign(weeklyChange)
        if (sign > 0) {
            let change = `+${weeklyChange}`
            document.querySelector(`#Insert_${partial_id}_weeklysum`).innerHTML = `${weeklySum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        } else if (sign < 0) {
            let change = weeklyChange
            document.querySelector(`#Insert_${partial_id}_weeklysum`).innerHTML = `${weeklySum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        } else {
            let change = weeklyChange
            document.querySelector(`#Insert_${partial_id}_weeklysum`).innerHTML = `${weeklySum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        }
        let previousWeekStart = nested_data[6].date
        previousWeekStart = new Date(previousWeekStart).toDateString()
        const week = `${previousWeekStart} to ${latest_date}`
        document.querySelector(`#Insert_${partial_id}_Week_Duration`).innerHTML = week;
        //  Plotting code
        let data = []
        let labels = []
        for (let i = 0; i < nested_data.length; i++) {
            data.push(nested_data[i].admissions);
            labels.push(nested_data[i].date);
        }
        data = data.reverse()
        // data = data.slice(400)
        labels = labels.reverse()
        // labels = labels.slice(400)
        let options = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: plot_name,
                        data: data,
                        fill: true,
                        borderColor:  'rgba(38, 161, 152, 0.65)',
                        responsive: true,
                        tension: 0.5
                    }]
                },
                options: {
                    elements: {
                        point: {
                            radius: 0
                        }
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: false
                    },
                    tooltips: {
                        mode: 'nearest',
                        intersect: false
                    }
                }
            };
            let chart = new
            Chart(document.getElementById(plot_id), options);
    }).catch((err) => {
        console.log("Nest Failed")
    });
}

function plotVac(ltlaName = '', partial_ID = '') {
    const vacLTLA_df = d3.csv("../Data/0_Combined_Vaccine_Data.csv");
    // console.log(vacLTLA_df);
    vacLTLA_df.then((result) => {
        let nested_data = d3.nest()
        .key(function(d) { return d.ltla; })
        .map(result);
        selectedLTLA = nested_data['$' + `${ltlaName}`]
        // console.log(selectedLTLA)
        // Vacine update date
        let firstDate = selectedLTLA[0].date
        let vacUpDate = new Date(firstDate).toDateString()
        let updateString = `Up to and including: ${vacUpDate}`
        document.querySelector(`#${partial_ID}_VacUpdateDate`).innerHTML = updateString;
        // Group by date
        let filtered_df = d3.nest().key(function(d) { return d.date; }).entries(selectedLTLA);
        let latest_vac = filtered_df[0].values
        let previous_vac = filtered_df[1].values
        // console.log(latest_vac)
        // console.log(previous_vac)
        let first_array = []
        let second_array = []
        let third_array = []
        for (let i = 0; i < latest_vac.length; i++) {
            first_array.push(latest_vac[i].cumu_first);
            second_array.push(latest_vac[i].cumu_second);
            third_array.push(latest_vac[i].cumu_third);
        }
        var cum_first = d3.sum(first_array)
        var cum_second = d3.sum(second_array)
        var cum_third = d3.sum(third_array)
        document.querySelector(`#${partial_ID}_VacCumuFirst`).innerHTML = cum_first;
        document.querySelector(`#${partial_ID}_VacCumuSecond`).innerHTML = cum_second;
        document.querySelector(`#${partial_ID}_VacCumuThird`).innerHTML = cum_third;
        first_array = []
        second_array = []
        third_array = []
        for (let i = 0; i < previous_vac.length; i++) {
            first_array.push(previous_vac[i].cumu_first);
            second_array.push(previous_vac[i].cumu_second);
            third_array.push(previous_vac[i].cumu_third);
        }
        document.querySelector(`#${partial_ID}_DailyFirst`).innerHTML = cum_first - d3.sum(first_array)
        document.querySelector(`#${partial_ID}_DailySecond`).innerHTML = cum_second - d3.sum(second_array)
        document.querySelector(`#${partial_ID}_DailyThird`).innerHTML = cum_third - d3.sum(third_array)
        // Plot
        let vacAges = []
        let firstDoses = []
        let secondDoses = []
        let thirdDoses = []
        for (let i = 0; i < 17; i++) {
            let vacAge = selectedLTLA[i].age
            let firstDose = selectedLTLA[i].prop_first
            let secondDose = selectedLTLA[i].prop_second
            let thirdDose = selectedLTLA[i].prop_third
            vacAges.push(vacAge)
            firstDoses.push(firstDose)
            secondDoses.push(secondDose)
            thirdDoses.push(thirdDose)
        }
        // console.log(vacAges)
        // console.log(firstDoses)
        // console.log(secondDoses)
        // console.log(thirdDoses)
        let options = {
            type: 'radar',
            data: {
                labels: vacAges,
                    datasets: [{
                        label: "First Dose Uptake (%)",
                        data: firstDoses,
                        fill: true,
                        backgroundColor: 'rgba(38, 161, 152, 0.1)',
                        borderColor:  'rgba(38, 161, 152, 0.65)',
                        pointBackgroundColor: 'rgba(38, 161, 152, 0.25)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(38, 161, 152, 0.65)'
                    }, 
                    {
                        label: "Second Dose Uptake (%)",
                        data: secondDoses,
                        fill: true,
                        backgroundColor: 'rgba(0, 0, 0,0.1)',
                        borderColor: 'rgba(0, 0, 0,0.5)',
                        pointBackgroundColor: 'rgba(0, 0, 0,0.2)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(0, 0, 0,0.5)'

                    },
                    {
                        label: "Third Dose Uptake (%)",
                        data: thirdDoses,
                        fill: true,
                        backgroundColor: 'rgba(0, 0, 0,0.25)',
                        borderColor: 'rgba(0, 0, 0,0.6)',
                        pointBackgroundColor: 'rgba(0, 0, 0,0.5)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(0, 0, 0,0.8)'

                    }]
                },
        }
        ltlaVac_Chart = new Chart(document.getElementById(`${partial_ID}_plot`), options);
    }).catch((err) => {
        console.log("Vaccination data missing")
    });
}

function plot_vent(trust_name = "", plot_name = "", plot_id = "", partial_id = "") {
    const vent_df = d3.csv("../Data/0_Combined_Venti_Data.csv") 
    // console.log(vent_df)
    vent_df.then((result) => {         
        let nested_data = d3.nest()
        .key(function(d) { return d.trust; })
        .map(result);
        section = "$" + trust_name
        nested_data = nested_data[section]
        // console.log(nested_data)
        // Update date
        let update = nested_data[0].date
        update = new Date(update).toDateString()
        let latest_date = update
        update = `Most recent update: ${update}`
        // console.log(`#get${partial_id}_updatedate`)
        document.querySelector(`#get${partial_id}_updatedate`).innerHTML = update;
        // Daily
        let daily = nested_data[0].venti
        document.querySelector(`#${partial_id}_dailyventi`).innerHTML = daily;
        // Weekly sum
        const weeklySum = d3.sum([
            nested_data[0].venti, nested_data[1].venti, 
            nested_data[2].venti, nested_data[3].venti,
            nested_data[4].venti, nested_data[5].venti,
            nested_data[6].venti,]);
        let priorWeeklySum = d3.sum([
            nested_data[7].venti, nested_data[8].venti, 
            nested_data[9].venti, nested_data[10].venti,
            nested_data[11].venti, nested_data[12].venti,
            nested_data[13].venti,]);
        let weeklyChange = Math.round((weeklySum - priorWeeklySum) * 10)/10
        let percentChange = Math.round(((Math.abs(weeklyChange)/weeklySum) * 100) * 10)/10
        let sign = Math.sign(weeklyChange)
        if (sign > 0) {
            let change = `+${weeklyChange}`
            document.querySelector(`#Insert_${partial_id}_weeklysum`).innerHTML = `${weeklySum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        } else if (sign < 0) {
            let change = weeklyChange
            document.querySelector(`#Insert_${partial_id}_weeklysum`).innerHTML = `${weeklySum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        } else {
            let change = weeklyChange
            document.querySelector(`#Insert_${partial_id}_weeklysum`).innerHTML = `${weeklySum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        }
        let previousWeekStart = nested_data[6].date
        previousWeekStart = new Date(previousWeekStart).toDateString()
        const week = `${previousWeekStart} to ${latest_date}`
        document.querySelector(`#Insert_${partial_id}_Week_Duration`).innerHTML = week;
        //  Plotting code
        let data = []
        let labels = []
        for (let i = 0; i < nested_data.length; i++) {
            data.push(nested_data[i].venti);
            labels.push(nested_data[i].date);
        }
        data = data.reverse()
        // data = data.slice(400)
        labels = labels.reverse()
        // labels = labels.slice(400)
        let options = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: plot_name,
                        data: data,
                        fill: true,
                        borderColor:  'rgba(38, 161, 152, 0.65)',
                        responsive: true,
                        tension: 0.5
                    }],
                },
                options: {
                    elements: {
                        point: {
                            radius: 0
                        }
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: false
                    },
                    tooltips: {
                        mode: 'nearest',
                        intersect: false
                    }
                }
            };
            let chart = new
            Chart(document.getElementById(plot_id), options);
    }).catch((err) => {
        console.log("Nest Failed")
    });
}

// Comparisons non-function javascript code
if (page === "comparisons.html") {
    const LTLAs = d3.csv("./Data/0_Combined_LTLA_Data.csv") 
    // console.log(LTLAs)
    LTLAs.then((result) => {         
            let nested_data = d3.nest()
            .key(function(d) { return d.date; })
            .map(result);
        let latest = nested_data.keys()[0];
        // console.log(latest)
        $('#DateSelector').val(latest);
        let update = new Date(latest).toDateString()
        document.querySelector("#getSelectedDate").innerHTML = `Selected date: ${update}`
        update = `Up to and including: ${update}`
        document.querySelector("#updateCurrent").innerHTML = update;
        latest = nested_data["$"+latest];
        latest.sort(function(a, b) {
            return d3.descending(parseFloat(a.rate),parseFloat(b.rate));
        });
        // console.log(nested_data)
        // console.log(latest)
        let data = [];
        let labels = [];
        let colours = [];
        let nationalRank = [];
        for (let i = 0; i < latest.length; i++) {
            data.push(latest[i].rate)
            label = latest[i].ltla;
            labels.push(label);
            if (
                label == "Elmbridge" || label == "Epsom and Ewell" || label == "Reigate and Banstead" ||
                label == "Runnymede" || label == "Guildford" || label == "Mole Valley" || label == "Spelthorne" ||
                label == "Surrey Heath" || label == "Tandridge" || label == "Waverley" || label == "Woking"  
                ) {
                    colours.push('rgb(38, 141, 132)')
                    nationalRank.push(i+1)
                } else { 
                    colours.push('rgb(200, 200, 200)')
                }}
        var plot_title = `National vs. Surrey LTLA rates/100,000 people - ${latest[0].date}`
        var maxY = d3.max(result, function(d) { return +d.rate;} );
        let config = {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: `Rates/100,000 people`,
                                data: data,
                                backgroundColor: colours,
                                responsive: true
                            }],
                        },
                        options: {
                            scales: {
                                yAxes: [{
                                    display: true,
                                    ticks: {
                                        suggestedMin: 0,
                                        suggestedMax: maxY,
                                    }
                                }],
                                xAxes: [{
                                    type: "category",
                                    display: false,
                                    ticks: {
                                        display: false
                                    }
                                }]
                            },
                            legend:{
                                display: false
                            },
                            title: {
                                display: true,
                                text: plot_title
                            },
                            plugins: {
                                zoom: {
                                    zoom: {
                                        enabled: true,
                                        mode: 'x',
                                        speed: 1,
                                        threshold: 0,
                                        sensitivity: 0,
                                        limits: {
                                            max: 25,
                                            min: 15
                                        }
                                    }
                                }
                            }
                        }        
                    }
        
        // const chart = new
        compChart = new Chart(document.getElementById("comp_plot"), config);
        // plot end
        // produce table
        const byLocation = d3.map(latest, function(d) { return d.ltla;});
        // console.log(byLocation)
        let surreyLocations = []
        const surreyKeys = [
            "$Elmbridge", "$Epsom and Ewell", "$Guildford", "$Mole Valley", "$Reigate and Banstead",
            "$Runnymede", "$Spelthorne", "$Surrey Heath", "$Tandridge", "$Waverley", "$Woking"
        ]
        for (let i = 0; i < surreyKeys.length; i++) {
            surreyLocations.push(byLocation[surreyKeys[i]]);   
        }
        surreyLocations.sort(function(a, b) {
            return d3.descending(parseFloat(a.rate),parseFloat(b.rate));
        });
        let surreyName = [];
        let surreyRate = [];
        for (let i = 0; i < surreyLocations.length; i++) {
            surreyName.push(surreyLocations[i].ltla); 
            surreyRate.push(surreyLocations[i].rate);
        }
        // console.log(surreyName)
        // console.log(surreyRate)
        // console.log(nationalRank)
        var k = '<tbody>'
        for(i = 0; i < surreyName.length; i++){
            k+= '<tr>';
            k+= '<td>' + surreyName[i] + '</td>';
            k+= '<td>' + surreyRate[i] + '</td>';
            k+= '<td>' + nationalRank[i] + '</td>';
            k+= '</tr>';
        }
        k+='</tbody>';
        document.getElementById('surreyData').innerHTML = k;
    });
    // Change
    let dateInput = document.getElementById("DateSelector");    
    dateInput.addEventListener('change', function(selectionEvent) {
        LTLAs.then((result) => {         
            dateInput = selectionEvent.target.value
            let nested_data = d3.nest()
            .key(function(d) { return d.date; })
            .map(result);
        // console.log(dateInput)
        let finalDate = nested_data.keys()[0];
        // console.log(nested_data)
        try {
            let selection = []
            document.querySelector("#getSelectedDate").innerHTML = `Selected date: ${new Date(dateInput).toDateString()}`
            selection = nested_data["$" + dateInput]
            if (typeof selection == 'undefined') {
                alert(`Outside of date range:\n2020-02-05 to ${finalDate}`)
            } else {
                selection.sort(function(a, b) {
                    return d3.descending(parseFloat(a.rate),parseFloat(b.rate));
                });
                // console.log(selection)
                let data = [];
                let labels = [];
                let colours = [];
                let nationalRank = [];
                for (let i = 0; i < selection.length; i++) {
                    data.push(selection[i].rate)
                    label = selection[i].ltla;
                    labels.push(label);
                    if (
                        label == "Elmbridge" || label == "Epsom and Ewell" || label == "Reigate and Banstead" ||
                        label == "Runnymede" || label == "Guildford" || label == "Mole Valley" || label == "Spelthorne" ||
                        label == "Surrey Heath" || label == "Tandridge" || label == "Waverley" || label == "Woking"  
                        ) {
                            colours.push('rgb(38, 141, 132)')
                            nationalRank.push(i+1)
                        } else { 
                            colours.push('rgb(200, 200, 200)')
                        }}
                plot_title = `National vs. Surrey LTLA rates/100,000 people - ${selection[0].date}`
                maxY = d3.max(result, function(d) { return +d.rate;} );
                let config = {
                                type: 'bar',
                                data: {
                                    labels: labels,
                                    datasets: [{
                                        label: `Rates/100,000 people`,
                                        data: data,
                                        backgroundColor: colours,
                                        responsive: true
                                    }],
                                },
                                options: {
                                    scales: {
                                        yAxes: [{
                                            display: true,
                                            ticks: {
                                                suggestedMin: 0,
                                                suggestedMax: maxY,
                                            }
                                        }],
                                        xAxes: [{
                                            display: false,
                                            ticks: {
                                                display: false
                                            }
                                        }]
                                    } ,
                                    title: {
                                        display: true,
                                        text: plot_title,
                                    },
                                    legend:{
                                        display: false
                                    },
                                    animation: {
                                        duration: 0
                                    },
                                    plugins: {
                                        zoom: {
                                            zoom: {
                                                enabled: true,
                                                mode: 'x',
                                                speed: 1,
                                                threshold: 0,
                                                sensitivity: 0,
                                                limits: {
                                                    max: 25,
                                                    min: 15
                                                }
                                            }
                                        }
                                    }
                                }        
                            }
                // console.log(compChart)
                compChart.destroy();
                compChart = new Chart(document.getElementById("comp_plot"), config);
                // Plot ends
                // produce table
                const byLocation = d3.map(selection, function(d) { return d.ltla;});
                // console.log(byLocation)
                let surreyLocations = []
                const surreyKeys = [
                    "$Elmbridge", "$Epsom and Ewell", "$Guildford", "$Mole Valley", "$Reigate and Banstead",
                    "$Runnymede", "$Spelthorne", "$Surrey Heath", "$Tandridge", "$Waverley", "$Woking"
                    ]
                for (let i = 0; i < surreyKeys.length; i++) {
                    surreyLocations.push(byLocation[surreyKeys[i]]);   
                }
                surreyLocations.sort(function(a, b) {
                    return d3.descending(parseFloat(a.rate),parseFloat(b.rate));
                });
                let surreyName = [];
                let surreyRate = [];
                for (let i = 0; i < surreyLocations.length; i++) {
                    surreyName.push(surreyLocations[i].ltla); 
                    surreyRate.push(surreyLocations[i].rate);
                }
                // console.log(surreyName)
                // console.log(surreyRate)
                // console.log(nationalRank)
                var k = '<tbody>'
                for(i = 0; i < surreyName.length; i++){
                    k+= '<tr>';
                    k+= '<td>' + surreyName[i] + '</td>';
                    k+= '<td>' + surreyRate[i] + '</td>';
                    k+= '<td>' + nationalRank[i] + '</td>';
                    k+= '</tr>';
                }
                k+='</tbody>';
                document.getElementById('surreyData').innerHTML = k;
            }
        } catch (error) {
            console.log(error)
        }
    })});
}

// Case rates non-function javascript code
if (page === "SC_CasesDetailed.html") {
    // Elmbridge MSOA case rates dropdown
    var options = [
        {
            "text"  : "West Molesey North",
            "value" : "West Molesey North"
        },
        {
            "text"  : "East Molesey",
            "value" : "East Molesey"
        },
        {
            "text"  : "West Molesey South",
            "value" : "West Molesey South"
        },
        {
            "text"  : "Walton North & Molesey Heath",
            "value" : "Walton North & Molesey Heath"
        },
        {
            "text"  : "Thames Ditton",
            "value" : "Thames Ditton"
        },
        {
            "text"  : "Long Ditton",
            "value" : "Long Ditton"
        },
        {
            "text"  : "Walton Central",
            "value" : "Walton Central"
        },
        {
            "text"  : "Walton East",
            "value" : "Walton East"
        },
        {
            "text"  : "Hinchley Wood & Weston Green",
            "value" : "Hinchley Wood & Weston Green"
        },
        {
            "text"  : "Walton Hersham Road",
            "value" : "Walton Hersham Road"
        },
        {
            "text"  : "Oatlands",
            "value" : "Oatlands"
        },
        {
            "text"  : "Weybridge Riverside",
            "value" : "Weybridge Riverside"
        },
        {
            "text"  : "Esher",
            "value" : "Esher"
        },
        {
            "text"  : "Hersham",
            "value" : "Hersham"
        },
        {
            "text"  : "Claygate",
            "value" : "Claygate"
        },
        {
            "text"  : "Weybridge St George's Hill",
            "value" : "Weybridge St George's Hill"
        },
        {
            "text"  : "Cobham",
            "value" : "Cobham"
        },
        {
            "text"  : "Oxshott & Stoke D'Abernon",
            "value" : "Oxshott & Stoke D'Abernon"
        }];
    var selectBox = document.getElementById('elm_selectMSOA');
    for(var i = 0, l = options.length; i < l; i++){
        var option = options[i];
        selectBox.options.add( new Option(option.text, option.value, option.selected) );
    }
    var elmInput = document.getElementById(`elm_selectMSOA`);
                    elmInput.addEventListener('change', function(selectionEvent) {
                        clearDiv(divID = 'elmPlot_div', canvasID = 'elm_plot')
                        plotMSOA(ltlaName = "Elmbridge", partial_ID = "elm")
                    });
    // Elmbridge MSOA case rates dropdown end
    // Epsom and Ewell MSOA case rates dropdown
    var options = [
        {
            "text"  : "Worcester Park West",
            "value" : "Worcester Park West"
        },
        {
            "text"  : "Ruxley Lane",
            "value" : "Ruxley Lane"
        },
        {
            "text"  : "Stoneleigh & Auriol",
            "value" : "Stoneleigh & Auriol"
        },
        {
            "text"  : "West Ewell",
            "value" : "West Ewell"
        },
        {
            "text"  : "Horton & Manor Park",
            "value" : "Horton & Manor Park"
        },
        {
            "text"  : "Epsom North",
            "value" : "Epsom North"
        },
        {
            "text"  : "Epsom Town",
            "value" : "Epsom Town"
        },
        {
            "text"  : "Epsom Downs & Common",
            "value" : "Epsom Downs & Common"
        },
        {
            "text"  : "Ewell East",
            "value" : "Ewell East"
        }
    ];
    var selectBox = document.getElementById('EnE_selectMSOA');
    for(var i = 0, l = options.length; i < l; i++){
        var option = options[i];
        selectBox.options.add( new Option(option.text, option.value, option.selected) );
    }
    var EnEInput = document.getElementById(`EnE_selectMSOA`);
    EnEInput.addEventListener('change', function(selectionEvent) {
        clearDiv(divID = 'EnEPlot_div', canvasID = 'EnE_plot')
        plotMSOA(ltlaName = "Epsom and Ewell", partial_ID = "EnE")
    });
    // Epsom and Ewell MSOA case rates dropdown end
    // Guildford MSOA case rates dropdown
    var options = [
        {
            "text"  : "West Clandon & Send",
            "value" : "West Clandon & Send"
        },
        {
            "text"  : "Pirbright & Normandy",
            "value" : "Pirbright & Normandy"
        },
        {
            "text"  : "Horsley & Effingham",
            "value" : "Horsley & Effingham"
        },
        {
            "text"  : "Ash Vale",
            "value" : "Ash Vale"
        },
        {
            "text"  : "Worplesdon, Jacobs Well & Wood Street",
            "value" : "Worplesdon, Jacobs Well & Wood Street"
        },
        {
            "text"  : "Stoughton",
            "value" : "Stoughton"
        },
        {
            "text"  : "Bellfields, Slyfield & Weyfield",
            "value" : "Bellfields, Slyfield & Weyfield"
        },
        {
            "text"  : "Burpham North & Merrow East",
            "value" : "Burpham North & Merrow East"
        },
        {
            "text"  : "Woodbridge Hill",
            "value" : "Woodbridge Hill"
        },
        {
            "text"  : "Ash Wharf",
            "value" : "Ash Wharf"
        },
        {
            "text"  : "Burpham, Boxgrove & Merrow West",
            "value" : "Burpham, Boxgrove & Merrow West"
        },
        {
            "text"  : "Park Barn & Royal Surrey",
            "value" : "Park Barn & Royal Surrey"
        },
        {
            "text"  : "Guildford Town Centre",
            "value" : "Guildford Town Centre"
        },
        {
            "text"  : "Tongham",
            "value" : "Tongham"
        },
        {
            "text"  : "Onslow Village and University",
            "value" : "Onslow Village and University"
        },
        {
            "text"  : "Pewley Down & The Mount",
            "value" : "Pewley Down & The Mount"
        },
        {
            "text"  : "Shalford & Wanborough",
            "value" : "Shalford & Wanborough"
        },
        {
            "text"  : "Gomshall, Shere & Albury",
            "value" : "Gomshall, Shere & Albury"
        },
    ];
    var selectBox = document.getElementById('gil_selectMSOA');
    for(var i = 0, l = options.length; i < l; i++){
        var option = options[i];
        selectBox.options.add( new Option(option.text, option.value, option.selected) );
    }
    var gilInput = document.getElementById(`gil_selectMSOA`);
    gilInput.addEventListener('change', function(selectionEvent) {
        clearDiv(divID = 'gilPlot_div', canvasID = 'gil_plot')
        plotMSOA(ltlaName = "Guildford", partial_ID = "gil")
    });
    // Guildford MSOA case rates dropdown end
    // Mole Valley MSOA case rates dropdown
    var options = [
        {
            "text"  : "Ashtead East",
            "value" : "Ashtead East"
        },
        {
            "text"  : "Ashtead West",
            "value" : "Ashtead West"
        },
        {
            "text"  : "Leatherhead North",
            "value" : "Leatherhead North"
        },
        {
            "text"  : "Leatherhead South & Ashtead South",
            "value" : "Leatherhead South & Ashtead South"
        },
        {
            "text"  : "Fetcham",
            "value" : "Fetcham"
        },
        {
            "text"  : "Bookham North",
            "value" : "Bookham North"
        },
        {
            "text"  : "Bookham South",
            "value" : "Bookham South"
        },
        {
            "text"  : "Box Hill & Brockham",
            "value" : "Box Hill & Brockham"
        },
        {
            "text"  : "Dorking North & Westhumble",
            "value" : "Dorking North & Westhumble"
        },
        {
            "text"  : "Dorking South",
            "value" : "Dorking South"
        },
        {
            "text"  : "Holmwoods",
            "value" : "Holmwoods"
        },
        {
            "text"  : "Westcott, Ockley & Capel",
            "value" : "Westcott, Ockley & Capel"
        },
        {
            "text"  : "Charlwood, Newdigate & Beare Green",
            "value" : "Charlwood, Newdigate & Beare Green"
        }
    ];
    var selectBox = document.getElementById('mv_selectMSOA');
    for(var i = 0, l = options.length; i < l; i++){
        var option = options[i];
        selectBox.options.add( new Option(option.text, option.value, option.selected) );
    }
    var mvInput = document.getElementById(`mv_selectMSOA`);
    mvInput.addEventListener('change', function(selectionEvent) {
        clearDiv(divID = 'mvPlot_div', canvasID = 'mv_plot')
        plotMSOA(ltlaName = "Mole Valley", partial_ID = "mv")
    });
    // Mole Valley MSOA case rates dropdown end
    // Reigate and Banstead MSOA case rates dropdown
    var options = [
        {
            "text"  : "Nork",
            "value" : "Nork"
        },
        {
            "text"  : "Banstead",
            "value" : "Banstead"
        },
        {
            "text"  : "Tattenham North",
            "value" : "Tattenham North"
        },
        {
            "text"  : "Chipstead & Netherne",
            "value" : "Chipstead & Netherne"
        },
        {
            "text"  : "Tattenham South",
            "value" : "Tattenham South"
        },
        {
            "text"  : "Tadworth & Walton",
            "value" : "Tadworth & Walton"
        },
        {
            "text"  : "Kingswood",
            "value" : "Kingswood"
        },
        {
            "text"  : "Merstham",
            "value" : "Merstham"
        },
        {
            "text"  : "Reigate Hill & Gatton",
            "value" : "Reigate Hill & Gatton"
        },
        {
            "text"  : "Redhill West",
            "value" : "Redhill West"
        },
        {
            "text"  : "Redhill East",
            "value" : "Redhill East"
        },
        {
            "text"  : "Reigate Central & Redhill Common",
            "value" : "Reigate Central & Redhill Common"
        },
        {
            "text"  : "Reigate South Park",
            "value" : "Reigate South Park"
        },
        {
            "text"  : "Earlswood & Whitebushes",
            "value" : "Earlswood & Whitebushes"
        },
        {
            "text"  : "Salfords & Woodhatch",
            "value" : "Salfords & Woodhatch"
        },
        {
            "text"  : "Horley West",
            "value" : "Horley West"
        },
        {
            "text"  : "Horley East",
            "value" : "Horley East"
        },
        {
            "text"  : "Horley Central",
            "value" : "Horley Central"
        }
    ];
    var selectBox = document.getElementById('RnB_selectMSOA');
    for(var i = 0, l = options.length; i < l; i++){
        var option = options[i];
        selectBox.options.add( new Option(option.text, option.value, option.selected) );
    }
    var RnBInput = document.getElementById(`RnB_selectMSOA`);
    RnBInput.addEventListener('change', function(selectionEvent) {
        clearDiv(divID = 'RnBPlot_div', canvasID = 'RnB_plot')
        plotMSOA(ltlaName = "Reigate and Banstead", partial_ID = "RnB")
    });
    // Reigate and Banstead MSOA case rates dropdown end
    // Runnymede MSOA case rates dropdown
    var options = [
        {
            "text"  : "Egham Town",
            "value" : "Egham Town"
        },
        {
            "text"  : "Englefield Green & University",
            "value" : "Englefield Green & University"
        },
        {
            "text"  : "Egham Hythe & Pooley Green",
            "value" : "Egham Hythe & Pooley Green"
        },
        {
            "text"  : "Thorpe",
            "value" : "Thorpe"
        },
        {
            "text"  : "Virginia Water",
            "value" : "Virginia Water"
        },
        {
            "text"  : "Chertsey",
            "value" : "Chertsey"
        },
        {
            "text"  : "Addlestone North",
            "value" : "Addlestone North"
        },
        {
            "text"  : "Ottershaw & Lyne",
            "value" : "Ottershaw & Lyne"
        },
        {
            "text"  : "Addlestone South",
            "value" : "Addlestone South"
        },
        {
            "text"  : "New Haw & Woodham",
            "value" : "New Haw & Woodham"
        }
    ];
    var selectBox = document.getElementById('runny_selectMSOA');
    for(var i = 0, l = options.length; i < l; i++){
        var option = options[i];
        selectBox.options.add( new Option(option.text, option.value, option.selected) );
    }
    var runnyInput = document.getElementById(`runny_selectMSOA`);
    runnyInput.addEventListener('change', function(selectionEvent) {
        clearDiv(divID = 'runnyPlot_div', canvasID = 'runny_plot')
        plotMSOA(ltlaName = "Runnymede", partial_ID = "runny")
    });
    // Runnymede MSOA case rates dropdown end
    // Spelthorne MSOA case rates dropdown
    var options = [
        {
            "text"  : "Stanwell North & Stanwell Moor",
            "value" : "Stanwell North & Stanwell Moor"
        },
        {
            "text"  : "Stanwell South",
            "value" : "Stanwell South"
        },
        {
            "text"  : "Ashford West",
            "value" : "Ashford West"
        },
        {
            "text"  : "Staines Town",
            "value" : "Staines Town"
        },
        {
            "text"  : "Ashford East",
            "value" : "Ashford East"
        },
        {
            "text"  : "Ashford Common",
            "value" : "Ashford Common"
        },
        {
            "text"  : "Staines South East",
            "value" : "Staines South East"
        },
        {
            "text"  : "Sunbury Common",
            "value" : "Sunbury Common"
        },
        {
            "text"  : "Staines South West",
            "value" : "Staines South West"
        },
        {
            "text"  : "Sunbury East",
            "value" : "Sunbury East"
        },
        {
            "text"  : "Halliford & Sunbury West",
            "value" : "Halliford & Sunbury West"
        },
        {
            "text"  : "Littleton & Shepperton Green",
            "value" : "Littleton & Shepperton Green"
        },
        {
            "text"  : "Shepperton Town",
            "value" : "Shepperton Town"
        }
    ];
    var selectBox = document.getElementById('spel_selectMSOA');
    for(var i = 0, l = options.length; i < l; i++){
        var option = options[i];
        selectBox.options.add( new Option(option.text, option.value, option.selected) );
    }
    var spelInput = document.getElementById(`spel_selectMSOA`);
    spelInput.addEventListener('change', function(selectionEvent) {
        clearDiv(divID = 'spelPlot_div', canvasID = 'spel_plot')
        plotMSOA(ltlaName = "Spelthorne", partial_ID = "spel")
    });
    // Spelthorne MSOA case rates dropdown end
    // Surrey Heath MSOA case rates dropdown
    var options = [
        {
            "text"  : "Chobham & Windlesham",
            "value" : "Chobham & Windlesham"
        },
        {
            "text"  : "Bagshot",
            "value" : "Bagshot"
        },
        {
            "text"  : "Lightwater",
            "value" : "Lightwater"
        },
        {
            "text"  : "Camberley North",
            "value" : "Camberley North"
        },
        {
            "text"  : "Camberley Town",
            "value" : "Camberley Town"
        },
        {
            "text"  : "West End & Bisley",
            "value" : "West End & Bisley"
        },
        {
            "text"  : "Camberley Heatherside",
            "value" : "Camberley Heatherside"
        },
        {
            "text"  : "Camberley West",
            "value" : "Camberley West"
        },
        {
            "text"  : "Camberley Parkside",
            "value" : "Camberley Parkside"
        },
        {
            "text"  : "Frimley",
            "value" : "Frimley"
        },
        {
            "text"  : "Frimley Green",
            "value" : "Frimley Green"
        },
        {
            "text"  : "Mytchett & Frith Hill",
            "value" : "Mytchett & Frith Hill"
        }
    ];
    var selectBox = document.getElementById('SuHe_selectMSOA');
    for(var i = 0, l = options.length; i < l; i++){
        var option = options[i];
        selectBox.options.add( new Option(option.text, option.value, option.selected) );
    }
    var SuHeInput = document.getElementById(`SuHe_selectMSOA`);
    SuHeInput.addEventListener('change', function(selectionEvent) {
        clearDiv(divID = 'SuHePlot_div', canvasID = 'SuHe_plot')
        plotMSOA(ltlaName = "Surrey Heath", partial_ID = "SuHe")
    });
    // Surrey Heath MSOA case rates dropdown end
    // Tandridge MSOA case rates dropdown
    var options = [
        {
            "text"  : "Warlingham West & Whyteleafe",
            "value" : "Warlingham West & Whyteleafe"
        },
        {
            "text"  : "Caterham North",
            "value" : "Caterham North"
        },
        {
            "text"  : "Caterham Valley",
            "value" : "Caterham Valley"
        },
        {
            "text"  : "Caterham West",
            "value" : "Caterham West"
        },
        {
            "text"  : "Oxted North",
            "value" : "Oxted North"
        },
        {
            "text"  : "Oxted South",
            "value" : "Oxted South"
        },
        {
            "text"  : "Nutfield & Bletchingley",
            "value" : "Nutfield & Bletchingley"
        },
        {
            "text"  : "Godstone",
            "value" : "Godstone"
        },
        {
            "text"  : "Lingfield & Dormansland",
            "value" : "Lingfield & Dormansland"
        },
        {
            "text"  : "Smallfield & Felbridge",
            "value" : "Smallfield & Felbridge"
        },
        {
            "text"  : "Warlingham East & Tatsfield",
            "value" : "Warlingham East & Tatsfield"
        }
    ];
    var selectBox = document.getElementById('tandr_selectMSOA');
    for(var i = 0, l = options.length; i < l; i++){
        var option = options[i];
        selectBox.options.add( new Option(option.text, option.value, option.selected) );
    }
    var tandrInput = document.getElementById(`tandr_selectMSOA`);
    tandrInput.addEventListener('change', function(selectionEvent) {
        clearDiv(divID = 'tandrPlot_div', canvasID = 'tandr_plot')
        plotMSOA(ltlaName = "Tandridge", partial_ID = "tandr")
    });
    // Tandridge MSOA case rates dropdown end
    // Waverley MSOA case rates dropdown
    var options = [
        {
            "text"  : "Farnham Weybourne & Badshot Lea",
            "value" : "Farnham Weybourne & Badshot Lea"
        },
        {
            "text"  : "Farnham Upper Hale",
            "value" : "Farnham Upper Hale"
        },
        {
            "text"  : "Farnham Town",
            "value" : "Farnham Town"
        },
        {
            "text"  : "Farnham Moor Park & Bourne",
            "value" : "Farnham Moor Park & Bourne"
        },
        {
            "text"  : "Farncombe",
            "value" : "Farncombe"
        },
        {
            "text"  : "Farnham Shortheath",
            "value" : "Farnham Shortheath"
        },
        {
            "text"  : "Godalming North",
            "value" : "Godalming North"
        },
        {
            "text"  : "Blackheath, Wonersh & Shamley Green",
            "value" : "Blackheath, Wonersh & Shamley Green"
        },
        {
            "text"  : "Farnham Wrecclesham",
            "value" : "Farnham Wrecclesham"
        },
        {
            "text"  : "Godalming South",
            "value" : "Godalming South"
        },
        {
            "text"  : "Elstead & Milford",
            "value" : "Elstead & Milford"
        },
        {
            "text"  : "Wheelerstreet, Wormley & Hambledon",
            "value" : "Wheelerstreet, Wormley & Hambledon"
        },
        {
            "text"  : "Cranleigh",
            "value" : "Cranleigh"
        },
        {
            "text"  : "Ewhurst & Chiddingfold",
            "value" : "Ewhurst & Chiddingfold"
        },
        {
            "text"  : "Haslemere East",
            "value" : "Haslemere East"
        },
        {
            "text"  : "Haslemere West",
            "value" : "Haslemere West"
        },
        {
            "text"  : "Hindhead, Beacon Hill & Frensham",
            "value" : "Hindhead, Beacon Hill & Frensham"
        }
    ];
    var selectBox = document.getElementById('wav_selectMSOA');
    for(var i = 0, l = options.length; i < l; i++){
        var option = options[i];
        selectBox.options.add( new Option(option.text, option.value, option.selected) );
    }
    var wavInput = document.getElementById(`wav_selectMSOA`);
    wavInput.addEventListener('change', function(selectionEvent) {
        clearDiv(divID = 'wavPlot_div', canvasID = 'wav_plot')
        plotMSOA(ltlaName = "Waverley", partial_ID = "wav")
    });
    // Waverley MSOA case rates dropdown end
    // Woking MSOA case rates dropdown
    var options = [
        {
            "text"  : "Byfleet",
            "value" : "Byfleet"
        },
        {
            "text"  : "West Byfleet & Pyrford North",
            "value" : "West Byfleet & Pyrford North"
        },
        {
            "text"  : "Horsell",
            "value" : "Horsell"
        },
        {
            "text"  : "Sheerwater",
            "value" : "Sheerwater"
        },
        {
            "text"  : "Goldsworth Park",
            "value" : "Goldsworth Park"
        },
        {
            "text"  : "Maybury Hill & Pyrford South",
            "value" : "Maybury Hill & Pyrford South"
        },
        {
            "text"  : "Knaphill",
            "value" : "Knaphill"
        },
        {
            "text"  : "Woking Central",
            "value" : "Woking Central"
        },
        {
            "text"  : "St John's",
            "value" : "St John's"
        },
        {
            "text"  : "Hook Heath",
            "value" : "Hook Heath"
        },
        {
            "text"  : "Old Woking & Westfield",
            "value" : "Old Woking & Westfield"
        },
        {
            "text"  : "Mayford & Brookwood",
            "value" : "Mayford & Brookwood"
        }
    ];
    var selectBox = document.getElementById('wok_selectMSOA');
    for(var i = 0, l = options.length; i < l; i++){
        var option = options[i];
        selectBox.options.add( new Option(option.text, option.value, option.selected) );
    }
    var wokInput = document.getElementById(`wok_selectMSOA`);
    wokInput.addEventListener('change', function(selectionEvent) {
        clearDiv(divID = 'wokPlot_div', canvasID = 'wok_plot')
        plotMSOA(ltlaName = "Woking", partial_ID = "wok")
    });
    // Woking MSOA case rates dropdown   
}

// Summary non-function javascript code
if (page === "SC_Summary.html") {
    // Vac Summary
    const vac_df = d3.csv("../Data/0_SurreyWide_Vaccinations.csv");
    // console.log(vac_df);
    vac_df.then((result) => {
        // Vacine update date
        let firstDate = result[0].date
        let vacUpDate = new Date(firstDate).toDateString()
        let updateString = `Up to and including: ${vacUpDate}`
        document.querySelector("#VacUpdateDate").innerHTML = updateString;
        // Group by date
        let filtered_df = d3.nest().key(function(d) { return d.date; }).entries(result);
        let latest_vac = filtered_df[0].values
        let previous_vac = filtered_df[1].values
        let first_array = []
        let second_array = []
        let third_array = []
        for (let i = 0; i < latest_vac.length; i++) {
            first_array.push(latest_vac[i].cumu_first);
            second_array.push(latest_vac[i].cumu_second);
            third_array.push(latest_vac[i].cumu_third);
        }
        var cum_first = d3.sum(first_array)
        var cum_second = d3.sum(second_array)
        var cum_third = d3.sum(third_array)
        document.querySelector("#VacCumuFirst").innerHTML = cum_first;
        document.querySelector("#VacCumuSecond").innerHTML = cum_second;
        document.querySelector("#VacCumuThird").innerHTML = cum_third;
        first_array = []
        second_array = []
        third_array = []
        for (let i = 0; i < previous_vac.length; i++) {
            first_array.push(previous_vac[i].cumu_first);
            second_array.push(previous_vac[i].cumu_second);
            third_array.push(previous_vac[i].cumu_third);
        }
        document.querySelector("#DailyFirst").innerHTML = cum_first - d3.sum(first_array)
        document.querySelector("#DailySecond").innerHTML = cum_second - d3.sum(second_array)
        document.querySelector("#DailyThird").innerHTML = cum_third - d3.sum(third_array)
        // Plot
        let vacAges = []
        let firstDoses = []
        let secondDoses = []
        let thirdDoses = []
        for (let i = 0; i < 17; i++) {
            let vacAge = result[i].age
            let firstDose = result[i].prop_first
            let secondDose = result[i].prop_second
            let thirdDose = result[i].prop_third
            vacAges.push(vacAge)
            firstDoses.push(firstDose)
            secondDoses.push(secondDose)
            thirdDoses.push(thirdDose)
        }
        let options = {
            type: 'radar',
            data: {
                labels: vacAges,
                    datasets: [{
                        label: "First Dose Uptake (%)",
                        data: firstDoses,
                        fill: true,
                        backgroundColor: 'rgba(38, 161, 152, 0.1)',
                        borderColor:  'rgba(38, 161, 152, 0.65)',
                        pointBackgroundColor: 'rgba(38, 161, 152, 0.25)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(38, 161, 152, 0.65)'
                    }, 
                    {
                        label: "Second Dose Uptake (%)",
                        data: secondDoses,
                        fill: true,
                        backgroundColor: 'rgba(0, 0, 0,0.1)',
                        borderColor: 'rgba(0, 0, 0,0.5)',
                        pointBackgroundColor: 'rgba(0, 0, 0,0.2)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(0, 0, 0,0.5)'

                    },
                    {
                        label: "Third Dose Uptake (%)",
                        data: thirdDoses,
                        fill: true,
                        backgroundColor: 'rgba(0, 0, 0,0.25)',
                        borderColor: 'rgba(0, 0, 0,0.6)',
                        pointBackgroundColor: 'rgba(0, 0, 0,0.5)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(0, 0, 0,0.8)'

                    }]
                }
        }
        let chart = new
        Chart(document.getElementById('vac_plot'), options);
    }).catch((err) => {
        console.log("Vaccination data missing")
    });
    // Vac Summary End
    // Rate Summary
    const rate_df = d3.csv("../Data/0_SurreyWide_Rates.csv")
    // console.log(rate_df)
    rate_df.then((result) => {
        // daily case rate
        document.querySelector("#InsertDailyCases").innerHTML = (result[0].rate);
        // weekly mean case rate
        const weeklyMeanRate = Math.round(d3.mean([
            result[0].rate, result[1].rate, 
            result[2].rate, result[3].rate,
            result[4].rate, result[5].rate,
            result[6].rate,]) * 10)/10
        let priorweeklyRate = d3.mean([
            result[7].rate, result[8].rate, 
            result[9].rate, result[10].rate,
            result[11].rate, result[12].rate,
            result[13].rate,])
        let weeklyMeanRateChange = Math.round((weeklyMeanRate - priorweeklyRate) * 10)/10
        let percentChange = Math.round(((Math.abs(weeklyMeanRateChange)/weeklyMeanRate) * 100) * 10)/10
        let sign = Math.sign(weeklyMeanRateChange)
        if (sign > 0) {
            let change = `+${weeklyMeanRateChange}`
            document.querySelector("#InsertWeeklyMeanRates").innerHTML = `${weeklyMeanRate} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        } else if (sign < 0) {
            let change = weeklyMeanRateChange
            document.querySelector("#InsertWeeklyMeanRates").innerHTML = `${weeklyMeanRate} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        } else {
            let change = weeklyMeanRateChange
            document.querySelector("#InsertWeeklyMeanRates").innerHTML = `${weeklyMeanRate} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        }
        // Get first and last date
        let ratesdate_first = result[0].date
        ratesdate_first = new Date(ratesdate_first).toDateString()
        let ratesdate_last = result[6].date
        ratesdate_last = new Date(ratesdate_last).toDateString()

        const ratesWeek = `${ratesdate_last} to ${ratesdate_first}`
        document.querySelector("#InsertRatesWeek").innerHTML = ratesWeek;
        // Rates chart
        let case_rates = []
        let case_dates = []
        for (let i = 0; i < result.length; i++) {
            let case_rate = result[i].rate
            case_rates.push(case_rate)
            let case_date = result[i].date
            case_dates.push(case_date)
        }
        case_rates = case_rates.reverse()
        case_rates = case_rates.slice(456)
        case_dates = case_dates.reverse()
        case_dates = case_dates.slice(456)
        let options = {
            type: 'line',
            data: {
                labels: case_dates,
                datasets: [{
                    label: "Case Rate/100,000",
                    data: case_rates,
                    fill: true,
                    borderColor:  'rgba(38, 161, 152, 0.65)',
                    responsive: true,
                    tension: 0.5
                }],
            },
            options: {
                elements: {
                    point: {
                        radius: 0
                    }
                },
                hover: {
                    mode: 'nearest',
                    intersect: false
                },
                tooltips: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        };
        let chart = new
        Chart(document.getElementById('rate_plot'), options);
        document.querySelector("#InsertDateUpdate").innerHTML = previous_dateStringRD;
    }).catch((err) => {
        console.log("Case rate data missing")
    });
    // Rate Summary End
    // Deaths Summary
    const deaths_df = d3.csv("../Data/0_SurreyWide_Deaths.csv")
    // console.log(deaths_df)
    deaths_df.then((result) => {
        // daily case rate
        document.querySelector("#InsertDailyDeaths").innerHTML = (result[0].deaths);
        // weekly sum deaths
        const weeklyDeathsSum = d3.sum([
            result[0].deaths, result[1].deaths, 
            result[2].deaths, result[3].deaths,
            result[4].deaths, result[5].deaths,
            result[6].deaths,])
        let priorweeklySum = d3.sum([
            result[7].deaths, result[8].deaths, 
            result[9].deaths, result[10].deaths,
            result[11].deaths, result[12].deaths,
            result[13].deaths,])
        let weeklyDeathsChange = Math.round((weeklyDeathsSum - priorweeklySum) * 10)/10
        let percentChange = Math.round(((Math.abs(weeklyDeathsChange)/weeklyDeathsSum) * 100) * 10)/10
        let sign = Math.sign(weeklyDeathsChange)
        if (sign > 0) {
            let change = `+${weeklyDeathsChange}`
            document.querySelector("#InsertWeeklySumDeaths").innerHTML = `${weeklyDeathsSum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        } else if (sign < 0) {
            let change = weeklyDeathsChange
            document.querySelector("#InsertWeeklySumDeaths").innerHTML = `${weeklyDeathsSum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        } else {
            let change = weeklyDeathsChange
            document.querySelector("#InsertWeeklySumDeaths").innerHTML = `${weeklyDeathsSum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        }
        // Get deaths sum week
        let deathdate_first = result[0].date
        deathdate_first = new Date(deathdate_first).toDateString()
        let deathdate_last = result[6].date
        deathdate_last = new Date(deathdate_last).toDateString()
        const deathsWeek = `${deathdate_last} to ${deathdate_first}`
        document.querySelector("#InsertDeathsWeek").innerHTML = deathsWeek;
        // Rates chart
        let death_counts = []
        let death_dates = []
        for (let i = 0; i < result.length; i++) {
            let death_count = result[i].deaths
            death_counts.push(death_count)
            let death_date = result[i].date
            death_dates.push(death_date)
        }
        death_counts = death_counts.reverse()
        death_counts = death_counts.slice(445)
        death_dates = death_dates.reverse()
        death_dates = death_dates.slice(445)
        let options = {
            type: 'line',
            data: {
                labels: death_dates,
                datasets: [{
                    label: "New deaths per day, 28 days after positive test",
                    data: death_counts,
                    fill: true,
                    // backgroundColor: 'rgba(0, 0, 0,0.5)',
                    borderColor: 'rgba(0, 0, 0,0.5)',
                    responsive: true,
                    tension: .1
                }]
            },
            options: {
                elements: {
                    point: {
                        radius: 0
                    }
                },
                hover: {
                    mode: 'nearest',
                    intersect: false
                },
                tooltips: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        };
        let chart = new
        Chart(document.getElementById('deaths_plot'), options);
        document.querySelector("#InsertDeathsDateUpdate").innerHTML = previous_dateStringRD;
    }).catch((err) => {
        console.log("death data missing")
    });
    // Deaths Summary End
    // Hospitals Summary
    const hospAd_df = d3.csv("../Data/0_Combined_HospAd_Data.csv")
    // console.log(hospAd_df)
    hospAd_df.then((result) => {
        var nest_data = d3.nest()
        .key(function(d) { return d.date;})
        .rollup(function(d) { return d3.sum(d, function(g) {return g.admissions; });}).entries(result);
        document.querySelector("#InsertLatestHospAd").innerHTML = (nest_data[0].value);
        const weeklyhospSum = d3.sum([
            nest_data[0].value, nest_data[1].value, 
            nest_data[2].value, nest_data[3].value,
            nest_data[4].value, nest_data[5].value,
            nest_data[6].value,])
        let priorhospSum = d3.sum([
            nest_data[7].value, nest_data[8].value, 
            nest_data[9].value, nest_data[10].value,
            nest_data[11].value, nest_data[12].value,
            nest_data[13].value,])
        let weeklyHospsChange = Math.round((weeklyhospSum - priorhospSum) * 10)/10
        let percentChange = Math.round(((Math.abs(weeklyHospsChange)/weeklyhospSum) * 100) * 10)/10
        let sign = Math.sign(weeklyHospsChange)
        if (sign > 0) {
            let change = `+${weeklyHospsChange}`
            document.querySelector("#InsertWeeklyHosp").innerHTML = `${weeklyhospSum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        } else if (sign < 0) {
            let change = weeklyHospsChange
            document.querySelector("#InsertWeeklyHosp").innerHTML = `${weeklyhospSum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        } else {
            let change = weeklyHospsChange
            document.querySelector("#InsertWeeklyHosp").innerHTML = `${weeklyhospSum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        }
        let hospdate_first = nest_data[0].key
        hospdate_first = new Date(hospdate_first).toDateString()
        document.querySelector("#InsertHospUpdateDate").innerHTML = `Most recent update: ${hospdate_first}`;
        let hospdate_last = nest_data[6].key
        hospdate_last = new Date(hospdate_last).toDateString()
        const hospsWeek = `${hospdate_last} to ${hospdate_first}`
        document.querySelector("#InsertHospsWeek").innerHTML = hospsWeek;
        // Rates chart
        let hosp_counts = []
        let hosp_dates = []
        for (let i = 0; i < nest_data.length; i++) {
            let hosp_count = nest_data[i].value
            hosp_counts.push(hosp_count)
            let hosp_date = nest_data[i].key
            hosp_dates.push(hosp_date)
        }
        hosp_counts = hosp_counts.reverse()
        hosp_counts = hosp_counts.slice(439)
        hosp_dates = hosp_dates.reverse()
        hosp_dates = hosp_dates.slice(439)
        let options = {
            type: 'line',
            data: {
                labels: hosp_dates,
                datasets: [{
                    label: "New hospital admissions",
                    data: hosp_counts,
                    fill: true,
                    // backgroundColor: 'rgba(0, 0, 0,0.5)',
                    borderColor:  'rgba(38, 161, 152, 0.65)',
                    responsive: true,
                    tension: .5
                }]
            },
            options: {
                elements: {
                    point: {
                        radius: 0
                    }
                },
                hover: {
                    mode: 'nearest',
                    intersect: false
                },
                tooltips: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        };
        let chart = new
        Chart(document.getElementById('hosps_plot'), options);
    }).catch((err) => {
        console.log("hospital data missing")
    });
    // Hospitals Summary End 
    // Ventilator Summary
    const Venti_df = d3.csv("../Data/0_Combined_Venti_Data.csv")
    // console.log(Venti_df)
    Venti_df.then((result) => {
        var nest_data = d3.nest()
        .key(function(d) { return d.date;})
        .rollup(function(d) { return d3.sum(d, function(g) {return g.venti; });}).entries(result);
        document.querySelector("#InsertLatestVenti").innerHTML = (nest_data[0].value);
        const weeklyVentiSum = d3.sum([
            nest_data[0].value, nest_data[1].value, 
            nest_data[2].value, nest_data[3].value,
            nest_data[4].value, nest_data[5].value,
            nest_data[6].value,])
        let priorVentiSum = d3.sum([
            nest_data[7].value, nest_data[8].value, 
            nest_data[9].value, nest_data[10].value,
            nest_data[11].value, nest_data[12].value,
            nest_data[13].value,])
        let weeklyVentiChange = Math.round((weeklyVentiSum - priorVentiSum) * 10)/10
        let percentChange = Math.round(((Math.abs(weeklyVentiChange)/weeklyVentiSum) * 100) * 10)/10
        let sign = Math.sign(weeklyVentiChange)
        if (sign > 0) {
            let change = `+${weeklyVentiChange}`
            document.querySelector("#InsertVentiSum").innerHTML = `${weeklyVentiSum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        } else {
            let change = weeklyVentiChange
            // console.log(change)
            document.querySelector("#InsertVentiSum").innerHTML = `${weeklyVentiSum} &nbsp &nbsp &nbsp &nbsp &nbsp ${change} (${percentChange}%)`
        }
        let ventidate_first = nest_data[0].key
        ventidate_first = new Date(ventidate_first).toDateString()
        document.querySelector("#InsertVentiUpdateDate").innerHTML = `Most recent update: ${ventidate_first}`;
        let ventidate_last = nest_data[6].key
        ventidate_last = new Date(ventidate_last).toDateString()
        const ventiWeek = `${ventidate_last} to ${ventidate_first}`
        document.querySelector("#InsertVentiWeek").innerHTML = ventiWeek;
        // Rates chart
        let venti_counts = []
        let venti_dates = []
        for (let i = 0; i < nest_data.length; i++) {
            let venti_count = nest_data[i].value
            venti_counts.push(venti_count)
            let venti_date = nest_data[i].key
            venti_dates.push(venti_date)
        }
        venti_counts = venti_counts.reverse()
        venti_counts = venti_counts.slice(425)
        venti_dates = venti_dates.reverse()
        venti_dates = venti_dates.slice(425)
        // console.log(venti_dates)
        let options = {
            type: 'line',
            data: {
                labels: venti_dates,
                datasets: [{
                    label: "Ventilators in use",
                    data: venti_counts,
                    fill: true,
                    // backgroundColor: 'rgba(0, 0, 0,0.5)',
                    borderColor: 'rgba(0, 0, 0,0.5)',
                    responsive: true,
                    tension: .5
                }]
            },
            options: {
                elements: {
                    point: {
                        radius: 0
                    }
                },
                hover: {
                    mode: 'nearest',
                    intersect: false
                },
                tooltips: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        };
        let chart = new
        Chart(document.getElementById('venti_plot'), options);
    }).catch((err) => {
        console.log("ventilator data missing")
    });
    // Ventilator Summary End
}

if (page != "SC_Summary.html")
document.getElementById("defaultOpen").click();