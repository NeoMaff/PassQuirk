"use client"

interface DiscordButtonProps {
  label: string
  style?: "primary" | "secondary" | "success" | "danger"
  disabled?: boolean
  onClick?: () => void
}

export function DiscordButton({ label, style = "secondary", disabled = false, onClick }: DiscordButtonProps) {
  const styleClasses = {
    primary: "bg-[#5865f2] hover:bg-[#4752c4] text-white",
    secondary: "bg-[#4f545c] hover:bg-[#5d6269] text-white",
    success: "bg-[#3ba55d] hover:bg-[#2d7d32] text-white",
    danger: "bg-[#ed4245] hover:bg-[#c62d31] text-white",
  }

  return (
    <button
      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${styleClasses[style]} ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
