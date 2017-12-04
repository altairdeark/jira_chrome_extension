function loadOptions() {
  chrome.storage.sync.get({
    project: 'Sunshine',
    user: 'nyx.linden'
  }, function(items) {
    document.getElementById('project').value = items.project;
    document.getElementById('user').value = items.user;
  });
}

function buildJQLQuery() {
  var project = document.getElementById("project").value;
  var status = document.getElementById("statusSelect").value;
  var inStatusFor = document.getElementById("daysPast").value
  return `project=${project}+and+status=${status}+and+status+changed+to+${status}+before+-${inStatusFor}d`;
}

function displayFeedListResults(list) {
  var feedResultDiv = document.getElementById('query-result');
  if(list.childNodes.length > 0){
    feedResultDiv.innerHTML = list.outerHTML;
  } else {
    document.getElementById('status').innerHTML = 'There are no query results.';
    document.getElementById('status').hidden = false;
    feedResultDiv.innerHTML = '';
  }
  
  feedResultDiv.hidden = false;
}

function displayError(errorMessage) {
  document.getElementById('status').innerHTML = 'ERROR. ' + errorMessage;
  document.getElementById('status').hidden = false;
  document.getElementById('query-result').innerHTML = '';
}

// Utility 
function domify(str) {
  var dom = (new DOMParser()).parseFromString('<!doctype html><body>' + str,'text/html');
  return dom.body.textContent;
}

function htmlEncode(str) {
    var div = document.createElement('div');
    var text = document.createTextNode(str);
    div.appendChild(text);
    return div.innerHTML;
}

// Setup
document.addEventListener('DOMContentLoaded', function() {
  var jiraClient = JiraClient();
  
  // Make sure the project exists before we continue
  jiraClient.projects.get('SUN').then(function() {
    //load saved options
    loadOptions();

    // query click handler
    document.getElementById("query").onclick = function() {
      var daysPast = document.getElementById("daysPast").value;
      if(daysPast == undefined) return;

      var searchFields = ['id', 'status', 'key', 'assignee', 'summary'];
      var JQLQuery = buildJQLQuery();

      jiraClient.search.getWithJQL(JQLQuery, searchFields).then(function([url, response]) {
        document.getElementById('status').innerHTML = 'Query term: ' + url + '\n';
        document.getElementById('status').hidden = false;
        
        // render result
        var list = document.createElement('ul');
        var issues = response.issues;

        for (var i = 0; i < issues.length; i++) {
          var a = document.createElement('a');
          a.innerHTML = issues[i].key;
          a.href = issues[i].self;
          var html = htmlEncode(a.outerHTML) + " - " + issues[i].fields.summary;
          var item = document.createElement('li');
          item.innerHTML = domify(html);
          list.appendChild(item);
        }

        displayFeedListResults(list);
      }, function(errorMessage) {
        displayError(errorMessage);
      });
    };

    // activity feed click handler
    document.getElementById("feed").onclick = function() {   
      var user = document.getElementById("user").value;
      if(user == undefined) return;

      // get the xml feed
      jiraClient.activityStreams.get(user).then(function([url, xmlDoc]) {
        document.getElementById('status').innerHTML = 'Activity query: ' + url + '\n';
        document.getElementById('status').hidden = false;

        // render result
        var feed = xmlDoc.getElementsByTagName('feed');
        var entries = feed[0].getElementsByTagName("entry");
        var list = document.createElement('ul');

        for (var index = 0; index < entries.length; index++) {
          var html = entries[index].getElementsByTagName("title")[0].innerHTML;
          var updated = entries[index].getElementsByTagName("updated")[0].innerHTML;
          var item = document.createElement('li');
          item.innerHTML = new Date(updated).toLocaleString() + " - " + domify(html);
          list.appendChild(item);
        }

        displayFeedListResults(list);
      }, function(errorMessage) {
        displayError(errorMessage)
      });    
    };        

  }).catch(function(errorMessage) {
    displayError(errorMessage)
  });   
});
