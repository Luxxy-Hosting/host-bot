module.exports = (owner_uuid, serverName, locationID) => {
    // Translation fallback for location
    const locMap = { 1: "d5c51f13-962a-4c2a-9b02-abd87ab28935" };
    const locUUID = locMap[locationID] || "d5c51f13-962a-4c2a-9b02-abd87ab28935";

    return {
        serverType: "gameserver",
        data: {
            name: `[Free] ${owner_uuid} ${serverName}`,
            owner_uuid: owner_uuid,
            egg_uuid: "9e390146-5352-493e-a753-130b860e8841",
            image: "ghcr.io/pterodactyl/yolks:java_21",
            startup: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}",
            limits: {
                memory: 3072,
                swap: 0,
                disk: 15360,
                io_weight: 500,
                cpu: 350,
                memory_overhead: 0
            },
            feature_limits: {
                databases: 1,
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
                    "env_variable": "SERVER_JARFILE",
                    "value": "server.jar"
          },
          {
                    "env_variable": "MC_VERSION",
                    "value": "latest"
          },
          {
                    "env_variable": "FABRIC_VERSION",
                    "value": "latest"
          },
          {
                    "env_variable": "LOADER_VERSION",
                    "value": "latest"
          }
]
        }
    }
}
