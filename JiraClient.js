/**
 * JiraClient is an API wrapper to simplify interactions 
 * with the Jira API. This is by no means an exhaustive wrapper,
 * but simply wraps the limited functionality needed in the 
 * Second Life Ticket Browser.
 * 
 * It may be later extended to include all REST functionality. 
 * The non-REST (activity) functionality may also be split into 
 * it's own client if preferred.
 */
var JiraClient = function(options) {
  var config = {
    clientName: 'JIRA API Client',
    baseUrl : 'https://jira.secondlife.com/',
    restApiPath : 'rest/api/',
    restApiVersion : '2',
    maxResults : "50"
  };

  var activityStreams = {
    get: function (username) {
      var params = {
        streams: `user+IS+${username}`,
        providers: `issues`
      };
      var promise = _makeRequest(_buildStreamUrl('activity', params));
      return promise;
    }
    // Add additional put, post, delete functionality here
  };
  
  var projects = {
    get: async function (projectName) {
      var promise = _makeRequest(_buildRestUrl('project', projectName), "json");
      return await promise;
    }
  };
  
  var search = {
    getWithJQL: function (query, fields) {
      var params = {
        jql: query,
        fields: fields.join()
      };
      var promise = _makeRequest(_buildRestUrl('search', null, params), "json");
      return promise;
    }
  };

  var _buildRestUrl = function (collection, object, params) {
    var url = config.baseUrl + config.restApiPath + config.restApiVersion + '/' + collection
              + (object != undefined ? '/' + object : '') 
              + `?maxresults=${config.maxResults}`;
    for(key in params) {
      url += `&${key}=${params[key]}`
    }
    return url;
  };
  
  var _buildStreamUrl = function (collection, params) {
    var url = config.baseUrl + collection
              + `?maxResults=${config.maxResults}`;
    for(key in params) {
      url += `&${key}=${params[key]}`
    }
    return url;
  };

  var _makeRequest = function (url, responseType = "") {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('GET', url);
      req.responseType = responseType;

      req.onload = function() {
        var response = responseType ? req.response : req.responseXML;
        if(response && response.errorMessages && response.errorMessages.length > 0) {
          reject(response.errorMessages[0]);
          return;
        }
        resolve([url, response]);
      };

      // Handle network errors
      req.onerror = function() {
        reject(Error("Network Error"));
      }
      req.onreadystatechange = function() { 
        if(req.readyState == 4 && req.status == 401) { 
            reject("You must be logged in to JIRA to see this project.");
        }
      }

      // Make the request
      req.send();
    });
  }

  return {
    search: search,
    activityStreams: activityStreams,
    projects: projects,
  };
};