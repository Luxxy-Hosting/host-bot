module.exports = (userID, serverName, location) => {
    return {
        "name": `[Free] ${userID} ${serverName}`,
        "user": userID,
        "nest": 6,
        "egg": 55,
        "docker_image": "ghcr.io/parkervcp/yolks:bun_latest",
        "startup": "if [[ -d .git ]]; then git pull; fi; if [[ ! -z ${BUN_PACKAGES} ]]; then bun install ${BUN_PACKAGES}; fi; if [[ ! -z ${RMBUN_PACKAGES} ]]; then bun remove ${RMBUN_PACKAGES}; fi; if [ -f /home/container/package.json ]; then bun install; fi; bun run {{MAIN_FILE}}",
        "environment": {
            "GIT_ADDRESS": "",
            "USER_UPLOAD": "0",
            "AUTO_UPDATE": "0",
            "MAIN_FILE": "index.js",
            "BUN_PACKAGES": "",
            "RMBUN_PACKAGES": "",
            "BRANCH": "",
            "USERNAME": "",
            "ACCESS_TOKEN": ""
        },
        "limits": {
            "memory": 512,
            "swap": 0,
            "disk": 2048,
            "io": 500,
            "cpu": 50
        },
        "feature_limits": {
            "databases": 0,
            "allocations": 1,
            "backups": 0
        },
        "deploy": {
            "locations": [ 3 ],
            "dedicated_ip": false,
            "port_range": []
        },
        "start_on_completion": false,
        "oom_disabled": false
    }
}