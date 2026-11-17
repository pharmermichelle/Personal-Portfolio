/* Retro Games Hub shared browser client — Phase 1.
   This file only uses a public Supabase publishable key. No secrets or service role.
   Future games may include this file to share one origin-local auth session. */
(function (root) {
  "use strict";
  if (!root.supabase || typeof root.supabase.createClient !== "function") {
    root.RetroHubPlatform = { error: "Supabase library failed to load." };
    return;
  }
  var supabaseUrl = "https://dxemotgroklcjsbunspg.supabase.co";
  var publishableKey = "sb_publishable_o1-WllKmHgMuJFQwzCqeEw_KzJnkj8d";
  var client = root.supabase.createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "sb-dxemotgroklcjsbunspg-auth-token"
    }
  });
  root.RetroHubPlatform = Object.freeze({
    client: client,
    async getUser() {
      var result = await client.auth.getUser();
      if (result.error) throw result.error;
      return result.data.user;
    },
    onAuthChange: function (callback) {
      return client.auth.onAuthStateChange(callback);
    }
  });
})(window);
