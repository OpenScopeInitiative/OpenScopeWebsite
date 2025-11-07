// DOM Elements
const articlesGrid = document.getElementById("articles-grid");
const searchInput = document.getElementById("search-articles");
const searchBtn = document.getElementById("search-btn");
const categorySelect = document.getElementById("category-select");
const sortSelect = document.getElementById("sort-select");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageNumbers = document.getElementById("page-numbers");

// Articles state
let articles = [];
let filteredArticles = [];
let currentPage = 1;
const articlesPerPage = 6;

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch articles from Supabase
    articles = await getAllArticles();

    // Initialize filtered articles
    filteredArticles = [...articles];

    // Render articles
    renderArticles();

    // Add event listeners
    initEventListeners();
  } catch (error) {
    console.error("Error initializing articles page:", error);
    // Removed error notification since articles still load
  }
});

// Initialize event listeners
function initEventListeners() {
  // Search
  searchBtn.addEventListener("click", handleSearch);
  searchInput.addEventListener("input", handleSearch);

  // Category filter
  categorySelect.addEventListener("change", handleFilter);

  // Sort
  sortSelect.addEventListener("change", handleSort);

  // Pagination
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderArticles();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderArticles();
    }
  });
}

// Handle search
function handleSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (searchTerm === "") {
    // Reset to all articles if search is cleared
    filteredArticles = [...articles];
  } else {
    // Filter articles by search term
    filteredArticles = articles.filter((article) => {
      return (
        article.title.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        article.summary.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Reset to first page
  currentPage = 1;

  // Render filtered articles
  renderArticles();
}

// Handle category filter
function handleFilter() {
  const category = categorySelect.value;

  if (category === "all") {
    // Show all articles
    filteredArticles = [...articles];
  } else {
    // Filter articles by category
    filteredArticles = articles.filter((article) => {
      return article.category.toLowerCase() === category.toLowerCase();
    });
  }

  // Reset to first page
  currentPage = 1;

  // Render filtered articles
  renderArticles();
}

// Handle sort
function handleSort() {
  const sortBy = sortSelect.value;

  switch (sortBy) {
    case "newest":
      filteredArticles.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      break;
    case "oldest":
      filteredArticles.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      break;
    case "a-z":
      filteredArticles.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "z-a":
      filteredArticles.sort((a, b) => b.title.localeCompare(a.title));
      break;
    default:
      filteredArticles.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
  }

  // Render sorted articles
  renderArticles();
}

// Render articles
function renderArticles() {
  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  // Clear articles grid
  articlesGrid.innerHTML = "";

  // Check if no articles found
  if (currentArticles.length === 0) {
    articlesGrid.innerHTML = `
            <div class="no-articles">
                <h3>No articles found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;

    // Hide pagination
    prevPageBtn.style.display = "none";
    nextPageBtn.style.display = "none";
    pageNumbers.style.display = "none";

    return;
  }

  // Render articles
  currentArticles.forEach((article) => {
    const articleCard = createArticleCard(article);
    articlesGrid.appendChild(articleCard);
  });

  // Update pagination
  updatePagination(totalPages);
}

// Create article card
function createArticleCard(article) {
  const articleCard = document.createElement("div");
  articleCard.classList.add("article-card");

  // Format date
  const date = new Date(article.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get author name
  const authorName = article.profiles ? article.profiles.name : "Unknown";

  articleCard.innerHTML = `
        <div class="article-image">
            <img src="${article.image_url}" alt="${article.title}">
        </div>
        <div class="article-content">
            <div class="article-tag">${article.category}</div>
            <h3>${article.title}</h3>
            <p>${article.summary}</p>
            <div class="article-meta">
                <span class="article-author"  style="display:none;">By ${authorName}</span>
                <span class="article-date">${formattedDate}</span>
            </div>
            <a href="article.html?id=${article.id}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
        </div>
    `;

  return articleCard;
}

// Update pagination
function updatePagination(totalPages) {
  // Update previous button
  prevPageBtn.disabled = currentPage === 1;

  // Update next button
  nextPageBtn.disabled = currentPage === totalPages;

  // Update page numbers
  pageNumbers.innerHTML = "";

  // Determine which page numbers to show
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4 && totalPages > 4) {
    startPage = Math.max(1, endPage - 4);
  }

  // Add first page if not included
  if (startPage > 1) {
    const pageButton = createPageButton(1);
    pageNumbers.appendChild(pageButton);

    if (startPage > 2) {
      const ellipsis = document.createElement("span");
      ellipsis.classList.add("page-ellipsis");
      ellipsis.textContent = "...";
      pageNumbers.appendChild(ellipsis);
    }
  }

  // Add page numbers
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = createPageButton(i);
    pageNumbers.appendChild(pageButton);
  }

  // Add last page if not included
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement("span");
      ellipsis.classList.add("page-ellipsis");
      ellipsis.textContent = "...";
      pageNumbers.appendChild(ellipsis);
    }

    const pageButton = createPageButton(totalPages);
    pageNumbers.appendChild(pageButton);
  }

  // Show pagination if there are articles
  prevPageBtn.style.display = "flex";
  nextPageBtn.style.display = "flex";
  pageNumbers.style.display = "flex";
}

// Create page button
function createPageButton(pageNumber) {
  const pageButton = document.createElement("button");
  pageButton.classList.add("page-number");
  pageButton.textContent = pageNumber;

  if (pageNumber === currentPage) {
    pageButton.classList.add("active");
  }

  pageButton.addEventListener("click", () => {
    currentPage = pageNumber;
    renderArticles();
  });

  return pageButton;
}

// Single Article Page
if (window.location.pathname.includes("article.html")) {
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Get article ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const articleId = urlParams.get("id");

      if (!articleId) {
        window.location.href = "articles.html";
        return;
      }

      // Fetch article
      const article = await getArticleById(articleId);

      if (!article) {
        window.location.href = "articles.html";
        return;
      }

      // Render article
      renderArticle(article);

      // Fetch comments
      const comments = await getArticleComments(articleId);

      // Render comments
      renderComments(comments);

      // Initialize comment form
      initCommentForm(articleId);

      // Fetch related articles
      const relatedArticles = await getRelatedArticles(
        article.category,
        articleId
      );

      // Render related articles
      renderRelatedArticles(relatedArticles);
    } catch (error) {
      console.error("Error loading article:", error);
      showNotification(
        "Failed to load article. Please try again later.",
        "error"
      );
    }
  });
}

// Render article
function renderArticle(article) {
  // Format date
  const date = new Date(article.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get author name
  const authorName = article.profiles ? article.profiles.name : "Unknown";

  // Calculate read time (approx. 200 words per minute)
  const wordCount = article.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  // Update page title
  document.title = `${article.title} - OpenScope`;

  // Update article header
  const articleHeader = document.querySelector(".article-header-content");
  if (articleHeader) {
    articleHeader.innerHTML = `
            <div class="article-header-tag">${article.category}</div>
            <h1 class="article-header-title">${article.title}</h1>
            <div class="article-header-meta">
                <div class="article-author">
                    Posted by <div>
                        <span class="article-author-name">${authorName}</span>
                    </div>
                </div>
                <div class="article-date">
                    <i class="far fa-calendar-alt"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="article-read-time">
                    <i class="far fa-clock"></i>
                    <span>${readTime} min read</span>
                </div>
            </div>
        `;
  }

  // Update featured image
  const featuredImage = document.querySelector(".article-featured-image img");
  if (featuredImage) {
    featuredImage.src = article.image_url;
    featuredImage.alt = article.title;
  }

  // Update article body
  const articleBody = document.querySelector(".article-body");
  if (articleBody) {
    // Convert markdown to HTML
    const converter = new showdown.Converter();
    const html = converter.makeHtml(article.content);
    articleBody.innerHTML = html;
  }

  // Update article tags
  const articleTags = document.querySelector(".article-tags");
  if (articleTags) {
    // Extract tags from content or use default tags
    const tags = article.tags || [article.category.toLowerCase(), "science"];

    articleTags.innerHTML = "";
    tags.forEach((tag) => {
      const tagElement = document.createElement("a");
      tagElement.classList.add("tag");
      tagElement.href = `articles.html?tag=${tag}`;
      tagElement.textContent = tag;
      articleTags.appendChild(tagElement);
    });
  }
}

// Render comments
function renderComments(comments) {
  const commentsList = document.querySelector(".comments-list");
  if (!commentsList) return;

  // Update comments count
  const commentsCount = document.querySelector(".comments-count");
  if (commentsCount) {
    commentsCount.textContent = comments.length;
  }

  // Clear comments list
  commentsList.innerHTML = "";

  // Check if no comments
  if (comments.length === 0) {
    commentsList.innerHTML = `
            <div class="no-comments">
                <p>No comments yet. Be the first to comment!</p>
            </div>
        `;
    return;
  }

  // Render comments
  comments.forEach((comment) => {
    const commentElement = createCommentElement(comment);
    commentsList.appendChild(commentElement);
  });
}

// Create comment element
function createCommentElement(comment) {
  const commentElement = document.createElement("div");
  commentElement.classList.add("comment");

  // Format date
  const date = new Date(comment.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get author name
  const authorName = comment.profiles ? comment.profiles.name : "Unknown";

  commentElement.innerHTML = `
        <div class="comment-header">
            <div class="comment-author">
               
                <span class="comment-author-name">${authorName}</span>
            </div>
            <span class="comment-date">${formattedDate}</span>
        </div>
        <div class="comment-content">
            <p>${comment.content}</p>
        </div>
        <div class="comment-actions">
            <div class="comment-action comment-reply">
                <i class="far fa-comment"></i>
                <span>Reply</span>
            </div>
            <div class="comment-action comment-like">
                <i class="far fa-heart"></i>
                <span>Like</span>
            </div>
        </div>
    `;

  return commentElement;
}

// Initialize comment form
function initCommentForm(articleId) {
  const commentForm = document.getElementById("comment-form");
  if (!commentForm) return;

  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Check if user is logged in
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      showNotification("Please log in to comment", "info");
      document.querySelector(".login-btn").click();
      return;
    }

    // Get comment content
    const commentContent = document
      .getElementById("comment-content")
      .value.trim();

    if (commentContent === "") {
      showNotification("Comment cannot be empty", "error");
      return;
    }

    try {
      // Create comment
      const comment = {
        article_id: articleId,
        user_id: session.data.session.user.id,
        content: commentContent,
        created_at: new Date(),
      };

      const result = await createComment(comment);

      if (result) {
        // Clear form
        document.getElementById("comment-content").value = "";

        // Fetch updated comments
        const comments = await getArticleComments(articleId);

        // Render updated comments
        renderComments(comments);

        showNotification("Comment added successfully", "success");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      showNotification(
        "Failed to add comment. Please try again later.",
        "error"
      );
    }
  });
}

// Get related articles
async function getRelatedArticles(category, currentArticleId) {
  try {
    // Fetch articles in the same category
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("category", category)
      .neq("id", currentArticleId)
      .limit(3);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error getting related articles:", error);
    return [];
  }
}

// Render related articles
function renderRelatedArticles(articles) {
  const relatedArticlesGrid = document.querySelector(".related-articles-grid");
  if (!relatedArticlesGrid) return;

  // Clear related articles grid
  relatedArticlesGrid.innerHTML = "";

  // Check if no related articles
  if (articles.length === 0) {
    relatedArticlesGrid.innerHTML = `
            <div class="no-related-articles">
                <p>No related articles found.</p>
            </div>
        `;
    return;
  }

  // Render related articles
  articles.forEach((article) => {
    const articleCard = createArticleCard(article);
    relatedArticlesGrid.appendChild(articleCard);
  });
}

// Writer Dashboard
if (window.location.pathname.includes("writer-dashboard.html")) {
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      console.log("Initializing writer dashboard");
      // Check if user is logged in
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        console.log("User not logged in, redirecting to articles page");
        window.location.href = "articles.html";
        return;
      }

      // Check if user is a writer
      //const isWriter = await isWriter(session.data.session.user.email);
      const isWriter = true;
      console.log("Is user a writer?", isWriter);

      if (!isWriter) {
        console.log("User is not a writer, redirecting to articles page");
        window.location.href = "articles.html";
        return;
      }

      // Initialize dashboard
      console.log(
        "Initializing dashboard for user ID:",
        session.data.session.user.id
      );
      initDashboard(session.data.session.user.id);
    } catch (error) {
      console.error("Error initializing writer dashboard:", error);
      showNotification(
        "Failed to load writer dashboard. Please try again later.",
        "error"
      );
    }
  });
}

// Initialize dashboard
async function initDashboard(userId) {
  console.log("initDashboard called with userId:", userId);

  try {
    // Fetch user's articles
    console.log("Fetching user articles");
    const articles = await getUserArticles(userId);
    console.log("User articles:", articles);

    // Render articles table
    console.log("Rendering articles table");
    renderArticlesTable(articles);

    // Initialize dashboard navigation
    console.log("Initializing dashboard navigation");
    initDashboardNav();

    // Initialize article editor
    console.log("Initializing article editor");
    initArticleEditor(userId);

    console.log("Dashboard initialization complete");
  } catch (error) {
    console.error("Error in initDashboard:", error);
    showNotification(
      "An error occurred while initializing the dashboard",
      "error"
    );
  }
}

// Get user's articles
async function getUserArticles(userId) {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error getting user articles:", error);
    return [];
  }
}

// Render articles table
function renderArticlesTable(articles) {
  const articlesTableBody = document.querySelector(".articles-table tbody");
  if (!articlesTableBody) return;

  // Clear table body
  articlesTableBody.innerHTML = "";

  // Check if no articles
  if (articles.length === 0) {
    articlesTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="no-articles-message">You haven't created any articles yet.</td>
            </tr>
        `;
    return;
  }

  // Render articles
  articles.forEach((article) => {
    const row = document.createElement("tr");

    // Format date
    const date = new Date(article.created_at);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    row.innerHTML = `
            <td>${article.title}</td>
            <td>${article.category}</td>
            <td>${formattedDate}</td>
            <td><span class="article-status status-published">Published</span></td>
            <td>
                <div class="article-actions">
                    <a href="article.html?id=${article.id}" class="article-action view" title="View">
                        <i class="fas fa-eye"></i>
                    </a>
                    <a href="writer-dashboard.html?edit=${article.id}" class="article-action edit" title="Edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <a href="#" class="article-action delete" title="Delete" data-id="${article.id}">
                        <i class="fas fa-trash"></i>
                    </a>
                </div>
            </td>
        `;

    articlesTableBody.appendChild(row);
  });

  // Add event listeners to delete buttons
  const deleteButtons = document.querySelectorAll(".article-action.delete");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();

      const articleId = button.getAttribute("data-id");

      if (confirm("Are you sure you want to delete this article?")) {
        try {
          const result = await deleteArticle(articleId);

          if (result) {
            // Remove row from table
            button.closest("tr").remove();

            showNotification("Article deleted successfully", "success");

            // Check if table is empty
            if (articlesTableBody.children.length === 0) {
              articlesTableBody.innerHTML = `
                                <tr>
                                    <td colspan="5" class="no-articles-message">You haven't created any articles yet.</td>
                                </tr>
                            `;
            }
          }
        } catch (error) {
          console.error("Error deleting article:", error);
          showNotification(
            "Failed to delete article. Please try again later.",
            "error"
          );
        }
      }
    });
  });
}

