const {pairs} = require("./pairs.js");
const exchangeDetailsgate = require("./exchangeDetailgate");

var sendNotification = function(data) {
    var headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Basic NGEwMGZmMjItY2NkNy0xMWUzLTk5ZDUtMDAwYzI5NDBlNjJj"
    };
    
    var options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: headers
    };
    
    var https = require('https');
    var req = https.request(options, function(res) {  
      res.on('data', function(data) {
        console.log("Response:");
        console.log(JSON.parse(data));
      });
    });
    
    req.on('error', function(e) {
      console.log("ERROR:");
      console.log(e);
    });
    
    req.write(JSON.stringify(data));
    req.end();
  };
  
  var message = { 
    app_id: "5eb5a37e-b458-11e3-ac11-000c2940e62c",
    contents: {"en": "English Message"},
    included_segments: ["Subscribed Users"]
  };
  

let dcc_coin_pairs = {};
let i =0;
setInterval(()=>{
    i = 0;
    checkCandleData()
},(1000 * 60 * 55))


function checkCandleData(){
    let pair = pairs[i];
    if(pair){
        let to = Math.floor((new Date()).getTime() / 1000);
        let from = to - (4 * 3600);
        exchangeDetailsgate.getCandleStickData(pair.name,'1h',from,to).then((result)=>{
            processCandleStickData(pair.name, result.data);
            console.log(result.data)
            setTimeout(()=>{
                i++;
                checkCandleData();
            },2000)
        }).catch((error)=>{
            console.log(error)
        })
    }
}

function processCandleStickData(pair,data){
    data = data.sort((a, b) => b.t - a.t);
    let dojiMap = {};

    let i = 4;
    let dojiFoundTime = null;

    data.forEach(candle=>{
        let time = candle.t;
        let _candle = {
            candle,
            color:'',
            bodyPercentage:0,
            isDoji:false,
            timeInUTC:null,
            volume:0
        }
        let candleHeight = Math.abs(candle.h - candle.l);
        _candle.color = candle.c - candle.o > 0 ? "green": "red"
        let body = Math.abs(candle.c - candle.o);
        let bodyPercentage = (body / candleHeight) * 100;
        _candle.bodyPercentage = bodyPercentage;

        _candle.isDoji = false;
        _candle.bodyPercentage = bodyPercentage;
        _candle.timeInUTC = new Date(candle.t * 1000).toISOString();
        _candle.volume = candle.v;
        //find body percentage to find doji or not 
        if(bodyPercentage < 3){
            _candle.isDoji = true;

            if(i < 3){
                time = null;
                dojiMap[dojiFoundTime].backCandles.push(_candle); 
            }else{
                dojiMap[candle.t] = {
                    candle:_candle,
                    nextCandles:[],
                    backCandles:[]
                }
                dojiFoundTime = candle.t;
                i = 3;
                time = null;
            }

        }

        if(time && dojiMap[dojiFoundTime]){
            dojiMap[dojiFoundTime].backCandles.push(_candle); 
              if(dojiMap[dojiFoundTime].backCandles[0].color == dojiMap[dojiFoundTime].candle.color){
                    delete dojiMap[dojiFoundTime];
                    i = 4;  
                    dojiFoundTime = null;     
                }

        }
        
        if(i < 4){
            i--;
            if(i === 0){
                i = 4;   
                dojiFoundTime = null;      
            }

        }

    })

    if(Object.keys(dojiMap).length >0){
        sendNotification(`DCC forming for pair:${pair}`);
        sendNotification({
            app_id: "5eb5a37e-b458-11e3-ac11-000c2940e62c",
        contents: {"en": "DCC forming for :"+pair},
        included_segments: ["Subscribed Users"]    
        });
        JSON.stringify(dojiMap)
        dcc_coin_pairs[pair] = dojiMap;
    }
}

module.exports = {
    getDCCData:function(){
        return dcc_coin_pairs;
    }
}
