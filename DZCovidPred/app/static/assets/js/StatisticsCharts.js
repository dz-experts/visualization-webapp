$(function(){
    'use strict';

    const COLORS = {
        lineChart: ["#E64B35FF","#00A087FF", "#D2AF81FF"],
        barChart: ["#EFDC60", "#3cba9f"],
        agesBarChart: ['#59C7EB','#CCEEF9','#FFB8AC','#FEE2DD','#0AA398','#71D1CC','#ECA0B2','#F3BFCB','#B8BCC1','#E1E2E5'],
        trackingChart: ['#7ece7c', '#f3794c'],
        pieChart: ['#ffd7de', '#8fe5d4', '#ace5d1', '#ffebb2', '#fff8e3'],
        markers: ['#e2e1ff', '#f59f9f', '#ffd7de', '#8fe5d4', '#ace5d1', '#ffebb2', '#fff8e3'],
        donutChart: ['#8fe5d4', '#ace5d1', '#ffebb2', '#fff8e3'],
        fontColor: '#c1ccd3',
        gridBorder: 'transparent',
    };
    let debouncedTmeout = 0;

    function changeOpacity(hex,opacity){
        hex = hex.replace('#','');
        let r = parseInt(hex.substring(0,2), 16);
        let g = parseInt(hex.substring(2,4), 16);
        let b = parseInt(hex.substring(4,6), 16);
    
        let result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
        return result;
    }
    
    class StackedLineChart {
        constructor(data) {
            this.$chartContainer = $("#main-stats-canvas");
            this.$tooltip = $('#main-stats-tooltip');

            this.chart = this.createChart(data);
            this.initEventListeners();
        }

        createChart(datasets){
            return new Chart(this.$chartContainer, {
                type: 'line',                
                data: datasets,
                options: {
                    responsive: true,                    
                    scales: {
                        xAxes: [{
                            type : 'time',
                            // specify that it is a stacked lines plot
                            stacked: true,
                            time : {
                                unit: 'day',
                                min: Date.parse("02/25/20")
                            },
                            ticks : {
                                fontColor : "white"
                            }                            
                        }],
                        yAxes : [{                            
                            ticks :{
                                stepSize :50,
                                fontColor : 'white'
                            }
                        }]                        
                    },
                    tooltips: {
                        mode : 'index',
                    },
                    hover : {
                        mode : 'index',
                    },
                    legend : {
                        display : true,
                        labels : {
                            fontColor : 'white'
                        }
                    }   
                }
            });
        }       
        
        initEventListeners(){
            this.$chartContainer.resize(function(e){
                this.chart.update();
            });
        }
    };

    class plotPieChart {
        constructor(data, charttype) {            
            this.$chartContainer = $("#" + charttype + "-stats-canvas");            
            this.chart = this.createPie(data);
            this.initEventListeners();
        }

        createPie(data) {
            return new Chart(this.$chartContainer, {
                type: "pie",
                data: data,
                options : {
                    legend : false
                }                  
            })
        }

        initEventListeners() {}

    }


    class plotBarChart {
        constructor(data, container, direction) {            
            this.$chartContainer = $(container);            
            this.direction = direction;
            this.chart = this.createBarPlot(data);            
            this.initEventListeners();
        }

        createBarPlot(data) {            
            return new Chart(this.$chartContainer, {
                type: this.direction,
                data: data,
                options: {
                  legend: false,
                  scales: {
                    xAxes: [{                        
                        ticks : {
                            fontColor : "white"
                        }                            
                    }],
                    yAxes : [{                            
                        ticks :{                            
                            fontColor : 'white',
                            beginAtZero: true
                        }
                    }]                        
                },
                }
            });                    
        }

        initEventListeners() {}

    }

    // Data fetching methods
    const displayDZCOVIDHistory= async() => {
            
        let categories = ['deaths','recovered','cases'];         
        let labels = ["Deaths","Recovered",'Confirmed'];

        let datasets = [];

        await fetch(`${window.origin}/history`)
            .then(response => response.json())
            .then(data => {                

                for(let i=0; i < categories.length;i++){
                    // Get the data of each category
                    // each data point is represented as object with t and y properties
                    let cat_data = [];            
                    for( let p in data[ categories[i ]]){
                        cat_data.push( { 
                            t: Date.parse(p),
                            y: data[ categories[i ] ][p] 
                        })
                    } 
                    // make sure the data is sorted properly not as string
                    let sorted_data = cat_data.sort( (a,b) => b.t - a.t )

                    // Add the category data to the global list of datasets
                    datasets.push( { 
                        label : labels[i],                
                        data : sorted_data,
                        borderColor : COLORS.lineChart[i],
                        backgroundColor : changeOpacity(COLORS.lineChart[i],50),
                        pointRadius : 2,
                        pointHoverRadius : 3,

                    })

                    // Write todays stats
                    $("#totalconfirmed")[0].innerHTML = data.stats.Total
                    $("#recovered")[0].innerHTML = data.stats.Recovered
                    $("#deaths")[0].innerHTML = data.stats.Deaths                    
                    
                    // update the number of new cases
                    $("#newcases")[0].innerHTML = data.stats.NewCases

                    if(data.stats.NewCases >0){
                        $("#newcases")[0].innerHTML += ' <i class="fa fa-caret-up color-red"></i>';
                    }else{
                        $("#newcases")[0].innerHTML += ' <i class="fa fa-caret-down color-green"></i>';
                    };

                    // update the number of the still infected (Hospitalized) people
                    $("#still_infected")[0].innerHTML = data.stats.StillInfected

                    if(data.stats.StillInfected >0){
                        $("#still_infected")[0].innerHTML += ' <i class="fa fa-caret-up color-red"></i>';
                    }else{
                        $("#still_infected")[0].innerHTML += ' <i class="fa fa-caret-down color-green"></i>';
                    };


                }                                                                            
            }).
            catch( error => {
                console.error('Error:', error);
            });    

        let res = {
            datasets : datasets
        }
        
        new StackedLineChart(res)    
    }

    const getWilayaWithActiveCases = async() => {

        let datasets = [];
        let labels = [];
        await fetch(`${window.origin}/active/wilaya`)
            .then(response => response.json())
            .then(data => {                
                let values = [];                

                for(let i=0; i< data.length; i++){
                    values.push( data[i].actives);
                    labels.push( data[i].name);
                }

                let mycols = d3.scaleSequential()
                                .domain([0, Math.max(...values)/2, Math.max(...values)])
                                .interpolator(d3.interpolateOrRd);
              
                datasets.push({
                    data : values,
                    backgroundColor: values.map( v => mycols(v)),
                    borderColor : 'black',
                    borderWidth :0.2
                });

                $("#infectedWilaya")[0].innerHTML = data.length
            }).
            catch( error => {
                console.error('Error:', error);
            }); 

            let res = {
                datasets: datasets,
                labels : labels
            }

            new plotPieChart(res,"infeted");
    }


    const displayWilayaStats = async() => {

        let datasets = { 'cases': [],
                         'deaths': [],
                        'recovered': [] };

        await fetch(`${window.origin}/confirmed/wilaya`)
               .then(response => response.json())
               .then(data => {
                
                let values = { 'cases': [],
                         'deaths': [],
                        'recovered': [] }

                let labels = []

                for(let i=0; i< data.length; i++){
                    // looks ugly, I know :)
                    values['cases'].push(data[i].confirmed)
                    values['deaths'].push(data[i].deaths)
                    values['recovered'].push(data[i].recovered)

                    labels.push(data[i].name)                    
                }

                // I added 10 to the max value just to not get the dark-red colors
                let colors = {
                    'cases': d3.scaleSequential()
                               .domain([0, Math.max(...values.cases)/2, Math.max(...values.cases)])
                               .interpolator(d3.interpolateOrRd) ,
                    'deaths': d3.scaleSequential()
                               .domain([0, Math.max(...values.deaths)/2, Math.max(...values.deaths)+10])
                               .interpolator(d3.interpolateBuPu) ,
                    'recovered': d3.scaleSequential()
                               .domain([0, Math.max(...values.recovered)/2, Math.max(...values.recovered)+10])
                               .interpolator(d3.interpolateYlGn)
                }

                datasets['cases'].push({
                    data : values.cases,
                    backgroundColor: values.cases.map( v =>  colors.cases(v) ),
                    borderColor : 'black',
                    borderWidth :0.2
                });

                datasets['deaths'].push({
                    data : values.deaths,
                    backgroundColor: values.deaths.map( v => colors.deaths(v)),
                    borderColor : 'black',
                    borderWidth :0.2
                });

                datasets['recovered'].push({
                    data : values.recovered,
                    backgroundColor: values.recovered.map( v => colors.recovered(v)),
                    borderColor : 'black',
                    borderWidth :0.2
                });
                

                new plotPieChart( {datasets : datasets.cases, 
                    labels } ,
                    "confirmed");
                
                new plotPieChart( {datasets : datasets.recovered, 
                    labels } ,
                    "recovered");

                new plotPieChart( {datasets : datasets.deaths, 
                    labels } ,
                    "deaths");
               })
    }

    const displayAgeDistribution = async() => {
        let datasets = [];
        let labels = ['0-5', '5-14', '15-24', '25-34', '35-44', '45-59', '60-70', '70+'];

        await fetch(`${window.origin}/ages`)
              .then( response => response.json())
              .then( data => {                                                        
                datasets.push({                    
                    data : labels.map(p => data[p]),
                    backgroundColor : COLORS.agesBarChart.map(c => changeOpacity(c, 50)),
                    barPercentage : 0.5
                  })    
                  
                  let percent = 100 * labels.map(p => data[p]).slice(0,5).reduce((a,b) => a+ b,0)/labels.map(p => data[p]).reduce( (a,b) =>a+b,0)
                  $("#demographics_info")[0].innerHTML = percent.toFixed(2) + " %"
              })
        
        let res = {
            labels : labels,
            datasets : datasets,
        }
        new plotBarChart(res, "#demographics-stats-canvas","horizontalBar")
    }


    const displayCasesOrigines = async() => {
        let datasets = [];
        await fetch(`${window.origin}/origins`)
              .then( response => response.json())
              .then( data => {
                  let values = [ data.local , data.imported]                  

                  datasets.push({                    
                    data : values,
                    backgroundColor : COLORS.barChart.map(c => changeOpacity(c, 50)),
                    barPercentage : 0.5
                  })
              })
        
        let res = {
            labels : ['Local', 'Imported'],                            
            datasets : datasets,
        }
        new plotBarChart(res, "#origin-stats-canvas","bar")
    }


    const displaySexesStats = async() => {
        let datasets = [];
        await fetch(`${window.origin}/sex`)
              .then( response => response.json())
              .then( data => {
                $("#nbMale")[0].innerHTML = data.male
                $("#nbFemale")[0].innerHTML = data.female
              })                
    }

    

    function pageLoad() {
        $('.widget').widgster();
        $('.sparkline').each(function () {
            $(this).sparkline('html', $(this).data());
        });

        createCharts();
    }

    function createCharts() {
        displayDZCOVIDHistory()
        getWilayaWithActiveCases()    
        displayWilayaStats()
        displayCasesOrigines()
        displayAgeDistribution()
        displaySexesStats()
    }

    function resizeCharts() {
        if (!debouncedTmeout) {
            debouncedTmeout = 400;

            setTimeout(() => {
                debouncedTmeout = 0;
                createCharts()
            }, debouncedTmeout);
        }

    }



    pageLoad();
    PjaxApp.onPageLoad(pageLoad);
    PjaxApp.onResize(resizeCharts);


});

