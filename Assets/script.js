var searchBoxElement = $("#searchBox");

var weatherTodayHeaderElement = $("#weatherTodayHeader");
var weatherTodayIconElement = $("#weatherTodayIcon");
var weatherTodayTemperatureElement = $("#weatherTodayTemperature");
var weatherTodayWindElement = $("#weatherTodayWind");
var weatherTodayHumidityElement = $("#weatherTodayHumidity");
var weatherTodayUVDisplayElement = $("#weatherTodayUVDisplay");

var previousSearchesElement = $("#previousSearches");
var fiveDayForecastListElement = $("#fiveDayForecastContainer");

var weatherTodayContainerElement = $("#weatherTodayContainer");
var weatherForecastContainerElement = $("#weatherForecastContainer");

var weatherAPIKey = "5adc7f2cc76b653c39fa034f10cd6a71";

var currentMoment = moment();

var celcius = "\u00B0" + "C";

var previousSearches = [];

function Init()
{
    LoadPreviousSearches();
}

function SearchForWeather()
{
    let cityName = searchBoxElement.val();
    cityName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
    searchBoxElement.val("");
    GetLocationInformation(cityName);
}

function GetNameFromButtonClicked(event)
{
    let buttonPressed = $(event.target);
    let cityName = buttonPressed.text();
    GetLocationInformation(cityName);
}

function GetLocationInformation(cityName)
{
    let cityInfoApiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=1&appid=" + weatherAPIKey;

    fetch(cityInfoApiUrl).then(function (response) 
    {
        if (response.ok) 
        {
            response.json().then(function (data) 
            {
                if (data.length > 0) { GetWeatherInformation(data, cityName); }
                else { LocationNotFound(); return null; }
            });
        }
    });
}

function GetWeatherInformation(cityData, cityName)
{
    console.log(cityData);

    let weatherApiUrl = "https://api.openweathermap.org/data/3.0/onecall?lat=" + cityData[0].lat + "&lon=" + cityData[0].lon + "&exclude=minutely,hourly,alerts&units=metric&appid=" + weatherAPIKey;

    fetch(weatherApiUrl).then(function (response) 
    {
        if (response.ok)
        {
            response.json().then(function (data) 
            {
                console.log(data);

                weatherTodayHeaderElement.text(cityName + " - " + currentMoment.format("dddd") + " - " + currentMoment.format("DD/MM/YY"));
                weatherTodayIconElement.attr("src", "https://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png");
                weatherTodayTemperatureElement.text("Temperature: " + Math.round(data.current.temp) + celcius);
                weatherTodayWindElement.text("Wind Speed: " + data.current.wind_speed + " km/h");
                weatherTodayHumidityElement.text("Humidity: " + data.current.humidity + "%");
                weatherTodayUVDisplayElement.text(data.current.uvi);
                weatherTodayUVDisplayElement.addClass(GetUVIndexColour(data.current.uvi));

                fiveDayForecastListElement.empty();

                for (let i = 1; i < 6; i++)
                {
                    AddFiveDayForecastElement(data.daily[i], i);
                }

                if (IsCityAlreadyInPreviousSearches(cityName) == false)
                {
                    AddToPreviousSearches(cityName, weatherApiUrl);
                    SavePreviousSearches();
                }
                
                weatherTodayContainerElement.removeClass("hide");
                weatherTodayContainerElement.addClass("show");

                weatherForecastContainerElement.removeClass("hide");
                weatherForecastContainerElement.addClass("show");
            });
        }
    });
}

function IsCityAlreadyInPreviousSearches(cityName)
{
    for (let i = 0; i < previousSearches.length; i++) 
    {
        if (previousSearches[i] === cityName) return true;
    }
    return false;
}

function AddToPreviousSearches(cityName)
{
    previousSearches.push(cityName);
    
    let newPreviousSearchElement = $("<li class='previousSearchButton'>");
    newPreviousSearchElement.text(cityName);
    newPreviousSearchElement.appendTo(previousSearchesElement);

    $(newPreviousSearchElement).click(GetNameFromButtonClicked);
}

function SavePreviousSearches()
{
    localStorage.setItem("previousSearches", JSON.stringify(previousSearches));
}

function LoadPreviousSearches()
{
    let savedPreviousSearches = JSON.parse(localStorage.getItem("previousSearches"));

    if (savedPreviousSearches)
    {
        for (let i = 0; i < savedPreviousSearches.length; i++)
        {
            AddToPreviousSearches(savedPreviousSearches[i]);
        }
        SavePreviousSearches();
    }
}

function LocationNotFound()
{
    alert("That location couldn't be found");
}

function AddFiveDayForecastElement(weatherData, i)
{
    let newForecastElement = $("<div class='forecastCard col-5 col-md-3 col-lg'>");
    
    let day = moment().add(i, "days");

    let newForecastWeekday = $("<p class='forecastWeekDay'>" + day.format("dddd") + "</p>");
    let newForecastDate = $("<p class='forecastDate'>" + day.format("DD/MM/YY") + "</p>");
    let newForecastIcon = $("<img id='weatherTodayIcon' src='https://openweathermap.org/img/wn/" + weatherData.weather[0].icon + "@2x.png' alt='weatherIcon' width='50' height='50'>");
    let newForecastTemperature = $("<p class='forecastText'>Temp: " + Math.round(weatherData.temp.day) + celcius + "</p>");
    let newForecastWind = $("<p class='forecastText'>Wind: " + weatherData.wind_speed + " km/h</p>");
    let newForecastHumidity = $("<p class='forecastText'>Humidity: " + weatherData.humidity + "%</p>");
    let newForecastUV = $("<p class='forecastText forecastUVText'>UV: </p>");
    let newForecastUVDisplay = $("<p class='forecastText forecastUVDisplay'>" + weatherData.uvi + "</p>");
    newForecastUVDisplay.addClass(GetUVIndexColour(weatherData.uvi));

    newForecastWeekday.appendTo(newForecastElement);
    newForecastDate.appendTo(newForecastElement);
    newForecastIcon.appendTo(newForecastElement);
    newForecastTemperature.appendTo(newForecastElement);
    newForecastWind.appendTo(newForecastElement);
    newForecastHumidity.appendTo(newForecastElement);
    newForecastUV.appendTo(newForecastElement);
    newForecastUVDisplay.appendTo(newForecastElement);

    newForecastElement.appendTo(fiveDayForecastListElement);
}

function GetUVIndexColour(uvi)
{
    if (uvi <= 2) return "uvLow";
    else if (uvi <= 5) return "uvModerate";
    else if (uvi <= 7) return "uvHigh";
    else if (uvi <= 10) return "uvVeryHigh";
    else return "uvExtreme";
}

Init();

$("#searchButton").click(SearchForWeather);