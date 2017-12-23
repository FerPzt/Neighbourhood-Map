
// Class for a Place in the map
class Place {
  constructor(id, position, title, address) {
    var self = this;
    self.id = id;
    self.position = position;
    self.title = title;
    self.address = address;
  }
  getId() { return this.id; }
  getPosition() { return this.position; }
  getTitle() { return this.title; }
  getAddress() { return this.address; }
}

// Initialize the saves places
let savedPlaces = [
  new Place(1, {lat: 49.211614, lng: -122.9017922}, "Queens Park"),
  new Place(2, {lat: 49.2227246, lng: -122.9041998}, "Canada Games Pool"),
  new Place(3, {lat: 49.2141215, lng: -122.9195317}, "Safeway Supermarket"),
  new Place(4, {lat: 49.2101458, lng: -122.9331274}, "Royal City Centre"),
  new Place(5, {lat: 49.2295749, lng: -122.9047291}, "Choices Markets")
];
let lastOpenedInfoWindow = null;
let map = null;
let markers = {};

function getContent(title, places, cb) {
  if (places.length == 0 || !places.venues || places.venues.length == 0) {
    let content = '<div id="content">' +
       '<p><span class="title">' + title + '</span></p>' +
       '<p><span class="address">No information available</span></p>'+
       '</div>';
    cb(content);
    return;
  }
  const place = places.venues[0];

  let additionalUrl = "https://api.foursquare.com/v2/venues/" + place.id + "/links?" +
                 "&client_id=RVOE5UR0Q3PG1UTK3ZJF2PVCGHNLZFDHBF2JQGRJHXEUWFTF&" +
                 "client_secret=F4A5013FMVDSK2ZWV2UFWJ034SZ1F0XLVN5X1FZVZPHVNMC3" +
                 "&v=20171220";
  $.ajax({
    type: "GET",
    dataType: "jsonp",
    cache: false,
    url: additionalUrl,
    success: function(data) {
      let links = "<ul class='links'>";
      let n = 0;
      data.response.links.items.forEach(function(link) {
        if (link.url) {
          links += "<li><a href='" + link.url + "' target='_blank'>" + link.provider.id + "</a></li>";
          n++;
        }
      });
      links += "</ul>";
      let content = '<div id="content">' +
             '<p><span class="title">' + title + '</span></p>' +
             '<p><span class="address">' + place.location.formattedAddress[0];

      if (place.location.formattedAddress.length > 1) {
        content += ', ' + place.location.formattedAddress[1] + '</span></p>';
      } else {
        content += '</span></p>';
      }


      if (place.contact.formattedPhone) {
        content += '<p><span class="contact">' + place.contact.formattedPhone + '</span></p>';
      }
      content += '<p><span class="stats">Number of check-ins: <b>' + place.stats.checkinsCount + '</b></span></p>';
      if (n > 0) {
        content += '<p>Useful Links:<br />' + links + "</p>";
      }
      content += '</div>';

      cb(content);
    }
  });
}

function handleSelectPlace() {
  if (!map) return;

  if (this.getAnimation() !== null) {
    this.setAnimation(null);
  } else {
    this.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(m) {
      m.setAnimation(null);
    }, 1400, this);
  }
  if (lastOpenedInfoWindow) {
    lastOpenedInfoWindow.close();
  }
  this.info.open(map, this);
  lastOpenedInfoWindow = this.info;
}

function addMarker(position, title, cb) {
  let marker = new google.maps.Marker({
    position: position,
    map: map,
    animation: google.maps.Animation.DROP,
    title: title
  });

  let requestUrl = "https://api.foursquare.com/v2/venues/search?ll=" + position.lat + "," + position.lng +
                   "&client_id=RVOE5UR0Q3PG1UTK3ZJF2PVCGHNLZFDHBF2JQGRJHXEUWFTF&" +
                   "client_secret=F4A5013FMVDSK2ZWV2UFWJ034SZ1F0XLVN5X1FZVZPHVNMC3" +
                   "&query=" + title.toLowerCase() + "&limit=10" +
                   "&v=20171220";
  $.ajax({
    type: "GET",
    dataType: "jsonp",
    cache: false,
    url: requestUrl,
    success: function(data) {
      getContent(title, data.response, function(content) {
        marker.info = new google.maps.InfoWindow({
          content: content
        });
        google.maps.event.addListener(marker, 'click', handleSelectPlace);
        cb(marker);
      });
    }
  });
}

function populateMap(_map) {
  savedPlaces.forEach(function(place) {
    addMarker(place.getPosition(), place.getTitle(), function(marker) {
      markers[place.getId()] = marker;
    });
  });
}

// Create a View Model for the places
function SavedPlacesViewModel() {
  var self = this;

  self.places = ko.observableArray(savedPlaces);
  self.query = ko.observable('');

  self.filterPlaces = ko.computed(function() {
    const search = self.query().toLowerCase();
    return ko.utils.arrayFilter(self.places(), function(place) {
      return place.getTitle().toLowerCase().indexOf(search) >= 0;
    });
  });

  self.selectPlace = function(place) {
    const marker = markers[place.getId()];
    new google.maps.event.trigger( marker, 'click' );
    if (screen.width <= 730) {
      closeNav();
    }
  }

  self.query.subscribe(function(newValue) {
    if (lastOpenedInfoWindow) {
      lastOpenedInfoWindow.close();
    }
    savedPlaces.forEach(function(place) {
      const marker = markers[place.getId()];
      if (place.getTitle().toLowerCase().indexOf(newValue.toLowerCase()) >= 0) {
        marker.setMap(map);
      } else {
        marker.setMap(null);
      }
    });
  });
}

ko.applyBindings(new SavedPlacesViewModel());
