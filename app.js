// =========================================
// 1. SELECCIÓN DE ELEMENTOS DEL DOM
// =========================================
const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const currentTemp = document.getElementById('current-temp');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const precipitation = document.getElementById('precipitation');

const dailyGrid = document.getElementById('daily-grid');
const hourlyList = document.getElementById('hourly-list');
const hourlyDaySelector = document.getElementById('hourly-day-selector');
const currentIcon = document.getElementById('current-icon');

// Elementos del menú de unidades
const unitsBtn = document.getElementById('units-btn');
const unitsMenu = document.getElementById('units-menu');
const unitRadios = document.querySelectorAll('.units-menu input[type="radio"]');

// Variables globales para recordar la última ciudad buscada
let currentLat = 52.52;
let currentLon = 13.41;
let globalHourlyData = {};

// =========================================
// 2. DICCIONARIO DE CÓDIGOS DEL CLIMA (WMO)
// =========================================
function getWeatherEmoji(wmoCode) {
  if (wmoCode === 0) return '☀️'; 
  if (wmoCode >= 1 && wmoCode <= 3) return '⛅'; 
  if (wmoCode >= 45 && wmoCode <= 48) return '🌫️'; 
  if (wmoCode >= 51 && wmoCode <= 67) return '🌧️'; 
  if (wmoCode >= 71 && wmoCode <= 77) return '❄️'; 
  if (wmoCode >= 95 && wmoCode <= 99) return '⛈️'; 
  return '☁️'; 
}

// =========================================
// 3. LÓGICA DEL MENÚ DE UNIDADES
// =========================================
// Mostrar/Ocultar el menú al hacer clic en el botón
unitsBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Evita que el clic cierre el menú inmediatamente
  unitsMenu.classList.toggle('hidden');
  unitsBtn.setAttribute('aria-expanded', !unitsMenu.classList.contains('hidden'));
});

// Cerrar el menú si se hace clic fuera de él
document.addEventListener('click', (e) => {
  if (!unitsMenu.contains(e.target) && !unitsBtn.contains(e.target)) {
    unitsMenu.classList.add('hidden');
    unitsBtn.setAttribute('aria-expanded', 'false');
  }
});

// Actualizar el clima si el usuario cambia alguna unidad
unitRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    // Volvemos a pedir los datos a la API con las nuevas unidades
    getWeatherData(currentLat, currentLon);
  });
});

// =========================================
// 4. LÓGICA DE BÚSQUEDA Y GEOCODIFICACIÓN
// =========================================
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (query) {
    getCoordinates(query);
  }
});

async function getCoordinates(city) {
  try {
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      alert("City not found. Please try another one.");
      return;
    }

    const location = geoData.results[0];
    cityName.textContent = `${location.name}, ${location.country}`;
    
    // Guardamos las coordenadas para usarlas si cambiamos de unidades
    currentLat = location.latitude;
    currentLon = location.longitude;

    getWeatherData(currentLat, currentLon);

  } catch (error) {
    console.error("Error fetching location:", error);
  }
}

// =========================================
// 5. OBTENER DATOS DEL CLIMA (CON UNIDADES DINÁMICAS)
// =========================================
async function getWeatherData(lat, lon) {
  try {
    // Leemos qué radio buttons están seleccionados
    const tempUnit = document.querySelector('input[name="temp"]:checked').value;
    const windUnit = document.querySelector('input[name="wind"]:checked').value;
    const precipUnit = document.querySelector('input[name="precip"]:checked').value;

    // Adaptamos el valor de precipitación para la API
    const precipParam = precipUnit === 'in' ? 'inch' : 'mm';

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&precipitation_unit=${precipParam}&timezone=auto`;
    
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    updateCurrentWeatherUI(weatherData.current, windUnit, precipUnit);
    updateDailyForecastUI(weatherData.daily);
    setupHourlyForecast(weatherData.hourly, weatherData.daily);

  } catch (error) {
    console.error("Error fetching weather:", error);
  }
}

// =========================================
// 6. ACTUALIZAR LA INTERFAZ
// =========================================
function updateCurrentWeatherUI(current, windUnit, precipUnit) {
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  currentDate.textContent = new Date(current.time).toLocaleDateString('en-US', options);

  currentTemp.textContent = Math.round(current.temperature_2m);
  feelsLike.textContent = `${Math.round(current.apparent_temperature)}°`;
  humidity.textContent = `${current.relative_humidity_2m}%`;
  
  // Imprimimos la unidad correcta en los textos
  windSpeed.textContent = `${Math.round(current.wind_speed_10m)} ${windUnit}`;
  precipitation.textContent = `${current.precipitation} ${precipUnit}`;

  currentIcon.outerHTML = `<span id="current-icon" style="font-size: 5rem; line-height: 1;">${getWeatherEmoji(current.weather_code)}</span>`;
}

function updateDailyForecastUI(daily) {
  dailyGrid.innerHTML = ''; 
  for (let i = 0; i < 7; i++) {
    const date = new Date(daily.time[i]);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const maxTemp = Math.round(daily.temperature_2m_max[i]);
    const minTemp = Math.round(daily.temperature_2m_min[i]);
    const emoji = getWeatherEmoji(daily.weather_code[i]);

    const card = document.createElement('article');
    card.className = 'daily-card';
    card.innerHTML = `
      <h3>${dayName}</h3>
      <span style="font-size: 2rem;">${emoji}</span>
      <div class="daily-temps" style="display:flex; justify-content:center; gap:8px;">
        <span style="font-weight:700;">${maxTemp}°</span>
        <span style="color:var(--neutral-300);">${minTemp}°</span>
      </div>
    `;
    dailyGrid.appendChild(card);
  }
}

function setupHourlyForecast(hourly, daily) {
  globalHourlyData = hourly; 
  hourlyDaySelector.innerHTML = ''; 

  daily.time.forEach((dateString, index) => {
    const date = new Date(dateString);
    let dayName = index === 0 ? "Today" : date.toLocaleDateString('en-US', { weekday: 'long' });
    
    const option = document.createElement('option');
    option.value = dateString; 
    option.textContent = dayName;
    hourlyDaySelector.appendChild(option);
  });

  renderHourlyList(daily.time[0]);
}

function renderHourlyList(selectedDateString) {
  hourlyList.innerHTML = '';

  const hoursForDay = globalHourlyData.time.reduce((acc, timeString, index) => {
    if (timeString.startsWith(selectedDateString)) {
      acc.push(index);
    }
    return acc;
  }, []);

  hoursForDay.forEach((dataIndex, i) => {
    if (i % 3 !== 0) return; 

    const timeString = globalHourlyData.time[dataIndex];
    const date = new Date(timeString);
    const timeFormatted = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    const temp = Math.round(globalHourlyData.temperature_2m[dataIndex]);
    const emoji = getWeatherEmoji(globalHourlyData.weather_code[dataIndex]);

    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.padding = '15px 0';
    item.style.borderBottom = '1px solid var(--neutral-700)';
    
    item.innerHTML = `
      <div style="display:flex; gap:15px; align-items:center;">
        <span>${emoji}</span>
        <span style="color:var(--neutral-200);">${timeFormatted}</span>
      </div>
      <div style="font-weight:700;">${temp}°</div>
    `;
    hourlyList.appendChild(item);
  });
  
  if(hourlyList.lastChild) hourlyList.lastChild.style.borderBottom = 'none';
}

hourlyDaySelector.addEventListener('change', (e) => {
  renderHourlyList(e.target.value);
});

// =========================================
// 7. INICIALIZACIÓN
// =========================================
getCoordinates("Berlin");