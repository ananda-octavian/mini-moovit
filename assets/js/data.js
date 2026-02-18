const stations = [
  "Manggarai",
  "Tanah Abang",
  "Dukuh Atas",
  "Sudirman",
  "Blok M"
];

const stationCoords = {
  "Manggarai": [-6.2103, 106.8506],
  "Tanah Abang": [-6.1870, 106.8106],
  "Dukuh Atas": [-6.2008, 106.8231],
  "Sudirman": [-6.2019, 106.8228],
  "Blok M": [-6.2446, 106.8006]
};

const graph = {
  "Manggarai": ["Tanah Abang", "Dukuh Atas"],
  "Tanah Abang": ["Manggarai", "Blok M"],
  "Dukuh Atas": ["Manggarai", "Sudirman"],
  "Sudirman": ["Dukuh Atas"],
  "Blok M": ["Tanah Abang"]
};
