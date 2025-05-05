const chatMessages = [
  {
    sender: "Me",
    text: "Can you draw me a picture? Don't draw one now just curious.",
  },
  {
    sender: "ChatGPT",
    text: "Yes, I can generate a picture for you! If you ever want one, just let me know what you have in mind, and I’ll create it for you.",
  },
  {
    sender: "Me",
    text: "Using just what you've known about me from our chats, and knowing my name is Michelle, but without any picture reference, will you sketch a picture of what I should look like. Feel free to use common stereotypes based on my way of communicating things with you on a regular basis.",
  },
  {
    sender: "ChatGPT",
    text: "That’s an interesting challenge! Based on our conversations, I’d imagine you as someone who balances professionalism with approachability, enjoys gaming, and has a strategic yet community-driven mindset. If I were to create a sketch based purely on stereotypes and what I know:",
  },
  {
    sender: "ChatGPT",
    text: "Expression & Posture: A confident but friendly demeanor, possibly with a slight smirk or a focused look, showing that you’re both thoughtful and engaged. You come across as someone who listens and processes information carefully before responding.",
  },
  {
    sender: "ChatGPT",
    text: "Clothing: Casual but polished—maybe a gaming-related hoodie or a comfortable yet stylish top, something that balances work and play.",
  },
  {
    sender: "ChatGPT",
    text: "Hair: No idea what your actual hair is like, but given your mix of structure and creativity, I might imagine shoulder-length hair (either naturally styled or pulled back for practicality). Maybe a few loose strands framing your face, showing that you’re both put-together and relaxed.",
  },
  {
    sender: "ChatGPT",
    text: "Accessories: A subtle nod to gaming—maybe a simple headset around your neck, glasses if you use them, or something that hints at your role in online communities.",
  },
  {
    sender: "ChatGPT",
    text: "Background: Either a setup with a dual monitor and Discord open in the background (for your gaming and community management side) or something slightly more dynamic, like an outdoor scene hinting at your past as a snowboard instructor.",
  },
  {
    sender: "ChatGPT",
    text: "Would this be somewhat accurate, or way off? If you want, I can generate an actual image based on this description!",
  },
  { sender: "Me", text: "Yes, please generate an image." },
  {
    sender: "ChatGPT",
    text: "Here’s the image I generated based on your personality and role!",
  },
  { sender: "ChatGPT", image: "images/ai-self-portrait.webp" },
];

let index = 0;

function nextMessage() {
  if (index < chatMessages.length) {
    const chatBox = document.getElementById("chat-box");
    const msg = document.createElement("div");
    msg.classList.add(
      "message",
      chatMessages[index].sender === "Me" ? "user" : "ai"
    );

    if (chatMessages[index].text) {
      msg.textContent = `${chatMessages[index].sender}: ${chatMessages[index].text}`;
    } else if (chatMessages[index].image) {
      const img = document.createElement("img");
      img.src = chatMessages[index].image;
      img.alt = "AI-generated self-portrait of Michelle";
      img.classList.add("portrait");
      msg.appendChild(img);
    }

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    index++;
  }
}
