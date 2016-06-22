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

      if(text.startsWith('.오늘날씨')) {
        var result = getCityWeather("seoul");
        var weatherImg;

        var options = {
          as_user: true,
          attachments: JSON.stringify([{
            "author_name": "Today Seoul's Weather",
            "title": result.main,
            "text": result.description,
            "image_url": getWeatherImage(result.main),
            "footer": "#joybot"
        }])
        }

        web.chat.postMessage(channel, "오늘 서울의 날씨를 알려드립니다 ! :dolphin:", options);
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
var getCityWeather = function(city) {
  var weatherRes, info,
  weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?q={{city}}&APPID=' + config.openWeather;

  url = weatherAPI.replace('{{city}}', 'Seoul');

  weatherRes = request('GET', url);
  info = JSON.parse(weatherRes.getBody('utf8'));

  console.log(info);
  return info.weather[0];
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

var markupToMarkdwn = function(result) {
  result = result.replace(/<b>|<\/b>/gi, '');

  return result;
}
