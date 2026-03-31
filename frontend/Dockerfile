# Use nginx:1.25-alpine for a lightweight, production-ready server
FROM nginx:1.25-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output from the local 'build' directory to the nginx serving path
COPY build/ /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# The default 'nginx -g daemon off;' CMD from the base image will handle requests
