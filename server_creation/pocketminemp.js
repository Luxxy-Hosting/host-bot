module.exports = (owner_uuid, serverName, locationID) => {
    // Translation fallback for location
    const locMap = { 1: "d5c51f13-962a-4c2a-9b02-abd87ab28935" };
    const locUUID = locMap[locationID] || "d5c51f13-962a-4c2a-9b02-abd87ab28935";

    return {
        serverType: "gameserver",
        data: {
            name: `[Free] ${owner_uuid} ${serverName}`,
            owner_uuid: owner_uuid,
            egg_uuid: "cb059a25-c0fb-403a-be1e-b204dd0b3eeb",
            image: "ghcr.io/parkervcp/yolks:debian",
            startup: "./bin/php7/bin/php ./PocketMine-MP.phar --no-wizard --disable-ansi",
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
                    "env_variable": "VERSION",
                    "value": "PM5"
          }
]
        }
    }
}
