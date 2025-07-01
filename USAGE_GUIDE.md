# Luxxy Hosting Bot - Slash Commands Usage Guide

## Quick Start

### Traditional Commands are Now Slash Commands!
All bot commands have been converted to modern Discord slash commands. Simply type `/` in any channel to see all available commands.

## Command Categories

### 👤 User Commands
Manage your hosting account

| Command | Description | Usage |
|---------|-------------|-------|
| `/user new` | Create a new panel account | `/user new` |
| `/user info` | Show your account information | `/user info` |
| `/user password` | Reset your panel password | `/user password` |
| `/user delete` | Delete your account and all servers | `/user delete` |

### 🖥️ Server Commands
Manage your game and bot servers

| Command | Description | Usage |
|---------|-------------|-------|
| `/server create` | Create a new server | `/server create type:Paper name:MyServer` |
| `/server list` | List all your servers | `/server list` |
| `/server delete` | Delete a specific server | `/server delete server_id:abc123` |
| `/server count` | Show server usage statistics | `/server count` |
| `/server status` | Show live server status | `/server status server_id:abc123` |

### 🎵 Music Commands
Control music playback in voice channels

| Command | Description | Usage |
|---------|-------------|-------|
| `/music play` | Play music from YouTube | `/music play query:Never Gonna Give You Up` |

### ℹ️ Info Commands
Get bot information and help

| Command | Description | Usage |
|---------|-------------|-------|
| `/help` | Show all commands | `/help` or `/help category:user` |
| `/ping` | Check bot latency | `/ping` |

### 🔒 Admin Commands
Administrator-only commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/admin blacklist` | Manage user blacklist | `/admin blacklist action:add user:@User` |
| `/admin eval` | Execute JavaScript code | `/admin eval code:console.log('test')` |

## Getting Started

### 1. Create Your Account
```
/user new
```
Follow the interactive setup in the created channel to:
- Accept terms of service
- Provide your email
- Choose a username
- Get your panel credentials

### 2. Create Your First Server
```
/server create type:Paper name:MyMinecraftServer
```
This will:
- Show location selection buttons
- Create the server on your chosen location
- Display server details and panel link
- Update your server usage count

### 3. Manage Your Servers
```
/server list          # See all your servers
/server status abc123  # Monitor server performance  
/server delete abc123  # Remove a server
```

## Features

### 🎯 Interactive Components
- **Button Selections**: Choose server locations, confirm actions
- **Dropdown Menus**: Select from predefined options
- **Real-time Updates**: Live server monitoring with charts

### 🔧 Server Types Available
- **Minecraft**: Paper, Purpur, Bedrock, PocketmineMP, Fabric, Vanilla MC
- **Bots**: NodeJS, Python, AIO (All-in-One)
- **Web**: Nginx, Uptime-Kuma

### 📊 Real-time Monitoring
The `/server status` command provides:
- Live CPU, RAM, and disk usage
- Network statistics
- Interactive charts
- 2-minute live monitoring session

### 🛡️ Security Features
- Account ownership verification
- Server ownership validation
- Admin command restrictions
- Blacklist system for problematic users

## Tips & Tricks

### 💡 Quick Tips
1. **Auto-complete**: Slash commands show available options as you type
2. **Error Prevention**: Invalid inputs are caught before sending
3. **Help System**: Use `/help category:server` to see specific command groups
4. **Server IDs**: Use the short ID (before the dash) for server commands

### 🚨 Common Issues
- **"You don't have an account"**: Run `/user new` first
- **"Server not found"**: Check your server ID with `/server list`
- **"No server slots"**: Check usage with `/server count`

### 📱 Mobile Users
Slash commands work perfectly on mobile Discord:
1. Type `/` to open command picker
2. Tap the command you want
3. Fill in required options
4. Send the command

## Migration from Old Commands

### Before (Traditional Commands)
```
!user new
!server create paper MyServer
!server list
```

### Now (Slash Commands)  
```
/user new
/server create type:paper name:MyServer
/server list
```

### Migration Message
If you try to use old commands, the bot will show a helpful message directing you to use slash commands instead.

## Support

### 🆘 Getting Help
1. Use `/help` to see all available commands
2. Create a support ticket in the Discord server
3. Check server status with `/server status <id>`

### 🔗 Important Links
- **Panel**: Access your game panel
- **Discord Server**: Get community support
- **Documentation**: This guide and more

### 📝 Command Examples

#### Creating Different Server Types
```bash
# Minecraft Servers
/server create type:paper name:SurvivalServer
/server create type:bedrock name:BedrockServer

# Bot Servers  
/server create type:nodejs name:DiscordBot
/server create type:python name:PythonBot

# Web Servers
/server create type:nginx name:WebSite
```

#### Managing Your Account
```bash
# Check your info
/user info

# Reset password (sent via DM)
/user password

# View server usage
/server count
```

#### Monitoring Servers
```bash
# List all servers
/server list

# Live monitoring with charts
/server status abc123

# Remove unwanted server
/server delete abc123
```

## Advanced Features

### 🎛️ Interactive Server Creation
1. Choose server type from dropdown
2. Enter server name
3. Select deployment location via buttons
4. View resource allocation
5. Get direct panel link

### 📈 Real-time Status Monitoring
- WebSocket connection for live data
- CPU and RAM usage charts
- Network statistics
- Automatic chart generation
- 2-minute monitoring sessions

### 🔐 Permission System
- User commands: Available to everyone
- Server commands: Require panel account
- Admin commands: Owner/admin only
- Smart permission checking

---

*This bot has been fully converted to slash commands for a better user experience. Enjoy the improved interface and interactive features!* 🚀