# ./frontend/Dockerfile

FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
