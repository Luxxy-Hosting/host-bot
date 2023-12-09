module.exports = (userID, serverName, location) => {
    return {
        "name": `[Free] ${userID} ${serverName}`,
        "user": userID,
        "nest": 3,
        "egg": 13,
        "docker_image": "ghcr.io/luxxy-gf/python_3.10",
        "startup": "./ts3server default_voice_port={{SERVER_PORT}} query_port={{QUERY_PORT}} filetransfer_ip=0.0.0.0 filetransfer_port={{FILE_TRANSFER}} query_http_port={{QUERY_HTTP}} query_ssh_port={{QUERY_SSH}} query_protocols={{QUERY_PROTOCOLS_VAR}} license_accepted=1",
        "limits": {
            "memory": 500,
            "swap": 0,
            "disk": 2048,
            "io": 500,
            "cpu": 50
        },
        "environment": {
            "TS_VERSION": "latest",
            "FILE_TRANSFER": "30033",
            "QUERY_PORT": "10011",
            "QUERY_PROTOCOLS_VAR": "raw,http,ssh",
            "QUERY_SSH": "10022",
            "QUERY_HTTP": "10080"
        },
        "feature_limits": {
            "databases": 0,
            "allocations": 3,
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