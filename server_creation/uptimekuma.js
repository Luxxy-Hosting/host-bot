module.exports = (owner_uuid, serverName, locationID) => {
    // Translation fallback for location
    const locMap = { 1: "d5c51f13-962a-4c2a-9b02-abd87ab28935" };
    const locUUID = locMap[locationID] || "d5c51f13-962a-4c2a-9b02-abd87ab28935";

    return {
        serverType: "botserver",
        data: {
            name: `[Free] ${owner_uuid} ${serverName}`,
            owner_uuid: owner_uuid,
            egg_uuid: "6d23c6cd-2ba1-4b18-a4e2-1e7abb5e0ab2",
            image: "ghcr.io/parkervcp/yolks:nodejs_20",
            startup: "/usr/local/bin/node  /home/container/server/server.js --port={{SERVER_PORT}}",
            limits: {
                memory: 512,
                swap: 0,
                disk: 2048,
                io_weight: 500,
                cpu: 100,
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
            variables: []
        }
    }
}
