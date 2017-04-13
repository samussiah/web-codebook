import layout from './layout';
import { createTable } from 'webcharts';
import onDraw from './onDraw';

export function init(codebook) {
    const
        dataListing = codebook.dataListing;
        layout(dataListing);

  dataListing.sort = {};
  dataListing.sort.wrap = dataListing.wrap
      .select('.sort-container');
  dataListing.sort.order = [];

  //Define table.
    dataListing.table = createTable('.web-codebook .dataListing .listing-container', {});

  //Define callback.
    onDraw(dataListing);


  //Initialize table.
    dataListing.super_raw_data = codebook.data.filtered
    dataListing.sorted_raw_data = codebook.data.filtered
    var sub = dataListing.sorted_raw_data
    .filter(function(d,i){
      return  i<25
    })
    dataListing.table.init(sub);
}
