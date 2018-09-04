require('colors');


exports.action = function(data, callback){
	
	var tblActions = {
		test: function() {
			TvAction('Tu recherches quoi?|Qu\'est ce que je peux faire pour toi ?', client);	
		},
	};
	
	
	info("Test command:", data.action.command.yellow, "From:", data.client.yellow);
	tblActions[data.action.command]();
	
	callback();
}





function TvAction(tts, client) {
	
	
	Avatar.askme (tts, client,
	{
		"*" : "choice",
		"terminer" : "cancel",
		"non c'est bon" : "cancel",
		"merci sarah" : "cancel"
	}, 0, function (answer, end) {
		
		// Pas de réponse...
		// On boucle sur la fonction
		if (!answer) {
			end(client);
			return TvAction("je n'ai pas compris, recommence", client);
		}
		
		
		// Si réponse
		if (answer.indexOf('choice') != -1) {
			end(client);
			
			var choice = answer.split(':')[1];
			var found;
			
			info('Choice', choice.yellow);
			
			
			// un choix possible...
			// Il faut dire "test" dans la phrase...
			if (choice.toLowerCase().indexOf("test") != -1) {
				// Si choix alors on exécute la fonction suivante
				return byChannel(client);
			}
			
			// Si pas un choix correct
			// On boucle sur la fonction
			return TvAction("je n'ai pas compris, recommence", client);
			
		}
		
		// Si "terminé" ou "non c'est bon"
		return Avatar.speak("d'accord|Terminé", client, function () {
			end(client, true);
		});
	});
	
}


function byChannel(client) {
	
	// Une fonction intermediaire pour faire d'autres choses...
	// Et si ca ne va pas, on peut revenir en arrière
	// if (quelque chose n'est pas bon)
	//	return TvAction('Je n\'ai pas trouvé. Autre chose ?', client);

	program_list(tts, client);
	
}



function program_list(tts, client) {
	
	 
	tts = (!tts) ? "Qu'est ce que tu veux comme test ?" : tts;
	
	
	Avatar.askme (tts, client, 
	{
		"qu'est ce que je peux dire" : "sommaire",
		"a gauche" : "previousprog",
		"a droite" : "nextprog",
		"merci sarah" : "Sarahcancel",
		"terminer" : "cancel"
	}
	, 0, function (answer, end) {
		switch (answer) {
			case 'sommaire':
				// On peut lister les commandes du askme
				end(client);
				Avatar.speak("Tu peux dire: a gauche, a droite, merci sarah ou terminé.", client, function() { 
					// On boucle sur le askme avec un autre tts
					program_list("Autre chose ?", client);
				});	
				break;
			case 'previousprog':
				end(client);
				
				// Appel de la fonction du 2ème askme avec un paramètre "en arrière"...
				getPrevNextProgram ('prev', client, true, function () { 
					// callback passé à la fonction pour retour a program_list
					program_list("Autre chose ?", client);
				});
				
				break;
			case 'nextprog':
				end(client);
				
				// Appel de la fonction du 2ème askme avec un paramètre "en avant"...
				getPrevNextProgram ('next', client, true, function () { 
					// callback passé à la fonction pour retour a program_list
					program_list("Autre chose ?", client);
				});	
				
				break;
			case 'cancel':
			default:
				
				// termine l'action...
				Avatar.speak("D'accord|Terminé", client, function() { 
					end(client, true);
				});	
				break;
		}
	});
	
}



// Le paramètre callback est a appeler lorsque ce askme est fini
// Pour réexécuter program_list
function getPrevNextProgram (sens, client, flagtts, callback) {
	
	var tts = " ";
	if (flagtts)
		tts = (sens == 'prev') ? "A gauche" : "A droite";	
	
		
	Avatar.askme (tts, client, 
	{
		"a droite" : "next",
		"a gauche" : "previous",
		"non merci" : "done",
		"terminer" : "done",
		"retour" : "done"
	}
	, 0, function (answer, end) {
		switch (answer) {
			case 'previous':
				end(client);
				
				// On boucle sur le 2ème Askme
				getPrevNextProgram ('prev', client, true, callback);
					
				break;
			case 'next':
				end(client);
				
				// On boucle sur le 2ème Askme
				getPrevNextProgram ('next', client, true, callback);
				
			break;	
			default:
			case 'done' : 
				end(client);
				
				// terminer alors on exécute le callback qui est le retour a la fonction program_list
				callback();
				break;
		}
	});
			
		
}


