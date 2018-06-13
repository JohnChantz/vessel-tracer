# vessel-tracer
##### An online application that allows the user to track the position of vessels at sea as well as track the route they have followed
* Backend
  * NodeJS server with expressjs
* Database
  * MongoDB server, used to stream a dataset of AIS messages to the server
  * Mongoose for server - database connectivity
* Webscokets
  * Socket.io for server - client comunication
* Maps
  * LeafletJS with plugins
