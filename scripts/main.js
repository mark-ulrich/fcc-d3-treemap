let fillColors = {};
const colorScheme = [
  '#a6cee3',
  '#1f78b4',
  '#b2df8a',
  '#33a02c',
  '#fb9a99',
  '#e31a1c',
  '#fdbf6f'
];

window.addEventListener('DOMContentLoaded', (e) => {
  const url =
    'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json';
  d3.json(url).then((response) => drawGraph(response));
});

const drawGraph = (movieData) => {
  const chartTitle = 'Movie Sales';
  const chartDescription = 'Top 100 Highest Grossing Movies by Genre';

  const chartDimensions = {
    width: 1100,
    height: 900,
    padding: { top: 120, bottom: 100, right: 70, left: 70 }
  };

  const titleX = 330;
  const titleY = 60;
  const descriptionX = 220;
  const descriptionY = 95;

  initFillColors(movieData);
  const svg = createChartContainer(chartDimensions);
  drawTitle(svg, titleX, titleY, chartTitle);
  drawDescription(svg, descriptionX, descriptionY, chartDescription);

  drawTreeMap(svg, chartDimensions, movieData);

  drawLegend(svg);
};

const initFillColors = (data) => {
  data.children.forEach((genre, i) => {
    fillColors[genre.name] = colorScheme[i];
  });
};

const drawTreeMap = (svg, chartDimensions, data) => {
  const strokeColor = 'white';

  const width =
    chartDimensions.width -
    chartDimensions.padding.left -
    chartDimensions.padding.right;

  const height =
    chartDimensions.height -
    chartDimensions.padding.top -
    chartDimensions.padding.bottom;

  const treemapSvg = svg
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('x', chartDimensions.padding.left)
    .attr('y', chartDimensions.padding.top);

  const root = d3
    .treemap()
    .size([width, height])
    .padding(1)(
    d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value)
  );

  const leaf = treemapSvg
    .selectAll('g')
    .data(root.leaves())
    .join('g')
    // .on('mousemove', (d) => {
    //   const x = d3.event.pageX;
    //   const y = d3.event.pageY;
    //   displayTooltip({ x, y }, d.data);
    // })
    .on('mousemove', (d) =>
      displayTooltip({ x: d3.event.pageX, y: d3.event.pageY }, d.data)
    )
    .on('mouseout', hideTooltip) //(d) => hideTooltip())
    .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

  leaf
    .append('rect')
    .attr('class', 'tile')
    .attr('data-name', (d) => d.data.name)
    .attr('data-category', (d) => d.data.category)
    .attr('data-value', (d) => d.data.value)
    .attr('fill', (d) => fillColors[d.data.category])
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0);

  leaf
    .append('text')
    .classed('tile-name', true)
    .attr('x', 5)
    .attr('y', 10)
    .text((d) => d.data.name);
};

const createChartContainer = (chartDimensions) =>
  d3
    .select('#chart-container')
    .append('svg')
    .attr('width', chartDimensions.width)
    .attr('height', chartDimensions.height)
    .attr('class', 'chart');

const displayTooltip = (mouseCoords, data) => {
  const offset = { x: 20, y: -15 };

  const tooltip = document.getElementById('tooltip');
  tooltip.style.left = `${mouseCoords.x + offset.x}px`;
  tooltip.style.top = `${mouseCoords.y + offset.y}px`;
  tooltip.style.visibility = 'visible';
  tooltip.setAttribute('data-value', data.value);

  let markup = `
  Name: ${data.name}<br>
  Genre: ${data.category}<br>
  Gross: ${d3.format('$,.0f')(data.value)}
  `;

  tooltip.innerHTML = markup;
};

const hideTooltip = () => {
  const tooltip = document.getElementById('tooltip');
  if (tooltip) tooltip.style.visibility = 'hidden';
};

const drawLegend = (svg) => {
  const legendBoxWidth = 25;
  const offset = { x: 0, y: 0 };

  const legend = svg.append('svg').attr('id', 'legend');

  const legendScale = d3.scaleOrdinal().domain([]);
  legendScale.range(
    legendScale.domain().map((val, i) => offset.x + i * legendBoxWidth)
  );
  const legendAxis = d3.axisBottom(legendScale);
  legend
    .append('g')
    .attr(
      'transform',
      `translate(${legendBoxWidth - 0.5}, ${offset.y + legendBoxWidth})`
    )
    .call(legendAxis);

  legend
    .selectAll('rect')
    .data(fillColors)
    .enter()
    .append('rect')
    .attr('stroke', '#333')
    .attr('x', (d, i) => offset.x + legendBoxWidth * i)
    .attr('y', offset.y)
    .attr('fill', (d) => d)
    .attr('width', legendBoxWidth)
    .attr('height', legendBoxWidth);
};

const drawDescription = (svg, descriptionX, descriptionY, chartDescription) => {
  svg
    .append('text')
    .attr('id', 'description')
    .attr('x', descriptionX)
    .attr('y', descriptionY)
    .text(chartDescription);
};

const drawTitle = (svg, titleX, titleY, chartTitle) => {
  svg
    .append('text')
    .attr('id', 'title')
    .attr('x', titleX)
    .attr('y', titleY)
    .text(chartTitle);
};
