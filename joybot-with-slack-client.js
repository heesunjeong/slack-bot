var RtmClient = require('slack-client').RtmClient;
var WebClient = require('slack-client').WebClient;
var RTM_EVENTS = require('slack-client').RTM_EVENTS;
var MemoryDataStore = require('slack-client').MemoryDataStore;

var Json = require('json-parser');
var request = require('sync-request');

var config = require('./config.json');

var access_token = config.bot.access_token;

var web = new WebClient(access_token);
var rtm = new RtmClient(access_token, {
  logLevel: 'error',
  dataStore: new MemoryDataStore(),
  autoReconnect: true,
  autoMark: true});

rtm.start();
rtm.on(RTM_EVENTS.MESSAGE, function (message) {
    var channel = message.channel,
    user = message.user,
    text = message.text,
    userInfo = rtm.dataStore.getUserById(user),
    greeting = [];

    if(text != null || text ==''){

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

      if(text.startsWith('#')) {
        console.log(userInfo[0] + " search text : "+text.substring(1));
        if(!text.substring(1)) {
          web.chat.postMessage(channel, "해쉬태그 검색은 #{검색어}로 사용할 수 있어요 ! :sunglasses:", {as_user: true});
        } else {
          var result = searchBySearchkey(encodeURI(text.substring(1)));
          var options = {
            as_user: true,
            attachments: JSON.stringify([{
              "author_name": result.url,
              "author_link": result.url,
              "title": markupToMarkdwn(result.title),
              "title_link": result.link,
              "text": markupToMarkdwn(result.description),
              "footer": "#joybot",
              "mkrdwn": true,
            }])
          }
          web.chat.postMessage(channel, "Searching for `" + text.substring(1) + "`...:mag:", options);
        }
      }

      if(text.startsWith('.오늘날씨')) {
        var result = getCityWeather(true, "seoul").weather[0],
        options = {
          as_user: true,
          attachments: JSON.stringify([{
            "author_name": "Today Seoul's Weather",
            "title": result.main,
            "text": result.description,
            "image_url": getWeatherImage(result.main),
            "footer": "#joybot"
        }])
        }

        web.chat.postMessage(channel, "현재 서울의 날씨를 알려드립니다 ! :dolphin:", options);
      }

      if(text.startsWith('.이번주날씨')) {
        var options, day, result = getCityWeather(false, "seoul").list,
        date = new Date();

        for(var i=0; i < result.length; i++) {
          options = {
            as_user: true,
            attachments: JSON.stringify([{
              "author_name": "Today Seoul's Weather",
              "title": result[i].weather[0].main,
              "text": result[i].weather[0].description,
              "footer": "#joybot"
          }])
          }
          day = date.getDate() + 1 + i;
          web.chat.postMessage(channel,
            date.getFullYear() + "년 " + date.getMonth() + "월 " + day + "일 " +" 서울의 날씨를 알려드립니다 ! :dolphin:", options);
        }
      }

      if(text.startsWith('.기억해')) {
        reminder();
      }
    }
});

/////////////파일 따로 빼기

// 해쉬태그 검색기능
var searchBySearchkey = function(searchKey) {
  var res, info, result,
  serachAPI = 'https://apis.daum.net/search/web?apikey='+ config.daum +'&q={{serachkey}}&output=json&result=1',
  url = serachAPI.replace('{{serachkey}}', searchKey);

  res = request('GET', url);
  info = JSON.parse(res.getBody('utf8'));
  console.log(info.channel.item);

  return info.channel.item[0];
}

// 인사
var replyGreeting = function(msg, reply, userName) {
  {
    var randomNum = Math.floor(( Math.random() * reply.length));

    web.chat.postMessage(msg.channel, reply[randomNum], {as_user: true});
    console.log(userName + " say " + msg.text +" The choose number is " + randomNum);
  }
}

// 오늘날씨 제공
var getCityWeather = function(current, city) {
  var weatherRes, info,
  weatherAPI = 'http://api.openweathermap.org/data/2.5/{{arg}}?q={{city}}&units=metric&APPID=' + config.openWeather;
  if(current) {
    weatherAPI = weatherAPI.replace('{{arg}}', 'weather');
  } else {
    weatherAPI = weatherAPI.replace('{{arg}}', 'forecast/daily');
  }

  url = weatherAPI.replace('{{city}}', 'Seongnam');

  weatherRes = request('GET', url);
  info = JSON.parse(weatherRes.getBody('utf8'));

  console.log(info);
  return info;
  //return info.list[0]
}

// 이미지 검색
var getWeatherImage = function(key) {
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

var reminder = function() {
  var today = new Date();
  var hour= today.getHours();
  var min = today.getMinutes();
  var sec = today.getSeconds();

  if(hour == 21 && min == 10 && sec == 0) {
    console.log("reminder!");
  }

  console.log("hour : " + hour + " min : " + min + " sec : " + sec);

}

var markupToMarkdwn = function(result) {
  result = result.replace(/<b>|<\/b>|&lt;b&gt;|&lt;\/b&gt;/gi, '');

  return result;
}
