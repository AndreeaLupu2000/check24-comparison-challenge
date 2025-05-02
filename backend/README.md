## Project Structure

This project will follow the follwing repository structure to ensure a seamless coding experience. 

```
batch23-dr-sasse
├── README.md
├── frontend
│   ├── node_modules                            Installed node modules
│   └── src
│       ├── assets                              Assets such as images & logos
│       ├── api                                 Defines API calls to the backend
│       ├── components                          Individual components for main views
│       ├── context                             Contexts for sharing global states
│       ├── hooks                               Logic for the implementation heavy components
│       ├── services                            Web services for the frontend (E.g. local storage)
│       ├── types                               DataTransferObjects (DTOs) for server communication
│       └── views                               Main views for desktop and mobile 
├── backend
│   ├── node_modules                            Installed node modules
│   └── src
│       ├── config                              Configuration files for authentication
│       ├── controllers                         Implementation of controllers 
│       ├── middleware                          Handling of errors, logging, and authentication
│       ├── models                              Data models & schemas
│       ├── routes                              Individual routes 
│       └── server.ts                           Entry point
