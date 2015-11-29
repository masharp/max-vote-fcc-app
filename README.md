#MaxVote
This web application is my recreation of https://votingapp.herokuapp.com/, while following
the FreeCodeCamp curriculum. It is a multi-page AngularJS-based web application.

###Tools
  * AngularJS
  * NodeJS
  * ExpressJS
  * SASS
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

###Nov.23, 2015
  * Finished dashboard view functionality, including saved polls
  * Used Plotly.js for poll pie charts - not fan of forced plotly toolbar, but I get it

###Nov.23, 2015
  * Pivoted charting library to Google Charts. I decided I didn't like the plotly toolbar
  * Tested express-sessions, ran into trouble

##To Do
  * mongodb sockets in use?
  * express-sessions sessions store
  * Authentication (oAuth, local, twitter)
  * Add database (MongoDB or PostgreSQL?)
  * Heroku
  * Connect app to twitter api for login and tweets
