module.exports = (userID, serverName, location, memory) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 1,
        "egg": 3,
        "docker_image": "ghcr.io/pterodactyl/yolks:java_17",
        "startup": "java -Xms128M -Xmx{{SERVER_MEMORY}}M -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}",
        "limits": {
            "memory": memory,
            "swap": 0,
            "disk": 32240,
            "io": 500,
            "cpu": 0
        },
        "environment": {
            "MINECRAFT_VERSION": "latest",
            "SERVER_JARFILE": "server.jar",
            "DL_PATH": "https://papermc.io/api/v2/projects/paper/versions/1.18.1/builds/214/downloads/paper-1.18.1-214.jar",
            "BUILD_NUMBER": "latest"
        },
        "feature_limits": {
            "databases": 2,
            "allocations": 1,
            "backups": 10
        },
        "deploy": {
            "locations": location,
            "dedicated_ip": false,
            "port_range": []
        },
        "start_on_completion": false
    }
}