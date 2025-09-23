import { DiscordEmbed } from "./discord-embed"
import { DiscordButton } from "./discord-button"

interface DiscordMessageProps {
  username: string
  avatar: string
  timestamp: string
  embeds?: any[]
  buttons?: Array<{
    label: string
    style?: "primary" | "secondary" | "success" | "danger"
    disabled?: boolean
  }>
}

export function DiscordMessage({ username, avatar, timestamp, embeds = [], buttons = [] }: DiscordMessageProps) {
  return (
    <div className="bg-[#36393f] p-4 rounded-lg">
      <div className="flex items-start space-x-3">
        <img src={avatar || "/placeholder.svg"} alt="" className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-white font-semibold">{username}</span>
            <span className="text-[#72767d] text-xs">BOT</span>
            <span className="text-[#72767d] text-xs">{timestamp}</span>
          </div>

          <div className="space-y-3">
            {embeds.map((embed, index) => (
              <DiscordEmbed key={index} {...embed} />
            ))}

            {buttons.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {buttons.map((button, index) => (
                  <DiscordButton key={index} {...button} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
