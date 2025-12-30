import { motion } from "framer-motion";
import { ReferenceCreator } from "@/types/style";
import { Linkedin, Twitter, Youtube, Globe, Check, Loader2, ExternalLink } from "lucide-react";

interface CreatorCardProps {
  creator: ReferenceCreator;
  index: number;
}

const platformIcons = {
  LinkedIn: Linkedin,
  X: Twitter,
  YouTube: Youtube,
  Blog: Globe,
};

const platformColors = {
  LinkedIn: "text-blue-400",
  X: "text-foreground",
  YouTube: "text-red-400",
  Blog: "text-green-400",
};

export function CreatorCard({ creator, index }: CreatorCardProps) {
  const PlatformIcon = platformIcons[creator.platform];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="surface-elevated rounded-xl p-5 hover-lift group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center border border-primary/20">
            <span className="text-lg font-semibold text-primary">
              {creator.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {creator.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <PlatformIcon className={`w-3.5 h-3.5 ${platformColors[creator.platform]}`} />
              <span className="text-xs text-muted-foreground">{creator.platform}</span>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          creator.analyzed 
            ? "bg-green-500/10 text-green-400 border border-green-500/20" 
            : "bg-primary/10 text-primary border border-primary/20"
        }`}>
          {creator.analyzed ? (
            <>
              <Check className="w-3 h-3" />
              Analyzed
            </>
          ) : (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing
            </>
          )}
        </div>
      </div>

      {creator.reasonWhy && (
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          "{creator.reasonWhy}"
        </p>
      )}

      {creator.styleProfile && (
        <div className="space-y-3 pt-3 border-t border-border/50">
          <div>
            <span className="text-xs font-medium text-dim uppercase tracking-wider">Hook Style</span>
            <p className="text-sm text-foreground mt-1 capitalize">{creator.styleProfile.hookMechanics.style}</p>
          </div>
          
          <div>
            <span className="text-xs font-medium text-dim uppercase tracking-wider">Cognitive Style</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {creator.styleProfile.cognitiveStyle.map((style) => (
                <span
                  key={style}
                  className="text-xs px-2 py-0.5 rounded-md bg-muted/80 text-secondary-foreground"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <ToneBar label="Calm" value={creator.styleProfile.toneAttributes.calm} />
            <ToneBar label="Certainty" value={creator.styleProfile.toneAttributes.certainty} />
            <ToneBar label="Playful" value={creator.styleProfile.toneAttributes.playful} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
        <a
          href={creator.links[0]}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View Profile
        </a>
      </div>
    </motion.div>
  );
}

function ToneBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-dim">{label}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{value}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 10}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
        />
      </div>
    </div>
  );
}
