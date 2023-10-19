module.exports = (userID, serverName, location) => {
    return {
        "name": `[Free] ${userID} ${serverName}`,
        "user": userID,
        "nest": 6,
        "egg": 33,
        "docker_image": "danbothosting/aio",
        "startup": "{{STARTUP_CMD}}",
        "limits": {
            "memory": 500,
            "swap": 0,
            "disk": 2048,
            "io": 500,
            "cpu": 50
        },
        "environment": {
            "STARTUP_CMD": "bash"
        },
        "feature_limits": {
            "databases": 0,
            "allocations": 1,
            "backups": 0
        },
        "deploy": {
            "locations": [ 1 ],
            "dedicated_ip": false,
            "port_range": []
        },
        "start_on_completion": false,
        "oom_disabled": false
    }
}