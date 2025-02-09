# Praktiki

## 🚀 Installation


```bash
cd geNext
```

#### Install dependencies

```bash
npm install
```

#### Create .env

```bash
touch .env
```

## ⚙️ Environment (.env)

```bash
BACKEND_URL=http://localhost:3050
SERVER_URL=http://localhost:9990
BACKEND_CLOSE_AUTH_PATH=/api/v1/logout

PORTAL_SUFIX=genei.es # this must be the same that it is in the backend server (although its only for development, so the cookies auth work)

COOKIES_PATH=/cookies

APP_NAME=geNext

USER_NAME=nombre_de_usuario
USER_PASSWORD=password_de_usuario
```

## 🖥️ Run application

#### Dev env

```bash
npm run dev
```

#### Production env

```bash
npm start
```

#### Run tests

```bash
npm run test
```
