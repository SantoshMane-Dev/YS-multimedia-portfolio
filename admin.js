document.addEventListener("DOMContentLoaded", () => {
  const client = window.portfolioSupabase;
  const bucket = "portfolio-media";
  const maxFileSize = 50 * 1024 * 1024;
  const loginPanel = document.getElementById("login-panel");
  const dashboard = document.getElementById("dashboard");
  const loginForm = document.getElementById("login-form");
  const loginStatus = document.getElementById("login-status");
  const dashboardStatus = document.getElementById("dashboard-status");
  const portfolioForm = document.getElementById("portfolio-form");
  const mediaTypeSelect = document.getElementById("media-type");
  const categorySelect = document.getElementById("category");
  const fileInput = document.getElementById("media-file");
  const fileField = document.getElementById("file-field");
  const itemsList = document.getElementById("items-list");
  const saveButton = document.getElementById("save-item");
  let editingItem = null;

  const categoryLabel = (mediaType, categoryId) =>
    window.PORTFOLIO_CATEGORIES[mediaType]?.find((category) => category.id === categoryId)
      ?.label || categoryId;

  const setStatus = (element, message, kind = "") => {
    element.textContent = message;
    element.className = `status${kind ? ` ${kind}` : ""}`;
  };

  const setCategoryOptions = (selectedCategory = "") => {
    const categories = window.PORTFOLIO_CATEGORIES[mediaTypeSelect.value] || [];
    categorySelect.replaceChildren(
      ...categories.map((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.label;
        option.selected = category.id === selectedCategory;
        return option;
      }),
    );
  };

  const showLogin = (message = "") => {
    loginPanel.hidden = false;
    dashboard.hidden = true;
    setStatus(loginStatus, message, message ? "error" : "");
  };

  const loadItems = async () => {
    const { data, error } = await client
      .from("portfolio_items")
      .select("id, media_type, category, title, description, object_path, is_published, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    itemsList.replaceChildren();
    if (!data.length) {
      const empty = document.createElement("p");
      empty.className = "empty-list";
      empty.textContent = "No uploads yet. Add your first portfolio item above.";
      itemsList.append(empty);
      return;
    }

    data.forEach((item) => {
      const card = document.createElement("article");
      card.className = "item-card";

      const info = document.createElement("div");
      info.className = "item-info";

      const title = document.createElement("h3");
      title.textContent = item.title;
      const meta = document.createElement("p");
      meta.className = "item-meta";
      meta.textContent = `${item.media_type === "video" ? "Video" : "Image"} · ${categoryLabel(item.media_type, item.category)}`;
      const description = document.createElement("p");
      description.className = "item-description";
      description.textContent = item.description || "";
      const status = document.createElement("span");
      status.className = "item-status";
      status.textContent = item.is_published ? "Published" : "Draft";
      info.append(title, meta, description, status);

      const actions = document.createElement("div");
      actions.className = "item-actions";
      actions.append(
        createActionButton("Edit", () => beginEdit(item)),
        createActionButton(item.is_published ? "Unpublish" : "Publish", () =>
          togglePublished(item),
        ),
        createActionButton("Delete", () => deleteItem(item), `Delete ${item.title}`),
      );
      card.append(info, actions);
      itemsList.append(card);
    });
  };

  const createActionButton = (label, action, accessibleLabel = label) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button button-secondary";
    button.textContent = label;
    button.setAttribute("aria-label", accessibleLabel);
    button.addEventListener("click", action);
    return button;
  };

  const showDashboard = async () => {
    const { data: isAdmin, error } = await client.rpc("is_portfolio_admin");
    if (error) throw error;
    if (!isAdmin) {
      await client.auth.signOut();
      showLogin("This account is not authorized to manage the portfolio.");
      return;
    }

    loginPanel.hidden = true;
    dashboard.hidden = false;
    setStatus(dashboardStatus, "Signed in. New uploads are private drafts by default.", "success");
    await loadItems();
  };

  const resetForm = () => {
    editingItem = null;
    portfolioForm.reset();
    mediaTypeSelect.disabled = false;
    fileInput.required = true;
    fileField.hidden = false;
    document.getElementById("form-heading").textContent = "Upload work";
    saveButton.textContent = "Upload item";
    document.getElementById("cancel-edit").hidden = true;
    setCategoryOptions();
  };

  const beginEdit = (item) => {
    editingItem = item;
    mediaTypeSelect.value = item.media_type;
    mediaTypeSelect.disabled = true;
    setCategoryOptions(item.category);
    document.getElementById("title").value = item.title;
    document.getElementById("description").value = item.description || "";
    document.getElementById("is-published").checked = item.is_published;
    fileInput.required = false;
    fileField.hidden = true;
    document.getElementById("form-heading").textContent = "Edit portfolio item";
    saveButton.textContent = "Save changes";
    document.getElementById("cancel-edit").hidden = false;
    document.querySelector(".upload-panel").scrollIntoView({ behavior: "smooth" });
  };

  const getAllowedMimeTypes = (mediaType) =>
    mediaType === "video"
      ? ["video/mp4", "video/webm", "video/quicktime"]
      : ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const uploadItem = async (formData) => {
    const file = fileInput.files?.[0];
    if (!file) throw new Error("Choose a photo or video to upload.");
    if (file.size > maxFileSize) throw new Error("The file must be 50 MiB or smaller.");
    if (!getAllowedMimeTypes(mediaTypeSelect.value).includes(file.type)) {
      throw new Error("Choose a supported file type for the selected media category.");
    }

    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${mediaTypeSelect.value}/${crypto.randomUUID()}${extension ? `.${extension}` : ""}`;
    const { error: uploadError } = await client.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { error: insertError } = await client.from("portfolio_items").insert({
      media_type: mediaTypeSelect.value,
      category: formData.get("category"),
      title: formData.get("title").trim(),
      description: formData.get("description").trim(),
      object_path: path,
      is_published: document.getElementById("is-published").checked,
    });
    if (insertError) {
      const { error: cleanupError } = await client.storage.from(bucket).remove([path]);
      if (cleanupError) {
        throw new Error(`${insertError.message}. Uploaded file cleanup also failed: ${cleanupError.message}`);
      }
      throw insertError;
    }
  };

  const togglePublished = async (item) => {
    setStatus(dashboardStatus, "Updating publication status...");
    const { error } = await client
      .from("portfolio_items")
      .update({ is_published: !item.is_published })
      .eq("id", item.id);
    if (error) {
      setStatus(dashboardStatus, `Could not update item: ${error.message}`, "error");
      return;
    }

    try {
      await loadItems();
      setStatus(dashboardStatus, item.is_published ? "Item moved to drafts." : "Item published.", "success");
    } catch (loadError) {
      setStatus(dashboardStatus, `Updated, but could not refresh the list: ${loadError.message}`, "error");
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Permanently delete "${item.title}" and its uploaded file?`)) return;

    setStatus(dashboardStatus, "Deleting item...");
    const { error: rowError } = await client
      .from("portfolio_items")
      .delete()
      .eq("id", item.id);
    if (rowError) {
      setStatus(dashboardStatus, `Could not delete item: ${rowError.message}`, "error");
      return;
    }

    const { error: fileError } = await client.storage.from(bucket).remove([item.object_path]);
    try {
      await loadItems();
    } catch (loadError) {
      setStatus(dashboardStatus, `Item deleted, but the list could not refresh: ${loadError.message}`, "error");
      return;
    }
    setStatus(
      dashboardStatus,
      fileError
        ? `Item removed from the library, but its stored file could not be deleted: ${fileError.message}`
        : "Item and stored file deleted.",
      fileError ? "error" : "success",
    );
  };

  setCategoryOptions();
  mediaTypeSelect.addEventListener("change", () => setCategoryOptions());
  document.getElementById("cancel-edit").addEventListener("click", resetForm);

  if (!client) {
    document.querySelectorAll("#login-form input, #login-form button").forEach((input) => {
      input.disabled = true;
    });
    showLogin(
      window.supabase
        ? "Add your Supabase project URL and public anon key to portfolio-config.js."
        : "Supabase could not load. Check your internet connection and reload.",
    );
    return;
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    setStatus(loginStatus, "Signing in...");

    const formData = new FormData(loginForm);
    const { error } = await client.auth.signInWithPassword({
      email: formData.get("email").trim(),
      password: formData.get("password"),
    });
    submitButton.disabled = false;
    if (error) {
      setStatus(loginStatus, `Sign-in failed: ${error.message}`, "error");
      return;
    }

    try {
      await showDashboard();
    } catch (dashboardError) {
      await client.auth.signOut();
      showLogin(`Could not open the admin dashboard: ${dashboardError.message}`);
    }
  });

  portfolioForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    saveButton.disabled = true;
    setStatus(dashboardStatus, editingItem ? "Saving changes..." : "Uploading file...");

    try {
      const formData = new FormData(portfolioForm);
      if (editingItem) {
        const { error } = await client
          .from("portfolio_items")
          .update({
            category: formData.get("category"),
            title: formData.get("title").trim(),
            description: formData.get("description").trim(),
            is_published: document.getElementById("is-published").checked,
          })
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        await uploadItem(formData);
      }

      resetForm();
      await loadItems();
      setStatus(dashboardStatus, "Portfolio item saved.", "success");
    } catch (error) {
      setStatus(dashboardStatus, `Could not save item: ${error.message}`, "error");
    } finally {
      saveButton.disabled = false;
    }
  });

  document.getElementById("sign-out").addEventListener("click", async () => {
    const { error } = await client.auth.signOut();
    if (error) {
      setStatus(dashboardStatus, `Could not sign out: ${error.message}`, "error");
      return;
    }
    showLogin();
  });

  client.auth.getSession().then(async ({ data, error }) => {
    if (error) {
      showLogin(`Could not check the saved session: ${error.message}`);
      return;
    }
    if (!data.session) return;

    try {
      await showDashboard();
    } catch (dashboardError) {
      showLogin(`Could not open the admin dashboard: ${dashboardError.message}`);
    }
  });
});
