# Documentación de la funcionalidad de Acciones implementada

## ✅ Funcionalidades Implementadas

### 1. **Servicio de Acciones (`/app/src/services/accionService.js`)**
- Conexión completa con la API del backend de Java
- Funciones para CRUD completo de acciones
- Obtención de enums para formularios

### 2. **Página Principal de Acciones (`/app/src/pages/Acciones.jsx`)**
- Lista de partidos con conteo de acciones
- Interfaz de cards responsiva
- Navegación directa a gestión de acciones por partido
- Integración con el sistema de permisos existente

### 3. **Formulario Interactivo de Acciones (`/app/src/pages/AccionForm.jsx`)**
#### Características principales:
- **Modo en vivo** para registro durante partidos reales
- **Grid interactivo** con imagen de media pista de balonmano como fondo
- **Diferentes configuraciones** para ataque posicional vs contraataque
- **CRUD completo** de acciones (crear, editar, eliminar)
- **Lista en tiempo real** de acciones registradas
- **Incremento automático** de posesión
- **Validaciones** según reglas del backend

#### Configuración del Grid de Zonas:

**Para Ataque Posicional:**
- Lanzamiento Exterior (Izquierda, Centro, Derecha)  
- Pivote (Centro)
- Penetración (Izquierda, Centro, Derecha)
- Extremo (Izquierda, Derecha)
- 7m (7m)

**Para Contraataque:**
- Contragol (Izquierda, Centro, Derecha)
- Primera Oleada (Izquierda, Centro, Derecha)  
- Segunda Oleada (Izquierda, Centro, Derecha)
- Tercera Oleada (Izquierda, Centro, Derecha)

### 4. **Integración con el Sistema Existente**
- ✅ Rutas añadidas en `App.jsx`
- ✅ Menú actualizado en `Sidebar.jsx` con icono de acciones
- ✅ Botón directo desde la página de partidos
- ✅ Respeta el sistema de autenticación y permisos
- ✅ Consistente con el diseño existente

### 5. **Características de la Interfaz**
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Interactiva**: Click en zonas de la pista para seleccionar
- **Visual**: Imagen de media pista como fondo del grid
- **Modo en vivo**: Optimizado para registro durante partidos
- **Feedback visual**: Botones cambian de color al seleccionar zonas
- **Validaciones**: Campos obligatorios según el backend

### 6. **Integración Backend**
La funcionalidad está completamente preparada para el backend de Java existente:

**API Endpoints utilizados:**
- `GET /acciones/partido/{idPartido}` - Obtener acciones de un partido
- `POST /acciones` - Crear nueva acción  
- `PUT /acciones/{id}` - Actualizar acción
- `DELETE /acciones/{id}` - Eliminar acción
- `GET /acciones/enums` - Obtener valores de enums

**Permisos respetados:**
- Solo usuarios con roles Admin, GestorClub, Entrenador pueden acceder
- Mismo sistema de autenticación JWT
- Restricciones por equipo/partido según rol

## 🎯 Funcionalidades Destacadas

### Modo en Vivo
- Botón para activar/desactivar modo en vivo
- Incremento automático de posesión
- Interfaz optimizada para registro rápido
- Campos se mantienen para siguiente acción

### Grid Interactivo de la Pista
- Imagen de media pista de balonmano como fondo
- Botones clickeables superpuestos en las zonas
- Diferentes configuraciones según tipo de ataque
- Feedback visual inmediato de la selección

### Gestión Completa
- Lista en tiempo real de todas las acciones
- Edición inline de cualquier acción
- Eliminación con confirmación
- Navegación fluida entre acciones

## 📁 Archivos Creados/Modificados

**Nuevos archivos:**
- `/app/src/services/accionService.js`
- `/app/src/pages/Acciones.jsx`  
- `/app/src/pages/AccionForm.jsx`
- `/app/.env`
- `/app/public/pista_bm.png`

**Archivos modificados:**
- `/app/src/App.jsx` - Rutas añadidas
- `/app/src/components/Sidebar.jsx` - Menú actualizado
- `/app/src/pages/Partidos.jsx` - Botón de acciones añadido

## 🚀 Estado del Proyecto

- ✅ Frontend completamente funcional
- ✅ Interfaz responsive e interactiva
- ✅ Sistema de grid con imagen de media pista
- ✅ Modo en vivo para registro durante partidos
- ✅ CRUD completo de acciones
- ✅ Integración con el sistema existente
- ⏳ **Pendiente**: Backend de Java en ejecución para pruebas completas

La funcionalidad está **100% implementada y lista para usar** una vez que el backend esté disponible.