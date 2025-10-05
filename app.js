// --- API Configuration ---
const API_KEY = "f9646f3a450d44fca6754146250510"; 
const BASE_URL = "https://api.weatherapi.com/v1/current.json"; 
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

// --- DOM Elements ---
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const weatherDisplay = document.getElementById('weather-display');
const loadingIndicator = document.getElementById('loading');
const errorMessageDiv = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
// New: Theme toggle elements
const themeToggle = document.getElementById('theme-toggle');

// --- Utility Functions ---

/**
 * Maps UV Index to a status and color for display.
 * @param {number} uv - The UV index value.
 * @returns {{text: string, color: string}}
 */
function getUvStatus(uv) {
    if (uv <= 2) return { text: "Low", color: "#86EFAC" };     // Green
    if (uv <= 5) return { text: "Moderate", color: "#FDE047" }; // Yellow
    if (uv <= 7) return { text: "High", color: "#FB923C" };    // Orange
    if (uv <= 10) return { text: "Very High", color: "#F87171" }; // Red
    return { text: "Extreme", color: "#C084FC" };              // Purple
}

/**
 * Maps AQI (US EPA Index) to a status and color for display.
 * @param {number} aqi - The AQI value (multiplied by 50 in the original logic).
 * @returns {{status: string, color: string, barColor: string}}
 */
function getAqiStatus(aqi) {
    if (aqi <= 50) return { status: "Good", color: "rgb(0, 153, 102)", barColor: "#009966" }; 
    if (aqi <= 100) return { status: "Moderate", color: "rgb(255, 222, 51)", barColor: "#FFDE33" }; 
    if (aqi <= 150) return { status: "Unhealthy for Sensitive Groups", color: "rgb(255, 153, 51)", barColor: "#FF9933" }; 
    if (aqi <= 200) return { status: "Unhealthy", color: "rgb(204, 0, 51)", barColor: "#CC0033" }; 
    if (aqi <= 300) return { status: "Very Unhealthy", color: "rgb(102, 0, 153)", barColor: "#660099" }; 
    return { status: "Hazardous", color: "rgb(126, 0, 35)", barColor: "#7E0023" }; 
}

/**
 * Formats the local time string into a readable format.
 * @param {string} localtime - The API's raw localtime string (e.g., "2025-10-05 06:45").
 * @returns {string} The formatted date and time.
 */
function formatLocalTime(localtime) {
    try {
        // Replace hyphens for better compatibility across browsers
        const date = new Date(localtime.replace(/-/g, "/")); 
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        };
        return date.toLocaleTimeString('en-US', options);
    } catch (e) {
        console.error("Error parsing local time:", e);
        return "Time Unavailable";
    }
}

/**
 * Updates the UI elements with the fetched weather data.
 * @param {object} data - The weather data object from the API.
 */
function updateUI(data) {
    const { location, current } = data;
    
    // 1. MAIN SECTION
    document.getElementById('location-name').textContent = location.name;
    document.getElementById('location-country').textContent = location.country;
    document.getElementById('local-time').textContent = formatLocalTime(location.localtime);
    
    // Temperature
    document.getElementById('temp-c').textContent = Math.round(current.temp_c);
    document.getElementById('feels-like').textContent = `Feels like: ${Math.round(current.feelslike_c)}°C`;
    
    // Condition
    document.getElementById('condition-text').textContent = current.condition.text;
    // Prepend 'https:' to the icon URL
    document.getElementById('condition-icon').src = `https:${current.condition.icon.replace('http:', '')}`;
    document.getElementById('condition-icon').alt = current.condition.text;

    // 2. AIR QUALITY INDEX SECTION
    const aqiValue = current.air_quality ? current.air_quality['us-epa-index'] * 50 : 0; 
    const aqiData = getAqiStatus(aqiValue);
    document.getElementById('aqi-value').textContent = current.air_quality ? current.air_quality['us-epa-index'] : 'N/A';
    document.getElementById('aqi-value').style.color = aqiData.color;
    document.getElementById('aqi-status').textContent = current.air_quality ? aqiData.status : 'Data N/A';
    document.getElementById('aqi-bar').style.backgroundColor = aqiData.barColor;
    
    // 3. DETAILED METRICS GRID
    document.getElementById('humidity').innerHTML = `${current.humidity}<span class="metric-unit">%</span>`;
    document.getElementById('wind-kph').innerHTML = `${Math.round(current.wind_kph)}<span class="metric-unit"> kph</span>`;
    document.getElementById('wind-dir').textContent = current.wind_dir;
    document.getElementById('pressure-mb').innerHTML = `${Math.round(current.pressure_mb)}<span class="metric-unit"> mb</span>`;
    document.getElementById('vis-km').innerHTML = `${current.vis_km}<span class="metric-unit"> km</span>`;
    document.getElementById('dewpoint-c').innerHTML = `${Math.round(current.dewpoint_c)}<span class="metric-unit">°C</span>`;
    
    // UV Status update
    const uvStatus = getUvStatus(current.uv);
    document.getElementById('uv-index').textContent = current.uv.toFixed(1);
    document.getElementById('uv-status').textContent = uvStatus.text;
    document.getElementById('uv-status').style.color = uvStatus.color;

    weatherDisplay.classList.remove('hidden');
}

