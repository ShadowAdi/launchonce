
"use server";

import { ServerBlockNoteEditor } from "@blocknote/server-util";

export async function blockNoteToHTML(content: any) {
  const blocks = JSON.parse(content);
  const editor = ServerBlockNoteEditor.create();
  return await editor.blocksToHTMLLossy(blocks);
}