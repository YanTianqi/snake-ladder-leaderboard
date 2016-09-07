import { Mongo } from 'meteor/mongo';
import { Meteor} from 'meteor/meteor';


export const Players = new Meteor.Collection("players");
export const Maps = new Meteor.Collection("maps");
export const GameStatus = new Meteor.Collection("gameStatus");

Meteor.methods ({
	'add_player': function(player_name) {
		existing_player = Players.find({}).count();
		game_status = GameStatus.find({}).fetch()[0];

        if (game_status) {
            game_started = game_status['game_started'];
        } else {
        	game_started = false;
        }


		if (existing_player > 3) {
			// the game does not accomodate more than 4 ppl
			return 'the game room is full.';
		} else if (game_started == true) {
			// new player is not allowed to join the game after the game is already started
			return 'game has already started';
		} else {
			Players.insert({
	            name : player_name,
	            score : 0,
	        });

	        return 'new player is added';
		}

        
	},

	'reset_game' : function() {
		// remove the map
        Maps.remove({});

        // remove the player list
        Players.remove({});

        // remove the game status
        GameStatus.remove({});

        return 'game has been reset';

	},
});