# snake-ladder-leaderboard
meteor practice for NUS BT3103

Author : Tianqi Yan

Tested on Chrome

Requirements: Meteor add session

Instructions:

please follow the sequence of steps

1. Add player (maximum 4)

2. Click Start Game! (a random map will be generated, the dice button will be activated)

3. Players roll dice on his own turn

4. The game stop when one player reaches 100

5. To restart the game, click New Game, players and map will be reset

6. repeat from step 1 for another round of game


Rules:

1. Players roll dice based on their order joining the game, the first player will go first

2. 5 snakes and 5 ladders are automatically generated, each with minimum length of 5, maximum length of 10 (this does not apply to the snake starting within 5)

3. When a player falls into a postion with another player, the 2 player will have another round of dice duel. The one with bigger result stays in the position, and the loser will move back one step, snake and ladder still applies in this scenario.

4. Even when a player goes beyond 100, he is considered as reaching the destination, and hence finishes the game.

5. The game needs minimum 2 person and maximum 4 persons to play. Games will not proceed when this condition is not fulfilled, the dice button will be disabled.

6. After a game has already started, no new users can join the game. The player entry field will be disabled.

7. No duplicate user names are allowed

>>>>>>>>>>>>>>>>>>>>>

For more information on the structure:

Logic in game creation:

1. dice simulator

2. map generator

Logic in game process:

1. move the user from one postion to the destination, involving the following logics (recursive method)

2. move along snake/ladder

3. settle dispute when two players fell into the same step


Data collection

1. players: include player name and score

2. maps: including the starting and ending point of each snake/ladder

3. gameStatus: including the player sequence, current player turn and final winner, as well as the flag of whether game has started and finished


> Enjoy the game >>>>>>>
