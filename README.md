#MaxVote
This web application is my recreation of https://votingapp.herokuapp.com/, while following
the FreeCodeCamp curriculum. It is a multi-page AngularJS-based web application.

###Tools
  * AngularJS
  * NodeJS
  * ExpressJS
  * Sass
  * Jade
  * MongoDB

##Change Log
###Nov.15, 2015
  * Initial skeleton project created.
  * Added home page markup, styling, and basic Angular functionality.

###Nov.16, 2015
  * Finished Angular view control functionality
  * Implemented markup and styling for each page (except polling)
  * Messed around with window.history to manage page history

###Nov.17, 2015
  * Pivoted away from single-page app to a multi-page app
  * Fixed Express routing
  * Included markup and styling for each file (page)

###Nov. 18, 2015
  * Modulated navbar for views
  * Trimmed file architecture
  * Documented and cleaned back-end code
  * Added Angular controller skeletons for each view and a data factory

###Nov. 21, 2015
  * Implemented cookies for navbar
  * Added jQuery functions to each views' buttons

###Nov. 22, 2015
  * Finished dashboard markup and styling
  * Added Angular and jQuery functionality for newpoll, looks nice

###Nov. 23, 2015
  * Finished dashboard view functionality, including saved polls
  * Used Plotly.js for poll pie charts - not fan of forced plotly toolbar, but I get it

###Nov. 24, 2015
  * Pivoted charting library to Google Charts. I decided I didn't like the plotly toolbar
  * Tested express-sessions, ran into trouble

###Nov. 29 - 30, 2015
  * Implemented mongoDB GET functionality for user and poll data in the client-side
  * Implemented mongoDB POST functionality for user signup
  * Formatted JSON data
  * Server-side presented to the client via AngularJS ngInit in the markup
  * Added form validation for signup and login views
  * Cleaned up some code and added some documentation

###Dec. 1, 2015
  * Integrated mongoDB session store
  * cleaned NPM
  * fixed UI input submitting and angular ngModels

###Dec. 25, 2015
  * Fixed Google Chart display
  * Began adding Passport middleware for authentication

###Dec. 26, 2015
  * Finished Twitter Sign-in

###Dec. 28, 2015
  * Removed local authentication and associated views, collections, code, etc.
  * Updated SignUp and Login views
  * Finished Twitter login persistence, user database creation, and one-to-many mongo scheme
  * Fixed server to client data transmission for user and poll information

##To Do
  * Save Poll (POST -> query for authenticated user -> append polls -> refresh page)
  * Remove Poll (POST -> query for authenticated user -> find poll -> pop poll)
  * Tweet poll to user's twitter statuses
  * Allow unauthorized user to vote on shared poll
  * Heroku nosql database
  * Heroku deployment
