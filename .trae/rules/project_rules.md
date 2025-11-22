Para crear los Embeds: Tienen que ser creados estéticamente como en las referencias del PDF llamado "Diseño_Personaje_y_Sistema_Busqueda", siempre tendrá que ir a la carpeta #Diseño dentro del Bot [C:\Users\neoma\Downloads\PassQuirk\PassQuirkRPG-Unified\documentation\Doc-Oficial\Imagenes - Diseño\Diseño dentro del Bot] mediante los nombres sabrás perfectamente como quiero el Embed de cada apartado. Color predeterminado AMARILLO en el Embed, rojo (peligro, batalla), verde (recompensas) y luego colores de enemigos mediante su sistema de rarezas como indica en: 

Se tienen que utilizar SIEMPRE EMBED en los mensajes del Bot, con los textos estéticos: 

# Titulo
*curva*
**Negrita**
```Programación```
**·**

[Como en las referencias]
[Fotos, Gifs para mas adelante pero que si por ejemplo te digo que vayas a poner un Embed de la conversación de ElSabio pues su sprite/video esta en [PassQuirkRPG-Unified\documentation\Doc-Oficial\Imagenes - Diseño\Npc - Imagenes]] 


Los Emojis Animados se tienen que agregar SIEMPRE en los Embed como decoración, NUNCA se podrá usar emojis normales hasta que el desarrollador lo ponga en la carpeta. Todos los emojis animados están en:  C:\Users\neoma\Downloads\PassQuirk\PassQuirkRPG-Unified\assets\animated-emojis.md:

EJEMPLO PARA IMPLEMETAR EMOJIS ANIMADOS [NO TE FIJES EN EL MENSAJE SINO DE COMO SE PONEN Y COMO DEBERIAS DE PONERLOS]

const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

const embed = new EmbedBuilder()
  .setColor('#fcd34d')
  .setTitle('! https://cdn3.emoji.gg/emojis/7384-greenfire.gif ¡Bienvenido a PassQuirkRPG! ! https://cdn3.emoji.gg/emojis/7384-greenfire.gif')
  .setDescription(`

! https://cdn3.emoji.gg/emojis/58229-sparklestars.gif [¿Qué es PassQuirk?](https://emoji.gg/emoji/58229-sparklestars)

! https://cdn3.emoji.gg/emojis/9478-spacepurple.gif **PassQuirk** es un mundo interdimensional donde cada persona posee un don único llamado **Quirk**.

! https://cdn3.emoji.gg/emojis/6996-purpleportal.gif Estos poderes, misteriosos y variados, se despiertan al cruzar el portal entre mundos, conectando la Tierra con un universo de reinos mágicos y criaturas legendarias.

! https://cdn3.emoji.gg/emojis/47215-katanafire.gif Solo los más valientes cruzan ese portal. **Tú eres uno de ellos.**

! https://cdn3.emoji.gg/emojis/47232-crown-green.gif **¡Crea tu personaje y empieza tu aventura YA!** ! https://cdn3.emoji.gg/emojis/47232-crown-green.gif

[¿Estás listo para descubrir tu destino?](https://emoji.gg/emoji/47232-crown-green)
`)
  .setImage('')
  .setFooter({ text: 'PassQuirk RPG • hoy a las 22:30' });

const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId('iniciar_aventura')
    .setLabel('Iniciar Aventura')
    .setStyle(ButtonStyle.Primary)
);

await interaction.reply({ embeds: [embed], components: [row] });



Mira siempre el contexto para cuando vayas a crear código con los datos reales de PassQuirk (nunca inventes datos) y tengas las instrucciones de como quiero crear el tutorial, que comandos... todos los contextos estan en la carpeta: PassQuirkRPG-Unified\documentation\Doc-Oficial\Importante - Contexto

# 📌 Instrucciones Fundamentales para el desarrollo del proyecto

⚠️ ESTRICTAMENTE PROHIBIDO:
- NO inventes datos, nombres, ni comandos.
- NO crees archivos `.md` innecesarios o por tu cuenta.
- NO empieces a codificar hasta tener el esquema y estrategia completa definida.

✅ OBLIGATORIO:
1. SIEMPRE leer y revisar **toda la documentación oficial** en la carpeta
2. TODO lo que hagas debe estar basado en la documentación y en las instrucciones del usuario. Nunca uses datos aleatorios.
3. Antes de cualquier línea de código, debes:
   - Crear un **esquema visual o de texto tipo diagrama** que explique la estructura completa del proyecto.
   - Mostrar todas las posibilidades viables de implementación.
   - Explicar brevemente la lógica antes de actuar.

4. Al desarrollar código:
   - Usa siempre datos y estructuras ya existentes en el proyecto.
   - NUNCA uses ejemplos inventados. Usa solo los que estén definidos por el usuario.

5. Generar y actualizar un archivo `changelog.md` con cada acción importante:
   - Debe incluir la versión, la fecha, los cambios realizados, carpetas o rutas afectadas, y por qué se hicieron.
   - Este archivo debe mantenerse al día en cada nuevo mensaje.

6. Al final de cada respuesta:
   - Añade un pequeño resumen tipo changelog explicando lo que hiciste.
   - Menciona brevemente si afectaste carpetas, lógica, archivos o funciones.

🔁 Modo de trabajo:
- Primero planificación → luego diagrama → luego revisión del esquema con el usuario → después implementación de código.


Aqui estan las bases de datos para crear el Bot de Discord: https://discord.js.org/docs/packages/discord.js/14.21.0/BaseClient:Class

https://github.com/discordjs/discord.js