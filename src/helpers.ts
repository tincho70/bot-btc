import {
  GuildMember,
  Message,
  PermissionFlagsBits,
  PermissionResolvable,
  TextChannel,
} from "discord.js";

export const checkPermissions = (
  member: GuildMember,
  permissions: Array<PermissionResolvable>
) => {
  const neededPermissions: PermissionResolvable[] = [];
  permissions.forEach((permission) => {
    if (!member.permissions.has(permission)) neededPermissions.push(permission);
  });
  if (neededPermissions.length === 0) return null;
  return neededPermissions.map((p) => {
    if (typeof p === "string") return p.split(/(?=[A-Z])/).join(" ");
    else
      return Object.keys(PermissionFlagsBits)
        .find((k) => Object(PermissionFlagsBits)[k] === p)
        ?.split(/(?=[A-Z])/)
        .join(" ");
  });
};

export const sendTimedMessage = (
  message: string,
  channel: TextChannel,
  duration: number
) => {
  channel
    .send(message)
    .then((m) =>
      setTimeout(
        async () => (await channel.messages.fetch(m)).delete(),
        duration
      )
    );
  return;
};

export const replyTimedMessage = (
  content: string,
  message: Message,
  duration: number
) => {
  message
    .reply(content)
    .then((m) => setTimeout(async () => m.delete(), duration));
  return;
};

export const formatDuration = (ms: number) => {
  const MS_IN_SECOND = 1000;
  const MS_IN_MINUTE = MS_IN_SECOND * 60;
  const MS_IN_HOUR = MS_IN_MINUTE * 60;
  const MS_IN_DAY = MS_IN_HOUR * 24;

  const d = Math.floor(ms / MS_IN_DAY);
  const h = Math.floor((ms - MS_IN_DAY * d) / MS_IN_HOUR);
  const m = Math.floor((ms - MS_IN_DAY * d - MS_IN_HOUR * h) / MS_IN_MINUTE);

  const parts = [];

  if (d > 0) {
    parts.push(`**${d}** día${d === 1 ? "" : "s"}`);
  }

  if (d > 0 || h > 0) {
    parts.push(`**${h}** hora${h === 1 ? "" : "s"}`);
  }

  parts.push(`**${m}** minuto${m === 1 ? "" : "s"}`);

  return parts.join(" ");
};

export const formatDate = (d: Date): string => {
  return d
    .toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    })
    .replace(",", "");
};

export const formatPercentageChange = (
  startPrice: number,
  currentPrice: number
): string => {
  const priceChange = Number((currentPrice / startPrice - 1).toPrecision(2));

  return new Intl.NumberFormat("es-AR", {
    style: "percent",
    minimumFractionDigits: 2,
    signDisplay: "exceptZero",
  }).format(priceChange);
};
