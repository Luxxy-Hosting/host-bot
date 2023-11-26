module.exports = (userID, serverName, location) => {
    return {
        "name": `[Free] ${userID} ${serverName}`,
        "user": userID,
        "nest": 6,
        "egg": 41,
        "docker_image": "ghcr.io/luxxy-gf/nodejs_20",
        "startup": "/start.sh",
        "limits": {
            "memory": 500,
            "swap": 0,
            "disk": 2048,
            "io": 500,
            "cpu": 50
        },
        "environment": {
            "start_command1": "npm install --save --production",
            "start_command2": "node ."
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