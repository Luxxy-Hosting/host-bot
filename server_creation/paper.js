module.exports = (owner_uuid, serverName, locationID) => {
    // Translation fallback for location
    const locMap = { 1: "d5c51f13-962a-4c2a-9b02-abd87ab28935" };
    const locUUID = locMap[locationID] || "d5c51f13-962a-4c2a-9b02-abd87ab28935";

    return {
        serverType: "gameserver",
        data: {
            name: `[Free] ${owner_uuid} ${serverName}`,
            owner_uuid: owner_uuid,
            egg_uuid: "f7484ce1-af00-4601-ac24-09e1f6c0b950",
            image: "ghcr.io/pterodactyl/yolks:java_21",
            startup: "java -Xms128M -XX:MaxRAMPercentage=95.0 -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}",
            limits: {
                memory: 3072,
                swap: 0,
                disk: 15360,
                io_weight: 500,
                cpu: 200,
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
                    "env_variable": "MINECRAFT_VERSION",
                    "value": "latest"
          },
          {
                    "env_variable": "SERVER_JARFILE",
                    "value": "server.jar"
          },
          {
                    "env_variable": "DL_PATH",
                    "value": ""
          },
          {
                    "env_variable": "BUILD_NUMBER",
                    "value": "latest"
          }
]
        }
    }
}
