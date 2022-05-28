module.exports = (userID, serverName, location) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 7,
        "egg": 35,
        "docker_image": "quay.io/parkervcp/pterodactyl-images:base_debian",
        "startup": "./gitea web -p {{SERVER_PORT}} -c ./app.ini",
        "environment": {
            "DISABLE_SSH": "true",
            "SSH_PORT": "2020"
        },
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
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
        "start_on_completion": false,
        "oom_disabled": false
    }
}