// Supabase Configuration (publishable key only, do not share private key)
const SUPABASE_URL = "https://emmknyrewirmotqegrzt.supabase.co";
const SUPABASE_KEY = "sb_publishable_q8RVt7a0JSpm6cWntlfiiA_d-jWxtQE";

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Authentication Functions
async function signUpUser(email, password, name) {
  try {
    // Validate password length
    if (password.length < 6) {
      throw new Error("Password should be at least 6 characters.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;

    // Create user profile in profiles table
    if (data.user) {
      try {
        await createUserProfile(data.user.id, name, email);
      } catch (profileError) {
        console.error(
          "Error creating profile, but user was created:",
          profileError
        );
        // Continue anyway since the user was created
      }
    }

    return data;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

async function signInUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

async function checkAuthState() {
  try {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      // User is logged in
      handleAuthStateChange(data.session.user);
    } else {
      // User is not logged in
      handleAuthStateChange(null);
    }
  } catch (error) {
    console.error("Error checking auth state:", error);
  }
}

// User Profile Functions
async function createUserProfile(userId, name, email) {
  try {
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      name,
      email,
      created_at: new Date(),
    });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}

async function updateUserProfile(userId, updates) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

// Article Functions
async function getFeaturedArticles() {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Error getting featured articles:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting featured articles:", error);
    throw error;
  }
}

async function getAllArticles() {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error getting all articles:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting all articles:", error);
    throw error;
  }
}

async function getArticleById(id) {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
                *,
                profiles:author_id (name)
            `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error getting article by ID:", error);
    throw error;
  }
}

async function createArticle(article) {
  try {
    console.log("Creating article with data:", article);

    // Ensure all required fields are present
    const requiredFields = [
      "title",
      "category",
      "summary",
      "content",
      "image_url",
      "author_id",
    ];
    for (const field of requiredFields) {
      if (!article[field]) {
        console.error(`Missing required field: ${field}`);
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Ensure created_at is a valid date string
    if (article.created_at instanceof Date) {
      article.created_at = article.created_at.toISOString();
    }

    console.log("Submitting article to Supabase:", article);

    const { data, error } = await supabase
      .from("articles")
      .insert(article)
      .select();

    if (error) {
      console.error("Supabase error creating article:", error);
      throw error;
    }

    console.log("Article created successfully:", data[0]);
    return data[0];
  } catch (error) {
    console.error("Error creating article:", error);
    throw error;
  }
}

async function updateArticle(id, updates) {
  try {
    const { error } = await supabase
      .from("articles")
      .update(updates)
      .eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error updating article:", error);
    throw error;
  }
}

async function deleteArticle(id) {
  try {
    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting article:", error);
    throw error;
  }
}

// Comment Functions
async function getArticleComments(articleId) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
                *,
                profiles:user_id (name)
            `
      )
      .eq("article_id", articleId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error getting article comments:", error);
    throw error;
  }
}

async function createComment(comment) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select();

    if (error) throw error;

    return data[0];
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
}

async function deleteComment(id, userId) {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}

// Newsletter Functions
async function subscribeToNewsletter(email) {
  try {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, subscribed_at: new Date() })
      .select();

    if (error) {
      // Check if error is due to duplicate email
      if (error.code === "23505") {
        throw new Error("You are already subscribed to the newsletter");
      }
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    throw error;
  }
}

// Writer Authentication
async function isWriter(email) {
  if (email === "eldiiarbekbolotov@gmail.com") {
    return true;
  }

  try {
    const { data, error } = await supabase
      .from("writers")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Check if email is in our predefined writers list
        const predefinedWriters = ["eldiiarbekbolotov@gmail.com"];

        return predefinedWriters.includes(email);
      }
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error checking writer status:", error);

    // Check if email is in our predefined writers list
    const predefinedWriters = ["eldiiarbekbolotov@gmail.com"];

    return predefinedWriters.includes(email);
  }
}

// Initialize Supabase Tables - Simplified version
async function initializeSupabaseTables() {
  try {
    console.log("Initializing Supabase integration...");

    // For demo purposes, we'll skip actual table creation
    // In a production environment, tables would be created in the Supabase dashboard
    // or via SQL migrations

    console.log("Supabase integration initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing Supabase:", error);
    // Don't throw the error, just log it
    // This allows the app to continue functioning with static data
    return false;
  }
}

// Insert sample data
async function insertSampleData() {
  try {
    // Insert sample writers
    const writers = [
      { email: "writer1@openscope.team", name: "Alex Johnson" },
      { email: "writer2@openscope.team", name: "Maya Rodriguez" },
      { email: "writer3@openscope.team", name: "Jordan Lee" },
    ];

    const { error: writersError } = await supabase
      .from("writers")
      .insert(writers);

    if (writersError) throw writersError;

    // No sample articles - we'll rely on real data from the database

    console.log("Sample data inserted successfully");
    return true;
  } catch (error) {
    console.error("Error inserting sample data:", error);
    throw error;
  }
}

// Export functions
window.signUpUser = signUpUser;
window.signInUser = signInUser;
window.signOutUser = signOutUser;
window.checkAuthState = checkAuthState;
window.getUserProfile = getUserProfile;
window.updateUserProfile = updateUserProfile;
window.getFeaturedArticles = getFeaturedArticles;
window.getAllArticles = getAllArticles;
window.getArticleById = getArticleById;
window.createArticle = createArticle;
window.updateArticle = updateArticle;
window.deleteArticle = deleteArticle;
window.getArticleComments = getArticleComments;
window.createComment = createComment;
window.deleteComment = deleteComment;
window.subscribeToNewsletter = subscribeToNewsletter;
window.isWriter = isWriter;
window.initializeSupabaseTables = initializeSupabaseTables;