/**
 * Fetches weather data from the API with exponential backoff retry logic.
 * @param {string} city - The city name to search for.
 * @param {number} [attempt=0] - The current retry attempt count.
 */
async function fetchWeather(city, attempt = 0) {
    weatherDisplay.classList.add('hidden');
    errorMessageDiv.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');

    if (!city) {
        loadingIndicator.classList.add('hidden');
        errorText.textContent = "Please enter a valid city name.";
        errorMessageDiv.classList.remove('hidden');
        return;
    }

    const url = `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=yes`;

    try {
        const response = await fetch(url);
        loadingIndicator.classList.add('hidden');

        if (response.ok) {
            const data = await response.json();
            updateUI(data);
        } else if (response.status === 400 && attempt < MAX_RETRIES) {
            const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
            console.warn(`Attempt ${attempt + 1} failed (Status ${response.status}). Retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWeather(city, attempt + 1); // Retry with increased attempt count
        } else {
            const errorJson = await response.json();
            const msg = errorJson.error ? errorJson.error.message : `Error ${response.status}.`;
            errorText.textContent = `Error fetching data: ${msg}`;
            errorMessageDiv.classList.remove('hidden');
        }
    } catch (error) {
        loadingIndicator.classList.add('hidden');
        errorText.textContent = `Network Error: ${error.message}. Please check your connection or try again.`;
        errorMessageDiv.classList.remove('hidden');
        console.error("Fetch error:", error);
    }
}

// --- Theme Logic ---

/**
 * Updates the theme toggle button's icon and text based on the current theme.
 * @param {string} theme - 'light' or 'dark'.
 */
function updateThemeIcon(theme) {
    const iconSpan = document.getElementById('theme-icon');
    const textSpan = document.getElementById('theme-text');
    if (iconSpan) {
        if (theme === 'light') {
            // Moon icon (suggests switching to dark mode)
            iconSpan.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>';
        } else {
            // Sun icon (suggests switching to light mode)
            iconSpan.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9.06-9.06l-1 1m-14.12 0l-1-1m14.12-10.12l-1 1m-14.12 0l-1 1M4.22 19.78l1-1m14.12 0l1 1M12 18a6 6 0 100-12 6 6 0 000 12z"></path></svg>';
        }
    }
    if (textSpan) {
        textSpan.textContent = theme === 'light' ? 'Dark Mode' : 'Light Mode';
    }
}

/**
 * Loads the theme preference from local storage and applies it.
 */
function loadTheme() {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    if (storedTheme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
    updateThemeIcon(storedTheme);
}

/**
 * Toggles the theme between light and dark mode.
 */
function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    const newTheme = isLight ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

// --- Event Listeners ---

searchButton.addEventListener('click', () => {
    fetchWeather(cityInput.value.trim());
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        fetchWeather(cityInput.value.trim());
    }
});

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// --- Initialization ---

window.onload = () => {
    // New: Load theme before fetching data
    loadTheme();
    // Load weather for the default city on initial load
    fetchWeather(cityInput.value.trim()); 
};
