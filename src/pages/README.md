# Pages

Vue components created in this folder will automatically be converted to navigatable routes.

Full documentation for this feature can be found in the Official [unplugin-vue-router](https://github.com/posva/unplugin-vue-router) repository.


Esto es un clásico de Git + FS no sensible a mayúsculas/minúsculas (Windows/macOS por defecto). Git no detecta un cambio solo de “case” a menos que lo fuerces. Aquí tienes la forma segura de arreglarlo para tu app Vue 3 + Vuetify 3 (y evitar que te falle luego en Docker/Linux):

1) Asegura que Git sí diferencia may/min
# Ver estado actual
git config --show-origin core.ignorecase

# Si está en true, ponlo en false (en el repo actual)
git config core.ignorecase false