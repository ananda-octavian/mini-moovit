const stations = [
  "Manggarai",
  "Tanah Abang",
  "Dukuh Atas",
  "Sudirman",
  "Blok M"
];

const graph = {
  "Manggarai": ["Tanah Abang", "Dukuh Atas"],
  "Tanah Abang": ["Manggarai", "Blok M"],
  "Dukuh Atas": ["Manggarai", "Sudirman"],
  "Sudirman": ["Dukuh Atas"],
  "Blok M": ["Tanah Abang"]
};
