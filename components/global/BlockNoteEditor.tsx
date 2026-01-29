"use client";

import { useEffect, useMemo } from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";

interface BlockNoteEditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

export function BlockNoteEditorComponent({
  onChange,
  initialContent,
  editable = true,
}: BlockNoteEditorProps) {
  // Parse initial content
  const initialBlocks = useMemo(() => {
    if (!initialContent) return undefined;
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
  });

  // Update content on change
  useEffect(() => {
    if (!editor) return;

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
    <div className="border rounded-md overflow-hidden">
      <BlockNoteView editor={editor} editable={editable} theme="light" />
    </div>
  );
}
