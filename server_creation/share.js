module.exports = (userID, serverName, location) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 7,
        "egg": 49,
        "docker_image": "quay.io/parkervcp/pterodactyl-images:debian_nodejs-14",
        "startup": "/usr/local/bin/node /home/container/src/index.js",
        "environment": {
            "DATABASE_URI": "mongodb://localhost:27017/share",
            "SESSION_SECRET": "auhsdfhuafsa89423198",
            "TITLE": "Share",
            "SHORT_TITLE": "Luxxy hosting",
            "FULL_DOMAIN": "http://n2.luxxy.tech",
            "FOOTER_TEXT": "Luxxy hosting",
            "DESC": "Luxxy hosting",
            "SENDGRID_API_KEY": "sendgrid",
            "EMAIL_DOMAIN": "m.maildomain.com",
            "EMAIL_FROM": "Share",
            "FILE_CHECK": "true",
            "CREDIT": "true",
            "SHOW_VERSION": "true",
            "SIGNUPS": "true",
            "OWNER": "true",
            "LOGGER": "true",
            "PORT": "123",
            "JWT_SECRET": "sadjiuiasdfbiufadsbuifas"
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