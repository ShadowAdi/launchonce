import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Badge } from "../ui/badge"

interface TagsInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

export function TagsInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
}: TagsInputProps) {
  const [input, setInput] = useState("")

  const addTag = () => {
    const tag = input.trim()
    if (!tag) return
    if (value.includes(tag)) return

    onChange([...value, tag])
    setInput("")
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-md border p-2">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-1 rounded-full hover:bg-muted"
          >
            <X size={12} />
          </button>
        </Badge>
      ))}

      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            addTag()
          }
        }}
        className="flex-1 border-none shadow-none focus-visible:ring-0"
        placeholder={placeholder}
      />
    </div>
  )
}
