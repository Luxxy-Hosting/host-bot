module.exports = (userID, serverName, location) => {
    return {
        serverType: "gameserver",
        data: {
            "name": `[Free] ${userID} ${serverName}`,
            "user": userID,
            "nest": 1,
            "egg": 19,
            "docker_image": "ghcr.io/pterodactyl/yolks:java_21",
            "startup": "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}",
            "limits": {
                "memory": 3072,
                "swap": 0,
                "disk": 15240,
                "io": 500,
                "cpu": 350
            },
            "environment": {
                "SERVER_JARFILE": "server.jar",
                "MC_VERSION": "latest",
                "FABRIC_VERSION": "latest",
                "LOADER_VERSION": "latest"
            },
            "feature_limits": {
                "databases": 1,
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
}