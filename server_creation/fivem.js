module.exports = (owner_uuid, serverName, locationID) => {
    // Translation fallback for location
    const locMap = { 1: "d5c51f13-962a-4c2a-9b02-abd87ab28935" };
    const locUUID = locMap[locationID] || "d5c51f13-962a-4c2a-9b02-abd87ab28935";

    return {
        serverType: "gameserver",
        data: {
            name: `[Free] ${owner_uuid} ${serverName}`,
            owner_uuid: owner_uuid,
            egg_uuid: "c13d849a-2a8b-4b06-9ced-7a1037ff277d",
            image: "ghcr.io/luxxy-gf/pterodactyl-fivem",
            startup: "./start.sh",
            limits: {
                memory: 2048,
                swap: 0,
                disk: 25600,
                io_weight: 500,
                cpu: 200,
                memory_overhead: 0
            },
            feature_limits: {
                databases: 1,
                allocations: 2,
                backups: 0,
                schedules: 0
            },
            deployment: {
                location_uuids: [ locUUID ],
                allow_overallocation: true
            },
            start_on_completion: false,
            skip_installer: false,
            hugepages_passthrough_enabled: false,
            kvm_passthrough_enabled: false,
            pinned_cpus: [],
            variables: [
          {
                    "env_variable": "TXADMIN_PORT",
                    "value": "40120"
          },
          {
                    "env_variable": "AUTO_UPDATE",
                    "value": "1"
          },
          {
                    "env_variable": "TXADMIN_PROFILE",
                    "value": "defualt"
          },
          {
                    "env_variable": "SERVER_HOSTNAME",
                    "value": "SERVER_NAME"
          },
          {
                    "env_variable": "STEAM_WEBAPIKEY",
                    "value": "none"
          },
          {
                    "env_variable": "FIVEM_LICENSE",
                    "value": "replace_with_your_license"
          },
          {
                    "env_variable": "TXADMIN_ENABLE",
                    "value": "1"
          },
          {
                    "env_variable": "MAX_PLAYERS",
                    "value": "48"
          },
          {
                    "env_variable": "FIVEM_VERSION",
                    "value": "latest"
          },
          {
                    "env_variable": "PROVIDER_NAME",
                    "value": "LuxxySystems"
          },
          {
                    "env_variable": "PROVIDER_LOGO",
                    "value": "https://avatars.githubusercontent.com/u/100530350?s=400&u=a73c13a41552c9d5d9c7f6d4bf3b656eb839f9e0&v=4"
          }
]
        }
    }
}
