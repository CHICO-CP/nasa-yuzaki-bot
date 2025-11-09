class LevelSystem {
    constructor(client) {
        this.client = client;
        this.db = client.db;
        this.xpCooldown = new Set();
    }

    async addXP(userId, guildId) {
        // Prevenir spam de XP
        const cooldownKey = `${userId}-${guildId}`;
        if (this.xpCooldown.has(cooldownKey)) return null;
        
        this.xpCooldown.add(cooldownKey);
        setTimeout(() => this.xpCooldown.delete(cooldownKey), 60000); // 1 min cooldown

        const key = `levels_${guildId}_${userId}`;
        let userData = await this.db.get(key) || { xp: 0, level: 1, totalXP: 0 };

        // Ganar XP aleatorio
        const xpGain = Math.floor(Math.random() * 15) + 10; // 10-25 XP
        userData.xp += xpGain;
        userData.totalXP += xpGain;

        // Calcular XP necesario para siguiente nivel
        const xpNeeded = this.calculateXPNeeded(userData.level);

        if (userData.xp >= xpNeeded) {
            userData.level += 1;
            userData.xp = 0;
            
            await this.db.set(key, userData);
            return { leveledUp: true, newLevel: userData.level, userData };
        }

        await this.db.set(key, userData);
        return { leveledUp: false, xpGain, userData };
    }

    calculateXPNeeded(level) {
        return 100 * level + Math.pow(level, 2) * 50;
    }

    async getRank(userId, guildId) {
        const key = `levels_${guildId}_${userId}`;
        const userData = await this.db.get(key) || { xp: 0, level: 1, totalXP: 0 };
        
        // Obtener todos los usuarios del servidor para ranking
        const allData = await this.db.all();
        const guildUsers = [];

        for (const data of allData) {
            if (data.ID.startsWith(`levels_${guildId}_`)) {
                const userId = data.ID.split('_')[2];
                guildUsers.push({
                    userId,
                    ...data.data
                });
            }
        }

        // Ordenar por nivel y XP
        guildUsers.sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            return b.totalXP - a.totalXP;
        });

        const rank = guildUsers.findIndex(user => user.userId === userId) + 1;
        return { rank, totalUsers: guildUsers.length, userData };
    }

    async getLeaderboard(guildId, limit = 10) {
        const allData = await this.db.all();
        const guildUsers = [];

        for (const data of allData) {
            if (data.ID.startsWith(`levels_${guildId}_`)) {
                const userId = data.ID.split('_')[2];
                guildUsers.push({
                    userId,
                    ...data.data
                });
            }
        }

        // Ordenar por nivel y XP
        guildUsers.sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            return b.totalXP - a.totalXP;
        });

        return guildUsers.slice(0, limit);
    }

    async resetUser(userId, guildId) {
        const key = `levels_${guildId}_${userId}`;
        await this.db.delete(key);
        return true;
    }

    async setXP(userId, guildId, xp) {
        const key = `levels_${guildId}_${userId}`;
        let userData = await this.db.get(key) || { xp: 0, level: 1, totalXP: 0 };
        
        userData.xp = parseInt(xp);
        userData.totalXP = parseInt(xp);
        
        await this.db.set(key, userData);
        return userData;
    }

    async setLevel(userId, guildId, level) {
        const key = `levels_${guildId}_${userId}`;
        let userData = await this.db.get(key) || { xp: 0, level: 1, totalXP: 0 };
        
        userData.level = parseInt(level);
        userData.xp = 0;
        
        await this.db.set(key, userData);
        return userData;
    }
}

module.exports = LevelSystem;