class MarketData {
    constructor(){
        this.availablePairs = [];
        this.candleStickData_i30m = {};
        this.candleStickData_i1h = {};
        this.movingAvgData_i1h = {};
        this.possibleEntryData = {};
    }

    getAvailablePairs(){
        return this.availablePairs;
    }

    setAvailablePairs(data){
        this.availablePairs = data;
    }

    getCandleStickData_i30m(){
        return this.candleStickData_i30m;
    }

    setCandleStickData_i30m(data){
        this.candleStickData_i30m = data;
    }

    getCandleStickData_i1h(){
        return this.candleStickData_i1h;
    }

    setCandleStickData_i1h(data){
        this.candleStickData_i1h = data;
    }

    getMovingAvgData_i1h(){
        return this.movingAvgData_i1h;
    }

    setMovingAvgData_i1h(data){
        this.movingAvgData_i1h = data;
    }

    getPossibleEntryData(){
        return this.possibleEntryData;
    }

    setPossibleEntryData(data){
        this.possibleEntryData = data;
    }
}


module.exports = MarketData;
