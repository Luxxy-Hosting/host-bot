module.exports = (owner_uuid, serverName, locationID) => {
    // Translation fallback for location
    const locMap = { 1: "d5c51f13-962a-4c2a-9b02-abd87ab28935" };
    const locUUID = locMap[locationID] || "d5c51f13-962a-4c2a-9b02-abd87ab28935";

    return {
        serverType: "gameserver",
        data: {
            name: `[Free] ${owner_uuid} ${serverName}`,
            owner_uuid: owner_uuid,
            egg_uuid: "c69ea4b4-2336-4b12-a6b4-9ff32ba7d0c1",
            image: "ghcr.io/parkervcp/yolks:debian",
            startup: "./bedrock_server",
            limits: {
                memory: 1024,
                swap: 0,
                disk: 10240,
                io_weight: 500,
                cpu: 350,
                memory_overhead: 0
            },
            feature_limits: {
                databases: 0,
                allocations: 1,
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
                    "env_variable": "BEDROCK_VERSION",
                    "value": "latest"
          },
          {
                    "env_variable": "LD_LIBRARY_PATH",
                    "value": "."
          },
          {
                    "env_variable": "SERVERNAME",
                    "value": "Bedrock Dedicated Server"
          },
          {
                    "env_variable": "GAMEMODE",
                    "value": "survival"
          },
          {
                    "env_variable": "DIFFICULTY",
                    "value": "easy"
          },
          {
                    "env_variable": "CHEATS",
                    "value": "false"
          },
          {
                    "env_variable": "WORLDNAME",
                    "value": "world"
          }
]
        }
    }
}
