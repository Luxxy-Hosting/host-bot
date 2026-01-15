module.exports = (userID, serverName, location) => {
    return {
        serverType: "gameserver",
        data: {
            "name": `[Free] ${userID} ${serverName}`,
            "user": userID,
            "nest": 1,
            "egg": 44,
            "docker_image": "ghcr.io/luxxy-gf/temurin-25:latest",
            "startup": "./start.sh",
            "limits": {
                "memory": 3072,
                "swap": 0,
                "disk": 15360,
                "io": 500,
                "cpu": 200
            },
            "environment": {
                "ASSETS_PATH": "Assets.zip",
                "AUTH_MODE": "authenticated",
                "ACCEPT_EARLY_PLUGINS": 0,
                "ALLOW_OP": 0,
                "ENABLE_BACKUPS": 0,
                "BACKUP_DIR": "backups",
                "BACKUP_FREQUENCY": 60
            },
            "feature_limits": {
                "databases": 1,
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
