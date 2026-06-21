FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=10000

COPY package.json package-lock.json* ./
RUN npm ci --no-optional --ignore-scripts && npm rebuild sharp

COPY prisma/ ./prisma/
COPY . .
RUN npx prisma generate
RUN NEXT_PRIVATE_STANDALONE=true next build

# Copy outputs
RUN cp -r node_modules/.prisma .next/standalone/node_modules/.prisma 2>/dev/null; true
RUN cp -r node_modules/@prisma .next/standalone/node_modules/@prisma 2>/dev/null; true
RUN cp -r prisma .next/standalone/prisma 2>/dev/null; true
RUN cp -r public .next/standalone/public 2>/dev/null; true
RUN cp -r .next/static .next/standalone/.next/static 2>/dev/null; true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

EXPOSE 10000
CMD ["sh", "-c", "if [ -d .next/standalone ]; then cd .next/standalone && exec node server.js; else exec node .next/standalone/server.js; fi"]
