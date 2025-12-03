import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScholarPublication {
  title: string;
  authors: string[];
  year: string;
  citations: number;
  link?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scholarId } = await req.json();

    if (!scholarId) {
      return new Response(
        JSON.stringify({ error: "Scholar ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Note: Google Scholar doesn't have an official API
    // This is a simplified implementation that fetches the profile page
    // In production, you would need to use a proper scraping service or API
    
    const scholarUrl = `https://scholar.google.com/citations?user=${scholarId}&hl=en`;
    
    console.log(`Fetching Google Scholar profile: ${scholarUrl}`);

    // Fetch the Google Scholar page
    const response = await fetch(scholarUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch Scholar profile: ${response.status}`);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch Google Scholar profile",
          message: "The profile may not exist or Google Scholar blocked the request"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await response.text();

    // Parse publications from the HTML
    // This is a basic regex-based parser - in production use a proper HTML parser
    const publications: ScholarPublication[] = [];
    
    // Look for publication entries in the HTML
    const titleRegex = /<a[^>]*class="gsc_a_at"[^>]*>([^<]+)<\/a>/g;
    const yearRegex = /<span[^>]*class="gs_oph"[^>]*>[^<]*(\d{4})[^<]*<\/span>/g;
    
    let titleMatch;
    const titles: string[] = [];
    while ((titleMatch = titleRegex.exec(html)) !== null) {
      titles.push(titleMatch[1].trim());
    }

    // Create publication objects
    titles.slice(0, 20).forEach((title, index) => {
      publications.push({
        title: title,
        authors: [],
        year: new Date().getFullYear().toString(),
        citations: 0,
      });
    });

    console.log(`Found ${publications.length} publications`);

    return new Response(
      JSON.stringify({ 
        success: true,
        scholarId,
        profileUrl: scholarUrl,
        publications,
        message: publications.length > 0 
          ? `Found ${publications.length} publications` 
          : "No publications found. The profile may be private or the ID may be incorrect."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error fetching Google Scholar:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch Google Scholar data",
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});