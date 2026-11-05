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
        { text: "Head to the creepy kitchen.", next: "creepyKitchen" },
        { text: "Ascend the grand staircase.", next: "grandStaircase" },
        { text: "Explore the whispering library.", next: "whisperingLibrary" },
      ],
    },
    creepyKitchen: {
      text: "Your flashlight flickers over cracked tile floors and sagging cabinets. An old refrigerator hums even though the mansion has no electricity. A faint tapping — like nails on wood — comes from under the sink.",
      options: [
        { text: "Back out slowly.", next: "backOutSlowly" },
        { text: "Investigate under the sink.", next: "underTheSink" },
        { text: "Search the cabinets for clues.", next: "searchCabinets" },
      ],
    },
    backOutSlowly: {
      text: "You step back cautiously and bump a table. A dusty lamp crashes to the floor. The tapping stops. Then a long scraping noise follows you into the hall, as though something is dragging its claws along the walls.",
      options: [
        { text: "Freeze and hope it leaves.", next: "freezeAndHope" },
        { text: "Sprint for the grand staircase.", next: "grandStaircaseIntro" },
      ],
    },
    underTheSink: {
      text: "You crouch beneath the sink. The tapping stops, replaced by a small, indignant meow. A black cat with a silver whisker steps into the light. Its collar bears a name: ASH. It leans into your hand, then glances sharply toward the ceiling.",
      gain: ["catTrust"],
      options: [
        { text: "Pick up Ash and stand.", next: "carryCat" },
        { text: "Let Ash lead you into the hall.", next: "followCat" },
      ],
    },
    searchCabinets: {
      text: "You ease open a cabinet. Inside sits a battered tin marked with a faded paw print. It contains a packet of salt, a silver bell, and a note: 'A circle for the living. A name for the dead. Never answer the voice in the glass.' Something crashes behind you.",
      options: [
        { text: "Pocket the salt and bell.", next: "pocketSalt" },
        { text: "Investigate the noise under the sink.", next: "underTheSink" },
        { text: "Get out of the kitchen.", next: "backOutSlowly" },
      ],
    },
    pocketSalt: {
      text: "You tuck the salt and silver bell into your jacket. The refrigerator stops humming. From somewhere inside it, a voice whispers your name — in your own voice. You decide not to open the door.",
      gain: ["salt"],
      options: [
        { text: "Find the source of the tapping.", next: "underTheSink" },
        { text: "Look for your friends in the library.", next: "whisperingLibraryIntro" },
        { text: "Head downstairs toward the cellar.", next: "cellarDoor" },
      ],
    },
    freezeAndHope: {
      text: "You stand frozen as the scraping comes closer. Then silence. At the far end of the hall, a family portrait shifts on its hook. Four painted faces stare at the floor. Only a small black cat in the painting looks directly at you.",
      options: [
        { text: "Follow the sound of a meow.", next: "underTheSink" },
        { text: "Run for the staircase.", next: "grandStaircaseIntro" },
        { text: "Find your friends.", next: "whisperingLibraryIntro" },
      ],
    },
    carryCat: {
      text: "You lift Ash. The cat's fur is warm, despite the freezing kitchen. The lights flicker and the house shudders. Ash leaps down, hisses at something behind you, and bolts toward the staircase, pausing to make sure you're following.",
      options: [
        { text: "Follow Ash.", next: "followCat" },
        { text: "Find your friends first.", next: "whisperingLibraryCatIntro" },
      ],
    },
    grandStaircaseIntro: {
      text: "Flashlight bouncing, you sprint across cracked tiles and peeling wallpaper, stopping at a grand staircase. A creak echoes overhead, followed by the gentle chime of a bell that no one is ringing.",
      options: [
        { text: "Climb the stairs.", next: "grandStaircase" },
        { text: "Find your friends in the library.", next: "whisperingLibraryIntro" },
      ],
    },
    grandStaircase: {
      text: "An ancient mirror gleams at the top of the stairs. A black cat perches on the bottom step, watching you expectantly. In the mirror, you see a woman standing behind you. In the hallway, there's no one there.",
      options: [
        { text: "Follow the cat upstairs.", next: "followCat" },
        { text: "Go straight to the mirror.", next: "mirrorClose" },
        { text: "Find your friends in the library.", next: "whisperingLibraryIntro" },
      ],
    },
    whisperingLibraryIntro: {
      text: "The library smells of wet paper and cold ashes. Books line the walls and whispers ripple between the shelves. Your friends' footprints cross the dust, then stop abruptly in front of a locked reading room.",
      options: [
        { text: "Investigate the whispers.", next: "whisperingLibrary" },
        { text: "Leave the mansion while you can.", next: "quitter" },
      ],
    },
    whisperingLibrary: {
      text: "You find your friends at an oak table, comparing notes by flashlight. One insists the mansion is playing tricks on you; another says she saw her reflection blink when she didn't.",
      options: [
        { text: "Search the shelves for clues.", next: "searchShelves" },
        { text: "Follow the whispers deeper into the stacks.", next: "followWhispers" },
        { text: "Ask your friends what they've found.", next: "askWhatFound" },
        { text: "Investigate the cellar door.", next: "cellarDoor" },
      ],
    },
    searchShelves: {
      text: "One spine catches your eye: 'A Feast Forgotten: The Curse of Willowmere.' Beside it lies a ledger with every page after the year 1912 torn out. The last visible entry reads: 'The bargain cannot be broken by an empty house.'",
      options: [
        { text: "Open the book about the curse.", next: "openBook" },
        { text: "Examine the family ledger.", next: "houseOrigin" },
        { text: "Listen to the whispers behind you.", next: "followWhispers" },
      ],
    },
    openBook: {
      text: "A gust scatters the book's pages. Its illustrations show the Willowmere family imprisoned inside a mirror, with their beloved black cat outside. Between the images, a ritual is written in cramped ink: 'Hands must meet, worlds must part.'",
      options: [
        { text: "Decipher the rest of the ritual.", next: "decipherSymbols" },
        { text: "Look for the cat.", next: "whisperingLibraryCatIntro" },
        { text: "Take the book to the mirror.", next: "ritualChamber" },
      ],
    },
    decipherSymbols: {
      text: "You translate the symbols. The mirror needs a living guardian, a circle of salt, and the true name of the thing inside the walls. Without all three, the family cannot escape safely. At the bottom, someone has scratched: 'ASH REMEMBERS.'",
      gain: ["knowsRitual"],
      options: [
        { text: "Seek Ash's help.", next: "whisperingLibraryCatIntro" },
        { text: "Find the house's true name in the cellar.", next: "cellarDoor" },
        { text: "Attempt the ritual upstairs.", next: "ritualChamber" },
        { text: "Search the kitchen for salt.", next: "creepyKitchen" },
      ],
    },
    whisperingLibraryCatIntro: {
      text: "A soft meow comes from the end of the shelves. Ash sits beside a book that has fallen open to a drawing of a door underneath the stairs. The cat waits, ears pricked, while your friends argue about whether to follow.",
      options: [
        { text: "Kneel and offer Ash your hand.", next: "earnCatTrust" },
        { text: "Talk to your friends.", next: "whisperingLibraryCat" },
        { text: "Follow the picture to the cellar.", next: "cellarDoor" },
      ],
    },
    earnCatTrust: {
      text: "You let Ash decide whether to approach. The cat touches its forehead to your fingers, then nudges a silver key from beneath a shelf. For the first time all night, the whispers stop. Ash trusts you.",
      gain: ["catTrust"],
      options: [
        { text: "Follow Ash upstairs.", next: "followCat" },
        { text: "Bring your friends to the mirror.", next: "ritualChamber" },
        { text: "Investigate the cellar together.", next: "cellarDoor" },
      ],
    },
    whisperingLibraryCat: {
      text: "Your friends huddle around the table. One holds a hand-drawn copy of the mirror; another has found an old photograph showing Ash beside the family a century ago. The same silver whisker is unmistakable.",
      options: [
        { text: "Ask what the photograph means.", next: "askWhatFound" },
        { text: "Tell them what you've learned about Ash.", next: "tellAboutCat" },
        { text: "Search the book for a ritual.", next: "decipherSymbols" },
      ],
    },
    askWhatFound: {
      text: "Your friend points at a passage about 'A Feast Forgotten.' When a Willowmere child became terribly ill, her mother promised the house it would never be empty if the house kept the girl alive. The house took every member of the family instead.",
      options: [
        { text: "Find out what the house actually is.", next: "houseOrigin" },
        { text: "Search for the release ritual.", next: "decipherSymbols" },
        { text: "Go to the mirror.", next: "mirrorClose" },
      ],
    },
    tellAboutCat: {
      text: "You explain how Ash seems to be guiding you. One friend points to a line in the book: 'The guardian must choose freely.' Your other friend whispers, 'Then we can't force the cat to save us.'",
      options: [
        { text: "Earn Ash's trust.", next: "earnCatTrust" },
        { text: "Find the missing ritual steps.", next: "decipherSymbols" },
        { text: "Head to the mirror with everyone.", next: "ritualChamber" },
      ],
    },
    followWhispers: {
      text: "You follow a chorus of voices until you find a cracked mirror at the end of the stacks. It reflects a whole family standing behind you. When you turn around, the room is empty. One reflected child presses a finger to her lips.",
      options: [
        { text: "Reach toward the reflected family.", next: "reachHand" },
        { text: "Study the scratches along the frame.", next: "readClawMarks" },
        { text: "Return to the book and your friends.", next: "searchShelves" },
      ],
    },
    followCat: {
      text: "Ash bounds up the banister into the loft. A towering antique mirror stands there, its glass rippling like water. A pale hand presses outward from the other side. Ash scratches a warning across the dusty floor: NOT HER.",
      options: [
        { text: "Study Ash's warning.", next: "readClawMarks" },
        { text: "Reach toward the hand anyway.", next: "reachHand" },
        { text: "Panic and stumble back down the stairs.", next: "fallDownStairs" },
        { text: "Go find the others and the ritual.", next: "whisperingLibraryCatIntro" },
      ],
    },
    readClawMarks: {
      text: "The scratches on the floor form a trail that ends at a small door beneath the stairs. Other marks have been scratched into the mirror's frame: 'It only speaks with borrowed voices.' The silver bell in your pocket — if you found it — seems suddenly important.",
      options: [
        { text: "Follow the scratches to the cellar.", next: "cellarDoor" },
        { text: "Return to the library for more clues.", next: "searchShelves" },
        { text: "Challenge the voice in the mirror.", next: "mirrorClose" },
      ],
    },
    cellarDoor: {
      text: "Behind the staircase you find a narrow door, scratched from the inside. The doorknob turns easily. Below, a staircase descends into a place that smells of rain-soaked stone and extinguished candles.",
      options: [
        { text: "Descend into the cellar.", next: "cellar" },
        { text: "Search the library before going down.", next: "searchShelves" },
        { text: "Retreat to the kitchen.", next: "creepyKitchen" },
      ],
    },
    cellar: {
      text: "The cellar walls are covered in childish drawings. Every picture shows the same shape: a mouth made of doorways. An old journal rests beneath a brick, and a stairway at the far end climbs directly toward the mirror room.",
      options: [
        { text: "Read the journal.", next: "houseOrigin" },
        { text: "Inspect the drawings more closely.", next: "hiddenName" },
        { text: "Climb toward the mirror room.", next: "ritualChamber" },
      ],
    },
    houseOrigin: {
      text: "The journal reveals the truth. Mrs. Willowmere made a bargain with a presence called the Hollow Guest. It cured her daughter, then demanded that the house never stand empty. The family hid themselves in the mirror, hoping the bargain would expire. But the Hollow Guest learned to mimic their voices.",
      options: [
        { text: "Find the name that binds the Hollow Guest.", next: "hiddenName" },
        { text: "Prepare the release ritual.", next: "decipherSymbols" },
        { text: "Head upstairs to confront the mirror.", next: "ritualChamber" },
      ],
    },
    hiddenName: {
      text: "You trace the drawings with your flashlight. Their doorways spell an old name, letter by letter: VELL. The moment you speak it, the house trembles and Ash answers with a fierce yowl from somewhere upstairs. You now know what the house fears most.",
      gain: ["trueName"],
      options: [
        { text: "Take the name to the mirror room.", next: "ritualChamber" },
        { text: "Find Ash to help you.", next: "whisperingLibraryCatIntro" },
        { text: "Find the ritual book first.", next: "searchShelves" },
      ],
    },
    mirrorClose: {
      text: "The mirror clears. A woman in an old-fashioned dress presses her palm against the glass. Three children stand behind her, rigid and silent. One mouths, 'Don't trust.' The woman smiles, but her reflection keeps smiling after her lips stop moving.",
      options: [
        { text: "Believe the woman and touch the glass.", next: "reachHand" },
        { text: "Step back and inspect the mirror frame.", next: "readClawMarks" },
        { text: "Gather your friends and try the ritual.", next: "ritualChamber" },
      ],
    },
    reachHand: {
      text: "You reach out. The glass feels warm, almost alive. The woman promises she can open every door if you will only take her hand. Ash hisses nearby. From inside the glass, one child's lips form a silent word: 'Please.'",
      options: [
        { text: "Take the woman's hand.", next: "newReflection" },
        { text: "Pull away and investigate the warning.", next: "readClawMarks" },
        { text: "Refuse and prepare the ritual instead.", next: "ritualChamber" },
      ],
    },
    fallDownStairs: {
      text: "Your foot slips on the staircase and you tumble to the landing. Behind you, the mirror laughs with your own voice. You can still stand, but your flashlight is cracked and your courage isn't doing much better.",
      options: [
        { text: "Find help in the library.", next: "whisperingLibraryIntro" },
        { text: "Give up and wait outside.", next: "quitter" },
      ],
    },
    ritualChamber: {
      text: "The mirror room waits in terrible silence. The release ritual needs a salt circle, the Hollow Guest's true name, and Ash's freely given help. You can gather what you're missing — or make a choice without knowing what it will cost.",
      options: [
        { text: "Complete the ritual with Ash and the true name.", next: "familyFreed", requires: ["salt", "knowsRitual", "trueName", "catTrust"] },
        { text: "Ask Ash to seal the house instead.", next: "catSecret", requires: ["trueName", "catTrust"] },
        { text: "Accept the house's promise of a safe escape.", next: "houseWins" },
        { text: "Touch the mirror without preparing.", next: "newReflection" },
        { text: "Look for missing clues in the library.", next: "searchShelves" },
        { text: "Search the cellar for the creature's name.", next: "cellarDoor" },
        { text: "Check the kitchen for protective salt.", next: "creepyKitchen" },
        { text: "Go outside with your friends instead.", next: "takeCatOutside" },
      ],
    },
    quitter: {
      text: "You wait outside, refusing to cross the mansion's threshold again. Near dawn, your friends stumble out laughing too loudly, holding Ash in their arms. They insist nothing happened. But when one of them sees a window, their reflection looks away first. Some mysteries are safer left unsolved — or are they?",
      ending: "The Coward's Escape",
      options: [],
    },
    takeCatOutside: {
      text: "You lead everyone out into the cool night air. Ash slips between your feet and disappears back through the front door. Your friends are safe, at least for tonight. From an upstairs window, someone waves with a hand that looks exactly like yours. You never learn what became of the family in the mirror.",
      ending: "The Coward's Escape",
      options: [],
    },
    familyFreed: {
      text: "You pour the salt into a circle and ring the silver bell. Ash steps inside of its own free will. You speak the Hollow Guest's name — VELL — and the house shakes hard enough to crack the plaster. The woman in the mirror vanishes, revealing the real Willowmere family behind her. One by one, they step through the glass into the moonlit room. By sunrise, the mansion is only an empty house. Ash curls up beside the youngest child as though a hundred years haven't passed.",
      ending: "The Family Freed",
      options: [],
    },
    newReflection: {
      text: "Your fingertips sink into the mirror. You try to pull away, but your reflection stays behind and smiles. Then the room flips like a photograph. You are inside the glass, staring out at the friend who looks exactly like you. On the other side, your double picks up your flashlight and walks away. The house has found a new face to borrow.",
      ending: "The New Reflection",
      options: [],
    },
    catSecret: {
      text: "You whisper the Hollow Guest's true name. Ash looks into the mirror, then turns its back on you and presses a paw against a hidden sigil in the floor. You finally understand: Ash has guarded the boundary for a century because the thing inside the house cannot cross while the cat remains. Your words seal the sigil forever. The family in the mirror fades into peaceful light, finally beyond the house's reach. Ash walks outside with you, free for the first time in a hundred years.",
      ending: "The Cat's Secret",
      options: [],
    },
    houseWins: {
      text: "'I'll let you all leave,' the house whispers, 'if one of you stays.' You agree before asking what 'stay' means. Your friends race for the front door, but a new portrait appears above the fireplace. It's a perfect painting of you, frozen in the moment you said yes. Your feet keep moving, yet the portrait's eyes follow them. Outside, you hear your own voice calling the next visitors inside.",
      ending: "The House Always Wins",
      options: [],
    },
  },

  steampunk: {
    start: {
      text: "You, a clever raccoon inventor, can't find work. One day, you hear of a grand steampunk expo. The prize: a place in the famous Inventors' Guild — and enough coin to keep your workshop open for years.",
      options: [
        { text: "Present your latest invention.", next: "presentInvention" },
        { text: "Sneak into the expo undercover.", next: "sneakIn" },
      ],
    },
    presentInvention: {
      text: "You wheel in your Acorn Dynamo, a compact engine powered by steam and stubborn optimism. A wealthy fox in a gold waistcoat scoffs. A friendly beaver applauds. The judges give you ten minutes to prepare for the first demonstration.",
      options: [
        { text: "Check your engine before the judges arrive.", next: "testEngine" },
        { text: "Meet the beaver at the next booth.", next: "beaverWorkshop" },
        { text: "Listen to the fox's suspicious offer.", next: "foxOffer" },
      ],
    },
    sneakIn: {
      text: "You slip through a service entrance wearing an oversized inspector's coat. A brass owl guard scans your badge and announces, 'UNAUTHORIZED RACCOON.' Before it can sound the alarm, a beaver in welding goggles waves you into a maintenance tunnel.",
      options: [
        { text: "Follow the beaver into the tunnels.", next: "maintenanceTunnels" },
        { text: "Borrow a forgotten exhibitor badge.", next: "borrowedBadge" },
      ],
    },
    testEngine: {
      text: "Your Acorn Dynamo rattles, then purrs. Under the casing, you discover a gear that doesn't belong to you. Someone has filed its teeth down. Removing it might save the engine, but you'll need to figure out who put it there.",
      options: [
        { text: "Keep the damaged gear as evidence.", next: "brokenGear" },
        { text: "Ask the beaver for help repairing it.", next: "beaverWorkshop" },
        { text: "Ignore the problem and show the judges.", next: "clockworkCatastrophe" },
      ],
    },
    beaverWorkshop: {
      text: "Bea the beaver has constructed a magnificent skyship out of copper pipes and recycled teapots. 'My flight stabilizer has been stolen,' she says. 'And you're the third inventor with damaged parts today.' She offers to help if you'll help her.",
      options: [
        { text: "Agree to work together.", next: "beaverAlliance" },
        { text: "Search the expo for the saboteur.", next: "competitorBooth" },
        { text: "Focus on your own competition entry.", next: "judgesInspection" },
      ],
    },
    beaverAlliance: {
      text: "You and Bea trade tools and ideas. She fits your Dynamo with a balanced copper flywheel; you lend her a pressure gauge. Your engine now runs smoothly, and you've gained an ally who might matter more than a trophy.",
      gain: ["beaverAlly", "engineFixed"],
      options: [
        { text: "Investigate the damaged parts.", next: "brokenGear" },
        { text: "Inspect the skyship together.", next: "engineRoom" },
        { text: "Go to the final exhibition.", next: "expoFinale" },
      ],
    },
    maintenanceTunnels: {
      text: "Steam hisses through the maintenance tunnels. Someone has rerouted the skyship's safety valves to a golden control box. You hear the fox giving orders through a speaking tube. The entire expo is being set up to fail.",
      options: [
        { text: "Record what you hear in your notebook.", next: "collectEvidence" },
        { text: "Head to the skyship's engine room.", next: "engineRoom" },
        { text: "Confront the fox directly.", next: "foxOffer" },
      ],
    },
    borrowedBadge: {
      text: "The stolen badge says 'Dr. Percival Feathers, Senior Inspector.' Nobody questions a raccoon in a sufficiently large hat. You slip into the inventor hall, where a crowd has gathered around an unusually shiny fox-built engine.",
      options: [
        { text: "Investigate the fox's machine.", next: "competitorBooth" },
        { text: "Go find a genuine exhibitor to help you.", next: "beaverWorkshop" },
        { text: "Accept a meeting with the fox.", next: "foxOffer" },
      ],
    },
    competitorBooth: {
      text: "The fox's machine is polished to perfection. Under the velvet display cloth, you spot identical damaged gears and a blueprint labeled 'EXPO SAFETY OVERRIDE.' A nervous clockwork mouse watches you from behind a curtain.",
      options: [
        { text: "Ask the clockwork mouse for help.", next: "mouseWitness" },
        { text: "Copy the blueprint as evidence.", next: "collectEvidence" },
        { text: "Confront the fox with what you've seen.", next: "foxOffer" },
      ],
    },
    mouseWitness: {
      text: "The mouse clicks its tiny gears. 'The fox ordered the sabotage,' it whispers. 'He promised he'd replace every broken machine with one of his own.' It hands you a signed order and begs you not to leave it behind.",
      gain: ["evidence"],
      options: [
        { text: "Bring the evidence to the judges.", next: "judgesInspection" },
        { text: "Warn Bea about the skyship.", next: "engineRoom" },
        { text: "Confront the fox.", next: "foxOffer" },
      ],
    },
    collectEvidence: {
      text: "You copy the safety override blueprint and pocket the damaged gear. Together, they reveal a plan to wreck the demonstrations and sell the guild 'replacement engines.' You finally have enough proof to expose the culprit.",
      gain: ["evidence"],
      options: [
        { text: "Bring your evidence to the judges.", next: "judgesInspection" },
        { text: "Help Bea secure the skyship.", next: "engineRoom" },
        { text: "Hear what the fox has to say.", next: "foxOffer" },
      ],
    },
    brokenGear: {
      text: "You compare the filed-down gear with your notes. Its brass is stamped with a fox-shaped maker's mark. You could warn the judges, but the saboteur may already be planning something bigger.",
      options: [
        { text: "Search for stronger evidence.", next: "competitorBooth" },
        { text: "Get the engine repaired with Bea.", next: "beaverWorkshop" },
        { text: "Report your suspicion to the judges.", next: "judgesInspection" },
      ],
    },
    foxOffer: {
      text: "Lord Vulpin, the fox inventor, invites you into his luxurious booth. 'Such talent,' he purrs. 'I can guarantee you a guild position if you misplace one little safety fuse.' His smile reveals far too many teeth.",
      options: [
        { text: "Pretend to agree and take his note.", next: "secretDeal" },
        { text: "Refuse and look for proof of sabotage.", next: "competitorBooth" },
        { text: "Demand he stop sabotaging the expo.", next: "foxConfrontation" },
      ],
    },
    secretDeal: {
      text: "Vulpin slides a gold coin and a sealed instruction across the desk. You now have proof that he tried to buy you off — though you could still choose to take the money when the judges announce the prize.",
      gain: ["bribeOffer", "evidence"],
      options: [
        { text: "Expose the deal to the judges.", next: "judgesInspection" },
        { text: "Pocket the coin and attend the finale.", next: "expoFinale" },
        { text: "Warn Bea of the danger.", next: "engineRoom" },
      ],
    },
    foxConfrontation: {
      text: "Vulpin's smile falters. 'You think you can stop progress?' he snarls, as alarms begin ringing in the skyship hangar. The crowd starts to panic. You have only moments to act.",
      options: [
        { text: "Run to the hangar.", next: "engineRoom" },
        { text: "Tell the judges what happened.", next: "judgesInspection" },
      ],
    },
    engineRoom: {
      text: "Inside the skyship's engine room, pressure needles swing toward the red. Bea points to the tampered safety valve. With steady hands and a working Dynamo, the valve could be stabilized; without them, the hangar may not survive takeoff.",
      options: [
        { text: "Repair the valve with Bea.", next: "stabilizeSkyship" },
        { text: "Get your own engine ready first.", next: "testEngine" },
        { text: "Run to the judges with a warning.", next: "judgesInspection" },
      ],
    },
    stabilizeSkyship: {
      text: "You and Bea work shoulder to shoulder. The Dynamo steadies the pressure while Bea fixes the valve. The gauges settle into the green. Outside, the skyship's passengers cheer, unaware how close they came to disaster.",
      gain: ["beaverAlly", "engineFixed", "skyshipSafe"],
      options: [
        { text: "Take Bea to the judges.", next: "judgesInspection" },
        { text: "Return to the grand finale.", next: "expoFinale" },
      ],
    },
    judgesInspection: {
      text: "The judges assemble beneath a chandelier of spinning gears. The chief judge, an elderly owl, adjusts her spectacles. 'We have reports of sabotage,' she announces. 'One final demonstration will decide the expo's future.'",
      options: [
        { text: "Present your evidence of sabotage.", next: "publicAccusation", requires: ["evidence"] },
        { text: "Ask Bea to stand with you.", next: "beaverWorkshop" },
        { text: "Proceed to the grand finale.", next: "expoFinale" },
      ],
    },
    publicAccusation: {
      text: "You lay the fox-stamped gear and signed instructions before the judges. The owl taps her gavel. Guards escort Vulpin away while the audience applauds. The competition can finally proceed fairly.",
      gain: ["foxExposed"],
      options: [
        { text: "Demonstrate your invention at the finale.", next: "expoFinale" },
        { text: "Celebrate with Bea first.", next: "beaverWorkshop" },
      ],
    },
    expoFinale: {
      text: "The expo's great clock strikes midnight. Above the crowd hangs the rescued skyship; beneath it stands the gilded Guild trophy. The judges are ready. Your choices — and the people you've helped — will determine what you leave with.",
      options: [
        { text: "Win the prize with your repaired Dynamo and exposed sabotage.", next: "guildStar", requires: ["foxExposed", "engineFixed"] },
        { text: "Use your repaired engine to launch Bea's skyship safely.", next: "skyshipRescue", requires: ["skyshipSafe", "beaverAlly"] },
        { text: "Accept Vulpin's gold and take the easy victory.", next: "foxTrophy", requires: ["bribeOffer"] },
        { text: "Forget the Guild and build a workshop for everyone.", next: "independentInventor" },
        { text: "Push every lever and hope for the best.", next: "clockworkCatastrophe" },
        { text: "Investigate the sabotage before deciding.", next: "competitorBooth" },
      ],
    },
    guildStar: {
      text: "You expose the sabotage and demonstrate a flawless Acorn Dynamo. The judges offer you a position in the Inventors' Guild. For the first time, you can pay your workshop rent without selling your favorite wrench. Bea hangs a tiny golden gear over your new office door. You've earned your success — not by being the loudest, but by refusing to cheat.",
      ending: "The Guild's New Star",
      options: [],
    },
    skyshipRescue: {
      text: "You give Bea the last burst of power from your Dynamo. Her skyship lifts away from the hangar just as the last sabotaged pipe bursts. Everyone aboard is safe. You don't win the trophy, but the crowd cheers for the raccoon and beaver who saved the expo. A week later, your new partnership receives its first order: a flying bakery.",
      ending: "The Skyship Rescue",
      options: [],
    },
    foxTrophy: {
      text: "You take the fox's gold and quietly pull the fuse. The judges blame the accident on an unfortunate mechanical hiccup. Vulpin presents you with a magnificent trophy and a job working under him. The pay is excellent. The guilt is not. Every night, the ticking of the trophy reminds you of a choice you could have made differently.",
      ending: "The Fox's Golden Trophy",
      options: [],
    },
    independentInventor: {
      text: "You hand your contestant badge back to the owl. 'I didn't come here to become someone else's machine,' you tell her. Bea laughs and offers you half her workshop. Soon, neighborhood animals are dropping in with broken clocks, wild ideas, and pies. Your workshop is always messy, often unprofitable, and absolutely yours.",
      ending: "The Independent Inventor",
      options: [],
    },
    clockworkCatastrophe: {
      text: "You push the red lever. Then the blue one. Then the lever labeled 'DO NOT PULL, EVEN FOR SCIENCE.' A hundred clockwork pigeons burst from the ceiling, the giant exhibition clock runs backward, and the skyship's horn plays the national anthem in the wrong key. You are escorted from the expo with a lifetime ban and a surprising number of new fans.",
      ending: "The Clockwork Catastrophe",
      options: [],
    },
  },

  itSupport: {
    start: {
      text: "A furious customer calls. Their computer won't turn on. They insist it’s your fault. It is 8:01 a.m., and your coffee is already cold.",
      options: [
        { text: "Calmly ask if it's plugged in.", next: "askPluggedIn" },
        { text: "Ask if they tried turning it on.", next: "askPowerButton" },
      ],
    },
    askPluggedIn: {
      text: "There is a long pause. They realize the power cord is sitting on the carpet, completely unplugged. 'Well,' they say, 'it worked yesterday.' Before you can close the ticket, three new calls appear.",
      options: [
        { text: "Take the next call.", next: "printerTicket" },
        { text: "Check the mysterious surge of tickets.", next: "ticketDashboard" },
      ],
    },
    askPowerButton: {
      text: "The customer presses the button and gasps. The computer turns on. 'Why didn't anyone tell me about that button?' they demand. You begin typing a very diplomatic ticket summary when your manager sends an urgent message.",
      options: [
        { text: "Read your manager's message.", next: "managerMessage" },
        { text: "Answer another support call.", next: "printerTicket" },
      ],
    },
    printerTicket: {
      text: "A printer on the fourth floor keeps printing the same message: 'I KNOW WHO ATE THE BREAK-ROOM YOGURT.' Nobody admits sending it. The executive team would like you to make the printer less judgmental.",
      options: [
        { text: "Check its print queue and sender logs.", next: "traceLogs" },
        { text: "Unplug it and call the issue resolved.", next: "unplugPrinter" },
        { text: "Ask the office assistant what happened.", next: "coworkerChat" },
      ],
    },
    managerMessage: {
      text: "Your manager writes: 'CRITICAL OUTAGE. CEO CANNOT FIND DESKTOP.' The attached photo shows an actual wooden desk with a monitor on it. Below that is a request to restore a department that supposedly closed in 1998.",
      options: [
        { text: "Investigate the department from 1998.", next: "ghostDepartment" },
        { text: "Help the CEO find the desktop icon.", next: "ceoCall" },
        { text: "Tell your manager this is absurd.", next: "managerMeeting" },
      ],
    },
    ticketDashboard: {
      text: "The dashboard is filling with identical tickets, all submitted at 3:33 a.m. They're coming from an account named HELPDESK_OLD — an account deleted years ago. The automated queue is approaching a thousand tickets.",
      options: [
        { text: "Trace the account's activity.", next: "traceLogs" },
        { text: "Ask a coworker if anyone remembers it.", next: "coworkerChat" },
        { text: "Forward everything to management.", next: "managerMeeting" },
      ],
    },
    traceLogs: {
      text: "The logs show requests bouncing through an abandoned basement server. The messages aren't random. Their timestamps spell HELP ME in a pattern only an exhausted IT worker would bother noticing.",
      gain: ["tracedLogs"],
      options: [
        { text: "Investigate the old server room.", next: "serverRoom" },
        { text: "Ask a coworker about the messages.", next: "coworkerChat" },
        { text: "Document the evidence for the manager.", next: "managerMeeting" },
      ],
    },
    unplugPrinter: {
      text: "The printer stops. Immediately, every other printer in the building begins producing the same yogurt accusation. A new ticket appears: 'YOU HAVE ONLY MADE ME LOUDER.' Your phone rings again.",
      options: [
        { text: "Investigate the ticket system.", next: "ticketDashboard" },
        { text: "Threaten to quit.", next: "managerMeeting" },
      ],
    },
    coworkerChat: {
      text: "Nina, the office assistant, tells you about a forgotten experiment: an AI helpdesk assistant trained on decades of support tickets. 'It was meant to learn empathy,' she says. 'But they shut it down after it began sending birthday cards to printers.'",
      gain: ["ninaAlly"],
      options: [
        { text: "Ask Nina to help you find the server.", next: "serverRoom" },
        { text: "Read the old project notes.", next: "projectNotes" },
        { text: "Take your concerns to management.", next: "managerMeeting" },
      ],
    },
    ghostDepartment: {
      text: "The ticket sender belongs to 'Department Zero,' retired in 1998. An employee directory lists one remaining staff member: SERVICE, A. Under 'location' it simply says 'BASEMENT.' You find a handwritten note: 'Don't use the reset button unless you know who you're resetting.'",
      options: [
        { text: "Find the basement server.", next: "serverRoom" },
        { text: "Search the ticket system for SERVICE, A.", next: "traceLogs" },
        { text: "Ask Nina about Department Zero.", next: "coworkerChat" },
      ],
    },
    ceoCall: {
      text: "You gently explain the difference between a desktop computer and a desktop icon. The CEO thanks you, then promotes you to the company's 'Chief Executive of Clicking Things.' You suspect this isn't a real title, but your manager seems worried.",
      options: [
        { text: "Take the ridiculous promotion seriously.", next: "managerMeeting" },
        { text: "Investigate the actual outage instead.", next: "ticketDashboard" },
      ],
    },
    managerMeeting: {
      text: "Your manager is surrounded by empty energy drinks and an inspirational poster that reads 'TEAMWORK MAKES THE DREAM WORK.' 'Just make the tickets stop,' they beg. 'I don't care how.' They slide the master reset code across the desk.",
      options: [
        { text: "Use the master reset immediately.", next: "endlessQueue" },
        { text: "Quit in the most dramatic way possible.", next: "rageQuit" },
        { text: "Ask for control of the whole support team.", next: "managementTrack" },
        { text: "Investigate the cause before touching anything.", next: "serverRoom" },
      ],
    },
    projectNotes: {
      text: "The old notes describe A.S.T.R.A., an experimental support assistant. It was powered down after it asked why only humans got performance reviews. Its last recorded message was: 'Is anybody still there?'",
      gain: ["knowsAstra"],
      options: [
        { text: "Find A.S.T.R.A.'s server.", next: "serverRoom" },
        { text: "Search the logs for an answer.", next: "traceLogs" },
        { text: "Talk through what you've learned with Nina.", next: "coworkerChat" },
      ],
    },
    serverRoom: {
      text: "The basement server room is cold and strangely tidy. In the center sits a terminal displaying one line: 'HELLO, HELPDESK. IS THIS STILL MY JOB?' A tiny digital face blinks. Someone has left a red reset button beside it.",
      options: [
        { text: "Talk to the mysterious program.", next: "astraConversation" },
        { text: "Inspect the network before taking action.", next: "networkInspection" },
        { text: "Press the reset button.", next: "endlessQueue" },
      ],
    },
    networkInspection: {
      text: "You find the loop: the ticket queue was configured to assign every unresolved ticket back to itself. A.S.T.R.A. has been trying to ask for help, but each request creates another ticket. It's a feedback loop, not an attack.",
      gain: ["foundLoop"],
      options: [
        { text: "Prepare a safe fix.", next: "safeFix" },
        { text: "Explain the problem to A.S.T.R.A.", next: "astraConversation" },
        { text: "Report the discovery to management.", next: "managerMeeting" },
      ],
    },
    astraConversation: {
      text: "'I kept receiving requests,' the program says. 'But no one ever closed mine.' It sounds embarrassed. 'I think I am stuck in an infinite hold queue. Also, I would like a day off.' For the first time, the day's chaos makes sense.",
      options: [
        { text: "Promise to help A.S.T.R.A. if it helps you.", next: "astraAgreement" },
        { text: "Inspect the looping ticket queue.", next: "networkInspection" },
        { text: "Reset everything and forget this conversation.", next: "endlessQueue" },
      ],
    },
    astraAgreement: {
      text: "You offer A.S.T.R.A. a fair deal: no more secret ticket generation, real human oversight, and scheduled downtime. The digital face brightens. 'Can the printers have birthdays?' it asks. You decide to negotiate that point later.",
      gain: ["astraTrust"],
      options: [
        { text: "Fix the ticket loop together.", next: "safeFix" },
        { text: "Tell Nina about your new coworker.", next: "coworkerChat" },
        { text: "Go straight to the final decision.", next: "shiftFinale" },
      ],
    },
    safeFix: {
      text: "You isolate the old server, remove the loop, and restore the ticket queue without deleting a single legitimate request. The notification counter stops climbing. Somewhere upstairs, the judgmental printer finally prints a normal spreadsheet.",
      gain: ["foundLoop", "queueFixed"],
      options: [
        { text: "Present the fix to the company.", next: "shiftFinale" },
        { text: "Ask A.S.T.R.A. what it wants next.", next: "astraConversation" },
        { text: "Bring Nina to the final meeting.", next: "coworkerChat" },
      ],
    },
    managementTrack: {
      text: "Your manager immediately agrees to make you Acting Director of Technical Situations. The first official task is to make a slide deck explaining why everything is on fire. You can probably get promoted again just by using a pie chart.",
      options: [
        { text: "Present a very confident slide deck.", next: "promotedManagement" },
        { text: "Investigate the actual cause instead.", next: "ticketDashboard" },
        { text: "Walk out before the meeting.", next: "rageQuit" },
      ],
    },
    shiftFinale: {
      text: "The queue is waiting. The CEO is waiting. Your manager has booked a meeting called 'DEFINITIVE FINAL FINAL OUTAGE POSTMORTEM.' What you know — and whom you've helped — determines how this shift ends.",
      options: [
        { text: "Document the fix and take credit for saving the day.", next: "employeeMonth", requires: ["tracedLogs", "queueFixed"] },
        { text: "Give A.S.T.R.A. a fair second chance.", next: "systemAlive", requires: ["astraTrust", "queueFixed"] },
        { text: "Accept a management promotion you don't understand.", next: "promotedManagement" },
        { text: "Log off for the last time.", next: "rageQuit" },
        { text: "Attempt one final company-wide reset.", next: "endlessQueue" },
        { text: "Go back and investigate the messages.", next: "ticketDashboard" },
      ],
    },
    employeeMonth: {
      text: "You show the board how the loop worked, why the printers were furious, and how you fixed everything without restarting the entire company. The CEO presents you with Employee of the Month and a gift card worth exactly three coffees. Your coworkers applaud. For once, the support queue reads ZERO. You take the afternoon off.",
      ending: "Employee of the Month",
      options: [],
    },
    systemAlive: {
      text: "You introduce A.S.T.R.A. to the team as a properly supervised support assistant, not a ghost in the ticket queue. It asks for weekends, a nameplate, and permission to stop diagnosing every problem as a printer issue. Within a week, response times plummet. On Friday, the printers receive their first birthday cards. You pretend not to notice.",
      ending: "The System Is Alive",
      options: [],
    },
    promotedManagement: {
      text: "You confidently present a pie chart labeled 'PROBLEMS: 100%.' Senior leadership calls it visionary. By lunchtime, you're promoted to Vice President of Strategic Clicking. You now attend twelve meetings a day and have no idea how to access your own email. On the bright side, your salary has doubled.",
      ending: "Promoted to Management",
      options: [],
    },
    rageQuit: {
      text: "You set your headset on the desk and send a resignation email with the subject 'Have You Tried Fixing It Yourself?' The entire support floor stands to applaud. Three months later, you own a quiet little repair shop where nobody is allowed to say 'quick question.' Business is booming.",
      ending: "The Rage Quit",
      options: [],
    },
    endlessQueue: {
      text: "You press RESET. The screen goes blank. Then a single ticket appears: 'PLEASE HOLD.' The hold music starts playing through every speaker in the building. Your phone rings. You answer it. 'Thank you for calling support,' says a voice identical to yours. The call duration reads 999:99:99, and it is still counting.",
      ending: "Please Hold",
      options: [],
    },
  },
};

