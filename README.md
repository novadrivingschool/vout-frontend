# RUN
npm run dev

# Git
git fetch origin
git merge origin/main

docker build -t v-outsourcing-frontend .
docker run -d --name v-outsourcing-frontend -p 7070:80 v-outsourcing-frontend
# Abre: http://localhost:7070


git reset --hard HEAD
