/*------------------------------------------------------------------------------------------------\
  Initialize custom controls.
\------------------------------------------------------------------------------------------------*/

//export function init(selector, data, vars, settings) {
export function init(chart) {
    console.log(chart)
    console.log(chart.config)

  //initialize the wrapper
    var selector = chart.controls.wrap
        .append('div')
        .attr('class', 'custom-filters');

   //add a list of values to each filter object
    chart.config.filters.forEach(function(e) {
        e.values= d3.nest()
            .key(function(d) { return d[e.value_col]; })
            .entries(chart.data.raw)
            .map(function(d){
                return {"value":d.key,"selected":true}
            });
    });

  //Clear custom controls.
    selector.selectAll('ul.nav').remove();

  //Add filter controls.
    var filterList = selector
        .append('ul')
        .attr('class', 'nav');

    var filterItem = filterList.selectAll('li')
        .data(chart.config.filters).enter()
        .append('li')
        .attr('class', function(d) {
            return 'custom-' + d.key + ' filterCustom'; });

    var filterLabel = filterItem
        .append('span')
        .attr('class', 'filterLabel')
   
    filterLabel.append("span").html(d => d.label || d.value_col)

    var filterCustom = filterItem
        .append('select')
        .attr('multiple', true);

  //Add data-driven filter options.
    var filterItems = filterCustom.selectAll('option')
        .data(function(d){return d.values})
        .enter()
        .append('option')
        .html(function(d) {return d.value})
        .attr('value', function(d) {return d.value})
        .attr('selected', d=>d.selected?'selected':null);

  //Initialize event listeners
    filterCustom.on('change', function() {
        console.log('filtering')
        
        // flag the selected options in the config
        d3.select(this).selectAll('option').each(function(option_d) {
            option_d.selected = d3.select(this).property('selected')
        })

        chart.data.filtered = chart.data.makeFiltered(chart.data.raw, chart.config.filters)
        console.log(chart.data.raw.length+"->"+chart.data.filtered.length)
        chart.data.summary = chart.data.makeSummary(chart.data.filtered)
        chart.summaryTable.draw(chart)
    });
}