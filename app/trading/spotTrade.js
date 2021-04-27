const {performance} = require('perf_hooks');
const config = require("../system/config.js");

class spotTrade {
    constructor() {
        this.id = null;
        this.symbol = null;

        // just to make sure the settings array is populated correctly (see this.settings comment)
        this.default_settings = {
            "ID": null,
            "SYMBOL": null,
        };
        // checkout app/system/config.js for more info on this and why i do it
        this.settings = new config(this.default_settings);
    }

    // the config for each symbol pair and its "thresholds" will be coming in from
    // an external source, db, yaml, etc. so we need a way to hydrate the class. im
    // keeping it simple by just using the "settings" array to hydrate everything
    hydrate(config) {
        this.settings.load(config);
        this.id = this.settings.get("ID");
        this.symbol = this.settings.get("SYMBOL");
        return this;
    }

    // this function gets called for each "update" as long as its not running currently
    // the event also checks if its in a running state or not. but i would prefer having a super duper way of knowing
    // so i double check it
    async run(price) {
        if (this.running){
            console.log("already running " + this.id + " for symbol " + this.symbol);
            return false;
        }
        // set this symbol config whatever to a running state
        this.running = true;
        try {
            let timer_start = performance.now()

            // just testing stuff.
            // the logic for each "step" will be in this format.
            // so like fetch api info from the fancy api as step1, step2 will be action on it etc
            let price1 = await this.setTest1(price,7);

            let timer_end = performance.now();
            var time_taken = timer_end - timer_start;
            console.log("ran " + this.id + " for symbol " + this.symbol + " | price: " + price + " | timer: "+ time_taken + " | price1:" + price1);

        } catch (error) {
            // should add a timeout to it so that it doesnt run again for x seconds.
            // but i was too lazy to do it...
            console.log(error.message);
        } finally {
            // if it fails or succeeds then we want to allow it to run again...
            this.running = false;
        }

    }

    // logic for each "step" will be in functions like this. so fetching api info
    // checking local db etc etc etc. i "think" my logic is sound that it should let the other jobs run while its
    // waiting for stuff
    async setTest1(price,add_to_price) {
        return new Promise((resolve, reject) => {
            if (price) {

                let fake_io = Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);
                // faking some io
                setTimeout(function(){
                    // the price is a string. so im just concatenating more of a string to it with the 7 and fake_io for perf checking
                    let ret = price + " | " + add_to_price + " | " + fake_io
                    resolve(ret);
                },fake_io)

            } else {
                reject(new Error("no price set inb setTest1. i hate you"));
            }
        });
    }
}

module.exports = spotTrade;
