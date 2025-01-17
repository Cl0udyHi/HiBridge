import axios from "axios";

type Player = {
  id: string;
  name: string;
};

export default async function getPlayerName(uuid: string): Promise<string> {
  try {
    const response = await axios.get<Player>(
      `https://api.minecraftservices.com/minecraft/profile/lookup/${uuid}`
    );

    if (response.data) {
      return response.data.name;
    } else {
      console.error("Failed to fetch player name");
    }
  } catch (error) {
    console.error("Error fetching player name:", error);
  }

  return "N/A";
}
