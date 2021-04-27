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
