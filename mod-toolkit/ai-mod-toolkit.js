document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  document.body.classList.toggle("light-theme");
});

const tabs = document.querySelectorAll(".tab-button");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.getAttribute("data-tab");

    contents.forEach((c) => c.classList.remove("active"));
    document.getElementById(target).classList.add("active");
  });
});

const promptText = document.getElementById("prompt-text");
const generatePromptBtn = document.getElementById("generatePrompt");
const copyPromptBtn = document.getElementById("copyPrompt");

generatePromptBtn.addEventListener("click", async () => {
  const promptType = document.getElementById("promptType").value;

  let topicPrompt = "";

  switch (promptType) {
    case "community":
      topicPrompt =
        "Give me one fun, casual community question to post in a Discord server related to gaming.";
      break;
    case "event":
      topicPrompt =
        "Give me one creative event idea suitable for a Discord gaming community.";
      break;
    case "topic":
      topicPrompt =
        "Give me one thoughtful discussion topic for a game or tech community.";
      break;
    default:
      topicPrompt = "Give me one general engaging community question.";
  }

  promptText.textContent = "🧠 Thinking...";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer YOUR_OPENAI_KEY_HERE",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: topicPrompt }],
        temperature: 0.8,
      }),
    });

    const data = await res.json();
    const responseText = data.choices[0].message.content.trim();
    promptText.textContent = responseText;
  } catch (err) {
    console.error(err);
    promptText.textContent = "⚠️ Oops! Something went wrong.";
  }
});

copyPromptBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(promptText.textContent);
  copyPromptBtn.textContent = "✅ Copied!";
  setTimeout(() => (copyPromptBtn.textContent = "📋 Copy"), 1500);
});
