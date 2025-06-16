# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# Sugerencia para Estructura de carpetas para el Frontend 🗂

## Utilizar Atomic Design ⚛️

- Separa los componente mas pequenos **(/shared)** como botones, barras de busqueda, circulo de status etc...

- componentes medianos **(/components)** que van hacer uso de esos componentes pequenos como el NavBar, Formularios , etc...

- para finalizar con las paginas **(/pages)** que utilizaran los componentes medianos, login page, chat page, group page, ect...

Esto nos ayudara a separar el trabajo en componentes y que cda uno pueda realizar sus tareas comodamente.

  /src
    /components
      NavBar.jsx
      LoginForm.jsx
      RegisterForm.jsx
      ChatList.jsx
      ChatListItem.jsx
      GroupList.jsx
    /shared
      SendButton.jsx
      Avatar.jsx
      SearchBar.jsx
      StatusDot.jsx
    /pages
      LoginPage.jsx
      ResgisterPage.jsx
      HomePage.jsx
      ChatPage.jsx
      GroupPage.jsx