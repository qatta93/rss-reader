# React Native RSS Reader

A simple RSS reader app that allows users to subscribe to various feeds, browse articles, and save their preferences locally. This app does not display advertisements, providing a clean reading experience.

## Features:

### 1. **Add and Edit Feeds:**
   - Users can add custom RSS feeds and modify existing ones. The NASA Breaking News feed is included by default.
   
### 2. **Display a List of Articles Sorted by Publication Date:**
   - Articles from various feeds are displayed in a single view, sorted by the publication date.

### 3. **View a Single Article:**
   - Users can click on an article to view its full content, including the title, publication date, and description.

### 4. **Display Articles for a Specific Feed:**
   - Articles are filtered and displayed based on the selected RSS feed.

### 5. **Save Feed Settings Locally:**
   - The feed settings, such as URLs, are saved using `AsyncStorage`, allowing the app to remember added feeds even after it’s restarted.

### 6. **Search by Title:**
   - Users can search for articles by title.

### 7. **Mark Articles as Read/Unread and Filter:**
   - Users can mark articles as read or unread and filter the list based on their read status.

### 8. **Add Articles to Favorites:**
   - Articles can be saved to a favorites list for easy access later.

## Technologies:

- **React Native**: For building the mobile app.
- **AsyncStorage**: For local storage of data such as RSS feeds, read/unread status, and favorites.
- **Axios**: For fetching RSS feed data from external sources.
- **React Navigation**: For navigation between different screens.
- **React Native Paper**: For UI components and styling.
  
## Installation:

### Prerequisites:

- Node.js installed on your system.
- Expo CLI to run the React Native app.

### Steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/qatta93/rss-reader.git
   cd rss-reader

2. **Install dependencies:**
- If you're using Expo, install the dependencies with:
   ```bash
   npm install

3. **Run the app:**
- You can now run the app:
   ```bash
   npx expo start -c

4. **Access the app:**
- The app is now running and you can start browsing RSS feeds, adding favorites, and more!

## Viewing in Browser:
You can also view a demo of the app in your browser by visiting the following Vercel link:

https://rss-reader-zeta-fawn.vercel.app/

## Displaying on Mobile:
To view the app on your mobile device, use Expo Go:

1. Install Expo Go on your phone from the App Store or Google Play.

2. Open Expo Go on your device.

3. Scan the QR code displayed in your terminal after running `npm start` or `npx expo start -c`.

This will load the app directly on your mobile device for easy testing and viewing.

## How the App Works:
The app pulls RSS feeds from various sources, such as the default NASA Breaking News feed, and displays the articles. Each article can be marked as read or unread. Articles can also be added to a list of favorites for easy access.

All data, such as feed URLs and article statuses, are saved locally using `AsyncStorage`. This allows the app to persist your preferences even after it is closed and reopened.

