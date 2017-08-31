# Todone

A smart app that allows users to add and track their tasks. This app is full-stack. It is intended for people to use on a leisure basis. The app will use naive bayes supervised learning method to automatically classify the task created into a task of a particular class: eat, watch, buy, and read. Should mis-classification happens, the user can mannually change the class and the the naive bayes model will learn from this mistake.

## Technologies Used
* Express
* JSX
* Knex
* PSQL
* Machine learning
* Naive bayes
* Supervised machine learning
* SCSS
* Bootstrap
* jQuery

## Project Setup

1. Clone the repo

## Getting Started

1. Create the `.env` by using `.env.example` as a reference: `cp .env.example .env`
2. Update the .env file with your correct local information
3. Install dependencies: `npm i`
4. Fix to binaries for sass: `npm rebuild node-sass`
5. Run migrations: `npm run knex migrate:latest`
  - Check the migrations folder to see what gets created in the DB
6. Run the seed: `npm run knex seed:run`
  - Check the seeds file to see what gets seeded in the DB
7. Run the server: `npm run local`
8. Visit `http://localhost:8080/`

## User Experience

* The user can sign up and login by completing the forms as shown

!["sign up"](https://github.com/liujohnson118/todone/blob/master/docs/signup.png)
!["login"](https://github.com/liujohnson118/todone/blob/master/docs/login.png)

* The homepage looks like the following figure when no tasks have been added
* The user can create a task by clicking "Add" and following prompts.
!["homepage"](https://github.com/liujohnson118/todone/blob/master/docs/home.png)

* Once tasks have been added, the user can see his/her tasks in the corresponding sections
!["tasks"](https://github.com/liujohnson118/todone/blob/master/docs/tasks.png)

* To change the category of a task that has been mis-classified; for example, task 24 eat kiwi fruit, which shouldn't be a watch task but an eat task, the user can click "Category" and following prompts.



