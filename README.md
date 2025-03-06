# Cyberpunk MMORPG - Game Configuration Guide

This document provides instructions for customizing and configuring various aspects of the Cyberpunk MMORPG game.

## Table of Contents
1. [Game Overview](#game-overview)
2. [Currency Configuration](#currency-configuration)
3. [Monster Configuration](#monster-configuration)
4. [Character Configuration](#character-configuration)
5. [Dungeon Configuration](#dungeon-configuration)
6. [Gacha System Configuration](#gacha-system-configuration)

## Game Overview

The Cyberpunk MMORPG is a pixel art idle RPG game where players collect characters through a gacha system, battle monsters in various dungeons, collect resources, and upgrade their characters. The game features multiple dungeons with different difficulties, monster types, and reward structures.

## Currency Configuration

### Modifying Copper Drop Rate

To modify the base copper drop rate from monsters:

1. Open `js/monster.js`
2. Find the `killMonster` function
3. Locate the copper reward calculation section:

```javascript
// Base copper reward is 2, scaled by dungeon level
const levelMultiplier = MapSystem.currentDungeonLevel || 1;
        
// Apply the dungeon copper multiplier if available
const dungeonMultiplier = window.dungeonCopperMultiplier || 1;
const copperReward = Math.round(2 * levelMultiplier * dungeonMultiplier);
```

4. Change the base value `2` to your desired amount. For example, to double the copper drop rate:

```javascript
// Base copper reward is 4, scaled by dungeon level
const levelMultiplier = MapSystem.currentDungeonLevel || 1;
        
// Apply the dungeon copper multiplier if available
const dungeonMultiplier = window.dungeonCopperMultiplier || 1;
const copperReward = Math.round(4 * levelMultiplier * dungeonMultiplier);
```

### Currency Conversion Rates

Currency conversion rates are defined in `js/currency.js`. The default rates are:
- 100 Copper = 1 Silver
- 100 Silver = 1 Gold
- 100 Gold = 1 Diamond

To modify these conversion rates, update the corresponding values in the `Currency` object.

## Monster Configuration

### Monster Spawn Rate

To adjust the number of monsters that spawn per dungeon (target is 100-150 monsters per 10,000 distance):

1. Open `js/map.js`
2. Find the monster spawning configuration at the top of the file:

```javascript
// Monster spawning
monsterSpawnRate: 0.03, // Chance per frame to spawn a monster
monsterSpawnDistance: 200, // Minimum distance between monsters
```

3. Adjust these values to control monster spawning:
   - Increase `monsterSpawnRate` to spawn more monsters
   - Decrease `monsterSpawnDistance` to allow monsters to spawn closer together

The formula for calculating average monsters per 10,000 distance is approximately:
`10000 / monsterSpawnDistance × (monsterSpawnRate × 60)`

### Monster Types and Properties

Monster types are defined in `js/monster.js` in the `monsterTypes` object. Each monster type has properties like:

```javascript
slime: { 
    type: 'basic', 
    maxHealth: 30, 
    attack: 3, 
    defense: 1, 
    speed: 1, 
    experienceValue: 15, 
    // other properties...
}
```

To add or modify monster types, edit this object.

### Monster Drop Tables

Each monster has a drop table defined in its configuration:

```javascript
dropTable: [
    { itemId: 'scrap_metal', chance: 0.7, quantity: [1, 3] },
    { itemId: 'health_stim', chance: 0.3, quantity: [1, 1] }
]
```

- `itemId`: ID of the item to drop
- `chance`: Probability of dropping (0-1)
- `quantity`: Range of quantity [min, max]

## Character Configuration

Characters are defined in `js/gacha.js` in the `characterTemplates` array. To add or modify characters, edit this array.

Each character has properties like:

```javascript
{
    id: 'devin',
    name: 'Devin',
    rarity: 'common',
    sitSprite: 'img/devinsit.png',
    idleSprite: 'img/devinidle.png',
    runningSprite: 'img/devin.png',
    attackSprite: 'img/devinattack.png',
    rangedSprite: 'img/devinranged.png',
    magicSprite: 'img/devinmagic.png',
    baseStats: {
        strength: 1,
        agility: 1,
        vitality: 1,
        dexterity: 1,
        intelligence: 1,
        luck: 1
    },
    specialAbility: {
        name: 'Tech Surge',
        description: 'Increases all damage by 20% for 5 seconds',
        cooldown: 30,
        effect: {
            type: 'damage_multiplier',
            value: 1.2,
            duration: 5
        }
    }
}
```

## Dungeon Configuration

Dungeons are defined in `js/dungeons.js` in the `dungeons` array. Each dungeon has properties like:

```javascript
{
    id: 'cyber_slums',
    name: 'Cyber Slums',
    description: 'A dangerous area filled with street gangs and basic security bots.',
    difficulty: 1,
    backgroundImage: 'img/mainmap1.png',
    monsterTypes: ['slime', 'goblin'],
    recommendedLevel: 1,
    rewards: {
        copperMultiplier: 1,
        experienceMultiplier: 1
    }
}
```

To add or modify dungeons, edit this array.

## Gacha System Configuration

The gacha system is defined in `js/gacha.js`. The main configurations are:

### Gacha Pools

```javascript
gachaPools: {
    mortal: {
        name: 'Mortal DNA',
        cost: { type: 'copper', amount: 5000 },
        rates: { common: 0.70, uncommon: 0.25, rare: 0.04, legendary: 0.01 }
    },
    synthetic: {
        name: 'Synthetic DNA',
        cost: { type: 'silver', amount: 100 },
        rates: { common: 0.40, uncommon: 0.40, rare: 0.15, legendary: 0.05 }
    },
    divine: {
        name: 'Divine DNA',
        cost: { type: 'gold', amount: 50 },
        rates: { common: 0.10, uncommon: 0.30, rare: 0.40, legendary: 0.20 }
    }
}
```

- `cost`: Currency cost per pull
- `rates`: Probability of pulling each rarity tier

To modify the cost or rates, edit these values.
