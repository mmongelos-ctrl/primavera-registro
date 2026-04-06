# 🌿 Primavera – Registro de Campo

App de registro ganadero para Estancia Primavera (7 Palmas).  
Desarrollado por **De Raíz** como herramienta de acompañamiento al manejo de pastoreo.

---

## ¿Qué hace?

- **Registrar rotaciones** de lotes en potreros (entrada/salida con fecha)
- **Gestionar lotes** dinámicamente (conformar, transferir, dar alta/baja de cabezas)
- **Registrar biomasa** con Kg MS/Ha, fecha, nota y foto
- **Ver el estado actual** de cada potrero y lote en cualquier momento
- **Datos en Google Sheets** — todos ven lo mismo, los datos quedan accesibles

---

## Arquitectura

```
Celular/PC (app web)
      ↕ API
Google Sheets (base de datos)
      ↕
Descargar CSV → Análisis con IA
```

La app se deploya en **Vercel** (gratis) y lee/escribe en un **Google Sheet** compartido.  
No hay servidor propio ni base de datos — solo el Sheet.

---

## Requisitos previos

- Cuenta de Google (la que ya usan)
- Cuenta de GitHub (gratis — crear en github.com)
- Cuenta de Vercel (gratis — crear en vercel.com, conectar con GitHub)

---

## Paso a paso para montar

### 1. Crear el Google Sheet

1. Ir a [sheets.google.com](https://sheets.google.com) y crear una nueva hoja.
2. Renombrarla a **"Primavera – Registro de Campo"**.
3. Crear las siguientes pestañas (hojas) con estos encabezados en la fila 1:

**Hoja: `Potreros`**
```
id | nombre | ha | zona
```

**Hoja: `Lotes`**
```
id | nombre | color | categorias_json
```

**Hoja: `Rotaciones`**
```
id | fecha | tipo | pid | loteId | nota | timestamp
```

**Hoja: `Movimientos`**
```
id | fecha | tipo | loteOrigenId | loteDestinoId | categoria | cantidad | motivo | nota | timestamp
```

**Hoja: `Biomasa`**
```
id | fecha | pid | kgMsHa | nota | fotoUrl | timestamp
```

4. Copiar el ID del Sheet de la URL:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
   ```

### 2. Crear proyecto en Google Cloud (API access)

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear un proyecto nuevo: **"primavera-registro"**
3. Ir a **APIs & Services > Library**
4. Buscar y habilitar **"Google Sheets API"**
5. Ir a **APIs & Services > Credentials**
6. Click **"Create Credentials" > "Service Account"**
   - Nombre: `primavera-app`
   - Rol: no hace falta asignar
7. Entrar a la Service Account creada > pestaña **"Keys"**
8. Click **"Add Key" > "Create new key" > JSON**
9. Se descarga un archivo `.json`. De ahí necesitás:
   - `client_email` (algo como `primavera-app@primavera-registro.iam.gserviceaccount.com`)
   - `private_key` (empieza con `-----BEGIN PRIVATE KEY-----`)

### 3. Compartir el Sheet con la Service Account

1. Abrir el Google Sheet creado en paso 1
2. Click **"Compartir"**
3. Agregar el `client_email` del paso anterior como **Editor**

### 4. Configurar variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto (este archivo NO se sube a GitHub):

```env
GOOGLE_SHEETS_ID=el_id_de_tu_sheet
GOOGLE_SERVICE_ACCOUNT_EMAIL=primavera-app@primavera-registro.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu_key_aqui\n-----END PRIVATE KEY-----\n"
```

### 5. Subir a GitHub

```bash
git init
git add .
git commit -m "Primavera v1"
git remote add origin https://github.com/TU_USUARIO/primavera-registro.git
git push -u origin main
```

### 6. Deploy en Vercel

1. Ir a [vercel.com](https://vercel.com)
2. Click **"New Project"** > importar el repo de GitHub
3. En **"Environment Variables"** agregar las 3 variables del `.env.local`
4. Click **Deploy**
5. En 1-2 minutos tenés la URL: `https://primavera-registro.vercel.app`

### 7. (Opcional) Dominio personalizado

En Vercel > Settings > Domains podés agregar un subdominio como:
```
primavera.deraiz.com.py
```

---

## Estructura del proyecto

```
primavera-app/
├── public/
│   ├── icon-192.png        # Icono PWA
│   ├── icon-512.png        # Icono PWA grande
│   └── manifest.json       # Config PWA (instalar en celular)
├── src/
│   ├── app/
│   │   ├── layout.js       # Layout principal
│   │   ├── page.js         # Página principal
│   │   ├── globals.css     # Estilos globales
│   │   └── api/
│   │       └── sheets/
│   │           └── route.js # API que habla con Google Sheets
│   ├── components/
│   │   ├── App.jsx         # Componente principal
│   │   ├── Header.jsx      # Cabecera con logo
│   │   ├── Nav.jsx         # Navegación
│   │   ├── Resumen.jsx     # Dashboard resumen
│   │   ├── Lotes.jsx       # Gestión de lotes
│   │   ├── Potreros.jsx    # Potreros + biomasa
│   │   ├── Movimientos.jsx # Rotaciones + movimientos
│   │   └── ui.jsx          # Componentes UI reutilizables
│   └── lib/
│       ├── sheets.js       # Cliente Google Sheets
│       ├── data.js         # Datos iniciales (potreros, lotes)
│       └── utils.js        # Helpers
├── .env.local              # Variables secretas (NO subir a git)
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── README.md               # Este archivo
```

---

## Cargar datos iniciales

La primera vez que abrís la app, los potreros y lotes del Plan Abierto Sep 2025 se cargan automáticamente al Sheet si las hojas están vacías.

---

## Para migrar a otra estancia

1. Crear un nuevo Google Sheet con la misma estructura
2. Cambiar `GOOGLE_SHEETS_ID` en las variables de entorno
3. Editar `src/lib/data.js` con los potreros y lotes de la nueva estancia
4. Redesplegar

---

## Fotos de biomasa

Las fotos se comprimen a 600px en el celular antes de subir.  
Se guardan como URL en base64 directamente en el Sheet (celda de texto).  
Para un volumen alto de fotos (>500), conviene migrar a un bucket de imágenes (Cloudinary gratis o similar).

---

## Licencia

Propiedad de De Raíz. Uso exclusivo para clientes de consultoría.
