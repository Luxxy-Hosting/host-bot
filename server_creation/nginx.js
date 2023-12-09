module.exports = (userID, serverName, location) => {
    return {
        "name": `[Free] ${userID} ${serverName}`,
        "user": userID,
        "nest": 6,
        "egg": 50,
        "docker_image": "ghcr.io/sigma-production/nginx-ptero:8.1",
        "startup": "./start.sh; if [[ ! -z ${COMPOSER_MODULES} ]]; then composer require ${COMPOSER_MODULES} --working-dir=/home/container/webroot; fi;",
        "limits": {
            "memory": 500,
            "swap": 0,
            "disk": 2048,
            "io": 500,
            "cpu": 50
        },
        "environment": {
            "WORDPRESS": "0",
            "COMPOSER_MODULES": "",
            "GIT_ADDRESS": "",
            "BRANCH": "",
            "AUTO_UPDATE": "0",
            "USER_UPLOAD": "0",
            "USERNAME": "",
            "ACCESS_TOKEN": ""

        },
        "feature_limits": {
            "databases": 1,
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