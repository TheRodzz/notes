# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install --audit=false

# Copy the rest of the application code to the container
COPY . .

# Build the application
# RUN npm run build 

# Set the environment variable to serve the production build
ENV NODE_ENV=deploy

ENV ACCESS_TOKEN_SECRET=35563d2c9007fcddfa3203c859727e6718ee03176b28132c197262f179485c58

# Expose port 5000 for the application to run
EXPOSE 8000

# Start the application
CMD ["npm", "start"]
