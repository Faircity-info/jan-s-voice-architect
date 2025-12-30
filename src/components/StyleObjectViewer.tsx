import { motion } from "framer-motion";
import { StyleObject } from "@/types/style";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface StyleObjectViewerProps {
  styleObject: StyleObject;
}

export function StyleObjectViewer({ styleObject }: StyleObjectViewerProps) {
  const [copied, setCopied] = useState(false);

  const formattedJson = JSON.stringify(styleObject, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="surface-elevated rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">Style Memory Object</h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {styleObject.voiceVersion}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy JSON
            </>
          )}
        </button>
      </div>
      
      <div className="p-5 max-h-[400px] overflow-auto">
        <pre className="text-xs font-mono leading-relaxed">
          <code className="text-secondary-foreground">
            {formattedJson.split('\n').map((line, i) => (
              <div key={i} className="flex">
                <span className="text-dim w-8 select-none text-right pr-4">{i + 1}</span>
                <span dangerouslySetInnerHTML={{ __html: syntaxHighlight(line) }} />
              </div>
            ))}
          </code>
        </pre>
      </div>
    </motion.div>
  );
}

function syntaxHighlight(line: string): string {
  return line
    .replace(/"([^"]+)":/g, '<span class="text-primary">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="text-green-400">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="text-amber-400">$1</span>')
    .replace(/(\[|\]|\{|\})/g, '<span class="text-muted-foreground">$1</span>');
}
