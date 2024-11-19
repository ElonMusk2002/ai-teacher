import { useState } from "react";
import { UserNote } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NotesEditor({
  stepId,
  onSave,
}: {
  stepId: number;
  onSave: (note: UserNote) => void;
}) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleSave = () => {
    const note: UserNote = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      stepId,
      tags,
    };
    onSave(note);
    setContent("");
    setTags([]);
  };

  return (
    <div className="space-y-4 rounded-lg border border-emerald-500/20 bg-black/40 p-4 backdrop-blur">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] w-full resize-none border-emerald-500/20 bg-black/40 text-emerald-400 placeholder:text-emerald-400/40 focus:border-emerald-500 focus:ring-emerald-500"
        placeholder="Добавьте заметку..."
      />
      <Input
        type="text"
        placeholder="Добавьте теги через запятую"
        className="w-full border-emerald-500/20 bg-black/40 text-emerald-400 placeholder:text-emerald-400/40 focus:border-emerald-500 focus:ring-emerald-500"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setTags([...tags, e.currentTarget.value]);
            e.currentTarget.value = "";
          }
        }}
      />
      <Button
        onClick={handleSave}
        className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
      >
        Сохранить заметку
      </Button>
    </div>
  );
}