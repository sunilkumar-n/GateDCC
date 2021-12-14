const axios = require("axios");

const AllContractsUrl = "https://api.gateio.ws/api/v4/futures/usdt/contracts";
const candleStickUrl = "https://api.gateio.ws/api/v4/futures/usdt/candlesticks?";

const exchange_details_gate ={

}

exchange_details_gate.getFuturesData =async function(){
    return await axios.get(AllContractsUrl)
}

exchange_details_gate.getCandleStickData = async function(contract,interval,from,to){
    return await axios.get(`${candleStickUrl}contract=${contract}&&interval=${interval}&&from=${from}&&to=${to}`)
}

module.exports = exchange_details_gate;
