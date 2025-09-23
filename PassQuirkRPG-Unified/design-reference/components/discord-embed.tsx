interface EmbedField {
  name: string
  value: string
  inline?: boolean
}

interface EmbedAuthor {
  name: string
  iconURL?: string
}

interface EmbedFooter {
  text: string
  iconURL?: string
}

interface DiscordEmbedProps {
  title?: string
  description?: string
  color?: number
  author?: EmbedAuthor
  thumbnail?: string
  image?: string
  fields?: EmbedField[]
  footer?: EmbedFooter
  timestamp?: boolean
}

export function DiscordEmbed({
  title,
  description,
  color = 0x2f3136,
  author,
  thumbnail,
  image,
  fields = [],
  footer,
  timestamp = false,
}: DiscordEmbedProps) {
  const colorHex = `#${color.toString(16).padStart(6, "0")}`

  return (
    <div className="bg-[#2f3136] rounded-md p-4 max-w-lg border-l-4" style={{ borderLeftColor: colorHex }}>
      {author && (
        <div className="flex items-center mb-2">
          {author.iconURL && (
            <img src={author.iconURL || "/placeholder.svg"} alt="" className="w-6 h-6 rounded-full mr-2" />
          )}
          <span className="text-white text-sm font-medium">{author.name}</span>
        </div>
      )}

      <div className="flex">
        <div className="flex-1">
          {title && <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>}

          {description && <p className="text-gray-300 text-sm mb-3 whitespace-pre-line">{description}</p>}

          {fields.length > 0 && (
            <div className={`grid gap-3 mb-3 ${fields.some((f) => f.inline) ? "grid-cols-3" : "grid-cols-1"}`}>
              {fields.map((field, index) => (
                <div key={index} className={field.inline ? "col-span-1" : "col-span-full"}>
                  <div className="text-white font-semibold text-sm mb-1">{field.name}</div>
                  <div className="text-gray-300 text-sm whitespace-pre-line">{field.value}</div>
                </div>
              ))}
            </div>
          )}

          {image && <img src={image || "/placeholder.svg"} alt="" className="rounded-md max-w-full mb-3" />}
        </div>

        {thumbnail && (
          <div className="ml-4">
            <img src={thumbnail || "/placeholder.svg"} alt="" className="w-20 h-20 rounded-md object-cover" />
          </div>
        )}
      </div>

      {footer && (
        <div className="flex items-center text-gray-400 text-xs mt-3">
          {footer.iconURL && (
            <img src={footer.iconURL || "/placeholder.svg"} alt="" className="w-4 h-4 rounded-full mr-2" />
          )}
          <span>{footer.text}</span>
          {timestamp && <span className="ml-2">• {new Date().toLocaleString()}</span>}
        </div>
      )}
    </div>
  )
}
