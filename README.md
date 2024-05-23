# Impatient: A file sharing solution for the impatient ones

Impatient allows users to easily upload and share files over the local network. The service provides a unique feature where users can obtain a shareable link for the file even before the upload completes. This means the user can start sharing the link immediately, and the recipient can use it to download the file as soon as the upload finishes.

This saves time for the uploader by generating the link on the spot.

## Installation

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

### Steps

1. Clone the repository:

   ```sh
   git clone https://github.com/manavgondalia/File-Sharing.git
   cd File-Sharing
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

## Usage

### Development

1. Get your IP address by running the `ipconfig` or `ifconfig` command based on Windows or Unix based OS respectively.

2. Open the `.env` file and update the `SERVER_IP` value to the IP obtained in the previous step.

3. To start the server in development mode with hot reloading:

```sh
npm run start
```

4. To access the service, navigate to the link displayed in the console (format: `http://<your-IP>:<port-number>`).
