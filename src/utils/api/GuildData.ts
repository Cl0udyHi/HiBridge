import axios from "axios";

type GuildMember = {
  uuid: string;
  rank: string;
  joined: number;
  questParticipation: number;
  expHistory: Record<string, number>;
};

type GuildInfo = {
  _id: string;
  name: string;
  created: number;
  members: GuildMember[];
  exp: number;
  description: string;
  guildExpByGameType: Record<string, number>;
  tag: string;
  tagColor: string;
};

type GuildData = {
  guild: GuildInfo;
  success: boolean;
  throttle: boolean;
  global: boolean;
};

type PlayerData = {
  success: boolean;
  player: Player;
};

type Player = {
  _id: string;
  uuid: string;
  displayname: string;
  rank?: string;
  rankPlusColor: string;
  newPackageRank: "VIP" | "VIP_PLUS" | "MVP" | "MVP_PLUS";
  monthlyPackageRank: "NONE" | "SUPERSTAR";
  monthlyRankColor: string;
  networkExp: number;
  socialMedia: { links: Record<string, string> };
};

async function getGuildData(): Promise<GuildInfo | undefined> {
  try {
    const response = await axios.get<GuildData>(
      `https://api.hypixel.net/v2/guild?key=${process.env.API_KEY}&id=${process.env.GUILD_ID}`
    );

    if (!response.data.success) {
      console.error("Failed to fetch guild data");
    }

    return response.data.guild;
  } catch (error) {
    console.error("Error fetching guild data:", error);
  }
}

async function getGuildMembers(): Promise<GuildMember[]> {
  const guild: GuildInfo | undefined = await getGuildData();

  if (!guild) {
    console.error("This guild doesn't exist");
    return [];
  }

  return (guild as GuildInfo).members;
}

async function getPlayer(uuid: string): Promise<Player | undefined> {
  try {
    const response = await axios.get<PlayerData>(
      `https://api.hypixel.net/v2/player?key=${process.env.API_KEY}&uuid=${uuid}`
    );

    if (response.data.success) {
      return response.data.player;
    } else {
      console.error("Failed to fetch guild data");
    }
  } catch (error) {
    console.error("Error fetching guild data:", error);
  }
}

export {
  getGuildData,
  getGuildMembers,
  getPlayer,
  GuildInfo,
  GuildMember,
  Player,
  PlayerData,
};
