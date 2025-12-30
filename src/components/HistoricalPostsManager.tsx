import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Trash2, Loader2, Calendar, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HistoricalPost {
  id: string;
  platform: string;
  content: string;
  performance_notes: string | null;
  posted_at: string | null;
  created_at: string;
}

export function HistoricalPostsManager() {
  const [posts, setPosts] = useState<HistoricalPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostNotes, setNewPostNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("historical_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading posts:", error);
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  const handleAddPost = async () => {
    if (!newPostContent.trim()) return;
    
    setIsSaving(true);
    const { error } = await supabase.from("historical_posts").insert({
      content: newPostContent,
      performance_notes: newPostNotes || null,
      platform: "LinkedIn",
    });

    if (error) {
      console.error("Error adding post:", error);
      toast({
        title: "Error adding post",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Post added successfully" });
      setNewPostContent("");
      setNewPostNotes("");
      setShowAddForm(false);
      loadPosts();
    }
    setIsSaving(false);
  };

  const handleDeletePost = async (id: string) => {
    const { error } = await supabase.from("historical_posts").delete().eq("id", id);
    
    if (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Post deleted" });
      loadPosts();
    }
  };

  if (isLoading) {
    return (
      <div className="surface-elevated rounded-xl p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="surface-elevated rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Historical Posts</h3>
            <p className="text-xs text-muted-foreground">
              {posts.length} successful posts stored
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Post
        </button>
      </div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="surface-elevated rounded-xl p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-foreground">Add Historical Post</h4>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Post Content
                  </label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Paste your successful LinkedIn post here..."
                    className="w-full h-48 p-3 rounded-lg bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Performance Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={newPostNotes}
                    onChange={(e) => setNewPostNotes(e.target.value)}
                    placeholder="e.g., High engagement, 50+ comments, viral..."
                    className="w-full p-3 rounded-lg bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPost}
                    disabled={!newPostContent.trim() || isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-medium disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Add Post
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No historical posts yet. Add your best performing LinkedIn posts.
          </div>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-lg bg-muted/20 border border-border/30 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-secondary-foreground line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>
                  {post.performance_notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {post.performance_notes}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
