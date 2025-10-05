<!-- read me file for weather app -->
# Advanced Weather Dashboard

This is a sleek, modern weather dashboard that provides real-time weather information for any city in the world. It is built with HTML, CSS, and vanilla JavaScript, and it fetches data from the WeatherAPI.com service.

## Features

-   **Global Weather Search**: Enter any city name to get the latest weather conditions.
-   **Real-time Data**: Displays current temperature, "feels like" temperature, weather condition, and an accompanying icon.
-   **Detailed Metrics**: Provides a comprehensive overview of today's highlights, including:
    -   Humidity
    -   Wind Speed and Direction
    -   Air Pressure
    -   Visibility
    -   UV Index with a descriptive status (e.g., Low, Moderate, High).
    -   Dew Point
-   **Air Quality Index (AQI)**: Shows the US EPA AQI value with a color-coded status and bar for easy interpretation.
-   **Responsive Design**: The user interface is fully responsive and adapts to desktop, tablet, and mobile screens.
-   **Theme Toggle**: Switch between a beautiful dark mode and a clean light mode. Your preference is saved in your browser.
-   **Dynamic UI**: Includes loading indicators during data fetching and clear error messages for invalid input or network issues.

## Technologies Used

-   **HTML5**: For the structure of the web page.
-   **CSS3**: For styling, including modern features like CSS Grid, Flexbox, and glassmorphism effects.
-   **JavaScript**: For all the application logic, including API calls, DOM manipulation, and theme management.
-   **WeatherAPI.com**: Used as the source for all weather and air quality data.

## How to Use

1.  Open the [`index.html`](weatherapp/index.html) file in your web browser.
2.  The application will load with the default weather for London.
3.  To check the weather for another city, type the city's name into the search bar and click the "Search" button or press Enter.
4.  Use the theme toggle button to switch between light and dark modes.
