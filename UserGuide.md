====================
Anonymous toggle
====================

The anonymous toggle is a plugin with backend support that allows users to mark posts as anonymous to hide their usernames when creating a post.

## Installing
Run the following commands:
npm install
./nodebb activate nodebb-plugin-anon-toggle
./nodebb build

This should activate and build the frontend toggle and anonymizing features.
Run ./nodebb start to see the toggle

### Usage
When drafting a post, a toggle labeled “Post anonymously” should appear. Check this toggle to make the post anonymous when posting. 

An anonymous post does not show the user attached to it, hiding the username, profile picture, and profile of who made it.

### Testing
Backend tests can be found in test/topics.js and test/posts.js under the description ‘anonymous’
Tests specific to the anonymous field can be run with either command:
- mocha --grep "anonymous" test/topics.js
- npm test -- --grep "anonymous" test/topics.js
and either command
- mocha --grep "anonymous" test/posts.js
- npm test -- --grep "anonymous" test/posts.js
These backend tests mock posting an anonymous new topic (‘should correctly attach anonymous field to topic object upon topic post’ in test/topics.js) and making an anonymous reply to a topic ('should correctly attach anonymous field to topic object upon topic reply' in test/topics.js), checking if the anonymous field was correctly stored through asserting that the response contains the anonymous field set to true. The rest of the backend tests (‘should return anonymous field’ and ‘should return anonymous field if requesting uid’ in test/topics.js and test/posts.js) then test the getter methods for getting topic and post data, ensuring that when post data or topic data is requested, the anonymous field is correctly returned if attached to the post or topic object. This properly tests the backend, as it ensures that when the frontend sends an anonymous post through topic creation or replying with the anonymous field set to true, the anonymous field will be stored and returned for the object appropriately. 

Frontend tests for the plugin can be found in test/anonymous.js
They can be run with either command:
- mocha test/anonymous.js
- npm test -- test/anonymous.js
The ‘anonymizing topics and posts’ tests test the helper functions used in scrubbing user data to anonymize posts and topics, making sure that they hide the uid of the poster appropriately. The ‘anonymous toggle’ tests ensure that the toggle component itself is rendered properly by mocking a composer to inject the toggle into (‘should inject toggle’), and also tests whether the anonymous field is correctly sent in the payload depending on whether the toggle is checked or not (‘should set anonymous=true when toggle is checked’ and ‘should set anonymous=false when toggle is not checked’). These properly test the frontend, as it ensures that the anonymous toggle is mounted and correctly sends data to the backend on whether the user wants their post to be anonymous or not. 

All tests can be run with npm test

====================
Answered/Unanswered Topics
====================

Topics can be marked as questions by admins or owners of the topic, and then toggled between answered and unanswered states. Badges will appear to notify users if the question has been answered or not.

### Usage
In order to use this feature you have to be an admin or the owner of the topic. The steps are
create a topic. 
Open the topic tools menu. 
Click “Mark as Question” to mark the topic as a question
Once marked, two options are available “Mark as Answered” and “Mark as Unanswered”
Selecting either will update the badge displayed near the topic header
Clicking “Unmark as Question” will remove the question status and remove the badge.

### Automated Tests
Backend tests can be found in test/topics.js under the describe(‘question/answered state’) block. These tests cover
1. Default state of answer and notAnswered
2. markAnswered sets answered to 1 and notAnswered to 0
3. markUnanswered does the opposite
4. unmarkAsQuestion clears both fields back to 0
5. Non-owners or non-admins cannot set any of these states
Frontend tests can be found in test/topics/answered-template.js. These tests cover the conditional rendering logic for the badges verifying that the hidden class is correctly applied and is removed based on the topic state
The backend tests cover all state transitions and permission checks and the frontend tests verifies the template rendering logic is correctly wired to the data. With both of these tests they cover the full usage of the answered feature from the API call that changes the state, to the badge that the user sees. 

====================
Topic search feature 
====================

Search bar for topics that allow topics in a category to be conveniently filtered by the search query

## Installing
Run the following commands:
./nodebb build
./nodebb setup

This should activate and build the topic search.
Run ./nodebb start to see the topic search bar

### Usage
When opening a category, next to the “New Topic” button there is a search bar. Click the search bar and type the question you are searching for to filter the shown topics by your search query. 

### Testing
Tests exist in test/category-search.js under the describe('Category Search Filter') block. They can be specifically run using either command:
- mocha test/category-search.js
- npm test -- test/category-search.js
These tests cover the array-filtering logic representing the client-side search behavior, verifying that:
1. It returns only the exact matching topics ignoring case sensitivity when a partial query string is provided
2. It does not filter anything (returns the original topic array) if the search query is empty
3. It returns an empty array if no topic titles match the query string Because this feature modifies client-side DOM layout using jQuery, these tests serve as targeted sanity tests, verifying that the core matching and filtering algorithms the frontend relies on map correctly to finding topic strings.

All tests can be run with npm run test