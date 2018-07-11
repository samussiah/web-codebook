import { select as d3select } from 'd3';

export function onDraw(explorer) {
  explorer.codebook.fileListing.table.on('draw', function() {
    //highlight the current row
    this.table
      .select('tbody')
      .selectAll('tr')
      .filter(
        f =>
          f[explorer.config.labelColumn] ===
          explorer.current[explorer.config.labelColumn]
      )
      .classed('selected', true);

    //Linkify the labelColumn
    var labelCells = this.table
      .selectAll('tbody tr')
      .on('click', function(d) {
        explorer.current = d;
        explorer.current.event = 'click';
        explorer.makeCodebook(explorer);
      })
      .selectAll('td')
      .filter(f => f.col == explorer.config.labelColumn)
      .classed('link', true);
  });
}
