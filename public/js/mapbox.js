/*eslint-disable*/


export const displayMap = locations =>{
  mapboxgl.accessToken =
  'pk.eyJ1IjoicmljaGVib255IiwiYSI6ImNrdGJnNDY3ZDF2eWsycW84dzc5OGRhdzcifQ.C9mqGAaakSDpk8CU08-1eA';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/richebony/cktc55cyc01ex17mitqz94ise',
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((location) => {
  const el = document.createElement('div');
  el.className = 'marker';
  //Add Marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
    scrollZoom: false
  })
    .setLngLat(location.coordinates)
    .addTo(map);

  //  Add Popup
  new mapboxgl.Popup({offset : 30}).setLngLat(location.coordinates)
  .setHTML(`<p>Day ${location.day}  : ${location.description}<p>`)
  .addTo(map)

  // Extend mark bounds to include current location
  bounds.extend(location.coordinates);
});

map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 },
  });

}
