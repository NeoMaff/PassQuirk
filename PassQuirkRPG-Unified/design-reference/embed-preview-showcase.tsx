"use client"

import { useState } from "react"
import { InventoryPreview } from "./PassQuirkRPG/previews/inventory-preview"
import { BattlePreview } from "./PassQuirkRPG/previews/battle-preview"
import { TournamentPreview } from "./PassQuirkRPG/previews/tournament-preview"
import { DungeonPreview } from "./PassQuirkRPG/previews/dungeon-preview"
import { CharacterCreationPreview } from "./PassQuirkRPG/previews/character-creation-preview"

const panels = [
  { id: "inventory", name: "Inventory Panel", component: InventoryPreview },
  { id: "battle", name: "Battle Panel", component: BattlePreview },
  { id: "tournament", name: "Tournament Panel", component: TournamentPreview },
  { id: "dungeon", name: "Dungeon Panel", component: DungeonPreview },
  { id: "character", name: "Character Creation Panel", component: CharacterCreationPreview },
]

export default function EmbedPreviewShowcase() {
  const [activePanel, setActivePanel] = useState("inventory")

  const ActiveComponent = panels.find((p) => p.id === activePanel)?.component || InventoryPreview

  return (
    <div className="min-h-screen bg-[#36393f] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">PassQuirkRPG Discord Embed Preview</h1>
          <p className="text-gray-300 text-lg">Preview your Discord bot embeds exactly as they'll appear in Discord</p>
        </div>

        {/* Panel Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {panels.map((panel) => (
            <button
              key={panel.id}
              onClick={() => setActivePanel(panel.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activePanel === panel.id ? "bg-[#5865f2] text-white" : "bg-[#4f545c] text-gray-300 hover:bg-[#5d6269]"
              }`}
            >
              {panel.name}
            </button>
          ))}
        </div>

        {/* Active Panel Preview */}
        <div className="bg-[#2f3136] rounded-lg p-6">
          <ActiveComponent />
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-[#2f3136] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">About This Preview</h2>
          <div className="text-gray-300 space-y-2">
            <p>• These previews show exactly how your Discord embeds will appear</p>
            <p>• All colors, styling, and layouts match Discord's official design</p>
            <p>• Interactive elements like pagination work in the preview</p>
            <p>• The code provided generates these exact embeds in your Discord bot</p>
            <p>• You can test different states and interactions before implementing</p>
          </div>
        </div>
      </div>
    </div>
  )
}
