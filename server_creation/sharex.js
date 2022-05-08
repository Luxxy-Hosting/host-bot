module.exports = (userID, serverName) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 7,
        "egg": 48,
        "docker_image": "quay.io/parkervcp/pterodactyl-images:debian_nodejs-14",
        "startup": `/usr/local/bin/node /home/container/src/index.js`,
        "environment": {},
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },
        "feature_limits": {
            "databases": 0,
            "allocations": 1,
            "backups": 0
        },
        "deploy": {
            "locations": [ 1, 2 ],
            "dedicated_ip": false,
            "port_range": []
        },
        "start_on_completion": false,
        "oom_disabled": false
    }
}