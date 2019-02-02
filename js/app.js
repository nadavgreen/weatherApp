const GETRequest = (url, cb) => {
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.addEventListener('load', response => {
        const data = JSON.parse(response.currentTarget.response);
        cb(data)
    });
    request.send();
}

const getGifs = (search, cb) => {
    if (search === "" || search.trim() === "") {
        return;
    }

    const api_key = 'siIyo4w5mg0REENX76Sr57QTgkt3BWvY';
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${api_key}&q=${search}`;

    GETRequest(url, data => {
        const gifArray = [];
        data.data.forEach(currentGif => {
            const url = currentGif.images.original.url;
            gifArray.push(url);
        });

        cb(gifArray);
    });
}

const getWeather = (lat, lng, cb) => {
    // TODO; apply some validation to lat, lng

    const URL_BASE = 'https://wt-taqqui_karim-gmail_com-0.sandbox.auth0-extend.com/darksky'
    const api_key = `d195905a8d2ebf4593e1ba9477ff23b5`;
    const url = `${URL_BASE}?api_key=${api_key}&lat=${lat}&lng=${lng}`

    GETRequest(url, data => {
        console.log(data);
        const forecast = JSON.parse(data.res.text);
        cb(forecast);
    });
}


const state = {
    locations:[{
        lat: 37.8267,
        lng: -122.4233,
        lastUpdated: 1544375218298,
        forecast:[{"icon":"partly-cloudy-day","hi":54.93,"lo":49.09,"desc":"Mostly cloudy throughout the day.","datetime":1544342400,"day":"Sunday"},{"icon":"partly-cloudy-day","hi":56.13,"lo":46.48,"desc":"Mostly cloudy until afternoon.","datetime":1544428800,"day":"Sunday"},{"icon":"partly-cloudy-day","hi":57.01,"lo":52.39,"desc":"Partly cloudy throughout the day.","datetime":1544515200,"day":"Sunday"},{"icon":"partly-cloudy-day","hi":58.32,"lo":49.18,"desc":"Partly cloudy until evening.","datetime":1544601600,"day":"Sunday"},{"icon":"partly-cloudy-night","hi":57.75,"lo":50.33,"desc":"Partly cloudy starting in the evening.","datetime":1544688000,"day":"Sunday"},{"icon":"partly-cloudy-day","hi":56.34,"lo":46.92,"desc":"Mostly cloudy until evening.","datetime":1544774400,"day":"Sunday"},{"icon":"partly-cloudy-day","hi":53.98,"lo":50.3,"desc":"Mostly cloudy throughout the day.","datetime":1544860800,"day":"Sunday"},{"icon":"rain","hi":55.94,"lo":55.94,"desc":"Rain and breezy until afternoon.","datetime":1544947200,"day":"Sunday"}],
    },],
    gifs: {
        'not-loaded': 'https://media1.giphy.com/media/3o7bu3XilJ5BOiSGic/giphy.gif',
    },
}

const getDayName = (datetime) => {
    const day = new Date(datetime*1000).getDay();
    const days = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"]
    return days[day] + "day";
}

const renderForecastItem = (forecastItem, state, index) => {
    const day = getDayName(forecastItem.datetime)
    let iconURL = state.gifs[forecastItem.icon];
    if (typeof iconURL === "undefined") {
        iconURL = state.gifs['not-loaded']
    }
    return `<div class="column">
        <div class="ui card fluid">
            <div class="image">
            <img src="${iconURL}">
            </div>
            <div class="content">
            <a class="header">${Math.floor(forecastItem.hi)} &deg; F / ${Math.floor(forecastItem.lo)} &deg; F</a>
            <div class="meta">
                <span class="date">${day}</span>
            </div>
            <div class="description">
                ${forecastItem.desc}
            </div>
            </div>
        </div>
    </div>`;
}

const render = state => {    
    const weatherContainer = document.querySelector('.js-weather');
    let html = '';
    for (let location of state.locations) {
        let forecastHTML = '';

        for (let i = 0; i < 5; i++) {
            let forecastItem = location.forecast[i];
            forecastHTML += renderForecastItem(forecastItem, state);
        }
        
        html += `<div class="ui five column grid centered">
            <h1 style="width:100%;">${location.lat}, ${location.lng}</h1>
            ${forecastHTML}
        </div>`;
    }

    weatherContainer.innerHTML = html;
}
render(state)

const searchBtn = document.querySelector('.js-search');
const locationInput = document.querySelector('.js-input');

searchBtn.addEventListener('click', e => {
    const val = locationInput.value;
    locationInput.value = "";
    
    const parts = val.split(',');
    const lat = Number(parts[0].trim());
    const lng = Number(parts[1].trim());

    // getWeather(lat, lng, data => {
    getWeather(lat, lng, data => {
        console.log(data)
        let arr = [];
        for(let i = 0; i < data.daily.data.length; i++){
            let obj = {
                hi: data.daily.data[i].temperatureHigh,
                lo: data.daily.data[i].temperatureLow,
                desc: data.daily.data[i].summary,
                datetime: data.daily.data[i].time,
                day: getDayName(data.daily.data[i].time),
                icon: data.daily.data[i].icon,
            };
            arr.push(obj);
            if(typeof state.gifs[data.daily.data[i].icon] === 'undefined') {
                getGifs(arr[i].icon, data => {
                    state.gifs[arr[i].icon] = data[0];
                    render(state);
                })
            }
        }
        state.locations.unshift({
            lat: data.latitude,
            lng: data.longitude,
            lastUpdated: data.daily.time,
            forecast: arr,
        })
        console.log(state.locations)
        render(state)
    });
});