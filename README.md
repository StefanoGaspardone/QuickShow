# QuickShow

QuickShow is a web app for managing and watching movies and TV series, with features for upload, streaming, user management, and viewing progress.

## Contents

- [QuickShow](#quickshow)
  - [Contents](#contents)
  - [Main Features](#main-features)
  - [Setup](#setup)
    - [Clone the repository](#clone-the-repository)
    - [Install dependencies](#install-dependencies)
    - [Start the backend](#start-the-backend)
    - [Start the frontend](#start-the-frontend)
  - [Project Structure](#project-structure)
  - [Usage](#usage)
  - [Technologies Used](#technologies-used)
  - [License](#license)

## Main Features

- Search, add, and manage movies and TV series
- Video upload to Cloudinary
- Video streaming (Video.js)
- Show, booking, and user progress management
- Admin panel for adding/deleting content

## Setup

1. ### Clone the repository

   ```sh
   git clone https://github.com/StefanoGaspardone/QuickShow.git
   cd QuickShow
   ```

2. ### Install dependencies

   - Backend:

     ```sh
     cd server
     npm install
     ```

   - Frontend:

     ```sh
     cd client
     npm install
     ```

3. ### Start the backend

   ```sh
   cd server
   npm run dev
   ```

4. ### Start the frontend

   ```sh
   cd ../client
   npm run dev
   ```

## Project Structure

- `/server` — Express API, MongoDB, authentication, upload management
- `/client` — React, user and admin pages, video streaming

## Usage

- Log in as admin to add movies/TV series and upload videos
- Users can search, watch, and book shows, and save their viewing progress

## Technologies Used

- React, TailwindCSS, Axios
- Node.js, Express, Mongoose
- Cloudinary (video upload)
- Video.js (video player)

## Notes

- An **unsigned upload preset** is required for Cloudinary uploads.
- Videos are stored only on Cloudinary; the database stores the video URL.
- You can delete videos from Cloudinary via API from the backend (see Cloudinary documentation).

## License

This project is licensed under the [MIT License](./LICENSE).
