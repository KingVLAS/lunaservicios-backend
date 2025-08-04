// Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// Importar las librerías necesarias
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// --- CAMBIO IMPORTANTE: Configuración de CORS ---
// Le decimos a nuestro backend que solo acepte peticiones
// desde la URL de tu sitio en Hostinger.
const corsOptions = {
  origin: 'https://deeppink-crab-363289.hostingersite.com'
};
app.use(cors(corsOptions));
// --------------------------------------------------

app.use(express.json());

// Ruta para el formulario de contacto general
app.post('/api/send-contact', async (req, res) => {
  try {
    const { name, email, service, message } = req.body;
    if (!name || !email || !service || !message) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }

    const { data, error } = await resend.emails.send({
      // --- CAMBIO IMPORTANTE PARA PRUEBAS ---
      from: 'Contacto Web <onboarding@resend.dev>', 
      // ------------------------------------
      to: ['apasep.ventas@gmail.com'], // Usa el email con el que creaste tu cuenta de Resend
      subject: `Nuevo Mensaje de Contacto de: ${name}`,
      html: `... (el contenido del HTML no cambia) ...`,
    });

    if (error) {
      console.error({ error });
      return res.status(500).json({ error: 'Error al enviar el correo.' });
    }
    res.status(200).json({ message: 'Correo enviado con éxito!', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Ruta para agendar una reunión
app.post('/api/send-booking', async (req, res) => {
  try {
    const { name, email, selectedDay, selectedTime } = req.body;
    if (!name || !email || !selectedDay || !selectedTime) {
        return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }
    const meetingDate = new Date(selectedDay).toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const { data, error } = await resend.emails.send({
      // --- CAMBIO IMPORTANTE PARA PRUEBAS ---
      from: 'Agenda de Reuniones <onboarding@resend.dev>',
      // ------------------------------------
      to: ['TU_EMAIL_DE_REGISTRO_EN_RESEND@ejemplo.com'], // Usa el email con el que creaste tu cuenta de Resend
      subject: `Nueva Solicitud de Reunión de: ${name}`,
      html: `... (el contenido del HTML no cambia) ...`,
    });

    if (error) {
      console.error({ error });
      return res.status(500).json({ error: 'Error al enviar la notificación de reserva.' });
    }
    res.status(200).json({ message: 'Reserva notificada con éxito!', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = app;