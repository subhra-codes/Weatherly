
// Selecting HTML elements
const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");

const statusMessage = document.getElementById("status");
const loading = document.getElementById("loading");
const weatherContent = document.getElementById("weather-content");


// =====================================
// 1. AJAX FUNCTION
// =====================================

function ajaxGet(url, onSuccess, onError) {

    // Creating XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // Opening asynchronous GET request
    xhr.open("GET", url, true);

    // Receiving response in JSON format
    xhr.responseType = "json";

    // Handling successful response
    xhr.onload = function () {

        if (xhr.status >= 200 && xhr.status < 300) {

            onSuccess(xhr.response);

        } else {

            onError(
                new Error("Server error. Please try again.")
            );

        }
    };

    // Handling network errors
    xhr.onerror = function () {

        onError(
            new Error("Network error. Check your internet connection.")
        );

    };

    // Sending AJAX request
    xhr.send();
}


// =====================================
// 2. LOADING INDICATOR
// =====================================

function setLoading(active) {

    loading.hidden = !active;

    searchButton.disabled = active;

    searchButton.textContent =
        active ? "Loading..." : "Search ↗";

    if (active) {

        weatherContent.hidden = true;

        statusMessage.textContent = "";

        statusMessage.classList.remove("error");

    }
}


// =====================================
// 3. ERROR HANDLING
// =====================================

function showError(message) {

    setLoading(false);

    statusMessage.textContent = message;

    statusMessage.classList.add("error");

    weatherContent.hidden = true;

}


// =====================================
// 4. WEATHER DESCRIPTION
// =====================================

function getWeatherDescription(code) {

    const weatherMap = {

        0: ["Clear sky", "☀"],
        1: ["Mainly clear", "🌤"],
        2: ["Partly cloudy", "⛅"],
        3: ["Overcast", "☁"],

        45: ["Fog", "🌫"],
        48: ["Rime fog", "🌫"],

        51: ["Light drizzle", "🌦"],
        53: ["Moderate drizzle", "🌦"],
        55: ["Dense drizzle", "🌧"],

        56: ["Freezing drizzle", "🌧"],
        57: ["Heavy freezing drizzle", "🌧"],

        61: ["Slight rain", "🌧"],
        63: ["Moderate rain", "🌧"],
        65: ["Heavy rain", "🌧"],

        66: ["Light freezing rain", "🌧"],
        67: ["Heavy freezing rain", "🌧"],

        71: ["Slight snowfall", "🌨"],
        73: ["Moderate snowfall", "🌨"],
        75: ["Heavy snowfall", "❄"],
        77: ["Snow grains", "❄"],

        80: ["Slight rain showers", "🌦"],
        81: ["Moderate rain showers", "🌧"],
        82: ["Heavy rain showers", "⛈"],

        85: ["Slight snow showers", "🌨"],
        86: ["Heavy snow showers", "❄"],

        95: ["Thunderstorm", "⛈"],
        96: ["Thunderstorm with hail", "⛈"],
        99: ["Thunderstorm with heavy hail", "⛈"]

    };

    return weatherMap[code] ||
        ["Weather conditions unavailable", "🌡"];

}


// =====================================
// 5. DISPLAY WEATHER DATA
// =====================================

function displayWeather(place, data) {

    if (!data || !data.current) {

        showError("Weather data is unavailable.");

        return;
    }

    // Extracting current weather JSON data
    const current = data.current;

    const [description, icon] =
        getWeatherDescription(current.weather_code);


    // Updating city name
    document.getElementById("place-name").textContent =
        place.name + (place.country ? ", " + place.country : "");


    // Updating local time
    document.getElementById("local-time").textContent =
        "Local time · " + current.time.replace("T", " ");


    // Updating weather icon
    document.getElementById("weather-icon").textContent =
        icon;


    // Updating temperature
    document.getElementById("temperature").textContent =
        Math.round(current.temperature_2m);


    // Updating weather condition
    document.getElementById("condition").textContent =
        description;


    // Updating feels-like temperature
    document.getElementById("feels-like").textContent =
        Math.round(current.apparent_temperature);


    // Updating humidity
    document.getElementById("humidity").textContent =
        current.relative_humidity_2m;


    // Updating wind speed
    document.getElementById("wind-speed").textContent =
        Math.round(current.wind_speed_10m);


    // Updating precipitation
    document.getElementById("precipitation").textContent =
        Number(current.precipitation).toFixed(1);


    // Hiding loading indicator
    setLoading(false);

    statusMessage.textContent =
        "Weather data updated successfully.";

    statusMessage.classList.remove("error");

    // Showing weather information
    weatherContent.hidden = false;

}


// =====================================
// 6. FETCH WEATHER DATA
// =====================================

function fetchWeather(city) {

    setLoading(true);

    // Geocoding API
    const geoUrl =
        "https://geocoding-api.open-meteo.com/v1/search?name=" +
        encodeURIComponent(city) +
        "&count=1&language=en&format=json";


    // First AJAX request: Get city coordinates
    ajaxGet(geoUrl, function (geoData) {

        // Checking whether city exists
        if (
            !geoData ||
            !geoData.results ||
            geoData.results.length === 0
        ) {

            showError(
                "City not found. Please check the spelling."
            );

            return;
        }

        // Getting city information
        const place = geoData.results[0];


        // Weather API
        const weatherUrl =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + place.latitude +
            "&longitude=" + place.longitude +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m" +
            "&timezone=auto";


        // Second AJAX request: Get weather information
        ajaxGet(weatherUrl, function (weatherData) {

            displayWeather(place, weatherData);

        }, function (error) {

            showError(error.message);

        });

    }, function (error) {

        showError(error.message);

    });

}


// =====================================
// 7. SEARCH BUTTON EVENT
// =====================================

form.addEventListener("submit", function (event) {

    // Preventing page reload
    event.preventDefault();

    const city = cityInput.value.trim();

    // Checking empty input
    if (!city) {

        showError("Please enter a city name.");

        cityInput.focus();

        return;
    }

    // Fetching weather
    fetchWeather(city);

});


// =====================================
// 8. DEFAULT CITY
// =====================================

// Display Chennai weather on page load

cityInput.value = "Chennai";

fetchWeather("Chennai");
