module.exports = (userID, serverName) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 5,
        "egg": 33,
        "docker_image": "quay.io/yajtpg/pterodactyl-images:nodejs-17",
        "startup": "/start.sh",
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },
        "environment": {
            "STARTUP_CMD": "npm install --save --production",
            "SECOND_CMD": "node ."
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