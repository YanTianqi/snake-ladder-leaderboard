import { Random } from 'meteor/random';
import { Meteor} from 'meteor/meteor';

import { Players } from '../api/data_collections.js';
import { Maps } from '../api/data_collections.js';
import { GameStatus } from '../api/data_collections.js';


function move_the_piece(playerID, score){
	// find whether fall into snake or ladder
    new_score = check_snake_ladder(score);

    // find whether clash with other players
    compare_other_player(playerID, new_score);

    return;
};

function check_snake_ladder(score) {
    // check whether the player fell into any snake and ladder;

    map = Maps.find().fetch()[0];

    //check snake, if so, send to the end of snake
    for (i=0; i<map['snake'].length; i++) {
        if (map['snake'][i]['start'] == score) {
            return map['snake'][i]['end'];
        }
    }

    //check ladderm if so, send to the end of ladder
    for (i=0; i<map['ladder'].length; i++) {
        if (map['ladder'][i]['start'] == score) {
            return map['ladder'][i]['end'];
        }
    }

    // neither snake nor ladder, return original score
    return score;
};

function compare_other_player(playerID, score) {
	// see whether the user fell into the same area with the other player, if so, settle the dispute
        players = Players.find({ name : { $ne:playerID } }).fetch();
        for (i = 0; i < players.length; i++) {
            if ( players[i]['score'] == score) {
                player1 = playerID;
                player2 = players[i]['name'];

                settle_score_dispute(player1, player2, score);
                return;
            }
        }
        // no duplicate score, update the score in the database
        update_player_score(playerID, score)
        return;
};

function settle_score_dispute(player1, player2, score) {
    // when the two players have fell into the same location, both of them decide the winner based another round of dice
    player1_dice = dice_simulator();
    player2_dice = dice_simulator();

    if ( player1_dice > player2_dice ) {
        // player2 moves back one step, keep player1, player2 starts the recursive step
        update_player_score(player1, score);
        move_the_piece(player2, score-1);

        return;
    } else if ( player1_dice < player2_dice) {
        // player1 moves back one step, keep player2, player1 starts the recursive step
        move_the_piece(player1, score-1);

        return;
    } else {
        // get a draw, restart the process
        settle_score_dispute(player1, player2, score);
        return;
    }
};

function update_player_score(playerID, new_score) {
	// when the user went beyond the destination, stop at the destination;
	if (new_score > 100) {
		new_score = 100;
	}
	if (new_score == 100) {
		console.log('we got a winner: '+playerID);
		GameStatus.update({}, { $set : { winner : playerID , game_finished : true }});
	}
    Players.update({ name : playerID },{ $set : { score : new_score } });
    return 'new score has been updated';
};

function update_game_status() {
    game_status = GameStatus.find().fetch()[0];
    player_list = game_status['players'];
    current_player = game_status['current_turn'];

    //console.log(current_player);

    current_player_index = player_list.indexOf(current_player);
    if ( current_player_index + 1 == player_list.length ){
        next_turn = 0;
    } else {
        next_turn = current_player_index + 1;
    }

    next_turn_player = player_list[next_turn];

    GameStatus.update({}, { $set: { current_turn : next_turn_player } });
};

function generate_map() {
	// snake and ladder should not be too long, maximum 10

    var map = _.range(2,100);
    // generate 5 snakes
    snake = [];
    for (i = 0; i < 5; i++) { 
        start = Random.choice(map);
        if (start > 10) {
            length = Random.choice(_.range(5, 11));
        } else {
            length = Random.choice(_.range(5, start));
        }
        end = start - length;

        snake.push({'start':start, 'end':end});

        // remove the start point to avoid duplicate snake/ladder
        map.splice(map.indexOf(start), 1);
    }

    // generate 5 ladders
    ladder = [];
    // avoid having ladder after 90
    function ladder_filter(value) {
        return value < 90;
    }
    map = map.filter(ladder_filter);

    for (i = 0; i < 5; i++) { 
        start = Random.choice(map);
        length = Random.choice(_.range(5, 11));
        end = start + length;

        ladder.push({'start':start, 'end':end});

        // remove the start point to avoid duplicate snake/ladder
        map.splice(map.indexOf(start), 1);
    }

    // update the map into database
    Maps.insert({
        snake : snake,
        ladder : ladder,
    })
};

function dice_simulator() {
	var score = Random.choice([1,2,3,4,5,6]);
	return score;
};

Meteor.methods({
    'move_the_piece': move_the_piece,

    'check_snake_ladder': check_snake_ladder,

    'compare_other_player': compare_other_player,

    'settle_score_dispute': settle_score_dispute,

    'update_player_score': update_player_score,

    'update_game_status': update_game_status,

    'generate_map': generate_map,

    'dice_simulator': dice_simulator,

});

