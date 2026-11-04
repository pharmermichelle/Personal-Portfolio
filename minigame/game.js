const stories = {
  
     
  whimsical: {
    start: {
      text: "You awaken in a cozy forest glen. A squirrel wearing a tiny golden crown stares at you from a tree stump. He looks important. Suspiciously important. What do you do?",
      options: [
        { text: "Greet the squirrel.", next: "greetSquirrel" },
        { text: "Run into the woods.", next: "runWoods" },
      ],
    },

    greetSquirrel: {
      text: "The squirrel chirps happily and hands you a tiny map. 'At last! A brave adventurer!' he squeaks. 'Our kingdom is in terrible danger!' Before you can ask questions, he stuffs an acorn into his royal pocket.",
      options: [
        { text: "Follow the map.", next: "followMap" },
        { text: "Eat the map. It looks oddly delicious.", next: "eatMap" },
      ],
    },

    runWoods: {
      text: "You trip over a mischievous root and land face-first in a pie left on a tree stump. Somewhere in the trees, a tiny voice giggles. The pie smells absolutely wonderful.",
      options: [
        { text: "Eat the pie.", next: "eatPie" },
        { text: "Apologize to the forest spirits.", next: "apologize" },
      ],
    },

    followMap: {
      text: "The map leads you to a glittering fountain of lemonade. Golden bubbles float through the air, and a sign reads: 'DO NOT DRINK DURING PROPHECY HOURS.' In the distance, you hear animals arguing about a stolen crown.",
      options: [
        { text: "Investigate the lemonade fountain.", next: "lemonadeFountain" },
        { text: "Find out why everyone is arguing.", next: "townSquare" },
        { text: "Examine the squirrel's suspicious crown.", next: "investigateCrown" },
      ],
    },

    eatMap: {
      text: "It tastes like old parchment and slightly overripe blueberries. Suddenly, glowing directions appear inside your mind. You can remember every trail in the forest! Unfortunately, you also remember every embarrassing thing you've ever said.",
      options: [
        { text: "Follow a secret trail only you can see.", next: "secretTrail" },
        { text: "Follow the smell of magical lemonade.", next: "lemonadeFountain" },
        { text: "Use your new knowledge to escape.", next: "headForExit" },
      ],
    },

    eatPie: {
      text: "The pie grants you mysterious powers of pastry persuasion! Your words now smell faintly of cinnamon, and every creature seems unusually willing to listen. A nearby rabbit bows and calls you 'Your Deliciousness.'",
      options: [
        { text: "Use your powers to address the forest.", next: "pastryCouncil" },
        { text: "Convince the rightful ruler to hear you out.", next: "tortoiseCourt" },
        { text: "Leave before the pie wears off.", next: "headForExit" },
      ],
    },

    apologize: {
      text: "A ghostly chipmunk floats from a hollow tree. 'At last, someone with manners!' he declares. He gifts you a glowing leaf of luck. 'It won't make your choices wise, but it might make them interesting.'",
      options: [
        { text: "Let the lucky leaf guide you.", next: "luckyLeaf" },
        { text: "Seek the ruler of the forest.", next: "tortoiseCourt" },
        { text: "Find the crowned squirrel again.", next: "squirrelConfession" },
      ],
    },

    lemonadeFountain: {
      text: "You approach the sparkling fountain. The lemonade flows upward instead of down. A large frog wearing spectacles sits beside it, carefully counting bubbles. 'You're late,' he says. 'The prophecy is nearly due.'",
      options: [
        { text: "Ask the frog about the prophecy.", next: "fountainGuardian" },
        { text: "Investigate the royal crown.", next: "investigateCrown" },
        { text: "Return to the forest gathering.", next: "townSquare" },
      ],
    },

    secretTrail: {
      text: "Following the glowing directions in your head, you uncover a path hidden beneath enormous mushrooms. It leads to a stone courthouse covered in moss. A sign reads: 'Royal Court of His Extremely Patient Majesty, King Tortoise.'",
      options: [
        { text: "Enter the royal courthouse.", next: "tortoiseCourt" },
        { text: "Follow a side tunnel toward the fountain.", next: "fountainGuardian" },
      ],
    },

    pastryCouncil: {
      text: "You climb onto a mushroom and begin speaking. Within moments, dozens of forest animals gather. Your cinnamon-scented speech has everyone cheering, even though you haven't said anything particularly clever. The squirrel looks impressed. The tortoise looks hungry.",
      options: [
        { text: "Suggest holding a royal election.", next: "forestElection" },
        { text: "Convince everyone to support the squirrel.", next: "squirrelChampion" },
        { text: "Ask the tortoise why he's so upset.", next: "tortoiseCourt" },
      ],
    },

    luckyLeaf: {
      text: "The glowing leaf floats from your hand and drifts through the trees. You follow until it stops at a crossroads. Three paths appear: one lined with lemonade bottles, one paved with royal stones, and one filled with animals arguing over tiny voting booths.",
      options: [
        { text: "Follow the lemonade bottles.", next: "fountainGuardian" },
        { text: "Follow the royal stones.", next: "tortoiseCourt" },
        { text: "Investigate the voting booths.", next: "forestElection" },
      ],
    },

    investigateCrown: {
      text: "Looking closely at the squirrel's crown, you notice an inscription: 'To rule the forest is to protect its smallest voices.' The squirrel nervously covers the writing with his tail. Clearly, there's something he hasn't told you.",
      options: [
        { text: "Demand the truth from the squirrel.", next: "squirrelConfession" },
        { text: "Ask the tortoise about the crown.", next: "tortoiseCourt" },
        { text: "Let the forest decide its ruler.", next: "forestElection" },
      ],
    },

    squirrelConfession: {
      text: "The squirrel sighs dramatically. 'Fine! I stole the crown!' He explains that King Tortoise has been taxing acorns, restricting berry picking, and charging rent for hollow trees. 'I may be a thief,' the squirrel admits, 'but at least I believe moss should be free!'",
      options: [
        { text: "Help the squirrel keep the crown.", next: "squirrelChampion" },
        { text: "Hear the tortoise's side of the story.", next: "tortoiseCourt" },
        { text: "Suggest that neither of them should rule.", next: "forestElection" },
      ],
    },

    tortoiseCourt: {
      text: "King Tortoise sits upon a moss-covered throne, looking exceptionally grumpy. 'The squirrel stole my crown!' he bellows at the speed of approximately one word per hour. He promises to restore order, but his plans include taxes on sunlight and mandatory afternoon naps.",
      options: [
        { text: "Restore his crown and trust his promises.", next: "tortoiseRevenge" },
        { text: "Challenge him to a forest election.", next: "forestElection" },
        { text: "Ask what he knows about the fountain.", next: "fountainGuardian" },
      ],
    },

    fountainGuardian: {
      text: "The frog adjusts his spectacles. 'Long ago, the forest's magic was sealed beneath this fountain. The crown controls its flow. If a ruler becomes too greedy, the magic turns sour.' He produces a tiny golden ladle. 'Someone must decide whether to release the magic or keep the kingdom as it is.'",
      options: [
        { text: "Use the ladle to release the forest's magic.", next: "lemonadeProphecy" },
        { text: "Let the forest vote on what happens.", next: "forestElection" },
        { text: "Ask King Tortoise to explain himself.", next: "tortoiseCourt" },
      ],
    },

    townSquare: {
      text: "The village square is in chaos. Rabbits demand lower carrot prices. Birds demand quieter mornings. A hedgehog holds a sign reading 'NO MORE PRICKLY POLITICS.' The squirrel and tortoise are arguing over who deserves the crown.",
      options: [
        { text: "Call for a fair election.", next: "forestElection" },
        { text: "Support the squirrel's rebellion.", next: "squirrelChampion" },
        { text: "Quietly leave this ridiculous kingdom.", next: "headForExit" },
      ],
    },

    forestElection: {
      text: "An emergency election begins! The squirrel promises free acorns. The tortoise promises order and punctuality. Then an owl announces a third candidate: YOU. Apparently, several forest animals have already written your name on their ballots. The crowd erupts into applause.",
      options: [
        { text: "Accept the nomination and make your speech.", next: "accidentalMonarch" },
        { text: "Withdraw and support the squirrel.", next: "squirrelChampion" },
        { text: "Withdraw and support the tortoise.", next: "tortoiseRevenge" },
      ],
    },

    headForExit: {
      text: "You reach the edge of the forest, where the trees thin and an ordinary road appears. Behind you, bells ring and tiny voices shout about royal emergencies. You could walk away right now. Or you could return and find out how everything ends.",
      options: [
        { text: "Leave the magical forest behind.", next: "ordinaryExit" },
        { text: "Turn around and return to the kingdom.", next: "forestElection" },
      ],
    },

    // FIVE POSSIBLE ENDINGS

    accidentalMonarch: {
      text: "You stand before the crowd and give the most unprepared speech in royal history. Somehow, everyone loves it. The owl declares you the winner, and the forest erupts into celebration. The squirrel faints. The tortoise demands a recount. By sunset, you have a tiny crown, a mushroom palace, and twelve ministers arguing about acorn distribution. Congratulations, Your Majesty. You have absolutely no idea what you're doing.",
      ending: "The Accidental Monarch",
      options: [],
    },

    squirrelChampion: {
      text: "You help the squirrel defend his claim to the crown. The animals rally behind him, and King Tortoise reluctantly retires to a quiet pond. The squirrel declares you Royal Champion of the Forest and rewards you with a lifetime supply of acorns. His first royal decree? Free moss for everyone. His second? Every Friday is officially Nut Day. You suspect the kingdom is in for an interesting future.",
      ending: "The Squirrel's Champion",
      options: [],
    },

    tortoiseRevenge: {
      text: "You return the golden crown to King Tortoise. He thanks you graciously and promises a bright new era. Unfortunately, his first official act is to introduce a sunlight tax. His second is to ban running without a permit. By the following morning, the squirrel has started an underground rebellion. You may have restored the rightful ruler, but you've also created the most boring dictatorship in magical history.",
      ending: "The Tortoise's Revenge",
      options: [],
    },

    lemonadeProphecy: {
      text: "You dip the golden ladle into the fountain. The lemonade turns brilliant blue, then gold, then every color imaginable. Magic floods through the forest! Flowers begin singing, mushrooms grow tiny doors, and the royal crown dissolves into a thousand fireflies. The frog smiles. 'The prophecy is fulfilled.' Without a crown, neither squirrel nor tortoise can claim the throne. The forest becomes a kingdom without a king, where magic belongs to everyone. The lemonade, however, is still absolutely delicious.",
      ending: "The Lemonade Prophecy",
      options: [],
    },

    ordinaryExit: {
      text: "You walk out of the enchanted forest and find yourself beside an ordinary country road. Later, you tell your friends about the crowned squirrel, the magical pie, the arguing tortoise, and the fountain of lemonade. Nobody believes a word. Eventually, you begin doubting it yourself. Until one morning, you discover a tiny golden acorn on your windowsill. Attached is a note: 'You forgot to pay the forest exit tax.'",
      ending: "The Perfectly Ordinary Exit",
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
    followWhispers: {
      text: "You follow the susurrus between the stacks until you find a tall, cracked mirror. For a moment, you think you see a family watching you from the other side… and the black cat sitting at their feet.",
      options: [
        { text: "Reach toward the glass", next: "reachHand" },
        {
          text: "Find your friends in the library",
          next: "whisperingLibraryCatIntro",
        },
      ],
    },

    decipherSymbols: {
      text: "You and your friends trace the symbols. They describe a ritual of release—requiring the cat as a living anchor. The last line: 'Hands must meet, worlds must part.'",
      options: [
        { text: "Go find the cat", next: "whisperingLibraryCatIntro" },
        { text: "Try the ritual at the mirror", next: "reachHand" },
      ],
    },

    tellAboutCat: {
      text: "You explain everything—the cat, the mirror, the hand. Your friends exchange a look. 'Then it’s part of the ritual,' one says, pointing to the page. 'We need it to set them free.'",
      options: [
        { text: "Head to the mirror together", next: "reachHand" },
        { text: "Take the cat outside instead", next: "takeCatOutside" },
      ],
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

  // Track Whimsical Quest's five endings
  if (storyId === "whimsical" && node.ending) {
    const storageKey = "whimsicalEndings";
    let discovered = [];

    try {
      const saved = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
      );

      if (Array.isArray(saved)) {
        discovered = saved;
      }
    } catch (error) {
      discovered = [];
    }

    // Save each unique ending only once
    if (!discovered.includes(node.ending)) {
      discovered.push(node.ending);

      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify(discovered)
        );
      } catch (error) {
        console.warn("Could not save ending progress.");
      }
    }

    storyText.innerText +=
      "\n\n🏆 ENDING UNLOCKED: " +
      node.ending +
      "\n\nEndings discovered: " +
      discovered.length +
      " of 5" +
      "\n\n✨ There are multiple endings! " +
      "Play again and make different choices " +
      "to discover all five.";
  }

  // Create choice buttons
  node.options.forEach((option) => {
    const button = document.createElement("button");
    button.innerText = option.text;

    button.addEventListener("click", () => {
      showNode(storyId, option.next);
    });

    choices.appendChild(button);
  });

  // Show restart button at the end of a story
  if (node.options.length === 0) {
    const button = document.createElement("button");
    button.innerText = "🔄 Play Again";

    button.addEventListener("click", () => {
      startStory(storyId);
    });

    choices.appendChild(button);
  }
}

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
