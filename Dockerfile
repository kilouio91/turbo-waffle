# Use the official Node.js image as the base image
FROM node:21

# Install necessary dependencies for Puppeteer and Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg2 \
    libnss3 \
    libxss1 \
    libgconf-2-4 \
    libx11-xcb1 \
    libxcomposite1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libnspr4 \
    libxrandr2 \
    libxshmfence1 \
    libgtk-3-0 \
    fonts-liberation \
    libappindicator3-1 \
    libx11-dev \
    libxrender-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose any necessary ports (optional)
# EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]  # Replace 'server.js' with the name of your script