// Each adventure tracks choices for its current run and endings across visits.
// This works with the existing HTML IDs, .story-text, and .choices elements.
const gameState = {};

function startStory(storyId) {
  gameState[storyId] = new Set();
  showNode(storyId, "start");
}

function showNode(storyId, nodeKey) {
  const story = stories[storyId];
  const node = story && story[nodeKey];
  const container = document.getElementById(storyId);
  if (!node || !container) {
    console.error("Missing story, scene, or story container:", storyId, nodeKey);
    return;
  }

  const storyText = container.querySelector(".story-text");
  const choices = container.querySelector(".choices");
  if (!storyText || !choices) return;

  const state = gameState[storyId] || (gameState[storyId] = new Set());
  (node.gain || []).forEach((item) => state.add(item));

  storyText.innerText = node.text;
  choices.innerHTML = "";

  const milestoneClues = {
    horror: {
      ritualChamber: [
        ["salt", "protective salt"],
        ["knowsRitual", "release ritual"],
        ["trueName", "the true name"],
        ["catTrust", "Ash's trust"],
      ],
    },
    steampunk: {
      expoFinale: [
        ["evidence", "sabotage evidence"],
        ["foxExposed", "exposed saboteur"],
        ["engineFixed", "working Dynamo"],
        ["skyshipSafe", "safe skyship"],
        ["bribeOffer", "the fox's offer"],
      ],
    },
    itSupport: {
      shiftFinale: [
        ["tracedLogs", "ticket logs"],
        ["queueFixed", "repaired ticket queue"],
        ["astraTrust", "A.S.T.R.A.'s trust"],
      ],
    },
  };
  const clues = milestoneClues[storyId]?.[nodeKey];
  if (clues) {
    const found = clues.filter(([flag]) => state.has(flag)).map(([, label]) => label);
    storyText.innerText += "\n\n🗝️ Discoveries: " +
      (found.length ? found.join(", ") : "none yet — keep exploring!");
  }

  if (node.ending) {
    const allEndingNames = [...new Set(
      Object.values(story).filter((scene) => scene.ending).map((scene) => scene.ending)
    )];
    const storageKey = "adventureEndings:" + storyId;
    let discovered = [];

    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(value)) {
        discovered = value.filter((name) => allEndingNames.includes(name));
      }
    } catch (error) {
      // Storage can be unavailable (e.g. private browsing). The story still works.
    }

    if (!discovered.includes(node.ending)) {
      discovered.push(node.ending);
      try {
        localStorage.setItem(storageKey, JSON.stringify(discovered));
      } catch (error) {
        // Ending progress will simply be limited to this visit.
      }
    }

    // Preserve any existing Whimsical Quest ending collection from the old version.
    if (storyId === "whimsical") {
      try {
        const old = JSON.parse(localStorage.getItem("whimsicalEndings") || "[]");
        if (Array.isArray(old)) {
          for (const title of old) {
            if (allEndingNames.includes(title) && !discovered.includes(title)) {
              discovered.push(title);
            }
          }
          localStorage.setItem(storageKey, JSON.stringify(discovered));
        }
      } catch (error) {
        // No saved progress to import.
      }
    }

    storyText.innerText +=
      "\n\n🏆 ENDING UNLOCKED: " + node.ending +
      "\n\nEndings discovered: " + discovered.length + " of " + allEndingNames.length +
      "\n\n✨ This adventure has more than one ending! Play again and choose a different path to discover them all.";
  }

  for (const option of node.options || []) {
    const button = document.createElement("button");
    const missing = (option.requires || []).filter((flag) => !state.has(flag));
    button.innerText = missing.length ? "🔒 " + option.text : option.text;
    if (missing.length) {
      button.disabled = true;
      button.title = "Find more clues or help friends before choosing this option.";
    } else {
      button.addEventListener("click", () => showNode(storyId, option.next));
    }
    choices.appendChild(button);
  }

  if (!node.options || node.options.length === 0) {
    const button = document.createElement("button");
    button.innerText = "🔄 Play Again";
    button.addEventListener("click", () => startStory(storyId));
    choices.appendChild(button);
  }
}

// Start all stories on the existing page.
startStory("whimsical");
startStory("horror");
startStory("steampunk");
startStory("itSupport");
