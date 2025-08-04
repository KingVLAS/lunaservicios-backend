// Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// Importar las librerías necesarias
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

const corsOptions = {
  origin: 'https://deeppink-crab-363289.hostingersite.com'
};
app.use(cors(corsOptions));

app.use(express.json());

// Ruta para el formulario de contacto general
app.post('/api/send-contact', async (req, res) => {
  try {
    const { name, email, service, message } = req.body;
    if (!name || !email || !service || !message) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }

    const { data, error } = await resend.emails.send({
      from: 'Contacto Web <onboarding@resend.dev>',
      // --- CORRECCIÓN 1: Enviar correo a ti Y al cliente ---
      to: ['apasep.ventas@gmail.com', email], 
      subject: `Nuevo Mensaje de Contacto de: ${name}`,
      // --- CORRECCIÓN 2: Contenido HTML real ---
      html: `
        <h1>Nueva Consulta desde tu Sitio Web</h1>
        <p>Has recibido un nuevo mensaje a través del formulario de contacto.</p>
        <hr>
        <h3>Detalles del Contacto:</h3>
        <ul>
          <li><strong>Nombre:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Servicio de Interés:</strong> ${service}</li>
        </ul>
        <h3>Mensaje:</h3>
        <p>${message}</p>
        <hr>
        <p><small>Este es un correo automático enviado desde tu sitio web.</small></p>
      `,
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
      from: 'Agenda de Reuniones <onboarding@resend.dev>',
      // --- CORRECCIÓN 1: Enviar correo a ti Y al cliente ---
      to: ['apasep.ventas@gmail.com', email],
      subject: `Nueva Solicitud de Reunión de: ${name}`,
      // --- CORRECCIÓN 2: Contenido HTML real ---
      html: `
        <h1>Nueva Solicitud de Reunión</h1>
        <p>Has recibido una nueva solicitud de reunión desde tu sitio web.</p>
        <hr>
        <h3>Detalles de la Solicitud:</h3>
        <ul>
          <li><strong>Nombre:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Fecha Solicitada:</strong> ${meetingDate}</li>
          <li><strong>Hora Solicitada:</strong> ${selectedTime}</li>
        </ul>
        <hr>
        <p><small>Este es un correo automático enviado desde tu sitio web. Por favor, contacta al solicitante para confirmar la disponibilidad.</small></p>
      `,
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