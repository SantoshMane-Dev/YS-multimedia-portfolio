window.PORTFOLIO_CONFIG = {
  supabaseUrl: "https://wrrpqngszaecbjgvgndy.supabase.co",
  supabaseAnonKey: "sb_publishable_yH0Pvw_nE9xMUv8wYNhsEQ_OIq_8NvV",
};

window.PORTFOLIO_CATEGORIES = {
  video: [
    { id: "mehendi", label: "Mehendi" },
    { id: "grahdev", label: "Grahdev" },
    { id: "bangdiya", label: "Bangdiya" },
    { id: "haldi", label: "Haldi" },
    { id: "engagement", label: "Engagement" },
    { id: "wedding", label: "Wedding" },
    { id: "digital-wedding-invitation", label: "Digital Wedding Invitation" },
    { id: "reception", label: "Reception" },
    { id: "cinematic-pre-wedding", label: "Cinematic Pre-Wedding" },
    { id: "couple-reels", label: "Couple Reels" },
    { id: "save-the-date", label: "Save the Date Video" },
    { id: "birthday", label: "Birthday" },
    { id: "anniversary", label: "Anniversary" },
    { id: "baby-welcome-shoot", label: "Baby Welcome Shoot" },
    { id: "shop-opening", label: "Shop Opening" },
    { id: "new-car-delivery", label: "New Car Delivery" },
    { id: "vatpournima", label: "Vatpournima" },
    { id: "baby-shoot", label: "Baby Shoot" },
  ],
  image: [
    { id: "wedding-cards", label: "Wedding Card Designs" },
    { id: "banners", label: "Banner Design" },
    { id: "social-media", label: "Social Media Graphics" },
    { id: "custom-graphics", label: "Custom Graphics" },
  ],
};

const supabaseUrl = window.PORTFOLIO_CONFIG.supabaseUrl.trim();
const supabaseAnonKey = window.PORTFOLIO_CONFIG.supabaseAnonKey.trim();

window.portfolioSupabase =
  supabaseUrl && supabaseAnonKey && window.supabase?.createClient
    ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
    : null;
