module.exports = (userID, serverName, location) => {
    return {
        "name": `[Free] ${userID} ${serverName}`,
        "user": userID,
        "nest": 6,
        "egg": 53,
        "docker_image": "ghcr.io/parkervcp/apps:uptimekuma",
        "startup": `if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then npm run setup; fi; /usr/local/bin/node /home/container/server/server.js --port={{SERVER_PORT}}`,
        "environment": {
            "GIT_ADDRESS": "https://github.com/louislam/uptime-kuma",
            "JS_FILE": "server/server.js",
            "AUTO_UPDATE": "1"
        },
        "limits": {
            "memory": 512,
            "swap": 0,
            "disk": 2048,
            "io": 500,
            "cpu": 50
        },
        "feature_limits": {
            "databases": 0,
            "allocations": 1,
            "backups": 0
        },
        "deploy": {
            "locations": [ 3 ],
            "dedicated_ip": false,
            "port_range": []
        },
        "start_on_completion": false,
        "oom_disabled": false
    }
}