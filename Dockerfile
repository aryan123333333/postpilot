FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* prisma/ ./
RUN npm ci

FROM deps AS builder
WORKDIR /app
COPY . .
RUN npx prisma generate
RUN next build
# Manually copy what the postbuild script does
RUN cp -r node_modules/.prisma .next/standalone/node_modules/.prisma
RUN cp -r node_modules/@prisma .next/standalone/node_modules/@prisma
RUN cp -r prisma .next/standalone/prisma
RUN cp -r public .next/standalone/public
RUN cp -r .next/static .next/standalone/.next/static

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=10000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 10000
CMD ["node", "server.js"]
