/*
when ever a doji candle forms on 1hr/2hr/4hr, wait for next or subsequent candle to close above or below
if next coming candle closes above the doji - 2/3 % up move will come
if next coming candle closes below the doji - 2/3 % down move will come
*/
var fs = require('fs');
const {pairs} = require("./pairs.js");
const exchangeDetailsgate = require("./exchangeDetailgate");


let dcc_coin_pairs = {};
let i =0;
setInterval(()=>{
    i = 0;
    checkCandleData()
},(1000 * 60 * 60))


function checkCandleData(){
    let pair = pairs[i];
    if(pair){
        let to = Math.floor((new Date()).getTime() / 1000);
        let from = to - (3 * 3600);
        exchangeDetailsgate.getCandleStickData(pair.name,'1h',from,to).then((result)=>{
            if(result && result.data){
                processCandleStickData(pair.name, result.data);
                console.log(pair.name)
            }
        }).catch((error)=>{
            console.log(error)
        })
        setTimeout(()=>{
            i++;
            checkCandleData();
        },1500)
    }
}

function processCandleStickData(pair,data){
    data.pop();
   // data = data.sort((a, b) => b.t - a.t);
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
        if(bodyPercentage < 2 && Number(candle.v) > 5000){
            _candle.isDoji = true;

            if(i < 3 && dojiMap[dojiFoundTime]){
                if(candle.t > dojiMap[dojiFoundTime]._candle.candle.t){
                    dojiMap[dojiFoundTime].nextCandles.push(_candle); 
                }
            }else{
                dojiMap[candle.t] = {
                    _candle,
                    nextCandles:[]
                }
                dojiFoundTime = candle.t;
                i = 3;
                time = null;
            }

        }

        if(time && dojiMap[dojiFoundTime]){
            if(candle.t > dojiMap[dojiFoundTime]._candle.candle.t){
                dojiMap[dojiFoundTime].nextCandles.push(_candle); 
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
        dcc_coin_pairs[pair] = {
            pair:pair,
            value:dojiMap
        };
        console.log(JSON.stringify(dcc_coin_pairs))
        try{
            fs.readFile('doji.json', function(err, data){
                if (err){
                    console.log(err);
                } else {
                obj = JSON.parse(data); //now it an object
                if(!obj || obj == '')
                obj.data = [];
    
                obj.data.push(dcc_coin_pairs[pair]); //add some data
                json = JSON.stringify(obj); //convert it back to json
                fs.writeFile('doji.json', json, function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                }); // write it back 
            }});
        }catch(err){
            console.log(err)
        }

    }
}

checkCandleData();
//processCandleStickData("MINA_USDT",[{"t":1639638000,"o":"3.544","v":33176,"h":"3.569","c":"3.562","l":"3.544"},{"t":1639641600,"o":"3.556","v":79664,"h":"3.556","c":"3.522","l":"3.501"},{"t":1639645200,"o":"3.534","v":39809,"h":"3.534","c":"3.534","l":"3.513"},{"t":1639648800,"o":"3.532","v":20077,"h":"3.558","c":"3.551","l":"3.531"},{"t":1639652400,"o":"3.549","v":89750,"h":"3.59","c":"3.541","l":"3.506"},{"t":1639656000,"o":"3.547","v":3326,"h":"3.554","c":"3.55","l":"3.547"}])
module.exports = {
    getDCCData:function(){
        return dcc_coin_pairs;
    }
}