// Initialize dashboard navigation
function initDashboardNav() {
  const dashboardNavItems = document.querySelectorAll(".dashboard-nav-item");
  const dashboardSections = document.querySelectorAll(".dashboard-section");

  dashboardNavItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Get section ID
      const sectionId = item.getAttribute("data-section");

      // Remove active class from all nav items
      dashboardNavItems.forEach((navItem) => {
        navItem.classList.remove("active");
      });

      // Add active class to clicked nav item
      item.classList.add("active");

      // Hide all sections
      dashboardSections.forEach((section) => {
        section.classList.remove("active");
      });

      // Show selected section
      document.getElementById(sectionId).classList.add("active");
    });
  });

  // Check if editing article
  const urlParams = new URLSearchParams(window.location.search);
  const editArticleId = urlParams.get("edit");

  if (editArticleId) {
    // Show editor section
    dashboardNavItems.forEach((navItem) => {
      navItem.classList.remove("active");
      if (navItem.getAttribute("data-section") === "editor-section") {
        navItem.classList.add("active");
      }
    });

    dashboardSections.forEach((section) => {
      section.classList.remove("active");
      if (section.id === "editor-section") {
        section.classList.add("active");
      }
    });

    // Load article for editing
    loadArticleForEditing(editArticleId);
  }
}

