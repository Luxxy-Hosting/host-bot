module.exports = (userID, serverName, location) => {
    return {
        serverType: "gameserver",
        data: {
            "name": `[Free] ${userID} ${serverName}`,
            "user": userID,
            "nest": 1,
            "egg": 21,
            "docker_image": "ghcr.io/parkervcp/yolks:debian",
            "startup": "./bedrock_server",
            "limits": {
                "memory": 1024,
                "swap": 0,
                "disk": 10240,
                "io": 500,
                "cpu": 350
            },
            "environment": {
                "BEDROCK_VERSION": "latest",
                "LD_LIBRARY_PATH": ".",
                "SERVERNAME": "Bedrock Dedicated Server",
                "GAMEMODE": "survival",
                "DIFFICULTY": "easy",
                "CHEATS": "false",
                "WORLDNAME": "world"
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