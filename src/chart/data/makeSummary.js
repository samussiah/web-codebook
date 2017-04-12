export function makeSummary(codebook) {
    var data = codebook.data.filtered
    var group = codebook.config.group

    function determineType(vector) {
        const nonMissingValues = vector
            .filter(d => !/^\s*$/.test(d));
        const numericValues = nonMissingValues
            .filter(d => !isNaN(+d));
        const distinctValues = d3.set(numericValues).values();

        return nonMissingValues.length === numericValues.length && distinctValues.length > codebook.config.levelSplit
            ? 'continuous'
            : 'categorical';
    }

    const summarize = {
        categorical: function(vector) {
            const statistics = {};
            statistics.N = vector.length;
            const nonMissing = vector
                .filter(d => !/^\s*$/.test(d) && d !== 'NA');
            statistics.n = nonMissing.length;
            statistics.nMissing = vector.length - statistics.n;
            statistics.values = d3.nest()
                .key(d => d)
                .rollup(d => {
                    return {
                        n: d.length,
                        prop_N: d.length/statistics.N,
                        prop_n: d.length/statistics.n,
                        prop_N_text:d3.format("0.1%")(d.length/statistics.N),
                        prop_n_text:d3.format("0.1%")(d.length/statistics.n)
                      }; })
                .entries(nonMissing);

            statistics.values
                .forEach(value => {
                    for (var statistic in value.values) {
                        value[statistic] = value.values[statistic];
                    }
                    delete value.values;
                });

            return statistics;
        },

        continuous: function(vector) {
            const statistics = {};
            statistics.N = vector.length;
            const nonMissing = vector
                .filter(d => !isNaN(+d) && !/^\s*$/.test(d))
                .map(d => +d)
                .sort((a,b) => a-b);
            statistics.n = nonMissing.length;
            statistics.nMissing = vector.length - statistics.n;
            statistics.mean = d3.format('0.2f')(d3.mean(nonMissing));
            statistics.SD = d3.format('0.2f')(d3.deviation(nonMissing));
            const quantiles =
                [   ['min', 0]
                ,   ['5th percentile', .05]
                ,   ['1st quartile', .25]
                ,   ['median', .5]
                ,   ['3rd quartile', .75]
                ,   ['95th percentile', .95]
                ,   ['max', 1]];
            quantiles
                .forEach(quantile => {
                    let statistic = quantile[0];
                    statistics[statistic] = d3.format('0.1f')(d3.quantile(nonMissing, quantile[1]))
                });

            return statistics;
        }

    }

    if(codebook.data.filtered.length > 0){
      const variables = Object.keys(data[0]);
      variables
          .forEach((variable,i) => {
            //Define variable metadata and generate data array.
              variables[i] = {value_col: variable};
              variables[i].values = data
                  .map(d => d[variable]);
              variables[i].type = determineType(variables[i].values);

            //Calculate statistics.
              if (variables[i].type === 'categorical')
                  variables[i].statistics = summarize.categorical(variables[i].values);
              else
                  variables[i].statistics = summarize.continuous(variables[i].values);
            //determine the renderer to use
            console.log(codebook.config.levelSplit)
              variables[i].chartType =
                variables[i].type == "continuous" ? "histogram" :
                variables[i].type == "categorical" & variables[i].statistics.values.length > codebook.config.levelSplit ? "levelChart" :
                variables[i].type == "categorical" & variables[i].statistics.values.length <= codebook.config.levelSplit ? "barChart" :
                "error"

            //Handle groups.
              if (group) {
                  variables[i].group = group;
                  variables[i].groups = d3.set(
                          data.map(d => d[group]))
                      .values()
                      .map(g => {
                          return {group: g}; });

                  variables[i].groups.forEach(g => {
                    //Define variable metadata and generate data array.
                      g.value_col = variables[i].value_col;
                      g.values = data
                          .filter(d => d[group] === g.group)
                          .map(d => d[variable]);
                      g.type = variables[i].type;

                    //Calculate statistics.
                      if (variables[i].type === 'categorical')
                          g.statistics = summarize.categorical(g.values);
                      else
                          g.statistics = summarize.continuous(g.values);
                  });
              }
          });

          codebook.data.summary = variables
          //get bin counts
          codebook.util.getBinCounts(codebook)
    } else {
      codebook.data.summary = []
    }
}
