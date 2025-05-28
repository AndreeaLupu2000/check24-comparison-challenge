### CHECK24 GenDev Internet Provider Comparison Challenge


**Link to deployed version:** https://check24-comparison-challenge-frontend.onrender.com/

**Test Username:** test@gmail.com

**Test Password:** test

**Live Demo:**

## Project Structure

```
check24-comparison-challenge
├── README.md
├── client
│   ├── node_modules           Installed node modules (do not touch)
│   └── src
|       ├── api                Defines API calls to the backend
│       ├── assets             Assets such as images & logos
│       ├── components         Individual components for main views
│       ├── context            Contexts for sharing global states
│       ├── types              DataTransferObjects (DTOs) for server communication
│       └── views              Login, Sign Up, Search and Shared View
|
|
└── server
    ├── node_modules           Installed node modules
    └── src
        ├── adapters           Special Processing of each of the provider
        ├── config             Configuration files for database and authentication
        ├── controllers        Implementation of controllers for user, user-address relation, shares and a general offer model
        ├── models             Data models & schemas
        ├── routes             Individual routes for users, user-address relations, offers and shares
        └── server.ts          Contains Express.js app and sockets
```


## Minimum Requirements

**1. Robust API Failure Handling**

   - Centralized Error Handling
   
      - A custom error-handling middleware is used in the backend (server.ts) to manage unexpected failures.
      - All routes and controllers follow a structured error format for easier client-side interpretation.

   - Provider Isolation Using try-catch

      - Every provider adapter (e.g., webwunderAdapter.ts, pingperfectAdapter.ts, etc.) uses try-catch blocks to: 
         - Prevent one provider's failure from affecting the others.
         - Return empty or fallback results in case of API issues.

   - SSE-Based Streaming Mechanism

      - A  dedicated route `/offers/stream` in offerController.ts handles streaming.
      - Upon receiving a valid address query, the server opens an SSE connection and starts fetching offers from all five providers in parallel.
      - Each offer is streamed to the frontend immediately upon availability using `res.write()` with SSE formatting.
      - The React frontend uses the EventSource API to listen to the stream.
      - Offers are rendered progressively, meaning users see available options without having to wait for all providers to respond.
      - Loading indicators, `isStreaming`, and error states are updated in real time.
      - Late-arriving offers are appended seamlessly.
      - The UI remains responsive and informative even when one or more providers fail.

   - Aggregation with Promise.allSettled

      - offerController.ts uses Promise.allSettled to query all five providers in parallel:
      - This ensures partial results are always returned, even when one or more providers fail.
      - Each result is evaluated for `status === 'fulfilled'` before being included in the response.
      - Rejected promises do not block the full response.

   - Retry Mechanism

      - Retry failed requests with delay.
      - Reduce the chance of transient network failures breaking the result.
      - Example usage within adapters includes up to 3 retries with a static delay or backoff.

   - Result Consistency

      - All successful offers, even when some providers fail or timeout
      - Implicit fallback for missing providers (empty array if not available).
      - The backend avoids throwing global errors unless all providers fail (this could be enhanced).

**2. Sorting & Filtering Options**

   - Users can sort offers by:

     - Price (ascending/descending)
     - Speed (ascending/descending)

   - Advanced filtering options include:
     
     - Maximum price
     - Minimum speed
     - Contract duration
     - Specific provider

**3. Share Link** 

   - The share button allows the user to share the listed offers on Whatsapp, also to persons that are not users of the application yet. 
   - To enable the sharable link to be accessible also when the providers are down, a database for shares was created, and stores the shares offers in an array, every element being stored as a JSON.
   - When the link is access initially, the offers are first retrieved from the database and displayed in the Share view.
   - When a third party receives a shared link, he can also searches for new offers, without an account.
   - For the share button, there are two possibilities:
      - To share all the offers.
      - To share only the filtered ones.

4. Secure Handling of Provider Credentials and API Keys

   - The backend credential configuration for the providers are done in the `\config`.
   - The API Keys are kept in the env files and never accessed directly in the code.
   - In the deployed version they are stored in the Environment Variables and accessed from there.
   - In the frontend, no API for the provider or the database is used. All the requests are sent to the backend and the backend handles everything.
   - The only request made in the frontend are for address validation and suggestion. As for the providers, the API key to Google Cloud is stored in the `.env` file.

## Optional Features

**1. Address autocompletion**

   - Implemented using Google Cloud Geocoding API for accurate address suggestions.
   - Real-time address suggestion as users type.
   - The suggestions are implemented to work only for addresses from Germany.
   - Overpass API is being used to fetch street names for a given postal code area in Germany.

**2. User Input Validation**

   - Comprehensive form validation for all user inputs

      - Validation for sign up (for Email and Password)
      - Validation for log in (for Email and Password)
      - Correct email format
      - Missing input fields (for Log in, Sign up and Search)

   - Real-time feedback on input errors.
   - Address format validation using Google Maps API.
      - Differentiating between non-existing addresses and wrong combination for the input.
   - Password encryption for Login and Sign up using `bycrypt`.

**3. Session Persistence**

   - Is a plus feature for users that have an account.
   - Stores the searched address of each user in a database.
   - Persistent storage of user's last search parameters.
   - Automatic restoration of search results on page reload.
   - Caching of recent searches for quick access.

## Deployment 

- The backend and frontend are deployed separately.
- Render has been used, the free tier.
- Sometime it takes a moment to start the server.

## User Story Map

- The user opens the app.
- If it has an account, it logs in into the app with his email and password.
- If it doesn't have an account, it can creates one using the Sign Up button, then it logs in.
- The user arrives at the main view, the search view.
- It enter the PLZ first, so that cities and PLZ are suggested while he is typing.
- Based on these, when the user starts typing the street, a dropdown will suggest, streets matching the typed input.
- After completing also the house number, the user presses start.
- As soon as the offers arrive, they are displayed in the UI.
- The share button is activated once all the offers are loaded.
- The user can scroll and see the available offers.
- He can also press on each offer to see more details about it.
- For sharing the offers, the user needs to press the Share button and choose between sending all the generated offers or hte filtered ones in case some filters are set.
- The WhatsApp redirection page is opened.
- If the user has the app installed, it directly open the app and allows the user to search, who wants to share the link with.

## Local Testing

1. Clone the repository.
2. Contact me at (alupu4884@gmail.com or andreea.lupu@tum.de) for receiving the Google Cloud API keys and the Appwrite keys. ( I will try to add them also on the application page for the challenge.)
3. Go to backend and run `npm i` in the root of the backend folder in the Terminal.
4. Create an `.env` file in the root of the backend folder and paste the received content for backend environment variables.
5. In the root of the backend folder run `npm run start-local` to start locally the application.
6. Go to frontend and run `npm i` in the root of the frontend folder in the Terminal.
7. Create an `.env` file in the root of the frontend folder  and paste the received content for frontend environment variables.
8. In the root of the frontend folder run `npm run dev` to start locally the application.

