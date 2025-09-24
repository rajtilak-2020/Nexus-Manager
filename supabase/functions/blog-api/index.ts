const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

interface BlogResponse {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image_url?: string;
  status: string;
  reading_time: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  tags?: Array<{
    name: string;
    slug: string;
    color: string;
  }>;
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const url = new URL(req.url);
    const pathname = url.pathname;

    // Parse API key from Authorization header
    const authHeader = req.headers.get("Authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Verify API key and get user
    const { data: apiKeyData, error: apiKeyError } = await supabaseClient
      .from("user_api_keys")
      .select("user_id, is_active")
      .eq("api_key", apiKey)
      .single();

    if (apiKeyError || !apiKeyData || !apiKeyData.is_active) {
      return new Response(
        JSON.stringify({ error: "Invalid or inactive API key" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update last_used_at for the API key
    await supabaseClient
      .from("user_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("api_key", apiKey);

    const userId = apiKeyData.user_id;

    // Handle different endpoints
    if (pathname.endsWith("/blogs") && req.method === "GET") {
      // Get published blogs for the user
      const status = url.searchParams.get("status") || "published";
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabaseClient
        .from("blogs")
        .select(`
          id,
          title,
          slug,
          summary,
          content,
          featured_image_url,
          status,
          reading_time,
          published_at,
          created_at,
          updated_at,
          tags:blog_post_tags(
            tag:blog_tags(name, slug, color)
          )
        `)
        .eq("user_id", userId)
        .order("published_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status !== "all") {
        query = query.eq("status", status);
      }

      const { data: blogs, error } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Transform the data to match expected format
      const transformedBlogs: BlogResponse[] = blogs.map(blog => ({
        ...blog,
        tags: blog.tags.map((t: any) => t.tag).filter(Boolean),
      }));

      return new Response(
        JSON.stringify({
          data: transformedBlogs,
          count: transformedBlogs.length,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (pathname.includes("/blogs/") && req.method === "GET") {
      // Get specific blog by slug
      const slug = pathname.split("/blogs/")[1];

      const { data: blog, error } = await supabaseClient
        .from("blogs")
        .select(`
          id,
          title,
          slug,
          summary,
          content,
          featured_image_url,
          status,
          reading_time,
          published_at,
          created_at,
          updated_at,
          tags:blog_post_tags(
            tag:blog_tags(name, slug, color)
          )
        `)
        .eq("user_id", userId)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error || !blog) {
        return new Response(
          JSON.stringify({ error: "Blog not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const transformedBlog: BlogResponse = {
        ...blog,
        tags: blog.tags.map((t: any) => t.tag).filter(Boolean),
      };

      return new Response(
        JSON.stringify({ data: transformedBlog }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 404 for unknown endpoints
    return new Response(
      JSON.stringify({ error: "Endpoint not found" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to create Supabase client
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: any) => ({
          single: () => fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}&${column}=eq.${value}`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
          }).then(r => r.json()),
          order: (column: string, options: any) => ({
            range: (from: number, to: number) => fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}&${column}=eq.${value}&order=${column}.${options.ascending ? 'asc' : 'desc'}&offset=${from}&limit=${to - from + 1}`, {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
              },
            }).then(r => r.json()),
          }),
        }),
        order: (column: string, options: any) => ({
          range: (from: number, to: number) => fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}&order=${column}.${options.ascending ? 'asc' : 'desc'}&offset=${from}&limit=${to - from + 1}`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
          }).then(r => r.json()),
          eq: (filterColumn: string, filterValue: any) => ({
            range: (from: number, to: number) => fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}&${filterColumn}=eq.${filterValue}&order=${column}.${options.ascending ? 'asc' : 'desc'}&offset=${from}&limit=${to - from + 1}`, {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
              },
            }).then(r => r.json()),
          }),
        }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).then(r => r.json()),
      }),
    }),
  };
}