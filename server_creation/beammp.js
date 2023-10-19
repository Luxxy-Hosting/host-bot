module.exports = (userID, serverName, location) => {
    return {
        "name": `[Free] ${userID} ${serverName}`,
        "user": userID,
        "nest": 6,
        "egg": 37,
        "docker_image": "ghcr.io/parkervcp/yolks:debian",
        "startup": "./BeamMP-Server",
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 15240,
            "io": 500,
            "cpu": 150
        },
        "environment": {
            "NAME": "BeamMP Server",
            "DESCRIPTION": "BeamMP Default Description",
            "VERSION": "latest",
            "AUTHKEY": "put key here",
            "MAX_PLAYERS": "6",
            "PRIVATE": "false",
            "MAX_CARS": "1",
            "MAP": "/levels/gridmap_v2/info.json",
            "LOGCHAT": "true",
            "MATCH": "Server-debian"
        },
        "feature_limits": {
            "databases": 0,
            "allocations": 1,
            "backups": 0
        },
        "deploy": {
            "locations": location,
            "dedicated_ip": false,
            "port_range": []
        },
        "start_on_completion": false
    }
}