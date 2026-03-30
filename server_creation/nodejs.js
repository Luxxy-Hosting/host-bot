module.exports = (owner_uuid, serverName, locationID) => {
    // Translation fallback for location
    const locMap = { 1: "d5c51f13-962a-4c2a-9b02-abd87ab28935" };
    const locUUID = locMap[locationID] || "d5c51f13-962a-4c2a-9b02-abd87ab28935";

    return {
        serverType: "botserver",
        data: {
            name: `[Free] ${owner_uuid} ${serverName}`,
            owner_uuid: owner_uuid,
            egg_uuid: "dac403b6-1701-4be3-91ba-4f4ef1829779",
            image: "ghcr.io/luxxy-gf/nodejs_22",
            startup: "/start.sh",
            limits: {
                memory: 512,
                swap: 0,
                disk: 2048,
                io_weight: 500,
                cpu: 50,
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
                    "env_variable": "start_command1",
                    "value": "npm install --save --production"
          },
          {
                    "env_variable": "start_command2",
                    "value": "node ."
          }
]
        }
    }
}
