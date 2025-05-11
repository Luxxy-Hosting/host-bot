module.exports = (userID, serverName, location) => {
    return {
        serverType: "botserver",
        data: {
        "name": `[Free] ${userID} ${serverName}`,
        "user": userID,
        "nest": 7,
        "egg": 27,
        "docker_image": "ghcr.io/luxxy-gf/python_3.12",
        "startup": "/start.sh",
        "limits": {
            "memory": 500,
            "swap": 0,
            "disk": 2048,
            "io": 500,
            "cpu": 50
        },
        "environment": {
            "start_command1": "pip install -r requirements.txt",
            "start_command2": "python bot.py"
        },
        "feature_limits": {
            "databases": 0,
            "allocations": 1,
            "backups": 0
        },
        "deploy": {
            "locations": [ location ],
            "dedicated_ip": false,
            "port_range": []
        },
        "start_on_completion": false,
        "oom_disabled": false
    }
}
}