const ObjectsToCsv = require('objects-to-csv');
const exchangeData = require("./gatedata.json");
const candleEngine = {};

let dccAnalysisObject = {
    "Pair":"",
    "DateTime" : "",
    "Last 2 candles color" :"",
    "Last 2 candle close":"",
    "Last 2 candles volume" :"",
    "DCC Color" : "",
    "DCC Candle body %":"",
    "DCC Candle close":"",
    "Next 12 candles percentage":"",
    "Next 12 candles volume":"",
    "Next 12 Candles colors":"",
    "Next 12 candles close":""
}

candleEngine.processCandleData = function(pairsData){
    let possibleEntryPairs = {};
    Object.keys(pairsData).forEach((key)=>{
        possibleEntryPairs[key]= {
            isDojiExists:false,
            allCandle:[]
        }
        let candleData = pairsData[key];
        candleData.forEach(candle=>{
            let _candle = {
                candle,
                color:'',
                bodyPercentage:0,
                isDoji:false
            }
            let candleHeight = Math.abs(candle.h - candle.l);
            _candle.color = candle.c - candle.o > 0 ? "green": "red"
            let body = Math.abs(candle.c - candle.o);
            let bodyPercentage = (body / candleHeight) * 100;
            _candle.bodyPercentage = bodyPercentage;
            //find body percentage to find doji or not 
            if(bodyPercentage < 10){
                _candle.isDoji = true;
                _candle.bodyPercentage = bodyPercentage;
                possibleEntryPairs[key].isDojiExists = true;
                console.log(candle.t)
                var date = new Date(candle.t * 1000).toISOString();
                console.log(date)
                console.log(key)
            }
            possibleEntryPairs[key].allCandle.push(_candle);
        })
        if(!possibleEntryPairs[key].isDojiExists){
            delete possibleEntryPairs[key]
        }
    })
    return possibleEntryPairs

}

candleEngine.studyData = function(pair){
    let data = require(`./temp/${pair}_1h.json`);
    data = data.sort((a, b) => b.t - a.t);
    const dojiMap = {};

    let i = 4;
    let dojiFoundTime = null;
    const allCandle = {};

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
        allCandle[candle.t] = _candle;
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
                dojiMap[dojiFoundTime].nextCandles.push(allCandle[candle.t + 3600]); 
                dojiMap[dojiFoundTime].nextCandles.push(allCandle[candle.t + (3600 * 2)]); 
                dojiMap[dojiFoundTime].nextCandles.push(allCandle[candle.t + (3600 * 3)]); 
                dojiMap[dojiFoundTime].nextCandles.push(allCandle[candle.t + (3600 * 4)]); 
                dojiMap[dojiFoundTime].nextCandles.push(allCandle[candle.t + (3600 * 5)]); 
                dojiMap[dojiFoundTime].nextCandles.push(allCandle[candle.t + (3600 * 6)]); 
                dojiMap[dojiFoundTime].nextCandles.push(allCandle[candle.t + (3600 * 7)]); 
                dojiMap[dojiFoundTime].nextCandles.push(allCandle[candle.t + (3600 * 8)]); 
                dojiMap[dojiFoundTime].nextCandles.push(allCandle[candle.t + (3600 * 9)]); 
                dojiMap[dojiFoundTime].nextCandles.push(allCandle[candle.t + (3600 * 10)]); 
                dojiMap[dojiFoundTime].nextCandles.push(allCandle[candle.t + (3600 * 11)]); 
                dojiMap[dojiFoundTime].nextCandles.push(allCandle[candle.t + (3600 * 12)]); 
            }

        }

        if(time && dojiMap[dojiFoundTime]){
            dojiMap[dojiFoundTime].backCandles.push(_candle); 
            // if(dojiMap[dojiFoundTime].backCandles[1] && dojiMap[dojiFoundTime].backCandles[0]){
            //     if(dojiMap[dojiFoundTime].backCandles[0].color == dojiMap[dojiFoundTime].candle.color
            //         || dojiMap[dojiFoundTime].candle.color ==  dojiMap[dojiFoundTime].nextCandles[0].color
            //         || dojiMap[dojiFoundTime].candle.color == dojiMap[dojiFoundTime].backCandles[1].color){
            //         delete dojiMap[dojiFoundTime];
            //         i = 6;  
            //         dojiFoundTime = null;     
            //     }
            // }
              if(dojiMap[dojiFoundTime].backCandles[0].color == dojiMap[dojiFoundTime].candle.color
                    || dojiMap[dojiFoundTime].candle.color ==  dojiMap[dojiFoundTime].nextCandles[0].color
                    ){
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

    return dojiMap;
}

let allPairDojiData = {};
let ignoreList = ["YFI_USDT","ZEC_USDT","CRU_USDT","BTC_USDT","SNX_USDT","LIT_USDT"]
candleEngine.studyAllPairData = function(callback){
    exchangeData.pairs.forEach(p=>{
        if(ignoreList.indexOf(p.name) < 0)
        allPairDojiData[p.name] = this.studyData(p.name)
    })

    console.log(allPairDojiData)
    callback()
}

candleEngine.createCSVForAnalysis = function(pair){
    let _pair = allPairDojiData[pair];
    let csvData = [];
    Object.keys(_pair).forEach(k=>{
        let dojiCandle = _pair[k];
        let _obj = {...dccAnalysisObject};
        _obj["Pair"] = pair;
        _obj["DateTime"] = dojiCandle.candle.timeInUTC;
        _obj["DCC Color"] = dojiCandle.candle.color;
        _obj["DCC Candle body %"] = dojiCandle.candle.bodyPercentage;
        _obj["DCC Candle close"] = dojiCandle.candle.candle.c;
        _obj["Last 2 candles color"] = `${dojiCandle.backCandles[1].color},${dojiCandle.backCandles[0].color}`;
        _obj["Last 2 candle close"] = `${dojiCandle.backCandles[1].candle.c},${dojiCandle.backCandles[0].candle.c}`;
        _obj["Last 2 candles volume"] = `${dojiCandle.backCandles[1].candle.v},${dojiCandle.backCandles[0].candle.v}`;

        let next12candle_per = [];
        let next12candle_volume = [];    
        let next12candle_close = [];      
        let next12candle_color = [];
        dojiCandle.nextCandles.forEach((c,i)=>{
            if(c && c.candle){
                let nextCandleClose = c.candle.c;
                let dojiCandleClose = dojiCandle.candle.candle.c;
                let diff = nextCandleClose - dojiCandleClose;
                let percentage = Number((diff/dojiCandleClose) * 100).toFixed(2)
                next12candle_per.push(percentage);
                next12candle_volume.push(c.candle.v);
                next12candle_close.push(nextCandleClose);
                next12candle_color.push(c.color)
            }
        })
        
        _obj["Next 12 Candles colors"] = next12candle_color.toString();
        _obj["Next 12 candles close"] = next12candle_close.toString();
        _obj["Next 12 candles percentage"] = next12candle_per.toString();
        _obj["Next 12 candles volume"] = next12candle_volume.toString();
        csvData.push(_obj)
    })

    new ObjectsToCsv(csvData).toDisk(`./${pair}.csv`);
    console.log(csvData)
}

module.exports = candleEngine;
