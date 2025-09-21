FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copier Prisma et générer client
COPY prisma ./prisma

RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 1339

CMD ["npm", "run", "start:prod"]
