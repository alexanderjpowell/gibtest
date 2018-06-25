// Before running you will need to install express and twitter via npm
// to get it running on localhost use ngrok to connect to twilio:
//  	run "ngrok http 1337" in one terminal window
//   	enter the forwarding url (https) into twilio dashboard of verified number - this will be changed to Digital Ocean or AWS server upon deployment
//  	run "node twitter.js"

const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const Twitter = require('twitter');
const config = require('./config.json'); // Contains Twitter API authentication credentials

const app = express();

defaultMessage = '{some default text}'; // Change this before deployment

function getLatestTweet() {
	// Set up auth tokens - ideally these should be read from a config file or environment variables
	var client = new Twitter({
		consumer_key: config.consumer_key,
		consumer_secret: config.consumer_secret,
		access_token_key: config.access_token_key,
		access_token_secret: config.access_token_secret
	});
	// Set up API parameters
	var params = {screen_name: 'gibraltarborder', count: 1};
	// Make request and return result
	client.get('statuses/user_timeline', params, function(error, data) {
		if (!error) {
			//var obj = JSON.parse('{"text": true, "count": 5}');
			console.log('Tweet Text: ' + data[0]['text']);

			var tweetText = data[0]['text'];
			tweetText = tweetText.substr(0, tweetText.indexOf('@')).toLowerCase(); // Everything up until the first @ sign and convert to lower case
			var output;
			if (tweetText.includes('no q')) {
				output = '0mins ' + defaultMessage;
			} else if (tweetText.includes('hour')) {
				output = '>1hr Q ' + defaultMessage;
			} else { // Only three options 
				output = tweetText.substr(6) + 'out ' + defaultMessage;
			}

			console.log('Response Text: ' + output);

			//const app = express();
			app.post('/sms', (req, res) => {
				const twiml = new MessagingResponse();
				//twiml.message('This is a response from text input');
				twiml.message(output);
				res.writeHead(200, {'Content-Type': 'text/xml'});
				res.end(twiml.toString());
			});
		}
		else {
			console.log('Error getting latest queue time');
		}
	});
}

http.createServer(app).listen(1337, () => {
	console.log('Express server listening on port 1337');
});

getLatestTweet();