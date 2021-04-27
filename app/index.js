const events = require('events');
const Binance = require('node-binance-api');
const binance = new Binance();
binance.options({
    APIKEY: 'xxx',
    APISECRET: 'xxx',
    useServerTime: true,
    recvWindow: 60000,
    verbose: true,
    log: log => {
        console.log(log); // You can create your own logger here, or disable console output
    }
});
const spot = require("./trading/spotTrade");
// setting up a list of "trade" classes. each class will be used with its own settings and it will be triggered with .run()
// creating 3 "configs" of the same symbol pair
let traders = [
    new spot().hydrate({
        "ID": 'BNBUSDT-1',
        "SYMBOL": "BNBUSDT",
    }),
    new spot().hydrate({
        "ID": 'BNBUSDT-2',
        "SYMBOL": "BNBUSDT",
    }),
    new spot().hydrate({
        "ID": 'BNBUSDT-3',
        "SYMBOL": "BNBUSDT",
    }),
];
// we are only registering for the symbols we want
let interested_symbols = [];
const tradeEmitter = new events.EventEmitter();
// creating an event for each trade, trade.<symbol>.
traders.forEach(function (trade_obj) {
    let event_name = "trade." + trade_obj.symbol.toLowerCase();
    console.log(event_name);
    tradeEmitter.on(event_name, (price) => {
        if (!trade_obj.running){
            trade_obj.run(price);
        }
    });
    // adding symbols to the list of interested symbols. #savebandwidth
    if (interested_symbols.indexOf(trade_obj.symbol.toUpperCase()) === -1) {
        interested_symbols.push(trade_obj.symbol.toUpperCase());
    }
});

console.info(interested_symbols);

// we run the websocket guy. still need to figure out which we want to use for what
binance.websockets.trades(interested_symbols, (trades) => {
    let {e: eventType, E: eventTime, s: symbol, p: price, q: quantity, m: maker, a: tradeId} = trades;
    tradeEmitter.emit('trade.' + symbol.toLowerCase(), price);
});
