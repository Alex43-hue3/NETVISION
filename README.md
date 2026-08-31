# NETVISION V5

Nueva revisión del proyecto.

## Cambios principales

- TV: categorías únicamente dentro de la lista lateral, sin barra duplicada arriba.
- TV: todas las categorías siguen visibles dentro del panel lateral, también en móvil cuando se abre la lista.
- Perfiles: el fondo seleccionado se aplica al fondo de toda la aplicación y se conserva al volver a entrar.
- Perfiles: edición de nombre/avatar/fondo y botón `+ Agregar otro perfil` desde ajustes.
- Películas y series: catálogo conectado a los endpoints documentados de PelisPlusHD y LaMovie.
- Detalles de películas y series: extracción de candidatos de reproducción desde respuestas JSON anidadas.
- Episodios: usa preferentemente el endpoint documentado `/serie/{slug}/{temporada}/{episodio}` cuando el slug está disponible.
- Reproductor: acepta video directo compatible y embeds/iframes devueltos por la API.
- No se implementa ningún bypass de DRM ni evasión de restricciones del proveedor.

## APIs

PelisPlusHD:
- /peliculas
- /peliculas?page=N
- /pelicula/{slug}
- /series
- /series?page=N
- /serie/{slug}
- /serie/{slug}/{temporada}/{episodio}
- /streamurl?url={embed_url}

LaMovie:
- /peliculas
- /peliculas?page=N
- /pelicula/{slug_o_id}
- /series
- /series?page=N
- /serie/{slug_o_id}
- /serie/{slug_o_id}/{temporada}/{episodio}
- /streamurl?url={embed_url}

Si un proveedor no permite CORS, requiere DRM o no devuelve una fuente compatible con el navegador, el reproductor no puede forzar esa reproducción desde una página estática.
