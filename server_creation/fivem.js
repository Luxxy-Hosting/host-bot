module.exports = (userID, serverName, location) => {
    return {
        serverType: "gameserver",
        data: {
            "name": `[Free] ${userID} ${serverName}`,
            "user": userID,
            "nest": 6,
            "egg": 18,
            "docker_image": "ghcr.io/luxxy-gf/pterodactyl-fivem",
            "startup": "./start.sh",
            "limits": {
                "memory": 2048,
                "swap": 0,
                "disk": 25600,
                "io": 500,
                "cpu": 200
            },
            "environment": {
                "TXADMIN_PORT": "40120",
                "AUTO_UPDATE": "1",
                "TXADMIN_PROFILE": "defualt",
                "SERVER_HOSTNAME": serverName,
                "STEAM_WEBAPIKEY": "none",
                "FIVEM_LICENSE": "replace_with_your_license",
                "TXADMIN_ENABLE": "1",
                "MAX_PLAYERS": "48",
                "FIVEM_VERSION": "latest",
                "PROVIDER_NAME": "LuxxySystems",
                "PROVIDER_LOGO": "https://avatars.githubusercontent.com/u/100530350?s=400&u=a73c13a41552c9d5d9c7f6d4bf3b656eb839f9e0&v=4"
            },
            "feature_limits": {
                "databases": 1,
                "allocations": 2,
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