// Initialize article editor
function initArticleEditor(userId) {
  const editorForm = document.getElementById("editor-form");
  if (!editorForm) return;

  // Initialize markdown preview
  const markdownInput = document.getElementById("article-content");
  const markdownPreview = document.getElementById("markdown-preview");

  if (markdownInput && markdownPreview) {
    markdownInput.addEventListener("input", () => {
      // Convert markdown to HTML
      const converter = new showdown.Converter();
      const html = converter.makeHtml(markdownInput.value);
      markdownPreview.innerHTML = html;
    });
  }

  // Remove any existing event listeners to prevent duplicates
  const newEditorForm = editorForm.cloneNode(true);
  editorForm.parentNode.replaceChild(newEditorForm, editorForm);

  // Handle form submission
  newEditorForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    // Get form values
    const title = document.getElementById("article-title").value.trim();
    const category = document.getElementById("article-category").value;
    const summary = document.getElementById("article-summary").value.trim();
    const content = document.getElementById("article-content").value.trim();
    const imageUrl = document.getElementById("article-image").value.trim();

    // Validate form
    if (title === "" || summary === "" || content === "") {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      // Check if editing or creating
      const articleId = newEditorForm.getAttribute("data-article-id");

      if (articleId) {
        // Update article
        const updates = {
          title,
          category,
          summary,
          content,
          image_url: imageUrl,
        };

        console.log("Updating article:", articleId, updates);
        const result = await updateArticle(articleId, updates);

        if (result) {
          showNotification("Article updated successfully", "success");

          // Redirect to articles list
          setTimeout(() => {
            window.location.href = "writer-dashboard.html";
          }, 1500);
        }
      } else {
        // Create article
        const article = {
          title,
          category,
          summary,
          content,
          image_url: imageUrl,
          author_id: userId,
          created_at: new Date(),
          is_featured: false,
        };

        console.log("Creating article:", article);
        const result = await createArticle(article);

        if (result) {
          showNotification("Article created successfully", "success");

          // Reset form
          newEditorForm.reset();
          markdownPreview.innerHTML = "";

          // Redirect to articles list
          setTimeout(() => {
            window.location.href = "writer-dashboard.html";
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error saving article:", error);
      showNotification(
        "Failed to save article. Please try again later.",
        "error"
      );
    }
  });
}

// Load article for editing
async function loadArticleForEditing(articleId) {
  try {
    // Fetch article
    const article = await getArticleById(articleId);

    if (!article) {
      window.location.href = "writer-dashboard.html";
      return;
    }

    // Update form
    const editorForm = document.getElementById("editor-form");
    if (editorForm) {
      editorForm.setAttribute("data-article-id", articleId);

      // Set form values
      document.getElementById("article-title").value = article.title;
      document.getElementById("article-category").value = article.category;
      document.getElementById("article-summary").value = article.summary;
      document.getElementById("article-content").value = article.content;
      document.getElementById("article-image").value = article.image_url;

      // Update preview
      const converter = new showdown.Converter();
      const html = converter.makeHtml(article.content);
      document.getElementById("markdown-preview").innerHTML = html;

      // Update editor title
      document.querySelector(".dashboard-section-title").textContent =
        "Edit Article";

      // Update submit button
      document.querySelector('#editor-form button[type="submit"]').textContent =
        "Update Article";
    }
  } catch (error) {
    console.error("Error loading article for editing:", error);
    showNotification(
      "Failed to load article. Please try again later.",
      "error"
    );
  }
}
