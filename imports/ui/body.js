import { Template } from 'meteor/templating';
import { Random } from 'meteor/random';
import { Meteor} from 'meteor/meteor';
import { Session } from 'meteor/session'

import { Players } from '../api/data_collections.js';
import { Maps } from '../api/data_collections.js';
import { GameStatus } from '../api/data_collections.js';

import '../api/game_rule.js';
import './body.html'



Template.playerList.helpers({
    players() {
        // Otherwise, return all of the tasks
        return Players.find({}, { sort: { createdAt: -1 } }).fetch();
    },
    game_status() {
        return GameStatus.find({}).fetch()[0];
    },
    dice_number() {
        return Session.get('dice_number');
    }

});

Template.map.helpers({
    gameOn() {
        game_status = GameStatus.find({}).fetch()[0];
        if (game_status) {
            return game_status['game_started'];
        }
    },
    
    snake() {
        map = Maps.find({}, { fields : { snake : 1 }}).fetch()[0];
        if (map) {
            return map['snake'];
        }
    },

    ladder() {
        map = Maps.find({}, { fields : { ladder : 1 }}).fetch()[0];
        if (map) {
            return map['ladder'];
        }
    },
});


Template.leaderboard.events({
    'submit .new-player'(event) {
        const target = event.target;
        const text = target.text.value;

        Meteor.call('add_player', text, function (error, result){
            console.log(result);
        });
    },
});

Template.playerList.events({
    
	'click .dice'()  {
        // find current turn
        game_status = GameStatus.find({}, { fields : { current_turn : 1 , game_finished : 1}}).fetch()[0];
        game_finished = game_status['game_finished'];

        // the button is disabled when the game is finished
        if ( game_finished == false ) {
            playerId = game_status['current_turn'];
            //console.log(playerId);

            // generate random dice score
             Meteor.call('dice_simulator',function (error, result){
                var dice_score = result;
                Session.set({dice_number : dice_score});

                //dice_score = Random.choice([1,2,3,4,5,6]);
                var temp_score = Players.find({ name : playerId }, { fields : { score : 1 }}).fetch()[0]['score'];
                score = dice_score + temp_score;

                // start the move
                Meteor.call('move_the_piece', playerId, score);
                
                // finish the round, check ending condition, and update game status
                Meteor.call('update_game_status');
            });
        }

	},

    'click .restart_game'() {
        Meteor.call('reset_game', function (error, result){
            console.log(result);
        });
        
    },

    'click .start_game'() {
        if ( Players.find().count() < 2 ) {
            console.log('need more player to play the game');
        } else {
            // generate the game map
            Meteor.call('generate_map');

            // set the game status
            player_list = Players.find({}, { fields : { name : 1 }}, { sort: { createdAt: -1 } }).fetch();
            new_player_list = []
            for (i=0; i<player_list.length; i++) {
                new_player_list.push(player_list[i]['name']);
            }
            GameStatus.insert({
                players : new_player_list,
                current_turn: new_player_list[0],
                game_started: true,
                game_finished: false,
            });
            console.log('game is ready');
        }        
    },
});








