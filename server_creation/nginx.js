module.exports = (userID, serverName, location) => {
    return {
        serverType: "botserver",
        data: {
            "name": `[Free] ${userID} ${serverName}`,
            "user": userID,
            "nest": 7,
            "egg": 30,
            "docker_image": "ghcr.io/sigma-production/nginx-ptero:8.4",
            "startup": "{{STARTUP_CMD}}",
            "limits": {
                "memory": 512,
                "swap": 0,
                "disk": 2048,
                "io": 500,
                "cpu": 100
            },
            "environment": {
                "STARTUP_CMD": "./start.sh",
                "WORDPRESS": "0",
                "COMPOSER_MODULES": null,
                "GIT_ADDRESS": null,
                "BRANCH": null,
                "AUTO_UPDATE": "0",
                "USER_UPLOAD": "0",
                "USERNAME": null,
                "ACCESS_TOKEN": null,
                "NAMELESSMC": "0",

            },
            "feature_limits": {
                "databases": 1,
                "allocations": 1,
                "backups": 0
            },
            "deploy": {
                "locations": [location],
                "dedicated_ip": false,
                "port_range": []
            },
            "start_on_completion": false
        }
    }
}