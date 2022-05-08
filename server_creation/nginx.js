module.exports = (userID, serverName) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 6,
        "egg": 25,
        "docker_image": "registry.gitlab.com/tenten8401/pterodactyl-nginx",
        "startup": `{{STARTUP_CMD}}`,
        "environment": {
            "STARTUP_CMD": "./start.sh"
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
            "locations": [ 1, 2 ],
            "dedicated_ip": false,
            "port_range": []
        },
        "start_on_completion": false,
        "oom_disabled": false
    }
}