"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TagInputProps {
  selectedTags: string[]
  availableTags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  allowCustomTags?: boolean
}

export function TagInput({
  selectedTags,
  availableTags,
  onChange,
  maxTags = 3,
  allowCustomTags = true,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [isInputVisible, setIsInputVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleTagRemove = (tagToRemove: string) => {
    onChange(selectedTags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagSelection = (tag: string) => {
    if (selectedTags.includes(tag)) {
      handleTagRemove(tag)
    } else if (selectedTags.length < maxTags) {
      onChange([...selectedTags, tag])
    }
  }

  const handleCustomTagAdd = () => {
    const trimmedInput = inputValue.trim()

    if (trimmedInput && !selectedTags.includes(trimmedInput) && selectedTags.length < maxTags) {
      onChange([...selectedTags, trimmedInput])
      setInputValue("")
      setIsInputVisible(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleCustomTagAdd()
    } else if (e.key === "Escape") {
      setIsInputVisible(false)
      setInputValue("")
    }
  }

  const showInput = () => {
    if (selectedTags.length < maxTags) {
      setIsInputVisible(true)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  // Filter available tags to show only unselected ones
  const filteredAvailableTags = availableTags.filter((tag) => !selectedTags.includes(tag))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <div key={tag} className="flex items-center justify-center gap-1 px-3 py-1 text-sm rounded-md font-semibold bg-blog text-black border text-center">
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleTagRemove(tag)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {selectedTags.length < maxTags &&
          (isInputVisible ? (
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (inputValue.trim()) {
                    handleCustomTagAdd()
                  } else {
                    setIsInputVisible(false)
                  }
                }}
                className="h-8 w-40 text-sm"
                placeholder="Add tag..."
              />
              <Button type="button" size="sm" variant="ghost" onClick={handleCustomTagAdd} className="h-8 px-2">
                Add
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={showInput}
              className="h-8 px-2 text-sm rounded-full flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Tag
            </Button>
          ))}
      </div>

      {!isInputVisible && filteredAvailableTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filteredAvailableTags.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleTagSelection(tag)}
              className="h-8 px-3 text-sm"
              disabled={selectedTags.length >= maxTags}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
