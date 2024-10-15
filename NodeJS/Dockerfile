# Utiliser l'image officielle de Node.js comme base
FROM node:20.17.0

# Installer les outils MongoDB à partir des dépôts MongoDB officiels
RUN apt-get update && \
    apt-get install -y gnupg curl lsb-release && \
    curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg && \
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt-get update && \
    apt-get install -y mongodb-org-shell && \
    rm -rf /var/lib/apt/lists/*


# Créer un répertoire de travail à l'intérieur du conteneur
WORKDIR /usr/src/app

# Copier les fichiers de package et installer les dépendances
COPY package*.json ./
RUN npm install

# Installe les dépendances, y compris New Relic
RUN npm install newrelic && npm install

# Définit la variable d'environnement pour New Relic
ENV NEW_RELIC_APP_NAME="api-chatcosey-relic"
ENV NEW_RELIC_LICENSE_KEY="eu01xx7b90e69dc1eb0db04fcae72586FFFFNRAL"
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout
ENV NEW_RELIC_NO_CONFIG_FILE=true

# Copier le reste du code source de l'application
COPY . .

# Exposer le port sur lequel l'application tourne
EXPOSE 8000

# Commande pour démarrer l'application
CMD ["npm", "start"]
