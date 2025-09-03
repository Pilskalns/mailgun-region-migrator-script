const { buildStorage } = require("axios-cache-interceptor");
const nodePersist = require("node-persist");

function createCacheStorage() {
    nodePersist.initSync({ dir: './cache', ttl: 1000 * 60 * 60 * 24 }); // 1 day default TTL

    return buildStorage({
        async find(key) {
            const val = await nodePersist.getItem(key);
            return val === undefined ? undefined : val;
        },
        async set(key, value) {
            await nodePersist.setItem(key, value);
        },
        async remove(key) {
            await nodePersist.removeItem(key);
        },
        async clear() {
            await nodePersist.clear();
    }
    });
}

module.exports = createCacheStorage;