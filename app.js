//Códigos de interpretación de tiempo
const weatherCodeMap = {
  0: ["Cielo despejado", "assets/images/icon-sunny.webp"],
  1: ["Mayormente despejado", "assets/images/icon-sunny.webp"],
  2: ["Parcialmente nublado", "assets/images/icon-partly-cloudy.webp"],
  3: ["Cubierto", "assets/images/icon-partly-cloudy.webp"],
  45: ["Niebla", "assets/images/icon-partly-cloudy.webp"],
  48: ["Niebla de escarcha", "assets/images/icon-fog.webp"],
  51: ["Llovizna ligera", "assets/images/icon-drizzle.webp"],
  53: ["Llovizna moderada", "assets/images/icon-drizzle.webp"],
  55: ["Llovizna densa", "assets/images/icon-drizzle.webp"],
  56: ["Llovizna helada ligera", "assets/images/icon-drizzle.webp"],
  57: ["Llovizna helada densa", "assets/images/icon-drizzle.webp"],
  61: ["Lluvia ligera", "assets/images/icon-rain.webp"],
  63: ["Lluvia moderada", "assets/images/icon-rain.webp"],
  65: ["Lluvia intensa", "assets/images/icon-rain.webp"],
  66: ["Lluvia helada ligera", "assets/images/icon-rain.webp"],
  67: ["Lluvia helada densa", "assets/images/icon-rain.webp"],
  71: ["Nieve ligera", "assets/images/icon-snow.webp"],
  73: ["Nieve moderada", "assets/images/icon-snow.webp"],
  75: ["Nieve intensa", "assets/images/icon-snow.webp"],
  77: ["Granos de nieve", "assets/images/icon-snow.webp"],
  80: ["Lluvias ligeras", "assets/images/icon-rain.webp"],
  81: ["Lluvias moderadas", "assets/images/icon-rain.webp"],
  82: ["Lluvias fuertes", "assets/images/icon-rain.webp"],
  85: ["Luz de nieve ligera", "assets/images/icon-snow.webp"],
  86: ["Nevadas fuertes", "assets/images/icon-snow.webp"],
  95: ["Tormenta eléctrica", "assets/images/icon-storm.webp"],
  96: [
    "Tormenta eléctrica con granizo ligero",
    "assets/images/icon-storm.webp",
  ],
  99: [
    "Tormenta eléctrica con granizo fuerte",
    "assets/images/icon-storm.webp",
  ],
};

//Ciudad predeterminada al abrir la app
const DEFAULT_CITY = "Madrid";
document.addEventListener("DOMContentLoaded", loadDefaultWeather(DEFAULT_CITY));

// -- ELEMENTOS DEL DOM --
//Elementos buscador
const searchFrom = document.querySelector(".search-form");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
searchFrom.addEventListener("submit", getLatAndLong);

//Elementos tiempo actual
const locationDisplay = document.getElementById("location");
const dateDisplay = document.getElementById("date");
const weatherDisplay = document.getElementById("current-weather");
const temperatureDisplay = document.getElementById("current-temperature");
const feelLikeDisplay = document.getElementById("feel-like");
const humidityDsiplay = document.getElementById("humidity");
const windDisplay = document.getElementById("wind");
const precipitationDisplay = document.getElementById("precipitation");

// -- LÓGICA DE LA API --
//Función para obtener la latitud y longitud de una ciudad, para luego utilizar estos datos para recoger los datos meteorológicos.
async function getLatAndLong(event) {
  try {
    //Evitar recargar la página
    event.preventDefault();
    const cityName = searchInput.value.trim();

    const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=es`;
    const geoResponse = await fetch(geoURL);
    const geoData = await geoResponse.json();

    if (geoData.results && geoData.results.length > 0) {
      const currentLat = geoData.results[0].latitude;
      const currentLong = geoData.results[0].longitude;
      const currentCityName = geoData.results[0].name;
      const currentCountryName = geoData.results[0].country;
      getWeather(currentLat, currentLong, currentCityName, currentCountryName);
    }
  } catch (error) {
    console.error("Error cargando la ciudad introducida:", error);
  }
}

//Función para recoger los datos meteorológicos necesarios usando la latitud y longitud.
async function getWeather(lat, long, cityName, countryName) {
  try {
    const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`;
    const weatherResponse = await fetch(weatherURL);
    const weatherData = await weatherResponse.json();
    console.log(weatherData);

    if (true) {
      updateUI(weatherData, cityName, countryName);
    }
  } catch (error) {
    console.error(`Error cargando los datos de ${cityName}`, error);
  }
}

//Función para actualizar los datos de la página.
function updateUI(weatherData, cityName, countryName) {
  //Actualizar ciudad y país
  if (countryName && cityName != countryName) {
    locationDisplay.innerText = `${cityName}, ${countryName}`;
  } else {
    locationDisplay.innerText = `${cityName}`;
  }

  //Actualizar fecha
  const rawDate = weatherData.current.time;
  dateDisplay.innerText = formatDate(rawDate);

  //Obtener código de interpretación de tiempo y actualizar imagen del tiempo actual
  const currentWeatherCode = weatherData.current.weather_code;
  const [condition, imagePath] = weatherCodeMap[currentWeatherCode] || [
    "Unknow",
    "",
  ];

  weatherDisplay.src = imagePath;
  weatherDisplay.alt = condition;

  //Actualizar temperatura
  temperatureDisplay.innerText = `${Math.round(weatherData.current.temperature_2m)}º`;

  //Actualizar sensación termica
  feelLikeDisplay.innerText = `${Math.round(weatherData.current.apparent_temperature)}º`;

  //Actualizar humedad
  humidityDsiplay.innerText = `${weatherData.current.relative_humidity_2m}%`;

  //Actualizar viento
  windDisplay.innerText = `${weatherData.current.wind_speed_10m} km/h`;

  //Actualizar precipitación
  precipitationDisplay.innerText = `${weatherData.current.precipitation} mm`;
}

//Función para formatear la fecha que devuelve la API
function formatDate(date) {
  const dateObj = new Date(date);

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };

  let dateFormatted = dateObj.toLocaleDateString("es-ES", options);

  return (dateFormatted =
    dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1));
}

// Función para mostrar de manera predeterminada una ciudad al abrir la app
async function loadDefaultWeather(cityName) {
  try {
    const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=es`;
    const geoResponse = await fetch(geoURL);
    const geoData = await geoResponse.json();

    if (geoData.results && geoData.results.length > 0) {
      var latitude = geoData.results[0].latitude;
      var longitude = geoData.results[0].longitude;
      var name = geoData.results[0].name;
      var country = geoData.results[0].country;
      getWeather(latitude, longitude, name, country);
    }
  } catch (error) {
    console.error("Error cargando ciudad por defecto:", error);
  }
}