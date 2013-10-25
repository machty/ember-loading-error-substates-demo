App = Ember.Application.create();

App.Router.map(function() {
  this.resource('github', { path: "/github/:username" }, function() {
  	this.route('repos', { path: "/" });
  	this.route('orgs');
  	this.route('nonsense');
  });
});

App.ApplicationRoute = Ember.Route.extend({
  actions: {
  	lookup: function(username) {
  	  this.transitionTo('github.repos', username);
  	}
  }
});

App.GithubRoute = Ember.Route.extend({
  model: function(params) {
  	return slowJSON('https://api.github.com/users/' + params.username);
  },
  serialize: function(user) {
  	return { username: user.login };
  }
});

App.GithubReposRoute = Ember.Route.extend({
  model: function(p, transition) {
  	var username = transition.params.username;
  	return slowJSON('https://api.github.com/users/' + username + '/repos');
  }
});

App.GithubOrgsRoute = Ember.Route.extend({
  model: function(p, transition) {
  	var username = transition.params.username;
  	return slowJSON('https://api.github.com/users/' + username + '/orgs');
  }
});

App.GithubNonsenseRoute = Ember.Route.extend({
  model: function() {
  	// Return a JSON query that's doomed to fail
  	return slowJSON('https://api.github.com/YOLO');
  }
});

// OMG security
var clientId = "926df2bab84886acc7c6";
var clientSecret = "3cedcd939aa233bd6dbacaacdf4d096f3b09d09d";

function slowJSON(url, delay) {
  url += "?client_id=" + clientId + "&client_secret=" + clientSecret;

  var deferred = Ember.RSVP.defer();

  // Note: Ember.run.later is probably what
  // you'd want to use here, but this works too.
  setTimeout(function() {
  	var stubbed = false;
  	if (stubbed) {
  		// in case internet's not working for the demo...
  		deferred.resolve(stubbedData(url));
  		return;
  	}
  	deferred.resolve($.getJSON(url));
  }, delay || 1000);

  return deferred.promise;
}

// Only using this if internet cuts out during the demo.
function stubbedData(url) {
	if (/repos/.exec(url)) {
		return [
			{
				html_url: "https://github.com/machty/emblem.js",
				name: "Emblem.js"
			},
			{
				html_url: "https://github.com/emberjs/ember.js",
				name: "Ember.js"
			}
		];
	} else if (/YOLO/.exec(url)) {
		return Ember.RSVP.reject({ statusText: "#YOLOSWAG ERROR" });
	} else if (/orgs/.exec(url)) {
		return [
			{
				avatar_url: "https://2.gravatar.com/avatar/792333d2bad390e8a2e23f5e2f41f214?d=https%3A%2F%2Fidenticons.github.com%2Ff8d48ba4cfebb16ac5dbe2b404b30e84.png&r=x",
				login: "Ember"
			},
			{
				avatar_url: "https://2.gravatar.com/avatar/792333d2bad390e8a2e23f5e2f41f214?d=https%3A%2F%2Fidenticons.github.com%2Ff8d48ba4cfebb16ac5dbe2b404b30e84.png&r=x",
				login: "Emblem"
			}
		];
	} else {
		return {
			login: "machty"
		};
	}
}
