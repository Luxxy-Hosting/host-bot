module.exports = (userID, serverName) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 5,
        "egg": 17,
        "docker_image": "ghcr.io/parkervcp/yolks:python_3.10",
        "startup": "${STARTUP_CMD}",
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },
        "environment": {
            "STARTUP_CMD": "bash",
            "REQUIREMENTS_FILE": "requirements.txt",
            "BOT_PY_FILE": "bot.py",
            "AUTO_UPDATE": 0,
            "USER_UPLOAD": 0,
            "GIT_ADDRESS": null,
            "BRANCH": null,
            "PY_PACKAGES": null,
            "USERNAME": null,
            "ACCESS_TOKEN": null
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