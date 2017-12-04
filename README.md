# JIRA Chrome extension
A chrome extension that queries a public JIRA API (https://jira.secondlife.com).  

## Files:
* main.js - the :meat_on_bone: of the code that performs querys and displays results
* JiraClient.js - An API wrapper to simplify interactions with the Jira API
* main.html - The UI for the request results
* manifest.json - contains metadata for the project and defines access permissions
* options.js - contains logic for saving/retrieving user values
* options.html - display for the user values
* json_results/results.json - a sample of the json values returned from a JIRA ticket(s) query

## Tips
* [Installing a local chrome extension](https://developer.chrome.com/extensions/getstarted#unpacked)
