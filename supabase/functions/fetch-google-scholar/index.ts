import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScholarPublication {
  title: string;
  authors: string;
  year: string;
  citations: number;
  link?: string;
  publication?: string;
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

    const serpApiKey = Deno.env.get("SERPAPI_API_KEY");
    
    if (!serpApiKey) {
      console.error("SERPAPI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "SerpAPI key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching Google Scholar profile for ID: ${scholarId}`);

    // Use SerpAPI to fetch Google Scholar author data
    const serpApiUrl = new URL("https://serpapi.com/search.json");
    serpApiUrl.searchParams.set("engine", "google_scholar_author");
    serpApiUrl.searchParams.set("author_id", scholarId);
    serpApiUrl.searchParams.set("api_key", serpApiKey);
    serpApiUrl.searchParams.set("num", "100"); // Get up to 100 publications

    const response = await fetch(serpApiUrl.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SerpAPI error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch Google Scholar profile",
          message: "The profile may not exist or there was an API error"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    if (data.error) {
      console.error(`SerpAPI returned error: ${data.error}`);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch Google Scholar profile",
          message: data.error
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract author information
    const author = data.author || {};
    const articles = data.articles || [];

    // Transform articles to our publication format
    const publications: ScholarPublication[] = articles.map((article: any) => ({
      title: article.title || "Untitled",
      authors: article.authors || "",
      year: article.year || "",
      citations: article.cited_by?.value || 0,
      link: article.link || null,
      publication: article.publication || "",
    }));

    console.log(`Found ${publications.length} publications for ${author.name || scholarId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        scholarId,
        author: {
          name: author.name || null,
          affiliations: author.affiliations || null,
          email: author.email || null,
          thumbnail: author.thumbnail || null,
          citedBy: data.cited_by?.table || null,
        },
        profileUrl: `https://scholar.google.com/citations?user=${scholarId}`,
        publications,
        totalPublications: publications.length,
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
