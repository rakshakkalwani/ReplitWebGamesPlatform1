// server/index.ts
import express3 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  games;
  comments;
  ratings;
  gameHistory;
  userIdCounter = 1;
  gameIdCounter = 1;
  commentIdCounter = 1;
  ratingIdCounter = 1;
  gameHistoryIdCounter = 1;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.games = /* @__PURE__ */ new Map();
    this.comments = /* @__PURE__ */ new Map();
    this.ratings = /* @__PURE__ */ new Map();
    this.gameHistory = /* @__PURE__ */ new Map();
    this.initializeSampleData();
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  async createUser(insertUser) {
    const id = this.userIdCounter++;
    const now = /* @__PURE__ */ new Date();
    const user = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  async updateUserPoints(userId, points) {
    const user = await this.getUser(userId);
    if (!user) return void 0;
    user.points = (user.points || 0) + points;
    user.level = Math.floor((user.points || 0) / 1e3) + 1;
    this.users.set(userId, user);
    return user;
  }
  async getTopPlayers(limit) {
    return Array.from(this.users.values()).sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, limit);
  }
  // Game methods
  async getGames() {
    return Array.from(this.games.values());
  }
  async getGame(id) {
    return this.games.get(id);
  }
  async getGamesByCategory(category) {
    return Array.from(this.games.values()).filter(
      (game) => game.category.toLowerCase() === category.toLowerCase() || game.secondaryCategory?.toLowerCase() === category.toLowerCase()
    );
  }
  async getFeaturedGames() {
    return Array.from(this.games.values()).filter((game) => game.isFeatured);
  }
  async getNewGames() {
    return Array.from(this.games.values()).filter((game) => game.isNew);
  }
  async getPopularGames(limit) {
    return Array.from(this.games.values()).sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, limit);
  }
  async createGame(insertGame) {
    const id = this.gameIdCounter++;
    const now = /* @__PURE__ */ new Date();
    const game = { ...insertGame, id, createdAt: now };
    this.games.set(id, game);
    return game;
  }
  async updateGamePlayCount(gameId) {
    const game = await this.getGame(gameId);
    if (!game) return void 0;
    game.playCount = (game.playCount || 0) + 1;
    this.games.set(gameId, game);
    return game;
  }
  // Comment methods
  async getCommentsByGame(gameId) {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.gameId === gameId
    );
  }
  async createComment(insertComment) {
    const id = this.commentIdCounter++;
    const now = /* @__PURE__ */ new Date();
    const comment = { ...insertComment, id, createdAt: now };
    this.comments.set(id, comment);
    return comment;
  }
  // Rating methods
  async getRatingsByGame(gameId) {
    return Array.from(this.ratings.values()).filter(
      (rating) => rating.gameId === gameId
    );
  }
  async createRating(insertRating) {
    const id = this.ratingIdCounter++;
    const now = /* @__PURE__ */ new Date();
    const rating = { ...insertRating, id, createdAt: now };
    this.ratings.set(id, rating);
    this.updateGameRating(insertRating.gameId);
    return rating;
  }
  // Game History methods
  async getGameHistoryByUser(userId) {
    return Array.from(this.gameHistory.values()).filter(
      (history) => history.userId === userId
    );
  }
  async createGameHistory(insertHistory) {
    const id = this.gameHistoryIdCounter++;
    const history = { ...insertHistory, id };
    this.gameHistory.set(id, history);
    return history;
  }
  // Helper methods
  async updateGameRating(gameId) {
    const game = await this.getGame(gameId);
    if (!game) return;
    const ratings2 = await this.getRatingsByGame(gameId);
    if (ratings2.length === 0) return;
    const totalRating = ratings2.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = Math.round(totalRating / ratings2.length);
    game.rating = averageRating;
    this.games.set(gameId, game);
  }
  // Initialize with sample data
  initializeSampleData() {
    const sampleUsers = [
      {
        username: "JediMaster",
        password: "password",
        email: "jedi@example.com",
        avatar: "JD",
        level: 42,
        points: 9845
      },
      {
        username: "PixelPro",
        password: "password",
        email: "pixel@example.com",
        avatar: "PP",
        level: 39,
        points: 8732
      },
      {
        username: "GameWizard",
        password: "password",
        email: "wizard@example.com",
        avatar: "GW",
        level: 37,
        points: 7914
      },
      {
        username: "NinjaSlayer",
        password: "password",
        email: "ninja@example.com",
        avatar: "NS",
        level: 34,
        points: 7156
      },
      {
        username: "RocketPower",
        password: "password",
        email: "rocket@example.com",
        avatar: "RP",
        level: 31,
        points: 6873
      }
    ];
    sampleUsers.forEach((user) => this.createUser(user));
    const allGames = [
      {
        title: "Alpha Balls",
        description: "Dive into this engaging board game and test your skills!",
        category: "adventure",
        secondaryCategory: "arcade",
        thumbnailUrl: "/games/AlphaBalls/HTML5/icons/icon-512.png",
        isFeatured: true,
        isNew: true,
        rating: 5,
        playCount: 3032
      },
      {
        title: "Basket Slide",
        description: "Dive into this entertaining adventure game and test your skills!",
        category: "action",
        secondaryCategory: "casual",
        thumbnailUrl: "/games/BasketSlide/HTML5/icons/icon-512.png",
        isFeatured: true,
        isNew: true,
        rating: 5,
        playCount: 1351
      },
      {
        title: "Blocks 8",
        description: "Play this entertaining adventure game and test your skills!",
        category: "sports",
        secondaryCategory: "racing",
        thumbnailUrl: "/games/Blocks8/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 1500
      },
      {
        title: "Blocky 360",
        description: "Challenge yourself with this challenging board game and test your skills!",
        category: "racing",
        secondaryCategory: "puzzle",
        thumbnailUrl: "/games/Blocky360/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: true,
        rating: 5,
        playCount: 2259
      },
      {
        title: "Blue Block",
        description: "Play this engaging puzzle game and test your skills!",
        category: "puzzle",
        secondaryCategory: "educational",
        thumbnailUrl: "/games/BlueBlock/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: true,
        rating: 4,
        playCount: 5540
      },
      {
        title: "Bounce",
        description: "Bounce your way through challenging levels with physics-based gameplay",
        category: "action",
        secondaryCategory: "arcade",
        thumbnailUrl: "/games/Bounce/HTML5/icon-256.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 5298
      },
      {
        title: "Bridges",
        description: "Build bridges to connect islands and solve tricky puzzles",
        category: "strategy",
        secondaryCategory: "board",
        thumbnailUrl: "/games/Bridges/HTML5/icons/icon-512.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 3496
      },
      {
        title: "Cards 2048",
        description: "Enjoy this fun puzzle game and test your skills!",
        category: "card",
        secondaryCategory: "board",
        thumbnailUrl: "/games/Cards2048/HTML5/icons/icon-512.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 1255
      },
      {
        title: "Circle",
        description: "Dive into this engaging casual game and test your skills!",
        category: "card",
        secondaryCategory: "action",
        thumbnailUrl: "/games/Circle_S/HTML5/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 1532
      },
      {
        title: "Color Strings",
        description: "Experience this challenging card game and test your skills!",
        category: "action",
        secondaryCategory: "board",
        thumbnailUrl: "/games/ColorStrings/HTML5/icons/icon-512.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 4182
      },
      {
        title: "Colored Bricks",
        description: "Enjoy this challenging casual game and test your skills!",
        category: "puzzle",
        secondaryCategory: "adventure",
        thumbnailUrl: "/games/ColoredBricks/HTML5/icons/icon-512.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 5737
      },
      {
        title: "Connect Me",
        description: "Experience this entertaining multiplayer game and test your skills!",
        category: "puzzle",
        secondaryCategory: "board",
        thumbnailUrl: "/games/ConnectMe/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 3568
      },
      {
        title: "Connect Merge",
        description: "Experience this challenging educational game and test your skills!",
        category: "puzzle",
        secondaryCategory: "strategy",
        thumbnailUrl: "/games/ConnectMerge/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 5045
      },
      {
        title: "Cross Path",
        description: "Experience this entertaining racing game and test your skills!",
        category: "racing",
        secondaryCategory: "arcade",
        thumbnailUrl: "/games/CrossPath/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 3929
      },
      {
        title: "Cube Jump",
        description: "Experience this entertaining card game and test your skills!",
        category: "adventure",
        secondaryCategory: "strategy",
        thumbnailUrl: "/games/CubeJump/HTML5/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 5062
      },
      {
        title: "Dino Bubbles",
        description: "Play this exciting educational game and test your skills!",
        category: "adventure",
        secondaryCategory: "sports",
        thumbnailUrl: "/games/DinoBubbles/HTML5/icon-256.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 1406
      },
      {
        title: "Disk Rush",
        description: "Play this engaging strategy game and test your skills!",
        category: "adventure",
        secondaryCategory: "educational",
        thumbnailUrl: "/games/DiskRush/HTML5/icons/icon-512.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 2191
      },
      {
        title: "Donut Box",
        description: "Play this addictive arcade game and test your skills!",
        category: "multiplayer",
        secondaryCategory: "casual",
        thumbnailUrl: "/games/DonutBox/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: true,
        rating: 5,
        playCount: 2986
      },
      {
        title: "Dotted Fill",
        description: "Challenge yourself with this entertaining racing game and test your skills!",
        category: "board",
        secondaryCategory: "racing",
        thumbnailUrl: "/games/DottedFill/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: true,
        rating: 5,
        playCount: 2805
      },
      {
        title: "Draw In",
        description: "Enjoy this entertaining sports game and test your skills!",
        category: "multiplayer",
        secondaryCategory: "racing",
        thumbnailUrl: "/games/DrawIn/HTML5/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 2184
      },
      {
        title: "Drifter",
        description: "Dive into this challenging card game and test your skills!",
        category: "adventure",
        secondaryCategory: "card",
        thumbnailUrl: "/games/Drifter/HTML5/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 5255
      },
      {
        title: "Emoji Puzzle",
        description: "Play this addictive adventure game and test your skills!",
        category: "arcade",
        secondaryCategory: "casual",
        thumbnailUrl: "/games/EmojiPuzzle/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 2513
      },
      {
        title: "Equalz",
        description: "Play this fun card game and test your skills!",
        category: "sports",
        secondaryCategory: "educational",
        thumbnailUrl: "/games/Equalz/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 1770
      },
      {
        title: "Filling Lines",
        description: "Experience this engaging educational game and test your skills!",
        category: "arcade",
        secondaryCategory: "racing",
        thumbnailUrl: "/games/FillingLines/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 2091
      },
      {
        title: "Fire Up",
        description: "Play this challenging action game and test your skills!",
        category: "puzzle",
        secondaryCategory: "adventure",
        thumbnailUrl: "/games/FireUp/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: true,
        rating: 4,
        playCount: 5536
      },
      {
        title: "Flight Color",
        description: "Play this exciting arcade game and test your skills!",
        category: "arcade",
        secondaryCategory: "puzzle",
        thumbnailUrl: "/games/FlightColor/HTML5/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 1019
      },
      {
        title: "Fools Match",
        description: "Play this exciting sports game and test your skills!",
        category: "card",
        secondaryCategory: "strategy",
        thumbnailUrl: "/games/FoolsMatch/HTML5/icons/icon-512.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 1336
      },
      {
        title: "Fours",
        description: "Challenge yourself with this challenging arcade game and test your skills!",
        category: "action",
        secondaryCategory: "racing",
        thumbnailUrl: "/games/Fours/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 5063
      },
      {
        title: "Free Kick",
        description: "Challenge yourself with this engaging sports game and test your skills!",
        category: "adventure",
        secondaryCategory: "puzzle",
        thumbnailUrl: "/games/FreeKick/HTML5/icon-256.png",
        isFeatured: false,
        isNew: true,
        rating: 4,
        playCount: 1963
      },
      {
        title: "Fruit Master",
        description: "Play this addictive sports game and test your skills!",
        category: "multiplayer",
        secondaryCategory: "casual",
        thumbnailUrl: "/games/FruitMaster/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 3024
      },
      {
        title: "Happy Connect",
        description: "Experience this exciting board game and test your skills!",
        category: "arcade",
        secondaryCategory: "action",
        thumbnailUrl: "/games/HappyConnect/HTML5/icons/icon-512 (1).png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 4281
      },
      {
        title: "Happy Glass 1",
        description: "Enjoy this addictive board game and test your skills!",
        category: "strategy",
        secondaryCategory: "card",
        thumbnailUrl: "/games/HappyGlass1/HTML5/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 4967
      },
      {
        title: "Happy Glass 2",
        description: "Challenge yourself with this fun strategy game and test your skills!",
        category: "puzzle",
        secondaryCategory: "strategy",
        thumbnailUrl: "/games/HappyGlass2/HTML5/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 1066
      },
      {
        title: "Happy Glass 3",
        description: "Play this fun sports game and test your skills!",
        category: "board",
        secondaryCategory: "adventure",
        thumbnailUrl: "/games/HappyGlass3/HTML5/icon-256.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 5876
      },
      {
        title: "House Paint",
        description: "Play this entertaining multiplayer game and test your skills!",
        category: "racing",
        secondaryCategory: "educational",
        thumbnailUrl: "/games/HousePaint/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 5932
      },
      {
        title: "Jelly Manager",
        description: "Play this fun casual game and test your skills!",
        category: "strategy",
        secondaryCategory: "board",
        thumbnailUrl: "/games/JellyManager/HTML5/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 3190
      },
      {
        title: "Knots",
        description: "Experience this challenging strategy game and test your skills!",
        category: "multiplayer",
        secondaryCategory: "adventure",
        thumbnailUrl: "/games/Knots/HTML5/icons/icon-512.png",
        isFeatured: true,
        isNew: false,
        rating: 5,
        playCount: 5267
      },
      {
        title: "Ludo",
        description: "Play this entertaining racing game and test your skills!",
        category: "casual",
        secondaryCategory: "racing",
        thumbnailUrl: "/games/Ludo/HTML5/icon-256.png",
        isFeatured: true,
        isNew: true,
        rating: 4,
        playCount: 1168
      },
      {
        title: "Make 5",
        description: "Experience this addictive adventure game and test your skills!",
        category: "racing",
        secondaryCategory: "card",
        thumbnailUrl: "/games/Make5/HTML5/icon-256.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 2248
      },
      {
        title: "Make 7",
        description: "Enjoy this fun educational game and test your skills!",
        category: "sports",
        secondaryCategory: "strategy",
        thumbnailUrl: "/games/Make7/HTML5/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 2851
      },
      {
        title: "Match 4",
        description: "Dive into this addictive card game and test your skills!",
        category: "arcade",
        secondaryCategory: "action",
        thumbnailUrl: "/games/Match4/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: true,
        rating: 4,
        playCount: 3894
      },
      {
        title: "Merge Face",
        description: "Dive into this exciting strategy game and test your skills!",
        category: "strategy",
        secondaryCategory: "educational",
        thumbnailUrl: "/games/MergeFace/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 2811
      },
      {
        title: "Merge Push",
        description: "Experience this entertaining adventure game and test your skills!",
        category: "educational",
        secondaryCategory: "arcade",
        thumbnailUrl: "/games/MergePush/HTML5/icon-256.png",
        isFeatured: true,
        isNew: true,
        rating: 5,
        playCount: 2278
      },
      {
        title: "Mini Golf",
        description: "Experience this fun puzzle game and test your skills!",
        category: "action",
        secondaryCategory: "sports",
        thumbnailUrl: "/games/MiniGolf/HTML5/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 2112
      },
      {
        title: "Mr Gun",
        description: "Challenge yourself with this engaging multiplayer game and test your skills!",
        category: "board",
        secondaryCategory: "adventure",
        thumbnailUrl: "/games/MrGun/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 1846
      },
      {
        title: "Node",
        description: "Play this addictive adventure game and test your skills!",
        category: "board",
        secondaryCategory: "educational",
        thumbnailUrl: "/games/Node/HTML5/icon-256.png",
        isFeatured: true,
        isNew: false,
        rating: 5,
        playCount: 1257
      },
      {
        title: "Number Maze",
        description: "Play this engaging strategy game and test your skills!",
        category: "racing",
        secondaryCategory: "strategy",
        thumbnailUrl: "/games/NumberMaze/HTML5/icons/icon-256.png",
        isFeatured: true,
        isNew: false,
        rating: 5,
        playCount: 2004
      },
      {
        title: "Omino",
        description: "Dive into this engaging casual game and test your skills!",
        category: "sports",
        secondaryCategory: "board",
        thumbnailUrl: "/games/Omino/HTML5/icon-512.png",
        isFeatured: true,
        isNew: false,
        rating: 5,
        playCount: 1187
      },
      {
        title: "Pattern",
        description: "Challenge yourself with this fun card game and test your skills!",
        category: "puzzle",
        secondaryCategory: "arcade",
        thumbnailUrl: "/games/Pattern/HTML5/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 1349
      },
      {
        title: "Pixel Slide",
        description: "Dive into this entertaining action game and test your skills!",
        category: "adventure",
        secondaryCategory: "multiplayer",
        thumbnailUrl: "/games/PixelSlide/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: true,
        rating: 4,
        playCount: 1289
      },
      {
        title: "Plus Puzzle",
        description: "Experience this exciting racing game and test your skills!",
        category: "sports",
        secondaryCategory: "arcade",
        thumbnailUrl: "/games/PlusPuzzle/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 5764
      },
      {
        title: "Pool 8",
        description: "Dive into this addictive action game and test your skills!",
        category: "sports",
        secondaryCategory: "strategy",
        thumbnailUrl: "/games/Pool8/HTML5/icons/icon-256.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 1042
      },
      {
        title: "Puzzle Color",
        description: "Challenge yourself with this challenging board game and test your skills!",
        category: "puzzle",
        secondaryCategory: "sports",
        thumbnailUrl: "/games/PuzzleColor/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 1232
      },
      {
        title: "RUIN",
        description: "Challenge yourself with this entertaining adventure game and test your skills!",
        category: "educational",
        secondaryCategory: "action",
        thumbnailUrl: "/games/RUIN/HTML5/icons/icon-256.png",
        isFeatured: true,
        isNew: false,
        rating: 5,
        playCount: 1366
      },
      {
        title: "Release",
        description: "Play this addictive educational game and test your skills!",
        category: "multiplayer",
        secondaryCategory: "puzzle",
        thumbnailUrl: "/games/Release/HTML5/icon-256.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 5674
      },
      {
        title: "Rolly Vortex",
        description: "Dive into this addictive adventure game and test your skills!",
        category: "sports",
        secondaryCategory: "card",
        thumbnailUrl: "/games/RollyVortex/HTML5/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 4939
      },
      {
        title: "Sorting Balls",
        description: "Experience this exciting multiplayer game and test your skills!",
        category: "puzzle",
        secondaryCategory: "sports",
        thumbnailUrl: "/games/SortingBalls/HTML5/icons/icon-256.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 1602
      },
      {
        title: "Space Shooter",
        description: "Enjoy this engaging card game and test your skills!",
        category: "multiplayer",
        secondaryCategory: "casual",
        thumbnailUrl: "/games/SpaceShooter/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: true,
        rating: 5,
        playCount: 4433
      },
      {
        title: "Sporos",
        description: "Play this exciting educational game and test your skills!",
        category: "card",
        secondaryCategory: "adventure",
        thumbnailUrl: "/games/Sporos/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 3593
      },
      {
        title: "Squ Area 1",
        description: "Experience this addictive educational game and test your skills!",
        category: "racing",
        secondaryCategory: "board",
        thumbnailUrl: "/games/SquArea1/HTML5/icon-256.png",
        isFeatured: false,
        isNew: true,
        rating: 5,
        playCount: 2924
      },
      {
        title: "Swipe Cubes",
        description: "Experience this challenging board game and test your skills!",
        category: "racing",
        secondaryCategory: "strategy",
        thumbnailUrl: "/games/SwipeCubes/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 3399
      },
      {
        title: "Take Off",
        description: "Dive into this entertaining racing game and test your skills!",
        category: "educational",
        secondaryCategory: "action",
        thumbnailUrl: "/games/TakeOff/HTML5/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 5106
      },
      {
        title: "Tangram",
        description: "Dive into this engaging card game and test your skills!",
        category: "sports",
        secondaryCategory: "card",
        thumbnailUrl: "/games/Tangram/HTML5/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 1899
      },
      {
        title: "Taxi Pickup",
        description: "Dive into this addictive adventure game and test your skills!",
        category: "educational",
        secondaryCategory: "racing",
        thumbnailUrl: "/games/TaxiPickup/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 4116
      },
      {
        title: "Tiny Cars",
        description: "Play this entertaining sports game and test your skills!",
        category: "educational",
        secondaryCategory: "strategy",
        thumbnailUrl: "/games/TinyCars/HTML5/icons/icon-256.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 5149
      },
      {
        title: "Toops",
        description: "Challenge yourself with this exciting multiplayer game and test your skills!",
        category: "racing",
        secondaryCategory: "board",
        thumbnailUrl: "/games/Toops/HTML5/icon-256.png",
        isFeatured: true,
        isNew: false,
        rating: 4,
        playCount: 2239
      },
      {
        title: "Two Dots 1",
        description: "Dive into this exciting puzzle game and test your skills!",
        category: "board",
        secondaryCategory: "action",
        thumbnailUrl: "/games/TwoDotsG1/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 5817
      },
      {
        title: "Two Dots 2",
        description: "Experience this challenging casual game and test your skills!",
        category: "adventure",
        secondaryCategory: "casual",
        thumbnailUrl: "/games/TwoDotsG2/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 5603
      },
      {
        title: "Two Dots 3",
        description: "Play this engaging sports game and test your skills!",
        category: "adventure",
        secondaryCategory: "puzzle",
        thumbnailUrl: "/games/TwoDotsG3/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 2544
      },
      {
        title: "Two Dots 4",
        description: "Challenge yourself with this exciting action game and test your skills!",
        category: "adventure",
        secondaryCategory: "educational",
        thumbnailUrl: "/games/TwoDotsG4/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 3292
      },
      {
        title: "Two Tiles",
        description: "Dive into this exciting racing game and test your skills!",
        category: "arcade",
        secondaryCategory: "racing",
        thumbnailUrl: "/games/TwoTiles/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 4595
      },
      {
        title: "Type Shift",
        description: "Enjoy this exciting action game and test your skills!",
        category: "educational",
        secondaryCategory: "action",
        thumbnailUrl: "/games/TypeShift/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 2804
      },
      {
        title: "Word Scapes",
        description: "Challenge yourself with this fun board game and test your skills!",
        category: "action",
        secondaryCategory: "arcade",
        thumbnailUrl: "/games/WordScapes/HTML5/icons/icon.png",
        isFeatured: false,
        isNew: false,
        rating: 4,
        playCount: 4483
      },
      {
        title: "Word Story",
        description: "Dive into this entertaining arcade game and test your skills!",
        category: "sports",
        secondaryCategory: "adventure",
        thumbnailUrl: "/games/TwoDotsG1/HTML5/icons/icon-256.png",
        isFeatured: true,
        isNew: false,
        rating: 5,
        playCount: 4964
      },
      {
        title: "Word Swipe",
        description: "Dive into this exciting board game and test your skills!",
        category: "casual",
        secondaryCategory: "racing",
        thumbnailUrl: "/games/WordSwipe/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: false,
        rating: 5,
        playCount: 3173
      },
      {
        title: "Word Wood",
        description: "Play this entertaining educational game and test your skills!",
        category: "sports",
        secondaryCategory: "action",
        thumbnailUrl: "/games/WordWood/HTML5/icons/icon-256.png",
        isFeatured: false,
        isNew: true,
        rating: 4,
        playCount: 1071
      },
      {
        title: "Zero 21",
        description: "Enjoy this exciting multiplayer game and test your skills!",
        category: "arcade",
        secondaryCategory: "strategy",
        thumbnailUrl: "/games/Zero21/HTML5/icons/icon-512.png",
        isFeatured: false,
        isNew: true,
        rating: 5,
        playCount: 2961
      }
    ];
    allGames.forEach((game) => this.createGame(game));
    const sampleComments = [
      {
        gameId: 1,
        userId: 1,
        content: "This game is awesome! I love the speed and graphics."
      },
      {
        gameId: 1,
        userId: 2,
        content: "Great gameplay but could use more levels."
      },
      {
        gameId: 2,
        userId: 3,
        content: "Very challenging puzzles, kept me entertained for hours."
      },
      {
        gameId: 3,
        userId: 4,
        content: "The storyline is amazing, can't wait for more content."
      },
      {
        gameId: 4,
        userId: 5,
        content: "Best multiplayer game on the platform!"
      }
    ];
    sampleComments.forEach((comment) => this.createComment(comment));
    const sampleRatings = [
      { gameId: 1, userId: 1, rating: 5 },
      { gameId: 1, userId: 2, rating: 4 },
      { gameId: 2, userId: 3, rating: 5 },
      { gameId: 3, userId: 4, rating: 5 },
      { gameId: 4, userId: 5, rating: 5 }
    ];
    sampleRatings.forEach((rating) => this.createRating(rating));
    const sampleHistory = [
      {
        gameId: 1,
        userId: 1,
        score: 5280,
        playedAt: new Date(Date.now() - 1e3 * 60 * 60 * 2)
      },
      {
        gameId: 2,
        userId: 1,
        score: 12450,
        playedAt: new Date(Date.now() - 1e3 * 60 * 60 * 24)
      },
      {
        gameId: 3,
        userId: 2,
        score: 8760,
        playedAt: new Date(Date.now() - 1e3 * 60 * 60 * 3)
      },
      {
        gameId: 4,
        userId: 3,
        score: 4500,
        playedAt: new Date(Date.now() - 1e3 * 60 * 60 * 5)
      },
      {
        gameId: 1,
        userId: 4,
        score: 6200,
        playedAt: new Date(Date.now() - 1e3 * 60 * 60 * 12)
      }
    ];
    sampleHistory.forEach((history) => this.createGameHistory(history));
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  avatar: text("avatar"),
  level: integer("level").default(1),
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  secondaryCategory: text("secondary_category"),
  thumbnailUrl: text("thumbnail_url").notNull(),
  isFeatured: boolean("is_featured").default(false),
  isNew: boolean("is_new").default(false),
  rating: integer("rating").default(0),
  playCount: integer("play_count").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var gameHistory = pgTable("game_history", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  userId: integer("user_id").notNull(),
  score: integer("score").default(0),
  playedAt: timestamp("played_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
var insertGameSchema = createInsertSchema(games).omit({ id: true, createdAt: true });
var insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
var insertRatingSchema = createInsertSchema(ratings).omit({ id: true, createdAt: true });
var insertGameHistorySchema = createInsertSchema(gameHistory).omit({ id: true });

// server/routes.ts
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import path from "path";
import express from "express";
async function registerRoutes(app2) {
  app2.use("/games", express.static(path.join(process.cwd(), "public", "games")));
  const handleZodError = (err, res) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ message: validationError.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  };
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      handleZodError(err, res);
    }
  });
  app2.get("/api/leaderboard", async (_req, res) => {
    try {
      const topPlayers = await storage.getTopPlayers(10);
      const safeUsers = topPlayers.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(safeUsers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });
  app2.get("/api/games", async (_req, res) => {
    try {
      const games2 = await storage.getGames();
      res.json(games2);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get games" });
    }
  });
  app2.get("/api/games/featured", async (_req, res) => {
    try {
      const featuredGames = await storage.getFeaturedGames();
      res.json(featuredGames);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get featured games" });
    }
  });
  app2.get("/api/games/new", async (_req, res) => {
    try {
      const newGames = await storage.getNewGames();
      res.json(newGames);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get new games" });
    }
  });
  app2.get("/api/games/popular", async (_req, res) => {
    try {
      const popularGames = await storage.getPopularGames(5);
      res.json(popularGames);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get popular games" });
    }
  });
  app2.get("/api/games/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const games2 = await storage.getGamesByCategory(category);
      res.json(games2);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get games by category" });
    }
  });
  app2.get("/api/games/:id", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get game" });
    }
  });
  app2.post("/api/games/:id/play", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.updateGamePlayCount(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      if (req.body.userId) {
        const gameHistory2 = insertGameHistorySchema.parse({
          gameId,
          userId: req.body.userId,
          score: req.body.score || 0
        });
        await storage.createGameHistory(gameHistory2);
        if (req.body.score > 0) {
          const pointsToAdd = Math.floor(req.body.score / 100);
          await storage.updateUserPoints(req.body.userId, pointsToAdd);
        }
      }
      res.json(game);
    } catch (err) {
      console.error(err);
      handleZodError(err, res);
    }
  });
  app2.get("/api/games/:id/comments", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const comments2 = await storage.getCommentsByGame(gameId);
      res.json(comments2);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get comments" });
    }
  });
  app2.post("/api/games/:id/comments", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      const commentData = insertCommentSchema.parse({
        ...req.body,
        gameId
      });
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (err) {
      console.error(err);
      handleZodError(err, res);
    }
  });
  app2.post("/api/games/:id/rate", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      const ratingData = insertRatingSchema.parse({
        ...req.body,
        gameId
      });
      const rating = await storage.createRating(ratingData);
      res.status(201).json(rating);
    } catch (err) {
      console.error(err);
      handleZodError(err, res);
    }
  });
  app2.get("/api/users/:id/history", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const history = await storage.getGameHistoryByUser(userId);
      res.json(history);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get game history" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path3, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__dirname, "."),
      "@shared": path2.resolve(__dirname, "shared")
    }
  },
  root: path2.resolve(__dirname),
  build: {
    outDir: path2.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 5001; // Use PORT env variable or 5001 as fallback
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
