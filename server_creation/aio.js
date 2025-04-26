module.exports = (userID, serverName, location) => {
    return {
        serverType: "botserver",
        data: {
            "name": `[Free] ${userID} ${serverName}`,
            "user": userID,
            "nest": 7,
            "egg": 23,
            "docker_image": "danbothosting/aio",
            "startup": "{{STARTUP_CMD}}",
            "limits": {
                "memory": 512,
                "swap": 0,
                "disk": 2048,
                "io": 500,
                "cpu": 100
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
                "locations": [ location ],
                "dedicated_ip": false,
                "port_range": []
            },
            "start_on_completion": false
        }
    }
}