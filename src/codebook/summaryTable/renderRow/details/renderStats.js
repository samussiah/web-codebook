//Render Summary Stats
export default function renderStats(d, list) {
  list.selectAll('*').remove();

  var ignoreStats = ['values', 'highlightValues', 'min', 'max'];
  var statNames = Object.keys(d.statistics)
    .filter(f => ignoreStats.indexOf(f) === -1) //remove value lists
    .filter(f => f.indexOf('ile') === -1); //remove "percentiles"

  var statList = statNames.map(stat => {
    return {
      key: stat !== 'nMissing' ? stat : 'Missing',
      value: d.statistics[stat]
    };
  });

  var stats = list
    .selectAll('li.stat')
    .data(statList)
    .enter()
    .append('li')
    .attr('class', 'stat');
  stats
    .append('div')
    .text(d => d.key)
    .attr('class', 'wcb-label');
  stats
    .append('div')
    .text(d => d.value)
    .attr('class', 'value');
}
