var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var MemoryDataStore = require('@slack/client').MemoryDataStore;

var Json = require('json-parser');
var request = require('sync-request');

var config = require('./config.json');
var ACCESS_TOKEN = config.bot.access_token;

var web = new WebClient(ACCESS_TOKEN);
var rtm = new RtmClient(ACCESS_TOKEN, {
    logLevel: 'error',
    dataStore: new MemoryDataStore(),
    autoReconnect: true,
    autoMark: true
});

rtm.start();
rtm.on(RTM_EVENTS.MESSAGE, function (message) {
    var channel = message.channel,
        user = message.user,
        text = message.text,
        userInfo = rtm.dataStore.getUserById(user),
        greeting = [];

    if (text != null || text == '') {
        if (text == 'hello') {
            greeting = ["Hi " + userInfo.name + " ! :hugging_face:",
                userInfo.name + " ! How are you? :blush:"];
            replyGreeting(message, greeting, userInfo.name);
        }

        if (text == 'hi') {
            greeting = ["Hi :kissing_smiling_eyes:", "Hello :upside_down_face:",
                "Good ! :wink:", ":wave:", "have a good day ~ :ghost:"];
            replyGreeting(message, greeting, userInfo.name);
        }

        /*
         해시태그(#) 검색 기능
         #{검색어}로 입력시 Daum API를 이용하여 검색결과 보여줌.
         */
        if (text.startsWith('#')) {
            console.log(userInfo.name + " search text : " + text.substring(1));
            if (!text.substring(1)) {
                web.chat.postMessage(channel, ":seedling: *Joybot Help Desk* :seedling:\n>>>해쉬태그 검색은 #{검색어}로 사용할 수 있어요 ! :sunglasses:", {as_user: true});
            } else {
                var result = searchBySearchkey(encodeURI(text.substring(1)));
                if (result === "error") {
                    web.chat.postMessage(channel, ":police_car: *Warning ! ! !* :police_car:\n>>>:no_good::no_good::no_good::no_good::no_good::no_good:\n잘못 된 검색어 입니다. 다른 검색어로 검색해주세요.", {as_user: true});
                } else {
                    web.chat.postMessage(channel, "Searching for `" + text.substring(1) + "`...:mag:", {
                        as_user: true,
                        attachments: JSON.stringify([{
                            "author_name": result.url,
                            "author_link": result.url,
                            "title": removeMarkup(result.title),
                            "title_link": result.link,
                            "text": markupToMarkdwn(result.description),
                            "footer": "#joybot",
                            "color": "#ffad33",
                            "mrkdwn_in": ["text"]
                        }])
                    });
                }
            }
        }

        /*
         현재날씨 기능
         .오늘날씨로 입력시 Open Weather API를 이용하여 현재 날씨정보와 날씨에 대한 giphy이미지를 보여줌.
         현재 서울날씨만 제공. 추후에 도시로 검색 가능하도록 수정.
         */
        if (text.startsWith('.오늘날씨')) {
            var result = getCityWeather(true, "seoul").weather[0],
                options = {
                    as_user: true,
                    attachments: JSON.stringify([{
                        "author_name": "Today Seoul's Weather",
                        "title": result.main,
                        "text": result.description,
                        "image_url": getWeatherImage(result.main),
                        "footer": "#joybot",
                        "color": "#ffad33",
                        "mrkdwn_in": ["text"]
                    }])
                }

                console.log(userInfo.name + " search today weather");

            web.chat.postMessage(channel, "현재 판교의 날씨를 알려드립니다 ! :dolphin:", options);
        }

        /*
         앞으로 5일간날씨 기능
         .이번주날씨로 입력시 Open Weather API를 이용하여 앞으로 5일간의 날씨 보여줌.
         현재 서울날씨만 제공. 추후에 도시로 검색 가능하도록 수정.
         */
        if (text.startsWith('.이번주날씨')) {
            var options, calDay, msg = "", now = new Date(), result = getCityWeather(false, "seongnam").list;
            for (var i = 0; i < result.length - 1; i++) {
                calDay = new Date(Date.parse(now) + (i + 1) * 1000 * 60 * 60 * 24);
                msg += (calDay.getMonth() + 1) + "월 " + calDay.getDate() + "일 : ";

                if ((result[i].weather[0].main).includes("Rain")) {
                    msg += ":umbrella_with_rain_drops:";
                } else if ((result[i].weather[0].main).includes("Clear")) {
                    msg += ":dizzy:";
                } else if ((result[i].weather[0].main).includes("Clouds")) {
                    msg += ":cloud:";
                }
                msg += " *" + result[i].weather[0].description + "* _(최고: " + result[i].temp.max + "°C, 최저: " + result[i].temp.min + "°C)_\n";
            };

            console.log(userInfo.name + " search weekly weather");

            web.chat.postMessage(channel, "이번주 판교의 날씨를 알려드립니다 ! :dolphin:\n\n", {
                as_user: true,
                attachments: JSON.stringify([{
                    "author_name": "Weekly Weather Forecast",
                    "text": msg,
                    "footer": "#joybot",
                    "color": "#ffad33",
                    "mrkdwn_in": ["text"]
                }])
            });
        }

        if (text.startsWith('.티타임')) {
            web.chat.postMessage(channel, "<!here|here> 티타임 가실 분 손 ! :raising_hand: \n", {
                as_user: true,
                attachments: JSON.stringify([{
                    "text": "아래 버튼으로 티타임 참석여부를 선택해주세요.",
                    "attachment_type": "default",
                    "actions": [{
                        "name": "ok",
                        "text": "참석 :ok_woman:",
                        "type": "button",
                        "value": "ok",
                        "style": "primary"
                    }, {
                        "name": "no",
                        "text": "불참 :no_good:",
                        "type": "button",
                        "value": "no",
                        "style": "danger",
                        "confirm": {
                          "title": "Are you sure?",
                          "text": userInfo.name + "... 같이 가요..... 티타임.................",
                          "ok_text": "Yes",
                          "dismiss_text": "No"
                        }
                    }],
                    "callback_id": "joybottest",
                    "footer": "#joybot",
                    "color": "#ffad33",
                    "mrkdwn_in": ["text"]
                }])
            });
        }

        if (text.startsWith('.?')) {
          console.log(userInfo.name + " comes help desk");
            web.chat.postMessage(channel, ":seedling: *Joybot Help Desk* :seedling:\n>>>"
                + "`#{검색어}` : 해시태그 검색. 검색어로 검색한 검색결과를 보여줍니다.\n"
                + "`.오늘날씨` : 현재 판교날씨를 이미지와 함께 알려드려요.\n"
                + "`.이번주날씨` : 오늘 이후 5일동안의 날씨를 알려드려요.\n"
                + "`.티타임` : 티타임 참석 인원을 모집합니다.(구현중)\n"
                + "`.계산 {수식}` : 수식을 계산해드립니다.(잘못된 수식은 봇이 죽어요..)", {as_user: true});
        }

        if (text.startsWith('.짤등록')) {
            /* 이미지 첨부시
               <@{userkey}|{username}> uploaded a file: <{imageURI}}|{title}> and commented: {comment}
               형식으로 들어옴
          */
        }

        if (text.startsWith('.계산')) {
            var formula = text.split(" ");
            console.log(userInfo.name + " used calculator : " + formula[1])
            if(formula.length == 2) {
              if(!eval(formula[1])) {
                web.chat.postMessage(channel, ":police_car: *Warning ! ! !* :police_car:\n>>>:no_good::no_good::no_good::no_good::no_good::no_good:\n잘못 된 수식 입니다. 다른 수식으로 검색해주세요.", {as_user: true});
              } else {
                web.chat.postMessage(channel, ">>>" + formula[1] + " = *" + eval(formula[1]) + "*", {as_user: true});
              }
            } else {
              web.chat.postMessage(channel, ":seedling: *Joybot Help Desk* :seedling:\n>>>계산기는 .계산 {수식}으로 사용할 수 있어요 ! :sunglasses:", {as_user: true});
            }
        }

        if (text.startsWith('.기억해')) {
            reminder();
        }
    }
})
;

