// this is a pattern i kinda like so including it here for this
// usage would be this.settings.get("ROOT.NEXT.KEY") for a multidimensional array
// pass it a default config and then load your "changes" via load
// in my server side stuff the default array dictates what keys can be loaded from .,load()
// but im once again going for lazy here and just expanding. (too lazy to do recursive replacing)

class Config {
    constructor(default_config) {
        this._default = default_config;
    }
    load(config) {
        this._config = config;
        this.config = Object.assign(Object.assign({}, this._default), this._config);
    }
    get(key, default_value = null) {
        if (!key) {
            return this.config;
        }
        let parts = key.split(".");
        let val = this.config;
        for (let p of parts) {
            if (p in val) {
                val = val[p];
            }
            else {
                val = default_value;
                break;
            }
        }
        return val;
    }
}
module.exports = Config;
