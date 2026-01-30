"use client";

import { useEffect, useMemo } from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";

interface BlockNoteEditorProps {
  onChange?: (value: string) => void;
  initialContent?: string | PartialBlock[];
  editable?: boolean;
}

export default function BlockNoteEditorComponent({
  onChange,
  initialContent,
  editable = true,
}: BlockNoteEditorProps) {
  // Parse initial content
  const initialBlocks = useMemo(() => {
    if (!initialContent) return undefined;
    
    // If it's already an array of blocks, use it directly
    if (Array.isArray(initialContent)) {
      return initialContent as PartialBlock[];
    }
    
    // If it's a string, try to parse it
    try {
      return JSON.parse(initialContent) as PartialBlock[];
    } catch {
      // If it's not JSON, treat it as plain text
      return [
        {
          type: "paragraph" as const,
          content: initialContent,
        },
      ] as PartialBlock[];
    }
  }, [initialContent]);

  // Create editor instance
  const editor = useCreateBlockNote({
    initialContent: initialBlocks,
    // Suppress code block syntax highlighting warning
    // @ts-ignore - BlockNote typing issue
    _tiptapOptions: {
      enableInputRules: false,
      enablePasteRules: false,
    },
  });

  // Update content on change
  useEffect(() => {
    if (!editor || !onChange) return;

    const handleChange = () => {
      const blocks = editor.document;
      onChange(JSON.stringify(blocks));
    };

    // Listen to editor changes
    editor.onEditorContentChange(handleChange);
  }, [editor, onChange]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
      <BlockNoteView editor={editor} editable={editable} theme="light" />
  );
}

export { BlockNoteEditorComponent };
