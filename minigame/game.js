const stories = {
  whimsical: {
    start: {
      text: "You awaken in a cozy forest glen, a squirrel wearing a tiny crown stares at you. What do you do?",
      options: [
        { text: "Greet the squirrel.", next: "greetSquirrel" },
        { text: "Run into the woods.", next: "runWoods" },
      ],
    },
    greetSquirrel: {
      text: "The squirrel chirps happily and hands you a tiny map. A quest begins!",
      options: [
        { text: "Follow the map.", next: "followMap" },
        { text: "Eat the map. It looks oddly delicious.", next: "eatMap" },
      ],
    },
    runWoods: {
      text: "You trip over a mischievous root and land face-first in a pie left on a tree stump.",
      options: [
        { text: "Eat the pie.", next: "eatPie" },
        { text: "Apologize to the forest spirits.", next: "apologize" },
      ],
    },
    followMap: {
      text: "You find a glittering fountain of lemonade. The adventure continues!",
      options: [],
    },
    eatMap: {
      text: "It tastes like old parchment. You feel slightly wiser, but your stomach growls.",
      options: [],
    },
    eatPie: {
      text: "The pie grants you mysterious powers of pastry persuasion. The townsfolk shall adore you.",
      options: [],
    },
    apologize: {
      text: "A ghostly chipmunk forgives you and gifts you a leaf of luck.",
      options: [],
    },
  },

  horror: {
    start: {
      text: "You and a few friends sneak into the old abandoned Willowmere Mansion at night, armed only with flashlights and too much bravado. Rumor has it, the house isn't just haunted — it's hungry.",
      options: [
        { text: "Head to creepy kitchen", next: "creepyKitchen" },
        { text: "Ascend grand staircase", next: "grandStaircase" },
        { text: "Explore whispering library", next: "whisperingLibrary" },
      ],
    },
    creepyKitchen: {
      text: "Your flashlight flickers over cracked tile floors and sagging cabinets, the hum of an old fridge filling the air. A faint tapping sound—like nails on wood—comes from under the sink.",
      options: [
        {
          text: "Back out slowly",
          next: "backOutSlowly",
        },
        {
          text: "Investigate under the sink?",
          next: "underTheSink",
        },
        {
          text: "Search cabinets for clues",
          next: "searchCabinets",
        },
      ],
    },
    backOutSlowly: {
      text: "You step back cautiously, but you bump a table. A dusty lamp teeters & crashes to the floor. The tapping under the sink stops. Silence fills the house, then a slow scraping noise—claws against wood—echoes from the hall...",
      options: [
        {
          text: "Freeze and hope whatever it is leaves",
          next: "freezeAndHope",
        },
        {
          text: "Sprint for the grand staircase",
          next: "grandStaircaseIntro",
        },
      ],
    },
    underTheSink: {
      text: "You crouch down and peer into the shadows beneath the sink. The tapping stops — and you hear a soft meow. Reaching in carefully, your fingers brush against fur. A small black cat wriggles into your arms, purring loudly as you gently cradle it.",
      options: [
        {
          text: "Hold cat and stand up.",
          next: "carryCat",
        },
      ],
    },
    searchCabinets: {
      text: "You ease open a creaky cabinet. Inside, amid dust and cobwebs, sits a single battered tin labeled with a faded paw print. A sudden crash behind you makes you jump!",
      options: [
        {
          text: "Investigate the noise",
          next: "underTheSink",
        },
        {
          text: "Run for the door",
          next: "quitter",
        },
      ],
    },

    freezeAndHope: {
      text: "You stand frozen, heart pounding, as the scraping sound grows louder. It’s coming closer. You can feel the air grow colder, the shadows deepening around you. Just when you think you can’t take it anymore, the noise stops. Silence envelops the room. You take a deep breath and turn to leave — but something catches your eye.",
      options: [
        {
          text: "Investigate the noise",
          next: "underTheSink",
        },
        {
          text: "Run for the staircase",
          next: "grandStaircaseIntro",
        },
        {
          text: "Find your friends",
          next: "whisperingLibraryIntro",
        },
      ],
    },

    carryCat: {
      text: "You stand up, cradling the cat in your arms. It looks up at you with wide, glowing eyes. You feel a strange warmth radiating from it, as if it’s more than just a cat. Suddenly, the lights flicker and the house seems to shudder. The cat hisses and leaps from your arms, darting out the door.",
      options: [
        {
          text: "Follow the cat",
          next: "followCat",
        },
        {
          text: "Search for friends",
          next: "whisperingLibraryCatIntro",
        },
      ],
    },

    grandStaircaseIntro: {
      text: "Panic overtakes you. Flashlight bouncing, you sprint across cracked tiles and peeling wallpaper, skidding to a stop at the grand staircase. A low creak echoes above.",
      options: [
        {
          text: "Climb the stairs and hope for the best",
          next: "grandStaircase",
        },
        {
          text: "Go find your friends in the library",
          next: "whisperingLibraryIntro",
        },
      ],
    },
    grandStaircase: {
      text: "You reach the grand staircase and freeze. At the top, an ancient mirror gleams in the gloom. A black cat perches on the bottom step, watching you expectantly.",
      options: [
        {
          text: "Follow the cat up stairs",
          next: "followCat",
        },
        {
          text: "Go find your friends in the library",
          next: "whisperingLibraryIntro",
        },
      ],
    },
    whisperingLibraryIntro: {
      text: "You step into the library, the air thick with dust and secrets. Books line the shelves, their spines cracked and faded. A low whispering fills the room, like a thousand voices sharing a secret. You can’t quite make out the words, but they seem to beckon you closer.",
      options: [
        { text: "Investigate the whispers", next: "whisperingLibrary" },
        {
          text: "Decide to just wait outside",
          next: "quitter",
        },
      ],
    },
    quitter: {
      text: "While you're standing around outside waiting, your friends reappear laughing, holding the tiny black cat in their arms. You'll likely never know what would have happened if you didn't run away.",
      options: [{ text: "Start Over", next: "start" }],
    },
    whisperingLibrary: {
      text: "You and your friends make your way through the dimly lit halls of Willowmere Mansion, drawn to the library where old secrets whisper among the dusty shelves.",
      options: [
        {
          text: "Search the shelves for clues",
          next: "searchShelves",
        },
        {
          text: "Follow the whispers deeper into the library",
          next: "followWhispers",
        },
      ],
    },
    searchShelves: {
      text: "You scan the shelves, eyes tracing the spines of left behind books. One catches your attention: 'A Feast Forgotton: The Curse of Willowmere.' You pull it from the shelf, intrigued.",
      options: [
        {
          text: "Open the book",
          next: "openBook",
        },
        {
          text: "Wait, did you hear that?",
          next: "followWhispers",
        },
      ],
    },
    openBook: {
      text: "As you open the book, a gust of wind sweeps through the library, scattering papers and sending shivers down your spine. The pages are filled with strange symbols and illustrations of a family trapped in a mirror, their beloved cat watching from the other side.",
      options: [
        {
          text: "Go look for the cat",
          next: "whisperingLibraryCatIntro",
        },
        {
          text: "Try to decipher the symbols",
          next: "decipherSymbols",
        },
      ],
    },
    followCat: {
      text: "With a soft chirp, the cat leaps onto the banister, bounding gracefully upward. You follow into a vast loft, where an ancient mirror stands — a ghostly hand pressing from inside.",
      options: [
        {
          text: "Turn to run back down the stairs",
          next: "fallDownStairs",
        },
        {
          text: "Reach out to the hand",
          next: "reachHand",
        },
      ],
    },
    reachHand: {
      text: "As soon as you hold out your hand, the cat leaps back into your arms. A light, gentle laugh echoes from within the mirror, the hand withdrawing as if satisfied.",
      options: [
        {
          text: "Go outside and take a breath",
          next: "takeCatOutside",
        },
        {
          text: "Search for your friends in the library",
          next: "whisperingLibraryCatIntro",
        },
      ],
    },
    whisperingLibraryCatIntro: {
      text: "With the cat safe in your arms, you step into the library. Dusty light filters through the windows, and you hear your friends' familiar voices calling warmly from beyond the shelves. The cat wriggles in your arms, its eyes wide and curious.",
      options: [
        { text: "Talk to friends", next: "whisperingLibraryCat" },
        {
          text: "Decide to just wait outside",
          next: "takeCatOutside",
        },
      ],
    },
    whisperingLibraryCat: {
      text: "Your friends are gathered around a table, poring over an ancient tome. They look up, surprised to see you with the cat. 'Where did you find it?' one asks. 'We thought we heard something!'",
      options: [
        {
          text: "Tell them about the cat",
          next: "tellAboutCat",
        },
        {
          text: "Ask them what they found",
          next: "askWhatFound",
        },
      ],
    },
    askWhatFound: {
      text: "One friend points to the page. It’s called 'A Feast Forgotten,'. A family trapped in a mirror, left to watch their beloved cat they could no longer feed.",
      options: [
        {
          text: "Tell them about the cat",
          next: "tellAboutCat",
        },
        {
          text: "Take the cat outside",
          next: "takeCatOutside",
        },
      ],
    },

    takeCatOutside: {
      text: "You step outside, the cool night air refreshing against your skin. The cat curls up in your arms, purring softly. You may never know what your friends found in the library, but you feel a strange sense of calm wash over you.",
      options: [{ text: "Start Over", next: "start" }],
    },
    fallDownStairs: {
      text: "Heart hammering, you whirl to flee. Your foot slips—gravity yanks you down the staircase. You land hard, the house groaning with your every breathless move.",
      options: [
        {
          text: "Turn to run back down the stairs",
          next: "whisperingLibraryIntro",
        },
        {
          text: "Accept defeat, and wait outside",
          next: "quitter",
        },
      ],
    },
  },

  steampunk: {
    start: {
      text: "You, a clever raccoon inventor, can't find work. One day, you hear of a grand steampunk expo.",
      options: [
        { text: "Present your latest invention.", next: "presentInvention" },
        { text: "Sneak into the expo undercover.", next: "sneakIn" },
      ],
    },
    presentInvention: {
      text: "Your device wows the judges — you land a prestigious job among the Inventors' Guild!",
      options: [],
    },
    sneakIn: {
      text: "You sneak in — and are discovered... but your courage impresses the judges anyway!",
      options: [],
    },
  },

  itSupport: {
    start: {
      text: "A furious customer calls. Their computer won't turn on. They insist it’s your fault.",
      options: [
        { text: "Calmly ask if it's plugged in.", next: "askPluggedIn" },
        { text: "Ask if they tried turning it on.", next: "askPowerButton" },
      ],
    },
    askPluggedIn: {
      text: "They angrily realize it was never plugged in. They mumble an apology.",
      options: [],
    },
    askPowerButton: {
      text: "After yelling, they admit they hadn't pressed the power button. They sheepishly thank you.",
      options: [],
    },
  },
};

function startStory(storyId) {
  showNode(storyId, "start");
}

function showNode(storyId, nodeKey) {
  const container = document.querySelector(`#${storyId}`);
  const storyText = container.querySelector(".story-text");
  const choices = container.querySelector(".choices");
  const story = stories[storyId];
  const node = story[nodeKey];

  storyText.innerText = node.text;
  choices.innerHTML = "";

  node.options.forEach((option) => {
    const button = document.createElement("button");
    button.innerText = option.text;
    button.addEventListener("click", () => showNode(storyId, option.next));
    choices.appendChild(button);
  });

  if (node.options.length === 0) {
    const button = document.createElement("button");
    button.innerText = "Restart";
    button.addEventListener("click", () => startStory(storyId));
    choices.appendChild(button);
  }
}

// Start all stories
startStory("whimsical");
startStory("horror");
startStory("steampunk");
startStory("itSupport");
