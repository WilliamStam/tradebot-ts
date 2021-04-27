const events = require('events');
const Binance = require('node-binance-api');
const binance = new Binance();
// all this will go into a config. so each symbol settings will link to a "api" id (ie: "binance-william" and then use that for its actions
// but keeping it simple for now
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
    // i like using events for something like this. this registers each "class" to action on the event.
    // dont know what its called
    tradeEmitter.on(event_name, (price) => {
        // dont want it triggering the same "buy" / "sell" condition cause the websocket feeds us too much infos
        // too quickly. so we limit it to only be able to be ina  running state or not for single execution
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

// we run the websocket guy. still need to figure out which we want to use for what. coppied from the github page. looks like
// it gives me a price so... stupid me thinks this is important
binance.websockets.trades(interested_symbols, (trades) => {
    let {e: eventType, E: eventTime, s: symbol, p: price, q: quantity, m: maker, a: tradeId} = trades;
    tradeEmitter.emit('trade.' + symbol.toLowerCase(), price);
});
