module.exports = (owner_uuid, serverName, locationID) => {
    // Translation fallback for location
    const locMap = { 1: "d5c51f13-962a-4c2a-9b02-abd87ab28935" };
    const locUUID = locMap[locationID] || "d5c51f13-962a-4c2a-9b02-abd87ab28935";

    return {
        serverType: "botserver",
        data: {
            name: `[Free] ${owner_uuid} ${serverName}`,
            owner_uuid: owner_uuid,
            egg_uuid: "9f70b0c1-f950-49bd-9d77-5fe3bf794c8a",
            image: "ghcr.io/luxxy-gf/python_3.14",
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
                    "value": "pip install -r requirements.txt"
          },
          {
                    "env_variable": "start_command2",
                    "value": "python bot.py"
          }
]
        }
    }
}
