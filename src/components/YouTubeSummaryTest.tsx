import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Youtube, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const YouTubeSummaryTest = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: 'Chybí URL',
        description: 'Zadej YouTube URL',
        variant: 'destructive',
      });
      return;
    }

    if (!creatorName.trim()) {
      toast({
        title: 'Chybí jméno',
        description: 'Zadej jméno creatora',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSummary('');

    try {
      const { data, error } = await supabase.functions.invoke('summarize-youtube', {
        body: { youtube_url: youtubeUrl }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setSummary(data.summary);
      toast({
        title: 'Summary vytvořeno',
        description: `Summary pro ${creatorName} je připraveno`,
      });

    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: 'Chyba',
        description: error instanceof Error ? error.message : 'Nepodařilo se vytvořit summary',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-6 w-6 text-red-500" />
            YouTube Summary Test
          </CardTitle>
          <CardDescription>
            Zadej YouTube URL a jméno creatora - Gemini analyzuje video a vytvoří summary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube URL</Label>
            <Input
              id="youtube-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="creator-name">Jméno Creatora</Label>
            <Input
              id="creator-name"
              placeholder="Alex Hormozi"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleGenerateSummary} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzuji video...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Vytvořit Summary
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vygenerované Summary pro: {creatorName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {summary}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default YouTubeSummaryTest;
