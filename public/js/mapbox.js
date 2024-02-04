export const displayMap = (locations) => {
  // Create an array to store marker instances
  const markers = [];

  // Initialize the map with a default view
  let map = L.map('map').setView([60.505, -0.09], 9);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  locations.forEach((location) => {
    let longitude = location.coordinates[0];
    let latitude = location.coordinates[1];

    // MongoDB expects longitude first than latitude
    const marker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(location.description)
      .openPopup();

    markers.push(marker); // Add each marker instance to the array
  });

  // Create a LatLngBounds object based on marker positions
  const bounds = L.latLngBounds(markers.map((marker) => marker.getLatLng()));

  // Fit the map to the bounds
  map.fitBounds(bounds);
};
