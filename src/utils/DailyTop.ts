import { GuildMember } from "./api/GuildData";

export default function getDaily(
  members: GuildMember[],
  date: Date
): Record<number, GuildMember>[] {
  const todayList: Record<number, GuildMember>[] = [];
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  for (const member of members) {
    let todayExp: number = 0;
    for (const key in member.expHistory) {
      const value = member.expHistory[key];

      todayExp += value;
    }

    if (todayExp == 0) continue;

    todayList.push({ [todayExp]: member });
  }

  // for (const member of members) {
  //   let todayExp: number = member.expHistory[formattedDate];
  //   if (todayExp == 0) continue;

  //   todayList.push({ [todayExp]: member });
  // }

  return todayList;
}
