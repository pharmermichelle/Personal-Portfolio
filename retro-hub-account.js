/* Retro Games Hub account UI. Guest gameplay is never blocked by auth failures.
   Private-by-default profile data; no public player directory or score awards. */
(function (root) {
  "use strict";
  function byId(id) { return document.getElementById(id); }
  function safeError(error) { return error && error.message ? error.message : "Something went wrong. Please try again."; }
  function validUsername(value) { return /^[A-Za-z0-9_]{3,24}$/.test(value); }
  var starterAvatars = {
    "pixel-star": "⭐", "pixel-cat": "🐱", "pixel-rocket": "🚀", "pixel-joystick": "🕹️"
  };

  function init(options) {
    var client = options && options.client;
    if (!client) {
      byId("auth-status").textContent = "Playing as guest (account service unavailable)";
      return;
    }
    var modal = byId("auth-modal"), profileModal = byId("profile-modal");
    var form = byId("auth-form"), profileForm = byId("profile-form");
    var message = byId("auth-message"), profileMessage = byId("profile-message");
    var email = byId("auth-email"), password = byId("auth-password");
    var confirmPassword = byId("auth-confirm-password");
    var mode = "login", currentUser = null, profile = null;
    var busy = false, lastFocus = null, profileSequence = 0;

    function showMessage(value, isError) {
      message.textContent = value || "";
      message.dataset.error = isError ? "true" : "false";
    }
    function showProfileMessage(value, isError) {
      profileMessage.textContent = value || "";
      profileMessage.dataset.error = isError ? "true" : "false";
    }
    function setBusy(value) {
      busy = value;
      byId("auth-submit-btn").disabled = value;
      byId("profile-save-btn").disabled = value;
      byId("auth-resend-btn").disabled = value;
    }
    function setMode(nextMode) {
      mode = nextMode;
      var signup = mode === "signup", recovery = mode === "recovery";
      var newPassword = mode === "new-password", verification = mode === "verification";
      byId("auth-modal-title").textContent = ({
        login: "Log in to Retro Games Hub",
        signup: "Create your player account",
        recovery: "Reset your password",
        "new-password": "Choose a new password",
        verification: "Check your email"
      })[mode] || "Player account";
      byId("auth-email-row").hidden = newPassword || verification;
      byId("auth-password-row").hidden = recovery || verification;
      byId("auth-confirm-row").hidden = !signup && !newPassword;
      email.required = !newPassword && !verification;
      password.required = !recovery && !verification;
      confirmPassword.required = signup || newPassword;
      byId("auth-submit-btn").hidden = verification;
      byId("auth-submit-btn").textContent = signup ? "Create Account" :
        recovery ? "Send Reset Link" : newPassword ? "Save New Password" : "Log In";
      byId("auth-resend-row").hidden = !verification;
      byId("auth-login-mode").hidden = mode === "login" || mode === "new-password";
      byId("auth-signup-mode").hidden = mode === "signup" || mode === "new-password";
      byId("auth-forgot-mode").hidden = recovery || verification || newPassword;
      password.autocomplete = signup ? "new-password" : "current-password";
      byId("auth-confirm-password").autocomplete = "new-password";
      showMessage("");
    }
    function openDialog(element, focusTarget) {
      lastFocus = document.activeElement;
      element.hidden = false;
      document.body.classList.add("retro-dialog-open");
      (focusTarget || element.querySelector("button,input,select")).focus();
    }
    function closeDialog(element) {
      element.hidden = true;
      if (modal.hidden && profileModal.hidden) document.body.classList.remove("retro-dialog-open");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }
    function updateHeader(user) {
      currentUser = user || null;
      byId("auth-open-btn").hidden = !!user;
      byId("logout-btn").hidden = !user;
      byId("profile-open-btn").hidden = !user;
      if (!user) {
        profile = null;
        byId("auth-status").textContent = "Playing as guest";
        return;
      }
      byId("auth-status").textContent = profile && profile.username ?
        "🎮 " + profile.username : "🎮 Signed in";
    }
    async function loadProfile(user) {
      var request = ++profileSequence;
      var result = await client.from("profiles")
        .select("username,avatar_key,is_public,created_at,updated_at")
        .eq("id", user.id).maybeSingle();
      if (!currentUser || currentUser.id !== user.id || request !== profileSequence) return;
      if (result.error) {
        showProfileMessage("Could not load profile: " + safeError(result.error), true);
        return;
      }
      profile = result.data || null;
      updateHeader(user);
      byId("profile-username").value = profile && profile.username || "";
      byId("profile-avatar").value = profile && starterAvatars[profile.avatar_key] ?
        profile.avatar_key : "pixel-star";
      byId("profile-email").textContent = user.email || "Verified player";
      byId("profile-visibility").textContent = "Private. Your activity and email are not publicly listed.";
      byId("profile-avatar-preview").textContent = starterAvatars[byId("profile-avatar").value];
    }
    function applySession(session) {
      var user = session && session.user || null;
      if (!user) {
        ++profileSequence;
        updateHeader(null);
        return;
      }
      if (!currentUser || currentUser.id !== user.id) profile = null;
      if (!profile) {
        updateHeader(user);
        loadProfile(user);
      } else updateHeader(user);
    }
    async function submitAuth(event) {
      event.preventDefault();
      if (busy) return;
      var enteredEmail = email.value.trim(), enteredPassword = password.value;
      if (mode !== "new-password" && !email.validity.valid) {
        showMessage("Enter a valid email address.", true); email.focus(); return;
      }
      if (mode === "recovery") {
        setBusy(true);
        try {
          var sent = await client.auth.resetPasswordForEmail(enteredEmail, {
            redirectTo: root.location.origin + root.location.pathname
          });
          if (sent.error) throw sent.error;
          showMessage("If that address belongs to an account, a reset link will arrive by email.");
        } catch (error) { showMessage(safeError(error), true); }
        finally { setBusy(false); }
        return;
      }
      if (enteredPassword.length < (mode === "signup" || mode === "new-password" ? 12 : 1)) {
        showMessage(mode === "login" ? "Enter your password." : "Use a password with at least 12 characters.", true);
        password.focus(); return;
      }
      if ((mode === "signup" || mode === "new-password") && enteredPassword !== confirmPassword.value) {
        showMessage("The passwords do not match.", true); confirmPassword.focus(); return;
      }
      setBusy(true);
      try {
        if (mode === "new-password") {
          var changed = await client.auth.updateUser({ password: enteredPassword });
          if (changed.error) throw changed.error;
          password.value = ""; confirmPassword.value = "";
          setMode("login");
          showMessage("Password updated. Your account is ready.");
        } else if (mode === "signup") {
          var signup = await client.auth.signUp({
            email: enteredEmail, password: enteredPassword,
            options: { emailRedirectTo: root.location.origin + root.location.pathname }
          });
          if (signup.error) throw signup.error;
          password.value = ""; confirmPassword.value = "";
          if (signup.data && signup.data.session) {
            applySession(signup.data.session);
            closeDialog(modal);
          } else {
            setMode("verification");
            showMessage("Open your verification email to activate your account. Check spam if needed.");
          }
        } else {
          var result = await client.auth.signInWithPassword({
            email: enteredEmail, password: enteredPassword
          });
          if (result.error) throw result.error;
          if (result.data && result.data.session) {
            applySession(result.data.session);
            password.value = "";
            closeDialog(modal);
          } else showMessage("Please verify your email before logging in.");
        }
      } catch (error) { showMessage(safeError(error), true); }
      finally { setBusy(false); }
    }
    async function saveProfile(event) {
      event.preventDefault();
      if (!currentUser || busy) return;
      var name = byId("profile-username").value.trim();
      var avatar = byId("profile-avatar").value;
      if (name && !validUsername(name)) {
        showProfileMessage("Use 3–24 letters, numbers or underscores for your username.", true);
        byId("profile-username").focus();
        return;
      }
      if (!starterAvatars[avatar]) {
        showProfileMessage("Choose a starter avatar from the list.", true); return;
      }
      setBusy(true); showProfileMessage("Saving your profile…");
      try {
        var values = { username: name || null, avatar_key: avatar };
        var result = await client.from("profiles").update(values).eq("id", currentUser.id).select("id");
        if (result.error) throw result.error;
        if (!result.data || !result.data.length) {
          var insert = await client.from("profiles").insert({
            id: currentUser.id, username: values.username, avatar_key: values.avatar_key
          });
          if (insert.error) throw insert.error;
        }
        profile = Object.assign({}, profile || {}, values);
        updateHeader(currentUser);
        showProfileMessage("Profile saved!");
      } catch (error) {
        var code = error && error.code;
        showProfileMessage(code === "23505" ? "That username is already taken." : safeError(error), true);
      } finally { setBusy(false); }
    }
    async function exportData() {
      if (!currentUser || busy) return;
      setBusy(true); showProfileMessage("Preparing your player data…");
      try {
        var names = ["profiles", "game_saves", "earned_badges", "game_scores"];
        var columns = ["id", "user_id", "user_id", "user_id"];
        var data = { format: "retro-hub-export-v1", generated_at: new Date().toISOString() };
        for (var i = 0; i < names.length; i++) {
          var result = await client.from(names[i]).select("*").eq(columns[i], currentUser.id);
          if (result.error) throw result.error;
          data[names[i]] = result.data || [];
        }
        var url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
        var link = document.createElement("a");
        link.href = url; link.download = "retro-hub-my-game-data.json";
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        showProfileMessage("Downloaded player database records. This is not yet the full legal account export.");
      } catch (error) { showProfileMessage(safeError(error), true); }
      finally { setBusy(false); }
    }
    byId("auth-open-btn").addEventListener("click", function () {
      setMode("login"); openDialog(modal, email);
    });
    byId("auth-close-btn").addEventListener("click", function () { closeDialog(modal); });
    byId("profile-close-btn").addEventListener("click", function () { closeDialog(profileModal); });
    byId("auth-login-mode").addEventListener("click", function () { setMode("login"); email.focus(); });
    byId("auth-signup-mode").addEventListener("click", function () { setMode("signup"); email.focus(); });
    byId("auth-forgot-mode").addEventListener("click", function () { setMode("recovery"); email.focus(); });
    byId("auth-resend-btn").addEventListener("click", async function () {
      if (busy || !email.value.trim()) return;
      setBusy(true);
      try {
        var result = await client.auth.resend({
          type: "signup", email: email.value.trim(),
          options: { emailRedirectTo: root.location.origin + root.location.pathname }
        });
        if (result.error) throw result.error;
        showMessage("If verification is pending, another email has been requested.");
      } catch (error) { showMessage(safeError(error), true); }
      finally { setBusy(false); }
    });
    byId("auth-show-password").addEventListener("click", function () {
      var showing = password.type === "password";
      password.type = showing ? "text" : "password";
      byId("auth-show-password").textContent = showing ? "Hide" : "Show";
      byId("auth-show-password").setAttribute("aria-pressed", String(showing));
    });
    byId("profile-open-btn").addEventListener("click", function () {
      showProfileMessage(""); openDialog(profileModal, byId("profile-username"));
      if (currentUser) loadProfile(currentUser);
    });
    byId("profile-avatar").addEventListener("change", function (event) {
      byId("profile-avatar-preview").textContent = starterAvatars[event.target.value] || "⭐";
    });
    byId("profile-export-btn").addEventListener("click", exportData);
    byId("logout-btn").addEventListener("click", async function () {
      var result = await client.auth.signOut();
      if (result.error) {
        setMode("login"); openDialog(modal, email);
        showMessage(safeError(result.error), true);
      } else { applySession(null); profileModal.hidden = true; }
    });
    form.addEventListener("submit", submitAuth);
    profileForm.addEventListener("submit", saveProfile);
    document.addEventListener("keydown", function (event) {
      var active = !profileModal.hidden ? profileModal : !modal.hidden ? modal : null;
      if (!active) return;
      if (event.key === "Escape") {
        event.preventDefault(); closeDialog(active);
      }
      if (event.key !== "Tab") return;
      var focusable = Array.from(active.querySelectorAll("button:not([hidden]):not([disabled]), input:not([hidden]):not([disabled]), select:not([hidden]), a[href]"))
        .filter(function (el) { return el.getClientRects().length > 0; });
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
    client.auth.onAuthStateChange(function (event, session) {
      if (event === "PASSWORD_RECOVERY") {
        setMode("new-password");
        openDialog(modal, password);
      }
      // Defer database work outside the auth callback to avoid deadlocks.
      setTimeout(function () { applySession(session); }, 0);
    });
    client.auth.getSession().then(function (result) {
      if (result.error) {
        byId("auth-status").textContent = "Playing as guest";
        return;
      }
      applySession(result.data && result.data.session);
    }).catch(function () { byId("auth-status").textContent = "Playing as guest"; });
    setMode("login");
    updateHeader(null);
  }
  root.RetroHubAccount = Object.freeze({ init: init });
})(window);
