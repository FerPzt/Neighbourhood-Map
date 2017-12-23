
// Initialize the map with a pre-defined ceter
function initMap() {
    const initPos = {lat: 49.2155955, lng: -122.9000755};

  map = new google.maps.Map(document.getElementById('map'), {
    center: initPos,
    zoom: screen.width <= 730? 13 : 14,
    center: initPos
  });
  populateMap(map);
}

/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
    document.getElementById("mySidenav").classList.add('openNav');
    document.getElementById("map").classList.add('slideMap');
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
    document.getElementById("mySidenav").classList.remove('openNav');
    document.getElementById("map").classList.remove('slideMap');
}
