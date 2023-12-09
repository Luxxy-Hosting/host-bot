module.exports = (userID, serverName, location) => {
    return {
        "name": `[Free] ${userID} ${serverName}`,
        "user": userID,
        "nest": 1,
        "egg": 2,
        "docker_image": "ghcr.io/pterodactyl/yolks:java_18",
        "startup": "java -Xms128M -XX:MaxRAMPercentage=95.0 -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}",
        "limits": {
            "memory": 3072,
            "swap": 0,
            "disk": 15240,
            "io": 500,
            "cpu": 150
        },
        "environment": {
            "MINECRAFT_VERSION": "latest",
            "SERVER_JARFILE": "server.jar",
            "DL_PATH": null,
            "BUILD_NUMBER": "latest"
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