/////////////파일 따로 빼기

// 해쉬태그 검색기능
var searchBySearchkey = function (searchKey) {
    var res, info, result,
        serachAPI = 'https://apis.daum.net/search/web?apikey=' + config.daum + '&q={{serachkey}}&output=json&result=1',
        url = serachAPI.replace('{{serachkey}}', searchKey);

    res = request('GET', url);
    if (res.statusCode >= 300) {
        return "error";
    }
    info = JSON.parse(res.getBody('utf8'));
    return info.channel.item[0];
}

// 인사
var replyGreeting = function (msg, reply, userName) {
    {
        var randomNum = Math.floor(( Math.random() * reply.length));

        web.chat.postMessage(msg.channel, reply[randomNum], {as_user: true});
        console.log(userName + " say " + msg.text + " The choose number is " + randomNum);
    }
}

// 오늘날씨 제공
var getCityWeather = function (current, city) {
    var weatherRes, info,
        weatherAPI = 'http://api.openweathermap.org/data/2.5/{{arg}}?q={{city}}&units=metric&APPID=' + config.openWeather;
    if (current) {
        weatherAPI = weatherAPI.replace('{{arg}}', 'weather');
    } else {
        weatherAPI = weatherAPI.replace('{{arg}}', 'forecast/daily');
    }

    url = weatherAPI.replace('{{city}}', 'Seongnam');

    weatherRes = request('GET', url);
    info = JSON.parse(weatherRes.getBody('utf8'));

    return info;
}

// 이미지 검색
var getWeatherImage = function (key) {
    var url, result, info,
        imageAPI = 'http://api.giphy.com/v1/gifs/search?q={{key}}&api_key=' + config.giphy;

    if (key === 'clear sky') {
        return 'https://media.giphy.com/media/KlI5X8lg0wINO/giphy.gif';
    } else {
        url = imageAPI.replace('{{key}}', key);
        result = request('GET', url);
        info = JSON.parse(result.getBody('utf8'));
        console.log(info.data[0].images.fixed_height.url);

        return info.data[0].images.fixed_height.url;
    }
}

var reminder = function () {
    var today = new Date();
    var hour = today.getHours();
    var min = today.getMinutes();
    var sec = today.getSeconds();

    if (hour == 21 && min == 10 && sec == 0) {
        console.log("reminder!");
    }

    console.log("hour : " + hour + " min : " + min + " sec : " + sec);

}

var markupToMarkdwn = function (result) {
    result = result.replace(/<b>|<\/b>|&lt;b&gt;|&lt;\/b&gt;/gi, '*');
    result = result.replace(/&#39;/gi, '"')

    return result;
}

var removeMarkup = function (result) {
    result = result.replace(/<b>|<\/b>|&lt;b&gt;|&lt;\/b&gt;/gi, '');

    return result;
}
