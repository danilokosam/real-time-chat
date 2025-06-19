<div align="center" class="text-center">
<h1>REAL-TIME-CHAT</h1>
<p><em>Instant Connection, Limitless Conversations, Seamless Experience</em></p>

<img alt="last-commit" src="https://img.shields.io/github/last-commit/danilokosam/real-time-chat?style=flat&amp;logo=git&amp;logoColor=white&amp;color=0080ff" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="repo-top-language" src="https://img.shields.io/github/languages/top/danilokosam/real-time-chat?style=flat&amp;color=0080ff" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="repo-language-count" src="https://img.shields.io/github/languages/count/danilokosam/real-time-chat?style=flat&amp;color=0080ff" class="inline-block mx-1" style="margin: 0px 2px;">
<p><em>Built with the tools and technologies:</em></p>
<img alt="Express" src="https://img.shields.io/badge/Express-000000.svg?style=flat&amp;logo=Express&amp;logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="JSON" src="https://img.shields.io/badge/JSON-000000.svg?style=flat&amp;logo=JSON&amp;logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="Markdown" src="https://img.shields.io/badge/Markdown-000000.svg?style=flat&amp;logo=Markdown&amp;logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="Socket.io" src="https://img.shields.io/badge/Socket.io-010101.svg?style=flat&amp;logo=socketdotio&amp;logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="npm" src="https://img.shields.io/badge/npm-CB3837.svg?style=flat&amp;logo=npm&amp;logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="Mongoose" src="https://img.shields.io/badge/Mongoose-F04D35.svg?style=flat&amp;logo=Mongoose&amp;logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt=".ENV" src="https://img.shields.io/badge/.ENV-ECD53F.svg?style=flat&amp;logo=dotenv&amp;logoColor=black" class="inline-block mx-1" style="margin: 0px 2px;">
<br>
<img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&amp;logo=JavaScript&amp;logoColor=black" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248.svg?style=flat&amp;logo=MongoDB&amp;logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="React" src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&amp;logo=React&amp;logoColor=black" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="Tailwind" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="Lodash" src="https://img.shields.io/badge/Lodash-3492FF.svg?style=flat&amp;logo=Lodash&amp;logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF.svg?style=flat&amp;logo=Vite&amp;logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
<img alt="ESLint" src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=flat&amp;logo=ESLint&amp;logoColor=white" class="inline-block mx-1" style="margin: 0px 2px;">
</div>



## Introduction
Real-Time Chat is a scalable instant messaging application built with modern web technologies, enabling seamless communication for both individuals and groups. Once the web version is complete, the project will be extended to mobile using Kotlin.

## What are we looking for with this project?
We seek to leverage in-demand technologies by building a real-time chat platform where users can instantly send and receive messages, view other users' online statuses, and enjoy an intuitive and responsive interface.

## Features
- User registration and authentication
- Real-time message sending and receiving
- Indicator of users online and typing
- Last seen time indicator
- Unread message management
- Modern and responsive interface

## Main Technologies
This project was developed using a robust set of modern, in-demand technologies, chosen for their efficiency, scalability, and real-time capabilities:
- **React**: For building a dynamic and efficient user interface.
- **Tailwind CSS**: For utility-first, customizable, and responsive UI styling.
- **Vite**: For rapid and optimized frontend development.
- **Node.js**: Enables a scalable and efficient backend for handling real-time connections.
- **Express**: A minimalist framework for creating the backend
- **Socket.io**: Facilitates real-time communication between client and server.
- **MongoDB**: A NoSQL database for flexible storage of users and messages.

### Others :
- **ESLint**: Linting tool that helps maintain code quality, identify problematic patterns, and ensure consistent coding.
- **Mongoose**: A MongoDB object model for Node.js, providing a schema-based solution for modeling application data, making interaction with MongoDB simpler and more structured.
- **JWT (JSON Web Tokens)**: A standard for creating access tokens that enable secure user authentication within your application.
- **cookie-parser**: Parses cookies attached to client requests, used for authentication and session handling.
- **apiRoutes**: Main entry point for all backend API endpoints, organizes and handles HTTP routes.
- **Lodash**: Utility library for advanced data manipulation and functional programming helpers.
- **uuid**: Generates unique identifiers (UUIDs) for users and messages.
- **dotenv**: Loads environment variables from a .env file into process.env for configuration management.
- **npm**: Node.js package manager, used to install and manage project dependencies on both the frontend and backend.
- **JSON**: Native JavaScript object for data serialization, API responses, and configuration.
- **Markdown**: Used for project documentation and formatting in files like README.md
- **Git**: Distributed version control system for tracking changes in source code and enabling collaborative development.
- **GitHub**: Cloud-based platform for hosting Git repositories,  facilitating code sharing, collaboration, and project management.

## Project Structure Overview

### Root
- `README.md`: General project documentation.

### client/
- `package.json`, `vite.config.js`, `eslint.config.js`: Frontend configuration and dependencies.
- `index.html`: Main HTML
- `public/`: Static and public assets.
- `src/`: Frontend source code.
  - `App.jsx`, `main.jsx`, `App.css`, `index.css`: Core components and styles.
  - `assets/`: Graphic resources
  - `components/`: Reusable UI components
  - `layout/`: General layout components.
  - `pages/`: Main application pages.
  - `router/`: Navigation and routing setup.

### server/
- `package.json`: Backend dependencies and scripts.
- `app.js`, `index.js`: Server setup and entry point.
- `config/`: Database configuration.
- `middlewares/`: Custom middlewares (authentication, error handling).
- `models/`: Data models (User, Message).
- `routes/`: API route definitions.
- `services/`: Handles user authentication logic, including login and registration.
- `socket/`: Real-time communication and Socket.io events.
- `utils/`: General utilities and helpers.

---
## Design 🎨
[![Ver diseño en Figma](./client/src/assets/MockupPC.jpeg)](https://www.figma.com/design/M2flKxmRg3zTJIRLqWyEDh/Mockup-chat?node-id=1-3&t=yZY4UqPl7fWgVG8O-1)
---
[![Ver diseño en Figma](./client/src/assets/MockupMovil1.png)](https://www.figma.com/design/M2flKxmRg3zTJIRLqWyEDh/Mockup-chat?node-id=1-3&t=yZY4UqPl7fWgVG8O-1)
[![Ver diseño en Figma](./client/src/assets/MockupMovil2.png)](https://www.figma.com/design/M2flKxmRg3zTJIRLqWyEDh/Mockup-chat?node-id=1-3&t=yZY4UqPl7fWgVG8O-1)
[![Ver diseño en Figma](./client/src/assets/MockupMovil3.png)](https://www.figma.com/design/M2flKxmRg3zTJIRLqWyEDh/Mockup-chat?node-id=1-3&t=yZY4UqPl7fWgVG8O-1)

## Changelog

- 18/06/2025: Last Seen Time
